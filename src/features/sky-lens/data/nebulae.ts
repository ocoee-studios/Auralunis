// The deep-sky catalog — the clouds of color that make the sky magical. 18 famous
// objects across emission/reflection nebulae, galaxies, globular clusters,
// planetary nebulae, and supernova remnants. J2000 RA (hours) / Dec (degrees).
//
// `radius` is the BASE glow radius in px; the renderer feathers an outer haze out
// to ~3× this, so the on-screen "spread" ≈ radius × 3 (e.g. Orion base 27 ≈ 80px).
// `coreColor`/`hazeColor` drive a multi-stop radial gradient. Galaxies render
// elliptical (`elongated` + `angle`).

export type NebulaType = "emission" | "reflection" | "galaxy" | "cluster" | "planetary" | "supernova";

export interface Nebula {
  id: string;
  catalog: string; // "M42", "NGC 3372"
  name: string;
  raHours: number;
  decDegrees: number;
  type: NebulaType;
  con: string; // abbreviation
  constellation: string; // full name (info card)
  coreColor: string;
  hazeColor: string;
  radius: number; // base glow radius (px); spread ≈ radius × 3
  elongated?: boolean; // galaxies render as an ellipse
  angle?: number; // ellipse rotation (deg)
  distanceLy: string;
  visibility: "Naked eye" | "Binoculars" | "Telescope";
  description: string;
  bestMonths: string;
}

const PINK = "#E05080"; // emission core
const ORANGE = "#D06848"; // emission haze
const GAL_CORE = "#FFF1D0"; // galaxy warm-white core
const GAL_HAZE = "#AEC0E8"; // galaxy silver-blue edge
const GOLD_CORE = "#FFE0A0"; // cluster core
const GOLD_HAZE = "#E0B060"; // cluster haze
const TEAL_CORE = "#6FE0C8"; // planetary core
const TEAL_HAZE = "#3AA0B0"; // planetary haze

