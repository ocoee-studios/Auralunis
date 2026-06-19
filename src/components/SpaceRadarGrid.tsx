// SpaceRadarGrid.tsx
// 2D SVG radar scope for the Orbital Alignment screen.
// The blip represents the target; the reticle at center represents where
// the device is pointing. As the user aligns the phone the blip drifts to center.
//
// Uses react-native-reanimated shared values (not Animated.Value) so the blip
// glide runs entirely on the UI thread — no JS bridge stutter.

import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ChronauraColors } from "@/theme/tokens";

interface SpaceRadarGridProps {
  azimuthDiff: number;
  elevationDiff: number;
  alignmentScore: number;
  isLocked: boolean;
}

const RADAR_SIZE = 260;
const CENTER = RADAR_SIZE / 2;
const MAX_VISIBLE_ANGLE = 25; // degrees off-center before blip hits the edge
const BLIP_SIZE = 20;

const SPRING_CONFIG = { damping: 14, stiffness: 160, mass: 1 };

export function SpaceRadarGrid({
  azimuthDiff,
  elevationDiff,
  alignmentScore,
  isLocked,
}: SpaceRadarGridProps) {
  const blipX = useSharedValue(CENTER - BLIP_SIZE / 2);
  const blipY = useSharedValue(CENTER - BLIP_SIZE / 2);

  useEffect(() => {
    const scaleFactor = (RADAR_SIZE / 2) / MAX_VISIBLE_ANGLE;

    let rawX = CENTER + azimuthDiff * scaleFactor;
    // SVG Y goes downward; elevation up = negative Y
    let rawY = CENTER - elevationDiff * scaleFactor;

    // Clamp to the outer ring boundary
    const dx = rawX - CENTER;
    const dy = rawY - CENTER;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxR = CENTER - BLIP_SIZE;
    if (dist > maxR) {
      rawX = CENTER + (dx / dist) * maxR;
      rawY = CENTER + (dy / dist) * maxR;
    }

    // Offset by half blip size so the blip is centered on its coordinate
    blipX.value = withSpring(rawX - BLIP_SIZE / 2, SPRING_CONFIG);
    blipY.value = withSpring(rawY - BLIP_SIZE / 2, SPRING_CONFIG);
  }, [azimuthDiff, elevationDiff]);

  const blipStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: blipX.value },
      { translateY: blipY.value },
    ],
  }));

  const lockColor = isLocked ? ChronauraColors.green : ChronauraColors.gold;
  const haloOpacity = alignmentScore / 100;

  return (
    <View style={styles.container}>
      {/* Static SVG grid — never re-renders on blip movement */}
      <Svg
        width={RADAR_SIZE}
        height={RADAR_SIZE}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={lockColor} stopOpacity="0.22" />
            <Stop offset="100%" stopColor={lockColor} stopOpacity="0.01" />
          </RadialGradient>
        </Defs>

        {/* Glow fill */}
        <Circle cx={CENTER} cy={CENTER} r={CENTER - 2} fill="url(#radarGlow)" />

        {/* Outer ring */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={CENTER - 2}
          stroke={ChronauraColors.borderGold}
          strokeWidth={1.5}
          fill="none"
        />

        {/* Mid ring */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={CENTER * 0.62}
          stroke={ChronauraColors.borderSubtle}
          strokeWidth={1}
          strokeDasharray="4 4"
          fill="none"
        />

        {/* Inner ring */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={CENTER * 0.3}
          stroke={ChronauraColors.borderSubtle}
          strokeWidth={1}
          strokeDasharray="3 5"
          fill="none"
        />

        {/* Crosshair lines */}
        <Line
          x1={16}
          y1={CENTER}
          x2={RADAR_SIZE - 16}
          y2={CENTER}
          stroke={ChronauraColors.borderSubtle}
          strokeWidth={1}
        />
        <Line
          x1={CENTER}
          y1={16}
          x2={CENTER}
          y2={RADAR_SIZE - 16}
          stroke={ChronauraColors.borderSubtle}
          strokeWidth={1}
        />

        {/* Center reticle (device pointing) */}
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={10}
          stroke={lockColor}
          strokeWidth={2}
          fill="none"
        />
        <Circle cx={CENTER} cy={CENTER} r={2.5} fill={lockColor} />
      </Svg>

      {/* Animated blip — Reanimated runs this on UI thread */}
      <Animated.View style={[styles.blip, blipStyle, { backgroundColor: lockColor }]}>
        {/* Halo ring that brightens as score increases */}
        <Animated.View
          style={[
            styles.halo,
            {
              borderColor: lockColor,
              opacity: haloOpacity,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    alignSelf: "center",
    marginVertical: 20,
  },
  blip: {
    position: "absolute",
    width: BLIP_SIZE,
    height: BLIP_SIZE,
    borderRadius: BLIP_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
  },
  halo: {
    position: "absolute",
    width: BLIP_SIZE + 14,
    height: BLIP_SIZE + 14,
    borderRadius: (BLIP_SIZE + 14) / 2,
    borderWidth: 1.5,
  },
});
