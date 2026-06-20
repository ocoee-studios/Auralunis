// Sky Passport — gold-foil stamp collection for celestial events witnessed.
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "auralunis.passport";

export interface SkyStamp {
  id: string;
  event: string;
  type: "eclipse" | "meteor_shower" | "conjunction" | "iss_pass" | "first_planet" | "first_constellation" | "rare_event" | "milestone";
  date: string;
  location: string;
  tonightScore: number;
  personalNote?: string;
  foilColor: "gold" | "silver" | "rose_gold" | "platinum";
}

function pickFoil(type: SkyStamp["type"]): SkyStamp["foilColor"] {
  if (type === "eclipse" || type === "rare_event") return "platinum";
  if (type === "conjunction" || type === "iss_pass") return "rose_gold";
  if (type === "first_planet" || type === "first_constellation") return "silver";
  return "gold";
}

export async function getPassport(): Promise<SkyStamp[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function addStamp(
  event: string,
  type: SkyStamp["type"],
  location: string,
  tonightScore: number,
  personalNote?: string
): Promise<SkyStamp> {
  const stamps = await getPassport();
  const stamp: SkyStamp = {
    id: `stamp_${Date.now()}`,
    event, type,
    date: new Date().toISOString(),
    location, tonightScore, personalNote,
    foilColor: pickFoil(type)
  };
  stamps.push(stamp);
  await AsyncStorage.setItem(KEY, JSON.stringify(stamps));
  return stamp;
}

export async function getStampCount(): Promise<number> {
  return (await getPassport()).length;
}
