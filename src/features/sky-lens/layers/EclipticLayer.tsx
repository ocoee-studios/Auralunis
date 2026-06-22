import React from "react";
import { G, Polyline } from "react-native-svg";
import type { MilkyWayPoint } from "../ephemeris/MilkyWay";
import type { ProjectFn, SkyPalette } from "../SkyLensVisual";

type Props = {
  points: MilkyWayPoint[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
};

// The ecliptic as a thin, subtle gold DASHED line (15% opacity) — a quiet
// reference for where the Sun, Moon, and planets travel, not a highway. Split
// into in-front runs so it never streaks across the view.
export function EclipticLayer({ points, project, palette, nightMode }: Props) {
  const color = nightMode ? palette.line : "#D9A84E";

  const runs: string[][] = [];
  let run: string[] = [];
  for (const pt of points) {
    const p = project(pt.azimuthDegrees, pt.altitudeDegrees);
    if (p.behind) {
      if (run.length > 1) runs.push(run);
      run = [];
      continue;
    }
    run.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  if (run.length > 1) runs.push(run);

  return (
    <G>
      {runs.map((pts, i) => (
        <Polyline
          key={`ecl-${i}`}
          points={pts.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={0.6}
          strokeOpacity={0.2}
          strokeDasharray="5 6"
          strokeLinecap="round"
        />
      ))}
    </G>
  );
}
