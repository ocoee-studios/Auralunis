import { useEffect, useMemo, useState } from "react";
import type { ObserverLocation } from "../accuracy/SkyLensAccuracyTypes";
import {
  computeTonightSky,
  type SkyBody
} from "../ephemeris/SkyEphemerisService";
import {
  computeStarPositions,
  computeConstellationPositions,
  type HorizontalStar,
  type HorizontalConstellation
} from "../ephemeris/StarPositions";
import { computeMilkyWay, type MilkyWayBand } from "../ephemeris/MilkyWay";
import { BRIGHT_STARS } from "../data/brightStars";
import { CONSTELLATION_LINES } from "../data/constellationLines";

export interface SkyData {
  when: Date;
  stars: HorizontalStar[];
  constellations: HorizontalConstellation[];
  bodies: SkyBody[];
  milkyWay: MilkyWayBand;
  moonIlluminationPercent: number;
}

// Resolves every overlay object to horizontal coordinates for the observer and
// the current time. Stars and constellations drift with sidereal time (~15°/hr),
// so recomputing on a slow tick is plenty — the per-frame screen projection from
// device pointing happens in SkyLensCanvas, which is cheap. Default 20s refresh
// keeps things live without spinning astronomy-engine on every sensor sample.
export function useSkyData(location: ObserverLocation, refreshMs = 20000): SkyData {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  return useMemo<SkyData>(() => {
    const sky = computeTonightSky(location, now);
    return {
      when: now,
      stars: computeStarPositions(BRIGHT_STARS, location, now),
      constellations: computeConstellationPositions(CONSTELLATION_LINES, location, now),
      bodies: sky.bodies,
      milkyWay: computeMilkyWay(location, now),
      moonIlluminationPercent: sky.moonIlluminationPercent
    };
  }, [location, now]);
}
