// Tonight Score count-up animation: 0 → final score over ~1.2 seconds.
// Uses Reanimated for smooth 60fps animation.
import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from "react-native-reanimated";
import { ChronauraColors } from "@/theme/tokens";

const AnimatedText = Animated.createAnimatedComponent(Text);

type Props = { score: number; size?: number };

export function AnimatedScore({ score, size = 26 }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(score, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${Math.round(progress.value)}`
  }));

  return (
    <AnimatedText
      animatedProps={animatedProps}
      style={[s.score, { fontSize: size }]}
      defaultValue="0"
    />
  );
}

const s = StyleSheet.create({
  score: { fontWeight: "900", color: ChronauraColors.gold2, textAlign: "center" }
});
