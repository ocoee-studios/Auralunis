// Computes upcoming ISS passes visible from the observer's location using
// SGP4 propagation. Schedules push notifications for passes with elevation
// above 20° (visible to naked eye).
import { propagateSatelliteFeed } from "@/features/aura-pro/SatelliteFeedService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface ISSPass {
  riseTime: Date;
  peakTime: Date;
  peakElevation: number;
  direction: string;
  durationMinutes: number;
}

export function computeNextISSPasses(
  location: ObserverLocation,
  hoursAhead: number = 48
): ISSPass[] {
  const passes: ISSPass[] = [];
  const now = new Date();
  const end = new Date(now.getTime() + hoursAhead * 3600_000);
  const stepMs = 30_000; // sample every 30 seconds

  let riseTime: Date | null = null;
  let peakEl = 0;
  let peakTime = now;

  for (let t = now.getTime(); t < end.getTime(); t += stepMs) {
    const checkTime = new Date(t);
    const feed = propagateSatelliteFeed(location, checkTime);
    const iss = feed.find((s) => s.name === "ISS (ZARYA)");
    if (!iss) continue;

    if (iss.elevationDegrees > 0) {
      if (!riseTime) riseTime = checkTime;
      if (iss.elevationDegrees > peakEl) {
        peakEl = iss.elevationDegrees;
        peakTime = checkTime;
      }
    } else if (riseTime) {
      // Pass ended
      if (peakEl >= 20) {
        const dir = azToCompass(iss.azimuthDegrees);
        const dur = (t - riseTime.getTime()) / 60_000;
        passes.push({
          riseTime,
          peakTime,
          peakElevation: Math.round(peakEl),
          direction: dir,
          durationMinutes: Math.round(dur)
        });
      }
      riseTime = null;
      peakEl = 0;
    }
  }
  return passes;
}

function azToCompass(az: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(az / 45) % 8];
}
