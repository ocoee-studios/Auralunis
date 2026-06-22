# Next Fixes — Push to visual perfection

## FIX 1: Milky Way band stripe edges (CRITICAL)

The Milky Way has visible diagonal stripe edges where the texture
and procedural band layers end. These hard lines break the immersion.

In MilkyWayLayer.tsx:
- Change all strokeLinecap from "butt" to "round" (some may have reverted)
- Reduce strokeWidth on the band strokes by 20%
- Add strokeLinejoin="round" everywhere

In MilkyWayCoreLayer.tsx:
- Increase the radial mask fadeout — the texture boundary is visible
- Change the outermost gradient Stop to fade at offset="0.30" instead
  of current value, with stopOpacity dropping to 0 more gradually
- Add a second masking gradient rotated 90° so ALL edges feather,
  not just the radial direction

If the hard edges persist after gradient fixes:
- Apply a 30% transparent black border stroke around the entire
  texture image as a post-process (feathered rectangle mask)
- OR reduce the texture size slightly so it never reaches the
  edge of its container

TEST: Pan slowly across the Milky Way boundary in every direction.
There should be NO visible line where the texture stops.
It must melt seamlessly into the dark sky.

## FIX 2: Wire LunarGodRayLayer for Hero Moon

LunarGodRayLayer.tsx exists in the layers folder (Gemini wrote it).
It's not wired in.

In SkyLensScreen.tsx, when the Moon is above horizon:
1. Get the Moon's projected screen coordinates from the existing
   MoonLayer/PlanetLayer projection
2. Add LunarGodRayLayer BELOW the MoonLayer but ABOVE the starfield:

```tsx
import { LunarGodRayLayer } from "./layers/LunarGodRayLayer";

{sky.moonAltitude > 0 && moonScreenPos && (
  <LunarGodRayLayer
    width={layout.width}
    height={layout.height}
    moonX={moonScreenPos.x}
    moonY={moonScreenPos.y}
    moonRadius={18}
    visible={true}
    nightVision={nightVision}
    intensity={nightVision ? 0.3 : 0.8}
  />
)}
```

The Moon should have:
- 18 delicate gold/starlight rays radiating outward
- A massive soft halo (7× the moon's radius)
- Slow drift rotation (16-second cycle)
- Night vision: red rays

When someone points at the Moon, it should feel HOLY.

## FIX 3: Wire remaining Gemini FX layers

These exist in the layers folder but aren't mounted:

```tsx
// Mount order: above camera, below SVG constellation/star layers
<PremiumSkyBloomLayer
  width={layout.width}
  height={layout.height}
  nightVision={nightVision}
  moonVisible={sky.moonAltitude > 0}
  milkyWayVisible={layers.milkyWay}
  intensity={nightVision ? 0.35 : 1}
/>
<AstralBreathingLayer
  width={layout.width}
  height={layout.height}
  nightVision={nightVision}
  intensity={nightVision ? 0.3 : 0.7}
/>
<LuxuryStarfieldFXLayer
  width={layout.width}
  height={layout.height}
  nightVision={nightVision}
  intensity={nightVision ? 0.25 : 1}
  count={110}
/>
```

⚠️ TEST EACH ONE individually before mounting all three.
If any causes a crash or frame drops, skip it.
Performance > prettiness. The app must stay at 30fps.

## FIX 4: Constellation rendering bug

25+ constellations have line data in constellationLines.ts
but aren't rendering. Auriga (Capella), Perseus (Mirfak),
Canis Major (Sirius) all have data but show no lines.

Debug: log in ConstellationLayer how many constellations
have renderable segments vs total received. Find the
matching/filtering bug that's hiding valid constellations.

## PRIORITY ORDER
1. Milky Way edges (biggest visual flaw right now)
2. Constellation bug (lights up 25+ more patterns)
3. Hero Moon god rays (next wow moment)
4. Wire FX layers (atmosphere + breathing + dust)

## BRANCH RULE
All fixes go to: visual/polish-pass
PR to main. Test on device before merging.
Do NOT push directly to main.
