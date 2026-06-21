import React, { useCallback } from "react";
import Svg from "react-native-svg";
import { StyleSheet } from "react-native";
import { DEFAULT_FOV, projectTarget, type CameraPointing } from "./ar/SkyLensProjection";
import { GridLayer } from "./layers/GridLayer";
import { ConstellationLayer } from "./layers/ConstellationLayer";
import { StarLayer } from "./layers/StarLayer";
import { PlanetLayer } from "./layers/PlanetLayer";
import { MoonLayer } from "./layers/MoonLayer";
import { MilkyWayLayer } from "./layers/MilkyWayLayer";
import { TwinkleLayer } from "./layers/TwinkleLayer";
import { MeteorLayer } from "./layers/MeteorLayer";
import { DAY_PALETTE, NIGHT_PALETTE, type ProjectFn, type SelectedObject } from "./SkyLensVisual";
import type { LayerKey } from "./SkyLensLayerCatalog";
import type { SkyData } from "./hooks/useSkyProjection";

type Props = {
  box: { width: number; height: number };
  pointing: CameraPointing;
  sky: SkyData;
  activeLayers: Set<LayerKey>;
  nightMode: boolean;
  onSelect: (object: SelectedObject) => void;
};

// Composes the enabled SVG layers over the camera feed. Builds one projection
// closure from the current device pointing and hands it to every layer, so the
// expensive ephemeris (in useSkyData) is reused while only the cheap az/alt →
// screen transform re-runs as the phone moves.
export function SkyLensCanvas({ box, pointing, sky, activeLayers, nightMode, onSelect }: Props) {
  const palette = nightMode ? NIGHT_PALETTE : DAY_PALETTE;

  const project: ProjectFn = useCallback(
    (az: number, alt: number) => projectTarget(pointing, az, alt, DEFAULT_FOV, box),
    [pointing, box]
  );

  const moon = sky.bodies.find((b) => b.id === "moon");

  return (
    <Svg style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Milky Way sits behind everything */}
      {activeLayers.has("milkyway") && (
        <MilkyWayLayer band={sky.milkyWay} project={project} box={box} nightMode={nightMode} />
      )}
      {activeLayers.has("grid") && (
        <GridLayer project={project} centerAzimuth={pointing.azimuthDegrees} box={box} palette={palette} />
      )}
      {activeLayers.has("constellations") && (
        <ConstellationLayer
          constellations={sky.constellations}
          project={project}
          box={box}
          palette={palette}
          nightMode={nightMode}
          onSelect={onSelect}
        />
      )}
      {activeLayers.has("stars") && (
        <StarLayer stars={sky.stars} project={project} palette={palette} nightMode={nightMode} onSelect={onSelect} />
      )}
      {activeLayers.has("stars") && (
        <TwinkleLayer stars={sky.stars} project={project} nightMode={nightMode} />
      )}
      {activeLayers.has("planets") && (
        <PlanetLayer
          bodies={sky.bodies}
          project={project}
          palette={palette}
          nightMode={nightMode}
          onSelect={onSelect}
        />
      )}
      {/* Moon is always rendered (not a toggle) */}
      <MoonLayer
        moon={moon}
        illuminationPercent={sky.moonIlluminationPercent}
        project={project}
        palette={palette}
        onSelect={onSelect}
      />
      {/* Meteor streaks on top, for ambiance */}
      <MeteorLayer box={box} nightMode={nightMode} />
    </Svg>
  );
}
