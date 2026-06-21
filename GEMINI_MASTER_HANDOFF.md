# AuraLunis — Master Handoff Document
**Last updated:** June 21, 2026  
**For:** Any AI assistant (Gemini, Claude Code, etc.) picking up this project  
**Repo:** `jamiebzzz-stack/Auralunis` (GitHub)  
**Local folder:** `~/chronaura` (the repo was renamed on GitHub; local folder kept the old name)

---

## DO NOT REPLACE — EXTEND ONLY

This codebase is 160+ source files and 80+ commits of mature, tested code.
**Never generate fresh replacements of existing components.**
Read what exists first. Extend it. Patch it. Do not rewrite it.

---

## What Is AuraLunis?

A premium iOS astronomy app — "The Interactive Astral Clock." Point your phone at the sky and see constellation lines, planet labels, satellite tracks overlaid on your camera. Track ISS flyovers, plan astrophotography sessions, log observations, and wear the sky on your Apple Watch.

**Tagline:** "Your Time, Written in the Stars"  
**Developer:** Ocoee Studios (Mrs. Pepper, founder)  
**Bundle ID:** `com.ocoee.auralunis`  
**Contact:** admin@ocoeestudios.com · support@ocoeestudios.com

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native / Expo SDK 51 |
| Language | TypeScript (strict) |
| Navigation | Expo Router (file-based) |
| State | React Context + AsyncStorage |
| Subscriptions | RevenueCat (`auralunis_premium`) |
| Astronomy math | astronomy-engine + custom ephemeris |
| Satellites | satellite.js + SGP4 propagation |
| Weather | Open-Meteo API (free, no key) |
| Encryption | tweetnacl (NaCl secretbox for Vault) |
| Fonts | Cinzel (headings) + Playfair Display (body) |
| Watch | SwiftUI + WatchConnectivity (specced, not yet built) |

---

## Design System (LOCKED — do not change)

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Cosmic Black | `#030816` | Primary background |
| Surface | `#071225` | Cards, elevated surfaces |
| Elevated | `#0B1630` | Tertiary surfaces |
| Astral Gold | `#D9A84E` | Primary accent, all interactive elements |
| Starlight | `#FFF6D6` | Bright text, highlights |
| Silver | `#C0C6D4` | Body text |
| Muted | `#747D90` | Secondary text |
| Faint | `#444B5C` | Tertiary text, disabled states |

### Typography
- **Headings:** Cinzel (reference: Trajan Pro)
- **Body:** Playfair Display
- **System fallback:** SF Pro (iOS native)

### Brand Assets
- **App icon:** `assets/icon.png` — crescent moon + compass rose, gold on black with starfield
- **Also at:** `assets/logo/auralunis-app-icon.png`
- **Splash:** `assets/splash.png` / `assets/logo/auralunis-splash.png`
- **LogoMark component:** `src/components/LogoMark.tsx` — loads the real PNG icon

---

## Navigation Structure (LOCKED)

```
Home · Sky · Watch · Learn · Settings
              │
              ├── Sky Lens (AR overlay)
              ├── Fleet Radar (satellite tracking)
              └── Star Chart (constellations)
```

---

## Pricing (LOCKED)

| Tier | Price | Trial |
|------|-------|-------|
| Monthly | $6.99/mo | No trial |
| Annual | $39.99/yr | 7-day free trial |
| Founders Lifetime | $99.99 | No trial, rises to $129.99 post-launch |

RevenueCat entitlement: `auralunis_premium`  
Paywall config: `src/features/paywall/MonetizationCatalog.ts`

---

## What's Built and Working

### Core Screens
- **Home / Celestial Dial** — Live animated clock with planets on orbital rings, sun vector, moon phase, tonight score, compass headings, time scrub ±12h via pan gesture, cosmic notes vault
- **Sky Screen** — Hub linking to Sky Lens, Fleet Radar, Star Chart, and feature cards for Astro Weather, Photo Planner, Birth Sky, Dark Sky Finder, Eclipse Events
- **Fleet / Orbital Alignment** — Canvas radar with 9 tracking modes (fleet, deep-space, golden, meteor + 5 premium: train, debris, re-entry, chain, static), ISS targeting, Cosmic Drift galaxy
- **Constellations / Star Chart** — Canvas star chart with drawn constellations, magnitude-based star sizes, gold connection lines
- **Watch** — WatchOS face spec (`AstrolabeFaceView.swift`), complications, haptic constellations
- **Learn** — Sky in 30 Nights course, topic cards (solar system, moon, stars, constellations, deep sky, cultural, satellites, events)
- **Settings** — Three-tier paywall, appearance (night vision), notifications (sky events, ISS, aurora), legal links (Privacy, Terms, Support), branded footer with real icon

