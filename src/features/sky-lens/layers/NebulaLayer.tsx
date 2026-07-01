import React, { useEffect, useState } from "react";
import { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import type { HorizontalNebula } from "../ephemeris/Nebulae";
import type { NebulaType } from "../data/nebulae";
import { focusFactor, type ProjectFn, type SkyPalette, type SelectedObject, type FocusZone } from "../SkyLensVisual";
import type { LabelPlacer } from "../labelLayout";

// Irregular, smooth CLOSED blob path around (cx,cy) of approximate radius r, with a
// deterministic wobble keyed by `seed`. Filled with a soft radial gradient it reads as
// an organic, feathered cloud — wispy and uneven, NOT a perfect circle (device pass).
function blobPath(cx: number, cy: number, r: number, seed: number, n = 9): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const f = Math.abs(Math.sin((seed + 1) * 12.9898 + i * 78.233) * 43758.5453) % 1;
    const rr = r * (0.62 + f * 0.56); // 0.62–1.18× → ragged silhouette
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  const mid = (i: number, j: number): [number, number] => [(pts[i][0] + pts[j][0]) / 2, (pts[i][1] + pts[j][1]) / 2];
  const [sx, sy] = mid(n - 1, 0);
  let d = `M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [mx, my] = mid(i, (i + 1) % n);
    d += ` Q ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return d + " Z";
}

// Star clusters aren't smooth glows — they're a tight concentration of individual
// stars. Generate 15–25 deterministic dots (seeded so they don't twinkle-jump per
// render), biased toward the centre (pow 1.7 → dense core), each varying slightly in
// size + brightness. Caller paints them in the cluster's coreColor over a faint glow.
function clusterDots(cx: number, cy: number, radius: number, seed: number): { x: number; y: number; r: number; o: number }[] {
  let s = (seed * 2654435761 + 1) >>> 0;
  const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  const count = 15 + Math.floor(rng() * 11); // 15–25
  const out: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < count; i++) {
    const ang = rng() * Math.PI * 2;
    const dr = Math.pow(rng(), 1.7) * radius; // centre-dense
    out.push({
      x: cx + Math.cos(ang) * dr,
      y: cy + Math.sin(ang) * dr,
      r: 0.5 + rng() * 1.1, // 0.5–1.6px
      o: 0.55 + rng() * 0.45, // 0.55–1.0
    });
  }
  return out;
}

