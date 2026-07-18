import {
  Body,
  Equator,
  Horizon,
  Illumination,
  Observer,
  SearchRiseSet
} from "astronomy-engine";
import type {
  CelestialTarget,
  ObserverLocation
} from "../accuracy/SkyLensAccuracyTypes";

// Real astronomy. Replaces the former mock targets with live, location- and
// time-accurate positions from astronomy-engine (reference-grade, sub-arcminute).
// Pure module: no React Native imports, so it can be unit-tested in plain Node.

export interface SkyBody extends CelestialTarget {
  aboveHorizon: boolean;
  /**
   * Fraction of the disc lit by the Sun, 0..1, from astronomy-engine's Illumination().
   * Undefined for the Sun (and if the ephemeris call fails). Drives Venus's phase-aware
   * artwork in the planetarium — it is a read-only derived quantity and has NO effect on
   * position (ra/dec/az/alt are computed exactly as before).
   */
  illuminationFraction?: number;
  /** Phase angle in degrees (0 = full, 180 = new). Same source and caveats as above. */
  phaseAngleDegrees?: number;
}

// Neutral default (geographic center of the contiguous US) used before a GPS fix
// resolves or when location access is declined. Lives here so non-React code
// (accuracy self-test, CI) can use it without importing the location hook.
export const DEFAULT_OBSERVER: ObserverLocation = {
  latitudeDegrees: 39.8283,
  longitudeDegrees: -98.5795,
  altitudeMeters: 0
};

export interface RiseSet {
  riseISO: string | null;
  setISO: string | null;
}

export interface TonightSky {
  whenISO: string;
  location: ObserverLocation;
  bodies: SkyBody[];
  visibleBodies: SkyBody[];
  moonIlluminationPercent: number;
  sun: RiseSet;
  moon: RiseSet;
}

// Classical naked-eye set: Sun, Moon, and the five visible planets.
const SKY_BODIES: ReadonlyArray<{ id: string; name: string; body: Body }> = [
  { id: "sun", name: "Sun", body: Body.Sun },
  { id: "moon", name: "Moon", body: Body.Moon },
  { id: "mercury", name: "Mercury", body: Body.Mercury },
  { id: "venus", name: "Venus", body: Body.Venus },
  { id: "mars", name: "Mars", body: Body.Mars },
  { id: "jupiter", name: "Jupiter", body: Body.Jupiter },
  { id: "saturn", name: "Saturn", body: Body.Saturn }
];

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function toObserver(location: ObserverLocation): Observer {
  return new Observer(
    location.latitudeDegrees,
    location.longitudeDegrees,
    location.altitudeMeters ?? 0
  );
}

type Illum = {
  magnitude: number | undefined;
  illuminationFraction: number | undefined;
  phaseAngleDegrees: number | undefined;
};

// Single Illumination() read that yields magnitude AND phase, so no extra ephemeris
// work is done. The Sun has no defined illumination phase (astronomy-engine throws),
// so everything degrades to undefined — callers already treat these as optional.
function safeIllumination(body: Body, when: Date): Illum {
  try {
    const info = Illumination(body, when);
    return {
      magnitude: round(info.mag, 1),
      illuminationFraction: round(info.phase_fraction, 3),
      phaseAngleDegrees: round(info.phase_angle, 1)
    };
  } catch {
    return { magnitude: undefined, illuminationFraction: undefined, phaseAngleDegrees: undefined };
  }
}

function nextRiseSet(body: Body, observer: Observer, when: Date): RiseSet {
  // Search the next rise and the next set within a one-day window. Returns null
  // at extreme latitudes / seasons where the event does not occur (e.g. polar day).
  const rise = SearchRiseSet(body, observer, 1, when, 1);
  const set = SearchRiseSet(body, observer, -1, when, 1);
  return {
    riseISO: rise ? rise.date.toISOString() : null,
    setISO: set ? set.date.toISOString() : null
  };
}

export function computeSkyBody(
  entry: { id: string; name: string; body: Body },
  observer: Observer,
  when: Date
): SkyBody {
  const equatorial = Equator(entry.body, when, observer, true, true);
  const horizontal = Horizon(when, observer, equatorial.ra, equatorial.dec, "normal");
  const illum = safeIllumination(entry.body, when);

  return {
    id: entry.id,
    name: entry.name,
    rightAscensionHours: round(equatorial.ra, 4),
    declinationDegrees: round(equatorial.dec, 3),
    azimuthDegrees: round(horizontal.azimuth, 2),
    altitudeDegrees: round(horizontal.altitude, 2),
    magnitude: illum.magnitude,
    illuminationFraction: illum.illuminationFraction,
    phaseAngleDegrees: illum.phaseAngleDegrees,
    aboveHorizon: horizontal.altitude > 0
  };
}

// Full sky snapshot for a location and time. The astrolabe and Sky Lens read
// from this; Find Mode looks up a single body by id from `bodies`.
export function computeTonightSky(
  location: ObserverLocation,
  when: Date = new Date()
): TonightSky {
  const observer = toObserver(location);
  const bodies = SKY_BODIES.map((entry) => computeSkyBody(entry, observer, when));

  return {
    whenISO: when.toISOString(),
    location,
    bodies,
    visibleBodies: bodies.filter((b) => b.aboveHorizon),
    moonIlluminationPercent: round(Illumination(Body.Moon, when).phase_fraction * 100, 0),
    sun: nextRiseSet(Body.Sun, observer, when),
    moon: nextRiseSet(Body.Moon, observer, when)
  };
}

// Expected celestial positions for the Sky Lens accuracy suite. These are the
// truth values the AR overlay is measured against on-device.
export function computeExpectedTargets(
  location: ObserverLocation,
  when: Date = new Date()
): CelestialTarget[] {
  return computeTonightSky(location, when).bodies.map((b) => ({
    id: b.id,
    name: b.name,
    rightAscensionHours: b.rightAscensionHours,
    declinationDegrees: b.declinationDegrees,
    azimuthDegrees: b.azimuthDegrees,
    altitudeDegrees: b.altitudeDegrees,
    magnitude: b.magnitude
  }));
}

export function findBody(sky: TonightSky, id: string): SkyBody | undefined {
  return sky.bodies.find((b) => b.id === id);
}
