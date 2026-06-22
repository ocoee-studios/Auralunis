// Pure computation: no React Native imports, testable in plain Node.
// Combines cloud cover, moon impact, light conditions, and visible-planet count
// into a 0-100 viewing-quality score.

import type { TonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { WeatherSnapshot } from "./WeatherService";
import type { SkyQuality } from "@/features/settings/SettingsTypes";

export type { SkyQuality };

export interface TonightScoreResult {
  score: number;
  label: string;
  factors: {
    cloud: number;
    moon: number;
    light: number;
    planets: number;
  };
}

const LIGHT_FACTORS: Record<SkyQuality, number> = {
  dark: 1.15,
  rural: 1.0,
  suburban: 0.78,
  urban: 0.52
};

export function computeTonightScore(
  sky: TonightSky,
  weather: WeatherSnapshot,
  skyQuality: SkyQuality = "suburban"
): TonightScoreResult {
  // Clear skies = high cloud score; overcast = low.
  const cloudScore = 100 - weather.cloudPercent;

  // Bright moon above the horizon washes out faint objects.
  const moonBody = sky.bodies.find((body) => body.id === "moon");
  const moonAbove = moonBody?.aboveHorizon ?? false;
  const moonPenalty =
    sky.moonIlluminationPercent * (moonAbove ? 0.55 : 0.12);

  // Urban light pollution strongly reduces visible objects.
  const lightFactor = LIGHT_FACTORS[skyQuality];

  // Bonus for naked-eye planets currently above the horizon.
  const visiblePlanets = sky.visibleBodies.filter(
    (body) => body.id !== "sun" && body.id !== "moon"
  );
  const planetBonus = Math.min(12, visiblePlanets.length * 3);

  const raw = cloudScore * lightFactor - moonPenalty + planetBonus;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const label =
    score >= 80
      ? "Excellent"
      : score >= 60
        ? "Good"
        : score >= 40
          ? "Fair"
          : "Poor";

  return {
    score,
    label,
    factors: {
      cloud: Math.round(cloudScore),
      moon: Math.round(moonPenalty),
      light: Math.round(lightFactor * 100),
      planets: planetBonus
    }
  };
}
