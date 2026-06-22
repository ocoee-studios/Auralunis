import React from "react";
import { G, Polyline } from "react-native-svg";
import type { MilkyWayBand } from "../ephemeris/MilkyWay";
import type { ProjectFn } from "../SkyLensVisual";

type Props = {
  band: MilkyWayBand;
  project: ProjectFn;
  box: { width: number; height: number };
  nightMode: boolean;
  boost: number; // opacity multiplier — ~1 in camera mode, slightly higher in Planetarium
};

// The AuraLunis Milky Way: a single, barely-visible warm glow feathered along the
// galactic plane — something you FEEL more than SEE. No circles, no ellipses, no
// dust-lane, no bulge. Just two soft nested strokes (wide faint halo → slightly
// tighter core) in warm starlight (rgba 255,246,214), feathering to transparent at
// the edges. If you can clearly see it, it's too bright. `boost` nudges it a touch
// brighter in Planetarium Mode where the background is pure black.
export function MilkyWayLayer({ band, project, box, nightMode, boost }: Props) {
  if (nightMode) return null;

  // Runs of consecutive in-front projected points.
  const runs: { x: number; y: number }[][] = [];
  let run: { x: number; y: number }[] = [];
  for (const pt of band.center) {
    const p = project(pt.azimuthDegrees, pt.altitudeDegrees);
    if (p.behind) {
      if (run.length > 1) runs.push(run);
      run = [];
      continue;
    }
    run.push({ x: p.x, y: p.y });
  }
  if (run.length > 1) runs.push(run);

  // ~30° of sky for the soft halo; a tighter core so the band feathers inward
  // instead of stopping at a hard edge.
  const halo = Math.max(120, box.height * 0.6);
  const core = Math.max(50, box.height * 0.26);
  const o = (v: number) => Math.min(1, v * boost);

  return (
    <G>
      {runs.map((pts, i) => {
        const str = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        return (
          <G key={`mw-${i}`}>
            {/* wide soft halo — feathers out to nothing */}
            <Polyline points={str} fill="none" stroke="#FFF6D6" strokeWidth={halo} strokeOpacity={o(0.022)} strokeLinecap="round" strokeLinejoin="round" />
            {/* faint warm core — the band you almost see */}
            <Polyline points={str} fill="none" stroke="#FFF6D6" strokeWidth={core} strokeOpacity={o(0.04)} strokeLinecap="round" strokeLinejoin="round" />
          </G>
        );
      })}
    </G>
  );
}
