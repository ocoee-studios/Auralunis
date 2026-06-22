import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

// A gold pulse ring marking a Find-Mode target once it's on screen — the "you've
// arrived" beat. Crash-safe: animates an Animated.View's scale + opacity via
// useAnimatedStyle (never animated SVG props).
export function TargetPulse({ x, y, color = "#D9A84E" }: { x: number; y: number; color?: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
    return () => cancelAnimation(t);
  }, [t]);

  const SIZE = 96;
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.35 + t.value * 1.3 }],
    opacity: 0.7 * (1 - t.value),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: x - SIZE / 2,
          top: y - SIZE / 2,
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          borderWidth: 2,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}
