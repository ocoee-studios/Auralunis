import React from "react";
import { Circle, G, Polyline } from "react-native-svg";
import type { MilkyWayBand } from "../ephemeris/MilkyWay";
import type { ProjectFn } from "../SkyLensVisual";

type Props = {
  band: MilkyWayBand;
  project: ProjectFn;
  box: { width: number; height: number };
  nightMode: boolean;
};

// The Milky Way as a soft glowing band along the galactic plane. The galactic
// equator is projected and split into contiguous in-front runs; each draws as a
// very wide, low-opacity stroke (the diffuse band) under a narrower brighter core,
// with an extra glow at the galactic-center bulge (toward Sagittarius). Hidden in
// Night Mode to protect dark adaptation.
export function MilkyWayLayer({ band, project, box, nightMode }: Props) {
  if (nightMode) return null;

  const runs: string[][] = [];
  let run: string[] = [];
  for (const pt of band.center) {
    const p = project(pt.azimuthDegrees, pt.altitudeDegrees);
    if (p.behind) {
      if (run.length > 1) runs.push(run);
      run = [];
      continue;
    }
    run.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  if (run.length > 1) runs.push(run);

  const wide = Math.max(90, box.height * 0.42);
  const core = Math.max(34, box.height * 0.16);

  const gc = project(band.galacticCenter.azimuthDegrees, band.galacticCenter.altitudeDegrees);
  const showBulge = band.galacticCenter.aboveHorizon && gc.onScreen;

  return (
    <G>
      {runs.map((pts, i) => {
        const points = pts.join(" ");
        return (
          <G key={`mw-${i}`}>
            <Polyline points={points} fill="none" stroke="#C9D6FF" strokeWidth={wide} strokeOpacity={0.05} strokeLinecap="round" strokeLinejoin="round" />
            <Polyline points={points} fill="none" stroke="#E6ECFF" strokeWidth={core} strokeOpacity={0.06} strokeLinecap="round" strokeLinejoin="round" />
          </G>
        );
      })}
      {showBulge && (
        <G>
          <Circle cx={gc.x} cy={gc.y} r={wide * 0.55} fill="#F0E6C8" opacity={0.06} />
          <Circle cx={gc.x} cy={gc.y} r={core} fill="#FFEFC4" opacity={0.07} />
        </G>
      )}
    </G>
  );
}
