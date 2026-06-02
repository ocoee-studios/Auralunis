import type { WatchComplicationId, WatchFaceId, WatchThemeId } from "@/features/watch/WatchFaceCatalog";

export type ChronauraThemeMode = "system" | "midnight_gold" | "soft_moon" | "deep_space";
export type SkyQuality = "urban" | "suburban" | "rural";

export interface ChronauraSettingsState {
  themeMode: ChronauraThemeMode;
  skyQuality: SkyQuality;
  notificationsEnabled: boolean;
  celestialAlarmsEnabled: boolean;
  tonightRitualRemindersEnabled: boolean;
  skyLensCalibrationRemindersEnabled: boolean;
  localFirstVaultEnabled: boolean;
  cloudSyncEnabled: boolean;
  aiOracleOptIn: boolean;
  cameraPermissionExplained: boolean;
  locationPermissionExplained: boolean;
  photoSavePermissionExplained: boolean;
  motionPermissionExplained: boolean;
  watchSyncEnabled: boolean;
  widgetsEnabled: boolean;
  soundBathAutoplayEnabled: boolean;
  selectedWatchFaceId: WatchFaceId;
  selectedWatchThemeId: WatchThemeId;
  selectedWatchComplicationIds: WatchComplicationId[];
}

export const defaultChronauraSettings: ChronauraSettingsState = {
  themeMode: "midnight_gold",
  skyQuality: "suburban",
  notificationsEnabled: true,
  celestialAlarmsEnabled: true,
  tonightRitualRemindersEnabled: true,
  skyLensCalibrationRemindersEnabled: true,
  localFirstVaultEnabled: true,
  cloudSyncEnabled: false,
  aiOracleOptIn: false,
  cameraPermissionExplained: true,
  locationPermissionExplained: true,
  photoSavePermissionExplained: true,
  motionPermissionExplained: true,
  watchSyncEnabled: false,
  widgetsEnabled: false,
  soundBathAutoplayEnabled: false,
  selectedWatchFaceId: "living_astrolabe",
  selectedWatchThemeId: "midnight_gold",
  selectedWatchComplicationIds: ["moon_phase", "tonight_score", "next_event", "sky_lens_shortcut"]
};
