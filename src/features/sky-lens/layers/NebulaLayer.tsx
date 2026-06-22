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

// Famous deep-sky objects as discreet markers — a tiny colored dot with a subtle
// rosy glow and a small label, at their real sky positions. Deliberately minimal so
// they never cover the sky or fight the Milky Way texture (the old big multi-ring
// glows did). Hidden in Night Mode (dark adaptation).
export function NebulaLayer({ nebulae, project, palette, nightMode }: Props) {
  if (nightMode) return null;
  return (
    <G>
      {nebulae.map((n) => {
        if (!n.aboveHorizon) return null;
        const p = project(n.azimuthDegrees, n.altitudeDegrees);
        if (!p.onScreen) return null;
        return (
          <G key={n.id}>
            {/* subtle 8px rosy glow */}
            <Circle cx={p.x} cy={p.y} r={8} fill={n.color} opacity={0.08} />
            {/* tiny 3px core dot */}
            <Circle cx={p.x} cy={p.y} r={3} fill={n.color} opacity={0.55} />
            {/* small label underneath */}
            <SvgText x={p.x} y={p.y + 15} fill={palette.starLabel} fontSize={8} fontWeight="600" textAnchor="middle" opacity={0.6}>
              {n.name}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
