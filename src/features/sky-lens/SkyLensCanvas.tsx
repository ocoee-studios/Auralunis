import React, { useCallback } from "react";
import Svg from "react-native-svg";
import { StyleSheet } from "react-native";
import { projectTarget, type CameraPointing, type CameraFov } from "./ar/SkyLensProjection";
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
import { DAY_PALETTE, NIGHT_PALETTE, type ProjectFn, type SelectedObject } from "./SkyLensVisual";
import { type LayerKey } from "./SkyLensLayerCatalog";
import type { SkyData } from "./hooks/useSkyProjection";

type Props = {
  box: { width: number; height: number };
  pointing: CameraPointing;
  sky: SkyData;
  fov: CameraFov;
  activeLayers: Set<LayerKey>;
  nightMode: boolean;
  milkyWayBoost: number;
  isPremium: boolean;
  onSelect: (object: SelectedObject) => void;
};

// Composes the enabled SVG layers over the camera feed. Builds one projection
// closure from the current device pointing and hands it to every layer, so the
// expensive ephemeris (in useSkyData) is reused while only the cheap az/alt →
// screen transform re-runs as the phone moves.
export function SkyLensCanvas({ box, pointing, sky, fov, activeLayers, nightMode, milkyWayBoost, isPremium, onSelect }: Props) {
  const palette = nightMode ? NIGHT_PALETTE : DAY_PALETTE;

  // Constellation FIGURES (gold stick lines) are shown for everyone — gating them
  // made 25 constellations render as bare stars with no lines (looked broken).
  // Premium value lives in the other layers (Deep Sky, Satellites, Ecliptic, etc.).
  const constellations = sky.constellations;

  const project: ProjectFn = useCallback(
    (az: number, alt: number) => projectTarget(pointing, az, alt, fov, box),
    [pointing, box, fov]
  );

  const moon = sky.bodies.find((b) => b.id === "moon");

  return (
    <Svg style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Milky Way: a soft radial-gradient band wraps the whole galactic plane
          (visible in every direction), then the REAL photographic core texture
          glows on top at Sagittarius. No polyline stripe artifacts. */}
      {activeLayers.has("milkyway") && (
        <MilkyWayLayer band={sky.milkyWay} project={project} box={box} nightMode={nightMode} boost={milkyWayBoost} />
      )}
      {activeLayers.has("milkyway") && (
        <MilkyWayCoreLayer band={sky.milkyWay} project={project} fov={fov} box={box} nightMode={nightMode} boost={milkyWayBoost} />
      )}
      {/* Deep-sky nebulae glows sit just behind the stars */}
      <NebulaLayer nebulae={sky.nebulae} project={project} palette={palette} nightMode={nightMode} onSelect={onSelect} />
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
        <DomeStarLayer stars={sky.domeStars} project={project} palette={palette} nightMode={nightMode} />
      )}
      {activeLayers.has("stars") && (
        <StarLayer stars={sky.stars} project={project} palette={palette} nightMode={nightMode} onSelect={onSelect} />
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
        nightMode={nightMode}
        onSelect={onSelect}
      />
    </Svg>
  );
}
