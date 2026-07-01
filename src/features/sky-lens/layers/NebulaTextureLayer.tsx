import React from "react";
import { G, Image as SvgImage } from "react-native-svg";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import type { ProjectFn } from "../SkyLensVisual";
import type { CameraFov } from "../ar/SkyLensProjection";

// Texture-based nebulae (Phase C rebuild). Each major nebula is a soft, glow-on-
// transparent PNG positioned at its real RA/Dec (projected to az/alt → screen), sized
// on-sky and scaling with zoom — the same billboard approach the Milky Way core photo
// uses (MilkyWayCoreLayer), applied per nebula.
//
// Blending: react-native-svg has no reliable screen/additive blend on iOS, so the
// "glow into the sky" comes from the PNG itself — authored as colour fading to fully
// transparent alpha, alpha-composited over the dark sky. Feathering is the PNG's own
// alpha (no mask needed). Kept subtle so they feel DISCOVERED, not announced; they
// emerge as the eye adapts (Adaptive Eye Response → `reveal`).
//
// Nebulae WITHOUT a `texture` are skipped here and fall through to NebulaLayer's SVG
// gradient render, so the two can coexist while we migrate one nebula at a time.

type Props = {
  nebulae: HorizontalNebula[];
  project: ProjectFn;
  fov: CameraFov;
  box: { width: number; height: number };
  nightMode: boolean;
  fullSphere?: boolean; // Planetarium: fuller, below-horizon nebulae still shown
  reveal?: number;      // 0..1 Adaptive Eye Response — nebulae emerge as the eye adapts
};

// A whisper at rest (discovered, not announced); the PNG alpha carries most of the look.
const BASE_OPACITY = 0.32;

export function NebulaTextureLayer({ nebulae, project, fov, box, nightMode, fullSphere = false, reveal = 0 }: Props) {
  if (nightMode) return null;
  const pxPerDeg = box.width / fov.horizontalDegrees;
  const arMode = !fullSphere;
  const cap = arMode ? 0.5 : 1; // over the camera, keep them a subtle wash

  return (
    <G>
      {nebulae.map((n) => {
        if (!n.texture || !n.textureSizeDeg) return null; // only textured nebulae
        if (!n.aboveHorizon && !fullSphere && n.altitudeDegrees < -10) return null;
        const p = project(n.azimuthDegrees, n.altitudeDegrees);
        if (!p.onScreen) return null;

        const size = n.textureSizeDeg * pxPerDeg;
        // opacity: base whisper → full as the eye adapts (reveal), capped in AR, dimmed
        // below the horizon so it dissolves rather than cutting.
        const op = Math.min(cap, BASE_OPACITY * (0.55 + 0.45 * reveal)) * (n.aboveHorizon ? 1 : 0.25);
        const angle = n.textureAngle ?? 0;
        const body = (
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
              <G transform={`rotate(${angle} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>{body}</G>
            ) : (
              body
            )}
          </G>
        );
      })}
    </G>
  );
}
