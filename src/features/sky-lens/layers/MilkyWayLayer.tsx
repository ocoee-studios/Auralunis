import React, { useEffect, useState } from "react";
import { Circle, Defs, Ellipse, G, RadialGradient, Stop } from "react-native-svg";
import type { MilkyWayBand } from "../ephemeris/MilkyWay";
import type { HorizontalStar } from "../ephemeris/StarPositions";
import type { ProjectFn } from "../SkyLensVisual";

type Props = {
  band: MilkyWayBand;
  stars: HorizontalStar[]; // LAYER 2 — procedural galactic star cloud
  dust: HorizontalStar[]; // LAYERS 1 & 5 — dark dust clouds + the Great Rift
  project: ProjectFn;
  box: { width: number; height: number };
  nightMode: boolean;
  boost: number; // opacity multiplier (~1 camera, higher in Planetarium)
};

// The Milky Way as a LAYERED GALACTIC CLOUD — built to read like a premium
// astrophotography exposure, not a ribbon. Five layers, back to front:
//   3. GALACTIC GLOW  — huge, very soft warm gold-white haze along the plane
//   4. CORE DENSITY   — a brighter bloom toward the Sagittarius galactic centre
//   2. STAR CLOUD     — thousands of clumpy stars (brighter/warmer toward the core)
//   1+5. DUST         — dark clouds and the Great Rift painted ON TOP, occluding the
//        star cloud so the band has real black-against-bright CONTRAST and structure
// The dark dust is what turns fog into a galaxy. All static SVG — crash-safe. The
// photographic core texture (MilkyWayCoreLayer) layers on top of this.
// H-alpha EMISSION (warm rose) + REFLECTION (cool blue) regions placed along the
// galactic plane by galactic longitude (l) → band.center index ≈ round(l/4). These
// are soft coloured patches WITHIN the band so the major nebulae read as brighter
// regions of the galaxy itself, not floating circles. Gold stays dominant; pink and
// blue are low-opacity accents per the AuraLunis palette.
// `op` optionally scales a knot's opacity below the gradient default, used to keep an
// emission patch a BLUSH within the gold band rather than a pink spotlight.
const EMISSION_KNOTS: { l: number; s: number; op?: number }[] = [
  { l: 6, s: 1.0 },    // Lagoon / Trifid (Sagittarius)
  { l: 16, s: 0.85 },  // Eagle / Omega (Serpens/Sagittarius)
  { l: 49, s: 0.6 },   // Scutum star cloud
  { l: 78, s: 0.95 },  // Cygnus — North America / Pelican
  { l: 207, s: 0.18, op: 0.28 }, // Orion / Rosette — tamed AGAIN (2nd device pass):
                                 // another ~50% smaller + ~40% dimmer. It was still a
                                 // pink wash; now barely a blush within the gold band.
  { l: 287, s: 0.85 }, // Carina
];
const REFLECTION_KNOTS = [
  { l: 166, s: 0.7 },  // Pleiades direction
  { l: 84, s: 0.5 },   // Cygnus reflection accent
];
// LAYER B — bright STAR CLOUDS: the famous dense knots where the band visibly
// BRIGHTENS (Large Sagittarius / Scutum / Cygnus / Norma / Carina / Cas-Per). The
// reference photo's band isn't a smooth glow — it's clumpy, brightening into these
// pale-gold star clouds and darkening between them. Rendered as soft pale-gold
// patches WITHIN the band (under the dark dust, which then carves them), so the
// galaxy reads as mottled regions of light rather than one even ribbon.
const STAR_CLOUD_KNOTS = [
  { l: 6, s: 1.0 },    // Large Sagittarius Star Cloud — the brightest swell
  { l: 27, s: 0.85 },  // Scutum Star Cloud
  { l: 75, s: 0.9 },   // Cygnus Star Cloud (Cygnus rift region)
  { l: 330, s: 0.7 },  // Norma Star Cloud
  { l: 287, s: 0.7 },  // Carina
  { l: 124, s: 0.6 },  // Cassiopeia / Perseus segment — keeps the far band alive
];

