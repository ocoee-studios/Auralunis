import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  defaultChronauraSettings,
  type ChronauraSettingsState,
  type ChronauraThemeMode,
  type SkyQuality
} from "@/features/settings/SettingsTypes";
import {
  defaultWatchComplications,
  watchComplicationOptions,
  watchFaceOptions,
  watchThemeOptions,
  type WatchComplicationId,
  type WatchFaceId,
  type WatchThemeId
} from "@/features/watch/WatchFaceCatalog";
import { ChronauraThemes, type ChronauraThemePalette } from "@/theme/tokens";

const SETTINGS_STORAGE_KEY = "chronaura.settings.v2";
const MAX_WATCH_COMPLICATIONS = 4;

type SettingsContextValue = {
  settings: ChronauraSettingsState;
  hydrated: boolean;
  palette: ChronauraThemePalette;
  updateSetting: <K extends keyof ChronauraSettingsState>(
    key: K,
    value: ChronauraSettingsState[K]
  ) => void;
  resetSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const validThemeModes: ChronauraThemeMode[] = ["system", "midnight_gold", "soft_moon", "deep_space"];
const validWatchFaceIds = new Set<WatchFaceId>(watchFaceOptions.map((item) => item.id));
const validWatchThemeIds = new Set<WatchThemeId>(watchThemeOptions.map((item) => item.id));
const validComplicationIds = new Set<WatchComplicationId>(
  watchComplicationOptions.map((item) => item.id)
);

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function sanitizeWatchComplications(value: unknown): WatchComplicationId[] {
  if (!Array.isArray(value)) return defaultWatchComplications;

  const valid = value.filter(
    (item): item is WatchComplicationId =>
      typeof item === "string" && validComplicationIds.has(item as WatchComplicationId)
  );

  const unique = Array.from(new Set(valid)).slice(0, MAX_WATCH_COMPLICATIONS);
  return unique.length > 0 ? unique : defaultWatchComplications;
}

function sanitizeSettings(value: unknown): ChronauraSettingsState {
  if (!value || typeof value !== "object") return defaultChronauraSettings;

  const saved = value as Partial<ChronauraSettingsState>;

  return {
    ...defaultChronauraSettings,
    themeMode:
      typeof saved.themeMode === "string" &&
      validThemeModes.includes(saved.themeMode as ChronauraThemeMode)
        ? (saved.themeMode as ChronauraThemeMode)
        : defaultChronauraSettings.themeMode,
    skyQuality:
      typeof saved.skyQuality === "string" &&
      (["urban", "suburban", "rural"] as readonly string[]).includes(saved.skyQuality)
        ? (saved.skyQuality as SkyQuality)
        : defaultChronauraSettings.skyQuality,
    notificationsEnabled: isBoolean(saved.notificationsEnabled)
      ? saved.notificationsEnabled
      : defaultChronauraSettings.notificationsEnabled,
    celestialAlarmsEnabled: isBoolean(saved.celestialAlarmsEnabled)
      ? saved.celestialAlarmsEnabled
      : defaultChronauraSettings.celestialAlarmsEnabled,
    tonightRitualRemindersEnabled: isBoolean(saved.tonightRitualRemindersEnabled)
      ? saved.tonightRitualRemindersEnabled
      : defaultChronauraSettings.tonightRitualRemindersEnabled,
    skyLensCalibrationRemindersEnabled: isBoolean(saved.skyLensCalibrationRemindersEnabled)
      ? saved.skyLensCalibrationRemindersEnabled
      : defaultChronauraSettings.skyLensCalibrationRemindersEnabled,
    localFirstVaultEnabled: isBoolean(saved.localFirstVaultEnabled)
      ? saved.localFirstVaultEnabled
      : defaultChronauraSettings.localFirstVaultEnabled,
    cloudSyncEnabled: isBoolean(saved.cloudSyncEnabled)
      ? saved.cloudSyncEnabled
      : defaultChronauraSettings.cloudSyncEnabled,
    aiOracleOptIn: isBoolean(saved.aiOracleOptIn)
      ? saved.aiOracleOptIn
      : defaultChronauraSettings.aiOracleOptIn,
    cameraPermissionExplained: isBoolean(saved.cameraPermissionExplained)
      ? saved.cameraPermissionExplained
      : defaultChronauraSettings.cameraPermissionExplained,
    locationPermissionExplained: isBoolean(saved.locationPermissionExplained)
      ? saved.locationPermissionExplained
      : defaultChronauraSettings.locationPermissionExplained,
    photoSavePermissionExplained: isBoolean(saved.photoSavePermissionExplained)
      ? saved.photoSavePermissionExplained
      : defaultChronauraSettings.photoSavePermissionExplained,
    motionPermissionExplained: isBoolean(saved.motionPermissionExplained)
      ? saved.motionPermissionExplained
      : defaultChronauraSettings.motionPermissionExplained,
    watchSyncEnabled: isBoolean(saved.watchSyncEnabled)
      ? saved.watchSyncEnabled
      : defaultChronauraSettings.watchSyncEnabled,
    widgetsEnabled: isBoolean(saved.widgetsEnabled)
      ? saved.widgetsEnabled
      : defaultChronauraSettings.widgetsEnabled,
    soundBathAutoplayEnabled: isBoolean(saved.soundBathAutoplayEnabled)
      ? saved.soundBathAutoplayEnabled
      : defaultChronauraSettings.soundBathAutoplayEnabled,
    selectedWatchFaceId:
      typeof saved.selectedWatchFaceId === "string" &&
      validWatchFaceIds.has(saved.selectedWatchFaceId as WatchFaceId)
        ? (saved.selectedWatchFaceId as WatchFaceId)
        : defaultChronauraSettings.selectedWatchFaceId,
    selectedWatchThemeId:
      typeof saved.selectedWatchThemeId === "string" &&
      validWatchThemeIds.has(saved.selectedWatchThemeId as WatchThemeId)
        ? (saved.selectedWatchThemeId as WatchThemeId)
        : defaultChronauraSettings.selectedWatchThemeId,
    selectedWatchComplicationIds: sanitizeWatchComplications(
      saved.selectedWatchComplicationIds
    )
  };
}

export function ChronauraSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ChronauraSettingsState>(defaultChronauraSettings);
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
    const palette = ChronauraThemes[settings.themeMode] ?? ChronauraThemes.midnight_gold;

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
        setSettings(defaultChronauraSettings);
        await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
      }
    };
  }, [hydrated, settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useChronauraSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useChronauraSettings must be used inside ChronauraSettingsProvider");
  }

  return context;
}
