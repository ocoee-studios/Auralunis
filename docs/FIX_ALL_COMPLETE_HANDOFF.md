# AuraLunis Fix-All Complete Handoff

Generated: 2026-05-29T22:45:40

## Active navigation
- Home
- Sky
- Watch
- Learn
- Settings

## Fixed in the scaffold
- Approved star-dust AuraLunis logo assets added and used by `LogoMark`.
- App icon, adaptive icon, and splash screen updated.
- Expo camera permission hook updated to named `useCameraPermissions`.
- Manual Sky Map fallback added.
- Deep Sky / Nebulae / Milky Way cards wired into Sky.
- Dedicated Watch tab added.
- Settings persist locally with AsyncStorage.
- Theme selection applies globally through `ScreenShell`.
- Prototype Notes / Vault items persist locally.
- First-open 7-day trial popup preserved.
- Unsupported `fontWeight: "850"` values removed.
- Duplicate AuraLunis brand source removed.
- Active tab navigation refactored to the approved five-tab structure.
- Lightweight strict TypeScript syntax pass completed successfully with local external-library stubs.

## Native work still required
- StoreKit / RevenueCat sandbox implementation
- Production ephemeris engine and star catalog
- Outdoor iPhone Sky Lens testing
- watchOS and WidgetKit targets
- Notification scheduling
- Encrypted SQLite Vault for sensitive production data
- Native audio playback and optional Oracle backend
