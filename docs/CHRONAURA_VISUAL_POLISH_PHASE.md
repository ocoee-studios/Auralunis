# AuraLunis Visual Polish Phase

## Purpose

This phase closes the visual gap between the React Native scaffold and the approved AuraLunis mockups.

The current app structure is correct. The next work is to merge the production brand illustration, add carefully sourced astronomy photography, and validate the native iOS build on a real device.

## 1. Production logo SVG

Create or import:

```text
assets/brand/auralunis-logo-full.svg
```

This should be the complete Midnight Gold crescent-C astrolabe illustration used in the approved mockups.

Also preserve:

```text
assets/brand/auralunis-lockup.svg
assets/brand/auralunis-app-icon.svg
assets/brand/icon-composer/
assets/brand/watch/
```

### Rules

- Use the approved brand-guide image and earlier asset package as the visual reference.
- Do not replace the logo with a generic crescent, generic compass, or simplified placeholder.
- Preserve the crescent-C silhouette, astral rings, delicate gold-line geometry, and luxury Midnight Gold feel.
- Export a clean SVG with paths grouped logically for app, Watch, and Icon Composer adaptation.
- Keep the existing drawn astrolabe only as a temporary fallback until the production SVG is merged.

## 2. Learn-tab astronomy photography

Add real celestial thumbnails for the Learn tab.

Use factual astronomy imagery from approved sources. NASA imagery may generally be used under NASA media guidelines, but each selected asset must be reviewed individually for third-party copyright markings, source acknowledgment, and commercial-use restrictions.

Create:

```text
assets/learn/
```

Recommended launch thumbnails:

- Moon
- Orion Nebula
- Andromeda Galaxy
- Pleiades
- Milky Way
- Jupiter
- Saturn
- Solar System / Sun
- Constellation sky field
- Deep Sky collection cover

### Asset handling

For every image, record:

- file name
- source organization
- source page
- credit line
- object name
- original dimensions
- crop notes
- whether third-party copyright is marked
- whether a NASA logo, employee, or identifiable person appears
- approval status for in-app educational use

Use editorial, factual framing only. Do not imply NASA endorsement of AuraLunis.

## 3. Native Mac build and iPhone validation

From the React Native repo root:

```bash
npm install
npx expo install --fix
npm run typecheck
npm run doctor
npm install --global eas-cli
eas login
eas build:configure
npx expo install expo-dev-client
eas build --platform ios
```

For day-to-day native iteration, create a development build profile and test on a real iPhone.

Validate:

- Liquid Glass on supported iOS versions
- BlurView fallback
- reduced-transparency fallback
- haptics
- onboarding
- tab transitions
- Cosmic Vault persistence
- permission prompts
- Sky Lens fallback behavior
- paywall readability
- Restore Purchases placeholder replacement
- real-device contrast and spacing

## 4. Completion criteria

This phase is complete when:

- production SVG is merged
- app icon layers are merged
- Learn thumbnails are imported with credits
- native iOS development build runs on an iPhone
- Liquid Glass and fallbacks are visually checked
- all new assets are reflected in the asset manifest
