export type AuraLunisThemeMode = "system" | "midnight_gold" | "soft_moon" | "deep_space";
export type SkyQuality = "urban" | "suburban" | "rural" | "dark";

export interface AuraLunisSettingsState {
  themeMode: AuraLunisThemeMode;
  skyQuality: SkyQuality;
  nightVision: boolean;
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
  widgetsEnabled: boolean;
}

export const defaultAuraLunisSettings: AuraLunisSettingsState = {
  themeMode: "midnight_gold",
  skyQuality: "suburban",
  nightVision: false,
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
  widgetsEnabled: false
};
