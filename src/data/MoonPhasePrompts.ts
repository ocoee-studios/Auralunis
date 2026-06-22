import { moonPhaseName, MOON_PHASE_NAMES } from "@/services/MoonPhase";

export interface MoonPrompt { phase: string; prompt: string; reflection: string; }

export const moonPhasePrompts: MoonPrompt[] = [
  { phase: "New Moon", prompt: "What are you beginning?", reflection: "The sky is dark and quiet. New moons are for planting seeds — intentions that will grow as the light returns. Write one thing you want to start." },
  { phase: "Waxing Crescent", prompt: "What small step can you take today?", reflection: "The first sliver of light. Momentum builds from tiny actions. What's one concrete thing you can do today toward what you started at the new moon?" },
  { phase: "First Quarter", prompt: "What resistance are you meeting?", reflection: "Half-lit, half-dark. Quarter moons mark decision points — the tension between staying comfortable and pushing forward. What's challenging you right now?" },
  { phase: "Waxing Gibbous", prompt: "What needs refining?", reflection: "Almost full, but not quite. This is the phase of editing, adjusting, and preparing. What would you improve if you had one more chance before the deadline?" },
  { phase: "Full Moon", prompt: "What has come to fruition?", reflection: "Maximum light. The full moon illuminates what's been building all cycle. What can you see clearly now that was hidden two weeks ago?" },
  { phase: "Waning Gibbous", prompt: "What can you share?", reflection: "The light begins to release. After the peak comes generosity — teaching what you've learned, sharing what you've gained. What knowledge or experience can you pass on?" },
  { phase: "Last Quarter", prompt: "What can you release?", reflection: "Half-dark again. Another decision point, but this time about letting go. What habit, thought, or commitment is no longer serving you?" },
  { phase: "Waning Crescent", prompt: "What are you grateful for?", reflection: "The last whisper of light before darkness. A time for rest, gratitude, and preparing the soil for the next cycle. What from this cycle deserves your thanks?" }
];

export function getPromptForIllumination(percent: number, isWaxing: boolean): MoonPrompt {
  // Canonical phase name → matching prompt (moonPhasePrompts is in MOON_PHASE_NAMES order).
  const name = moonPhaseName(percent, isWaxing);
  const idx = MOON_PHASE_NAMES.indexOf(name as (typeof MOON_PHASE_NAMES)[number]);
  return moonPhasePrompts[idx >= 0 ? idx : 0];
}
