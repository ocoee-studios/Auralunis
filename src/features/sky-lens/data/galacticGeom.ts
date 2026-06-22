// Shared galactic-coordinate geometry for the Milky Way star + dust catalogs.
// Everything is generated in galactic (l, b) — where the band is just "b ≈ 0" — and
// rotated to equatorial (J2000) so each point sits at a FIXED sky position and tracks
// correctly through the same RA/Dec→horizontal pipeline as every other star.

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
// Galactic → equatorial (J2000) rotation constants.
const RA_NGP = 192.85948;
const DEC_NGP = 27.12825;
const L_NCP = 122.93192;

export function galacticToEquatorial(lDeg: number, bDeg: number): { raHours: number; decDeg: number } {
  const l = lDeg * D2R;
  const b = bDeg * D2R;
  const decN = DEC_NGP * D2R;
  const lcp = L_NCP * D2R;
  const dec = Math.asin(Math.sin(decN) * Math.sin(b) + Math.cos(decN) * Math.cos(b) * Math.cos(lcp - l));
  const y = Math.cos(b) * Math.sin(lcp - l);
  const x = Math.cos(decN) * Math.sin(b) - Math.sin(decN) * Math.cos(b) * Math.cos(lcp - l);
  let ra = (RA_NGP * D2R + Math.atan2(y, x)) * R2D;
  ra = ((ra % 360) + 360) % 360;
  return { raHours: ra / 15, decDeg: dec * R2D };
}

// Deterministic PRNG — the galaxy must look identical every launch.
export function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Standard-normal sample (Box–Muller) from a [0,1) rng.
export function gaussian(rng: () => number): number {
  const u1 = Math.max(1e-6, rng());
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// 1 at the galactic centre (l=0/360), 0 at the anticentre (l=180).
export function coreProx(lDeg: number): number {
  return (1 + Math.cos(lDeg * D2R)) / 2;
}

// The bright knots of the summer/winter band — where the star clouds pile up. Each
// is a galactic longitude with a weight (how dominant the knot is). The renderer and
// the star generator both lean on these so density and glow agree.
export const GALACTIC_KNOTS: ReadonlyArray<{ l: number; b: number; weight: number }> = [
  { l: 0, b: -1, weight: 1.0 },   // Sagittarius — the galactic core
  { l: 27, b: 0, weight: 0.8 },   // Scutum star cloud
  { l: 80, b: 1, weight: 0.7 },   // Cygnus
  { l: 287, b: -1, weight: 0.7 }, // Carina
  { l: 206, b: -3, weight: 0.35 } // Orion / Monoceros (anticentre — fainter, but the showpiece region)
];
