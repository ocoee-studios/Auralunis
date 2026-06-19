// src/modules/WatchHaptics.ts
// JS interface for the ChronauraHapticsModule Expo native module.
// Falls back silently on Android or if CoreHaptics is unavailable.
//
// Usage:
//   import { WatchHaptics } from '@/modules/WatchHaptics';
//   WatchHaptics.triggerCompassTick();
//   WatchHaptics.triggerLockPulse();

import { Platform } from "react-native";

// Lazy-load to avoid import errors in Expo Go / Android
function getNativeModule() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { requireNativeModule } = require("expo-modules-core") as {
      requireNativeModule: (name: string) => {
        triggerCompassTick: () => void;
        triggerLockPulse: () => void;
      };
    };
    return requireNativeModule("ChronauraHaptics");
  } catch {
    return null;
  }
}

export const WatchHaptics = {
  /**
   * Fires a sharp mechanical micro-tick on the device.
   * Use for proximity approach — score > 70 (within ~30° of target).
   */
  triggerCompassTick(): void {
    if (Platform.OS !== "ios") return;
    getNativeModule()?.triggerCompassTick();
  },

  /**
   * Fires a deep continuous confirmation pulse.
   * Trigger once on alignment lock entry.
   */
  triggerLockPulse(): void {
    if (Platform.OS !== "ios") return;
    getNativeModule()?.triggerLockPulse();
  },
};
