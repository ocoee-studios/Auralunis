# Sky Lens — AR Sky Overlay Spec

## What it is
Point your phone at the sky, see constellation lines, planet labels, star names,
satellite tracks, and the Milky Way band overlaid on the live camera feed.
Like SkyView Lite but with AuraLunis's Midnight Gold aesthetic.

## Architecture

```
┌──────────────────────────────────────┐
│          SkyLensScreen.tsx           │
│                                      │
│  ┌────────────────────────────────┐  │
│  │     expo-camera (background)   │  │
│  │                                │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │   SkyLensCanvas (SVG)    │  │  │
│  │  │   - Stars               │  │  │
│  │  │   - Constellation lines  │  │  │
│  │  │   - Planet markers       │  │  │
│  │  │   - Satellite tracks     │  │  │
│  │  │   - Milky Way band       │  │  │
│  │  │   - Grid / compass       │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │     LayerBar (bottom)          │  │
│  │  [Stars][Constellations]       │  │
│  │  [Planets][Satellites]         │  │
│  │  [Milky Way][Grid][Deep Sky]   │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │     InfoCard (tap-to-reveal)   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Sensor Pipeline

### Inputs (expo-sensors)
- `Magnetometer` → compass heading (azimuth where phone points)
- `Gyroscope` → rotation rate for smooth tracking
- `DeviceMotion` → attitude (pitch, roll, yaw) — preferred single source

### Transform: Device Orientation → Sky Coordinates
```typescript
// DeviceMotion gives us attitude:
// alpha = yaw (compass heading, 0-360)
// beta  = pitch (phone tilt, -90 to 90, 90 = pointing at zenith)
// gamma = roll (landscape tilt)

interface SkyPointing {
  azimuth: number;   // 0-360, where phone points horizontally (N=0, E=90)
  altitude: number;  // 0-90, how high phone points (0=horizon, 90=zenith)
  roll: number;      // device roll for rotating the view
  fovH: number;      // horizontal field of view (~60° for most phones)
  fovV: number;      // vertical field of view (~45°)
}

function deviceMotionToSkyPointing(motion: DeviceMotionMeasurement): SkyPointing
```

### Projection: Sky Coordinates → Screen Coordinates
```typescript
// For each celestial object with known (azimuth, altitude):
// 1. Compute angular distance from phone's pointing direction
// 2. If within FOV, project to screen x,y
// 3. Account for device roll

interface ScreenPoint {
  x: number;      // 0 to screenWidth
  y: number;      // 0 to screenHeight
  visible: boolean; // within current FOV
  scale: number;   // size scaling based on magnitude/distance
}

