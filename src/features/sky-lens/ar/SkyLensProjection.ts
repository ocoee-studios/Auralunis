// Pure AR projection. Maps a celestial target's (azimuth, altitude) onto screen
// coordinates given where the camera is pointing, its field of view, and the
// overlay box size. No React Native imports, so it is unit-testable in plain Node.
//
// Convention: azimuth = degrees from true north, increasing clockwise
// (E = 90, S = 180, W = 270). altitude = degrees above the horizon.
// Screen: x increases right, y increases down, origin at top-left of the box.

export interface CameraPointing {
  azimuthDegrees: number; // compass direction the back camera points
  altitudeDegrees: number; // tilt of the camera above the horizon
  rollDegrees: number; // rotation about the optical axis
}

export interface CameraFov {
  horizontalDegrees: number;
  verticalDegrees: number;
}

export interface OverlayBox {
  width: number;
  height: number;
}

export interface ProjectedTarget {
  x: number;
  y: number;
  onScreen: boolean;
  behind: boolean;
  bearingDegrees: number; // direction from box center toward the target (for guidance arrows)
}

// Reasonable starting FOV for a phone back camera; tune per device on-site.
export const DEFAULT_FOV: CameraFov = { horizontalDegrees: 60, verticalDegrees: 45 };

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// ── Full-dome camera projection ───────────────────────────────────────────────
// Everything is done with unit vectors in East-North-Up (ENU) coordinates, so the
// projection is correct in EVERY direction — including straight up at the zenith,
// where the old "behind = |Δazimuth| > 90" test created dead zones (azimuth is
// degenerate near vertical). `behind` is now the true hemisphere test (the target
// is behind the camera only when it's more than 90° off the optical axis).
type Vec = { e: number; n: number; u: number };

function azAltToVec(azDeg: number, altDeg: number): Vec {
  const az = toRad(azDeg);
  const alt = toRad(altDeg);
  const ca = Math.cos(alt);
  return { e: ca * Math.sin(az), n: ca * Math.cos(az), u: Math.sin(alt) };
}

function dot(a: Vec, b: Vec): number {
  return a.e * b.e + a.n * b.n + a.u * b.u;
}

function cross(a: Vec, b: Vec): Vec {
  return {
    e: a.n * b.u - a.u * b.n,
    n: a.u * b.e - a.e * b.u,
    u: a.e * b.n - a.n * b.e
  };
}

export function projectTarget(
  pointing: CameraPointing,
  targetAzimuthDegrees: number,
  targetAltitudeDegrees: number,
  fov: CameraFov = DEFAULT_FOV,
  box: OverlayBox
): ProjectedTarget {
  // Camera basis: forward (where we point), right (horizontal, az+90 — always
  // well-defined even at the zenith), and up (= right × forward).
  const forward = azAltToVec(pointing.azimuthDegrees, pointing.altitudeDegrees);
  const right = azAltToVec(pointing.azimuthDegrees + 90, 0);
  const up = cross(right, forward);

  const target = azAltToVec(targetAzimuthDegrees, targetAltitudeDegrees);
  const depth = dot(target, forward); // cos(angle from optical axis)
  const behind = depth <= 0.0001;

  // Angles to the right of / above the optical axis (radians → degrees).
  const hAngle = (Math.atan2(dot(target, right), depth) * 180) / Math.PI;
  const vAngle = (Math.atan2(dot(target, up), depth) * 180) / Math.PI;

  // Apply camera roll so the overlay rotates with the device.
  const roll = toRad(pointing.rollDegrees);
  const hRot = hAngle * Math.cos(roll) + vAngle * Math.sin(roll);
  const vRot = -hAngle * Math.sin(roll) + vAngle * Math.cos(roll);

  const halfH = fov.horizontalDegrees / 2;
  const halfV = fov.verticalDegrees / 2;

  const x = box.width / 2 + (hRot / halfH) * (box.width / 2);
  const y = box.height / 2 - (vRot / halfV) * (box.height / 2);

  const onScreen = !behind && Math.abs(hRot) <= halfH && Math.abs(vRot) <= halfV;
  const bearingDegrees =
    (Math.atan2(y - box.height / 2, x - box.width / 2) * 180) / Math.PI;

  return {
    x,
    y,
    onScreen,
    behind,
    bearingDegrees: (bearingDegrees + 360) % 360
  };
}
