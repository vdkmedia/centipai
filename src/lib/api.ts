import { generateDemoCaptions, type PostTypeId } from '@/lib/chat';
import type { BrandProfile } from '@/lib/onboarding';

/**
 * Caption-generatie. Met backend (Supabase edge function + Claude) analyseert
 * Centi de foto's echt: hij vertelt eerst wat hij ziet (observation) en
 * schrijft daar captions bij. Zonder backend valt de app terug op de
 * demo-generator en is er geen echte foto-analyse.
 */
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const backendConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export interface CaptionResult {
  captions: string[];
  /** Wat Centi op de foto('s) ziet; alleen gevuld bij echte AI-analyse. */
  observation: string | null;
  /** true als dit uit de demo-generator komt (geen echte foto-analyse). */
  demo: boolean;
}

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
}: GenerateArgs): Promise<CaptionResult> {
  if (backendConfigured && companyId && accessToken) {
    try {
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
        const data = (await res.json()) as { captions: string[]; observation?: string };
        if (data.captions?.length) {
          return { captions: data.captions, observation: data.observation ?? null, demo: false };
        }
      }
    } catch {
      // netwerkfout → nette terugval op demo
    }
  }
  return { captions: generateDemoCaptions(brand, request, postType), observation: null, demo: true };
}
