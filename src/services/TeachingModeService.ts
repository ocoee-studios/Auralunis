// Teaching Mode — simplified interface for children and beginners.
// Bigger text, guided challenges, celebration animations.
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "auralunis.teaching";

export interface TeachingChallenge {
  id: string;
  title: string;
  instruction: string;
  targetBody: string;
  difficulty: "easy" | "medium" | "hard";
  celebrationEmoji: string;
  funFact: string;
}

export const teachingChallenges: TeachingChallenge[] = [
  { id: "find_moon", title: "Find the Moon!", instruction: "Look up and find the Moon in the sky. Can you see it? What shape is it tonight?", targetBody: "moon", difficulty: "easy", celebrationEmoji: "🌙", funFact: "The Moon is about 384,400 km away. That's like driving around Earth 10 times!" },
  { id: "find_brightest", title: "Find the Brightest Star", instruction: "Look at all the stars. Which one seems brightest? Point at it!", targetBody: "any", difficulty: "easy", celebrationEmoji: "⭐", funFact: "The brightest star you can usually see is Sirius. It's actually two stars orbiting each other!" },
  { id: "find_venus", title: "Spot Venus", instruction: "Look low in the west just after sunset. Can you see a very bright 'star' that doesn't twinkle? That's Venus!", targetBody: "venus", difficulty: "easy", celebrationEmoji: "✨", funFact: "Venus is so hot that lead would melt on its surface! It's 465°C." },
  { id: "find_jupiter", title: "Spot Jupiter", instruction: "Look for a bright, steady light. Jupiter doesn't twinkle like stars do because it's a planet!", targetBody: "jupiter", difficulty: "easy", celebrationEmoji: "🪐", funFact: "Jupiter is so big that 1,300 Earths could fit inside it!" },
  { id: "find_dipper", title: "Find the Big Dipper", instruction: "Look north. Can you find 7 stars that look like a giant ladle or cup with a handle?", targetBody: "uma", difficulty: "medium", celebrationEmoji: "🏆", funFact: "The two stars at the end of the cup point to Polaris, the North Star!" },
  { id: "find_orion", title: "Find Orion's Belt", instruction: "Look for three bright stars in a straight line. That's Orion's belt! He's a hunter from ancient stories.", targetBody: "ori", difficulty: "medium", celebrationEmoji: "🎯", funFact: "The middle star of Orion's belt is about 1,200 light-years away. The light you see left that star when medieval castles were being built!" },
  { id: "count_stars", title: "Count the Stars", instruction: "Pick a small area of sky (about the size of your fist held at arm's length). Count every star you can see in that area!", targetBody: "any", difficulty: "medium", celebrationEmoji: "🔢", funFact: "On a really dark night, you can see about 2,500 stars. But our galaxy has over 100 billion!" },
  { id: "find_milky_way", title: "Find the Milky Way", instruction: "You need a REALLY dark sky for this. Look for a faint, cloudy band stretching across the sky. That's our galaxy seen from the inside!", targetBody: "milky_way", difficulty: "hard", celebrationEmoji: "🌌", funFact: "You are inside the Milky Way right now! When you see it in the sky, you're looking through the flat disk of our galaxy." }
];

export interface TeachingProgress {
  completedChallenges: string[];
  teachingModeEnabled: boolean;
}

export async function getTeachingProgress(): Promise<TeachingProgress> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { completedChallenges: [], teachingModeEnabled: false };
  } catch { return { completedChallenges: [], teachingModeEnabled: false }; }
}

export async function completeTeachingChallenge(challengeId: string): Promise<TeachingProgress> {
  const progress = await getTeachingProgress();
  if (!progress.completedChallenges.includes(challengeId)) {
    progress.completedChallenges.push(challengeId);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(progress));
  return progress;
}

export async function toggleTeachingMode(enabled: boolean): Promise<void> {
  const progress = await getTeachingProgress();
  progress.teachingModeEnabled = enabled;
  await AsyncStorage.setItem(KEY, JSON.stringify(progress));
}
