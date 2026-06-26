import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  defaultAuraLunisSettings,
  type AuraLunisSettingsState,
  type AuraLunisThemeMode,
  type SkyQuality
} from "@/features/settings/SettingsTypes";
import { AuraLunisThemes, type AuraLunisThemePalette } from "@/theme/tokens";

const SETTINGS_STORAGE_KEY = "auralunis.settings.v2";

type SettingsContextValue = {
  settings: AuraLunisSettingsState;
  hydrated: boolean;
  palette: AuraLunisThemePalette;
  updateSetting: <K extends keyof AuraLunisSettingsState>(
    key: K,
    value: AuraLunisSettingsState[K]
  ) => void;
  resetSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const validThemeModes: AuraLunisThemeMode[] = ["system", "midnight_gold", "soft_moon", "deep_space"];

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function sanitizeSettings(value: unknown): AuraLunisSettingsState {
  if (!value || typeof value !== "object") return defaultAuraLunisSettings;

  const saved = value as Partial<AuraLunisSettingsState>;

  return {
    ...defaultAuraLunisSettings,
    themeMode:
      typeof saved.themeMode === "string" &&
      validThemeModes.includes(saved.themeMode as AuraLunisThemeMode)
        ? (saved.themeMode as AuraLunisThemeMode)
        : defaultAuraLunisSettings.themeMode,
    skyQuality:
      typeof saved.skyQuality === "string" &&
      (["urban", "suburban", "rural", "dark"] as readonly string[]).includes(saved.skyQuality)
        ? (saved.skyQuality as SkyQuality)
        : defaultAuraLunisSettings.skyQuality,
    nightVision: isBoolean(saved.nightVision)
      ? saved.nightVision
      : defaultAuraLunisSettings.nightVision,
    notificationsEnabled: isBoolean(saved.notificationsEnabled)
      ? saved.notificationsEnabled
      : defaultAuraLunisSettings.notificationsEnabled,
    celestialAlarmsEnabled: isBoolean(saved.celestialAlarmsEnabled)
      ? saved.celestialAlarmsEnabled
      : defaultAuraLunisSettings.celestialAlarmsEnabled,
    tonightRitualRemindersEnabled: isBoolean(saved.tonightRitualRemindersEnabled)
      ? saved.tonightRitualRemindersEnabled
      : defaultAuraLunisSettings.tonightRitualRemindersEnabled,
    skyLensCalibrationRemindersEnabled: isBoolean(saved.skyLensCalibrationRemindersEnabled)
      ? saved.skyLensCalibrationRemindersEnabled
      : defaultAuraLunisSettings.skyLensCalibrationRemindersEnabled,
    localFirstVaultEnabled: isBoolean(saved.localFirstVaultEnabled)
      ? saved.localFirstVaultEnabled
      : defaultAuraLunisSettings.localFirstVaultEnabled,
    cloudSyncEnabled: isBoolean(saved.cloudSyncEnabled)
      ? saved.cloudSyncEnabled
      : defaultAuraLunisSettings.cloudSyncEnabled,
    aiOracleOptIn: isBoolean(saved.aiOracleOptIn)
      ? saved.aiOracleOptIn
      : defaultAuraLunisSettings.aiOracleOptIn,
    cameraPermissionExplained: isBoolean(saved.cameraPermissionExplained)
      ? saved.cameraPermissionExplained
      : defaultAuraLunisSettings.cameraPermissionExplained,
    locationPermissionExplained: isBoolean(saved.locationPermissionExplained)
      ? saved.locationPermissionExplained
      : defaultAuraLunisSettings.locationPermissionExplained,
    photoSavePermissionExplained: isBoolean(saved.photoSavePermissionExplained)
      ? saved.photoSavePermissionExplained
      : defaultAuraLunisSettings.photoSavePermissionExplained,
    motionPermissionExplained: isBoolean(saved.motionPermissionExplained)
      ? saved.motionPermissionExplained
      : defaultAuraLunisSettings.motionPermissionExplained,
    widgetsEnabled: isBoolean(saved.widgetsEnabled)
      ? saved.widgetsEnabled
      : defaultAuraLunisSettings.widgetsEnabled
  };
}

export function AuraLunisSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AuraLunisSettingsState>(defaultAuraLunisSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

        if (active && saved) {
          setSettings(sanitizeSettings(JSON.parse(saved)));
        }
      } catch {
        // Keep safe defaults if local settings are corrupt or unavailable.
      } finally {
        if (active) setHydrated(true);
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)).catch(() => {
      // No-op in preview/test environments.
    });
  }, [hydrated, settings]);

  const value = useMemo<SettingsContextValue>(() => {
    const palette = AuraLunisThemes[settings.themeMode] ?? AuraLunisThemes.midnight_gold;

    return {
      settings,
      hydrated,
      palette,
      updateSetting: (key, nextValue) => {
        setSettings((previous) =>
          sanitizeSettings({
            ...previous,
            [key]: nextValue
          })
        );
      },
      resetSettings: async () => {
        setSettings(defaultAuraLunisSettings);
        await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
      }
    };
  }, [hydrated, settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useAuraLunisSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useAuraLunisSettings must be used inside AuraLunisSettingsProvider");
  }

  return context;
}
