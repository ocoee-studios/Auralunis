import React from "react";
import { G, Line, Polyline, Text as SvgText } from "react-native-svg";
import type { ProjectFn, SkyPalette } from "../SkyLensVisual";

type Props = {
  project: ProjectFn;
  centerAzimuth: number;
  box: { width: number; height: number };
  palette: SkyPalette;
};

const CARDINALS: { az: number; label: string }[] = [
  { az: 0, label: "N" },
  { az: 45, label: "NE" },
  { az: 90, label: "E" },
  { az: 135, label: "SE" },
  { az: 180, label: "S" },
  { az: 225, label: "SW" },
  { az: 270, label: "W" },
  { az: 315, label: "NW" }
];

// Builds an SVG polyline string for a small-circle of constant altitude, sampled
// in azimuth around where the device points. Points that fall behind the camera
// are dropped so the line never wraps across the screen.
function altitudeArc(project: ProjectFn, altitude: number, centerAz: number): string {
  const pts: string[] = [];
  for (let k = -100; k <= 100; k += 4) {
    const p = project(centerAz + k, altitude);
    if (!p.behind) pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return pts.join(" ");
}

export function GridLayer({ project, centerAzimuth, box, palette }: Props) {
  const horizon = altitudeArc(project, 0, centerAzimuth);
  const arc30 = altitudeArc(project, 30, centerAzimuth);
  const arc60 = altitudeArc(project, 60, centerAzimuth);

  return (
    <G>
      {arc30.length > 0 && (
        <Polyline points={arc30} fill="none" stroke={palette.grid} strokeWidth={1} strokeDasharray="4 6" />
      )}
      {arc60.length > 0 && (
        <Polyline points={arc60} fill="none" stroke={palette.grid} strokeWidth={1} strokeDasharray="4 6" />
      )}
      {horizon.length > 0 && (
        <Polyline points={horizon} fill="none" stroke={palette.horizon} strokeWidth={1.4} />
      )}

      {/* Altitude tick labels along the meridian the device faces */}
      {[30, 60].map((alt) => {
        const p = project(centerAzimuth, alt);
        if (p.behind || p.x < 0 || p.x > box.width) return null;
        return (
          <SvgText key={`alt-${alt}`} x={p.x + 4} y={p.y - 3} fill={palette.gridLabel} fontSize={9}>
            {alt}°
          </SvgText>
        );
      })}

      {/* Cardinal + intercardinal markers on the horizon */}
      {CARDINALS.map(({ az, label }) => {
        const p = project(az, 0);
        if (p.behind || p.x < -10 || p.x > box.width + 10) return null;
        const major = label.length === 1;
        return (
          <G key={`card-${label}`}>
            <Line x1={p.x} y1={p.y - 6} x2={p.x} y2={p.y + 6} stroke={palette.horizon} strokeWidth={1} />
            <SvgText
              x={p.x}
              y={p.y + 20}
              fill={major ? palette.accent : palette.gridLabel}
              fontSize={major ? 14 : 10}
              fontWeight={major ? "900" : "600"}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
