import React from "react";
import { Circle, ClipPath, Defs, G, Text as SvgText } from "react-native-svg";
import type { SkyBody } from "../ephemeris/SkyEphemerisService";
import type { ProjectFn, SkyPalette, SelectedObject } from "../SkyLensVisual";

type Props = {
  moon: SkyBody | undefined;
  illuminationPercent: number;
  project: ProjectFn;
  palette: SkyPalette;
  onSelect: (object: SelectedObject) => void;
};

const R = 11; // moon disc radius — a touch larger than planet discs

// The Moon is always-on per spec. The phase is approximated by clipping a dark
// disc, offset horizontally by the lit fraction, to the lit disc: 0% illuminated
// → shadow centered (new moon), 100% → shadow pushed clear (full moon).
export function MoonLayer({ moon, illuminationPercent, project, palette, onSelect }: Props) {
  if (!moon || !moon.aboveHorizon) return null;
  const p = project(moon.azimuthDegrees, moon.altitudeDegrees);
  if (!p.onScreen) return null;

  const f = Math.max(0, Math.min(1, illuminationPercent / 100));
  const shadowCx = p.x + f * 2 * R;

  return (
    <G>
      <Defs>
        <ClipPath id="skylens-moon-clip">
          <Circle cx={p.x} cy={p.y} r={R} />
        </ClipPath>
      </Defs>
      {/* halo (two rings) */}
      <Circle cx={p.x} cy={p.y} r={R + 12} fill={palette.moon} opacity={0.07} />
      <Circle cx={p.x} cy={p.y} r={R + 5} fill={palette.moon} opacity={0.16} />
      {/* lit disc */}
      <Circle cx={p.x} cy={p.y} r={R} fill={palette.moon} />
      {/* maria (dark patches) + phase shadow, clipped to the disc */}
      <G clipPath="url(#skylens-moon-clip)">
        <Circle cx={p.x - R * 0.32} cy={p.y - R * 0.22} r={R * 0.3} fill="rgba(74,82,104,0.40)" />
        <Circle cx={p.x + R * 0.18} cy={p.y + R * 0.3} r={R * 0.24} fill="rgba(74,82,104,0.34)" />
        <Circle cx={p.x + R * 0.4} cy={p.y - R * 0.34} r={R * 0.16} fill="rgba(74,82,104,0.30)" />
        <Circle cx={p.x - R * 0.05} cy={p.y + R * 0.08} r={R * 0.18} fill="rgba(74,82,104,0.28)" />
        <Circle cx={shadowCx} cy={p.y} r={R} fill={palette.moonShadow} />
      </G>
      {/* Hit target */}
      <Circle
        cx={p.x}
        cy={p.y}
        r={R + 6}
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
      <SvgText x={p.x + R + 4} y={p.y + 4} fill={palette.starLabel} fontSize={11} fontWeight="700">
        Moon
      </SvgText>
    </G>
  );
}
