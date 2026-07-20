// Pure lock-share gating for the Telemetry (Orbital Alignment) screen — no react-native or
// native imports, so it is unit-testable in plain Node (see scripts/telemetry-controls-selftest.js).
import type { TrackingMode } from "@/features/paywall/MonetizationCatalog";

// Modes whose lock records a Cosmic-Drift entry and (on a real device) presents the shareable
// LockShareCard overlay.
export const LOCK_SHARE_MODES: TrackingMode[] = ["fleet", "deep-space", "train", "debris", "reentry"];

/**
 * Whether a just-locked target should present the full-screen LockShareCard overlay.
 *
 * Simulation Mode is ALWAYS excluded: the demo sweep auto-locks continuously, and each lock
 * would remount the overlay — which captures every touch and traps the Telemetry controls
 * (mode switch, Unlock Premium, Sim-exit). Real-device / non-simulation locks are unaffected.
 */
export function shouldPresentLockShareCard(mode: TrackingMode, simMode: boolean): boolean {
  return !simMode && LOCK_SHARE_MODES.includes(mode);
}
