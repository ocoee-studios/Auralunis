// ConstellationHapticsService.ts
// Haptic constellation tracing — taps out a constellation's star pattern
// as a rhythmic sequence of CoreHaptics ticks on the Apple Watch.
//
// Each star = one tick. The delay between ticks is proportional to the
// angular distance between consecutive stars in the constellation figure.
// Bright stars get a stronger tick; dim stars get a softer one.
//
// Usage:
//   await traceConstellation("orion");
//   // Watch ticks: strong-strong-quick-quick-quick-pause-strong-strong

import { WatchHaptics } from "@/modules/WatchHaptics";
import { Vibration, Platform } from "react-native";

export interface ConstellationPattern {
  id: string;
  name: string;
  /** Star sequence for haptic tracing (in figure-drawing order) */
  stars: Array<{
    name: string;
    /** Visual magnitude — lower = brighter = stronger tick */
    magnitude: number;
    /** Relative position (0-1 normalized) for timing computation */
    x: number;
    y: number;
  }>;
}

const PATTERNS: ConstellationPattern[] = [
  {
    id: "orion", name: "Orion",
    stars: [
      { name: "Betelgeuse", magnitude: 0.5, x: 0.3, y: 0.15 },
      { name: "Bellatrix", magnitude: 1.6, x: 0.7, y: 0.18 },
      { name: "Mintaka", magnitude: 1.7, x: 0.4, y: 0.45 },
      { name: "Alnilam", magnitude: 1.7, x: 0.5, y: 0.48 },
      { name: "Alnitak", magnitude: 2.2, x: 0.6, y: 0.51 },
      { name: "Rigel", magnitude: 0.1, x: 0.3, y: 0.82 },
      { name: "Saiph", magnitude: 2.1, x: 0.7, y: 0.78 },
    ],
  },
  {
    id: "ursa-major", name: "Ursa Major",
    stars: [
      { name: "Dubhe", magnitude: 1.8, x: 0.1, y: 0.6 },
      { name: "Merak", magnitude: 2.4, x: 0.2, y: 0.65 },
      { name: "Phecda", magnitude: 2.4, x: 0.35, y: 0.55 },
      { name: "Megrez", magnitude: 3.3, x: 0.45, y: 0.4 },
      { name: "Alioth", magnitude: 1.8, x: 0.6, y: 0.3 },
      { name: "Mizar", magnitude: 1.8, x: 0.75, y: 0.25 },
      { name: "Alkaid", magnitude: 1.9, x: 0.9, y: 0.35 },
    ],
  },
  {
    id: "cassiopeia", name: "Cassiopeia",
    stars: [
      { name: "Caph", magnitude: 2.2, x: 0.1, y: 0.5 },
      { name: "Schedar", magnitude: 2.3, x: 0.3, y: 0.2 },
      { name: "Gamma", magnitude: 2.5, x: 0.5, y: 0.6 },
      { name: "Ruchbah", magnitude: 2.7, x: 0.7, y: 0.15 },
      { name: "Segin", magnitude: 3.4, x: 0.9, y: 0.5 },
    ],
  },
  {
    id: "scorpius", name: "Scorpius",
    stars: [
      { name: "Dschubba", magnitude: 2.3, x: 0.2, y: 0.1 },
      { name: "Graffias", magnitude: 2.6, x: 0.25, y: 0.2 },
      { name: "Antares", magnitude: 1.0, x: 0.35, y: 0.4 },
      { name: "Tau Sco", magnitude: 2.8, x: 0.5, y: 0.55 },
      { name: "Epsilon Sco", magnitude: 2.4, x: 0.6, y: 0.7 },
      { name: "Shaula", magnitude: 1.6, x: 0.8, y: 0.85 },
      { name: "Lesath", magnitude: 2.7, x: 0.75, y: 0.9 },
    ],
  },
  {
    id: "leo", name: "Leo",
    stars: [
      { name: "Regulus", magnitude: 1.4, x: 0.1, y: 0.7 },
      { name: "Eta Leo", magnitude: 2.6, x: 0.2, y: 0.5 },
      { name: "Algieba", magnitude: 2.0, x: 0.35, y: 0.3 },
      { name: "Zosma", magnitude: 2.1, x: 0.6, y: 0.35 },
      { name: "Denebola", magnitude: 2.6, x: 0.9, y: 0.5 },
    ],
  },
  {
    id: "cygnus", name: "Cygnus",
    stars: [
      { name: "Deneb", magnitude: 1.3, x: 0.5, y: 0.05 },
      { name: "Sadr", magnitude: 2.2, x: 0.5, y: 0.4 },
      { name: "Gienah", magnitude: 2.5, x: 0.2, y: 0.4 },
      { name: "Delta Cyg", magnitude: 2.9, x: 0.8, y: 0.4 },
      { name: "Albireo", magnitude: 3.1, x: 0.5, y: 0.9 },
    ],
  },
];

/** Distance between two stars in normalized space */
function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Map star magnitude to haptic intensity (brighter = stronger) */
function magToIntensity(mag: number): "strong" | "medium" | "light" {
  if (mag < 1.0) return "strong";
  if (mag < 2.5) return "medium";
  return "light";
}

/** Delay between stars based on angular distance (ms) */
function delayFromDistance(d: number): number {
  // Close stars (~0.05 apart) = 120ms; far stars (~0.5 apart) = 400ms
  return Math.round(120 + d * 560);
}

/**
 * Trace a constellation's star pattern as a haptic sequence.
 * Each star fires a tick proportional to its brightness.
 * Delay between ticks is proportional to star-to-star distance.
 */
export async function traceConstellation(constellationId: string): Promise<void> {
  const pattern = PATTERNS.find(p => p.id === constellationId);
  if (!pattern) return;

  for (let i = 0; i < pattern.stars.length; i++) {
    const star = pattern.stars[i];
    const intensity = magToIntensity(star.magnitude);

    // Fire the tick
    if (Platform.OS === "ios") {
      if (intensity === "strong") {
        WatchHaptics.triggerLockPulse();
      } else {
        WatchHaptics.triggerCompassTick();
      }
    } else {
      // Android fallback
      Vibration.vibrate(intensity === "strong" ? 80 : intensity === "medium" ? 50 : 25);
    }

    // Wait proportional to distance to next star
    if (i < pattern.stars.length - 1) {
      const d = dist(star, pattern.stars[i + 1]);
      await new Promise(resolve => setTimeout(resolve, delayFromDistance(d)));
    }
  }
}

/** Get all available constellation patterns */
export function getConstellationPatterns(): ConstellationPattern[] {
  return PATTERNS;
}

/** Get a specific pattern by ID */
export function getPattern(id: string): ConstellationPattern | undefined {
  return PATTERNS.find(p => p.id === id);
}

/**
 * Generate a Vibration.vibrate() pattern array for a constellation.
 * Useful for Android or as a fallback when CoreHaptics isn't available.
 * Format: [wait, vibrate, wait, vibrate, ...]
 */
export function constellationToVibrationPattern(constellationId: string): number[] {
  const pattern = PATTERNS.find(p => p.id === constellationId);
  if (!pattern) return [];

  const result: number[] = [0]; // start immediately
  for (let i = 0; i < pattern.stars.length; i++) {
    const star = pattern.stars[i];
    const vibDuration = star.magnitude < 1.0 ? 80 : star.magnitude < 2.5 ? 50 : 30;
    result.push(vibDuration);

    if (i < pattern.stars.length - 1) {
      const d = dist(star, pattern.stars[i + 1]);
      result.push(delayFromDistance(d));
    }
  }
  return result;
}
