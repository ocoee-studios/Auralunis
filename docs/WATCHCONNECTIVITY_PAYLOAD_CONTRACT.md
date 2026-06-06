# WatchConnectivity Payload Contract

## iPhone → Watch (applicationContext)

```json
{
  "moonPhase": "WAXING GIBBOUS",
  "moonPercent": 61,
  "moonDistanceKm": 384400,
  "tonightScore": 82,
  "nextEvent": "GOLDEN HOUR",
  "nextEventCountdown": "IN 2H 43M",
  "solarTime": "10:09 PM",
  "celestialBody": "MOON",
  "updatedAt": "2026-06-05T22:09:00Z"
}
```

## Transport

- `updateApplicationContext` — durable, guaranteed delivery even if watch is asleep
- `sendMessage` — optional fast path when counterpart is reachable

## Update frequency

- On app foreground
- On significant location change
- On ephemeris refresh (every 5 minutes while app is active)
- On watch request (`didReceiveMessage` with `{"request": "skyData"}`)

## Source files

- iPhone: `apple-native/iOS/ChronauraWatchSync/`
- Watch: `apple-native/watchOS/ChronauraWatch/Connectivity/`
