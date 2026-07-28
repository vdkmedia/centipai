import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Brand, Colors, Radius, Spacing } from '@/constants/theme';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
}

export function GradientButton({ title, onPress, disabled, variant = 'primary', style }: Props) {
  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.outline, pressed && styles.pressed, disabled && styles.disabled, style]}>
        <Text style={styles.outlineLabel}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled, style]}>
      <LinearGradient
        colors={Brand.gradient}
        start={Brand.gradientStart}
        end={Brand.gradientEnd}
        style={styles.gradient}>
        <View>
          <Text style={styles.label}>{title}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: Radius.pill,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  label: {
    color: Colors.textInverse,
    fontSize: 17,
    fontWeight: '700',
  },
  outline: {
    borderRadius: Radius.pill,
    paddingVertical: 15,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  outlineLabel: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
});
