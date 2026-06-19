// __tests__/chronoLight.test.ts
// Unit tests for the USNO solar position algorithm.
// Run: npx jest __tests__/chronoLight.test.ts

import {
  computeSunPosition,
  findNextGoldenEvents,
  formatCountdown,
  sunAlignedWithHeading,
} from "../src/services/ChronoLightService";

const NYC = { latitudeDegrees: 40.7128, longitudeDegrees: -74.006, altitudeMeters: 10 };
const SYDNEY = { latitudeDegrees: -33.87, longitudeDegrees: 151.21, altitudeMeters: 5 };

// Noon UTC on June 21, 2025 (summer solstice)
const SUMMER_SOLSTICE = new Date("2025-06-21T12:00:00Z");
// Noon UTC on Dec 21, 2025 (winter solstice)
const WINTER_SOLSTICE = new Date("2025-12-21T12:00:00Z");
// Midnight UTC
const MIDNIGHT_UTC = new Date("2025-06-21T00:00:00Z");

describe("computeSunPosition", () => {
  test("returns valid structure", () => {
    const pos = computeSunPosition(NYC, SUMMER_SOLSTICE);
    expect(pos).toHaveProperty("azimuth");
    expect(pos).toHaveProperty("elevation");
    expect(pos).toHaveProperty("isGoldenHour");
    expect(pos).toHaveProperty("isMagicHour");
    expect(pos).toHaveProperty("isDay");
    expect(pos).toHaveProperty("isNight");
    expect(pos).toHaveProperty("phase");
  });

  test("azimuth is 0-360", () => {
    const pos = computeSunPosition(NYC, SUMMER_SOLSTICE);
    expect(pos.azimuth).toBeGreaterThanOrEqual(0);
    expect(pos.azimuth).toBeLessThanOrEqual(360);
  });

  test("elevation is in valid range (-90 to 90)", () => {
    const pos = computeSunPosition(NYC, SUMMER_SOLSTICE);
    expect(pos.elevation).toBeGreaterThanOrEqual(-90);
    expect(pos.elevation).toBeLessThanOrEqual(90);
  });

  test("sun is high at noon on summer solstice in NYC", () => {
    // Noon UTC ≈ 8am EDT — sun should be up but not at peak
    // Let's use 5pm UTC ≈ 1pm EDT for a clear daytime check
    const noonEDT = new Date("2025-06-21T17:00:00Z");
    const pos = computeSunPosition(NYC, noonEDT);
    expect(pos.elevation).toBeGreaterThan(50);
    expect(pos.isDay).toBe(true);
  });

  test("sun is below horizon at midnight UTC in NYC (summer)", () => {
    const pos = computeSunPosition(NYC, MIDNIGHT_UTC);
    // Midnight UTC = ~8pm EDT in June — sun may still be up or just setting
    // Use 4am UTC = midnight EDT instead
    const midnightEDT = new Date("2025-06-21T04:00:00Z");
    const pos2 = computeSunPosition(NYC, midnightEDT);
    expect(pos2.elevation).toBeLessThan(0);
  });

  test("southern hemisphere has different elevation pattern", () => {
    // June solstice: NYC summer, Sydney winter
    const nycPos = computeSunPosition(NYC, SUMMER_SOLSTICE);
    const sydPos = computeSunPosition(SYDNEY, SUMMER_SOLSTICE);
    // At noon UTC: NYC should have higher sun than Sydney in June
    expect(nycPos.elevation).toBeGreaterThan(sydPos.elevation);
  });

  test("phase values are valid", () => {
    const validPhases = ["dawn", "golden-dawn", "day", "golden-dusk", "dusk", "night"];
    const pos = computeSunPosition(NYC, SUMMER_SOLSTICE);
    expect(validPhases).toContain(pos.phase);
  });

  test("golden hour flags are mutually exclusive with day/night", () => {
    const pos = computeSunPosition(NYC, SUMMER_SOLSTICE);
    if (pos.isGoldenHour) {
      expect(pos.isDay).toBe(false);
      expect(pos.isNight).toBe(false);
    }
    if (pos.isDay) {
      expect(pos.isGoldenHour).toBe(false);
      expect(pos.isNight).toBe(false);
    }
  });
});

describe("findNextGoldenEvents", () => {
  test("returns 0-2 events", () => {
    const events = findNextGoldenEvents(NYC);
    expect(events.length).toBeGreaterThanOrEqual(0);
    expect(events.length).toBeLessThanOrEqual(2);
  });

  test("events have valid structure", () => {
    const events = findNextGoldenEvents(NYC);
    events.forEach(e => {
      expect(e).toHaveProperty("azimuth");
      expect(e).toHaveProperty("minutesUntil");
      expect(e).toHaveProperty("timestamp");
      expect(e).toHaveProperty("type");
      expect(["dawn", "dusk"]).toContain(e.type);
      expect(e.azimuth).toBeGreaterThanOrEqual(0);
      expect(e.azimuth).toBeLessThanOrEqual(360);
    });
  });
});

describe("formatCountdown", () => {
  test("returns 'NOW' for 0 minutes", () => {
    expect(formatCountdown(0)).toBe("NOW");
  });

  test("returns minutes only for < 60", () => {
    expect(formatCountdown(45)).toBe("45m");
  });

  test("returns hours and minutes for >= 60", () => {
    expect(formatCountdown(90)).toBe("1h 30m");
  });

  test("returns negative as NOW", () => {
    expect(formatCountdown(-5)).toBe("NOW");
  });
});

describe("sunAlignedWithHeading", () => {
  test("aligned when within 15 degrees", () => {
    expect(sunAlignedWithHeading(180, 185)).toBe(true);
    expect(sunAlignedWithHeading(180, 175)).toBe(true);
  });

  test("not aligned when far apart", () => {
    expect(sunAlignedWithHeading(180, 90)).toBe(false);
  });

  test("aligned when backlit (opposite direction)", () => {
    // Sun at 10°, street heading at 190° (opposite) → backlit alignment
    expect(sunAlignedWithHeading(10, 190)).toBe(true);
  });

  test("handles compass wrap", () => {
    expect(sunAlignedWithHeading(5, 355)).toBe(true);
    expect(sunAlignedWithHeading(355, 5)).toBe(true);
  });
});
