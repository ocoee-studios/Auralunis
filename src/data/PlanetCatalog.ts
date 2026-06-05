export interface PlanetEntry {
  id: string;
  name: string;
  type: "star" | "planet" | "dwarf_planet";
  orderFromSun: number;
  distanceAU: number;
  diameterKm: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  moons: number;
  hasRings: boolean;
  composition: string;
  atmosphere: string;
  nakedEye: boolean;
  bestViewing: string;
  mythology: string;
  funFacts: string[];
  description: string;
}

export const planetCatalog: PlanetEntry[] = [
  {
    id: "sun", name: "Sun", type: "star", orderFromSun: 0,
    distanceAU: 0, diameterKm: 1_392_700, orbitalPeriodDays: 0,
    rotationPeriodHours: 609.12, moons: 0, hasRings: false,
    composition: "Hydrogen (73%), helium (25%), heavier elements (2%)",
    atmosphere: "Photosphere at ~5,500°C, corona reaches millions of degrees",
    nakedEye: true, bestViewing: "Daytime (never look directly without proper solar filters)",
    mythology: "Worshipped across every ancient civilization. Ra in Egypt, Helios and Apollo in Greece, Sol in Rome, Surya in India, Amaterasu in Japan.",
    funFacts: [
      "Contains 99.86% of all mass in the solar system",
      "Light takes 8 minutes 20 seconds to reach Earth",
      "About 4.6 billion years old, roughly halfway through its life",
      "Could fit 1.3 million Earths inside it",
      "Surface gravity is 28 times stronger than Earth's"
    ],
    description: "A G-type main-sequence star at the center of our solar system. It generates energy through nuclear fusion, converting 600 million tons of hydrogen into helium every second. Its magnetic field drives the 11-year solar cycle, producing sunspots, solar flares, and coronal mass ejections that can affect Earth's technology and create auroras."
  },
  {
    id: "mercury", name: "Mercury", type: "planet", orderFromSun: 1,
    distanceAU: 0.387, diameterKm: 4_880, orbitalPeriodDays: 87.97,
    rotationPeriodHours: 1407.6, moons: 0, hasRings: false,
    composition: "Iron core (75% of radius), silicate mantle and crust",
    atmosphere: "Virtually none — thin exosphere of sodium, hydrogen, helium, oxygen",
    nakedEye: true, bestViewing: "Low on the horizon just after sunset or before sunrise. Hardest naked-eye planet to spot.",
    mythology: "Named for the Roman messenger god, known for speed — fitting for the fastest-orbiting planet. Hermes in Greek mythology.",
    funFacts: [
      "A year on Mercury is only 88 Earth days",
      "Despite being closest to the Sun, Venus is hotter due to its greenhouse effect",
      "Temperature swings from -180°C at night to 430°C during the day",
      "Has been visited by only two spacecraft: Mariner 10 and MESSENGER",
      "Its iron core makes up about 75% of its radius"
    ],
    description: "The smallest planet and closest to the Sun. Mercury has no atmosphere to retain heat, causing the most extreme temperature swings in the solar system. Its heavily cratered surface resembles the Moon. Mercury's oversized iron core generates a weak but detectable magnetic field — unusual for such a small world."
  },
  {
    id: "venus", name: "Venus", type: "planet", orderFromSun: 2,
    distanceAU: 0.723, diameterKm: 12_104, orbitalPeriodDays: 224.7,
    rotationPeriodHours: 5832.5, moons: 0, hasRings: false,
    composition: "Iron core, silicate mantle, basaltic crust",
    atmosphere: "96.5% carbon dioxide, 3.5% nitrogen, sulfuric acid clouds",
    nakedEye: true, bestViewing: "Brightest object in the sky after the Sun and Moon. Visible as 'morning star' or 'evening star' near the horizon.",
    mythology: "Named for the Roman goddess of love and beauty. Aphrodite in Greek mythology. One of the most significant celestial objects in ancient cultures worldwide.",
    funFacts: [
      "Rotates backwards (retrograde) compared to most planets",
      "A day on Venus is longer than its year",
      "Surface temperature is ~465°C — hot enough to melt lead",
      "Atmospheric pressure is 90 times that of Earth",
      "Often called Earth's 'sister planet' due to similar size"
    ],
    description: "Earth's closest planetary neighbor and the hottest planet in the solar system. A runaway greenhouse effect traps heat beneath thick clouds of sulfuric acid, making the surface hotter than Mercury despite being farther from the Sun. Venus rotates so slowly and in the opposite direction that the Sun rises in the west and sets in the east. At magnitude -4.6, it's the third-brightest object in our sky."
  },
  {
    id: "earth", name: "Earth", type: "planet", orderFromSun: 3,
    distanceAU: 1.0, diameterKm: 12_742, orbitalPeriodDays: 365.25,
    rotationPeriodHours: 23.93, moons: 1, hasRings: false,
    composition: "Iron-nickel core, silicate mantle, thin rocky crust",
    atmosphere: "78% nitrogen, 21% oxygen, 1% argon and trace gases",
    nakedEye: false, bestViewing: "You're standing on it.",
    mythology: "Terra in Roman mythology, Gaia in Greek. The only planet not named after a god in Roman tradition — its name comes from Germanic and Old English words meaning 'ground.'",
    funFacts: [
      "The only known planet with liquid water on its surface",
      "Earth's magnetic field protects us from solar radiation",
      "The Moon stabilizes Earth's axial tilt, making seasons possible",
      "70.8% of the surface is covered by water",
      "The atmosphere extends about 10,000 km but 75% of its mass is in the lowest 11 km"
    ],
    description: "The third planet from the Sun and the only known world with life. Earth's liquid water, breathable atmosphere, and magnetic field create a uniquely habitable environment. The Moon — formed from a giant impact 4.5 billion years ago — stabilizes Earth's tilt and drives ocean tides. Earth's thin crust floats on a convecting mantle, driving plate tectonics that continuously reshape the surface."
  },
  {
    id: "mars", name: "Mars", type: "planet", orderFromSun: 4,
    distanceAU: 1.524, diameterKm: 6_779, orbitalPeriodDays: 687,
    rotationPeriodHours: 24.62, moons: 2, hasRings: false,
    composition: "Iron-sulfide core, silicate mantle, basaltic crust rich in iron oxide",
    atmosphere: "95% carbon dioxide, 2.7% nitrogen, 1.6% argon — very thin (~1% of Earth's pressure)",
    nakedEye: true, bestViewing: "Bright reddish-orange. Best during opposition (closest approach to Earth), which occurs every ~26 months.",
    mythology: "Named for the Roman god of war due to its blood-red color. Ares in Greek mythology. The two moons Phobos (Fear) and Deimos (Terror) are named after Ares' companions.",
    funFacts: [
      "Home to Olympus Mons — the tallest mountain in the solar system (21.9 km)",
      "Valles Marineris is a canyon system 4,000 km long",
      "A day on Mars (a 'sol') is 24 hours 37 minutes",
      "Has polar ice caps made of water and carbon dioxide ice",
      "Multiple rovers have explored its surface: Spirit, Opportunity, Curiosity, Perseverance"
    ],
    description: "The Red Planet, colored by iron oxide (rust) in its soil. Mars has the largest volcano and deepest canyon in the solar system. Evidence of ancient rivers and lakes suggests Mars once had liquid water on its surface. Today its atmosphere is too thin for liquid water, but ice exists at the poles and possibly underground. Mars is the primary target for future human exploration."
  },
  {
    id: "jupiter", name: "Jupiter", type: "planet", orderFromSun: 5,
    distanceAU: 5.203, diameterKm: 139_820, orbitalPeriodDays: 4333,
    rotationPeriodHours: 9.93, moons: 95, hasRings: true,
    composition: "Hydrogen and helium throughout — likely a rocky core 10-20x Earth's mass",
    atmosphere: "89% hydrogen, 10% helium, with ammonia clouds and the Great Red Spot",
    nakedEye: true, bestViewing: "One of the brightest planets, visible most of the year. Binoculars show the four Galilean moons.",
    mythology: "Named for the king of the Roman gods (Zeus in Greek). The Galilean moons are named for lovers of Zeus: Io, Europa, Ganymede, and Callisto.",
    funFacts: [
      "The Great Red Spot is a storm larger than Earth that has raged for at least 350 years",
      "Jupiter has at least 95 known moons",
      "Its magnetic field is 20,000 times stronger than Earth's",
      "Jupiter's gravity has protected Earth by deflecting many asteroids and comets",
      "Europa may have a subsurface ocean with more water than all of Earth's oceans combined"
    ],
    description: "The largest planet — more massive than all other planets combined. Jupiter is a gas giant with no solid surface, composed primarily of hydrogen and helium. Its rapid rotation (under 10 hours) creates powerful jet streams and the iconic banded appearance. The four Galilean moons, discovered by Galileo in 1610, were the first objects observed orbiting another planet and helped prove the heliocentric model."
  },
  {
    id: "saturn", name: "Saturn", type: "planet", orderFromSun: 6,
    distanceAU: 9.537, diameterKm: 116_460, orbitalPeriodDays: 10759,
    rotationPeriodHours: 10.66, moons: 146, hasRings: true,
    composition: "Hydrogen and helium with a rocky core — least dense planet (would float in water)",
    atmosphere: "96% hydrogen, 3% helium, with ammonia and methane clouds",
    nakedEye: true, bestViewing: "Visible as a steady golden light. A small telescope reveals the rings clearly.",
    mythology: "Named for the Roman god of agriculture and time (Kronos in Greek). Saturday is named after Saturn.",
    funFacts: [
      "Saturn's rings are made of ice and rock particles, from dust-sized to house-sized",
      "The rings extend 282,000 km but are only about 10 meters thick",
      "Saturn has 146 known moons — the most of any planet",
      "Titan, its largest moon, has lakes of liquid methane and a thick atmosphere",
      "Enceladus shoots geysers of water ice into space from a subsurface ocean"
    ],
    description: "The ringed planet. Saturn's spectacular ring system is made of countless particles of ice and rock orbiting the planet. It's the second-largest planet and, remarkably, the least dense — it would float in a bathtub large enough to hold it. Saturn's moon Titan is the only moon with a substantial atmosphere and surface liquids (methane and ethane), while Enceladus is considered one of the best candidates for extraterrestrial life."
  },
  {
    id: "uranus", name: "Uranus", type: "planet", orderFromSun: 7,
    distanceAU: 19.19, diameterKm: 50_724, orbitalPeriodDays: 30687,
    rotationPeriodHours: 17.24, moons: 28, hasRings: true,
    composition: "Water, methane, and ammonia ices around a rocky core — an 'ice giant'",
    atmosphere: "83% hydrogen, 15% helium, 2% methane (gives it its blue-green color)",
    nakedEye: false, bestViewing: "Barely visible to the naked eye under perfect conditions (mag ~5.7). Binoculars needed.",
    mythology: "Named for the Greek god of the sky, father of Kronos (Saturn) and grandfather of Zeus (Jupiter). The only planet named from Greek rather than Roman mythology.",
    funFacts: [
      "Rotates on its side — its axial tilt is 98°, likely from an ancient collision",
      "Has 13 known rings, discovered in 1977",
      "Seasons last 21 years each due to the extreme tilt",
      "Winds can reach 900 km/h",
      "Visited by only one spacecraft: Voyager 2 in 1986"
    ],
    description: "The first planet discovered by telescope (William Herschel, 1781). Uranus is an ice giant tilted almost completely on its side, likely from a massive collision early in its history. This extreme tilt means each pole gets 42 years of continuous sunlight followed by 42 years of darkness. Methane in the atmosphere absorbs red light, giving Uranus its distinctive blue-green color."
  },
  {
    id: "neptune", name: "Neptune", type: "planet", orderFromSun: 8,
    distanceAU: 30.07, diameterKm: 49_244, orbitalPeriodDays: 60190,
    rotationPeriodHours: 16.11, moons: 16, hasRings: true,
    composition: "Water, methane, and ammonia ices — classified as an 'ice giant' with Uranus",
    atmosphere: "80% hydrogen, 19% helium, 1% methane — deeper blue than Uranus",
    nakedEye: false, bestViewing: "Invisible to the naked eye (mag ~7.8). Requires binoculars or a telescope.",
    mythology: "Named for the Roman god of the sea. Its largest moon Triton is named for the son of Poseidon (Greek equivalent of Neptune).",
    funFacts: [
      "Has the strongest winds in the solar system — up to 2,100 km/h",
      "Was predicted mathematically before it was observed (1846)",
      "One Neptune year is 165 Earth years — it completed its first full orbit since discovery in 2011",
      "Triton orbits backwards (retrograde) and is likely a captured Kuiper Belt object",
      "Radiates 2.6 times more heat than it receives from the Sun"
    ],
    description: "The most distant planet, predicted by mathematics before it was seen through a telescope. Neptune's deep blue color comes from methane absorbing red light. Despite receiving very little solar energy, Neptune has the most violent weather in the solar system, with winds exceeding 2,000 km/h. Its largest moon Triton has geysers of nitrogen gas and orbits in the opposite direction of Neptune's rotation — evidence that it was captured from the Kuiper Belt."
  },
  {
    id: "pluto", name: "Pluto", type: "dwarf_planet", orderFromSun: 9,
    distanceAU: 39.48, diameterKm: 2_377, orbitalPeriodDays: 90560,
    rotationPeriodHours: 153.3, moons: 5, hasRings: false,
    composition: "Rock and nitrogen/methane/carbon monoxide ices",
    atmosphere: "Thin nitrogen with traces of methane and carbon monoxide — freezes onto the surface as it moves away from the Sun",
    nakedEye: false, bestViewing: "Requires a telescope (mag ~14). Located in the Kuiper Belt.",
    mythology: "Named for the Roman god of the underworld. Its moon Charon is named for the ferryman of the dead.",
    funFacts: [
      "Reclassified from planet to dwarf planet in 2006 by the IAU",
      "Smaller than Earth's Moon",
      "Has a heart-shaped nitrogen ice plain called Tombaugh Regio",
      "New Horizons flew past in 2015, revealing stunning surface detail",
      "Pluto and Charon are tidally locked, always showing the same face to each other"
    ],
    description: "Once the ninth planet, now classified as a dwarf planet in the Kuiper Belt. NASA's New Horizons flyby in 2015 revealed a geologically complex world with nitrogen ice plains, water ice mountains, and a thin atmosphere. Pluto and its largest moon Charon form a binary system — both orbit a point in space between them, unlike any planet-moon pair."
  }
];
