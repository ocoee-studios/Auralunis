// Locks the app to portrait orientation.
// AuraLunis's UI is designed for portrait only.

let ScreenOrientation: { lockAsync: (lock: number) => Promise<void> } | null = null;
try {
  const mod = require("expo-screen-orientation") as { lockAsync: (lock: number) => Promise<void>; OrientationLock: Record<string, number> };
  ScreenOrientation = mod;
} catch {}

export async function lockPortrait(): Promise<void> {
  try {
    // OrientationLock.PORTRAIT_UP = 1
    await ScreenOrientation?.lockAsync(1);
  } catch {}
}
