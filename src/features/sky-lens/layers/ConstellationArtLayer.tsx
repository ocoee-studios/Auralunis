import React from "react";
import { G, Polyline } from "react-native-svg";
import type { HorizontalConstellation } from "../ephemeris/StarPositions";
import type { ProjectFn } from "../SkyLensVisual";
import type { CameraFov } from "../ar/SkyLensProjection";

// §Task 5 — faint GOLDEN ENGRAVINGS of the zodiac mythology behind the constellation
// lines. Astral Gold (#D9A84E) at ~13% opacity — everything in AuraLunis is gold, so
// these read as engraved gold figures, not gray sketches. Premium-only, and each
// figure only fades in when its constellation is near screen-centre, so discovery
// feels earned. Built from STATIC <Polyline>s mapped into the constellation's own
// projected bounding box, so the art tracks the real stars. Crash-safe.

const GOLD = "#D9A84E";
const ART_OPACITY = 0.13; // 12–15% engraving

// Normalised figures: each entry is a list of STROKES; each stroke a list of [x,y] in
// 0..1 (y down). Mapped into the constellation's on-screen bounding box at render.
// A curated, clearly-recognisable subset; the rest of the zodiac can be added in the
// same format once the look is confirmed on device.
const FIGURES: Record<string, number[][][]> = {
  // Libra — the scales: a central beam, a hanging cord, two pans.
  libra: [
    [[0.1, 0.4], [0.9, 0.4]],
    [[0.5, 0.4], [0.5, 0.2]],
    [[0.1, 0.4], [0.04, 0.62], [0.22, 0.62], [0.16, 0.4]],
    [[0.9, 0.4], [0.84, 0.62], [0.96, 0.62], [0.9, 0.4]],
  ],
  // Gemini — the twins: two simple standing figures, hands joined.
  gemini: [
    [[0.3, 0.15], [0.3, 0.55]],
    [[0.18, 0.32], [0.42, 0.32]],
    [[0.3, 0.55], [0.2, 0.85]],
    [[0.3, 0.55], [0.4, 0.85]],
    [[0.7, 0.15], [0.7, 0.55]],
    [[0.58, 0.32], [0.82, 0.32]],
    [[0.7, 0.55], [0.6, 0.85]],
    [[0.7, 0.55], [0.8, 0.85]],
    [[0.42, 0.32], [0.58, 0.32]],
  ],
  // Sagittarius — the archer's bow and arrow.
  sagittarius: [
    [[0.2, 0.1], [0.05, 0.5], [0.2, 0.9]],
    [[0.12, 0.5], [0.95, 0.5]],
    [[0.8, 0.38], [0.95, 0.5], [0.8, 0.62]],
  ],
  // Taurus — the bull: a head with two upswept horns.
  taurus: [
    [[0.5, 0.55], [0.32, 0.72], [0.32, 0.92]],
    [[0.5, 0.55], [0.68, 0.72], [0.68, 0.92]],
    [[0.32, 0.55], [0.5, 0.42], [0.68, 0.55], [0.5, 0.68], [0.32, 0.55]],
    [[0.1, 0.2], [0.32, 0.5]],
    [[0.9, 0.2], [0.68, 0.5]],
  ],
  // Scorpius — the scorpion: claws, body, and the curling stinger tail.
  scorpius: [
    [[0.08, 0.2], [0.22, 0.32]],
    [[0.36, 0.2], [0.22, 0.32]],
    [[0.22, 0.32], [0.4, 0.45], [0.58, 0.5], [0.74, 0.6]],
    [[0.74, 0.6], [0.86, 0.74], [0.8, 0.88], [0.66, 0.86]],
  ],
  // Leo — the lion: a mane arc rising into the body and a flick of tail.
  leo: [
    [[0.18, 0.5], [0.22, 0.3], [0.4, 0.22], [0.56, 0.3]],
    [[0.56, 0.3], [0.7, 0.5], [0.62, 0.74], [0.36, 0.78], [0.22, 0.64]],
    [[0.7, 0.5], [0.9, 0.62], [0.86, 0.42]],
  ],
};

type Props = {
  constellations: HorizontalConstellation[];
  project: ProjectFn;
  box: { width: number; height: number };
  fov: CameraFov;
  enabled?: boolean; // premium gate
};

export function ConstellationArtLayer({ constellations, project, box, fov, enabled = false }: Props) {
  if (!enabled) return null;
  const cx = box.width / 2;
  const cy = box.height / 2;

  return (
    <G>
      {constellations.map((c) => {
        const fig = FIGURES[c.id];
        if (!fig) return null;

        // proximity fade: angular distance of the centroid from screen centre, in deg,
        // approximated from the projected offset and the vertical FOV.
        const cen = project(c.centroid.azimuthDegrees, c.centroid.altitudeDegrees);
        if (cen.behind) return null;
        const distPx = Math.hypot(cen.x - cx, cen.y - cy);
        const distDeg = (distPx / Math.max(1, box.height)) * fov.verticalDegrees;
        const fade = Math.max(0, Math.min(1, (30 - distDeg) / 10)); // full ≤20°, 0 ≥30°
        if (fade <= 0.02) return null;

        // bounding box of the figure's stars on screen → where the engraving sits.
        const pts = c.points.map((p) => project(p.azimuthDegrees, p.altitudeDegrees)).filter((p) => !p.behind);
        if (pts.length < 2) return null;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const p of pts) {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        }
        const w = maxX - minX;
        const h = maxY - minY;
        if (w < 8 || h < 8 || w > box.width * 2 || h > box.height * 2) return null; // skip degenerate / huge

        const op = ART_OPACITY * fade;
        return (
          <G key={`art-${c.id}`}>
            {fig.map((stroke, si) => {
              const points = stroke.map(([nx, ny]) => `${(minX + nx * w).toFixed(1)},${(minY + ny * h).toFixed(1)}`).join(" ");
              return (
                <Polyline key={`art-${c.id}-${si}`} points={points} fill="none" stroke={GOLD} strokeWidth={1.3} strokeOpacity={op} strokeLinecap="round" strokeLinejoin="round" />
              );
            })}
          </G>
        );
      })}
    </G>
  );
}
