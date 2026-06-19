# Chronaura — Full App Handoff for Gemini

> **What this is:** A complete orientation document for any AI agent picking up work on Chronaura. Read this before touching any code.

---

## Logo

This is the approved Chronaura emblem. It is a crescent-C astrolabe — three concentric rings, compass needle with N/S/E/W points, central gold starburst, small moon icon on the ring, and gold spheres at the cardinal points. Do not replace or simplify it.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3D99B"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#C7A66A"/>
    </linearGradient>
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF7D7"/>
      <stop offset="60%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#C7A66A" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="100" cy="100" r="88" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.7"/>
  <g stroke="#D4AF37" stroke-width="0.8" opacity="0.5">
    <line x1="100" y1="12" x2="100" y2="20"/><line x1="100" y1="180" x2="100" y2="188"/>
    <line x1="12" y1="100" x2="20" y2="100"/><line x1="180" y1="100" x2="188" y2="100"/>
  </g>
  <circle cx="100" cy="100" r="62" fill="none" stroke="#D4AF37" stroke-width="1" opacity="0.45"/>
  <circle cx="100" cy="100" r="36" fill="none" stroke="#C0C6D4" stroke-width="0.8" opacity="0.25"/>
  <line x1="100" y1="16" x2="100" y2="184" stroke="#D4AF37" stroke-width="1" opacity="0.6"/>
  <polygon points="100,10 96,22 104,22" fill="#D4AF37" opacity="0.8"/>
  <polygon points="100,190 96,180 104,180" fill="#D4AF37" opacity="0.5"/>
  <line x1="16" y1="100" x2="184" y2="100" stroke="#D4AF37" stroke-width="0.5" opacity="0.25"/>
  <text x="100" y="9" text-anchor="middle" font-family="serif" font-size="8" fill="#D4AF37" font-weight="bold" opacity="0.8">N</text>
  <text x="100" y="198" text-anchor="middle" font-family="serif" font-size="8" fill="#D4AF37" font-weight="bold" opacity="0.6">S</text>
  <text x="195" y="103" text-anchor="middle" font-family="serif" font-size="8" fill="#D4AF37" font-weight="bold" opacity="0.6">E</text>
  <text x="5" y="103" text-anchor="middle" font-family="serif" font-size="8" fill="#D4AF37" font-weight="bold" opacity="0.6">W</text>
  <path d="M118 52 C88 62 68 88 68 118 c0 34 24 58 52 58 -8 4 -18 2 -28 0 C62 170 40 146 40 118 40 78 72 48 118 52 Z" fill="url(#goldGrad)" filter="url(#glow)"/>
  <circle cx="140" cy="116" r="8" fill="#C0C6D4" opacity="0.7"/>
  <circle cx="144" cy="113" r="6.5" fill="#0B0B12"/>
  <circle cx="100" cy="100" r="8" fill="url(#coreGlow)" filter="url(#glow)"/>
  <circle cx="100" cy="38" r="4" fill="#D4AF37" filter="url(#glow)"/>
  <circle cx="162" cy="100" r="4" fill="#D4AF37" filter="url(#glow)"/>
  <circle cx="100" cy="162" r="3.5" fill="#D4AF37" opacity="0.7"/>
  <circle cx="38" cy="100" r="3.5" fill="#D4AF37" opacity="0.7"/>
  <text x="130" y="42" font-size="6" fill="#F3D99B" opacity="0.7">✦</text>
  <text x="148" y="68" font-size="4" fill="#F3D99B" opacity="0.5">✦</text>
  <text x="52" y="58" font-size="5" fill="#F3D99B" opacity="0.4">✦</text>
</svg>
```

**Logo rules (do not break these):**
- Never replace the crescent-C astrolabe with a generic moon or compass icon
- Never simplify the three-ring geometry
- Background is always Cosmic Black `#0B0B12`
- Wordmark: **CHRONAURA** in Cinzel serif, gold `#D4AF37`
- Slogan: *Your time, written in the stars.*
- Descriptor: *The Interactive Astral Clock*

---

## What Chronaura Is

An iOS astronomy companion app — described as "The Interactive Astral Clock." It shows the real sky through a camera-aligned AR overlay, tracks satellites and planets in real time, and has an encrypted personal vault for sky observations.

