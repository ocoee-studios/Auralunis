import React from "react";
import { Circle, G } from "react-native-svg";
import type { HorizontalStar } from "../ephemeris/StarPositions";
import { domeColor, type ProjectFn, type SkyPalette } from "../SkyLensVisual";

type Props = {
  stars: HorizontalStar[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
};

// The dense background starfield — hundreds of faint dots filling the sky between
// the named bright stars. Deliberately minimal per star (one Circle, no glow/label/
// hit-target) so even ~200 on-screen at once stays cheap. Only above-horizon,
// on-screen stars render.
export function DomeStarLayer({ stars, project, palette, nightMode }: Props) {
  return (
    <G>
      {stars.map((s) => {
        if (!s.aboveHorizon) return null;
        const p = project(s.azimuthDegrees, s.altitudeDegrees);
        if (!p.onScreen) return null;
        const r = Math.max(0.6, 2.2 - s.magnitude * 0.28);
        const opacity = Math.max(0.32, 1 - (s.magnitude - 3.8) / 3.4);
        const color = nightMode ? palette.star : domeColor(s.id);
        return <Circle key={s.id} cx={p.x} cy={p.y} r={r} fill={color} opacity={opacity} />;
      })}
    </G>
  );
}
