import { buildRulesPrompt } from '@/lib/caption-rules';
import type { BrandProfile } from '@/lib/onboarding';

export interface ChatPhoto {
  uri: string;
  /** Base64-inhoud + mimetype, zodat Centi de foto echt kan analyseren. */
  base64?: string;
  mediaType?: string;
}

export type ChatMessage =
  | { id: string; from: 'user'; text?: string; photos?: ChatPhoto[] }
  | { id: string; from: 'centi'; kind: 'text'; text: string }
  | { id: string; from: 'centi'; kind: 'format' }
  | { id: string; from: 'centi'; kind: 'captions'; captions: string[] }
  | { id: string; from: 'centi'; kind: 'schedule'; caption: string }
  | {
      id: string;
      from: 'centi';
      kind: 'planned';
      caption: string;
      when: string;
      channels: string[];
      postType: PostTypeId;
      syncNote?: string | null;
    };

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
export function generateDemoCaptions(
  brand: BrandProfile,
  request: string,
  postType: PostTypeId = 'post',
): string[] {
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

  // Story's zijn kort en direct; reels openen met een hook.
  if (postType === 'story') {
    return [
      `${capitalize(subject)}!${emoji('🔥')} Swipe up, vandaag bij ${name}.`,
      `Nu te scoren: ${subject}.${emoji('😍')}`,
      `${u ? 'Heeft u' : 'Heb je'} dit al gezien?${emoji('👀')} ${capitalize(subject)}!`,
    ];
  }
  if (postType === 'reel') {
    return [
      `POV: ${u ? 'u ontdekt' : 'je ontdekt'} ${subject} bij ${name}.${emoji('🤤')}`,
      `Wacht tot het einde…${emoji('👀')} ${capitalize(subject)} zoals ${u ? 'u die' : 'je die'} nog niet zag!`,
      `3 redenen waarom ${subject} viraal gaat.${emoji('🎬')} Nummer 2 verrast ${u ? 'u' : 'je'}!`,
    ];
  }

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

export type PostTypeId = 'post' | 'story' | 'reel';

export const POST_TYPES: { id: PostTypeId; label: string; emoji: string }[] = [
  { id: 'post', label: 'Post', emoji: '🖼️' },
  { id: 'story', label: 'Story', emoji: '⏱️' },
  { id: 'reel', label: 'Reel', emoji: '🎬' },
];

export const POST_TYPE_LABELS: Record<PostTypeId, string> = {
  post: 'Post',
  story: 'Story',
  reel: 'Reel',
};

/**
 * Welk formaat kan waar? Stories bestaan op Instagram en Facebook; reels
 * (korte video) op Instagram, Facebook en TikTok; een gewone post kan overal.
 */
export const CHANNELS_PER_TYPE: Record<PostTypeId, string[]> = {
  post: ['instagram', 'facebook', 'threads', 'tiktok', 'linkedin', 'google_business'],
  story: ['instagram', 'facebook'],
  reel: ['instagram', 'facebook', 'tiktok'],
};

export const CHANNELS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'threads', label: 'Threads' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'google_business', label: 'Google Mijn Bedrijf' },
] as const;

/**
 * Datumhulpen voor het plannen. Centi plant tot een jaar vooruit; binnen
 * het 30-dagenvenster van Meta wordt direct met Meta gesynct, daarbuiten
 * bewaart onze eigen scheduler de post en synct hij automatisch zodra de
 * datum binnen 30 dagen valt.
 */
export const MAX_DAYS_AHEAD = 365;
export const META_SYNC_WINDOW_DAYS = 30;

const WEEKDAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];

function nextWeekday(weekday: number, hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  let add = (weekday - d.getDay() + 7) % 7;
  if (add === 0 && d.getTime() <= Date.now()) add = 7;
  d.setDate(d.getDate() + add);
  return d;
}

export function slotToDate(slotId: string): Date {
  if (slotId === 'best') return nextWeekday(5, 17, 0);
  if (slotId === 'sat') return nextWeekday(6, 11, 0);
  return nextWeekday(0, 19, 30);
}

/** Parseert "dd-mm-jjjj uu:mm" naar een datum; null bij ongeldig/te ver. */
export function parseDutchDateTime(input: string): Date | { error: string } {
  const m = input.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})[ ,]+(\d{1,2}):(\d{2})$/);
  if (!m) return { error: 'Gebruik het formaat dag-maand-jaar uur:minuut, bijv. 05-08-2026 17:00' };
  const [, dd, mm, yyyy, hh, min] = m.map(Number);
  const d = new Date(yyyy, mm - 1, dd, hh, min, 0, 0);
  if (d.getDate() !== dd || d.getMonth() !== mm - 1) return { error: 'Die datum bestaat niet' };
  if (d.getTime() <= Date.now()) return { error: 'Kies een moment in de toekomst' };
  const maxMs = Date.now() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000;
  if (d.getTime() > maxMs) return { error: 'Je kunt maximaal een jaar vooruit plannen' };
  return d;
}

export function formatPlanDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${WEEKDAYS[d.getDay()]} ${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} om ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Hoe gaat deze planning naar Meta? (Meta accepteert max 30 dagen vooruit) */
export function metaSyncNote(d: Date, channelIds: string[]): string | null {
  const metaChannels = channelIds.filter((c) => c === 'instagram' || c === 'facebook' || c === 'threads');
  if (metaChannels.length === 0) return null;
  const days = Math.ceil((d.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return days <= META_SYNC_WINDOW_DAYS
    ? 'Wordt direct met Meta gesynct.'
    : `Staat veilig in de Centi-planner en wordt automatisch met Meta gesynct zodra het binnen ${META_SYNC_WINDOW_DAYS} dagen valt (Meta zelf kan niet verder vooruit plannen).`;
}
