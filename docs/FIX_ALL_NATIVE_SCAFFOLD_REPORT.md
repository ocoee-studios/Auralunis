# Chronaura Native Scaffold — Fix-All Pass

## Fixed
- Refactored active bottom navigation to Home / Sky / Watch / Learn / Settings.
- Corrected expo-camera permission hook to named `useCameraPermissions`.
- Added Manual Sky Map fallback.
- Added native Deep Sky and Milky Way / Galaxy Mode cards.
- Added a dedicated Watch screen.
- Added persistent Settings context using AsyncStorage.
- Applied selected theme globally through ScreenShell gradients.
- Added local prototype Vault storage for Notes, LifeSky moments, and Archive objects.
- Removed unsupported `fontWeight: "850"` values.
- Consolidated brand identity to one source.
- Added approved star-dust logo PNG assets.
- Updated app icon, adaptive icon, and splash screen.
- Preserved 7-day first-open trial popup.

## Still requires native integration
- StoreKit / RevenueCat sandbox purchasing.
- Production astronomy ephemeris and star catalog.
- Outdoor iPhone Sky Lens testing.
- Real watchOS and WidgetKit targets.
- Production encrypted SQLite Vault for sensitive data.
- Native notification scheduling.
- Real sound playback and Oracle backend.
