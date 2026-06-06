// Subtle animated floating particles for glass panels. Uses Reanimated for
// smooth 60fps animation. Render as a child of any container.
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";

type Props = { count?: number; color?: string; opacity?: number };

function Particle({ delay, color, baseOpacity }: { delay: number; color: string; baseOpacity: number }) {
  const y = useSharedValue(0);
  const x = useSharedValue(0);
  const o = useSharedValue(0);

  useEffect(() => {
    const dur = 4000 + Math.random() * 6000;
    setTimeout(() => {
      y.value = withRepeat(withTiming(-60 - Math.random() * 40, { duration: dur, easing: Easing.linear }), -1, false);
      x.value = withRepeat(withTiming((Math.random() - 0.5) * 30, { duration: dur * 0.7, easing: Easing.inOut(Easing.sin) }), -1, true);
      o.value = withRepeat(withTiming(baseOpacity, { duration: dur * 0.4 }), -1, true);
    }, delay);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { translateX: x.value }],
    opacity: o.value
  }));

  const left = `${10 + Math.random() * 80}%` as const;
  const size = 1.5 + Math.random() * 2;

  return (
    <Animated.View
      style={[
        { position: "absolute", bottom: 0, left, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style
      ]}
    />
  );
}

export function StarDust({ count = 8, color = "#C7A66A", opacity = 0.35 }: Props) {
  return (
    <View style={{ position: "absolute" as const, left: 0, right: 0, top: 0, bottom: 0 }} pointerEvents="none">
      {Array.from({ length: count }, (_, i) => (
        <Particle key={i} delay={i * 400} color={color} baseOpacity={opacity} />
      ))}
    </View>
  );
}
