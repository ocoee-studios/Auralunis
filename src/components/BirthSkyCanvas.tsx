// BirthSkyCanvas.tsx — a self-contained SVG planisphere of the sky at a birth moment.
// No external sky renderer, no premium gating: it reads the same frozen ephemeris from
// useSkyData (birthDate time-override) and projects every above-horizon object onto a
// circular star-chart disc. Zenith sits at the centre, the horizon at the rim.
//
// Stereographic projection (alt/az → disc):
//   r = R * cos(alt) / (1 + sin(alt));  x = cx + r*sin(az);  y = cy - r*cos(az)
// All static SVG primitives. The twinkle is a JS-clock setState driving the opacity of
// static Circles — deliberately NOT an animated SVG component, which is the known SVG
// crash pattern in this app.
import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, G, Defs, RadialGradient, LinearGradient, Stop, ClipPath, Text as SvgText } from "react-native-svg";
import { useSkyData } from "@/features/sky-lens/hooks/useSkyProjection";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

const D2R = Math.PI / 180;

// Stereographic point on the disc for a horizontal coordinate.
function project(azDeg: number, altDeg: number, cx: number, cy: number, R: number) {
  const alt = altDeg * D2R;
  const az = azDeg * D2R;
  const r = (R * Math.cos(alt)) / (1 + Math.sin(alt));
  return { x: cx + r * Math.sin(az), y: cy - r * Math.cos(az) };
}

// A point at a fixed disc-radius along an azimuth (for rim furniture like cardinals).
function atRadius(azDeg: number, radius: number, cx: number, cy: number) {
  const az = azDeg * D2R;
  return { x: cx + radius * Math.sin(az), y: cy - radius * Math.cos(az) };
}

// Brightest stars read warm-white, mid stars pale, faint stars cool silver.
function starColor(mag: number): string {
  if (mag < 1.0) return "#FFF3DC";
  if (mag < 2.5) return "#F4F6FF";
  return "#C7D0E0";
}

// Planet tints (Sun is skipped; the Moon is drawn separately with a phase shadow).
const PLANET_COLORS: Record<string, string> = {
  Mercury: "#C0C6D4",
  Venus: "#FFF6D6",
  Mars: "#E8836A",
  Jupiter: "#F5D08E",
  Saturn: "#E8D5A0",
  Uranus: "#8FD4D8",
  Neptune: "#6A8CE8"
};

const SKIP_BODIES = new Set(["Sun"]);

const CARDINALS = [
  { label: "N", az: 0 },
  { label: "E", az: 90 },
  { label: "S", az: 180 },
  { label: "W", az: 270 }
];

// Seasonal accent ring colours (start → end of the gradient stroke).
const SEASON_GRADIENTS: Record<string, [string, string]> = {
  autumn: ["#D9A84E", "#8B4513"],
  winter: ["#6A8CE8", "#C0C6D4"],
  spring: ["#7EC88B", "#FFF6D6"],
  summer: ["#E8836A", "#F5D08E"]
};

