import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Centi } from '@/components/ui/centi';
import { GradientButton } from '@/components/ui/gradient-button';
import { Screen } from '@/components/ui/screen';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/lib/onboarding';
import { supabase, supabaseConfigured } from '@/lib/supabase';

/**
 * Inloggen en registreren via Supabase Auth (e-mail + wachtwoord).
 * Bij registratie wordt direct het bedrijf + brandprofiel + de AI-regels
 * uit de onboarding aangemaakt; de databasetrigger geeft 25 proef-credits.
 */
export default function AuthScreen() {
  const { state } = useOnboarding();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        const userId = data.user?.id;
        if (userId) {
          // Profiel + bedrijf + brandprofiel + AI-regels uit de onboarding
          await supabase.from('profiles').upsert({ id: userId });
          const { data: company } = await supabase
            .from('companies')
            .insert({ name: state.brand.companyName || 'Mijn bedrijf', owner_id: userId })
            .select('id')
            .single();
          if (company) {
            await supabase.from('brand_profiles').upsert({
              company_id: company.id,
              website: state.brand.website || null,
              industry: state.brand.industry,
              tone: state.brand.tone,
              form_of_address: state.brand.formOfAddress,
              language: state.brand.language ?? 'nl',
              use_emoji: state.brand.useEmoji,
            });
            if (state.brand.customRules.length > 0) {
              await supabase.from('ai_rules').insert(
                state.brand.customRules.map((rule) => ({
                  company_id: company.id,
                  rule,
                  created_by: userId,
                })),
              );
            }
            if (state.accountType === 'agency') {
              await supabase
                .from('agencies')
                .insert({ name: state.brand.companyName || 'Mijn agency', owner_id: userId });
            }
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      router.replace('/chat');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Er ging iets mis';
      setError(
        message.includes('Invalid login credentials')
          ? 'Onjuiste combinatie van e-mail en wachtwoord.'
          : message.includes('already registered')
            ? 'Dit e-mailadres heeft al een account. Log in.'
            : message,
      );
    } finally {
      setBusy(false);
    }
  };

  if (!supabaseConfigured) {
    return (
      <Screen>
        <View style={styles.header}>
          <Centi message="Accounts staan bijna aan! Zet de Supabase-gegevens in .env (zie SETUP.md) en ik regel de rest." />
        </View>
        <GradientButton title="Verder in demo-modus" onPress={() => router.replace('/chat')} />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <GradientButton
          title={busy ? 'Even geduld…' : mode === 'signup' ? 'Account aanmaken' : 'Inloggen'}
          disabled={busy || !email.includes('@') || password.length < 8}
          onPress={submit}
        />
      }>
      <View style={styles.header}>
        <Centi
          message={
            mode === 'signup'
              ? `Bijna klaar! Met een account bewaar ik het profiel van ${state.brand.companyName || 'je bedrijf'} en krijg je 25 gratis credits om te proberen.`
              : 'Welkom terug! Log in en we gaan verder waar je gebleven was.'
          }
        />
      </View>

      <Text style={styles.heading}>{mode === 'signup' ? 'Account aanmaken' : 'Inloggen'}</Text>

      <Text style={styles.label}>E-mailadres</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="jij@bedrijf.nl"
        placeholderTextColor={Colors.textSecondary}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        inputMode="email"
      />

      <Text style={styles.label}>Wachtwoord (minimaal 8 tekens)</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        placeholderTextColor={Colors.textSecondary}
        secureTextEntry
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')} style={styles.switchBtn}>
        <Text style={styles.switchText}>
          {mode === 'signup' ? 'Al een account? Log in' : 'Nog geen account? Maak er een aan'}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.xl },
  heading: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
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
  error: { marginTop: Spacing.md, color: Colors.danger, fontSize: 14, lineHeight: 19 },
  switchBtn: { marginTop: Spacing.lg, alignItems: 'center' },
  switchText: { fontSize: 14, fontWeight: '700', color: '#EE2A7B' },
});
