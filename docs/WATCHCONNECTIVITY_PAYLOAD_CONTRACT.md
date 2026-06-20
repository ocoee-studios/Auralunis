# WatchConnectivity Payload Contract

## Purpose

Keep the Watch payload intentionally small and stable.

## Payload

```json
{
  "moonPhase": "Waxing Gibbous",
  "tonightScore": 91,
  "nextEvent": "Venus visible in 1h 18m",
  "updatedAt": "2026-06-05T21:00:00Z"
}
```

## iPhone → Watch delivery

Use two delivery paths:

1. `updateApplicationContext`
   - sends the latest durable state
   - replaces older application-context state
   - use for the current Moon phase, score, and next event

2. `sendMessage`
   - optional foreground fast path
   - call only when `isReachable` is true
   - do not rely on it as the only delivery mechanism

## Watch behavior

- Activate the default `WCSession`.
- Apply the latest `applicationContext` after activation.
- Decode new application-context updates.
- Decode foreground messages when received.
- Publish payload updates on the main actor for SwiftUI.

## React Native bridge

The iPhone native module scaffold is located at:

```text
apple-native/iOS/AuraLunisWatchSync/
```

The JavaScript wrapper is:

```text
src/watchSync.ts
```

After the iOS native project exists, register the Expo module with the iOS app target and call `syncAuraLunisWatch(...)` whenever the Home sky summary changes.
