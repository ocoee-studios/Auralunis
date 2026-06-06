// Dark Sky Finder — Bortle scale locations near the user.
// Suggests nearest dark sites with drive time estimates.
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface DarkSkyLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  bortle: number; // 1 (darkest) to 9 (city center)
  description: string;
  distanceKm?: number;
  driveTime?: string;
}

export function estimateBortle(location: ObserverLocation): number {
  // Simplified estimation — real implementation would use light pollution maps.
  // This stub returns a suburban default.
  return 6;
}

export function bortleDescription(bortle: number): string {
  const descriptions: Record<number, string> = {
    1: "Excellent dark-sky site. Zodiacal light, gegenschein, zodiacal band all visible.",
    2: "Truly dark site. Milky Way casts shadows. Airglow visible.",
    3: "Rural sky. Milky Way has structure. M33 visible to naked eye.",
    4: "Rural/suburban transition. Milky Way obvious but lacks detail.",
    5: "Suburban sky. Milky Way faint. Only bright Messier objects visible.",
    6: "Bright suburban sky. Milky Way only visible near zenith.",
    7: "Suburban/urban transition. Milky Way invisible. Sky is gray.",
    8: "City sky. Only bright planets and major stars visible.",
    9: "Inner-city sky. Only the Moon and bright planets visible."
  };
  return descriptions[bortle] ?? "Unknown sky quality.";
}

export function suggestDarkSites(location: ObserverLocation): DarkSkyLocation[] {
  // In production, this would query a light pollution API or local database.
  // For now, return contextual suggestions based on general direction.
  const lat = location.latitudeDegrees;
  const lon = location.longitudeDegrees;
  return [
    { id: "nearby-rural", name: "Nearest Rural Area", latitude: lat + 0.5, longitude: lon - 0.3, bortle: 4, description: "Drive away from city lights. Look for areas with minimal development.", driveTime: "~45 min" },
    { id: "dark-park", name: "Dark Sky Preserve", latitude: lat + 1.0, longitude: lon + 0.5, bortle: 3, description: "Designated dark sky area with controlled lighting.", driveTime: "~1.5 hours" },
    { id: "remote", name: "Remote Dark Site", latitude: lat + 1.5, longitude: lon - 1.0, bortle: 2, description: "Far from any population center. Exceptional sky quality.", driveTime: "~2.5 hours" }
  ];
}
