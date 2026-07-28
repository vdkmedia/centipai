import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Centi } from '@/components/ui/centi';
import { GradientButton } from '@/components/ui/gradient-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { LANGUAGE_LABELS, TONE_LABELS, useOnboarding } from '@/lib/onboarding';

const INDUSTRY_LABELS: Record<string, string> = {
  horeca: 'Horeca',
  retail: 'Winkel & retail',
  beauty: 'Beauty & wellness',
  bouw: 'Bouw & techniek',
  zakelijk: 'Zakelijke dienstverlening',
  juridisch: 'Juridisch & financieel',
  anders: 'Anders',
};

export default function SummaryScreen() {
  const { state } = useOnboarding();
  const { brand } = state;

  const rows: { label: string; value: string }[] = [
    { label: 'Bedrijf', value: brand.companyName || 'Nog niet ingevuld' },
    { label: 'Website', value: brand.website || 'Niet opgegeven' },
    { label: 'Branche', value: brand.industry ? INDUSTRY_LABELS[brand.industry] : 'Nog niet ingevuld' },
    { label: 'Toon', value: brand.tone ? TONE_LABELS[brand.tone] : 'Nog niet ingevuld' },
    { label: 'Aanspreekvorm', value: brand.formOfAddress === 'u' ? 'U' : 'Je & jij' },
    { label: 'Taal', value: brand.language ? LANGUAGE_LABELS[brand.language] : 'Nog niet ingevuld' },
    { label: 'Emoji', value: brand.useEmoji ? 'Ja' : 'Nee' },
    { label: 'Eigen AI-regels', value: `${brand.customRules.length}` },
  ];

  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <GradientButton title="Kies je abonnement" onPress={() => router.push('/pricing')} />
          <GradientButton
            title="Centi trainen (optioneel)"
            variant="outline"
            onPress={() => router.push('/ai-rules')}
          />
          <GradientButton
            title="Profiel aanpassen"
            variant="outline"
            onPress={() => router.push('/onboarding/brand/website')}
          />
        </View>
      }>
      <ProgressBar progress={1} />
      <View style={styles.header}>
        <Centi
          message={`Top, ${brand.companyName || 'je profiel'} staat! Zo ga ik je captions schrijven. Klopt er iets niet? Dan pas je het zo aan.`}
        />
      </View>

      <Text style={styles.heading}>Jouw brandprofiel</Text>

      <View style={styles.card}>
        {rows.map((row, idx) => (
          <View key={row.label} style={[styles.row, idx > 0 && styles.rowBorder]}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>
        Centi gebruikt dit profiel bij elke caption. Je kunt het later altijd bijstellen in je instellingen.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  heading: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: Spacing.lg },
  card: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: Spacing.md,
  },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  rowLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  rowValue: { fontSize: 15, color: Colors.text, fontWeight: '600', flexShrink: 1 },
  hint: { marginTop: Spacing.md, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  footer: { gap: Spacing.sm },
});
