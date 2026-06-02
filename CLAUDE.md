# CLAUDE.md — Chronaura Project Context

## What this is
Chronaura is an Interactive Astral Clock — a React Native (Expo SDK 51) app
for iOS that shows the real sky (Sun, Moon, planets, satellites) through a
camera-aligned AR overlay, with watch faces, learn content, and an encrypted
vault for sky notes.

## Active codebase
This React Native / Expo repo is the source of truth. Do not revive earlier
HTML implementations. HTML files in the repo are visual references only.

## Navigation (locked)
Home · Sky · Watch · Learn · Settings

## Launch membership (locked)
- Horizon Free — always free
- Horizon+ — $4.99/month or $29.99/year, 7-day trial, $24.99 first-year founder annual
- Aura Pro — **Coming Later** (do not enable purchase flows)
- Sovereign — **Waitlist · Coming Later** (do not enable purchase flows)
- Stellar Portal / Spatial Matrix — future spatial previews only

The first-open paywall shows Horizon+ only.

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
- `expo-notifications` — sunset/moonrise alerts

## Do NOT enable until genuinely ready
- Aura Pro / Sovereign purchase flows
- Vision Pro / spatial experiences
- Community features
- Hardware checkout flows
- WidgetKit / watchOS targets (Swift scaffolds exist but are not compiled)

## GitHub
`ocoee-studios/chronaura` (private)
