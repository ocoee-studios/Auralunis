# Chronaura watchOS Implementation Handoff

## Goal

Add an Apple-native watchOS companion app target in Xcode and build the first working Chronaura astrolabe face in SwiftUI.

## Platform correction

Liquid Glass is a watchOS 26 design language feature. It is not a watchOS 11 API.

For the SwiftUI Watch app:

- use SwiftUI `glassEffect` on watchOS 26 and newer
- preserve a readable Midnight Gold fallback for watchOS 11 through watchOS 25
- do not depend on a UIKit-only implementation for the watchOS SwiftUI target

The starter code in:

```text
apple-native/watchOS/ChronauraWatch/
```

uses a conditional SwiftUI glass modifier and a pre-watchOS-26 fallback.

## Create the Xcode target

In Xcode:

```text
File → New → Target → watchOS App
```

Name the target:

```text
ChronauraWatch
```

Recommended choices:

- Interface: SwiftUI
- Language: Swift
- Include Widget Extension: Yes, if adding Smart Stack / complication surfaces in the same pass
- Companion iOS app: the generated Chronaura iOS app target

Copy the Swift starter files into the generated watchOS app target.

## Astrolabe face layout

Build the face from the approved reference image and brand guide:

- three concentric gold rings
- a centered crescent moon
- compass points: N, E, S, W
- Moon phase complication
- Tonight Score complication
- Next Event complication
- Midnight Gold typography
- restrained Liquid Glass ring treatment on watchOS 26+
- readable non-glass fallback on older watchOS versions

Do not use a generic Apple Watch face template. Preserve the Chronaura crescent-C astrolabe identity.

## WatchConnectivity

The iPhone app sends the latest compact payload:

```text
moonPhase
tonightScore
nextEvent
updatedAt
```

Use `updateApplicationContext` for the latest durable state and `sendMessage` as an optional foreground fast path when the counterpart is reachable.

See:

```text
docs/WATCHCONNECTIVITY_PAYLOAD_CONTRACT.md
apple-native/iOS/ChronauraWatchSync/
apple-native/watchOS/ChronauraWatch/Connectivity/
```

## Digital Crown behavior

The Digital Crown controls a ±12-hour time scrub:

```text
-12 ... 0 ... +12
```

Requirements:

- one-hour increments
- visible offset label
- a click haptic when crossing each integer-hour mark
- no duplicate haptic at the same mark
- time-offset changes reflected in the face state
- reset action returns to `Now`

The starter face uses SwiftUI `digitalCrownRotation` plus explicit `WKInterfaceDevice.current().play(.click)` checkpoints.

## First working milestone

A real Apple Watch should show:

- Chronaura astrolabe rings
- crescent moon
- compass labels
- Moon phase
- Tonight Score
- Next Event
- ±12-hour crown scrub
- hourly haptic checkpoints
- latest iPhone payload after sync

## Later pass

- WidgetKit Smart Stack surfaces
- complication families
- deeper astronomy timeline
- richer animation tuning
- Watch Ultra crown-specific experiments
- Sovereign visual treatments
