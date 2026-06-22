// SpaceRadarGrid.tsx
// 2D SVG radar scope, restyled to feel like a window into space (not ATC):
//   - Sky-gradient disk + faint starfield background
//   - Whisper-faint dashed gold range rings
//   - Rotating gold sweep beam (1 rev / 4s) with a fading afterglow trail
//   - Blips light up as the beam passes, each with a soft color glow
//   - Active/locked target pulses
//   - Horizon Scope: curved SVG horizon line driven by device pitch
//
// All animation uses the crash-safe Reanimated pattern (Animated.View transform/
// opacity via useAnimatedStyle), never animated react-native-svg props.

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
  Easing,
  type SharedValue,
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
const SWEEP_MS = 4000;
const GOLD = "#D9A84E";

// ── Faint background starfield (deterministic, uniform-in-disk) ───────────────
const RADAR_STARS = (() => {
  let s = 99371;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const R = CENTER - 6;
  const out: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < 44; i++) {
    const ang = rnd() * Math.PI * 2;
    const rad = Math.sqrt(rnd()) * R; // sqrt → uniform area density
    out.push({
      x: CENTER + Math.cos(ang) * rad,
      y: CENTER + Math.sin(ang) * rad,
      r: 0.4 + rnd() * 0.9,
      o: 0.12 + rnd() * 0.38,
    });
  }
  return out;
})();

