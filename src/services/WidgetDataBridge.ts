// WidgetDataBridge.ts
// Writes key data to the shared App Group UserDefaults so that
// WidgetKit widgets (ISSPassWidget, TonightScoreWidget) can read it.
//
// Uses expo-shared-preferences or a native module.
// For now, uses a lightweight native bridge via expo-modules-core.
// If the native module isn't available (e.g. Expo Go), writes are silently skipped.
//
// Call updateWidgetData() periodically (e.g. every 15 min from a background task,
// or on every app foreground) to keep widgets fresh.

import { Platform } from "react-native";

const APP_GROUP_ID = "group.com.ocoee.auralunis";

// Keys matching ISSPassWidget.swift and TonightScoreWidget.swift
const KEYS = {
  issRise:      "auralunis.iss.nextRiseISO",
  issDirection: "auralunis.iss.direction",
  issPeak:      "auralunis.iss.peakElevation",
  issDuration:  "auralunis.iss.durationMin",
  tonightScore: "auralunis.tonight.score",
  tonightLabel: "auralunis.tonight.label",
  moonPercent:  "auralunis.tonight.moonPercent",
} as const;

// Lazy-load the native SharedGroupPreferences module
function getSharedDefaults(): {
  setItem: (key: string, value: string, groupId: string) => Promise<void>;
} | null {
  if (Platform.OS !== "ios") return null;
  try {
    // react-native-shared-group-preferences provides this API
    const mod = require("react-native-shared-group-preferences") as {
      default: {
        setItem: (key: string, value: string, opts: { groupName: string }) => Promise<void>;
      };
    };
    return {
      setItem: (key, value, groupId) =>
        mod.default.setItem(key, value, { groupName: groupId }),
    };
  } catch {
    // Fallback: try expo-modules-core approach
    try {
      const { NativeModulesProxy } = require("expo-modules-core") as {
        NativeModulesProxy: Record<string, {
          setSharedDefault?: (key: string, value: string, group: string) => Promise<void>;
        }>;
      };
      const bridge = NativeModulesProxy["AuraLunisWidgetBridge"];
      if (bridge?.setSharedDefault) {
        return {
          setItem: (key, value, groupId) => bridge.setSharedDefault!(key, value, groupId),
        };
      }
    } catch { /* fall through */ }
    return null;
  }
}

async function writeKey(key: string, value: string): Promise<void> {
  const defaults = getSharedDefaults();
  if (!defaults) return;
  try {
    await defaults.setItem(key, value, APP_GROUP_ID);
  } catch {
    // Silently skip — widget will show stale/placeholder data
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ISSPassWidgetData {
  nextRiseISO: string;
  direction: string;
  peakElevation: number;
  durationMin: number;
}

export interface TonightScoreWidgetData {
  score: number;
  label: string;
  moonPercent: number;
}

/** Write ISS pass data to shared App Group for the widget */
export async function updateISSPassWidget(data: ISSPassWidgetData): Promise<void> {
  await Promise.all([
    writeKey(KEYS.issRise, data.nextRiseISO),
    writeKey(KEYS.issDirection, data.direction),
    writeKey(KEYS.issPeak, String(data.peakElevation)),
    writeKey(KEYS.issDuration, String(data.durationMin)),
  ]);
}

/** Write Tonight Score data to shared App Group for the widget */
export async function updateTonightScoreWidget(data: TonightScoreWidgetData): Promise<void> {
  await Promise.all([
    writeKey(KEYS.tonightScore, String(data.score)),
    writeKey(KEYS.tonightLabel, data.label),
    writeKey(KEYS.moonPercent, String(data.moonPercent)),
  ]);
}

/** Convenience: update all widgets at once. Call on app foreground or after sky computation. */
export async function refreshAllWidgets(
  issPass: ISSPassWidgetData | null,
  tonightScore: TonightScoreWidgetData
): Promise<void> {
  const tasks: Promise<void>[] = [updateTonightScoreWidget(tonightScore)];
  if (issPass) tasks.push(updateISSPassWidget(issPass));
  await Promise.all(tasks);
}
