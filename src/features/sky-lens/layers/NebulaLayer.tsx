import React, { useEffect, useState } from "react";
import { Circle, Defs, Ellipse, G, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import type { NebulaType } from "../data/nebulae";
import { focusFactor, type ProjectFn, type SkyPalette, type SelectedObject, type FocusZone } from "../SkyLensVisual";

type Props = {
  nebulae: HorizontalNebula[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  focus?: FocusZone;
  onSelect: (object: SelectedObject) => void;
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

// Showcase objects render IMPOSSIBLY large — huge soft volumetric clouds, not
// markers. Andromeda spans ~6 Moons in the real sky; here it dominates. Big = lower
// per-layer opacity so they read as clouds of cosmic fire, not solid stickers.
const SHOWCASE = new Set(["m31", "m42", "m8", "m20", "m16", "ngc3372", "ngc2237", "m45", "m17"]);
const scaleFor = (id: string) => (id === "m31" ? 3.2 : SHOWCASE.has(id) ? 2.4 : 1);

// Deep-sky objects as real CLOUDS OF COLOR — multi-stop radial gradients with a
// broad volumetric haze, a concentrated bright core, and a hot heart. Galaxies are
// tilted ellipses. Each gently breathes. Tap opens the info card. Hidden at night.
export function NebulaLayer({ nebulae, project, palette, nightMode, focus = null, onSelect, time: timeProp }: Props) {
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
            <RadialGradient id={`neb-haze-${n.id}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={n.coreColor} stopOpacity="0.5" />
              <Stop offset="30%" stopColor={n.hazeColor} stopOpacity="0.3" />
              <Stop offset="65%" stopColor={n.hazeColor} stopOpacity="0.12" />
              <Stop offset="100%" stopColor={n.hazeColor} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id={`neb-core-${n.id}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={n.coreColor} stopOpacity="0.85" />
              <Stop offset="40%" stopColor={n.coreColor} stopOpacity="0.45" />
              <Stop offset="100%" stopColor={n.coreColor} stopOpacity="0" />
            </RadialGradient>
          </React.Fragment>
        ))}
      </Defs>

      {nebulae.map((n, i) => {
        if (!n.aboveHorizon) return null;
        const p = project(n.azimuthDegrees, n.altitudeDegrees);
        if (!p.onScreen) return null;

        const breathe = 0.9 + Math.sin(time * 0.00157 + i * 0.7) * 0.1;
        const showcase = SHOWCASE.has(n.id);
        // Focus mode: a nebula inside the spotlighted region swells and intensifies.
        const ff = focusFactor(p.x, p.y, focus);
        const r = Math.max(showcase ? 40 : 16, n.radius * scaleFor(n.id)) * (1 + ff * 0.8);
        const opMul = (showcase ? 0.58 : 1) * (1 + ff * 0.7); // huge clouds stay subtle (lower opacity)
        const hazeR = r * 3;
        const coreR = r * 1.1;
        const volR = r * 4.4; // volumetric outer edge

        return (
          <G key={n.id}>
            {/* transparent hit target (doesn't breathe — always tappable) */}
            <Circle
              cx={p.x}
              cy={p.y}
              r={Math.max(r * 1.5, 26)}
              fill="transparent"
              onPress={() => {
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
                });
              }}
            />

            <G opacity={Math.min(1, breathe * opMul)}>
              {n.elongated ? (
                <G transform={`rotate(${n.angle ?? 0} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
                  {showcase && <Ellipse cx={p.x} cy={p.y} rx={volR} ry={volR * 0.42} fill={`url(#neb-haze-${n.id})`} opacity={0.45} />}
                  <Ellipse cx={p.x} cy={p.y} rx={hazeR} ry={hazeR * 0.42} fill={`url(#neb-haze-${n.id})`} />
                  <Ellipse cx={p.x} cy={p.y} rx={coreR * 1.4} ry={coreR * 0.6} fill={`url(#neb-core-${n.id})`} />
                </G>
              ) : (
                <>
                  {showcase && <Circle cx={p.x} cy={p.y} r={volR} fill={`url(#neb-haze-${n.id})`} opacity={0.45} />}
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
              y={p.y + Math.min(hazeR * 0.5, showcase ? 90 : 46) + 4}
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
