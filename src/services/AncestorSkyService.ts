// Ancestor Sky — compute the sky for any historical date.
// "The night the Titanic sank." "The night humans walked on the Moon."
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { TonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";

export interface AncestorSkyResult {
  date: string;
  label: string;
  sky: TonightSky;
  visiblePlanets: string[];
  moonPhase: string;
  moonPercent: number;
  narrative: string;
}

const FAMOUS_NIGHTS: Record<string, string> = {
  "1969-07-20": "The night humans first walked on the Moon",
  "1912-04-14": "The night the Titanic sank",
  "1977-08-20": "The night Voyager 2 launched toward the stars",
  "1990-02-14": "The night Voyager 1 took the Pale Blue Dot photograph",
  "1957-10-04": "The night Sputnik opened the Space Age",
  "1961-04-12": "The night Yuri Gagarin became the first human in space",
  "1990-04-24": "The night Hubble launched and changed everything",
  "2021-12-25": "The night JWST launched on Christmas morning",
  "1054-07-04": "The night the Crab Nebula supernova appeared",
  "1609-11-30": "The night Galileo first turned a telescope to the Moon"
};

function moonName(pct: number): string {
  if (pct < 3) return "New Moon";
  if (pct < 35) return "Crescent";
  if (pct < 65) return "Quarter Moon";
  if (pct < 97) return "Gibbous";
  return "Full Moon";
}

export function computeAncestorSky(
  dateString: string,
  location: ObserverLocation,
  customLabel?: string
): AncestorSkyResult {
  const date = new Date(dateString + "T22:00:00");
  const sky = computeTonightSky(location, date);
  const visible = sky.visibleBodies.filter(b => b.id !== "sun" && b.id !== "moon").map(b => b.name);
  const moonPct = sky.moonIlluminationPercent;
  const phase = moonName(moonPct);
  const label = customLabel ?? FAMOUS_NIGHTS[dateString] ?? `The sky on ${dateString}`;

  const parts: string[] = [`${label}.`];
  if (visible.length > 0) parts.push(`${visible.join(" and ")} were visible.`);
  parts.push(`The Moon was a ${phase} at ${moonPct}%.`);

  return {
    date: dateString, label, sky, visiblePlanets: visible,
    moonPhase: phase, moonPercent: moonPct,
    narrative: parts.join(" ")
  };
}

export function getFamousNights(): Array<{ date: string; label: string }> {
  return Object.entries(FAMOUS_NIGHTS).map(([date, label]) => ({ date, label }));
}
