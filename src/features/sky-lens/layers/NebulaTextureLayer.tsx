import React from "react";
import { Circle, Defs, G, Image as SvgImage, Mask, RadialGradient, Rect, Stop, Text as SvgText } from "react-native-svg";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import type { NebulaType } from "../data/nebulae";
import type { ProjectFn, SkyPalette, SelectedObject } from "../SkyLensVisual";
import type { LabelPlacer } from "../labelLayout";
import type { CameraFov } from "../ar/SkyLensProjection";

// Texture-based nebulae (Phase C rebuild). Each major nebula is a soft PNG glow
// positioned at its real RA/Dec (projected to az/alt → screen), sized from its real
// catalog angular size and scaling with zoom — the billboard approach the Milky Way
// core photo uses, applied per nebula.
//
// Each image is masked by a RADIAL FEATHER (same as MilkyWayCoreLayer): the outer
// edge fades to transparent, so (a) the square PNG boundary + any light edge halo from
// the source art vanish, and (b) it reads as a soft cloud, not a stamp. Kept a barely-
// there ghostly wash you DISCOVER; it emerges as the eye adapts (`reveal`).

type Props = {
  nebulae: HorizontalNebula[];
  project: ProjectFn;
  fov: CameraFov;
  box: { width: number; height: number };
  palette: SkyPalette;
  nightMode: boolean;
  showLabels?: boolean;
  fullSphere?: boolean;
  reveal?: number;       // 0..1 Adaptive Eye Response — emerge on dwell
  nebulaBortle?: number; // sky-quality nebula opacity (0 city → 1 dark)
  placeLabel?: LabelPlacer;
  onSelect: (object: SelectedObject) => void;
};

const TYPE_LABEL: Record<NebulaType, string> = {
  emission: "Emission Nebula",
  reflection: "Reflection Nebula",
  galaxy: "Galaxy",
  cluster: "Globular Cluster",
  planetary: "Planetary Nebula",
  supernova: "Supernova Remnant",
};

// Real nebulae are tiny to the eye; magnify hard so they read as LARGE soft clouds
// (Lagoon fills a real chunk of screen), keeping the RELATIVE sizes true.
const MAGNIFY = 22;
const MIN_SIZE = 60; // px

export function NebulaTextureLayer({
  nebulae, project, fov, box, palette, nightMode, showLabels = true,
  fullSphere = false, reveal = 0, nebulaBortle = 0.5, placeLabel, onSelect,
}: Props) {
  if (nightMode) return null;
  const pxPerDeg = box.width / fov.horizontalDegrees;
  const bortle = Math.max(0, Math.min(1, nebulaBortle));
  // Default base: barely-there ~0.15 → 0.25 at a dark site. Per-nebula `textureOpacity`
  // overrides it (some, like North America, need to sit further back). A small dwell
  // deepening on top so they still emerge with the eye adaptation.
  const defaultBase = Math.min(0.25, 0.15 + 0.1 * bortle);
  const revealMod = 0.9 + 0.1 * reveal;

  return (
    <G>
      {nebulae.map((n) => {
        if (!n.texture || !n.angularSizeArcmin) return null;
        if (!n.aboveHorizon && !fullSphere && n.altitudeDegrees < -10) return null;
        const p = project(n.azimuthDegrees, n.altitudeDegrees);
        if (!p.onScreen) return null;

        const size = Math.max(MIN_SIZE, (n.angularSizeArcmin / 60) * pxPerDeg * MAGNIFY);
        const base = n.textureOpacity ?? defaultBase;
        const op = base * revealMod * (n.aboveHorizon ? 1 : 0.25);
        const r = size / 2;
        const angle = n.textureAngle ?? 0;

        return (
          <G key={n.id}>
            <Defs>
              {/* radial feather → transparent outer edge (kills the square boundary +
                  any white halo in the source PNG, and softens it into a cloud) */}
              <RadialGradient id={`nf-${n.id}`} cx={p.x} cy={p.y} r={r} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#fff" stopOpacity="1" />
                <Stop offset="0.55" stopColor="#fff" stopOpacity="1" />
                <Stop offset="1" stopColor="#fff" stopOpacity="0" />
              </RadialGradient>
              <Mask id={`nm-${n.id}`} maskUnits="userSpaceOnUse">
                <Rect x={p.x - r} y={p.y - r} width={size} height={size} fill={`url(#nf-${n.id})`} />
              </Mask>
            </Defs>

            <G mask={`url(#nm-${n.id})`} opacity={op}>
              <G transform={angle ? `rotate(${angle} ${p.x.toFixed(1)} ${p.y.toFixed(1)})` : undefined}>
                <SvgImage
                  href={n.texture}
                  x={p.x - r}
                  y={p.y - r}
                  width={size}
                  height={size}
                  preserveAspectRatio="xMidYMid slice"
                />
              </G>
            </G>

            {/* transparent tap target → info card (outside the mask, so it stays crisp) */}
            <Circle
              cx={p.x}
              cy={p.y}
              r={Math.max(r * 0.5, 26)}
              fill="transparent"
              onPress={() =>
                onSelect({
                  kind: "nebula",
                  id: n.id,
                  name: n.name,
                  subtitle: `${n.catalog} · ${TYPE_LABEL[n.type]}`,
                  facts: [
                    { label: "Type", value: TYPE_LABEL[n.type] },
                    { label: "Distance", value: n.distanceLy },
                    { label: "Constellation", value: n.constellation },
                    { label: "Visibility", value: n.visibility },
                    { label: "Best viewed", value: n.bestMonths },
                  ],
                  description: n.description,
                })
              }
            />

            {showLabels && (() => {
              const ly = p.y + Math.min(r * 0.55, 70) + 4;
              const lp = placeLabel ? placeLabel(p.x, ly, n.name, 12) : { x: p.x, y: ly };
              return (
                <SvgText x={lp.x} y={lp.y} fill={palette.starLabel} fontSize={12} fontWeight="400" textAnchor="middle" opacity={0.7}>
                  {n.name}
                </SvgText>
              );
            })()}
          </G>
        );
      })}
    </G>
  );
}
