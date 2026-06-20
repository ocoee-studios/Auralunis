// NightModeService.ts
// True astronomical red night mode.
// Not just dimming — transforms the entire color palette to deep monochrome red.
// Real astronomers use red light to preserve rhodopsin (dark adaptation).
// The eye's rod cells are least sensitive to wavelengths > 620nm.
//
// This service provides a complete color token override map. The UI applies
// these via a React context wrapper that swaps ChronauraColors on toggle.

export interface NightModeColors {
  cosmicBlack: string;
  surface: string;
  elevated: string;
  gold: string;
  gold2: string;
  silver: string;
  muted: string;
  faint: string;
  green: string;
  violet: string;
  borderGold: string;
  borderSubtle: string;
  borderFaint: string;
  /** Text color for primary content */
  text: string;
  /** Text color for secondary content */
  textDim: string;
}

/** Deep red night mode palette — all wavelengths > 620nm */
export const NIGHT_MODE_COLORS: NightModeColors = {
  cosmicBlack:   "#0A0000",      // near-black with warm red undertone
  surface:       "#1A0505",      // very dark red surface
  elevated:      "#2A0808",      // slightly lighter red
  gold:          "#8B2020",      // muted crimson (replaces gold accents)
  gold2:         "#A83030",      // brighter crimson for highlights
  silver:        "#882222",      // muted red (replaces silver text)
  muted:         "#661515",      // dim red for secondary text
  faint:         "#441010",      // very dim red for tertiary text
  green:         "#882222",      // lock state — still red, not green (preserve adaptation)
  violet:        "#772020",      // violet → red
  borderGold:    "rgba(139,32,32,0.4)",   // red border
  borderSubtle:  "rgba(100,20,20,0.2)",
  borderFaint:   "rgba(80,15,15,0.1)",
  text:          "#AA3030",      // primary text — readable crimson
  textDim:       "#662020",      // secondary text
};

/** Standard mode color keys (same shape for easy swapping) */
export const STANDARD_MODE_COLORS: NightModeColors = {
  cosmicBlack:   "#0B0B12",
  surface:       "#121A2C",
  elevated:      "#1E2A44",
  gold:          "#D4AF37",
  gold2:         "#F3D99B",
  silver:        "#C0C6D4",
  muted:         "#A8AFBF",
  faint:         "#747D90",
  green:         "#4ADE80",
  violet:        "#7B5CF6",
  borderGold:    "rgba(212,175,55,0.28)",
  borderSubtle:  "rgba(192,198,212,0.15)",
  borderFaint:   "rgba(255,255,255,0.05)",
  text:          "#F3D99B",
  textDim:       "#C0C6D4",
};

/** Status bar style for each mode */
export const NIGHT_MODE_STATUS_BAR = "light-content" as const;

/** Screen brightness recommendation for night mode (0.0 - 1.0) */
export const NIGHT_MODE_BRIGHTNESS = 0.15;

/** Whether a given time suggests night mode (between civil twilight) */
export function shouldSuggestNightMode(sunElevation: number): boolean {
  return sunElevation < -6; // below civil twilight
}
