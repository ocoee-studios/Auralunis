import React, { memo } from "react";
import { StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Path, Circle, G } from "react-native-svg";

export interface GhostTrailPoint { x: number; y: number; }
export interface GhostTrail { id: string; points: GhostTrailPoint[]; color?: string; active?: boolean; }
interface Props { width: number; height: number; trails: GhostTrail[]; nightVision?: boolean; intensity?: number; }

function buildPath(points: GhostTrailPoint[]) {
  if (points.length < 2) return "";
  const [first, ...rest] = points;
  return rest.reduce((path, point, index) => {
    const prev = points[index];
    return `${path} Q ${prev.x} ${prev.y} ${(prev.x + point.x) / 2} ${(prev.y + point.y) / 2}`;
  }, `M ${first.x} ${first.y}`);
}

export const OrbitalGhostTrailsLayer = memo(function OrbitalGhostTrailsLayer({ width, height, trails, nightVision = false, intensity = 1 }: Props) {
  const defaultColor = nightVision ? "#FF453A" : "#D9A84E";
  return (
    <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs><LinearGradient id="trailFade" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor={defaultColor} stopOpacity={0} />
        <Stop offset="50%" stopColor={defaultColor} stopOpacity={0.28 * intensity} />
        <Stop offset="100%" stopColor={defaultColor} stopOpacity={0.72 * intensity} />
      </LinearGradient></Defs>
      <G>{trails.map((trail) => {
        const path = buildPath(trail.points);
        const color = trail.color ?? defaultColor;
        const last = trail.points[trail.points.length - 1];
        return (
          <G key={trail.id} opacity={trail.active === false ? 0.32 : 1}>
            <Path d={path} stroke={color} strokeOpacity={0.34 * intensity} strokeWidth={2} strokeLinecap="round" fill="none" />
            <Path d={path} stroke={color} strokeOpacity={0.1 * intensity} strokeWidth={8} strokeLinecap="round" fill="none" />
            {last && <Circle cx={last.x} cy={last.y} r={3.5} fill={color} opacity={0.82 * intensity} />}
          </G>
        );
      })}</G>
    </Svg>
  );
});
