import React from "react";
import { Circle, G } from "react-native-svg";
import type { HorizontalStar } from "../ephemeris/StarPositions";
import { domeColor, focusFactor, type ProjectFn, type SkyPalette, type FocusZone } from "../SkyLensVisual";

type Props = {
  stars: HorizontalStar[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  focus?: FocusZone;
};

// The dense background starfield — hundreds of faint dots filling the sky between
// the named bright stars. Deliberately minimal per star (one Circle, no glow/label/
// hit-target) so even ~200 on-screen at once stays cheap. Only above-horizon,
// on-screen stars render.
export function DomeStarLayer({ stars, project, palette, nightMode, focus = null }: Props) {
  return (
    <G>
      {stars.map((s) => {
        if (!s.aboveHorizon) return null;
        const p = project(s.azimuthDegrees, s.altitudeDegrees);
        if (!p.onScreen) return null;
        // Bigger stars so they're actually visible on a phone screen.
        // Previous 1px dots at 0.45 opacity disappeared against black.
        let r = Math.max(1.4, Math.min(3.2, 6.5 - s.magnitude));
        let opacity = Math.max(0.5, 1 - (s.magnitude - 3.8) / 3.5);
        // Focus mode: faint background stars in the focused region swell and brighten,
        // so the spotlighted area reads as denser, richer sky.
        const ff = focusFactor(p.x, p.y, focus);
        if (ff > 0) {
          r *= 1 + ff * 0.8;
          opacity = Math.min(1, opacity * (1 + ff * 0.7));
        }
        const color = nightMode ? palette.star : domeColor(s.id);
        return <Circle key={s.id} cx={p.x} cy={p.y} r={r} fill={color} opacity={opacity} />;
      })}
    </G>
  );
}
