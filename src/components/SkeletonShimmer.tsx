// Shimmer loading placeholder. Shows a gold shimmer animation
// while data loads. Use instead of empty white space.
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";

type Props = { width?: number | string; height?: number; borderRadius?: number };

export function SkeletonShimmer({ width = "100%", height = 16, borderRadius = 8 }: Props) {
  const shimmer = useSharedValue(0.3);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: shimmer.value
  }));

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius, backgroundColor: "rgba(212,175,55,0.12)" },
        style
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={s.card}>
      <SkeletonShimmer width="40%" height={10} />
      <SkeletonShimmer width="70%" height={18} />
      <SkeletonShimmer width="90%" height={12} />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(18,26,44,0.5)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
    marginBottom: 12,
    gap: 10
  }
});
