// TimeScrubService.ts
// Time Scrub Wheel — compute the sky state at any date/time.
// Uses the existing planetaryEphemeris and ChronoLightService to show
// where planets, Sun, and Moon will be at a user-selected moment.
// The wheel scrubs ±12 hours from now (or arbitrary date).

import { computePlanetaryTargets, type PlanetId } from "@/utils/planetaryEphemeris";
import { computeSunPosition } from "@/services/ChronoLightService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface SkySnapshot {
  /** The moment this snapshot represents */
  date: Date;
  /** Offset from "now" in minutes */
  offsetMinutes: number;
  /** Sun position */
  sun: { azimuth: number; elevation: number; phase: string; isDay: boolean };
  /** Planet positions */
  planets: Array<{
    id: PlanetId;
    name: string;
    azimuth: number;
    altitude: number;
    distAU: number;
    color: string;
    isAboveHorizon: boolean;
  }>;
  /** Moon approximate position (simplified) */
  moon: {
    azimuth: number;
    elevation: number;
    illumination: number;
    phase: string;
  };
  /** Human-readable time label */
  timeLabel: string;
  /** Whether this is a "good" sky moment (low sun, planets visible) */
  skyQuality: "poor" | "fair" | "good" | "excellent";
}

/** Approximate Moon position using a simplified model */
function approxMoonPosition(observer: ObserverLocation, date: Date): {
  azimuth: number;
  elevation: number;
  illumination: number;
  phase: string;
} {
  // Simplified lunar position — good enough for the time scrub display
  const J2000 = 2451545.0;
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - J2000) / 36525;

  // Mean longitude
  const L = (218.316 + 481267.881 * T) % 360;
  // Mean anomaly
  const M = (134.963 + 477198.868 * T) % 360;
  // Mean distance
  const F = (93.272 + 483202.018 * T) % 360;

  const toRad = (d: number) => d * Math.PI / 180;

  // Ecliptic longitude
  const lambda = L + 6.289 * Math.sin(toRad(M));
  const beta = 5.128 * Math.sin(toRad(F));

  // Very rough az/alt from ecliptic — this is approximate but sufficient for the scrub UI
  const GMST = (280.46061837 + 360.98564736629 * (jd - J2000)) % 360;
  const LST = (GMST + observer.longitudeDegrees) % 360;
  const HA = toRad(((LST - lambda) % 360 + 360) % 360);
  const lat = toRad(observer.latitudeDegrees);
  const dec = toRad(beta);

  const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(HA);
  const elevation = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180 / Math.PI;

  const cosAz = (Math.sin(dec) - Math.sin(lat) * sinAlt) / (Math.cos(lat) * Math.cos(toRad(elevation)));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI;
  if (Math.sin(HA) > 0) azimuth = 360 - azimuth;

  // Illumination (synodic period ~29.53 days)
  const synodicAge = ((jd - 2451550.1) % 29.53 + 29.53) % 29.53;
  const illumination = Math.round((1 - Math.cos(synodicAge / 29.53 * 2 * Math.PI)) / 2 * 100);

  let phase = "new moon";
  if (synodicAge < 3.7) phase = "new moon";
  else if (synodicAge < 7.4) phase = "waxing crescent";
  else if (synodicAge < 11.1) phase = "first quarter";
  else if (synodicAge < 14.8) phase = "waxing gibbous";
  else if (synodicAge < 18.5) phase = "full moon";
  else if (synodicAge < 22.1) phase = "waning gibbous";
  else if (synodicAge < 25.8) phase = "last quarter";
  else phase = "waning crescent";

  return {
    azimuth: ((azimuth % 360) + 360) % 360,
    elevation,
    illumination,
    phase,
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/**
 * Compute a full sky snapshot at a given offset from now.
 * Used by the time scrub wheel.
 */
export function computeSkyAtOffset(
  observer: ObserverLocation,
  offsetMinutes: number
): SkySnapshot {
  const date = new Date(Date.now() + offsetMinutes * 60_000);

  const sun = computeSunPosition(observer, date);
  const planetTargets = computePlanetaryTargets(observer, date);
  const moon = approxMoonPosition(observer, date);

  const planets = planetTargets.map(pt => ({
    id: pt.id as PlanetId,
    name: pt.planet.name,
    azimuth: Math.round(pt.azimuth),
    altitude: Math.round(pt.altitude * 10) / 10,
    distAU: pt.distAU,
    color: pt.planet.radarColor,
    isAboveHorizon: pt.altitude > 0,
  }));

  const visiblePlanets = planets.filter(p => p.isAboveHorizon).length;
  const moonUp = moon.elevation > 0;
  const isDark = sun.elevation < -6;

  let skyQuality: SkySnapshot["skyQuality"] = "poor";
  if (isDark && visiblePlanets >= 3) skyQuality = "excellent";
  else if (isDark && visiblePlanets >= 1) skyQuality = "good";
  else if (!sun.isDay && visiblePlanets >= 1) skyQuality = "fair";

  return {
    date,
    offsetMinutes,
    sun: {
      azimuth: Math.round(sun.azimuth),
      elevation: Math.round(sun.elevation * 10) / 10,
      phase: sun.phase,
      isDay: sun.isDay,
    },
    planets,
    moon,
    timeLabel: formatTime(date),
    skyQuality,
  };
}

/**
 * Generate a series of snapshots for the scrub wheel.
 * Returns one snapshot per 30-minute step, ±12 hours.
 */
export function generateTimeline(
  observer: ObserverLocation,
  stepMinutes = 30,
  rangeHours = 12
): SkySnapshot[] {
  const steps: SkySnapshot[] = [];
  const totalSteps = (rangeHours * 2 * 60) / stepMinutes;

  for (let i = 0; i <= totalSteps; i++) {
    const offset = -rangeHours * 60 + i * stepMinutes;
    steps.push(computeSkyAtOffset(observer, offset));
  }

  return steps;
}
