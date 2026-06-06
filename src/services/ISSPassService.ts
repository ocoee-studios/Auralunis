// ISS pass prediction. Computes visible passes from the observer's location.
// Uses a simplified elevation check until the full SGP4 integration is wired.
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface ISSPass {
  riseTime: Date;
  peakTime: Date;
  peakElevation: number;
  direction: string;
  durationMinutes: number;
}

function azToCompass(az: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(az / 45) % 8];
}

// Stub: returns empty passes until SGP4 feed integration is completed.
// The full implementation will propagate ISS TLEs at 30-second intervals
// over a 48-hour window and identify passes with peak elevation > 20°.
export function computeNextISSPasses(
  _location: ObserverLocation,
  _hoursAhead: number = 48
): ISSPass[] {
  // TODO: Wire to SatelliteFeedService.loadSatelliteOverlay() and filter for ISS.
  return [];
}
