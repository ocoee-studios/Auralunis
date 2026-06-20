// Sky Journal — free-form entries with optional AI cosmic reflection.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { askSkyCompanion } from "@/services/AISkyCompanionService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

const KEY = "auralunis.journal";

export interface SkyJournalEntry {
  id: string;
  date: string;
  body: string;
  moonPercent: number;
  tonightScore: number;
  aiReflection?: string;
}

export async function getJournal(): Promise<SkyJournalEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function addJournalEntry(
  body: string,
  moonPercent: number,
  tonightScore: number,
  location?: ObserverLocation,
  apiKey?: string
): Promise<SkyJournalEntry> {
  const entries = await getJournal();
  const entry: SkyJournalEntry = {
    id: `journal_${Date.now()}`,
    date: new Date().toISOString(),
    body, moonPercent, tonightScore
  };

  // Optional AI reflection
  if (apiKey && location) {
    const prompt = `The user just finished stargazing and wrote this journal entry: "${body}". Tonight's sky had a ${moonPercent}% Moon and a Tonight Score of ${tonightScore}. Reflect their words back through a cosmic lens in 2-3 poetic but grounded sentences. Don't repeat their words — transform them.`;
    const answer = await askSkyCompanion(prompt, location, apiKey);
    if (answer.source === "ai") {
      entry.aiReflection = answer.answer;
    }
  }

  entries.push(entry);
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
  return entry;
}
