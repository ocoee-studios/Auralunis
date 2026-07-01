// BirthSkyService.ts — "Your Sky The Night You Were Born"
// Computes the exact celestial configuration for any date/time/location.
// Premium feature: generates a personal star chart with planets, moon phase,
// and a "cosmic signature" summary.

import { SiderealTime, Illumination, MoonPhase, Body } from "astronomy-engine";
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
  risingSign: string;      // Zodiac sign rising in the east (ascendant)
  planets: BirthPlanet[];
  visibleCount: number;    // How many planets were above horizon
  cosmicSignature: string; // e.g. "Born under a waning gibbous with Venus and Jupiter flanking the zenith"
  dominantConstellation: string;
  seasonalSky: string;     // "Summer Triangle dominated" / "Orion season"
  // Sky Signature — a named, shareable identity distilled from the profile.
  skySignatureTitle: string;    // "The Dreamer's Sky"
  skySignatureSubtitle: string; // "Born beneath Pegasus with Jupiter rising and a waxing crescent Moon."
  brightestPlanet: string | null; // brightest planet above the horizon at birth, if any
  galacticRegion: string;       // which stretch of the Milky Way was overhead
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

// Tropical zodiac order from ecliptic longitude 0° (Aries) onward.
const TROPICAL_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

/**
 * Sun sign from the Sun's apparent ecliptic longitude (0° = Aries), which is the true
 * astronomical definition. More accurate than fixed calendar-date ranges, whose cusp
 * dates drift ±1 day year to year and break for births near midnight in non-UTC zones.
 * Low-precision Sun formula (~0.01°) — far better than the band needs.
 */
function getSunSign(birthDate: Date): string {
  const jd = 2440587.5 + birthDate.getTime() / 86400000;
  const n = jd - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = (((357.528 + 0.9856003 * n) % 360) * Math.PI) / 180;
  let lambda = L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g);
  lambda = ((lambda % 360) + 360) % 360;
  return TROPICAL_SIGNS[Math.floor(lambda / 30) % 12];
}

/**
 * Moon phase from the same astronomy-engine source the live Sky Lens / Home screens use,
 * so the illumination % and phase name match everywhere (the old synodic-cosine model
 * drifted up to ~8 points from the engine near the quarters).
 */
function getMoonPhase(when: Date): { name: string; illumination: number } {
  const illumination = Math.round(Illumination(Body.Moon, when).phase_fraction * 100);
  const isWaxing = MoonPhase(when) < 180; // elongation: 0° = new, 180° = full
  return { name: moonPhaseName(illumination, isWaxing), illumination };
}

/**
 * Rising sign (ascendant) — the zodiac sign on the eastern horizon at the birth moment.
 * Uses the true ascendant from local sidereal time, latitude, and obliquity:
 *   λ_asc = atan2( cos θ, -(sin θ·cos ε + tan φ·sin ε) )
 * where θ = local sidereal time (RAMC). Verified against the ephemeris: the resulting
 * ecliptic point sits on the horizon (alt ≈ 0) in the east. This correctly depends on
 * BOTH longitude and latitude, unlike the old month/UTC-hour approximation.
 */
