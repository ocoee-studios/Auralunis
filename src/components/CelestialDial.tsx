// CelestialDial.tsx
// The centerpiece of the Home screen — a living astrolabe instrument.
// Combines: analog clock hands, sun position vector, moon with phase glow,
// planetary positions on concentric orbital rings, and tonight score at center.
//
// Uses react-native-svg for crisp rendering at any scale.
// Planet positions come from the existing sky ephemeris data.
// Size: 260×260 to fit comfortably above the tab bar on all iPhones.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Svg, {
  Circle, Line, G, Text as SvgText, Defs, RadialGradient, Stop, Path,
} from "react-native-svg";
import Animated, {
  useSharedValue, useAnimatedProps, withRepeat, withTiming,
  Easing, runOnJS,
} from "react-native-reanimated";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import type { TonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";

const SIZE = 260;
const CENTER = SIZE / 2;

// Ring radii for different orbital layers
const RINGS = {
  inner: 50,    // Moon
  mid: 70,      // inner planets (Venus, Mars)
  outer: 90,    // outer planets (Jupiter, Saturn)
  sun: 110,     // sun vector endpoint
  rim: 118,     // tick marks / compass
};

const toRad = (d: number) => (d * Math.PI) / 180;

// Project an azimuth (0=N, clockwise) to SVG x,y at a given radius
function azToXY(azimuthDeg: number, radius: number): { x: number; y: number } {
  const rad = toRad(azimuthDeg - 90); // SVG: 0° = right, we want 0° = top
  return { x: CENTER + Math.cos(rad) * radius, y: CENTER + Math.sin(rad) * radius };
}

// Planet color map
const BODY_COLORS: Record<string, string> = {
  moon: "#C0C6D4",
  venus: "#FFF6D6",
  jupiter: "#EF9F27",
  saturn: "#D9A84E",
  mars: "#F0997B",
  mercury: "#B4B2A9",
  uranus: "#9FE1CB",
  neptune: "#85B7EB",
  sun: "#EF9F27",
};

// Which ring does each body orbit on?
function bodyRing(id: string): number {
  if (id === "moon") return RINGS.inner;
  if (id === "venus" || id === "mars" || id === "mercury") return RINGS.mid;
  if (id === "jupiter" || id === "saturn") return RINGS.outer;
  return RINGS.mid;
}

interface CelestialDialProps {
  sky: TonightSky;
  tonightScore: number;
  tonightLabel: string;
  /** Called when the user scrubs time by dragging around the dial.
   *  offsetMinutes: 0 = now, positive = future, negative = past.
   *  One full clockwise rotation = +12 hours (720 min). */
  onTimeScrub?: (offsetMinutes: number) => void;
  /** Current scrub offset for display — 0 when live */
  scrubOffsetMinutes?: number;
}

export function CelestialDial({ sky, tonightScore, tonightLabel, onTimeScrub, scrubOffsetMinutes = 0 }: CelestialDialProps) {
  const isScrubbing = scrubOffsetMinutes !== 0;
  const [now, setNow] = useState(new Date());

  // Update clock every second (pause during scrub)
  useEffect(() => {
    if (isScrubbing) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isScrubbing]);

  // ── Time scrub gesture ──────────────────────────────────────────────────
  // Drag clockwise = forward in time, counter-clockwise = backward.
  // One full rotation (360°) = 12 hours = 720 minutes.
  // We track cumulative angle delta from the gesture start.
  const gestureStartAngle = useSharedValue(0);
  const cumulativeOffset = useSharedValue(scrubOffsetMinutes);

  const fireTimeScrub = useCallback((mins: number) => {
    tapLight();
    onTimeScrub?.(mins);
  }, [onTimeScrub]);

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      // Compute angle of touch relative to center
      const dx = e.x - CENTER;
      const dy = e.y - CENTER;
      gestureStartAngle.value = Math.atan2(dy, dx);
      cumulativeOffset.value = scrubOffsetMinutes;
    })
    .onUpdate((e) => {
      const dx = e.x - CENTER;
      const dy = e.y - CENTER;
      const currentAngle = Math.atan2(dy, dx);
      let delta = currentAngle - gestureStartAngle.value;
      // Normalize to [-PI, PI]
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;
      // Map: full circle (2π) = 720 minutes (12 hours)
      const minutesDelta = (delta / (2 * Math.PI)) * 720;
      const newOffset = Math.round((cumulativeOffset.value + minutesDelta) / 15) * 15; // snap to 15-min
      const clamped = Math.max(-720, Math.min(720, newOffset));
      runOnJS(fireTimeScrub)(clamped);
    });

  function resetToNow() {
    tapLight();
    onTimeScrub?.(0);
  }

  // Clock angles — offset by scrub amount
  const scrubDate = new Date(now.getTime() + scrubOffsetMinutes * 60_000);
  const hours = scrubDate.getHours() % 12 + scrubDate.getMinutes() / 60;
  const minutes = scrubDate.getMinutes() + scrubDate.getSeconds() / 60;
  const hourAngle = hours * 30;
  const minAngle = minutes * 6;

  const hourEnd = azToXY(hourAngle, 42);
  const minEnd = azToXY(minAngle, 58);

  // Sun position
  const sunBody = sky.visibleBodies.find(b => b.id === "sun");
  const sunAz = sunBody?.azimuthDegrees ?? 0;
  const sunPos = azToXY(sunAz, RINGS.sun);

  // Moon position
  const moonBody = sky.visibleBodies.find(b => b.id === "moon");
  const moonAz = moonBody?.azimuthDegrees ?? 0;
  const moonPos = azToXY(moonAz, RINGS.inner);

  // Planets (exclude sun and moon — they have special rendering)
  const planets = sky.visibleBodies.filter(
    b => b.id !== "sun" && b.id !== "moon"
  );

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <Svg width={SIZE} height={SIZE}>
        <Defs>
          <RadialGradient id="dialGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={AuraLunisColors.gold} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={AuraLunisColors.gold} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Background glow */}
        <Circle cx={CENTER} cy={CENTER} r={RINGS.rim + 2} fill="url(#dialGlow)" />

        {/* Orbital rings */}
        <Circle cx={CENTER} cy={CENTER} r={RINGS.inner} stroke={AuraLunisColors.borderSubtle} strokeWidth={0.5} fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={RINGS.mid} stroke={AuraLunisColors.borderSubtle} strokeWidth={0.5} fill="none" />
        <Circle cx={CENTER} cy={CENTER} r={RINGS.outer} stroke={AuraLunisColors.borderSubtle} strokeWidth={0.5} fill="none" />
        {/* faint gold glow behind the outer rim */}
        <Circle cx={CENTER} cy={CENTER} r={RINGS.rim} stroke={AuraLunisColors.gold} strokeWidth={4} fill="none" opacity={0.12} />
        <Circle cx={CENTER} cy={CENTER} r={RINGS.rim} stroke={AuraLunisColors.borderGold} strokeWidth={1.2} fill="none" />

        {/* Tick marks — every 15° */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = i * 15;
          const isMajor = angle % 90 === 0;
          const isMinor30 = angle % 30 === 0;
          const innerR = isMajor ? RINGS.rim - 10 : isMinor30 ? RINGS.rim - 7 : RINGS.rim - 4;
          const start = azToXY(angle, innerR);
          const end = azToXY(angle, RINGS.rim);
          return (
            <Line
              key={`tick-${i}`}
              x1={start.x} y1={start.y} x2={end.x} y2={end.y}
              stroke={isMajor ? AuraLunisColors.gold : AuraLunisColors.borderSubtle}
              strokeWidth={isMajor ? 1.5 : isMinor30 ? 0.8 : 0.4}
            />
          );
        })}

        {/* Cardinal labels */}
        {[
          { label: "N", az: 0 }, { label: "E", az: 90 },
          { label: "S", az: 180 }, { label: "W", az: 270 },
        ].map(({ label, az }) => {
          const pos = azToXY(az, RINGS.rim + 12);
          return (
            <SvgText
              key={label}
              x={pos.x} y={pos.y + 4}
              textAnchor="middle"
              fontSize={10}
              fontWeight="700"
              fill={AuraLunisColors.gold + "88"}
            >
              {label}
            </SvgText>
          );
        })}

        {/* Hour numbers (1-12) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const hour = i + 1;
          const pos = azToXY(hour * 30, RINGS.outer + 12);
          return (
            <SvgText
              key={`h-${hour}`}
              x={pos.x} y={pos.y + 3}
              textAnchor="middle"
              fontSize={8}
              fontWeight="500"
              fill={AuraLunisColors.faint + "55"}
            >
              {hour}
            </SvgText>
          );
        })}

        {/* Sun vector — dashed gold line from center to sun position */}
        <Line
          x1={CENTER} y1={CENTER}
          x2={sunPos.x} y2={sunPos.y}
          stroke={AuraLunisColors.gold}
          strokeWidth={1.2}
          strokeDasharray="3,5"
          opacity={0.3}
        />
        {/* Sun dot + glow */}
        <Circle cx={sunPos.x} cy={sunPos.y} r={8} fill={BODY_COLORS.sun} opacity={0.12} />
        <Circle cx={sunPos.x} cy={sunPos.y} r={5} fill={BODY_COLORS.sun} />
        <SvgText
          x={sunPos.x} y={sunPos.y + 14}
          textAnchor="middle" fontSize={7} fontWeight="600"
          fill={BODY_COLORS.sun + "88"}
        >
          Sun
        </SvgText>

        {/* Moon dot + glow */}
        <Circle cx={moonPos.x} cy={moonPos.y} r={8} fill={BODY_COLORS.moon} opacity={0.1} />
        <Circle cx={moonPos.x} cy={moonPos.y} r={5} fill={BODY_COLORS.moon} opacity={0.9} />
        <SvgText
          x={moonPos.x} y={moonPos.y + 13}
          textAnchor="middle" fontSize={7} fontWeight="600"
          fill={BODY_COLORS.moon + "66"}
        >
          {sky.moonIlluminationPercent}%
        </SvgText>

        {/* Planets */}
        {planets.map((body) => {
          const color = BODY_COLORS[body.id] ?? AuraLunisColors.silver;
          const ring = bodyRing(body.id);
          const pos = azToXY(body.azimuthDegrees, ring);
          const isAbove = body.altitudeDegrees > 0;
          return (
            <G key={body.id} opacity={isAbove ? 1 : 0.25}>
              {/* soft colored glow halo */}
              <Circle cx={pos.x} cy={pos.y} r={10} fill={color} opacity={0.08} />
              <Circle cx={pos.x} cy={pos.y} r={6} fill={color} opacity={0.18} />
              <Circle cx={pos.x} cy={pos.y} r={3.5} fill={color} />
              <SvgText
                x={pos.x} y={pos.y + 12}
                textAnchor="middle" fontSize={7} fontWeight="600"
                fill={color + (isAbove ? "77" : "33")}
              >
                {body.name}
              </SvgText>
            </G>
          );
        })}

        {/* Clock — hour hand */}
        <Line
          x1={CENTER} y1={CENTER}
          x2={hourEnd.x} y2={hourEnd.y}
          stroke={AuraLunisColors.gold}
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* Clock — minute hand */}
        <Line
          x1={CENTER} y1={CENTER}
          x2={minEnd.x} y2={minEnd.y}
          stroke={AuraLunisColors.gold2}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.5}
        />
        {/* Center dot */}
        <Circle cx={CENTER} cy={CENTER} r={3.5} fill={AuraLunisColors.gold} />

        {/* Scrub progress arc — shows how far you've scrubbed */}
        {isScrubbing && (
          <Path
            d={describeArc(CENTER, CENTER, RINGS.rim + 2, 0, (scrubOffsetMinutes / 720) * 360)}
            stroke={scrubOffsetMinutes > 0 ? AuraLunisColors.green + "55" : AuraLunisColors.violet + "55"}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>

      {/* Tonight Score overlay — centered on the dial */}
      <View style={styles.centerOverlay}>
        {isScrubbing ? (
          <>
            <Text style={styles.scrubTime}>
              {formatScrubTime(scrubDate)}
            </Text>
            <Text style={styles.scrubOffset}>
              {scrubOffsetMinutes > 0 ? "+" : ""}{Math.round(scrubOffsetMinutes / 60)}h
            </Text>
            <TouchableOpacity onPress={resetToNow} hitSlop={20}>
              <Text style={styles.resetBtn}>Reset to now</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.scoreNum}>{tonightScore}</Text>
            <Text style={styles.scoreLbl}>{tonightLabel.toUpperCase()}</Text>
          </>
        )}
      </View>
    </View>
    </GestureDetector>
  );
}

