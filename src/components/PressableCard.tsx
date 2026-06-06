// A card that scales down to 0.97 on press with spring animation.
// Wraps any content to give premium tactile feedback.
import React, { type ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { tapLight } from "@/services/HapticService";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  style?: object;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableCard({ children, onPress, style }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <AnimatedPressable
      style={[s.card, style, animStyle]}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      onPress={() => { tapLight(); onPress?.(); }}
    >
      {children}
    </AnimatedPressable>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.15)",
    backgroundColor: "#121A2C",
    padding: 14,
    marginBottom: 10
  }
});
