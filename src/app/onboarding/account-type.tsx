import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Centi } from '@/components/ui/centi';
import { GradientButton } from '@/components/ui/gradient-button';
import { OptionCard } from '@/components/ui/option-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { Colors, Spacing } from '@/constants/theme';
import { useOnboarding, type AccountType } from '@/lib/onboarding';

export default function AccountTypeScreen() {
  const { state, setAccountType } = useOnboarding();
  const [selected, setSelected] = useState<AccountType | null>(state.accountType);

  return (
    <Screen
      footer={
        <GradientButton
          title="Doorgaan"
          disabled={!selected}
          onPress={() => {
            if (!selected) return;
            setAccountType(selected);
            router.push('/onboarding/brand/website');
          }}
        />
      }>
      <ProgressBar progress={1 / 7} />
      <View style={styles.header}>
        <Centi message="Hoi! Ik ben Centi 👋 Voor wie gaan we content maken?" />
      </View>

      <Text style={styles.heading}>Kies je accounttype</Text>

      <View style={styles.options}>
        <OptionCard
          emoji="🏪"
          title="Bedrijf"
          subtitle="Ik beheer de social media van mijn eigen bedrijf."
          selected={selected === 'company'}
          onPress={() => setSelected('company')}
        />
        <OptionCard
          emoji="🏢"
          title="Agency"
          subtitle="Ik beheer social media voor meerdere klanten en laat hen posts goedkeuren."
          selected={selected === 'agency'}
          onPress={() => setSelected('agency')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  options: { gap: Spacing.md },
});
