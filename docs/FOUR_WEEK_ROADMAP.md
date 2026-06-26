# Four-Week Roadmap — Ship a Masterpiece

## The only five things that matter.

No new screens. No new data. No new features.
Make the existing sky the most beautiful astronomy experience on iOS.

---

## Week 1: 🌌 The Most Beautiful Milky Way on Any Phone

Reference: assets/sky/milkyway-reference.webp

- Warm golden-pink core at Sagittarius (not white)
- Dark Great Rift dramatically splitting the band (2-3× darker)
- Mottled clumpy texture (not smooth gradients)
- 200-300 concentrated star dots IN the band
- Ragged irregular edges (not geometric circles)
- Color: gold → pink → lavender → deep blue sky
- Full wrap: Sagittarius → Cygnus → Cassiopeia → Orion
- Test: does it look like the reference photo? If no, keep going.

## Week 2: 🌕 The Most Beautiful Moon + 🪐 Planets

### Moon
- Photoreal lunar texture (256×256 PNG with maria detail)
- Real phase illumination (soft terminator gradient, not hard line)
- Earthshine on crescents (5% illumination on dark side)
- Atmospheric halo (LunarGodRayLayer — already built)
- Size: largest object on screen (20-24px radius)
- The Moon should make people say "wow" every time

### Planets
- Jupiter: visible cloud bands + Great Red Spot + Galilean moons
- Saturn: ring system with Cassini division + shadow
- Mars: red surface with dark markings + polar cap
- Venus: brilliant pearl glow with cloud hints
- Each planet instantly recognizable WITHOUT its label
- Replace SVG illustrations with NASA PNG textures if possible
- Minimum body sizes: Jupiter 20px, Saturn 16px+rings, Mars 12px

## Week 3: ☁️ Nebulae That Look Like Their Names

Reference: assets/sky/nebula-reference-trifid.jpg

The Big Five get custom dual-color SVG shapes:
| Nebula | Emission (warm) | Reflection (cool) | Signature shape |
|--------|----------------|-------------------|-----------------|
| Orion | Pink/magenta | Blue wings | Winged cloud + trapezium core |
| Lagoon | Gold-pink | Blue outer | Split by dark central lane |
| Trifid | Rose-pink | Blue upper half | Three dark lanes (Y shape) |
| Eagle | Amber-magenta | Blue haze | Columnar pillars silhouette |
| Carina | Hot pink-orange | Blue outer | Massive irregular cloud |

Each needs:
- Warm core shape + cool outer haze (two color zones)
- Dark dust lane paths cutting through
- 5-8 embedded bright star dots
- 15-25% overall opacity (translucent, not solid)
- Recognizable WITHOUT its label

Other 33 nebulae: keep as enhanced warm-toned radial glows.

## Week 4: ✨ Cinematic "Immersive Sky" Mode

A mode with NO UI — just the sky. For screenshots and wonder.

### Toggle
Triple-tap the screen or long-press the half-moon button:
- All labels fade out (0.5s animation)
- Layer bar slides down and hides
- HUD (heading/altitude) fades to 5% opacity
- "Pan to Moon" banner hides
- Camera darkened to 85%
- ONLY celestial objects remain: stars, constellations, MW,
  nebulae, planets, moon

### What stays visible
- Stars with full twinkle and bloom
- Constellation lines (faded to 30% — gold threads in the dark)
- Milky Way in full glory
- Nebulae glowing
- Planets with textures
- Moon with god rays
- Shooting stars (rare)

### What hides
- ALL text labels
- Layer bar
- Heading HUD
- Navigation hints
- Close button (but single tap brings UI back)

### Why this matters
This is the mode people use for:
- App Store screenshots
- Instagram stories
- Showing friends
- Personal awe

Every App Store screenshot should be taken in this mode.

---

## What NOT to build during these 4 weeks

- ❌ Time Scrub (Week 5+)
- ❌ Pinch to Zoom (Week 5+)
- ❌ Photo Overlay (Week 5+)
- ❌ Event Calendar (Week 5+)
- ❌ Stargazing Index (Week 5+)
- ❌ Watch app (post-launch)
- ❌ New screens (post-launch)
- ❌ PaywallScreen (build last, one day before TestFlight)

Visual perfection first. Features second. Ship a masterpiece.

---

## The Test

Take 10 screenshots — 2 from each direction (N, E, S, W, Up).
Show them to someone who's never seen the app.
If they say "holy shit" — ship it.
If they don't — you're not done.
