export type CelestialEventType = "solar_eclipse" | "lunar_eclipse" | "conjunction" | "opposition" | "transit" | "meteor_shower" | "equinox" | "solstice" | "occultation";

export interface CelestialEvent {
  id: string;
  name: string;
  type: CelestialEventType;
  date: string; // ISO date
  description: string;
  globalVisibility: string;
  magnitude?: string;
}

export const celestialEvents: CelestialEvent[] = [
  { id:"le-2026-03",name:"Total Lunar Eclipse",type:"lunar_eclipse",date:"2026-03-03",description:"The Moon passes completely through Earth's shadow, turning deep copper-red. Totality lasts 58 minutes.",globalVisibility:"Americas, Europe, Africa",magnitude:"Umbral 1.15" },
  { id:"se-2026-08",name:"Total Solar Eclipse",type:"solar_eclipse",date:"2026-08-12",description:"The Moon completely blocks the Sun, revealing the solar corona. Path of totality crosses Arctic regions, Greenland, Iceland, and Spain.",globalVisibility:"Arctic, Greenland, Iceland, Spain",magnitude:"Total 1.039" },
  { id:"le-2026-08",name:"Partial Lunar Eclipse",type:"lunar_eclipse",date:"2026-08-28",description:"A portion of the Moon enters Earth's umbral shadow.",globalVisibility:"East Asia, Australia, Pacific, Americas" },
  { id:"se-2027-02",name:"Annular Solar Eclipse",type:"solar_eclipse",date:"2027-02-06",description:"The Moon covers the Sun's center, leaving a bright ring of fire visible.",globalVisibility:"South America, Antarctica, Africa" },
  { id:"se-2027-08",name:"Total Solar Eclipse",type:"solar_eclipse",date:"2027-08-02",description:"Totality over Morocco, Spain, Algeria, Tunisia, Libya, Egypt, Saudi Arabia. One of the most accessible total eclipses.",globalVisibility:"North Africa, Mediterranean, Middle East",magnitude:"Total 1.079" },
  { id:"le-2028-01",name:"Total Lunar Eclipse",type:"lunar_eclipse",date:"2028-01-12",description:"Total lunar eclipse visible across the Americas, Europe, and Africa.",globalVisibility:"Americas, Europe, Africa" },
  { id:"se-2028-07",name:"Total Solar Eclipse",type:"solar_eclipse",date:"2028-07-22",description:"Path of totality crosses Australia and New Zealand.",globalVisibility:"Australia, New Zealand, South Pacific" },
  { id:"se-2028-10",name:"Annular Solar Eclipse",type:"solar_eclipse",date:"2028-10-14",description:"Ring of fire visible across South America.",globalVisibility:"South America" },
  { id:"conj-2026-02",name:"Venus–Saturn Conjunction",type:"conjunction",date:"2026-02-16",description:"Venus and Saturn appear less than 1° apart in the pre-dawn sky. A beautiful naked-eye sight.",globalVisibility:"Worldwide pre-dawn" },
  { id:"opp-2026-09",name:"Saturn at Opposition",type:"opposition",date:"2026-09-21",description:"Saturn is directly opposite the Sun, at its brightest and closest for the year. Rings clearly visible in a small telescope.",globalVisibility:"Worldwide all night" },
  { id:"opp-2027-01",name:"Jupiter at Opposition",type:"opposition",date:"2027-01-10",description:"Jupiter at its brightest — magnitude -2.7. The Galilean moons are easily visible in binoculars.",globalVisibility:"Worldwide all night" },
  { id:"conj-2027-03",name:"Venus–Jupiter Conjunction",type:"conjunction",date:"2027-03-01",description:"The two brightest planets appear within 1° of each other in the evening sky. Spectacular naked-eye event.",globalVisibility:"Worldwide evening" },
  { id:"sol-2026-06",name:"Summer Solstice",type:"solstice",date:"2026-06-21",description:"Longest day of the year in the Northern Hemisphere. The Sun reaches its highest point in the sky.",globalVisibility:"Worldwide" },
  { id:"sol-2026-12",name:"Winter Solstice",type:"solstice",date:"2026-12-21",description:"Shortest day in the Northern Hemisphere. Longest night — best deep-sky viewing of the year.",globalVisibility:"Worldwide" },
  { id:"eq-2026-09",name:"Autumnal Equinox",type:"equinox",date:"2026-09-22",description:"Day and night are approximately equal length. The Sun crosses the celestial equator heading south.",globalVisibility:"Worldwide" }
];

export function getUpcomingEvents(withinDays: number = 90): CelestialEvent[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() + withinDays * 86_400_000);
  return celestialEvents
    .filter(e => new Date(e.date) >= now && new Date(e.date) <= cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getNextEclipses(count: number = 10): CelestialEvent[] {
  const now = new Date();
  return celestialEvents
    .filter(e => (e.type === "solar_eclipse" || e.type === "lunar_eclipse") && new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, count);
}
