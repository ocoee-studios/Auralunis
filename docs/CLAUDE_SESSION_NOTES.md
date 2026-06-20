# AuraLunis — Claude Build Session Notes

> **Purpose:** Running record of every feature, service, and architectural decision made during AI-assisted development sessions. Updated after each major session. Use this to orient any new AI agent or developer picking up the project.

---

## Session Overview

All development done collaboratively by Mrs. Pepper (Ocoee Studios) and Claude (Anthropic). Claude serves as primary developer — writing, committing, and pushing all code. Gemini (Google) provides feature ideation only; all implementation is done here.

**Repository:** `jamiebzzz-stack/auralunis` (private)
**Stack:** React Native / Expo SDK 51 / TypeScript
**Total commits:** ~60+ across all sessions

---

## What Was Built (Chronological)

### Phase 1 — Orbital Alignment Foundation

**Files created:**
- `src/utils/alignmentEngine.ts` — pure bearing/elevation math. `SpatialTarget` interface (id, name, lat, lon, altitudeKm, decayAlert?, velocityKms?). `calculateAlignment()` returns azimuthDiff, elevationDiff, alignmentScore (0-100), isLocked (threshold 3.5°).
- `src/utils/hapticController.ts` — proximity haptic cadence class. Score-based zones: silent ≤70, 500ms tick 70-85, 250ms tick >85, one-shot lock pulse. Uses WatchHaptics (CoreHaptics).
- `src/components/SpaceRadarGrid.tsx` — SVG radar with multi-blip fleet, Horizon Scope curve, debris flash, decay alert pulse, spring-animated blips via Reanimated UI thread.
- `src/components/SatelliteDataCard.tsx` — bottom-sheet retro data card. Slides up on blip tap. Shows class, NORAD ID, launch year, agency, mission, live az/el/alignment.
- `src/screens/OrbitalAlignmentScreen.tsx` — the main tracking screen (see full mode inventory below).

**Key architectural decision:** `SpatialTarget` has no TLE fields — propagation stays in service layer. The alignment engine is pure math only.

---

### Phase 2 — CoreHaptics Native Modules

**Files created:**
- `apple-native/iOS/AuraLunisHaptics/AuraLunisHapticsModule.swift` — Expo Module (matches `ExpoModulesCore` pattern). Two CoreHaptics patterns: `triggerCompassTick()` (transient, intensity 0.6, sharpness 0.8) and `triggerLockPulse()` (continuous 0.4s, intensity 1.0, sharpness 0.4).
- `apple-native/watchOS/AuraLunisWatch/Haptics/AuraLunisWatchHapticsEngine.swift` — standalone CoreHaptics engine for the watchOS target. `respondToScore()` convenience method for WatchConnectivity receive handler.
- `src/modules/WatchHaptics.ts` — JS interface. Lazy-loads via `requireNativeModule("AuraLunisHaptics")`. iOS-only guard. Safe in Expo Go.

**Note for Xcode:** Add `AuraLunisHapticsModule.swift` to iOS app target Compile Sources. Link `CoreHaptics.framework`. Expo Modules Core handles registration — no AppDelegate changes needed.

---

### Phase 3 — App Store Compliance

**Files created:**
- `public/PRIVACY.md` — full privacy policy covering orbital alignment, motion sensors, GPS, anonymized analytics. Includes App Store nutrition label table. Host at `ocoeestudios.com/auralunis/privacy`.
- `public/TERMS.md` — EULA with orbital alignment safety notice, correct pricing, TLE accuracy disclaimer.
- `public/APP_STORE_REVIEW_NOTES.md` — paste into App Store Connect review notes. Explains Simulation Mode for static lab testing.

---

### Phase 4 — Atmosphere Explorer (Multi-Satellite Fleet)

