# Sky Lens Visual Build Phases

## THE RULE

```
DO NOT REDESIGN SKY LENS.
ELEVATE IT.
```

The architecture is solid. The projection math works. The sensor pipeline works.
These phases add a VISUAL EFFECTS LAYER on top. Nothing gets rewritten.

---

## Phase 1 — Premium Night Sky
**Transforms:** black background → living sky

Add to existing Sky Lens:
- [ ] Star twinkle (sine-wave opacity oscillation per star)
- [ ] Star size by magnitude (5px for Sirius → 0.5px for mag 6)
- [ ] Star color by spectral class (blue Rigel, red Betelgeuse, gold Arcturus)
- [ ] Star glow rings on mag < 1 objects
- [ ] Atmospheric sky gradient (navy → indigo → violet → gold at horizon)
- [ ] Gradient shifts dynamically with sun altitude from ephemeris

**Reference:** `VISUAL_QUALITY_SPEC.md` → Star Rendering, Atmospheric Sky

**Done when:** Stars feel alive. Sky has color. Not flat dots on black.

---

## Phase 2 — Celestial Depth
**Transforms:** flat sky → 3D celestial dome

Add:
- [ ] Parallax depth system (8 layers, 0.92× to 1.08× multipliers)
- [ ] Milky Way panorama (gold-tinted, texture-projected)
- [ ] Nebula haze at real positions (Orion, Lagoon, North America at 3-5% opacity)
- [ ] Zodiacal light along ecliptic during twilight
- [ ] Horizon glow from light pollution (Bortle-aware)
- [ ] Deep-space dust clouds (subtle texture in Milky Way)

**Reference:** `VISUAL_QUALITY_SPEC.md` → Parallax Depth, Atmospheric Sky
**Reference:** `SKY_LENS_SPEC.md` → Milky Way Full Color Render

**Done when:** Moving the phone feels like looking through a window into space.

---

## Phase 3 — AuraLunis Signature
**Transforms:** astronomy app → luxury celestial instrument
**This is the App Store screenshot phase.**

Add:
- [ ] Gold constellation lines with soft glow bloom (0.8px + 2px glow)
- [ ] Constellation pulse animation on identification
- [ ] Constellation art: luxury watch engraving style (gold line art, NOT cartoons)
- [ ] Planet glow halos (radial gradient orbs, not flat circles)
- [ ] Saturn rings (3 concentric ellipses + Cassini Division)
- [ ] Jupiter bands + 4 Galilean moons at real positions
- [ ] Orbital trails on satellites (30s fading gradient)
- [ ] Radar sweep beam (4s rotation with afterglow)

**Reference:** `VISUAL_QUALITY_SPEC.md` → Constellation Lines, Planet Rendering, Saturn/Jupiter detail, Radar
**Reference:** `SKY_LENS_SPEC.md` → Constellation Art Overlays

**Done when:** Screenshots look like luxury Swiss watch × planetarium × Apple design.

---

## Phase 4 — Hero Moon
**The most beautiful object in the app.**

Add:
- [ ] Lunar surface texture (256×256 with visible maria)
- [ ] Real phase shadow with soft terminator
- [ ] Earthshine on crescents (faint illumination of dark side, 5% opacity)
- [ ] Atmospheric halo (soft white-gold bloom, 6% opacity, 20px radius)
- [ ] Humidity-responsive glow (larger halo when humidity > 70%)
- [ ] Libration-correct texture rotation
- [ ] Tap: detailed info card with rise/set, distance, next phase

**Reference:** `VISUAL_QUALITY_SPEC.md` → Moon Rendering

**Done when:** The Moon is so beautiful people screenshot it every night.

---

## Phase 5 — Living Sky
**Rare ambient events that make the sky feel alive.**

Add:
- [ ] Random shooting stars (1-3 per hour of viewing)
  - Fast diagonal streak, 0.3s duration
  - Bright white head → fading gold tail
  - Random position in upper sky hemisphere
  - More frequent during active meteor shower periods
  - Haptic: quick tap when one appears

- [ ] Satellite flares (Iridium-style brightness flashes)
  - Predicted from orbital data when geometry is right
  - Star-like dot suddenly brightens 10× over 2 seconds, then fades
  - Gold flash at peak
  - Info card: "Satellite flare · [name] · mag -6"
  - These are REAL predicted events, not random

- [ ] Aurora overlay (when Kp ≥ 4)
  - Shimmering green-purple curtain on northern horizon
  - Animated: gentle wave motion, brightness pulsing
  - Only appears when aurora is actually possible at observer latitude
  - Intensity scales with Kp index
  - Green dominant (#4ADE80) with purple tips (#7B5CF6)

- [ ] Active meteor shower radiant
  - During known shower periods (Perseids, Geminids, etc.)
  - Radiant point marked with pulsing gold circle
  - Predicted rate display: "Perseids · ~60/hr"
  - Shooting star frequency increases near the radiant
  - Count mode: tap to count observed meteors, logs to vault

- [ ] Rare conjunction alerts
  - When two planets are within 2° of each other
  - Gold bracket lines connecting the pair
  - "Jupiter-Saturn conjunction · 0.8° apart"
  - These happen rarely enough to feel special

**Done when:** The sky feels ALIVE. Unexpected things happen. People keep the app open
longer because something might streak across the screen at any moment.

---

## Build Order Summary

```
Phase 1 (stars + gradient)     → "this looks real"
Phase 2 (depth + Milky Way)    → "this feels real"
Phase 3 (gold + engravings)    → "this looks expensive"
Phase 4 (hero moon)            → "this is beautiful"
Phase 5 (living sky)           → "I can't stop watching"
```

## The Prediction

> If you finish Sky Lens + Hero Moon + Living Sky,
> AuraLunis becomes the kind of app people show their friends.

That's the difference between a useful astronomy app
and a memorable premium experience.
