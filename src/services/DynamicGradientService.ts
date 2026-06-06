// Computes background gradient colors based on actual sun altitude from the
// ephemeris. Shifts from deep blue twilight → midnight navy → pre-dawn violet.
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface SkyGradient {
  top: string;
  bottom: string;
  phase: "day" | "golden_hour" | "blue_hour" | "twilight" | "night" | "deep_night" | "pre_dawn";
}

export function computeSkyGradient(location: ObserverLocation): SkyGradient {
  const sky = computeTonightSky(location);
  const sun = sky.bodies.find(b => b.id === "sun");
  if (!sun) return { top: "#05070D", bottom: "#080B15", phase: "deep_night" };

  const alt = sun.altitudeDegrees;

  if (alt > 10)    return { top: "#4A90D9", bottom: "#87CEEB", phase: "day" };
  if (alt > 0)     return { top: "#C77D3C", bottom: "#2B1F47", phase: "golden_hour" };
  if (alt > -6)    return { top: "#1A1040", bottom: "#0D0820", phase: "blue_hour" };
  if (alt > -12)   return { top: "#0E0A1E", bottom: "#060410", phase: "twilight" };
  if (alt > -18)   return { top: "#080614", bottom: "#04030A", phase: "night" };

  // Check if we're approaching dawn (sun azimuth roughly east: 45-135°)
  if (sun.azimuthDegrees > 30 && sun.azimuthDegrees < 150) {
    return { top: "#0A0618", bottom: "#120822", phase: "pre_dawn" };
  }

  return { top: "#05070D", bottom: "#080B15", phase: "deep_night" };
}
