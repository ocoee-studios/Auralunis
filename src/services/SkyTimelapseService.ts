// Computes sky positions at hourly intervals from sunset to sunrise
// for animated timelapse visualization.
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { TonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";

export interface TimelapseFrame {
  hour: number;
  time: Date;
  sky: TonightSky;
  label: string;
}

export function computeTimelapse(
  location: ObserverLocation,
  startHour: number = 18, // 6 PM
  endHour: number = 6,    // 6 AM next day
  intervalMinutes: number = 60
): TimelapseFrame[] {
  const frames: TimelapseFrame[] = [];
  const today = new Date();
  const baseDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (let h = startHour; h < startHour + (endHour <= startHour ? endHour + 24 - startHour : endHour - startHour); h += intervalMinutes / 60) {
    const actualHour = h % 24;
    const dayOffset = h >= 24 ? 1 : 0;
    const time = new Date(baseDate.getTime() + (actualHour * 3600 + dayOffset * 86400) * 1000);
    const sky = computeTonightSky(location, time);

    const period = actualHour >= 18 || actualHour < 4 ? "PM" : "AM";
    const displayHour = actualHour > 12 ? actualHour - 12 : actualHour === 0 ? 12 : actualHour;
    const label = `${displayHour}:00 ${period}`;

    frames.push({ hour: actualHour, time, sky, label });
  }

  return frames;
}
