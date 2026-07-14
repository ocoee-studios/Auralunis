import React from "react";
import { Circle, Defs, Ellipse, G, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import type { SkyBody } from "../ephemeris/SkyEphemerisService";
import { PLANET_COLORS, type ProjectFn, type SkyPalette, type SelectedObject } from "../SkyLensVisual";
import type { LabelPlacer } from "../labelLayout";
import { renderPlanetIllustration } from "./PlanetIllustrations";

type Props = {
  bodies: SkyBody[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  placeLabel?: LabelPlacer;
  showLabels?: boolean;
  useIllustrations?: boolean;
  zoom?: number;
  fullSphere?: boolean;
  onSelect: (object: SelectedObject) => void;
};

const PLANET_IDS = new Set(["mercury", "venus", "mars", "jupiter", "saturn"]);

// Restrained planet radii for a wide-field planetarium. The illustrations remain
// recognizable, but no object should dominate the full Sky Lens viewport.
//
// Nudged up ~10% on the disc and ~40% on the GLOW. The glow is doing the heavy lifting
// deliberately: a planet needs to out-present the stars around it, and a big soft halo
// reads as "bright object" far better than a big hard disc, which just reads as
// "cartoon". Discs stay small; the light around them grows.
const STYLE: Record<string, { disc: number; glow: number }> = {
  mercury: { disc: 8, glow: 17 }, // still the shy one — findable, never showy
  venus: { disc: 15, glow: 32 }, // brightest object after the Moon; unmistakable
  mars: { disc: 13, glow: 30 }, // the hero of this pass
  jupiter: { disc: 19, glow: 35 },
  saturn: { disc: 17, glow: 32 },
};

// Each planet gets its OWN halo colour. Previously every planet shared a single gold
// bloom, which is why Mars never read as red and why nothing separated from the star
// field. Colouring the halo is the single biggest legibility win here — Mars now sits
// in a warm rust glow, Venus in a cold platinum one, and the eye sorts them instantly.
const HALO: Record<string, string> = {
  mercury: "#C0C6D4",
  venus: "#FFFBEA",
  mars: "#FF5E2C",
  jupiter: "#EF9F27",
  saturn: "#D9A84E",
};

export function PlanetLayer({
  bodies,
  project,
  palette,
  nightMode,
  placeLabel,
  showLabels = true,
  useIllustrations = true,
  zoom = 1,
  onSelect,
}: Props) {
  // Floor lifted 0.9 → 1.0: at rest (zoom = 1) planets were rendering at 90% of their
  // nominal size, which is where a lot of the "planets get lost" problem came from.
  const planetScale = Math.min(1.45, Math.max(1.0, 1.0 + (zoom - 1) * 0.12));

  return (
    <G>
      <Defs>
        {/* Per-planet halos, built from HALO above. */}
        {Object.entries(HALO).map(([id, hue]) => (
          <RadialGradient key={id} id={`planetHalo-${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.3} />
            <Stop offset="26%" stopColor={hue} stopOpacity={0.26} />
            <Stop offset="58%" stopColor={hue} stopOpacity={0.1} />
            <Stop offset="100%" stopColor={hue} stopOpacity={0} />
          </RadialGradient>
        ))}
        {/* Night Mode keeps the flat-red discipline — one red halo, no colour. */}
        <RadialGradient id="planetHaloNight" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={palette.accent} stopOpacity={0.2} />
          <Stop offset="55%" stopColor={palette.accent} stopOpacity={0.07} />
          <Stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {bodies.map((body) => {
        if (!PLANET_IDS.has(body.id) || !body.aboveHorizon) return null;

        // POSITION IS SACRED. This projection call, and the x/y it yields, are
        // untouched by this pass — every change below is radius, colour or opacity.
        const point = project(body.azimuthDegrees, body.altitudeDegrees);
        if (!point.onScreen) return null;

        const style = STYLE[body.id] ?? { disc: 8, glow: 14 };
        const disc = style.disc * planetScale;
        const glow = style.glow * planetScale;
        const color = nightMode ? palette.accent : PLANET_COLORS[body.id] ?? palette.accent;
        const haloId = nightMode ? "planetHaloNight" : `planetHalo-${body.id}`;
        const { x, y } = point;

        const onPress = () => {
          onSelect({
            kind: "planet",
            id: body.id,
            name: body.name,
            subtitle: "Planet",
            facts: [
              ...(body.magnitude !== undefined
                ? [{ label: "Magnitude", value: body.magnitude.toFixed(1) }]
                : []),
              { label: "Azimuth", value: `${Math.round(body.azimuthDegrees)}°` },
              { label: "Altitude", value: `${Math.round(body.altitudeDegrees)}°` },
            ],
          });
        };

        return (
          <G key={body.id}>
            {/* Two-stage halo: a wide, very faint outer wash that lifts the planet off
                the star field, then a tighter, brighter inner bloom that gives it the
                "burning" quality a bright planet actually has to the naked eye. */}
            <Circle cx={x} cy={y} r={glow * 1.5} fill={`url(#${haloId})`} opacity={nightMode ? 0.1 : 0.3} />
            <Circle cx={x} cy={y} r={glow} fill={`url(#${haloId})`} opacity={nightMode ? 0.2 : 0.82} />

            {body.id === "saturn" && useIllustrations && (
              <G>
                <Ellipse
                  cx={x}
                  cy={y}
                  rx={disc * 2.1}
                  ry={disc * 0.62}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.1}
                  strokeOpacity={0.72}
                  rotation={-18}
                  originX={x}
                  originY={y}
                />
                <Ellipse
                  cx={x}
                  cy={y}
                  rx={disc * 1.68}
                  ry={disc * 0.5}
                  fill="none"
                  stroke="#FFF2CF"
                  strokeWidth={0.55}
                  strokeOpacity={0.5}
                  rotation={-18}
                  originX={x}
                  originY={y}
                />
              </G>
            )}

            {(() => {
              if (useIllustrations) {
                const illustration = renderPlanetIllustration(body.id, x, y, disc, nightMode);
                if (illustration) return illustration;
              }
              return <Circle cx={x} cy={y} r={disc} fill={color} />;
            })()}

            {!nightMode && (
              <Circle
                cx={x - disc * 0.3}
                cy={y - disc * 0.3}
                r={Math.max(1.2, disc * 0.16)}
                fill="#FFFFFF"
                opacity={0.42}
              />
            )}

            <Circle cx={x} cy={y} r={Math.max(disc + 14, 24)} fill="transparent" onPress={onPress} />

            {showLabels && (() => {
              const labelX = x + Math.max(disc * 1.25, 12);
              const labelPoint = placeLabel
                ? placeLabel(labelX, y + 4, body.name, 12)
                : { x: labelX, y: y + 4 };
              return (
                <G>
                  {/* Contrast without a hard plate behind the text: the label is drawn
                      twice — once as a soft dark outline, once as the fill on top. It
                      stays legible against a bright nebula or the Milky Way without
                      putting an opaque box on the sky. */}
                  <SvgText
                    x={labelPoint.x}
                    y={labelPoint.y}
                    fill="none"
                    stroke="#050914"
                    strokeWidth={2.6}
                    strokeOpacity={0.55}
                    fontSize={12}
                    fontWeight="700"
                  >
                    {body.name}
                  </SvgText>
                  <SvgText
                    x={labelPoint.x}
                    y={labelPoint.y}
                    fill={palette.starLabel}
                    fontSize={12}
                    fontWeight="700"
                    opacity={0.96}
                  >
                    {body.name}
                  </SvgText>
                </G>
              );
            })()}
          </G>
        );
      })}
    </G>
  );
}