// ── Sweep wedge geometry (points "up", 0° at 12 o'clock, clockwise) ───────────
function sectorPath(r: number, a0: number, a1: number): string {
  const pt = (a: number) => {
    const rad = (a * Math.PI) / 180;
    return [CENTER + r * Math.sin(rad), CENTER - r * Math.cos(rad)];
  };
  const [x0, y0] = pt(a0);
  const [x1, y1] = pt(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweepFlag = a1 > a0 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} ${sweepFlag} ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

// Trail wedges fade out counterclockwise behind the leading edge (the just-swept
// arc). One bright leading wedge + a graduated afterglow.
const SWEEP_TRAIL = (() => {
  const R = CENTER - 3;
  const segs: { d: string; opacity: number }[] = [];
  const N = 9;
  const span = 54; // total trail degrees
  for (let i = 0; i < N; i++) {
    const a1 = -(i * span) / N;
    const a0 = -((i + 1) * span) / N;
    segs.push({ d: sectorPath(R, a0, a1), opacity: 0.16 * (1 - i / N) });
  }
  return segs;
})();
const SWEEP_LEAD = sectorPath(CENTER - 3, 0, 4); // crisp leading edge

// ── Rotating sweep beam overlay ───────────────────────────────────────────────
function RadarSweep({ sweep }: { sweep: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sweep.value * 360}deg` }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.sweep, style]}>
      <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
        <Defs>
          <RadialGradient id="sweepLead" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={GOLD} stopOpacity="0" />
            <Stop offset="70%" stopColor={GOLD} stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#FFE9B0" stopOpacity="0.55" />
          </RadialGradient>
        </Defs>
        {SWEEP_TRAIL.map((seg, i) => (
          <Path key={i} d={seg.d} fill={GOLD} opacity={seg.opacity} />
        ))}
        <Path d={SWEEP_LEAD} fill="url(#sweepLead)" />
      </Svg>
    </Animated.View>
  );
}

// ── Horizon line Y position from pitch ──────────────────────────────────────
function horizonY(pitch: number): number {
  const clamped = Math.max(-90, Math.min(90, pitch));
  return CENTER - (clamped / 90) * CENTER;
}

// ── Blip component ───────────────────────────────────────────────────────────
function AnimatedBlip({
  blip,
  sweep,
  onPress,
}: {
  blip: RadarBlip;
  sweep: SharedValue<number>;
  onPress: () => void;
}) {
  const blipX = useSharedValue(CENTER);
  const blipY = useSharedValue(CENTER);
  const debrisOpacity = useSharedValue(1);
  const pulse = useSharedValue(1);
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

  // Active/locked target pulses
  useEffect(() => {
    if (blip.isActive) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.25, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) })
        ),
        -1, false
      );
    } else {
      pulse.value = 1;
    }
  }, [blip.isActive]);

  // Beam pass-over glow: brightens as the sweep crosses this blip's bearing, then
  // fades (one-sided trailing window matching the afterglow).
  const sweepGlow = useAnimatedStyle(() => {
    const cx = blipX.value + size / 2 - CENTER;
    const cy = blipY.value + size / 2 - CENTER;
    let ang = (Math.atan2(cx, -cy) * 180) / Math.PI; // 0° = up, clockwise
    if (ang < 0) ang += 360;
    const beam = (sweep.value * 360) % 360;
    let delta = beam - ang;
    if (delta < 0) delta += 360;
    const glow = delta < 50 ? 1 - delta / 50 : 0;
    return { opacity: 0.35 + 0.65 * glow };
  });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: blipX.value }, { translateY: blipY.value }],
    opacity: (blip.isDecayAlert || blip.isDebris) ? debrisOpacity.value : (blip.opacity ?? (blip.isActive ? 1 : 0.7)),
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.5 / Math.max(1, pulse.value),
  }));

  const blipColor = blip.isDecayAlert ? "#FF9500" : blip.isDebris ? "#FF3B30" : blip.color;

  return (
    <Animated.View style={[styles.blipBase, animStyle]}>
      {/* soft color glow that brightens under the sweep */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: size + 18, height: size + 18, borderRadius: (size + 18) / 2,
            top: -9, left: -9, backgroundColor: blipColor,
          },
          sweepGlow,
        ]}
      />
      <TouchableOpacity
        onPress={onPress}
        style={[styles.blipTouch, {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: blipColor, shadowColor: blipColor,
        }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {blip.isActive && (
          <Animated.View style={[styles.halo, {
            borderColor: blipColor,
            width: size + 14, height: size + 14, borderRadius: (size + 14) / 2, top: -7, left: -7,
          }, haloStyle]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SpaceRadarGrid({ blips, alignmentScore, isLocked, onBlipPress, devicePitch = 0, showHorizon = false }: SpaceRadarGridProps) {
  const activeBlip = blips.find(b => b.isActive);
  const lockColor = isLocked ? AuraLunisColors.green : activeBlip?.color ?? AuraLunisColors.gold;

  const sweep = useSharedValue(0);
  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: SWEEP_MS, easing: Easing.linear }), -1, false);
  }, []);

  const hy = showHorizon ? horizonY(devicePitch) : -1;
  const groundHeight = showHorizon ? Math.max(0, RADAR_SIZE - hy) : 0;

  const horizonPath = showHorizon && hy >= 0 && hy <= RADAR_SIZE
    ? `M 4 ${hy} Q ${CENTER} ${hy + 8} ${RADAR_SIZE - 4} ${hy}`
    : null;

  const ringStroke = "rgba(217,168,78,0.06)";

  return (
    <View style={styles.container}>
      <Svg width={RADAR_SIZE} height={RADAR_SIZE} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* sky-gradient disk: cosmic black core → deep navy edge */}
          <RadialGradient id="radarSky" cx="50%" cy="42%" r="62%">
            <Stop offset="0%" stopColor="#030816" stopOpacity="1" />
            <Stop offset="100%" stopColor="#0A1535" stopOpacity="1" />
          </RadialGradient>
          <RadialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={lockColor} stopOpacity="0.14" />
            <Stop offset="100%" stopColor={lockColor} stopOpacity="0.01" />
          </RadialGradient>
        </Defs>

        {/* window into space */}
        <Circle cx={CENTER} cy={CENTER} r={CENTER - 2} fill="url(#radarSky)" />
        {RADAR_STARS.map((s, i) => (
          <Circle key={`s${i}`} cx={s.x} cy={s.y} r={s.r} fill="#EAF0FF" opacity={s.o} />
        ))}

        {/* sky/ground shading when horizon is visible */}
        {showHorizon && hy < RADAR_SIZE && hy > 0 && (
          <Rect x={0} y={Math.max(hy, 0)} width={RADAR_SIZE} height={groundHeight} fill="rgba(30,20,10,0.35)" rx={0} />
        )}

        <Circle cx={CENTER} cy={CENTER} r={CENTER - 2} fill="url(#radarGlow)" />

        {/* whisper-faint dashed range rings */}
        <Circle cx={CENTER} cy={CENTER} r={CENTER - 2} stroke={ringStroke} strokeWidth={1} strokeDasharray="3 7" fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={CENTER * 0.62} stroke={ringStroke} strokeWidth={1} strokeDasharray="3 7" fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={CENTER * 0.3} stroke={ringStroke} strokeWidth={1} strokeDasharray="3 7" fill="none" />

        <Line x1={16} y1={CENTER} x2={RADAR_SIZE - 16} y2={CENTER} stroke={ringStroke} strokeWidth={1} strokeDasharray="3 7" />
        <Line x1={CENTER} y1={16} x2={CENTER} y2={RADAR_SIZE - 16} stroke={ringStroke} strokeWidth={1} strokeDasharray="3 7" />

        {/* Horizon curve */}
        {horizonPath && (
          <Path d={horizonPath} stroke="#EF9F27" strokeWidth={1.5} fill="none" opacity={0.7} strokeDasharray="6 3" />
        )}

        {/* Center reticle */}
        <Circle cx={CENTER} cy={CENTER} r={10} stroke={lockColor} strokeWidth={2} fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={2.5} fill={lockColor} />
      </Svg>

      {/* rotating sweep beam sits above the grid, below the blips */}
      <RadarSweep sweep={sweep} />

      {blips.map(blip => (
        <AnimatedBlip key={blip.id} blip={blip} sweep={sweep} onPress={() => onBlipPress?.(blip.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: RADAR_SIZE, height: RADAR_SIZE, alignSelf: "center", marginVertical: 20 },
  sweep: { position: "absolute", width: RADAR_SIZE, height: RADAR_SIZE, left: 0, top: 0 },
  blipBase: { position: "absolute" },
  glow: { position: "absolute", opacity: 0.4 },
  blipTouch: { alignItems: "center", justifyContent: "center", shadowOpacity: 0.8, shadowRadius: 8, elevation: 5 },
  halo: { position: "absolute", borderWidth: 1.5 },
});
