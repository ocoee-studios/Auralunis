// StargazingIndexService.ts — combines weather, moon, seeing, and
// transparency into ONE number: 0-100.
//
// 80-100 = GO (green)
// 50-79  = MAYBE (gold)  
// 0-49   = STAY IN (red)

export interface StargazingIndex {
  score: number;           // 0-100
  verdict: "GO" | "MAYBE" | "STAY_IN";
  color: string;           // hex color for the verdict
  cloudScore: number;      // 0-100 (100 = perfectly clear)
  moonScore: number;       // 0-100 (100 = new moon / not up)
  seeingScore: number;     // 0-100
  transparencyScore: number; // 0-100
  bestWindow: string;      // "10pm - 2am"
  summary: string;         // "Clear skies, thin crescent moon. Excellent for deep sky."
}

export function computeStargazingIndex(
  cloudCoverPercent: number,      // 0-100 (0 = clear)
  moonIlluminationPercent: number, // 0-100
  moonAltitudeDegrees: number,    // negative = below horizon
  seeingArcsec: number,           // 1-5 (1 = excellent)
  transparencyMag: number,        // limiting magnitude (higher = better)
): StargazingIndex {
  // Cloud score: 100 when clear, 0 when overcast
  const cloudScore = Math.max(0, 100 - cloudCoverPercent);

  // Moon score: 100 when new/below horizon, 0 when full + high
  const moonUp = moonAltitudeDegrees > 0;
  const moonBrightness = moonUp ? moonIlluminationPercent : 0;
  const moonScore = Math.max(0, 100 - moonBrightness);

  // Seeing score: 1 arcsec = 100, 5 arcsec = 0
  const seeingScore = Math.max(0, Math.min(100, (5 - seeingArcsec) * 25));

  // Transparency score: mag 6.5+ = 100, mag 3 = 0
  const transparencyScore = Math.max(0, Math.min(100, ((transparencyMag - 3) / 3.5) * 100));

  // Weighted combination
  const score = Math.round(
    cloudScore * 0.35 +
    moonScore * 0.25 +
    seeingScore * 0.20 +
    transparencyScore * 0.20
  );

  // Verdict
  const verdict: StargazingIndex["verdict"] =
    score >= 80 ? "GO" :
    score >= 50 ? "MAYBE" :
    "STAY_IN";

  const color =
    verdict === "GO" ? "#4CAF50" :
    verdict === "MAYBE" ? "#D9A84E" :
    "#E04848";

  // Best window estimation (simplified)
  const bestWindow = cloudScore > 60
    ? "10 PM – 2 AM"
    : cloudScore > 30
    ? "Brief clearing expected"
    : "No clear window tonight";

  // Summary
  const cloudDesc = cloudScore > 80 ? "Clear skies" : cloudScore > 50 ? "Partly cloudy" : "Mostly cloudy";
  const moonDesc = !moonUp ? "Moon below horizon" :
    moonIlluminationPercent < 10 ? "New moon" :
    moonIlluminationPercent < 40 ? "Thin crescent moon" :
    moonIlluminationPercent < 60 ? "Half moon" :
    moonIlluminationPercent < 90 ? "Gibbous moon" :
    "Full moon (bright)";
  const targetDesc = score >= 70 ? "Excellent for deep sky." :
    score >= 50 ? "Good for planets and bright objects." :
    "Best to wait for clearer conditions.";

  const summary = `${cloudDesc}, ${moonDesc.toLowerCase()}. ${targetDesc}`;

  return {
    score, verdict, color,
    cloudScore, moonScore, seeingScore, transparencyScore,
    bestWindow, summary,
  };
}
