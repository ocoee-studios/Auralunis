import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import type { ObserverLocation } from "../accuracy/SkyLensAccuracyTypes";
import { DEFAULT_OBSERVER } from "./SkyEphemerisService";
import { resolveObserverLocation, type LocationPermissionApi } from "./observerLocationResolver";

export { DEFAULT_OBSERVER };

// Expo location surface used here. Typed locally because strict `tsc` under classic module
// resolution can mis-resolve this package's bundled types; the runtime API matches the Expo
// docs exactly. `getForegroundPermissionsAsync` is the CHECK-ONLY read (never prompts) used
// by the passive/mount path; `requestForegroundPermissionsAsync` may prompt and is reached
// ONLY via the explicit enableLocation() action.
const ExpoLocation = Location as unknown as LocationPermissionApi;

export type LocationStatus = "loading" | "granted" | "fallback";

export interface ObserverLocationState {
  location: ObserverLocation;
  status: LocationStatus;
  /** Passive re-check — NEVER prompts; re-reads a fix only if already authorized. */
  refresh: () => void;
  /**
   * Explicit, user-initiated enable — MAY show the iOS location prompt. Call this ONLY from a
   * deliberate contextual action (e.g. a "Use My Location" button), never on mount/onboarding.
   */
  enableLocation: () => void;
}

export function useObserverLocation(): ObserverLocationState {
  const [location, setLocation] = useState<ObserverLocation>(DEFAULT_OBSERVER);
  const [status, setStatus] = useState<LocationStatus>("loading");
  const [nonce, setNonce] = useState(0);
  // Consumed once per resolution. false = passive (mount/refresh, check-only, never prompts);
  // true = an explicit enableLocation() request that may prompt.
  const shouldPromptRef = useRef(false);

  useEffect(() => {
    let active = true;
    const prompt = shouldPromptRef.current;
    shouldPromptRef.current = false;

    async function resolve() {
      setStatus("loading");
      const result = await resolveObserverLocation(ExpoLocation, prompt);
      if (!active) return;
      if (result.status === "granted") setLocation(result.location);
      setStatus(result.status);
    }

    void resolve();
    return () => {
      active = false;
    };
  }, [nonce]);

  return {
    location,
    status,
    refresh: () => setNonce((n) => n + 1),
    enableLocation: () => {
      shouldPromptRef.current = true;
      setNonce((n) => n + 1);
    },
  };
}
