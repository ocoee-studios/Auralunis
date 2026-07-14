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
const STYLE: Record<string, { disc: number; glow: number }> = {
  mercury: { disc: 7, glow: 12 },
  venus: { disc: 14, glow: 22 },
  mars: { disc: 12, glow: 19 },
  jupiter: { disc: 18, glow: 27 },
  saturn: { disc: 16, glow: 24 },
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
  const planetScale = Math.min(1.35, Math.max(0.9, 0.9 + (zoom - 1) * 0.12));

  return (
    <G>
      <Defs>
        <RadialGradient id="planetSoftBloom" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF4D6" stopOpacity={0.22} />
          <Stop offset="48%" stopColor="#E8C77E" stopOpacity={0.08} />
          <Stop offset="100%" stopColor="#D9A84E" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {bodies.map((body) => {
        if (!PLANET_IDS.has(body.id) || !body.aboveHorizon) return null;

        const point = project(body.azimuthDegrees, body.altitudeDegrees);
        if (!point.onScreen) return null;

        const style = STYLE[body.id] ?? { disc: 8, glow: 14 };
        const disc = style.disc * planetScale;
        const glow = style.glow * planetScale;
        const color = nightMode ? palette.accent : PLANET_COLORS[body.id] ?? palette.accent;
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
            <Circle cx={x} cy={y} r={glow} fill="url(#planetSoftBloom)" opacity={nightMode ? 0.18 : 0.7} />

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
                <SvgText
                  x={labelPoint.x}
                  y={labelPoint.y}
                  fill={palette.starLabel}
                  fontSize={12}
                  fontWeight="700"
                  opacity={0.86}
                >
                  {body.name}
                </SvgText>
              );
            })()}
          </G>
        );
      })}
    </G>
  );
}
