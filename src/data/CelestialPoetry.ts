// CelestialPoetry.ts — poetic one-liners for the Celestial Focus moment
// When a user pauses on a hero object for 2 seconds, one of these appears.
// "Take a moment. You're looking at light that has traveled for thousands of years."

export const CELESTIAL_POETRY: Record<string, string> = {
  // Stars
  sirius: "The brightest star in our sky. Ancient Egyptians built their calendar around its rising.",
  betelgeuse: "A dying red supergiant. One day it will explode into a supernova visible in daylight.",
  rigel: "Blue-white and furious. Eighty thousand times more luminous than our Sun.",
  vega: "26 light years away. The star our Sun is racing toward.",
  antares: "The heart of the Scorpion. So vast that if it replaced our Sun, it would swallow Mars.",
  polaris: "The North Star. Every civilization that looked up used it to find their way home.",
  altair: "Eleven light years away. One of the closest bright stars to Earth.",
  deneb: "So far away its light left before the Roman Empire. Yet it blazes this bright.",
  arcturus: "An orange giant moving through space faster than almost any star you can see.",
  capella: "Not one star but four. Two golden giants locked in a gravitational dance.",
  aldebaran: "The eye of the Bull. A star sixty times wider than our Sun.",
  spica: "A blue giant spinning so fast it's shaped like an egg.",
  fomalhaut: "One of the loneliest bright stars. Far from the Milky Way band, it rules a quiet sky.",

  // Planets
  jupiter: "The king of planets. Its Great Red Spot is a storm larger than Earth — and it's been raging for centuries.",
  saturn: "Those rings are made of ice and rock. Some pieces are as small as grains of sand. Others are as large as houses.",
  mars: "The only planet we've sent rovers to explore. Somewhere on its surface, tire tracks mark where curiosity drove.",
  venus: "Brighter than anything in the night sky except the Moon. Ancient peoples thought it was two different stars.",
  mercury: "The fastest planet. It races around the Sun in just 88 days.",
  moon: "The only world beyond Earth where humans have stood. Their footprints are still there.",

  // Deep sky
  m42: "The Orion Nebula. A stellar nursery where new stars are being born right now.",
  m31: "The Andromeda Galaxy. Two and a half million light years away — and heading toward us.",
  m45: "The Pleiades. The Seven Sisters. Almost every ancient culture has a story about them.",
  m8: "The Lagoon Nebula. A vast cloud of hydrogen glowing with the light of newborn stars.",
  m20: "The Trifid Nebula. Its name means 'divided into three' — dark dust lanes split its glow.",
  m16: "The Eagle Nebula. Home of the Pillars of Creation — towers of gas where stars are forming.",
  ngc3372: "The Carina Nebula. Four times larger than Orion's. One of the most violent star-forming regions in our galaxy.",
  ngc7000: "The North America Nebula. It genuinely resembles the continent. Nature's sense of humor.",
  ngc6960: "The Veil Nebula. The remains of a star that exploded thousands of years ago. Its shockwave is still expanding.",
  "omega-centauri": "Ten million stars. The largest globular cluster in our galaxy — possibly a captured dwarf galaxy core.",
  "centaurus-a": "A galaxy being torn apart by a collision. Radio jets blast from its core for millions of light years.",
};

export function getPoetry(objectId: string): string | undefined {
  return CELESTIAL_POETRY[objectId.toLowerCase()];
}
