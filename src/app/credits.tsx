import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { Centi } from '@/components/ui/centi';
import { GradientButton } from '@/components/ui/gradient-button';
import { Screen } from '@/components/ui/screen';
import { Brand, Colors, Radius, Spacing } from '@/constants/theme';
import { getCreditBalance } from '@/lib/credits';

/**
 * Losse credits bijkopen, los van het abonnement. Prijzen zijn indicatief
 * en worden later definitief vastgesteld. Betaling: Stripe op web,
 * in-app aankoop (RevenueCat) op iOS/Android.
 */
interface CreditPack {
  id: string;
  credits: number;
  price: string;
  perCredit: string;
  popular?: boolean;
}

const PACKS: CreditPack[] = [
  { id: 'pack_50', credits: 50, price: '€4,99', perCredit: '€0,10 p/credit' },
  { id: 'pack_150', credits: 150, price: '€11,99', perCredit: '€0,08 p/credit', popular: true },
  { id: 'pack_500', credits: 500, price: '€29,99', perCredit: '€0,06 p/credit' },
];

export default function CreditsScreen() {
  const [balance, setBalance] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getCreditBalance().then(setBalance);
    }, []),
  );

  const buy = (packId: string, credits: number) => {
    const msg = `De betaling voor ${credits} credits (${packId}) wordt aangesloten zodra Stripe en de in-app aankopen zijn ingericht.`;
    if (Platform.OS === 'web') window.alert(`Bijna klaar!\n\n${msg}`);
  };

  return (
    <Screen
      footer={
        <GradientButton title="Liever een groter abonnement bekijken?" variant="outline" onPress={() => router.push('/pricing')} />
      }>
      <View style={styles.header}>
        <Centi message="Credits op, maar je abonnement past verder prima? Koop dan gewoon een los pakketje bij. Die credits blijven geldig zolang je account bestaat." />
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>JE HUIDIGE SALDO</Text>
        <Text style={styles.balanceValue}>⚡ {balance ?? '…'} credits</Text>
      </View>

      <Text style={styles.heading}>Losse credits bijkopen</Text>
      <Text style={styles.subheading}>1 credit = 1 caption-generate. Prijzen zijn indicatief.</Text>

      <View style={styles.packList}>
        {PACKS.map((pack) => (
          <View key={pack.id} style={[styles.pack, pack.popular && styles.packPopular]}>
            {pack.popular ? (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Voordeligst gekozen</Text>
              </View>
            ) : null}
            <View style={styles.packRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.packCredits}>⚡ {pack.credits} credits</Text>
                <Text style={styles.packPer}>{pack.perCredit}</Text>
              </View>
              <Text style={styles.packPrice}>{pack.price}</Text>
            </View>
            <GradientButton
              title={`Koop ${pack.credits} credits`}
              variant={pack.popular ? 'primary' : 'outline'}
              onPress={() => buy(pack.id, pack.credits)}
            />
          </View>
        ))}
      </View>

      <Text style={styles.hint}>
        Dit staat los van je abonnement: je maandelijkse bundel blijft gewoon doorlopen. Wil je
        structureel meer credits, dan is upgraden vaak voordeliger.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.lg },
  balanceCard: {
    backgroundColor: '#FEF5F9',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.lg,
  },
  balanceLabel: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1 },
  balanceValue: { fontSize: 26, fontWeight: '800', color: Brand.pink },
  heading: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subheading: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.md },
  packList: { gap: Spacing.md },
  pack: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.card,
  },
  packPopular: { borderColor: Brand.pink, backgroundColor: '#FFFBFD' },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Brand.pink,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  popularBadgeText: { color: '#fff', fontSize: 11.5, fontWeight: '800' },
  packRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  packCredits: { fontSize: 18, fontWeight: '800', color: Colors.text },
  packPer: { fontSize: 12.5, color: Colors.textSecondary },
  packPrice: { fontSize: 22, fontWeight: '800', color: Colors.text },
  hint: { marginTop: Spacing.lg, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
});
