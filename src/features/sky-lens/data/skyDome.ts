import type { BrightStar } from "./brightStars";

// Deterministic PRNG (mulberry32) so the background field is the SAME every launch
// — stars shouldn't jump around between sessions.
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ~3500 faint background stars spread uniformly over the celestial sphere (full
// 0–24h RA, −90°…+90° Dec) — the naked eye sees ~4,500, so a dense dome is what
// makes every direction read as real sky instead of a sparse scatter of dots.
// Same RA/Dec→horizontal pipeline as the bright catalog.
export const DOME_STARS: ReadonlyArray<BrightStar> = (() => {
  const rng = mulberry32(20260621);
  const out: BrightStar[] = [];
  for (let i = 0; i < 3500; i++) {
    const raHours = rng() * 24;
    // Uniform-on-sphere declination: dec = asin(2u - 1).
    const decDegrees = (Math.asin(2 * rng() - 1) * 180) / Math.PI;
    const magnitude = 3.2 + rng() * 2.8; // 3.2–6.0 (shifted brighter)
    out.push({ id: `dome${i}`, raHours, decDegrees, magnitude, con: "" });
  }
  return out;
})();
