// Pure launch-route / onboarding-state resolver — no react-native, storage, or native
// imports, so the decision is unit-testable in plain Node (see scripts/onboarding-route-selftest.js)
// and cannot flash the wrong screen. App.tsx reads the persisted signals asynchronously and
// feeds them here; nothing about the decision lives in React component state.

/** What the app should render on launch, given the resolved onboarding signals. */
export type LaunchRoute = "loading" | "onboarding" | "app";

export type OnboardingSignals = {
  /**
   * Whether the persisted "onboarding complete" flag is set.
   * `null` = not read from storage yet (still booting).
   */
  onboardingComplete: boolean | null;
  /**
   * Whether durable evidence of prior AuraLunis use exists (a saved birthday / birth
   * profile / setup data). `null` = not read from storage yet (still booting).
   */
  hasExistingUserData: boolean | null;
};

/**
 * The AsyncStorage keys that prove a user has already used AuraLunis (saved birth-chart /
 * profile data). Any one of these being present means this is NOT a fresh install, so an
 * upgrading Build 5 user is never forced back through onboarding. These are read-only here —
 * onboarding never writes or clears them, and this list must stay a subset of the real keys
 * written by BirthSkyService / BirthSkyScreen (asserted by the self-test).
 */
export const EXISTING_USER_DATA_KEYS = [
  "auralunis.birthday",
  "auralunis.birthdate.local",
  "auralunis.birthplace",
] as const;

/**
 * Pure predicate: does the given snapshot of stored values contain any durable prior-use
 * data? A value counts only if it is a non-empty string, so an empty/whitespace entry never
 * masquerades as a real saved profile.
 */
export function hasExistingUserData(values: Record<string, string | null | undefined>): boolean {
  return EXISTING_USER_DATA_KEYS.some((key) => {
    const value = values[key];
    return typeof value === "string" && value.trim().length > 0;
  });
}

/**
 * Single deterministic mapping from onboarding signals → launch route.
 *   - Either signal unread (null)        → "loading"     (boot; never flash the Birth Chart)
 *   - onboarding already completed        → "app"
 *   - existing user with saved chart data → "app"        (safe upgrade migration)
 *   - genuinely new install               → "onboarding"
 * Total and side-effect-free: any resolved combination yields exactly one route.
 */
export function resolveLaunchRoute(signals: OnboardingSignals): LaunchRoute {
  if (signals.onboardingComplete === null || signals.hasExistingUserData === null) {
    return "loading";
  }
  if (signals.onboardingComplete) return "app";
  if (signals.hasExistingUserData) return "app";
  return "onboarding";
}

/**
 * Whether the app should persist the onboarding-complete flag on behalf of an existing user
 * who has saved data but no flag yet (a Build 5 upgrader). True only in exactly that case, so
 * a genuinely new user is never silently marked complete.
 */
export function shouldPersistMigration(signals: OnboardingSignals): boolean {
  return signals.onboardingComplete === false && signals.hasExistingUserData === true;
}
