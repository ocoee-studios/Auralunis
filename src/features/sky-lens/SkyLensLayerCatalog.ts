// The Sky Lens layer catalog. Phase 1 ships the free core (Stars,
// Constellations, Planets — Moon is always-on and not a toggle). Premium layers
// remain available, but the default scene opens in a quieter, more cinematic
// state so the sky feels premium instead of crowded.

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
  available: boolean; // built and shippable this phase
  defaultOn: boolean;
}

export const SKY_LENS_LAYERS: ReadonlyArray<LayerDef> = [
  // Premium launch default: only the essential celestial reading layers are on.
  // Grid/ecliptic/zodiac/deep-sky become deliberate discovery tools instead of
  // visual noise in the first screenshot Apple reviewers and users see.
  { key: "stars", label: "Stars", icon: "☆", premium: false, available: true, defaultOn: true },
  { key: "constellations", label: "Lines", icon: "◎", premium: false, available: true, defaultOn: true },
  { key: "planets", label: "Planets", icon: "●", premium: false, available: true, defaultOn: true },
  { key: "milkyway", label: "Milky Way", icon: "☁", premium: false, available: true, defaultOn: false },
  { key: "zodiac", label: "Zodiac", icon: "♈", premium: false, available: true, defaultOn: false },
  { key: "grid", label: "Grid", icon: "#", premium: false, available: true, defaultOn: false },
  { key: "satellites", label: "Satellites", icon: "◈", premium: true, available: true, defaultOn: false },
  { key: "deepsky", label: "Deep Sky", icon: "✦", premium: true, available: true, defaultOn: false },
  { key: "ecliptic", label: "Ecliptic", icon: "~", premium: true, available: true, defaultOn: false }
];

// Free tier sees 10 of the most famous constellations, spread across the sky for
// all-direction coverage; Premium unlocks the full catalog.
export const FREE_CONSTELLATION_IDS: ReadonlyArray<string> = [
  "orion", "ursa_major", "cassiopeia", "leo", "scorpius",
  "sagittarius", "cygnus", "pegasus", "taurus", "gemini"
];

export const DEFAULT_ACTIVE_LAYERS: LayerKey[] = SKY_LENS_LAYERS.filter((l) => l.defaultOn).map(
  (l) => l.key
);
