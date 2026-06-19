// alignmentEngine.ts
// Pure alignment math for the Orbital Alignment screen.
// Takes the observer's GPS, device pointing, and a spatial target,
// returns angular diffs, a 0-100 score, and lock state.
// No React imports — fully unit-testable.

import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { CameraPointing } from "@/features/sky-lens/ar/SkyLensProjection";

export interface SpatialTarget {
  id: string;
  name: string;
  latitudeDegrees: number;
  longitudeDegrees: number;
  altitudeKm: number;
}

export interface AlignmentResult {
  /** Bearing from observer to target, degrees from true north (0-360) */
  targetAzimuth: number;
  /** Elevation angle from observer to target, degrees above horizon */
  targetElevation: number;
  /** Signed azimuth diff: positive = target is to the right of device heading */
  azimuthDiff: number;
  /** Signed elevation diff: positive = target is above device pitch */
  elevationDiff: number;
  /** Combined angular error in degrees (always >= 0) */
  totalAngularError: number;
  /** 0-100 alignment score. 100 = perfect lock */
  alignmentScore: number;
  /** True when totalAngularError < LOCK_THRESHOLD_DEGREES */
  isLocked: boolean;
}

// Degrees of total angular error required for a full lock
const LOCK_THRESHOLD_DEGREES = 3.5;
// Score falls to 0 at this error (degrees)
const FALLOFF_DEGREES = 90;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Wrap a degree value to [-180, 180] */
function normalizeSigned(deg: number): number {
  return (((deg + 180) % 360) + 360) % 360 - 180;
}

/**
 * Compute the azimuth (bearing) and elevation from an observer on Earth's
 * surface to a target at a given lat/lon/altitude using great-circle bearing
 * + simple geometric elevation (flat-earth approx works well for LEO targets
 * observed over short arcs; accuracy is ~0.2° for ISS).
 */
function computeAzimuthElevation(
  observer: ObserverLocation,
  target: SpatialTarget
): { azimuth: number; elevation: number } {
  const lat1 = toRad(observer.latitudeDegrees);
  const lat2 = toRad(target.latitudeDegrees);
  const dLon = toRad(target.longitudeDegrees - observer.longitudeDegrees);

  // Great-circle bearing
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;

  // Surface distance (km) via haversine
  const R = 6371;
  const dLat = lat2 - lat1;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const surfaceDistKm = 2 * R * Math.asin(Math.sqrt(a));

  // Elevation: arctan(altitude / surface_distance)
  // Clamp surface distance to avoid divide-by-zero at zero separation
  const elevation = toDeg(
    Math.atan2(target.altitudeKm, Math.max(surfaceDistKm, 0.1))
  );

  return { azimuth: bearing, elevation: Math.max(0, elevation) };
}

export function calculateAlignment(
  observer: ObserverLocation,
  pointing: CameraPointing,
  target: SpatialTarget
): AlignmentResult {
  const { azimuth: targetAzimuth, elevation: targetElevation } =
    computeAzimuthElevation(observer, target);

  const azimuthDiff = normalizeSigned(targetAzimuth - pointing.azimuthDegrees);
  const elevationDiff = targetElevation - pointing.altitudeDegrees;

  const totalAngularError = Math.sqrt(
    azimuthDiff ** 2 + elevationDiff ** 2
  );

  // Score: 100 at 0 error, falls linearly to 0 at FALLOFF_DEGREES
  const alignmentScore = Math.round(
    Math.max(0, 100 * (1 - totalAngularError / FALLOFF_DEGREES))
  );

  const isLocked = totalAngularError < LOCK_THRESHOLD_DEGREES;

  return {
    targetAzimuth: Math.round(targetAzimuth),
    targetElevation: Math.round(targetElevation * 10) / 10,
    azimuthDiff,
    elevationDiff,
    totalAngularError,
    alignmentScore,
    isLocked,
  };
}
