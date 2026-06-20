# AuraLunis Aura Pro Utility Expansion

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

### Sovereign Sigil
- SHA-256-derived local-safe vector preview
- does not expose raw birth coordinates or raw device IDs
- WidgetKit handoff scaffold

### Stellar Portal
- visionOS RealityKit ImmersiveSpace handoff scaffold

### Taptic Astrolabe Crown
- watchOS SwiftUI Digital Crown handoff scaffold with haptic detents

## Important launch boundary
Only the interactive phone-side scaffolds are active in the React Native app. Apple-native WidgetKit, watchOS, and visionOS targets must be created and tested in Xcode before those modules are marketed as live features.
