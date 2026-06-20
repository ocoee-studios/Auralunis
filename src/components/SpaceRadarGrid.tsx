// SpaceRadarGrid.tsx
// 2D SVG radar scope with:
//   - Multi-blip fleet rendering (Atmosphere Explorer / Debris / Train)
//   - Horizon Scope: curved SVG horizon line driven by device pitch
//   - Ground/sky shading below/above the horizon
//   - Debris flashing (crimson blips pulse opacity)

import React, { useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import Svg, { Circle, Line, Defs, RadialGradient, Stop, Path, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { AuraLunisColors } from "@/theme/tokens";

export interface RadarBlip {
  id: string;
  azimuthDiff: number;
  elevationDiff: number;
  color: string;
  isActive: boolean;
  label: string;
  /** If true, blip flashes crimson (debris mode) */
  isDebris?: boolean;
  /** If true, blip pulses amber (reentry alert mode) */
  isDecayAlert?: boolean;
  /** 0..1 opacity for train nodes */
  opacity?: number;
}

interface SpaceRadarGridProps {
  blips: RadarBlip[];
  alignmentScore: number;
  isLocked: boolean;
  onBlipPress?: (id: string) => void;
  /** Device pitch in degrees — drives the horizon scope line */
  devicePitch?: number;
  /** Show the horizon scope line */
  showHorizon?: boolean;
}

const RADAR_SIZE = 260;
const CENTER = RADAR_SIZE / 2;
const MAX_VISIBLE_ANGLE = 25;
const ACTIVE_BLIP_SIZE = 20;
const PASSIVE_BLIP_SIZE = 12;
const SPRING_CONFIG = { damping: 14, stiffness: 160, mass: 1 };

// ── Horizon line Y position from pitch ──────────────────────────────────────
// pitch=0°  → horizon at center (y=CENTER)
// pitch=90° → horizon at bottom (y=RADAR_SIZE, pointing straight up)
// pitch=-90 → horizon at top   (y=0, pointing straight down)
function horizonY(pitch: number): number {
  const clamped = Math.max(-90, Math.min(90, pitch));
  // Map -90..90 to RADAR_SIZE..0
  return CENTER - (clamped / 90) * CENTER;
}

// ── Blip component ───────────────────────────────────────────────────────────
function AnimatedBlip({ blip, onPress }: { blip: RadarBlip; onPress: () => void }) {
  const blipX = useSharedValue(CENTER);
  const blipY = useSharedValue(CENTER);
  const debrisOpacity = useSharedValue(1);
  const size = blip.isActive ? ACTIVE_BLIP_SIZE : PASSIVE_BLIP_SIZE;

  useEffect(() => {
    const scaleFactor = (RADAR_SIZE / 2) / MAX_VISIBLE_ANGLE;
    let rawX = CENTER + blip.azimuthDiff * scaleFactor;
    let rawY = CENTER - blip.elevationDiff * scaleFactor;
    const dx = rawX - CENTER, dy = rawY - CENTER;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxR = CENTER - ACTIVE_BLIP_SIZE;
    if (dist > maxR) { rawX = CENTER + (dx / dist) * maxR; rawY = CENTER + (dy / dist) * maxR; }
    blipX.value = withSpring(rawX - size / 2, SPRING_CONFIG);
    blipY.value = withSpring(rawY - size / 2, SPRING_CONFIG);
  }, [blip.azimuthDiff, blip.elevationDiff]);

  // Debris flash
  useEffect(() => {
    if (blip.isDecayAlert) {
      debrisOpacity.value = withRepeat(
        withSequence(withTiming(0.15, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1, false
      );
    } else if (blip.isDebris) {
      debrisOpacity.value = withRepeat(
        withSequence(withTiming(0.2, { duration: 300 }), withTiming(1, { duration: 300 })),
        -1, false
      );
    } else {
      debrisOpacity.value = 1;
    }
  }, [blip.isDebris]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: blipX.value }, { translateY: blipY.value }],
    opacity: (blip.isDecayAlert || blip.isDebris) ? debrisOpacity.value : (blip.opacity ?? (blip.isActive ? 1 : 0.65)),
  }));

  return (
    <Animated.View style={[styles.blipBase, animStyle]}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.blipTouch, {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: blip.isDecayAlert ? "#FF9500" : blip.isDebris ? "#FF3B30" : blip.color,
        }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {blip.isActive && (
          <View style={[styles.halo, {
            borderColor: blip.isDecayAlert ? "#FF9500" : blip.isDebris ? "#FF3B30" : blip.color,
            width: size + 14, height: size + 14, borderRadius: (size + 14) / 2, top: -7, left: -7,
          }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SpaceRadarGrid({ blips, alignmentScore, isLocked, onBlipPress, devicePitch = 0, showHorizon = false }: SpaceRadarGridProps) {
  const activeBlip = blips.find(b => b.isActive);
  const lockColor = isLocked ? AuraLunisColors.green : activeBlip?.color ?? AuraLunisColors.gold;

  const hy = showHorizon ? horizonY(devicePitch) : -1;
  const groundHeight = showHorizon ? Math.max(0, RADAR_SIZE - hy) : 0;

  // Horizon curve path: gentle arc across the radar width
  const horizonPath = showHorizon && hy >= 0 && hy <= RADAR_SIZE
    ? `M 4 ${hy} Q ${CENTER} ${hy + 8} ${RADAR_SIZE - 4} ${hy}`
    : null;

  return (
    <View style={styles.container}>
      <Svg width={RADAR_SIZE} height={RADAR_SIZE} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={lockColor} stopOpacity="0.18" />
            <Stop offset="100%" stopColor={lockColor} stopOpacity="0.01" />
          </RadialGradient>
        </Defs>

        {/* Sky/ground shading when horizon is visible */}
        {showHorizon && hy < RADAR_SIZE && hy > 0 && (
          <Rect
            x={0} y={Math.max(hy, 0)}
            width={RADAR_SIZE} height={groundHeight}
            fill="rgba(30,20,10,0.35)"
            rx={0}
          />
        )}

        <Circle cx={CENTER} cy={CENTER} r={CENTER - 2} fill="url(#radarGlow)" />
        <Circle cx={CENTER} cy={CENTER} r={CENTER - 2} stroke={AuraLunisColors.borderGold} strokeWidth={1.5} fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={CENTER * 0.62} stroke={AuraLunisColors.borderSubtle} strokeWidth={1} strokeDasharray="4 4" fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={CENTER * 0.3} stroke={AuraLunisColors.borderSubtle} strokeWidth={1} strokeDasharray="3 5" fill="none" />

        <Line x1={16} y1={CENTER} x2={RADAR_SIZE - 16} y2={CENTER} stroke={AuraLunisColors.borderSubtle} strokeWidth={1} />
        <Line x1={CENTER} y1={16} x2={CENTER} y2={RADAR_SIZE - 16} stroke={AuraLunisColors.borderSubtle} strokeWidth={1} />

        {/* Horizon curve */}
        {horizonPath && (
          <Path
            d={horizonPath}
            stroke="#EF9F27"
            strokeWidth={1.5}
            fill="none"
            opacity={0.7}
            strokeDasharray="6 3"
          />
        )}

        {/* Center reticle */}
        <Circle cx={CENTER} cy={CENTER} r={10} stroke={lockColor} strokeWidth={2} fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={2.5} fill={lockColor} />
      </Svg>

      {blips.map(blip => (
        <AnimatedBlip key={blip.id} blip={blip} onPress={() => onBlipPress?.(blip.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: RADAR_SIZE, height: RADAR_SIZE, alignSelf: "center", marginVertical: 20 },
  blipBase: { position: "absolute" },
  blipTouch: { alignItems: "center", justifyContent: "center", shadowOpacity: 0.7, shadowRadius: 8, elevation: 5 },
  halo: { position: "absolute", borderWidth: 1.5, opacity: 0.4 },
});
