export interface StellarPortalAnchor {
  id: string;
  label: string;
  anchorType: "ceiling" | "wall" | "tabletop" | "room_center";
  locked: boolean;
}

export interface StellarPortalScene {
  id: string;
  name: string;
  skyMode: "real_time_sky" | "birth_sky" | "deep_sky" | "galaxy_mode";
  showGlassRingStructure: boolean;
  showGoldGearTracks: boolean;
  showConstellationLabels: boolean;
  passthroughOpacity: number;
}

export const stellarPortalProductionNotes = {
  launchStatus: "future_visionos_target",
  requiresNativeVisionOSTarget: true,
  requiresSpatialAnchors: true,
  notRequiredForPhoneMvp: true
} as const;
