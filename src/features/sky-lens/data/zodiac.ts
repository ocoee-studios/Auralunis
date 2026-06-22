// The 12 zodiac constellations — the signs that sit along the ecliptic. This is the
// FREE layer that bridges astrology fans → real astronomy ("there's MY sign!").
// Each sign carries its stick-figure star pattern (J2000 RA hours / Dec deg + a
// magnitude for sizing), its glyph, element, Sun-transit dates, brightest star, a
// short myth, and its tropical ecliptic-longitude band (for the Sun-in-sign
// highlight + the boundary ticks). Signs are ordered Aries→Pisces so the array
// index equals the 30° ecliptic band (Aries = 0–30°, …).

export type ZodiacElement = "Fire" | "Earth" | "Air" | "Water";

export interface ZodiacStar {
  raHours: number;
  decDegrees: number;
  magnitude: number;
}

export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string; // ♈ ♉ …
  element: ZodiacElement;
  lonStart: number; // tropical ecliptic longitude where the band starts (deg)
  sunTransit: string; // "Mar 21 – Apr 19"
  brightestStar: string;
  myth: string;
  centerRaHours: number;
  centerDecDegrees: number;
  stars: ZodiacStar[];
  lines: [number, number][];
}

export const ZODIAC_SIGNS: ReadonlyArray<ZodiacSign> = [
  {
    id: "aries", name: "Aries", symbol: "♈", element: "Fire", lonStart: 0,
    sunTransit: "Mar 21 – Apr 19", brightestStar: "Hamal",
    myth: "The Ram of the Golden Fleece. Its three main stars form a simple bent line near the spring equinox point.",
    centerRaHours: 2.2, centerDecDegrees: 21,
    stars: [
      { raHours: 2.119, decDegrees: 23.46, magnitude: 2.0 }, // Hamal
      { raHours: 1.911, decDegrees: 20.81, magnitude: 2.6 }, // Sheratan
      { raHours: 1.892, decDegrees: 19.29, magnitude: 3.9 }, // Mesarthim
    ],
    lines: [[0, 1], [1, 2]],
  },
  {
    id: "taurus", name: "Taurus", symbol: "♉", element: "Earth", lonStart: 30,
    sunTransit: "Apr 20 – May 20", brightestStar: "Aldebaran",
    myth: "The Bull, with the orange eye Aldebaran and the Pleiades on its shoulder. In myth, Zeus disguised as a white bull.",
    centerRaHours: 4.6, centerDecDegrees: 19,
    stars: [
      { raHours: 4.599, decDegrees: 16.51, magnitude: 0.9 }, // Aldebaran
      { raHours: 5.438, decDegrees: 28.61, magnitude: 1.7 }, // Elnath
      { raHours: 4.329, decDegrees: 15.63, magnitude: 3.8 }, // Hyadum
      { raHours: 4.012, decDegrees: 12.49, magnitude: 3.7 }, // Prima Hyadum
    ],
    lines: [[2, 0], [0, 1], [3, 2]],
  },
  {
    id: "gemini", name: "Gemini", symbol: "♊", element: "Air", lonStart: 60,
    sunTransit: "May 21 – Jun 20", brightestStar: "Pollux",
    myth: "The Twins Castor and Pollux, inseparable brothers placed side by side in the sky forever.",
    centerRaHours: 7.3, centerDecDegrees: 24,
    stars: [
      { raHours: 7.755, decDegrees: 28.03, magnitude: 1.1 }, // Pollux
      { raHours: 7.577, decDegrees: 31.89, magnitude: 1.6 }, // Castor
      { raHours: 6.628, decDegrees: 16.40, magnitude: 1.9 }, // Alhena
      { raHours: 6.732, decDegrees: 25.13, magnitude: 3.0 }, // Mebsuta
    ],
    lines: [[1, 0], [0, 3], [3, 2]],
  },
  {
    id: "cancer", name: "Cancer", symbol: "♋", element: "Water", lonStart: 90,
    sunTransit: "Jun 21 – Jul 22", brightestStar: "Tarf",
    myth: "The Crab, the faintest zodiac sign — its dim stars cradle the Beehive Cluster at its heart.",
    centerRaHours: 8.7, centerDecDegrees: 19,
    stars: [
      { raHours: 8.275, decDegrees: 9.19, magnitude: 3.5 }, // Tarf
      { raHours: 8.745, decDegrees: 18.15, magnitude: 3.9 }, // Asellus Australis
      { raHours: 8.722, decDegrees: 21.47, magnitude: 4.7 }, // Asellus Borealis
      { raHours: 8.974, decDegrees: 11.86, magnitude: 4.3 }, // Acubens
    ],
    lines: [[0, 1], [1, 2], [1, 3]],
  },
  {
    id: "leo", name: "Leo", symbol: "♌", element: "Fire", lonStart: 120,
    sunTransit: "Jul 23 – Aug 22", brightestStar: "Regulus",
    myth: "The Lion slain by Heracles. The Sickle (a backward question mark) traces its mane around Regulus.",
    centerRaHours: 10.6, centerDecDegrees: 17,
    stars: [
      { raHours: 10.139, decDegrees: 11.97, magnitude: 1.4 }, // Regulus
      { raHours: 10.333, decDegrees: 19.84, magnitude: 2.0 }, // Algieba
      { raHours: 11.818, decDegrees: 14.57, magnitude: 2.1 }, // Denebola
      { raHours: 11.235, decDegrees: 20.52, magnitude: 2.6 }, // Zosma
      { raHours: 11.237, decDegrees: 15.43, magnitude: 3.3 }, // Chort
    ],
    lines: [[0, 1], [1, 3], [3, 4], [4, 2], [4, 0]],
  },
  {
    id: "virgo", name: "Virgo", symbol: "♍", element: "Earth", lonStart: 150,
    sunTransit: "Aug 23 – Sep 22", brightestStar: "Spica",
    myth: "The Maiden holding a sheaf of wheat, marked by the brilliant blue-white star Spica.",
    centerRaHours: 13.0, centerDecDegrees: 0,
    stars: [
      { raHours: 13.420, decDegrees: -11.16, magnitude: 1.0 }, // Spica
      { raHours: 12.694, decDegrees: -1.45, magnitude: 2.7 }, // Porrima
      { raHours: 13.036, decDegrees: 10.96, magnitude: 2.8 }, // Vindemiatrix
      { raHours: 11.845, decDegrees: 1.76, magnitude: 3.6 }, // Zavijava
    ],
    lines: [[3, 1], [1, 2], [1, 0]],
  },
  {
    id: "libra", name: "Libra", symbol: "♎", element: "Air", lonStart: 180,
    sunTransit: "Sep 23 – Oct 22", brightestStar: "Zubeneschamali",
    myth: "The Scales of balance and justice — once the claws of the neighboring Scorpion.",
    centerRaHours: 15.1, centerDecDegrees: -16,
    stars: [
      { raHours: 15.283, decDegrees: -9.38, magnitude: 2.6 }, // Zubeneschamali
      { raHours: 14.848, decDegrees: -16.04, magnitude: 2.7 }, // Zubenelgenubi
      { raHours: 15.067, decDegrees: -25.28, magnitude: 3.3 }, // Brachium
    ],
    lines: [[0, 1], [1, 2]],
  },
  {
    id: "scorpius", name: "Scorpius", symbol: "♏", element: "Water", lonStart: 210,
    sunTransit: "Oct 23 – Nov 21", brightestStar: "Antares",
    myth: "The Scorpion sent by Artemis to slay Orion — placed on opposite sides of the sky, so when one rises, the other sets.",
    centerRaHours: 16.8, centerDecDegrees: -30,
    stars: [
      { raHours: 16.490, decDegrees: -26.43, magnitude: 1.1 }, // Antares
      { raHours: 16.005, decDegrees: -22.62, magnitude: 2.3 }, // Dschubba
      { raHours: 17.560, decDegrees: -37.10, magnitude: 1.6 }, // Shaula
      { raHours: 17.622, decDegrees: -42.99, magnitude: 1.9 }, // Sargas
      { raHours: 17.708, decDegrees: -39.03, magnitude: 2.7 }, // Lesath
    ],
    lines: [[1, 0], [0, 2], [2, 4], [4, 3]],
  },
  {
    id: "sagittarius", name: "Sagittarius", symbol: "♐", element: "Fire", lonStart: 240,
    sunTransit: "Nov 22 – Dec 21", brightestStar: "Kaus Australis",
    myth: "The Archer, a centaur drawing his bow toward the heart of the galaxy. Its bright stars form the Teapot.",
    centerRaHours: 18.7, centerDecDegrees: -28,
    stars: [
      { raHours: 18.403, decDegrees: -34.38, magnitude: 1.8 }, // Kaus Australis
      { raHours: 18.921, decDegrees: -26.30, magnitude: 2.1 }, // Nunki
      { raHours: 18.350, decDegrees: -29.83, magnitude: 2.7 }, // Kaus Media
      { raHours: 18.466, decDegrees: -25.42, magnitude: 2.8 }, // Kaus Borealis
      { raHours: 19.043, decDegrees: -29.88, magnitude: 2.6 }, // Ascella
    ],
    lines: [[0, 2], [2, 3], [3, 1], [1, 4], [4, 0]],
  },
  {
    id: "capricornus", name: "Capricornus", symbol: "♑", element: "Earth", lonStart: 270,
    sunTransit: "Dec 22 – Jan 19", brightestStar: "Deneb Algedi",
    myth: "The Sea-Goat, half goat and half fish — the god Pan transformed as he fled into a river.",
    centerRaHours: 21.0, centerDecDegrees: -16,
    stars: [
      { raHours: 21.784, decDegrees: -16.13, magnitude: 2.8 }, // Deneb Algedi
      { raHours: 20.300, decDegrees: -12.51, magnitude: 3.6 }, // Algedi
      { raHours: 20.350, decDegrees: -14.78, magnitude: 3.1 }, // Dabih
      { raHours: 21.668, decDegrees: -16.66, magnitude: 4.1 }, // Nashira
    ],
    lines: [[1, 2], [2, 3], [3, 0], [0, 1]],
  },
  {
    id: "aquarius", name: "Aquarius", symbol: "♒", element: "Air", lonStart: 300,
    sunTransit: "Jan 20 – Feb 18", brightestStar: "Sadalsuud",
    myth: "The Water Bearer pouring an endless stream — Ganymede, cupbearer to the gods.",
    centerRaHours: 22.3, centerDecDegrees: -7,
    stars: [
      { raHours: 21.526, decDegrees: -5.57, magnitude: 2.9 }, // Sadalsuud
      { raHours: 22.096, decDegrees: -0.32, magnitude: 3.0 }, // Sadalmelik
      { raHours: 22.911, decDegrees: -15.82, magnitude: 3.3 }, // Skat
      { raHours: 20.794, decDegrees: -9.50, magnitude: 3.8 }, // Albali
    ],
    lines: [[3, 0], [0, 1], [1, 2]],
  },
  {
    id: "pisces", name: "Pisces", symbol: "♓", element: "Water", lonStart: 330,
    sunTransit: "Feb 19 – Mar 20", brightestStar: "Alpherg",
    myth: "Two Fish tied together by a cord — Aphrodite and Eros, who leapt into a river to escape the monster Typhon.",
    centerRaHours: 0.8, centerDecDegrees: 10,
    stars: [
      { raHours: 2.034, decDegrees: 2.76, magnitude: 3.8 }, // Alrescha (knot)
      { raHours: 1.524, decDegrees: 15.35, magnitude: 3.6 }, // Eta Psc (Alpherg)
      { raHours: 23.665, decDegrees: 5.63, magnitude: 4.0 }, // Gamma Psc
      { raHours: 23.286, decDegrees: 3.28, magnitude: 4.3 }, // Omega Psc
    ],
    lines: [[0, 1], [0, 3], [3, 2]],
  },
];

// Tropical sun sign from a calendar date (month 1-12, day) — index into ZODIAC_SIGNS.
export function signIndexForDate(month: number, day: number): number {
  // Sun enters each sign roughly on these days.
  const starts: [number, number][] = [
    [3, 21], [4, 20], [5, 21], [6, 21], [7, 23], [8, 23],
    [9, 23], [10, 23], [11, 22], [12, 22], [1, 20], [2, 19],
  ]; // Aries…Pisces start dates
  // Map: find the sign whose start ≤ date < next start.
  const order = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  for (let k = 0; k < 12; k++) {
    const [sm, sd] = starts[k];
    const [nm, nd] = starts[(k + 1) % 12];
    const afterStart = month > sm || (month === sm && day >= sd);
    const beforeNext = month < nm || (month === nm && day < nd);
    // Capricorn wraps the year boundary (Dec 22 → Jan 19).
    if (sm <= nm ? (afterStart && beforeNext) : (afterStart || beforeNext)) return order[k];
  }
  return 9; // Capricornus fallback
}
