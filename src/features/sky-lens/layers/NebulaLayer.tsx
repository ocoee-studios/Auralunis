import React, { useEffect, useState } from "react";
import { Circle, Defs, G, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import type { ProjectFn, SkyPalette } from "../SkyLensVisual";

type Props = {
  nebulae: HorizontalNebula[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  // Drives the breathing pulse (ms). Optional: if a parent doesn't supply it,
  // NebulaLayer runs its own internal clock so the re-renders stay ISOLATED to
  // this component — feeding `time` from the canvas would re-render the whole SVG
  // tree (1200+ dome stars, the Milky Way image) on every frame.
  time?: number;
};

/**
 * Nebulae rendered as soft, multi-layered glowing clouds of color.
 * Each nebula has:
 *   - Outer haze (large, very faint) — sets the atmosphere
 *   - Mid glow (medium, colored) — the main visual
 *   - Inner core (small, bright) — the concentrated heart
 *   - Subtle breathing animation (opacity pulse)
 *   - Label below
 *
 * The effect should look like a real astrophotography capture —
 * soft colored clouds, not flat circles or dots.
 */
export function NebulaLayer({ nebulae, project, palette, nightMode, time: timeProp }: Props) {
  // Internal breathing clock (~8 fps) — only used when no `time` prop is supplied.
  // Hooks must run before any early return (rules of hooks).
  const [internalTime, setInternalTime] = useState(() => Date.now());
  useEffect(() => {
    if (timeProp !== undefined || nightMode) return;
    const id = setInterval(() => setInternalTime(Date.now()), 120);
    return () => clearInterval(id);
  }, [timeProp, nightMode]);

  if (nightMode) return null;

  const time = timeProp ?? internalTime;

  return (
    <G>
      <Defs>
        {nebulae.map((n) => (
          <RadialGradient key={`grad-${n.id}`} id={`neb-${n.id}`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={n.color} stopOpacity="0.45" />
            <Stop offset="30%" stopColor={n.color} stopOpacity="0.2" />
            <Stop offset="60%" stopColor={n.color} stopOpacity="0.06" />
            <Stop offset="100%" stopColor={n.color} stopOpacity="0" />
          </RadialGradient>
        ))}
      </Defs>

      {nebulae.map((n) => {
        if (!n.aboveHorizon) return null;
        const p = project(n.azimuthDegrees, n.altitudeDegrees);
        if (!p.onScreen) return null;

        // Breathing animation — slow pulse between 0.7 and 1.0 opacity
        const breathe = 0.85 + Math.sin(time * 0.0008 + n.raHours) * 0.15;
        const baseRadius = n.radius || 22;

        return (
          <G key={n.id} opacity={breathe}>
            {/* Layer 1: Outer atmospheric haze — very large, barely visible */}
            <Circle
              cx={p.x}
              cy={p.y}
              r={baseRadius * 2.5}
              fill={`url(#neb-${n.id})`}
            />

            {/* Layer 2: Mid glow — the main colored cloud */}
            <Circle
              cx={p.x}
              cy={p.y}
              r={baseRadius * 1.2}
              fill={n.color}
              opacity={0.12}
            />

            {/* Layer 3: Inner bright core */}
            <Circle
              cx={p.x}
              cy={p.y}
              r={baseRadius * 0.4}
              fill={n.color}
              opacity={0.3}
            />

            {/* Layer 4: Hot center point */}
            <Circle
              cx={p.x}
              cy={p.y}
              r={3}
              fill={n.color}
              opacity={0.6}
            />

            {/* Label */}
            <SvgText
              x={p.x}
              y={p.y + baseRadius * 1.4}
              fill={palette.starLabel}
              fontSize={9}
              fontWeight="600"
              textAnchor="middle"
              opacity={0.5}
            >
              {n.name}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
