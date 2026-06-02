# Chronaura

Interactive Astral Clock — a React Native (Expo) app that turns your phone into
a real-time astronomical instrument.

## What it does

- **Living Astrolabe** — all-sky dial plotting the Sun, Moon, and planets for
  your exact location and time, powered by `astronomy-engine`.
- **Sky Lens AR** — camera overlay with tilt-compensated device orientation that
  labels celestial bodies in frame and guides you toward off-screen targets.
- **Satellite Tracker** — real SGP4 propagation of CelesTrak orbital elements
  via `satellite.js`, showing objects above your horizon.
- **Tonight Score** — viewing-quality index from cloud cover, moon impact, sky
  quality setting, and visible-planet count.
- **Learn** — animated lessons on the solar system, moon phases, constellations,
  and deep-sky objects.
- **Watch Faces** — six curated designs with ten complications.
- **Encrypted Vault** — NaCl secretbox encryption with the key in the device
  secure enclave.

## Navigation

Home · Sky · Watch · Learn · Settings

## Pricing

- Horizon (free)
- Horizon+ ($4.99/month or $29.99/year, $24.99 first-year founder offer, 7-day trial)
- Aura Pro (coming later)
- Sovereign (waitlist · coming later)

## Quick start

```bash
npm install
npx expo-doctor        # dependency alignment
npm run qa:all         # full test suite
npx eas build --profile development --platform ios
```

## Configuration

Add your keys to `app.json > extra`:

| Key | Service |
|-----|---------|
| `revenueCatIosApiKey` | RevenueCat public iOS API key |
| `revenueCatAndroidApiKey` | RevenueCat public Android API key |
| `openWeatherMapApiKey` | OpenWeatherMap (free tier) for Tonight Score cloud data |

## QA

```bash
npm run qa:all          # static + ephemeris + satellite + skylens + full suite
npm run qa:ephemeris    # ephemeris regression (7 reference positions)
npm run qa:satellite    # SGP4 pipeline regression (ISS reference)
npm run qa:skylens      # projection + orientation math (6 cases)
npm run qa:fresh-bugs   # 70+ integration guards
```

## Tech

- **Expo SDK 51** / React Native 0.74 / TypeScript (strict, 0 errors)
- `astronomy-engine` — reference-grade ephemeris
- `satellite.js` — SGP4 orbital propagation
- `tweetnacl` — authenticated encryption
- `react-native-purchases` (RevenueCat) — subscriptions
- `expo-sensors` — magnetometer + accelerometer
- `expo-secure-store` — encryption key storage
- `expo-notifications` — sky event alerts

## License

Proprietary — Ocoee Studios.
