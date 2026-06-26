// BirthSkyService.ts — "Your Sky The Night You Were Born"
// Computes the exact celestial configuration for any date/time/location.
// Premium feature: generates a personal star chart with planets, moon phase,
// and a "cosmic signature" summary.

import { computePlanetaryTargets } from "@/utils/planetaryEphemeris";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import { moonPhaseName } from "@/services/MoonPhase";

// AsyncStorage key for the user's saved birthday (ISO 8601), set during onboarding so
// BirthSkyScreen can reveal the birth sky later without re-asking.
export const BIRTHDAY_STORAGE_KEY = "auralunis.birthday";

export interface BirthSkyProfile {
  birthDate: string;       // ISO 8601
  location: ObserverLocation;
  locationName: string;
  moonPhase: string;       // "Waxing Crescent", "Full Moon", etc.
  moonIllumination: number;
  sunSign: string;         // Zodiac sign the sun was in
  risingSign: string;      // Constellation on the eastern horizon
  planets: BirthPlanet[];
  visibleCount: number;    // How many planets were above horizon
  cosmicSignature: string; // e.g. "Born under a waning gibbous with Venus and Jupiter flanking the zenith"
  dominantConstellation: string;
  seasonalSky: string;     // "Summer Triangle dominated" / "Orion season"
}

export interface BirthPlanet {
  name: string;
  azimuth: number;
  altitude: number;
  visible: boolean;        // above horizon at birth moment
  constellation: string;   // which constellation it was in
}

const ZODIAC_SIGNS = [
  { name: "Capricorn",  start: [1,1],   end: [1,19]  },
  { name: "Aquarius",   start: [1,20],  end: [2,18]  },
  { name: "Pisces",     start: [2,19],  end: [3,20]  },
  { name: "Aries",      start: [3,21],  end: [4,19]  },
  { name: "Taurus",     start: [4,20],  end: [5,20]  },
  { name: "Gemini",     start: [5,21],  end: [6,20]  },
  { name: "Cancer",     start: [6,21],  end: [7,22]  },
  { name: "Leo",        start: [7,23],  end: [8,22]  },
  { name: "Virgo",      start: [8,23],  end: [9,22]  },
  { name: "Libra",      start: [9,23],  end: [10,22] },
  { name: "Scorpio",    start: [10,23], end: [11,21] },
  { name: "Sagittarius",start: [11,22], end: [12,21] },
  { name: "Capricorn",  start: [12,22], end: [12,31] },
];

const MOON_PHASES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
];

const CONSTELLATIONS_BY_MONTH: Record<number, string[]> = {
  1: ["Orion", "Taurus", "Gemini"],
  2: ["Orion", "Canis Major", "Gemini"],
  3: ["Leo", "Cancer", "Gemini"],
  4: ["Leo", "Virgo", "Ursa Major"],
  5: ["Virgo", "Boötes", "Ursa Major"],
  6: ["Scorpius", "Sagittarius", "Hercules"],
  7: ["Scorpius", "Sagittarius", "Lyra"],
  8: ["Cygnus", "Lyra", "Sagittarius"],
  9: ["Cygnus", "Pegasus", "Aquarius"],
  10: ["Pegasus", "Andromeda", "Cassiopeia"],
  11: ["Cassiopeia", "Andromeda", "Perseus"],
  12: ["Orion", "Taurus", "Cassiopeia"],
};

/** Compute sun sign from date */
function getSunSign(month: number, day: number): string {
  for (const z of ZODIAC_SIGNS) {
    const [sm, sd] = z.start;
    const [em, ed] = z.end;
    if (month === sm && day >= sd && month === em && day <= ed) return z.name;
    if (month === sm && day >= sd && sm !== em) return z.name;
    if (month === em && day <= ed && sm !== em) return z.name;
  }
  return "Capricorn";
}

