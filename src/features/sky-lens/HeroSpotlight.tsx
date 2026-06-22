// HeroSpotlight.tsx
// The hierarchy unlock: when an object is selected, the whole field steps back and
// the object becomes the star of the scene. A radial vignette scrim centered on the
// object dims everything outward (to a floor, never black) while keeping the object
// + its immediate surround clear, and a soft gold "presence" haze blooms around it.
// Crash-safe: an Animated.View opacity fade over a STATIC SVG (no animated SVG props).

import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing, cancelAnimation,
} from "react-native-reanimated";

type Props = {
  x: number;
  y: number;
  box: { width: number; height: number };
  nightMode: boolean;
};

export function HeroSpotlight({ x, y, box, nightMode }: Props) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.quad) });
    return () => cancelAnimation(t);
  }, [t]);
  const style = useAnimatedStyle(() => ({ opacity: t.value }));

  const gold = nightMode ? "#C24A4A" : "#D9A84E";
  const R = Math.max(box.width, box.height) * 1.1;
  const clear = Math.min(box.width, box.height) * 0.24; // clear focus zone radius
  const c0 = clear / R;
  const c1 = (clear * 2.1) / R;

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width={box.width} height={box.height} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* vignette scrim — clear at the object, dimming to a floor (not black) outward */}
          <RadialGradient id="heroScrim" cx={x} cy={y} r={R} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#030816" stopOpacity={0} />
            <Stop offset={c0} stopColor="#030816" stopOpacity={0} />
            <Stop offset={c1} stopColor="#030816" stopOpacity={0.4} />
            <Stop offset="1" stopColor="#030816" stopOpacity={0.7} />
          </RadialGradient>
          {/* luminous lift — the focused region reads brighter, not just less-dimmed */}
          <RadialGradient id="heroLift" cx={x} cy={y} r={clear * 1.1} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FFF6E0" stopOpacity={0.1} />
            <Stop offset="0.5" stopColor="#FFF6E0" stopOpacity={0.035} />
            <Stop offset="1" stopColor="#FFF6E0" stopOpacity={0} />
          </RadialGradient>
          {/* gold presence haze around the focused object */}
          <RadialGradient id="heroHalo" cx={x} cy={y} r={clear * 1.4} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={gold} stopOpacity={0.14} />
            <Stop offset="0.6" stopColor={gold} stopOpacity={0.05} />
            <Stop offset="1" stopColor={gold} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={box.width} height={box.height} fill="url(#heroScrim)" />
        <Rect width={box.width} height={box.height} fill="url(#heroLift)" />
        <Rect width={box.width} height={box.height} fill="url(#heroHalo)" />
      </Svg>
    </Animated.View>
  );
}
