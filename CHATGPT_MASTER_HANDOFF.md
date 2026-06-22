# AuraLunis — Master Handoff for ChatGPT
**Last updated:** June 21, 2026 (end of major build session)
**Repo:** `jamiebzzz-stack/Auralunis` (GitHub)
**Local folder:** `~/chronaura` (repo renamed on GitHub; local kept old name)
**Developer:** Ocoee Studios (Mrs. Pepper, founder, non-technical product owner)
**Contact:** admin@ocoeestudios.com · support@ocoeestudios.com

---

## ⛔ THE RULE

```
DO NOT REPLACE — EXTEND ONLY
```

This codebase is **219 source files and 145 commits** of mature, working code.
Multiple AI assistants (Claude, Claude Code, Gemini) have collaborated on it.
**Never generate fresh replacements of existing components.**
Read what exists first. Extend it. Patch it. Do not rewrite it.

---

## What Is AuraLunis?

A premium iOS astronomy app — "The Interactive Astral Clock." Point your phone
at the sky and see constellation lines, planet labels, satellite tracks, nebulae,
and the Milky Way overlaid on your live camera. Track ISS flyovers, plan
astrophotography sessions, discover your Birth Sky, and wear the sky on your
Apple Watch.

**Tagline:** "Your Time, Written in the Stars"
**Bundle ID:** `com.ocoee.auralunis`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native / Expo SDK 54 |
| Language | TypeScript (strict, 0 errors) |
| Navigation | React Navigation (bottom tabs) |
| State | React Context + AsyncStorage |
| Subscriptions | RevenueCat (`auralunis_premium`) |
| Astronomy | astronomy-engine (real ephemeris) |
| Satellites | satellite.js + SGP4 propagation |
| Weather | Open-Meteo API (free, no key) |
| Encryption | tweetnacl (NaCl secretbox for Vault) |
| Fonts | Cinzel (headings) + Playfair Display (body) |

---

## Design System (LOCKED)

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Cosmic Black | `#030816` | Primary background |
| Surface | `#071225` | Cards, elevated surfaces |
| Elevated | `#0B1630` | Tertiary surfaces |
| Astral Gold | `#D9A84E` | Primary accent — ALL interactive elements |
| Starlight | `#FFF6D6` | Bright text, star color |
| Silver | `#C0C6D4` | Body text |
| Muted | `#747D90` | Secondary text |
| Faint | `#444B5C` | Tertiary text, disabled |

### Visual Identity
- **Gold is the brand.** Constellation lines, UI accents, Milky Way tint — all gold.
- Every other astronomy app uses blue/white. AuraLunis owns gold.
- App icon: crescent moon + compass rose, gold on black with starfield
- Located at `assets/icon.png` and `assets/logo/auralunis-app-icon.png`

---

## Navigation (LOCKED)

```
Tab Bar: Home · Sky · Watch · Learn · Settings

Sky tab opens sub-screens:
  ├── Sky Lens (full-screen AR camera overlay)
  ├── Fleet Radar (satellite tracking — OrbitalAlignmentScreen)
  ├── Star Chart
  ├── Birth Sky
  ├── Astro Weather
  └── Celestial Archive (stub)
```

---

## Pricing (LOCKED)

| Tier | Price | Trial |
|------|-------|-------|
| Monthly | $6.99/mo | No trial |
| Annual | $39.99/yr | 7-day free trial |
| Founders Lifetime | $99.99 | No trial, rises to $129.99 post-launch |

RevenueCat entitlement: `auralunis_premium`
Config: `src/features/paywall/MonetizationCatalog.ts`

---

## What's Built and Running on Device