export const NEBULAE: ReadonlyArray<Nebula> = [
  // ── Emission nebulae — glowing hydrogen ───────────────────────────────────
  { id: "m42", catalog: "M42", name: "Orion Nebula", raHours: 5.588, decDegrees: -5.39, type: "emission", con: "Ori", constellation: "Orion", coreColor: PINK, hazeColor: ORANGE, radius: 27, distanceLy: "1,344 ly", visibility: "Naked eye",
    description: "A vast stellar nursery in Orion's sword, where new suns are igniting inside glowing curtains of hydrogen.", bestMonths: "December–March" },
  { id: "m8", catalog: "M8", name: "Lagoon Nebula", raHours: 18.06, decDegrees: -24.38, type: "emission", con: "Sgr", constellation: "Sagittarius", coreColor: PINK, hazeColor: ORANGE, radius: 20, distanceLy: "4,100 ly", visibility: "Naked eye",
    description: "A rose-colored cloud split by a dark lagoon of dust, drifting in the heart of the Milky Way.", bestMonths: "June–September" },
  { id: "m16", catalog: "M16", name: "Eagle Nebula", raHours: 18.313, decDegrees: -13.78, type: "emission", con: "Ser", constellation: "Serpens", coreColor: PINK, hazeColor: ORANGE, radius: 17, distanceLy: "7,000 ly", visibility: "Binoculars",
    description: "Home of the Pillars of Creation — towering columns of gas where stars are being born.", bestMonths: "June–September" },
  { id: "ngc3372", catalog: "NGC 3372", name: "Carina Nebula", raHours: 10.752, decDegrees: -59.87, type: "emission", con: "Car", constellation: "Carina", coreColor: PINK, hazeColor: ORANGE, radius: 23, distanceLy: "7,500 ly", visibility: "Naked eye",
    description: "One of the largest nebulae in the sky, wrapped around the doomed, eruptive star Eta Carinae.", bestMonths: "January–April" },
  { id: "ngc7000", catalog: "NGC 7000", name: "North America Nebula", raHours: 20.97, decDegrees: 44.5, type: "emission", con: "Cyg", constellation: "Cygnus", coreColor: "#E0506A", hazeColor: "#C85050", radius: 23, distanceLy: "1,600 ly", visibility: "Binoculars",
    description: "A glowing cloud shaped uncannily like the continent it's named for, set beside bright Deneb.", bestMonths: "July–October" },
  { id: "m17", catalog: "M17", name: "Swan Nebula", raHours: 18.346, decDegrees: -16.18, type: "emission", con: "Sgr", constellation: "Sagittarius", coreColor: PINK, hazeColor: ORANGE, radius: 15, distanceLy: "5,000 ly", visibility: "Binoculars",
    description: "Also called the Omega — a luminous swan floating on a river of star-forming gas.", bestMonths: "June–September" },
  { id: "m20", catalog: "M20", name: "Trifid Nebula", raHours: 18.045, decDegrees: -23.03, type: "emission", con: "Sgr", constellation: "Sagittarius", coreColor: PINK, hazeColor: "#6090FF", radius: 15, distanceLy: "5,200 ly", visibility: "Binoculars",
    description: "A rare pairing: a pink emission cloud cleft into three, hugged by a cool blue reflection halo.", bestMonths: "June–September" },
  { id: "ngc2237", catalog: "NGC 2237", name: "Rosette Nebula", raHours: 6.525, decDegrees: 4.95, type: "emission", con: "Mon", constellation: "Monoceros", coreColor: "#E0506A", hazeColor: "#C04048", radius: 18, distanceLy: "5,000 ly", visibility: "Binoculars",
    description: "A deep-red flower of gas with a cluster of hot young stars blooming at its center.", bestMonths: "December–March" },

  // ── Reflection nebula — scattered starlight ───────────────────────────────
  { id: "m45", catalog: "M45", name: "Pleiades", raHours: 3.79, decDegrees: 24.12, type: "reflection", con: "Tau", constellation: "Taurus", coreColor: "#9FC0FF", hazeColor: "#6090FF", radius: 20, distanceLy: "444 ly", visibility: "Naked eye",
    description: "The Seven Sisters, wrapped in icy-blue nebulosity — the dust they happen to be drifting through.", bestMonths: "November–February" },

  // ── Galaxies — island universes ───────────────────────────────────────────
  { id: "m31", catalog: "M31", name: "Andromeda Galaxy", raHours: 0.712, decDegrees: 41.27, type: "galaxy", con: "And", constellation: "Andromeda", coreColor: GAL_CORE, hazeColor: GAL_HAZE, radius: 33, elongated: true, angle: 35, distanceLy: "2.5M ly", visibility: "Naked eye",
    description: "The nearest great spiral and the most distant thing visible to the unaided eye — a trillion suns.", bestMonths: "September–December" },
  { id: "m33", catalog: "M33", name: "Triangulum Galaxy", raHours: 1.564, decDegrees: 30.66, type: "galaxy", con: "Tri", constellation: "Triangulum", coreColor: GAL_CORE, hazeColor: GAL_HAZE, radius: 23, elongated: true, angle: 20, distanceLy: "2.7M ly", visibility: "Binoculars",
    description: "A face-on pinwheel, the third-largest galaxy in our Local Group, faint and sprawling.", bestMonths: "September–December" },
  { id: "m51", catalog: "M51", name: "Whirlpool Galaxy", raHours: 13.498, decDegrees: 47.2, type: "galaxy", con: "CVn", constellation: "Canes Venatici", coreColor: GAL_CORE, hazeColor: GAL_HAZE, radius: 13, elongated: true, angle: 10, distanceLy: "31M ly", visibility: "Telescope",
    description: "A classic spiral caught mid-dance with a smaller companion galaxy clinging to one arm.", bestMonths: "March–June" },

  // ── Globular clusters — ancient star-cities ───────────────────────────────
  { id: "m13", catalog: "M13", name: "Hercules Cluster", raHours: 16.695, decDegrees: 36.46, type: "cluster", con: "Her", constellation: "Hercules", coreColor: GOLD_CORE, hazeColor: GOLD_HAZE, radius: 13, distanceLy: "22,200 ly", visibility: "Binoculars",
    description: "A swarm of three hundred thousand ancient stars, packed into a glowing golden ball.", bestMonths: "May–August" },
  { id: "m22", catalog: "M22", name: "Sagittarius Cluster", raHours: 18.606, decDegrees: -23.9, type: "cluster", con: "Sgr", constellation: "Sagittarius", coreColor: GOLD_CORE, hazeColor: GOLD_HAZE, radius: 15, distanceLy: "10,600 ly", visibility: "Naked eye",
    description: "One of the brightest globulars in the sky, a gold concentration near the galactic core.", bestMonths: "June–September" },

  // ── Planetary nebulae — dying sun-like stars ──────────────────────────────
  { id: "m27", catalog: "M27", name: "Dumbbell Nebula", raHours: 19.994, decDegrees: 22.72, type: "planetary", con: "Vul", constellation: "Vulpecula", coreColor: TEAL_CORE, hazeColor: TEAL_HAZE, radius: 12, distanceLy: "1,360 ly", visibility: "Binoculars",
    description: "A teal-green shell of gas flung off by a dying star — a glimpse of our own Sun's far future.", bestMonths: "July–October" },
  { id: "m57", catalog: "M57", name: "Ring Nebula", raHours: 18.893, decDegrees: 33.03, type: "planetary", con: "Lyr", constellation: "Lyra", coreColor: TEAL_CORE, hazeColor: TEAL_HAZE, radius: 8, distanceLy: "2,300 ly", visibility: "Telescope",
    description: "A perfect smoke ring of glowing gas, exhaled by a star in its final breaths.", bestMonths: "July–October" },

  // ── Supernova remnants — stellar wreckage ─────────────────────────────────
  { id: "m1", catalog: "M1", name: "Crab Nebula", raHours: 5.575, decDegrees: 22.01, type: "supernova", con: "Tau", constellation: "Taurus", coreColor: "#F0A050", hazeColor: "#D06030", radius: 10, distanceLy: "6,500 ly", visibility: "Telescope",
    description: "The shattered remains of a star that exploded in 1054 AD — recorded by astronomers worldwide.", bestMonths: "December–February" },
  { id: "ngc6960", catalog: "NGC 6960", name: "Veil Nebula", raHours: 20.76, decDegrees: 30.71, type: "supernova", con: "Cyg", constellation: "Cygnus", coreColor: "#70E0C8", hazeColor: "#40A0B0", radius: 20, distanceLy: "2,400 ly", visibility: "Telescope",
    description: "Delicate teal filaments — the blast wave of a star that died ten thousand years ago, still expanding.", bestMonths: "July–October" }
];
