# Art Direction Pass — Make the sky breathtaking without labels

## The Rule
Do not add new features. Make the sky less transparent, less flat, 
and less symbolic.

## Goal
When UI labels are hidden, the sky should still look breathtaking.
The missing wow factor is not more data — it's recognizable celestial 
shapes: real-looking Milky Way texture, identifiable nebula forms, and 
planet bodies that read instantly.

---

## 1. Milky Way — cinematic, not symbolic

- Increase visible star-cloud texture (more bright dots concentrated in the band)
- Make dust lanes DARKER and more IRREGULAR (not smooth dark circles)
- Sagittarius core: 2× more dramatic than current (golden center, rose edges)
- Cygnus section: visibly connected to Sagittarius, not faint
- Orion section: visible warm glow (winter Milky Way is fainter but present)
- The entire band should read as "billions of stars" not "a gradient stripe"

## 2. Nebulae — recognizable silhouettes, not soft circles

Each major nebula needs a SHAPE, not just a radial glow:

| Nebula | Shape | Colors |
|--------|-------|--------|
| Orion Nebula | Winged cloud with bright core trapezium | Magenta + blue edges |
| Rosette | Circular bloom with dark center hole | Rose pink |
| Veil | Filament ribbons / arcs | Blue-teal |
| Dumbbell | Hourglass / butterfly shape | Teal |
| Lagoon | Irregular warm cloud with dark lane | Gold-pink |
| Trifid | Three-lobed cloud (tri-fid = three splits) | Pink + blue reflection |
| Eagle | Columnar cloud (Pillars of Creation feel) | Amber-magenta |
| Swan (Omega) | Curved checkmark / swan neck shape | Pink-gold |
| North America | Continental outline shape (really!) | Red emission |
| Carina | Massive irregular cloud | Hot pink + orange |
| Andromeda | Large tilted elliptical glow | Silver-gold |

Build these as custom SVG Path shapes in NebulaLayer, not 
generic RadialGradient circles. Each should be recognizable 
WITHOUT its label — just by shape and color.

## 3. Planets — bodies, not halos

- Jupiter: bands must be visible at arm's length phone viewing
- Saturn: rings must be clearly distinct from the planet body
- Mars: red surface should read as "Mars" instantly, not "red dot"
- Venus: bright pearl glow, cloud texture hints
- Planet BODY size should be proportionally larger than current
- Generic halos should be SMALLER (tight atmospheric glow, not fog)

Suggested minimum display sizes:
- Jupiter: 16-20px radius
- Saturn: 14-16px body + rings extending to 35px
- Venus: 12-14px 
- Mars: 10-12px
- Mercury: 6-8px

## 4. Camera modes

Add "Immersive Sky" toggle (in the existing mode UI):
- Normal AR: 45% camera darken (current)
- Immersive Sky: 75% camera darken (dramatically darker)
- Planetarium: 95% darken (current)

Immersive Sky is the screenshot mode. Dark enough that the 
sky looks cinematic, light enough to still see surroundings.
This is what users share on Instagram.

## 5. Visual hierarchy (unchanged)

```
Background: deep cosmic black (camera darkened)
      ↓
Milky Way: warm textured band with dust structure
      ↓
Nebulae: recognizable colored shapes within/near the band
      ↓
Stars: crisp spectral-colored dots with bloom on brightest
      ↓
Planets: textured bodies with tight atmospheric glow
      ↓
Constellation lines: subtle gold threads (45% opacity)
      ↓
Labels: readable, collision-free, slightly transparent
```

Each layer distinct. No layer competes with another.

---

## NEBULA REFERENCE: Trifid Nebula astrophoto (reference image removed from repo in release cleanup — was unshipped and unreferenced)

This Trifid Nebula astrophoto is the target for nebula rendering.

Key qualities to match in SVG:

### DUAL COLOR — pink emission + blue reflection
The Trifid has TWO distinct color regions:
- Lower: warm pink/rose H-alpha emission (#E08878 → #D06070)
- Upper: cool blue reflection nebulosity (#5090C0 → #70B0E0)
- Transition zone where they blend

EVERY major emission nebula has blue reflection regions nearby.
Our nebulae are single-color. They need at MINIMUM two color 
zones — warm core + cool outer haze.

### DARK DUST LANES SPLITTING THE GLOW
The Trifid literally means "three-split" — dark lanes carve 
the pink emission into three lobes. This is what makes it 
recognizable WITHOUT a label.

Build dark lane paths into the signature nebulae:
- Trifid: three dark lanes radiating from center (Y shape)
- Orion: dark lane across the bright trapezium region
- Lagoon: dark lane separating the two bright halves
- Eagle: dark columnar shapes (Pillars of Creation silhouette)

### IRREGULAR ORGANIC SHAPE
Not a circle. Not an ellipse. An ORGANIC cloud with:
- Ragged, uneven edges
- Brighter core, dimmer outer wisps
- Embedded bright stars (white dots inside the cloud)
- Gradual fade to transparent at edges

### DENSE EMBEDDED STAR FIELD
Stars shine THROUGH the nebula, especially in the outer 
regions. The nebula is translucent, not opaque.

### Implementation approach
For the 5 signature nebulae, build custom SVG Paths:
- Multiple overlapping shapes at different opacities
- Warm core shape + cool outer shape + dark lane paths
- 5-8 embedded bright star dots inside the cloud
- Overall opacity: 15-25% (translucent, not solid)

This level of detail only applies to the BIG FIVE:
  Orion (M42), Lagoon (M8), Trifid (M20), Eagle (M16), Carina (NGC 3372)

Other nebulae stay as enhanced radial glows — they're too 
small on screen to justify custom shapes.
