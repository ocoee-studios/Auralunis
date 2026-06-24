import React, { useEffect, useRef } from "react";
import { Circle, G, Line, Text as SvgText } from "react-native-svg";
import type { ProjectFn, SkyPalette, SelectedObject } from "../SkyLensVisual";

// A tracked satellite resolved to absolute observer az/alt (built in SkyLensScreen
// from the live-TLE fleet positions via computeAzimuthElevation).
export interface SkyLensSatellite {
  id: string;
  name: string;
  shortName: string;
  altitudeKm: number;
  azimuthDegrees: number;
  elevationDegrees: number;
}

type Props = {
  satellites: SkyLensSatellite[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  onSelect: (object: SelectedObject) => void;
};

// Circular-orbit speed estimate from altitude: v = sqrt(GM / r).
const EARTH_R = 6371;
const GM = 398600.4418;
const orbitalSpeedKms = (altKm: number) => Math.sqrt(GM / (EARTH_R + altKm));

// Per-satellite identity colours (spec): ISS gold, Starlink pale blue, others silver.
function satColor(id: string, name: string): string {
  if (id === "iss") return "#D9A84E";
  if (id.includes("starlink") || name.toLowerCase().includes("starlink")) return "#9FC0FF";
  return "#C0C6D4";
}

// Tracked satellites on the live camera feed at their real sky positions. A short
// trailing line shows the orbital motion over the last tick (drawn from the previous
// tick's projected position to the current one), persisting across the cheap
// re-renders between 1 s ticks. Crash-safe: static SVG, refs for the trail.
export function SatelliteLayer({ satellites, project, palette, nightMode, onSelect }: Props) {
  const lastRef = useRef<Map<string, { az: number; alt: number }>>(new Map());
  const prevRef = useRef<Map<string, { az: number; alt: number }>>(new Map());

  useEffect(() => {
    const next = new Map<string, { az: number; alt: number }>();
    for (const s of satellites) next.set(s.id, { az: s.azimuthDegrees, alt: s.elevationDegrees });
    prevRef.current = lastRef.current;
    lastRef.current = next;
  }, [satellites]);

  return (
    <G>
      {satellites.map((s) => {
        if (s.elevationDegrees < -2) return null; // below horizon
        const p = project(s.azimuthDegrees, s.elevationDegrees);
        if (!p.onScreen) return null;

        const color = nightMode ? palette.star : satColor(s.id, s.name);
        const isISS = s.id === "iss";
        const r = isISS ? 3.2 : 2.2;

        const prev = prevRef.current.get(s.id);
        const trail = prev ? project(prev.az, prev.alt) : null;
        const speed = orbitalSpeedKms(s.altitudeKm);

        return (
          <G key={s.id}>
            {/* hit target → info card */}
            <Circle
              cx={p.x}
              cy={p.y}
              r={Math.max(r + 10, 14)}
              fill="transparent"
              onPress={() =>
                onSelect({
                  kind: "satellite",
                  id: s.id,
                  name: s.name,
                  subtitle: `${s.shortName} · Satellite`,
                  facts: [
                    { label: "Altitude", value: `${Math.round(s.altitudeKm)} km` },
                    { label: "Speed", value: `${speed.toFixed(2)} km/s` },
                    { label: "Azimuth", value: `${Math.round(s.azimuthDegrees)}°` },
                    { label: "Elevation", value: `${Math.round(s.elevationDegrees)}°` },
                  ],
                })
              }
            />

            {/* motion trail (previous tick → now) */}
            {trail && !trail.behind && (
              <Line x1={trail.x} y1={trail.y} x2={p.x} y2={p.y} stroke={color} strokeWidth={isISS ? 1.6 : 1} strokeOpacity={0.5} strokeLinecap="round" />
            )}

            {/* soft glow (ISS hero gets a wider one) + dot */}
            <Circle cx={p.x} cy={p.y} r={r + (isISS ? 6 : 3.5)} fill={color} opacity={isISS ? 0.18 : 0.12} />
            <Circle cx={p.x} cy={p.y} r={r} fill={color} />

            {/* label */}
            <SvgText x={p.x + r + 4} y={p.y + 3} fill={palette.starLabel} fontSize={9} fontWeight="600" opacity={0.8}>
              {s.shortName}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
