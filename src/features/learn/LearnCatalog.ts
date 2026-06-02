import type { LearnTopic } from "./LearnTypes";

export const learnTopics: LearnTopic[] = [
  {
    id: "what-is-solar-system",
    categoryId: "solar_system",
    title: "What is the Solar System?",
    level: "beginner",
    summary: "The Solar System is the Sun and everything gravitationally bound to it: planets, moons, asteroids, comets, and dust.",
    keyFacts: [
      "The Sun contains most of the Solar System’s mass.",
      "Planets orbit the Sun along predictable paths.",
      "Moons orbit planets, while asteroids and comets follow their own paths."
    ],
    skyLensAction: "Show planetary paths",
    archiveAction: "Open Solar System"
  },
  {
    id: "moon-phases",
    categoryId: "moon",
    title: "Moon Phases",
    level: "beginner",
    summary: "Moon phases happen because we see different portions of the Moon’s sunlit half as it orbits Earth.",
    keyFacts: [
      "New Moon means the sunlit side faces mostly away from Earth.",
      "Full Moon means the sunlit side faces Earth.",
      "The cycle takes about 29.5 days."
    ],
    skyLensAction: "Find the Moon",
    archiveAction: "Open Moon card"
  },
  {
    id: "inner-outer-planets",
    categoryId: "planets",
    title: "Inner vs Outer Planets",
    level: "beginner",
    summary: "Mercury, Venus, Earth, and Mars are rocky inner planets. Jupiter, Saturn, Uranus, and Neptune are large outer planets.",
    keyFacts: [
      "Inner planets are smaller and rocky.",
      "Outer planets are larger and colder.",
      "Jupiter and Saturn are gas giants; Uranus and Neptune are ice giants."
    ],
    skyLensAction: "Find a planet",
    archiveAction: "Open Planets"
  },
  {
    id: "what-are-constellations",
    categoryId: "constellations",
    title: "What are Constellations?",
    level: "beginner",
    summary: "Constellations are named regions of the sky. Their star patterns helped people navigate, tell stories, and track seasons.",
    keyFacts: [
      "There are 88 official constellations.",
      "Stars in a constellation are usually not physically close together.",
      "Constellations change visibility with season and location."
    ],
    skyLensAction: "Trace Orion",
    archiveAction: "Open Constellations"
  },
  {
    id: "star-brightness",
    categoryId: "stars",
    title: "Why are some stars brighter?",
    level: "beginner",
    summary: "A star looks bright because of its true luminosity, distance from Earth, color, and atmospheric conditions.",
    keyFacts: [
      "Magnitude measures apparent brightness.",
      "Sirius is the brightest star in the night sky.",
      "Star color gives clues about temperature."
    ],
    skyLensAction: "Find Sirius",
    archiveAction: "Open Stars"
  },
  {
    id: "nebulae",
    categoryId: "deep_sky",
    title: "What are Nebulae?",
    level: "beginner",
    summary: "Nebulae are clouds of gas and dust. Some are star nurseries, some are the remains of dying stars, and some block light behind them.",
    keyFacts: [
      "The Orion Nebula is a bright stellar nursery.",
      "Dark nebulae block background light.",
      "Planetary nebulae are shells from dying stars."
    ],
    skyLensAction: "Show Deep Sky layer",
    archiveAction: "Open Nebulae"
  },
  {
    id: "milky-way-band",
    categoryId: "milky_way",
    title: "The Milky Way Band",
    level: "beginner",
    summary: "The Milky Way band is the glowing plane of our galaxy seen from inside it, filled with stars, dust lanes, and deep-sky regions.",
    keyFacts: [
      "The Milky Way Core is toward Sagittarius.",
      "The Great Rift is a dark dust lane crossing the band.",
      "Best views require dark skies and low moon brightness."
    ],
    skyLensAction: "Open Galaxy Mode",
    archiveAction: "Open Milky Way"
  },
  {
    id: "learn-sky-night-one",
    categoryId: "beginner_path",
    title: "Night 1: Find the Moon",
    level: "beginner",
    summary: "The first step in learning the sky is learning to locate, observe, and describe the Moon.",
    keyFacts: [
      "Notice phase, brightness, and position.",
      "Check moonrise and moonset.",
      "Save one Moon note to your Vault."
    ],
    skyLensAction: "Start Night 1",
    archiveAction: "Open 30 Nights"
  }
];

export const learnCategories = [
  { id: "solar_system", title: "Solar System", icon: "☉", description: "Sun, planets, moons, orbits, asteroids, and comets." },
  { id: "moon", title: "Moon", icon: "☾", description: "Phases, moonrise, moonset, brightness, and lunar observations." },
  { id: "planets", title: "Planets", icon: "♃", description: "Mercury through Neptune with science, mythology, and visibility." },
  { id: "constellations", title: "Constellations", icon: "✦", description: "All 88 official constellations, stories, seasons, and sky tracing." },
  { id: "stars", title: "Stars", icon: "★", description: "Bright stars, magnitude, color, distance, and star life cycles." },
  { id: "deep_sky", title: "Deep Sky", icon: "☄", description: "Nebulae, galaxies, star clusters, and supernova remnants." },
  { id: "milky_way", title: "Milky Way", icon: "◎", description: "Galaxy Mode, Milky Way band, core, dust lanes, and viewing conditions." },
  { id: "beginner_path", title: "30 Nights", icon: "◇", description: "A guided beginner course for learning the sky step by step." }
] as const;
