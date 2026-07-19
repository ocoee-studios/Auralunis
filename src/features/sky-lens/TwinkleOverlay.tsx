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
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type TwinkleKind = "star" | "dust";

export type TwinkleTarget = {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  offset: number;
  magnitude: number;
  kind?: TwinkleKind; // default "star"
};

// A View-based twinkle overlay rendered OVER the SVG canvas. Animating an
// Animated.View's opacity via useAnimatedStyle is the supported, crash-safe Reanimated
// pattern (the SVG-prop animation we had before crashed on RN 0.81 + Reanimated 4 +
// react-native-svg 15). One clock drives many dots, each with its own phase offset.
//
// TWO CLOCKS, deliberately:
//
//   * STARS twinkle fast and shallow (2.6 s, ±12% around near-full opacity) — that's
//     atmospheric scintillation, and it should read as "the stars are alive".
//
//   * STARDUST breathes slowly and deeply (11 s, fading nearly out and back). On the
//     first device pass the dust glints rode the STAR clock, which is exactly why they
//     read as "ordinary extra stars": anything twinkling at star speed IS a star to the
//     eye. Slow and deep is what makes a mote read as a drifting glint of light rather
//     than a point source.
//
// Two shared clocks total — this stays one animation system, not a particle engine.
const STAR_PERIOD_MS = 2600;
const DUST_PERIOD_MS = 11000;

function TwinkleDot({
  clock,
  t,
  base,
  amp,
  reduced
}: {
  clock: SharedValue<number>;
  t: TwinkleTarget;
  base: number;
  amp: number;
  reduced: boolean;
}) {
  const offset = t.offset;
  const style = useAnimatedStyle(() => ({
    // Reduced Motion: hold the base (static) brightness — no scintillation.
    opacity: reduced ? base : base + amp * Math.sin((clock.value + offset) * Math.PI * 2)
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
  const starClock = useSharedValue(0);
  const dustClock = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      // Reduced Motion: stop and freeze both clocks so twinkle holds a static base frame.
      cancelAnimation(starClock);
      cancelAnimation(dustClock);
      starClock.value = 0;
      dustClock.value = 0;
      return;
    }
    starClock.value = withRepeat(withTiming(1, { duration: STAR_PERIOD_MS, easing: Easing.linear }), -1, false);
    dustClock.value = withRepeat(withTiming(1, { duration: DUST_PERIOD_MS, easing: Easing.linear }), -1, false);
    return () => {
      cancelAnimation(starClock);
      cancelAnimation(dustClock);
    };
  }, [starClock, dustClock, reduced]);

  if (nightMode) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {targets.map((t) =>
        t.kind === "dust" ? (
          // Slow, deep swell: 0.10 → 0.62. A glint that nearly vanishes, then returns.
          <TwinkleDot key={t.id} clock={dustClock} t={t} base={0.36} amp={0.26} reduced={reduced} />
        ) : (
          // Quick, shallow scintillation around near-full opacity.
          <TwinkleDot key={t.id} clock={starClock} t={t} base={0.88} amp={0.12} reduced={reduced} />
        )
      )}
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
