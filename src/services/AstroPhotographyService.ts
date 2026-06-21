// AstroPhotographyService.ts — Astrophotography Planner
// Calculates optimal shooting windows, exposure settings, and target
// recommendations based on location, date, and equipment parameters.

import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface ExposureSettings {
  focalLengthMm: number;
  aperture: number;        // f-number
  isoRecommended: number;
  maxExposureSec: number;  // before star trails (500 rule)
  npfExposureSec: number;  // NPF rule (sharper)
  trailExposureMin: number; // intentional star trails
  stackRecommendation: string; // "Stack 30×20s at ISO 3200"
}

export interface PhotoTarget {
  name: string;
  type: "milky_way" | "planet" | "moon" | "meteor" | "constellation" | "deep_sky" | "star_trail";
  bestTimeTonight: string | null;  // "11 PM – 2 AM" or null if not visible
  difficulty: "beginner" | "intermediate" | "advanced";
  focalLengthRange: string; // "14-24mm" / "200mm+" etc.
  description: string;
  tip: string;
  visible: boolean;
}

export interface PhotoPlan {
  location: ObserverLocation;
  date: string;
  moonPhasePercent: number;
  moonRiseSet: string;
  darkWindowStart: string;
  darkWindowEnd: string;
  milkyWayCoreVisible: boolean;
  milkyWayCoreAz: number | null;
  milkyWayCoreTime: string | null;
  targets: PhotoTarget[];
  exposure: ExposureSettings;
  goldenHourEvening: string;
  blueHourEvening: string;
  goldenHourMorning: string;
  blueHourMorning: string;
  verdict: string;  // "Excellent night for Milky Way" / "Good for planetary" etc.
}

/**
 * 500 Rule: max exposure = 500 / (focal_length × crop_factor)
 * NPF Rule: max exposure = (35 × aperture + 30 × pixel_pitch) / focal_length
 * For simplicity we use 500 rule with crop=1 and NPF approximation.
 */
function computeExposure(focalMm: number, aperture: number, pixelPitchUm: number = 4.0): ExposureSettings {
  const rule500 = Math.round(500 / focalMm);
  const npf = Math.round((35 * aperture + 30 * pixelPitchUm) / focalMm);

  // ISO recommendation based on aperture
  const iso = aperture <= 2.0 ? 1600 : aperture <= 2.8 ? 3200 : aperture <= 4.0 ? 6400 : 12800;

  // Star trail: 15+ minutes
  const trailMin = focalMm <= 24 ? 20 : focalMm <= 50 ? 15 : 10;

  // Stacking recommendation
  const stackCount = Math.ceil(120 / Math.max(npf, 5)); // aim for ~2 min total
  const stack = `Stack ${stackCount}×${npf}s at ISO ${iso}`;

  return {
    focalLengthMm: focalMm,
    aperture,
    isoRecommended: iso,
    maxExposureSec: rule500,
    npfExposureSec: npf,
    trailExposureMin: trailMin,
    stackRecommendation: stack,
  };
}

/**
 * Generate tonight's astrophotography plan.
 */
