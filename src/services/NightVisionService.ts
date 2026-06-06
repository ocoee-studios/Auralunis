// Night Vision Mode — deep red UI that preserves dark-adapted eyes.
// Every surface shifts to red-on-black. Toggle from Sky tab or auto after sunset.
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export const NightVisionPalette = {
  background: "#0A0000",
  surface: "#1A0505",
  accent: "#CC2222",
  accentDim: "#881111",
  text: "#CC3333",
  muted: "#772222",
  faint: "#441111",
  border: "rgba(204,34,34,0.25)",
  gold: "#CC2222", // Gold becomes red
  silver: "#993333"
} as const;

export function shouldAutoEnableNightVision(location: ObserverLocation): boolean {
  const sky = computeTonightSky(location);
  const sun = sky.bodies.find(b => b.id === "sun");
  if (!sun) return true;
  // Enable when sun is below -12° (astronomical twilight ended)
  return sun.altitudeDegrees < -12;
}
