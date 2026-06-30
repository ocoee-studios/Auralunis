// learnPreferences.ts — persisted Learn personalization: skill level + interests.
// Used by the Settings "Learning Preferences" editor and the Learn screen, which sorts
// categories (interests first) and lessons (matching skill level first).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export const LEARN_LEVEL_KEY = "learn_level";
export const LEARN_INTERESTS_KEY = "learn_interests";

export type LearnLevel = "beginner" | "intermediate" | "advanced";
// Interest keys are exactly the LearnCategoryId values they map to.
export type LearnInterest = "planets" | "stars" | "constellations" | "deep_sky" | "moon" | "milky_way";

export const LEARN_LEVELS: { key: LearnLevel; label: string }[] = [
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" }
];

export const LEARN_INTERESTS: { key: LearnInterest; label: string }[] = [
  { key: "planets", label: "Planets" },
  { key: "stars", label: "Stars" },
  { key: "constellations", label: "Constellations" },
  { key: "deep_sky", label: "Deep Sky" },
  { key: "moon", label: "Moon" },
  { key: "milky_way", label: "Milky Way" }
];

export type LearnPreferences = { level: LearnLevel | null; interests: LearnInterest[] };

const VALID_LEVELS = new Set<string>(LEARN_LEVELS.map((l) => l.key));
const VALID_INTERESTS = new Set<string>(LEARN_INTERESTS.map((i) => i.key));

export async function loadLearnPreferences(): Promise<LearnPreferences> {
  try {
    const [lvl, ints] = await Promise.all([
      AsyncStorage.getItem(LEARN_LEVEL_KEY),
      AsyncStorage.getItem(LEARN_INTERESTS_KEY)
    ]);
    const level = lvl && VALID_LEVELS.has(lvl) ? (lvl as LearnLevel) : null;
    let interests: LearnInterest[] = [];
    if (ints) {
      try {
        const parsed = JSON.parse(ints);
        if (Array.isArray(parsed)) interests = parsed.filter((x) => VALID_INTERESTS.has(x)) as LearnInterest[];
      } catch {
        /* corrupt → ignore */
      }
    }
    return { level, interests };
  } catch {
    return { level: null, interests: [] };
  }
}

export async function saveLearnLevel(level: LearnLevel): Promise<void> {
  try {
    await AsyncStorage.setItem(LEARN_LEVEL_KEY, level);
  } catch {
    /* best-effort */
  }
}

export async function saveLearnInterests(interests: LearnInterest[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LEARN_INTERESTS_KEY, JSON.stringify(interests));
  } catch {
    /* best-effort */
  }
}

// Loads preferences and re-loads on focus/refresh. The Learn screen calls reload() so it
// reflects edits made in Settings without a full remount.
export function useLearnPreferences() {
  const [prefs, setPrefs] = useState<LearnPreferences>({ level: null, interests: [] });
  const reload = useCallback(() => {
    let active = true;
    loadLearnPreferences().then((p) => {
      if (active) setPrefs(p);
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => reload(), [reload]);
  return { prefs, reload };
}
