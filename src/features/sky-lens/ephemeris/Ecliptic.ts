import { Horizon, Observer } from "astronomy-engine";
import type { ObserverLocation } from "../accuracy/SkyLensAccuracyTypes";
import type { MilkyWayPoint } from "./MilkyWay";

// The ecliptic — the plane of Earth's orbit, i.e. the path the Sun (and roughly
// the Moon + planets) trace across the sky. Sampled along ecliptic longitude at
// latitude 0, converted ecliptic → equatorial (J2000 obliquity) → horizontal.
// Rendered as a thin subtle gold line, not a band.

const OBLIQUITY = 23.4393; // J2000 mean obliquity of the ecliptic (deg)
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function eclipticToEquatorial(lonDeg: number): { raHours: number; decDegrees: number } {
  const l = lonDeg * D2R;
  const e = OBLIQUITY * D2R;
  // beta = 0 along the ecliptic itself.
  const dec = Math.asin(Math.sin(e) * Math.sin(l));
  let ra = Math.atan2(Math.cos(e) * Math.sin(l), Math.cos(l)) * R2D;
  ra = ((ra % 360) + 360) % 360;
  return { raHours: ra / 15, decDegrees: dec * R2D };
}

export function computeEcliptic(
  location: ObserverLocation,
  when: Date = new Date(),
  stepDegrees = 4
): MilkyWayPoint[] {
  const observer = new Observer(
    location.latitudeDegrees,
    location.longitudeDegrees,
    location.altitudeMeters ?? 0
  );
  const out: MilkyWayPoint[] = [];
  for (let lon = 0; lon <= 360; lon += stepDegrees) {
    const { raHours, decDegrees } = eclipticToEquatorial(lon);
    const h = Horizon(when, observer, raHours, decDegrees, "normal");
    out.push({ azimuthDegrees: h.azimuth, altitudeDegrees: h.altitude, aboveHorizon: h.altitude > 0 });
  }
  return out;
}
