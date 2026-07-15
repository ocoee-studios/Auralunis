// The Sky Lens layer catalog. Three categories:
//   • PRIMARY beauty layers (primary: true, defaultOn: true) — Stars, Constellations,
//     Milky Way, Planets. Each gets a dock pill; together they are the default scene.
//   • DEFAULT decorative content (primary: false, defaultOn: true) — Nebulae. No dock
//     pill, but ships ON as a curated 2-hero accent; toggled via the Layers sheet.
//   • OPTIONAL analytical overlays (primary: false, defaultOn: false) — Zodiac, Grid,
//     Satellites, Ecliptic. Off by default; opt-in via the Layers sheet.
// So the default scene is FIVE active layers (the four beauty pills + Nebulae), not four.

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
  { key: "deepsky", label: "Nebulae", icon: "✦", premium: false, available: true, defaultOn: true, primary: false, description: "Emission clouds and deep-sky jewels" },
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
