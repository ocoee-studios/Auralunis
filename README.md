# AuraLunis

Your Sky. Your Story. AuraLunis is a React Native (Expo) astronomy app that turns your phone into a real-time celestial instrument.

## What it does

- **Celestial Dial** — all-sky dial plotting the Sun, Moon, and planets for
  your exact location and time, powered by `astronomy-engine`.
- **Sky Lens** — a fully rendered, sensor-aligned planetarium (no camera / no AR
  overlay) that plots celestial bodies for your device orientation and guides you
  toward off-screen targets.
- **Satellite Tracker** — real SGP4 propagation of CelesTrak orbital elements
  via `satellite.js`, showing objects above your horizon.
- **Tonight Score** — viewing-quality index from cloud cover, moon impact, sky
  quality setting, and visible-planet count.
- **Birth Sky** — personal sky chart features for the date and place you choose.
- **Astro Weather** — observing forecasts for stargazing and sky photography.
- **Learn** — animated lessons on the solar system, moon phases, constellations,
  and deep-sky objects.
- **Encrypted Vault** — private saved observations protected on device.

## Navigation

Home · Sky · Learn · Vault · Settings

## Pricing

- Free: Tonight Score, Manual Sky Map, Find Mode, basic Sky Lens planetarium, Learn starter lessons, basic Celestial Calendar browsing
- Premium: full Sky Lens Pro tools & premium layers, constellation figures, satellites, Birth Sky, Astro Weather, Photo Planner, Night Vision, Time Travel, Encrypted Vault, and more

See `docs/APP_STORE_CONNECT_FIELDS.md` for the canonical App Store pricing/product IDs.

## Quick start

```bash
npm install
npx expo-doctor        # dependency alignment
npm run qa:all         # full test suite
npx eas build --profile development --platform ios
```

## Configuration

Add your keys to `app.json > extra` or EAS secrets as appropriate:

| Key | Service |
|-----|---------|
| `revenueCatIosApiKey` | RevenueCat public iOS API key |
| `revenueCatAndroidApiKey` | RevenueCat public Android API key |
| `openWeatherMapApiKey` | OpenWeatherMap for Tonight Score cloud data |

## QA

```bash
npm run typecheck      # TypeScript
npm run qa:all         # static + ephemeris + satellite + skylens + full suite
npm run qa:ephemeris   # ephemeris regression
npm run qa:satellite   # SGP4 pipeline regression
npm run qa:skylens     # projection + orientation math
npm run qa:fresh-bugs  # integration guards
```

## Tech

- **Expo SDK 54** / React Native 0.81 / TypeScript
- `astronomy-engine` — reference-grade ephemeris
- `satellite.js` — SGP4 orbital propagation
- `tweetnacl` — authenticated encryption
- `react-native-purchases` (RevenueCat) — subscriptions
- `expo-sensors` — magnetometer + accelerometer
- `expo-secure-store` — encryption key storage
- `expo-notifications` — sky event alerts

## License

Proprietary — Ocoee Studios.
