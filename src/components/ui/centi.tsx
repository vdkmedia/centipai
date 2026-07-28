import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { CentiFigure } from '@/components/ui/centi-figure';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type CentiMood = 'idle' | 'wave' | 'thinking' | 'happy';

interface Props {
  size?: number;
  /** Tekstballon naast Centi. */
  message?: string;
  /** Toont een typ-indicator in de ballon (Centi "denkt"). */
  thinking?: boolean;
  mood?: CentiMood;
}

/**
 * Centi, de levende mascotte. Emoji-weergave in een gradient-ring, met
 * doorlopende animaties: zweven, wiegen, ademen en een blije sprong.
 * Zodra de Higgsfield-poses als afbeeldingen zijn gebundeld nemen die de
 * plek van de emoji over; de animatielaag blijft gelijk.
 */
export function Centi({ size = 84, message, thinking = false, mood = 'idle' }: Props) {
  const bob = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const jump = useRef(new Animated.Value(0)).current;

  // Zweven: rustige sinus omhoog/omlaag
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  // Wiegen: subtiel kantelen, net uit fase met het zweven
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(tilt, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(tilt, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [tilt]);

  // Ademen: de gradient-ring pulseert heel licht mee
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 2300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 2300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  // Blij: één vrolijke sprong bij mood="happy"
  useEffect(() => {
    if (mood !== 'happy') return;
    Animated.sequence([
      Animated.timing(jump, { toValue: -14, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(jump, { toValue: 0, friction: 3, tension: 120, useNativeDriver: true }),
    ]).start();
  }, [mood, jump]);

  const translateY = Animated.add(
    bob.interpolate({ inputRange: [0, 1], outputRange: [3, -3] }),
    jump,
  );
  const rotate = tilt.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });
  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });

  return (
    <View style={styles.row}>
      <Animated.View style={{ transform: [{ translateY }, { rotate }, { scale }] }}>
        <CentiFigure size={size * 1.15} happy={mood === 'happy'} />
      </Animated.View>
      {message || thinking ? (
        <View style={styles.bubble}>
          {thinking ? <TypingDots /> : <Text style={styles.bubbleText}>{message}</Text>}
        </View>
      ) : null}
    </View>
  );
}

/** Drie pulserende puntjes, zoals een typ-indicator in een chat-app. */
function TypingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const loops = dots.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(v, { toValue: 1, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.delay((2 - i) * 180),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
              transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
  dotsRow: { flexDirection: 'row', gap: 6, paddingVertical: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
  },
});
