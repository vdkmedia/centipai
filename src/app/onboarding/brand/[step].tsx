import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Centi } from '@/components/ui/centi';
import { GradientButton } from '@/components/ui/gradient-button';
import { OptionCard } from '@/components/ui/option-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Screen } from '@/components/ui/screen';
import { Brand, Colors, Spacing } from '@/constants/theme';
import { LANGUAGE_LABELS, useOnboarding, type BrandProfile } from '@/lib/onboarding';

const INDUSTRIES = [
  { value: 'horeca', emoji: '🍽️', label: 'Horeca', subtitle: 'Restaurant, café, catering' },
  { value: 'retail', emoji: '🛍️', label: 'Winkel & retail', subtitle: 'Fysieke winkel of webshop' },
  { value: 'beauty', emoji: '💅', label: 'Beauty & wellness', subtitle: 'Kapper, salon, spa, sport' },
  { value: 'bouw', emoji: '🔧', label: 'Bouw & techniek', subtitle: 'Aannemer, installateur, hovenier' },
  { value: 'zakelijk', emoji: '💼', label: 'Zakelijke dienstverlening', subtitle: 'Consultancy, marketing, IT' },
  { value: 'juridisch', emoji: '⚖️', label: 'Juridisch & financieel', subtitle: 'Advocatuur, notaris, accountancy' },
  { value: 'anders', emoji: '✨', label: 'Anders', subtitle: 'Iets anders dan hierboven' },
] as const;

const TONES = [
  { value: 1, label: 'Heel persoonlijk', subtitle: '„Wat een topavond met jullie! 😍 Tot snel!"' },
  { value: 2, label: 'Persoonlijk', subtitle: '„We hebben er weer zin in, kom je langs?"' },
  { value: 3, label: 'Neutraal', subtitle: '„Vanaf vrijdag verkrijgbaar: onze nieuwe kaart."' },
  { value: 4, label: 'Zakelijk', subtitle: '„Graag informeren we je over onze nieuwe diensten."' },
  { value: 5, label: 'Strikt zakelijk', subtitle: '„Ons kantoor adviseert u graag over de mogelijkheden."' },
] as const;

const QUESTION_META: Record<number, { centi: string; heading: string }> = {
  1: { centi: 'Wat voor soort bedrijf is het? Een advocatenkantoor klinkt nou eenmaal anders dan een restaurant. 😉', heading: 'Vraag 1 · Type bedrijf' },
  2: { centi: 'Hoe wil je klinken in je captions? Kies de toon die het beste past.', heading: 'Vraag 2 · Tone of voice' },
  3: { centi: 'Spreek je je volgers aan met "je" of met "u"?', heading: 'Vraag 3 · Je of u' },
  4: { centi: 'Laatste vraag! In welke taal schrijf ik je captions, en mag ik emoji gebruiken?', heading: 'Vraag 4 · Taal & emoji' },
};

export default function BrandQuestion() {
  const params = useLocalSearchParams<{ step: string }>();
  const step = Math.min(4, Math.max(1, Number(params.step) || 1));
  const { state, updateBrand } = useOnboarding();
  const { brand } = state;

  const meta = QUESTION_META[step];
  const canContinue =
    (step === 1 && brand.industry !== null) ||
    (step === 2 && brand.tone !== null) ||
    (step === 3 && brand.formOfAddress !== null) ||
    (step === 4 && brand.language !== null);

  const next = () => {
    if (step < 4) router.push(`/onboarding/brand/${step + 1}`);
    else router.push('/onboarding/summary');
  };

  return (
    <Screen
      footer={<GradientButton title={step < 4 ? 'Doorgaan' : 'Profiel afronden'} disabled={!canContinue} onPress={next} />}>
      <ProgressBar progress={(2 + step) / 7} />
      <View style={styles.header}>
        <Centi message={meta.centi} />
      </View>
      <Text style={styles.heading}>{meta.heading}</Text>

      {step === 1 && (
        <View style={styles.options}>
          {INDUSTRIES.map((i) => (
            <OptionCard
              key={i.value}
              compact
              emoji={i.emoji}
              title={i.label}
              subtitle={i.subtitle}
              selected={brand.industry === i.value}
              onPress={() => updateBrand({ industry: i.value })}
            />
          ))}
        </View>
      )}

      {step === 2 && (
        <View style={styles.options}>
          {TONES.map((t) => (
            <OptionCard
              key={t.value}
              compact
              title={t.label}
              subtitle={t.subtitle}
              selected={brand.tone === t.value}
              onPress={() => updateBrand({ tone: t.value })}
            />
          ))}
        </View>
      )}

      {step === 3 && (
        <View style={styles.options}>
          <OptionCard
            emoji="😊"
            title="Je & jij"
            subtitle="Informeel en toegankelijk. Past bij de meeste consumentenmerken."
            selected={brand.formOfAddress === 'je'}
            onPress={() => updateBrand({ formOfAddress: 'je' })}
          />
          <OptionCard
            emoji="🎩"
            title="U"
            subtitle="Formeel en respectvol. Past bij juridische, financiële en premium merken."
            selected={brand.formOfAddress === 'u'}
            onPress={() => updateBrand({ formOfAddress: 'u' })}
          />
        </View>
      )}

      {step === 4 && (
        <View style={styles.options}>
          {(Object.keys(LANGUAGE_LABELS) as NonNullable<BrandProfile['language']>[]).map((lang) => (
            <OptionCard
              key={lang}
              compact
              emoji={{ nl: '🇳🇱', en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷' }[lang]}
              title={LANGUAGE_LABELS[lang]}
              selected={brand.language === lang}
              onPress={() => updateBrand({ language: lang })}
            />
          ))}
          <View style={styles.emojiRow}>
            <View style={styles.emojiTextWrap}>
              <Text style={styles.emojiTitle}>Emoji in captions</Text>
              <Text style={styles.emojiSubtitle}>Zet uit voor een strakke, tekstuele stijl.</Text>
            </View>
            <Switch
              value={brand.useEmoji}
              onValueChange={(v) => updateBrand({ useEmoji: v })}
              trackColor={{ true: Brand.pink, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.lg },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  options: { gap: Spacing.sm },
  emojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    backgroundColor: Colors.backgroundSoft,
    borderRadius: 16,
    padding: Spacing.md,
  },
  emojiTextWrap: { flex: 1, gap: 2 },
  emojiTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  emojiSubtitle: { fontSize: 13, color: Colors.textSecondary },
});
