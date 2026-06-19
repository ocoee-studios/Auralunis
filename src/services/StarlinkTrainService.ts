// StarlinkTrainService.ts
// Atmospheric Wake — Starlink Train Tracker.
// Models a freshly launched Starlink train as a chain of N satellites
// spaced ~0.05° apart along the same orbital track.
// Replace the mock with a live Celestrak/N2YO API call when ready.
//
// Train haptics: rapid compass ticks from HapticController when the
// active blip crosses within 15° of device pointing.

import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import type { SpatialTarget } from "@/utils/alignmentEngine";
import { calculateAlignment } from "@/utils/alignmentEngine";
import type { CameraPointing } from "@/features/sky-lens/ar/SkyLensProjection";

export interface TrainNode {
  id: string;
  /** 0 = lead satellite, N-1 = tail */
  index: number;
  latitudeDegrees: number;
  longitudeDegrees: number;
  altitudeKm: number;
  /** Violet at lead, fading to near-invisible at tail */
  opacity: number;
}

export interface StarlinkTrain {
  id: string;
  name: string;
  launchDate: string;
  nodeCount: number;
  nodes: TrainNode[];
  /** Whether this train is currently overhead (elevation > 10°) for this observer */
  isVisible: boolean;
  /** Minutes until train is overhead (0 if visible now) */
  minutesUntil: number;
}

// Separation between consecutive nodes in the train (degrees of arc along track)
const NODE_SEPARATION_DEG = 0.055;
const TRAIN_COLOR = "#A78BFA"; // Nebula violet

/** Mock: a single Starlink-12 train currently passing overhead */
function buildMockTrain(tick: number): StarlinkTrain {
  const now = Date.now();
  const nodeCount = 28;
  const baseAz = (tick * 0.9) % 360;
  const baseLat = 45 + Math.sin(now * 0.00004) * 20;
  const baseLon = ((tick * 0.6) % 360) - 180;

  const nodes: TrainNode[] = Array.from({ length: nodeCount }, (_, i) => {
    // Space nodes along the orbital track (simplified: just offset longitude)
    const lonOffset = i * NODE_SEPARATION_DEG * 1.2;
    const latOffset = i * NODE_SEPARATION_DEG * 0.3;
    const opacity = 1 - (i / nodeCount) * 0.75; // lead is brightest

    return {
      id: `sl-train-12-${i}`,
      index: i,
      latitudeDegrees: Math.max(-51.6, Math.min(51.6, baseLat - latOffset)),
      longitudeDegrees: ((baseLon - lonOffset + 180) % 360) - 180,
      altitudeKm: 340 - i * 0.5, // slight altitude gradient as they spread
      opacity,
    };
  });

  return {
    id: "starlink-train-12",
    name: "Starlink Group 12",
    launchDate: "2025-11-14",
    nodeCount,
    nodes,
    isVisible: true,
    minutesUntil: 0,
  };
}

let _tick = 0;

export function tickTrainSimulation(): void {
  _tick++;
}

export function getActiveTrain(): StarlinkTrain {
  return buildMockTrain(_tick);
}

/** Convert train nodes to SpatialTargets for radar blip rendering */
export function trainToRadarBlips(
  train: StarlinkTrain,
  observer: ObserverLocation,
  pointing: CameraPointing
): Array<{
  id: string;
  azimuthDiff: number;
  elevationDiff: number;
  color: string;
  opacity: number;
  isActive: boolean;
  isLead: boolean;
  alignmentScore: number;
}> {
  const results = train.nodes.map((node) => {
    const target: SpatialTarget = {
      id: node.id,
      name: `SL-12 Node ${node.index + 1}`,
      latitudeDegrees: node.latitudeDegrees,
      longitudeDegrees: node.longitudeDegrees,
      altitudeKm: node.altitudeKm,
    };
    const alignment = calculateAlignment(observer, pointing, target);
    return {
      id: node.id,
      azimuthDiff: alignment.azimuthDiff,
      elevationDiff: alignment.elevationDiff,
      color: TRAIN_COLOR,
      opacity: node.opacity,
      isActive: false,
      isLead: node.index === 0,
      alignmentScore: alignment.alignmentScore,
      totalAngularError: alignment.totalAngularError,
    };
  });

  // Mark the node closest to device pointing as active
  const minErr = Math.min(...results.map((r) => r.totalAngularError));
  return results.map((r) => ({
    ...r,
    isActive: r.totalAngularError === minErr,
  }));
}

/** Should haptics tick? Returns interval ms, or null for silence */
export function trainHapticInterval(closestError: number): number | null {
  if (closestError > 30) return null;
  if (closestError > 15) return 500;
  if (closestError > 5)  return 250;
  return 100; // machine-gun at near-lock
}
