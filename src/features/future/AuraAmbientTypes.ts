export type AuraAmbientProvider =
  | "airplay_2"
  | "sonos"
  | "bang_olufsen"
  | "bluetooth"
  | "local_device_only";

export interface AuraAmbientRoomZone {
  id: string;
  name: string;
  provider: AuraAmbientProvider;
  enabled: boolean;
  volumeLimitPercent: number;
}

export interface AuraAmbientAlignmentCue {
  id: string;
  title: string;
  triggerType: "planet_meridian_crossing" | "moonrise" | "eclipse" | "daily_alignment" | "manual";
  targetObjectId?: string;
  synthPreset: "jupiter_bass_sweep" | "saturn_drone" | "moon_breath" | "mercury_shimmer" | "galaxy_wash";
  durationSeconds: number;
  respectsFocusModes: boolean;
  requiresExplicitUserStart: boolean;
}

export const auraAmbientMvpRules = {
  launchStatus: "future_only",
  mustNotAutoOverrideHomeAudio: true,
  requiresUserConsentEverySession: true,
  fallbackMode: "local_device_only"
} as const;
