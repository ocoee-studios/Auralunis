# AuraLunis Aura Pro Utility Expansion

> **Aura Pro is a set of premium features under the single `AuraLunis Premium` entitlement — not a separate purchase tier.** The two shipping panels, **Satellite Thermal** and **AstroPhoto Predictor**, are premium features gated in the app today.

## Added phone-side utilities

### Satellite + Space-Junk Thermal Overlay
- Brightest, Stations, and Decaying modes
- Safe fixture fallback
- CelesTrak JSON GP adapter
- AsyncStorage cache
- Two-hour cache boundary
- Clear distinction between visual heat/density and physical temperature
- Precise orbit propagation still requires a production SGP4 renderer

### Light Pollution + AstroPhoto Predictor
- Interactive urban, suburban, and dark-sky scenarios
- Bortle-style sky class
- cloud, Moon brightness, humidity, and visibility fixture metrics
- score output and suggested targets
- production map tiles, weather forecasts, location, and Moon calculations still need provider integration

### Time-Scrub Matrix
- Forward and backward interactive scrubbing
- Planet-position fixture rendering
- nearby retrograde adapter fixture windows
- production ephemeris must replace fixtures before astronomical claims are shown

## Added future luxury previews and native handoffs

### Desk Obelisk
- In-app preview
- WidgetKit StandBy-oriented native scaffold
- Future / do-not-enable-until-ready (per CLAUDE.md)

### Stellar Portal
- visionOS RealityKit ImmersiveSpace handoff scaffold
- Future / do-not-enable-until-ready (per CLAUDE.md)

## Important launch boundary
Only the interactive phone-side scaffolds are active in the React Native app. Any Apple-native WidgetKit or visionOS targets are future work that must be created and tested in Xcode before those modules are marketed as live features. (The Sovereign tier and any watchOS "Astrolabe Crown" concept were removed and are no longer part of the product.)