### Premium Feature Services (built, UI screens pending)
| Service | File | What it does |
|---------|------|-------------|
| Birth Sky | `src/services/BirthSkyService.ts` | Computes exact sky at any date/time/location. Returns planets, moon phase, sun sign, rising constellation, cosmic signature |
| Astro Weather | `src/services/AstroWeatherService.ts` | Hour-by-hour observing forecast. Cloud cover, seeing (1-5), transparency (1-5), overall score (0-100). GO/MAYBE/STAY IN verdict |
| Astrophotography | `src/services/AstroPhotographyService.ts` | 500 Rule + NPF Rule exposure calculator. Milky Way core timing. Target recommendations by difficulty. Stacking advice |
| Sky Share | `src/services/SkyShareService.ts` | Branded observation cards (4 styles: cosmic, minimal, data, story). Auto-generates headline from observed objects. Vault integration |

### Existing Infrastructure
| Component | File | Notes |
|-----------|------|-------|
| Planetary ephemeris | `src/utils/planetaryEphemeris.ts` | Real planet position calculations |
| Sky ephemeris | `src/services/SkyEphemerisService.ts` | Sun/moon/planets with rise/set, magnitude |
| Live TLE service | `src/services/LiveTLEService.ts` | Satellite position propagation |
| Sky pointing | `src/features/sky-lens/SkyLensOrientation.ts` | Accelerometer + magnetometer → pointing direction |
| Sky projection | `src/features/sky-lens/SkyLensProjection.ts` | Az/alt → screen coordinates, roll-aware, FOV-aware |
| Device pointing hook | `src/features/sky-lens/useDevicePointing.ts` | React hook for sensor data |
| Observer location | `src/hooks/useObserverLocation.ts` | GPS with graceful fallback |
| Entitlement hook | `src/hooks/useEntitlement.ts` | Premium status check (Expo Go safe) |
| RevenueCat service | `src/services/RevenueCatService.ts` | Subscription management (Expo Go safe with dynamic require) |
| Haptic service | `src/services/HapticService.ts` | expo-haptics wrapper |
| Constellation haptics | `src/services/ConstellationHapticsService.ts` | Star pattern haptic feedback |
| Widget data bridge | `src/services/WidgetDataBridge.ts` | WatchConnectivity / shared group |
| Theme tokens | `src/theme/tokens.ts` | All color/typography constants |
| Brand data | `src/data/brand.ts` | Brand name, descriptor, tagline |
| Monetization catalog | `src/features/paywall/MonetizationCatalog.ts` | Plans, prices, feature lists, gates |

---

## What's Specced But Not Yet Built

### Sky Lens AR (highest priority)
**Spec:** `src/features/sky-lens/SKY_LENS_SPEC.md` (347 lines)

Full-screen AR camera overlay with 40+ toggleable layers:
- **Phase 1 (core):** Stars (300 brightest), Constellations (88 IAU), Planets (with glow), Moon (with phase shadow), Satellites (ISS + fleet), Grid/Compass (alt/az + cardinal), Layer bar, Info cards, Night Mode
- **Phase 2 (premium):** Milky Way band, Deep Sky (110 Messier), Ecliptic with zodiac, Cultural Sky Stories (Greek, Aboriginal, Chinese, Norse, Polynesian), Find Mode with haptic lock-on
- **Phase 3 (best-in-class):** Weather layers (clouds, light pollution, aurora, jet stream), Photo assist (framing, MW core, star trails), Time scrub, Comparison mode, Magnitude filter slider

**Existing foundation to reuse:**
- `SkyLensProjection.ts` — projection math ✅
- `SkyLensOrientation.ts` + `useDevicePointing.ts` — sensors ✅
- `SkyEphemerisService.ts` — planet positions ✅
- `SkyLensPlaceholder.tsx` — minimal working AR overlay ✅

### Apple Watch App
**Spec:** `src/features/watch/WATCH_APP_SPEC.md` (624 lines)

**6 screens:** Celestial Dial (enhanced), Tonight's Sky (scrollable cards), Star Compass (magnetometer-driven, haptic feedback), Satellite Pass Timeline (countdown + haptics), Astrophotography Timer (crown-adjustable, stacking mode), Observation Log (quick-tap + voice, vault sync)

**7 complications:** Next Visible Planet, Golden Hour Countdown, Aurora Alert, Meteor Shower Status, Sky Quality Score, Moon Rise/Set, Tonight Score

**Crown interactions on every screen.** Night Mode (global red palette). 88-constellation haptic patterns. WatchConnectivity data bridge.

### HealthKit Integration (future — NOT in current build)
**Specced in:** `src/features/watch/WATCH_APP_SPEC.md` (HealthKit section)

⚠️ **HealthKit entitlements have been STRIPPED from app.json** per Claude Code's review. Do not re-add until the code is built.

