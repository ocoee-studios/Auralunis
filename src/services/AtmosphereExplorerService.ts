// AtmosphereExplorerService.ts
// Manages the fleet of atmospheric satellites for the Atmosphere Explorer feature.
// Simulates orbital movement for each satellite and calculates which one
// the device is currently closest to pointing at (the "active" target).
//
// Replace the simulateTick() movement math with live TLE propagation
// (via SatelliteFeedService) when the live feed is wired.

import {
  ATMOSPHERE_CATALOG,
  type AtmosphericSatellite,
} from "@/data/AtmosphereCatalog";
import {
  getLiveISSPosition,
  getLiveStarlinkPositions,
  isSatelliteJsAvailable,
} from "@/services/LiveTLEService";
import { calculateAlignment, type AlignmentResult } from "@/utils/alignmentEngine";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { CameraPointing } from "@/features/sky-lens/ar/SkyLensProjection";
import { isSatelliteJsAvailable, getLiveISSPosition, getLiveStarlinkPositions } from "@/services/LiveTLEService";

export interface SatelliteState {
  satellite: AtmosphericSatellite;
  alignment: AlignmentResult;
}

export interface FleetState {
  satellites: SatelliteState[];
  /** The satellite closest to the device's current pointing direction */
  activeTarget: SatelliteState | null;
}

// Each satellite has a unique orbital drift rate so they spread apart naturally
const DRIFT_RATES: Record<string, { lonRate: number; latAmp: number; latFreq: number }> = {
  iss:              { lonRate: 0.38, latAmp: 0.05, latFreq: 0.0002 },
  hubble:           { lonRate: 0.42, latAmp: 0.03, latFreq: 0.00015 },
  "starlink-v2-001": { lonRate: 0.35, latAmp: 0.06, latFreq: 0.00025 },
  "noaa-20":        { lonRate: 0.28, latAmp: 0.08, latFreq: 0.0001 },
  terra:            { lonRate: 0.31, latAmp: 0.04, latFreq: 0.00018 },
  "starlink-v1-888": { lonRate: 0.36, latAmp: 0.055, latFreq: 0.00022 },
};

// Mutable working copy — mutated by simulateTick each interval
let fleet: AtmosphericSatellite[] = ATMOSPHERE_CATALOG.map((s) => ({ ...s }));
let _liveSyncActive = false;

/**
 * Attempt to update fleet positions from live Celestrak TLE data.
 * Falls back silently to simulation if network unavailable or satellite.js missing.
 * Call once on mount when in fleet mode.
 */
export async function syncLiveTLEData(): Promise<boolean> {
  if (!isSatelliteJsAvailable()) return false;
  if (_liveSyncActive) return false;
  _liveSyncActive = true;

  try {
    const [issPos, starlinkPositions] = await Promise.all([
      getLiveISSPosition(),
      getLiveStarlinkPositions(2),
    ]);

    fleet = fleet.map(sat => {
      if (sat.id === "iss" && issPos) {
        return { ...sat, latitudeDegrees: issPos.latitudeDegrees, longitudeDegrees: issPos.longitudeDegrees, altitudeKm: issPos.altitudeKm };
      }
      if (sat.class === "starlink" && starlinkPositions.length > 0) {
        const live = starlinkPositions.shift();
        if (live) return { ...sat, latitudeDegrees: live.latitudeDegrees, longitudeDegrees: live.longitudeDegrees, altitudeKm: live.altitudeKm };
      }
      return sat;
    });

    return true;
  } catch {
    return false;
  } finally {
    _liveSyncActive = false;
  }
}

/**
 * Advance every satellite's simulated orbital position by one tick.
 * Call this on a setInterval (e.g. every 1000ms).
 */
export function simulateTick(): void {
  const now = Date.now();
  fleet = fleet.map((sat) => {
    const drift = DRIFT_RATES[sat.id] ?? { lonRate: 0.35, latAmp: 0.04, latFreq: 0.0002 };
    const newLon = ((sat.longitudeDegrees + drift.lonRate + 180) % 360) - 180;
    const newLat = Math.max(
      -51.6,
      Math.min(51.6, sat.latitudeDegrees + Math.sin(now * drift.latFreq) * drift.latAmp)
    );
    return { ...sat, longitudeDegrees: newLon, latitudeDegrees: newLat };
  });
}

/**
 * Compute alignment for every satellite in the fleet against the current
 * observer location and device pointing. Returns sorted states (closest first)
 * and the active target (smallest angular error).
 */
export function computeFleetState(
  observer: ObserverLocation,
  pointing: CameraPointing
): FleetState {
  const states: SatelliteState[] = fleet.map((satellite) => ({
    satellite,
    alignment: calculateAlignment(observer, pointing, {
      id: satellite.id,
      name: satellite.name,
      latitudeDegrees: satellite.latitudeDegrees,
      longitudeDegrees: satellite.longitudeDegrees,
      altitudeKm: satellite.altitudeKm,
    }),
  }));

  // Sort by angular error ascending — closest to device pointing = first
  states.sort((a, b) => a.alignment.totalAngularError - b.alignment.totalAngularError);

  const activeTarget = states[0] ?? null;

  return { satellites: states, activeTarget };
}

/** Snapshot of the current fleet positions (for rendering blips) */
export function getFleet(): AtmosphericSatellite[] {
  return fleet;
}