### Sky Lens AR (the crown jewel)
**Full-screen camera overlay with real sensor tracking.**
- Camera feed background (expo-camera)
- DeviceMotion sensors (accelerometer + magnetometer → sky pointing)
- Heading + altitude HUD at top
- **Layer bar:** Stars · Constellations · Zodiac · Planets · Grid (more scrollable)
- **3,500 background stars** (full celestial sphere, magnitude-sized, colored)
- **Gold constellation lines** with named star labels
- **Zodiac layer** with 12 zodiac symbols along ecliptic, info cards with mythology
- **Milky Way:** Real photographic texture (ESO/Brunier) tinted warm gold + procedural band
- **38 deep sky objects** (nebulae, galaxies, clusters) across entire sky with multi-layer glowing renders
- **Ecliptic line** (thin gold, path of Sun/Moon/planets)
- **Shooting stars** (random 1-3 per hour)
- **Star twinkle** animation on brightest stars
- **Find Mode:** "Pan ↙ to the Moon" / "Turn around for the Moon" guidance
- **Night Vision Mode** (deep red palette)
- **Tap any object** → info card with name, data, description, "Save to Vault"
- **Planetarium Mode** (camera off, full opacity sky)

### Home Screen
- **Living starfield background** with subtle star dots
- **Celestial Dial** — animated clock with planets on orbital rings, moon phase, tonight score
- **Celestial Mood Engine** — poetic sky descriptions ("A half-moon divides light and shadow...")
- Golden hour countdown
- Visible bodies list with colored planet dots
- Mode shortcuts to Sky Lens, Fleet, Constellations
- Cosmic Notes quick journal → saves to encrypted vault

### Fleet Radar (Orbital Alignment)
- 9 tracking modes (fleet, deep-space, train, golden, debris, meteor, chain, static, re-entry)
- Live satellite blips on radar grid
- ISS targeting with az/el/alt data
- Haptic proximity alerts
- Cosmic Drift galaxy diary
- Premium modes gated via paywall

### Learn Tab
- Real full-screen lessons (not placeholders)
- Live visuals: Solar System, Moon Phases, Constellation carousel (Orion/Scorpius/Ursa Major with draw-in animation), Star Brightness, Deep Sky, Milky Way
- Category grid: Solar System, Moon, Constellations, Stars, Deep Sky, Milky Way, 30 Nights course
- **"See in Sky Lens" button** deep-links to AR with Find Mode targeting the lesson object
- All Learn content is FREE (conversion funnel to premium)

### Birth Sky Screen (NEW)
- Date/time/location picker
- Computes exact sky at birth moment
- Moon phase, sun sign, rising constellation, visible planets
- "Cosmic signature" — poetic one-line summary
- Share card generation

### Astro Weather Screen (NEW)
- Hour-by-hour observing forecast
- Cloud cover, seeing (1-5), transparency (1-5)
- Overall score (0-100) with GO / MAYBE / STAY IN verdict
- Best observing window highlighted
- Data from Open-Meteo API

### Settings
- Three-tier paywall with "BEST VALUE" badge
- Appearance, notifications, data toggles
- Privacy Policy (in-app, modal)
- Terms of Use (in-app, modal)
- Contact Support (mailto:)
- Branded footer with real app icon, wordmark, tagline, version

### Legal & Compliance
- Privacy Policy hardwired in-app (`PrivacyScreen.tsx`)
- Terms of Use hardwired in-app (`TermsScreen.tsx`)
- App Store Nutrition Label ready (`docs/APP_STORE_NUTRITION_LABEL.md`)
- Privacy manifests configured in app.json
- Export compliance documented
- Age rating: 4+

---

## Premium Feature Services (code built, some screens pending)

| Service | File | UI Screen |
|---------|------|-----------|
| Birth Sky | `src/services/BirthSkyService.ts` | ✅ `BirthSkyScreen.tsx` |
| Astro Weather | `src/services/AstroWeatherService.ts` | ✅ `AstroWeatherScreen.tsx` |
| Photo Planner | `src/services/AstroPhotographyService.ts` | ❌ Not built yet |
| Sky Share | `src/services/SkyShareService.ts` | ❌ Not built yet |
| Celestial Mood | `src/services/CelestialMoodService.ts` | ✅ Wired into Home |

