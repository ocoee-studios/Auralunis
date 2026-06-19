// SkyAlignmentChainService.ts
// Sky-Crawl Alignment Chains — daily multi-target cosmic puzzle locks.
// Each chain has 2-4 celestial targets to lock in sequence.
// Completing a chain records the full sequence to Cosmic Drift.

import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import { computePlanetaryTargets } from "@/utils/planetaryEphemeris";
import { ATMOSPHERE_CATALOG } from "@/data/AtmosphereCatalog";

export interface ChainTarget {
  id: string;
  name: string;
  type: "planet" | "satellite";
  color: string;
  /** Pre-computed az for display */
  azimuth: number;
  altitude: number;
  altitudeKm: number;
}

export interface AlignmentChain {
  id: string;
  name: string;
  description: string;
  targets: ChainTarget[];
  difficulty: "easy" | "medium" | "hard";
  /** XP reward for completion */
  reward: number;
}

export interface ChainProgress {
  chain: AlignmentChain;
  /** Index of the next target to lock (0 = not started, length = complete) */
  currentIndex: number;
  completedAt: string | null;
}

// Seed daily chains from a fixed catalog — deterministic by date so all users
// see the same challenge on the same day
const CHAIN_TEMPLATES: Omit<AlignmentChain, "targets">[] = [
  { id: "cassini",   name: "The Cassini Chain",   description: "Follow the grand tour — Venus to Saturn.",         difficulty: "medium", reward: 150 },
  { id: "eclipse",   name: "Eclipse Sequence",    description: "ISS, Moon, Jupiter — a solar system alignment.",   difficulty: "hard",   reward: 300 },
  { id: "twins",     name: "Twin Giants",         description: "Lock Jupiter then Saturn in a single sweep.",      difficulty: "easy",   reward: 80  },
  { id: "inner",     name: "Inner Circuit",       description: "Mercury, Venus, Mars — the rocky trio.",           difficulty: "hard",   reward: 250 },
  { id: "orbital",   name: "Orbital Patrol",      description: "ISS, Hubble, NOAA-20 — three working satellites.", difficulty: "medium", reward: 175 },
  { id: "wanderers", name: "The Wanderers",       description: "Track all five naked-eye planets across the sky.", difficulty: "hard",   reward: 500 },
];

function dailySeed(date: Date): number {
  const d = date.toISOString().split("T")[0].replace(/-/g, "");
  let h = 0;
  for (const c of d) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function getDailyChain(observer: ObserverLocation, date: Date = new Date()): AlignmentChain {
  const seed = dailySeed(date);
  const template = CHAIN_TEMPLATES[seed % CHAIN_TEMPLATES.length];

  const planets = computePlanetaryTargets(observer, date);
  const sats = ATMOSPHERE_CATALOG.slice(0, 3);

  // Build target list based on chain name
  let targets: ChainTarget[] = [];

  if (template.id === "cassini") {
    const venus   = planets.find(p => p.id === "venus");
    const saturn  = planets.find(p => p.id === "saturn");
    if (venus && saturn) targets = [
      { id: "venus",  name: "Venus",  type: "planet",    color: venus.planet.radarColor,  azimuth: venus.azimuth,  altitude: venus.altitude,  altitudeKm: Math.round(venus.distAU * 149597870) },
      { id: "saturn", name: "Saturn", type: "planet",    color: saturn.planet.radarColor, azimuth: saturn.azimuth, altitude: saturn.altitude, altitudeKm: Math.round(saturn.distAU * 149597870) },
    ];
  } else if (template.id === "eclipse") {
    const jupiter = planets.find(p => p.id === "jupiter");
    const iss = sats[0];
    if (jupiter && iss) targets = [
      { id: iss.id, name: iss.name, type: "satellite", color: iss.radarColor, azimuth: 0, altitude: 40, altitudeKm: iss.altitudeKm },
      { id: "jupiter", name: "Jupiter", type: "planet", color: jupiter.planet.radarColor, azimuth: jupiter.azimuth, altitude: jupiter.altitude, altitudeKm: Math.round(jupiter.distAU * 149597870) },
    ];
  } else if (template.id === "twins") {
    const jup = planets.find(p => p.id === "jupiter");
    const sat = planets.find(p => p.id === "saturn");
    if (jup && sat) targets = [
      { id: "jupiter", name: "Jupiter", type: "planet", color: jup.planet.radarColor, azimuth: jup.azimuth, altitude: jup.altitude, altitudeKm: Math.round(jup.distAU * 149597870) },
      { id: "saturn",  name: "Saturn",  type: "planet", color: sat.planet.radarColor, azimuth: sat.azimuth, altitude: sat.altitude, altitudeKm: Math.round(sat.distAU * 149597870) },
    ];
  } else if (template.id === "inner") {
    ["mercury","venus","mars"].forEach(id => {
      const p = planets.find(pl => pl.id === id);
      if (p) targets.push({ id: p.id, name: p.name, type: "planet", color: p.planet.radarColor, azimuth: p.azimuth, altitude: p.altitude, altitudeKm: Math.round(p.distAU * 149597870) });
    });
  } else if (template.id === "orbital") {
    sats.slice(0, 3).forEach(s => {
      targets.push({ id: s.id, name: s.name, type: "satellite", color: s.radarColor, azimuth: 0, altitude: 35 + targets.length * 10, altitudeKm: s.altitudeKm });
    });
  } else {
    // wanderers — all five naked-eye planets
    ["mercury","venus","mars","jupiter","saturn"].forEach(id => {
      const p = planets.find(pl => pl.id === id);
      if (p) targets.push({ id: p.id, name: p.name, type: "planet", color: p.planet.radarColor, azimuth: p.azimuth, altitude: p.altitude, altitudeKm: Math.round(p.distAU * 149597870) });
    });
  }

  // Fallback if planet data unavailable
  if (targets.length === 0) {
    targets = sats.slice(0, 2).map(s => ({
      id: s.id, name: s.name, type: "satellite" as const, color: s.radarColor,
      azimuth: Math.random() * 360, altitude: 20 + Math.random() * 40, altitudeKm: s.altitudeKm,
    }));
  }

  return { ...template, targets };
}

// In-memory progress (persisted to AsyncStorage in production)
let _progress: ChainProgress | null = null;

export function getChainProgress(chain: AlignmentChain): ChainProgress {
  if (!_progress || _progress.chain.id !== chain.id) {
    _progress = { chain, currentIndex: 0, completedAt: null };
  }
  return _progress;
}

export function advanceChain(): void {
  if (_progress && _progress.currentIndex < _progress.chain.targets.length) {
    _progress.currentIndex += 1;
    if (_progress.currentIndex >= _progress.chain.targets.length) {
      _progress.completedAt = new Date().toISOString();
    }
  }
}

export function resetChain(): void {
  _progress = null;
}
