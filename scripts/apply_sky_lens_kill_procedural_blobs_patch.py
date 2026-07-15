#!/usr/bin/env python3
from pathlib import Path

path = Path("src/features/sky-lens/SkyLensCanvas.tsx")
text = path.read_text()

replacements = [
    (
        '<HorizonGlowLayer project={project} centerAzimuth={pointing.azimuthDegrees} box={box} nightMode={nightMode} boost={milkyWayBoost} />',
        '{false && <HorizonGlowLayer project={project} centerAzimuth={pointing.azimuthDegrees} box={box} nightMode={nightMode} boost={milkyWayBoost} />}'
    ),
    (
        '''      {/* Deep-sky nebulae — toggleable via the Deep Sky layer button */}
      {activeLayers.has("deepsky") && nebulaOpacity > 0 && (
        <G transform={depth(1)} opacity={nebulaOpacity}>
          <NebulaLayer nebulae={sky.nebulae} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} placeLabel={placeLabel} showLabels={showLabels} customShapes={vg.nebulaShapes} fullSphere={fullSphere} onSelect={onSelect} />
        </G>
      )}''',
        '''      {/* Procedural Deep Sky disabled: the old SVG nebula blobs looked cheap in
          Sky Lens screenshots. Nebulae should render only through the image-backed
          NebulaArtLayer once the transparent PNG/WebP assets are installed. */}
      {false && activeLayers.has("deepsky") && nebulaOpacity > 0 && (
        <G transform={depth(1)} opacity={nebulaOpacity}>
          <NebulaLayer nebulae={sky.nebulae} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} placeLabel={placeLabel} showLabels={showLabels} customShapes={vg.nebulaShapes} fullSphere={fullSphere} onSelect={onSelect} />
        </G>
      )}'''
    ),
    # In case formatting changed slightly, also catch just the component line.
    (
        '<NebulaLayer nebulae={sky.nebulae} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} placeLabel={placeLabel} showLabels={showLabels} customShapes={vg.nebulaShapes} fullSphere={fullSphere} onSelect={onSelect} />',
        '{false && <NebulaLayer nebulae={sky.nebulae} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} placeLabel={placeLabel} showLabels={showLabels} customShapes={vg.nebulaShapes} fullSphere={fullSphere} onSelect={onSelect} />}'
    ),
]

changed = 0
for old, new in replacements:
    if old in text:
        text = text.replace(old, new, 1)
        changed += 1

path.write_text(text)
print(f"Sky Lens procedural-blob cleanup applied. Replacements made: {changed}")
print("Expected result: no red/green/blue nebula blobs and less brown horizon haze.")
