// Tonight Score count-up animation: 0 → final score over ~1.2 seconds.
// Uses Reanimated for smooth 60fps animation.
import React, { useEffect } from "react";
import { StyleSheet, TextInput } from "react-native";
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from "react-native-reanimated";
import { AuraLunisColors } from "@/theme/tokens";

// A non-editable TextInput is the standard Reanimated pattern for an animated
// numeric counter: unlike <Text>, its `text` prop can be driven from the UI
// thread via animatedProps, so the count-up runs at 60fps without re-renders.
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type Props = { score: number; size?: number };

export function AnimatedScore({ score, size = 26 }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(score, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, [score]);

  // `text` is a real (UI-thread-settable) TextInput prop but isn't in RN's
  // public TextInputProps types, so the return is cast — the standard
  // Reanimated animated-counter idiom.
  const animatedProps = useAnimatedProps(
    () => ({ text: `${Math.round(progress.value)}` } as any),
  );

  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      editable={false}
      style={[s.score, { fontSize: size }]}
      defaultValue="0"
    />
  );
}

const s = StyleSheet.create({
  score: { fontWeight: "900", color: AuraLunisColors.gold2, textAlign: "center" }
});
