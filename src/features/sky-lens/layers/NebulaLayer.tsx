import React, { useEffect, useState } from "react";
import { Circle, Defs, Ellipse, G, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import type { NebulaType } from "../data/nebulae";
import type { ProjectFn, SkyPalette, SelectedObject } from "../SkyLensVisual";

type Props = {
  nebulae: HorizontalNebula[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  onSelect: (object: SelectedObject) => void;
  // Optional external clock (ms). When absent, an internal ~8fps clock drives the
  // breathing so re-renders stay ISOLATED to this layer (never the whole canvas).
  time?: number;
};

const TYPE_LABEL: Record<NebulaType, string> = {
  emission: "Emission Nebula",
  reflection: "Reflection Nebula",
  galaxy: "Galaxy",
  cluster: "Globular Cluster",
  planetary: "Planetary Nebula",
  supernova: "Supernova Remnant",
};

// Deep-sky objects as real CLOUDS OF COLOR — multi-stop radial gradients (smooth
// falloff, not flat concentric circles): a broad colored haze (~3× radius), a
// concentrated bright core, and a hot star-forming heart. Galaxies render as tilted
// ellipses with warm-gold cores. Each gently breathes (±10%, phase-offset), and a
// tap opens the info card. Hidden in Night Mode.
export function NebulaLayer({ nebulae, project, palette, nightMode, onSelect, time: timeProp }: Props) {
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
          <React.Fragment key={`def-${n.id}`}>
            {/* broad haze — the colored cloud */}
            <RadialGradient id={`neb-haze-${n.id}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={n.coreColor} stopOpacity="0.30" />
              <Stop offset="35%" stopColor={n.hazeColor} stopOpacity="0.16" />
              <Stop offset="70%" stopColor={n.hazeColor} stopOpacity="0.05" />
              <Stop offset="100%" stopColor={n.hazeColor} stopOpacity="0" />
            </RadialGradient>
            {/* concentrated bright core */}
            <RadialGradient id={`neb-core-${n.id}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={n.coreColor} stopOpacity="0.6" />
              <Stop offset="40%" stopColor={n.coreColor} stopOpacity="0.32" />
              <Stop offset="100%" stopColor={n.coreColor} stopOpacity="0" />
            </RadialGradient>
          </React.Fragment>
        ))}
      </Defs>

      {nebulae.map((n, i) => {
        if (!n.aboveHorizon) return null;
        const p = project(n.azimuthDegrees, n.altitudeDegrees);
        if (!p.onScreen) return null;

        // ±10% breathing over ~4s, phase-offset per object so they churn out of sync.
        const breathe = 0.9 + Math.sin(time * 0.00157 + i * 0.7) * 0.1;
        const r = n.radius;
        const hazeR = r * 3;
        const coreR = r * 1.1;

        return (
          <G key={n.id}>
            {/* transparent hit target (doesn't breathe — always tappable) */}
            <Circle
              cx={p.x}
              cy={p.y}
              r={Math.max(r * 1.5, 26)}
              fill="transparent"
              onPress={() =>
                onSelect({
                  kind: "nebula",
                  id: n.id,
                  name: n.name,
                  subtitle: `${n.catalog} · ${TYPE_LABEL[n.type]}`,
                  facts: [
                    { label: "Type", value: TYPE_LABEL[n.type] },
                    { label: "Distance", value: n.distanceLy },
                    { label: "Constellation", value: n.constellation },
                    { label: "Visibility", value: n.visibility },
                    { label: "Best viewed", value: n.bestMonths },
                  ],
                  description: n.description,
                })
              }
            />

            <G opacity={breathe}>
              {n.elongated ? (
                <G transform={`rotate(${n.angle ?? 0} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
                  <Ellipse cx={p.x} cy={p.y} rx={hazeR} ry={hazeR * 0.42} fill={`url(#neb-haze-${n.id})`} />
                  <Ellipse cx={p.x} cy={p.y} rx={coreR * 1.4} ry={coreR * 0.6} fill={`url(#neb-core-${n.id})`} />
                </G>
              ) : (
                <>
                  <Circle cx={p.x} cy={p.y} r={hazeR} fill={`url(#neb-haze-${n.id})`} />
                  <Circle cx={p.x} cy={p.y} r={coreR} fill={`url(#neb-core-${n.id})`} />
                </>
              )}
              {/* hot heart — the central star / cluster */}
              <Circle cx={p.x} cy={p.y} r={2.6} fill="#FFF6E8" opacity={0.7} />
            </G>

            {/* label */}
            <SvgText
              x={p.x}
              y={p.y + Math.min(hazeR * 0.5, 46) + 4}
              fill={palette.starLabel}
              fontSize={9}
              fontWeight="600"
              textAnchor="middle"
              opacity={0.55}
            >
              {n.name}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
