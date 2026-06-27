import type { AstroPhotoScenario } from "@/features/aura-pro/AuraProUtilityTypes";

export const astroPhotoScenarios: AstroPhotoScenario[] = [
  {
    id: "urban",
    name: "City Glow",
    bortleClass: 8,
    cloudCoverPercent: 34,
    moonIlluminationPercent: 78,
    humidityPercent: 70,
    visibilityKilometers: 11,
    score: 34,
    recommendedTargets: ["Moon", "Jupiter", "Venus", "bright double stars"],
    note:
      "Urban skies limit deep-sky targets. Focus on planets, the Moon, and bright double stars."
  },
  {
    id: "suburban",
    name: "Edge of Town",
    bortleClass: 5,
    cloudCoverPercent: 18,
    moonIlluminationPercent: 42,
    humidityPercent: 58,
    visibilityKilometers: 18,
    score: 67,
    recommendedTargets: ["Orion Nebula", "Pleiades", "Andromeda core", "Moon"],
    note:
      "Suburban conditions are ideal for planets, bright clusters, and the Moon. The Milky Way may be faintly visible."
  },
  {
    id: "dark_sky",
    name: "Dark-Sky Escape",
    bortleClass: 2,
    cloudCoverPercent: 7,
    moonIlluminationPercent: 14,
    humidityPercent: 40,
    visibilityKilometers: 28,
    score: 92,
    recommendedTargets: ["Milky Way core", "Andromeda Galaxy", "nebulae", "wide-field star trails"],
    note:
      "Dark skies unlock the full Milky Way, faint nebulae, and galaxies. Give your eyes 20 minutes to adapt."
  }
];

export function getAstroPhotoScenario(id: AstroPhotoScenario["id"]) {
  return astroPhotoScenarios.find((scenario) => scenario.id === id) ?? astroPhotoScenarios[1];
}
