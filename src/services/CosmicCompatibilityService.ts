// Compare birth skies between two people.
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import { moonPhaseLabel } from "@/services/MoonPhase";

export interface BirthSkyComparison {
  person1: { birthday: string; moonPhase: string; moonPercent: number; visiblePlanets: string[] };
  person2: { birthday: string; moonPhase: string; moonPercent: number; visiblePlanets: string[] };
  sharedPlanets: string[];
  uniqueTo1: string[];
  uniqueTo2: string[];
  narrative: string;
}

// Direction-agnostic label from the canonical MoonPhase thresholds.
const moonName = moonPhaseLabel;

export function compareBirthSkies(
  birthday1: string,
  birthday2: string,
  location: ObserverLocation
): BirthSkyComparison {
  const sky1 = computeTonightSky(location, new Date(birthday1 + "T22:00:00"));
  const sky2 = computeTonightSky(location, new Date(birthday2 + "T22:00:00"));

  const planets1 = sky1.visibleBodies.filter(b => b.id !== "sun" && b.id !== "moon").map(b => b.name);
  const planets2 = sky2.visibleBodies.filter(b => b.id !== "sun" && b.id !== "moon").map(b => b.name);
  const shared = planets1.filter(p => planets2.includes(p));
  const unique1 = planets1.filter(p => !planets2.includes(p));
  const unique2 = planets2.filter(p => !planets1.includes(p));

  const moon1 = moonName(sky1.moonIlluminationPercent);
  const moon2 = moonName(sky2.moonIlluminationPercent);

  let narrative: string;
  if (moon1 === moon2) {
    narrative = `You were both born under a ${moon1}. You share a lunar rhythm.`;
  } else {
    narrative = `You were born under a ${moon1}, they under a ${moon2}. Different lunar energies, complementary rhythms.`;
  }
  if (shared.length > 0) {
    narrative += ` ${shared.join(" and ")} shone in both your skies.`;
  }

  return {
    person1: { birthday: birthday1, moonPhase: moon1, moonPercent: sky1.moonIlluminationPercent, visiblePlanets: planets1 },
    person2: { birthday: birthday2, moonPhase: moon2, moonPercent: sky2.moonIlluminationPercent, visiblePlanets: planets2 },
    sharedPlanets: shared, uniqueTo1: unique1, uniqueTo2: unique2, narrative
  };
}
