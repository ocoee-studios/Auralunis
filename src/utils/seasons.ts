// Pure, latitude-aware season helpers.
//
// Ordinary Earth seasons are inverted between hemispheres: a "winter" object in the
// Northern Hemisphere is a summer object in the Southern Hemisphere. Near the equator the
// four-season model doesn't meaningfully apply, and when we don't know the observer's
// latitude we must not silently assume Northern. These helpers transform labels at DISPLAY
// time only — they never mutate catalog data, astronomy, or event instants.

export type Season = "spring" | "summer" | "autumn" | "winter";
export type Hemisphere = "northern" | "southern" | "equatorial" | "unknown";

/** Latitudes within this band of the equator are treated as equatorial (no four-season model). */
const EQUATOR_BAND_DEG = 1;

/** Neutral wording shown for a plain four-season label at the equator or when latitude is unknown. */
export const NEUTRAL_SEASON_LABEL = "Season varies by local climate";

export function hemisphereFor(latitude: number | null | undefined): Hemisphere {
  if (latitude == null || Number.isNaN(latitude)) return "unknown";
  if (Math.abs(latitude) < EQUATOR_BAND_DEG) return "equatorial";
  return latitude >= 0 ? "northern" : "southern";
}

/** Northern-hemisphere meteorological season for a 1-based month (1 = January … 12 = December). */
function northernSeason(month: number): Season {
  if (month === 12 || month === 1 || month === 2) return "winter";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  return "autumn"; // 9, 10, 11
}

const OPPOSITE_SEASON: Record<Season, Season> = {
  spring: "autumn",
  autumn: "spring",
  summer: "winter",
  winter: "summer",
};

/**
 * Meteorological season at a latitude for a 1-based month. Northern mapping for the
 * Northern Hemisphere; inverted by six months for the Southern Hemisphere. Equatorial and
 * unknown latitudes fall back to the northern-calendar season (callers that display a
 * label should use `displaySeasonLabel`, which applies neutral wording in those cases).
 */
export function classifySeason(month: number, latitude: number | null | undefined): Season {
  const base = northernSeason(month);
  return hemisphereFor(latitude) === "southern" ? OPPOSITE_SEASON[base] : base;
}

const PLAIN_SEASON_WORDS = new Set(["spring", "summer", "autumn", "fall", "winter"]);

// Southern-hemisphere swap for a plain season word. "fall"/"autumn" both map to spring.
const SOUTHERN_SWAP: Record<string, Season> = {
  spring: "autumn",
  autumn: "spring",
  fall: "spring",
  summer: "winter",
  winter: "summer",
};

/** Reproduce the original label's capitalization (ALL CAPS / Title / lower) on the swapped word. */
function applyCase(sample: string, word: string): string {
  const isUpper = sample === sample.toUpperCase() && sample !== sample.toLowerCase();
  if (isUpper) return word.toUpperCase();
  const firstUpper = sample[0] === sample[0].toUpperCase() && sample[0] !== sample[0].toLowerCase();
  if (firstUpper) return word[0].toUpperCase() + word.slice(1);
  return word;
}

/**
 * Transform a user-facing "best season" style label for the observer's hemisphere.
 * - Only a label that is *exactly* one plain ordinary season word (spring/summer/autumn/
 *   fall/winter, any case) is transformed — compound or non-season labels ("Year-round (N)",
 *   "Varies", "Aquarius season", month names) pass through unchanged.
 * - Northern Hemisphere: returned unchanged.
 * - Southern Hemisphere: swapped by six months, preserving capitalization.
 * - Equator / unknown latitude: neutral wording, never a pretend Northern four-season claim.
 */
export function displaySeasonLabel(label: string | null | undefined, latitude: number | null | undefined): string {
  const raw = label ?? "";
  const key = raw.trim().toLowerCase();
  if (!PLAIN_SEASON_WORDS.has(key)) return raw; // non-season / compound / zodiac → untouched

  const hemi = hemisphereFor(latitude);
  if (hemi === "equatorial" || hemi === "unknown") return NEUTRAL_SEASON_LABEL;
  if (hemi === "northern") return raw; // preserve original text (incl. fall vs autumn) and casing
  return applyCase(raw, SOUTHERN_SWAP[key]);
}
