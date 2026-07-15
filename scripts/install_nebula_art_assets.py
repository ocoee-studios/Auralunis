#!/usr/bin/env python3
from pathlib import Path
import shutil

ROOT = Path.cwd()
SRC = Path.home() / "Downloads" / "auralunis_nebula_assets" / "assets" / "nebula-art"
DST = ROOT / "assets" / "nebula-art"
LAYER = ROOT / "src/features/sky-lens/layers/NebulaArtLayer.tsx"
CANVAS = ROOT / "src/features/sky-lens/SkyLensCanvas.tsx"

if not SRC.exists():
    raise SystemExit(f"Missing nebula assets at {SRC}. Unzip auralunis_nebula_asset_pack.zip into ~/Downloads first.")

DST.mkdir(parents=True, exist_ok=True)
for p in SRC.iterdir():
    if p.suffix.lower() in {".png", ".webp"}:
        shutil.copy2(p, DST / p.name)

LAYER.write_text('''import React from "react";\nimport { Image } from "react-native";\nimport type { ProjectFn, SelectedObject } from "../SkyLensVisual";\n\ntype NebulaLike = { id: string; name: string; azimuthDegrees: number; altitudeDegrees: number; aboveHorizon?: boolean };\ntype Props = { nebulae: NebulaLike[]; project: ProjectFn; width: number; height: number; fullSphere?: boolean; onSelect: (object: SelectedObject) => void };\n\nconst ART: Record<string, any> = {\n  "orion-nebula": require("../../../../assets/nebula-art/orion-nebula.png"),\n  "north-america-nebula": require("../../../../assets/nebula-art/north-america-nebula.png"),\n  "veil-nebula": require("../../../../assets/nebula-art/veil-nebula.png"),\n  "lagoon-nebula": require("../../../../assets/nebula-art/lagoon-nebula.png"),\n  "trifid-nebula": require("../../../../assets/nebula-art/trifid-nebula.png"),\n  "eagle-nebula": require("../../../../assets/nebula-art/eagle-nebula.png"),\n  "swan-nebula": require("../../../../assets/nebula-art/swan-nebula.png"),\n  "rosette-nebula": require("../../../../assets/nebula-art/rosette-nebula.png"),\n  "crab-nebula": require("../../../../assets/nebula-art/crab-nebula.png"),\n  "carina-nebula": require("../../../../assets/nebula-art/carina-nebula.png"),\n  "dumbbell-nebula": require("../../../../assets/nebula-art/dumbbell-nebula.png"),\n  "ring-nebula": require("../../../../assets/nebula-art/ring-nebula.png"),\n  "helix-nebula": require("../../../../assets/nebula-art/ring-nebula.png")\n};\n\nconst normalize = (value: string) => value.toLowerCase().replace(/m\\s*\\d+|ngc\\s*\\d+/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");\nconst resolveArt = (n: NebulaLike) => ART[normalize(n.id)] ?? ART[normalize(n.name)];\nconst sizeFor = (name: string, min: number) => {\n  const k = normalize(name);\n  if (k.includes("north-america") || k.includes("veil")) return min * 0.64;\n  if (k.includes("orion") || k.includes("lagoon") || k.includes("eagle") || k.includes("carina")) return min * 0.56;\n  if (k.includes("rosette") || k.includes("crab") || k.includes("swan") || k.includes("trifid")) return min * 0.48;\n  return min * 0.36;\n};\n\nexport function NebulaArtLayer({ nebulae, project, width, height, fullSphere = false }: Props) {\n  const screenMin = Math.min(width, height);\n  return <>\n    {nebulae.map((nebula) => {\n      if (!fullSphere && nebula.aboveHorizon === false) return null;\n      const art = resolveArt(nebula);\n      if (!art) return null;\n      const p = project(nebula.azimuthDegrees, nebula.altitudeDegrees);\n      if (!p.onScreen) return null;\n      const size = sizeFor(nebula.name, screenMin);\n      return <Image key={`nebula-art-${nebula.id}`} source={art} resizeMode="contain" pointerEvents="none" accessibilityIgnoresInvertColors style={{ position: "absolute", left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, opacity: 0.9, transform: [{ rotate: `${((nebula.azimuthDegrees % 72) - 36).toFixed(1)}deg` }] }} />;\n    })}\n  </>;\n}\n''')

text = CANVAS.read_text()
if 'import { NebulaArtLayer } from "./layers/NebulaArtLayer";' not in text:
    text = text.replace('import { NebulaLayer } from "./layers/NebulaLayer";', 'import { NebulaLayer } from "./layers/NebulaLayer";\nimport { NebulaArtLayer } from "./layers/NebulaArtLayer";')

block = '''      {false && activeLayers.has("deepsky") && nebulaOpacity > 0 && (
        <G transform={depth(1)} opacity={nebulaOpacity}>
          <NebulaLayer nebulae={sky.nebulae} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} placeLabel={placeLabel} showLabels={showLabels} customShapes={vg.nebulaShapes} fullSphere={fullSphere} onSelect={onSelect} />
        </G>
      )}'''
insert = '''      {activeLayers.has("deepsky") && nebulaOpacity > 0 && (
        <NebulaArtLayer nebulae={sky.nebulae} project={project} width={box.width} height={box.height} fullSphere={fullSphere} onSelect={onSelect} />
      )}'''
if block in text:
    text = text.replace(block, insert, 1)
elif '<NebulaArtLayer nebulae={sky.nebulae}' not in text:
    text = text.replace('      {activeLayers.has("grid") && !cinematic && (', insert + '\n      {activeLayers.has("grid") && !cinematic && (')

CANVAS.write_text(text)
print("Installed transparent nebula assets and wired NebulaArtLayer into SkyLensCanvas.")
