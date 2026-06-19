// SpaceRadarGrid.tsx
// 2D SVG radar scope for the Orbital Alignment / Atmosphere Explorer screens.
// Renders a fleet of colored blips — one per satellite — each spring-animated
// on the UI thread via Reanimated shared values.
// The active target (closest to device pointing) gets a larger blip + halo.
// Tapping any blip fires onBlipPress with the satellite's id.

import React, { useEffect, useRef } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import Svg, { Circle, Line, Defs, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ChronauraColors } from "@/theme/tokens";

export interface RadarBlip {
  id: string;
  azimuthDiff: number;
  elevationDiff: number;
  color: string;
  isActive: boolean;
  label: string;
}

interface SpaceRadarGridProps {
  blips: RadarBlip[];
  alignmentScore: number;
  isLocked: boolean;
  onBlipPress?: (id: string) => void;
}

const RADAR_SIZE = 260;
const CENTER = RADAR_SIZE / 2;
const MAX_VISIBLE_ANGLE = 25;
const ACTIVE_BLIP_SIZE = 20;
const PASSIVE_BLIP_SIZE = 12;

const SPRING_CONFIG = { damping: 14, stiffness: 160, mass: 1 };

// Single animated blip — one instance per satellite
function AnimatedBlip({
  blip,
  onPress,
}: {
  blip: RadarBlip;
  onPress: () => void;
}) {
  const blipX = useSharedValue(CENTER);
  const blipY = useSharedValue(CENTER);
  const size = blip.isActive ? ACTIVE_BLIP_SIZE : PASSIVE_BLIP_SIZE;

  useEffect(() => {
    const scaleFactor = (RADAR_SIZE / 2) / MAX_VISIBLE_ANGLE;
    let rawX = CENTER + blip.azimuthDiff * scaleFactor;
    let rawY = CENTER - blip.elevationDiff * scaleFactor;

    const dx = rawX - CENTER;
    const dy = rawY - CENTER;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxR = CENTER - ACTIVE_BLIP_SIZE;
    if (dist > maxR) {
      rawX = CENTER + (dx / dist) * maxR;
      rawY = CENTER + (dy / dist) * maxR;
    }

    blipX.value = withSpring(rawX - size / 2, SPRING_CONFIG);
    blipY.value = withSpring(rawY - size / 2, SPRING_CONFIG);
  }, [blip.azimuthDiff, blip.elevationDiff]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: blipX.value },
      { translateY: blipY.value },
    ],
  }));

  return (
    <Animated.View style={[styles.blipBase, animStyle]}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.blipTouch,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: blip.color,
            opacity: blip.isActive ? 1 : 0.65,
          },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {blip.isActive && (
          <View
            style={[
              styles.halo,
              {
                borderColor: blip.color,
                width: size + 14,
                height: size + 14,
                borderRadius: (size + 14) / 2,
                top: -7,
                left: -7,
              },
            ]}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export function SpaceRadarGrid({
  blips,
  alignmentScore,
  isLocked,
  onBlipPress,
}: SpaceRadarGridProps) {
  const activeBlip = blips.find((b) => b.isActive);
  const lockColor = isLocked
    ? ChronauraColors.green
    : activeBlip?.color ?? ChronauraColors.gold;

  return (
    <View style={styles.container}>
      {/* Static SVG grid */}
      <Svg
        width={RADAR_SIZE}
        height={RADAR_SIZE}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={lockColor} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={lockColor} stopOpacity="0.01" />
          </RadialGradient>
        </Defs>

        <Circle cx={CENTER} cy={CENTER} r={CENTER - 2} fill="url(#radarGlow)" />
        <Circle cx={CENTER} cy={CENTER} r={CENTER - 2} stroke={ChronauraColors.borderGold} strokeWidth={1.5} fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={CENTER * 0.62} stroke={ChronauraColors.borderSubtle} strokeWidth={1} strokeDasharray="4 4" fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={CENTER * 0.3} stroke={ChronauraColors.borderSubtle} strokeWidth={1} strokeDasharray="3 5" fill="none" />

        <Line x1={16} y1={CENTER} x2={RADAR_SIZE - 16} y2={CENTER} stroke={ChronauraColors.borderSubtle} strokeWidth={1} />
        <Line x1={CENTER} y1={16} x2={CENTER} y2={RADAR_SIZE - 16} stroke={ChronauraColors.borderSubtle} strokeWidth={1} />

        {/* Center reticle */}
        <Circle cx={CENTER} cy={CENTER} r={10} stroke={lockColor} strokeWidth={2} fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={2.5} fill={lockColor} />
      </Svg>

      {/* Animated blips — one per satellite */}
      {blips.map((blip) => (
        <AnimatedBlip
          key={blip.id}
          blip={blip}
          onPress={() => onBlipPress?.(blip.id)}
        />
      ))}
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
  blipBase: {
    position: "absolute",
  },
  blipTouch: {
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 5,
  },
  halo: {
    position: "absolute",
    borderWidth: 1.5,
    opacity: 0.4,
  },
});
