import React, { useCallback } from "react";
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
import { MilkyWayLayer } from "./layers/MilkyWayLayer";
import { MilkyWayCoreLayer } from "./layers/MilkyWayCoreLayer";
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
  domeStarMultiplier?: number; // Bortle: fraction of dome stars to show (City 0.15 → Dark 1.0)
  nebulaOpacity?: number; // Bortle × magnificent-night: nebula glow visibility (0 hides them)
  extinction?: boolean; // atmospheric extinction: warm low-altitude stars toward orange
  isPremium: boolean;
  focus: FocusZone;
  showcase: FocusZone;
  parallax: ParallaxOffset;
  satellites: SkyLensSatellite[];
  cinematic?: boolean; // Immersive Sky mode: hide labels + data overlays, dim con-lines
  gate?: VisualGateConfig; // premium visual gating: spectral stars, gold nodes, hero moon, etc.
  photographicCore?: boolean; // false → skip the ESO Milky Way PHOTO (keep the SVG band).
                              // Used by Birth Sky so it stays fully procedural (no image asset).
  fullSphere?: boolean; // Planetarium mode: render the WHOLE sphere — below-horizon objects
                        // at full brightness (point the phone at the floor → the sky below)
  onSelect: (object: SelectedObject) => void;
};

// Composes the enabled SVG layers over the camera feed. Builds one projection
// closure from the current device pointing and hands it to every layer, so the
// expensive ephemeris (in useSkyData) is reused while only the cheap az/alt →
// screen transform re-runs as the phone moves.
export function SkyLensCanvas({ box, pointing, sky, fov, activeLayers, nightMode, milkyWayBoost, domeStarMultiplier = 1, nebulaOpacity = 1, extinction = false, isPremium, focus, showcase, parallax, satellites, cinematic = false, gate, photographicCore = true, fullSphere = false, onSelect }: Props) {
  const palette = nightMode ? NIGHT_PALETTE : DAY_PALETTE;
  // Premium visual gate — falls back to the isPremium-derived config if a caller
  // doesn't pass one explicitly, so the canvas is never ungated by accident.
  const vg = gate ?? getVisualGate(isPremium);
  // Bortle dome-star thinning: City keeps only the brightest stars, Dark Site all
  // of them. Dome magnitudes span ~3.2–6.0, so a magnitude cutoff scaled by the
  // multiplier keeps the brightest fraction — exactly what light pollution leaves
  // to the naked eye (a prefix slice would drop random stars, since the field is
  // generated in random-magnitude order, not sorted).
  const domeStars = domeStarMultiplier < 1
    ? sky.domeStars.filter((s) => s.magnitude <= 3.2 + 2.8 * domeStarMultiplier)
    : sky.domeStars;
  // Cinematic Immersive Sky: no text labels, no data overlays (grid/ecliptic/zodiac/
  // satellites) — only the beauty set. Constellation lines drop to ~62%.
  const showLabels = !cinematic;

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
  // §2/§6 — THE MOON IS THE HERO. When it's on screen everything else steps back
  // ~15% so the eye lands on the Moon first; a faint gold "lens adaptation" wash
  // pools around it (eye adjusting to the brightest thing in the sky). Presence-
  // based: the instant the Moon leaves frame, the field returns to full strength.
  const moonProj = moon && moon.aboveHorizon ? project(moon.azimuthDegrees, moon.altitudeDegrees) : null;
  const moonOnScreen = !!moonProj?.onScreen;
  const heroDim = moonOnScreen ? 0.85 : 1;
  // ~30° of sky around the Moon, in screen px (clamped so a wide FOV stays sane).
  const lensR = Math.min(box.height * 0.95, box.height * (30 / Math.max(8, fov.verticalDegrees)));

  return (
    <Svg style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Defs>
        {/* faint gold lens-adaptation wash around the hero Moon */}
        <RadialGradient id="moonLensAdapt" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFE9B0" stopOpacity={0.05} />
          <Stop offset="55%" stopColor="#D9A84E" stopOpacity={0.02} />
          <Stop offset="100%" stopColor="#D9A84E" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* lens-adaptation wash sits at the very back, behind the field, only when the
          Moon is on screen (and not in Night Mode, which stays flat-red). */}
      {moonOnScreen && !nightMode && moonProj && (
        <Circle cx={moonProj.x} cy={moonProj.y} r={lensR} fill="url(#moonLensAdapt)" />
      )}

      {/* Everything EXCEPT the Moon steps back while the Moon holds the scene. */}
      <G opacity={heroDim}>
      {/* §1 — ambient warm wash + ultra-faint gold dust so the sky shimmers, not voids.
          Backmost layer, behind the Milky Way and stars. */}
      <CosmicDustLayer box={box} nightMode={nightMode} />
      {/* Horizon atmosphere glow — a warm dome hugging the projected horizon so the sky
          reads as a real dome with a "floor", not a flat chart. Tracks device tilt. */}
      <HorizonGlowLayer project={project} centerAzimuth={pointing.azimuthDegrees} box={box} nightMode={nightMode} boost={milkyWayBoost} />
      {/* Milky Way behind everything: a thin procedural band wraps the full galactic
          plane (Sagittarius→Cygnus→Cassiopeia→Orion), then the REAL photographic core
          glows on top at Sagittarius. */}
      {activeLayers.has("milkyway") && (
        <G transform={depth(0.6)}>
          <MilkyWayLayer band={sky.milkyWay} stars={sky.milkyWayStars} dust={sky.milkyWayDust} project={project} box={box} nightMode={nightMode} boost={milkyWayBoost} />
          {photographicCore && <MilkyWayCoreLayer band={sky.milkyWay} project={project} fov={fov} box={box} nightMode={nightMode} boost={milkyWayBoost} />}
        </G>
      )}
      {/* Deep-sky nebulae — toggleable via the Deep Sky layer button */}
      {activeLayers.has("deepsky") && nebulaOpacity > 0 && (
        <G transform={depth(1)} opacity={nebulaOpacity}>
          <NebulaLayer nebulae={sky.nebulae} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} placeLabel={placeLabel} showLabels={showLabels} customShapes={vg.nebulaShapes} fullSphere={fullSphere} onSelect={onSelect} />
        </G>
      )}
      {activeLayers.has("grid") && !cinematic && (
        <GridLayer project={project} centerAzimuth={pointing.azimuthDegrees} box={box} palette={palette} />
      )}
      {/* Cardinal compass labels — always on (independent of the grid toggle) so the
          user always has N/E/S/W orientation on the horizon. */}
      {!cinematic && <CardinalLayer project={project} box={box} nightMode={nightMode} />}
      {activeLayers.has("ecliptic") && !cinematic && (
        <EclipticLayer points={sky.ecliptic} project={project} palette={palette} nightMode={nightMode} />
      )}
      {/* §Task 5 — faint gold mythology engravings BEHIND the constellation lines
          (premium-only, fade in near screen centre). */}
      {activeLayers.has("constellations") && (
        <ConstellationArtLayer constellations={constellations} project={project} box={box} fov={fov} enabled={isPremium} />
      )}
      {activeLayers.has("constellations") && (
        <G opacity={cinematic ? 0.62 : 1}>
          <ConstellationLayer
            constellations={constellations}
            project={project}
            box={box}
            palette={palette}
            nightMode={nightMode}
            placeLabel={placeLabel}
            showLabels={showLabels}
            showNodes={vg.goldNodes}
            fullSphere={fullSphere}
            onSelect={onSelect}
          />
        </G>
      )}
      {/* Zodiac: the 12 signs along the ecliptic (free "find your sign" layer) */}
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
      {/* Dense background field behind the named bright stars */}
      {activeLayers.has("stars") && (
        <DomeStarLayer stars={domeStars} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} extinction={extinction} useSpectralColors={vg.spectralColors} fullSphere={fullSphere} />
      )}
      {activeLayers.has("stars") && (
        <G transform={depth(0.25)}>
          <StarLayer stars={sky.stars} project={project} palette={palette} nightMode={nightMode} focus={focus} showcase={showcase} placeLabel={placeLabel} labelMagLimit={starLabelMag} showLabels={showLabels} extinction={extinction} bloom={vg.starBloom} fullSphere={fullSphere} onSelect={onSelect} />
        </G>
      )}
      {/* Rare shooting stars streak across the field (~one every 8-12 min) — above
          the stars, below the planet/moon labels. Self-scheduling, crash-safe (JS
          clock + setState over static SVG lines). Premium only. */}
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
          fullSphere={fullSphere}
          onSelect={onSelect}
        />
      )}
      {/* Tracked satellites on the live feed (ISS gold, Starlink pale-blue, others silver) */}
      {activeLayers.has("satellites") && !cinematic && (
        <SatelliteLayer satellites={satellites} project={project} palette={palette} nightMode={nightMode} placeLabel={placeLabel} onSelect={onSelect} />
      )}
      </G>
      {/* Moon is always rendered (not a toggle) — OUTSIDE the hero-dim group so it
          holds full brightness while the rest of the sky steps back around it. */}
      <MoonLayer
        moon={moon}
        illuminationPercent={sky.moonIlluminationPercent}
        project={project}
        palette={palette}
        nightMode={nightMode}
        showLabels={showLabels}
        heroMode={vg.heroMoon}
        fullSphere={fullSphere}
        onSelect={onSelect}
      />
    </Svg>
  );
}
