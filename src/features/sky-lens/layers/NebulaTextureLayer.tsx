import React from "react";
import { Circle, G, Image as SvgImage, Text as SvgText } from "react-native-svg";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import type { NebulaType } from "../data/nebulae";
import type { ProjectFn, SkyPalette, SelectedObject } from "../SkyLensVisual";
import type { LabelPlacer } from "../labelLayout";
import type { CameraFov } from "../ar/SkyLensProjection";

// Texture-based nebulae (Phase C rebuild). Each major nebula is a soft, glow-on-
// transparent PNG positioned at its real RA/Dec (projected to az/alt → screen), sized
// from its real catalog angular size and scaling with zoom — the same billboard
// approach the Milky Way core photo uses (MilkyWayCoreLayer), applied per nebula.
//
// Blending: react-native-svg has no reliable screen/additive blend on iOS, so the
// "glow into the sky" comes from the PNG itself — colour fading to transparent alpha,
// alpha-composited over the (now solid-dark) sky. Feathering is the PNG's own alpha.
// Kept subtle so they feel DISCOVERED; they emerge as the eye adapts (`reveal`).

type Props = {
  nebulae: HorizontalNebula[];
  project: ProjectFn;
  fov: CameraFov;
  box: { width: number; height: number };
  palette: SkyPalette;
  nightMode: boolean;
  showLabels?: boolean;
  fullSphere?: boolean;  // Planetarium: show below-horizon nebulae too
  reveal?: number;       // 0..1 Adaptive Eye Response — emerge on dwell
  nebulaBortle?: number; // sky-quality nebula opacity (0 city → 1 dark) — controls base opacity
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

// Real nebulae are tiny to the eye; magnify the catalog angular size so they read on a
// phone while keeping the RELATIVE sizes true (North America ≫ Crab). Tune on device.
const MAGNIFY = 5;
const MIN_SIZE = 44; // px — keep the smallest ones visible + tappable

export function NebulaTextureLayer({
  nebulae, project, fov, box, palette, nightMode, showLabels = true,
  fullSphere = false, reveal = 0, nebulaBortle = 0.5, placeLabel, onSelect,
}: Props) {
  if (nightMode) return null;
  const pxPerDeg = box.width / fov.horizontalDegrees;
  // Opacity 0.4–0.6 by sky quality (Bortle), dimmed a touch at rest and rising as the
  // eye adapts. The PNG's own alpha sits underneath, so on-screen peak is softer still.
  const bortle = Math.max(0, Math.min(1, nebulaBortle));
  const layerOpacity = (0.4 + 0.2 * bortle) * (0.75 + 0.25 * reveal);

  return (
    <G>
      {nebulae.map((n) => {
        if (!n.texture || !n.angularSizeArcmin) return null;
        if (!n.aboveHorizon && !fullSphere && n.altitudeDegrees < -10) return null;
        const p = project(n.azimuthDegrees, n.altitudeDegrees);
        if (!p.onScreen) return null;

        const size = Math.max(MIN_SIZE, (n.angularSizeArcmin / 60) * pxPerDeg * MAGNIFY);
        const op = layerOpacity * (n.aboveHorizon ? 1 : 0.25); // dissolve below the horizon
        const angle = n.textureAngle ?? 0;

        const image = (
          <SvgImage
            href={n.texture}
            x={p.x - size / 2}
            y={p.y - size / 2}
            width={size}
            height={size}
            preserveAspectRatio="xMidYMid meet"
            opacity={op}
          />
        );

        return (
          <G key={n.id}>
            {angle ? (
              <G transform={`rotate(${angle} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>{image}</G>
            ) : (
              image
            )}

            {/* transparent tap target → info card (labels/interactivity stay) */}
            <Circle
              cx={p.x}
              cy={p.y}
              r={Math.max(size * 0.4, 26)}
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
              const ly = p.y + Math.min(size * 0.42, 70) + 4;
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
