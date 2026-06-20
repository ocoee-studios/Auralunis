// MeteorShowerService.ts
// Meteor Shower Sonar — tracks the radiant point of active meteor showers.
// Radiant point = the patch of sky meteors appear to stream from.
// Proximity to the radiant drives the sonar ping cadence and haptics.

import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface MeteorShower {
  id: string;
  name: string;
  parentBody: string;
  /** Peak date as MM-DD */
  peakDate: string;
  /** Active window in days around peak */
  activeWindowDays: number;
  /** Radiant right ascension in degrees */
  radiantRA: number;
  /** Radiant declination in degrees */
  radiantDec: number;
  /** ZHR at peak */
  zhr: number;
  radarColor: string;
  description: string;
}

export const METEOR_SHOWERS: MeteorShower[] = [
  { id: "perseids",   name: "Perseids",    parentBody: "Comet 109P/Swift-Tuttle", peakDate: "08-12", activeWindowDays: 14, radiantRA: 46.0,  radiantDec: 58.0,  zhr: 100, radarColor: "#78C8FF", description: "The most reliable major shower. Swift bright streaks from Perseus." },
  { id: "geminids",   name: "Geminids",    parentBody: "Asteroid 3200 Phaethon",  peakDate: "12-13", activeWindowDays: 10, radiantRA: 112.0, radiantDec: 32.5,  zhr: 150, radarColor: "#FFF6D6", description: "The strongest annual shower — unusual asteroid parent, multicolored meteors." },
  { id: "leonids",    name: "Leonids",     parentBody: "Comet 55P/Tempel-Tuttle", peakDate: "11-17", activeWindowDays: 6,  radiantRA: 152.0, radiantDec: 22.0,  zhr: 15,  radarColor: "#EF9F27", description: "Legendary for rare storm years. Fast, bright, with persistent trains." },
  { id: "orionids",   name: "Orionids",    parentBody: "Comet 1P/Halley",         peakDate: "10-21", activeWindowDays: 10, radiantRA: 95.0,  radiantDec: 16.0,  zhr: 25,  radarColor: "#7B5CF6", description: "Debris from Halley's Comet. Fast meteors with long persistent trains." },
  { id: "quadrantids",name: "Quadrantids", parentBody: "Asteroid 2003 EH1",       peakDate: "01-03", activeWindowDays: 4,  radiantRA: 230.0, radiantDec: 49.5,  zhr: 120, radarColor: "#4ADE80", description: "Sharp peak lasting only hours. Faint blue meteors from a defunct constellation." },
  { id: "eta-aquariids", name: "Eta Aquariids", parentBody: "Comet 1P/Halley",   peakDate: "05-05", activeWindowDays: 10, radiantRA: 338.0, radiantDec: -1.0,  zhr: 50,  radarColor: "#D9A84E", description: "Best seen from the southern hemisphere. Second Halley shower of the year." },
];

function toRad(d: number): number { return d * Math.PI / 180; }
function toDeg(r: number): number { return r * 180 / Math.PI; }
function mod360(d: number): number { return ((d % 360) + 360) % 360; }

function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Convert RA/Dec to az/alt for the observer at this moment */
function raDecToAltAz(ra: number, dec: number, observer: ObserverLocation, date: Date): { azimuth: number; altitude: number } {
  const jd = julianDay(date);
  const GMST = mod360(280.46061837 + 360.98564736629 * (jd - 2451545.0));
  const LST = mod360(GMST + observer.longitudeDegrees);
  const HA = toRad(mod360(LST - ra));
  const lat = toRad(observer.latitudeDegrees);
  const decRad = toRad(dec);
  const sinAlt = Math.sin(decRad) * Math.sin(lat) + Math.cos(decRad) * Math.cos(lat) * Math.cos(HA);
  const altitude = toDeg(Math.asin(Math.max(-1, Math.min(1, sinAlt))));
  const cosAz = (Math.sin(decRad) - Math.sin(lat) * sinAlt) / (Math.cos(lat) * Math.cos(toRad(altitude)));
  let azimuth = toDeg(Math.acos(Math.max(-1, Math.min(1, cosAz))));
  if (Math.sin(HA) > 0) azimuth = 360 - azimuth;
  return { azimuth: mod360(azimuth), altitude };
}

/** Is a shower active today? */
function isActive(shower: MeteorShower, date: Date): boolean {
  const [peakM, peakD] = shower.peakDate.split("-").map(Number);
  const peak = new Date(date.getFullYear(), peakM - 1, peakD);
  const diffMs = date.getTime() - peak.getTime();
  const diffDays = Math.abs(diffMs / 86400000);
  return diffDays <= shower.activeWindowDays / 2;
}

export interface ActiveShower {
  shower: MeteorShower;
  azimuth: number;
  altitude: number;
  /** Angular error from device pointing */
  angularError: number;
  /** Sonar ping interval in ms — null = silent */
  sonarInterval: number | null;
  daysFromPeak: number;
}

export function getActiveShowers(observer: ObserverLocation, deviceAz: number, devicePitch: number, date: Date = new Date()): ActiveShower[] {
  return METEOR_SHOWERS
    .filter(s => isActive(s, date))
    .map(s => {
      const { azimuth, altitude } = raDecToAltAz(s.radiantRA, s.radiantDec, observer, date);
      const azDiff = (((azimuth - deviceAz + 180) % 360) + 360) % 360 - 180;
      const elDiff = altitude - devicePitch;
      const angularError = Math.sqrt(azDiff ** 2 + elDiff ** 2);

      let sonarInterval: number | null = null;
      if (angularError < 5)  sonarInterval = 80;
      else if (angularError < 15) sonarInterval = 250;
      else if (angularError < 30) sonarInterval = 600;

      const [peakM, peakD] = s.peakDate.split("-").map(Number);
      const peak = new Date(date.getFullYear(), peakM - 1, peakD);
      const daysFromPeak = Math.round(Math.abs(date.getTime() - peak.getTime()) / 86400000);

      return { shower: s, azimuth, altitude, angularError, sonarInterval, daysFromPeak };
    })
    .sort((a, b) => a.angularError - b.angularError);
}

/** Sonar ping interval in ms based on angular error, null = silent */
export function sonarInterval(angularError: number): number | null {
  if (angularError < 5)  return 80;
  if (angularError < 15) return 250;
  if (angularError < 30) return 600;
  return null;
}
