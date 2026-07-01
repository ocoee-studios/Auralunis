import React from "react";
import { Circle, G } from "react-native-svg";
import type { HorizontalStar } from "../ephemeris/StarPositions";
import { domeColor, warmShift, focusFactor, type ProjectFn, type SkyPalette, type FocusZone } from "../SkyLensVisual";
import { getExtinctionWarmth } from "@/services/SkyQualityService";

type Props = {
  stars: HorizontalStar[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  focus?: FocusZone;
  showcase?: FocusZone; // auto-lit hero region (e.g. Orion in view) — denser local sky
  extinction?: boolean; // warm low-altitude stars toward orange (atmospheric extinction)
  useSpectralColors?: boolean; // premium: blue/gold/orange dome tints. free: all white.
  fullSphere?: boolean; // Planetarium: show below-horizon dome stars at full brightness
};

// The dense background starfield — hundreds of faint dots filling the sky between
// the named bright stars. Deliberately minimal per star (one Circle, no glow/label/
// hit-target) so even ~200 on-screen at once stays cheap. Only above-horizon,
// on-screen stars render.
export function DomeStarLayer({ stars, project, palette, nightMode, focus = null, showcase = null, extinction = false, useSpectralColors = true, fullSphere = false }: Props) {
  return (
    <G>
      {stars.map((s) => {
        const belowHorizon = !s.aboveHorizon;
        if (belowHorizon && !fullSphere && s.altitudeDegrees < -30) return null;
        const p = project(s.azimuthDegrees, s.altitudeDegrees);
        if (!p.onScreen) return null;
        // Bigger stars so they're actually visible on a phone screen.
        // Previous 1px dots at 0.45 opacity disappeared against black.
        let r = Math.max(1.4, Math.min(3.2, 6.5 - s.magnitude));
        let opacity = Math.max(0.5, 1 - (s.magnitude - 3.8) / 3.5);
        // Focus mode (tap) + auto showcase region (e.g. Orion in view): faint stars in
        // the lit region swell and brighten, so it reads as denser, richer sky.
        const ff = focusFactor(p.x, p.y, focus);
        const sf = focusFactor(p.x, p.y, showcase);
        if (ff > 0 || sf > 0) {
          r *= (1 + ff * 0.8) * (1 + sf * 0.5);
          opacity = Math.min(1, opacity * (1 + ff * 0.7) * (1 + sf * 0.6));
        }
        // Free tier: every dome star renders the same warm white (no spectral tints).
        const baseColor = nightMode ? palette.star : useSpectralColors ? domeColor(s.id) : "#FFF6D6";
        const color = extinction && !nightMode ? warmShift(baseColor, getExtinctionWarmth(s.altitudeDegrees)) : baseColor;
        const groupOpacity = opacity * (belowHorizon && !fullSphere ? 0.25 : 1);
        // Stage-2: the brighter background stars get a subtle soft glow (one faint
        // halo) so the field reads with depth, not as flat pinprick discs. Faint dome
        // stars stay a single cheap circle so the dense field stays performant.
        if (!nightMode && s.magnitude < 3.8) {
          return (
            <G key={s.id} opacity={groupOpacity}>
              <Circle cx={p.x} cy={p.y} r={r * 2.2} fill={color} opacity={0.12} />
              <Circle cx={p.x} cy={p.y} r={r} fill={color} />
            </G>
          );
        }
        return <Circle key={s.id} cx={p.x} cy={p.y} r={r} fill={color} opacity={groupOpacity} />;
      })}
    </G>
  );
}
