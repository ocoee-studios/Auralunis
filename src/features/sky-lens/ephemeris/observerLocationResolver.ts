// Pure observer-location resolution — no react, expo, or native imports, so the
// permission decision is unit-testable in plain Node (see scripts/location-permission-selftest.js).
// useObserverLocation wires React state around this; the key rule lives here: the passive
// (mount) path NEVER prompts — it only reads existing permission.

import type { ObserverLocation } from "../accuracy/SkyLensAccuracyTypes";

/** The minimal expo-location surface these helpers use. */
export type LocationPermissionApi = {
  /** Check-only read of current permission — NEVER shows the iOS prompt. */
  getForegroundPermissionsAsync: () => Promise<{ status: string }>;
  /** Explicit request — MAY show the iOS prompt. Only from a user-initiated action. */
  requestForegroundPermissionsAsync: () => Promise<{ status: string }>;
  getCurrentPositionAsync: (
    options?: Record<string, unknown>
  ) => Promise<{ coords: { latitude: number; longitude: number; altitude: number | null } }>;
};

export type ObserverResolution =
  | { status: "granted"; location: ObserverLocation }
  | { status: "fallback" };

/**
 * Resolve the observer location from the permission/position API.
 *   - `prompt === false` (passive / mount / refresh): read permission with the CHECK-ONLY
 *     API — never triggers the iOS location prompt. Used by every automatic path.
 *   - `prompt === true` (explicit user action, e.g. "Use My Location"): MAY request permission.
 * Any non-granted permission, or any error/unavailability, resolves to "fallback" so callers
 * keep their neutral default/manual location. An already-granted user loads a real fix with no
 * prompt in either mode.
 */
export async function resolveObserverLocation(
  api: LocationPermissionApi,
  prompt: boolean
): Promise<ObserverResolution> {
  try {
    const permission = prompt
      ? await api.requestForegroundPermissionsAsync()
      : await api.getForegroundPermissionsAsync();
    if (permission.status !== "granted") return { status: "fallback" };

    const fix = await api.getCurrentPositionAsync({});
    return {
      status: "granted",
      location: {
        latitudeDegrees: fix.coords.latitude,
        longitudeDegrees: fix.coords.longitude,
        altitudeMeters: fix.coords.altitude ?? 0,
      },
    };
  } catch {
    return { status: "fallback" };
  }
}
