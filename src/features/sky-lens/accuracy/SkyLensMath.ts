import type {
  CelestialTarget,
  DevicePose,
  SkyLensAccuracyResult,
  SkyLensAccuracyThresholds
} from "./SkyLensAccuracyTypes";

export const DEFAULT_SKY_LENS_THRESHOLDS: SkyLensAccuracyThresholds = {
  // Math/ephemeris target tolerance. Production should aim tighter when using a real astronomy engine.
  calculationToleranceDegrees: 0.25,

  // Good practical camera-overlay target after compass/gyro calibration.
  calibratedAROverlayToleranceDegrees: 2.0,

  // Fallback tolerance before user calibrates by sweeping/figure-eight movement.
  uncalibratedAROverlayToleranceDegrees: 5.0
};

export function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

export function shortestAngleDeltaDegrees(a: number, b: number): number {
  const diff = normalizeDegrees(a - b);
  return diff > 180 ? diff - 360 : diff;
}

export function angularSeparationDegrees(
  az1: number,
  alt1: number,
  az2: number,
  alt2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const a1 = toRad(az1);
  const h1 = toRad(alt1);
  const a2 = toRad(az2);
  const h2 = toRad(alt2);

  const cosSep =
    Math.sin(h1) * Math.sin(h2) +
    Math.cos(h1) * Math.cos(h2) * Math.cos(a1 - a2);

  return toDeg(Math.acos(Math.max(-1, Math.min(1, cosSep))));
}

export function relativeTargetBearing(target: CelestialTarget, device: DevicePose) {
  return {
    relativeAzimuthDegrees: shortestAngleDeltaDegrees(
      target.azimuthDegrees,
      device.headingDegrees
    ),
    relativeAltitudeDegrees: target.altitudeDegrees - device.pitchDegrees,
    rollDegrees: device.rollDegrees
  };
}

export function evaluateSkyLensAccuracy(
  expected: CelestialTarget,
  actual: CelestialTarget,
  toleranceDegrees = DEFAULT_SKY_LENS_THRESHOLDS.calibratedAROverlayToleranceDegrees
): SkyLensAccuracyResult {
  const azimuthErrorDegrees = Math.abs(
    shortestAngleDeltaDegrees(actual.azimuthDegrees, expected.azimuthDegrees)
  );

  const altitudeErrorDegrees = Math.abs(
    actual.altitudeDegrees - expected.altitudeDegrees
  );

  const totalAngularErrorDegrees = angularSeparationDegrees(
    expected.azimuthDegrees,
    expected.altitudeDegrees,
    actual.azimuthDegrees,
    actual.altitudeDegrees
  );

  return {
    targetId: expected.id,
    targetName: expected.name,
    expectedAzimuthDegrees: expected.azimuthDegrees,
    actualAzimuthDegrees: actual.azimuthDegrees,
    expectedAltitudeDegrees: expected.altitudeDegrees,
    actualAltitudeDegrees: actual.altitudeDegrees,
    azimuthErrorDegrees,
    altitudeErrorDegrees,
    totalAngularErrorDegrees,
    pass: totalAngularErrorDegrees <= toleranceDegrees
  };
}

export function needsCompassCalibration(device: DevicePose): boolean {
  if (device.accuracyDegrees == null) return true;
  return device.accuracyDegrees > DEFAULT_SKY_LENS_THRESHOLDS.uncalibratedAROverlayToleranceDegrees;
}
