# AuraLunis Watch App — Full Spec

## Overview
A standalone WatchOS companion that makes your wrist a stargazing instrument.
Not just complications — a full Watch app with sensor-driven features,
crown interactions, and haptic feedback that turns the Apple Watch into
a celestial compass.

## Architecture

```
AuraLunisWatch/
├── AuraLunisWatchApp.swift          # Entry point
├── ContentView.swift                # Tab navigation
├── Screens/
│   ├── CelestialDialScreen.swift    # Main clock face (EXISTS — enhance)
│   ├── TonightSkyScreen.swift       # Swipeable sky summary cards
│   ├── SatelliteTimelineScreen.swift # Upcoming passes list
│   ├── StarCompassScreen.swift      # Point wrist, haptic on bright objects
│   ├── PhotoTimerScreen.swift       # Astrophotography countdown
│   └── ObservationLogScreen.swift   # Tap to log sightings
├── Complications/
│   ├── NextPlanetComplication.swift
│   ├── GoldenHourComplication.swift
│   ├── AuroraAlertComplication.swift
│   ├── MeteorShowerComplication.swift
│   ├── SkyQualityComplication.swift
│   ├── MoonRiseSetComplication.swift
│   └── TonightScoreComplication.swift
├── Services/
│   ├── WatchEphemerisService.swift  # Lightweight planet/moon/sun calc
│   ├── WatchSensorService.swift     # Magnetometer + accelerometer
│   ├── WatchHapticEngine.swift      # CoreHaptics patterns
│   ├── WatchDataSync.swift          # WatchConnectivity bridge to phone
│   └── WatchVaultService.swift      # Local observation storage + sync
├── Models/
│   ├── CelestialObject.swift
│   ├── SatellitePass.swift
│   ├── ObservationEntry.swift
│   └── SkyConditions.swift
└── Shared/
    ├── AuraLunisColors.swift        # Midnight Gold palette
    ├── AuraLunisFont.swift          # SF Compact + Cinzel fallback
    └── NightModeModifier.swift      # Red-only palette toggle
```

## Complications (7 total)

All complications support all families: circular, rectangular, inline, corner.
Data updates via TimelineProvider with 15-minute refresh intervals.

### 1. Next Visible Planet
- **Template**: "Jupiter rises 9:42 PM"
- **Circular**: Planet symbol + countdown
- **Rectangular**: Planet name, rise time, magnitude, constellation
- **Data**: From WatchEphemerisService — next planet to rise/set
- **Tap**: Opens Tonight Sky screen filtered to that planet

### 2. Golden Hour Countdown
- **Template**: "☀ Golden in 1h 42m"
- **Circular**: Sun icon + countdown ring
- **Rectangular**: Countdown + golden/blue hour times + sun az/alt
- **Data**: Computed from sun ephemeris for observer location
- **Tap**: Opens Celestial Dial with sun highlighted

### 3. Aurora Alert
- **Template**: "Kp 5.3 · 40% chance"
- **Circular**: Color ring (green/yellow/red by Kp level)
- **Rectangular**: Kp value, probability, best viewing window, direction
- **Data**: From phone via WatchConnectivity (AstroWeatherService)
- **Tap**: Opens Tonight Sky with aurora details

### 4. Meteor Shower Status
- **Template**: "Perseids · 60/hr tonight"
- **Circular**: Shooting star icon + rate number
- **Rectangular**: Shower name, peak date, ZHR, radiant constellation, moon interference %
- **Data**: Built-in meteor shower calendar (13 major showers)
- **Tap**: Opens Tonight Sky with radiant highlighted

### 5. Sky Quality Score
- **Template**: "82 Excellent"
- **Circular**: Score number with color ring
- **Rectangular**: Score, label, cloud %, seeing, transparency, best window
- **Data**: From phone via WatchConnectivity (AstroWeatherService)
- **Tap**: Opens Tonight Sky summary

### 6. Moon Rise/Set
- **Template**: "🌔 Sets 2:14 AM"
- **Circular**: Moon phase icon + countdown to next event
- **Rectangular**: Phase name, illumination %, rise time, set time, next phase date
- **Data**: WatchEphemerisService moon calculations
- **Tap**: Opens Celestial Dial with moon highlighted

