import type { BrightStar } from "./brightStars";

// A procedural STAR CLOUD for the Milky Way — ~1800 faint stars packed along the
// galactic plane so the band reads as a real river of suns, not a gray gradient.
// Distribution (in galactic coords): longitude with density rising toward the core
// (l≈0, Sagittarius), latitude a Gaussian about the plane (most stars within ±10°),
// magnitude fainter than the naked-eye catalog and brighter toward the core. Each
// is converted galactic→equatorial at build time so it sits at a FIXED sky position
// and tracks correctly as the phone pans (same RA/Dec pipeline as every other star).

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
// Galactic → equatorial (J2000) rotation constants (match ephemeris/MilkyWay.ts).
const RA_NGP = 192.85948;
const DEC_NGP = 27.12825;
const L_NCP = 122.93192;

function galacticToEquatorial(lDeg: number, bDeg: number): { raHours: number; decDeg: number } {
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

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// coreProx: 1 at the galactic centre (l=0/360), 0 at the anticentre (l=180).
function coreProx(lDeg: number): number {
  return (1 + Math.cos(lDeg * D2R)) / 2;
}

export const MILKY_WAY_STARS: ReadonlyArray<BrightStar> = (() => {
  const rng = mulberry32(31337);
  const out: BrightStar[] = [];
  let i = 0;
  while (out.length < 1800 && i < 60000) {
    i++;
    const l = rng() * 360;
    const cp = coreProx(l);
    // Rejection-sample longitude so the core region is much denser.
    if (rng() > 0.35 + 0.65 * Math.pow(cp, 1.4)) continue;
    // Gaussian galactic latitude (Box–Muller); tighter near the core (thinner disk).
    const u1 = Math.max(1e-6, rng());
    const u2 = rng();
    const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const sigma = 7 + (1 - cp) * 5; // 7°–12° spread
    const b = g * sigma;
    if (Math.abs(b) > 32) continue;
    const { raHours, decDeg } = galacticToEquatorial(l, b);
    // Fainter than the bright catalog; brighter toward the core.
    const magnitude = 5.2 + rng() * 2.0 - cp * 1.0 - Math.max(0, (1 - Math.abs(b) / 10)) * 0.4;
    out.push({ id: `mw${out.length}`, raHours, decDegrees: decDeg, magnitude, con: "" });
  }
  return out;
})();
