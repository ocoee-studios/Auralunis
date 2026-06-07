// Controls splash screen visibility. Keeps the native splash showing
// until fonts are loaded and initial sky data is computed.

let SplashScreen: { preventAutoHideAsync: () => Promise<void>; hideAsync: () => Promise<void> } | null = null;
try {
  SplashScreen = require("expo-splash-screen") as typeof SplashScreen;
} catch {}

export async function holdSplash(): Promise<void> {
  try { await SplashScreen?.preventAutoHideAsync(); } catch {}
}

export async function releaseSplash(): Promise<void> {
  try { await SplashScreen?.hideAsync(); } catch {}
}
