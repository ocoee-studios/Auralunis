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
