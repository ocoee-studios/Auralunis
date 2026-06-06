# Chronaura watchOS App

## Setup in Xcode

1. Open the main Chronaura project in Xcode
2. File → New → Target → watchOS → App
3. Product Name: `ChronauraWatch`
4. Interface: SwiftUI
5. Watch Connectivity: Yes
6. Copy all `.swift` files from this folder into the new target
7. Set the deployment target to watchOS 10.0 (watchOS 11.0 for Liquid Glass)
8. Add WatchConnectivity framework to the target

## Build & Run

1. Select the `ChronauraWatch` scheme
2. Choose an Apple Watch simulator (or pair your real watch)
3. Build & Run (⌘R)

## Architecture

- `ChronauraWatchApp.swift` — App entry point
- `ChronauraWatchFace.swift` — Main face layout + Digital Crown binding
- `AstrolabeView.swift` — Central compass dial with crescent moon, rings, spheres
- `ComplicationsOverlay.swift` — Six data complications around the dial
- `TimeScrubView.swift` — Bottom ±12h time scrub with progress bar
- `WatchSessionManager.swift` — Receives sky data from iPhone via WatchConnectivity
- `Models.swift` — Data structures

## Liquid Glass

On watchOS 11+, the astrolabe rings use `.ultraThinMaterial` for glass effects.
On older watchOS, they fall back to standard rendering.

## Data Flow

iPhone app (React Native) → WatchConnectivity → WatchSessionManager → SwiftUI views

The iPhone app sends: solar time, celestial body, lunar phase, moon distance,
next event, tonight score. All computed by the ephemeris engine.
