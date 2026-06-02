import {
  DEFAULT_SKY_LENS_THRESHOLDS,
  evaluateSkyLensAccuracy
} from "./SkyLensMath";
import { simulateCalibratedOverlay } from "./SkyLensMockTargets";
import { computeExpectedTargets, DEFAULT_OBSERVER } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "./SkyLensAccuracyTypes";

// Self-test: real ephemeris truth vs a simulated calibrated overlay reading.
// On-device, pass the real ObserverLocation and replace the simulated overlay
// with the live sensor-fused positions.
export function runSkyLensAccuracySelfTest(
  location: ObserverLocation = DEFAULT_OBSERVER,
  when: Date = new Date()
) {
  const expected = computeExpectedTargets(location, when);
  const actual = simulateCalibratedOverlay(expected);

  const results = expected.map((target) => {
    const measured = actual.find((a) => a.id === target.id);
    if (!measured) {
      return {
        targetId: target.id,
        targetName: target.name,
        expectedAzimuthDegrees: target.azimuthDegrees,
        actualAzimuthDegrees: Number.NaN,
        expectedAltitudeDegrees: target.altitudeDegrees,
        actualAltitudeDegrees: Number.NaN,
        azimuthErrorDegrees: Number.POSITIVE_INFINITY,
        altitudeErrorDegrees: Number.POSITIVE_INFINITY,
        totalAngularErrorDegrees: Number.POSITIVE_INFINITY,
        pass: false
      };
    }
    return evaluateSkyLensAccuracy(
      target,
      measured,
      DEFAULT_SKY_LENS_THRESHOLDS.calibratedAROverlayToleranceDegrees
    );
  });

  return {
    generatedAtISO: new Date().toISOString(),
    thresholds: DEFAULT_SKY_LENS_THRESHOLDS,
    total: results.length,
    passed: results.filter((r) => r.pass).length,
    failed: results.filter((r) => !r.pass).length,
    results
  };
}

// Backwards-compatible alias for existing callers.
export const runSkyLensMockAccuracySuite = runSkyLensAccuracySelfTest;
