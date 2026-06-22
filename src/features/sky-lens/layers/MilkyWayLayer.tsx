import React from "react";
import { G } from "react-native-svg";
import type { MilkyWayBand } from "../ephemeris/MilkyWay";
import type { ProjectFn } from "../SkyLensVisual";

type Props = {
  band: MilkyWayBand;
  project: ProjectFn;
  box: { width: number; height: number };
  nightMode: boolean;
  boost: number;
};

// GUTTED — The procedural polyline strokes created ugly diagonal band edges
// that survived every fix attempt. The real Milky Way texture in
// MilkyWayCoreLayer.tsx looks beautiful on its own. These strokes
// were making it worse, not better. Removed entirely.
//
// The component shell remains so existing imports don't break.
// If a subtle procedural band is needed later, rebuild it as a
// single wide RadialGradient, NOT polyline strokes.
export function MilkyWayLayer(_props: Props) {
  return <G />;
}
