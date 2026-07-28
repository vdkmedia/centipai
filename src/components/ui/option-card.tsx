import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
  compact?: boolean;
}

/** Selecteerbare kaart; geselecteerd = roze rand (brand-accent). */
export function OptionCard({ title, subtitle, emoji, selected, onPress, compact }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compact,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}>
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <View style={styles.textWrap}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.card,
  },
  compact: { padding: 12 },
  selected: {
    borderColor: Colors.borderActive,
    backgroundColor: '#FEF5F9',
  },
  pressed: { opacity: 0.9 },
  emoji: { fontSize: 26 },
  textWrap: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '600', color: Colors.text },
  titleSelected: { color: Colors.borderActive },
  subtitle: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.borderActive },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.borderActive,
  },
});
