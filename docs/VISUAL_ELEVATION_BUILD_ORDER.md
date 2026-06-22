# Sky Lens Visual Elevation — Build Order for Claude Code

## THE VISION

> Make Sky Lens feel like standing beneath a living celestial cathedral
> built from stars, gold light, and ancient astronomical instruments.

The wow factor comes from emotion and atmosphere, not object count.

## Source: Gemini's 7-phase plan + our existing specs
## Rule: EXTEND existing systems. Do NOT rewrite.

Every phase below references code and specs that ALREADY EXIST.
Read the referenced files FIRST, then build on top.

---

## Phase 1 — Celestial Dome Depth
**Spec:** `VISUAL_QUALITY_SPEC.md` → "Parallax Depth System"
**Status:** SPECCED, NOT BUILT

Add parallax multipliers to the existing layer stack:
```
Layer              Component                    Parallax
──────────────     ─────────────────────        ────────
Milky Way          MilkyWayCoreLayer.tsx         0.92×
Dome stars         DomeStarLayer.tsx              0.95×
Bright stars       StarLayer.tsx                  0.97×
Constellations     ConstellationLayer.tsx         1.00×
Nebulae            NebulaLayer.tsx                0.98×
Planets            PlanetLayer.tsx                1.00×
Grid               GridLayer.tsx                  1.02×
UI / labels        (info cards, layer bar)        1.05×
```

Implementation: In `SkyLensCanvas.tsx`, wrap each layer group in a
`<G transform={...}>` that offsets by `panDelta * (1 - multiplier)`.
The `panDelta` comes from the existing `useDevicePointing` hook —
compute frame-to-frame delta from the pointing azimuth/altitude.

Very subtle. If you notice it, it's too much. The brain should
perceive depth without consciously seeing movement differences.

---

## Phase 2 — Premium Star Rendering
**Spec:** `VISUAL_QUALITY_SPEC.md` → "Star Rendering"
**Status:** PARTIALLY BUILT

Already done:
- ✅ Magnitude sizing (magnitudeToRadius in SkyLensVisual.ts)
- ✅ Bright star glow rings (StarLayer.tsx, mag < 1.5)
- ✅ Diffraction spikes on showpiece stars (mag < 1.2)
- ✅ Star twinkle (TwinkleOverlay.tsx)
- ✅ Named star labels

Still needed:
- [ ] **Star spectral colors on ALL stars** (not just named ones)
      Use the starColor() function but apply it to dome stars too.
      DomeStarLayer currently uses domeColor() — verify it returns
      real spectral colors (blue for hot, gold for solar, red for cool).
      If it returns random warm tints, replace with proper temperature mapping.

- [ ] **Brighter bloom on Vega, Deneb, Altair, Arcturus** specifically
      These are the 4 brightest overhead in summer from Ducktown.
      They should have VISIBLE glow rings, not just subtle halos.
      Check STAR_FEATURES in SkyLensVisual.ts — add entries for
      any mag < 1 star that's missing a feature override.

---

## Phase 3 — Hero Moon
**Spec:** `VISUAL_QUALITY_SPEC.md` → "Moon Rendering"
**Spec:** `VISUAL_BUILD_PHASES.md` → "Phase 4 — Hero Moon"
**Status:** NOT BUILT (MoonLayer exists but is basic)

Current MoonLayer.tsx renders a basic circle with phase shadow.

Build on top of it:
- [ ] **Lunar surface texture** — Create or source a 256×256 moon PNG
      with maria (dark areas) visible. Place in `assets/sky/moon-texture.png`.
      Render as a clipped circular Image inside MoonLayer.
- [ ] **Phase shadow** — Soft terminator (gradient edge, not hard line).
      Compute from existing `sky.moonIlluminationPercent`.
- [ ] **Earthshine** — On crescents (< 30%), add 5% opacity illumination
      on the dark side. Very subtle but makes the moon feel REAL.
- [ ] **Atmospheric halo** — Soft gold-white bloom circle behind the moon.
      20px radius, 6% opacity. Slightly larger when humidity > 70%
      (data from WeatherService if available).
- [ ] **Size** — Moon should be the LARGEST object on screen (16px radius
      base, larger than any planet). It's the showpiece.

---

## Phase 4 — Milky Way Enhancement
**Spec:** `SKY_LENS_SPEC.md` → "Milky Way — Full Color Render"
**Status:** PARTIALLY BUILT (texture + procedural band exist)

Already done:
- ✅ Photographic core texture (milkyway-core.png with radial mask)
- ✅ Procedural gold band (MilkyWayLayer.tsx polyline strokes)
- ✅ Gold tint (warm amber, not blue)