---

## Spec Documents (for future builds)

| Spec | Location | Lines | Status |
|------|----------|-------|--------|
| Sky Lens Architecture | `src/features/sky-lens/SKY_LENS_SPEC.md` | 570 | Phase 1 DONE, Phase 2-3 specced |
| Visual Quality Standards | `src/features/sky-lens/VISUAL_QUALITY_SPEC.md` | 580+ | Reference for all visual work |
| Visual Build Phases | `src/features/sky-lens/VISUAL_BUILD_PHASES.md` | 148 | 5 phases defined |
| Watch App | `src/features/watch/WATCH_APP_SPEC.md` | 624 | Specced, not built |
| App Store Connect | `docs/APP_STORE_CONNECT_FIELDS.md` | 159 | Ready to paste |
| Launch Checklist | `docs/LAUNCH_CHECKLIST.md` | 47 | Must-ship vs later vs killed |
| Todo List | `docs/CLAUDE_CODE_TODO.md` | 147 | Current bugs + tasks |

---

## Known Bugs (from latest scan)

1. **Dead `src/features/future/` folder** — 7 files for killed features (SovereignSigil, DeskObelisk) still imported by WatchScreen and SettingsScreen
2. **`sound_bath` references** in 3 files — killed feature
3. **Watch face catalog** has dead "future preview" items
4. **SIM_LOCATION** hardcoded to NYC in OrbitalAlignmentScreen
5. **Onboarding** never triggers — no first-launch check
6. **RevenueCat API key** is placeholder — verify graceful degradation

---

## Missing Screens

| Screen | Service Ready? | Priority |
|--------|---------------|----------|
| Photo Planner | ✅ Service built | High |
| Sky Share | ✅ Service built | High |
| Celestial Archive | Partially | Medium |
| Teacher Mode | No | Low (or remove card) |

---

## Watch App (specced, not built)

**624-line spec at `src/features/watch/WATCH_APP_SPEC.md`**

6 screens: Celestial Dial, Tonight's Sky, Star Compass (magnetometer + haptics), Satellite Timeline, Photo Timer, Observation Log

7 complications: Next Planet, Golden Hour, Aurora, Meteors, Sky Quality, Moon, Tonight Score

Crown interactions on every screen. Night Mode. 88-constellation haptic patterns.

**HealthKit integration specced but NOT declared in app.json** (stripped to avoid App Review rejection — re-add only when code is built):
- Stargazing as Mindfulness Minutes
- Sleep × Moon Phase Correlation
- Heart Rate Awe Moments

---

## File Structure

