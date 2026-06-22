// Shared visual contract for the Sky Lens SVG layers: the day/night palettes,
// magnitude→size mapping, the projection closure type each layer consumes, and
// the object shape handed to the Info Card on tap. Keeping this here lets every
// layer stay a thin presentational component.

import type { ProjectedTarget } from "./ar/SkyLensProjection";

export type ProjectFn = (azimuthDegrees: number, altitudeDegrees: number) => ProjectedTarget;

export interface SkyPalette {
  star: string;
  starLabel: string;
  line: string; // constellation strokes
  conLabel: string;
  grid: string;
  gridLabel: string;
  horizon: string;
  moon: string;
  moonShadow: string;
  accent: string;
}

// Midnight-Gold palette (default) and the dark-adapted red palette for Night Mode.
export const DAY_PALETTE: SkyPalette = {
  star: "#FFFFFF",
  starLabel: "#FFF1C4",
  line: "#FFD27A",
  conLabel: "#FFE3A6",
  grid: "rgba(192,198,212,0.15)",
  gridLabel: "rgba(192,198,212,0.6)",
  horizon: "rgba(217,168,78,0.7)",
  moon: "#EDEFF5",
  moonShadow: "rgba(3,8,22,0.82)",
  accent: "#D9A84E"
};

export const NIGHT_PALETTE: SkyPalette = {
  star: "#A83030",
  starLabel: "#C24A4A",
  line: "rgba(139,32,32,0.6)",
  conLabel: "rgba(176,52,52,0.9)",
  grid: "rgba(139,32,32,0.22)",
  gridLabel: "rgba(176,52,52,0.6)",
  horizon: "rgba(176,52,52,0.7)",
  moon: "#8B2020",
  moonShadow: "rgba(3,8,22,0.85)",
  accent: "#8B2020"
};

// Planet disc colors (from the spec). Night Mode overrides these to red in-layer.
export const PLANET_COLORS: Record<string, string> = {
  mercury: "#C0C6D4",
  venus: "#FFF6D6",
  mars: "#F0997B",
  jupiter: "#EF9F27",
  saturn: "#D9A84E"
};

// Naked-eye magnitude → marker radius (px). Steep curve so brightness reads as a
// clear hierarchy, not a field of identical dots: mag-0 showpieces (Vega, Deneb,
// Sirius) ~5px, visible named stars ~2.5px, dim catalog stars clamp to ~0.8px.
export function magnitudeToRadius(magnitude: number): number {
  const r = 5.0 - magnitude * 1.4;
  return Math.max(0.8, Math.min(5.0, r));
}

// Approximate spectral colors for the brightest named stars (by spectral class),
// so the sky reads colorful rather than uniform white. Default is a soft
// blue-white that cools slightly with magnitude.
const STAR_COLORS: Record<string, string> = {
  // blue / blue-white (O/B/A) — vivid icy blue
  rigel: "#7FB0FF", bellatrix: "#93BCFF", alnilam: "#7FB0FF", alnitak: "#7FB0FF",
  mintaka: "#7FB0FF", saiph: "#93BCFF", spica: "#79A8FF", achernar: "#8AB6FF",
  hadar: "#7FB0FF", acrux: "#7FB0FF", mimosa: "#7FB0FF", regulus: "#A6C8FF",
  algol: "#A6C8FF", vega: "#AFCFFF", sirius: "#BFE0FF", deneb: "#C7E2FF",
  castor: "#AFCFFF", adhara: "#7FB0FF", alkaid: "#93BCFF", elnath: "#B6D2FF",
  peacock: "#93BCFF", mirzam: "#93BCFF",
  // white (A/F)
  altair: "#EAF2FF", canopus: "#FBFAE8", procyon: "#F0F4FF", fomalhaut: "#DCE8FF",
  caph: "#FFF0CC", polaris: "#F6F1DC",
  // yellow (G) — warm gold
  capella: "#FFDD7A", "rigil-kent": "#FFE9B0",
  // orange (K) — rich amber
  arcturus: "#FFB24A", aldebaran: "#FF9E3D", pollux: "#FFB866", dubhe: "#FFC97E",
  alphard: "#FFB866", hamal: "#FFBE74", kochab: "#FFBC70", suhail: "#FFB24A",
  menkent: "#FFBC70", enif: "#FFB866",
  // red (M) — fiery coral-red
  betelgeuse: "#FF6A3D", antares: "#FF5A33", gacrux: "#FF7E4A", scheat: "#FF9166",
  mirach: "#FF9166",
};

export function starColor(id: string, magnitude: number): string {
  return STAR_COLORS[id] ?? (magnitude < 2 ? "#EAF2FF" : magnitude < 3.2 ? "#D2E0FF" : "#BFD2FF");
}

// Showpiece stars that earn a hand-tuned size + glow ring beyond the usual
// magnitude curve — the ones people point at and screenshot.
export interface StarFeature {
  radius: number;
  glowRadius: number;
  glowColor: string;
}
export const STAR_FEATURES: Record<string, StarFeature> = {
  antares: { radius: 6, glowRadius: 14, glowColor: "rgba(240,100,100,0.25)" }, // red ember, heart of Scorpius
  shaula: { radius: 4, glowRadius: 10, glowColor: "rgba(255,246,214,0.15)" } // warm-white, the stinger
};

// Subtle per-constellation tints so each figure reads as distinct without turning
// the sky into a rainbow — a curated cool/warm set, chosen deterministically by id.
const CONSTELLATION_TINTS = [
  "#FFD27A", "#8FD0FF", "#9CE6C8", "#C7A6FF", "#FF9EB5", "#FFC07A", "#7FE3FF", "#E0C36B"
];
export function constellationColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return CONSTELLATION_TINTS[h % CONSTELLATION_TINTS.length];
}

// Dynamic atmospheric sky gradient (Phase 1) — the real sky isn't flat black.
// 4 vertical stops (zenith → mid → 30°alt → horizon) chosen by the Sun's altitude
// from the ephemeris, per VISUAL_QUALITY_SPEC: navy overhead → indigo → violet/gold
// near the horizon, brightening through twilight into golden hour and daytime blue.
// Slight color variety for the dense background field (mostly white-blue, a
// sprinkle of warm) so the starfield reads richer than a uniform wash.
const DOME_TINTS = ["#EAF0FF", "#EAF0FF", "#EAF0FF", "#DCE6FF", "#FFEDD2", "#FFD9A8", "#CFE0FF", "#FFC9A0"];
export function domeColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return DOME_TINTS[h % DOME_TINTS.length];
}

export function skyGradient(sunAltitudeDegrees: number): readonly [string, string, string, string] {
  const a = sunAltitudeDegrees;
  if (a < -18) return ["#030816", "#061028", "#0A1535", "#121D3A"]; // deep night
  if (a < -12) return ["#050D1E", "#0D1A38", "#1A254A", "#2A2855"]; // astronomical twilight
  if (a < -6) return ["#0A1428", "#1A2548", "#2D2E5A", "#8B5A30"]; // nautical twilight (violet→amber)
  if (a < 6) return ["#142040", "#2A3060", "#5A4060", "#EF7B27"]; // golden hour / civil
  return ["#1E4FA0", "#2E6FC0", "#5A9FD4", "#BFD8EA"]; // daytime blue
}

export type SelectedKind = "star" | "planet" | "moon" | "constellation";

export interface SelectedFact {
  label: string;
  value: string;
}

export interface SelectedObject {
  kind: SelectedKind;
  id: string;
  name: string;
  subtitle?: string;
  facts: SelectedFact[];
  description?: string;
}
