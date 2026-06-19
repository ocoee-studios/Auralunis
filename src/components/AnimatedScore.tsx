// Tonight Score count-up animation: 0 → final score over ~1.2 seconds.
// Uses Reanimated for smooth 60fps animation.
import React, { useEffect } from "react";
import { StyleSheet, TextInput } from "react-native";
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from "react-native-reanimated";
import { ChronauraColors } from "@/theme/tokens";

// Animated number counter: drive a (read-only) TextInput's `text` via animatedProps.
// This is Reanimated's supported pattern for animating displayed text — a plain
// <Text> does not accept an animated `text` prop, so the count-up never rendered.
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type Props = { score: number; size?: number };

export function AnimatedScore({ score, size = 26 }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(score, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${Math.round(progress.value)}`,
  } as any));

  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      editable={false}
      style={[s.score, { fontSize: size, padding: 0 }]}
      defaultValue="0"
    />
  );
}

const s = StyleSheet.create({
  score: { fontWeight: "900", color: ChronauraColors.gold2, textAlign: "center" }
});