type Props = {
  nebulae: HorizontalNebula[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  focus?: FocusZone;
  showcase?: FocusZone; // auto-lit hero region (e.g. Orion in view) — nebulae intensify
  placeLabel?: LabelPlacer;
  showLabels?: boolean; // false in cinematic Immersive Sky mode → glowing clouds only
  customShapes?: boolean; // premium: dual-colour silhouettes (Trifid lanes etc). free: radial glows.
  fullSphere?: boolean; // Planetarium: show below-horizon nebulae at full brightness
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

// THE BIG FIVE — modelled directly on the Trifid astrophoto in assets/sky/. A real
// emission nebula is NOT a single-colour blob: warm pink H-alpha emission AND cool
// blue reflection nebulosity coexist, carved by DARK DUST LANES into recognisable
// lobes, with bright embedded stars shining through. Each is built from three layers:
//   warm[] — pink/orange emission lobes (uses the nebula's coreColor/hazeColor)
//   cool[] — blue reflection lobes, offset to one region (the Trifid's blue cap)
//   lanes[] — dark dust ellipses that SPLIT the glow (the "tri-fid" three-way cleft)
//   stars[] — embedded bright stars (white dots) the translucent cloud shines around
// All offsets/sizes are in units of the base radius r. coolColor drives a dedicated
// blue radial gradient built per-object in <Defs>.
type DustLane = { dx: number; dy: number; rx: number; ry: number; ang: number; op?: number };
type EmbStar = { dx: number; dy: number; r: number; op?: number };
type BigFive = {
  scale: number;
  coolColor: string;
  warm: Lobe[];
  cool: Lobe[];
  lanes: DustLane[];
  stars: EmbStar[];
};
const BIG_FIVE: Record<string, BigFive> = {
  // Trifid (M20) — the reference. Pink emission below, blue reflection cap above, a
  // three-way dark cleft radiating from the heart. The signature dual-colour nebula.
  m20: {
    scale: 2.4,
    coolColor: "#6FB6F2",
    warm: [
      { dx: 0, dy: 0.22, s: 0.95 },
      { dx: -0.45, dy: 0.5, s: 0.62, op: 0.82 },
      { dx: 0.48, dy: 0.46, s: 0.66, op: 0.82 },
      { dx: 0, dy: 0.12, s: 0.7, op: 0.92 },
    ],
    cool: [
      { dx: 0, dy: -0.82, s: 0.82 },
      { dx: -0.48, dy: -0.62, s: 0.58, op: 0.85 },
      { dx: 0.44, dy: -0.78, s: 0.54, op: 0.8 },
    ],
    lanes: [
      { dx: 0, dy: -0.05, rx: 0.1, ry: 0.95, ang: 2, op: 0.85 },
      { dx: -0.32, dy: 0.5, rx: 0.09, ry: 0.8, ang: -44, op: 0.8 },
      { dx: 0.34, dy: 0.48, rx: 0.09, ry: 0.8, ang: 44, op: 0.8 },
    ],
    stars: [
      { dx: 0.04, dy: 0.18, r: 1.7, op: 0.95 },
      { dx: -0.58, dy: -0.32, r: 1.0, op: 0.7 },
      { dx: 0.52, dy: 0.08, r: 1.1, op: 0.75 },
      { dx: 0.2, dy: 0.72, r: 0.9, op: 0.7 },
      { dx: -0.32, dy: 0.6, r: 0.8, op: 0.65 },
      { dx: 0.66, dy: -0.5, r: 0.9, op: 0.7 },
      { dx: -0.2, dy: -0.9, r: 0.85, op: 0.7 },
    ],
  },
  // Orion (M42) — magenta wings sweeping down, a blue "Running Man" reflection cap to
  // the north, a dark intrusion (the Fish's Mouth) biting into the bright trapezium.
  m42: {
    scale: 2.4,
    coolColor: "#6A86E6",
    warm: [
      { dx: 0, dy: 0, s: 1 },
      { dx: -0.55, dy: -0.75, s: 0.7, op: 0.7 },
      { dx: 0.6, dy: 0.55, s: 0.85, op: 0.75 },
      { dx: 0.15, dy: 1.15, s: 0.55, op: 0.6 },
      { dx: -0.9, dy: 0.3, s: 0.5, op: 0.5 },
    ],
    cool: [
      { dx: -0.2, dy: -1.3, s: 0.55, op: 0.7 },
      { dx: 0.12, dy: -1.55, s: 0.45, op: 0.6 },
    ],
    lanes: [
      { dx: 0.34, dy: -0.12, rx: 0.5, ry: 0.13, ang: -25, op: 0.78 },
      { dx: -0.2, dy: 0.22, rx: 0.36, ry: 0.1, ang: 20, op: 0.58 },
    ],
    stars: [
      { dx: 0, dy: 0, r: 1.6, op: 0.95 },
      { dx: 0.09, dy: 0.05, r: 1.0, op: 0.9 },
      { dx: -0.08, dy: 0.06, r: 0.9, op: 0.85 },
      { dx: 0.05, dy: -0.07, r: 0.9, op: 0.85 },
      { dx: 0.5, dy: 0.5, r: 0.9, op: 0.7 },
      { dx: -0.6, dy: -0.55, r: 0.85, op: 0.7 },
    ],
  },
  // Lagoon (M8) — a rose cloud cleft by the dark "lagoon" channel, the open cluster
  // NGC 6530 sparking on its eastern edge, a faint blue haze off one flank.
  m8: {
    scale: 3.0,
    coolColor: "#5C8FD0",
    warm: [
      { dx: 0, dy: 0, s: 1 },
      { dx: 0.55, dy: 0.12, s: 0.68, op: 0.75 },
      { dx: -0.55, dy: 0.08, s: 0.6, op: 0.7 },
      { dx: 0.1, dy: -0.42, s: 0.5, op: 0.62 },
    ],
    cool: [{ dx: 0.72, dy: -0.42, s: 0.42, op: 0.55 }],
    lanes: [
      { dx: 0, dy: 0, rx: 0.12, ry: 1.0, ang: 12, op: 0.8 },
      { dx: 0.16, dy: 0.12, rx: 0.1, ry: 0.7, ang: -32, op: 0.55 },
    ],
    stars: [
      { dx: 0.42, dy: -0.06, r: 1.4, op: 0.9 },
      { dx: 0.52, dy: 0.12, r: 0.95, op: 0.78 },
      { dx: 0.34, dy: 0.2, r: 0.85, op: 0.72 },
      { dx: -0.42, dy: 0.22, r: 1.0, op: 0.72 },
      { dx: -0.1, dy: -0.3, r: 0.85, op: 0.7 },
    ],
  },
  // Eagle (M16) — amber-magenta glow with the dark Pillars of Creation reaching up
  // from the core, the cluster NGC 6611 scattered across the top.
  m16: {
    scale: 2.4,
    coolColor: "#7FA0E0",
    warm: [
      { dx: 0, dy: 0, s: 1 },
      { dx: -0.42, dy: -0.5, s: 0.6, op: 0.7 },
      { dx: 0.46, dy: -0.4, s: 0.6, op: 0.7 },
      { dx: 0, dy: 0.52, s: 0.55, op: 0.6 },
    ],
    cool: [{ dx: 0, dy: -0.72, s: 0.42, op: 0.5 }],
    lanes: [
      { dx: 0, dy: 0.18, rx: 0.09, ry: 0.58, ang: -8, op: 0.85 },
      { dx: -0.18, dy: 0.22, rx: 0.07, ry: 0.46, ang: 12, op: 0.75 },
      { dx: 0.16, dy: 0.24, rx: 0.06, ry: 0.4, ang: -18, op: 0.7 },
    ],
    stars: [
      { dx: -0.2, dy: -0.6, r: 1.2, op: 0.85 },
      { dx: 0.3, dy: -0.5, r: 1.0, op: 0.8 },
      { dx: 0, dy: -0.32, r: 0.9, op: 0.75 },
      { dx: 0.46, dy: -0.62, r: 0.85, op: 0.72 },
      { dx: -0.45, dy: -0.35, r: 0.8, op: 0.7 },
    ],
  },
  // Carina (NGC 3372) — a vast irregular cloud of hot pink and orange, split by the
  // dark Keyhole lane, blazing Eta Carinae at its heart.
  ngc3372: {
    scale: 2.4,
    coolColor: "#6CA0D8",
    warm: [
      { dx: 0, dy: 0, s: 1 },
      { dx: -0.7, dy: -0.3, s: 0.72, op: 0.75 },
      { dx: 0.7, dy: 0.2, s: 0.76, op: 0.78 },
      { dx: -0.3, dy: 0.7, s: 0.6, op: 0.65 },
      { dx: 0.5, dy: -0.6, s: 0.55, op: 0.6 },
      { dx: 0, dy: -0.2, s: 0.82, op: 0.85 },
    ],
    cool: [{ dx: -0.6, dy: 0.5, s: 0.46, op: 0.5 }],
    lanes: [
      { dx: 0, dy: 0, rx: 0.14, ry: 0.9, ang: 35, op: 0.78 },
      { dx: -0.1, dy: -0.1, rx: 0.5, ry: 0.1, ang: -15, op: 0.68 },
      { dx: 0.22, dy: 0.26, rx: 0.08, ry: 0.42, ang: 60, op: 0.58 },
    ],
    stars: [
      { dx: 0.05, dy: 0, r: 1.9, op: 0.95 },
      { dx: -0.5, dy: 0.3, r: 1.0, op: 0.75 },
      { dx: 0.42, dy: -0.42, r: 1.0, op: 0.75 },
      { dx: 0.62, dy: 0.5, r: 0.9, op: 0.7 },
      { dx: -0.7, dy: -0.4, r: 0.9, op: 0.7 },
    ],
  },
};

const SIGNATURES: Record<string, Signature> = {
  // Rosette — small WISPY blush (was a saturated pink ring dominating the sky)
  ngc2237: { scale: 0.9, ring: true },
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
  // Veil — thin curved supernova filaments (tightened from 3.6)
  ngc6960: {
    scale: 2.4,
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
export function NebulaLayer({ nebulae, project, palette, nightMode, focus = null, showcase = null, placeLabel, showLabels = true, customShapes = true, fullSphere = false, onSelect, time: timeProp }: Props) {
  const [internalTime, setInternalTime] = useState(() => Date.now());
  useEffect(() => {
    if (timeProp !== undefined || nightMode) return;
    // The breathe cycle is ~4s, so a 350ms sample is visually identical to 120ms but
    // re-renders the (heavy) nebula tree ~3× less often.
    const id = setInterval(() => setInternalTime(Date.now()), 350);
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
              <Stop offset="0%" stopColor={n.coreColor} stopOpacity="0.42" />
              <Stop offset="35%" stopColor={n.hazeColor} stopOpacity="0.2" />
              <Stop offset="70%" stopColor={n.hazeColor} stopOpacity="0.08" />
              <Stop offset="100%" stopColor={n.hazeColor} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id={`neb-core-${n.id}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={n.coreColor} stopOpacity="0.58" />
              <Stop offset="45%" stopColor={n.coreColor} stopOpacity="0.28" />
              <Stop offset="100%" stopColor={n.coreColor} stopOpacity="0" />
            </RadialGradient>
            {BIG_FIVE[n.id] && (
              /* cool blue reflection nebulosity — the second colour zone */
              <RadialGradient id={`neb-cool-${n.id}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={BIG_FIVE[n.id].coolColor} stopOpacity="0.4" />
                <Stop offset="45%" stopColor={BIG_FIVE[n.id].coolColor} stopOpacity="0.2" />
                <Stop offset="100%" stopColor={BIG_FIVE[n.id].coolColor} stopOpacity="0" />
              </RadialGradient>
            )}
          </React.Fragment>
        ))}
        {/* Shared SOFT dark dust-lane gradient — a feathered shadow that fades to
            transparent at every edge, so dust lanes read as DIM SHADOWS within the
            glow (no hard outline, no opaque "stamp"). Darkness is then scaled right
            down at render so peak opacity lands ~15–22%. */}
        <RadialGradient id="nebLaneSoft" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#0A0820" stopOpacity="0.5" />
          <Stop offset="55%" stopColor="#0A0820" stopOpacity="0.22" />
          <Stop offset="100%" stopColor="#0A0820" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {nebulae.map((n, i) => {
        const belowHorizon = !n.aboveHorizon;
        if (belowHorizon && !fullSphere && n.altitudeDegrees < -20) return null;
        // AR (over the camera): the painterly clouds look out of place at full strength,
        // so render them at half size and cap opacity to ~0.28 — a subtle luminous
        // watercolor wash that enhances the sky, not a solid smudge. Planetarium full.
        const arMode = !fullSphere;
        const p = project(n.azimuthDegrees, n.altitudeDegrees);
        if (!p.onScreen) return null;

        const breathe = 0.9 + Math.sin(time * 0.00157 + i * 0.7) * 0.1;
        const seed = (n.id.charCodeAt(0) || 1) + n.id.length * 7; // stable per-nebula blob shape
        const isShowcase = SHOWCASE.has(n.id);
        const sig = SIGNATURES[n.id];
        const bf = BIG_FIVE[n.id];
        // Focus mode (tap) + auto showcase region (e.g. Orion in view): a nebula in the
        // lit region swells and intensifies. Showcase pushes intensity up to ~3× (+200%).
        const ff = focusFactor(p.x, p.y, focus);
        const sf = focusFactor(p.x, p.y, showcase);
        const eff = bf ? bf.scale : sig ? sig.scale : scaleFor(n.id);
        const r = Math.max(isShowcase ? 44 : 22, n.radius * eff) * (1 + ff * 0.8) * (1 + sf * 0.4) * (arMode ? 0.5 : 1);
        const opMul = (isShowcase ? 0.82 : 1) * (1 + ff * 0.7) * (1 + sf * 2.0); // showcase clouds: visible but not solid
        const hazeR = r * 3.5; // larger, softer feather — edges bleed into the sky
        const coreR = r * 1.1;
        const volR = r * 4.4; // volumetric outer edge
        const hazeId = `url(#neb-haze-${n.id})`;
        const coreId = `url(#neb-core-${n.id})`;
        const coolId = `url(#neb-cool-${n.id})`;

        return (
          <G key={n.id} opacity={belowHorizon && !fullSphere ? 0.2 : 1}>
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

            <G opacity={Math.min(arMode ? 0.28 : 1, breathe * opMul)}>
              {n.type === "cluster" ? (
                /* STAR CLUSTER — not a smooth glow but a tight swarm of individual
                   stars. A very faint glow (5%) ties them together; the dots lead. */
                <>
                  <Circle cx={p.x} cy={p.y} r={r * 1.4} fill={n.coreColor} opacity={0.05} />
                  {clusterDots(p.x, p.y, r * 1.25, seed).map((d, k) => (
                    <Circle key={`cl-${k}`} cx={d.x} cy={d.y} r={d.r} fill={n.coreColor} opacity={d.o} />
                  ))}
                </>
              ) : !customShapes ? (
                /* FREE — a simple radial-glow cloud (no dual-colour silhouettes, dust
                   lanes, or embedded stars). Premium unlocks the astrophoto shapes. */
                <>
                  {isShowcase && <Path d={blobPath(p.x, p.y, volR, seed + 2)} fill={hazeId} opacity={0.45} />}
                  <Path d={blobPath(p.x, p.y, hazeR, seed)} fill={hazeId} />
                  <Circle cx={p.x} cy={p.y} r={coreR} fill={coreId} />
                </>
              ) : bf ? (
                /* BIG FIVE — dual-colour astrophoto cloud: blue reflection + pink
                   emission, carved by dark dust lanes, embedded bright stars. */
                <>
                  {/* cool blue reflection nebulosity — wispy gas (irregular paths, not
                      circles), keeping the cool/warm dual-colour structure. */}
                  <Path d={blobPath(p.x, p.y, volR * 0.8, seed + 5)} fill={coolId} opacity={0.3} />
                  {bf.cool.map((lb, k) => (
                    <Path
                      key={`cool-${k}`}
                      d={blobPath(p.x + lb.dx * r, p.y + lb.dy * r, hazeR * lb.s, seed + k * 13 + 1)}
                      fill={coolId}
                      opacity={(lb.op ?? 1) * 0.9}
                    />
                  ))}
                  {/* warm pink/orange emission — wispy cloud lobes */}
                  <Path d={blobPath(p.x, p.y, volR, seed + 9)} fill={hazeId} opacity={0.38} />
                  {bf.warm.map((lb, k) => (
                    <Path
                      key={`warm-${k}`}
                      d={blobPath(p.x + lb.dx * r, p.y + lb.dy * r, hazeR * lb.s, seed + k * 17 + 3)}
                      fill={hazeId}
                      opacity={lb.op ?? 1}
                    />
                  ))}
                  {/* bright concentrated core */}
                  <Circle cx={p.x} cy={p.y} r={coreR} fill={coreId} />
                  {/* dark dust lanes — SOFT feathered shadows (~15–22% peak) that hint
                      the cleft into lobes, NOT opaque geometric stamps. Widened across
                      the lane + edge-feathered (nebLaneSoft) so they melt into the glow
                      like real dust shadows. */}
                  {bf.lanes.map((ln, k) => (
                    <G key={`lane-${k}`} transform={`rotate(${ln.ang} ${p.x.toFixed(1)} ${p.y.toFixed(1)})`}>
                      <Ellipse
                        cx={p.x + ln.dx * r}
                        cy={p.y + ln.dy * r}
                        rx={r * ln.rx * 1.9}
                        ry={r * ln.ry}
                        fill="url(#nebLaneSoft)"
                        opacity={Math.min(0.12, (ln.op ?? 0.8) * 0.14)}
                      />
                    </G>
                  ))}
                  {/* embedded bright stars shining through the translucent cloud */}
                  {bf.stars.map((st, k) => (
                    <Circle key={`emb-${k}`} cx={p.x + st.dx * r} cy={p.y + st.dy * r} r={st.r} fill="#FFFDF5" opacity={st.op ?? 0.9} />
                  ))}
                </>
              ) : sig?.ring ? (
                /* Rosette — a SOFT filled rose glow, NOT a hollow ring/donut (device
                   feedback). ~50% smaller and ~40% dimmer than the old ring so it's a
                   blush within the band, not a pink target floating on top. */
                <>
                  <Path d={blobPath(p.x, p.y, hazeR * 0.38, seed)} fill={hazeId} opacity={0.16} />
                  <Circle cx={p.x} cy={p.y} r={coreR * 0.6} fill={coreId} opacity={0.4} />
                </>
              ) : sig?.lobes ? (
                /* organic multi-lobe cloud — wispy gas (irregular paths, not circles) */
                <>
                  <Path d={blobPath(p.x, p.y, volR, seed + 7)} fill={hazeId} opacity={0.4} />
                  {sig.lobes.map((lb, k) => (
                    <Path
                      key={`lobe-${k}`}
                      d={blobPath(p.x + lb.dx * r, p.y + lb.dy * r, hazeR * lb.s, seed + k * 11 + 4)}
                      fill={hazeId}
                      opacity={lb.op ?? 1}
                    />
                  ))}
                  <Circle cx={p.x} cy={p.y} r={coreR} fill={coreId} />
                </>
              ) : sig?.filaments ? (
                /* Veil — thin curved filaments over a faint wispy base haze */
                <>
                  <Path d={blobPath(p.x, p.y, hazeR * 0.7, seed + 6)} fill={hazeId} opacity={0.28} />
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
                  {isShowcase && <Path d={blobPath(p.x, p.y, volR, seed + 2)} fill={hazeId} opacity={0.45} />}
                  <Path d={blobPath(p.x, p.y, hazeR, seed)} fill={hazeId} />
                  <Circle cx={p.x} cy={p.y} r={coreR} fill={coreId} />
                </>
              )}
              {/* hot heart — the central star / cluster (rings & filament shells stay
                  hollow; Big Five supply their own embedded stars) */}
              {n.type !== "cluster" && !sig?.filaments && (!customShapes || (!sig?.ring && !bf)) && <Circle cx={p.x} cy={p.y} r={2.6} fill="#FFF6E8" opacity={0.7} />}
            </G>

            {/* label */}
            {showLabels && (() => {
              const ly = p.y + Math.min(hazeR * 0.5, isShowcase ? 90 : 46) + 4;
              const lp = placeLabel ? placeLabel(p.x, ly, n.name, 12) : { x: p.x, y: ly };
              return (
                <SvgText x={lp.x} y={lp.y} fill={palette.starLabel} fontSize={12} fontWeight="400" textAnchor="middle" opacity={0.7}>
                  {n.name}
                </SvgText>
              );
            })()}
          </G>
        );
      })}
    </G>
  );
}
