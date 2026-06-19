// SpaceDebrisService.ts
// Debris Clean Mission Loop.
// Live data: Celestrak public debris clouds (Cosmos-1408, Iridium-33) + optional
// Space-Track.org authenticated feed for the full LEO debris catalog.
// Positions re-propagated every second from cached TLE strings — no repeated fetches.
// Fallback: 6 historically significant mock objects if network unavailable.

import { calculateAlignment, type AlignmentResult } from "@/utils/alignmentEngine";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { CameraPointing } from "@/features/sky-lens/ar/SkyLensProjection";
import {
  getLiveCosmos1408Debris,
  getLiveIridiumDebris,
  getLiveSpaceTrackDebris,
  repropagateDebrisToNow,
  isSatelliteJsAvailable,
  type PropagatedPosition,
} from "@/services/LiveTLEService";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DebrisObject {
  id: string;
  name: string;
  noradId: number;
  origin: string;
  debrisYear: number;
  velocityKph: number;
  altitudeKm: number;
  latitudeDegrees: number;
  longitudeDegrees: number;
  description: string;
  /** Live data source or "mock" */
  dataSource: "live" | "mock";
}

export interface DebrisState {
  object: DebrisObject;
  alignment: AlignmentResult;
  lockSeconds: number;
  catalogued: boolean;
}

// ─── Mock fallback catalog ────────────────────────────────────────────────────

const MOCK_CATALOG: DebrisObject[] = [
  { id: "cosmos-1408-frag-a", name: "Cosmos 1408 Fragment A",  noradId: 49863, origin: "Russia", debrisYear: 2021, velocityKph: 27360, altitudeKm: 487, latitudeDegrees:  62.0, longitudeDegrees:  -15.0, description: "Fragment from 2021 Russian ASAT test. Created 1,500+ trackable pieces.", dataSource: "mock" },
  { id: "fengyun-1c-frag",    name: "Fengyun-1C Fragment",     noradId: 29228, origin: "China",  debrisYear: 2007, velocityKph: 27800, altitudeKm: 840, latitudeDegrees: -20.0, longitudeDegrees:   80.0, description: "From the 2007 Chinese ASAT test — largest debris-generating event in history.", dataSource: "mock" },
  { id: "zenit-rocket-body",  name: "Zenit-3 Rocket Body",     noradId: 19614, origin: "USSR",   debrisYear: 1988, velocityKph: 27100, altitudeKm: 720, latitudeDegrees:  35.0, longitudeDegrees:  140.0, description: "Soviet Zenit-3 upper stage. 35+ years old, still crossing populated orbital bands.", dataSource: "mock" },
  { id: "iridium-33-frag",    name: "Iridium 33 Fragment",      noradId: 33442, origin: "USA",    debrisYear: 2009, velocityKph: 27500, altitudeKm: 776, latitudeDegrees:  12.0, longitudeDegrees: -100.0, description: "From 2009 Iridium 33 / Cosmos 2251 collision — first accidental satellite collision.", dataSource: "mock" },
  { id: "breeze-m-tank",      name: "Breeze-M Propellant Tank", noradId: 36508, origin: "Russia", debrisYear: 2012, velocityKph: 27200, altitudeKm: 870, latitudeDegrees: -45.0, longitudeDegrees:   55.0, description: "Tank separated from a Breeze-M upper stage. Common debris type from Proton launches.", dataSource: "mock" },
  { id: "sl-16-rocket",       name: "SL-16 Rocket Body",        noradId: 22285, origin: "Russia", debrisYear: 1992, velocityKph: 27050, altitudeKm: 850, latitudeDegrees:  70.0, longitudeDegrees:   30.0, description: "Upper stage from a Zenit-2 launch. Large SL-16 body in low polar orbit.", dataSource: "mock" },
];

// Orbital drift for mock objects
const MOCK_DRIFT: Record<string, { lonRate: number; latAmp: number; latFreq: number }> = {
  "cosmos-1408-frag-a": { lonRate: 0.41, latAmp: 0.04, latFreq: 0.00019 },
  "fengyun-1c-frag":    { lonRate: 0.33, latAmp: 0.07, latFreq: 0.00014 },
  "zenit-rocket-body":  { lonRate: 0.29, latAmp: 0.03, latFreq: 0.00022 },
  "iridium-33-frag":    { lonRate: 0.37, latAmp: 0.05, latFreq: 0.00017 },
  "breeze-m-tank":      { lonRate: 0.44, latAmp: 0.06, latFreq: 0.00021 },
  "sl-16-rocket":       { lonRate: 0.26, latAmp: 0.04, latFreq: 0.00012 },
};

// ─── State ────────────────────────────────────────────────────────────────────

