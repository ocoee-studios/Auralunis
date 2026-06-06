// Convert between astronomical distance/time/mass units.

export type DistanceUnit = "km" | "mi" | "au" | "ly" | "pc" | "earth_radii" | "solar_radii";
export type MassUnit = "kg" | "earth_masses" | "jupiter_masses" | "solar_masses";
export type TimeUnit = "seconds" | "minutes" | "hours" | "days" | "years" | "million_years" | "billion_years";

const KM_PER: Record<DistanceUnit, number> = {
  km: 1,
  mi: 1.60934,
  au: 149_597_870.7,
  ly: 9_460_730_472_580.8,
  pc: 30_856_775_814_671.9,
  earth_radii: 6_371,
  solar_radii: 695_700
};

const KG_PER: Record<MassUnit, number> = {
  kg: 1,
  earth_masses: 5.972e24,
  jupiter_masses: 1.898e27,
  solar_masses: 1.989e30
};

const SECONDS_PER: Record<TimeUnit, number> = {
  seconds: 1, minutes: 60, hours: 3600, days: 86400,
  years: 31_557_600, million_years: 31_557_600_000_000,
  billion_years: 31_557_600_000_000_000
};

export function convertDistance(value: number, from: DistanceUnit, to: DistanceUnit): number {
  return (value * KM_PER[from]) / KM_PER[to];
}

export function convertMass(value: number, from: MassUnit, to: MassUnit): number {
  return (value * KG_PER[from]) / KG_PER[to];
}

export function convertTime(value: number, from: TimeUnit, to: TimeUnit): number {
  return (value * SECONDS_PER[from]) / SECONDS_PER[to];
}

export function lightTravelTime(distanceKm: number): string {
  const seconds = distanceKm / 299_792.458;
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
  if (seconds < 31_557_600) return `${(seconds / 86400).toFixed(1)} days`;
  return `${(seconds / 31_557_600).toFixed(2)} years`;
}

export function formatLargeNumber(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)} trillion`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} billion`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} million`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} thousand`;
  return n.toFixed(0);
}
