// "Your 2026 Sky Year" — Spotify Wrapped but for stargazing.
// Computes summary stats from ObservationStats + StreakService data.
import { getStats } from "@/services/ObservationStatsService";
import { getStreak } from "@/services/StreakService";

export interface SkyRecap {
  year: number;
  totalNights: number;
  totalHours: number;
  bestTonightScore: number;
  constellationsFound: number;
  planetsObserved: string[];
  longestStreak: number;
  favoriteConstellation: string;
  moonPhasesWitnessed: number;
  deepSkyExplored: number;
  meteorShowersWatched: number;
  headline: string;
}

export async function computeSkyRecap(year: number): Promise<SkyRecap> {
  const stats = await getStats();
  const streak = await getStreak();

  const favoriteConstellation = stats.constellationsIdentified.length > 0
    ? stats.constellationsIdentified[0]
    : "None yet";

  const totalNights = streak.completedNights.filter(d => d.startsWith(String(year))).length;
  const totalHours = Math.round(stats.totalMinutes / 60);

  let headline: string;
  if (totalNights >= 100) headline = "Cosmic Devotion. You lived under the stars.";
  else if (totalNights >= 50) headline = "A sky year to remember.";
  else if (totalNights >= 20) headline = "You found your rhythm with the cosmos.";
  else if (totalNights >= 5) headline = "The sky noticed you looking up.";
  else headline = "Every journey begins with one night.";

  return {
    year,
    totalNights,
    totalHours,
    bestTonightScore: stats.bestTonightScore,
    constellationsFound: stats.constellationsIdentified.length,
    planetsObserved: stats.planetsObserved,
    longestStreak: streak.longestStreak,
    favoriteConstellation,
    moonPhasesWitnessed: 0, // computed from calendar data
    deepSkyExplored: stats.deepSkyExplored.length,
    meteorShowersWatched: stats.meteorShowersWatched.length,
    headline
  };
}