export function BirthSkyCanvas({
  birthDate,
  location,
  size = 320,
  dominantConstellation,
  season
}: {
  birthDate: Date;
  location: ObserverLocation;
  size?: number;
  dominantConstellation?: string;
  season?: string;
}) {
  // Freeze the whole ephemeris to the birth instant (timeOverride → no live ticking).
  const sky = useSkyData(location, 60000, birthDate);

  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 1; // leave room for the 1px rim border

  // Gentle twinkle clock — drives opacity of the 8 brightest stars. JS setState only
  // (crash-safe), ~1.5s cycle. The heavy memos below don't recompute on this tick.
  const [twinkle, setTwinkle] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTwinkle((t) => t + 1), 120);
    return () => clearInterval(id);
  }, []);

  // The 8 brightest above-horizon stars → a per-star phase offset for the twinkle.
  const twinkleOffsets = useMemo(() => {
    const bright = sky.stars
      .filter((s) => s.aboveHorizon)
      .sort((a, b) => a.magnitude - b.magnitude)
      .slice(0, 8);
    const m = new Map<string, number>();
    bright.forEach((s, i) => m.set(s.id, i * 0.8));
    return m;
  }, [sky.stars]);

  // Constellation line segments — only drawn when both endpoints are above the horizon.
  const lines = useMemo(() => {
    const out: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const c of sky.constellations) {
      for (let i = 0; i < c.lines.length; i++) {
        const [a, b] = c.lines[i];
        const pa = c.points[a];
        const pb = c.points[b];
        if (!pa || !pb || !pa.aboveHorizon || !pb.aboveHorizon) continue;
        const p1 = project(pa.azimuthDegrees, pa.altitudeDegrees, cx, cy, R);
        const p2 = project(pb.azimuthDegrees, pb.altitudeDegrees, cx, cy, R);
        out.push({ key: `${c.id}-${i}`, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
      }
    }
    return out;
  }, [sky.constellations, cx, cy, R]);

  // Above-horizon planets (Sun & Moon excluded), with a known tint. The label x is
  // clamped inward near the rim so names like "Mercury" don't clip off the disc edge.
  const planets = useMemo(() => {
    return sky.bodies
      .filter((b) => b.aboveHorizon && !SKIP_BODIES.has(b.name) && PLANET_COLORS[b.name])
      .map((b) => {
        const p = project(b.azimuthDegrees, b.altitudeDegrees, cx, cy, R);
        const labelX = Math.max(30, Math.min(size - 30, p.x));
        return { id: b.id, name: b.name, color: PLANET_COLORS[b.name], x: p.x, y: p.y, labelX };
      });
  }, [sky.bodies, cx, cy, R, size]);

  // The Moon — rendered as a pale disc with a phase shadow when not near-full.
  const moon = useMemo(() => {
    const m = sky.bodies.find((b) => b.name === "Moon");
    if (!m || !m.aboveHorizon) return null;
    const p = project(m.azimuthDegrees, m.altitudeDegrees, cx, cy, R);
    return { x: p.x, y: p.y, illum: sky.moonIlluminationPercent };
  }, [sky.bodies, sky.moonIlluminationPercent, cx, cy, R]);
  const moonR = 7;
  // Shadow disc slides off the lit limb as illumination grows (0% → covered, 100% → clear).
  const moonShadowDx = moon ? 2 * moonR * (moon.illum / 100) : 0;

  // A single constellation label — the chart's dominant figure (matched by prop, else
  // the highest one in the sky). Everything else stays unlabelled for a clean look.
  const dominantLabel = useMemo(() => {
    const visible = sky.constellations.filter((c) => c.centroid.aboveHorizon);
    if (visible.length === 0) return null;
    let chosen = dominantConstellation
      ? visible.find((c) => c.name.toLowerCase() === dominantConstellation.toLowerCase())
      : undefined;
    if (!chosen) {
      chosen = visible.reduce((best, c) =>
        c.centroid.altitudeDegrees > best.centroid.altitudeDegrees ? c : best
      );
    }
    const p = project(chosen.centroid.azimuthDegrees, chosen.centroid.altitudeDegrees, cx, cy, R);
    // Clamp the label inward so a long name (e.g. PEGASUS) doesn't clip at the disc edge.
    const labelX = Math.max(40, Math.min(size - 40, p.x));
    return { name: chosen.name.toUpperCase(), x: labelX, y: p.y };
  }, [sky.constellations, dominantConstellation, cx, cy, R, size]);

  const seasonColors = season ? SEASON_GRADIENTS[season.trim().toLowerCase()] : undefined;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(217,168,78,0.42)",
        backgroundColor: "#030610"
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="bsBg" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#0A0E1A" />
            <Stop offset="100%" stopColor="#030610" />
          </RadialGradient>
          {/* Warm gold glow rising from the bottom rim — a horizon. */}
          <RadialGradient id="horizonGlow" cx="50%" cy="100%" r="62%">
            <Stop offset="0%" stopColor="#E8C07A" stopOpacity={0.42} />
            <Stop offset="55%" stopColor="#C9A05A" stopOpacity={0.12} />
            <Stop offset="100%" stopColor="#C9A05A" stopOpacity={0} />
          </RadialGradient>
          {/* Vignette: clear through the middle, darkening to the rim so edge stars fade. */}
          <RadialGradient id="vignette" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#030610" stopOpacity={0} />
            <Stop offset="70%" stopColor="#030610" stopOpacity={0} />
            <Stop offset="100%" stopColor="#030610" stopOpacity={1} />
          </RadialGradient>
          {seasonColors && (
            <LinearGradient id="seasonRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={seasonColors[0]} />
              <Stop offset="100%" stopColor={seasonColors[1]} />
            </LinearGradient>
          )}
          {moon && (
            <ClipPath id="moonClip">
              <Circle cx={moon.x} cy={moon.y} r={moonR} />
            </ClipPath>
          )}
        </Defs>

        {/* Background disc */}
        <Circle cx={cx} cy={cy} r={R} fill="url(#bsBg)" />

        {/* Horizon glow at the bottom rim */}
        <Circle cx={cx} cy={cy} r={R} fill="url(#horizonGlow)" />

        {/* Constellation lines */}
        <G>
          {lines.map((l) => (
            <Line
              key={l.key}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="#D9A84E"
              strokeWidth={1.0}
              strokeOpacity={0.45}
            />
          ))}
        </G>

        {/* Star dots — the 8 brightest twinkle via the JS clock */}
        <G>
          {sky.stars.map((s) => {
            if (!s.aboveHorizon) return null;
            const p = project(s.azimuthDegrees, s.altitudeDegrees, cx, cy, R);
            const radius = Math.max(0.5, 2.8 - s.magnitude * 0.48);
            const off = twinkleOffsets.get(s.id);
            const opacity = off === undefined ? 1 : 0.75 + 0.25 * Math.sin(twinkle * 0.5 + off);
            return <Circle key={s.id} cx={p.x} cy={p.y} r={radius} fill={starColor(s.magnitude)} opacity={opacity} />;
          })}
        </G>

        {/* Single dominant constellation label */}
        {dominantLabel && (
          <SvgText
            x={dominantLabel.x}
            y={dominantLabel.y}
            fill="#D9A84E"
            fontSize={9}
            fontWeight="bold"
            textAnchor="middle"
          >
            {dominantLabel.name}
          </SvgText>
        )}

        {/* Planets — glow halo, solid dot, gold label */}
        <G>
          {planets.map((pl) => (
            <G key={pl.id}>
              <Circle cx={pl.x} cy={pl.y} r={12} fill={pl.color} opacity={0.12} />
              <Circle cx={pl.x} cy={pl.y} r={5} fill={pl.color} />
              <SvgText
                x={pl.labelX}
                y={pl.y + 13}
                fill="#D9A84E"
                fontSize={8}
                textAnchor="middle"
              >
                {pl.name}
              </SvgText>
            </G>
          ))}
        </G>

        {/* Moon — pale disc with a phase shadow when not near-full */}
        {moon && (
          <G clipPath="url(#moonClip)">
            <Circle cx={moon.x} cy={moon.y} r={moonR} fill="#FFF6D6" />
            {moon.illum < 80 && (
              <Circle cx={moon.x + moonShadowDx} cy={moon.y} r={moonR} fill="#0A0E1A" />
            )}
          </G>
        )}

        {/* Horizon ring */}
        <Circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(217,168,78,0.42)" strokeWidth={1} />

        {/* Vignette over everything — fades the outer stars into the rim */}
        <Circle cx={cx} cy={cy} r={R} fill="url(#vignette)" opacity={0.6} />

        {/* Seasonal accent ring — just inside the horizon, over the vignette so it stays vivid */}
        {seasonColors && (
          <Circle cx={cx} cy={cy} r={R - 4} fill="none" stroke="url(#seasonRing)" strokeWidth={2.5} strokeOpacity={0.3} />
        )}

        {/* Cardinal labels — drawn last so they stay crisp over the vignette */}
        {CARDINALS.map((c) => {
          const p = atRadius(c.az, R - 10, cx, cy);
          return (
            <SvgText
              key={c.label}
              x={p.x}
              y={p.y + 3}
              fill="#D9A84E"
              fontSize={9}
              fontWeight="bold"
              textAnchor="middle"
            >
              {c.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
