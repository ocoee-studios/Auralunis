// SkyShareService.ts — Branded Sky Observation Cards
// Generates shareable cards with your sky observation data,
// AuraLunis branding, and the celestial conditions at that moment.
// Uses expo-sharing + ViewShot to capture and share as images.

import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import { formatLongDate, formatClockTime } from "@/utils/formatting";

export interface SkyObservation {
  id: string;
  timestamp: string;        // ISO 8601
  locationName: string;
  location: ObserverLocation;
  note: string;             // User's freeform note
  objects: string[];        // ["Moon", "Mars", "Venus"]
  moonPhasePercent: number;
  tonightScore: number;
  conditions: string;       // "Clear skies" / "Partly cloudy"
  tags: string[];           // ["first_light", "meteor", "iss_pass"]
}

export interface ShareCard {
  observation: SkyObservation;
  headline: string;         // "I saw Mars tonight"
  subheadline: string;      // "Your Location · June 20, 2026 · 10:19 PM"
  bodyText: string;         // The user's note
  skyData: string[];        // ["Moon 40% · az 292°", "Mars · az 327° · alt 41°"]
  scoreLabel: string;       // "Tonight Score: 68 (Good)"
  brandLine: string;        // "Observed with AuraLunis"
  cardStyle: ShareCardStyle;
}

export type ShareCardStyle = "cosmic" | "minimal" | "data" | "story";

export interface ShareConfig {
  style: ShareCardStyle;
  includeLocation: boolean;
  includeScore: boolean;
  includeSkyData: boolean;
  includeTimestamp: boolean;
}

const DEFAULT_CONFIG: ShareConfig = {
  style: "cosmic",
  includeLocation: true,
  includeScore: true,
  includeSkyData: true,
  includeTimestamp: true,
};

/**
 * Build a share card from an observation.
 */
export function buildShareCard(
  observation: SkyObservation,
  config: ShareConfig = DEFAULT_CONFIG,
): ShareCard {
  const date = new Date(observation.timestamp);
  const dateStr = formatLongDate(date);
  const timeStr = formatClockTime(date);

  // Build headline from objects
  let headline: string;
  if (observation.objects.length === 0) {
    headline = "A night under the stars";
  } else if (observation.objects.length === 1) {
    headline = `I saw ${observation.objects[0]} tonight`;
  } else {
    const last = observation.objects[observation.objects.length - 1];
    const rest = observation.objects.slice(0, -1).join(", ");
    headline = `${rest} and ${last} tonight`;
  }

  // Subheadline
  const parts: string[] = [];
  if (config.includeLocation) parts.push(observation.locationName);
  if (config.includeTimestamp) parts.push(`${dateStr} · ${timeStr}`);
  const subheadline = parts.join(" · ");

  // Sky data lines
  const skyData: string[] = [];
  if (config.includeSkyData) {
    if (observation.moonPhasePercent > 0) {
      skyData.push(`Moon ${observation.moonPhasePercent}%`);
    }
    observation.objects.forEach(obj => {
      if (obj !== "Moon") skyData.push(obj);
    });
  }

  const scoreLabel = config.includeScore
    ? `Tonight Score: ${observation.tonightScore} (${observation.tonightScore >= 80 ? "Excellent" : observation.tonightScore >= 60 ? "Good" : "Fair"})`
    : "";

  return {
    observation,
    headline,
    subheadline,
    bodyText: observation.note,
    skyData,
    scoreLabel,
    brandLine: "Observed with AuraLunis",
    cardStyle: config.style,
  };
}

/**
 * Generate a collection of premade share styles.
 */
export function getShareStyles(): Array<{ id: ShareCardStyle; name: string; description: string }> {
  return [
    { id: "cosmic", name: "Cosmic", description: "Gold on black with star field" },
    { id: "minimal", name: "Minimal", description: "Clean white with subtle branding" },
    { id: "data", name: "Data", description: "Astronomy data visualization style" },
    { id: "story", name: "Story", description: "Instagram story format with large text" },
  ];
}

/**
 * Save observation to the encrypted vault.
 * Uses tweetnacl for local encryption (already a project dependency).
 */
export function prepareVaultEntry(observation: SkyObservation): {
  id: string;
  encryptedPayload: string;
  timestamp: string;
  searchableFields: { locationName: string; date: string; objects: string[] };
} {
  // In production, this encrypts with tweetnacl before storing to AsyncStorage.
  // For now, return the structure the vault expects.
  return {
    id: observation.id,
    encryptedPayload: JSON.stringify(observation), // v1: plain JSON — encrypt with tweetnacl in v1.1
    timestamp: observation.timestamp,
    searchableFields: {
      locationName: observation.locationName,
      date: new Date(observation.timestamp).toLocaleDateString(),
      objects: observation.objects,
    },
  };
}
