// Celestial events for 2026-2027 — eclipses, meteor showers,
// conjunctions, oppositions, supermoons, comets.
// Source: IAU, NASA, timeanddate.com

export type EventType = "meteor" | "eclipse" | "conjunction" | "opposition" | "supermoon" | "comet" | "equinox" | "solstice" | "transit" | "occultation";

export interface CelestialEvent {
  id: string;
  name: string;
  date: string;       // ISO date
  endDate?: string;    // for multi-day events
  type: EventType;
  description: string;
  bestTime: string;
  direction?: string;
  moonInterference?: "none" | "low" | "moderate" | "high";
  rating: 1 | 2 | 3 | 4 | 5; // visual spectacle rating
  premium?: boolean;
}

export const CELESTIAL_EVENTS: CelestialEvent[] = [
  // ═══ 2026 ═══

  // July
  { id: "earth-aphelion-2026", name: "Earth at Aphelion", date: "2026-07-06", type: "opposition",
    description: "Earth is at its farthest point from the Sun — 152.1 million km.", bestTime: "All day", rating: 1 },
  { id: "delta-aquariids-2026", name: "Delta Aquariid Meteor Shower", date: "2026-07-28", endDate: "2026-07-29", type: "meteor",
    description: "Up to 20 meteors per hour radiating from Aquarius. Best after midnight.", bestTime: "After midnight", direction: "Look south toward Aquarius", moonInterference: "moderate", rating: 3 },

  // August
  { id: "perseids-2026", name: "Perseid Meteor Shower", date: "2026-08-12", endDate: "2026-08-13", type: "meteor",
    description: "The king of meteor showers — up to 100 bright meteors per hour. Fast, bright, often with persistent trains.", bestTime: "After midnight until dawn", direction: "Radiant in Perseus, but look anywhere", moonInterference: "low", rating: 5 },
  { id: "saturn-opposition-2026", name: "Saturn at Opposition", date: "2026-09-11", type: "opposition",
    description: "Saturn at its closest and brightest for the year. Rings tilted beautifully. Visible all night.", bestTime: "All night — rises at sunset, sets at sunrise", direction: "Rises in the east", rating: 4 },

  // September
  { id: "total-lunar-eclipse-2026", name: "Total Lunar Eclipse", date: "2026-09-07", type: "eclipse",
    description: "The Moon passes through Earth's shadow, turning deep red — a 'Blood Moon.' Visible from the Americas, Europe, and Africa.", bestTime: "Evening through early morning", direction: "Look east as the Moon rises", rating: 5 },
  { id: "autumnal-equinox-2026", name: "Autumnal Equinox", date: "2026-09-22", type: "equinox",
    description: "Day and night are nearly equal. The Sun crosses the celestial equator heading south.", bestTime: "All day", rating: 2 },

  // October
  { id: "draconids-2026", name: "Draconid Meteor Shower", date: "2026-10-08", type: "meteor",
    description: "A modest shower from Comet Giacobini-Zinner. Usually 10-20 per hour but occasionally bursts to hundreds.", bestTime: "Early evening — unusual for a meteor shower", direction: "Radiant near Draco's head", moonInterference: "low", rating: 2 },
  { id: "orionids-2026", name: "Orionid Meteor Shower", date: "2026-10-21", endDate: "2026-10-22", type: "meteor",
    description: "Debris from Halley's Comet — 20-25 fast meteors per hour with persistent trains.", bestTime: "After midnight", direction: "Radiant near Orion's club", moonInterference: "moderate", rating: 3 },
  { id: "jupiter-opposition-2026", name: "Jupiter at Opposition", date: "2026-10-10", type: "opposition",
    description: "Jupiter at its closest and brightest. Cloud bands and Great Red Spot visible through small telescopes. All four Galilean moons visible.", bestTime: "All night", direction: "Rises in the east at sunset", rating: 4 },

  // November
  { id: "leonids-2026", name: "Leonid Meteor Shower", date: "2026-11-17", endDate: "2026-11-18", type: "meteor",
    description: "Debris from Comet Tempel-Tuttle. 15-20 fast, bright meteors per hour. Historically produces spectacular storms.", bestTime: "After midnight", direction: "Radiant in Leo's mane", moonInterference: "low", rating: 3 },

  // December
  { id: "geminids-2026", name: "Geminid Meteor Shower", date: "2026-12-14", endDate: "2026-12-15", type: "meteor",
    description: "The best meteor shower of the year — up to 150 multicolored meteors per hour. Bright, slow, and spectacular.", bestTime: "9 PM to dawn", direction: "Radiant near Castor in Gemini", moonInterference: "low", rating: 5 },
  { id: "winter-solstice-2026", name: "Winter Solstice", date: "2026-12-21", type: "solstice",
    description: "The shortest day and longest night of the year. The Sun is at its lowest point in the sky.", bestTime: "All night — maximum darkness", rating: 2 },
  { id: "ursids-2026", name: "Ursid Meteor Shower", date: "2026-12-22", type: "meteor",
    description: "A gentle shower of 5-10 meteors per hour from near the Big Dipper.", bestTime: "After midnight", direction: "Radiant near Ursa Minor", moonInterference: "moderate", rating: 2 },

  // ═══ 2027 ═══

  // January
  { id: "quadrantids-2027", name: "Quadrantid Meteor Shower", date: "2027-01-03", endDate: "2027-01-04", type: "meteor",
    description: "A brief but intense shower — up to 120 meteors per hour in a narrow 6-hour window.", bestTime: "Pre-dawn hours", direction: "Radiant between Boötes and Draco", moonInterference: "moderate", rating: 4 },

  // February
  { id: "annular-solar-eclipse-2027", name: "Annular Solar Eclipse", date: "2027-02-06", type: "eclipse",
    description: "A 'Ring of Fire' eclipse visible from South America and parts of Africa. Partial eclipse from broader regions.", bestTime: "Midday (location dependent)", rating: 5 },

  // March
  { id: "vernal-equinox-2027", name: "Vernal Equinox", date: "2027-03-20", type: "equinox",
    description: "Spring begins. Day and night nearly equal. The Sun crosses the celestial equator heading north.", bestTime: "All day", rating: 2 },

  // April
  { id: "lyrids-2027", name: "Lyrid Meteor Shower", date: "2027-04-22", endDate: "2027-04-23", type: "meteor",
    description: "One of the oldest known meteor showers — 18 per hour with occasional fireballs.", bestTime: "After midnight", direction: "Radiant near Vega in Lyra", moonInterference: "low", rating: 3 },

  // May
  { id: "eta-aquariids-2027", name: "Eta Aquariid Meteor Shower", date: "2027-05-06", type: "meteor",
    description: "Another gift from Halley's Comet — up to 50 fast meteors per hour at southern latitudes.", bestTime: "Pre-dawn", direction: "Radiant in Aquarius", moonInterference: "high", rating: 3 },

  // June
  { id: "summer-solstice-2027", name: "Summer Solstice", date: "2027-06-21", type: "solstice",
    description: "The longest day and shortest night. The Sun reaches its highest point in the sky.", bestTime: "All day", rating: 2 },

  // July
  { id: "total-solar-eclipse-2027", name: "Total Solar Eclipse", date: "2027-08-02", type: "eclipse",
    description: "Totality visible from Spain, Morocco, Algeria, Tunisia, Libya, Egypt. A once-in-a-lifetime event for those in the path.", bestTime: "Midday (location dependent)", rating: 5 },
];

// Helper: get upcoming events from today
export function getUpcomingEvents(limit = 10): CelestialEvent[] {
  const now = new Date().toISOString().slice(0, 10);
  return CELESTIAL_EVENTS
    .filter(e => e.date >= now || (e.endDate && e.endDate >= now))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

// Helper: get this week's events
export function getThisWeekEvents(): CelestialEvent[] {
  const now = new Date();
  const weekEnd = new Date(now.getTime() + 7 * 86400000);
  const start = now.toISOString().slice(0, 10);
  const end = weekEnd.toISOString().slice(0, 10);
  return CELESTIAL_EVENTS.filter(e => e.date >= start && e.date <= end);
}

// Helper: get high-rated upcoming events
export function getHighlightEvents(minRating = 4): CelestialEvent[] {
  const now = new Date().toISOString().slice(0, 10);
  return CELESTIAL_EVENTS
    .filter(e => e.date >= now && e.rating >= minRating)
    .sort((a, b) => a.date.localeCompare(b.date));
}
