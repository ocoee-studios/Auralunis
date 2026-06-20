// AuroraForecastService.ts
// Maps live NOAA Kp index to aurora visibility probability based on
// the observer's geomagnetic latitude. Uses the existing SolarWindService
// for Kp data — this service adds the latitude-specific aurora math.
//
// Aurora visibility thresholds (approximate geomagnetic latitude):
//   Kp 0-1: 67°+ (far northern Scandinavia, Alaska)
//   Kp 3:   63°+ (Iceland, northern Canada)
//   Kp 5:   55°+ (southern Canada, Scotland, Scandinavia)
//   Kp 7:   45°+ (northern US, central Europe)
//   Kp 9:   30°+ (southern US — extremely rare)

export type AuroraChance = "none" | "unlikely" | "possible" | "likely" | "strong" | "extreme";

export interface AuroraForecast {
  chance: AuroraChance;
  /** 0-100 probability percentage */
  probability: number;
  /** Human-readable description */
  description: string;
  /** Minimum Kp needed for this latitude */
  kpNeeded: number;
  /** Current Kp index */
  kpCurrent: number;
  /** Observer's geomagnetic latitude (approximate) */
  geomagLat: number;
  /** Color for the UI meter */
  meterColor: string;
  /** Tips for the user */
  tip: string;
}

/** Approximate geomagnetic latitude from geographic latitude.
 *  The geomagnetic pole is offset ~11° from the geographic pole.
 *  This is a rough estimate — sufficient for aurora probability. */
function geomagneticLatitude(geoLat: number, geoLon: number): number {
  // Geomagnetic north pole: ~80.5°N, 287°E (72.6°W)
  const poleLat = 80.5;
  const poleLon = -72.6;
  const toRad = (d: number) => d * Math.PI / 180;

  const cosTheta =
    Math.sin(toRad(geoLat)) * Math.sin(toRad(poleLat)) +
    Math.cos(toRad(geoLat)) * Math.cos(toRad(poleLat)) *
    Math.cos(toRad(geoLon - poleLon));

  return 90 - Math.acos(Math.max(-1, Math.min(1, cosTheta))) * 180 / Math.PI;
}

/** Minimum Kp needed for aurora at a given geomagnetic latitude */
function minKpForLatitude(geomagLat: number): number {
  const absLat = Math.abs(geomagLat);
  if (absLat >= 67) return 0;
  if (absLat >= 63) return 2;
  if (absLat >= 58) return 3;
  if (absLat >= 55) return 4;
  if (absLat >= 50) return 5;
  if (absLat >= 45) return 6;
  if (absLat >= 40) return 7;
  if (absLat >= 35) return 8;
  return 9;
}

export function computeAuroraForecast(
  observerLat: number,
  observerLon: number,
  kpIndex: number
): AuroraForecast {
  const geomagLat = geomagneticLatitude(observerLat, observerLon);
  const kpNeeded = minKpForLatitude(geomagLat);
  const kpExcess = kpIndex - kpNeeded;

  let chance: AuroraChance;
  let probability: number;
  let description: string;
  let meterColor: string;
  let tip: string;

  if (kpExcess >= 3) {
    chance = "extreme";
    probability = 95;
    description = "Extreme aurora storm — visible across most of the sky, possibly to your south.";
    meterColor = "#FF3B30";
    tip = "Get outside NOW. Face north. This is rare.";
  } else if (kpExcess >= 2) {
    chance = "strong";
    probability = 80;
    description = "Strong aurora likely — look north toward the horizon for green and purple curtains.";
    meterColor = "#4ADE80";
    tip = "Find a dark location away from city lights. Face north.";
  } else if (kpExcess >= 1) {
    chance = "likely";
    probability = 60;
    description = "Aurora possible tonight — conditions are favorable for your latitude.";
    meterColor = "#D9A84E";
    tip = "Best between 10 PM and 2 AM. Clear northern horizon helps.";
  } else if (kpExcess >= 0) {
    chance = "possible";
    probability = 35;
    description = "Marginal aurora conditions — the Kp index just reaches your visibility threshold.";
    meterColor = "#EF9F27";
    tip = "Possible faint glow on the northern horizon if skies are dark and clear.";
  } else if (kpExcess >= -2) {
    chance = "unlikely";
    probability = 10;
    description = "Aurora unlikely at your latitude — the Kp index would need to reach " + kpNeeded + "+.";
    meterColor = "#7B5CF6";
    tip = "Sign up for alerts — we'll notify you when Kp rises.";
  } else {
    chance = "none";
    probability = 0;
    description = "No aurora expected. Your latitude requires a severe Kp " + kpNeeded + "+ storm.";
    meterColor = "#747D90";
    tip = "Travel north for better chances, or wait for a major solar event.";
  }

  return {
    chance,
    probability,
    description,
    kpNeeded,
    kpCurrent: kpIndex,
    geomagLat: Math.round(geomagLat * 10) / 10,
    meterColor,
    tip,
  };
}
