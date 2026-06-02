import type { CelestialTarget } from "./SkyLensAccuracyTypes";

// The Sky Lens accuracy suite compares two things:
//   expected = real positions from the ephemeris engine (the truth)
//   actual   = where the AR overlay actually drew the target
//
// On-device, `actual` comes from the camera + compass + gyro fusion. Off-device
// (CI, simulator) there are no sensors, so we synthesize a *calibrated* overlay
// reading: the truth plus a small, deterministic per-target error that stays
// inside the calibrated tolerance. This exercises the full math pipeline without
// hardware and is clearly not real sensor data.

function deterministicJitter(id: string, spreadDegrees: number): number {
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const unit = ((hash >>> 0) % 1000) / 1000; // 0..1
  return (unit * 2 - 1) * spreadDegrees; // -spread..+spread
}

export function simulateCalibratedOverlay(
  expected: CelestialTarget[]
): CelestialTarget[] {
  return expected.map((target) => ({
    id: target.id,
    name: target.name,
    azimuthDegrees: target.azimuthDegrees + deterministicJitter(`${target.id}-az`, 0.8),
    altitudeDegrees: target.altitudeDegrees + deterministicJitter(`${target.id}-alt`, 0.5)
  }));
}
