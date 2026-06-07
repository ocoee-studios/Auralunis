// Memoization cache for ephemeris computations.
// Prevents recomputing planet positions every render. Cache is keyed by
// location + time (rounded to nearest 5 minutes).
import { computeTonightSky, type TonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

const cache = new Map<string, { sky: TonightSky; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 10;

function cacheKey(location: ObserverLocation, date?: Date): string {
  const d = date ?? new Date();
  const roundedMinute = Math.floor(d.getMinutes() / 5) * 5;
  return `${location.latitudeDegrees.toFixed(2)}_${location.longitudeDegrees.toFixed(2)}_${d.getHours()}_${roundedMinute}`;
}

export function getCachedSky(location: ObserverLocation, date?: Date): TonightSky {
  const key = cacheKey(location, date);
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.sky;
  }

  const sky = computeTonightSky(location, date);

  // Evict oldest if cache is full
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) cache.delete(oldest[0]);
  }

  cache.set(key, { sky, timestamp: Date.now() });
  return sky;
}

export function clearEphemerisCache(): void {
  cache.clear();
}
