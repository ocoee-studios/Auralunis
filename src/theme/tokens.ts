export const ChronauraColors = {
  black: "#0B0B12",
  deep: "#070912",
  navy: "#121A2C",
  gold: "#D4AF37",
  gold2: "#F6DC91",
  silver: "#C0C6D4",
  muted: "#8F99B3",
  blue: "#62CFFF",
  violet: "#8B74FF",
  green: "#9DFFC7",
  orange: "#FFB07A"
} as const;

export const ChronauraPricing = {
  horizonFree: "Free forever",
  horizonMonthly: "$2.99/month",
  horizonAnnual: "$19.99/year",
  auraMonthly: "$5.99/month",
  auraAnnual: "$49.99/year",
  sovereignAnnual: "$299/year",
  trial: "7-day free trial for eligible new subscribers"
} as const;

export type ChronauraThemePalette = {
  gradient: readonly [string, string, string];
  card: string;
  border: string;
  accent: string;
  accentSoft: string;
};

export const ChronauraThemes = {
  midnight_gold: {
    gradient: ["#0B0B12", "#070912", "#05060B"],
    card: "rgba(255,255,255,0.055)",
    border: "rgba(212,175,55,0.18)",
    accent: "#D4AF37",
    accentSoft: "rgba(212,175,55,0.13)"
  },
  soft_moon: {
    gradient: ["#101321", "#11182B", "#080B14"],
    card: "rgba(210,220,255,0.07)",
    border: "rgba(192,198,212,0.22)",
    accent: "#C0C6D4",
    accentSoft: "rgba(192,198,212,0.12)"
  },
  deep_space: {
    gradient: ["#02040A", "#07111E", "#060713"],
    card: "rgba(98,207,255,0.055)",
    border: "rgba(98,207,255,0.20)",
    accent: "#62CFFF",
    accentSoft: "rgba(98,207,255,0.12)"
  },
  system: {
    gradient: ["#0B0B12", "#070912", "#05060B"],
    card: "rgba(255,255,255,0.055)",
    border: "rgba(212,175,55,0.18)",
    accent: "#D4AF37",
    accentSoft: "rgba(212,175,55,0.13)"
  }
} as const satisfies Record<string, ChronauraThemePalette>;
