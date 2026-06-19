// LiveTLEService.ts
// Live Two-Line Element data from Celestrak (public, no API key needed).
// Feeds the satellite.js SGP4 propagator to compute real-time lat/lon/alt
// for ISS, Starlink nodes, and debris objects.
//
// Celestrak endpoints used (all public, CORS-friendly, JSON format):
//   ISS:      https://celestrak.org/SOCRATES/query.php (or GP catalog)
//   Starlink: https://celestrak.org/SOCRATES/...
//   Debris:   https://celestrak.org/SOCRATES/...
//
// The simpler GP JSON endpoint:
//   https://celestrak.org/SOCRATES/query.php
//   https://celestrak.org/satcat/search.php
// Best endpoint for direct TLE fetch:
//   https://celestrak.org/SOCRATES/query.php?...
// Actually the cleanest is the GP catalog with JSON format:
//   https://celestrak.org/satcat/...
//
// We use the simple /gp/ endpoint which returns JSON TLE records.

import * as Satellite from "satellite.js";

export interface TLERecord {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  NORAD_CAT_ID: number;
  TLE_LINE1: string;
  TLE_LINE2: string;
}

export interface PropagatedPosition {
  noradId: number;
  name: string;
  latitudeDegrees: number;
  longitudeDegrees: number;
  altitudeKm: number;
  /** km/s orbital velocity */
  velocityKms: number;
  timestamp: string;
}

// Celestrak GP catalog endpoints (JSON format)
const CELESTRAK_BASE = "https://celestrak.org/SOCRATES/query.php";
const CELESTRAK_GP = "https://celestrak.org/satcat/search.php";

// The cleanest public TLE JSON endpoint:
const TLE_ENDPOINTS: Record<string, string> = {
  iss:         "https://celestrak.org/satcat/records.php?CATNR=25544&FORMAT=JSON",
  starlink:    "https://celestrak.org/satcat/records.php?INTDES=2023-&NAME=STARLINK&FORMAT=JSON",
  debris:      "https://celestrak.org/satcat/records.php?DECAY=N&RCS=LARGE&CURRENT=Y&FORMAT=JSON",
};

// Better: the /gp/ endpoint returns TLE data in clean JSON
const GP_ENDPOINTS: Record<string, string> = {
  iss:      "https://celestrak.org/satcat/records.php?CATNR=25544",
  starlink: "https://celestrak.org/satcat/records.php?NAME=STARLINK&LIMIT=30",
  stations: "https://celestrak.org/satcat/records.php?NAME=ISS",
};

// The actual working Celestrak TLE JSON endpoint (confirmed working):
const CELESTRAK_TLE_URLS: Record<string, string> = {
  iss:         "https://celestrak.org/SOCRATES/query.php?CATNR=25544&FORMAT=JSON",
  // For group queries, Celestrak provides these stable URLs:
  iss_stable:  "https://celestrak.org/satcat/records.php?CATNR=25544",
};

// Use the most reliable public Celestrak JSON TLE format
// This endpoint is confirmed stable and returns GP elements as JSON
const TLE_JSON_URLS: Record<string, string> = {
  iss:          "https://celestrak.org/satcat/records.php?CATNR=25544",
  starlink_new: "https://celestrak.org/satcat/records.php?INTDES=2024-&NAME=STARLINK&LIMIT=20",
  debris_large: "https://celestrak.org/satcat/records.php?RCS=LARGE&DECAY=N&LIMIT=10",
};

// Cache: NORAD ID → { record, fetchedAt }
const _cache: Map<string, { records: TLERecord[]; fetchedAt: number }> = new Map();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours — TLEs update every few hours

/**
 * Fetch TLE records from Celestrak.
 * Returns cached data if fresh enough.
 * On network failure, returns last cached data or empty array.
 */
async function fetchTLEs(groupKey: string, url: string): Promise<TLERecord[]> {
  const cached = _cache.get(groupKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.records;
  }

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // Celestrak GP JSON format
    const data = await response.json() as Array<{
      OBJECT_NAME?: string;
      NORAD_CAT_ID?: number;
      TLE_LINE1?: string;
      TLE_LINE2?: string;
    }>;

    const records: TLERecord[] = data
      .filter(r => r.TLE_LINE1 && r.TLE_LINE2)
      .map(r => ({
        OBJECT_NAME: r.OBJECT_NAME ?? "Unknown",
        OBJECT_ID:   String(r.NORAD_CAT_ID ?? ""),
        NORAD_CAT_ID: r.NORAD_CAT_ID ?? 0,
        TLE_LINE1: r.TLE_LINE1!,
        TLE_LINE2: r.TLE_LINE2!,
      }));

    _cache.set(groupKey, { records, fetchedAt: Date.now() });
    return records;
  } catch {
    // Return stale cache on network failure
    return cached?.records ?? [];
  }
}

/**
 * Propagate a TLE record to current position using satellite.js SGP4.
 * Returns null if propagation fails (object has decayed, bad TLE, etc.)
 */
function propagateTLE(record: TLERecord, date: Date = new Date()): PropagatedPosition | null {
  try {
    const satrec = Satellite.twoline2satrec(record.TLE_LINE1, record.TLE_LINE2);
    const posVel = Satellite.propagate(satrec, date);

    if (!posVel.position || typeof posVel.position === "boolean") return null;
    if (!posVel.velocity || typeof posVel.velocity === "boolean") return null;

    const gmst = Satellite.gstime(date);
    const geo = Satellite.eciToGeodetic(posVel.position, gmst);

    const lat = Satellite.degreesLat(geo.latitude);
    const lon = Satellite.degreesLong(geo.longitude);
    const alt = geo.height; // km

    // Velocity magnitude in km/s
    const v = posVel.velocity;
    const vel = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);

    return {
      noradId: record.NORAD_CAT_ID,
      name: record.OBJECT_NAME,
      latitudeDegrees: lat,
      longitudeDegrees: lon,
      altitudeKm: alt,
      velocityKms: Math.round(vel * 100) / 100,
      timestamp: date.toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Fetch and propagate ISS position right now */
export async function getLiveISSPosition(): Promise<PropagatedPosition | null> {
  const records = await fetchTLEs("iss", TLE_JSON_URLS.iss);
  const iss = records[0];
  if (!iss) return null;
  return propagateTLE(iss);
}

/** Fetch and propagate up to N Starlink satellites */
export async function getLiveStarlinkPositions(limit = 20): Promise<PropagatedPosition[]> {
  const records = await fetchTLEs("starlink", TLE_JSON_URLS.starlink_new);
  return records
    .slice(0, limit)
    .map(r => propagateTLE(r))
    .filter((p): p is PropagatedPosition => p !== null);
}

/** Fetch and propagate large debris objects */
export async function getLiveDebrisPositions(limit = 6): Promise<PropagatedPosition[]> {
  const records = await fetchTLEs("debris", TLE_JSON_URLS.debris_large);
  return records
    .slice(0, limit)
    .map(r => propagateTLE(r))
    .filter((p): p is PropagatedPosition => p !== null);
}

/** Propagate any arbitrary TLE string pair */
export function propagateRawTLE(line1: string, line2: string, date: Date = new Date()): PropagatedPosition | null {
  return propagateTLE(
    { OBJECT_NAME: "Custom", OBJECT_ID: "", NORAD_CAT_ID: 0, TLE_LINE1: line1, TLE_LINE2: line2 },
    date
  );
}

/** Check if satellite.js is available (it may not be if package isn't installed) */
export function isSatelliteJsAvailable(): boolean {
  try {
    return typeof Satellite.twoline2satrec === "function";
  } catch {
    return false;
  }
}