Still needed:
- [ ] **Fix hard edges** — The texture boundary is still slightly visible
      in some orientations. Increase the radial mask fadeout:
      current Stop offset="0.45" opacity="0.85" → change to
      offset="0.35" opacity="0.7" so it fades earlier and more gradually.
- [ ] **Galactic core brightness boost** — The center 20° around
      Sagittarius (RA 17h45m, Dec -29°) should glow noticeably brighter
      than the band edges. Add a second, smaller radial gradient
      centered on the core with 10% extra opacity.
- [ ] **Dust lane contrast** — The existing texture has dust lanes but
      they're washed out at low opacity. Increase core texture opacity
      from 0.35 to 0.40 so the Great Rift becomes visible.

---

## Phase 5 — Luxury Motion
**Spec:** `VISUAL_QUALITY_SPEC.md` → "Animation Standards"
**Status:** PARTIALLY BUILT (some animations exist)

Already done:
- ✅ Star twinkle (sine wave opacity)
- ✅ Nebula breathing (sine wave opacity, phase-offset)
- ✅ Shooting stars (MeteorOverlay.tsx)

Still needed:
- [ ] **Label glide** — When a star/planet/constellation label appears
      (entering FOV), it should fade in AND slide 4px from its final
      position over 0.3s. Not pop in.
- [ ] **Info card float** — The bottom info card should use a spring
      animation (react-native-reanimated withSpring) to slide up.
      Currently it probably just appears.
- [ ] **Constellation selection breathe** — When a constellation is
      identified (user is pointing at it), its lines should pulse
      from 50% to 80% opacity over 0.5s and back. Slow, gentle.
- [ ] **Layer toggle** — When a layer is toggled on/off in the bar,
      all elements of that layer should fade in/out over 0.3s.
      Not instant appear/disappear.

---

## Phase 6 — Object Presence
**Spec:** `VISUAL_QUALITY_SPEC.md` → "Info Card Design"
**Status:** EXISTS but basic

The tap-to-reveal info card already works. Enhance it:
- [ ] **Poetic descriptions** — The nebula catalog already has rich
      descriptions ("The most famous silhouette in the sky"). Make sure
      these render in the info card, not just coordinates.
- [ ] **Object glow on select** — When an object is tapped, its glow
      should INCREASE (double the glow radius for 1 second, then
      settle at 1.5× normal). Visual feedback that says "you found me."
- [ ] **Frosted glass card** — The card background should use
      `backdrop-filter: blur` or the Expo BlurView if available.
      rgba(7, 18, 37, 0.85) + blur looks premium.
- [ ] **Discovery language** — For deep sky objects, lead with the
      emotional hook, not the data:
      "2.5 million light years away.
       The most distant object visible to the naked eye."
      THEN show az/alt/magnitude below that.

---

## Phase 7 — Rare Delight Events
**Spec:** `VISUAL_BUILD_PHASES.md` → "Phase 5 — Living Sky"
**Status:** PARTIALLY BUILT

Already done:
- ✅ Shooting stars (MeteorOverlay.tsx, 1-3 per hour)

Still needed:
- [ ] **Satellite flares** — When a tracked satellite's geometry
      creates a flare condition, briefly flash a star-like burst
      at the satellite's position (2 seconds, bright → fade).
      Can be simulated: random chance when a satellite is
      within 15° of the antisolar point.
- [ ] **Atmospheric shimmer** — Objects below 15° altitude should
      have a very subtle position jitter (±0.3px random per frame).
      Simulates atmospheric refraction. The horizon should feel
      less stable than the zenith — because it IS in real life.

---

## WHAT NOT TO BUILD

Do NOT build these (they're post-launch):
- ❌ Constellation art overlays (needs art assets — v1.1)
- ❌ Cultural sky stories (needs cultural consultation — v1.2)
- ❌ Parallax on the Home screen (Sky Lens only for now)
- ❌ Sound/audio (no audio files exist yet)
- ❌ Watch app (separate build cycle)
- ❌ HealthKit (after Watch)

---

## BUILD ORDER

```
1. Phase 3 — Hero Moon          (highest visual impact, self-contained)
2. Phase 1 — Parallax depth     (transforms the whole experience)
3. Phase 5 — Luxury motion      (polish everything that moves)
4. Phase 4 — Milky Way fixes    (edge feathering + core brightness)
5. Phase 2 — Star colors        (mostly done, small additions)
6. Phase 6 — Object presence    (info card polish)
7. Phase 7 — Rare events        (finishing touches)
```

## THE GOLDEN RULE

Every change must answer YES to:
"Does this make the sky feel more alive?"

If yes: build it.
If no: skip it.
