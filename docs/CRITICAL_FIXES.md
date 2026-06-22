# CRITICAL FIXES — Do these NOW on visual/polish-pass branch

## FIX 1: Below-Horizon Bleed (BLOCKS SHIP)

Pointing the phone at the floor (alt -60°) still shows Milky Way
bands, stars, and overlays rendering over the camera feed of the
ground. This is a ship-blocker — a premium app cannot render
celestial objects on your hardwood floor.

**ALL celestial overlays must clip at altitude 0°.**

When pointing below the horizon, the screen shows ONLY the camera
feed. No stars. No Milky Way. No nebulae. No lines. Nothing.

### Fix Options (pick one):

**Option A — Clip mask at horizon y-coordinate:**
In the parent SVG/View that wraps all celestial layers, add a
clip rectangle that masks everything below the projected horizon
line. The horizon y-coordinate comes from `project(anyAz, 0)`.

**Option B — Per-element altitude check:**
Every render function already has the altitude data. Add:
```typescript
if (altitude < -2) return null; // 2° buffer for refraction
```
to every star, constellation line endpoint, nebula, and MW segment.

**Option C — Layer opacity fade:**
For altitude -2° to -10°, fade all layer opacity to 0 linearly.
Below -10°, render nothing. This creates a natural horizon fade
instead of a hard cutoff.

**Option C is recommended** — it's the most premium-feeling.
Hard cutoffs look mechanical. A gradual fade looks like atmosphere.

Apply to: MilkyWayLayer, MilkyWayCoreLayer, StarLayer, DomeStarLayer,
ConstellationLayer, NebulaLayer, PlanetLayer, EclipticLayer, GridLayer,
ZodiacLayer, and all Gemini FX layers.

## FIX 2: Milky Way Diagonal Stripes (KILLS PREMIUM FEEL)

The MilkyWayLayer procedural polyline strokes create visible
diagonal band edges that look like screen artifacts. They've
survived multiple fix attempts. Nuclear option time.

### Fix: REMOVE MilkyWayLayer procedural strokes entirely.

Keep ONLY MilkyWayCoreLayer (the real photographic texture).

The texture in the Sagittarius region looks beautiful. The
procedural stripes on top of it make it ugly. Delete them.

Steps:
1. In MilkyWayLayer.tsx — remove or comment out ALL Polyline
   stroke renders (the gold halo + warm core strokes)
2. Keep only the component shell so imports don't break
3. In MilkyWayCoreLayer.tsx — increase the texture opacity
   from current to 0.45 to compensate for losing the band
4. Widen the radial mask so the texture covers more of the
   galactic plane (increase r from current to 60% of height)

If the band feel is still needed after removing strokes,
replace with a SINGLE very wide, very faint radial gradient
centered on the galactic plane — no polylines, no hard edges:
```tsx
<Rect
  x={0} y={galacticPlaneY - bandHeight/2}
  width={screenWidth} height={bandHeight}
  fill="url(#softMilkyWayGlow)"
  opacity={0.06}
/>
```

## TEST CHECKLIST

After both fixes, take screenshots at these 6 angles:
- [ ] Heading N, Alt 45° (should show Polaris area, stars, constellations)
- [ ] Heading E, Alt 30° (should show seasonal constellations)
- [ ] Heading S, Alt 20° (should show Milky Way area, NO stripe edges)
- [ ] Heading W, Alt 10° (should show setting objects, horizon fade)
- [ ] Heading any, Alt -30° (should show ONLY camera feed, NO celestial)
- [ ] Heading any, Alt 90° (zenith — should show overhead stars/constellations)

Every screenshot above horizon = full celestial content.
Every screenshot below horizon = clean camera feed only.
No diagonal stripes anywhere.

## FIX 3: Wire the Gemini FX Layers (STARDUST + BREATHING + BLOOM)

Three visual FX layers exist in the repo but are NOT mounted
in SkyLensScreen.tsx. They need to be wired in.

Files already exist at src/features/sky-lens/layers/:
- LuxuryStarfieldFXLayer.tsx  (cosmic gold dust particles)
- AstralBreathingLayer.tsx    (whole-sky breathing pulse)
- PremiumSkyBloomLayer.tsx    (bloom + horizon glow + moon halo)

### Wiring Instructions:

In SkyLensScreen.tsx, import all three:
```tsx
import { PremiumSkyBloomLayer } from "./layers/PremiumSkyBloomLayer";
import { AstralBreathingLayer } from "./layers/AstralBreathingLayer";
import { LuxuryStarfieldFXLayer } from "./layers/LuxuryStarfieldFXLayer";
```

Mount them ABOVE the camera view but BELOW the SVG star/constellation
layers. Order matters:

```tsx
{/* Camera feed */}
<CameraView ... />

{/* Visual atmosphere layers (Gemini FX) */}
<PremiumSkyBloomLayer
  width={layout.width}
  height={layout.height}
  nightVision={nightVision}
  moonVisible={sky.moonAltitude > 0}
  milkyWayVisible={layers.milkyWay}
  intensity={nightVision ? 0.35 : 0.8}
/>
<AstralBreathingLayer
  width={layout.width}
  height={layout.height}
  nightVision={nightVision}
  intensity={nightVision ? 0.3 : 0.6}
/>
<LuxuryStarfieldFXLayer
  width={layout.width}
  height={layout.height}
  nightVision={nightVision}
  intensity={nightVision ? 0.25 : 0.9}
  count={110}
/>

{/* Existing SVG layers (stars, constellations, etc.) */}
```

### What each adds:

**PremiumSkyBloomLayer** — Deep space violet/gold bloom wash,
  horizon glow (gold-to-violet at bottom), moon atmospheric halo,
  Milky Way silk band. 14-second breathing cycle. Prevents the
  sky from ever looking flat black.

**AstralBreathingLayer** — Subtle 22-second opacity pulse across
  the entire sky. The whole view inhales and exhales together.
  Users won't consciously notice it but they'll feel the sky
  is alive.

**LuxuryStarfieldFXLayer** — 110 tiny gold/starlight dust
  particles floating across the screen. 9-second shimmer cycle
  with 2px vertical drift. Plus 2 luxury optic glints with
  tiny diffraction crosses. This is the STARDUST.

### ⚠️ PERFORMANCE WARNING
Wire them ONE AT A TIME. Test on device after each.
If ANY causes frame drops below 30fps, reduce its intensity
or count prop. If it crashes, skip it.

Priority order if performance is tight:
1. LuxuryStarfieldFXLayer (stardust — most visible impact)
2. PremiumSkyBloomLayer (atmosphere — most premium feel)
3. AstralBreathingLayer (breathing — most subtle, skip if needed)
