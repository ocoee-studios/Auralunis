// Stargazing-specific weather: cloud cover, seeing, transparency, dew point.
// Goes beyond basic weather to assess actual observing conditions.

export interface StargazingForecast {
  hour: number;
  cloudCoverPercent: number;
  seeingArcsec: number; // lower = better, 1" = excellent
  transparencyRating: "excellent" | "good" | "fair" | "poor";
  dewRisk: "none" | "low" | "moderate" | "high";
  windSpeedKmh: number;
  overallRating: "excellent" | "good" | "fair" | "poor" | "no_go";
  tip: string;
}

export function assessStargazingConditions(
  cloudCover: number,
  humidity: number,
  windSpeed: number,
  temperature: number,
  dewPoint: number
): StargazingForecast {
  const hour = new Date().getHours();

  // Seeing estimate (simplified — real version uses atmospheric models)
  const seeing = cloudCover > 50 ? 4.0 : windSpeed > 30 ? 3.0 : windSpeed > 15 ? 2.0 : 1.5;

  // Transparency
  const transparency: StargazingForecast["transparencyRating"] =
    humidity > 85 ? "poor" : humidity > 70 ? "fair" : humidity > 50 ? "good" : "excellent";

  // Dew risk
  const dewDiff = temperature - dewPoint;
  const dewRisk: StargazingForecast["dewRisk"] =
    dewDiff < 2 ? "high" : dewDiff < 5 ? "moderate" : dewDiff < 10 ? "low" : "none";

  // Overall
  let overall: StargazingForecast["overallRating"];
  if (cloudCover > 80) overall = "no_go";
  else if (cloudCover > 50 || humidity > 85) overall = "poor";
  else if (cloudCover > 30 || humidity > 70 || windSpeed > 30) overall = "fair";
  else if (cloudCover > 10 || humidity > 50) overall = "good";
  else overall = "excellent";

  // Tip
  const tips: Record<string, string> = {
    excellent: "Perfect conditions. Use high magnification. Deep-sky objects will pop.",
    good: "Solid night. Some high-altitude haze possible. Stick to bright targets.",
    fair: "Patchy clouds likely. Focus on bright planets and the Moon.",
    poor: "Heavy haze or clouds. Only the brightest objects visible.",
    no_go: "Sky is overcast. Indoor astronomy night — browse the Learn tab!"
  };

  return {
    hour, cloudCoverPercent: cloudCover, seeingArcsec: seeing,
    transparencyRating: transparency, dewRisk: dewRisk,
    windSpeedKmh: windSpeed, overallRating: overall,
    tip: tips[overall]
  };
}
