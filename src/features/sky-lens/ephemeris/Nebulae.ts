import { Horizon, Observer } from "astronomy-engine";
import type { ObserverLocation } from "../accuracy/SkyLensAccuracyTypes";
import { NEBULAE, type Nebula } from "../data/nebulae";

export interface HorizontalNebula extends Nebula {
  azimuthDegrees: number;
  altitudeDegrees: number;
  aboveHorizon: boolean;
}

// Resolve each nebula's RA/Dec to horizontal coordinates for the observer/time,
// keeping its color/radius metadata attached. Pure module, runs on the slow tick.
export function computeNebulae(location: ObserverLocation, when: Date = new Date()): HorizontalNebula[] {
  const observer = new Observer(
    location.latitudeDegrees,
    location.longitudeDegrees,
    location.altitudeMeters ?? 0
  );
  return NEBULAE.map((n) => {
    const h = Horizon(when, observer, n.raHours, n.decDegrees, "normal");
    return { ...n, azimuthDegrees: h.azimuth, altitudeDegrees: h.altitude, aboveHorizon: h.altitude > 0 };
  });
}
