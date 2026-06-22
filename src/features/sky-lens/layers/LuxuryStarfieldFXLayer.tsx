import React, { memo, useEffect, useMemo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, G, Line } from "react-native-svg";
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from "react-native-reanimated";

interface LuxuryStarfieldFXLayerProps {
  width: number;
  height: number;
  nightVision?: boolean;
  intensity?: number;
  count?: number;
}

type DustParticle = { x: number; y: number; r: number; opacity: number; gold: boolean };

function seededRandom(seed: number) {
  let value = seed;
  return () => { value = (value * 9301 + 49297) % 233280; return value / 233280; };
}

export const LuxuryStarfieldFXLayer = memo(function LuxuryStarfieldFXLayer({
  width, height, nightVision = false, intensity = 1, count = 90,
}: LuxuryStarfieldFXLayerProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
  }, [shimmer]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.72 + shimmer.value * 0.18,
    transform: [{ translateY: shimmer.value * -2 }],
  }));

  const particles = useMemo<DustParticle[]>(() => {
    const rand = seededRandom(1337);
    return Array.from({ length: count }).map(() => ({
      x: rand() * width, y: rand() * height,
      r: 0.45 + rand() * 1.5, opacity: 0.08 + rand() * 0.22,
      gold: rand() > 0.42,
    }));
  }, [width, height, count]);

  const gold = nightVision ? "#FF453A" : "#D9A84E";
  const starlight = nightVision ? "#FFB3AA" : "#FFF6D6";

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <G>
          {particles.map((p, i) => (
            <Circle key={`dust-${i}`} cx={p.x} cy={p.y} r={p.r} fill={p.gold ? gold : starlight} opacity={p.opacity * intensity} />
          ))}
        </G>
        <G opacity={0.7 * intensity}>
          <Circle cx={width * 0.18} cy={height * 0.24} r={1.8} fill={starlight} />
          <Line x1={width * 0.18 - 8} y1={height * 0.24} x2={width * 0.18 + 8} y2={height * 0.24} stroke={starlight} strokeOpacity={0.35} strokeWidth={0.8} />
          <Line x1={width * 0.18} y1={height * 0.24 - 8} x2={width * 0.18} y2={height * 0.24 + 8} stroke={starlight} strokeOpacity={0.35} strokeWidth={0.8} />
          <Circle cx={width * 0.82} cy={height * 0.42} r={1.4} fill={gold} />
          <Line x1={width * 0.82 - 7} y1={height * 0.42} x2={width * 0.82 + 7} y2={height * 0.42} stroke={gold} strokeOpacity={0.32} strokeWidth={0.8} />
          <Line x1={width * 0.82} y1={height * 0.42 - 7} x2={width * 0.82} y2={height * 0.42 + 7} stroke={gold} strokeOpacity={0.32} strokeWidth={0.8} />
        </G>
      </Svg>
    </Animated.View>
  );
});