/** Format a date for scrub display */
function formatScrubTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** SVG arc path descriptor — for the scrub progress indicator */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const toRad = (d: number) => (d - 90) * Math.PI / 180;
  const start = { x: cx + Math.cos(toRad(endAngle)) * r, y: cy + Math.sin(toRad(endAngle)) * r };
  const end = { x: cx + Math.cos(toRad(startAngle)) * r, y: cy + Math.sin(toRad(startAngle)) * r };
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  const sweep = endAngle > startAngle ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignSelf: "center",
    marginVertical: 8,
  },
  centerOverlay: {
    position: "absolute",
    top: CENTER - 24,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "none",
  },
  scoreNum: {
    fontSize: 28,
    fontWeight: "900",
    color: AuraLunisColors.gold,
    lineHeight: 30,
  },
  scoreLbl: {
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 2,
    color: AuraLunisColors.gold,
    marginTop: 2,
  },
  scrubTime: {
    fontSize: 22,
    fontWeight: "900",
    color: AuraLunisColors.gold2,
    lineHeight: 24,
  },
  scrubOffset: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: AuraLunisColors.violet,
    marginTop: 2,
  },
  resetBtn: {
    fontSize: 9,
    fontWeight: "700",
    color: AuraLunisColors.gold,
    marginTop: 6,
    textDecorationLine: "underline",
  },
});
