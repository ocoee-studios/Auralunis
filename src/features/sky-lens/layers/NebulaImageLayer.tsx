import React from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop } from "react-native-svg";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
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
};

type ArtDirection = {
  scale: number;
  warm: string;
  cool: string;
  core: string;
  haze: string; // wide lilac/violet outer breath — the "watercolour" that sells depth
  rotation: number;
  elongated?: boolean;
};

// SIZE DISCIPLINE IS LOCKED. Every `scale` below, the 16–34px clamp, and the veil
// extents are UNCHANGED from the restrained pass. The former oversized look combined
// large scales, a 34–68px clamp and 2× outer paths, and several nebulae dominated the
// view — we are not going back.
//
// This pass adds LUMINOSITY and DETAIL inside that same footprint: a third (lilac)
// haze gradient, a finer inner veil, richer gradient stops, and a softer silhouette.
// Brighter and more refined, not one pixel bigger.
const ART: Record<string, ArtDirection> = {
  m42: { scale: 1.55, warm: "#F36BAE", cool: "#719FFF", core: "#FFF4DE", haze: "#B98CF0", rotation: -18 },
  ngc2237: { scale: 1.35, warm: "#F06DAD", cool: "#9B79FF", core: "#FFE7F5", haze: "#A97BEE", rotation: 8 },
  m1: { scale: 1.2, warm: "#EA8A68", cool: "#62BDD6", core: "#FFF1CE", haze: "#8FA6E8", rotation: 28, elongated: true },
  ngc3372: { scale: 1.55, warm: "#F18A62", cool: "#55BED3", core: "#FFF0C9", haze: "#9E9AE6", rotation: -12 },
  m8: { scale: 1.5, warm: "#F06C9F", cool: "#65ACEE", core: "#FFF0D8", haze: "#AE8AF0", rotation: 14, elongated: true },
  m20: { scale: 1.35, warm: "#EC5FA0", cool: "#69AEFA", core: "#FFF5E8", haze: "#B287F2", rotation: -8 },
  m16: { scale: 1.25, warm: "#DB7D72", cool: "#739BE8", core: "#FFE9C8", haze: "#9B92E4", rotation: 18 },
  m17: { scale: 1.25, warm: "#F17F98", cool: "#6AB2F0", core: "#FFF0D6", haze: "#A88EEE", rotation: -28, elongated: true },
  ngc7000: { scale: 1.4, warm: "#EC708F", cool: "#60C1D1", core: "#FFE6D8", haze: "#8FA0E8", rotation: 20, elongated: true },
  m27: { scale: 1.15, warm: "#66D0BA", cool: "#7399F5", core: "#F1FFF8", haze: "#7FB6E8", rotation: 35, elongated: true },
  m57: { scale: 1.05, warm: "#DE6CAB", cool: "#5CC4D0", core: "#F5FFF2", haze: "#96A8EA", rotation: 0 },
  ngc6960: { scale: 1.4, warm: "#EC7AA0", cool: "#61C4E0", core: "#EFFFFF", haze: "#8FB2EE", rotation: -34, elongated: true },
};

// Prefer the most recognisable hero objects, then fill any remaining slot with the
// closest-to-centre object. This prevents a wall of overlapping clouds.
const HERO_PRIORITY = ["m42", "m8", "ngc3372", "ngc7000", "ngc6960", "ngc2237", "m20"];
const MAX_VISIBLE_NEBULAE = 3;

