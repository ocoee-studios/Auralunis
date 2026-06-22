import React from "react";
import { Circle, Defs, G, RadialGradient, Stop } from "react-native-svg";
import type { MilkyWayBand } from "../ephemeris/MilkyWay";
import type { ProjectFn } from "../SkyLensVisual";

type Props = {
  band: MilkyWayBand;
  project: ProjectFn;
  box: { width: number; height: number };
  nightMode: boolean;
  boost: number; // opacity multiplier (~1 camera, higher in Planetarium)
};

// The Milky Way band that WRAPS the sky (Sagittarius→Aquila→Cygnus→Cassiopeia→
// Perseus→Orion). Rendered as overlapping soft RADIAL-GRADIENT blobs along the
// galactic equator — each blob feathers to transparent, so the chain reads as one
// continuous glowing river with NO hard stripe edges (the old polyline strokes had
// hard parallel edges that looked like artifacts). The photographic core texture
// (MilkyWayCoreLayer) sits on top for the bright Sagittarius hero region.
export function MilkyWayLayer({ band, project, box, nightMode, boost }: Props) {
  if (nightMode) return null;

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < band.center.length; i++) {
    const pt = band.center[i];
    if (!pt.aboveHorizon) continue; // never draw the band over the ground
    const p = project(pt.azimuthDegrees, pt.altitudeDegrees);
    if (p.behind) continue;
    if (i % 2 === 0) pts.push({ x: p.x, y: p.y }); // every ~8° — blobs overlap heavily
  }
  if (pts.length === 0) return null;

  const blobR = Math.max(70, box.height * 0.3); // band thickness (feathers to 0 at edge)
  const o = (v: number) => Math.min(0.18, v * boost);

  return (
    <G>
      <Defs>
        {/* warm gold haze of the band */}
        <RadialGradient id="mwBandGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#EBCB86" stopOpacity={o(0.075)} />
          <Stop offset="50%" stopColor="#D9A84E" stopOpacity={o(0.04)} />
          <Stop offset="100%" stopColor="#D9A84E" stopOpacity={0} />
        </RadialGradient>
        {/* brighter, whiter star-cloud knots — the texture that reads as 'our galaxy' */}
        <RadialGradient id="mwStarCloud" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF3CC" stopOpacity={o(0.12)} />
          <Stop offset="45%" stopColor="#EBCB86" stopOpacity={o(0.055)} />
          <Stop offset="100%" stopColor="#D9A84E" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {pts.map((p, i) =>
        i % 5 === 0 ? (
          <Circle key={`mw-${i}`} cx={p.x} cy={p.y} r={blobR * 0.7} fill="url(#mwStarCloud)" />
        ) : (
          <Circle key={`mw-${i}`} cx={p.x} cy={p.y} r={blobR} fill="url(#mwBandGlow)" />
        )
      )}
    </G>
  );
}
