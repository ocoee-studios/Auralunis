import type { BrightStar } from "./brightStars";
import { galacticToEquatorial, mulberry32, gaussian, coreProx } from "./galacticGeom";

// LAYERS 1 & 5 — the DUST, rebuilt to feel ORGANIC rather than a tidy band. Four
// populations, all at fixed sky positions (rendered as dark feathered blobs that
// occlude the star cloud → real black-against-bright contrast + structure). The
// `id` prefix tells the renderer the blob's size/darkness class:
//   • mwr — the GREAT RIFT: a dark river whose centre MEANDERS with longitude and
//     whose WIDTH swells near the core and thins toward Cygnus (asymmetry, not a tube)
//   • mwf — FRACTURES: tributary lanes that branch off the rift at an angle and veer
//     to higher latitude, so the rift frays instead of running clean
//   • mwk — dark KNOTS: dense Coalsack-like dark nebulae (a few big, deep blobs)
//   • mwc — scattered dark CLOUDS for general mottling
// magnitude is unused (positions only).
const D2R = Math.PI / 180;

export const MILKY_WAY_DUST: ReadonlyArray<BrightStar> = (() => {
  const rng = mulberry32(99173);
  const out: BrightStar[] = [];
  const push = (prefix: string, lDeg: number, bDeg: number) => {
    if (Math.abs(bDeg) > 24) return;
    const { raHours, decDeg } = galacticToEquatorial(((lDeg % 360) + 360) % 360, bDeg);
    out.push({ id: `${prefix}${out.length}`, raHours, decDegrees: decDeg, magnitude: 0, con: "" });
  };

  // The rift's meandering centre-line + width as functions of galactic longitude.
  const riftCenter = (l: number) => 1.0 + 2.6 * Math.sin((l + 25) * D2R) + (l > 60 && l < 100 ? 2.2 : 0);
  const riftWidth = (l: number) => 1.8 + 2.4 * Math.max(0, Math.cos(l * D2R)); // fat at the core, thin toward Cygnus

  // 1. GREAT RIFT — meandering, width-modulated dark river (denser + darker).
  for (let i = 0; i < 160; i++) {
    const l = -22 + rng() * 134; // ~338°…112°
    const b = riftCenter(l) + gaussian(rng) * riftWidth(l);
    push("mwr", l, b);
  }

  // 2. FRACTURES — tributary lanes peeling off the rift at an angle. More of them, at
  // finer longitude spacing, so the rift frays into many branching dark filaments
  // rather than a few clean ones (the organic, astrophotography look).
  const branches = [
    { l: 6, dir: 1 }, { l: 14, dir: -1 }, { l: 18, dir: 1 }, { l: 24, dir: -1 }, { l: 33, dir: 1 }, { l: 42, dir: -1 },
    { l: 48, dir: 1 }, { l: 54, dir: -1 }, { l: 60, dir: 1 }, { l: 74, dir: -1 }, { l: 82, dir: 1 }, { l: 88, dir: 1 },
    { l: 96, dir: -1 }, { l: -10, dir: 1 }, { l: -2, dir: -1 },
  ];
  for (const br of branches) {
    const steps = 7 + Math.floor(rng() * 6);
    const slope = (0.5 + rng() * 0.7) * br.dir; // °b per step
    const lDrift = (rng() < 0.5 ? 1 : -1) * (0.8 + rng() * 1.2);
    for (let s = 1; s <= steps; s++) {
      const l = br.l + s * lDrift + gaussian(rng) * 0.8;
      const b = riftCenter(br.l) + slope * s * 1.7 + gaussian(rng) * 1.0;
      push("mwf", l, b);
    }
  }

  // 3. DARK KNOTS — dense Coalsack-like clumps (a handful of deep, big blobs).
  const knots = [
    { l: 3, b: -0.5 }, { l: 15, b: 0 }, { l: 27, b: 1 }, { l: 52, b: 0.5 }, { l: 67, b: 1.5 },
    { l: 80, b: 2.5 }, { l: -14, b: 2 },
  ];
  for (const k of knots) {
    const n = 5 + Math.floor(rng() * 3);
    for (let i = 0; i < n; i++) push("mwk", k.l + gaussian(rng) * 2.4, k.b + gaussian(rng) * 1.6);
  }

  // 4. scattered dark clouds — denser toward the bright inner galaxy (finer mottling).
  let guard = 0;
  while (out.filter((d) => d.id.startsWith("mwc")).length < 150 && guard < 18000) {
    guard++;
    const l = rng() * 360;
    if (rng() > 0.26 + 0.74 * coreProx(l)) continue;
    push("mwc", l, gaussian(rng) * 5);
  }
  return out;
})();
