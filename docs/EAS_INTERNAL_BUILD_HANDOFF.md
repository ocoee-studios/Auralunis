# AuraLunis EAS Internal Development Build Handoff

## Added files
- `eas.json`
- `.easignore`
- `scripts/bootstrap-native-device.sh`
- `scripts/native-device-preflight.js`

## Build profiles
- `development` — internal physical-device development build
- `development-simulator` — iOS Simulator development build
- `preview` — internal stakeholder preview
- `production` — App Store-oriented build profile

## Commands

```bash
chmod +x ./scripts/bootstrap-native-device.sh
./scripts/bootstrap-native-device.sh

npx eas-cli@latest login
npx eas-cli@latest build --platform ios --profile development

npm run start:dev-client
```

## Important
The bootstrap script installs `expo-dev-client` using `npx expo install` so Expo chooses the SDK-compatible version instead of relying on a manually pinned version.
