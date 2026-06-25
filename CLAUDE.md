# CLAUDE.md — AuraLunis Project Context

## What this is
AuraLunis is "The Interactive Astral Clock" — a React Native (Expo SDK 51) app
for iOS that tracks the real sky (Sun, Moon, planets, satellites) through a
camera-aligned AR overlay and a 9-mode orbital tracking radar, with watch
faces, learn content, and an encrypted vault for sky notes.

## Active codebase
This React Native / Expo repo is the source of truth. Do not revive earlier
HTML implementations. HTML files in the repo are visual references only.

## Navigation (locked — do not add tabs)
Home · Sky · Watch · Learn · Settings

## Pricing (locked — source of truth)
- **Horizon Free** — always free
- **AuraLunis Premium monthly** — $6.99/month (no trial)
- **AuraLunis Premium annual** — $39.99/year (7-day free trial, annual only)
- **Founders Lifetime** — $99.99 one-time purchase
- **Aura Pro** — Coming Later (do NOT enable purchase flows)
- **Sovereign** — Waitlist, Coming Later (do NOT enable purchase flows)

Bundle ID: `com.ocoeestudios.auralunis` (Ocoee Studios LLC). RevenueCat product IDs
(must match App Store Connect exactly):
- `com.ocoeestudios.auralunis.premium.monthly`
- `com.ocoeestudios.auralunis.premium.annual`
- `com.ocoeestudios.auralunis.lifetime.founders`

Entitlement: `auralunis_premium` (all three products unlock this)

The first-open paywall (`ThreeTierPaywallModal`) shows these three options
only — Monthly, Annual, and Lifetime Founders. It does NOT show Aura Pro
or Sovereign. Annual is selected by default.

## Feature gates (locked)
Free modes: Fleet, Deep Space, Golden Hour, Meteor
Premium modes: Train, Debris, Re-Entry, Chain, Static
Cosmic Drift: 5 free lock events, unlimited with Premium

Gate logic: `isModeGated()` in `src/features/paywall/MonetizationCatalog.ts`
Entitlement check: `useEntitlement()` in `src/hooks/useEntitlement.ts`

## Before coding: run
```bash
npm install
npx expo install --fix
npm run typecheck   # tsc --noEmit
npm run qa:all      # full test suite
```

## QA suite
- `npm run qa:all` chains: static, sky, whole, native-device, revenuecat, aura-pro, fresh-bugs, ephemeris, satellite, skylens
- `npm run qa:fresh-bugs` — 70+ regression guards
- `tsc --noEmit` — must be 0 errors

## Key architecture
- `astronomy-engine` — real ephemeris (Sun/Moon/planets)
- `satellite.js` — SGP4 orbital propagation
- `tweetnacl` — NaCl secretbox vault encryption
- `expo-sensors` — magnetometer + accelerometer for AR pointing
- `react-native-purchases` — RevenueCat subscriptions
- `react-native-reanimated` — UI-thread animations for radar blips
- `react-native-svg` — SVG radar scope, particle galaxy
- `expo-av` — Ionospheric Static audio engine
- `expo-notifications` — sunset/moonrise alerts
- `CoreHaptics` — native Swift module via Expo Modules

## Do NOT enable until genuinely ready
- Aura Pro / Sovereign purchase flows
- Vision Pro / spatial experiences
- Community features
- Hardware checkout flows

## Key file map
- `docs/CLAUDE_SESSION_NOTES.md` — full build history, all decisions
- `GEMINI_HANDOFF.md` — orientation for external AI agents
- `src/screens/OrbitalAlignmentScreen.tsx` — 9-mode tracking hub
- `src/features/paywall/MonetizationCatalog.ts` — pricing, gates, features
- `src/features/paywall/ThreeTierPaywallModal.tsx` — paywall UI
- `src/theme/tokens.ts` — AuraLunisColors, AuraLunisPricing

## Contact
- admin@ocoeestudios.com
- manager@ocoeestudios.com

## GitHub
`jamiebzzz-stack/auralunis` (private)