- **Developer:** Ocoee Studios (Mrs. Pepper, founder)
- **Bundle ID:** `com.ocoee.chronaura`
- **GitHub:** `jamiebzzz-stack/chronaura` (private)
- **Stack:** React Native / Expo SDK 51, TypeScript
- **57 commits, 47 TSX files, 104 TS files**

---

## Design System

| Token | Value |
|---|---|
| Cosmic Black (background) | `#0B0B12` |
| Midnight Navy (surface) | `#121A2C` |
| Deep Indigo (elevated) | `#1E2A44` |
| Astral Gold (primary accent) | `#D4AF37` |
| Gold 2 (highlights) | `#F3D99B` |
| Moon Silver (secondary text) | `#C0C6D4` |
| Nebula Violet | `#7B5CF6` |
| Muted text | `#A8AFBF` |
| Faint labels | `#747D90` |
| Success green | `#4ADE80` |
| Alert amber | `#FF9500` |
| Alert crimson | `#FF3B30` |

**Typography:** Cinzel serif (headings/logo) + Montserrat (body/UI)

**Glass panel:** `background: rgba(18,26,44,0.74)` + `border: 1px solid rgba(212,175,55,0.28)` + `border-radius: 16px`

---

## Navigation (locked — do not change)

5 tabs: **Home · Sky · Watch · Learn · Settings**

The Orbital Alignment / Atmosphere Explorer screen is accessed from the Sky tab as a full-screen modal overlay, not a separate tab.

---

## Pricing (locked)

| Tier | Price | Notes |
|---|---|---|
| Horizon Free | Free forever | Core features |
| Chronaura Premium | $6.99/mo or $39.99/yr | 7-day free trial |
| Aura Pro | Coming Later | Do not enable purchase flow |
| Sovereign | Waitlist | Do not enable purchase flow |

RevenueCat product IDs: `com.ocoee.chronaura.premium.monthly` / `.premium.annual`
Entitlement: `chronaura_premium`

---

## Key Architecture

| Library | Purpose |
|---|---|
| `astronomy-engine` | Real ephemeris — Sun, Moon, planets |
| `satellite.js` | SGP4 orbital propagation for satellites |
| `tweetnacl` | NaCl secretbox encryption for Vault |
| `expo-sensors` | Accelerometer + magnetometer for AR pointing |
| `expo-location` | GPS for observer position |
| `react-native-purchases` | RevenueCat subscriptions |
| `react-native-svg` | SVG radar scope, galaxy particle cloud |
| `react-native-reanimated` | UI-thread animations (blip spring, galaxy rotation) |
| `expo-haptics` + `CoreHaptics` | Haptic feedback (see ChronauraHapticsModule.swift) |
| `expo-av` | Audio (Ionospheric Static) |
| `expo-secure-store` | Vault encryption key in Keychain |
| `AsyncStorage` | Vault items, Cosmic Drift lock history |

---

## File Structure (key files)

