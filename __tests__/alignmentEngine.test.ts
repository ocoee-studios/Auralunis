// __tests__/alignmentEngine.test.ts
// Unit tests for the core alignment math.
// Run: npx jest __tests__/alignmentEngine.test.ts

import {
  calculateAlignment,
  type SpatialTarget,
  type AlignmentResult,
} from "../src/utils/alignmentEngine";

// Mock observer: roughly New York City
const NYC = {
  latitudeDegrees: 40.7128,
  longitudeDegrees: -74.006,
  altitudeMeters: 10,
};

// Mock pointing: looking north, 45° elevation
const NORTH_45 = {
  azimuthDegrees: 0,
  altitudeDegrees: 45,
  rollDegrees: 0,
};

// ISS-like target overhead
const ISS: SpatialTarget = {
  id: "iss",
  name: "ISS",
  latitudeDegrees: 41.0,
  longitudeDegrees: -74.0,
  altitudeKm: 420,
};

// Target on the opposite side of the globe
const FAR_TARGET: SpatialTarget = {
  id: "far",
  name: "Far Away",
  latitudeDegrees: -35.0,
  longitudeDegrees: 149.0,
  altitudeKm: 420,
};

describe("calculateAlignment", () => {
  test("returns valid AlignmentResult structure", () => {
    const result = calculateAlignment(NYC, NORTH_45, ISS);
    expect(result).toHaveProperty("targetAzimuth");
    expect(result).toHaveProperty("targetElevation");
    expect(result).toHaveProperty("azimuthDiff");
    expect(result).toHaveProperty("elevationDiff");
    expect(result).toHaveProperty("totalAngularError");
    expect(result).toHaveProperty("alignmentScore");
    expect(result).toHaveProperty("isLocked");
  });

  test("alignment score is 0-100", () => {
    const result = calculateAlignment(NYC, NORTH_45, ISS);
    expect(result.alignmentScore).toBeGreaterThanOrEqual(0);
    expect(result.alignmentScore).toBeLessThanOrEqual(100);
  });

  test("target azimuth is 0-360", () => {
    const result = calculateAlignment(NYC, NORTH_45, ISS);
    expect(result.targetAzimuth).toBeGreaterThanOrEqual(0);
    expect(result.targetAzimuth).toBeLessThanOrEqual(360);
  });

  test("target elevation is non-negative for overhead target", () => {
    const result = calculateAlignment(NYC, NORTH_45, ISS);
    expect(result.targetElevation).toBeGreaterThanOrEqual(0);
  });

  test("near-overhead target produces high score when pointing at it", () => {
    // Target almost directly above NYC — pointing straight up
    const overhead: SpatialTarget = {
      id: "overhead",
      name: "Overhead",
      latitudeDegrees: 40.72,
      longitudeDegrees: -74.01,
      altitudeKm: 420,
    };
    const pointingUp = { azimuthDegrees: 0, altitudeDegrees: 85, rollDegrees: 0 };
    const result = calculateAlignment(NYC, pointingUp, overhead);
    expect(result.alignmentScore).toBeGreaterThan(70);
  });

  test("far target produces low score", () => {
    const result = calculateAlignment(NYC, NORTH_45, FAR_TARGET);
    expect(result.alignmentScore).toBeLessThan(30);
  });

  test("isLocked is true when total angular error < 3.5°", () => {
    // Point exactly at the target
    const target: SpatialTarget = {
      id: "close",
      name: "Close",
      latitudeDegrees: 40.75,
      longitudeDegrees: -73.99,
      altitudeKm: 420,
    };
    const result = calculateAlignment(NYC, NORTH_45, target);
    // We compute the expected azimuth/elevation, then point at it
    const pointing = {
      azimuthDegrees: result.targetAzimuth,
      altitudeDegrees: result.targetElevation,
      rollDegrees: 0,
    };
    const locked = calculateAlignment(NYC, pointing, target);
    expect(locked.isLocked).toBe(true);
    expect(locked.alignmentScore).toBe(100);
    expect(locked.totalAngularError).toBeLessThan(3.5);
  });

  test("azimuthDiff is signed and in range [-180, 180]", () => {
    const result = calculateAlignment(NYC, NORTH_45, ISS);
    expect(result.azimuthDiff).toBeGreaterThanOrEqual(-180);
    expect(result.azimuthDiff).toBeLessThanOrEqual(180);
  });

  test("handles 360-degree compass wrapping", () => {
    // Pointing at 350°, target at azimuth ~10° → diff should be ~20°, not ~340°
    const pointing350 = { azimuthDegrees: 350, altitudeDegrees: 45, rollDegrees: 0 };
    const targetEast: SpatialTarget = {
      id: "east",
      name: "East",
      latitudeDegrees: 42.0,
      longitudeDegrees: -73.5,
      altitudeKm: 420,
    };
    const result = calculateAlignment(NYC, pointing350, targetEast);
    expect(Math.abs(result.azimuthDiff)).toBeLessThan(90);
  });

  test("handles equatorial target", () => {
    const equatorial: SpatialTarget = {
      id: "eq",
      name: "Equatorial",
      latitudeDegrees: 0,
      longitudeDegrees: -74.0,
      altitudeKm: 420,
    };
    const result = calculateAlignment(NYC, NORTH_45, equatorial);
    expect(result.targetAzimuth).toBeGreaterThan(150); // should be roughly south
    expect(result.targetAzimuth).toBeLessThan(210);
  });

  test("handles polar target", () => {
    const polar: SpatialTarget = {
      id: "polar",
      name: "North Pole",
      latitudeDegrees: 89.9,
      longitudeDegrees: 0,
      altitudeKm: 420,
    };
    const result = calculateAlignment(NYC, NORTH_45, polar);
    expect(result.targetAzimuth).toBeLessThan(30); // roughly north
  });

  test("handles same-location observer and target", () => {
    const sameSpot: SpatialTarget = {
      id: "same",
      name: "Same",
      latitudeDegrees: NYC.latitudeDegrees,
      longitudeDegrees: NYC.longitudeDegrees,
      altitudeKm: 420,
    };
    const straightUp = { azimuthDegrees: 0, altitudeDegrees: 89, rollDegrees: 0 };
    const result = calculateAlignment(NYC, straightUp, sameSpot);
    // Should be nearly straight up with very high elevation
    expect(result.targetElevation).toBeGreaterThan(80);
  });

  test("decayAlert and velocityKms optional fields don't break calculation", () => {
    const decaying: SpatialTarget = {
      id: "decay",
      name: "Decaying",
      latitudeDegrees: 45,
      longitudeDegrees: -90,
      altitudeKm: 120,
      decayAlert: true,
      velocityKms: 7.2,
    };
    const result = calculateAlignment(NYC, NORTH_45, decaying);
    expect(result.alignmentScore).toBeGreaterThanOrEqual(0);
    expect(result.alignmentScore).toBeLessThanOrEqual(100);
  });
});
