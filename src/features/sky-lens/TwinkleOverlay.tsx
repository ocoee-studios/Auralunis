import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  type SharedValue
} from "react-native-reanimated";

export type TwinkleTarget = {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  offset: number;
  magnitude: number;
};

// A View-based twinkle overlay rendered OVER the SVG canvas. Animating an
// Animated.View's opacity via useAnimatedStyle is the supported, crash-safe
// Reanimated pattern (the SVG-prop animation we had before crashed on RN 0.81 +
// Reanimated 4 + react-native-svg 15). One shared clock drives every dot, each
// with its own phase offset so they shimmer out of sync.
function TwinkleDot({ clock, t }: { clock: SharedValue<number>; t: TwinkleTarget }) {
  const offset = t.offset;
  // ±15% opacity around a near-full base — a living shimmer, not a hard blink.
  const style = useAnimatedStyle(() => ({
    opacity: 0.85 + 0.15 * Math.sin((clock.value + offset) * Math.PI * 2)
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dot,
        {
          left: t.x - t.size / 2,
          top: t.y - t.size / 2,
          width: t.size,
          height: t.size,
          borderRadius: t.size / 2,
          backgroundColor: t.color,
          shadowColor: t.color
        },
        style
      ]}
    />
  );
}

export function TwinkleOverlay({ targets, nightMode }: { targets: TwinkleTarget[]; nightMode: boolean }) {
  const clock = useSharedValue(0);
  useEffect(() => {
    clock.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(clock);
  }, [clock]);

  if (nightMode) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {targets.map((t) => (
        <TwinkleDot key={t.id} clock={clock} t={t} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    shadowOpacity: 0.9,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 }
  }
});
