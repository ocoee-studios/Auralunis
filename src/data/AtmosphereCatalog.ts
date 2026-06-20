// AtmosphereCatalog.ts
// Registry of known LEO satellites for the Atmosphere Explorer feature.
// Each entry has enough metadata to populate the retro data card.
// Orbital positions are simulated — replace with live TLE data when ready.

export type SatelliteClass =
  | "space-station"
  | "telescope"
  | "starlink"
  | "weather"
  | "science"
  | "rocket-body";

export interface AtmosphericSatellite {
  id: string;
  name: string;
  shortName: string;
  launchYear: number;
  country: string;
  agency: string;
  altitudeKm: number;
  class: SatelliteClass;
  mission: string;
  status: "active" | "decommissioned" | "partial";
  noradId: number;
  /** Blip color on the radar — unique per satellite class */
  radarColor: string;
  /** Starting orbital position for simulation (updated by service each tick) */
  latitudeDegrees: number;
  longitudeDegrees: number;
}

export const ATMOSPHERE_CATALOG: AtmosphericSatellite[] = [
  {
    id: "iss",
    name: "International Space Station",
    shortName: "ISS",
    launchYear: 1998,
    country: "Multinational",
    agency: "NASA / Roscosmos / ESA / JAXA / CSA",
    altitudeKm: 420,
    class: "space-station",
    mission:
      "Continuously crewed microgravity research laboratory. Orbits Earth every 90 minutes at 17,500 mph.",
    status: "active",
    noradId: 25544,
    radarColor: "#D9A84E", // Gold
    latitudeDegrees: 45.0,
    longitudeDegrees: -90.0,
  },
  {
    id: "hubble",
    name: "Hubble Space Telescope",
    shortName: "HST",
    launchYear: 1990,
    country: "United States",
    agency: "NASA / ESA",
    altitudeKm: 538,
    class: "telescope",
    mission:
      "Optical/UV space observatory. Has captured over 1.5 million observations and helped determine the age of the universe.",
    status: "active",
    noradId: 20580,
    radarColor: "#78C8FF", // Blue
    latitudeDegrees: 28.5,
    longitudeDegrees: -60.0,
  },
  {
    id: "starlink-v2-001",
    name: "Starlink V2 Mini Node",
    shortName: "SL-2001",
    launchYear: 2023,
    country: "United States",
    agency: "SpaceX",
    altitudeKm: 550,
    class: "starlink",
    mission:
      "Broadband internet constellation node. Part of a planned 12,000-satellite mesh delivering global low-latency internet.",
    status: "active",
    noradId: 57680,
    radarColor: "#7B5CF6", // Violet
    latitudeDegrees: 53.0,
    longitudeDegrees: 20.0,
  },
  {
    id: "noaa-20",
    name: "NOAA-20 Weather Satellite",
    shortName: "NOAA-20",
    launchYear: 2017,
    country: "United States",
    agency: "NOAA / NASA",
    altitudeKm: 833,
    class: "weather",
    mission:
      "Polar-orbiting weather observation satellite. Provides global atmospheric and ocean data for forecasting and climate monitoring.",
    status: "active",
    noradId: 43013,
    radarColor: "#4ADE80", // Green
    latitudeDegrees: -70.0,
    longitudeDegrees: 110.0,
  },
  {
    id: "terra",
    name: "Terra Earth Observer",
    shortName: "TERRA",
    launchYear: 1999,
    country: "United States",
    agency: "NASA",
    altitudeKm: 705,
    class: "science",
    mission:
      "Multi-instrument Earth observation platform monitoring land, ocean, and atmosphere interactions to study climate change.",
    status: "active",
    noradId: 25994,
    radarColor: "#FFF6D6", // Light gold
    latitudeDegrees: 10.0,
    longitudeDegrees: -30.0,
  },
  {
    id: "starlink-v1-888",
    name: "Starlink V1 Node",
    shortName: "SL-0888",
    launchYear: 2021,
    country: "United States",
    agency: "SpaceX",
    altitudeKm: 548,
    class: "starlink",
    mission:
      "First-generation Starlink broadband internet constellation node.",
    status: "active",
    noradId: 49140,
    radarColor: "#7B5CF6",
    latitudeDegrees: -15.0,
    longitudeDegrees: 140.0,
  },
];

/** Color legend for the radar scope legend bar */
export const CLASS_COLORS: Record<SatelliteClass, string> = {
  "space-station": "#D9A84E",
  "telescope": "#78C8FF",
  "starlink": "#7B5CF6",
  "weather": "#4ADE80",
  "science": "#FFF6D6",
  "rocket-body": "#A8AFBF",
};

export const CLASS_LABELS: Record<SatelliteClass, string> = {
  "space-station": "Station",
  "telescope": "Telescope",
  "starlink": "Starlink",
  "weather": "Weather",
  "science": "Science",
  "rocket-body": "Debris",
};
