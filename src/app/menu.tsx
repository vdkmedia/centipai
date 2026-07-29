import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Centi } from '@/components/ui/centi';
import { Screen } from '@/components/ui/screen';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/lib/onboarding';

const ITEMS = [
  { route: '/chat', emoji: '💬', title: 'Chat met Centi', subtitle: 'Foto droppen, captions maken en inplannen' },
  { route: '/planning', emoji: '🗓️', title: 'Planning', subtitle: 'Alles wat klaarstaat, met filters per kanaal' },
  { route: '/google-business', emoji: '📍', title: 'Google Mijn Bedrijf', subtitle: 'Bedrijfsinfo en openingstijden aanpassen' },
  { route: '/ai-rules', emoji: '🎓', title: 'Centi trainen', subtitle: 'Eigen AI-regels toevoegen en verwijderen' },
  { route: '/onboarding/summary', emoji: '🎨', title: 'Brandprofiel', subtitle: 'Toon, je/u, taal en emoji-voorkeuren' },
  { route: '/credits', emoji: '⚡', title: 'Losse credits kopen', subtitle: 'Extra AI-credits los van je abonnement' },
  { route: '/pricing', emoji: '💳', title: 'Abonnement', subtitle: 'Je pakket bekijken of upgraden' },
] as const;

export default function MenuScreen() {
  const { state } = useOnboarding();

  return (
    <Screen>
      <View style={styles.header}>
        <Centi message={`Waar wil je heen${state.brand.companyName ? `, ${state.brand.companyName}` : ''}?`} />
      </View>
      <Text style={styles.heading}>Menu</Text>
      <View style={styles.list}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => router.push(item.route)}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.85 }]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <View style={styles.textWrap}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: Spacing.lg, marginBottom: Spacing.lg },
  heading: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: Spacing.md },
  list: { gap: Spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.card,
  },
  emoji: { fontSize: 24 },
  textWrap: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  chevron: { fontSize: 24, color: Colors.textSecondary },
});
