export interface SovereignSigilSeed {
  userSaltId: string;
  birthSkyHash?: string;
  localDeviceKeyHash?: string;
  createdAtISO: string;
}

export interface SovereignSigilVectorPath {
  id: string;
  d: string;
  strokeWidth: number;
  opacity: number;
}

export interface SovereignSigilRender {
  id: string;
  seedFingerprint: string;
  paths: SovereignSigilVectorPath[];
  palette: "midnight_gold" | "moon_silver" | "deep_space";
  exportFormat: "svg" | "widget_vector" | "png_preview";
}

export const sovereignSigilPrivacyRules = {
  launchStatus: "future_optional_customization",
  doNotUseRawBirthDataInWidget: true,
  useHashedLocalSeedOnly: true,
  allowRegenerate: true,
  allowDelete: true
} as const;
