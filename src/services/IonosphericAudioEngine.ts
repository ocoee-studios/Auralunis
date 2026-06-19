// IonosphericAudioEngine.ts
// Live audio engine for Ionospheric Static mode.
// Plays and crossfades looping ambient audio driven by real-time alignmentScore.
//
// Audio architecture:
//   - Two "deck" Sound objects (like a DJ crossfader)
//   - Deck A plays the current phase's noise loop
//   - Deck B is preloaded with the next phase loop
//   - On phase change: fade A out, fade B in, swap
//   - Chime layer: a separate Sound fires on interval when score > 50
//
// Asset files required: see assets/audio/README.md
// Graceful degradation: if files aren't present, engine runs silently.
//
// Usage:
//   const engine = new IonosphericAudioEngine();
//   await engine.init();
//   engine.update(alignmentScore, isLocked);    // call on every alignment tick
//   engine.destroy();                            // on unmount

import { Audio } from "expo-av";
import type { AVPlaybackStatus } from "expo-av";
import { computeStaticParams, type StaticPhase } from "./IonosphericStaticService";

// Typed locally — expo-av Sound API matches these signatures at runtime
type SoundObject = { sound: InstanceType<typeof Audio.Sound> };

const NOISE_ASSETS: Record<string, number | null> = {
  "static-brown": null, // require("../../assets/audio/static-brown.mp3") — uncomment when file exists
  "static-pink":  null, // require("../../assets/audio/static-pink.mp3")
};

const CHIME_ASSETS: Record<string, number | null> = {
  "chime-220": null,    // require("../../assets/audio/chime-220.mp3")
  "chime-440": null,    // require("../../assets/audio/chime-440.mp3")
  "chime-528": null,    // require("../../assets/audio/chime-528.mp3")
};

const PHASE_NOISE: Record<StaticPhase, string> = {
  "deep-static":  "static-brown",
  "approaching":  "static-pink",
  "data-chime":   "static-pink",
  "locked":       "static-pink",
};

const PHASE_CHIME: Record<StaticPhase, string | null> = {
  "deep-static":  null,
  "approaching":  "chime-220",
  "data-chime":   "chime-440",
  "locked":       "chime-528",
};

const FADE_STEPS = 10;
const FADE_INTERVAL_MS = 40; // 400ms total fade

export class IonosphericAudioEngine {
  private deckA: Audio.Sound | null = null;
  private deckB: Audio.Sound | null = null;
  private chimeSound: Audio.Sound | null = null;

  private currentPhase: StaticPhase | null = null;
  private currentVolume = 0;
  private chimeInterval: ReturnType<typeof setInterval> | null = null;
  private isMuted = false;
  private isDestroyed = false;
  private assetsAvailable = false;

  async init(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,  // play through silent switch — user controls via in-app mute toggle
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Check if assets are bundled — graceful no-op if not
      this.assetsAvailable = Object.values(NOISE_ASSETS).some(a => a !== null);
    } catch {
      // Audio init failure is non-fatal — continue in silent mode
    }
  }

  /** Call on every alignment update (score 0-100, isLocked) */
  update(alignmentScore: number, isLocked: boolean): void {
    if (this.isDestroyed || this.isMuted) return;
    const params = computeStaticParams(alignmentScore, isLocked);
    this.setPhase(params.phase, params.volume);
    this.setChime(params.phase, params.chimeInterval);
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.deckA?.setVolumeAsync(0).catch(() => {});
      this.deckB?.setVolumeAsync(0).catch(() => {});
      this.stopChime();
    }
  }

  private async setPhase(phase: StaticPhase, targetVolume: number): Promise<void> {
    if (phase === this.currentPhase) {
      // Same phase — just update volume
      this.currentVolume = targetVolume;
      await this.deckA?.setVolumeAsync(targetVolume).catch(() => {});
      return;
    }

    if (!this.assetsAvailable) {
      this.currentPhase = phase;
      this.currentVolume = targetVolume;
      return;
    }

    const noiseKey = PHASE_NOISE[phase];
    const asset = NOISE_ASSETS[noiseKey];
    if (!asset) {
      this.currentPhase = phase;
      return;
    }

    try {
      // Load deck B with new phase
      const { sound: newSound } = await Audio.Sound.createAsync(
        asset as Parameters<typeof Audio.Sound.createAsync>[0],
        { isLooping: true, volume: 0 }
      );

      const oldDeck = this.deckA;

      // Start new deck silently
      await newSound.playAsync();
      this.deckB = newSound;

      // Crossfade: fade old deck out, new deck in
      await this.crossfade(oldDeck, newSound, targetVolume);

      // Unload old deck
      await oldDeck?.unloadAsync().catch(() => {});
      this.deckA = this.deckB;
      this.deckB = null;
      this.currentPhase = phase;
      this.currentVolume = targetVolume;
    } catch {
      // Graceful fail — continue without audio change
    }
  }

  private async crossfade(
    outSound: Audio.Sound | null,
    inSound: Audio.Sound,
    targetVolume: number
  ): Promise<void> {
    return new Promise(resolve => {
      let step = 0;
      const interval = setInterval(async () => {
        if (this.isDestroyed) { clearInterval(interval); resolve(); return; }
        step++;
        const progress = step / FADE_STEPS;
        await Promise.all([
          outSound?.setVolumeAsync(Math.max(0, this.currentVolume * (1 - progress))).catch(() => {}),
          inSound.setVolumeAsync(Math.min(targetVolume, targetVolume * progress)).catch(() => {}),
        ]);
        if (step >= FADE_STEPS) { clearInterval(interval); resolve(); }
      }, FADE_INTERVAL_MS);
    });
  }

  private setChime(phase: StaticPhase, intervalMs: number): void {
    const chimeKey = PHASE_CHIME[phase];

    if (!chimeKey || intervalMs === 0 || !this.assetsAvailable) {
      this.stopChime();
      return;
    }

    const asset = CHIME_ASSETS[chimeKey];
    if (!asset) { this.stopChime(); return; }

    // Reset interval if it changed
    if (this.chimeInterval) clearInterval(this.chimeInterval);

    this.chimeInterval = setInterval(async () => {
      if (this.isDestroyed || this.isMuted) return;
      try {
        if (!this.chimeSound) {
          const { sound } = await Audio.Sound.createAsync(
            asset as Parameters<typeof Audio.Sound.createAsync>[0],
            { volume: 0.4 }
          );
          this.chimeSound = sound;
        }
        await this.chimeSound.replayAsync();
      } catch {
        // Non-fatal
      }
    }, intervalMs);
  }

  private stopChime(): void {
    if (this.chimeInterval) {
      clearInterval(this.chimeInterval);
      this.chimeInterval = null;
    }
    this.chimeSound?.unloadAsync().catch(() => {});
    this.chimeSound = null;
  }

  async destroy(): Promise<void> {
    this.isDestroyed = true;
    this.stopChime();
    await Promise.all([
      this.deckA?.unloadAsync().catch(() => {}),
      this.deckB?.unloadAsync().catch(() => {}),
    ]);
    this.deckA = null;
    this.deckB = null;
  }
}

// Singleton for use across the session — one engine shared by the screen
let _engine: IonosphericAudioEngine | null = null;

export function getIonosphericEngine(): IonosphericAudioEngine {
  if (!_engine) _engine = new IonosphericAudioEngine();
  return _engine;
}

export async function destroyIonosphericEngine(): Promise<void> {
  await _engine?.destroy();
  _engine = null;
}
