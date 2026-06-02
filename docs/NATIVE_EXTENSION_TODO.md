# Native Extension Targets TODO

These are post-v1 targets. Swift scaffold files exist in the original handoff
package but are NOT compiled into the current Expo build.

## WidgetKit (iOS)
- `DeskObeliskWidget.swift` — StandBy / Home Screen widget
- `SovereignSigilWidget.swift` — branded sigil widget
- Requires an Xcode app extension target + shared data container
- [ ] Create the WidgetKit extension target in Xcode
- [ ] Wire shared UserDefaults for moon phase / tonight score data
- [ ] Design widget layouts (small, medium, large, StandBy)
- [ ] Test in iOS 17+ StandBy mode

## watchOS
- `TapticAstrolabeCrownView.swift` — Digital Crown astrolabe interaction
- Requires a watchOS app target + WatchConnectivity for phone ↔ watch sync
- [ ] Create the watchOS app target in Xcode
- [ ] Implement WatchConnectivity session for moon phase / tonight score
- [ ] Design watch complications matching the six face designs
- [ ] Test on physical Apple Watch

## visionOS
- `StellarPortalImmersiveSpace.swift` — Apple Vision Pro immersive sky
- Requires visionOS SDK + RealityKit
- [ ] Create the visionOS target (post-launch, when hardware adoption grows)
- [ ] Labeled "Stellar Portal · Coming Later" in the app

## HealthKit (optional)
- Heart-rate ambient for wind-down/Sound Bath features
- [ ] Add HealthKit entitlement
- [ ] Request authorization only when the user opts in
- [ ] Wire heart-rate data to ambient visual pulsing
