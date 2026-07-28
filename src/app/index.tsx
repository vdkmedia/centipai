import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Centi } from '@/components/ui/centi';
import { GradientButton } from '@/components/ui/gradient-button';
import { Screen } from '@/components/ui/screen';
import { Brand, Colors, Spacing } from '@/constants/theme';

export default function Welcome() {
  return (
    <Screen
      footer={
        <View style={styles.footer}>
          <GradientButton title="Aan de slag" onPress={() => router.push('/onboarding/account-type')} />
          <GradientButton
            title="Ik heb al een account"
            variant="outline"
            onPress={() => {
              // TODO: inloggen (Supabase Auth) — volgt na de onboarding-fase
            }}
          />
        </View>
      }>
      <View style={styles.hero}>
        <Centi size={120} />
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Centip</Text>
          <LinearGradient
            colors={Brand.gradient}
            start={Brand.gradientStart}
            end={Brand.gradientEnd}
            style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </LinearGradient>
        </View>
        <Text style={styles.tagline}>
          Plan je social media posts met AI.{'\n'}Centi schrijft captions in jouw stijl en jij keurt goed.
        </Text>
      </View>

      <View style={styles.usps}>
        <Usp emoji="📸" text="Drop je foto, kies je favoriete caption" />
        <Usp emoji="🗓️" text="Plan in wanneer jij wilt, of laat Centi het beste moment kiezen" />
        <Usp emoji="✅" text="Agency zet klaar, de ondernemer keurt goed" />
        <Usp emoji="🚀" text="Publiceer naar Instagram, Facebook, TikTok, LinkedIn en meer" />
      </View>
    </Screen>
  );
}

function Usp({ emoji, text }: { emoji: string; text: string }) {
  return (
    <View style={styles.usp}>
      <Text style={styles.uspEmoji}>{emoji}</Text>
      <Text style={styles.uspText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
  },
  aiBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  aiBadgeText: { color: Colors.textInverse, fontSize: 24, fontWeight: '800' },
  tagline: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 23,
    color: Colors.textSecondary,
  },
  usps: { gap: Spacing.md, marginBottom: Spacing.lg },
  usp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundSoft,
    borderRadius: 16,
    padding: Spacing.md,
  },
  uspEmoji: { fontSize: 22 },
  uspText: { flex: 1, fontSize: 15, color: Colors.text, lineHeight: 20 },
  footer: { gap: Spacing.sm },
});
