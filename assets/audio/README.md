# Ionospheric Static Audio Assets

These files are required by `IonosphericAudioEngine.ts`.
Generate or source them as follows:

## Required files

| File | Description | Duration | Source suggestion |
|---|---|---|---|
| `static-brown.mp3` | Brown/red noise loop — deep space ambient | 10s loop | freesound.org #75347 or generate via Audacity "Brown Noise" |
| `static-pink.mp3` | Pink noise loop — atmospheric approaching | 10s loop | freesound.org or Audacity "Pink Noise" |
| `chime-220.mp3` | Pure sine tone at 220 Hz | 2s fade-out | Audacity "Tone" generator |
| `chime-440.mp3` | Pure sine tone at 440 Hz (A4) | 2s fade-out | Audacity "Tone" generator |
| `chime-528.mp3` | Pure sine tone at 528 Hz | 3s fade-out | Audacity "Tone" generator |
| `lock-resolve.mp3` | Ascending chord resolving to clean tone | 3s | Compose or freesound.org |

## Quick generation with Audacity (free)

1. Generate > Noise > Color: Brown/Pink, Duration: 10s → Export as MP3
2. Generate > Tone > Sine, Frequency: 220/440/528, Duration: 2s → Export
3. Effect > Fade Out on the chime files

## Placeholder behavior

Until these files exist, `IonosphericAudioEngine` operates in
"params-only" mode — UI shows synthesis parameters without audio.
The engine gracefully catches load errors and continues silently.
