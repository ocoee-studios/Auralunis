# Critical Visual Fixes — June 22

## FIX 1: Milky Way band looks gray, not golden

The procedural Milky Way band (MilkyWayLayer.tsx) renders as a
flat gray stripe, especially against a bright camera feed.

Root causes:
- Glow gradient colors are too desaturated (#E8C77E → #C99A52)
- The radial gradient opacity is still too low even after boost
- No star cloud texture — just flat gradient circles
- Against a bright camera, gold at 11% opacity looks gray

Changes needed in MilkyWayLayer.tsx:
a) Shift glow colors warmer and more saturated:
   #E8C77E → #F0C060 (richer gold)
   #C99A52 → #D9A84E (match brand gold exactly)

b) Increase glow opacity another 30%:
   Current o(0.11) → o(0.15)
   Current o(0.05) → o(0.07)

c) The star cloud (Layer 2) needs MORE stars along the band.
   Check milkyWayStars.ts — if it has < 100 stars, generate
   more. The band should sparkle with concentrated starlight,
   not just glow.

d) Core bloom opacity:
   Current o(0.28) → o(0.35)

## FIX 2: MW photo texture still limited to Sagittarius region

The gc.behind check was removed but the texture may still only
show when the galactic center is within ~75° of the camera
pointing direction (due to radial mask radius).

The texture should be visible even when pointing at Cygnus,
Cassiopeia, or Orion — all on the Milky Way band but far from
the galactic center.

Options:
a) Add a second texture crop for the Cygnus/Cassiopeia region
b) Increase the radial mask radius so the texture extends further
c) Generate a wider panoramic texture covering the full band

## FIX 3: Strip the horizon bleed

In screenshot 1, celestial overlays (stars, nebula glows, grid
lines) render below the horizon onto the floor/ground. Everything
below altitude 0° should fade to 0 between alt -2° and alt -10°.
Nothing celestial should render on the floor at alt -60°.

## PRIORITY: Test at night or in Planetarium Mode first.
The app is designed for dark skies. Daytime testing with a bright
camera makes everything look washed out.
