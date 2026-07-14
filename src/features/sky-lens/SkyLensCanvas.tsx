import React, { useCallback, useMemo } from "react";
import Svg, { Circle, Defs, G, RadialGradient, Stop } from "react-native-svg";
import { StyleSheet } from "react-native";
import { projectTarget, DEFAULT_FOV, type CameraPointing, type CameraFov } from "./ar/SkyLensProjection";
import { GridLayer } from "./layers/GridLayer";
import { CardinalLayer } from "./layers/CardinalLayer";
import { ConstellationLayer } from "./layers/ConstellationLayer";
import { ConstellationArtLayer } from "./layers/ConstellationArtLayer";
import { StarLayer } from "./layers/StarLayer";
import { DomeStarLayer } from "./layers/DomeStarLayer";
import { PlanetLayer } from "./layers/PlanetLayer";
import { MoonLayer } from "./layers/MoonLayer";
import { CosmicDustLayer } from "./layers/CosmicDustLayer";
import { HorizonGlowLayer } from "./layers/HorizonGlowLayer";
import { NebulaLayer } from "./layers/NebulaLayer";
import { ShootingStarLayer } from "./layers/ShootingStarLayer";
import { EclipticLayer } from "./layers/EclipticLayer";
import { ZodiacLayer } from "./layers/ZodiacLayer";
import { SatelliteLayer, type SkyLensSatellite } from "./layers/SatelliteLayer";
import { DAY_PALETTE, NIGHT_PALETTE, type ProjectFn, type SelectedObject, type FocusZone } from "./SkyLensVisual";
import { type LayerKey } from "./SkyLensLayerCatalog";
import { makeLabelPlacer } from "./labelLayout";
import type { SkyData } from "./hooks/useSkyProjection";
import type { ParallaxOffset } from "./ar/useParallaxOffset";
import { getVisualGate, type VisualGateConfig } from "./PremiumVisualGating";

type Props = {
  box: { width: number; height: number };
  pointing: CameraPointing;
  sky: SkyData;
  fov: CameraFov;
  activeLayers: Set<LayerKey>;
  nightMode: boolean;
  milkyWayBoost: number;
  domeStarMultiplier?: number;
  nebulaOpacity?: number;
  extinction?: boolean;
  isPremium: boolean;
  focus: FocusZone;
  showcase: FocusZone;
  parallax: ParallaxOffset;
  satellites: SkyLensSatellite[];
  cinematic?: boolean;
  gate?: VisualGateConfig;
  photographicCore?: boolean;
  fullSphere?: boolean;
  onSelect: (object: SelectedObject) => void;
};

