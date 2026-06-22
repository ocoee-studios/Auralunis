// CelestialAtmosphereLayer.tsx — The "sacred celestial instrument" overlay
// EXTEND ONLY: renders above camera/sky background, below labels/cards.
// Adds: astral breathing, moon halo, horizon glow, Milky Way silk,
// deep space bloom, and luxury optic glints. Written by Gemini.

import React, { memo, useEffect } from "react";
import { StyleSheet } from "react-native";
import Svg, {
  Defs, RadialGradient, LinearGradient, Stop,
  Rect, Circle, Path, G,
} from "react-native-svg";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
} from "react-native-reanimated";

interface CelestialAtmosphereLayerProps {
  width: number;
  height: number;
  nightVision?: boolean;
  moonVisible?: boolean;
  milkyWayVisible?: boolean;
  intensity?: number;
}

export const CelestialAtmosphereLayer = memo(function CelestialAtmosphereLayer({
  width, height,
  nightVision = false,
  moonVisible = true,
  milkyWayVisible = true,
  intensity = 1,
}: CelestialAtmosphereLayerProps) {
  const breath = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
  }, [breath]);

  const breathingStyle = useAnimatedStyle(() => ({
    opacity: 0.82 + breath.value * 0.12,
    transform: [{ scale: 1 + breath.value * 0.012 }],
  }));

  const gold = nightVision ? "#FF3B30" : "#D9A84E";
  const starlight = nightVision ? "#FF8A80" : "#FFF6D6";
  const violet = nightVision ? "#2A0508" : "#7B5CF6";

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, breathingStyle]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="moonHalo" cx="72%" cy="22%" r="48%">
            <Stop offset="0%" stopColor={starlight} stopOpacity={moonVisible ? 0.24 * intensity : 0} />
            <Stop offset="24%" stopColor={gold} stopOpacity={moonVisible ? 0.12 * intensity : 0} />
            <Stop offset="64%" stopColor={gold} stopOpacity={moonVisible ? 0.035 * intensity : 0} />
            <Stop offset="100%" stopColor={gold} stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id="horizonGlow" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor={gold} stopOpacity={0.16 * intensity} />
            <Stop offset="30%" stopColor={violet} stopOpacity={0.08 * intensity} />
            <Stop offset="100%" stopColor="#030816" stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="milkyGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gold} stopOpacity={0} />
            <Stop offset="30%" stopColor={gold} stopOpacity={milkyWayVisible ? 0.07 * intensity : 0} />
            <Stop offset="50%" stopColor={starlight} stopOpacity={milkyWayVisible ? 0.12 * intensity : 0} />
            <Stop offset="70%" stopColor={gold} stopOpacity={milkyWayVisible ? 0.07 * intensity : 0} />
            <Stop offset="100%" stopColor={gold} stopOpacity={0} />
          </LinearGradient>
          <RadialGradient id="deepSpaceBloom" cx="50%" cy="45%" r="70%">
            <Stop offset="0%" stopColor={violet} stopOpacity={0.08 * intensity} />
            <Stop offset="55%" stopColor={gold} stopOpacity={0.035 * intensity} />
            <Stop offset="100%" stopColor="#030816" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Deep celestial bloom — subtle violet/gold wash across the sky */}
        <Rect width={width} height={height} fill="url(#deepSpaceBloom)" />

        {/* Horizon atmosphere — gold-to-violet glow at the bottom */}
        <Rect y={height * 0.58} width={width} height={height * 0.42} fill="url(#horizonGlow)" />

        {/* Moon atmospheric halo — large soft glow where the moon sits */}
        <Circle cx={width * 0.72} cy={height * 0.22} r={Math.min(width, height) * 0.42} fill="url(#moonHalo)" />

        {/* Gold-tinted Milky Way silk band with dust lane */}
        <G opacity={milkyWayVisible ? 1 : 0}>
          <Path
            d={`M ${-width * 0.15} ${height * 0.84} C ${width * 0.12} ${height * 0.62}, ${width * 0.26} ${height * 0.38}, ${width * 0.48} ${height * 0.22} C ${width * 0.72} ${height * 0.04}, ${width * 0.94} ${height * 0.14}, ${width * 1.16} ${-height * 0.06} L ${width * 1.2} ${height * 0.22} C ${width * 0.96} ${height * 0.32}, ${width * 0.76} ${height * 0.28}, ${width * 0.54} ${height * 0.46} C ${width * 0.32} ${height * 0.64}, ${width * 0.18} ${height * 0.84}, ${-width * 0.1} ${height * 1.02} Z`}
            fill="url(#milkyGold)"
          />
          <Path
            d={`M ${width * 0.05} ${height * 0.82} C ${width * 0.26} ${height * 0.66}, ${width * 0.34} ${height * 0.48}, ${width * 0.55} ${height * 0.34} C ${width * 0.74} ${height * 0.22}, ${width * 0.92} ${height * 0.25}, ${width * 1.08} ${height * 0.08}`}
            stroke="#030816" strokeWidth={38} strokeOpacity={0.18}
            fill="none" strokeLinecap="round"
          />
        </G>

        {/* Luxury optic glints — tiny bright points like lens reflections */}
        <Circle cx={width * 0.18} cy={height * 0.24} r={1.4} fill={starlight} opacity={0.9} />
        <Circle cx={width * 0.82} cy={height * 0.42} r={1.1} fill={gold} opacity={0.8} />
        <Circle cx={width * 0.61} cy={height * 0.12} r={1.2} fill={starlight} opacity={0.75} />
        <Circle cx={width * 0.36} cy={height * 0.68} r={1.0} fill={gold} opacity={0.7} />
      </Svg>
    </Animated.View>
  );
});
