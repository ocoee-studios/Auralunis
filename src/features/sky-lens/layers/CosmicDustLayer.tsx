import React, { useMemo } from "react";
import { Circle, Defs, G, RadialGradient, Stop } from "react-native-svg";
import type { MilkyWayBand } from "../ephemeris/MilkyWay";
import type { ProjectFn } from "../SkyLensVisual";
import type { TwinkleTarget } from "../TwinkleOverlay";

// SHIMMERING STARDUST — the sky's living atmosphere.
//
// This layer used to be a screen-fixed random speck field sitting under a dark
// #0A0806 radial wash. Two problems. The wash read as a brown filter over the sky
// (it fought the background art, and SkyVignette already frames the scene). And
// screen-fixed specks slide against the sky as you pan, so they read as dirt on the
// lens rather than dust in space.
//
// Both are fixed by anchoring the dust to the SKY instead of the screen:
//
//   * BAND DUST concentrates along the REAL galactic plane. `band.center` is the
//     galactic equator (b=0), already resolved to horizontal coords every frame by
//     computeMilkyWay() — it was being computed and thrown away. We project it and
//     hang dust off it, so the shimmer hugs the true Milky Way and correctly thins
//     when you point away from it.
//
//     This is deliberately NOT a screen-space diagonal. PremiumSkyBloomLayer used to
//     fake the band that way and it painted stripes in every direction, even when
//     pointed at the galactic pole. That bug is not coming back.
//
//   * AMBIENT DUST is seeded in az/alt across the sphere, so the sky is never an
//     empty void — it just breathes far more faintly than the band.
//
// Silver AND gold, not gold alone: the old field was warm-only, which is exactly what
// made it read brown. The platinum motes are what make it read as *stardust*.
//
// Everything here is STATIC SVG. Animating SVG props crashes on RN 0.81 + Reanimated
// 4 + react-native-svg 15 (see TwinkleOverlay). The living sparkle comes from
// stardustGlints() at the bottom, which hands a few motes to TwinkleOverlay — the
// View-based, crash-safe animator that already runs one shared clock.

const SILVER = ["#FFFFFF", "#EAF0FF", "#F6F9FF", "#DCE6FA"];
const GOLD = ["#FFF1C8", "#E8C77E", "#D9A84E", "#FFF8E7"];

// Galactic longitude → relative dust density. The band is not uniform: it swells
// toward the Sagittarius core (l≈0) and the Cygnus star cloud (l≈80), and thins
// toward the anticentre (l≈180). Weighting the dust this way is what makes the
// shimmer feel like it belongs to the galaxy rather than sprinkled over it.
function bandDensity(lDeg: number): number {
  const rad = (lDeg * Math.PI) / 180;
  const core = Math.cos(rad) * 0.5 + 0.5; // 1 at the core, 0 at the anticentre
  const cygnus = Math.exp(-(((lDeg - 80) / 34) ** 2)) * 0.55;
  const carina = Math.exp(-(((lDeg - 287) / 30) ** 2)) * 0.4;
  return 0.3 + core * 0.7 + cygnus + carina;
}

type BandMote = {
  t: number; // fractional index into band.center
  perp: number; // -1..1 — offset across the band, in band-thickness units
  r: number;
  o: number;
  color: string;
};

// Seeded once at module load — the dust field is a fixed constellation of motes, not
// a per-frame random spray (which would boil as the sky re-renders).
const BAND_MOTES: BandMote[] = (() => {
  let s = 0x9e3779b9 >>> 0;
  const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  const out: BandMote[] = [];
  let guard = 0;
  while (out.length < 110 && guard < 6000) {
    guard += 1;
    const lDeg = rng() * 360;
    // Rejection-sample against the density curve so motes cluster in the bright star
    // clouds instead of spreading evenly around the ring.
    if (rng() > bandDensity(lDeg) / 1.7) continue;
    // Two summed uniforms ≈ a soft triangular falloff, so the band has a dense spine
    // that feathers outward rather than a hard-edged stripe.
    const perp = (rng() + rng() - 1) * (0.55 + rng() * 0.45);
    const silver = rng() > 0.42;
    out.push({
      t: lDeg / 4, // computeMilkyWay samples every 4° → index = l / 4
      perp,
      r: 0.4 + rng() * 0.95,
      o: 0.1 + rng() * 0.26,
      color: (silver ? SILVER : GOLD)[Math.floor(rng() * 4)],
    });
  }
  return out;
})();

