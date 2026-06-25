import React from "react";
import { Circle, Defs, G, RadialGradient, Stop } from "react-native-svg";
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
const EMISSION_KNOTS = [
  { l: 6, s: 1.0 },    // Lagoon / Trifid (Sagittarius)
  { l: 16, s: 0.85 },  // Eagle / Omega (Serpens/Sagittarius)
  { l: 49, s: 0.6 },   // Scutum star cloud
  { l: 78, s: 0.95 },  // Cygnus — North America / Pelican
  { l: 207, s: 0.9 },  // Orion / Rosette
  { l: 287, s: 0.85 }, // Carina
];
const REFLECTION_KNOTS = [
  { l: 166, s: 0.7 },  // Pleiades direction
  { l: 84, s: 0.5 },   // Cygnus reflection accent
];

export function MilkyWayLayer({ band, stars, dust, project, box, nightMode, boost }: Props) {
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

  const o = (v: number) => Math.min(0.6, v * boost); // bold pass: let the band actually glow
  const glowR = Math.max(90, box.height * 0.42); // huge, soft
  const coreR = Math.max(130, box.height * 0.44);
  const dustBase = Math.max(42, box.height * 0.14);

  // galactic core glow (Sagittarius)
  const gc = band.galacticCenter;
  const coreP = gc.aboveHorizon ? project(gc.azimuthDegrees, gc.altitudeDegrees) : null;

  // Project the band point nearest a given galactic longitude (for emission/reflection
  // knots). Returns null if below horizon / behind / off-screen.
  const knotPoint = (l: number) => {
    const idx = Math.round((((l % 360) + 360) % 360) / 4) % band.center.length;
    const pt = band.center[idx];
    if (!pt || !pt.aboveHorizon) return null;
    const p = project(pt.azimuthDegrees, pt.altitudeDegrees);
    return p.behind || !p.onScreen ? null : p;
  };

  // tiny deterministic hash for per-blob size variation
  const hash = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  };

  return (
    <G>
      <Defs>
        {/* LAYER 3 — warm galactic glow — subtle warmth, not visible circles */}
        <RadialGradient id="mwGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#E8C77E" stopOpacity={o(0.1)} />
          <Stop offset="50%" stopColor="#C99A52" stopOpacity={o(0.05)} />
          <Stop offset="100%" stopColor="#C99A52" stopOpacity={0} />
        </RadialGradient>
        {/* LAYER 4 — galactic core: bright gold heart fading through amber to a rose
            edge (the Sagittarius drama). */}
        <RadialGradient id="mwCore" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFE9B0" stopOpacity={o(0.3)} />
          <Stop offset="28%" stopColor="#F0C888" stopOpacity={o(0.17)} />
          <Stop offset="62%" stopColor="#E08AA8" stopOpacity={o(0.06)} />
          <Stop offset="100%" stopColor="#E08AA8" stopOpacity={0} />
        </RadialGradient>
        {/* wide rose→violet halo cradling the core */}
        <RadialGradient id="mwCoreHalo" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#E08AA8" stopOpacity={o(0.05)} />
          <Stop offset="55%" stopColor="#9A6CC0" stopOpacity={o(0.025)} />
          <Stop offset="100%" stopColor="#9A6CC0" stopOpacity={0} />
        </RadialGradient>
        {/* H-alpha emission (rose/magenta) star-forming regions in the band */}
        <RadialGradient id="mwEmission" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#E06888" stopOpacity={o(0.17)} />
          <Stop offset="45%" stopColor="#D870A0" stopOpacity={o(0.09)} />
          <Stop offset="100%" stopColor="#D870A0" stopOpacity={0} />
        </RadialGradient>
        {/* reflection (ice blue → violet) accent near bright clusters */}
        <RadialGradient id="mwReflection" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#8AB4FF" stopOpacity={o(0.06)} />
          <Stop offset="50%" stopColor="#7B5CF6" stopOpacity={o(0.03)} />
          <Stop offset="100%" stopColor="#7B5CF6" stopOpacity={0} />
        </RadialGradient>
        {/* LAYERS 1 & 5 — dark dust (near-black, the contrast maker). Darker per
            feedback: a deeper Great Rift reads as dust, not a smooth glow. */}
        <RadialGradient id="mwDust" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#010208" stopOpacity={Math.min(0.5, 0.42 * boost)} />
          <Stop offset="48%" stopColor="#02040C" stopOpacity={Math.min(0.28, 0.22 * boost)} />
          <Stop offset="100%" stopColor="#02040C" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* LAYER 3 — soft glow binding the band */}
      {glowPts.map((p, i) => (
        <Circle key={`g-${i}`} cx={p.x} cy={p.y} r={glowR} fill="url(#mwGlow)" />
      ))}

      {/* H-alpha emission patches — rose star-forming regions woven into the band */}
      {EMISSION_KNOTS.map((k, i) => {
        const p = knotPoint(k.l);
        return p ? <Circle key={`em-${i}`} cx={p.x} cy={p.y} r={glowR * 0.55 * k.s} fill="url(#mwEmission)" /> : null;
      })}
      {/* reflection accents — cool blue near bright clusters */}
      {REFLECTION_KNOTS.map((k, i) => {
        const p = knotPoint(k.l);
        return p ? <Circle key={`rf-${i}`} cx={p.x} cy={p.y} r={glowR * 0.45 * k.s} fill="url(#mwReflection)" /> : null;
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
        const op = Math.max(0.45, Math.min(1, 1.15 - (s.magnitude - 4.0) / 3.2)) * Math.min(1.25, boost);
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
        let base = dustBase * 0.7;
        let op = 0.72;
        if (d.id.startsWith("mwk")) { base = dustBase * 1.5; op = 1; } // Coalsack-like deep knot
        else if (d.id.startsWith("mwr")) { base = dustBase * 1.1; op = 1; } // rift
        else if (d.id.startsWith("mwf")) { base = dustBase * 0.58; op = 0.82; } // thin fracture
        const r = base * (0.7 + v * 0.8);
        return <Circle key={d.id} cx={p.x} cy={p.y} r={r} fill="url(#mwDust)" opacity={op} />;
      })}
    </G>
  );
}