function cloudPath(cx: number, cy: number, rx: number, ry: number, seed: number): string {
  const count = 28;
  const points: Array<[number, number]> = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    // A narrow wobble range plus many control points creates a soft organic edge rather
    // than a faceted/polygonal silhouette. Two summed harmonics (rather than one) give
    // the outline a second, finer scale of irregularity — the difference between a
    // wobbly ellipse and something that reads as *cloud*. The wobble RANGE is unchanged,
    // so the silhouette gains detail without gaining size.
    const wobble =
      0.86 +
      ((Math.sin(seed * 17.17 + i * 9.73) + 1) / 2) * 0.15 +
      ((Math.sin(seed * 5.31 + i * 23.9) + 1) / 2) * 0.07;
    points.push([
      cx + Math.cos(angle) * rx * wobble,
      cy + Math.sin(angle) * ry * wobble,
    ]);
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

export function NebulaImageLayer({ nebulae, pointing, fov, box, visible }: Props) {
  if (!visible) return null;

  const candidates = nebulae
    // Normal Sky Lens viewing never paints objects below the astronomical horizon.
    .filter((nebula) => nebula.aboveHorizon && ART[nebula.id])
    .map((nebula, index) => {
      const projected = projectTarget(pointing, nebula.azimuthDegrees, nebula.altitudeDegrees, fov, box);
      if (projected.behind || !projected.onScreen) return null;

      // Keep decorative artwork away from the top HUD and bottom control tray. The object
      // remains available through the projected deep-sky layer when it moves into view.
      if (projected.y < 112 || projected.y > box.height - 188) return null;

      const priorityIndex = HERO_PRIORITY.indexOf(nebula.id);
      const centreDistance = Math.hypot(projected.x - box.width / 2, projected.y - box.height / 2);
      return {
        nebula,
        projected,
        index,
        rank: priorityIndex >= 0 ? priorityIndex * 10_000 + centreDistance : 100_000 + centreDistance,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, MAX_VISIBLE_NEBULAE);

  if (candidates.length === 0) return null;

  return (
    <Svg pointerEvents="none" width={box.width} height={box.height} style={StyleSheet.absoluteFillObject}>
      {candidates.map(({ nebula, projected, index }) => {
        const art = ART[nebula.id];
        // UNCHANGED — the size contract. Do not widen this clamp.
        const base = Math.max(16, Math.min(34, nebula.radius * art.scale));
        const rx = art.elongated ? base * 1.36 : base;
        const ry = art.elongated ? base * 0.62 : base * 0.84;
        const seed = index + nebula.id.length * 13;
        const warmId = `nebula-warm-${nebula.id}`;
        const coolId = `nebula-cool-${nebula.id}`;
        const coreId = `nebula-core-${nebula.id}`;
        const hazeId = `nebula-haze-${nebula.id}`;
        const rotation = `rotate(${art.rotation} ${projected.x.toFixed(1)} ${projected.y.toFixed(1)})`;

        return (
          // 0.82 → 0.94: the ~15% luminosity lift, applied to the whole jewel at once.
          <G key={nebula.id} transform={rotation} opacity={0.94}>
            <Defs>
              <RadialGradient id={warmId} cx="48%" cy="48%" r="52%">
                <Stop offset="0%" stopColor={art.core} stopOpacity={0.6} />
                <Stop offset="20%" stopColor={art.warm} stopOpacity={0.58} />
                <Stop offset="46%" stopColor={art.warm} stopOpacity={0.34} />
                <Stop offset="72%" stopColor={art.warm} stopOpacity={0.12} />
                <Stop offset="100%" stopColor={art.warm} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={coolId} cx="48%" cy="48%" r="52%">
                <Stop offset="0%" stopColor="#EDF6FF" stopOpacity={0.4} />
                <Stop offset="28%" stopColor={art.cool} stopOpacity={0.5} />
                <Stop offset="56%" stopColor={art.cool} stopOpacity={0.28} />
                <Stop offset="80%" stopColor={art.cool} stopOpacity={0.09} />
                <Stop offset="100%" stopColor={art.cool} stopOpacity={0} />
              </RadialGradient>
              {/* The lilac breath. Wide, extremely faint, and it never reaches full
                  opacity even at its centre — this is what turns two-tone gradients into
                  something that reads as watercolour rather than airbrush. */}
              <RadialGradient id={hazeId} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={art.haze} stopOpacity={0.2} />
                <Stop offset="45%" stopColor={art.haze} stopOpacity={0.12} />
                <Stop offset="100%" stopColor={art.haze} stopOpacity={0} />
              </RadialGradient>
              <RadialGradient id={coreId} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.5} />
                <Stop offset="34%" stopColor={art.core} stopOpacity={0.3} />
                <Stop offset="70%" stopColor={art.core} stopOpacity={0.1} />
                <Stop offset="100%" stopColor={art.core} stopOpacity={0} />
              </RadialGradient>
            </Defs>

            {/* Translucent, offset veils feather the edge — no hard outer cutout. The
                EXTENTS (1.52 / 1.24 / 0.88 / 0.7) are unchanged; only the light is. */}
            <Path d={cloudPath(projected.x, projected.y, rx * 1.52, ry * 1.52, seed)} fill={`url(#${hazeId})`} opacity={0.5} />
            <Path d={cloudPath(projected.x, projected.y, rx * 1.52, ry * 1.52, seed)} fill={`url(#${coolId})`} opacity={0.38} />
            <Path d={cloudPath(projected.x - rx * 0.2, projected.y + ry * 0.06, rx * 1.24, ry * 1.12, seed + 3)} fill={`url(#${warmId})`} opacity={0.6} />
            <Path d={cloudPath(projected.x + rx * 0.28, projected.y - ry * 0.2, rx * 0.88, ry * 0.86, seed + 7)} fill={`url(#${coolId})`} opacity={0.56} />
            <Path d={cloudPath(projected.x + rx * 0.08, projected.y + ry * 0.26, rx * 0.7, ry * 0.62, seed + 11)} fill={`url(#${warmId})`} opacity={0.52} />
            {/* NEW inner veil — pure detail, well inside the existing silhouette. It adds
                the sense of internal structure that separates "astrophotograph" from
                "painted blob", and cannot enlarge the object. */}
            <Path d={cloudPath(projected.x - rx * 0.12, projected.y - ry * 0.1, rx * 0.46, ry * 0.44, seed + 17)} fill={`url(#${coolId})`} opacity={0.44} />

            {/* No dark oval/dust stamp. The centre is only a quiet, diffuse glow. */}
            <Circle cx={projected.x} cy={projected.y} r={Math.max(7, base * 0.3)} fill={`url(#${coreId})`} />
            {/* Embedded stars — the trick that makes a nebula read as a real object in a
                real star field instead of a decal floating on top of one. */}
            <Circle cx={projected.x - base * 0.18} cy={projected.y + base * 0.08} r={1.1} fill="#FFFDF5" opacity={0.8} />
            <Circle cx={projected.x + base * 0.22} cy={projected.y - base * 0.13} r={0.8} fill="#EAF4FF" opacity={0.74} />
            <Circle cx={projected.x + base * 0.05} cy={projected.y + base * 0.24} r={0.7} fill="#FFF6E2" opacity={0.6} />
            <Circle cx={projected.x - base * 0.3} cy={projected.y - base * 0.2} r={0.6} fill="#F2F8FF" opacity={0.52} />
          </G>
        );
      })}
    </Svg>
  );
}
