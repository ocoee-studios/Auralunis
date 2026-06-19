// CosmicDriftService.ts
// Cosmic Drift — the Saved Galaxy Diary.
// Every 100% lock event is persisted as a LockEntry with full telemetry.
// The particle galaxy is derived from the entry set: position, color, and
// cluster size all encode real data from the moment of lock.
//
// Storage: AsyncStorage under "chronaura.cosmic_drift.entries"
// No encryption needed — this is celebration data, not sensitive.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { FREE_DRIFT_EVENT_LIMIT } from "@/features/paywall/MonetizationCatalog";

const STORAGE_KEY = "chronaura.cosmic_drift.entries";

export type TargetType = "satellite" | "planet" | "starlink-train";

export interface LockEntry {
  id: string;
  timestamp: string;           // ISO 8601
  targetId: string;
  targetName: string;
  targetType: TargetType;
  targetColor: string;         // radar color for the particle
  observerLat: number;
  observerLon: number;
  /** Human-readable location label — reverse-geocoded or fallback */
  locationLabel: string;
  azimuth: number;
  elevation: number;
  altitudeKm: number;
  /** Particle position in the galaxy cloud — seeded from timestamp */
  particleX: number;
  particleY: number;
  particleZ: number;
}

/** Seed a deterministic particle position from the timestamp so the galaxy
 *  layout is stable across sessions (same lock = same star in the cloud). */
function seedParticle(isoTimestamp: string): { x: number; y: number; z: number } {
  let hash = 0;
  for (let i = 0; i < isoTimestamp.length; i++) {
    hash = ((hash << 5) - hash + isoTimestamp.charCodeAt(i)) | 0;
  }
  const rand = (offset: number) => {
    const n = Math.sin(hash + offset) * 43758.5453;
    return n - Math.floor(n);
  };
  // Distribute in a sphere of radius ~1 using spherical coordinates
  const theta = rand(0) * 2 * Math.PI;
  const phi = Math.acos(2 * rand(1) - 1);
  const r = 0.3 + rand(2) * 0.7; // keep away from center for readability
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
  };
}

/** Reverse-geocode using a simple lat/lon region lookup (no API key needed). */
function approximateLocation(lat: number, lon: number): string {
  if (lat > 24 && lat < 50 && lon > -125 && lon < -66) return "United States";
  if (lat > 50 && lat < 72 && lon > -141 && lon < -52) return "Canada";
  if (lat > 35 && lat < 71 && lon > -11 && lon < 40) return "Europe";
  if (lat > 20 && lat < 55 && lon > 60 && lon < 150) return "Asia";
  if (lat > -35 && lat < 20 && lon > -80 && lon < -34) return "South America";
  if (lat > -35 && lat < 37 && lon > -18 && lon < 52) return "Africa";
  if (lat > -50 && lat < -10 && lon > 110 && lon < 155) return "Australia";
  return "Earth";
}

async function loadEntries(): Promise<LockEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LockEntry[];
  } catch {
    return [];
  }
}

async function saveEntries(entries: LockEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/** Record a new lock event. Deduplicates by targetId within a 60-second window.
 *  Pass isPremium=true to bypass the free tier event cap. */
export async function recordLock(params: {
  targetId: string;
  targetName: string;
  targetType: TargetType;
  targetColor: string;
  observerLat: number;
  observerLon: number;
  azimuth: number;
  elevation: number;
  altitudeKm: number;
  isPremium?: boolean;
}): Promise<LockEntry | null> {
  const entries = await loadEntries();
  const now = new Date().toISOString();

  // Free tier cap: max FREE_DRIFT_EVENT_LIMIT events
  if (!params.isPremium && entries.length >= FREE_DRIFT_EVENT_LIMIT) {
    return null; // Caller should show upgrade prompt
  }

  // Deduplicate: ignore if same target locked within 60s
  const recent = entries.find(
    (e) =>
      e.targetId === params.targetId &&
      Date.now() - new Date(e.timestamp).getTime() < 60_000
  );
  if (recent) return recent;

  const particle = seedParticle(now);
  const entry: LockEntry = {
    id: `${params.targetId}-${Date.now()}`,
    timestamp: now,
    targetId: params.targetId,
    targetName: params.targetName,
    targetType: params.targetType,
    targetColor: params.targetColor,
    observerLat: params.observerLat,
    observerLon: params.observerLon,
    locationLabel: approximateLocation(params.observerLat, params.observerLon),
    azimuth: params.azimuth,
    elevation: params.elevation,
    altitudeKm: params.altitudeKm,
    particleX: particle.x,
    particleY: particle.y,
    particleZ: particle.z,
  };

  await saveEntries([entry, ...entries]);
  return entry;
}

/** How many drift events the user has recorded */
export async function getDriftEventCount(): Promise<number> {
  const entries = await loadEntries();
  return entries.length;
}

export async function getLockEntries(): Promise<LockEntry[]> {
  return loadEntries();
}

export async function clearDrift(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
