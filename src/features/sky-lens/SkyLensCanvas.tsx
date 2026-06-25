import React, { useCallback } from "react";
import Svg, { G } from "react-native-svg";
import { StyleSheet } from "react-native";
import { projectTarget, DEFAULT_FOV, type CameraPointing, type CameraFov } from "./ar/SkyLensProjection";
import { GridLayer } from "./layers/GridLayer";
import { ConstellationLayer } from "./layers/ConstellationLayer";
import { StarLayer } from "./layers/StarLayer";
import { DomeStarLayer } from "./layers/DomeStarLayer";
import { PlanetLayer } from "./layers/PlanetLayer";
import { MoonLayer } from "./layers/MoonLayer";
import { MilkyWayLayer } from "./layers/MilkyWayLayer";
import { MilkyWayCoreLayer } from "./layers/MilkyWayCoreLayer";
import { NebulaLayer } from "./layers/NebulaLayer";
import { EclipticLayer } from "./layers/EclipticLayer";
import { ZodiacLayer } from "./layers/ZodiacLayer";
import { SatelliteLayer, type SkyLensSatellite } from "./layers/SatelliteLayer";
import { DAY_PALETTE, NIGHT_PALETTE, type ProjectFn, type SelectedObject, type FocusZone } from "./SkyLensVisual";
import { type LayerKey } from "./SkyLensLayerCatalog";
import { makeLabelPlacer } from "./labelLayout";
import type { SkyData } from "./hooks/useSkyProjection";
import type { ParallaxOffset } from "./ar/useParallaxOffset";

type Props = {
  box: { width: number; height: number };
  pointing: CameraPointing;
  sky: SkyData;
  fov: CameraFov;
  activeLayers: Set<LayerKey>;
  nightMode: boolean;
  milkyWayBoost: number;
  isPremium: boolean;
  focus: FocusZone;
  showcase: FocusZone;
  parallax: ParallaxOffset;
  satellites: SkyLensSatellite[];
  onSelect: (object: SelectedObject) => void;
};

// Composes the enabled SVG layers over the camera feed. Builds one projection
// closure from the current device pointing and hands it to every layer, so the
// expensive ephemeris (in useSkyData) is reused while only the cheap az/alt →
// screen transform re-runs as the phone moves.
export function SkyLensCanvas({ box, pointing, sky, fov, activeLayers, nightMode, milkyWayBoost, isPremium, focus, showcase, parallax, satellites, onSelect }: Props) {
  const palette = nightMode ? NIGHT_PALETTE : DAY_PALETTE;

  // One shared label placer per render → cross-layer collision avoidance: each layer
  // nudges its label into a free slot so nearby labels (Mercury/ISS/Jupiter,
  // Beehive/Cancer, Orion nebulae) stack instead of overlapping.
  const placeLabel = makeLabelPlacer(box);

  // Celestial-dome depth: cloud layers float by a fraction of the gyro parallax
  // offset while the deep dome stays anchored. translate(0 0) at rest = exact AR.
  const depth = (d: number) => `translate(${(parallax.x * d).toFixed(2)} ${(parallax.y * d).toFixed(2)})`;

  // Constellation FIGURES (gold stick lines) are shown for everyone — gating them
  // made 25 constellations render as bare stars with no lines (looked broken).
  // Premium value lives in the other layers (Deep Sky, Satellites, Ecliptic, etc.).
  const constellations = sky.constellations;

  const project: ProjectFn = useCallback(
    (az: number, alt: number) => projectTarget(pointing, az, alt, fov, box),
    [pointing, box, fov]
  );

  // Progressive reveal: as the user pinch-zooms (FOV narrows), raise the star-label
  // brightness cutoff so fainter named stars pick up labels. ~+0.7 mag per zoom step.
  const zoomLevel = DEFAULT_FOV.horizontalDegrees / fov.horizontalDegrees;
  const starLabelMag = 2.2 + Math.min(2.6, Math.max(0, zoomLevel - 1) * 0.7);

  const moon = sky.bodies.find((b) => b.id === "moon");

  return (
    <Svg style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Milky Way behind everything: a thin procedural band wraps the full galactic
          plane (Sagittarius→Cygnus→Cassiopeia→Orion), then the REAL photographic core
          glows on top at Sagittarius. */}
      {activeLayers.has("milkyway") && (
        <G transform={depth(0.6)}>
          <MilkyWayLayer band={sky.milkyWay} stars={sky.milkyWayStars} dust={sky.milkyWayDust} project={project} box={box} nightMode={nightMode} boost={milkyWayBoost} />
          <MilkyWayCoreLayer band={sky.milkyWay} project={project} fov={fov} box={box} nightMode={nightMode} boost={milkyWayBoost} />
        </G>
      )}
      {/* Deep-sky nebulae — toggleable via the Deep Sky layer button */}
      {activeLayers.has("deepsky") && (
        <G transform={depth(1)}>
          <NebulaLayer nebulae={sky.nebulae} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} placeLabel={placeLabel} onSelect={onSelect} />
        </G>
      )}
      {activeLayers.has("grid") && (
        <GridLayer project={project} centerAzimuth={pointing.azimuthDegrees} box={box} palette={palette} />
      )}
      {activeLayers.has("ecliptic") && (
        <EclipticLayer points={sky.ecliptic} project={project} palette={palette} nightMode={nightMode} />
      )}
      {activeLayers.has("constellations") && (
        <ConstellationLayer
          constellations={constellations}
          project={project}
          box={box}
          palette={palette}
          nightMode={nightMode}
          placeLabel={placeLabel}
          onSelect={onSelect}
        />
      )}
      {/* Zodiac: the 12 signs along the ecliptic (free "find your sign" layer) */}
      {activeLayers.has("zodiac") && (
        <ZodiacLayer
          zodiac={sky.zodiac}
          project={project}
          palette={palette}
          nightMode={nightMode}
          sun={sky.bodies.find((b) => b.id === "sun") ?? null}
          onSelect={onSelect}
        />
      )}
      {/* Dense background field behind the named bright stars */}
      {activeLayers.has("stars") && (
        <DomeStarLayer stars={sky.domeStars} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} />
      )}
      {activeLayers.has("stars") && (
        <G transform={depth(0.25)}>
          <StarLayer stars={sky.stars} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} placeLabel={placeLabel} labelMagLimit={starLabelMag} onSelect={onSelect} />
        </G>
      )}
      {activeLayers.has("planets") && (
        <PlanetLayer
          bodies={sky.bodies}
          project={project}
          palette={palette}
          nightMode={nightMode}
          placeLabel={placeLabel}
          onSelect={onSelect}
        />
      )}
      {/* Tracked satellites on the live feed (ISS gold, Starlink pale-blue, others silver) */}
      {activeLayers.has("satellites") && (
        <SatelliteLayer satellites={satellites} project={project} palette={palette} nightMode={nightMode} placeLabel={placeLabel} onSelect={onSelect} />
      )}
      {/* Moon is always rendered (not a toggle) */}
      <MoonLayer
        moon={moon}
        illuminationPercent={sky.moonIlluminationPercent}
        project={project}
        palette={palette}
        nightMode={nightMode}
        onSelect={onSelect}
      />
    </Svg>
  );
}
