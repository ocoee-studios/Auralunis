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
      "Illustrative local planner fixture. Connect light-pollution tiles, weather forecasts, Moon calculations, and location before launch."
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
      "Illustrative local planner fixture. The production adapter should recalculate from the user’s location and selected forecast hour."
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
      "Illustrative local planner fixture. This preview demonstrates the score model and target guidance before provider integration."
  }
];

export function getAstroPhotoScenario(id: AstroPhotoScenario["id"]) {
  return astroPhotoScenarios.find((scenario) => scenario.id === id) ?? astroPhotoScenarios[1];
}
