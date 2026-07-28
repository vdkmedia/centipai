export type PlanId = 'starter' | 'business' | 'agency';
export type BillingPeriod = 'monthly' | 'yearly';

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Prijzen in eurocenten, excl. store-commissie. */
  priceMonthly: number;
  priceYearly: number; // per maand, bij jaarbetaling
  credits: number;
  chatMessages: number | 'unlimited';
  /** AI-fotoverbeteringen per maand — bewust strak gelimiteerd (duurder dan captions). */
  photoEnhancements: number;
  channels: number;
  companies: number;
  approvalFlow: boolean;
  highlight?: boolean;
  /** Stripe Price-IDs (web/desktop). Gevuld zodra het Stripe-account is ingericht. */
  stripePriceIds: { monthly: string | null; yearly: string | null };
  /** IAP product-IDs (App Store / Google Play via RevenueCat). */
  iapProductIds: { monthly: string; yearly: string };
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Voor het bedrijf dat zelf begint met slim posten.',
    priceMonthly: 1499,
    priceYearly: 1249,
    credits: 100,
    chatMessages: 200,
    photoEnhancements: 10,
    channels: 3,
    companies: 1,
    approvalFlow: false,
    stripePriceIds: { monthly: null, yearly: null },
    iapProductIds: { monthly: 'centipai.starter.monthly', yearly: 'centipai.starter.yearly' },
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'Alle kanalen, goedkeuringsflow en meer credits.',
    priceMonthly: 2999,
    priceYearly: 2499,
    credits: 300,
    chatMessages: 750,
    photoEnhancements: 30,
    channels: 6,
    companies: 1,
    approvalFlow: true,
    highlight: true,
    stripePriceIds: { monthly: null, yearly: null },
    iapProductIds: { monthly: 'centipai.business.monthly', yearly: 'centipai.business.yearly' },
  },
  {
    // Agency's kopen toegang, geen grote creditbundel: zodra een agency in het
    // account van een klant werkt, gaan de AI-credits van dat klantaccount af.
    // De eigen credits/verbeteringen zijn voor de eigen kanalen van de agency.
    id: 'agency',
    name: 'Agency',
    tagline: 'Werk in de accounts van je klanten. Zij keuren goed, hun credits tellen.',
    priceMonthly: 7999,
    priceYearly: 6699,
    credits: 250,
    chatMessages: 'unlimited',
    photoEnhancements: 25,
    channels: 6,
    companies: 10,
    approvalFlow: true,
    stripePriceIds: { monthly: null, yearly: null },
    iapProductIds: { monthly: 'centipai.agency.monthly', yearly: 'centipai.agency.yearly' },
  },
];

export function formatPrice(cents: number): string {
  const euros = cents / 100;
  return `€${euros.toFixed(2).replace('.', ',')}`;
}