export function computePhotoplan(
  location: ObserverLocation,
  focalMm: number = 24,
  aperture: number = 2.8,
): PhotoPlan {
  const now = new Date();
  const month = now.getMonth() + 1;
  const lat = location.latitudeDegrees;

  // Milky Way core visibility (simplified: visible Jun-Sep in northern hemisphere evenings)
  const mwVisible = month >= 5 && month <= 9 && lat > -60 && lat < 65;
  const mwCoreAz = mwVisible ? (month <= 6 ? 160 : month <= 8 ? 180 : 200) : null;
  const mwCoreTime = mwVisible ? (month <= 6 ? "12 AM – 3 AM" : month <= 8 ? "10 PM – 2 AM" : "9 PM – 12 AM") : null;

  // Moon phase (simplified)
  const jd = 2440587.5 + (now.getTime() / 86400000);
  const synodicMonth = 29.53059;
  const knownNew = 2451550.1;
  const phase = ((jd - knownNew) % synodicMonth + synodicMonth) % synodicMonth;
  const moonPercent = Math.round((1 - Math.cos((phase / synodicMonth) * 2 * Math.PI)) / 2 * 100);
  const moonless = moonPercent < 30;

  // Targets
  const targets: PhotoTarget[] = [];

  if (mwVisible) {
    targets.push({
      name: "Milky Way Core",
      type: "milky_way",
      bestTimeTonight: moonless ? mwCoreTime : "Limited — Moon too bright",
      difficulty: "intermediate",
      focalLengthRange: "14–24mm",
      description: "The galactic center rises in the southeast. Best with a wide-angle lens on a tripod.",
      tip: moonless ? "Face south and look for the bright band. Use a red flashlight to preserve night vision." : "Wait for moonset or try a narrowband filter.",
      visible: mwVisible && moonless,
    });
  }

  targets.push({
    name: "Star Trails",
    type: "star_trail",
    bestTimeTonight: "Any clear window",
    difficulty: "beginner",
    focalLengthRange: "14–35mm",
    description: "Point at Polaris for concentric circles, or any direction for arcs.",
    tip: "Set to interval mode: 30s exposures for 1-2 hours, stack in software.",
    visible: true,
  });

  // Seasonal targets
  if (month >= 6 && month <= 8) {
    targets.push({
      name: "Summer Triangle",
      type: "constellation",
      bestTimeTonight: "10 PM – 2 AM",
      difficulty: "beginner",
      focalLengthRange: "24–50mm",
      description: "Vega, Deneb, and Altair form a large triangle high overhead in summer.",
      tip: "Great first target. Include the Milky Way running through it.",
      visible: true,
    });
  }
  if (month >= 11 || month <= 3) {
    targets.push({
      name: "Orion Nebula (M42)",
      type: "deep_sky",
      bestTimeTonight: "9 PM – 1 AM",
      difficulty: "intermediate",
      focalLengthRange: "135–300mm",
      description: "The brightest nebula visible to the naked eye, in Orion's sword.",
      tip: "Stack multiple exposures. Visible even from suburban skies.",
      visible: true,
    });
  }

  targets.push({
    name: "Moon",
    type: "moon",
    bestTimeTonight: moonPercent > 10 ? "When above horizon" : null,
    difficulty: "beginner",
    focalLengthRange: "200mm+",
    description: `${moonPercent}% illuminated. Craters and maria visible at the terminator.`,
    tip: "Use a telephoto. The terminator (shadow line) shows the most detail.",
    visible: moonPercent > 10,
  });

  targets.push({
    name: "Planetary close-ups",
    type: "planet",
    bestTimeTonight: "Check visible planets",
    difficulty: "advanced",
    focalLengthRange: "1000mm+ / telescope",
    description: "Jupiter's bands and moons, Saturn's rings require high magnification.",
    tip: "Use video mode and stack frames. Atmospheric seeing matters more than aperture.",
    visible: true,
  });

  const exposure = computeExposure(focalMm, aperture);

  // Verdict
  let verdict: string;
  if (mwVisible && moonless) {
    verdict = "Excellent night for Milky Way photography";
  } else if (mwVisible && !moonless) {
    verdict = "Good for planets and Moon — Milky Way washed by moonlight";
  } else {
    verdict = `Best targets: ${month >= 11 || month <= 3 ? "Orion Nebula and winter constellations" : "star trails and planets"}`;
  }

  return {
    location,
    date: now.toISOString(),
    moonPhasePercent: moonPercent,
    moonRiseSet: "See sky data",
    darkWindowStart: "~9:30 PM",
    darkWindowEnd: "~5:15 AM",
    milkyWayCoreVisible: mwVisible && moonless,
    milkyWayCoreAz: mwCoreAz,
    milkyWayCoreTime: mwCoreTime,
    targets,
    exposure,
    goldenHourEvening: "~8:15 PM",
    blueHourEvening: "~8:45 PM",
    goldenHourMorning: "~6:15 AM",
    blueHourMorning: "~5:45 AM",
    verdict,
  };
}