**Files created:**
- `src/data/AtmosphereCatalog.ts` — 6 LEO satellite registry: ISS (gold #D9A84E), Hubble (blue #78C8FF), Starlink x2 (violet #A78BFA), NOAA-20 (green #4ADE80), Terra (light gold #FFF6D6). Each has NORAD ID, launch year, agency, mission, status, altitudeKm, radarColor.
- `src/services/AtmosphereExplorerService.ts` — fleet simulation with per-satellite drift rates. `computeFleetState()` runs `calculateAlignment()` on every satellite and returns sorted by angular error. `syncLiveTLEData()` upgrades ISS and Starlink positions from Celestrak on mode entry.

---

### Phase 5 — Four Premium Tracking Features

**Files created:**
- `src/services/CosmicDriftService.ts` — Cosmic Drift Galaxy Diary. Every 100% lock event persisted to AsyncStorage. `recordLock()` deduplicates within 60s. Deterministic particle coordinates seeded from timestamp (stable galaxy layout). `approximateLocation()` for human-readable region labels without API key.
- `src/components/CosmicDriftGalaxy.tsx` — rotating SVG particle cloud. Each star = one real lock event, colored by target radarColor, depth-projected. Tapping a star opens telemetry modal. Lock history list below. Empty state for new users.
- `src/utils/planetaryEphemeris.ts` — full Keplerian orbital model (JPL low-precision elements) for all 7 planets. ~1° accuracy over 10-year window. `computePlanetaryTargets()` returns SpatialTarget-compatible objects with pre-computed az/alt. `planetAlignmentDiff()` for direct comparison without haversine.
- `src/services/StarlinkTrainService.ts` — now live-data enabled (see Phase 7). Originally mocked 28-node train.
- `src/services/ChronoLightService.ts` — USNO solar position algorithm (~0.01°). `computeSunPosition()` returns az, el, phase, isGoldenHour, isMagicHour flags. `findNextGoldenEvents()` scans 24h forward in 1-min steps. `formatCountdown()` for UI display.

---

### Phase 6 — Six More Premium Features

**Files created:**
- `src/services/MeteorShowerService.ts` — 6 major showers (Perseids, Geminids, Leonids, Orionids, Quadrantids, Eta Aquariids) with real radiant RA/Dec. `getActiveShowers()` converts radiant to az/alt, computes angular error, returns sonar ping interval (80/250/600ms).
- `src/services/SpaceDebrisService.ts` — now live-data enabled (see Phase 7). Debris mission loop with 5s lock cataloguing.
- `src/services/SkyAlignmentChainService.ts` — daily multi-target puzzle generator. 6 chain templates seeded from date hash (all users same challenge). `getDailyChain()`, `advanceChain()`, `resetChain()`. XP rewards per difficulty.
- `src/services/SolarWindService.ts` — fetches live Kp index from NOAA SWPC `noaa-planetary-k-index.json` and solar wind Bz from `mag-1-day.json`. 10-minute cache. Maps Kp to calm/active/storm/severe. `AURA_VISUALS` drives header color, particle count, glow intensity.
- `src/services/IonosphericStaticService.ts` — pure math service computing audio synthesis parameters from alignment score. Phases: deep-static / approaching / data-chime / locked. No audio playback here — params only.
- `src/services/ReEntryService.ts` — Re-Entry Vector Warning. 3 mock reentry candidates with threat levels watch/warning/critical/imminent. `corridorCrossesLocal()` checks 1500km radius. `reentryAlertPattern()` returns double-pulse vibration. Blips pulse amber (#FF9500) or crimson (#FF3B30).

**`SpaceRadarGrid.tsx` updates:**
- Horizon Scope: curved gold dashed arc at `horizonY(devicePitch)`. Ground half shades dark amber. `showHorizon` prop (default false).
- `isDebris`: fast crimson pulse (300ms). `isDecayAlert`: slower amber pulse (500ms).
- `opacity` prop for train node lead-to-tail fade.

---

### Phase 7 — Live Audio + Live TLE Pipeline

**Files created:**
- `src/services/IonosphericAudioEngine.ts` — full expo-av two-deck crossfader. Deck A plays current phase noise loop, Deck B preloads next. 400ms crossfade (10 steps × 40ms). Separate chime layer. `setMuted()` for toggle. Graceful silent fallback if audio assets not bundled. Singleton pattern via `getIonosphericEngine()`.
- `assets/audio/README.md` — documents 6 required MP3 files (static-brown, static-pink, chime-220/440/528, lock-resolve) and Audacity generation instructions.
- `src/services/LiveTLEService.ts` (full rewrite) — live TLE pipeline:
  - Celestrak endpoints: `celestrak.org/NORAD/elements/gp.php?GROUP=...&FORMAT=tle`
  - Space-Track: POST auth → session cookie → debris query
  - `parseTLEText()`: 3-line format parser with validation
  - `propagateRecord()`: satellite.js SGP4 → lat/lon/alt/vel, rejects bad propagations
  - `repropagateStarlinkToNow()` / `repropagateDebrisToNow()`: re-runs math on cached TLEs every second (no network call)
  - 2h cache, stale-on-failure fallback

**StarlinkTrainService.ts rewrite:**
- `initStarlinkTrainLive()`: fetches Celestrak Starlink TLEs once on mode entry
- `tickStarlinkLive()`: repropagates cached records to current second
- `getStarlinkTrainBlips()`: unified API — live or mock, same interface
- Status: `isTrainLive()`, `getTrainNodeCount()`

**SpaceDebrisService.ts rewrite:**
- `initDebrisLive()`: Celestrak Cosmos-1408 + Iridium-33 debris clouds (no auth) or Space-Track authenticated feed
- `setSpaceTrackCredentials(username, password)`: call before `initDebrisLive()` for authenticated Space-Track data
- `tickDebrisLive()` / `tickDebrisMock()`: per-second position updates
- `tickLockTimers()`: returns newly-catalogued IDs (5s lock threshold)
- Status: `isDebrisLive()`

---

### Handoff Documents

**Files created:**
- `GEMINI_HANDOFF.md` (repo root) — full orientation doc for external AI agents. Includes logo SVG, design system, all 9 tracking modes, file structure, what's built vs stubbed.

---

## OrbitalAlignmentScreen — 9 Tracking Modes

| Mode | Service | Data Source | Status |
|---|---|---|---|
| Fleet | AtmosphereExplorerService | Celestrak live → mock fallback | Live TLE on entry |
| Deep Space | planetaryEphemeris | On-device Keplerian math | Always accurate |
| Train | StarlinkTrainService | Celestrak live → mock fallback | Live TLE on entry |
| Golden Hour | ChronoLightService | On-device USNO math | Always accurate |
| Debris | SpaceDebrisService | Celestrak live → mock fallback | Live TLE on entry |
| Meteor | MeteorShowerService | On-device RA/Dec catalog | Always accurate |
| Chain | SkyAlignmentChainService | On-device daily seed | Always accurate |
| Static | IonosphericStaticService + AudioEngine | expo-av (needs audio files) | Params live, audio needs MP3s |
| Re-Entry | ReEntryService | Space-Track TIP live → mock fallback | Live TIP on entry (needs creds) |

**All modes include:**
- Horizon Scope (curved horizon arc by device pitch)
- Cosmic Drift lock recording (fleet/deep-space/train/debris/reentry)
- Solar Wind Aura header (live NOAA Kp)
- Simulation Mode for App Store reviewer testing

---

## What's Stubbed / Still Needed

### Audio assets (high priority — easy)
The `IonosphericAudioEngine` is fully wired but needs 6 MP3 files. Generate with Audacity (free) per `assets/audio/README.md`. Then uncomment the `require()` lines in `IonosphericAudioEngine.ts`.

### Space-Track credentials (optional)
`setSpaceTrackCredentials(username, password)` in `SpaceDebrisService.ts`. Free account at space-track.org. Without credentials, falls back to Celestrak public debris clouds automatically.

### Re-Entry live data (future)
`ReEntryService.ts` is mocked. Wire to Space-Track TIP (Tracking and Impact Prediction) messages when ready. The service interface is already designed for it.

### Xcode native build
Run `npx expo prebuild` on your Mac. `AuraLunisHapticsModule.swift` is in `apple-native/iOS/AuraLunisHaptics/` — Expo Modules Core registers it automatically. Also add `CoreHaptics.framework` to the iOS target.

### Quantum Intercept (intentionally deferred)
Needs a real-time server/WebSocket backend to match observers globally. Not buildable client-only. Worth building after launch when there are users to connect.

### iOS 26 Liquid Glass
Spec exists in `docs/LIQUID_GLASS_IMPLEMENTATION_SPEC.md`. Native SwiftUI implementation. Deferred until after App Store launch.

---

## Architecture Decisions & Rationale

| Decision | Rationale |
|---|---|
| TLE propagation in service layer, not alignment engine | alignmentEngine is pure math — no network/format awareness. Keeps it unit-testable. |
| Reanimated shared values for radar blips | Runs on UI thread — no JS bridge jank even at 60fps |
| Expo Modules pattern for CoreHaptics | Matches existing `AuraLunisWatchSyncModule` pattern. Auto-registered. |
| AsyncStorage for Cosmic Drift (not encrypted vault) | Lock history is celebration data, not sensitive. Vault encryption reserved for private notes. |
| 2h Celestrak cache | TLEs update every few hours — more frequent fetching wastes battery |
| Keplerian ephemeris for planets (not API) | On-device, no network dependency, ~1° accuracy is sufficient for "point at Jupiter" |
| Daily chain seeded from date hash | All users get the same challenge — creates shared experience without a server |
| Space-Track optional, Celestrak default | Celestrak is public/free — no barrier to live data for most users |

---

## Design System (locked — do not change)

| Token | Value |
|---|---|
| Background (Cosmic Black) | `#030816` |
| Surface (Midnight Navy) | `#071225` |
| Elevated (Deep Indigo) | `#0B1630` |
| Astral Gold | `#D9A84E` |
| Gold 2 | `#FFF6D6` |
| Moon Silver | `#C0C6D4` |
| Nebula Violet | `#7B5CF6` |
| Green (success/lock) | `#4ADE80` |
| Alert amber (decay watch) | `#FF9500` |
| Alert crimson (decay critical) | `#FF3B30` |

**Typography:** Cinzel (headings) + Playfair Display (body)
**Glass panel:** `rgba(18,26,44,0.74)` background + gold border at 28% opacity

---

## Logo Rules (do not break)

- The logo is a **crescent-C astrolabe** — three concentric rings, compass needle, N/S/E/W cardinal points, central gold starburst, small moon icon on the ring, gold spheres at cardinal points.
- SVG source: `assets/brand/auralunis-logo-full.svg`
- Never replace with a generic moon, compass, or simplified icon.
- Never redraw in a different style.
- Always on Cosmic Black (`#030816`) background.
- Full logo embedded in `GEMINI_HANDOFF.md` for external agent reference.

---

## Pricing (locked)

| Tier | Price |
|---|---|
| Horizon Free | Free forever |
| AuraLunis Premium monthly | $6.99/month |
| AuraLunis Premium annual | $39.99/year (7-day trial) |
| Aura Pro | Coming Later — do not enable |
| Sovereign | Waitlist — do not enable |

RevenueCat entitlement: `auralunis_premium`
Product IDs: `com.ocoee.auralunis.premium.monthly` / `.premium.annual`

---

## Contact

- Studio: Ocoee Studios
- Manager: manager@ocoeestudios.com
- Support: admin@ocoeestudios.com
- Privacy: manager@ocoeestudios.com
- GitHub (personal): `jamiebzzz-stack`
- GitHub (org): `ocoee-studios`