Planned features:
1. Stargazing as Mindfulness Minutes (fills Apple Watch green ring)
2. Sleep × Moon Phase Correlation (personal lunar sleep report)
3. Heart Rate Awe Moments (capture HR during observations)
4. Cosmic Wellness Dashboard (aggregates all health data)

---

## App Store Compliance (DONE)

| Document | Location | Status |
|----------|----------|--------|
| Privacy Policy | `public/PRIVACY.md` | ✅ Complete (includes HealthKit future section) |
| Terms of Use / EULA | `public/TERMS.md` | ✅ Complete (safety notice, accuracy disclaimer) |
| Nutrition Label | `docs/APP_STORE_NUTRITION_LABEL.md` | ✅ Ready to copy into App Store Connect |
| Export Compliance | `docs/ENCRYPTION_COMPLIANCE.md` | ✅ Exempt (user data encryption only) |
| Review Notes | `public/APP_STORE_REVIEW_NOTES.md` | ✅ For Apple reviewer |
| Privacy Manifests | `app.json` → `ios.privacyManifests` | ✅ Configured |
| Info.plist strings | `app.json` → `ios.infoPlist` | ✅ Camera, location, motion, photos |
| Legal links in Settings | `src/screens/SettingsScreen.tsx` | ✅ Privacy, Terms, Support |
| Age rating | 4+ | ✅ No objectionable content |

---

## File Structure Overview

```
src/
├── components/          # Shared UI (LogoMark, ScreenShell, CelestialDial, etc.)
├── data/                # Static data (brand, constellation data)
├── features/
│   ├── device-qa/       # Device diagnostics
│   ├── onboarding/      # Onboarding flow + radar tutorial
│   ├── paywall/         # MonetizationCatalog, PaywallCard, gates
│   ├── sky-lens/        # AR overlay (spec + placeholder + projection + orientation)
│   └── watch/           # Watch app spec
├── hooks/               # useEntitlement, useObserverLocation, useFonts
├── modules/             # Native module wrappers (WatchHaptics)
├── screens/             # HomeScreen, SkyScreen, OrbitalAlignmentScreen, SettingsScreen
├── services/            # All service layer (ephemeris, TLE, RevenueCat, haptics, etc.)
├── state/               # Context providers (Vault, Settings)
├── theme/               # tokens.ts (colors, typography)
└── utils/               # planetaryEphemeris, hapticController
assets/
├── icon.png             # Official app icon
├── splash.png           # Splash screen
├── logo/                # Brand assets (icon, splash variants)
└── audio/               # Audio files (6 needed per README)
public/
├── PRIVACY.md           # Privacy Policy
├── TERMS.md             # Terms of Use
└── APP_STORE_REVIEW_NOTES.md
docs/
├── APP_STORE_NUTRITION_LABEL.md
├── ENCRYPTION_COMPLIANCE.md
├── LEGAL_PRIVACY_LAUNCH_TODO.md
└── TESTFLIGHT_CHECKLIST.md
```

---

## Remaining Owner Tasks (Mrs. Pepper)

- [ ] Apple Developer Account activation (blocks all builds)
- [ ] `eas build --platform ios --profile preview` once dev account activates
- [ ] Host Privacy Policy at `ocoeestudios.com/auralunis/privacy`
- [ ] Host Terms of Use at `ocoeestudios.com/auralunis/terms`
- [ ] RevenueCat dashboard: create products matching MonetizationCatalog
- [ ] App Store Connect: fill nutrition label from `APP_STORE_NUTRITION_LABEL.md`
- [ ] Space-Track account + credentials for debris/re-entry data
- [ ] Audio MP3 files (6 per `assets/audio/README.md`)
- [ ] Rotate GitHub token after each session

---

## App Name Mapping (CRITICAL)

| App | Repo | Folder | What it is |
|-----|------|--------|-----------|
| **AuraLunis** | `jamiebzzz-stack/Auralunis` | `~/chronaura` | Astronomy / astral clock (THIS APP) |
| **Dreammmm** | `ocoee-studios/dreammmm` | `~/ocoee/auralunis` | Dream journal (SEPARATE APP, old name was AuraLunis) |

**Do not confuse these.** The GitHub repo was renamed `chronaura` → `Auralunis`. The local folder still says `chronaura`. GitHub auto-redirects.

---

## Build Priority

1. **Sky Lens Phase 1** — Camera + Stars + Constellations + Planets + Grid + Layer bar + Info cards (PR in progress)
2. **SDK 54 upgrade** — Expo Go on device requires SDK 54 now
3. **Sky Lens Phase 2** — Satellites, Deep Sky, Milky Way, Cultural Stories, Find Mode
4. **Watch App PR #1** — Complications + Tonight Screen + enhanced Dial
5. **Watch App PR #2** — Star Compass + Observation Log
6. **Watch App PR #3** — Satellite Timeline + Photo Timer
7. **HealthKit** — Only after Watch code exists. Re-add entitlements then.
8. **App Store submission**
