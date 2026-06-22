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
  showcase?: FocusZone; // auto-lit hero region (e.g. Orion in view) — nebulae intensify
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

// SIGNATURE objects: the few nebulae that earn a hand-built ORGANIC SHAPE instead of
// a round blob, so they read like astrophotography — soft lobes that bleed and swirl,
// thin filaments, hollow rose rings. Offsets/sizes are in units of the base radius r.
type Lobe = { dx: number; dy: number; s: number; op?: number };
type Filament = { dx: number; dy: number; rx: number; ry: number; ang: number; op: number };
type Signature = { scale: number; lobes?: Lobe[]; ring?: boolean; filaments?: Filament[] };
const SIGNATURES: Record<string, Signature> = {
  // Orion — a huge red-magenta cloud with sweeping wings
  m42: {
    scale: 3.6,
    lobes: [
      { dx: 0, dy: 0, s: 1 },
      { dx: -0.55, dy: -0.75, s: 0.7, op: 0.7 },
      { dx: 0.6, dy: 0.55, s: 0.85, op: 0.75 },
      { dx: 0.15, dy: 1.15, s: 0.55, op: 0.6 },
      { dx: -0.9, dy: 0.3, s: 0.5, op: 0.5 },
    ],
  },
  // Lagoon — a bright core trailing gold haze
  m8: {
    scale: 3.0,
    lobes: [
      { dx: 0, dy: 0, s: 1 },
      { dx: 0.55, dy: 0.15, s: 0.65, op: 0.7 },
      { dx: -0.5, dy: 0.25, s: 0.5, op: 0.55 },
    ],
  },
  // Rosette — a massive hollow rose bloom
  ngc2237: { scale: 3.4, ring: true },
  // North America — a recognizable continent built from offset lobes
  ngc7000: {
    scale: 3.2,
    lobes: [
      { dx: 0, dy: -0.65, s: 0.75 }, // Canada
      { dx: 0.35, dy: 0.15, s: 1.0 }, // central states
      { dx: -0.55, dy: 0.55, s: 0.6 }, // west coast
      { dx: 0.8, dy: 1.0, s: 0.5, op: 0.7 }, // Florida / Gulf tail
      { dx: 0.5, dy: -0.5, s: 0.55, op: 0.6 },
    ],
  },
  // Veil — thin curved supernova filaments, not a cloud
  ngc6960: {
    scale: 3.6,
    filaments: [
      { dx: -0.2, dy: 0, rx: 2.6, ry: 0.26, ang: 18, op: 0.5 },
      { dx: 0.4, dy: 0.5, rx: 2.0, ry: 0.2, ang: -12, op: 0.42 },
      { dx: 0.1, dy: -0.6, rx: 1.6, ry: 0.16, ang: 42, op: 0.38 },
    ],
  },
};

// Showcase objects render IMPOSSIBLY large — huge soft volumetric clouds, not
// markers. Andromeda spans ~6 Moons in the real sky; here it dominates. Big = lower
// per-layer opacity so they read as clouds of cosmic fire, not solid stickers.
const SHOWCASE = new Set([
  "m31", "m42", "m8", "m20", "m16", "ngc3372", "ngc2237", "m45", "m17", "ngc7000", "ngc6960",
]);
const scaleFor = (id: string) => (id === "m31" ? 3.2 : SHOWCASE.has(id) ? 2.4 : 1);

