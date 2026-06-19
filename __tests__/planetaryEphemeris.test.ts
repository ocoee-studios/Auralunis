// __tests__/planetaryEphemeris.test.ts
// Unit tests for the Keplerian planetary position model.
// Verifies that computed positions are in reasonable ranges for known dates.
// Run: npx jest __tests__/planetaryEphemeris.test.ts

import {
  computePlanetaryTargets,
  planetAlignmentDiff,
  PLANETS,
} from "../src/utils/planetaryEphemeris";

// NYC observer
const NYC = {
  latitudeDegrees: 40.7128,
  longitudeDegrees: -74.006,
  altitudeMeters: 10,
};

// Known date for testing — Jan 1, 2025 00:00 UTC
const JAN_2025 = new Date("2025-01-01T00:00:00Z");

describe("PLANETS catalog", () => {
  test("contains all 7 planets", () => {
    const ids = Object.keys(PLANETS);
    expect(ids).toContain("mercury");
    expect(ids).toContain("venus");
    expect(ids).toContain("mars");
    expect(ids).toContain("jupiter");
    expect(ids).toContain("saturn");
    expect(ids).toContain("uranus");
    expect(ids).toContain("neptune");
    expect(ids.length).toBe(7);
  });

  test("each planet has valid semi-major axis", () => {
    Object.values(PLANETS).forEach(p => {
      expect(p.semiMajorAxisAU).toBeGreaterThan(0.3);
      expect(p.semiMajorAxisAU).toBeLessThan(35);
    });
  });

  test("each planet has a radar color", () => {
    Object.values(PLANETS).forEach(p => {
      expect(p.radarColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe("computePlanetaryTargets", () => {
  test("returns 7 targets", () => {
    const targets = computePlanetaryTargets(NYC, JAN_2025);
    expect(targets.length).toBe(7);
  });

  test("each target has valid azimuth (0-360)", () => {
    const targets = computePlanetaryTargets(NYC, JAN_2025);
    targets.forEach(t => {
      expect(t.azimuth).toBeGreaterThanOrEqual(0);
      expect(t.azimuth).toBeLessThanOrEqual(360);
    });
  });

  test("each target has altitude in reasonable range (-90 to 90)", () => {
    const targets = computePlanetaryTargets(NYC, JAN_2025);
    targets.forEach(t => {
      expect(t.altitude).toBeGreaterThanOrEqual(-90);
      expect(t.altitude).toBeLessThanOrEqual(90);
    });
  });

  test("each target has positive distance in AU", () => {
    const targets = computePlanetaryTargets(NYC, JAN_2025);
    targets.forEach(t => {
      expect(t.distAU).toBeGreaterThan(0);
    });
  });

  test("Mercury and Venus have distance < 2 AU (inner planets)", () => {
    const targets = computePlanetaryTargets(NYC, JAN_2025);
    const mercury = targets.find(t => t.id === "mercury");
    const venus = targets.find(t => t.id === "venus");
    expect(mercury?.distAU).toBeLessThan(2);
    expect(venus?.distAU).toBeLessThan(2);
  });

  test("Jupiter and Saturn have distance > 3 AU (outer planets)", () => {
    const targets = computePlanetaryTargets(NYC, JAN_2025);
    const jupiter = targets.find(t => t.id === "jupiter");
    const saturn = targets.find(t => t.id === "saturn");
    expect(jupiter?.distAU).toBeGreaterThan(3);
    expect(saturn?.distAU).toBeGreaterThan(7);
  });

  test("Neptune has distance > 28 AU", () => {
    const targets = computePlanetaryTargets(NYC, JAN_2025);
    const neptune = targets.find(t => t.id === "neptune");
    expect(neptune?.distAU).toBeGreaterThan(28);
    expect(neptune?.distAU).toBeLessThan(32);
  });

  test("results differ for different observer locations", () => {
    const tokyo = { latitudeDegrees: 35.68, longitudeDegrees: 139.69, altitudeMeters: 10 };
    const nycTargets = computePlanetaryTargets(NYC, JAN_2025);
    const tokyoTargets = computePlanetaryTargets(tokyo, JAN_2025);

    // Same planet should have different az/alt from different locations
    const nycJupiter = nycTargets.find(t => t.id === "jupiter");
    const tokyoJupiter = tokyoTargets.find(t => t.id === "jupiter");
    expect(nycJupiter?.azimuth).not.toBeCloseTo(tokyoJupiter?.azimuth ?? 0, 0);
  });

  test("results change over time (6 month gap)", () => {
    const jan = computePlanetaryTargets(NYC, new Date("2025-01-01T00:00:00Z"));
    const jul = computePlanetaryTargets(NYC, new Date("2025-07-01T00:00:00Z"));

    const janMars = jan.find(t => t.id === "mars");
    const julMars = jul.find(t => t.id === "mars");
    // Mars position should change significantly over 6 months
    expect(Math.abs((janMars?.azimuth ?? 0) - (julMars?.azimuth ?? 0))).toBeGreaterThan(10);
  });

  test("each target has SpatialTarget-compatible fields", () => {
    const targets = computePlanetaryTargets(NYC, JAN_2025);
    targets.forEach(t => {
      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("name");
      expect(t).toHaveProperty("latitudeDegrees");
      expect(t).toHaveProperty("longitudeDegrees");
      expect(t).toHaveProperty("altitudeKm");
      expect(typeof t.altitudeKm).toBe("number");
      expect(t.altitudeKm).toBeGreaterThan(0);
    });
  });
});

describe("planetAlignmentDiff", () => {
  test("returns zero error when pointing exactly at target", () => {
    const result = planetAlignmentDiff(100, 30, 100, 30);
    expect(result.azimuthDiff).toBeCloseTo(0, 5);
    expect(result.elevationDiff).toBeCloseTo(0, 5);
    expect(result.totalAngularError).toBeCloseTo(0, 5);
    expect(result.alignmentScore).toBe(100);
    expect(result.isLocked).toBe(true);
  });

  test("returns correct diff for known offset", () => {
    const result = planetAlignmentDiff(100, 30, 110, 40);
    expect(result.azimuthDiff).toBeCloseTo(10, 0);
    expect(result.elevationDiff).toBeCloseTo(10, 0);
    expect(result.totalAngularError).toBeCloseTo(14.14, 0);
    expect(result.isLocked).toBe(false);
  });

  test("handles compass wrapping (350° → 10°)", () => {
    const result = planetAlignmentDiff(350, 30, 10, 30);
    expect(result.azimuthDiff).toBeCloseTo(20, 0);
    expect(result.totalAngularError).toBeCloseTo(20, 0);
  });

  test("handles compass wrapping (10° → 350°)", () => {
    const result = planetAlignmentDiff(10, 30, 350, 30);
    expect(result.azimuthDiff).toBeCloseTo(-20, 0);
    expect(result.totalAngularError).toBeCloseTo(20, 0);
  });

  test("score decreases linearly with error", () => {
    const close = planetAlignmentDiff(100, 30, 105, 30);
    const far = planetAlignmentDiff(100, 30, 150, 30);
    expect(close.alignmentScore).toBeGreaterThan(far.alignmentScore);
  });

  test("locked threshold is 3.5 degrees", () => {
    const justInside = planetAlignmentDiff(100, 30, 102, 31);
    const justOutside = planetAlignmentDiff(100, 30, 103, 32);
    // 2° + 1° → ~2.24° error (inside 3.5°)
    expect(justInside.isLocked).toBe(true);
    // 3° + 2° → ~3.6° error (outside 3.5°)
    expect(justOutside.isLocked).toBe(false);
  });
});
