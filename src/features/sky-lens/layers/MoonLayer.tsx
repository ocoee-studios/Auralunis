import React from "react";
import { Circle, ClipPath, Defs, G, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
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

const R = 16; // hero moon disc radius

// The Moon as the hero object: a soft atmospheric halo bloom, a sphere-shaded lit
// disc (limb darkening for 3D roundness), real-feel maria + craters, and the phase
// rendered as a dim blue EARTHSHINE side (the unlit disc faintly lit by Earth) —
// not a black void. Always-on per spec.
export function MoonLayer({ moon, illuminationPercent, project, palette, nightMode, onSelect }: Props) {
  if (!moon || !moon.aboveHorizon) return null;
  const p = project(moon.azimuthDegrees, moon.altitudeDegrees);
  if (!p.onScreen) return null;

  const f = Math.max(0, Math.min(1, illuminationPercent / 100));
  const shadowCx = p.x + f * 2 * R;

  const surfaceBright = nightMode ? "#E08A8A" : "#FFFDF5";
  const surfaceMid = palette.moon;
  const surfaceLimb = nightMode ? "#7A1C1C" : "#C7CDDC";
  const earthshine = nightMode ? "rgba(48,10,10,0.80)" : "rgba(20,32,64,0.78)";
  const mare = nightMode ? "rgba(120,30,30,0.40)" : "rgba(74,82,104,0.42)";
  const craterShade = nightMode ? "rgba(90,22,22,0.45)" : "rgba(60,68,92,0.5)";
  const craterRim = nightMode ? "rgba(230,150,150,0.5)" : "rgba(255,253,240,0.6)";

  const cx = p.x;
  const cy = p.y;

  return (
    <G>
      <Defs>
        <ClipPath id="skylens-moon-clip">
          <Circle cx={cx} cy={cy} r={R} />
        </ClipPath>
        {/* atmospheric halo bloom */}
        <RadialGradient id="skylens-moon-halo" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={palette.moon} stopOpacity="0.34" />
          <Stop offset="36%" stopColor={palette.moon} stopOpacity="0.12" />
          <Stop offset="100%" stopColor={palette.moon} stopOpacity="0" />
        </RadialGradient>
        {/* sphere shading — bright near-side, darkening to the limb */}
        <RadialGradient id="skylens-moon-surface" cx="43%" cy="40%" r="64%">
          <Stop offset="0%" stopColor={surfaceBright} stopOpacity="1" />
          <Stop offset="62%" stopColor={surfaceMid} stopOpacity="1" />
          <Stop offset="100%" stopColor={surfaceLimb} stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* halo bloom */}
      <Circle cx={cx} cy={cy} r={R * 2.6} fill="url(#skylens-moon-halo)" />

      {/* lit disc with limb darkening */}
      <Circle cx={cx} cy={cy} r={R} fill="url(#skylens-moon-surface)" />

      {/* surface detail + phase, clipped to the disc */}
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
      </G>

      {/* crisp limb */}
      <Circle cx={cx} cy={cy} r={R} fill="none" stroke={palette.moon} strokeOpacity={0.45} strokeWidth={0.6} />

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
