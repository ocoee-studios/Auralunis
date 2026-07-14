// The Sky Lens layer catalog. The default scene stays calm and legible:
// stars, constellations, planets, and the Milky Way are visible; technical
// overlays and deep-sky artwork are opt-in until their device presentation is
// fully polished.

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
  /** One-line explanation, shown in the Layers sheet. Primary layers don't need one. */
  description?: string;
  // PRIMARY = the beauty set. These four earn a permanent pill on the main screen and
  // are the default scene. Everything else is an ANALYTICAL overlay, reachable through
  // the "Layers" sheet — present, but never cluttering the sky you open into.
  primary: boolean;
}

export const SKY_LENS_LAYERS: ReadonlyArray<LayerDef> = [
  { key: "stars", label: "Stars", icon: "☆", premium: false, available: true, defaultOn: true, primary: true },
  { key: "constellations", label: "Constellations", icon: "◎", premium: false, available: true, defaultOn: true, primary: true },
  { key: "milkyway", label: "Milky Way", icon: "☁", premium: false, available: true, defaultOn: true, primary: true },
  { key: "planets", label: "Planets", icon: "●", premium: false, available: true, defaultOn: true, primary: true },
  { key: "deepsky", label: "Nebulae", icon: "✦", premium: false, available: true, defaultOn: false, primary: false, description: "Emission clouds and deep-sky jewels" },
  { key: "zodiac", label: "Zodiac", icon: "♈", premium: false, available: true, defaultOn: false, primary: false, description: "The twelve signs along the ecliptic" },
  { key: "grid", label: "Grid", icon: "#", premium: false, available: true, defaultOn: false, primary: false, description: "Altitude and azimuth reference lines" },
  { key: "satellites", label: "Satellites", icon: "◈", premium: true, available: true, defaultOn: false, primary: false, description: "Live-tracked spacecraft overhead" },
  { key: "ecliptic", label: "Ecliptic", icon: "~", premium: true, available: true, defaultOn: false, primary: false, description: "The Sun's path across the sky" }
];

export const FREE_CONSTELLATION_IDS: ReadonlyArray<string> = [
  "orion", "ursa_major", "cassiopeia", "leo", "scorpius",
  "sagittarius", "cygnus", "pegasus", "taurus", "gemini"
];

export const DEFAULT_ACTIVE_LAYERS: LayerKey[] = SKY_LENS_LAYERS.filter((layer) => layer.defaultOn).map(
  (layer) => layer.key
);

/** The four pills on the main screen. */
export const PRIMARY_LAYERS: ReadonlyArray<LayerDef> = SKY_LENS_LAYERS.filter((l) => l.primary);
/** The analytical overlays, reachable through the "Layers" sheet. */
export const SECONDARY_LAYERS: ReadonlyArray<LayerDef> = SKY_LENS_LAYERS.filter((l) => !l.primary);
