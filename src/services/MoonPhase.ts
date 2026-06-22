// Single source of truth for moon-phase naming and illumination bucketing.
// Canonical thresholds (illumination %): New <3 · Crescent <40 · Quarter 40–60 ·
// Gibbous 60–97 · Full ≥97. Used by the calendar, prompts, birth sky, and
// compatibility features so the same illumination always yields the same name.

export const MOON_PHASE_NAMES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent"
] as const;

// Full eight-phase name. Requires the waxing/waning direction to distinguish,
// e.g. Waxing Crescent from Waning Crescent.
export function moonPhaseName(illuminationPercent: number, isWaxing: boolean): string {
  if (illuminationPercent < 3) return MOON_PHASE_NAMES[0];
  if (illuminationPercent > 97) return MOON_PHASE_NAMES[4];
  if (isWaxing) {
    if (illuminationPercent < 40) return MOON_PHASE_NAMES[1];
    if (illuminationPercent < 60) return MOON_PHASE_NAMES[2];
    return MOON_PHASE_NAMES[3];
  }
  if (illuminationPercent > 60) return MOON_PHASE_NAMES[5];
  if (illuminationPercent > 40) return MOON_PHASE_NAMES[6];
  return MOON_PHASE_NAMES[7];
}

// Direction-agnostic label for callers that only know illumination and have no
// waxing/waning context (e.g. a single birth-night snapshot). Same thresholds.
export function moonPhaseLabel(illuminationPercent: number): string {
  if (illuminationPercent < 3) return "New Moon";
  if (illuminationPercent < 40) return "Crescent Moon";
  if (illuminationPercent < 60) return "Quarter Moon";
  if (illuminationPercent <= 97) return "Gibbous Moon";
  return "Full Moon";
}
