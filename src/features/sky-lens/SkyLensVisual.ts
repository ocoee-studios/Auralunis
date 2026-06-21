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
  starLabel: "#FFF6D6",
  line: "rgba(217,168,78,0.5)",
  conLabel: "rgba(217,168,78,0.85)",
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

// Naked-eye magnitude → marker radius (px). Brighter (smaller mag) → bigger dot.
// Clamped so the dimmest catalog stars stay tappable and Sirius doesn't bloom.
export function magnitudeToRadius(magnitude: number): number {
  const r = 3.6 - magnitude * 0.85;
  return Math.max(0.9, Math.min(4.6, r));
}

// Approximate spectral colors for the brightest named stars (by spectral class),
// so the sky reads colorful rather than uniform white. Default is a soft
// blue-white that cools slightly with magnitude.
const STAR_COLORS: Record<string, string> = {
  // blue / blue-white (O/B/A)
  rigel: "#AEC6FF", bellatrix: "#BFD3FF", alnilam: "#AEC6FF", alnitak: "#AEC6FF",
  mintaka: "#AEC6FF", saiph: "#BFD3FF", spica: "#A9C2FF", achernar: "#B6CCFF",
  hadar: "#AEC6FF", acrux: "#AEC6FF", mimosa: "#AEC6FF", regulus: "#C4D6FF",
  algol: "#C4D6FF", vega: "#CFE0FF", sirius: "#CFE6FF", deneb: "#DCE8FF",
  castor: "#CFE0FF", adhara: "#AEC6FF", alkaid: "#BFD3FF", elnath: "#D6E2FF",
  peacock: "#BFD3FF", mirzam: "#BFD3FF",
  // white (A/F)
  altair: "#F4F7FF", canopus: "#FBFBF0", procyon: "#F8F8FF", fomalhaut: "#EAF0FF",
  caph: "#FFF6E0", polaris: "#FAF7EC",
  // yellow (G)
  capella: "#FFE9A8", "rigil-kent": "#FFF1D6",
  // orange (K)
  arcturus: "#FFC074", aldebaran: "#FFB061", pollux: "#FFC890", dubhe: "#FFD9A8",
  alphard: "#FFC890", hamal: "#FFD0A0", kochab: "#FFCE9E", suhail: "#FFC074",
  menkent: "#FFCE9E", enif: "#FFC890",
  // red (M)
  betelgeuse: "#FF8C5A", antares: "#FF7E52", gacrux: "#FF9E6B", scheat: "#FFB089",
  mirach: "#FFB089",
};

export function starColor(id: string, magnitude: number): string {
  return STAR_COLORS[id] ?? (magnitude < 2 ? "#F2F6FF" : magnitude < 3.2 ? "#E6EEFF" : "#D7E2FF");
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
