import React from "react";
import { Circle, G, Polyline } from "react-native-svg";
import type { MilkyWayBand } from "../ephemeris/MilkyWay";
import type { ProjectFn } from "../SkyLensVisual";

type Props = {
  band: MilkyWayBand;
  project: ProjectFn;
  box: { width: number; height: number };
  nightMode: boolean;
  boost: number; // opacity multiplier — ~1.6 in camera mode, higher in Planetarium
};

// The AuraLunis gold Milky Way: the galactic plane drawn as warm amber/gold haze
// (NOT the cold blue every other app uses). Layered diffuse amber → warm gold →
// starlight core, with a dark dust-lane rift cut through the middle (the Great
// Rift), star-cloud highlights, and a glowing ember bulge at the galactic center.
// `boost` scales opacity so Planetarium Mode renders it at full brightness.
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

  const wide = Math.max(90, box.height * 0.42);
  const mid = Math.max(46, box.height * 0.2);
  const coreW = Math.max(22, box.height * 0.09);
  const o = (v: number) => Math.min(1, v * boost);

  const gc = project(band.galacticCenter.azimuthDegrees, band.galacticCenter.altitudeDegrees);
  const showBulge = band.galacticCenter.aboveHorizon && gc.onScreen;

  return (
    <G>
      {runs.map((pts, i) => {
        const str = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        return (
          <G key={`mw-${i}`}>
            {/* cool blue outer halo (edge regions) */}
            <Polyline points={str} fill="none" stroke="#6E84C8" strokeWidth={wide * 1.15} strokeOpacity={o(0.035)} strokeLinecap="round" strokeLinejoin="round" />
            {/* diffuse amber haze */}
            <Polyline points={str} fill="none" stroke="#CC9A48" strokeWidth={wide} strokeOpacity={o(0.085)} strokeLinecap="round" strokeLinejoin="round" />
            {/* warm gold body */}
            <Polyline points={str} fill="none" stroke="#ECC066" strokeWidth={mid} strokeOpacity={o(0.1)} strokeLinecap="round" strokeLinejoin="round" />
            {/* starlight core */}
            <Polyline points={str} fill="none" stroke="#FFF3CC" strokeWidth={coreW} strokeOpacity={o(0.12)} strokeLinecap="round" strokeLinejoin="round" />
            {/* dark dust lane (the Great Rift) */}
            <Polyline points={str} fill="none" stroke="#05070F" strokeWidth={coreW * 0.38} strokeOpacity={o(0.5)} strokeLinecap="round" strokeLinejoin="round" />
            {/* star clouds — denser, brighter, varied */}
            {pts.map((p, k) =>
              k % 3 === 0 ? <Circle key={k} cx={p.x} cy={p.y} r={mid * (0.42 + ((k * 7) % 5) * 0.06)} fill="#FFEFC0" opacity={o(0.05)} /> : null
            )}
          </G>
        );
      })}
      {showBulge && (
        <G>
          {/* galactic-core ember bulge — the brightest part of the band */}
          <Circle cx={gc.x} cy={gc.y} r={wide * 0.8} fill="#E8B84E" opacity={o(0.07)} />
          <Circle cx={gc.x} cy={gc.y} r={wide * 0.5} fill="#F2C45A" opacity={o(0.11)} />
          <Circle cx={gc.x} cy={gc.y} r={mid * 0.65} fill="#FFD27A" opacity={o(0.15)} />
          <Circle cx={gc.x} cy={gc.y} r={coreW * 0.7} fill="#FFEDB8" opacity={o(0.2)} />
          <Circle cx={gc.x} cy={gc.y} r={coreW * 0.32} fill="#FFF8E0" opacity={o(0.24)} />
        </G>
      )}
    </G>
  );
}