```
src/
├── screens/
│   ├── HomeScreen.tsx          — Living Astrolabe, Tonight Score, Cosmic Notes
│   ├── SkyScreen.tsx           — Sky Lens, Manual Map, Orbital Alignment entry
│   ├── WatchScreen.tsx         — Watch Face Gallery, complications
│   ├── LearnScreen.tsx         — 30 Nights curriculum, topic explorer
│   ├── SettingsScreen.tsx      — Subscription, appearance, notifications
│   └── OrbitalAlignmentScreen.tsx  — THE BIG ONE (see below)
├── components/
│   ├── SpaceRadarGrid.tsx      — 2D SVG radar with multi-blip, horizon scope, decay flash
│   ├── SatelliteDataCard.tsx   — Bottom-sheet retro data card (tap a blip)
│   ├── CosmicDriftGalaxy.tsx   — Rotating SVG particle galaxy (lock history)
│   ├── AstrolabePreview.tsx    — Animated astrolabe on Home tab
│   └── GlassPanel.tsx          — Reusable glass panel component
├── utils/
│   ├── alignmentEngine.ts      — Pure bearing/elevation/score math (SpatialTarget, AlignmentResult)
│   ├── hapticController.ts     — Proximity haptic cadence (uses WatchHaptics)
│   └── planetaryEphemeris.ts  — Full Keplerian orbital model for 7 planets
├── services/
│   ├── AtmosphereExplorerService.ts  — LEO fleet simulation + alignment for 6 satellites
│   ├── SpaceDebrisService.ts         — Debris catalog, 5s lock cataloguing
│   ├── ReEntryService.ts             — Orbital decay tracking, reentry corridor, alerts
│   ├── StarlinkTrainService.ts       — 28-node Starlink train, chain blips
│   ├── MeteorShowerService.ts        — 6 showers, radiant tracking, sonar cadence
│   ├── SkyAlignmentChainService.ts   — Daily chain puzzle generator
│   ├── ChronoLightService.ts         — USNO solar position, golden hour windows
│   ├── SolarWindService.ts           — Live NOAA Kp index, aura intensity
│   ├── IonosphericStaticService.ts   — Audio synthesis parameters by alignment score
│   ├── CosmicDriftService.ts         — Lock event persistence (AsyncStorage)
│   ├── HapticService.ts              — expo-haptics wrappers (tapLight/Medium/Heavy/Success)
│   ├── RevenueCatService.ts          — Subscription management
│   ├── TonightScoreService.ts        — 0-100 sky quality score
│   └── ISSPassService.ts             — ISS pass prediction stub (awaiting live TLE)
├── data/
│   ├── AtmosphereCatalog.ts    — 6 LEO satellite registry (ISS, Hubble, NOAA-20, Terra, 2x Starlink)
│   └── brand.ts                — Brand constants
├── modules/
│   └── WatchHaptics.ts         — JS bridge to ChronauraHapticsModule (CoreHaptics)
├── state/
│   ├── ChronauraVaultContext.tsx    — Encrypted vault state
│   └── ChronauraSettingsContext.tsx — App settings
└── theme/
    └── tokens.ts               — ChronauraColors, ChronauraPricing

apple-native/
├── iOS/
│   ├── ChronauraHaptics/
│   │   └── ChronauraHapticsModule.swift  — Expo Module, CoreHaptics compass tick + lock pulse
│   └── ChronauraWatchSync/
│       └── ChronauraWatchSyncModule.swift — Watch data sync
└── watchOS/
    └── ChronauraWatch/
        ├── ChronauraWatchApp.swift
        ├── AstrolabeFaceView.swift
        ├── Haptics/
        │   └── ChronauraWatchHapticsEngine.swift  — CoreHaptics on Watch
        └── Connectivity/
            └── ChronauraWatchConnectivityBridge.swift

public/
├── PRIVACY.md     — Full privacy policy (host at ocoeestudios.com/chronaura/privacy)
├── TERMS.md       — EULA (host at ocoeestudios.com/chronaura/terms)
└── APP_STORE_REVIEW_NOTES.md  — Paste into App Store Connect review notes field
```

---

## OrbitalAlignmentScreen — The Main Feature Screen

This is the most complex screen. It has **9 tracking modes** switchable via a button grid:

| Mode | What it does |
|---|---|
| **Fleet** | Tracks 6 real LEO satellites (ISS, Hubble, NOAA-20, Terra, 2x Starlink) on the radar in real time |
| **Deep Space** | Full Keplerian ephemeris for all 7 planets — point at Jupiter at 2am and lock onto it |
| **Train** | 28-node Starlink Group 12 chain — machine-gun haptic cadence as you sweep the chain |
| **Golden** | USNO solar position — golden hour countdown, phase bar, sun azimuth |
| **Debris** | 6 real debris objects (Cosmos 1408, Fengyun-1C, Iridium-33, etc.) — hold 5s lock to catalogue |
| **Meteor** | 6 shower radiant points — sonar haptic ping cadence by proximity |
| **Chain** | Daily multi-target puzzle (e.g. "Cassini Chain: Venus → Saturn") — lock each in sequence |
| **Static** | Ionospheric Static audio parameter display — noise/chime synthesis params by alignment |
| **Re-Entry** | Orbital decay tracking — pulsing amber/crimson blips, reentry corridor, urgent haptic alert |

**All radar modes include:**
- Horizon Scope: curved gold dashed arc driven by device pitch — ground shades amber below it
- Cosmic Drift galaxy: tap the ✦ card to expand your personal lock history particle cloud
- Solar Wind Aura header: live NOAA Kp index, color shifts calm/active/storm/severe

**Cosmic Drift** records every 100% lock event to AsyncStorage with: target name, timestamp, observer lat/lon, azimuth, elevation, altitude. The `CosmicDriftGalaxy` renders these as a rotating SVG particle cloud — each star is a real past lock, colored by target.

