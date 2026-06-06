// Personal Star Map — life milestones become "stars" at their actual sky positions,
// connected by golden lines to form YOUR constellation.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

const KEY = "chronaura.starmap";

export interface LifeStar {
  id: string;
  label: string;
  date: string;
  azimuth: number;
  altitude: number;
  dominantBody: string;
  moonPercent: number;
}

export interface PersonalConstellation {
  name: string;
  stars: LifeStar[];
}

export async function getPersonalConstellation(): Promise<PersonalConstellation> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { name: "My Constellation", stars: [] };
  } catch { return { name: "My Constellation", stars: [] }; }
}

export async function addLifeStar(
  label: string,
  date: string,
  location: ObserverLocation
): Promise<PersonalConstellation> {
  const constellation = await getPersonalConstellation();
  const sky = computeTonightSky(location, new Date(date + "T22:00:00"));
  const brightest = sky.visibleBodies
    .filter(b => b.id !== "sun")
    .sort((a, b) => (a.magnitude ?? 99) - (b.magnitude ?? 99))[0];

  const star: LifeStar = {
    id: `star_${Date.now()}`,
    label,
    date,
    azimuth: brightest?.azimuthDegrees ?? 180,
    altitude: brightest?.altitudeDegrees ?? 45,
    dominantBody: brightest?.name ?? "Moon",
    moonPercent: sky.moonIlluminationPercent
  };

  constellation.stars.push(star);
  await AsyncStorage.setItem(KEY, JSON.stringify(constellation));
  return constellation;
}

export async function renameConstellation(name: string): Promise<void> {
  const c = await getPersonalConstellation();
  c.name = name;
  await AsyncStorage.setItem(KEY, JSON.stringify(c));
}
