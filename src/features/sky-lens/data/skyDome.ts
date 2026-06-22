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

// ~1200 faint background stars spread uniformly over the celestial sphere. These
// fill the sky *between* the named bright stars so Sky Lens reads as a real, rich
// starfield instead of a sparse scatter of dots. Same RA/Dec→horizontal pipeline
// as the bright catalog, so they sit correctly and move with the sky.
export const DOME_STARS: ReadonlyArray<BrightStar> = (() => {
  const rng = mulberry32(20260621);
  const out: BrightStar[] = [];
  for (let i = 0; i < 1200; i++) {
    const raHours = rng() * 24;
    // Uniform-on-sphere declination: dec = asin(2u - 1).
    const decDegrees = (Math.asin(2 * rng() - 1) * 180) / Math.PI;
    const magnitude = 3.8 + rng() * 2.7; // 3.8–6.5 (naked-eye faint)
    out.push({ id: `dome${i}`, raHours, decDegrees, magnitude, con: "" });
  }
  return out;
})();
