// Starfield.tsx
// A living-sky background: ~50 faint scattered stars with a few slow twinklers and
// an atmospheric ground-glow gradient. Designed to sit absolutely BEHIND screen
// content (very subtle — content reads clearly over it). Crash-safe: twinkle is an
// Animated.View opacity via useAnimatedStyle (never animated SVG props).

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  type SharedValue,
} from "react-native-reanimated";

type Star = { left: number; top: number; size: number; opacity: number; twinkle: boolean; phase: number };

// Deterministic field so stars don't reshuffle on every render.
const STARS: Star[] = (() => {
  let s = 1287361;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const out: Star[] = [];
  for (let i = 0; i < 52; i++) {
    out.push({
      left: rnd() * 100,
      top: rnd() * 100,
      size: 0.5 + rnd() * 1.0,
      opacity: 0.12 + rnd() * 0.4,
      twinkle: false,
      phase: rnd(),
    });
  }
  // The 7 brightest slowly twinkle.
  [...out].sort((a, b) => b.size - a.size).slice(0, 7).forEach((st) => {
    st.twinkle = true;
    st.size = Math.max(st.size, 1.2);
  });
  return out;
})();

function TwinkleStar({ clock, st }: { clock: SharedValue<number>; st: Star }) {
  const style = useAnimatedStyle(() => ({
    opacity: st.opacity * (0.55 + 0.45 * (0.5 + 0.5 * Math.sin((clock.value + st.phase) * Math.PI * 2))),
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.star,
        {
          left: `${st.left}%`,
          top: `${st.top}%`,
          width: st.size,
          height: st.size,
          borderRadius: st.size / 2,
        },
        style,
      ]}
    />
  );
}

export function Starfield() {
  const clock = useSharedValue(0);
  useEffect(() => {
    clock.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(clock);
  }, [clock]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {STARS.map((st, i) =>
        st.twinkle ? (
          <TwinkleStar key={i} clock={clock} st={st} />
        ) : (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${st.left}%`,
                top: `${st.top}%`,
                width: st.size,
                height: st.size,
                borderRadius: st.size / 2,
                opacity: st.opacity,
              },
            ]}
          />
        )
      )}
      {/* atmospheric ground-glow: transparent up top → deep navy at the bottom */}
      <LinearGradient
        colors={["rgba(3,8,22,0)", "rgba(3,8,22,0.4)"] as const}
        locations={[0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  star: { position: "absolute", backgroundColor: "#EAF0FF" },
});
