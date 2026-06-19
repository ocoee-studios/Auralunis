// SpaceDebrisService.ts
// Debris Clean Mission Loop — tracks known space debris objects.
// Debris nodes render as flashing crimson blips on the radar.
// Holding a 100% lock for 5 consecutive seconds triggers a "catalogued" event.
// Replace mock catalog with live Space-Track.org API data when ready.

import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { CameraPointing } from "@/features/sky-lens/ar/SkyLensProjection";
import { calculateAlignment, type AlignmentResult } from "@/utils/alignmentEngine";

export interface DebrisObject {
  id: string;
  name: string;
  /** NORAD catalog number */
  noradId: number;
  origin: string;
  /** Year the object became debris */
  debrisYear: number;
  /** km/h orbital velocity */
  velocityKph: number;
  altitudeKm: number;
  latitudeDegrees: number;
  longitudeDegrees: number;
  description: string;
}

export interface DebrisState {
  object: DebrisObject;
  alignment: AlignmentResult;
  /** Seconds of continuous 100% lock (resets if lock breaks) */
  lockSeconds: number;
  /** Has this object been catalogued this session? */
  catalogued: boolean;
}

export const DEBRIS_CATALOG: DebrisObject[] = [
  { id: "cosmos-1408-frag-a", name: "Cosmos 1408 Fragment A",  noradId: 49863, origin: "Russia",  debrisYear: 2021, velocityKph: 27360, altitudeKm: 487, latitudeDegrees:  62.0, longitudeDegrees:  -15.0, description: "Fragment from 2021 Russian ASAT test of Cosmos 1408. Created 1,500+ trackable pieces." },
  { id: "fengyun-1c-frag",    name: "Fengyun-1C Fragment",     noradId: 29228, origin: "China",   debrisYear: 2007, velocityKph: 27800, altitudeKm: 840, latitudeDegrees:  -20.0, longitudeDegrees:  80.0,  description: "One of thousands of fragments from the 2007 Chinese ASAT test — the largest debris-generating event in history." },
  { id: "zenit-rocket-body",  name: "Zenit-3 Rocket Body",     noradId: 19614, origin: "USSR",    debrisYear: 1988, velocityKph: 27100, altitudeKm: 720, latitudeDegrees:   35.0, longitudeDegrees: 140.0, description: "Upper stage from a Soviet Zenit-3 launch. Over 30 years old, still crossing populated orbital bands." },
  { id: "iridium-33-frag",    name: "Iridium 33 Fragment",      noradId: 33442, origin: "USA",     debrisYear: 2009, velocityKph: 27500, altitudeKm: 776, latitudeDegrees:   12.0, longitudeDegrees: -100.0, description: "Fragment from the 2009 Iridium 33 / Cosmos 2251 collision — the first accidental satellite collision in history." },
  { id: "breeze-m-tank",      name: "Breeze-M Propellant Tank", noradId: 36508, origin: "Russia",  debrisYear: 2012, velocityKph: 27200, altitudeKm: 870, latitudeDegrees:  -45.0, longitudeDegrees:  55.0,  description: "Propellant tank that separated from a Breeze-M upper stage. A common debris type from Russian Proton launches." },
  { id: "sl-16-rocket",       name: "SL-16 Rocket Body",        noradId: 22285, origin: "Russia",  debrisYear: 1992, velocityKph: 27050, altitudeKm: 850, latitudeDegrees:   70.0, longitudeDegrees:  30.0,  description: "Upper stage from a Zenit-2 launch. One of many large SL-16 bodies drifting in low polar orbit." },
];

// Per-object drift rates so debris spreads naturally across the radar
const DRIFT: Record<string, { lonRate: number; latAmp: number; latFreq: number }> = {
  "cosmos-1408-frag-a": { lonRate: 0.41, latAmp: 0.04, latFreq: 0.00019 },
  "fengyun-1c-frag":    { lonRate: 0.33, latAmp: 0.07, latFreq: 0.00014 },
  "zenit-rocket-body":  { lonRate: 0.29, latAmp: 0.03, latFreq: 0.00022 },
  "iridium-33-frag":    { lonRate: 0.37, latAmp: 0.05, latFreq: 0.00017 },
  "breeze-m-tank":      { lonRate: 0.44, latAmp: 0.06, latFreq: 0.00021 },
  "sl-16-rocket":       { lonRate: 0.26, latAmp: 0.04, latFreq: 0.00012 },
};

let fleet: DebrisObject[] = DEBRIS_CATALOG.map(d => ({ ...d }));
let debrisStates: Map<string, { lockSeconds: number; catalogued: boolean }> = new Map(
  DEBRIS_CATALOG.map(d => [d.id, { lockSeconds: 0, catalogued: false }])
);

export function simulateDebrisTick(): void {
  const now = Date.now();
  fleet = fleet.map(obj => {
    const dr = DRIFT[obj.id] ?? { lonRate: 0.35, latAmp: 0.04, latFreq: 0.0002 };
    return {
      ...obj,
      longitudeDegrees: ((obj.longitudeDegrees + dr.lonRate + 180) % 360) - 180,
      latitudeDegrees: Math.max(-80, Math.min(80, obj.latitudeDegrees + Math.sin(now * dr.latFreq) * dr.latAmp)),
    };
  });
}

/** Update lock timers — call every second while in debris mode */
export function updateDebrisLocks(states: DebrisState[]): void {
  states.forEach(s => {
    const cur = debrisStates.get(s.object.id) ?? { lockSeconds: 0, catalogued: false };
    if (s.alignment.isLocked && !cur.catalogued) {
      cur.lockSeconds += 1;
    } else if (!s.alignment.isLocked) {
      cur.lockSeconds = 0;
    }
    debrisStates.set(s.object.id, cur);
  });
}

/** Mark an object as catalogued (after 5s lock) */
export function catalogueDebris(id: string): void {
  const cur = debrisStates.get(id);
  if (cur) debrisStates.set(id, { ...cur, catalogued: true });
}

export function computeDebrisFleet(observer: ObserverLocation, pointing: CameraPointing): DebrisState[] {
  return fleet.map(obj => {
    const alignment = calculateAlignment(observer, pointing, {
      id: obj.id,
      name: obj.name,
      latitudeDegrees: obj.latitudeDegrees,
      longitudeDegrees: obj.longitudeDegrees,
      altitudeKm: obj.altitudeKm,
    });
    const state = debrisStates.get(obj.id) ?? { lockSeconds: 0, catalogued: false };
    return { object: obj, alignment, lockSeconds: state.lockSeconds, catalogued: state.catalogued };
  }).sort((a, b) => a.alignment.totalAngularError - b.alignment.totalAngularError);
}

export function getTotalCatalogued(): number {
  return Array.from(debrisStates.values()).filter(s => s.catalogued).length;
}

export function getDebrisFleet(): DebrisObject[] { return fleet; }
