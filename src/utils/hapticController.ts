// hapticController.ts
// Centralized proximity haptic cadence for the Orbital Alignment screen.
// Uses expo-haptics for tactile feedback on iOS.
//
// Proximity zones (by alignmentScore):
//   score ≤ 70   → silent
//   score 70–85  → compass tick every 500ms ("approaching")
//   score > 85   → compass tick every 250ms ("near lock")
//   LOCKED       → one-shot lock pulse, then silent

import { tapLight, tapSuccess } from "@/services/HapticService";

type Zone = "silent" | "approaching" | "nearLock" | "locked";

function zoneFor(alignmentScore: number, isLocked: boolean): Zone {
  if (isLocked) return "locked";
  if (alignmentScore > 85) return "nearLock";
  if (alignmentScore > 70) return "approaching";
  return "silent";
}

export class HapticController {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentZone: Zone = "silent";
  private wasLocked = false;

  /**
   * Call this on every alignment update.
   * Pass alignmentScore (0-100) and isLocked from AlignmentResult.
   */
  update(alignmentScore: number, isLocked: boolean): void {
    const zone = zoneFor(alignmentScore, isLocked);

    // One-shot lock confirmation
    if (isLocked && !this.wasLocked) {
      tapSuccess();
    }
    this.wasLocked = isLocked;

    if (zone === this.currentZone) return;
    this.currentZone = zone;
    this.stopInterval();

    switch (zone) {
      case "approaching":
        // Slower tick — user is getting warm
        this.intervalId = setInterval(
          () => tapLight(),
          500
        );
        break;

      case "nearLock":
        // Faster tick — almost there
        this.intervalId = setInterval(
          () => tapLight(),
          250
        );
        break;

      case "silent":
      case "locked":
      default:
        // No interval — locked fires once above, below 70 is quiet
        break;
    }
  }

  destroy(): void {
    this.stopInterval();
  }

  private stopInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