```
src/
├── components/         # LogoMark, ScreenShell, CelestialDial, GlassPanel, etc.
├── data/               # Brand, ConstellationCatalog, AtmosphereCatalog
├── features/
│   ├── daily-life/     # (may be dead — check before using)
│   ├── future/         # ⚠️ DEAD — delete this folder
│   ├── learn/          # LearnCatalog, LearnTypes, visuals/
│   ├── onboarding/     # OnboardingFlow, RadarTutorial
│   ├── paywall/        # MonetizationCatalog, PaywallCard, gates
│   ├── sky-lens/       # THE BIG ONE — AR overlay, layers, ephemeris, specs
│   │   ├── ar/         # Projection, orientation, device pointing
│   │   ├── data/       # brightStars, skyDome (3500 stars), nebulae (38 objects)
│   │   ├── ephemeris/  # StarPositions, MilkyWay, Ecliptic, Nebulae
│   │   ├── layers/     # StarLayer, DomeStarLayer, ConstellationLayer,
│   │   │               # PlanetLayer, MoonLayer, MilkyWayLayer,
│   │   │               # MilkyWayCoreLayer, NebulaLayer, EclipticLayer,
│   │   │               # GridLayer, TwinkleLayer, MeteorLayer, ZodiacLayer
│   │   └── specs/      # SKY_LENS_SPEC.md, VISUAL_QUALITY_SPEC.md, etc.
│   └── watch/          # WatchFaceCatalog, WATCH_APP_SPEC.md
├── hooks/              # useEntitlement, useObserverLocation, useFonts
├── modules/            # WatchHaptics (native bridge)
├── navigation/         # RootTabs (bottom tab navigator)
├── screens/            # HomeScreen, SkyScreen, LearnScreen, LearnDetailScreen,
│                       # SettingsScreen, WatchScreen, OrbitalAlignmentScreen,
│                       # BirthSkyScreen, AstroWeatherScreen, TermsScreen, PrivacyScreen
├── services/           # All backend logic:
│                       # SkyEphemerisService, LiveTLEService, RevenueCatService,
│                       # BirthSkyService, AstroWeatherService, AstroPhotographyService,
│                       # SkyShareService, CelestialMoodService, HapticService,
│                       # TonightScoreService, WeatherService, NotificationService,
│                       # ChronoLightService, CosmicDriftService, etc.
├── state/              # VaultContext, SettingsContext
├── theme/              # tokens.ts (all colors, typography)
└── utils/              # planetaryEphemeris, hapticController
assets/
├── icon.png            # Official app icon (crescent moon + compass rose)
├── splash.png          # Splash screen
├── logo/               # Brand assets
└── sky/                # milkyway-core.png (1.2MB photographic texture)
docs/
├── APP_STORE_CONNECT_FIELDS.md
├── APP_STORE_NUTRITION_LABEL.md
├── CLAUDE_CODE_TODO.md     # Current bug/task list
├── LAUNCH_CHECKLIST.md
└── ENCRYPTION_COMPLIANCE.md
public/
├── PRIVACY.md
├── TERMS.md
└── APP_STORE_REVIEW_NOTES.md
```

---

## App Name Mapping (CRITICAL)

| App | Repo | Local Folder | What It Is |
|-----|------|-------------|-----------|
| **AuraLunis** | `jamiebzzz-stack/Auralunis` | `~/chronaura` | Astronomy / astral clock (THIS APP) |
| **Dreammmm** | `ocoee-studios/dreammmm` | `~/ocoee/auralunis` | Dream journal (SEPARATE APP) |

**These are completely different apps. Do not confuse them.**

---

## Other Ocoee Studios Apps

| App | Repo | Stack | Status |
|-----|------|-------|--------|
| SpicyCalc | `ocoee-studios/spicy-calc` | Expo RN | Needs legal screens |
| Driftloom | `jamiebzzz-stack/driftloom` | Expo RN | Active development |
| Peptendium | `jamiebzzz-stack/peptendium` | Vite + Tailwind | Built |
| Veyra | `ocoee-studios/veyra` | Expo RN | Specced, 51 features |
| Avia IQ | `jamiebzzz-stack/avia-iq-bird-app` | Expo RN | Liquid Glass redesign |

---

## Build Priority

```
1. Fix 6 bugs from CLAUDE_CODE_TODO.md     ← NOW
2. Build Photo Planner + Sky Share screens  ← NOW  
3. TestFlight build                         ← Needs Apple Dev account
4. Sky Lens Phase 2 (parallax, depth)       ← Post-launch
5. Watch App Phase 1 (complications)        ← Post-launch
6. HealthKit integration                    ← After Watch code exists
7. App Store submission
```

---

## Communication Style

Mrs. Pepper communicates in a terse, directive style — approving with "awesome,"
flagging issues briefly ("it's blah", "that's goofy"), and moving quickly between
topics. She has a strong visual design sensibility and pushes hard for premium,
polished aesthetics. She runs multiple AI assistants simultaneously (Claude, Claude
Code, Gemini, ChatGPT) and expects them to coordinate via the repo.

**When in doubt: read the repo, check the specs, extend don't replace.**
