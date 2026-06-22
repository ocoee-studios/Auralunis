// Eclipse prediction and visibility assessment for the user's location.
import { getNextEclipses } from "@/data/CelestialEventsCatalog";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface EclipsePrediction {
  name: string;
  date: string;
  type: "solar_eclipse" | "lunar_eclipse";
  daysUntil: number;
  visibleFromLocation: "full" | "partial" | "not_visible" | "unknown";
  coverage?: string;
  description: string;
  globalVisibility: string;
}

export function predictEclipses(
  location: ObserverLocation,
  count: number = 10
): EclipsePrediction[] {
  const eclipses = getNextEclipses(count);
  const now = new Date();

  return eclipses.map(e => {
    const eventDate = new Date(e.date);
    // Floor, not round — an event later TODAY is 0 days away, not 1.
    const daysUntil = Math.floor((eventDate.getTime() - now.getTime()) / 86_400_000);

    // Simplified visibility check — lunar eclipses are visible from half the Earth,
    // solar eclipses only from a narrow path. In production, compute from geometry.
    let visibleFromLocation: EclipsePrediction["visibleFromLocation"] = "unknown";
    if (e.type === "lunar_eclipse") {
      // Lunar eclipses are broadly visible — check if nighttime at location
      visibleFromLocation = "partial"; // conservative default
    }

    return {
      name: e.name,
      date: e.date,
      type: e.type as "solar_eclipse" | "lunar_eclipse",
      daysUntil,
      visibleFromLocation,
      coverage: e.magnitude,
      description: e.description,
      globalVisibility: e.globalVisibility ?? ""
    };
  });
}
