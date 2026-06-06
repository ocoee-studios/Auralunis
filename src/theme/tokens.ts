// Chronaura Design System — from the approved brand guide.
// Colors, typography, and spacing tokens used across all screens.

export const ChronauraColors = {
  // Primary palette (from brand guide)
  cosmicBlack: "#0B0B12",
  midnightNavy: "#121A2C",
  deepIndigo: "#1E2A44",
  gold: "#D4AF37",        // Astral Gold — primary accent
  silver: "#C0C6D4",      // Moon Silver — secondary text
  violet: "#7B5CF6",      // Nebula Violet — accent highlight

  // Extended palette
  gold2: "#F3D99B",       // Light gold for highlights
  goldDim: "#C7A66A",     // Muted gold for borders
  muted: "#A8AFBF",       // Muted text
  faint: "#747D90",       // Faint labels

  // Backgrounds
  background: "#0B0B12",  // App background (Cosmic Black)
  surface: "#121A2C",     // Card/panel surface (Midnight Navy)
  elevated: "#1E2A44",    // Elevated surface (Deep Indigo)

  // Borders
  borderGold: "rgba(212,175,55,0.34)",
  borderSubtle: "rgba(192,198,212,0.12)",
  borderFaint: "rgba(255,255,255,0.06)",

  // Glass panel
  glassBackground: "rgba(18,26,44,0.74)",
  glassBorder: "rgba(212,175,55,0.28)",
  glassHighlight: "rgba(255,255,255,0.08)",

  // Backward-compatible aliases (referenced by existing screens)
  orange: "#EF9F27",
  blue: "#78C8FF",
  green: "#4ADE80",
  black: "#0B0B12"
} as const;

export const ChronauraPricing = {
  horizonMonthly: "$4.99/month",
  horizonAnnual: "$29.99/year",
  founderAnnual: "$24.99 first year",
  auraMonthly: "$5.99/month",
  auraAnnual: "$49.99/year",
  sovereignAnnual: "$299/year",
  trial: "7-day free trial"
} as const;

export const ChronauraTypography = {
  // Display (brand name, screen titles)
  display: {
    fontFamily: "Cinzel_400Regular",      // Google Fonts: Cinzel
    fallback: "Georgia"                    // Fallback until font loads
  },
  // Body (descriptions, labels, values)
  body: {
    fontFamily: "Montserrat_400Regular",   // Google Fonts: Montserrat Light
    medium: "Montserrat_500Medium",        // Montserrat Medium
    fallback: "System"
  }
} as const;

export const ChronauraSpacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
  screenPadding: 16,
  cardRadius: 22,
  buttonRadius: 14
} as const;

export const ChronauraTaglines = [
  "Time moves. The cosmos remembers.",
  "Your time. Written in the stars.",
  "Explore time. Align with the universe.",
  "The universe is now in your hands."
] as const;

export interface ChronauraThemePalette {
  background: string;
  surface: string;
  accent: string;
  text: string;
  muted: string;
}

export const ChronauraThemes: Record<string, ChronauraThemePalette> = {
  system: { background: "#0B0B12", surface: "#121A2C", accent: "#D4AF37", text: "#F8F4EA", muted: "#A8AFBF" },
  midnight_gold: { background: "#0B0B12", surface: "#121A2C", accent: "#D4AF37", text: "#F8F4EA", muted: "#A8AFBF" },
  soft_moon: { background: "#14182A", surface: "#1E2640", accent: "#C0C6D4", text: "#F0F2F8", muted: "#8E96A8" },
  deep_space: { background: "#040408", surface: "#0A0C18", accent: "#7B5CF6", text: "#E8E4F0", muted: "#6E6E8A" }
};
