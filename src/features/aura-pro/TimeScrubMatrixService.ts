import type {
  RetrogradeWindow,
  TimeScrubPlanetState,
  TimeScrubSnapshot
} from "@/features/aura-pro/AuraProUtilityTypes";

export const retrogradeFixtureWindows: RetrogradeWindow[] = [
  {
    id: "fixture-mercury",
    planet: "Mercury",
    startISO: "2026-07-02",
    endISO: "2026-07-24",
    stage: "retrograde",
    isFixture: true
  },
  {
    id: "fixture-saturn",
    planet: "Saturn",
    startISO: "2026-08-09",
    endISO: "2026-11-27",
    stage: "retrograde",
    isFixture: true
  },
  {
    id: "fixture-jupiter",
    planet: "Jupiter",
    startISO: "2026-11-11",
    endISO: "2027-03-11",
    stage: "retrograde",
    isFixture: true
  }
];

const planets = [
  { id: "mercury", name: "Mercury", rate: 4.1, origin: 12 },
  { id: "venus", name: "Venus", rate: 1.6, origin: 35 },
  { id: "mars", name: "Mars", rate: 0.9, origin: 58 },
  { id: "jupiter", name: "Jupiter", rate: 0.24, origin: 74 },
  { id: "saturn", name: "Saturn", rate: 0.1, origin: 88 }
];

function normalizePercent(value: number) {
  return ((value % 100) + 100) % 100;
}

function formatLocalDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isFixtureRetrograde(name: string, offsetDays: number) {
  if (name === "Mercury") return offsetDays >= 28 && offsetDays <= 50;
  if (name === "Saturn") return offsetDays >= 66 && offsetDays <= 176;
  if (name === "Jupiter") return offsetDays >= 160 && offsetDays <= 280;
  return false;
}

function buildPlanets(offsetDays: number): TimeScrubPlanetState[] {
  return planets.map((planet) => ({
    id: planet.id,
    name: planet.name,
    orbitPercent: normalizePercent(
      planet.origin +
        offsetDays *
          planet.rate *
          (isFixtureRetrograde(planet.name, offsetDays) ? -0.6 : 1)
    ),
    direction: isFixtureRetrograde(planet.name, offsetDays)
      ? "retrograde-fixture"
      : "direct"
  }));
}

export function buildTimeScrubSnapshot(offsetDays: number): TimeScrubSnapshot {
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  base.setDate(base.getDate() + offsetDays);

  const nearbyRetrogradeWindows = retrogradeFixtureWindows.filter((window) => {
    const start = Date.parse(window.startISO);
    const end = Date.parse(window.endISO);
    const target = base.getTime();
    const margin = 45 * 24 * 60 * 60 * 1000;
    return target >= start - margin && target <= end + margin;
  });

  return {
    offsetDays,
    displayDateISO: formatLocalDate(base),
    planets: buildPlanets(offsetDays),
    nearbyRetrogradeWindows,
    note:
      "Interactive adapter fixture only. Connect the production astronomy ephemeris before presenting retrograde dates or planet positions as calculated results."
  };
}
