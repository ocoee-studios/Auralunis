# Nebula textures

Soft PNG glow billboards rendered by `NebulaTextureLayer`. Drop a PNG here, then set
`texture` / `textureSizeDeg` on that nebula in `src/features/sky-lens/data/nebulae.ts`.

## File spec (make-or-break)
- **PNG-32 with alpha. Glow-on-transparent** — the nebula colour fades to *fully
  transparent* at the edges. No box, no black background, no hard rim. (This is how it
  "glows into the sky": alpha-composited over the dark sky, transparent = additive-like.
  react-native-svg has no reliable screen/additive blend on iOS, so the blend lives in
  the PNG's alpha, not a render flag.)
- **Square canvas** (e.g. 768×768 or 1024×1024). The nebula sits centred with its real
  shape; transparent padding handles the aspect ratio.
- **Painterly / dreamy watercolour — NOT a hard Hubble astrophoto.** Soft, luminous,
  low-contrast, slightly desaturated. A photographic texture will read as "pasted on";
  a soft wash melts into the sky. This is the whole point.
- **Pre-dimmed / subtle** — author them faint. The renderer can lower opacity but can't
  un-saturate a garish source.
- Name by nebula id: `orion.png`, `north-america.png`, `rosette.png`, `lagoon.png`,
  `eagle.png`, …

## Install
In `data/nebulae.ts`, on the nebula:
```ts
texture: require("../../../assets/sky/nebulae/orion.png"),
textureSizeDeg: 8,      // on-sky display size (artistic — bigger than real, for presence)
textureAngle: 0,        // optional rotation
```
`NebulaLayer` auto-skips any nebula with a `texture`, so no double render. Start with 1–2
(Orion, North America), device-check scale + opacity, then roll out the rest.

## Example generation prompt (per nebula)
> Soft, dreamy watercolour glow of the [Orion] nebula on a fully transparent background,
> luminous [rose and teal] pigments bleeding into transparency at the edges, low contrast,
> subtle, ethereal, painterly — not a photograph, no hard edges, no background, centred,
> square. PNG with alpha.

Tune `[nebula]` and `[colours]` per object (Orion rose/teal, North America warm pink,
Rosette deep rose, Lagoon pink/gold, Eagle amber).
