// Computes moon phase for each day of a given month using astronomy-engine.
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import { moonPhaseName } from "@/services/MoonPhase";

export interface MoonDay {
  date: Date;
  illumination: number;
  phaseName: string;
}

export function computeMoonCalendar(
  year: number,
  month: number,
  location: ObserverLocation
): MoonDay[] {
  const days: MoonDay[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  // Seed from the night BEFORE the 1st so the waxing/waning direction is correct
  // on day 1 (seeding to 0 forced every month's 1st to a waxing name).
  const seedDate = new Date(year, month - 1, 0, 22, 0, 0); // last night of prev month
  let prevIllum = computeTonightSky(location, seedDate).moonIlluminationPercent;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d, 22, 0, 0); // 10 PM local
    const sky = computeTonightSky(location, date);
    const illum = sky.moonIlluminationPercent;
    const waxing = illum >= prevIllum;
    days.push({ date, illumination: illum, phaseName: moonPhaseName(illum, waxing) });
    prevIllum = illum;
  }
  return days;
}
