import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

/**
 * Centi als levende vector-mascotte, volledig in code getekend zodat hij op
 * elke achtergrond en elk formaat scherp is. Elk lijfsegment beweegt met een
 * eigen faseverschil waardoor hij echt lijkt te kruipen; hij knippert met
 * zijn ogen en zijn voelsprieten wiebelen.
 */

// Gradientkleuren per segment: van oranje (kop) naar paars (staart)
const SEGMENT_COLORS = ['#F7941D', '#F45F2C', '#EE2A7B', '#BC2BAE', '#8A2BE2'];

interface Props {
  /** Totale breedte van de mascotte. */
  size?: number;
  /** Laat Centi één vrolijke sprong maken (bijv. na goedkeuren). */
  happy?: boolean;
}

export function CentiFigure({ size = 120, happy = false }: Props) {
  const crawl = useRef(new Animated.Value(0)).current;
  const antenna = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const jump = useRef(new Animated.Value(0)).current;

  // Kruipgolf: één doorlopende klok; segmenten lezen hem met faseverschil
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(crawl, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [crawl]);

  // Voelsprieten wiebelen
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(antenna, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(antenna, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [antenna]);

  // Knipperen: elke ~3,2s heel kort dicht
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(3200),
        Animated.timing(blink, { toValue: 0.08, duration: 90, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);

  // Vrolijke sprong
  useEffect(() => {
    if (!happy) return;
    Animated.sequence([
      Animated.timing(jump, { toValue: -size * 0.12, duration: 170, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(jump, { toValue: 0, friction: 3, tension: 140, useNativeDriver: true }),
    ]).start();
  }, [happy, jump, size]);

  const headD = size * 0.34; // diameter kop
  const segD = size * 0.26; // diameter lijfsegment
  const overlap = segD * 0.28;
  const legH = size * 0.09;

  // Elk segment volgt de kruipgolf met faseverschil: sin(2π·(t + fase))
  const segmentLift = (phase: number) =>
    crawl.interpolate({
      inputRange: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]
        .map((t) => t)
        .slice(),
      outputRange: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1].map(
        (t) => -Math.sin(2 * Math.PI * (t + phase)) * size * 0.045,
      ),
    });

  const antennaRotate = antenna.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '10deg'] });
  const antennaRotate2 = antenna.interpolate({ inputRange: [0, 1], outputRange: ['10deg', '-14deg'] });

  return (
    <Animated.View
      style={[styles.root, { width: size, height: size * 0.62, transform: [{ translateY: jump }] }]}
      accessibilityLabel="Centi, de CentipAI mascotte">
      {/* Lijf: staart eerst zodat de kop bovenop ligt */}
      {[4, 3, 2, 1].map((i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: headD - overlap + (i - 1) * (segD - overlap),
            bottom: legH,
            transform: [{ translateY: segmentLift(i * 0.16) }],
          }}>
          <View
            style={{
              width: segD,
              height: segD,
              borderRadius: segD / 2,
              backgroundColor: SEGMENT_COLORS[i],
            }}
          />
          {/* Pootjes */}
          <View style={[styles.leg, { left: segD * 0.18, height: legH }]} />
          <View style={[styles.leg, { right: segD * 0.18, height: legH }]} />
        </Animated.View>
      ))}

      {/* Kop */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          bottom: legH,
          transform: [{ translateY: segmentLift(0) }],
        }}>
        {/* Voelsprieten */}
        <Animated.View style={[styles.antenna, { left: headD * 0.16, height: headD * 0.42, transform: [{ rotate: antennaRotate }] }]}>
          <View style={styles.antennaTip} />
        </Animated.View>
        <Animated.View style={[styles.antenna, { left: headD * 0.58, height: headD * 0.36, transform: [{ rotate: antennaRotate2 }] }]}>
          <View style={styles.antennaTip} />
        </Animated.View>

        <View
          style={{
            width: headD,
            height: headD,
            borderRadius: headD / 2,
            backgroundColor: SEGMENT_COLORS[0],
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {/* Ogen */}
          <View style={[styles.eyeRow, { gap: headD * 0.14, marginTop: -headD * 0.06 }]}>
            {[0, 1].map((e) => (
              <Animated.View
                key={e}
                style={[
                  styles.eye,
                  {
                    width: headD * 0.2,
                    height: headD * 0.2,
                    borderRadius: headD * 0.1,
                    transform: [{ scaleY: blink }],
                  },
                ]}>
                <View
                  style={{
                    width: headD * 0.09,
                    height: headD * 0.09,
                    borderRadius: headD * 0.045,
                    backgroundColor: '#1A1A1E',
                  }}
                />
              </Animated.View>
            ))}
          </View>
          {/* Mond */}
          <View
            style={{
              width: headD * 0.3,
              height: headD * 0.16,
              borderBottomLeftRadius: headD * 0.16,
              borderBottomRightRadius: headD * 0.16,
              borderWidth: headD * 0.035,
              borderColor: 'transparent',
              borderBottomColor: '#FFFFFF',
              marginTop: headD * 0.02,
            }}
          />
        </View>
        {/* Pootjes onder de kop */}
        <View style={[styles.leg, { left: headD * 0.22, height: legH }]} />
        <View style={[styles.leg, { right: headD * 0.22, height: legH }]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'relative' },
  leg: {
    position: 'absolute',
    bottom: undefined,
    top: '86%',
    width: 3.5,
    borderRadius: 2,
    backgroundColor: '#B62BB8',
  },
  antenna: {
    position: 'absolute',
    top: undefined,
    bottom: '88%',
    width: 3,
    borderRadius: 2,
    backgroundColor: '#E5822C',
    alignItems: 'center',
  },
  antennaTip: {
    position: 'absolute',
    top: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F7941D',
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  eyeRow: { flexDirection: 'row', alignItems: 'center' },
  eye: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
