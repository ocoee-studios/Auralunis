import React, { memo, useEffect } from "react";
import { StyleSheet } from "react-native";
import Svg, {
  Defs, RadialGradient, LinearGradient, Stop,
  Rect, Circle, Path, G,
} from "react-native-svg";
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from "react-native-reanimated";

interface PremiumSkyBloomLayerProps {
  width: number;
  height: number;
  nightVision?: boolean;
  moonVisible?: boolean;
  milkyWayVisible?: boolean;
  intensity?: number;
}

export const PremiumSkyBloomLayer = memo(function PremiumSkyBloomLayer({
  width, height, nightVision = false, moonVisible = true,
  milkyWayVisible = true, intensity = 1,
}: PremiumSkyBloomLayerProps) {
  const breathe = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
  }, [breathe]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.78 + breathe.value * 0.16,
    transform: [{ scale: 1 + breathe.value * 0.01 }],
  }));

  const gold = nightVision ? "#FF453A" : "#D9A84E";
  const starlight = nightVision ? "#FFB3AA" : "#FFF6D6";
  const violet = nightVision ? "#30070A" : "#7B5CF6";

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, animatedStyle]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="auralunisDeepBloom" cx="50%" cy="38%" r="72%">
            <Stop offset="0%" stopColor={violet} stopOpacity={0.08 * intensity} />
            <Stop offset="48%" stopColor={gold} stopOpacity={0.045 * intensity} />
            <Stop offset="100%" stopColor="#030816" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="auralunisMoonHalo" cx="74%" cy="20%" r="50%">
            <Stop offset="0%" stopColor={starlight} stopOpacity={moonVisible ? 0.28 * intensity : 0} />
            <Stop offset="22%" stopColor={gold} stopOpacity={moonVisible ? 0.15 * intensity : 0} />
            <Stop offset="62%" stopColor={gold} stopOpacity={moonVisible ? 0.04 * intensity : 0} />
            <Stop offset="100%" stopColor={gold} stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id="auralunisHorizonGlow" x1="0%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor={gold} stopOpacity={0.20 * intensity} />
            <Stop offset="35%" stopColor={violet} stopOpacity={0.09 * intensity} />
            <Stop offset="100%" stopColor="#030816" stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="auralunisMilkySilk" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gold} stopOpacity={0} />
            <Stop offset="28%" stopColor={gold} stopOpacity={milkyWayVisible ? 0.10 * intensity : 0} />
            <Stop offset="48%" stopColor={starlight} stopOpacity={milkyWayVisible ? 0.17 * intensity : 0} />
            <Stop offset="72%" stopColor={gold} stopOpacity={milkyWayVisible ? 0.09 * intensity : 0} />
            <Stop offset="100%" stopColor={gold} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#auralunisDeepBloom)" />
        <Rect y={height * 0.56} width={width} height={height * 0.44} fill="url(#auralunisHorizonGlow)" />
        <Circle cx={width * 0.74} cy={height * 0.20} r={Math.min(width, height) * 0.46} fill="url(#auralunisMoonHalo)" />
        <G opacity={milkyWayVisible ? 1 : 0}>
          <Path d={`M ${-width * 0.2} ${height * 0.88} C ${width * 0.1} ${height * 0.68}, ${width * 0.28} ${height * 0.40}, ${width * 0.5} ${height * 0.22} C ${width * 0.72} ${height * 0.04}, ${width * 0.96} ${height * 0.16}, ${width * 1.2} ${-height * 0.05} L ${width * 1.25} ${height * 0.26} C ${width * 0.98} ${height * 0.34}, ${width * 0.78} ${height * 0.30}, ${width * 0.56} ${height * 0.48} C ${width * 0.34} ${height * 0.66}, ${width * 0.16} ${height * 0.88}, ${-width * 0.12} ${height * 1.04} Z`} fill="url(#auralunisMilkySilk)" />
          <Path d={`M ${width * 0.03} ${height * 0.83} C ${width * 0.24} ${height * 0.66}, ${width * 0.36} ${height * 0.49}, ${width * 0.56} ${height * 0.34} C ${width * 0.75} ${height * 0.21}, ${width * 0.94} ${height * 0.24}, ${width * 1.1} ${height * 0.08}`} stroke="#030816" strokeWidth={42} strokeOpacity={0.18} fill="none" strokeLinecap="round" />
        </G>
      </Svg>
    </Animated.View>
  );
});
