export type DeepSkyObjectType =
  | "nebula"
  | "galaxy"
  | "star_cluster"
  | "supernova_remnant"
  | "milky_way_region"
  | "dust_lane"
  | "galactic_center";

export interface DeepSkyObject {
  id: string;
  name: string;
  type: DeepSkyObjectType;
  constellation?: string;
  distanceLightYears?: number;
  bestSeason?: string;
  visibleToNakedEye: boolean;
  skyLensLayer: "deep_sky" | "galaxy_mode" | "archive_only";
  summary: string;
}

export const featuredDeepSkyObjects: DeepSkyObject[] = [
  {
    id: "orion-nebula-m42",
    name: "Orion Nebula",
    type: "nebula",
    constellation: "Orion",
    distanceLightYears: 1344,
    bestSeason: "Winter",
    visibleToNakedEye: true,
    skyLensLayer: "deep_sky",
    summary: "A bright stellar nursery in Orion’s sword and one of the most iconic deep-sky objects."
  },
  {
    id: "horsehead-nebula",
    name: "Horsehead Nebula",
    type: "nebula",
    constellation: "Orion",
    distanceLightYears: 1375,
    bestSeason: "Winter",
    visibleToNakedEye: false,
    skyLensLayer: "deep_sky",
    summary: "A dark nebula silhouetted against glowing hydrogen gas near Alnitak."
  },
  {
    id: "crab-nebula-m1",
    name: "Crab Nebula",
    type: "supernova_remnant",
    constellation: "Taurus",
    distanceLightYears: 6500,
    bestSeason: "Winter",
    visibleToNakedEye: false,
    skyLensLayer: "deep_sky",
    summary: "The expanding remnant of a supernova observed in 1054."
  },
  {
    id: "ring-nebula-m57",
    name: "Ring Nebula",
    type: "nebula",
    constellation: "Lyra",
    distanceLightYears: 2200,
    bestSeason: "Summer",
    visibleToNakedEye: false,
    skyLensLayer: "deep_sky",
    summary: "A planetary nebula formed from the outer layers of a dying star."
  },
  {
    id: "andromeda-galaxy-m31",
    name: "Andromeda Galaxy",
    type: "galaxy",
    constellation: "Andromeda",
    distanceLightYears: 2537000,
    bestSeason: "Autumn",
    visibleToNakedEye: true,
    skyLensLayer: "deep_sky",
    summary: "The nearest major galaxy to the Milky Way and a key deep-sky highlight."
  },
  {
    id: "milky-way-core",
    name: "Milky Way Core",
    type: "galactic_center",
    constellation: "Sagittarius",
    distanceLightYears: 27000,
    bestSeason: "Summer",
    visibleToNakedEye: true,
    skyLensLayer: "galaxy_mode",
    summary: "The direction of the dense, luminous heart of our galaxy near Sagittarius."
  },
  {
    id: "great-rift",
    name: "Great Rift",
    type: "dust_lane",
    bestSeason: "Summer",
    visibleToNakedEye: true,
    skyLensLayer: "galaxy_mode",
    summary: "Dark lanes of interstellar dust that split the Milky Way’s glowing band."
  },
  {
    id: "cygnus-star-cloud",
    name: "Cygnus Star Cloud",
    type: "milky_way_region",
    constellation: "Cygnus",
    bestSeason: "Summer",
    visibleToNakedEye: true,
    skyLensLayer: "galaxy_mode",
    summary: "A rich star cloud along the Milky Way band in Cygnus."
  }
];

export const deepSkyArchiveSections = [
  "Nebulae",
  "Galaxies",
  "Star Clusters",
  "Supernova Remnants",
  "Milky Way / Galaxy Mode"
] as const;
