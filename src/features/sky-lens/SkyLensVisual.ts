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
  // WIDE brightness hierarchy (device-feedback pass): Sirius (mag -1.46) should read
  // dramatically bigger than an average mag-4 star — ~8-10×, not 2-3×. Steeper slope
  // + lower floor: mag -1.5 ≈ 11px, mag 0 ≈ 8.5px, mag 2 ≈ 4.9px, mag 4 ≈ 1.3px.
  // Guard against a non-finite magnitude: Math.max/min pass NaN through, and a NaN
  // radius reaching a native SVG <Circle> can crash the view. Fall back to a mid value.
  const m = Number.isFinite(magnitude) ? magnitude : 4;
  const r = 8.5 - 1.8 * m;
  return Math.max(0.8, Math.min(11, r));
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

// Atmospheric extinction tint: lerp a #RRGGBB star color toward a warm horizon
// orange by `amount` (0 = unchanged, ~0.2 = strongly warmed). Stars low in the
// sky redden as their light passes through more air — the real "sunset" effect on
// every rising/setting star. Pure + defensive (bad input → original color), so it
// never throws inside an SVG render path.
export function warmShift(hex: string, amount: number): string {
  if (amount <= 0 || typeof hex !== "string" || hex.length !== 7 || hex[0] !== "#") return hex;
  const n = parseInt(hex.slice(1), 16);
  if (Number.isNaN(n)) return hex;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const a = Math.min(0.2, amount);
  const mix = (c: number, t: number) => Math.round(c + (t - c) * a);
  const to2 = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to2(mix(r, 255))}${to2(mix(g, 150))}${to2(mix(b, 70))}`;
}

// Showpiece stars that earn a hand-tuned size + glow ring beyond the usual
// magnitude curve — the ones people point at and screenshot.
export interface StarFeature {
  radius: number;
  glowRadius: number;
  glowColor: string;
}
export const STAR_FEATURES: Record<string, StarFeature> = {
  // Radii bumped to match the new wide brightness curve so the showpieces stay the
  // biggest stars in the sky (Sirius the clear king), not capped below mag-0 dots.
  sirius: { radius: 11, glowRadius: 24, glowColor: "rgba(190,224,255,0.30)" }, // brightest star — blue-white bloom + spikes
  vega: { radius: 9, glowRadius: 18, glowColor: "rgba(170,207,255,0.26)" }, // icy blue-white glow
  rigel: { radius: 9.5, glowRadius: 19, glowColor: "rgba(150,190,255,0.28)" }, // electric blue shimmer
  betelgeuse: { radius: 9.5, glowRadius: 20, glowColor: "rgba(255,110,60,0.28)" }, // ember-red aura
  arcturus: { radius: 8.5, glowRadius: 16, glowColor: "rgba(255,178,74,0.22)" }, // warm amber
  antares: { radius: 9, glowRadius: 17, glowColor: "rgba(240,100,100,0.25)" }, // red ember, heart of Scorpius
  shaula: { radius: 6, glowRadius: 12, glowColor: "rgba(255,246,214,0.15)" } // warm-white, the stinger
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
// SPECTRAL distribution for the dense background field. Roughly the real naked-eye
// mix: 40% blue-white, 30% yellow-white, 20% orange, 10% red — 10 entries (4/3/2/1)
// so the hash lands on that ratio. Stage-2 sky-renderer: a touch more chroma and a
// wider spread (icy cyan-blue, deeper blue, richer amber/red) so the field reads
// with real colour variety instead of a uniform pale wash — still tasteful, not neon.
const DOME_TINTS = [
  "#C6D8FF", "#AEC6FF", "#9FD6F2", "#BCCEFF", // blue-white → icy cyan-blue + deep blue (40%)
  "#FBEDC2", "#F4E2B0", "#FFECC0",            // yellow-white (30%)
  "#FFCE92", "#FFC486",                        // orange (20%)
  "#FFAE86",                                   // warm red (10%)
];
export function domeColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return DOME_TINTS[h % DOME_TINTS.length];
}

export function skyGradient(sunAltitudeDegrees: number): readonly [string, string, string, string] {
  const a = sunAltitudeDegrees;
  if (a < -18) return ["#05091C", "#0B1432", "#11204A", "#1A2C58"]; // deep night (navy horizon, not black)
  if (a < -12) return ["#050D1E", "#0D1A38", "#1A254A", "#2A2855"]; // astronomical twilight
  if (a < -6) return ["#0A1428", "#1A2548", "#2D2E5A", "#8B5A30"]; // nautical twilight (violet→amber)
  if (a < 6) return ["#142040", "#2A3060", "#5A4060", "#EF7B27"]; // golden hour / civil
  return ["#1E4FA0", "#2E6FC0", "#5A9FD4", "#BFD8EA"]; // daytime blue
}

// Hero Object Focus Mode: when an object is selected, its on-screen position +
// radius form a focus zone. Layers call focusFactor() to find how strongly each
// object sits inside it (1 at the center → 0 at the edge, eased), and boost their
// own size/brightness accordingly. focus === null (nothing selected) → 0 everywhere,
// so the whole system is inert until the user taps something.
export type FocusZone = { x: number; y: number; r: number } | null;
export function focusFactor(px: number, py: number, focus: FocusZone): number {
  if (!focus) return 0;
  const d = Math.hypot(px - focus.x, py - focus.y);
  if (d >= focus.r) return 0;
  const t = 1 - d / focus.r;
  return t * t;
}

export type SelectedKind = "star" | "planet" | "moon" | "constellation" | "nebula" | "zodiac" | "satellite";

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
