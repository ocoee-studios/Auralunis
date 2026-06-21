// Curated constellation stick-figure catalog for the Sky Lens overlay.
//
// ~28 of the most recognizable IAU constellations. Each figure is self-contained:
// `stars` holds its vertices as J2000 equatorial coordinates (RA hours / Dec deg),
// and `lines` connects them by index. Coordinates are hand-verified for the bright
// figure stars; this is the curated set, expandable to all 88 later.
//
// `season` is the rough best-viewing season (N. hemisphere) shown in the tap card.

export interface ConstellationStar {
  raHours: number;
  decDegrees: number;
}

export interface ConstellationLine {
  id: string;
  name: string;
  season: string;
  myth: string;
  stars: ConstellationStar[];
  lines: [number, number][];
}

export const CONSTELLATION_LINES: ReadonlyArray<ConstellationLine> = [
  {
    id: "orion",
    name: "Orion",
    season: "Winter",
    myth: "The Hunter, belt of three stars facing Taurus the Bull.",
    stars: [
      { raHours: 5.9195, decDegrees: 7.407 },   // 0 Betelgeuse
      { raHours: 5.4188, decDegrees: 6.350 },   // 1 Bellatrix
      { raHours: 5.5856, decDegrees: 9.934 },   // 2 Meissa
      { raHours: 5.5334, decDegrees: -0.299 },  // 3 Mintaka
      { raHours: 5.6036, decDegrees: -1.202 },  // 4 Alnilam
      { raHours: 5.6794, decDegrees: -1.943 },  // 5 Alnitak
      { raHours: 5.7959, decDegrees: -9.670 },  // 6 Saiph
      { raHours: 5.2423, decDegrees: -8.202 }   // 7 Rigel
    ],
    lines: [[0, 1], [3, 4], [4, 5], [0, 5], [1, 3], [5, 6], [3, 7], [0, 2], [1, 2]]
  },
  {
    id: "ursa-major",
    name: "Ursa Major",
    season: "Spring",
    myth: "The Great Bear; its tail forms the Big Dipper that points to Polaris.",
    stars: [
      { raHours: 11.0621, decDegrees: 61.751 }, // 0 Dubhe
      { raHours: 11.0307, decDegrees: 56.383 }, // 1 Merak
      { raHours: 11.8972, decDegrees: 53.695 }, // 2 Phecda
      { raHours: 12.2575, decDegrees: 57.033 }, // 3 Megrez
      { raHours: 12.9004, decDegrees: 55.960 }, // 4 Alioth
      { raHours: 13.3988, decDegrees: 54.925 }, // 5 Mizar
      { raHours: 13.7923, decDegrees: 49.313 }  // 6 Alkaid
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]]
  },
  {
    id: "ursa-minor",
    name: "Ursa Minor",
    season: "Year-round (N)",
    myth: "The Little Bear; Polaris marks the end of its handle and true north.",
    stars: [
      { raHours: 2.5302, decDegrees: 89.264 },  // 0 Polaris
      { raHours: 14.8451, decDegrees: 74.156 }, // 1 Kochab
      { raHours: 15.3455, decDegrees: 71.834 }, // 2 Pherkad
      { raHours: 17.5369, decDegrees: 86.586 }, // 3 Yildun
      { raHours: 16.7660, decDegrees: 82.037 }, // 4 Epsilon
      { raHours: 15.7344, decDegrees: 77.794 }, // 5 Zeta
      { raHours: 16.2917, decDegrees: 75.755 }  // 6 Eta
    ],
    lines: [[0, 3], [3, 4], [4, 5], [5, 1], [1, 2], [2, 6], [6, 5]]
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    season: "Autumn",
    myth: "The vain Queen; a bright W (or M) circling the pole opposite the Dipper.",
    stars: [
      { raHours: 0.1530, decDegrees: 59.150 },  // 0 Caph
      { raHours: 0.6751, decDegrees: 56.537 },  // 1 Schedar
      { raHours: 0.9451, decDegrees: 60.717 },  // 2 Cih
      { raHours: 1.4303, decDegrees: 60.235 },  // 3 Ruchbah
      { raHours: 1.9067, decDegrees: 63.670 }   // 4 Segin
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]]
  },
  {
    id: "cygnus",
    name: "Cygnus",
    season: "Summer",
    myth: "The Swan flying down the Milky Way; also the Northern Cross.",
    stars: [
      { raHours: 20.6905, decDegrees: 45.280 }, // 0 Deneb
      { raHours: 20.3705, decDegrees: 40.257 }, // 1 Sadr
      { raHours: 20.7704, decDegrees: 33.970 }, // 2 Gienah
      { raHours: 19.7495, decDegrees: 45.131 }, // 3 Fawaris (delta)
      { raHours: 19.5121, decDegrees: 27.960 }  // 4 Albireo
    ],
    lines: [[0, 1], [1, 4], [1, 2], [1, 3]]
  },
  {
    id: "lyra",
    name: "Lyra",
    season: "Summer",
    myth: "The Lyre of Orpheus; brilliant Vega anchors a small parallelogram.",
    stars: [
      { raHours: 18.6156, decDegrees: 38.784 }, // 0 Vega
      { raHours: 18.8345, decDegrees: 33.363 }, // 1 Sheliak
      { raHours: 18.9824, decDegrees: 32.690 }, // 2 Sulafat
      { raHours: 18.7461, decDegrees: 37.605 }, // 3 Zeta
      { raHours: 18.9087, decDegrees: 36.899 }  // 4 Delta
    ],
    lines: [[0, 3], [0, 4], [3, 1], [1, 2], [2, 4]]
  },
  {
    id: "aquila",
    name: "Aquila",
    season: "Summer",
    myth: "The Eagle of Zeus; Altair flanked by Tarazed and Alshain.",
    stars: [
      { raHours: 19.8464, decDegrees: 8.868 },  // 0 Altair
      { raHours: 19.7709, decDegrees: 10.613 }, // 1 Tarazed
      { raHours: 19.9219, decDegrees: 6.407 },  // 2 Alshain
      { raHours: 19.4250, decDegrees: 3.115 },  // 3 Delta
      { raHours: 19.0905, decDegrees: 13.863 }, // 4 Zeta
      { raHours: 20.1882, decDegrees: -0.821 }  // 5 Theta
    ],
    lines: [[1, 0], [0, 2], [1, 4], [0, 3], [3, 5]]
  },
  {
    id: "leo",
    name: "Leo",
    season: "Spring",
    myth: "The Lion; the Sickle traces his mane, Regulus his heart.",
    stars: [
      { raHours: 10.1395, decDegrees: 11.967 }, // 0 Regulus
      { raHours: 11.8177, decDegrees: 14.572 }, // 1 Denebola
      { raHours: 10.3328, decDegrees: 19.842 }, // 2 Algieba
      { raHours: 11.2351, decDegrees: 20.524 }, // 3 Zosma
      { raHours: 11.2372, decDegrees: 15.430 }, // 4 Chertan
      { raHours: 10.2782, decDegrees: 23.417 }, // 5 Adhafera
      { raHours: 9.8794, decDegrees: 26.007 },  // 6 Rasalas
      { raHours: 9.7641, decDegrees: 23.774 },  // 7 Algenubi
      { raHours: 10.1222, decDegrees: 16.763 }  // 8 Eta Leonis
    ],
    lines: [[0, 8], [8, 2], [2, 5], [5, 6], [6, 7], [2, 3], [3, 1], [1, 4], [4, 0]]
  },
  {
    id: "gemini",
    name: "Gemini",
    season: "Winter",
    myth: "The Twins Castor and Pollux, heads crowning two parallel bodies.",
    stars: [
      { raHours: 7.5767, decDegrees: 31.888 },  // 0 Castor
      { raHours: 7.7553, decDegrees: 28.026 },  // 1 Pollux
      { raHours: 6.6285, decDegrees: 16.399 },  // 2 Alhena
      { raHours: 6.7323, decDegrees: 25.131 },  // 3 Mebsuta
      { raHours: 6.3826, decDegrees: 22.514 },  // 4 Tejat
      { raHours: 7.0686, decDegrees: 20.570 },  // 5 Mekbuda
      { raHours: 7.3354, decDegrees: 21.982 },  // 6 Wasat
      { raHours: 6.2479, decDegrees: 22.507 }   // 7 Propus
    ],
    lines: [[0, 1], [0, 3], [3, 4], [4, 7], [1, 6], [6, 5], [5, 2]]
  },
  {
    id: "taurus",
    name: "Taurus",
    season: "Winter",
    myth: "The Bull charging Orion; the Hyades V and Aldebaran form his face.",
    stars: [
      { raHours: 4.5987, decDegrees: 16.509 },  // 0 Aldebaran
      { raHours: 5.4382, decDegrees: 28.608 },  // 1 Elnath
      { raHours: 4.4767, decDegrees: 19.180 },  // 2 Ain
      { raHours: 4.0112, decDegrees: 12.490 },  // 3 Lambda
      { raHours: 5.6275, decDegrees: 21.143 }   // 4 Zeta
    ],
    lines: [[3, 0], [0, 2], [0, 1], [0, 4]]
  },
  {
    id: "canis-major",
    name: "Canis Major",
    season: "Winter",
    myth: "The Greater Dog of Orion, led by Sirius, brightest of all night stars.",
    stars: [
      { raHours: 6.7525, decDegrees: -16.716 }, // 0 Sirius
      { raHours: 6.3783, decDegrees: -17.956 }, // 1 Mirzam
      { raHours: 7.1399, decDegrees: -26.393 }, // 2 Wezen
      { raHours: 6.9770, decDegrees: -28.972 }, // 3 Adhara
      { raHours: 7.4014, decDegrees: -29.303 }  // 4 Aludra
    ],
    lines: [[0, 1], [0, 2], [2, 3], [2, 4]]
  },
  {
    id: "canis-minor",
    name: "Canis Minor",
    season: "Winter",
    myth: "The Lesser Dog; just Procyon and Gomeisa beside the Milky Way.",
    stars: [
      { raHours: 7.6550, decDegrees: 5.225 },   // 0 Procyon
      { raHours: 7.4527, decDegrees: 8.289 }    // 1 Gomeisa
    ],
    lines: [[0, 1]]
  },
  {
    id: "scorpius",
    name: "Scorpius",
    season: "Summer",
    myth: "The Scorpion that slew Orion; red Antares burns at its heart.",
    stars: [
      { raHours: 16.4901, decDegrees: -26.432 }, // 0 Antares
      { raHours: 16.0056, decDegrees: -22.622 }, // 1 Dschubba
      { raHours: 16.0906, decDegrees: -19.805 }, // 2 Acrab
      { raHours: 15.9809, decDegrees: -26.114 }, // 3 Pi
      { raHours: 16.8361, decDegrees: -34.293 }, // 4 Larawag
      { raHours: 17.6219, decDegrees: -42.998 }, // 5 Sargas
      { raHours: 17.5601, decDegrees: -37.104 }, // 6 Shaula
      { raHours: 17.5126, decDegrees: -37.296 }, // 7 Lesath
      { raHours: 17.7081, decDegrees: -39.030 }, // 8 Girtab
      { raHours: 16.5984, decDegrees: -28.216 }  // 9 Tau
    ],
    lines: [[2, 1], [1, 3], [1, 0], [0, 9], [9, 4], [4, 8], [8, 6], [6, 7], [8, 5]]
  },
  {
    id: "sagittarius",
    name: "Sagittarius",
    season: "Summer",
    myth: "The Archer; its brightest stars trace the unmistakable Teapot.",
    stars: [
      { raHours: 18.4029, decDegrees: -34.385 }, // 0 Kaus Australis
      { raHours: 18.3499, decDegrees: -29.828 }, // 1 Kaus Media
      { raHours: 18.4661, decDegrees: -25.421 }, // 2 Kaus Borealis
      { raHours: 18.9211, decDegrees: -26.297 }, // 3 Nunki
      { raHours: 19.0436, decDegrees: -29.880 }, // 4 Ascella
      { raHours: 18.0966, decDegrees: -30.424 }, // 5 Alnasl
      { raHours: 18.7460, decDegrees: -26.991 }, // 6 Phi
      { raHours: 19.1156, decDegrees: -27.670 }  // 7 Tau
    ],
    lines: [[5, 1], [1, 0], [1, 2], [2, 6], [6, 3], [3, 7], [7, 4], [4, 0], [6, 1]]
  },
  {
    id: "bootes",
    name: "Boötes",
    season: "Spring",
    myth: "The Herdsman; a kite of stars rooted at golden Arcturus.",
    stars: [
      { raHours: 14.2610, decDegrees: 19.182 },  // 0 Arcturus
      { raHours: 14.7498, decDegrees: 27.074 },  // 1 Izar
      { raHours: 14.5341, decDegrees: 38.308 },  // 2 Seginus
      { raHours: 15.0322, decDegrees: 40.391 },  // 3 Nekkar
      { raHours: 13.9114, decDegrees: 18.398 },  // 4 Muphrid
      { raHours: 15.2582, decDegrees: 33.315 }   // 5 Delta
    ],
    lines: [[0, 1], [1, 5], [5, 3], [3, 2], [2, 0], [0, 4]]
  },
  {
    id: "corona-borealis",
    name: "Corona Borealis",
    season: "Summer",
    myth: "The Northern Crown; a delicate arc set with the jewel Alphecca.",
    stars: [
      { raHours: 15.5781, decDegrees: 26.715 }, // 0 Alphecca
      { raHours: 15.5580, decDegrees: 31.359 }, // 1 Theta
      { raHours: 15.4636, decDegrees: 29.106 }, // 2 Beta
      { raHours: 15.7128, decDegrees: 26.296 }, // 3 Gamma
      { raHours: 15.8255, decDegrees: 26.068 }, // 4 Delta
      { raHours: 15.9572, decDegrees: 26.878 }  // 5 Epsilon
    ],
    lines: [[1, 2], [2, 0], [0, 3], [3, 4], [4, 5]]
  },
  {
    id: "crux",
    name: "Crux",
    season: "Autumn (S)",
    myth: "The Southern Cross; smallest constellation, pointing to the south pole.",
    stars: [
      { raHours: 12.4433, decDegrees: -63.099 }, // 0 Acrux
      { raHours: 12.7953, decDegrees: -59.689 }, // 1 Mimosa
      { raHours: 12.5194, decDegrees: -57.113 }, // 2 Gacrux
      { raHours: 12.2525, decDegrees: -58.749 }  // 3 Imai (delta)
    ],
    lines: [[0, 2], [1, 3]]
  },
  {
    id: "centaurus",
    name: "Centaurus",
    season: "Spring (S)",
    myth: "The Centaur; its feet are the Pointers aimed at the Southern Cross.",
    stars: [
      { raHours: 14.6601, decDegrees: -60.834 }, // 0 Rigil Kentaurus
      { raHours: 14.0637, decDegrees: -60.373 }, // 1 Hadar
      { raHours: 12.6919, decDegrees: -48.960 }, // 2 Muhlifain
      { raHours: 14.1115, decDegrees: -36.370 }  // 3 Menkent
    ],
    lines: [[0, 1], [1, 2], [1, 3]]
  },
  {
    id: "pegasus",
    name: "Pegasus",
    season: "Autumn",
    myth: "The Winged Horse; four stars frame the Great Square of autumn.",
    stars: [
      { raHours: 23.0793, decDegrees: 15.205 }, // 0 Markab
      { raHours: 23.0629, decDegrees: 28.083 }, // 1 Scheat
      { raHours: 0.2206, decDegrees: 15.184 },  // 2 Algenib
      { raHours: 0.1398, decDegrees: 29.091 },  // 3 Alpheratz
      { raHours: 21.7364, decDegrees: 9.875 }   // 4 Enif
    ],
    lines: [[0, 1], [1, 3], [3, 2], [2, 0], [0, 4]]
  },
  {
    id: "andromeda",
    name: "Andromeda",
    season: "Autumn",
    myth: "The Chained Princess; a chain of stars trailing from the Great Square.",
    stars: [
      { raHours: 0.1398, decDegrees: 29.091 },  // 0 Alpheratz
      { raHours: 1.1622, decDegrees: 35.621 },  // 1 Mirach
      { raHours: 2.0650, decDegrees: 42.330 },  // 2 Almach
      { raHours: 0.6553, decDegrees: 30.861 }   // 3 Delta
    ],
    lines: [[0, 3], [3, 1], [1, 2]]
  },
  {
    id: "perseus",
    name: "Perseus",
    season: "Autumn",
    myth: "The Hero who slew Medusa; winking Algol marks the demon's eye.",
    stars: [
      { raHours: 3.4054, decDegrees: 49.861 },  // 0 Mirfak
      { raHours: 3.1361, decDegrees: 40.956 },  // 1 Algol
      { raHours: 3.0801, decDegrees: 53.506 },  // 2 Gamma
      { raHours: 3.7150, decDegrees: 47.788 },  // 3 Delta
      { raHours: 3.9576, decDegrees: 40.010 },  // 4 Epsilon
      { raHours: 3.9023, decDegrees: 31.884 }   // 5 Zeta
    ],
    lines: [[2, 0], [0, 3], [3, 4], [4, 5], [0, 1], [1, 4]]
  },
  {
    id: "auriga",
    name: "Auriga",
    season: "Winter",
    myth: "The Charioteer; a bright pentagon led by golden Capella.",
    stars: [
      { raHours: 5.2782, decDegrees: 45.998 },  // 0 Capella
      { raHours: 5.9924, decDegrees: 44.947 },  // 1 Menkalinan
      { raHours: 5.9952, decDegrees: 37.213 },  // 2 Mahasim
      { raHours: 5.4382, decDegrees: 28.608 },  // 3 Elnath (shared with Taurus)
      { raHours: 4.9499, decDegrees: 33.166 }   // 4 Hassaleh
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]
  },
  {
    id: "cepheus",
    name: "Cepheus",
    season: "Autumn",
    myth: "The King; a stylized house standing on the Milky Way near the pole.",
    stars: [
      { raHours: 21.3097, decDegrees: 62.585 }, // 0 Alderamin
      { raHours: 21.4776, decDegrees: 70.561 }, // 1 Alfirk
      { raHours: 23.6557, decDegrees: 77.632 }, // 2 Errai
      { raHours: 22.1810, decDegrees: 58.201 }, // 3 Zeta
      { raHours: 22.8285, decDegrees: 66.200 }  // 4 Iota
    ],
    lines: [[0, 1], [1, 4], [4, 2], [0, 3], [3, 4]]
  },
  {
    id: "aries",
    name: "Aries",
    season: "Autumn",
    myth: "The Ram of the Golden Fleece; a short bent line led by Hamal.",
    stars: [
      { raHours: 2.1195, decDegrees: 23.462 },  // 0 Hamal
      { raHours: 1.9108, decDegrees: 20.808 },  // 1 Sheratan
      { raHours: 1.8924, decDegrees: 19.294 },  // 2 Mesarthim
      { raHours: 2.8329, decDegrees: 27.260 }   // 3 41 Arietis
    ],
    lines: [[2, 1], [1, 0], [0, 3]]
  },
  {
    id: "triangulum",
    name: "Triangulum",
    season: "Autumn",
    myth: "A simple, ancient triangle between Andromeda and Aries.",
    stars: [
      { raHours: 2.1597, decDegrees: 34.987 },  // 0 Beta
      { raHours: 1.8846, decDegrees: 29.579 },  // 1 Alpha
      { raHours: 2.2886, decDegrees: 33.847 }   // 2 Gamma
    ],
    lines: [[1, 0], [0, 2], [2, 1]]
  },
  {
    id: "delphinus",
    name: "Delphinus",
    season: "Summer",
    myth: "The Dolphin leaping from the Milky Way; a tidy diamond with a tail.",
    stars: [
      { raHours: 20.6625, decDegrees: 15.912 }, // 0 Sualocin
      { raHours: 20.6256, decDegrees: 14.595 }, // 1 Rotanev
      { raHours: 20.7746, decDegrees: 16.124 }, // 2 Gamma
      { raHours: 20.7259, decDegrees: 15.075 }, // 3 Delta
      { raHours: 20.5560, decDegrees: 11.303 }  // 4 Epsilon
    ],
    lines: [[0, 2], [2, 3], [3, 1], [1, 0], [1, 4]]
  }
];
