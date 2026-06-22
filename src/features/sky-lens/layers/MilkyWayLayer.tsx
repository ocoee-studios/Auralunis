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

// The AuraLunis Milky Way: a warm GOLDEN haze feathered along the galactic plane —
// a faint river of light (~8–10% opacity), not the cold blue every other app uses
// and not invisible. No circles, no ellipses, no dust-lane, no bulge. Just two soft
// nested strokes (wide gold halo → warm golden core) feathering to transparent at
// the edges. `boost` nudges it brighter in Planetarium Mode (pure-black backdrop).
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
            {/* wide soft gold halo — feathers out to nothing */}
            <Polyline points={str} fill="none" stroke="#D9A84E" strokeWidth={halo} strokeOpacity={o(0.045)} strokeLinecap="round" strokeLinejoin="round" />
            {/* warm golden core — a faint river of light through Cygnus */}
            <Polyline points={str} fill="none" stroke="#EBCB86" strokeWidth={core} strokeOpacity={o(0.09)} strokeLinecap="round" strokeLinejoin="round" />
          </G>
        );
      })}
    </G>
  );
}
