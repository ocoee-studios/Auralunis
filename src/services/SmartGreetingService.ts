// Generates a personalized greeting based on time of day + what's in the sky.
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface SmartGreeting {
  salutation: string;
  skyNote: string;
}

export function generateGreeting(location: ObserverLocation): SmartGreeting {
  const hour = new Date().getHours();
  const sky = computeTonightSky(location);
  const moon = sky.moonIlluminationPercent;
  const visible = sky.visibleBodies.filter(b => b.id !== "sun" && b.id !== "moon");
  const month = new Date().getMonth();

  // Time-of-day salutation
  let salutation: string;
  if (hour < 5) salutation = "The cosmos are quiet.";
  else if (hour < 12) salutation = "Good morning.";
  else if (hour < 17) salutation = "Good afternoon.";
  else if (hour < 21) salutation = "Good evening.";
  else salutation = "The night sky is open.";

  // Sky-aware note (prioritized)
  let skyNote: string;
  if (moon >= 95) {
    skyNote = `Full Moon tonight — ${moon}% illuminated.`;
  } else if (moon <= 5) {
    skyNote = "New Moon tonight. Ideal for deep-sky viewing.";
  } else if (visible.length >= 3) {
    const names = visible.slice(0, 3).map(b => b.name).join(", ");
    skyNote = `${names} visible tonight.`;
  } else if (visible.length > 0) {
    skyNote = `${visible[0].name} is bright tonight.`;
  } else if (month >= 5 && month <= 8) {
    skyNote = "Milky Way season is here.";
  } else if (month >= 10 || month <= 1) {
    skyNote = "Orion returns to the evening sky.";
  } else {
    skyNote = "Clear skies reveal what's always there.";
  }

  return { salutation, skyNote };
}
