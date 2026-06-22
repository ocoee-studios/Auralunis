import React from "react";
import { Circle, G, Text as SvgText } from "react-native-svg";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import type { ProjectFn, SkyPalette } from "../SkyLensVisual";

type Props = {
  nebulae: HorizontalNebula[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
};

// Famous deep-sky objects as soft, multi-ring colored glows at their real sky
// positions — Orion's pink, the Pleiades' blue, Andromeda's pale light. Hidden in
// Night Mode (dark adaptation).
export function NebulaLayer({ nebulae, project, palette, nightMode }: Props) {
  if (nightMode) return null;
  return (
    <G>
      {nebulae.map((n) => {
        if (!n.aboveHorizon) return null;
        const p = project(n.azimuthDegrees, n.altitudeDegrees);
        if (!p.onScreen) return null;
        const r = n.radius;
        return (
          <G key={n.id}>
            <Circle cx={p.x} cy={p.y} r={r} fill={n.color} opacity={0.1} />
            <Circle cx={p.x} cy={p.y} r={r * 0.6} fill={n.color} opacity={0.14} />
            <Circle cx={p.x} cy={p.y} r={r * 0.3} fill={n.color} opacity={0.2} />
            <SvgText x={p.x} y={p.y + r + 10} fill={palette.starLabel} fontSize={9} fontWeight="600" textAnchor="middle" opacity={0.7}>
              {n.name}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
