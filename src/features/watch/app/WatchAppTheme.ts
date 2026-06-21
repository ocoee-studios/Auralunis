// Shared theme + tab contract for the in-app AuraLunis Watch experience.
// The watch app is a self-contained, phone-rendered preview of the watchOS
// companion: a round "OLED" screen with a 6-tab bar, each tab wired to the real
// ephemeris / sensors / vault. Kept independent of the app's settings/weather
// contexts (which are mid-rename) so every tab opens and works on its own.

import type { TonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface WatchPalette {
  bg: string;
  screen: string;
  text: string;
  dim: string;
  accent: string;
  accentSoft: string;
  line: string;
}

// Midnight-Gold (default) and the dark-adapted red Night Vision palette (spec §Night Mode).
export const WATCH_DAY: WatchPalette = {
  bg: "#030816",
  screen: "#070B16",
  text: "#FFFFFF",
  dim: "#C0C6D4",
  accent: "#D9A84E",
  accentSoft: "rgba(217,168,78,0.15)",
  line: "rgba(255,255,255,0.08)"
};

export const WATCH_NIGHT: WatchPalette = {
  bg: "#0A0000",
  screen: "#120303",
  text: "#C24A4A",
  dim: "#772020",
  accent: "#8B2020",
  accentSoft: "rgba(139,32,32,0.18)",
  line: "rgba(139,32,32,0.25)"
};

export type WatchTabKey = "dial" | "tonight" | "sats" | "compass" | "timer" | "log";

export interface WatchTabDef {
  key: WatchTabKey;
  label: string;
  icon: string;
}

export const WATCH_TABS: ReadonlyArray<WatchTabDef> = [
  { key: "dial", label: "Dial", icon: "☉" },
  { key: "tonight", label: "Tonight", icon: "☾" },
  { key: "sats", label: "Passes", icon: "◈" },
  { key: "compass", label: "Compass", icon: "✦" },
  { key: "timer", label: "Timer", icon: "◷" },
  { key: "log", label: "Log", icon: "✎" }
];

// A locally-computed Tonight Score (clear-sky assumption) so the Dial shows a real
// number without depending on the weather/settings contexts. Mirrors the spirit of
// TonightScoreService: bright moon above the horizon hurts; visible planets help.
export function watchTonightScore(sky: TonightSky): { score: number; label: string } {
  const moon = sky.bodies.find((b) => b.id === "moon");
  const moonPenalty = sky.moonIlluminationPercent * (moon?.aboveHorizon ? 0.45 : 0.1);
  const planets = sky.visibleBodies.filter((b) => b.id !== "sun" && b.id !== "moon").length;
  const raw = 92 - moonPenalty + Math.min(12, planets * 3);
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor";
  return { score, label };
}

export interface WatchCtx {
  sky: TonightSky;
  location: ObserverLocation;
  palette: WatchPalette;
  nightMode: boolean;
}
