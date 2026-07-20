# Paywall Strategy — Fall in love free, go deeper with Premium

## The Rule
You're not paying to unlock the sky.
You're paying to see it in a way you've never seen before.

---

## FREE = Fall in love with the sky

The best free astronomy app. Period.

- ⭐ All stars (full catalog, spectral colors)
- 🌌 Milky Way (standard quality band)
- ✨ All constellations (34 with gold lines)
- 🪐 All planets (basic rendering)
- 🌙 Moon (basic phase display)
- 🔭 Basic Sky Lens planetarium (fully rendered, sensor-aligned — no camera/AR)
- ♈ Zodiac layer
- 🌠 Basic meteor showers
- 📚 Learn tab (all free)
- 🏠 Home screen with Tonight Score
- 🛰️ ISS + basic satellite tracking

## PREMIUM = See it like never before

Everything in Free, PLUS the sky becomes cinematic.

### ✨ Cinematic Deep Sky ($wow factor)
- Ultra HD nebula rendering (shaped clouds, not dots)
- Animated dust and gas shimmer
- Hero object effects (Orion glows, Sagittarius blazes)
- Deep sky catalog (38+ objects with descriptions)

### 🪐 Photorealistic Planets
- Jupiter cloud bands + Great Red Spot
- Saturn ring system with Cassini division
- Mars surface markings + polar cap
- Venus cloud glow
- Moon with craters, earthshine, god rays

### 🌌 Sky Lens Pro
- Night Vision mode (deep red)
- Immersive Sky mode (85% darken — screenshot mode)
- Time Scrub (fast-forward/rewind the sky)
- Pinch to Zoom with progressive reveal
- Cinematic mode (no UI, just beauty)

### ☁️ Astro Weather Pro
- Hour-by-hour forecast
- Cloud, seeing, transparency
- GO / MAYBE / STAY IN verdict
- Best window tonight

### 🌙 Personal Universe
- Birth Sky (personal star chart)
- Observation history in encrypted Vault
- Sky Share branded cards
- Photo Overlay capture

### 📅 Planning Tools
- Astrophotography Planner
- Eclipse + meteor shower calendar
- Push notifications for events
- Dark sky site finder

### 🛰️ Advanced Satellites
- Starlink train tracking
- Space debris monitoring
- Re-entry alerts
- Orbital ghost trails

---

## The Conversion Moment (GENIUS UX)

When a free user taps a premium nebula or feature:

DO NOT show: 🔒 Premium Required

INSTEAD:
1. Animate the nebula for 2 seconds — show the glowing 
   hydrogen clouds, dust structure, color
2. Then gently fade it to 50% opacity
3. Show: "✦ Unlock the living universe"
4. Tap → PaywallScreen

The user EXPERIENCES the value before being asked to pay.
Much more compelling than a lock icon.

Same for planets — show the Jupiter bands for 2 seconds,
then fade back to the basic dot. "See planets like never before."

Same for Night Vision — flash the red sky for 1 second,
then revert. "Protect your dark adaptation with Premium."

---

## What to MOVE from Free to Premium

Currently free but should be premium (the "wow" features):
- [ ] Deep Sky layer (nebulae) — KEEP as premium ✅
- [ ] Night Vision mode — MOVE to premium
- [ ] Immersive Sky mode — MOVE to premium
- [ ] Photo capture/share — MOVE to premium
- [ ] Ecliptic overlay — KEEP as premium ✅

Currently premium but should be free (the basics):
- [ ] Satellites (basic ISS) — keep free
- [ ] All constellations — keep free ✅

## What NEVER gets locked
- Constellations (heart of the app)
- Stars (the sky itself)
- Basic planets (dots with labels)
- The Moon (basic)
- Basic Sky Lens planetarium (rendered, sensor-aligned)
- Learn content (conversion funnel)
- Tonight Score

These are the reason people open the app. Lock them and 
they uninstall. Give them freely and they fall in love.

---

## Implementation

Update SkyLensLayerCatalog.ts:
- Night Vision: add premium gate
- Immersive mode: add premium gate  

Update captureSky:
- Check isPremium before capture
- Free users get the 2-second preview, then paywall

Update NebulaLayer:
- Free users see nebulae briefly animate on tap (2s)
- Then fade + "Unlock the living universe"
- Premium users see full persistent rendering

Update PlanetLayer:
- Free users see basic colored dots
- Premium users see Jupiter bands, Saturn rings, etc.
- On tap, free users get 2-second preview of the texture