let _liveObjects: DebrisObject[] = [];
let _mockFleet: DebrisObject[] = MOCK_CATALOG.map(d => ({ ...d }));
let _isLive = false;
let _lockTimers = new Map<string, number>();   // noradId string → lock seconds
let _catalogued = new Set<string>();
let _spaceTrackCredentials: { username: string; password: string } | null = null;

// ─── Live data init ───────────────────────────────────────────────────────────

/** Provide Space-Track credentials (optional — falls back to Celestrak if not set) */
export function setSpaceTrackCredentials(username: string, password: string): void {
  _spaceTrackCredentials = { username, password };
}

/** Fetch live TLE data. Call once on debris mode entry. */
export async function initDebrisLive(): Promise<boolean> {
  if (!isSatelliteJsAvailable()) return false;

  try {
    const positions = await getLiveSpaceTrackDebris(
      _spaceTrackCredentials?.username,
      _spaceTrackCredentials?.password,
      6
    );

    if (positions.length > 0) {
      _liveObjects = positionsToObjects(positions);
      _isLive = true;
      return true;
    }
  } catch { /* fall through */ }

  _isLive = false;
  return false;
}

/** Re-propagate cached TLEs to now. Call every second while in debris mode. */
export async function tickDebrisLive(): Promise<void> {
  if (!_isLive) return;
  const updated = await repropagateDebrisToNow(6);
  if (updated.length > 0) {
    _liveObjects = positionsToObjects(updated);
  }
}

function positionsToObjects(positions: PropagatedPosition[]): DebrisObject[] {
  return positions.map((p, i) => ({
    id: `live-debris-${p.noradId}`,
    name: p.name,
    noradId: p.noradId,
    origin: "Various",
    debrisYear: 2000 + i, // approximate
    velocityKph: Math.round(p.velocityKms * 3600),
    altitudeKm: p.altitudeKm,
    latitudeDegrees: p.latitudeDegrees,
    longitudeDegrees: p.longitudeDegrees,
    description: `Live tracking — NORAD ${p.noradId}. Propagated from current TLE via satellite.js SGP4.`,
    dataSource: "live" as const,
  }));
}

// ─── Mock tick ────────────────────────────────────────────────────────────────

export function tickDebrisMock(): void {
  const now = Date.now();
  _mockFleet = _mockFleet.map(obj => {
    const dr = MOCK_DRIFT[obj.id] ?? { lonRate: 0.35, latAmp: 0.04, latFreq: 0.0002 };
    return {
      ...obj,
      longitudeDegrees: ((obj.longitudeDegrees + dr.lonRate + 180) % 360) - 180,
      latitudeDegrees: Math.max(-80, Math.min(80, obj.latitudeDegrees + Math.sin(now * dr.latFreq) * dr.latAmp)),
    };
  });
}

// ─── Lock tracking ────────────────────────────────────────────────────────────

/** Call every second to advance lock timers. Returns ids newly reaching 5s. */
export function tickLockTimers(states: DebrisState[]): string[] {
  const newlyCatalogued: string[] = [];
  states.forEach(s => {
    const key = String(s.object.noradId);
    if (s.alignment.isLocked && !_catalogued.has(key)) {
      const prev = _lockTimers.get(key) ?? 0;
      const next = prev + 1;
      _lockTimers.set(key, next);
      if (next >= 5) {
        _catalogued.add(key);
        newlyCatalogued.push(key);
      }
    } else if (!s.alignment.isLocked) {
      _lockTimers.set(key, 0);
    }
  });
  return newlyCatalogued;
}

export function getLockSeconds(noradId: number): number {
  return _lockTimers.get(String(noradId)) ?? 0;
}

export function isCatalogued(noradId: number): boolean {
  return _catalogued.has(String(noradId));
}

export function getTotalCatalogued(): number { return _catalogued.size; }

// ─── Fleet state ──────────────────────────────────────────────────────────────

export function computeDebrisFleet(observer: ObserverLocation, pointing: CameraPointing): DebrisState[] {
  const objects = _isLive ? _liveObjects : _mockFleet;

  return objects
    .map(obj => ({
      object: obj,
      alignment: calculateAlignment(observer, pointing, {
        id: obj.id,
        name: obj.name,
        latitudeDegrees: obj.latitudeDegrees,
        longitudeDegrees: obj.longitudeDegrees,
        altitudeKm: obj.altitudeKm,
        decayAlert: false,
      }),
      lockSeconds: getLockSeconds(obj.noradId),
      catalogued: isCatalogued(obj.noradId),
    }))
    .sort((a, b) => a.alignment.totalAngularError - b.alignment.totalAngularError);
}

export function isDebrisLive(): boolean { return _isLive; }
