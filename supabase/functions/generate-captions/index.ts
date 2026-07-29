// Supabase Edge Function: caption-generatie via Claude.
//
// Strategie (zie PLAN.md §3):
//  * Haiku 4.5 is het standaardmodel: ruim goed genoeg voor captions en
//    spotgoedkoop (± €0,005 per generate incl. foto).
//  * Het brandprofiel + de AI-regels gaan mee in de system prompt en worden
//    gecachet (prompt caching) zodat vervolggenerates nog goedkoper zijn.
//  * Gebruikersregels krijgen expliciet voorrang op de standaardregels.
//  * Elke generate boekt 1 credit af op het BEDRIJF (ook als een agency-lid
//    de actie doet in het account van een klant).
//
// Vereiste secrets: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const DEFAULT_RULES = [
  'Gebruik geen "-" (streepje of gedachtestreep) in captions. Herformuleer de zin of gebruik een komma of punt.',
  'Schrijf volgens het brandprofiel: toon, aanspreekvorm (je/u), taal en emoji-voorkeur.',
  'Verzin geen feiten, prijzen, openingstijden of acties die niet door de gebruiker zijn aangeleverd.',
];

interface RequestBody {
  companyId: string;
  request: string;
  postType: 'post' | 'story' | 'reel';
  /** Base64-foto's (max 4) die de gebruiker zelf heeft geüpload. */
  images?: { mediaType: string; data: string }[];
  variantCount?: number;
}

Deno.serve(async (req) => {
  try {
    // 1. Wie vraagt dit aan?
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData.user) {
      return json({ error: 'Niet ingelogd' }, 401);
    }
    const userId = userData.user.id;

    const body = (await req.json()) as RequestBody;
    const variantCount = Math.min(Math.max(body.variantCount ?? 3, 1), 5);

    // 2. Toegang tot dit bedrijf? (eigenaar of actieve agency-koppeling)
    const { data: hasAccess } = await supabase.rpc('has_company_access_for', {
      target_company: body.companyId,
      target_user: userId,
    });
    if (!hasAccess) return json({ error: 'Geen toegang tot dit bedrijf' }, 403);

    // 3. Credits van het BEDRIJF checken (agency verbruikt tegoed van de klant)
    const { data: balance } = await supabase
      .from('credit_balances')
      .select('balance')
      .eq('company_id', body.companyId)
      .maybeSingle();
    if ((balance?.balance ?? 0) < 1) {
      return json({ error: 'Geen AI-credits meer voor dit account' }, 402);
    }

    // 4. Brandprofiel + AI-regels ophalen
    const [{ data: company }, { data: brand }, { data: rules }] = await Promise.all([
      supabase.from('companies').select('name').eq('id', body.companyId).single(),
      supabase.from('brand_profiles').select('*').eq('company_id', body.companyId).maybeSingle(),
      supabase.from('ai_rules').select('rule').eq('company_id', body.companyId),
    ]);

    const systemPrompt = buildSystemPrompt(
      company?.name ?? 'het bedrijf',
      brand,
      (rules ?? []).map((r: { rule: string }) => r.rule),
    );

    // 5. Claude aanroepen. Haiku 4.5 is de standaard; het brandprofiel wordt
    //    gecachet zodat herhaalde generates vrijwel alleen de foto kosten.
    const content: Anthropic.ContentBlockParam[] = [
      ...(body.images ?? []).slice(0, 4).map(
        (img): Anthropic.ImageBlockParam => ({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: img.data,
          },
        }),
      ),
      {
        type: 'text',
        text:
          `Verzoek van de gebruiker: ${body.request}\n` +
          `Formaat: ${body.postType}\n` +
          `Schrijf ${variantCount} caption-varianten.`,
      },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content }],
      output_config: {
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              observation: {
                type: 'string',
                description:
                  'Wat je concreet op de foto(s) ziet, in 1 tot 2 zinnen, in de taal van het brandprofiel. Leeg laten als er geen foto is.',
              },
              captions: { type: 'array', items: { type: 'string' } },
            },
            required: ['observation', 'captions'],
            additionalProperties: false,
          },
        },
      },
    });

    if (response.stop_reason === 'refusal') {
      return json({ error: 'Centi kan hier geen caption voor maken' }, 422);
    }
    const text = response.content.find((b) => b.type === 'text');
    const parsed = text ? JSON.parse(text.text) : { captions: [], observation: '' };
    const captions: string[] = parsed.captions ?? [];
    const observation: string = (parsed.observation ?? '').trim();

    // 6. Credit afboeken op het bedrijf, met de handelende gebruiker erbij
    await supabase.from('credit_ledger').insert({
      company_id: body.companyId,
      acted_by: userId,
      kind: 'caption_generate',
      amount: -1,
    });

    return json({ captions: captions.slice(0, variantCount), observation: observation || null });
  } catch (err) {
    console.error(err);
    return json({ error: 'Er ging iets mis bij het genereren' }, 500);
  }
});

function buildSystemPrompt(
  companyName: string,
  brand: {
    website?: string | null;
    industry?: string | null;
    tone?: number | null;
    form_of_address?: string | null;
    language?: string | null;
    use_emoji?: boolean | null;
  } | null,
  customRules: string[],
): string {
  const toneLabels: Record<number, string> = {
    1: 'heel persoonlijk en warm',
    2: 'persoonlijk',
    3: 'neutraal',
    4: 'zakelijk',
    5: 'strikt zakelijk en formeel',
  };
  const languageNames: Record<string, string> = {
    nl: 'Nederlands',
    en: 'Engels',
    de: 'Duits',
    fr: 'Frans',
  };

  const lines = [
    `Je bent Centi, de social media copywriter van ${companyName}.`,
    'Je schrijft captions voor social media posts op basis van de foto en het verzoek van de gebruiker.',
    'Analyseer bijgevoegde foto\u2019s ALTIJD zorgvuldig: benoem in het veld "observation" concreet wat je ziet (gerecht, product, sfeer, mensen, kleuren). Baseer elke caption op wat er echt op de foto staat, nooit op aannames.',
    '',
    'Brandprofiel:',
    `- Branche: ${brand?.industry ?? 'onbekend'}`,
    `- Toon: ${toneLabels[brand?.tone ?? 3]}`,
    `- Aanspreekvorm: ${brand?.form_of_address === 'u' ? 'u (formeel)' : 'je en jij (informeel)'}`,
    `- Taal: ${languageNames[brand?.language ?? 'nl']}`,
    `- Emoji: ${brand?.use_emoji === false ? 'niet gebruiken' : 'passend gebruiken'}`,
    ...(brand?.website ? [`- Website: ${brand.website}`] : []),
    '',
    'Formaatrichtlijnen:',
    '- post: 1 tot 3 zinnen, eventueel passende hashtags.',
    '- story: heel kort en direct, maximaal 1 zin, activerend.',
    '- reel: open met een hook die kijkers vasthoudt, daarna kort en energiek.',
    '',
    'Standaardregels:',
    ...DEFAULT_RULES.map((r) => `- ${r}`),
  ];

  if (customRules.length > 0) {
    lines.push(
      '',
      'Regels van de gebruiker (deze gaan vóór de standaardregels als ze botsen):',
      ...customRules.map((r) => `- ${r}`),
    );
  }

  return lines.join('\n');
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
