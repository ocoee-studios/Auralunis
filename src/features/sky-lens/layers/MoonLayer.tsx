import React from "react";
import { Circle, ClipPath, Defs, Ellipse, G, Line, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import type { SkyBody } from "../ephemeris/SkyEphemerisService";
import type { ProjectFn, SkyPalette, SelectedObject } from "../SkyLensVisual";

type Props = {
  moon: SkyBody | undefined;
  illuminationPercent: number;
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  onSelect: (object: SelectedObject) => void;
};

const R = 22; // hero moon disc radius (enlarged for presence)

// The Moon as THE hero object — the thing that makes users stop and stare. On top
// of the lit sphere-shaded disc (limb darkening, maria, craters, blue earthshine on
// the unlit side) it now carries a layered atmospheric scatter bloom, a subtle
// premium LENS FLARE (anamorphic streak + chromatic ring + colored ghost orbs along
// the optical axis), and a warm GOLDEN HORIZON GLOW that reddens the disc and pools
// light beneath it when the Moon hangs low. All static SVG — crash-safe. The animated
// god-ray halo (LunarGodRayLayer) sits behind this. Always-on per spec.
export function MoonLayer({ moon, illuminationPercent, project, palette, nightMode, onSelect }: Props) {
  if (!moon || !moon.aboveHorizon) return null;
  const p = project(moon.azimuthDegrees, moon.altitudeDegrees);
  if (!p.onScreen) return null;

  const f = Math.max(0, Math.min(1, illuminationPercent / 100));
  const shadowCx = p.x + f * 2 * R;
  // 1 at the horizon, fading to 0 above ~14° — drives the warm low-Moon reddening.
  const low = Math.max(0, Math.min(1, (14 - moon.altitudeDegrees) / 14));
  const flare = f * (nightMode ? 0 : 1); // lens flare only on the bright lit Moon, day palette

  const surfaceBright = nightMode ? "#E08A8A" : "#FFFDF5";
  const surfaceMid = palette.moon;
  const surfaceLimb = nightMode ? "#7A1C1C" : "#C7CDDC";
  const earthshine = nightMode ? "rgba(48,10,10,0.80)" : "rgba(20,32,64,0.78)";
  const mare = nightMode ? "rgba(120,30,30,0.40)" : "rgba(74,82,104,0.42)";
  const craterShade = nightMode ? "rgba(90,22,22,0.45)" : "rgba(60,68,92,0.5)";
  const craterRim = nightMode ? "rgba(230,150,150,0.5)" : "rgba(255,253,240,0.6)";

  const cx = p.x;
  const cy = p.y;

  // Lens-flare ghost orbs ride a diagonal "optical axis" through the disc.
  const ax = 0.6, ay = 0.78; // axis direction
  const ghost = (t: number) => ({ x: cx + ax * R * t, y: cy + ay * R * t });
  const g1 = ghost(2.4), g2 = ghost(-3.4), g3 = ghost(4.6);

  return (
    <G>
      <Defs>
        <ClipPath id="skylens-moon-clip">
          <Circle cx={cx} cy={cy} r={R} />
        </ClipPath>
        {/* wide soft atmospheric scatter — the Moon sits in real glow */}
        <RadialGradient id="skylens-moon-scatter" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF6DC" stopOpacity="0.22" />
          <Stop offset="30%" stopColor={palette.moon} stopOpacity="0.09" />
          <Stop offset="100%" stopColor={palette.moon} stopOpacity="0" />
        </RadialGradient>
        {/* tight warm inner bloom hugging the disc */}
        <RadialGradient id="skylens-moon-bloom" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFBEF" stopOpacity="0.5" />
          <Stop offset="55%" stopColor={palette.moon} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={palette.moon} stopOpacity="0" />
        </RadialGradient>
        {/* sphere shading — bright near-side, darkening to the limb */}
        <RadialGradient id="skylens-moon-surface" cx="43%" cy="40%" r="64%">
          <Stop offset="0%" stopColor={surfaceBright} stopOpacity="1" />
          <Stop offset="62%" stopColor={surfaceMid} stopOpacity="1" />
          <Stop offset="100%" stopColor={surfaceLimb} stopOpacity="1" />
        </RadialGradient>
        {/* warm amber glow for the low Moon near the horizon */}
        <RadialGradient id="skylens-moon-horizon" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFC774" stopOpacity={0.42 * low} />
          <Stop offset="45%" stopColor="#E89A47" stopOpacity={0.16 * low} />
          <Stop offset="100%" stopColor="#E89A47" stopOpacity="0" />
        </RadialGradient>
        {/* lens-flare ghost orb */}
        <RadialGradient id="skylens-moon-ghost" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <Stop offset="60%" stopColor="#BFD8FF" stopOpacity="0.16" />
          <Stop offset="100%" stopColor="#BFD8FF" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* atmospheric scatter (wide) + warm horizon pool beneath the disc */}
      <Circle cx={cx} cy={cy} r={R * 4.6} fill="url(#skylens-moon-scatter)" />
      {low > 0.02 && (
        <Circle cx={cx} cy={cy + R * 0.6} r={R * 3.6} fill="url(#skylens-moon-horizon)" />
      )}
      <Circle cx={cx} cy={cy} r={R * 1.9} fill="url(#skylens-moon-bloom)" />

      {/* lit disc with limb darkening */}
      <Circle cx={cx} cy={cy} r={R} fill="url(#skylens-moon-surface)" />

      {/* surface detail + phase + low-Moon warming, clipped to the disc */}
      <G clipPath="url(#skylens-moon-clip)">
        {/* maria (dark seas) */}
        <Circle cx={cx - R * 0.34} cy={cy - R * 0.24} r={R * 0.34} fill={mare} />
        <Circle cx={cx + R * 0.16} cy={cy + R * 0.32} r={R * 0.26} fill={mare} />
        <Circle cx={cx + R * 0.42} cy={cy - R * 0.36} r={R * 0.17} fill={mare} />
        <Circle cx={cx - R * 0.06} cy={cy + R * 0.08} r={R * 0.2} fill={mare} />
        {/* craters: shaded pit + bright rim */}
        <Circle cx={cx + R * 0.5} cy={cy + R * 0.46} r={R * 0.1} fill={craterShade} />
        <Circle cx={cx + R * 0.5} cy={cy + R * 0.44} r={R * 0.1} fill="none" stroke={craterRim} strokeWidth={0.5} />
        <Circle cx={cx - R * 0.5} cy={cy + R * 0.34} r={R * 0.08} fill={craterShade} />
        <Circle cx={cx + R * 0.08} cy={cy - R * 0.52} r={R * 0.07} fill={craterShade} />
        {/* phase shadow rendered as dim EARTHSHINE (not black) */}
        <Circle cx={shadowCx} cy={cy} r={R} fill={earthshine} />
        {/* warm reddening when the Moon is low on the horizon */}
        {low > 0.02 && <Circle cx={cx} cy={cy} r={R} fill="#F0A24E" opacity={0.3 * low} />}
      </G>

      {/* crisp limb + chromatic flare ring just outside it */}
      <Circle cx={cx} cy={cy} r={R} fill="none" stroke={palette.moon} strokeOpacity={0.5} strokeWidth={0.6} />
      {flare > 0.05 && (
        <Circle cx={cx} cy={cy} r={R * 1.22} fill="none" stroke="#BFD8FF" strokeOpacity={0.14 * flare} strokeWidth={1.1} />
      )}

      {/* LENS FLARE: anamorphic horizontal streak + colored ghost orbs along the axis */}
      {flare > 0.05 && (
        <G>
          <Ellipse cx={cx} cy={cy} rx={R * 5.2} ry={R * 0.1} fill="#DCEBFF" opacity={0.12 * flare} />
          <Circle cx={g1.x} cy={g1.y} r={R * 0.42} fill="url(#skylens-moon-ghost)" opacity={0.7 * flare} />
          <Circle cx={g2.x} cy={g2.y} r={R * 0.28} fill="url(#skylens-moon-ghost)" opacity={0.55 * flare} />
          <Circle cx={g3.x} cy={g3.y} r={R * 0.55} fill="url(#skylens-moon-ghost)" opacity={0.4 * flare} />
        </G>
      )}

      {/* Hit target */}
      <Circle
        cx={cx}
        cy={cy}
        r={R + 8}
        fill="transparent"
        onPress={() =>
          onSelect({
            kind: "moon",
            id: "moon",
            name: "Moon",
            subtitle: "Earth's satellite",
            facts: [
              { label: "Illumination", value: `${Math.round(illuminationPercent)}%` },
              { label: "Azimuth", value: `${Math.round(moon.azimuthDegrees)}°` },
              { label: "Altitude", value: `${Math.round(moon.altitudeDegrees)}°` }
            ]
          })
        }
      />
      <SvgText x={cx + R + 5} y={cy + 4} fill={palette.starLabel} fontSize={11} fontWeight="700">
        Moon
      </SvgText>
    </G>
  );
}
