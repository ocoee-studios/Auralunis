// Switches between Soft Moon (daytime) and Deep Space (nighttime) automatically
// based on sun altitude, computed from the ephemeris. Midnight Gold is the
// default and is never auto-switched — only explicit user choice.
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { AuraLunisThemeMode } from "@/features/settings/SettingsTypes";

export function computeAutoTheme(location: ObserverLocation): AuraLunisThemeMode {
  const sky = computeTonightSky(location);
  const sun = sky.bodies.find((b) => b.id === "sun");
  if (!sun) return "midnight_gold";

  // Civil twilight ends at about -6° altitude.
  if (sun.altitudeDegrees > -6) return "soft_moon";   // daytime / twilight
  return "deep_space";                                  // full dark
}
