// Tracks nightly completion for the 30 Nights beginner path.
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "auralunis.streak";

interface StreakState {
  completedNights: string[]; // ISO date strings
  currentStreak: number;
  longestStreak: number;
}

async function load(): Promise<StreakState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fresh state */ }
  return { completedNights: [], currentStreak: 0, longestStreak: 0 };
}

async function save(state: StreakState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function completeNight(): Promise<StreakState> {
  const state = await load();
  const today = todayKey();
  if (state.completedNights.includes(today)) return state;

  state.completedNights.push(today);

  // Compute streak
  const sorted = [...state.completedNights].sort().reverse();
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86_400_000;
    if (diff <= 1.5) streak++;
    else break;
  }
  state.currentStreak = streak;
  state.longestStreak = Math.max(state.longestStreak, streak);

  await save(state);
  return state;
}

export async function getStreak(): Promise<StreakState> {
  return load();
}
