import { Horizon, Observer } from "astronomy-engine";
import type { ObserverLocation } from "../accuracy/SkyLensAccuracyTypes";

// Resolves the galactic plane (the Milky Way band) to horizontal coordinates for
// the observer and time, so the glowing band sits where it actually is in the sky.
// Pure module (no React Native imports) — unit-testable in plain Node.

// Galactic → equatorial (J2000) rotation constants.
const RA_NGP = 192.85948; // RA of the North Galactic Pole (deg)
const DEC_NGP = 27.12825; // Dec of the North Galactic Pole (deg)
const L_NCP = 122.93192; // galactic longitude of the North Celestial Pole (deg)
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function galacticToEquatorial(lDeg: number, bDeg: number): { raHours: number; decDeg: number } {
  const l = lDeg * D2R;
  const b = bDeg * D2R;
  const decN = DEC_NGP * D2R;
  const lcp = L_NCP * D2R;
  const dec = Math.asin(Math.sin(decN) * Math.sin(b) + Math.cos(decN) * Math.cos(b) * Math.cos(lcp - l));
  const y = Math.cos(b) * Math.sin(lcp - l);
  const x = Math.cos(decN) * Math.sin(b) - Math.sin(decN) * Math.cos(b) * Math.cos(lcp - l);
  let ra = (RA_NGP * D2R + Math.atan2(y, x)) * R2D;
  ra = ((ra % 360) + 360) % 360;
  return { raHours: ra / 15, decDeg: dec * R2D };
}

export interface MilkyWayPoint {
  azimuthDegrees: number;
  altitudeDegrees: number;
  aboveHorizon: boolean;
}

export interface MilkyWayBand {
  center: MilkyWayPoint[]; // galactic equator (b=0) sampled around the sky
  galacticCenter: MilkyWayPoint; // the bright bulge toward Sagittarius (l=0)
}

export function computeMilkyWay(
  location: ObserverLocation,
  when: Date = new Date(),
  stepDegrees = 4
): MilkyWayBand {
  const observer = new Observer(
    location.latitudeDegrees,
    location.longitudeDegrees,
    location.altitudeMeters ?? 0
  );
  const toHoriz = (l: number, b: number): MilkyWayPoint => {
    const { raHours, decDeg } = galacticToEquatorial(l, b);
    const h = Horizon(when, observer, raHours, decDeg, "normal");
    return { azimuthDegrees: h.azimuth, altitudeDegrees: h.altitude, aboveHorizon: h.altitude > 0 };
  };
  const center: MilkyWayPoint[] = [];
  for (let l = 0; l <= 360; l += stepDegrees) center.push(toHoriz(l, 0));
  return { center, galacticCenter: toHoriz(0, 0) };
}
