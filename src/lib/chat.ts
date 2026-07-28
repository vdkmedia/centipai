import { buildRulesPrompt } from '@/lib/caption-rules';
import type { BrandProfile } from '@/lib/onboarding';

export interface ChatPhoto {
  uri: string;
}

export type ChatMessage =
  | { id: string; from: 'user'; text?: string; photos?: ChatPhoto[] }
  | { id: string; from: 'centi'; kind: 'text'; text: string }
  | { id: string; from: 'centi'; kind: 'captions'; captions: string[] }
  | { id: string; from: 'centi'; kind: 'schedule'; caption: string }
  | { id: string; from: 'centi'; kind: 'planned'; caption: string; when: string; channels: string[] };

let idCounter = 0;
export function nextId(): string {
  idCounter += 1;
  return `msg-${idCounter}`;
}

/**
 * DEMO-generator: bootst de Claude-aanroep lokaal na zodat de chatflow
 * werkend te zien is zonder backend. De echte implementatie stuurt straks
 * foto + brandprofiel + buildRulesPrompt(customRules) naar onze backend,
 * die met Haiku 4.5 (en Sonnet waar nodig) captions genereert.
 */
export function generateDemoCaptions(brand: BrandProfile, request: string): string[] {
  // De prompt die straks naar de backend gaat; nu alleen ter illustratie.
  void buildRulesPrompt(brand.customRules);

  const u = brand.formOfAddress === 'u';
  const name = brand.companyName || 'ons bedrijf';
  const wantsEmoji = brand.useEmoji;
  const emoji = (e: string) => (wantsEmoji ? ` ${e}` : '');

  const subject = extractSubject(request) ?? 'deze topper';

  const personal = [
    `Vers uit de keuken:${emoji('😍')} ${subject}! ${u ? 'Komt u vanavond proeven?' : 'Kom je vanavond proeven?'}${emoji('🔥')}`,
    `Hier doen we het voor.${emoji('🤤')} ${capitalize(subject)}, precies zoals ${u ? 'u die kent' : 'je die kent'} van ${name}.`,
    `Weekend in aantocht en dat vieren we met ${subject}.${emoji('🎉')} Tot snel bij ${name}!`,
  ];
  const business = [
    `Vanaf vandaag bij ${name}: ${subject}. ${u ? 'U bent van harte welkom.' : 'Je bent van harte welkom.'}`,
    `${capitalize(subject)}, met zorg bereid door het team van ${name}.${emoji('✨')}`,
    `Nieuw op de kaart: ${subject}. Reserveren kan via de link in onze bio.`,
  ];

  const tone = brand.tone ?? 3;
  const base = tone <= 2 ? personal : tone >= 4 ? business : [personal[0], business[1], business[2]];
  return base.map((c) => c.replace(/\s+/g, ' ').trim());
}

function extractSubject(request: string): string | null {
  const cleaned = request
    .toLowerCase()
    .replace(/maak (een )?caption(s)? (voor|met|bij)?/g, '')
    .replace(/deze foto('s)?( van)?/g, '')
    .replace(/[.!?]/g, '')
    .trim();
  return cleaned.length > 2 ? cleaned : null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Suggesties op basis van de (toekomstige) beste-tijden-analyse. */
export const SCHEDULE_SLOTS = [
  { id: 'best', label: 'Vrijdag 17:00 · beste moment 🔥' },
  { id: 'sat', label: 'Zaterdag 11:00' },
  { id: 'sun', label: 'Zondag 19:30' },
] as const;

export const CHANNELS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
] as const;
