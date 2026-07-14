import React from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from "react-native-svg";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import type { SelectedObject } from "../SkyLensVisual";
import {
  projectTarget,
  type CameraFov,
  type CameraPointing,
  type OverlayBox,
} from "../ar/SkyLensProjection";

type Props = {
  nebulae: HorizontalNebula[];
  pointing: CameraPointing;
  fov: CameraFov;
  box: OverlayBox;
  visible: boolean;
  fullSphere?: boolean;
  /** Height of the bottom control dock (px) — artwork centred inside it is dropped. */
  uiBottom?: number;
  onSelect?: (object: SelectedObject) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// THE ONE NEBULA RENDERER.
//
// Sky Lens used to run TWO nebula renderers over the same objects at the same time:
// this layer, and the procedural NebulaLayer inside SkyLensCanvas. Both were gated on
// the same `deepsky` key, so every nebula was drawn twice — doubling the opacity and
// muddying the colour. NebulaLayer's visible artwork is now retired (SkyLensCanvas);
// this file is the single source of nebula imagery.
//
// It also renders ONLY curated hero nebulae. The deep-sky catalog is 38 objects — 12
// star clusters and 9 galaxies among them — and the old renderer painted every one of
// them as a glowing emission cloud. The Beehive is not a nebula; Andromeda is not a
// nebula. They get no cloud artwork here.
// ─────────────────────────────────────────────────────────────────────────────

// Only these objects ever get cloud artwork. Curated, recognisable, and every one of
// them genuinely IS a nebula (emission / reflection / planetary / supernova remnant).
const HERO_NEBULA_IDS = new Set([
  "m42", // Orion
  "ngc2237", // Rosette
  "m1", // Crab
  "ngc7000", // North America
  "ngc6960", // Veil
  "m27", // Dumbbell
  "m57", // Ring
  "m8", // Lagoon
  "m20", // Trifid
  "m16", // Eagle
  "ngc3372", // Carina
  "m17", // Swan / Omega
]);

// Belt-and-braces: even inside the allowlist, refuse to paint a cloud over anything the
// catalog classes as a cluster or a galaxy. If someone adds "m45" to the list above by
// mistake, this stops the Pleiades becoming a pink cloud.
const CLOUD_TYPES = new Set(["emission", "reflection", "planetary", "supernova"]);

type ArtDirection = {
  scale: number;
  warm: string;
  cool: string;
  core: string;
  haze: string;
  rotation: number;
  elongated?: boolean;
};

// PALETTE — dusty rose, mauve, violet, indigo, icy blue, teal, amber, silver. No neon,
// no electric magenta, no saturated cyan, no black.
const ROSE = "#F2AEC2";
const PINK = "#F58AB0";
const VIOLET = "#9A7DE2";
const INDIGO = "#6F76D9";
const CYAN = "#7CCFE0";
const TEAL = "#66C7C1";
const AMBER = "#E8A36A";
const SILVER = "#EAF1FF";
const CREAM = "#FFF0D8";

// SIZE. `scale` multiplies the catalog radius, then a hard clamp bounds the result, then
// a screen-relative cap bounds it again (see MAX_OUTER_FRAC). Three independent ceilings,
// so no object can run away regardless of its catalog entry or the FOV.
const ART: Record<string, ArtDirection> = {
  m42: { scale: 1.1, warm: ROSE, cool: "#8FB6FF", core: CREAM, haze: VIOLET, rotation: -18 },
  ngc2237: { scale: 0.9, warm: ROSE, cool: VIOLET, core: "#FFE7F5", haze: "#B08AD8", rotation: 8 },
  m1: { scale: 0.72, warm: AMBER, cool: TEAL, core: CREAM, haze: INDIGO, rotation: 28, elongated: true },
  ngc3372: { scale: 1.0, warm: AMBER, cool: TEAL, core: CREAM, haze: VIOLET, rotation: -12 },
  m8: { scale: 1.0, warm: ROSE, cool: INDIGO, core: CREAM, haze: VIOLET, rotation: 14, elongated: true },
  m20: { scale: 0.82, warm: PINK, cool: INDIGO, core: "#FFF5E8", haze: VIOLET, rotation: -8 },
  m16: { scale: 0.82, warm: AMBER, cool: VIOLET, core: "#FFE9C8", haze: INDIGO, rotation: 18 },
  m17: { scale: 0.78, warm: PINK, cool: VIOLET, core: "#FFF0D6", haze: INDIGO, rotation: -28, elongated: true },
  ngc7000: { scale: 1.0, warm: ROSE, cool: CYAN, core: "#FFE6D8", haze: INDIGO, rotation: 20, elongated: true },
  m27: { scale: 0.7, warm: TEAL, cool: "#9FC7F0", core: SILVER, haze: INDIGO, rotation: 35, elongated: true },
  m57: { scale: 0.58, warm: TEAL, cool: "#B8A6E8", core: SILVER, haze: VIOLET, rotation: 0 },
  ngc6960: { scale: 0.95, warm: CYAN, cool: VIOLET, core: SILVER, haze: INDIGO, rotation: -34, elongated: true },
};

// Curated billing order — which object wins a slot when several are on screen.
const HERO_PRIORITY = ["m42", "m8", "ngc3372", "ngc7000", "ngc6960", "ngc2237", "m20", "m16", "m17", "m1", "m27", "m57"];

// TWO. Not three. A sky with one luminous hero and one quiet companion reads as a
// composition; a sky with several competing clouds reads as a sticker sheet.
const MAX_VISIBLE_NEBULAE = 2;

// Group opacity per rank. Low-to-medium: these sit INSIDE the sky, not on top of it.
const HERO_FALLOFF = [0.62, 0.42];

const MIN_BASE = 14;
const MAX_BASE = 30;
// The outermost veil is 1.5 × base, and no nebula may exceed ~18% of the screen width.
// That bounds the drawn diameter, so a wide FOV or a fat catalog radius can't produce a
// screen-filling blob.
const MAX_OUTER_FRAC = 0.09; // × box.width, as a RADIUS
const OUTER_VEIL = 1.5;

// UI EXCLUSION ZONES. Measured against the real chrome (top HUD ≈ 150px, bottom tray +
// shutter ≈ 240px), not guessed. A nebula whose centre lands under the controls is
// dropped outright rather than drawn beneath them.
const UI_TOP = 150;
// The shutter/camera control sits bottom-right; keep clouds off it.
const SHUTTER_W = 150;
const SHUTTER_H = 230;

// Smooth, high-point organic silhouette. 28 control points and three low-frequency
// lobe harmonics — no corners, no polygon. (The retired NebulaLayer built its blobs from
// NINE points, which is exactly why they read as angular.)
function cloudPath(cx: number, cy: number, rx: number, ry: number, seed: number): string {
  const count = 28;
  const points: Array<[number, number]> = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const fine =
      ((Math.sin(seed * 17.17 + i * 9.73) + 1) / 2) * 0.05 +
      ((Math.sin(seed * 5.31 + i * 23.9) + 1) / 2) * 0.02;
    const lobes =
      Math.cos(angle * 2 + seed * 1.7) * 0.11 +
      Math.cos(angle * 3 - seed * 0.9) * 0.07 +
      Math.cos(angle * 5 + seed * 2.3) * 0.04;
    const wobble = 0.88 + fine + lobes;
    points.push([cx + Math.cos(angle) * rx * wobble, cy + Math.sin(angle) * ry * wobble]);
  }
  const mid = (a: number, b: number): [number, number] => [
    (points[a][0] + points[b][0]) / 2,
    (points[a][1] + points[b][1]) / 2,
  ];
  const start = mid(count - 1, 0);
  let d = `M ${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  for (let i = 0; i < count; i += 1) {
    const next = mid(i, (i + 1) % count);
    d += ` Q ${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)} ${next[0].toFixed(1)} ${next[1].toFixed(1)}`;
  }
  return `${d} Z`;
}

export function NebulaImageLayer({ nebulae, pointing, fov, box, visible, fullSphere = false, uiBottom = 120, onSelect }: Props) {
  if (!visible || box.width <= 0 || box.height <= 0) return null;

  const maxOuter = box.width * MAX_OUTER_FRAC;

  const candidates = nebulae
    .filter((nebula) => {
      if (!HERO_NEBULA_IDS.has(nebula.id)) return false; // curated heroes only
      if (!ART[nebula.id]) return false;
      if (!CLOUD_TYPES.has(nebula.type)) return false; // never a cluster or a galaxy
      // HORIZON RULE. Strict: at or below the horizon, nothing is painted. No permissive
      // -20° grace band — an object at altitude −10° is under the ground.
      if (!fullSphere && nebula.altitudeDegrees <= 0) return false;
      return true;
    })
    .map((nebula, index) => {
      const projected = projectTarget(pointing, nebula.azimuthDegrees, nebula.altitudeDegrees, fov, box);
      if (projected.behind || !projected.onScreen) return null;

      // UI exclusion zones — drop, don't draw-under.
      if (projected.y < UI_TOP || projected.y > box.height - uiBottom) return null;
      if (projected.x > box.width - SHUTTER_W && projected.y > box.height - SHUTTER_H) return null;

      const priorityIndex = HERO_PRIORITY.indexOf(nebula.id);
      const centreDistance = Math.hypot(projected.x - box.width / 2, projected.y - box.height / 2);
      return {
        nebula,
        projected,
        index,
        // Curated billing first, then nearest-to-centre.
        rank: priorityIndex >= 0 ? priorityIndex * 10_000 + centreDistance : 100_000 + centreDistance,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, MAX_VISIBLE_NEBULAE);

  if (candidates.length === 0) return null;

  return (
    // box-none, not none: the clouds themselves ignore touches, but the hit targets below
    // stay tappable (this layer inherited nebula selection when NebulaLayer was retired).
    <Svg pointerEvents="box-none" width={box.width} height={box.height} style={StyleSheet.absoluteFillObject}>
      {candidates.map(({ nebula, projected, index }, rank) => {
        const art = ART[nebula.id];

        // THREE size ceilings, applied in order.
        const scaled = nebula.radius * art.scale;
        const clamped = Math.max(MIN_BASE, Math.min(MAX_BASE, scaled));
        // …and finally: the outermost veil may never exceed MAX_OUTER_FRAC of the width.
        const base = Math.min(clamped, maxOuter / OUTER_VEIL);

        const rx = art.elongated ? base * 1.36 : base;
        const ry = art.elongated ? base * 0.62 : base * 0.84;
        const seed = index + nebula.id.length * 13;
        const warmId = `neb-warm-${nebula.id}`;
        const coolId = `neb-cool-${nebula.id}`;
        const coreId = `neb-core-${nebula.id}`;
        const hazeId = `neb-haze-${nebula.id}`;
        const rotation = `rotate(${art.rotation} ${projected.x.toFixed(1)} ${projected.y.toFixed(1)})`;

        return (
          <G key={nebula.id}>
            <G transform={rotation} opacity={HERO_FALLOFF[rank] ?? 0.42} pointerEvents="none">
              <Defs>
                {/* Restrained stops — translucent mist over the Milky Way, never a solid
                    painted patch. Every gradient fades fully to zero. */}
                <RadialGradient id={warmId} cx="48%" cy="48%" r="52%">
                  <Stop offset="0%" stopColor={art.warm} stopOpacity={0.32} />
                  <Stop offset="45%" stopColor={art.warm} stopOpacity={0.16} />
                  <Stop offset="80%" stopColor={art.warm} stopOpacity={0.04} />
                  <Stop offset="100%" stopColor={art.warm} stopOpacity={0} />
                </RadialGradient>
                <RadialGradient id={coolId} cx="48%" cy="48%" r="52%">
                  <Stop offset="0%" stopColor={art.cool} stopOpacity={0.28} />
                  <Stop offset="45%" stopColor={art.cool} stopOpacity={0.14} />
                  <Stop offset="80%" stopColor={art.cool} stopOpacity={0.03} />
                  <Stop offset="100%" stopColor={art.cool} stopOpacity={0} />
                </RadialGradient>
                <RadialGradient id={hazeId} cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={art.haze} stopOpacity={0.16} />
                  <Stop offset="50%" stopColor={art.haze} stopOpacity={0.09} />
                  <Stop offset="100%" stopColor={art.haze} stopOpacity={0} />
                </RadialGradient>
                {/* Soft core. No white plateau, and emphatically NO dark oval stamp — the
                    centre is a diffuse swell of light, nothing else. */}
                <RadialGradient id={coreId} cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={art.core} stopOpacity={0.42} />
                  <Stop offset="30%" stopColor={art.core} stopOpacity={0.22} />
                  <Stop offset="70%" stopColor={art.core} stopOpacity={0.07} />
                  <Stop offset="100%" stopColor={art.core} stopOpacity={0} />
                </RadialGradient>
              </Defs>

              {/* Outer haze → warm lobes → cool lobes → core. Overlapping feathered veils,
                  each offset, so the silhouette has no single hard boundary. 11 elements. */}
              <Path d={cloudPath(projected.x, projected.y, rx * OUTER_VEIL, ry * OUTER_VEIL, seed)} fill={`url(#${hazeId})`} />
              <Path d={cloudPath(projected.x - rx * 0.2, projected.y + ry * 0.06, rx * 1.22, ry * 1.1, seed + 3)} fill={`url(#${warmId})`} />
              <Path d={cloudPath(projected.x + rx * 0.28, projected.y - ry * 0.2, rx * 0.88, ry * 0.86, seed + 7)} fill={`url(#${coolId})`} />
              <Path d={cloudPath(projected.x + rx * 0.08, projected.y + ry * 0.26, rx * 0.7, ry * 0.62, seed + 11)} fill={`url(#${warmId})`} />
              <Path d={cloudPath(projected.x - rx * 0.12, projected.y - ry * 0.1, rx * 0.46, ry * 0.44, seed + 17)} fill={`url(#${coolId})`} />

              {/* Internal colour variation — uneven tint pools, well inside the silhouette. */}
              <Circle cx={projected.x - rx * 0.3} cy={projected.y - ry * 0.22} r={base * 0.3} fill={art.warm} opacity={0.1} />
              <Circle cx={projected.x + rx * 0.26} cy={projected.y + ry * 0.3} r={base * 0.24} fill={art.haze} opacity={0.09} />
              <Circle cx={projected.x + rx * 0.32} cy={projected.y - ry * 0.28} r={base * 0.2} fill={art.cool} opacity={0.09} />

              <Circle cx={projected.x} cy={projected.y} r={Math.max(6, base * 0.3)} fill={`url(#${coreId})`} />

              {/* Embedded stars — what ties the cloud into the star field instead of
                  floating it on top. Kept crisp so stars stay legible over the mist. */}
              <Circle cx={projected.x - base * 0.18} cy={projected.y + base * 0.08} r={0.9} fill="#FFFDF5" opacity={0.75} />
              <Circle cx={projected.x + base * 0.22} cy={projected.y - base * 0.13} r={0.7} fill={SILVER} opacity={0.66} />
            </G>

            {/* Hit target → info card. Nebula selection used to live in NebulaLayer; it
                moves here so retiring that layer doesn't cost the user the tap. */}
            {onSelect && (
              <Circle
                cx={projected.x}
                cy={projected.y}
                r={Math.max(base * 0.8, 22)}
                fill="transparent"
                onPress={() =>
                  onSelect({
                    kind: "nebula",
                    id: nebula.id,
                    name: nebula.name,
                    subtitle: `${nebula.catalog} · Nebula`,
                    facts: [
                      { label: "Distance", value: nebula.distanceLy },
                      { label: "Constellation", value: nebula.constellation },
                      { label: "Azimuth", value: `${Math.round(nebula.azimuthDegrees)}°` },
                      { label: "Altitude", value: `${Math.round(nebula.altitudeDegrees)}°` },
                    ],
                  })
                }
              />
            )}
          </G>
        );
      })}
    </Svg>
  );
}