// Faint dust everywhere else, seeded in SKY coords so it pans with the stars.
const AMBIENT_MOTES = (() => {
  let s = 0x5f3759df >>> 0;
  const rng = () => ((s = (s * 1103515245 + 12345) >>> 0) / 0xffffffff);
  return Array.from({ length: 46 }, () => {
    const silver = rng() > 0.5;
    return {
      az: rng() * 360,
      // Biased upward — the murk near the horizon is HorizonGlowLayer's job.
      alt: Math.sqrt(rng()) * 88,
      r: 0.35 + rng() * 0.7,
      o: 0.05 + rng() * 0.1,
      color: (silver ? SILVER : GOLD)[Math.floor(rng() * 4)],
    };
  });
})();

// A handful of brighter motes on the band spine, handed to TwinkleOverlay so the dust
// actually shimmers. Small count on purpose: a luxury glimmer, not a glitter field.
const GLINT_MOTES = (() => {
  let s = 0x27d4eb2f >>> 0;
  const rng = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff);
  const out: { t: number; perp: number; size: number; color: string; offset: number }[] = [];
  let guard = 0;
  while (out.length < 14 && guard < 2000) {
    guard += 1;
    const lDeg = rng() * 360;
    if (rng() > bandDensity(lDeg) / 1.7) continue;
    out.push({
      t: lDeg / 4,
      perp: (rng() + rng() - 1) * 0.5,
      size: 1.5 + rng() * 1.6,
      color: rng() > 0.45 ? "#FFFDF5" : "#E8C77E",
      offset: rng(),
    });
  }
  return out;
})();

type ProjectedBand = Array<{ x: number; y: number } | null>;

// Project the galactic equator ONCE per render (91 points) and reuse it for every
// mote, rather than re-projecting per mote.
function projectBand(band: MilkyWayBand, project: ProjectFn, fullSphere: boolean): ProjectedBand {
  return band.center.map((p) => {
    if (!fullSphere && !p.aboveHorizon) return null;
    const q = project(p.azimuthDegrees, p.altitudeDegrees);
    if (q.behind) return null;
    return { x: q.x, y: q.y };
  });
}

// Resolve a mote's (t, perp) against the projected band: find its position along the
// band, then push it sideways along the band's screen-space normal. That sideways
// spread is the band's atmospheric THICKNESS — it carries no astronomical claim, so
// px units are correct for it. The mote's position ALONG the band is fully sky-locked.
function resolveMote(
  proj: ProjectedBand,
  t: number,
  perp: number,
  thickness: number
): { x: number; y: number } | null {
  const n = proj.length;
  const i0 = Math.floor(t) % n;
  const i1 = (i0 + 1) % n;
  const a = proj[i0];
  const b = proj[i1];
  if (!a || !b) return null;

  const f = t - Math.floor(t);
  const x = a.x + (b.x - a.x) * f;
  const y = a.y + (b.y - a.y) * f;

  let tx = b.x - a.x;
  let ty = b.y - a.y;
  const len = Math.hypot(tx, ty);
  // Adjacent samples that project to nearly the same point, or fly apart across the
  // projection seam, give a meaningless tangent — drop the mote rather than fling it.
  if (!Number.isFinite(len) || len < 0.01 || len > 400) return null;
  tx /= len;
  ty /= len;

  return { x: x + -ty * perp * thickness, y: y + tx * perp * thickness };
}

