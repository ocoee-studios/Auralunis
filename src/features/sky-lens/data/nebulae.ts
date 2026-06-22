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
  { id: "m42", catalog: "M42", name: "Orion Nebula", raHours: 5.588, decDegrees: -5.39, type: "emission", con: "Ori", constellation: "Orion", coreColor: "#F25CC0", hazeColor: "#6A86E6", radius: 27, distanceLy: "1,344 ly", visibility: "Naked eye",
    description: "A vast stellar nursery in Orion's sword, where new suns are igniting inside glowing curtains of hydrogen.", bestMonths: "December–March" },
  { id: "m8", catalog: "M8", name: "Lagoon Nebula", raHours: 18.06, decDegrees: -24.38, type: "emission", con: "Sgr", constellation: "Sagittarius", coreColor: PINK, hazeColor: ORANGE, radius: 20, distanceLy: "4,100 ly", visibility: "Naked eye",
    description: "A rose-colored cloud split by a dark lagoon of dust, drifting in the heart of the Milky Way.", bestMonths: "June–September" },
  { id: "m16", catalog: "M16", name: "Eagle Nebula", raHours: 18.313, decDegrees: -13.78, type: "emission", con: "Ser", constellation: "Serpens", coreColor: PINK, hazeColor: ORANGE, radius: 17, distanceLy: "7,000 ly", visibility: "Binoculars",
    description: "Home of the Pillars of Creation — towering columns of gas where stars are being born.", bestMonths: "June–September" },
  { id: "ngc3372", catalog: "NGC 3372", name: "Carina Nebula", raHours: 10.752, decDegrees: -59.87, type: "emission", con: "Car", constellation: "Carina", coreColor: PINK, hazeColor: ORANGE, radius: 23, distanceLy: "7,500 ly", visibility: "Naked eye",
    description: "One of the largest nebulae in the sky, wrapped around the doomed, eruptive star Eta Carinae.", bestMonths: "January–April" },
  { id: "ngc7000", catalog: "NGC 7000", name: "North America Nebula", raHours: 20.97, decDegrees: 44.5, type: "emission", con: "Cyg", constellation: "Cygnus", coreColor: "#FF6A5A", hazeColor: "#D84444", radius: 23, distanceLy: "1,600 ly", visibility: "Binoculars",
    description: "A glowing cloud shaped uncannily like the continent it's named for, set beside bright Deneb.", bestMonths: "July–October" },
  { id: "m17", catalog: "M17", name: "Swan Nebula", raHours: 18.346, decDegrees: -16.18, type: "emission", con: "Sgr", constellation: "Sagittarius", coreColor: PINK, hazeColor: ORANGE, radius: 15, distanceLy: "5,000 ly", visibility: "Binoculars",
    description: "Also called the Omega — a luminous swan floating on a river of star-forming gas.", bestMonths: "June–September" },
  { id: "m20", catalog: "M20", name: "Trifid Nebula", raHours: 18.045, decDegrees: -23.03, type: "emission", con: "Sgr", constellation: "Sagittarius", coreColor: PINK, hazeColor: "#6090FF", radius: 15, distanceLy: "5,200 ly", visibility: "Binoculars",
    description: "A rare pairing: a pink emission cloud cleft into three, hugged by a cool blue reflection halo.", bestMonths: "June–September" },
  { id: "ngc2237", catalog: "NGC 2237", name: "Rosette Nebula", raHours: 6.525, decDegrees: 4.95, type: "emission", con: "Mon", constellation: "Monoceros", coreColor: "#FF7FB0", hazeColor: "#E85C92", radius: 18, distanceLy: "5,000 ly", visibility: "Binoculars",
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
  { id: "m1", catalog: "M1", name: "Crab Nebula", raHours: 5.575, decDegrees: 22.01, type: "supernova", con: "Tau", constellation: "Taurus", coreColor: "#FFC457", hazeColor: "#E08A2E", radius: 10, distanceLy: "6,500 ly", visibility: "Telescope",
    description: "The shattered remains of a star that exploded in 1054 AD — recorded by astronomers worldwide.", bestMonths: "December–February" },
  { id: "ngc6960", catalog: "NGC 6960", name: "Veil Nebula", raHours: 20.76, decDegrees: 30.71, type: "supernova", con: "Cyg", constellation: "Cygnus", coreColor: "#5CC6FF", hazeColor: "#2E7AD8", radius: 20, distanceLy: "2,400 ly", visibility: "Telescope",
    description: "Delicate teal filaments — the blast wave of a star that died ten thousand years ago, still expanding.", bestMonths: "July–October" },

  // ── Sky gap fillers — every direction should have color ────────────────────

  // Autumn (RA 0-3h)
  { id: "ngc253", catalog: "NGC 253", name: "Sculptor Galaxy", raHours: 0.792, decDegrees: -25.29, type: "galaxy", con: "Scl", constellation: "Sculptor", coreColor: "#D0D8E8", hazeColor: "#A0A8C0", radius: 18, elongated: true, angle: 52, distanceLy: "11.4 million ly", visibility: "Binoculars",
    description: "A silver sliver of light — a starburst galaxy seen nearly edge-on, churning with newborn stars.", bestMonths: "October–December" },
  { id: "m77", catalog: "M77", name: "Cetus A", raHours: 2.711, decDegrees: -0.01, type: "galaxy", con: "Cet", constellation: "Cetus", coreColor: "#C0C8E0", hazeColor: "#9098B0", radius: 12, distanceLy: "47 million ly", visibility: "Telescope",
    description: "A Seyfert galaxy with an intensely active nucleus — a supermassive black hole feeding voraciously.", bestMonths: "October–January" },

  // Winter extras (RA 3-6h)
  { id: "ngc2024", catalog: "NGC 2024", name: "Flame Nebula", raHours: 5.679, decDegrees: -1.85, type: "emission", con: "Ori", constellation: "Orion", coreColor: "#F0A050", hazeColor: "#D08030", radius: 14, distanceLy: "1,350 ly", visibility: "Telescope",
    description: "A curtain of fire next to Alnitak — dark dust lanes carve the glow into flickering tongues of flame.", bestMonths: "December–February" },
  { id: "ic434", catalog: "IC 434", name: "Horsehead Nebula", raHours: 5.681, decDegrees: -2.46, type: "emission", con: "Ori", constellation: "Orion", coreColor: "#D06878", hazeColor: "#A04858", radius: 12, distanceLy: "1,500 ly", visibility: "Telescope",
    description: "The most famous silhouette in the sky — a dark horse's head rearing against a curtain of glowing hydrogen.", bestMonths: "December–February" },

  // Late winter gap (RA 6-9h)
  { id: "m44", catalog: "M44", name: "Beehive Cluster", raHours: 8.672, decDegrees: 19.67, type: "cluster", con: "Cnc", constellation: "Cancer", coreColor: "#E8D890", hazeColor: "#C0B060", radius: 22, distanceLy: "577 ly", visibility: "Naked eye",
    description: "A swarm of golden stars visible to the naked eye — ancient observers called it the Manger.", bestMonths: "February–May" },
  { id: "m46", catalog: "M46", name: "Puppis Cluster", raHours: 7.697, decDegrees: -14.82, type: "cluster", con: "Pup", constellation: "Puppis", coreColor: "#D4C890", hazeColor: "#B0A868", radius: 16, distanceLy: "5,400 ly", visibility: "Binoculars",
    description: "A rich scattering of faint stars with a planetary nebula hiding inside.", bestMonths: "January–March" },

  // Spring gap (RA 9-12h)
  { id: "m65", catalog: "M65", name: "Leo Triplet", raHours: 11.315, decDegrees: 13.09, type: "galaxy", con: "Leo", constellation: "Leo", coreColor: "#C0C8D8", hazeColor: "#9098B0", radius: 16, elongated: true, angle: 170, distanceLy: "35 million ly", visibility: "Telescope",
    description: "Three galaxies in a cosmic conversation — Leo's famous group, visible in one eyepiece.", bestMonths: "March–May" },
  { id: "m104", catalog: "M104", name: "Sombrero Galaxy", raHours: 12.667, decDegrees: -11.62, type: "galaxy", con: "Vir", constellation: "Virgo", coreColor: "#D0D0E0", hazeColor: "#A0A0B8", radius: 16, elongated: true, angle: 90, distanceLy: "31 million ly", visibility: "Telescope",
    description: "A bright bulge bisected by a dark dust lane — it really does look like a hat floating in space.", bestMonths: "March–June" },

  // Spring/Summer gap (RA 12-15h)
  { id: "m87", catalog: "M87", name: "Virgo A", raHours: 12.514, decDegrees: 12.39, type: "galaxy", con: "Vir", constellation: "Virgo", coreColor: "#D0D8E8", hazeColor: "#A0A8C0", radius: 16, distanceLy: "53 million ly", visibility: "Telescope",
    description: "Home to the first black hole ever photographed — at the heart of the Virgo Cluster.", bestMonths: "March–June" },
  { id: "ngc5128", catalog: "NGC 5128", name: "Centaurus A", raHours: 13.424, decDegrees: -43.02, type: "galaxy", con: "Cen", constellation: "Centaurus", coreColor: "#C8C0D8", hazeColor: "#9890A8", radius: 20, elongated: true, angle: 35, distanceLy: "12 million ly", visibility: "Binoculars",
    description: "A peculiar galaxy bisected by a dramatic dust lane — the nearest radio galaxy.", bestMonths: "April–July" },
  { id: "ngc5139", catalog: "NGC 5139", name: "Omega Centauri", raHours: 13.447, decDegrees: -47.48, type: "cluster", con: "Cen", constellation: "Centaurus", coreColor: "#E8D898", hazeColor: "#C0B068", radius: 24, distanceLy: "17,090 ly", visibility: "Naked eye",
    description: "Ten million stars — the largest globular cluster in our galaxy, possibly a captured dwarf galaxy core.", bestMonths: "April–July" },
  { id: "m3", catalog: "M3", name: "Canes Venatici Cluster", raHours: 13.703, decDegrees: 28.38, type: "cluster", con: "CVn", constellation: "Canes Venatici", coreColor: "#D8C880", hazeColor: "#B0A060", radius: 16, distanceLy: "33,900 ly", visibility: "Binoculars",
    description: "A perfect sphere of half a million ancient stars — one of the finest globulars in the northern sky.", bestMonths: "April–July" },

  // Summer extras (RA 15-18h)
  { id: "m4", catalog: "M4", name: "Scorpius Cluster", raHours: 16.393, decDegrees: -26.53, type: "cluster", con: "Sco", constellation: "Scorpius", coreColor: "#D8C070", hazeColor: "#B09848", radius: 16, distanceLy: "7,200 ly", visibility: "Binoculars",
    description: "The closest globular cluster to Earth — a golden ball right next to blazing Antares.", bestMonths: "June–August" },
  { id: "ngc6231", catalog: "NGC 6231", name: "Scorpius Jewel Box", raHours: 16.904, decDegrees: -41.83, type: "cluster", con: "Sco", constellation: "Scorpius", coreColor: "#90B8FF", hazeColor: "#6890D0", radius: 18, distanceLy: "5,900 ly", visibility: "Binoculars",
    description: "Blue-white diamond stars in the Scorpion's tail — young, hot, and dazzlingly bright.", bestMonths: "June–August" },

  // Deep summer extra
  { id: "m11", catalog: "M11", name: "Wild Duck Cluster", raHours: 18.851, decDegrees: -6.27, type: "cluster", con: "Sct", constellation: "Scutum", coreColor: "#D8C870", hazeColor: "#B0A050", radius: 14, distanceLy: "6,120 ly", visibility: "Binoculars",
    description: "Thousands of stars in a V-formation — it really does look like a flock of ducks in flight.", bestMonths: "July–September" },

  // Autumn rising (RA 21-24h)
  { id: "m15", catalog: "M15", name: "Pegasus Cluster", raHours: 21.499, decDegrees: 12.17, type: "cluster", con: "Peg", constellation: "Pegasus", coreColor: "#D8C068", hazeColor: "#B09848", radius: 16, distanceLy: "33,600 ly", visibility: "Binoculars",
    description: "One of the densest globulars known — its core may harbor a rare intermediate-mass black hole.", bestMonths: "August–November" },
  { id: "ngc7293", catalog: "NGC 7293", name: "Helix Nebula", raHours: 22.494, decDegrees: -20.84, type: "planetary", con: "Aqr", constellation: "Aquarius", coreColor: "#50C8B8", hazeColor: "#308880", radius: 22, distanceLy: "655 ly", visibility: "Binoculars",
    description: "The Eye of God — a vast ring of glowing gas. The closest large planetary nebula. It stares back.", bestMonths: "August–November" },
  { id: "ngc104", catalog: "NGC 104", name: "47 Tucanae", raHours: 0.401, decDegrees: -72.08, type: "cluster", con: "Tuc", constellation: "Tucana", coreColor: "#E0C878", hazeColor: "#B8A050", radius: 20, distanceLy: "13,000 ly", visibility: "Naked eye",
    description: "A blazing ball near the Small Magellanic Cloud — the second-finest globular in the entire sky.", bestMonths: "October–December" },
  { id: "m2", catalog: "M2", name: "Aquarius Cluster", raHours: 21.558, decDegrees: -0.82, type: "cluster", con: "Aqr", constellation: "Aquarius", coreColor: "#D0B870", hazeColor: "#A89050", radius: 14, distanceLy: "37,500 ly", visibility: "Binoculars",
    description: "A tight golden sphere of 150,000 ancient stars orbiting our galaxy.", bestMonths: "August–November" }
];
