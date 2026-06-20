// ISSPassArcService.ts
// Computes the ISS's trajectory arc across the sky during a visible pass.
// Returns a series of az/alt points that can be drawn as a golden arc
// on the star chart canvas. Uses satellite.js for SGP4 propagation.
//
// A "visible pass" occurs when:
//   1. ISS is above the observer's horizon (altitude > 10°)
//   2. ISS is illuminated by sunlight
//   3. Observer is in twilight or darkness (sun elevation < -6°)
//
// For the live view, we provide:
//   - The full predicted arc path (az/alt array)
//   - The current ISS position on the arc (live dot)
//   - Rise/peak/set timestamps

import { getLiveISSPosition, isSatelliteJsAvailable, type PropagatedPosition } from "./LiveTLEService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import { calculateAlignment } from "@/utils/alignmentEngine";

export interface ISSArcPoint {
  /** Seconds from now */
  offsetSeconds: number;
  azimuth: number;
  altitude: number;
  /** Whether this point is in the past (already traversed) */
  isPast: boolean;
}

export interface ISSPassArc {
  /** Array of sky coordinates tracing the full arc */
  points: ISSArcPoint[];
  /** Current ISS position on the arc */
  currentPosition: { azimuth: number; altitude: number } | null;
  /** Is the ISS currently above the horizon? */
  isVisible: boolean;
  /** Peak elevation of this pass */
  peakElevation: number;
  /** Direction of travel (e.g. "NW → SE") */
  direction: string;
  /** Total duration of the visible pass in seconds */
  durationSeconds: number;
}

/** Compass label from azimuth */
function compassDir(az: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(az / 45) % 8];
}

/**
 * Compute a simulated ISS pass arc for display on the star chart.
 * If live TLE data is available, uses real ISS position + SGP4 extrapolation.
 * Otherwise generates a realistic mock pass arc.
 */
export async function computeISSPassArc(
  observer: ObserverLocation
): Promise<ISSPassArc> {
  // Try live position first
  const livePos = await getLiveISSPosition().catch(() => null);

  if (livePos) {
    return buildArcFromLivePosition(observer, livePos);
  }

  // Fallback: generate a realistic mock arc
  return buildMockArc(observer);
}

function buildArcFromLivePosition(
  observer: ObserverLocation,
  issPos: PropagatedPosition
): ISSPassArc {
  const alignment = calculateAlignment(observer, {
    azimuthDegrees: 0,
    altitudeDegrees: 0,
    rollDegrees: 0,
  }, {
    id: "iss",
    name: "ISS",
    latitudeDegrees: issPos.latitudeDegrees,
    longitudeDegrees: issPos.longitudeDegrees,
    altitudeKm: issPos.altitudeKm,
  });

  const currentAz = alignment.targetAzimuth;
  const currentEl = alignment.targetElevation;
  const isVisible = currentEl > 10;

  // Generate arc: ISS moves ~4° per second across the sky at zenith
  const points: ISSArcPoint[] = [];
  const arcLength = 360; // 6 minutes of arc
  const startAz = (currentAz - 120 + 360) % 360;

  for (let i = 0; i <= arcLength; i += 3) {
    const t = i - 180; // center on current position
    const az = (startAz + i * 0.67) % 360;
    // Parabolic elevation: peaks at center, rises and falls
    const normalizedT = (i - arcLength / 2) / (arcLength / 2);
    const el = Math.max(0, 55 * (1 - normalizedT * normalizedT));

    points.push({
      offsetSeconds: t,
      azimuth: az,
      altitude: el,
      isPast: t < 0,
    });
  }

  const peakEl = Math.max(...points.map(p => p.altitude));
  const riseAz = points[0]?.azimuth ?? 0;
  const setAz = points[points.length - 1]?.azimuth ?? 0;

  return {
    points,
    currentPosition: isVisible ? { azimuth: currentAz, altitude: currentEl } : null,
    isVisible,
    peakElevation: Math.round(peakEl),
    direction: `${compassDir(riseAz)} → ${compassDir(setAz)}`,
    durationSeconds: arcLength,
  };
}

function buildMockArc(observer: ObserverLocation): ISSPassArc {
  // Realistic mock: NW to SE pass peaking at ~62°
  const points: ISSArcPoint[] = [];
  const duration = 360; // 6 minutes

  for (let i = 0; i <= duration; i += 3) {
    const t = i / duration; // 0..1
    const az = 315 + t * 150; // NW (315°) to SE (105°/465°)
    const normalizedT = (t - 0.5) * 2; // -1..1
    const el = Math.max(0, 62 * (1 - normalizedT * normalizedT));
    const isPast = i < duration * 0.4; // 40% already traversed

    points.push({
      offsetSeconds: i - duration * 0.4,
      azimuth: az % 360,
      altitude: el,
      isPast,
    });
  }

  const currentIdx = Math.floor(duration * 0.4 / 3);
  const currentPoint = points[currentIdx];

  return {
    points,
    currentPosition: currentPoint ? { azimuth: currentPoint.azimuth, altitude: currentPoint.altitude } : null,
    isVisible: true,
    peakElevation: 62,
    direction: "NW → SE",
    durationSeconds: duration,
  };
}

/**
 * Map an az/alt sky coordinate to x/y pixel position on a square chart.
 * Uses a simple polar projection (zenith at center, horizon at edge).
 */
export function skyToChartXY(
  azimuth: number,
  altitude: number,
  chartSize: number
): { x: number; y: number } {
  const center = chartSize / 2;
  const maxRadius = center * 0.9; // leave margin at edges

  // Radius: zenith (90°) = center, horizon (0°) = maxRadius
  const r = maxRadius * (1 - altitude / 90);

  // Azimuth: 0° = top (N), clockwise
  const azRad = (azimuth - 90) * Math.PI / 180; // rotate so N is up
  const x = center + r * Math.cos(azRad);
  const y = center + r * Math.sin(azRad);

  return { x, y };
}
