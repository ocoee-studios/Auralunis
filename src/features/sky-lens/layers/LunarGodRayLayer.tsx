import React, { memo, useEffect } from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, Defs, Line, RadialGradient, Stop, G } from "react-native-svg";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

interface Props { width: number; height: number; moonX: number; moonY: number; moonRadius?: number; visible?: boolean; nightVision?: boolean; intensity?: number; }

export const LunarGodRayLayer = memo(function LunarGodRayLayer({ width, height, moonX, moonY, moonRadius = 20, visible = true, nightVision = false, intensity = 1 }: Props) {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(drift); // stop the UI-thread loop when the moon leaves view
  }, [drift]);
  const style = useAnimatedStyle(() => ({ opacity: visible ? 0.5 + drift.value * 0.06 : 0, transform: [{ rotate: `${drift.value * 0.45}deg` }] }));
  const gold = nightVision ? "#FF453A" : "#D9A84E";
  const starlight = nightVision ? "#FFB3AA" : "#FFF6D6";
  const rayCount = 12;
  const rayLength = Math.min(width, height) * 0.15;
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs><RadialGradient id="lunarGrandHalo" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={starlight} stopOpacity={0.14 * intensity} />
          <Stop offset="24%" stopColor={gold} stopOpacity={0.07 * intensity} />
          <Stop offset="70%" stopColor={gold} stopOpacity={0.018 * intensity} />
          <Stop offset="100%" stopColor={gold} stopOpacity={0} />
        </RadialGradient></Defs>
        <Circle cx={moonX} cy={moonY} r={moonRadius * 3.4} fill="url(#lunarGrandHalo)" />
        <G opacity={0.07 * intensity}>
          {Array.from({ length: rayCount }).map((_, i) => {
            const angle = (i / rayCount) * Math.PI * 2;
            const inner = moonRadius * 1.35;
            const outer = inner + rayLength * (i % 3 === 0 ? 1 : 0.52);
            return <Line key={`ray-${i}`} x1={moonX + Math.cos(angle) * inner} y1={moonY + Math.sin(angle) * inner} x2={moonX + Math.cos(angle) * outer} y2={moonY + Math.sin(angle) * outer} stroke={i % 2 === 0 ? starlight : gold} strokeWidth={i % 3 === 0 ? 0.8 : 0.45} strokeLinecap="round" />;
          })}
        </G>
      </Svg>
    </Animated.View>
  );
});