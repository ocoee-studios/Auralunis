# Milky Way — The Visual Masterpiece Pass

## The Vision

Build the Milky Way as a physically inspired, layered galactic plane that
wraps from horizon to horizon in real celestial coordinates. Use multiple
high-resolution layers for dust lanes, star clouds, hydrogen emission,
reflection nebulae, and dense stellar fields. Make the galactic core
dramatically brighter and richer in Sagittarius with warm golds, pinks,
violets, and blues. Nebulae should integrate naturally into the Milky Way
instead of floating independently. The result should feel like looking
through an exceptionally dark Bortle 1 sky — but artistically enhanced —
creating an awe-inspiring, premium experience unique to AuraLunis.

## Current State

- Photographic core texture at Sagittarius (milkyway-core.png removed in release cleanup — the MilkyWayCoreLayer that used it was dead code)
- Procedural gold band wrapping full galactic plane ✅
- 332 dust blobs (Great Rift, fractures, knots, scattered) ✅
- 38 deep sky objects rendered as independent glows ✅
- Star cloud layer (~50 bright MW stars) ✅

## What's Missing

### 1. Multi-layer galactic plane
Current: single radial glow circles along the plane.
Target: 5+ transparent layers stacked for depth:
- Layer A: Warm diffuse glow (gold, widest, lowest opacity)
- Layer B: Dense star cloud (brighter, narrower band)
- Layer C: Hydrogen emission regions (pink/magenta patches)
- Layer D: Reflection nebulae (blue patches near bright stars)
- Layer E: Dark dust (Great Rift, coal sack, fine mottling)

### 2. Galactic core drama
The Sagittarius core should be the brightest, richest region:
- 3× intensity of the band edges
- Warm gold center fading to pink/violet edges
- Dense star cloud (more star dots concentrated here)
- Multiple emission nebulae blending into the glow
- Dark dust lanes carving through dramatically

### 3. Nebulae integrated into the band
Orion Nebula, Lagoon, Eagle, etc. should feel like PART of
the Milky Way — brighter regions within the band fabric —
not floating colored circles on top of it.

### 4. Organic structure
Less smooth gradients. More:
- Mottled texture (varying opacity across the band width)
- Branching dust lanes (not just the Great Rift)
- Clumpy star concentrations
- Ragged band edges (not clean geometric boundaries)

### 5. Full wrap quality
The band from Sagittarius → Aquila → Cygnus → Cassiopeia → 
Perseus → Orion should all feel like the same river of stars,
varying in brightness and width but never disappearing.

## Color Palette (AuraLunis signature)

| Element | Color Range |
|---------|-------------|
| Diffuse glow | Warm gold #D9A84E → #C89A52 |
| Star clouds | Pale gold #F2E6C8 → white #FFF6D6 |
| H-alpha emission | Rose pink #E06888 → magenta #D870A0 |
| Reflection | Ice blue #8AB4FF → violet #7B5CF6 |
| Dust lanes | Near-black #01030A → dark navy #030816 |
| Galactic core | Bright gold #FFE9B0 → amber #E8C77E |

NOT blue. AuraLunis owns gold. The MW should be warm 
and golden, with pink emission and blue reflection as 
accents, not the dominant color.

## Technical Approach

All rendering in the existing MilkyWayLayer.tsx system.
Use the existing `band.center` points (91 points along the
galactic plane) as the coordinate backbone.

For each layer, render SVG shapes (RadialGradients, Ellipses,
Paths) positioned along the galactic plane using the same
`project()` function as everything else.

The photo texture (MilkyWayCoreLayer) stays for the Sagittarius
hero region. The procedural layers wrap the full sky.

## Performance Budget

The current MilkyWayLayer renders ~30 glow circles + ~50 stars
+ ~332 dust blobs = ~412 SVG elements. Budget: 600 max.
Use fewer, larger shapes rather than many small ones.

## The Test

Pan slowly from Sagittarius through Cygnus to Orion.
At every point, the Milky Way should:
- Be clearly visible as a warm band
- Have visible dark structure (not smooth)
- Integrate with nearby nebulae
- Feel like a galaxy, not a gradient

---

## REFERENCE IMAGE: Bortle 1 Milky Way astrophoto (reference image removed from repo in release cleanup — was unreferenced)

This Bortle 1 astrophoto is the EXACT target for AuraLunis MW rendering.

Study it. Match these specific qualities:

### 1. WARM GOLDEN-PINK CORE
The Sagittarius galactic center is NOT white. It's warm:
- Inner core: golden amber (#E8C77E → #FFE0A0)
- Mid-region: rose pink (#D08878) blending into the gold
- Outer edges: lavender/violet (#9080B0) transitioning to blue sky
Our current core is too pale/white. WARM IT UP.

### 2. DARK DUST LANES — THE GREAT RIFT
The most dramatic feature: a DARK river splitting the bright band.
- Near-black (#0A0810) — dramatically darker than surrounding glow
- Irregular edges (not smooth geometric curves)
- Branches and tributaries splitting off the main rift
- Gets wider toward Cygnus, narrower toward Sagittarius
Our current dust is too faint. DARKEN IT 2-3×.

### 3. MOTTLED TEXTURE
The band is NOT a smooth gradient. It's CLUMPY:
- Bright star cloud patches (like Scutum Star Cloud)
- Dark knots scattered throughout (mini coal sacks)
- Varying brightness across the band width
- NO uniform opacity — every point slightly different
Our current rendering is too smooth. ADD NOISE/VARIATION.

### 4. DENSE STAR CONCENTRATION
Thousands of individual stars concentrated IN the band:
- Dense star count inside the MW band (2-3× density of dark sky)
- Brighter, warmer-colored stars near the galactic center
- Sparser, cooler stars in the outer band
Our star cloud layer has ~50 stars. Need 200-300 IN the band.

### 5. RAGGED BAND EDGES
The MW band does NOT have clean geometric edges:
- Irregular boundary where bright band meets dark sky
- Star density gradually decreases (not a hard cutoff)
- Some bright patches extend beyond the main band
Our procedural glow has too-smooth circular edges.

### 6. DEEP NAVY SKY (not pure black)
The sky AWAY from the MW is deep navy (#0A1428), not black (#000).
This creates separation — the MW is warm, the sky is cool.
Our camera overlay provides this, but in planetarium mode
the background should be navy, not pure black.

### 7. COLOR HIERARCHY
From center outward:
  Bright gold → warm pink → cool lavender → deep blue sky
NOT: white → gray → black

The AuraLunis gold identity means we push the warm tones
even further than reality. Our MW should feel GOLDEN, not blue.
