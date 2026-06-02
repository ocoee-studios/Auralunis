import { useEffect, useState } from "react";
import * as Location from "expo-location";
import type { ObserverLocation } from "../accuracy/SkyLensAccuracyTypes";
import { DEFAULT_OBSERVER } from "./SkyEphemerisService";

export { DEFAULT_OBSERVER };

// Expo SDK 51 location surface used here. Typed locally because strict `tsc`
// under classic module resolution can mis-resolve this package's bundled types;
// the runtime API matches the Expo SDK 51 documentation exactly.
const ExpoLocation = Location as unknown as {
  requestForegroundPermissionsAsync: () => Promise<{ status: string }>;
  getCurrentPositionAsync: (
    options?: Record<string, unknown>
  ) => Promise<{ coords: { latitude: number; longitude: number; altitude: number | null } }>;
};

export type LocationStatus = "loading" | "granted" | "fallback";

export interface ObserverLocationState {
  location: ObserverLocation;
  status: LocationStatus;
  refresh: () => void;
}

export function useObserverLocation(): ObserverLocationState {
  const [location, setLocation] = useState<ObserverLocation>(DEFAULT_OBSERVER);
  const [status, setStatus] = useState<LocationStatus>("loading");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;

    async function resolve() {
      setStatus("loading");
      try {
        const permission = await ExpoLocation.requestForegroundPermissionsAsync();
        if (!active) return;
        if (permission.status !== "granted") {
          setStatus("fallback");
          return;
        }

        const fix = await ExpoLocation.getCurrentPositionAsync({});
        if (!active) return;
        setLocation({
          latitudeDegrees: fix.coords.latitude,
          longitudeDegrees: fix.coords.longitude,
          altitudeMeters: fix.coords.altitude ?? 0
        });
        setStatus("granted");
      } catch {
        // Keep the neutral default usable if location services are unavailable.
        if (active) setStatus("fallback");
      }
    }

    void resolve();
    return () => {
      active = false;
    };
  }, [nonce]);

  return { location, status, refresh: () => setNonce((n) => n + 1) };
}