---

## Haptic System

**Phone (expo-haptics via HapticService.ts):**
- `tapLight()` — approaching (score 70-85), 500ms interval
- `tapMedium()` — near-lock (score 85+), 250ms interval
- `tapSuccess()` — legacy fallback

**Watch (CoreHaptics via ChronauraHapticsModule.swift + WatchHaptics.ts):**
- `triggerCompassTick()` — sharp transient (intensity 0.6, sharpness 0.8) — approaching
- `triggerLockPulse()` — continuous 0.4s (intensity 1.0, sharpness 0.4) — on lock

**Train mode:** machine-gun `triggerCompassTick()` at 500/250/100ms based on proximity

**Reentry mode:** `Vibration.vibrate([0, 100, 80, 100, 200, 200])` — urgent double-pulse when critical corridor crosses local horizon

---

## Screens Inventory

### Home
- Living Astrolabe (animated SVG)
- Tonight Score ring (0-100, computed from sky quality + weather)
- Daily Cosmic Alignment
- Tonight's Sky live (Sun, Moon, planet az/alt from astronomy-engine)
- Cosmic Notes (quick vault entry)
- Sound Bath toggle
- Time-Scrub Matrix Panel (Aura Pro future)

### Sky
- Sky Lens (AR camera overlay — permission gated)
- Manual Sky Map (fallback without camera)
- Orbital Alignment entry → opens OrbitalAlignmentScreen full-screen
- Find Mode (ephemeris-driven "point at Venus" tool)
- X-Ray Lens / Birth Sky Overlay
- Milky Way / Galaxy Mode
- Satellite Thermal Overlay Panel
- Astrophotography Predictor Panel
- Deep Sky Highlights (8 featured objects)
- Celestial Archive entry

### Watch
- Watch Face Gallery
- Complication Picker
- Watch Theme Selector
- Haptic Breathing
- Future: Taptic Astrolabe, Desk Obelisk

### Learn
- Sky in 30 Nights progress bar
- Topic browser (Solar System, Moon, Planets, Constellations, Stars, Deep Sky)
- Each topic expands with key facts and Sky Lens actions

### Settings
- Subscription card (Premium $6.99/mo or $39.99/yr)
- Appearance (theme selector, Night Vision mode toggle)
- Notifications (sky events, ISS passes)
- Observatory (sky quality, magnetic declination)
- About (version, contact)

---

## What Is and Isn't Built

### Built and code-complete
- All 5 tab screens
- OrbitalAlignmentScreen with 9 modes
- SpaceRadarGrid multi-blip with horizon scope
- SatelliteDataCard retro modal
- CosmicDriftGalaxy particle cloud
- Full planetary ephemeris (7 planets)
- Starlink train tracker
- Space debris mission loop
- Meteor shower sonar
- Sky-Crawl alignment chains
- Chrono-Light golden hour
- Solar Wind Aura (live NOAA)
- Ionospheric Static synthesis params
- Re-Entry Vector Warning
- CoreHaptics iOS + watchOS modules
- Expo native module bridge
- Encrypted vault (NaCl + Keychain)
- RevenueCat subscription wiring
- Tonight Score
- App Store compliance docs (TERMS.md, PRIVACY.md, review notes)
- Simulation Mode for App Store reviewers

### Stubs / needs live data
- ISS pass prediction (stub — needs live TLE from SatelliteFeedService)
- Starlink train (mock — needs Celestrak live data)
- Space debris (mock — needs Space-Track.org API)
- Reentry alerts (mock — needs Space-Track TIP stream)
- Quantum Intercept / global observer matching (needs backend server — intentionally deferred)

### Not yet started
- Actual audio playback for Ionospheric Static (IonosphericStaticService outputs params only — needs expo-av implementation)
- iOS 26 Liquid Glass native rendering (spec exists in docs)
- Xcode project file / native build (no .xcodeproj committed — requires `npx expo prebuild`)

---

## Contacts

- **Studio:** Ocoee Studios
- **Email:** manager@ocoeestudios.com / admin@ocoeestudios.com / support@ocoeestudios.com
- **Privacy:** privacy@ocoeestudios.com
- **GitHub (personal):** `jamiebzzz-stack`
- **GitHub (org):** `ocoee-studios`
