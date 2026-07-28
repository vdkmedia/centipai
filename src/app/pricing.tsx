import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { GradientButton } from '@/components/ui/gradient-button';
import { Screen } from '@/components/ui/screen';
import { Brand, Colors, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/lib/onboarding';
import { startCheckout } from '@/lib/payments';
import { PLANS, formatPrice, type BillingPeriod, type Plan } from '@/lib/plans';

export default function PricingScreen() {
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const { state } = useOnboarding();
  const { width } = useWindowDimensions();
  const isWide = width > 900;

  // Agency-onboarding? Dan het Agency-plan bovenaan/uitgelicht.
  const plans =
    state.accountType === 'agency'
      ? [...PLANS].sort((a, b) => (a.id === 'agency' ? -1 : b.id === 'agency' ? 1 : 0))
      : PLANS;

  return (
    <Screen maxWidth={1080}>
      <Text style={styles.heading}>Kies je abonnement</Text>
      <Text style={styles.subheading}>
        Elke maand verse AI-credits. Credits verdien je ook door content in te plannen. Opzeggen kan
        maandelijks.
      </Text>

      <View style={styles.toggle}>
        <PeriodTab label="Maandelijks" active={period === 'monthly'} onPress={() => setPeriod('monthly')} />
        <PeriodTab label="Jaarlijks · −17%" active={period === 'yearly'} onPress={() => setPeriod('yearly')} />
      </View>

      <View style={[styles.planList, isWide && styles.planListWide]}>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} period={period} wide={isWide} />
        ))}
      </View>

      <Text style={styles.storeNote}>
        {Platform.OS === 'web'
          ? 'Je betaalt veilig via Stripe. Abonnementen zijn maandelijks opzegbaar.'
          : 'Betalen gaat via de App Store / Google Play. Beheer je abonnement in je store-instellingen.'}
      </Text>
    </Screen>
  );
}

function PeriodTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.periodTab, active && styles.periodTabActive]}>
      <Text style={[styles.periodTabText, active && styles.periodTabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PlanCard({ plan, period, wide }: { plan: Plan; period: BillingPeriod; wide: boolean }) {
  const price = period === 'monthly' ? plan.priceMonthly : plan.priceYearly;

  const isAgency = plan.id === 'agency';
  const features = isAgency
    ? [
        `Toegang tot ${plan.companies} klantaccounts`,
        'AI-credits gaan van het klantaccount waarin je werkt',
        'Goedkeuringsflow: de klant keurt zelf goed',
        'Onbeperkt chatten met Centi*',
        `${plan.credits} eigen credits en ${plan.photoEnhancements}× fotoverbetering p/mnd voor je eigen kanalen`,
        `${plan.channels} social kanalen per klant`,
      ]
    : [
        `${plan.credits} AI-credits per maand`,
        `${plan.chatMessages} chatberichten met Centi p/mnd`,
        `${plan.photoEnhancements}× AI-fotoverbetering p/mnd`,
        `${plan.channels} social kanalen`,
        'Zelf plannen en publiceren, geen agency nodig',
        ...(plan.approvalFlow ? ['Nodig een agency uit die in jouw account werkt'] : []),
      ];

  const card = (
    <View style={[styles.card, wide && styles.cardWide, plan.highlight && styles.cardInHighlight]}>
      {plan.highlight ? (
        <LinearGradient
          colors={Brand.gradient}
          start={Brand.gradientStart}
          end={Brand.gradientEnd}
          style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Meest gekozen</Text>
        </LinearGradient>
      ) : null}
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planTagline}>{plan.tagline}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatPrice(price)}</Text>
        <Text style={styles.priceSuffix}>/mnd{period === 'yearly' ? ' (jaarlijks)' : ''}</Text>
      </View>
      <View style={styles.features}>
        {features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      <GradientButton
        title={`Kies ${plan.name}`}
        variant={plan.highlight ? 'primary' : 'outline'}
        onPress={async () => {
          await startCheckout(plan, period);
          // Zolang de backend nog niet is aangesloten: door naar de chat-demo.
          router.push('/chat');
        }}
      />
    </View>
  );

  if (!plan.highlight) return card;

  // Uitgelicht plan krijgt een gradient-rand
  return (
    <LinearGradient
      colors={Brand.gradient}
      start={Brand.gradientStart}
      end={Brand.gradientEnd}
      style={[styles.highlightBorder, wide && styles.cardWide]}>
      {card}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSoft,
    borderRadius: Radius.pill,
    padding: 4,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  periodTab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
  },
  periodTabActive: { backgroundColor: Colors.card },
  periodTabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  periodTabTextActive: { color: Colors.text },
  planList: { gap: Spacing.md },
  planListWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardWide: { flex: 1 },
  highlightBorder: {
    borderRadius: Radius.lg + 2,
    padding: 2,
    alignItems: 'stretch',
  },
  cardInHighlight: {
    width: '100%',
    flex: 1,
    borderWidth: 0,
    borderRadius: Radius.lg,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  popularBadgeText: { color: Colors.textInverse, fontSize: 12, fontWeight: '700' },
  planName: { fontSize: 22, fontWeight: '800', color: Colors.text },
  planTagline: { fontSize: 14, color: Colors.textSecondary, lineHeight: 19 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginVertical: Spacing.sm },
  price: { fontSize: 32, fontWeight: '800', color: Colors.text },
  priceSuffix: { fontSize: 14, color: Colors.textSecondary },
  features: { gap: 8, marginBottom: Spacing.md },
  featureRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  check: { color: Brand.pink, fontWeight: '800', fontSize: 15 },
  featureText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 19 },
  storeNote: {
    marginTop: Spacing.lg,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
