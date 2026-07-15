import React, { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { View } from "react-native";

// The selected-object marker. While an info card is open, this rings the object it
// describes so it's immediately obvious WHICH star (or planet, nebula…) opened the card.
// Two parts: a STEADY gold ring that plainly marks the object, plus a slow expanding
// pulse that draws the eye to it. Crash-safe — animates Animated.View scale/opacity via
// useAnimatedStyle, never SVG props (which crash on RN 0.81 + Reanimated 4 + svg 15).
export function SelectionRing({ x, y, color = "#D9A84E" }: { x: number; y: number; color?: string }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const RING = 30; // steady ring diameter
  const PULSE = 30; // pulse base diameter (expands ~2.4×)

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.7 + pulse.value * 1.7 }],
    opacity: 0.55 * (1 - pulse.value),
  }));

  return (
    <View pointerEvents="none" style={{ position: "absolute", left: x, top: y }}>
      {/* Steady ring — the actual "this is selected" marker. */}
      <View
        style={{
          position: "absolute",
          left: -RING / 2,
          top: -RING / 2,
          width: RING,
          height: RING,
          borderRadius: RING / 2,
          borderWidth: 1.5,
          borderColor: color,
          opacity: 0.9,
        }}
      />
      {/* Slow expanding pulse — draws the eye without being noisy. */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: -PULSE / 2,
            top: -PULSE / 2,
            width: PULSE,
            height: PULSE,
            borderRadius: PULSE / 2,
            borderWidth: 1.5,
            borderColor: color,
          },
          pulseStyle,
        ]}
      />
    </View>
  );
}
