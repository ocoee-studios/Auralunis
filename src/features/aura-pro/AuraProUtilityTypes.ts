export type SatelliteOverlayMode = "brightest" | "stations" | "decaying";

export type SatelliteOverlaySource =
  | "network"
  | "cache"
  | "fixture";

export interface SatelliteOverlayPoint {
  id: string;
  name: string;
  catalogNumber: string;
  objectType: string;
  epochISO: string;
  intensity: number;
  // left/top are percentages (0-100) of the overlay box: left = azimuth across,
  // top = altitude (90 deg overhead near the top, horizon near the bottom).
  left: number;
  top: number;
  sourceMode: SatelliteOverlayMode;
  // Real look-angles from SGP4 propagation relative to the observer.
  azimuthDegrees?: number;
  elevationDegrees?: number;
  rangeKilometers?: number;
}

export interface SatelliteOverlaySnapshot {
  mode: SatelliteOverlayMode;
  source: SatelliteOverlaySource;
  fetchedAtISO: string;
  expiresAtISO: string;
  points: SatelliteOverlayPoint[];
  note: string;
}

export interface AstroPhotoScenario {
  id: "urban" | "suburban" | "dark_sky";
  name: string;
  bortleClass: number;
  cloudCoverPercent: number;
  moonIlluminationPercent: number;
  humidityPercent: number;
  visibilityKilometers: number;
  score: number;
  recommendedTargets: string[];
  note: string;
}

export interface RetrogradeWindow {
  id: string;
  planet: "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn";
  startISO: string;
  endISO: string;
  stage: "pre-shadow" | "retrograde" | "post-shadow";
  isFixture: true;
}

export interface TimeScrubPlanetState {
  id: string;
  name: string;
  orbitPercent: number;
  direction: "direct" | "retrograde-fixture";
}

export interface TimeScrubSnapshot {
  offsetDays: number;
  displayDateISO: string;
  planets: TimeScrubPlanetState[];
  nearbyRetrogradeWindows: RetrogradeWindow[];
  note: string;
}