### 7. Tonight Score (EXISTS — enhance)
- Add trend arrow (improving/worsening vs last hour)
- Add "best at 11 PM" optimal window text
- Color-code: green (>70), amber (40-70), red (<40)

## Watch App Screens (6 total)

### Screen 1: Celestial Dial (EXISTS — enhance)
Already built: clock hands, planets on orbital rings, sun vector, moon phase,
tonight score, crown scrub ±12h.

**Enhancements:**
- **Tap any planet** → haptic pulse + name/magnitude/constellation popover
- **Crown scrub visual** — progress arc shows how far from "now" you've scrubbed
- **Night mode** — single tap top-left toggles red palette
- **Compass heading** — subtle N/E/S/W markers on outer ring rotate with magnetometer
- **Planet trail** — faint dotted line showing planet's path over next 6 hours

### Screen 2: Tonight's Sky Summary
Vertically scrollable cards, one per visible object tonight:

```
┌─────────────────────────┐
│  🌙 Moon                │
│  Waning · 40%           │
│  Sets 2:14 AM           │
│  az 292° alt 34°        │
│  ─────────────────────  │
│  Look W-NW, about 1/3   │
│  of the way up           │
└─────────────────────────┘
      ↕ scroll to next
┌─────────────────────────┐
│  ● Mars                 │
│  mag 1.2 · Scorpius     │
│  Best at 10:30 PM       │
│  az 327° alt 41°        │
│  ─────────────────────  │
│  Bright red point,      │
│  high in NW              │
└─────────────────────────┘
```

- Cards ordered by brightness (most visible first)
- Below-horizon objects shown dimmed at bottom with "rises at" time
- **Crown scroll** between cards
- **Tap card** → vibrates, opens full detail with rise/set curve
- Includes: Sun (with golden hour), Moon, Mercury, Venus, Mars, Jupiter, Saturn
- Also includes ISS if a pass is tonight

### Screen 3: Satellite Pass Timeline
Scrollable list of upcoming satellite passes for next 24 hours:

```
┌─────────────────────────┐
│  ISS    ●●●●○  9:42 PM  │
│  NW→SE  peak 62°  4m32s │
├─────────────────────────┤
│  Hubble ●●○○○  11:15 PM │
│  N→E    peak 28°  2m10s │
├─────────────────────────┤
│  NOAA20 ●○○○○  1:03 AM  │
│  W→S    peak 15°  1m45s │
└─────────────────────────┘
```

- Brightness dots (●) = visual magnitude estimate
- Direction + peak elevation + duration
- **Tap pass** → countdown timer starts, haptic at T-60s, T-10s, T-0
- **Crown scroll** through the list
- Data from LiveTLEService via WatchConnectivity

### Screen 4: Star Compass
The flagship Watch-exclusive feature. Point your wrist at the sky:

```
         N
    ·    ★    ·
  ·    ·   ·    ·
W  ·  ←YOU→  ·  E
  ·    ·   ·    ·
    ·    ·    ·
         S
```

- Uses magnetometer + accelerometer to know which direction your wrist points
- Shows a compass rose with bright objects plotted as dots
- As you sweep your arm across the sky, objects drift across the display
- **Haptic feedback**: soft tap when sweeping past a bright star, medium for planet,
  strong for ISS or very bright object
- Object labels appear when you hold steady pointed at them (2 seconds)
- **Crown**: adjusts magnitude filter — turn to show dimmer objects
- **Night mode**: red palette for dark adaptation

**Haptic Patterns:**
- Star (mag 0-2): single soft tap
- Planet: double tap
- Moon: slow pulse
- ISS/satellite: rapid triple tap
- Constellation center: long buzz
- Found target (Find Mode): continuous pulse getting faster as you aim closer

### Screen 5: Astrophotography Timer
Crown-adjustable countdown for long exposures:

```
┌─────────────────────────┐
│   EXPOSURE TIMER        │
│                         │
│      2:30               │
│   ◄━━━━━━●━━━━━━►      │
│   30s        5m         │
│                         │
│   [ START ]             │
│                         │
│   Stacking: 5 × 30s    │
│   Total: 2m 30s         │
│   ISO: 3200  f/2.8      │
└─────────────────────────┘
```

