// Constellation tracing challenge — user draws lines on a star field,
// app scores accuracy against actual constellation geometry.
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "auralunis.constellation_challenge";

export interface ConstellationChallenge {
  constellationId: string;
  name: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  starCount: number;
  lineCount: number;
  bestScore: number;
  attempts: number;
  completed: boolean;
}

export const challenges: ConstellationChallenge[] = [
  { constellationId: "uma", name: "Big Dipper (Ursa Major)", difficulty: "beginner", starCount: 7, lineCount: 6, bestScore: 0, attempts: 0, completed: false },
  { constellationId: "ori", name: "Orion", difficulty: "beginner", starCount: 7, lineCount: 7, bestScore: 0, attempts: 0, completed: false },
  { constellationId: "cas", name: "Cassiopeia", difficulty: "beginner", starCount: 5, lineCount: 4, bestScore: 0, attempts: 0, completed: false },
  { constellationId: "cyg", name: "Cygnus", difficulty: "beginner", starCount: 5, lineCount: 4, bestScore: 0, attempts: 0, completed: false },
  { constellationId: "leo", name: "Leo", difficulty: "intermediate", starCount: 9, lineCount: 9, bestScore: 0, attempts: 0, completed: false },
  { constellationId: "sco", name: "Scorpius", difficulty: "intermediate", starCount: 13, lineCount: 12, bestScore: 0, attempts: 0, completed: false },
  { constellationId: "gem", name: "Gemini", difficulty: "intermediate", starCount: 8, lineCount: 7, bestScore: 0, attempts: 0, completed: false },
  { constellationId: "sgr", name: "Sagittarius", difficulty: "advanced", starCount: 8, lineCount: 7, bestScore: 0, attempts: 0, completed: false },
  { constellationId: "vir", name: "Virgo", difficulty: "advanced", starCount: 11, lineCount: 10, bestScore: 0, attempts: 0, completed: false },
  { constellationId: "ser", name: "Serpens", difficulty: "advanced", starCount: 7, lineCount: 6, bestScore: 0, attempts: 0, completed: false }
];

export async function getChallengeProgress(): Promise<ConstellationChallenge[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [...challenges];
  } catch { return [...challenges]; }
}

export async function recordChallengeAttempt(
  constellationId: string,
  score: number
): Promise<ConstellationChallenge[]> {
  const progress = await getChallengeProgress();
  const challenge = progress.find(c => c.constellationId === constellationId);
  if (challenge) {
    challenge.attempts += 1;
    challenge.bestScore = Math.max(challenge.bestScore, score);
    if (score >= 80) challenge.completed = true;
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(progress));
  return progress;
}
