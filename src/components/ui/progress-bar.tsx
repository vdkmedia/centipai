import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Brand, Colors, Radius } from '@/constants/theme';

interface Props {
  /** 0..1 */
  progress: number;
}

export function ProgressBar({ progress }: Props) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.track}>
      <LinearGradient
        colors={Brand.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${pct * 100}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.backgroundSoft,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
