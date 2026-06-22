import { Horizon, Observer } from "astronomy-engine";
import type { ObserverLocation } from "../accuracy/SkyLensAccuracyTypes";
import { ZODIAC_SIGNS, type ZodiacSign } from "../data/zodiac";

// Resolves the 12 zodiac constellations to horizontal coordinates, works out which
// tropical sign the Sun is currently in, and builds the perpendicular boundary
// ticks where each 30° sign band meets the ecliptic. Pure module (slow tick).

const OBLIQUITY = 23.4393;
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function eclipticToEquatorial(lonDeg: number, latDeg: number): { raHours: number; decDeg: number } {
  const l = lonDeg * D2R;
  const b = latDeg * D2R;
  const e = OBLIQUITY * D2R;
  const dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
  let ra = Math.atan2(
    Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e),
    Math.cos(l)
  ) * R2D;
  ra = ((ra % 360) + 360) % 360;
  return { raHours: ra / 15, decDeg: dec * R2D };
}

// Apparent ecliptic longitude of the Sun (deg) — standard low-precision formula,
// good to ~0.01°, which is plenty for picking the 30° sign band.
function sunEclipticLongitude(when: Date): number {
  const jd = 2440587.5 + when.getTime() / 86400000;
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * D2R;
  let lambda = L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  return ((lambda % 360) + 360) % 360;
}

export interface HorizontalPoint {
  azimuthDegrees: number;
  altitudeDegrees: number;
  aboveHorizon: boolean;
}

export interface HorizontalZodiacSign extends ZodiacSign {
  starPositions: (HorizontalPoint & { magnitude: number })[];
  center: HorizontalPoint;
}

export interface ZodiacBoundary {
  a: HorizontalPoint; // ecliptic latitude -8°
  b: HorizontalPoint; // ecliptic latitude +8°
}

export interface ZodiacData {
  signs: HorizontalZodiacSign[];
  boundaries: ZodiacBoundary[];
  sunSignIndex: number; // which sign the Sun is in (tropical) → ZODIAC_SIGNS index
  sunLongitude: number;
}

export function computeZodiac(location: ObserverLocation, when: Date = new Date()): ZodiacData {
  const observer = new Observer(
    location.latitudeDegrees,
    location.longitudeDegrees,
    location.altitudeMeters ?? 0
  );
  const toHoriz = (raHours: number, decDeg: number): HorizontalPoint => {
    const h = Horizon(when, observer, raHours, decDeg, "normal");
    return { azimuthDegrees: h.azimuth, altitudeDegrees: h.altitude, aboveHorizon: h.altitude > 0 };
  };

  const signs: HorizontalZodiacSign[] = ZODIAC_SIGNS.map((sign) => ({
    ...sign,
    starPositions: sign.stars.map((s) => ({ ...toHoriz(s.raHours, s.decDegrees), magnitude: s.magnitude })),
    center: toHoriz(sign.centerRaHours, sign.centerDecDegrees),
  }));

  // Boundary ticks: a short perpendicular segment across the ecliptic at each band edge.
  const boundaries: ZodiacBoundary[] = ZODIAC_SIGNS.map((sign) => {
    const lo = eclipticToEquatorial(sign.lonStart, -8);
    const hi = eclipticToEquatorial(sign.lonStart, 8);
    return { a: toHoriz(lo.raHours, lo.decDeg), b: toHoriz(hi.raHours, hi.decDeg) };
  });

  const sunLongitude = sunEclipticLongitude(when);
  const sunSignIndex = Math.floor(sunLongitude / 30) % 12;

  return { signs, boundaries, sunSignIndex, sunLongitude };
}
