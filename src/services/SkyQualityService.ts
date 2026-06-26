// SkyQualityService.ts — transforms the entire visual based on Bortle setting
// City mode: sparse, light-polluted. Dark site: full blazing universe.

export type SkyQuality = "urban" | "suburban" | "rural" | "dark";

export interface SkyQualityProfile {
  label: string;
  bortle: string;
  domeStarMultiplier: number;    // 0-1: fraction of dome stars to show
  milkyWayOpacity: number;       // 0-1: MW band visibility
  nebulaOpacity: number;         // 0-1: nebula glow visibility
  skyBrightness: number;         // 0-1: background sky brightness (light pollution)
  faintStarCutoff: number;       // magnitude: stars dimmer than this are hidden
  description: string;
}

export const SKY_PROFILES: Record<SkyQuality, SkyQualityProfile> = {
  urban: {
    label: "City Sky",
    bortle: "7-9",
    domeStarMultiplier: 0.15,     // only 15% of dome stars visible
    milkyWayOpacity: 0.0,         // MW invisible in cities
    nebulaOpacity: 0.0,           // no nebulae visible
    skyBrightness: 0.12,          // sky glow from light pollution
    faintStarCutoff: 3.0,         // only bright stars visible
    description: "Light-polluted city sky. Only the brightest stars and planets visible.",
  },
  suburban: {
    label: "Suburban Sky",
    bortle: "5-6",
    domeStarMultiplier: 0.45,     // about half visible
    milkyWayOpacity: 0.25,        // faint MW hint
    nebulaOpacity: 0.15,          // barely visible nebulae
    skyBrightness: 0.06,          // some light pollution
    faintStarCutoff: 4.5,
    description: "Suburban sky. Milky Way faintly visible on good nights.",
  },
  rural: {
    label: "Rural Sky",
    bortle: "3-4",
    domeStarMultiplier: 0.75,
    milkyWayOpacity: 0.7,
    nebulaOpacity: 0.6,
    skyBrightness: 0.02,
    faintStarCutoff: 5.5,
    description: "Dark rural sky. Milky Way clearly visible. Many deep sky objects.",
  },
  dark: {
    label: "Dark Site",
    bortle: "1-2",
    domeStarMultiplier: 1.0,      // ALL stars visible
    milkyWayOpacity: 1.0,         // full MW glory
    nebulaOpacity: 1.0,           // all nebulae vivid
    skyBrightness: 0.0,           // pure dark sky
    faintStarCutoff: 6.5,         // naked eye limit
    description: "Pristine dark sky. The full universe revealed.",
  },
};

// Seasonal color grading — shifts the palette subtly by month
export function getSeasonalTint(month: number, latitude: number): { warm: number; cool: number } {
  // Northern hemisphere seasons (flip for southern)
  const isNorth = latitude >= 0;
  const adjustedMonth = isNorth ? month : (month + 6) % 12;

  // Summer = warm gold (Milky Way season), Winter = cool blue (Orion season)
  if (adjustedMonth >= 5 && adjustedMonth <= 8) {
    return { warm: 0.08, cool: 0.0 };  // summer: warm gold tint
  } else if (adjustedMonth >= 11 || adjustedMonth <= 2) {
    return { warm: 0.0, cool: 0.06 };  // winter: cool blue tint
  }
  return { warm: 0.03, cool: 0.02 };   // spring/fall: neutral
}

// "Magnificent Night" detection — boost visuals when conditions are great
export function isMagnificentNight(stargazingScore: number): boolean {
  return stargazingScore >= 85;
}

export function getMagnificentBoost(stargazingScore: number): number {
  if (stargazingScore >= 95) return 1.3;  // exceptional: 30% boost
  if (stargazingScore >= 85) return 1.15; // magnificent: 15% boost
  return 1.0; // normal
}

// Atmospheric extinction — stars near horizon warm in color
export function getExtinctionWarmth(altitudeDegrees: number): number {
  if (altitudeDegrees >= 45) return 0;
  if (altitudeDegrees <= 0) return 0.2;
  // Linear ramp: 0° = 20% warm shift, 45° = 0%
  return 0.2 * (1 - altitudeDegrees / 45);
}
