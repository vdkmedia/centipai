import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Centi } from '@/components/ui/centi';
import { GradientButton } from '@/components/ui/gradient-button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/lib/onboarding';

export default function WebsiteScreen() {
  const { state, updateBrand } = useOnboarding();
  const { companyName, website } = state.brand;
  const forClient = state.accountType === 'agency';

  return (
    <Screen
      footer={
        <GradientButton
          title="Doorgaan"
          disabled={companyName.trim().length < 2}
          onPress={() => router.push('/onboarding/brand/1')}
        />
      }>
      <ProgressBar progress={2 / 7} />
      <View style={styles.header}>
        <Centi
          message={
            forClient
              ? 'Voor welke klant maken we het eerste brandprofiel? Met de website leer ik de stijl al kennen.'
              : 'Vertel me over je bedrijf. Met je website leer ik je stijl alvast kennen. De rest vraag ik in 4 korte vragen.'
          }
        />
      </View>

      <Text style={styles.label}>Bedrijfsnaam</Text>
      <TextInput
        style={styles.input}
        value={companyName}
        onChangeText={(v) => updateBrand({ companyName: v })}
        placeholder="Bijv. Restaurant De Smickel"
        placeholderTextColor={Colors.textSecondary}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Websitelink (optioneel, maar aangeraden)</Text>
      <TextInput
        style={styles.input}
        value={website}
        onChangeText={(v) => updateBrand({ website: v })}
        placeholder="https://www.jouwbedrijf.nl"
        placeholderTextColor={Colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        inputMode="url"
      />
      <Text style={styles.hint}>
        Centi analyseert je website om je tone of voice, producten en doelgroep te leren kennen.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.card,
  },
  hint: {
    marginTop: Spacing.sm,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
