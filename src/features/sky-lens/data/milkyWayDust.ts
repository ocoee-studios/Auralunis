import type { BrightStar } from "./brightStars";
import { galacticToEquatorial, mulberry32, gaussian, coreProx } from "./galacticGeom";

// LAYERS 1 & 5 — the DUST. The single most important layer: the dark rivers that turn
// "fog" into "galaxy". Two populations, both at fixed sky positions (rendered as dark
// feathered blobs that occlude the star cloud, creating real black-against-bright
// contrast):
//   • the GREAT RIFT — a dense dark lane running the bright summer band (galactic
//     longitude ~340°→100°), sitting slightly north of the plane, that visually
//     splits the Milky Way from Cygnus down toward Sagittarius.
//   • scattered DARK CLOUDS along the inner plane for organic mottling.
// The `id` prefix (mwr = rift, mwc = cloud) tells the renderer the base blob size.
// magnitude is unused (positions only).
export const MILKY_WAY_DUST: ReadonlyArray<BrightStar> = (() => {
  const rng = mulberry32(99173);
  const out: BrightStar[] = [];

  // Great Rift — the dominant dark river.
  for (let i = 0; i < 96; i++) {
    const l = -20 + rng() * 120; // 340°…100°
    const b = 1.2 + gaussian(rng) * 3.2; // hugs just north of the plane
    if (Math.abs(b) > 12) continue;
    const { raHours, decDeg } = galacticToEquatorial(((l % 360) + 360) % 360, b);
    out.push({ id: `mwr${out.length}`, raHours, decDegrees: decDeg, magnitude: 0, con: "" });
  }

  // Scattered dark clouds — denser toward the bright inner galaxy.
  let guard = 0;
  while (out.filter((d) => d.id.startsWith("mwc")).length < 80 && guard < 8000) {
    guard++;
    const l = rng() * 360;
    const cp = coreProx(l);
    if (rng() > 0.28 + 0.72 * cp) continue; // most dust lives toward the core side
    const b = gaussian(rng) * 5;
    if (Math.abs(b) > 16) continue;
    const { raHours, decDeg } = galacticToEquatorial(l, b);
    out.push({ id: `mwc${out.length}`, raHours, decDegrees: decDeg, magnitude: 0, con: "" });
  }
  return out;
})();
