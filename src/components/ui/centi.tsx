import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Brand, Colors, Radius, Spacing } from '@/constants/theme';

interface Props {
  size?: number;
  /** Tekstballon naast Centi. */
  message?: string;
}

/**
 * Centi, de mascotte. Placeholder-weergave (emoji in gradient-ring) totdat de
 * geanimeerde Higgsfield-assets (Lottie) zijn gegenereerd en gebundeld.
 */
export function Centi({ size = 84, message }: Props) {
  return (
    <View style={styles.row}>
      <LinearGradient
        colors={Brand.gradient}
        start={Brand.gradientStart}
        end={Brand.gradientEnd}
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={[styles.inner, { borderRadius: (size - 8) / 2 }]}>
          <Text style={{ fontSize: size * 0.45 }}>🐛</Text>
        </View>
      </LinearGradient>
      {message ? (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ring: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    flex: 1,
    backgroundColor: Colors.backgroundSoft,
    borderRadius: Radius.lg,
    borderBottomLeftRadius: 4,
    padding: Spacing.md,
  },
  bubbleText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 21,
  },
});
