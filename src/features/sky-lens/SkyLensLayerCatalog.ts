// The Sky Lens layer catalog. Phase 1 ships the free core (Stars,
// Constellations, Planets, Milky Way — Moon is always-on and not a toggle).
// Premium layers remain available, but the default scene still needs immediate
// wonder: gold constellations, stardust, and the galactic river visible.

export type LayerKey =
  | "grid"
  | "stars"
  | "constellations"
  | "zodiac"
  | "planets"
  | "satellites"
  | "milkyway"
  | "deepsky"
  | "ecliptic";

export interface LayerDef {
  key: LayerKey;
  label: string;
  icon: string;
  premium: boolean;
  available: boolean;
  defaultOn: boolean;
}

export const SKY_LENS_LAYERS: ReadonlyArray<LayerDef> = [
  { key: "stars", label: "Stars", icon: "☆", premium: false, available: true, defaultOn: true },
  { key: "constellations", label: "Constellations", icon: "◎", premium: false, available: true, defaultOn: true },
  { key: "milkyway", label: "Milky Way", icon: "☁", premium: false, available: true, defaultOn: true },
  { key: "planets", label: "Planets", icon: "●", premium: false, available: true, defaultOn: true },
  { key: "zodiac", label: "Zodiac", icon: "♈", premium: false, available: true, defaultOn: false },
  { key: "grid", label: "Grid", icon: "#", premium: false, available: true, defaultOn: false },
  { key: "satellites", label: "Satellites", icon: "◈", premium: true, available: true, defaultOn: false },
  { key: "deepsky", label: "Nebulae", icon: "✦", premium: true, available: true, defaultOn: false },
  { key: "ecliptic", label: "Ecliptic", icon: "~", premium: true, available: true, defaultOn: false }
];

export const FREE_CONSTELLATION_IDS: ReadonlyArray<string> = [
  "orion", "ursa_major", "cassiopeia", "leo", "scorpius",
  "sagittarius", "cygnus", "pegasus", "taurus", "gemini"
];

export const DEFAULT_ACTIVE_LAYERS: LayerKey[] = SKY_LENS_LAYERS.filter((l) => l.defaultOn).map(
  (l) => l.key
);