export function CosmicDustLayer({
  box,
  project,
  band,
  nightMode,
  fullSphere = false,
}: {
  box: { width: number; height: number };
  project: ProjectFn;
  band: MilkyWayBand;
  nightMode: boolean;
  fullSphere?: boolean;
}) {
  const thickness = box.height * 0.085;

  const motes = useMemo(() => {
    if (nightMode || box.width <= 0 || box.height <= 0) return null;
    const proj = projectBand(band, project, fullSphere);

    const bandDots: Array<{ x: number; y: number; r: number; o: number; color: string }> = [];
    for (const m of BAND_MOTES) {
      const p = resolveMote(proj, m.t, m.perp, thickness);
      if (!p) continue;
      // Cull generously off-screen so a band running past the edge costs nothing.
      if (p.x < -40 || p.x > box.width + 40 || p.y < -40 || p.y > box.height + 40) continue;
      // Dust thins as it drifts off the spine.
      const falloff = 1 - Math.min(1, Math.abs(m.perp)) * 0.55;
      bandDots.push({ x: p.x, y: p.y, r: m.r, o: m.o * falloff, color: m.color });
    }

    const ambientDots: Array<{ x: number; y: number; r: number; o: number; color: string }> = [];
    for (const m of AMBIENT_MOTES) {
      const q = project(m.az, m.alt);
      if (q.behind || !q.onScreen) continue;
      ambientDots.push({ x: q.x, y: q.y, r: m.r, o: m.o, color: m.color });
    }

    return { bandDots, ambientDots };
  }, [band, project, box.width, box.height, nightMode, fullSphere, thickness]);

  if (!motes) return null;

  return (
    <G pointerEvents="none">
      <Defs>
        {/* Soft platinum bloom for the larger motes — silver-led, gold-warmed. */}
        <RadialGradient id="stardustGlint" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.16" />
          <Stop offset="40%" stopColor="#E8C77E" stopOpacity="0.06" />
          <Stop offset="100%" stopColor="#D9A84E" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* No dark wash. The old #0A0806 radial veil is gone — it muddied the sky, and
          SkyVignette already owns the cinematic corner falloff. */}

      {motes.ambientDots.map((d, i) => (
        <Circle key={`amb-${i}`} cx={d.x} cy={d.y} r={d.r} fill={d.color} opacity={d.o} />
      ))}
      {motes.bandDots.map((d, i) => (
        <Circle key={`band-${i}`} cx={d.x} cy={d.y} r={d.r} fill={d.color} opacity={d.o} />
      ))}
      {/* A few soft blooms give the band depth without adding particle count. */}
      {motes.bandDots.slice(0, 12).map((d, i) => (
        <Circle key={`bloom-${i}`} cx={d.x} cy={d.y} r={d.r * 5.5} fill="url(#stardustGlint)" opacity={0.5} />
      ))}
    </G>
  );
}

// The animated half of the stardust. TwinkleOverlay is the only crash-safe animator in
// this stack (View opacity, one shared clock), so rather than stand up a second
// animation system inside the SVG canvas, we hand it a few band motes and let the
// existing clock shimmer them. Sky-locked, via the same band projection as above.
export function stardustGlints(
  band: MilkyWayBand,
  project: ProjectFn,
  box: { width: number; height: number },
  fullSphere: boolean
): TwinkleTarget[] {
  if (box.width <= 0 || box.height <= 0) return [];
  const proj = projectBand(band, project, fullSphere);
  const thickness = box.height * 0.085;
  const out: TwinkleTarget[] = [];

  for (let i = 0; i < GLINT_MOTES.length; i += 1) {
    const m = GLINT_MOTES[i];
    const p = resolveMote(proj, m.t, m.perp, thickness);
    if (!p) continue;
    if (p.x < 0 || p.x > box.width || p.y < 0 || p.y > box.height) continue;
    out.push({
      id: `stardust-${i}`,
      x: p.x,
      y: p.y,
      size: m.size,
      color: m.color,
      offset: m.offset,
      // Ranked after every real star, so dust can never crowd an actual star out of
      // the twinkle budget.
      magnitude: 90 + i,
    });
  }
  return out;
}
