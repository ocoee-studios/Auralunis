// NOTE: Animated hooks inside .map() may need refactoring into child components.
// This is the v1 — Claude Code should split ForgeSegment and ForgeStar into
// separate components if React warns about hooks.
import React, { memo, useEffect } from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, G, Line } from "react-native-svg";
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ForgePoint { x: number; y: number; }
export interface ForgeSegment { from: ForgePoint; to: ForgePoint; }
interface Props { width: number; height: number; active?: boolean; points?: ForgePoint[]; segments?: ForgeSegment[]; nightVision?: boolean; intensity?: number; }

export const ConstellationForgeLayer = memo(function ConstellationForgeLayer({ width, height, active = false, points = [], segments = [], nightVision = false, intensity = 1 }: Props) {
  const progress = useSharedValue(0);
  useEffect(() => { progress.value = 0; if (active) { progress.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) }); } }, [active, progress]);
  const gold = nightVision ? "#FF453A" : "#D9A84E";
  const starlight = nightVision ? "#FFB3AA" : "#FFF6D6";
  return (
    <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
      <G opacity={active ? 1 : 0}>
        {segments.map((seg, i) => {
          const length = Math.hypot(seg.to.x - seg.from.x, seg.to.y - seg.from.y);
          const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.value), opacity: (0.2 + progress.value * 0.75) * intensity }));
          return <AnimatedLine key={`fl-${i}`} x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y} stroke={gold} strokeWidth={1.5} strokeLinecap="round" strokeDasharray={`${length}, ${length}`} animatedProps={animatedProps} />;
        })}
        {points.map((pt, i) => {
          const animatedProps = useAnimatedProps(() => ({ r: 2.2 + progress.value * 3.8, opacity: (0.25 + progress.value * 0.7) * intensity }));
          return <AnimatedCircle key={`fs-${i}`} cx={pt.x} cy={pt.y} fill={i % 2 === 0 ? starlight : gold} animatedProps={animatedProps} />;
        })}
      </G>
    </Svg>
  );
});
