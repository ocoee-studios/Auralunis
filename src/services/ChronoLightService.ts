// ChronoLightService.ts
// Chrono-Light — Golden Hour Shadow Sniper.
// Computes the sun's real-time azimuth and elevation from the observer's GPS.
// Golden hour windows: civil twilight (sun -6° to 0°) and magic hour (0° to 6°).
// Provides a "next golden ray" countdown and street-heading intersection check.

import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface SunPosition {
  azimuth: number;    // degrees from north, clockwise
  elevation: number;  // degrees above horizon (negative = below)
  isGoldenHour: boolean;    // sun 0° to 6° above horizon
  isMagicHour: boolean;     // sun -6° to 0° (civil twilight)
  isDay: boolean;           // sun > 6°
  isNight: boolean;         // sun < -6°
  phase: "dawn" | "golden-dawn" | "day" | "golden-dusk" | "dusk" | "night";
}

export interface GoldenRayEvent {
  /** Sun azimuth at the moment of the ray */
  azimuth: number;
  /** Minutes until this event (negative = in the past today) */
  minutesUntil: number;
  /** ISO timestamp */
  timestamp: string;
  type: "dawn" | "dusk";
}

function toRad(d: number): number { return d * Math.PI / 180; }
function toDeg(r: number): number { return r * 180 / Math.PI; }
function mod360(d: number): number { return ((d % 360) + 360) % 360; }

function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Compute solar position using the USNO simplified algorithm (~0.01° accuracy) */
export function computeSunPosition(observer: ObserverLocation, date: Date = new Date()): SunPosition {
  const jd = julianDay(date);
  const n = jd - 2451545.0; // days since J2000.0

  // Mean longitude and mean anomaly
  const L = mod360(280.460 + 0.9856474 * n);
  const g = toRad(mod360(357.528 + 0.9856003 * n));

  // Ecliptic longitude
  const lambda = toRad(L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g));

  // Obliquity of ecliptic
  const eps = toRad(23.439 - 0.0000004 * n);

  // Right ascension and declination
  const sinLambda = Math.sin(lambda);
  const ra = toDeg(Math.atan2(Math.cos(eps) * sinLambda, Math.cos(lambda)));
  const dec = toDeg(Math.asin(Math.sin(eps) * sinLambda));

  // Greenwich Mean Sidereal Time
  const GMST = mod360(280.46061837 + 360.98564736629 * (jd - 2451545.0));
  const LST = mod360(GMST + observer.longitudeDegrees);
  const HA = toRad(mod360(LST - ra));

  const lat = toRad(observer.latitudeDegrees);
  const decRad = toRad(dec);

  const sinAlt = Math.sin(decRad) * Math.sin(lat) + Math.cos(decRad) * Math.cos(lat) * Math.cos(HA);
  const elevation = toDeg(Math.asin(Math.max(-1, Math.min(1, sinAlt))));

  const cosAz = (Math.sin(decRad) - Math.sin(lat) * sinAlt) / (Math.cos(lat) * Math.cos(toRad(elevation)));
  let azimuth = toDeg(Math.acos(Math.max(-1, Math.min(1, cosAz))));
  if (Math.sin(HA) > 0) azimuth = 360 - azimuth;

  const el = elevation;
  const isGoldenHour = el >= 0 && el <= 6;
  const isMagicHour = el >= -6 && el < 0;
  const isDay = el > 6;
  const isNight = el < -6;

  let phase: SunPosition["phase"] = "night";
  if (isDay) phase = "day";
  else if (isGoldenHour && azimuth < 180) phase = "golden-dawn";
  else if (isGoldenHour) phase = "golden-dusk";
  else if (isMagicHour && azimuth < 180) phase = "dawn";
  else if (isMagicHour) phase = "dusk";

  return {
    azimuth: mod360(azimuth),
    elevation,
    isGoldenHour,
    isMagicHour,
    isDay,
    isNight,
    phase,
  };
}

/** Find the next golden hour sunrise and sunset windows for today */
export function findNextGoldenEvents(observer: ObserverLocation): GoldenRayEvent[] {
  const now = new Date();
  const events: GoldenRayEvent[] = [];

  // Scan through today in 1-minute increments — find transitions into golden hour
  let prevEl = computeSunPosition(observer, new Date(now.getTime() - 60_000)).elevation;

  for (let m = 0; m < 1440; m++) {
    const t = new Date(now.getTime() + m * 60_000);
    const { elevation, azimuth } = computeSunPosition(observer, t);

    // Rising through 0° (dawn golden hour start)
    if (prevEl < 0 && elevation >= 0) {
      events.push({ azimuth, minutesUntil: m, timestamp: t.toISOString(), type: "dawn" });
    }
    // Falling through 6° (dusk golden hour start)
    if (prevEl > 6 && elevation <= 6 && elevation > 0) {
      events.push({ azimuth, minutesUntil: m, timestamp: t.toISOString(), type: "dusk" });
    }

    prevEl = elevation;
    if (events.length >= 2) break;
  }

  return events;
}

/** Format a countdown from minutes */
export function formatCountdown(minutesUntil: number): string {
  if (minutesUntil <= 0) return "NOW";
  const h = Math.floor(minutesUntil / 60);
  const m = Math.round(minutesUntil % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Check if the sun vector aligns with a given street heading (±15°) */
export function sunAlignedWithHeading(sunAzimuth: number, streetHeading: number): boolean {
  const diff = Math.abs(((sunAzimuth - streetHeading + 180) % 360) - 180);
  return diff < 15 || diff > 165; // also check opposite direction (backlit streets)
}
