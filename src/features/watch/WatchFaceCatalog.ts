export type WatchFaceId =
  | "living_astrolabe"
  | "moon_keeper"
  | "tonights_sky"
  | "deep_sky_portal"
  | "daily_alignment"
  | "minimal_auralunis";

export type WatchThemeId =
  | "midnight_gold"
  | "moon_silver"
  | "deep_space"
  | "soft_moon";

export type WatchComplicationId =
  | "moon_phase"
  | "tonight_score"
  | "moonrise_countdown"
  | "next_event"
  | "visible_planet"
  | "daily_alignment"
  | "tonights_ritual"
  | "sky_lens_shortcut"
  | "auralunis_logo";

export interface WatchFaceOption {
  id: WatchFaceId;
  name: string;
  description: string;
  bestFor: string;
  premium?: boolean;
  future?: boolean;
}

export interface WatchThemeOption {
  id: WatchThemeId;
  name: string;
  description: string;
  premium?: boolean;
  future?: boolean;
}

export interface WatchComplicationOption {
  id: WatchComplicationId;
  name: string;
  shortLabel: string;
  description: string;
  nativeNote: string;
}

export const watchFaceOptions: WatchFaceOption[] = [
  {
    id: "living_astrolabe",
    name: "Living Astrolabe",
    description: "Rotating Midnight Gold rings, AuraLunis emblem, Moon status, and Tonight Score.",
    bestFor: "Signature everyday face"
  },
  {
    id: "moon_keeper",
    name: "Moon Keeper",
    description: "Large Moon phase with illumination, moonrise, moonset, and lunar age.",
    bestFor: "Lunar tracking"
  },
  {
    id: "tonights_sky",
    name: "Tonight’s Sky",
    description: "Tonight Score, visible planets, best constellation, and next event countdown.",
    bestFor: "Stargazing nights"
  },
  {
    id: "deep_sky_portal",
    name: "Deep Sky Portal",
    description: "Milky Way band, Galactic Center direction, and featured nebula highlight.",
    bestFor: "Deep-sky enthusiasts",
    premium: true
  },
  {
    id: "daily_alignment",
    name: "Daily Alignment",
    description: "A calm minimal face with one poetic daily insight and a small gold astrolabe.",
    bestFor: "Daily ritual"
  },
  {
    id: "minimal_auralunis",
    name: "Minimal AuraLunis",
    description: "Clean time, star-dust logo, Moon icon, and one selected complication.",
    bestFor: "Elegant everyday use"
  }
];

export const watchThemeOptions: WatchThemeOption[] = [
  {
    id: "midnight_gold",
    name: "Midnight Gold",
    description: "The signature obsidian, gold-leaf, and stardust AuraLunis style."
  },
  {
    id: "moon_silver",
    name: "Moon Silver",
    description: "Cool lunar silver with softer contrast and a polished moonlit finish."
  },
  {
    id: "deep_space",
    name: "Deep Space",
    description: "Blue-black stellar depth with subtle galaxy highlights."
  },
  {
    id: "soft_moon",
    name: "Soft Moon",
    description: "Calmer, softer lunar tones for a gentle wind-down look."
  }
];

export const watchComplicationOptions: WatchComplicationOption[] = [
  {
    id: "moon_phase",
    name: "Moon Phase",
    shortLabel: "Moon",
    description: "Current lunar phase and illumination.",
    nativeNote: "Best for circular or corner complication slots."
  },
  {
    id: "tonight_score",
    name: "Tonight Score",
    shortLabel: "Score",
    description: "Quick stargazing-condition score.",
    nativeNote: "Best for circular, rectangular, or inline slots."
  },
  {
    id: "moonrise_countdown",
    name: "Moonrise Countdown",
    shortLabel: "Moonrise",
    description: "Countdown to the next local moonrise.",
    nativeNote: "Best for rectangular or inline slots."
  },
  {
    id: "next_event",
    name: "Next Celestial Event",
    shortLabel: "Event",
    description: "Countdown to the next visible celestial event.",
    nativeNote: "Best for rectangular or inline slots."
  },
  {
    id: "visible_planet",
    name: "Visible Planet",
    shortLabel: "Planet",
    description: "Tonight’s easiest visible planet.",
    nativeNote: "Best for circular or rectangular slots."
  },
  {
    id: "daily_alignment",
    name: "Daily Alignment",
    shortLabel: "Align",
    description: "Short daily cosmic-alignment snippet.",
    nativeNote: "Best for rectangular or inline slots."
  },
  {
    id: "tonights_ritual",
    name: "Tonight’s Ritual",
    shortLabel: "Ritual",
    description: "Shortcut into the current evening ritual.",
    nativeNote: "Best for rectangular or corner shortcut slots."
  },
  {
    id: "sky_lens_shortcut",
    name: "Sky Lens Shortcut",
    shortLabel: "Lens",
    description: "Launches the phone app into Sky Lens or Manual Sky Map.",
    nativeNote: "Use as an app-intent shortcut complication."
  },
  {
    id: "auralunis_logo",
    name: "Mini AuraLunis Logo",
    shortLabel: "Logo",
    description: "A star-dust emblem complication for minimal layouts.",
    nativeNote: "Best for circular or graphic-corner slots."
  }
];

export const defaultWatchComplications: WatchComplicationId[] = [
  "moon_phase",
  "tonight_score",
  "next_event",
  "sky_lens_shortcut"
];
