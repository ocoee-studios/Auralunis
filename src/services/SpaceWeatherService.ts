// Space Weather — solar wind, geomagnetic storms, aurora probability.
// Uses NOAA SWPC data concepts for real-time space weather awareness.

export interface SpaceWeather {
  solarWindSpeed: number; // km/s
  solarWindDensity: number; // protons/cm³
  kpIndex: number; // 0-9 geomagnetic activity
  auroraChance: "none" | "low" | "moderate" | "high" | "storm";
  solarFlareRisk: "quiet" | "minor" | "moderate" | "strong" | "extreme";
  summary: string;
  viewingImpact: string;
}

export function estimateSpaceWeather(): SpaceWeather {
  // Stub — production would fetch from NOAA SWPC API
  return {
    solarWindSpeed: 420,
    solarWindDensity: 5.2,
    kpIndex: 2,
    auroraChance: "low",
    solarFlareRisk: "quiet",
    summary: "Quiet geomagnetic conditions. Solar wind at normal levels.",
    viewingImpact: "No interference expected. Excellent conditions for deep-sky observation."
  };
}

export function kpToAuroraVisibility(kp: number, latitudeDeg: number): string {
  const absLat = Math.abs(latitudeDeg);
  if (kp >= 8 && absLat >= 30) return "Aurora possible at your latitude — look north!";
  if (kp >= 6 && absLat >= 40) return "Aurora may be visible on the northern horizon.";
  if (kp >= 4 && absLat >= 50) return "Good aurora chance at high latitudes.";
  if (kp >= 2 && absLat >= 60) return "Typical aurora activity at polar latitudes.";
  return "Aurora unlikely at your latitude tonight.";
}
