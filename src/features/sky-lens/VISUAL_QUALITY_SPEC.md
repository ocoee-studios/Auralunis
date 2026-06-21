# AuraLunis Visual Quality Spec — "Better Than the Competition"

## Design Philosophy
Every frame of AuraLunis Sky Lens should look like a professional
astrophotography edit, not a tech demo. When someone screenshots the
AR view, it should be beautiful enough to post without a filter.

SkyView looks like a tool. AuraLunis should look like art.

---

## Star Rendering (not dots — living light)

### Current Competition
SkyView: Static white dots, uniform brightness. Boring.

### AuraLunis Standard
Stars must feel ALIVE:

#### Twinkle Animation
- Each star has a subtle brightness oscillation (±15% opacity)
- Oscillation period varies per star (1.5s to 4s, randomized)
- Brighter stars twinkle more visibly
- Animation uses sine wave, not random flicker (smooth, not glitchy)

```typescript
const twinkle = baseOpacity + (Math.sin(time * star.twinkleSpeed + star.phase) * 0.15);
```

#### Star Color
Real stars have color. Use spectral class:
| Class | Color | Example |
|-------|-------|---------|
| O/B | Pale blue (#B8D4FF) | Rigel, Spica |
| A | White (#FFF6D6) | Sirius, Vega |
| F | Warm white (#FFF0C8) | Canopus, Procyon |
| G | Gold (#FFE4A0) | Sun, Alpha Centauri |
| K | Orange (#FFB870) | Arcturus, Aldebaran |
| M | Deep red (#FF8866) | Betelgeuse, Antares |

In AuraLunis gold mode: all stars lean warm (shift blue stars toward white).

#### Star Glow
- Magnitude < 1: Outer glow ring (8px, 10% opacity, star color)
- Magnitude < 0: Double glow (inner tight + outer soft bloom)
- Sirius/Vega/Arcturus: Visible cross-spike pattern (4-point star shape)

#### Size by Magnitude
| Magnitude | Radius | Visual |
|-----------|--------|--------|
| -1 to 0 | 5px | Brilliant, glow + spikes |
| 0 to 1 | 3.5px | Bright, glow |
| 1 to 2 | 2.5px | Clear, no glow |
| 2 to 3 | 1.8px | Visible |
| 3 to 4 | 1.2px | Dim |
| 4 to 5 | 0.8px | Faint |
| 5 to 6 | 0.5px | Barely visible |

---

## Constellation Lines (gold silk, not hard lines)

### Current Competition
SkyView: Thick blue lines, computer-drawn look. Functional but ugly.

### AuraLunis Standard
Lines should look like threads of gold light stretched between stars.

#### Line Style
- Width: 0.8px (thinner than SkyView's heavy lines)
- Color: Astral Gold (#D9A84E) at 50% opacity
- Glow: Soft 2px bloom along the line (gold at 8% opacity)
- NOT straight hard lines — slight softness from the glow

#### Pulse on Identify
When user aims at a constellation:
- Lines fade up from 50% to 80% opacity over 0.3s
- Soft gold pulse travels along each line (0.5s, like electricity)
- Constellation name fades in with subtle scale animation (0.95 → 1.0)

---

## Planet Rendering (orbs, not circles)

### Current Competition
SkyView: Colored dots. That's it.

### AuraLunis Standard
Planets should look like tiny celestial bodies, not UI circles.

#### Venus
- Bright white-gold orb (#FFF6D6)
- Subtle crescent phase shadow (match real phase from ephemeris)
- Brilliant glow bloom (brightest object after Moon)
- Size: 8px

#### Mars
- Warm coral-red (#F0997B)
- Subtle surface texture hint (darker spot for Syrtis Major, barely visible)
- Soft red glow
- Size: 6px

#### Jupiter
- Amber/cream (#EF9F27)
- Horizontal band hint (two subtle darker stripes at 30% opacity)
- Strong glow (second brightest)
- Size: 8px
- Bonus: 4 Galilean moons as tiny dots in a line (2px each, at real positions)

#### Saturn
- Gold (#D9A84E)
- Ring hint: thin elliptical line through the planet (1px, 40% opacity)
- Medium glow
- Size: 6px (plus rings extending to 12px)

#### Mercury
- Silver (#C0C6D4)
- Subtle phase shadow
- Dim glow
- Size: 4px

#### All Planets
- Outer glow ring (color-matched, 12% opacity)
- Inner bright core (smaller circle, brighter)
- NOT flat filled circles — radial gradient from bright center to soft edge

```typescript
// Planet rendering: radial gradient, not flat fill
ctx.createRadialGradient(x, y, 0, x, y, radius)
  .addColorStop(0, planetColor + 'FF')    // bright core
  .addColorStop(0.5, planetColor + 'AA')  // mid fade
  .addColorStop(1, planetColor + '00')    // soft edge
```

---

## Moon Rendering (not a circle — a world)

### Current Competition
SkyView: Circle with phase shadow. Basic.

### AuraLunis Standard
The Moon should be the most detailed object on screen.

#### Phase Rendering
- Accurate phase shadow computed from real illumination %
- Shadow edge is soft (not hard line) — realistic terminator
- Lit portion: warm silver-white (#E8E4D8)
- Shadow portion: very dark (#0A0A12) but NOT pure black

#### Surface Detail
- Pre-rendered Moon texture (256×256 PNG) with maria (dark areas) visible
- Rotate texture to match real libration angle
- At default zoom: maria are subtle dark patches
- Pinch zoom: reveals more surface detail

#### Earthshine
- During crescent phases (< 30%): faint illumination of the dark side
- Very subtle (5% opacity) — but it's a detail SkyView doesn't have
- Makes the Moon look real

#### Size
- Moon should appear larger than planets (realistic angular size)
- Default: 16px radius
- Outer glow: soft white bloom (20px, 6% opacity)

---

## Milky Way (covered in separate spec — gold-tinted panorama)

---

## Constellation Art (covered in separate spec — multi-cultural SVG)

Style additions for visual quality:
- Art renders with a soft inner glow (as if the lines are emitting light)
- Slight parallax: art layer moves 2-3% slower than stars when panning
  (creates depth, makes it feel 3D)
- Fade-in animation when entering a constellation region (0.5s)
- Fade-out when leaving (0.3s, faster to keep it responsive)

---

## Satellite Rendering (streaking light, not dots)

### ISS
- Bright gold dot (matches brand)
- Trail: fading line behind it showing the last 30 seconds of path
- Trail: gradient from bright gold to transparent over its length
- Prediction line: dashed gold line showing the next 60 seconds of path
- When overhead (< 30° from zenith): pulsing glow, feels close

### Starlink Train
- String of 4-6 tiny dots in a line
- Each dot slightly dimmer than the one in front
- Entire train moves together with slight spacing
- Pale blue (#78C8FF) to distinguish from single satellites
- Trail connects the dots as a faint line

### Other Satellites
- Silver dot (#C0C6D4), smaller than ISS
- Short trail (10 seconds)
- Name label only on tap

---

## Grid & Compass (subtle, not overpowering)

### Altitude Circles
- 0° (horizon): solid gold, 1px, 25% opacity
- 30°, 60°: dashed gold, 0.5px, 10% opacity
- Zenith dot at 90°: small gold crosshair

### Azimuth Lines
- Every 30°: dashed, 0.5px, 8% opacity
- So subtle they almost disappear — grid should NEVER compete with stars

### Cardinal Labels
- N: Gold, bold, 12px — always prominent
- E, S, W: Silver, 10px, 40% opacity
- NE, SE, SW, NW: Silver, 8px, 25% opacity (only visible when grid layer on)

### Horizon Line
- Gold, 1px, 25% opacity
- Below horizon: everything dims to 15% opacity (simulates below-ground fade)
- Terrain silhouette (future): trace the actual horizon from camera feed

---

## Info Card Design (glass, not solid)

When tapping an object, the card should feel like it belongs in the sky:
- Background: frosted glass effect (rgba(7,18,37,0.85) + backdrop-blur)
- Border: 0.5px gold at 20% opacity
- Corner radius: 16px
- Slide-up animation: 0.3s ease-out spring
- Object icon with glow at top-left
- Dismiss: swipe down or tap X

---

## Night Vision Mode (deep red, not just tinted)

This must be ACTUALLY useful for dark-adapted eyes:
- No white pixels anywhere — every single element goes red
- Camera overlay: rgba(10, 0, 0, 0.3) dark filter
- Stars: #8B2020 instead of white (faintest stars barely visible)
- Constellation lines: #6B1818
- Planet markers: darker variants of their colors, all red-shifted
- Labels: #A83030
- Grid: #4A1010
- Info cards: rgba(10, 0, 0, 0.9) background
- Screen brightness: suggest user lower it (show prompt on first enable)

---

## Animation Standards

Every state change should be animated. Nothing pops in/out:
| Action | Animation | Duration |
|--------|-----------|----------|
| Star enters FOV | Fade in | 0.3s |
| Star exits FOV | Fade out | 0.2s |
| Constellation identified | Lines pulse, name scales in | 0.5s |
| Planet enters FOV | Scale up from 0 + fade | 0.4s |
| Layer toggled on | All elements of that layer fade in | 0.3s |
| Layer toggled off | All elements fade out | 0.2s |
| Info card appears | Slide up + fade | 0.3s spring |
| Info card dismisses | Slide down + fade | 0.2s |
| Night mode toggle | Color cross-fade | 0.5s |
| Satellite moving | Smooth 30fps position interpolation | continuous |
| Magnitude slider | Stars smoothly fade in/out per threshold | continuous |
| Time scrub | All objects smoothly drift to new positions | continuous |

---

## Performance Budget

All of the above must run at 30fps minimum on iPhone 12+:
- Star twinkle: computed per frame (simple sine, negligible)
- Glow effects: pre-rendered as sprite atlas, not computed per frame
- Milky Way: single texture blit, GPU accelerated
- Constellation art: pre-loaded SVG, transform only per frame
- Satellite interpolation: 1 TLE compute per second, lerp between

If frame drops detected: automatically reduce star count by magnitude
threshold until 30fps is maintained.

---

## The Goal

When someone opens AuraLunis Sky Lens for the first time and points
their phone at the sky, the reaction should be:

"Holy shit."

That's the bar. If it doesn't hit that, it's not done.

---

## Enhanced Planet Detail — Rings & Moons

### Saturn (the star of the show)
Saturn's rings should be THE visual flex of Sky Lens. When someone
points at Saturn and the rings render, that's the screenshot moment.

- Ring system: 3 concentric ellipses (A ring, B ring, C ring)
- A ring (outer): gold (#D9A84E) at 35% opacity, 1px
- B ring (middle, brightest): gold at 50% opacity, 1.5px
- C ring (inner, faintest): gold at 15% opacity, 0.5px
- Cassini Division: 1px gap between A and B rings (visible as dark line)
- Ring tilt: computed from real obliquity + Earth viewing angle
- Ring shadow: faint dark band across planet disk from ring shadow
- Total visual width: ~20px across (planet is 6px, rings extend to 10px each side)
- When identified: ring labels fade in ("A Ring · B Ring · Cassini Division")

### Jupiter (bands + moons = mini solar system)
- Horizontal cloud bands: 3 alternating stripes across the disk
  - Light zones: amber (#EF9F27) at full opacity
  - Dark belts: darker amber (#BA7517) at 80% opacity
- Great Red Spot: tiny dot at correct latitude (23°S), deep coral (#D85A30)
  - Only visible when zoom level > 2× (Easter egg for explorers)
- 4 Galilean moons rendered as real dots at REAL computed positions:
  - Io: 2px, warm orange
  - Europa: 1.5px, white
  - Ganymede: 2.5px (largest moon in solar system!), silver
  - Callisto: 2px, dim gray
  - Positions computed from orbital period (Io: 1.77d, Europa: 3.55d, 
    Ganymede: 7.15d, Callisto: 16.69d)
  - They actually MOVE over the course of an evening — show it!
  - Label on tap: "Io · Europa · Ganymede · Callisto"
- Jupiter's faint ring: 0.3px line at 8% opacity (Easter egg — barely visible,
  but it's REAL and we show it because we're accurate)

### Mars Detail
- Polar ice caps: tiny white dot at north pole (0.5px, 40% opacity)
- Dark feature hint: Syrtis Major as a slightly darker patch
- Phobos & Deimos: NOT shown (too small/dim for naked eye, would be dishonest)

### Venus Detail
- Phase shadow: accurately computed crescent/gibbous from elongation
- Cloud shimmer: very subtle brightness oscillation (Venus has thick clouds
  that actually cause slight brightness variations)
- At maximum brightness (mag -4.6): intense bloom, dominates the view

### Planet Info Cards (tap to reveal)
When tapping any planet, the info card shows:
```
┌──────────────────────────────────┐
│  ● Jupiter                       │
│  King of the planets             │
│──────────────────────────────────│
│  Magnitude   -2.1                │
│  Distance    4.2 AU              │
│  Azimuth     251°                │
│  Altitude    -0.7° (below hz)    │
│  Rise time   4:12 AM             │
│──────────────────────────────────│
│  Moons visible: 4                │
│  ○ Io  ○ Europa  ○ Ganymede      │
│  ○ Callisto                      │
│                                  │
│  Bands + Great Red Spot visible  │
│  at 2× zoom                      │
│                                  │
│  [Save to Vault] [Share Card]    │
└──────────────────────────────────┘
```
