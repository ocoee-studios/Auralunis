// The Sky Lens layer catalog. Phase 1 ships the visual core: Stars,
// Constellations, Planets, Milky Way, and Nebulae. Moon is always-on and not a
// toggle. Technical overlays remain available, but the default scene must open
// with wonder: gold constellations, stardust, nebula glow, and the galactic river.

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
  { key: "deepsky", label: "Nebulae", icon: "✦", premium: false, available: true, defaultOn: true },
  { key: "planets", label: "Planets", icon: "●", premium: false, available: true, defaultOn: true },
  { key: "zodiac", label: "Zodiac", icon: "♈", premium: false, available: true, defaultOn: false },
  { key: "grid", label: "Grid", icon: "#", premium: false, available: true, defaultOn: false },
  { key: "satellites", label: "Satellites", icon: "◈", premium: true, available: true, defaultOn: false },
  { key: "ecliptic", label: "Ecliptic", icon: "~", premium: true, available: true, defaultOn: false }
];

export const FREE_CONSTELLATION_IDS: ReadonlyArray<string> = [
  "orion", "ursa_major", "cassiopeia", "leo", "scorpius",
  "sagittarius", "cygnus", "pegasus", "taurus", "gemini"
];

export const DEFAULT_ACTIVE_LAYERS: LayerKey[] = SKY_LENS_LAYERS.filter((l) => l.defaultOn).map(
  (l) => l.key
);
