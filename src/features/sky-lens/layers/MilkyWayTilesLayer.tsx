import React from "react";
import { Defs, G, Image as SvgImage, Mask, RadialGradient, Rect, Stop } from "react-native-svg";
import type { MilkyWayBand } from "../ephemeris/MilkyWay";
import type { ProjectFn } from "../SkyLensVisual";
import type { CameraFov } from "../ar/SkyLensProjection";

// Tiled Milky Way — 6 painterly segment textures brushed along the galactic plane,
// replacing the single ESO photo billboard. Each tile is placed at its galactic
// longitude (band.center is sampled by longitude → we reuse it, no extra ephemeris),
// rotated to the local band tangent, sized to span a chunk of the band so neighbours
// overlap, and edge-feathered (radial mask) so the overlaps blend seamlessly. Warmth/
// colour lives in the art (Sagittarius warm → Cassiopeia/Orion cool); opacity per tile
// sets brightness (Sgr brightest, Orion faintest). Emerges with the eye adaptation.

type Tile = { id: string; tex: number; lon: number; op: number; spanDeg: number };

const TILES: Tile[] = [
  { id: "sagittarius", tex: require("../../../assets/milkyway/milkyway_sagittarius.png"), lon: 0,   op: 0.30, spanDeg: 82 }, // galactic core — brightest, warmest
  { id: "aquila",      tex: require("../../../assets/milkyway/milkyway_aquila.png"),      lon: 45,  op: 0.20, spanDeg: 75 }, // blue-violet
  { id: "cygnus",      tex: require("../../../assets/milkyway/milkyway_cygnus.png"),      lon: 80,  op: 0.20, spanDeg: 75 }, // cool blue + dark rift
  { id: "cassiopeia",  tex: require("../../../assets/milkyway/milkyway_cassiopeia.png"),  lon: 120, op: 0.15, spanDeg: 78 }, // silver-blue, thin
  { id: "orion",       tex: require("../../../assets/milkyway/milkyway_orion.png"),       lon: 200, op: 0.12, spanDeg: 88 }, // faintest, diffuse blue-grey
  { id: "carina",      tex: require("../../../assets/milkyway/milkyway_carina.png"),      lon: 285, op: 0.24, spanDeg: 82 }, // rich amber/rose
];

type Props = {
  band: MilkyWayBand;
  project: ProjectFn;
  fov: CameraFov;
  box: { width: number; height: number };
  nightMode: boolean;
  fullSphere?: boolean;
  reveal?: number; // 0..1 Adaptive Eye Response — the band deepens on dwell
};

export function MilkyWayTilesLayer({ band, project, fov, box, nightMode, fullSphere = false, reveal = 0 }: Props) {
  if (nightMode) return null;
  const pxPerDeg = box.width / fov.horizontalDegrees;
  const n = band.center.length;
  // band.center is uniformly sampled l=0..360, so map a galactic longitude → index.
  const idxAt = (lon: number) => Math.round((((lon % 360) + 360) % 360) / 360 * (n - 1)) % n;

  return (
    <G>
      {TILES.map((t) => {
        const idx = idxAt(t.lon);
        const pt = band.center[idx];
        if (!pt.aboveHorizon && !fullSphere && pt.altitudeDegrees < -15) return null;
        const c = project(pt.azimuthDegrees, pt.altitudeDegrees);
        if (c.behind) return null;

        // Local band tangent, from points ±7° of galactic longitude around the tile
        // centre (via idxAt — NOT adjacent array indices: the band's l=0 and l=360
        // samples are the SAME sky point, so a centred difference went degenerate
        // exactly at the Sagittarius core and rotated that tile wrong).
        const pa = band.center[idxAt(t.lon - 7)];
        const pb = band.center[idxAt(t.lon + 7)];
        const a = project(pa.azimuthDegrees, pa.altitudeDegrees);
        const b = project(pb.azimuthDegrees, pb.altitudeDegrees);
        let deg = 0;
        if (!a.behind && !b.behind) deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;

        const size = t.spanDeg * pxPerDeg;
        const r = size / 2;
        // fade below the horizon so the band dissolves rather than cutting
        const horizonFade = Math.max(0, Math.min(1, (pt.altitudeDegrees + 12) / 24));
        const op = t.op * (0.85 + 0.15 * reveal) * horizonFade;
        if (op < 0.004) return null;

        return (
          <G key={t.id}>
            <Defs>
              {/* radial feather → transparent edges, so adjacent tiles blend across
                  their 15–20% overlap and the square boundary never shows */}
              <RadialGradient id={`mwt-${t.id}`} cx={c.x} cy={c.y} r={r} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#fff" stopOpacity="1" />
                <Stop offset="0.5" stopColor="#fff" stopOpacity="1" />
                <Stop offset="1" stopColor="#fff" stopOpacity="0" />
              </RadialGradient>
              <Mask id={`mwtm-${t.id}`} maskUnits="userSpaceOnUse">
                <Rect x={c.x - r} y={c.y - r} width={size} height={size} fill={`url(#mwt-${t.id})`} />
              </Mask>
            </Defs>
            <G mask={`url(#mwtm-${t.id})`} opacity={op}>
              <G transform={`rotate(${deg.toFixed(2)} ${c.x.toFixed(1)} ${c.y.toFixed(1)})`}>
                <SvgImage
                  href={t.tex}
                  x={c.x - r}
                  y={c.y - r}
                  width={size}
                  height={size}
                  preserveAspectRatio="xMidYMid slice"
                />
              </G>
            </G>
          </G>
        );
      })}
    </G>
  );
}
