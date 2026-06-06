// Computes moon phase for each day of a given month using astronomy-engine.
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { moonPhaseName } from "@/services/MoonPhase";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

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
  // Seed from the night before the 1st so day 1's waxing/waning is correct.
  // (Seeding 0 would make illum >= prevIllum always true, forcing the 1st to a
  // waxing phase name even when the moon is actually waning.)
  const nightBefore = new Date(year, month - 1, 0, 22, 0, 0);
  let prevIllum = computeTonightSky(location, nightBefore).moonIlluminationPercent;

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
