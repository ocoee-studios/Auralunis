// Handles app foreground/background transitions.
// Refreshes sky data when returning from background, pauses animations in background.
const { AppState } = require("react-native") as any;
type AppStateStatus = "active" | "background" | "inactive";
import { clearEphemerisCache } from "@/services/EphemerisCacheService";

type Callback = (state: AppStateStatus) => void;
const listeners: Callback[] = [];

let currentState: AppStateStatus = "active";

AppState.addEventListener("change", (nextState) => {
  if (currentState.match(/inactive|background/) && nextState === "active") {
    // Returned to foreground — clear stale cache
    clearEphemerisCache();
  }
  currentState = nextState;
  listeners.forEach((cb) => cb(nextState));
});

export function onAppStateChange(callback: Callback): () => void {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function isAppActive(): boolean {
  return currentState === "active";
}
