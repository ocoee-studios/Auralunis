// The Sky Lens layer catalog. Phase 1 ships the free core (Grid, Stars,
// Constellations, Planets — Moon is always-on and not a toggle). Phase 2 layers
// are listed here so the layer bar can show them as locked/Coming Soon, which is
// what signals the $39.99/yr upgrade without faking an unbuilt feature.

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
  { key: "stars", label: "Stars", icon: "☆", premium: false, available: true, defaultOn: true },
  { key: "constellations", label: "Constellations", icon: "◎", premium: false, available: true, defaultOn: true },
  { key: "zodiac", label: "Zodiac", icon: "♈", premium: false, available: true, defaultOn: false },
  { key: "planets", label: "Planets", icon: "●", premium: false, available: true, defaultOn: true },
  { key: "grid", label: "Grid", icon: "#", premium: false, available: true, defaultOn: true },
  { key: "milkyway", label: "Milky Way", icon: "☁", premium: false, available: true, defaultOn: true },
  { key: "satellites", label: "Satellites", icon: "◈", premium: true, available: false, defaultOn: false },
  { key: "deepsky", label: "Deep Sky", icon: "✦", premium: true, available: false, defaultOn: false },
  { key: "ecliptic", label: "Ecliptic", icon: "~", premium: true, available: true, defaultOn: false }
];

// Free tier sees the most famous constellations in every direction so the sky
// never feels dead; Premium unlocks the full catalog (the deeper/fainter cuts +
// cultural stories). Spread across N/E/S/W/overhead for all-direction coverage.
export const FREE_CONSTELLATION_IDS: ReadonlyArray<string> = [
  "orion", "ursa_major", "ursa_minor", "cassiopeia", "draco",
  "leo", "scorpius", "sagittarius", "cygnus", "lyra", "aquila",
  "hercules", "bootes", "pegasus", "andromeda", "taurus", "gemini"
];

export const DEFAULT_ACTIVE_LAYERS: LayerKey[] = SKY_LENS_LAYERS.filter((l) => l.defaultOn).map(
  (l) => l.key
);
