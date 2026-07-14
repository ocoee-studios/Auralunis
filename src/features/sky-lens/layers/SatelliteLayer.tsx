import React, { useEffect, useRef } from "react";
import { Circle, G, Line, Text as SvgText } from "react-native-svg";
import type { ProjectFn, SkyPalette, SelectedObject } from "../SkyLensVisual";
import type { LabelPlacer } from "../labelLayout";

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
  placeLabel?: LabelPlacer;
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

// How long a satellite's motion trail may be, in px. The trail used to be drawn as a
// literal line from the previous tick's projected position to the current one. Between
// 1 s ticks a LEO satellite can sweep a long way — and if a sample was stale, or the
// projection wrapped across the seam, that line could stretch clean across the screen as
// a bright streak. Now the trail only carries the DIRECTION of motion; its LENGTH is
// clamped here, so it reads as a short local wake behind the object.
const TRAIL_PX = 22;
// Beyond this, the two samples aren't a plausible one-tick motion (stale sample, seam
// wrap, layer just toggled on) — draw no trail at all rather than a wrong one.
const TRAIL_SANE_MAX_PX = 160;
// Only a few satellites may carry a label at once. The fleet can put a dozen objects on
// screen, and a dozen tiny captions is exactly the technical clutter we're removing.
const MAX_LABELS = 3;

// Tracked satellites at their real sky positions. Crash-safe: static SVG, refs for the trail.
export function SatelliteLayer({ satellites, project, palette, nightMode, placeLabel, onSelect }: Props) {
  const lastRef = useRef<Map<string, { az: number; alt: number }>>(new Map());
  const prevRef = useRef<Map<string, { az: number; alt: number }>>(new Map());

  useEffect(() => {
    const next = new Map<string, { az: number; alt: number }>();
    for (const s of satellites) next.set(s.id, { az: s.azimuthDegrees, alt: s.elevationDegrees });
    prevRef.current = lastRef.current;
    lastRef.current = next;
  }, [satellites]);

  // Label budget: the ISS always earns one; the rest go to the highest satellites in the
  // sky (the ones actually worth pointing at). Everything else renders as a quiet dot.
  const labelled = new Set(
    [...satellites]
      .filter((s) => s.elevationDegrees >= -2)
      .sort((a, b) => {
        if (a.id === "iss") return -1;
        if (b.id === "iss") return 1;
        return b.elevationDegrees - a.elevationDegrees;
      })
      .slice(0, MAX_LABELS)
      .map((s) => s.id)
  );

  return (
    <G>
      {satellites.map((s) => {
        if (s.elevationDegrees < -2) return null; // below horizon
        // POSITION IS SACRED — projection unchanged; only the trail, stroke and label
        // presentation are touched by this pass.
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

            {/* Motion trail — a SHORT LOCAL WAKE, not a line to wherever the object was a
                tick ago. We take only the direction from the previous sample and draw a
                fixed, clamped length back along it, so the trail can never streak across
                the screen no matter how far the satellite moved or how stale the sample. */}
            {(() => {
              if (!trail || trail.behind) return null;
              const dx = p.x - trail.x;
              const dy = p.y - trail.y;
              const d = Math.hypot(dx, dy);
              // Too short to have a meaningful direction, or too long to be one real tick.
              if (d < 0.5 || d > TRAIL_SANE_MAX_PX) return null;
              const len = Math.min(TRAIL_PX, d);
              const tailX = p.x - (dx / d) * len;
              const tailY = p.y - (dy / d) * len;
              return (
                <Line
                  x1={tailX}
                  y1={tailY}
                  x2={p.x}
                  y2={p.y}
                  stroke={color}
                  strokeWidth={isISS ? 0.9 : 0.6}
                  strokeOpacity={isISS ? 0.3 : 0.2}
                  strokeLinecap="round"
                />
              );
            })()}

            {/* soft glow (ISS hero gets a wider one) + dot */}
            <Circle cx={p.x} cy={p.y} r={r + (isISS ? 6 : 3.5)} fill={color} opacity={isISS ? 0.18 : 0.12} />
            <Circle cx={p.x} cy={p.y} r={r} fill={color} />

            {/* Label — only the few that earned one (see `labelled`). */}
            {labelled.has(s.id) && (() => {
              const avoid = { x: p.x, y: p.y, r: r + 5 };
              const fx = p.x + r + 5;
              const lp = placeLabel
                ? placeLabel(fx, p.y + 3, s.shortName, 9, avoid)
                : { x: fx, y: p.y + 3 };
              return (
                <SvgText x={lp.x} y={lp.y} fill={palette.starLabel} fontSize={9} fontWeight="600" opacity={0.62}>
                  {s.shortName}
                </SvgText>
              );
            })()}
          </G>
        );
      })}
    </G>
  );
}
