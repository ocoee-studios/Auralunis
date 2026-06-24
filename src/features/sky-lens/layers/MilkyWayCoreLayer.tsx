import React from "react";
import {
  Defs,
  G,
  Image as SvgImage,
  Mask,
  RadialGradient,
  Rect,
  Stop
} from "react-native-svg";
import type { MilkyWayBand } from "../ephemeris/MilkyWay";
import type { ProjectFn } from "../SkyLensVisual";
import type { CameraFov } from "../ar/SkyLensProjection";

// A REAL photographic Milky Way core (ESO/S. Brunier panorama, CC BY 4.0), cropped
// to the galactic band (±75° longitude × ±35° latitude around the galactic center)
// and rendered as a single feathered billboard mapped to where Sagittarius actually
// sits in the sky. Naturally warm amber with the Great Rift dust lanes — far richer
// than anything procedural. Pointing at the galactic center pours a golden river of
// star clouds across the screen. Behind the constellation lines, above the camera.
const MW_CORE = require("../../../../assets/sky/milkyway-core.png");

// Angular extent of the cropped image (must match the sips crop: 150° × 70°).
const CROP_LON_DEG = 150;
const CROP_LAT_DEG = 70;

type Props = {
  band: MilkyWayBand;
  project: ProjectFn;
  fov: CameraFov;
  box: { width: number; height: number };
  nightMode: boolean;
  boost: number; // opacity multiplier (≈1 camera, higher in Planetarium)
};

export function MilkyWayCoreLayer({ band, project, fov, box, nightMode, boost }: Props) {
  if (nightMode) return null;
  if (!band.galacticCenter.aboveHorizon) return null;

  const gc = project(band.galacticCenter.azimuthDegrees, band.galacticCenter.altitudeDegrees);
  // Don't hide when gc is "behind" — the texture is large enough to still be
  // partially visible even when the center is off-screen. Only hide when the
  // galactic center is well below the horizon (not visible at all tonight).

  // Uniform scale from the horizontal field of view keeps the texture undistorted
  // (the crop's 150:70 aspect ≈ the image's native aspect). Scales with zoom: a
  // narrower FOV magnifies the core.
  const pxPerDeg = box.width / fov.horizontalDegrees;
  const w = CROP_LON_DEG * pxPerDeg;
  const h = CROP_LAT_DEG * pxPerDeg;

  // Orient the billboard along the galactic plane: angle between two band samples
  // straddling the core (l≈8° and l≈352°). center[0] is l=0 (the galactic center).
  const n = band.center.length;
  let deg = 0;
  if (n > 4) {
    const a = project(band.center[2].azimuthDegrees, band.center[2].altitudeDegrees); // l≈8
    const b = project(band.center[n - 2].azimuthDegrees, band.center[n - 2].altitudeDegrees); // l≈352
    if (!a.behind && !b.behind) {
      deg = (Math.atan2(a.y - b.y, a.x - b.x) * 180) / Math.PI;
    }
  }

  // Radial feather centered on the core — opaque at the core, fading to ZERO by the
  // time it reaches the band photo's nearest (top/bottom) edge, so the rectangle's
  // hard edges NEVER show (the old "awful line"). Tied to the image half-height so
  // the mask is fully transparent before any image edge; the circle is rotation-
  // invariant, so it melts cleanly regardless of the galactic-plane tilt.
  const radius = h * 0.5;
  // The hero. A warm golden river that GLOWS — dust lanes and star clouds clearly
  // visible, brightest at the galactic core (the radial mask centers there). ~35%
  // over the camera, brighter in Planetarium (pure-black backdrop).
  const op = Math.min(0.5, 0.35 * boost);

  return (
    <G>
      <Defs>
        <RadialGradient id="mwCoreFade" cx={gc.x} cy={gc.y} r={radius} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <Stop offset="0.45" stopColor="#ffffff" stopOpacity="0.85" />
          <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </RadialGradient>
        <Mask id="mwCoreMask" maskUnits="userSpaceOnUse">
          <Rect x={gc.x - w} y={gc.y - h} width={w * 2} height={h * 2} fill="url(#mwCoreFade)" />
        </Mask>
      </Defs>
      <G mask="url(#mwCoreMask)">
        <G transform={`rotate(${deg.toFixed(2)} ${gc.x.toFixed(1)} ${gc.y.toFixed(1)})`}>
          <SvgImage
            x={gc.x - w / 2}
            y={gc.y - h / 2}
            width={w}
            height={h}
            href={MW_CORE}
            preserveAspectRatio="xMidYMid slice"
            opacity={op}
          />
        </G>
      </G>
    </G>
  );
}
