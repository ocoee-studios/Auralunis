// Guided breathing synced to astronomical light-travel distances.
// Inhale/exhale durations computed from actual celestial bodies visible tonight.
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

export interface MeditationSession {
  title: string;
  body: string;
  cycles: BreathCycle[];
  totalDurationSeconds: number;
}

export interface BreathCycle {
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
  label: string;
  fact: string;
}

const LIGHT_TRAVEL: Record<string, { seconds: number; fact: string }> = {
  moon: { seconds: 1.3, fact: "Light from the Moon reaches you in 1.3 seconds." },
  sun: { seconds: 499, fact: "Sunlight takes 8 minutes 19 seconds to reach Earth." },
  venus: { seconds: 135, fact: "At closest approach, light from Venus takes 2.25 minutes." },
  mars: { seconds: 187, fact: "Light from Mars takes about 3 minutes at closest." },
  jupiter: { seconds: 2595, fact: "Jupiter's light travels 43 minutes to reach you." },
  saturn: { seconds: 4800, fact: "Saturn's light has traveled 80 minutes to reach your eyes." }
};

function compress(realSeconds: number, min: number, max: number): number {
  // Compress cosmic timescales into breathable durations
  const log = Math.log10(Math.max(1, realSeconds));
  return Math.max(min, Math.min(max, log * 2));
}

export function generateMeditation(location: ObserverLocation): MeditationSession {
  const sky = computeTonightSky(location);
  const visible = sky.visibleBodies.filter(b => LIGHT_TRAVEL[b.id]);

  if (visible.length === 0) {
    // Fallback: Moon-based meditation
    visible.push({ id: "moon", name: "Moon" } as never);
  }

  const cycles: BreathCycle[] = visible.slice(0, 4).map(body => {
    const data = LIGHT_TRAVEL[body.id] ?? LIGHT_TRAVEL.moon;
    const inhale = compress(data.seconds, 3, 8);
    const hold = Math.round(inhale * 0.5 * 10) / 10;
    const exhale = Math.round(inhale * 1.5 * 10) / 10;
    return {
      inhaleSeconds: Math.round(inhale * 10) / 10,
      holdSeconds: hold,
      exhaleSeconds: exhale,
      label: `Breathe with ${body.name}`,
      fact: data.fact
    };
  });

  const total = cycles.reduce((sum, c) => sum + (c.inhaleSeconds + c.holdSeconds + c.exhaleSeconds) * 3, 0);

  return {
    title: "Celestial Breath",
    body: `Tonight's meditation is synced to ${visible.map(b => b.name).join(", ")}. Each breath mirrors the time light takes to travel from these worlds to your eyes.`,
    cycles,
    totalDurationSeconds: Math.round(total)
  };
}
