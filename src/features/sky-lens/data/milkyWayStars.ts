import type { BrightStar } from "./brightStars";
import { galacticToEquatorial, mulberry32, gaussian, coreProx, GALACTIC_KNOTS } from "./galacticGeom";

// LAYER 2 — the star-cloud TEXTURE. ~2900 stars packed along the galactic plane, but
// CLUMPY rather than smooth: most are scattered around a set of cluster seeds (the
// named star clouds — Sagittarius, Scutum, Cygnus, Carina — plus procedural knots),
// so the band reads as mottled clusters with brightness variation, not a gradient.
// A diffuse minority fills the gaps. Brighter toward the core and the plane, with
// occasional sparkle stars. Galactic→equatorial at build time → fixed sky positions.
export const MILKY_WAY_STARS: ReadonlyArray<BrightStar> = (() => {
  const rng = mulberry32(31337);

  // Cluster seeds: the named knots dominate, plus procedural clumps along the plane.
  const seeds: { l: number; b: number; w: number; spread: number }[] = [];
  for (const k of GALACTIC_KNOTS) seeds.push({ l: k.l, b: k.b, w: k.weight * 1.6, spread: 5 + (1 - k.weight) * 6 });
  // SAGITTARIUS PILE-UP — extra tight, heavy seeds clustered on the galactic core so the
  // brightest, most granular star density sits exactly where the reference photo's core
  // glows (l≈0). Small spread → packed dots, not a smooth wash.
  for (let i = 0; i < 8; i++) {
    seeds.push({ l: gaussian(rng) * 9, b: -0.5 + gaussian(rng) * 2.2, w: 1.25, spread: 3 + rng() * 1.8 });
  }
  for (let i = 0; i < 64; i++) {
    const l = rng() * 360;
    const cp = coreProx(l);
    seeds.push({ l, b: gaussian(rng) * 5, w: 0.2 + cp * 0.6, spread: 7 + (1 - cp) * 6 });
  }
  const totalW = seeds.reduce((a, s) => a + s.w, 0);
  const pickSeed = () => {
    let r = rng() * totalW;
    for (const s of seeds) {
      r -= s.w;
      if (r <= 0) return s;
    }
    return seeds[seeds.length - 1];
  };

  const out: BrightStar[] = [];
  let guard = 0;
  while (out.length < 2900 && guard < 165000) {
    guard++;
    let l: number, b: number;
    if (rng() < 0.8) {
      // clustered — scatter around a seed (higher fraction → more irregular density,
      // granular clumps and voids instead of an even wash)
      const s = pickSeed();
      l = s.l + gaussian(rng) * s.spread;
      b = s.b + gaussian(rng) * s.spread * 0.55;
    } else {
      // diffuse — thin background spread along the whole plane, denser inward
      l = rng() * 360;
      const cp0 = coreProx(l);
      if (rng() > 0.4 + 0.6 * Math.pow(cp0, 1.3)) continue;
      b = gaussian(rng) * 9;
    }
    if (Math.abs(b) > 34) continue;
    const cp = coreProx(((l % 360) + 360) % 360);
    const { raHours, decDeg } = galacticToEquatorial(l, b);
    // brightness: brighter toward the core and the mid-plane; occasional sparkle knots.
    // Stronger core bias (0.9→1.1) so Sagittarius reads brighter as well as denser.
    let magnitude = 5.0 + rng() * 2.2 - cp * 1.1 - Math.max(0, 1 - Math.abs(b) / 10) * 0.5;
    if (rng() < 0.05) magnitude -= 1.2;
    out.push({ id: `mw${out.length}`, raHours, decDegrees: decDeg, magnitude, con: "" });
  }
  return out;
})();
