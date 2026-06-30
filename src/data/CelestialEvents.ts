// Celestial events — algorithmically generated for a rolling 10-year window (2026–2035).
// Equinoxes/solstices (Meeus Ch.27 mean formulae), supermoons + meteor-shower moon
// interference (synodic month), planet oppositions (synodic periods), plus a hand-curated
// set of rare events (eclipses, notable conjunctions) that can't be cheaply computed.
// Sources: Meeus "Astronomical Algorithms", IAU, NASA eclipse canon.

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

type Rating = CelestialEvent["rating"];

// ── Date ⇆ Julian Day helpers ──────────────────────────────────────────────
const JD_UNIX_EPOCH = 2440587.5; // JD at 1970-01-01T00:00:00Z

function jdeToISO(jde: number): string {
  return new Date(Math.round((jde - JD_UNIX_EPOCH) * 86400000)).toISOString().slice(0, 10);
}
function isoToJDE(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`) / 86400000 + JD_UNIX_EPOCH;
}
const pad = (n: number) => String(n).padStart(2, "0");

// ── Moon model (synodic phase + supermoon test) ────────────────────────────
const SYNODIC = 29.530588853;       // mean synodic month (days)
const NEW_MOON_EPOCH = 2451550.1;   // 2000-01-06 18:14 UTC — a known new moon (JDE)

// Illuminated fraction (%) at a given JDE: 0 = new, 100 = full.
function moonIllumPercent(jde: number): number {
  let phase = ((jde - NEW_MOON_EPOCH) / SYNODIC) % 1;
  if (phase < 0) phase += 1;
  return ((1 - Math.cos(2 * Math.PI * phase)) / 2) * 100;
}

// Moon's mean anomaly (deg). 0° ≈ perigee — used to approximate supermoons.
function moonMeanAnomalyDeg(jde: number): number {
  const T = (jde - 2451545) / 36525;
  let M = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
  M = ((M % 360) + 360) % 360;
  return M;
}

// ── Equinoxes & Solstices (Meeus 27.B mean instants, years 1000–3000) ──────
function computeEquinoxSolstice(startYear: number, endYear: number): CelestialEvent[] {
  const out: CelestialEvent[] = [];
  const seasons = [
    { key: "vernal-equinox", name: "Vernal Equinox", type: "equinox" as EventType,
      desc: "Spring begins. Day and night are nearly equal as the Sun crosses the celestial equator heading north.",
      c: [2451623.80984, 365242.37404, 0.05169, -0.00411, -0.00057] },
    { key: "summer-solstice", name: "Summer Solstice", type: "solstice" as EventType,
      desc: "The longest day and shortest night. The Sun reaches its highest point in the sky.",
      c: [2451716.56767, 365241.62603, 0.00325, 0.00888, -0.00030] },
    { key: "autumnal-equinox", name: "Autumnal Equinox", type: "equinox" as EventType,
      desc: "Day and night are nearly equal. The Sun crosses the celestial equator heading south.",
      c: [2451810.21715, 365242.01767, -0.11575, 0.00337, 0.00078] },
    { key: "winter-solstice", name: "Winter Solstice", type: "solstice" as EventType,
      desc: "The shortest day and longest night of the year. The Sun is at its lowest point in the sky.",
      c: [2451900.05952, 365242.74049, -0.06223, -0.00823, 0.00032] }
  ];
  for (let year = startYear; year <= endYear; year++) {
    const Y = (year - 2000) / 1000;
    for (const s of seasons) {
      const jde = s.c[0] + s.c[1] * Y + s.c[2] * Y * Y + s.c[3] * Y ** 3 + s.c[4] * Y ** 4;
      out.push({
        id: `${s.key}-${year}`,
        name: s.name,
        date: jdeToISO(jde),
        type: s.type,
        description: s.desc,
        bestTime: "All day",
        rating: 2
      });
    }
  }
  return out;
}

// ── Supermoons (full moons near perigee) ───────────────────────────────────
function computeSynodicEvents(startYear: number, endYear: number): CelestialEvent[] {
  const out: CelestialEvent[] = [];
  const startJDE = isoToJDE(`${startYear}-01-01`);
  const endJDE = isoToJDE(`${endYear}-12-31`);
  // Walk full moons (new moon + half a synodic month) across the window.
  let k = Math.floor((startJDE - NEW_MOON_EPOCH) / SYNODIC) - 1;
  for (;;) {
    const fullJDE = NEW_MOON_EPOCH + SYNODIC * k + SYNODIC / 2;
    k++;
    if (fullJDE > endJDE) break;
    if (fullJDE < startJDE) continue;
    const anomaly = moonMeanAnomalyDeg(fullJDE);
    const fromPerigee = Math.min(anomaly, 360 - anomaly); // 0° = perigee
    if (fromPerigee >= 42) continue; // not close enough to perigee → ordinary full moon
    const iso = jdeToISO(fullJDE);
    out.push({
      id: `supermoon-${iso}`,
      name: "Supermoon",
      date: iso,
      type: "supermoon",
      description: "A full Moon near perigee — the largest, brightest full Moon of its season, appearing up to 14% bigger and 30% brighter than an average full Moon.",
      bestTime: "All night — rises at sunset, highest near midnight",
      direction: "Rises in the east at sunset",
      rating: fromPerigee < 20 ? 4 : 3
    });
  }
  return out;
}

// ── Annual meteor showers ──────────────────────────────────────────────────
interface ShowerDef {
  id: string; name: string; month: number; day: number; endDay: number;
  rate: number; rating: Rating; direction: string; bestTime: string;
}
const SHOWERS: ShowerDef[] = [
  { id: "quadrantids", name: "Quadrantid Meteor Shower", month: 1, day: 3, endDay: 4, rate: 120, rating: 4, direction: "NE near Boötes", bestTime: "Pre-dawn hours" },
  { id: "lyrids", name: "Lyrid Meteor Shower", month: 4, day: 22, endDay: 23, rate: 20, rating: 3, direction: "Near Vega in Lyra", bestTime: "After midnight" },
  { id: "eta-aquariids", name: "Eta Aquariid Meteor Shower", month: 5, day: 5, endDay: 6, rate: 50, rating: 3, direction: "East near Aquarius", bestTime: "Pre-dawn" },
  { id: "delta-aquariids", name: "Delta Aquariid Meteor Shower", month: 7, day: 28, endDay: 29, rate: 20, rating: 3, direction: "South toward Aquarius", bestTime: "After midnight" },
  { id: "perseids", name: "Perseid Meteor Shower", month: 8, day: 12, endDay: 13, rate: 100, rating: 5, direction: "Radiant in Perseus — look anywhere", bestTime: "After midnight until dawn" },
  { id: "draconids", name: "Draconid Meteor Shower", month: 10, day: 8, endDay: 9, rate: 10, rating: 2, direction: "Near Draco in the north", bestTime: "Early evening" },
  { id: "orionids", name: "Orionid Meteor Shower", month: 10, day: 21, endDay: 22, rate: 20, rating: 3, direction: "Near Orion", bestTime: "After midnight" },
  { id: "leonids", name: "Leonid Meteor Shower", month: 11, day: 17, endDay: 18, rate: 15, rating: 3, direction: "East near Leo", bestTime: "After midnight" },
  { id: "geminids", name: "Geminid Meteor Shower", month: 12, day: 13, endDay: 14, rate: 120, rating: 5, direction: "Near Gemini — look anywhere", bestTime: "9 PM to dawn" },
  { id: "ursids", name: "Ursid Meteor Shower", month: 12, day: 22, endDay: 23, rate: 10, rating: 2, direction: "Near Ursa Minor", bestTime: "After midnight" }
];

function computeMeteorShowers(startYear: number, endYear: number): CelestialEvent[] {
  const out: CelestialEvent[] = [];
  for (let year = startYear; year <= endYear; year++) {
    for (const s of SHOWERS) {
      const date = `${year}-${pad(s.month)}-${pad(s.day)}`;
      const endDate = `${year}-${pad(s.month)}-${pad(s.endDay)}`;
      const illum = moonIllumPercent(isoToJDE(date));
      const moonInterference = illum < 25 ? "none" : illum < 50 ? "low" : illum < 75 ? "moderate" : "high";
      const note =
        moonInterference === "none" ? " Excellent dark skies — ideal viewing."
        : moonInterference === "high" ? " A bright Moon may wash out fainter meteors."
        : "";
      out.push({
        id: `${s.id}-${year}`,
        name: s.name,
        date,
        endDate,
        type: "meteor",
        description: `Up to ${s.rate} meteors per hour at peak, radiating from the ${s.direction}.${note}`,
        bestTime: s.bestTime,
        direction: `Look toward ${s.direction}`,
        moonInterference,
        rating: s.rating
      });
    }
  }
  return out;
}

// ── Planet oppositions (stepped by synodic period from a known opposition) ──
function computeOppositions(startYear: number, endYear: number): CelestialEvent[] {
  const out: CelestialEvent[] = [];
  const planets: { id: string; name: string; synodic: number; ref: string; rating: Rating; desc: string }[] = [
    { id: "jupiter", name: "Jupiter at Opposition", synodic: 398.88, ref: "2026-11-21", rating: 4,
      desc: "Jupiter at its closest and brightest — cloud bands and the Great Red Spot show in small telescopes, and all four Galilean moons are visible." },
    { id: "saturn", name: "Saturn at Opposition", synodic: 378.09, ref: "2026-09-11", rating: 4,
      desc: "Saturn at its closest and brightest for the year, its rings beautifully tilted. Visible all night." },
    { id: "mars", name: "Mars at Opposition", synodic: 779.94, ref: "2027-02-19", rating: 4,
      desc: "Mars at its biggest and brightest, blazing orange-red and visible all night — the best time to observe the red planet." }
  ];
  const startJDE = isoToJDE(`${startYear}-01-01`);
  const endJDE = isoToJDE(`${endYear}-12-31`);
  for (const pl of planets) {
    for (let jde = isoToJDE(pl.ref); jde <= endJDE; jde += pl.synodic) {
      if (jde < startJDE) continue;
      const iso = jdeToISO(jde);
      out.push({
        id: `${pl.id}-opposition-${iso}`,
        name: pl.name,
        date: iso,
        type: "opposition",
        description: pl.desc,
        bestTime: "All night — rises at sunset, sets at sunrise",
        direction: "Rises in the east at sunset",
        rating: pl.rating
      });
    }
  }
  return out;
}

// ── Rare, hand-curated events (eclipses + notable conjunctions) ─────────────
// No guaranteed naked-eye comets are predicted through 2035; none are listed.
const RARE_EVENTS: CelestialEvent[] = [
  // Eclipses
  { id: "total-lunar-eclipse-2026-09", name: "Total Lunar Eclipse", date: "2026-09-07", type: "eclipse",
    description: "The Moon passes through Earth's shadow, turning deep red — a 'Blood Moon.' Visible from the Americas, Europe, and Africa.", bestTime: "Evening through early morning", direction: "Look east as the Moon rises", rating: 5 },
  { id: "annular-solar-eclipse-2027-02", name: "Annular Solar Eclipse", date: "2027-02-06", type: "eclipse",
    description: "A 'Ring of Fire' eclipse visible from South America and parts of Africa; partial from broader regions.", bestTime: "Midday (location dependent)", rating: 4 },
  { id: "total-solar-eclipse-2027-08", name: "Total Solar Eclipse", date: "2027-08-02", type: "eclipse",
    description: "One of the longest totalities of the century, crossing North Africa, the Middle East, and Asia. A once-in-a-lifetime event in the path.", bestTime: "Midday (location dependent)", rating: 5 },
  { id: "partial-lunar-eclipse-2028-01", name: "Partial Lunar Eclipse", date: "2028-01-12", type: "eclipse",
    description: "Part of the Moon dips into Earth's umbra, darkening one edge.", bestTime: "Overnight (location dependent)", rating: 2 },
  { id: "total-solar-eclipse-2028-07", name: "Total Solar Eclipse", date: "2028-07-22", type: "eclipse",
    description: "Totality crosses Australia and New Zealand, passing directly over Sydney.", bestTime: "Midday (location dependent)", rating: 5 },
  { id: "total-lunar-eclipse-2028-12", name: "Total Lunar Eclipse", date: "2028-12-31", type: "eclipse",
    description: "A New Year's Eve Blood Moon visible from Europe, Africa, and Asia.", bestTime: "Overnight (location dependent)", direction: "Look toward the Moon", rating: 5 },
  { id: "partial-lunar-eclipse-2029-06", name: "Partial Lunar Eclipse", date: "2029-06-12", type: "eclipse",
    description: "A modest partial eclipse shading the Moon's edge.", bestTime: "Overnight (location dependent)", rating: 2 },
  { id: "total-lunar-eclipse-2029-12", name: "Total Lunar Eclipse", date: "2029-12-05", type: "eclipse",
    description: "A deep total lunar eclipse well placed for the Americas.", bestTime: "Overnight (location dependent)", direction: "Look toward the Moon", rating: 5 },
  { id: "annular-solar-eclipse-2030-06", name: "Annular Solar Eclipse", date: "2030-06-01", type: "eclipse",
    description: "A 'Ring of Fire' annular eclipse across North Africa and Asia.", bestTime: "Midday (location dependent)", rating: 4 },
  { id: "total-solar-eclipse-2030-11", name: "Total Solar Eclipse", date: "2030-11-25", type: "eclipse",
    description: "Totality sweeps across southern Africa and Australia.", bestTime: "Midday (location dependent)", rating: 5 },

  // Notable conjunctions
  { id: "venus-jupiter-conjunction-2026-08", name: "Venus–Jupiter Conjunction", date: "2026-08-27", type: "conjunction",
    description: "The two brightest planets draw close in the sky — a dazzling pairing visible to the naked eye.", bestTime: "Just before dawn or after dusk (location dependent)", direction: "Low near the horizon", rating: 4 },
  { id: "mars-saturn-conjunction-2027-03", name: "Mars–Saturn Conjunction", date: "2027-03-22", type: "conjunction",
    description: "Red Mars and golden Saturn meet closely, a fine sight in binoculars.", bestTime: "Pre-dawn (location dependent)", direction: "Toward the eastern sky", rating: 3 },
  { id: "venus-jupiter-conjunction-2028-05", name: "Venus–Jupiter Conjunction", date: "2028-05-13", type: "conjunction",
    description: "Venus and Jupiter pair up again — the two brightest planets side by side.", bestTime: "After dusk or before dawn (location dependent)", direction: "Low near the horizon", rating: 4 },
  { id: "jupiter-saturn-conjunction-2029-11", name: "Jupiter–Saturn Near Conjunction", date: "2029-11-18", type: "conjunction",
    description: "The two giants approach in the sky, echoing their rare 'Great Conjunction.'", bestTime: "Evening (location dependent)", direction: "Toward the southern sky", rating: 4 },
  { id: "venus-mars-conjunction-2030-06", name: "Venus–Mars Conjunction", date: "2030-06-15", type: "conjunction",
    description: "Brilliant Venus passes close to ruddy Mars — a striking color contrast.", bestTime: "After dusk (location dependent)", direction: "Low in the west", rating: 3 }
];

export function generateEvents(startYear: number, endYear: number): CelestialEvent[] {
  return [
    ...computeEquinoxSolstice(startYear, endYear),
    ...computeSynodicEvents(startYear, endYear), // supermoons
    ...computeMeteorShowers(startYear, endYear),
    ...computeOppositions(startYear, endYear),
    ...RARE_EVENTS.filter((e) => {
      const y = parseInt(e.date.slice(0, 4), 10);
      return y >= startYear && y <= endYear;
    })
  ].sort((a, b) => a.date.localeCompare(b.date));
}

export const CELESTIAL_EVENTS: CelestialEvent[] = generateEvents(2026, 2035);

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
  // Overlaps the window: starts on/before week-end AND ends on/after today (so a
  // multi-day shower already in progress isn't dropped).
  return CELESTIAL_EVENTS.filter(e => e.date <= end && (e.endDate ?? e.date) >= start);
}

// Helper: get high-rated upcoming events
export function getHighlightEvents(minRating = 4): CelestialEvent[] {
  const now = new Date().toISOString().slice(0, 10);
  return CELESTIAL_EVENTS
    .filter(e => e.date >= now && e.rating >= minRating)
    .sort((a, b) => a.date.localeCompare(b.date));
}