export function MilkyWayLayer({ band, stars, dust, project, box, nightMode, boost }: Props) {
  // §4 breathing — a ~0.5px vertical drift over 30s so the band feels alive, not pasted.
  // Low-frequency JS clock (600ms → imperceptible sub-0.1px steps). Static SVG + setState,
  // no animated-SVG props → crash-safe. Hook runs before the Night-Mode early return.
  const [driftY, setDriftY] = useState(0);
  useEffect(() => {
    if (nightMode) return;
    const start = Date.now();
    const id = setInterval(() => {
      setDriftY(Math.sin(((Date.now() - start) / 1000 / 30) * Math.PI * 2) * 0.5);
    }, 600);
    return () => clearInterval(id);
  }, [nightMode]);

  if (nightMode) return null;

  // band-following points (galactic equator) for the soft glow
  const glowPts: { x: number; y: number }[] = [];
  for (let i = 0; i < band.center.length; i++) {
    const pt = band.center[i];
    if (!pt.aboveHorizon) continue;
    const p = project(pt.azimuthDegrees, pt.altitudeDegrees);
    if (p.behind) continue;
    if (i % 3 === 0) glowPts.push({ x: p.x, y: p.y });
  }

  const o = (v: number) => Math.min(0.6, v * boost);
  const glowR = Math.max(90, box.height * 0.42); // huge, soft
  const coreR = Math.max(130, box.height * 0.44);
  const dustBase = Math.max(42, box.height * 0.14);

  // galactic core glow (Sagittarius)
  const gc = band.galacticCenter;
  const coreP = gc.aboveHorizon ? project(gc.azimuthDegrees, gc.altitudeDegrees) : null;

  // Project the band point nearest a given galactic longitude (for emission/reflection
  // knots). Returns null if below horizon / behind / off-screen.
  const knotIdx = (l: number) => Math.round((((l % 360) + 360) % 360) / 4) % band.center.length;
  const knotPoint = (l: number) => {
    const idx = knotIdx(l);
    const pt = band.center[idx];
    if (!pt || !pt.aboveHorizon) return null;
    const p = project(pt.azimuthDegrees, pt.altitudeDegrees);
    return p.behind || !p.onScreen ? null : p;
  };

  // Like knotPoint, but also returns the band's local screen direction (degrees) from
  // the neighbouring centre points — so a patch can be stretched ALONG the galactic
  // plane (an ellipse following the river) instead of sitting as a flat circle on top.
  const knotPose = (l: number) => {
    const p = knotPoint(l);
    if (!p) return null;
    const idx = knotIdx(l);
    const a = band.center[(idx - 1 + band.center.length) % band.center.length];
    const b = band.center[(idx + 1) % band.center.length];
    let angle = 0;
    if (a?.aboveHorizon && b?.aboveHorizon) {
      const pa = project(a.azimuthDegrees, a.altitudeDegrees);
      const pb = project(b.azimuthDegrees, b.altitudeDegrees);
      if (!pa.behind && !pb.behind) angle = (Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180) / Math.PI;
    }
    return { x: p.x, y: p.y, angle };
  };

  // tiny deterministic hash for per-blob size variation
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };

  return (
    <G transform={`translate(0 ${driftY.toFixed(2)})`}>
      <Defs>
        {/* LAYER 3 — warm galactic glow — subtle warmth, not visible circles */}
        <RadialGradient id="mwGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#E8C77E" stopOpacity={o(0.1)} />
          <Stop offset="50%" stopColor="#C99A52" stopOpacity={o(0.05)} />
          <Stop offset="100%" stopColor="#C99A52" stopOpacity={0} />
        </RadialGradient>
        {/* LAYER 4 — galactic core: a SATURATED golden heart melting through amber into
            a rose-pink edge (the Sagittarius drama). The reference photo's core is
            warm gold→pink, NOT white — so we push saturation here to colour the
            (naturally grey) photographic core riding on top. This is the visual anchor. */}
        <RadialGradient id="mwCore" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFE9B0" stopOpacity={o(0.62)} />
          <Stop offset="24%" stopColor="#E8C77E" stopOpacity={o(0.44)} />
          <Stop offset="56%" stopColor="#E06888" stopOpacity={o(0.22)} />
          <Stop offset="100%" stopColor="#9080B0" stopOpacity={0} />
        </RadialGradient>
        {/* LAYER B — bright star cloud: pale gold melting to white at the heart, the
            colour of a dense stellar swell (Scutum/Sagittarius clouds). Low opacity so
            it brightens the band, not bleaches it. */}
        <RadialGradient id="mwStarCloud" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF6D6" stopOpacity={o(0.17)} />
          <Stop offset="45%" stopColor="#F2E6C8" stopOpacity={o(0.08)} />
          <Stop offset="100%" stopColor="#F2E6C8" stopOpacity={0} />
        </RadialGradient>
        {/* wide rose → lavender → violet-blue halo cradling the core (the gold→pink→
            lavender→deep-blue colour run from the reference). Stronger lavender step. */}
        <RadialGradient id="mwCoreHalo" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#E79AC6" stopOpacity={o(0.09)} />
          <Stop offset="52%" stopColor="#A77BD8" stopOpacity={o(0.05)} />
          <Stop offset="100%" stopColor="#7E6CD0" stopOpacity={0} />
        </RadialGradient>
        {/* H-alpha emission (rose/magenta) star-forming regions in the band */}
        <RadialGradient id="mwEmission" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#C77A8E" stopOpacity={o(0.2)} />
          <Stop offset="45%" stopColor="#B57F9C" stopOpacity={o(0.1)} />
          <Stop offset="100%" stopColor="#B57F9C" stopOpacity={0} />
        </RadialGradient>
        {/* reflection (ice blue → violet) accent near bright clusters */}
        <RadialGradient id="mwReflection" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#8AB4FF" stopOpacity={o(0.06)} />
          <Stop offset="50%" stopColor="#7B5CF6" stopOpacity={o(0.03)} />
          <Stop offset="100%" stopColor="#7B5CF6" stopOpacity={0} />
        </RadialGradient>
        {/* LAYERS 1 & 5 — dark dust (near-black, the contrast maker). DRAMATICALLY
            deeper per the Week-1 reference: the Great Rift should look like a black
            river torn through the band, not a smooth grey gradient. Near-opaque core,
            wider dark plateau (stop pushed out 48%→54%) so the rift carves harder. */}
        <RadialGradient id="mwDust" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#000003" stopOpacity={Math.min(0.99, 0.99 * boost)} />
          <Stop offset="54%" stopColor="#010208" stopOpacity={Math.min(0.86, 0.82 * boost)} />
          <Stop offset="100%" stopColor="#010208" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* LAYER 3 — soft glow binding the band. Per-point radius varies (0.78–1.32×) so
          the band's outer envelope frays into ragged edges instead of reading as a row
          of equal circles (reference: organic, not geometric). */}
      {glowPts.map((p, i) => (
        <Circle key={`g-${i}`} cx={p.x} cy={p.y} r={glowR * (0.78 + ((i * 37) % 100) / 100 * 0.54)} fill="url(#mwGlow)" />
      ))}

      {/* LAYER B — bright star clouds: pale-gold swells where the band thickens with
          stars. Above the diffuse glow, below the emission/dust so the rivers of dust
          carve through them. Per-knot radius varies so the swells read organic. */}
      {STAR_CLOUD_KNOTS.map((k, i) => {
        const p = knotPoint(k.l);
        return p ? <Circle key={`sc-${i}`} cx={p.x} cy={p.y} r={glowR * (0.46 + ((i * 53) % 100) / 100 * 0.22) * k.s} fill="url(#mwStarCloud)" /> : null;
      })}

      {/* H-alpha emission patches — rose star-forming regions woven into the band.
          Per-knot `op` keeps strong patches (Orion) a blush, not a pink spotlight. */}
      {EMISSION_KNOTS.map((k, i) => {
        const p = knotPoint(k.l);
        return p ? <Circle key={`em-${i}`} cx={p.x} cy={p.y} r={glowR * 0.55 * k.s} fill="url(#mwEmission)" opacity={k.op ?? 1} /> : null;
      })}
      {/* reflection accents — cool blue near bright clusters. Stretched ALONG the band
          (ellipse on the galactic tangent) + a small offset dab, so it reads as an
          organic brightening within the river rather than a flat circular blob on top
          (device-screenshot pass: the Pleiades patch was too round/flat). */}
      {REFLECTION_KNOTS.map((k, i) => {
        const pose = knotPose(k.l);
        if (!pose) return null;
        const R = glowR * 0.42 * k.s;
        const rad = (pose.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * R * 0.8;
        const dy = Math.sin(rad) * R * 0.8;
        return (
          <G key={`rf-${i}`}>
            <Ellipse cx={pose.x} cy={pose.y} rx={R * 1.7} ry={R * 0.6} rotation={pose.angle} originX={pose.x} originY={pose.y} fill="url(#mwReflection)" opacity={0.78} />
            <Ellipse cx={pose.x + dx} cy={pose.y + dy} rx={R * 0.75} ry={R * 0.5} rotation={pose.angle} originX={pose.x + dx} originY={pose.y + dy} fill="url(#mwReflection)" opacity={0.6} />
          </G>
        );
      })}

      {/* LAYER 4 — galactic core toward Sagittarius (rose/violet halo + bright heart) */}
      {coreP && !coreP.behind && <Circle cx={coreP.x} cy={coreP.y} r={coreR * 1.6} fill="url(#mwCoreHalo)" />}
      {coreP && !coreP.behind && <Circle cx={coreP.x} cy={coreP.y} r={coreR} fill="url(#mwCore)" />}

      {/* LAYER 2 — the clumpy star cloud */}
      {stars.map((s) => {
        if (!s.aboveHorizon) return null;
        const p = project(s.azimuthDegrees, s.altitudeDegrees);
        if (!p.onScreen) return null;
        const r = Math.max(0.8, Math.min(2.9, 6.1 - s.magnitude));
        const op = Math.max(0.42, Math.min(1, 1.15 - (s.magnitude - 4.0) / 3.2)) * Math.min(1.3, boost);
        const color = s.magnitude < 4.6 ? "#FFF1CE" : s.magnitude < 5.8 ? "#F2ECE0" : "#DCE4F2";
        return <Circle key={s.id} cx={p.x} cy={p.y} r={r} fill={color} opacity={op} />;
      })}

      {/* LAYERS 1 & 5 — dark dust ON TOP (carves the rivers, makes contrast). Four
          classes: rift (mwr), fracture tributaries (mwf), deep dark knots (mwk),
          scattered clouds (mwc) — each its own size/darkness so the band frays. */}
      {dust.map((d) => {
        if (!d.aboveHorizon) return null;
        const p = project(d.azimuthDegrees, d.altitudeDegrees);
        if (!p.onScreen) return null;
        const v = (hash(d.id) % 100) / 100;
        let base = dustBase * 0.72;
        let op = 0.82;
        if (d.id.startsWith("mwk")) { base = dustBase * 1.8; op = 1; } // Coalsack-like deep knot
        else if (d.id.startsWith("mwr")) { base = dustBase * 1.4; op = 1; } // rift — wider, blacker river
        else if (d.id.startsWith("mwf")) { base = dustBase * 0.62; op = 0.95; } // thin fracture
        // Wider size spread (0.55–1.7×) frays the dust edges so the lanes read as
        // irregular clouds, not smooth blobs.
        const r = base * (0.55 + v * 1.15);
        return <Circle key={d.id} cx={p.x} cy={p.y} r={r} fill="url(#mwDust)" opacity={op} />;
      })}
    </G>
  );
}
