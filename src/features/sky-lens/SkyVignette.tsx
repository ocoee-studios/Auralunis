import React from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

// §12 — a soft cinematic vignette over the whole scene: clear at the centre,
// darkening to ~15% black at the corners. Frames the sky and lets the phone's
// edges recede so the AR feed reads as cinematic rather than "camera with graphics
// on top". Static SVG, pointerEvents="none" — it never intercepts taps and adds no
// per-frame cost. Crash-safe (no animated SVG).
export function SkyVignette({ width, height }: { width: number; height: number }) {
  if (width <= 0 || height <= 0) return null;
  return (
    <Svg style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Defs>
        <RadialGradient id="skyVignette" cx="50%" cy="50%" r="72%">
          <Stop offset="0%" stopColor="#000000" stopOpacity={0} />
          <Stop offset="58%" stopColor="#000000" stopOpacity={0} />
          <Stop offset="100%" stopColor="#000000" stopOpacity={0.15} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#skyVignette)" />
    </Svg>
  );
}
