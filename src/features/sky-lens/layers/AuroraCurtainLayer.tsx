// src/features/sky-lens/layers/AuroraCurtainLayer.tsx
// Atmospheric aurora curtains — soft, low-opacity light that sits BEHIND the sky
// objects (stars, planets, labels, cards), never over them. Crash-safe: an
// Animated.View opacity/transform via useAnimatedStyle over a STATIC <Svg> (no
// animated SVG props). pointerEvents="none" so it never blocks taps.

import React, { memo, useEffect } from "react";
import { StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
  G,
} from "react-native-svg";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface AuroraCurtainLayerProps {
  width: number;
  height: number;
  visible?: boolean;
  nightVision?: boolean;
  intensity?: number; // 0-1
  variant?: "classic" | "purple" | "solarStorm" | "cosmic";
}

export const AuroraCurtainLayer = memo(function AuroraCurtainLayer({
  width,
  height,
  visible = true,
  nightVision = false,
  intensity = 0.75,
  variant = "cosmic",
}: AuroraCurtainLayerProps) {
  const drift = useSharedValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) { cancelAnimation(drift); drift.value = 0; return; } // static neutral curtain frame
    drift.value = withRepeat(
      withTiming(1, {
        duration: 18000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true
    );
    return () => cancelAnimation(drift);
  }, [drift, reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visible ? 0.72 + drift.value * 0.18 : 0,
    transform: [
      { translateX: (drift.value - 0.5) * 18 },
      { translateY: (drift.value - 0.5) * -8 },
      { scale: 1 + drift.value * 0.012 },
    ],
  }));

  if (!visible) return null;

  const green = nightVision ? "#8A1F22" : "#6DFFC4";
  const pink = nightVision ? "#B3343A" : "#FF6EDB";
  const violet = nightVision ? "#651921" : "#8D7BFF";
  const blue = nightVision ? "#34141A" : "#5BCBFF";
  const gold = nightVision ? "#B33A32" : "#F7C873";

  const opacity = intensity;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, animatedStyle]}
    >
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="auroraVerticalFade" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={variant === "classic" ? green : violet} stopOpacity={0.04 * opacity} />
            <Stop offset="22%" stopColor={variant === "classic" ? green : pink} stopOpacity={0.22 * opacity} />
            <Stop offset="54%" stopColor={variant === "solarStorm" ? gold : green} stopOpacity={0.16 * opacity} />
            <Stop offset="82%" stopColor={blue} stopOpacity={0.055 * opacity} />
            <Stop offset="100%" stopColor="#030816" stopOpacity={0} />
          </LinearGradient>

          <RadialGradient id="auroraBloomLeft" cx="18%" cy="36%" r="52%">
            <Stop offset="0%" stopColor={pink} stopOpacity={0.18 * opacity} />
            <Stop offset="40%" stopColor={green} stopOpacity={0.09 * opacity} />
            <Stop offset="100%" stopColor="#030816" stopOpacity={0} />
          </RadialGradient>

          <RadialGradient id="auroraBloomRight" cx="82%" cy="34%" r="58%">
            <Stop offset="0%" stopColor={green} stopOpacity={0.17 * opacity} />
            <Stop offset="46%" stopColor={violet} stopOpacity={0.08 * opacity} />
            <Stop offset="100%" stopColor="#030816" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Base glow */}
        <Rect width={width} height={height} fill="url(#auroraVerticalFade)" />
        <Rect width={width} height={height} fill="url(#auroraBloomLeft)" />
        <Rect width={width} height={height} fill="url(#auroraBloomRight)" />

        {/* Soft vertical curtains */}
        <G opacity={0.72 * opacity}>
          <Path
            d={`
              M ${width * 0.02} ${height * 0.04}
              C ${width * 0.14} ${height * 0.16},
                ${width * 0.18} ${height * 0.32},
                ${width * 0.11} ${height * 0.62}
              C ${width * 0.08} ${height * 0.75},
                ${width * 0.12} ${height * 0.88},
                ${width * 0.18} ${height}
              L ${width * 0.28} ${height}
              C ${width * 0.20} ${height * 0.78},
                ${width * 0.30} ${height * 0.54},
                ${width * 0.24} ${height * 0.34}
              C ${width * 0.20} ${height * 0.18},
                ${width * 0.10} ${height * 0.10},
                ${width * 0.02} ${height * 0.04}
              Z
            `}
            fill={pink}
            opacity={0.18}
          />

          <Path
            d={`
              M ${width * 0.22} 0
              C ${width * 0.36} ${height * 0.18},
                ${width * 0.42} ${height * 0.32},
                ${width * 0.36} ${height * 0.58}
              C ${width * 0.31} ${height * 0.78},
                ${width * 0.34} ${height * 0.92},
                ${width * 0.42} ${height}
              L ${width * 0.56} ${height}
              C ${width * 0.48} ${height * 0.78},
                ${width * 0.56} ${height * 0.55},
                ${width * 0.50} ${height * 0.34}
              C ${width * 0.45} ${height * 0.18},
                ${width * 0.34} ${height * 0.06},
                ${width * 0.22} 0
              Z
            `}
            fill={green}
            opacity={0.20}
          />

          <Path
            d={`
              M ${width * 0.48} ${height * 0.02}
              C ${width * 0.68} ${height * 0.12},
                ${width * 0.78} ${height * 0.28},
                ${width * 0.70} ${height * 0.52}
              C ${width * 0.62} ${height * 0.76},
                ${width * 0.70} ${height * 0.92},
                ${width * 0.78} ${height}
              L ${width * 0.92} ${height}
              C ${width * 0.82} ${height * 0.78},
                ${width * 0.94} ${height * 0.48},
                ${width * 0.86} ${height * 0.28}
              C ${width * 0.78} ${height * 0.10},
                ${width * 0.62} ${height * 0.04},
                ${width * 0.48} ${height * 0.02}
              Z
            `}
            fill={variant === "solarStorm" ? gold : violet}
            opacity={0.17}
          />
        </G>

        {/* Thin light ribbons */}
        <G opacity={0.42 * opacity}>
          <Path
            d={`M ${width * 0.05} ${height * 0.20}
                C ${width * 0.24} ${height * 0.08},
                  ${width * 0.40} ${height * 0.25},
                  ${width * 0.58} ${height * 0.14}
                C ${width * 0.76} ${height * 0.04},
                  ${width * 0.88} ${height * 0.16},
                  ${width * 0.98} ${height * 0.08}`}
            stroke={green}
            strokeWidth={18}
            strokeOpacity={0.16}
            strokeLinecap="round"
            fill="none"
          />

          <Path
            d={`M ${width * 0.00} ${height * 0.30}
                C ${width * 0.22} ${height * 0.20},
                  ${width * 0.44} ${height * 0.42},
                  ${width * 0.66} ${height * 0.28}
                C ${width * 0.78} ${height * 0.20},
                  ${width * 0.90} ${height * 0.28},
                  ${width} ${height * 0.18}`}
            stroke={pink}
            strokeWidth={24}
            strokeOpacity={0.12}
            strokeLinecap="round"
            fill="none"
          />

          <Path
            d={`M ${width * 0.12} ${height * 0.42}
                C ${width * 0.30} ${height * 0.26},
                  ${width * 0.52} ${height * 0.50},
                  ${width * 0.72} ${height * 0.36}
                C ${width * 0.86} ${height * 0.28},
                  ${width * 0.94} ${height * 0.38},
                  ${width} ${height * 0.30}`}
            stroke={blue}
            strokeWidth={14}
            strokeOpacity={0.13}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
    </Animated.View>
  );
});