- **Crown** adjusts exposure duration (30s to 10 minutes)
- Presets: 500 Rule, NPF Rule (from AstroPhotographyService data)
- **Start** → screen stays on, countdown with progress ring
- Haptic at halfway, at 10s remaining, and at completion
- **Stacking mode**: set number of frames, auto-repeats with haptic between each
- **Interval mode**: for star trails — set interval + total duration
- Keeps screen awake (WKExtendedRuntimeSession)

### Screen 6: Observation Log
Quick-tap journaling for stargazers:

```
┌─────────────────────────┐
│   LOG OBSERVATION       │
│                         │
│   ● Mars                │
│   ● Moon                │
│   ● Jupiter             │
│   ● ISS pass            │
│   ● Meteor              │
│   ● Other...            │
│                         │
│   📍 Ducktown, TN       │
│   🕐 10:42 PM           │
└─────────────────────────┘
```

- Quick-select what you observed from tonight's visible objects
- Auto-tags: timestamp, location, sky conditions, moon phase
- **Tap "Other"** → voice dictation for freeform notes
- **Syncs to AuraLunis Vault** on phone via WatchConnectivity
- Creates a SkyShare-ready observation card automatically
- **Crown scroll** through the object list
- Review past logs by swiping left on main screen

## Crown Interactions Summary

| Screen | Crown Action |
|--------|-------------|
| Celestial Dial | Time scrub ±12 hours |
| Tonight's Sky | Scroll between object cards |
| Satellite Timeline | Scroll pass list |
| Star Compass | Magnitude filter (show dimmer/brighter) |
| Photo Timer | Adjust exposure duration |
| Observation Log | Scroll object list |

## Night Mode (Global)

Toggle available on every screen (top-left tap or force press).
Swaps entire palette:

| Standard | Night Vision |
|----------|-------------|
| #D9A84E (gold) | #8B2020 (deep red) |
| #FFF6D6 (starlight) | #A83030 (red) |
| #C0C6D4 (silver) | #772020 (dark red) |
| #030816 (cosmic black) | #0A0000 (pure dark) |
| White text | Dark red text |

Also dims the OLED screen brightness via WKInterfaceDevice.

## Data Flow: Phone ↔ Watch

```
Phone (AuraLunis)                    Watch
─────────────────                    ─────
AstroWeatherService  ──────────►  Sky Quality complication
                                  Aurora Alert complication
LiveTLEService       ──────────►  Satellite Timeline screen
                                  ISS countdown complication
AstroPhotographyService ────────►  Photo Timer presets
SkyShareService      ◄──────────  Observation Log entries
Vault                ◄──────────  Observation timestamps
```

- Uses WatchConnectivity framework
- Phone sends fresh data on:
  - App foreground
  - Every 15 minutes via background refresh
  - When Watch requests (complication timeline update)
- Watch sends back:
  - New observation log entries
  - Photo timer completion timestamps

## Haptic Constellation Feature (EXISTS — expand)

Currently: 6 constellations with haptic patterns on tap.

**Expand to:**
- All 88 IAU constellations
- Each star in the pattern = one haptic tap
- Timing between taps matches angular distance between stars
- Brighter stars = stronger tap
- Pattern plays in "connect the dots" order
- **Star Compass integration**: feel the constellation as you sweep across it
- Premium gate: 6 free, 88 premium

## Build Priority

### PR #1: Complications + Tonight Screen
- 7 complications with TimelineProviders
- Tonight's Sky summary screen
- WatchDataSync bridge
- Enhanced Celestial Dial (tap planets, night mode, compass heading)

### PR #2: Star Compass + Observation Log
- Magnetometer-driven star compass (the flagship feature)
- Full haptic engine with constellation patterns
- Observation log with vault sync
- Crown magnitude filter

### PR #3: Satellite Timeline + Photo Timer
- Pass predictions with countdown haptics
- Crown-adjustable exposure timer
- Stacking mode + interval mode
- Screen-awake session management
