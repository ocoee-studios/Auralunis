# Planet Texture Rendering — Make planets look real

## Current: colored dots with glow
## Target: photoreal planet textures like SkyView

## Approach: PNG textures for each planet

Download NASA public domain planet images (all free to use):
- Place in assets/planets/

### Required textures (128×128 PNG, transparent background):

| Planet | Image | Key features |
|--------|-------|-------------|
| Mercury | Gray sphere with craters | Terminator shadow |
| Venus | Pale yellow-white sphere | Cloud bands, thick atmosphere |
| Mars | Red-orange sphere | Dark albedo markings, polar caps |
| Jupiter | Banded sphere | Cloud bands, Great Red Spot, brown/gold/white stripes |
| Saturn | Gold sphere + rings | Visible ring gaps (Cassini division), shadow on rings |
| Uranus | Pale cyan sphere | Subtle banding |
| Neptune | Deep blue sphere | Dark spot, faint bands |
| Moon | Gray sphere | Maria (dark areas), crater detail, PHASE SHADOW |

### Rendering in PlanetLayer.tsx

Replace the simple Circle rendering with:

```tsx
import { Image as SvgImage } from "react-native-svg";

// For each planet, render the texture at the projected position
<SvgImage
  x={x - displaySize / 2}
  y={y - displaySize / 2}
  width={displaySize}
  height={displaySize}
  href={planetTextures[body.id]}
  opacity={0.9}
/>
```

### Size scaling

Planets should be rendered at sizes that feel right visually:
- Jupiter: 28-36px (largest planet = largest on screen)
- Saturn: 24-30px (smaller sphere but rings extend further)
- Mars: 14-18px
- Venus: 14-18px
- Mercury: 10-12px
- Uranus: 8-10px (far away, small)
- Neptune: 8-10px

### Saturn's rings

Saturn needs special treatment — the rings extend ~2.5× beyond
the planet sphere. Options:
A) Include rings in the Saturn PNG (simplest)
B) Render rings as a separate SVG Ellipse with gradient
C) Both — PNG sphere + SVG ring overlay for shimmer effect

### Phase/terminator shadows

For inner planets (Mercury, Venus, Mars) and Moon:
- Apply a semi-transparent dark overlay on the unlit side
- Calculate from the Sun's position relative to the planet
- Overlay: dark gradient from one edge (shadow) to center

### Atmospheric glow (keep existing)

Keep the existing colored glow circles BEHIND the texture:
- Mars: red glow
- Jupiter: gold glow
- Venus: white glow
- Saturn: gold glow with ring shimmer

The glow makes them visible from afar. The texture shows
when you point close and the planet fills more screen space.

### Moon is special

The Moon gets the Hero Moon treatment separately:
- Full 256×256 texture
- Phase illumination (not just a shadow overlay)
- Earthshine on the dark side
- Atmospheric halo (LunarGodRayLayer)

### Source images

NASA Solar System resources (all public domain):
- https://solarsystem.nasa.gov/resources/
- https://photojournal.jpl.nasa.gov/

Or generate stylized planet illustrations that match AuraLunis
gold aesthetic — slightly warmer tones than pure photo-realism.

### Build priority

1. Jupiter + Saturn (most recognizable, most impact)
2. Mars + Venus (frequently visible)
3. Moon (separate Hero Moon task)
4. Mercury, Uranus, Neptune (rarely visible, lower priority)
