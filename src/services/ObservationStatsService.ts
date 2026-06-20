import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "auralunis.stats";

export interface ObservationStats {
  totalSessions: number;
  totalMinutes: number;
  constellationsIdentified: string[];
  planetsObserved: string[];
  deepSkyExplored: string[];
  bestTonightScore: number;
  meteorShowersWatched: string[];
  lateNightSessions: number;
  seasonsObserved: string[];
  firstSessionDate: string | null;
}

const EMPTY: ObservationStats = {
  totalSessions: 0, totalMinutes: 0, constellationsIdentified: [],
  planetsObserved: [], deepSkyExplored: [], bestTonightScore: 0,
  meteorShowersWatched: [], lateNightSessions: 0, seasonsObserved: [],
  firstSessionDate: null
};

export async function getStats(): Promise<ObservationStats> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch { return { ...EMPTY }; }
}

export async function recordObservation(update: {
  minutes?: number;
  constellation?: string;
  planet?: string;
  deepSky?: string;
  tonightScore?: number;
  meteorShower?: string;
  isLateNight?: boolean;
}): Promise<ObservationStats> {
  const stats = await getStats();
  stats.totalSessions += 1;
  if (!stats.firstSessionDate) stats.firstSessionDate = new Date().toISOString();
  if (update.minutes) stats.totalMinutes += update.minutes;
  if (update.constellation && !stats.constellationsIdentified.includes(update.constellation)) {
    stats.constellationsIdentified.push(update.constellation);
  }
  if (update.planet && !stats.planetsObserved.includes(update.planet)) {
    stats.planetsObserved.push(update.planet);
  }
  if (update.deepSky && !stats.deepSkyExplored.includes(update.deepSky)) {
    stats.deepSkyExplored.push(update.deepSky);
  }
  if (update.tonightScore && update.tonightScore > stats.bestTonightScore) {
    stats.bestTonightScore = update.tonightScore;
  }
  if (update.meteorShower && !stats.meteorShowersWatched.includes(update.meteorShower)) {
    stats.meteorShowersWatched.push(update.meteorShower);
  }
  if (update.isLateNight) stats.lateNightSessions += 1;

  const month = new Date().getMonth();
  const season = month < 3 ? "winter" : month < 6 ? "spring" : month < 9 ? "summer" : "autumn";
  if (!stats.seasonsObserved.includes(season)) stats.seasonsObserved.push(season);

  await AsyncStorage.setItem(KEY, JSON.stringify(stats));
  return stats;
}
