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

// Wrap to [-180, 180].
function normalizeSignedDegrees(degrees: number): number {
  return (((degrees + 180) % 360) + 360) % 360 - 180;
}

export function projectTarget(
  pointing: CameraPointing,
  targetAzimuthDegrees: number,
  targetAltitudeDegrees: number,
  fov: CameraFov = DEFAULT_FOV,
  box: OverlayBox
): ProjectedTarget {
  const deltaAz = normalizeSignedDegrees(targetAzimuthDegrees - pointing.azimuthDegrees);
  const deltaAlt = targetAltitudeDegrees - pointing.altitudeDegrees;

  // Azimuth spans less screen distance near the zenith; scale by mean altitude.
  const meanAlt = (targetAltitudeDegrees + pointing.altitudeDegrees) / 2;
  const horizontalAngle = deltaAz * Math.cos(toRad(Math.max(-89, Math.min(89, meanAlt))));
  const verticalAngle = deltaAlt;

  // Apply camera roll so the overlay rotates with the device.
  const roll = toRad(pointing.rollDegrees);
  const hRot = horizontalAngle * Math.cos(roll) + verticalAngle * Math.sin(roll);
  const vRot = -horizontalAngle * Math.sin(roll) + verticalAngle * Math.cos(roll);

  const halfH = fov.horizontalDegrees / 2;
  const halfV = fov.verticalDegrees / 2;

  const x = box.width / 2 + (hRot / halfH) * (box.width / 2);
  const y = box.height / 2 - (vRot / halfV) * (box.height / 2);

  const behind = Math.abs(deltaAz) > 90;
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