// Composes the enabled celestial layers over the cinematic sky. The presentation may
// look like a planetarium, but normal viewing remains horizon-correct: objects beneath
// the observer are never painted into the visible sky.
export function SkyLensCanvas({ box, pointing, sky, fov, activeLayers, nightMode, milkyWayBoost, domeStarMultiplier = 1, nebulaOpacity = 1, extinction = false, isPremium, focus, showcase, parallax, satellites, cinematic = false, gate, onSelect }: Props) {
  const palette = nightMode ? NIGHT_PALETTE : DAY_PALETTE;
  const vg = gate ?? getVisualGate(isPremium);
  const horizonCorrect = false;

  const domeStars = useMemo(() => {
    const base = domeStarMultiplier < 1
      ? sky.domeStars.filter((s) => s.magnitude <= 3.2 + 2.8 * domeStarMultiplier)
      : sky.domeStars;
    return base.filter((s) => s.aboveHorizon && s.magnitude <= 4.5);
  }, [sky.domeStars, domeStarMultiplier]);

  const showLabels = !cinematic;
  const placeLabel = makeLabelPlacer(box);
  const depth = (d: number) => `translate(${(parallax.x * d).toFixed(2)} ${(parallax.y * d).toFixed(2)})`;
  const constellations = sky.constellations;

  const project: ProjectFn = useCallback(
    (az: number, alt: number) => projectTarget(pointing, az, alt, fov, box),
    [pointing, box, fov]
  );

  const zoomLevel = DEFAULT_FOV.horizontalDegrees / fov.horizontalDegrees;
  // Keep normal viewing sparse: only the brightest named stars earn labels until zoomed.
  const starLabelMag = 1.65 + Math.min(2.2, Math.max(0, zoomLevel - 1) * 0.65);

  const moon = sky.bodies.find((b) => b.id === "moon");
  const moonProj = moon && moon.aboveHorizon ? project(moon.azimuthDegrees, moon.altitudeDegrees) : null;
  const moonOnScreen = !!moonProj?.onScreen;
  const heroDim = moonOnScreen ? 0.85 : 1;
  const lensR = Math.min(box.height * 0.95, box.height * (30 / Math.max(8, fov.verticalDegrees)));

  return (
    <Svg style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Defs>
        <RadialGradient id="moonLensAdapt" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFE9B0" stopOpacity={0.05} />
          <Stop offset="55%" stopColor="#D9A84E" stopOpacity={0.02} />
          <Stop offset="100%" stopColor="#D9A84E" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {moonOnScreen && !nightMode && moonProj && (
        <Circle cx={moonProj.x} cy={moonProj.y} r={lensR} fill="url(#moonLensAdapt)" />
      )}

      <G opacity={heroDim}>
        <CosmicDustLayer box={box} nightMode={nightMode} />
        <HorizonGlowLayer project={project} centerAzimuth={pointing.azimuthDegrees} box={box} nightMode={nightMode} boost={milkyWayBoost} />

        {activeLayers.has("deepsky") && nebulaOpacity > 0 && (
          <G transform={depth(1)} opacity={Math.min(nebulaOpacity, 0.32)}>
            <NebulaLayer
              nebulae={sky.nebulae}
              project={project}
              palette={palette}
              nightMode={nightMode}
              focus={focus}
              showcase={showcase}
              placeLabel={placeLabel}
              showLabels={false}
              customShapes={vg.nebulaShapes}
              fullSphere={horizonCorrect}
              onSelect={onSelect}
            />
          </G>
        )}

        {activeLayers.has("grid") && !cinematic && (
          <GridLayer project={project} centerAzimuth={pointing.azimuthDegrees} box={box} palette={palette} />
        )}
        {!cinematic && <CardinalLayer project={project} box={box} nightMode={nightMode} />}
        {activeLayers.has("ecliptic") && !cinematic && (
          <EclipticLayer points={sky.ecliptic} project={project} palette={palette} nightMode={nightMode} />
        )}

        {/* The mythology engraving layer was beautiful in isolation but crowded the live
            sky. Keep the constellation map refined: quiet gold lines and restrained labels. */}
        {activeLayers.has("constellations") && (
          <ConstellationArtLayer constellations={constellations} project={project} box={box} fov={fov} enabled={false} />
        )}
        {activeLayers.has("constellations") && (
          <G opacity={cinematic ? 0.48 : 0.72}>
            <ConstellationLayer
              constellations={constellations}
              project={project}
              box={box}
              palette={palette}
              nightMode={nightMode}
              placeLabel={placeLabel}
              showLabels={showLabels}
              showNodes={false}
              fullSphere={horizonCorrect}
              onSelect={onSelect}
            />
          </G>
        )}

        {activeLayers.has("zodiac") && !cinematic && (
          <ZodiacLayer
            zodiac={sky.zodiac}
            project={project}
            palette={palette}
            nightMode={nightMode}
            sun={sky.bodies.find((b) => b.id === "sun") ?? null}
            onSelect={onSelect}
          />
        )}

        {activeLayers.has("stars") && (
          <DomeStarLayer stars={domeStars} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} extinction={extinction} useSpectralColors={vg.spectralColors} fullSphere={horizonCorrect} />
        )}
        {activeLayers.has("stars") && (
          <G transform={depth(0.25)}>
            <StarLayer stars={sky.stars} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} placeLabel={placeLabel} labelMagLimit={starLabelMag} showLabels={showLabels} extinction={extinction} bloom={vg.starBloom} fullSphere={horizonCorrect} onSelect={onSelect} />
          </G>
        )}

        {vg.shootingStars && <ShootingStarLayer width={box.width} height={box.height} nightMode={nightMode} />}
        {activeLayers.has("planets") && (
          <PlanetLayer
            bodies={sky.bodies}
            project={project}
            palette={palette}
            nightMode={nightMode}
            placeLabel={placeLabel}
            showLabels={showLabels}
            useIllustrations={vg.planetIllustrations}
            zoom={zoomLevel}
            fullSphere={horizonCorrect}
            onSelect={onSelect}
          />
        )}
        {activeLayers.has("satellites") && !cinematic && (
          <SatelliteLayer satellites={satellites} project={project} palette={palette} nightMode={nightMode} placeLabel={placeLabel} onSelect={onSelect} />
        )}
      </G>

      <MoonLayer
        moon={moon}
        illuminationPercent={sky.moonIlluminationPercent}
        project={project}
        palette={palette}
        nightMode={nightMode}
        showLabels={showLabels}
        heroMode={vg.heroMoon}
        fullSphere={horizonCorrect}
        onSelect={onSelect}
      />
    </Svg>
  );
}
