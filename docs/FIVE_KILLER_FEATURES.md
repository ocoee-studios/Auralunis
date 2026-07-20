# Five Killer Features — Build in this order

## 1. TIME SCRUB ⭐⭐⭐⭐⭐ (every competitor has this)

Drag a slider to fast-forward/rewind the sky in real time.
Watch constellations rise and set, planets move, moon phases cycle.

### UI
Add a time scrub bar above the layer bar in Sky Lens:
- Thin gold line with draggable thumb
- Shows current time: "10:15 PM" centered above the bar
- Drag left = past, drag right = future
- Double-tap = reset to NOW
- Speed indicator: "×1" "×10" "×100" "×1000"

### Implementation
In SkyLensScreen.tsx:
```tsx
const [timeOffset, setTimeOffset] = useState(0); // milliseconds offset from now
const observerTime = useMemo(() => new Date(Date.now() + timeOffset), [timeOffset]);
```

Pass `observerTime` to all ephemeris computations instead of `Date.now()`.
The existing `useSkyProjection` hook already takes a `now` parameter —
just override it with the scrubbed time.

### Gesture
Use react-native-gesture-handler PanGestureHandler:
- Horizontal drag: each pixel = 1 minute
- Velocity-based: fast drag = hours, slow drag = minutes
- Pinch on the time bar: changes scrub speed multiplier

### Visual feedback
As time scrubs, the sky smoothly rotates. Stars rise/set.
Moon phase changes. Planets visibly move along the ecliptic.
The heading HUD stays fixed (you're still pointing the same
direction), but the sky contents change to match the new time.

---

## 2. PINCH TO ZOOM ⭐⭐⭐⭐⭐ (transforms exploration)

Currently Sky Lens has no zoom. Add it.

### Implementation
In SkyLensScreen.tsx:
```tsx
const [zoomLevel, setZoomLevel] = useState(1); // 1× = current, max 5×
```

Use PinchGestureHandler from react-native-gesture-handler.
Zoom affects the FOV calculation:
```tsx
const effectiveFov = baseFov / zoomLevel;
```

### Progressive reveal
As zoom increases, show more objects:
- 1×: labeled bright stars, constellations, planets
- 2×: fainter stars become visible, more labels appear
- 3×: deep sky objects get labels, galaxies/clusters visible
- 5×: all catalog objects visible, maximum detail

### Smooth animation
Zoom should feel like looking through binoculars being adjusted.
Use Reanimated withSpring for smooth interpolation.

### UI indicator
Small "2.0×" text in the corner during zoom.
Double-tap to reset to 1×.

---

## 3. STARGAZING INDEX ⭐⭐⭐⭐ (one number, infinite value)

Combine Tonight Score + Astro Weather + Moon Phase into
ONE number on the Home screen: "Tonight: 87 — GO"

### Formula
```
index = (
  cloudScore * 0.35 +     // 0-100, from AstroWeatherService
  moonScore * 0.25 +       // 100 when new moon, 0 when full
  seeingScore * 0.20 +     // atmospheric seeing 1-5 → 0-100
  transparencyScore * 0.20  // atmospheric transparency
)
```

### Home Screen Widget
Replace or augment the current Tonight Score dial:
```
┌─────────────────────────────────┐
│        Tonight: 87              │
│     ████████████░░  GO          │
│                                 │
│  ☁ Clear  🌙 28% Moon  👁 Good │
│  Best window: 10pm - 2am       │
└─────────────────────────────────┘
```

Color: Green (80+) = GO, Gold (50-79) = MAYBE, Red (<50) = STAY IN

### Push notification
"Tonight's sky: 92/100 — exceptional conditions. The Milky Way 
core is visible until 1am. Don't miss it."

Send at sunset if index > 75.

---

## 4. CELESTIAL EVENT CALENDAR ⭐⭐⭐⭐ (daily engagement)

New screen: upcoming eclipses, meteor showers, conjunctions,
oppositions, supermoons, comets, planetary alignments.

### Data source
Build a static catalog of 2026-2027 events:
```typescript
export const CELESTIAL_EVENTS: CelestialEvent[] = [
  {
    id: "perseids-2026",
    name: "Perseid Meteor Shower",
    date: "2026-08-12",
    endDate: "2026-08-13",
    type: "meteor",
    description: "Up to 100 meteors per hour from the constellation Perseus.",
    bestTime: "After midnight",
    direction: "Look northeast toward Perseus",
    moonInterference: "low",
    rating: 5,
  },
  {
    id: "saturn-opposition-2026",
    name: "Saturn at Opposition",
    date: "2026-09-11",
    type: "opposition",
    description: "Saturn is at its closest and brightest. Rings clearly visible.",
    bestTime: "All night",
    direction: "Rises in the east at sunset",
    rating: 4,
  },
  // ... 30+ events for 2026-2027
];
```

### Screen layout
```
CELESTIAL CALENDAR

This Week
  ● Sat Jun 27 — Mercury at Greatest Elongation
  
This Month  
  ● Jul 6 — Earth at Aphelion
  ● Jul 28 — Delta Aquariid Meteor Shower
  ● Jul 30 — Mars conjunct Uranus

Upcoming Highlights
  ★ Aug 12 — Perseid Meteor Shower (5/5)
  ★ Sep 7 — Total Lunar Eclipse
  ★ Sep 11 — Saturn at Opposition
```

### Push notifications
NotificationService.ts already exists. Schedule local 
notifications for events the user might see:
- 1 day before: "Tomorrow night: Perseid meteor shower peaks"
- Day of at sunset: "Tonight: up to 100 meteors/hour after midnight"

### Integration with Sky Lens
Each event has a "See in Sky Lens" button that opens AR mode
pointed at the relevant part of the sky (like Learn deep-links).

---

## 5. PHOTO OVERLAY ⭐⭐⭐⭐ (viral content engine)

Take a photo through Sky Lens. The sky map overlay is baked
into the image. Instant Instagram/TikTok content.

### Implementation
```tsx
import { captureRef } from "react-native-view-shot";

async function captureSkyImage() {
  // Capture a screenshot of the rendered Sky Lens view (no camera involved)
  const uri = await captureRef(skyLensRef, {
    format: "jpg",
    quality: 0.95,
  });
  
  // Show share sheet
  await Sharing.shareAsync(uri);
}
```

### UI
Add a capture (screenshot) button in Sky Lens:
- Small circle icon in bottom-right (above layer bar)
- Tap: capture + brief flash animation
- Long press: capture + open edit/share screen

### Share screen
After capture, show:
```
┌─────────────────────────────────┐
│  [captured sky photo]           │
│                                 │
│  AuraLunis · Jun 25, 2026      │
│  Orion · Betelgeuse · Mars     │
│                                 │
│  [Share]  [Save to Vault]       │
└─────────────────────────────────┘
```

Watermark: small "AuraLunis" text in corner (toggleable).
Objects visible in the capture are auto-listed.

### Why this matters
Every shared photo is a free ad for AuraLunis.
The watermark drives downloads.
Birth Sky + Photo Overlay = shareable personal content.

---

## BUILD ORDER

1. Pinch to Zoom (smallest change, biggest exploration impact)
2. Time Scrub (every competitor has it — table stakes)
3. Stargazing Index (home screen engagement)
4. Photo Overlay (viral growth engine)
5. Celestial Event Calendar (daily engagement + notifications)

## BRANCH
All work on feature/killer-features. PR to main.
