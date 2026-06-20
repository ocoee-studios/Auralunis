# Chronaura Watch Face — Design Specification

**Reference:** `docs/Chronaura_Watch_Face_Target.png`
**Platform:** watchOS (Apple Watch Ultra shown in reference)
**Design language:** Liquid Glass + Midnight Gold

## Layout

### Top Bar
- Date: `THU 29 MAY` (left)
- Chronaura logo icon (center, small)
- Time: `10:09 PM` (right)

### Brand
- "CHRONAURA" in display serif (Cinzel)
- "THE INTERACTIVE ASTRAL CLOCK" subtitle

### Central Astrolabe
- Three concentric gold rings (compass dial)
- Compass points: N / E / S / W on the outer ring
- Large gold crescent moon in the center
- Compass needle (gold, vertical)
- Celestial body markers (gold spheres) on the rings
- Moon phase icon on the inner ring
- Star burst at the center point
- Star field background behind the rings

### Complications (surrounding the astrolabe)
- **SOLAR TIME** (top left): `10:09 PM`
- **CELESTIAL BODY** (top right): `MOON`
- **LUNAR PHASE** (left): Moon icon + `61% WAXING GIBBOUS`
- **DISTANCE** (right): `384,400 KM`
- **NEXT EVENT** (bottom right): `GOLDEN HOUR IN 2H 43M`

### Time Scrub (bottom)
- `−` button (left): `-12H`
- Current time scrub position: `10:09 PM`
- `+` button (right): `+12H`
- Digital Crown rotates the astrolabe through time

## Color Palette
- Background: `#05070D` deep space navy
- Primary gold: `#D9A84E`
- Accent gold: `#C7A66A`
- Light gold: `#F6DC91`
- Silver/moon: `#C0C6D4`
- Label text: `#A8AFBF`
- Faint text: `#747D90`

## Typography
- Brand: Cinzel (or similar display serif), letter-spacing 4px
- Complications: System SF, all caps, 9px
- Values: System SF, 16-20px
- Time: System SF, 36px bold

## Liquid Glass Treatment
- Concentric rings use `UIGlassEffect` material on watchOS 11+
- Glass refraction on the compass dial
- Subtle depth shadow under the astrolabe
- Star dust particles drifting behind the glass rings

## Data Sources (all computed on-device)
- Solar time: from ephemeris sun position
- Celestial body: brightest body above horizon
- Lunar phase: from ephemeris moon illumination
- Distance: computed from ephemeris (Moon = ~384,400 km)
- Next event: sunset, moonrise, or golden hour countdown
- Time scrub: ±12h offset, Digital Crown controlled

## Implementation Notes
- Swift scaffold: `native-handoff/watchos/TapticAstrolabeCrownView.swift`
- Watch ↔ Phone sync: WatchConnectivity (moon phase, tonight score, next event)
- Requires watchOS app target in Xcode (post-v1)
- Taptic feedback on Crown rotation (light taps at each hour mark)
