import { generateDemoCaptions, type PostTypeId } from '@/lib/chat';
import type { BrandProfile } from '@/lib/onboarding';

/**
 * Caption-generatie. Zodra het Supabase-project is aangemaakt en de env-vars
 * hieronder zijn gezet, loopt dit via de edge function (echte Claude-call,
 * credits van het juiste bedrijf). Zonder configuratie valt de app terug op
 * de lokale demo-generator zodat de flow altijd werkt.
 *
 * Vereist voor de echte backend:
 *   EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
 */
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const backendConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

interface GenerateArgs {
  brand: BrandProfile;
  request: string;
  postType: PostTypeId;
  companyId?: string;
  accessToken?: string;
  images?: { mediaType: string; data: string }[];
}

export async function generateCaptions({
  brand,
  request,
  postType,
  companyId,
  accessToken,
  images,
}: GenerateArgs): Promise<string[]> {
  if (backendConfigured && companyId && accessToken) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-captions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ companyId, request, postType, images, variantCount: 3 }),
    });
    if (res.ok) {
      const { captions } = (await res.json()) as { captions: string[] };
      if (captions?.length) return captions;
    }
    // Bij een backend-fout niet stuklopen maar terugvallen op de demo
  }
  return generateDemoCaptions(brand, request, postType);
}