/** Simplified moon phase from JD */
function getMoonPhase(jd: number): { name: string; illumination: number } {
  const synodicMonth = 29.53059;
  const knownNewMoon = 2451550.1; // Jan 6, 2000 new moon
  const daysSince = jd - knownNewMoon;
  const phase = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth;
  const illumination = Math.round((1 - Math.cos((phase / synodicMonth) * 2 * Math.PI)) / 2 * 100);
  const isWaxing = phase < synodicMonth / 2; // first half of the cycle = waxing
  return { name: moonPhaseName(illumination, isWaxing), illumination };
}

/** Rising constellation (on the eastern horizon at birth moment) */
function getRisingConstellation(month: number, hourUTC: number): string {
  // Simplified: shifts by ~2 constellations per 4 hours
  const consts = CONSTELLATIONS_BY_MONTH[month] ?? ["Orion"];
  const idx = Math.floor((hourUTC / 24) * consts.length) % consts.length;
  return consts[idx];
}

/** Generate a poetic cosmic signature */
function generateSignature(profile: Partial<BirthSkyProfile>): string {
  const vis = profile.planets?.filter(p => p.visible).map(p => p.name) ?? [];
  const moonDesc = `a ${profile.moonPhase?.toLowerCase()} at ${profile.moonIllumination}%`;

  if (vis.length === 0) {
    return `Born under ${moonDesc}, with ${profile.dominantConstellation} overhead and ${profile.risingSign} rising in the east.`;
  }
  if (vis.length === 1) {
    return `Born under ${moonDesc} with ${vis[0]} watching from above, ${profile.dominantConstellation} spanning the sky.`;
  }
  return `Born under ${moonDesc} with ${vis.join(" and ")} visible, ${profile.dominantConstellation} overhead — a ${profile.seasonalSky} sky.`;
}

/**
 * Compute the sky at a specific birth date/time/location.
 * Returns a BirthSkyProfile with planets, moon, constellations, and a cosmic signature.
 */
export function computeBirthSky(
  birthDateISO: string,
  location: ObserverLocation,
  locationName: string = "Unknown",
): BirthSkyProfile {
  const birthDate = new Date(birthDateISO);
  const month = birthDate.getUTCMonth() + 1;
  const day = birthDate.getUTCDate();
  const hourUTC = birthDate.getUTCHours() + birthDate.getUTCMinutes() / 60;

  // Julian Date
  const jd = 2440587.5 + (birthDate.getTime() / 86400000);

  const sunSign = getSunSign(month, day);
  const { name: moonPhase, illumination: moonIllumination } = getMoonPhase(jd);
  const risingSign = getRisingConstellation(month, hourUTC);
  const dominantConstellation = (CONSTELLATIONS_BY_MONTH[month] ?? ["Orion"])[0];

  // Compute planet positions AT THE BIRTH MOMENT (not now) — the date arg is required,
  // otherwise computePlanetaryTargets defaults to new Date() and the whole birth chart
  // shows today's planets.
  const targets = computePlanetaryTargets(location, birthDate);
  const planets: BirthPlanet[] = targets.map(t => ({
    name: t.planet.name,
    azimuth: Math.round(t.azimuth),
    altitude: Math.round(t.altitude * 10) / 10,
    visible: t.altitude > 0,
    constellation: dominantConstellation, // simplified
  }));

  const visibleCount = planets.filter(p => p.visible).length;

  // Seasonal sky descriptor
  const seasonalSky = month >= 6 && month <= 8 ? "Summer Triangle" :
    month >= 12 || month <= 2 ? "winter Orion" :
    month >= 3 && month <= 5 ? "spring Leo" : "autumn Pegasus";

  const profile: BirthSkyProfile = {
    birthDate: birthDateISO,
    location,
    locationName,
    moonPhase,
    moonIllumination,
    sunSign,
    risingSign,
    planets,
    visibleCount,
    cosmicSignature: "",
    dominantConstellation,
    seasonalSky,
  };

  profile.cosmicSignature = generateSignature(profile);

  return profile;
}