// Deep-sky objects as real CLOUDS OF COLOR — multi-stop radial gradients with a
// broad volumetric haze, a concentrated bright core, and a hot heart. Signature
// objects get organic shapes; galaxies are tilted ellipses. Each gently breathes.
// Tap opens the info card. Hidden at night.
export function NebulaLayer({ nebulae, project, palette, nightMode, focus = null, showcase = null, onSelect, time: timeProp }: Props) {
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
            {SIGNATURES[n.id]?.ring && (
              <RadialGradient id={`neb-ring-${n.id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={n.coreColor} stopOpacity="0" />
                <Stop offset="38%" stopColor={n.coreColor} stopOpacity="0" />
                <Stop offset="58%" stopColor={n.coreColor} stopOpacity="0.5" />
                <Stop offset="80%" stopColor={n.hazeColor} stopOpacity="0.2" />
                <Stop offset="100%" stopColor={n.hazeColor} stopOpacity="0" />
              </RadialGradient>
            )}
          </React.Fragment>
        ))}
      </Defs>

      {nebulae.map((n, i) => {
        if (!n.aboveHorizon) return null;
        const p = project(n.azimuthDegrees, n.altitudeDegrees);
        if (!p.onScreen) return null;

        const breathe = 0.9 + Math.sin(time * 0.00157 + i * 0.7) * 0.1;
        const isShowcase = SHOWCASE.has(n.id);
        const sig = SIGNATURES[n.id];
        // Focus mode (tap) + auto showcase region (e.g. Orion in view): a nebula in the
        // lit region swells and intensifies. Showcase pushes intensity up to ~3× (+200%).
        const ff = focusFactor(p.x, p.y, focus);
        const sf = focusFactor(p.x, p.y, showcase);
        const eff = sig ? sig.scale : scaleFor(n.id);
        const r = Math.max(isShowcase ? 40 : 16, n.radius * eff) * (1 + ff * 0.8) * (1 + sf * 0.4);
        const opMul = (isShowcase ? 0.58 : 1) * (1 + ff * 0.7) * (1 + sf * 2.0); // huge clouds stay subtle (lower opacity)
        const hazeR = r * 3;
        const coreR = r * 1.1;
        const volR = r * 4.4; // volumetric outer edge
        const hazeId = `url(#neb-haze-${n.id})`;
        const coreId = `url(#neb-core-${n.id})`;

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
              {sig?.ring ? (
                /* Rosette — hollow rose bloom + a faint outer halo */
                <>
                  <Circle cx={p.x} cy={p.y} r={volR * 0.7} fill={hazeId} opacity={0.4} />
                  <Circle cx={p.x} cy={p.y} r={r * 2.4} fill={`url(#neb-ring-${n.id})`} />
                </>
              ) : sig?.lobes ? (
                /* organic multi-lobe cloud (Orion, Lagoon, North America) */
                <>
                  <Circle cx={p.x} cy={p.y} r={volR} fill={hazeId} opacity={0.4} />
                  {sig.lobes.map((lb, k) => (
                    <Circle
                      key={`lobe-${k}`}
                      cx={p.x + lb.dx * r}
                      cy={p.y + lb.dy * r}
                      r={hazeR * lb.s}
                      fill={hazeId}
                      opacity={lb.op ?? 1}
                    />
                  ))}
                  <Circle cx={p.x} cy={p.y} r={coreR} fill={coreId} />
                </>
              ) : sig?.filaments ? (
                /* Veil — thin curved filaments over a faint base haze */
                <>
                  <Circle cx={p.x} cy={p.y} r={hazeR * 0.7} fill={hazeId} opacity={0.28} />
                  {sig.filaments.map((fl, k) => (
                    <G key={`fil-${k}`} transform={`rotate(${fl.ang} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
                      <Ellipse cx={p.x + fl.dx * r} cy={p.y + fl.dy * r} rx={r * fl.rx} ry={r * fl.ry} fill={hazeId} opacity={fl.op} />
                    </G>
                  ))}
                </>
              ) : n.elongated ? (
                <G transform={`rotate(${n.angle ?? 0} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
                  {isShowcase && <Ellipse cx={p.x} cy={p.y} rx={volR} ry={volR * 0.42} fill={hazeId} opacity={0.45} />}
                  <Ellipse cx={p.x} cy={p.y} rx={hazeR} ry={hazeR * 0.42} fill={hazeId} />
                  <Ellipse cx={p.x} cy={p.y} rx={coreR * 1.4} ry={coreR * 0.6} fill={coreId} />
                </G>
              ) : (
                <>
                  {isShowcase && <Circle cx={p.x} cy={p.y} r={volR} fill={hazeId} opacity={0.45} />}
                  <Circle cx={p.x} cy={p.y} r={hazeR} fill={hazeId} />
                  <Circle cx={p.x} cy={p.y} r={coreR} fill={coreId} />
                </>
              )}
              {/* hot heart — the central star / cluster (rings stay hollow) */}
              {!sig?.ring && <Circle cx={p.x} cy={p.y} r={2.6} fill="#FFF6E8" opacity={0.7} />}
            </G>

            {/* label */}
            <SvgText
              x={p.x}
              y={p.y + Math.min(hazeR * 0.5, isShowcase ? 90 : 46) + 4}
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
