// Computes moon phase for each day of a given month using astronomy-engine.
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface MoonDay {
  date: Date;
  illumination: number;
  phaseName: string;
}

const PHASE_NAMES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
];

function phaseName(illumination: number, isWaxing: boolean): string {
  if (illumination < 3) return PHASE_NAMES[0];
  if (illumination > 97) return PHASE_NAMES[4];
  if (isWaxing) {
    if (illumination < 40) return PHASE_NAMES[1];
    if (illumination < 60) return PHASE_NAMES[2];
    return PHASE_NAMES[3];
  }
  if (illumination > 60) return PHASE_NAMES[5];
  if (illumination > 40) return PHASE_NAMES[6];
  return PHASE_NAMES[7];
}

export function computeMoonCalendar(
  year: number,
  month: number,
  location: ObserverLocation
): MoonDay[] {
  const days: MoonDay[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  let prevIllum = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d, 22, 0, 0); // 10 PM local
    const sky = computeTonightSky(location, date);
    const illum = sky.moonIlluminationPercent;
    const waxing = illum >= prevIllum;
    days.push({ date, illumination: illum, phaseName: phaseName(illum, waxing) });
    prevIllum = illum;
  }
  return days;
}
