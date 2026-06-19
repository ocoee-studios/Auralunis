// hapticController.ts
// Centralized proximity haptic cadence for the Orbital Alignment screen.
// Wraps the existing HapticService so DashboardScreen stays clean.
//
// Proximity zones:
//   > 30° error  → silent
//   ≤ 30° error  → single light tap every 500ms ("approaching")
//   ≤  5° error  → fast medium heartbeat every 150ms ("near lock")
//   LOCKED       → one-shot success notification, then silent

import { tapLight, tapMedium, tapSuccess } from "@/services/HapticService";

type Zone = "silent" | "approaching" | "nearLock" | "locked";

function zoneFor(totalAngularError: number, isLocked: boolean): Zone {
  if (isLocked) return "locked";
  if (totalAngularError <= 5) return "nearLock";
  if (totalAngularError <= 30) return "approaching";
  return "silent";
}

export class HapticController {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentZone: Zone = "silent";
  private wasLocked = false;

  update(totalAngularError: number, isLocked: boolean): void {
    const zone = zoneFor(totalAngularError, isLocked);

    // One-shot lock success
    if (isLocked && !this.wasLocked) {
      tapSuccess();
    }
    this.wasLocked = isLocked;

    if (zone === this.currentZone) return;
    this.currentZone = zone;
    this.stopInterval();

    switch (zone) {
      case "approaching":
        this.intervalId = setInterval(() => tapLight(), 500);
        break;
      case "nearLock":
        this.intervalId = setInterval(() => tapMedium(), 150);
        break;
      case "silent":
      case "locked":
      default:
        // silent — no interval
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
