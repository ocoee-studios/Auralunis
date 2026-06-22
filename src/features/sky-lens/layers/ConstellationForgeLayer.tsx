// ConstellationForgeLayer — gold "ink" line-drawing + star bloom when a
// constellation is identified. Crash-safe: a JS clock drives a normal re-render
// with STATIC strokeDashoffset/r/opacity props (no useAnimatedProps on SVG, which
// crashes on RN 0.81 + Reanimated 4 + react-native-svg 15), and no hooks inside
// .map() (the v1 called useAnimatedProps per segment — a rules-of-hooks violation).

import React, { memo, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import Svg, { Circle, G, Line } from "react-native-svg";

export interface ForgePoint { x: number; y: number; }
export interface ForgeSegment { from: ForgePoint; to: ForgePoint; }
interface Props {
  width: number;
  height: number;
  active?: boolean;
  points?: ForgePoint[];
  segments?: ForgeSegment[];
  nightVision?: boolean;
  intensity?: number;
}

export const ConstellationForgeLayer = memo(function ConstellationForgeLayer({
  width, height, active = false, points = [], segments = [], nightVision = false, intensity = 1,
}: Props) {
  const [p, setP] = useState(0); // 0..1 forge progress
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (!active) { setP(0); return; }
    setP(0);
    timer.current = setInterval(() => {
      setP((prev) => {
        const np = prev + 1 / 45; // ~1.8s at 40ms ticks
        if (np >= 1) { if (timer.current) clearInterval(timer.current); return 1; }
        return np;
      });
    }, 40);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [active]);

  if (!active && p === 0) return null;

  const gold = nightVision ? "#FF453A" : "#D9A84E";
  const starlight = nightVision ? "#FFB3AA" : "#FFF6D6";
  const e = 1 - Math.pow(1 - p, 3); // ease-out cubic

  return (
    <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
      <G>
        {segments.map((seg, i) => {
          const length = Math.hypot(seg.to.x - seg.from.x, seg.to.y - seg.from.y);
          // staggered ink-draw: each segment reveals in sequence
          const segE = Math.max(0, Math.min(1, e * segments.length - i));
          return (
            <Line
              key={`fl-${i}`}
              x1={seg.from.x} y1={seg.from.y} x2={seg.to.x} y2={seg.to.y}
              stroke={gold} strokeWidth={1.5} strokeLinecap="round"
              strokeDasharray={`${length}, ${length}`}
              strokeDashoffset={length * (1 - segE)}
              opacity={(0.2 + segE * 0.75) * intensity}
            />
          );
        })}
        {points.map((pt, i) => (
          <Circle
            key={`fs-${i}`}
            cx={pt.x} cy={pt.y} r={2.2 + e * 3.8}
            fill={i % 2 === 0 ? starlight : gold}
            opacity={(0.25 + e * 0.7) * intensity}
          />
        ))}
      </G>
    </Svg>
  );
});