function getRisingSign(birthDate: Date, location: ObserverLocation): string {
  const D2R = Math.PI / 180;
  const eps = 23.4393 * D2R; // mean obliquity of the ecliptic
  const gstHours = SiderealTime(birthDate); // Greenwich apparent sidereal time, hours
  const lstDeg = (((gstHours * 15 + location.longitudeDegrees) % 360) + 360) % 360;
  const th = lstDeg * D2R;
  const phi = location.latitudeDegrees * D2R;
  let lambda = Math.atan2(Math.cos(th), -(Math.sin(th) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) / D2R;
  lambda = ((lambda % 360) + 360) % 360;
  return TROPICAL_SIGNS[Math.floor(lambda / 30) % 12];
}

// Sky Signature — an archetype title keyed to the dominant constellation, so every
// person gets a named, memorable, shareable identity ("The Dreamer's Sky").
const CONSTELLATION_ARCHETYPE: Record<string, string> = {
  Pegasus: "The Dreamer's Sky",
  Orion: "The Hunter's Sky",
  Leo: "The Sovereign's Sky",
  Scorpius: "The Alchemist's Sky",
  Sagittarius: "The Seeker's Sky",
  Gemini: "The Twin Sky",
  Virgo: "The Artisan's Sky",
  Aquarius: "The Visionary's Sky",
  Taurus: "The Steadfast Sky",
  Cancer: "The Tidewatcher's Sky",
  Libra: "The Balanced Sky",
  Pisces: "The Mystic's Sky",
  Aries: "The Pioneer's Sky",
  Capricornus: "The Summit Sky",
  "Canis Major": "The Faithful Sky",
  "Ursa Major": "The Wanderer's Sky",
  "Ursa Minor": "The Northward Sky",
  Cassiopeia: "The Regent's Sky",
  Cygnus: "The Voyager's Sky",
  Lyra: "The Song Sky",
  Andromeda: "The Unbound Sky",
  Perseus: "The Hero's Sky",
  "Boötes": "The Herdsman's Sky",
  Hercules: "The Champion's Sky",
};

// Apparent-brightness order (brightest first) so "brightest planet" is astronomically
// honest: Venus ≫ Jupiter > Mars > Mercury > Saturn > the ice giants.
const PLANET_BRIGHTNESS_ORDER = ["Venus", "Jupiter", "Mars", "Mercury", "Saturn", "Uranus", "Neptune"];

function brightestVisiblePlanet(planets: BirthPlanet[]): string | null {
  const up = new Set(planets.filter((p) => p.visible).map((p) => p.name));
  for (const name of PLANET_BRIGHTNESS_ORDER) if (up.has(name)) return name;
  return null;
}

// Which stretch of the Milky Way rode overhead — evocative, keyed to the season the
// birth month places the galaxy in the evening sky.
function galacticRegionFor(month: number): string {
  if (month >= 6 && month <= 8) return "the luminous galactic core in Sagittarius";
  if (month >= 9 && month <= 11) return "the quiet outer arm beyond Pegasus";
  if (month === 12 || month <= 2) return "the Orion Arm — our own corner of the galaxy";
  return "the still skies above the galactic pole";
}

function buildSkySignature(
  dominantConstellation: string,
  brightestPlanet: string | null,
  moonPhase: string,
): { title: string; subtitle: string } {
  const title = CONSTELLATION_ARCHETYPE[dominantConstellation] ?? "The Starfarer's Sky";
  const moon = `a ${moonPhase.toLowerCase()} Moon`;
  const planetClause = brightestPlanet ? `${brightestPlanet} rising` : "the planets hidden below the horizon";
  const subtitle = `Born beneath ${dominantConstellation} with ${planetClause} and ${moon}.`;
  return { title, subtitle };
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
  const planetList =
    vis.length === 2
      ? `${vis[0]} and ${vis[1]}`
      : `${vis.slice(0, -1).join(", ")}, and ${vis[vis.length - 1]}`;
  const season = profile.seasonalSky ?? "";
  const article = /^[aeiou]/i.test(season) ? "an" : "a";
  return `Born under ${moonDesc} with ${planetList} visible, ${profile.dominantConstellation} overhead — ${article} ${season} sky.`;
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
  const sunSign = getSunSign(birthDate);
  const { name: moonPhase, illumination: moonIllumination } = getMoonPhase(birthDate);
  const risingSign = getRisingSign(birthDate, location);
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

  const brightestPlanet = brightestVisiblePlanet(planets);
  const galacticRegion = galacticRegionFor(month);
  const { title: skySignatureTitle, subtitle: skySignatureSubtitle } = buildSkySignature(
    dominantConstellation,
    brightestPlanet,
    moonPhase,
  );

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
    skySignatureTitle,
    skySignatureSubtitle,
    brightestPlanet,
    galacticRegion,
  };

  profile.cosmicSignature = generateSignature(profile);

  return profile;
}
