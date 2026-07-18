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
import { MoonLayer, MOON_RADIUS } from "./layers/MoonLayer";
import { CosmicDustLayer } from "./layers/CosmicDustLayer";
import { HorizonGlowLayer } from "./layers/HorizonGlowLayer";
import { ShootingStarLayer } from "./layers/ShootingStarLayer";
import { EclipticLayer } from "./layers/EclipticLayer";
import { ZodiacLayer } from "./layers/ZodiacLayer";
import { SatelliteLayer, type SkyLensSatellite } from "./layers/SatelliteLayer";
import { DAY_PALETTE, NIGHT_PALETTE, type ProjectFn, type SelectedObject, type FocusZone } from "./SkyLensVisual";
import { type LayerKey } from "./SkyLensLayerCatalog";
import { makeLabelPlacer } from "./labelLayout";
import { type ChromeRect } from "./skyLensChromeLayout";
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
  /** Height of the bottom control dock (px). Labels are kept out of it. */
  bottomInset?: number;
  /** Top exclusion band (px), derived from safe-area + HUD height by the screen. */
  topInset?: number;
  /** UI-chrome rectangles (shutter, guidance banner, zoom chip) labels must avoid. */
  reservedRects?: ChromeRect[];
  onSelect: (object: SelectedObject) => void;
};

// Composes the enabled celestial layers over the cinematic sky. The presentation may
// look like a planetarium, but normal viewing remains horizon-correct: objects beneath
// the observer are never painted into the visible sky.
export function SkyLensCanvas({ box, pointing, sky, fov, activeLayers, nightMode, milkyWayBoost, domeStarMultiplier = 1, nebulaOpacity = 1, extinction = false, isPremium, focus, showcase, parallax, satellites, cinematic = false, gate, bottomInset = 120, topInset = 108, reservedRects = [], onSelect }: Props) {
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
  // Safe margins keep every label clear of the top HUD and the bottom control dock. The
  // bottom figure is now DERIVED from the dock the screen actually rendered (it shrinks
  // when brightness/time-travel are collapsed), rather than a fixed 176 that assumed the
  // tall stack — so compacting the UI genuinely hands the reclaimed space back to labels.
  const placeLabel = makeLabelPlacer(box, { top: topInset, bottom: bottomInset });
  // Reserve on-screen UI chrome (shutter, guidance banner, zoom chip) BEFORE any layer
  // places a label, so chrome always wins: a label that can't find a clear slot is
  // suppressed rather than drawn under a control. The top HUD and bottom dock are already
  // excluded by the top/bottom safe bands above; these are the floating controls the bands
  // don't cover. Rects come from skyLensChromeLayout (the shared geometry source).
  for (const r of reservedRects) placeLabel.reserve(r.x, r.y, r.w, r.h);
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

  // The Moon renders LAST (it sits outside the hero-dim group so it keeps full
  // brightness), which means it would claim its artwork only after every other layer had
  // already placed its labels — a star or planet label could land right on the Moon.
  // Claim it HERE, up front, so the whole scene lays out around it.
  if (moonOnScreen && moonProj) {
    placeLabel.reserveCircle(moonProj.x, moonProj.y, MOON_RADIUS * 1.2);
  }

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
        {/* §1 — SHIMMERING STARDUST. Sky-locked silver-gold dust, concentrated along the
            REAL galactic plane (sky.milkyWay, projected) so it hugs the Milky Way and
            thins out when you point away — no faked screen-space band. Backmost layer,
            behind the stars. Its animated glints ride TwinkleOverlay's shared clock
            (see stardustGlints in SkyLensScreen) rather than a second animation system.
            horizonCorrect keeps its motes off the below-horizon sky, same as every
            other layer here. */}
        <CosmicDustLayer
          box={box}
          project={project}
          band={sky.milkyWay}
          nightMode={nightMode}
          fullSphere={horizonCorrect}
        />
        <HorizonGlowLayer project={project} centerAzimuth={pointing.azimuthDegrees} box={box} nightMode={nightMode} boost={milkyWayBoost} />

        {/* NEBULAE ARE RENDERED BY NebulaImageLayer (mounted in SkyLensScreen) — the ONE
            nebula renderer. The procedural NebulaLayer used to draw here on the same
            `deepsky` key, so every nebula was painted TWICE: doubled opacity, muddied
            colour. It also built silhouettes from 9-point blobs (visibly angular) and
            treated star clusters and galaxies as glowing emission clouds. Retired.
            The file remains on disk; nothing mounts it. */}

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
        {/* Constellation FIGURES (lines) — rendered here, UNDER the stars. Labels are NOT
            drawn in this pass (showLabels={false}); they are placed later, after the stars
            and planets, so constellation names correctly yield to star/planet names in the
            shared label placer (see the labels-only mount further down). */}
        {activeLayers.has("constellations") && (
          <G opacity={cinematic ? 0.48 : 0.72}>
            <ConstellationLayer
              constellations={constellations}
              project={project}
              box={box}
              palette={palette}
              nightMode={nightMode}
              showLabels={false}
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

        {/* PLANET DISCS + LABELS claim their slots HERE, BEFORE the stars — this labels-only
            pass reserves each planet's disc and places its name in the shared placer first,
            so a nearby named star (e.g. Aldebaran beside Mars) yields its label slot to the
            planet instead of stealing it. The artwork itself is drawn later, over the stars,
            by the second PlanetLayer mount (showLabels={false}). No coordinates change — this
            is purely label claim-order. */}
        {activeLayers.has("planets") && showLabels && (
          <PlanetLayer
            bodies={sky.bodies}
            project={project}
            palette={palette}
            nightMode={nightMode}
            placeLabel={placeLabel}
            showLabels
            labelsOnly
            useIllustrations={vg.planetIllustrations}
            zoom={zoomLevel}
            fullSphere={horizonCorrect}
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
        {/* PLANET ARTWORK — discs, halos, rings, illustrations. Drawn over the stars.
            showLabels={false}: the names were already claimed + rendered by the labels-only
            pass above (which runs before the stars), so planet labels outrank nearby star
            labels. This mount reserves nothing new. */}
        {activeLayers.has("planets") && (
          <PlanetLayer
            bodies={sky.bodies}
            project={project}
            palette={palette}
            nightMode={nightMode}
            placeLabel={placeLabel}
            showLabels={false}
            useIllustrations={vg.planetIllustrations}
            zoom={zoomLevel}
            fullSphere={horizonCorrect}
            onSelect={onSelect}
          />
        )}
        {/* Constellation LABELS — placed HERE, after stars & planets have claimed their
            slots, so a constellation name yields to a nearby star/planet name (priority
            ladder) instead of stealing its slot. Same opacity wrapper as the figures so
            the names keep their tuned ~0.40 effective opacity. Rendered above the stars,
            which is correct for label legibility. */}
        {activeLayers.has("constellations") && showLabels && (
          <G opacity={cinematic ? 0.48 : 0.72}>
            <ConstellationLayer
              constellations={constellations}
              project={project}
              box={box}
              palette={palette}
              nightMode={nightMode}
              placeLabel={placeLabel}
              showLabels
              labelsOnly
              fullSphere={horizonCorrect}
              onSelect={onSelect}
            />
          </G>
        )}
        {activeLayers.has("satellites") && !cinematic && (
          <SatelliteLayer satellites={satellites} project={project} palette={palette} nightMode={nightMode} placeLabel={placeLabel} onSelect={onSelect} />
        )}
      </G>

      <MoonLayer
        moon={moon}
        illuminationPercent={sky.moonIlluminationPercent}
        placeLabel={placeLabel}
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