function skyToScreen(
  objectAz: number,
  objectAlt: number, 
  pointing: SkyPointing,
  screenWidth: number,
  screenHeight: number
): ScreenPoint
```

## Layers (Toggleable)

### 1. Stars (`layer_stars`)
- **Source**: Built-in catalog (Hipparcos bright stars, ~300 brightest)
- **Rendering**: Filled circles, size = inverse magnitude (brighter = bigger)
- **Colors**: White/gold tint, slight twinkle animation on brightest
- **Label**: Named stars only (Sirius, Vega, Betelgeuse, etc.) — gold text, 10px
- **Tap**: Show name, magnitude, constellation, distance

### 2. Constellations (`layer_constellations`)
- **Source**: Built-in constellation line data (88 IAU constellations)
- **Rendering**: Gold lines connecting stars (1px, rgba(217,168,78,0.5))
- **Label**: Constellation name at centroid, 11px gold, all caps
- **Tap**: Show name, mythology snippet, best viewing season
- **Premium gate**: Free = 10 constellations. Premium = all 88.

### 3. Planets (`layer_planets`)
- **Source**: Existing `planetaryEphemeris.ts` (already built!)
- **Rendering**: Colored circles with glow ring
  - Mercury: #C0C6D4 (silver)
  - Venus: #FFF6D6 (starlight)
  - Mars: #F0997B (coral)
  - Jupiter: #EF9F27 (amber)
  - Saturn: #D9A84E (gold)
- **Label**: Planet name + magnitude, 11px
- **Tap**: Show az/alt, rise/set times, distance, phase (for Venus/Mercury)

### 4. Moon (`layer_moon`)
- **Source**: Existing moon ephemeris
- **Rendering**: Circle with phase shadow overlay matching current illumination
- **Label**: Phase name + illumination %, 11px
- **Tap**: Show rise/set, next phase, distance, libration
- **Always on** (can't be turned off — it's the Moon)

### 5. Satellites (`layer_satellites`)
- **Source**: Existing `LiveTLEService.ts` + SGP4 propagation
- **Rendering**: Moving dot with trail line (last 30 seconds of path)
  - ISS: gold, larger dot, name always shown
  - Starlink: blue cluster dots
  - Others: silver dots
- **Label**: Name on hover/tap
- **Tap**: Show name, altitude, speed, next pass time
- **Premium gate**: Free = ISS only. Premium = full fleet.

### 6. Milky Way (`layer_milkyway`)
- **Source**: Pre-computed galactic plane coordinates
- **Rendering**: Semi-transparent band (rgba(255,246,214,0.08)) following
  the galactic plane. Subtle noise texture for realism.
- **Width**: ~30° band centered on galactic equator
- **Label**: "Milky Way" at galactic center position
- **Premium gate**: Premium only

### 7. Grid / Compass (`layer_grid`)
- **Rendering**:
  - Altitude circles at 0°, 30°, 60° (dashed, rgba(192,198,212,0.15))
  - Azimuth lines every 30° (dashed, same opacity)
  - Cardinal labels: N, NE, E, SE, S, SW, W, NW at horizon
  - Altitude labels: 30°, 60°, 90° on meridian
  - Horizon line: solid gold 1px at alt=0°
- **Always on by default**, toggleable

### 8. Deep Sky Objects (`layer_deepsky`)
- **Source**: Built-in Messier catalog (110 objects)
- **Rendering**: Small target/crosshair icon, color by type:
  - Galaxies: purple
  - Nebulae: teal
  - Clusters: amber
- **Label**: Messier number (M31, M42, etc.), 9px
- **Tap**: Show name, type, magnitude, size, description
- **Premium gate**: Premium only

### 9. Ecliptic (`layer_ecliptic`)
- **Rendering**: Dashed gold line showing the ecliptic plane
- **Label**: Zodiac sign boundaries marked along the line
- **Premium gate**: Premium only

## Layer Bar UI

Bottom of screen, horizontally scrollable pill bar:
```
[☆ Stars] [◎ Constellations] [● Planets] [◈ Satellites] [☁ Milky Way] [# Grid] [✦ Deep Sky] [~ Ecliptic]
```

- Active: filled gold pill, white text
- Inactive: transparent pill, muted text, gold border
- Tap to toggle
- Lock icon on premium layers for free users → tap opens paywall

## Info Card (tap-to-reveal)

When user taps any object, a card slides up from bottom:
```
┌─────────────────────────────────┐
│ ☆ Sirius                  ✕    │
│ Alpha Canis Majoris             │
│─────────────────────────────────│
│ Magnitude  -1.46                │
│ Distance   8.6 ly               │
│ Azimuth    215°                  │
│ Altitude   32°                   │
│─────────────────────────────────│
│ The brightest star in the       │
│ night sky, part of the          │
│ "Winter Triangle."              │
│                                 │
│ [Save to Vault] [Share Card]    │
└─────────────────────────────────┘
```

## Find Mode

Top-right search icon → type or select an object → 
Arrow compass appears pointing toward the object.
Phone vibrates (expo-haptics) when you're aimed within 5° of it.
Gold pulse animation when target is centered on screen.

## Night Mode

Toggle in top-left: switches entire overlay to deep red palette.
- All gold (#D9A84E) → deep red (#8B2020)
- All white → dark red (#A83030)  
- Camera brightness: dim filter overlay (rgba(0,0,0,0.3))
- Preserves dark adaptation for real stargazing

## Camera Setup

```typescript
import { CameraView } from 'expo-camera';

// Camera fills the screen as background
<CameraView
  style={StyleSheet.absoluteFill}
  facing="back"
  enableTorch={false}
/>

// SVG canvas overlaid on top with pointerEvents="box-none"
// so taps pass through to objects but camera gestures still work
```

## Performance

- **Sensor updates**: Throttle DeviceMotion to 30Hz (every ~33ms)
- **Render**: Only compute screen positions for objects within FOV + 10° buffer
- **Star catalog**: Pre-filter by magnitude (only stars visible to naked eye, mag < 6)
- **Constellation lines**: Pre-compute in static data, only transform at render time
- **Satellites**: Update TLE positions every 1 second, interpolate between

## Files to Create

```
src/features/sky-lens/
├── SkyLensScreen.tsx          # Main AR screen with camera + overlay
├── SkyLensCanvas.tsx          # SVG overlay rendering all layers
├── SkyLensLayerBar.tsx        # Bottom toggle bar
├── SkyLensInfoCard.tsx        # Tap-to-reveal detail card
├── SkyLensFindMode.tsx        # Search + compass arrow
├── hooks/
│   ├── useSkyPointing.ts      # DeviceMotion → SkyPointing
│   └── useSkyProjection.ts    # Sky coords → Screen coords
├── layers/
│   ├── StarLayer.tsx          # Render star dots + labels
│   ├── ConstellationLayer.tsx # Render constellation lines + names
│   ├── PlanetLayer.tsx        # Render planet markers
│   ├── MoonLayer.tsx          # Render moon with phase
│   ├── SatelliteLayer.tsx     # Render satellite tracks
│   ├── MilkyWayLayer.tsx      # Render galactic band
│   ├── GridLayer.tsx          # Render alt/az grid + compass
│   ├── DeepSkyLayer.tsx       # Render Messier objects
│   └── EclipticLayer.tsx      # Render ecliptic line
├── data/
│   ├── brightStars.ts         # Hipparcos top ~300 stars
│   ├── constellationLines.ts  # IAU 88 constellation line data
│   ├── messierCatalog.ts      # 110 Messier objects
│   └── namedStars.ts          # Common star names
└── accuracy/
    └── SkyLensAccuracyTypes.ts # Already exists
```

## Existing Code to Reuse
- `src/utils/planetaryEphemeris.ts` — planet positions ✅
- `src/services/LiveTLEService.ts` — satellite positions ✅
- `src/services/ConstellationHapticsService.ts` — haptic feedback ✅
- `src/services/BirthSkyService.ts` — moon phase calculation ✅
- `src/features/sky-lens/accuracy/SkyLensAccuracyTypes.ts` — types ✅

## SDK 54 Upgrade Notes
- `expo-camera` API changed in SDK 52+: use `CameraView` not `Camera`
- `expo-sensors` API is stable across SDK 51-54
- Test after upgrade: camera preview + DeviceMotion subscription simultaneously

---

## Additional Layers & Features (Phase 2+)

### Weather & Atmosphere Layers
- `layer_clouds` — Cloud forecast overlay showing clear patches and movement
- `layer_light_pollution` — Bortle scale heat map, sky quality in every direction
- `layer_aurora` — Green shimmer band on northern horizon when Kp is elevated
- `layer_jet_stream` — Animated upper atmosphere wind flow lines

### Time Layers
- `layer_rise_set_paths` — Arc lines showing Sun/Moon/planet travel paths tonight
- `layer_golden_hour` — Sky gradient preview showing color timing and direction
- `layer_eclipse_path` — Shadow track projection during upcoming eclipses
- `layer_meteor_radiant` — Radiant point + hourly rate during active showers

### Deep Sky Expansion
- Andromeda Galaxy (M31) rendered at actual angular size (6× Moon diameter)
- Orion Nebula (M42) sword region highlight
- Pleiades cluster outline (Seven Sisters)
- Double star indicators (Albireo, Mizar/Alcor)
- Variable star pulsing animations matching real periods
- Magnitude filter slider: naked eye (mag 6) → telescope (mag 10+)

### Satellite Expansion
- `layer_starlink_train` — Exact line-of-pearls for upcoming train passes
- `layer_iridium_flares` — Flash point prediction with countdown timer
- `layer_debris_field` — Space-Track debris density visualization (premium)
- `layer_reentry` — Projected re-entry path when objects are decaying
- Tiangong, Hubble, and other station tracking beyond ISS

### Cultural Sky Stories
- `layer_culture_greek` — Greek mythology constellation art overlaid on stars
- `layer_culture_aboriginal` — Aboriginal Australian Emu in the Sky, etc.
- `layer_culture_chinese` — Chinese star mansions (二十八宿)
- `layer_culture_norse` — Norse mythology star lore
- `layer_culture_polynesian` — Polynesian navigation stars
- Toggle between cultures to see the same stars through different eyes

### Photography Assist
- `layer_framing` — Rule-of-thirds grid sized to phone camera
- `layer_mw_framing` — Milky Way core with "best shot" framing suggestion
- `layer_star_trail_preview` — Predicted circular trails for 30-min exposure
- `layer_stacking_targets` — Circles highlighting ideal deep sky targets tonight

### Interactive Modes
- **Time scrub** — Slide finger to fast-forward/rewind sky by hours
- **Pinch zoom** — Zoom into dense star fields, constellation details expand
- **Compass lock** — Tap cardinal direction, view snaps and holds
- **Horizon panorama** — Slow 360° pan stitches a labeled panoramic sky map
- **Comparison mode** — Split screen: tonight vs any date (birthday, eclipse, solstice)
- **Star color mode** — Show actual stellar colors (blue giants, red dwarfs, yellow suns)
- **Zodiac belt** — Show which sign Sun/Moon/planets are currently transiting
- **Celestial reference lines** — Equator, ecliptic, galactic plane all toggleable

### Layer Organization UI
Layers grouped into categories for the layer picker:
- **Essentials**: Stars, Constellations, Planets, Moon, Grid
- **Satellites**: ISS, Fleet, Starlink Trains, Debris, Re-entry
- **Deep Sky**: Messier, Named Nebulae, Galaxies, Clusters
- **Atmosphere**: Clouds, Light Pollution, Aurora, Jet Stream
- **Time**: Rise/Set Paths, Golden Hour, Meteor Radiants, Eclipse
- **Culture**: Greek, Aboriginal, Chinese, Norse, Polynesian
- **Photo**: Framing, MW Core, Star Trails, Stacking Targets
- **Reference**: Ecliptic, Zodiac, Equator, Galactic Plane

Each category is a collapsible section in a slide-up drawer.
Individual layers toggle independently within each category.
