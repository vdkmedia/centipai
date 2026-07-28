import { Alert, Platform } from 'react-native';

import type { BillingPeriod, Plan } from '@/lib/plans';

/**
 * Betaalstrategie:
 * - Web/desktop → Stripe Checkout (geen store-commissie).
 * - iOS/Android → In-App Purchase via RevenueCat (verplicht door Apple/Google
 *   voor digitale tegoeden; Stripe mag daar niet gebruikt worden).
 */
export async function startCheckout(plan: Plan, period: BillingPeriod): Promise<void> {
  if (Platform.OS === 'web') {
    const priceId = plan.stripePriceIds[period];
    if (!priceId) {
      // Backend + Stripe-account volgen in de volgende fase; tot die tijd een nette melding.
      showNotice(
        'Bijna klaar!',
        `Stripe Checkout voor ${plan.name} wordt aangesloten zodra het Stripe-account is ingericht.`,
      );
      return;
    }
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, planId: plan.id, period }),
    });
    const { url } = await res.json();
    window.location.href = url;
    return;
  }

  // Native: RevenueCat-integratie volgt (react-native-purchases).
  showNotice(
    'Bijna klaar!',
    `In-app aankopen voor ${plan.name} (${plan.iapProductIds[period]}) worden aangesloten via RevenueCat.`,
  );
}

function showNotice(title: string, message: string) {
  if (Platform.OS === 'web') {
    // Alert.alert rendert niet op web
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}
