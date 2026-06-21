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
      <Circle cx={p.x} cy={p.y} r={R + 4} fill={palette.moon} opacity={0.16} />
      <Circle cx={p.x} cy={p.y} r={R} fill={palette.moon} />
      <G clipPath="url(#skylens-moon-clip)">
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
