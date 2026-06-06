// Computes and stores the sky at the user's birth: visible planets, moon phase,
// rising constellation. Referenced throughout the app for personalization.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { TonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";

const KEY = "chronaura.birthSky";

export interface BirthSkyProfile {
  birthday: string;
  computedAt: string;
  sky: TonightSky;
  visiblePlanets: string[];
  moonPhase: string;
  moonPercent: number;
  risingConstellation: string;
  personalMessage: string;
}

function moonPhaseName(pct: number): string {
  if (pct < 3) return "New Moon";
  if (pct < 35) return "Waxing Crescent";
  if (pct < 65) return "Half Moon";
  if (pct < 97) return "Gibbous Moon";
  return "Full Moon";
}

function dominantConstellation(sky: TonightSky): string {
  const bodies = sky.visibleBodies.filter(b => b.id !== "sun" && b.id !== "moon");
  if (bodies.length === 0) return "the quiet sky";
  const brightest = bodies.reduce((a, b) => (a.magnitude ?? 99) < (b.magnitude ?? 99) ? a : b);
  return brightest.name + "'s sky";
}

function generateMessage(profile: Omit<BirthSkyProfile, "personalMessage">): string {
  const parts: string[] = [];
  if (profile.visiblePlanets.length > 0) {
    parts.push(`${profile.visiblePlanets.join(" and ")} ${profile.visiblePlanets.length === 1 ? "was" : "were"} above the horizon`);
  }
  parts.push(`the Moon was a ${profile.moonPhase} at ${profile.moonPercent}%`);
  return `On the night you were born, ${parts.join(", and ")}. This is your celestial fingerprint.`;
}

export async function computeAndStoreBirthSky(
  birthday: string,
  location: ObserverLocation
): Promise<BirthSkyProfile> {
  const date = new Date(birthday + "T22:00:00");
  const sky = computeTonightSky(location, date);
  const visiblePlanets = sky.visibleBodies
    .filter(b => b.id !== "sun" && b.id !== "moon")
    .map(b => b.name);
  const moonPercent = sky.moonIlluminationPercent;
  const profile: BirthSkyProfile = {
    birthday,
    computedAt: new Date().toISOString(),
    sky,
    visiblePlanets,
    moonPhase: moonPhaseName(moonPercent),
    moonPercent,
    risingConstellation: dominantConstellation(sky),
    personalMessage: ""
  };
  profile.personalMessage = generateMessage(profile);
  await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  return profile;
}

export async function getBirthSky(): Promise<BirthSkyProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
