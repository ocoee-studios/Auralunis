// Sky achievement badges. Tracked in AsyncStorage, displayed in the Vault.
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "chronaura.badges";

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: string;
  threshold: number;
}

export interface BadgeProgress {
  badgeId: string;
  current: number;
  earned: boolean;
  earnedAt?: string;
}

export const badges: Badge[] = [
  { id: "first_light", name: "First Light", icon: "✦", description: "Completed your first observation session.", requirement: "sessions", threshold: 1 },
  { id: "week_watcher", name: "Week Watcher", icon: "🌙", description: "Observed 7 nights.", requirement: "sessions", threshold: 7 },
  { id: "full_cycle", name: "Full Cycle", icon: "◯", description: "Observed all moon phases.", requirement: "moon_phases", threshold: 8 },
  { id: "planet_spotter", name: "Planet Spotter", icon: "♃", description: "Identified all 5 naked-eye planets.", requirement: "planets_seen", threshold: 5 },
  { id: "deep_diver", name: "Deep Diver", icon: "🌌", description: "Explored 10 deep-sky objects.", requirement: "deep_sky", threshold: 10 },
  { id: "constellation_hunter", name: "Constellation Hunter", icon: "⭐", description: "Identified 20 constellations.", requirement: "constellations", threshold: 20 },
  { id: "night_owl", name: "Night Owl", icon: "🦉", description: "Observed past midnight 5 times.", requirement: "late_sessions", threshold: 5 },
  { id: "meteor_watcher", name: "Meteor Watcher", icon: "☄", description: "Watched during 3 meteor showers.", requirement: "meteor_showers", threshold: 3 },
  { id: "thirty_nights", name: "30 Nights Complete", icon: "🏆", description: "Completed the 30 Nights beginner path.", requirement: "nights_completed", threshold: 30 },
  { id: "vault_keeper", name: "Vault Keeper", icon: "🔐", description: "Saved 50 items to the Cosmic Vault.", requirement: "vault_items", threshold: 50 },
  { id: "perfect_night", name: "Perfect Night", icon: "💎", description: "Observed on a night with Tonight Score above 90.", requirement: "best_score", threshold: 90 },
  { id: "year_watcher", name: "Year Watcher", icon: "🌟", description: "Observed across all four seasons.", requirement: "seasons", threshold: 4 }
];

export async function getProgress(): Promise<BadgeProgress[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : badges.map(b => ({ badgeId: b.id, current: 0, earned: false }));
  } catch { return badges.map(b => ({ badgeId: b.id, current: 0, earned: false })); }
}

export async function incrementBadge(requirementType: string, amount: number = 1): Promise<BadgeProgress[]> {
  const progress = await getProgress();
  for (const p of progress) {
    const badge = badges.find(b => b.id === p.badgeId);
    if (badge && badge.requirement === requirementType && !p.earned) {
      p.current = Math.min(p.current + amount, badge.threshold);
      if (p.current >= badge.threshold) {
        p.earned = true;
        p.earnedAt = new Date().toISOString();
      }
    }
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(progress));
  return progress;
}

export async function checkBadge(requirementType: string, value: number): Promise<BadgeProgress[]> {
  const progress = await getProgress();
  for (const p of progress) {
    const badge = badges.find(b => b.id === p.badgeId);
    if (badge && badge.requirement === requirementType && !p.earned) {
      p.current = Math.max(p.current, value);
      if (p.current >= badge.threshold) {
        p.earned = true;
        p.earnedAt = new Date().toISOString();
      }
    }
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(progress));
  return progress;
}
