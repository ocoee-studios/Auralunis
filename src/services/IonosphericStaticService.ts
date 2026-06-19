// IonosphericStaticService.ts
// Ionospheric Static — generates audio parameters for the cosmic ambient layer.
// The actual audio is played via expo-av (or Web Audio API in previews).
// This service computes the synthesis parameters from tracking state.
// No audio files needed — all synthesis parameters are pure math.

export type StaticPhase = "deep-static" | "approaching" | "data-chime" | "locked";

export interface StaticParams {
  phase: StaticPhase;
  /** Base noise frequency band (Hz) */
  noiseFrequency: number;
  /** Chime frequency when near lock (Hz) — 0 = no chime */
  chimeFrequency: number;
  /** Chime repeat interval (ms) — 0 = no chime */
  chimeInterval: number;
  /** Master volume 0..1 */
  volume: number;
  /** Noise color: "white" | "pink" | "brown" */
  noiseColor: "white" | "pink" | "brown";
  /** Human description for UI */
  description: string;
}

/** Map alignment score (0-100) and lock state to synthesis parameters */
export function computeStaticParams(alignmentScore: number, isLocked: boolean): StaticParams {
  if (isLocked) {
    return {
      phase: "locked",
      noiseFrequency: 0,
      chimeFrequency: 528,   // "love frequency" — satisfying clear tone
      chimeInterval: 0,       // continuous
      volume: 0.6,
      noiseColor: "pink",
      description: "Signal acquired — clean carrier wave locked.",
    };
  }

  if (alignmentScore > 80) {
    return {
      phase: "data-chime",
      noiseFrequency: 1200,
      chimeFrequency: 440,
      chimeInterval: 180,
      volume: 0.55,
      noiseColor: "pink",
      description: "Data chime — carrier signal emerging from noise.",
    };
  }

  if (alignmentScore > 50) {
    return {
      phase: "approaching",
      noiseFrequency: 800,
      chimeFrequency: 220,
      chimeInterval: 500,
      volume: 0.45,
      noiseColor: "pink",
      description: "Atmospheric static thinning — bearing on signal.",
    };
  }

  // Deep empty space
  return {
    phase: "deep-static",
    noiseFrequency: 400,
    chimeFrequency: 0,
    chimeInterval: 0,
    volume: 0.3,
    noiseColor: "brown",
    description: "Deep space static — no signals detected.",
  };
}

/** Direction labels for "you're pointing at ground / horizon / space" */
export function elevationAudioLabel(devicePitch: number): string {
  if (devicePitch < -30) return "Through Earth · Deep static field";
  if (devicePitch < 0)   return "Below horizon · Ground scatter";
  if (devicePitch < 10)  return "Near horizon · Atmospheric boundary";
  if (devicePitch < 45)  return "Low orbit band · LEO traffic";
  return "Deep space · GEO and beyond";
}

/** Ionospheric Static UI color per phase */
export const STATIC_COLORS: Record<StaticPhase, string> = {
  "deep-static":  "#747D90",
  "approaching":  "#78C8FF",
  "data-chime":   "#D4AF37",
  "locked":       "#4ADE80",
};
