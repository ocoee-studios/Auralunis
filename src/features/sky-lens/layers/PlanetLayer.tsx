import React from "react";
import { Circle, Ellipse, G, Text as SvgText } from "react-native-svg";
import type { SkyBody } from "../ephemeris/SkyEphemerisService";
import { PLANET_COLORS, type ProjectFn, type SkyPalette, type SelectedObject } from "../SkyLensVisual";

type Props = {
  bodies: SkyBody[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  onSelect: (object: SelectedObject) => void;
};

const PLANET_IDS = new Set(["mercury", "venus", "mars", "jupiter", "saturn"]);

export function PlanetLayer({ bodies, project, palette, nightMode, onSelect }: Props) {
  return (
    <G>
      {bodies.map((body) => {
        if (!PLANET_IDS.has(body.id) || !body.aboveHorizon) return null;
        const p = project(body.azimuthDegrees, body.altitudeDegrees);
        if (!p.onScreen) return null;

        const color = nightMode ? palette.accent : PLANET_COLORS[body.id] ?? palette.accent;

        return (
          <G key={body.id}>
            {/* Two-ring glow */}
            <Circle cx={p.x} cy={p.y} r={12} fill={color} opacity={0.14} />
            <Circle cx={p.x} cy={p.y} r={8} fill={color} opacity={0.28} />
            {/* Saturn's ring */}
            {body.id === "saturn" && (
              <Ellipse
                cx={p.x}
                cy={p.y}
                rx={10.5}
                ry={3.4}
                fill="none"
                stroke={color}
                strokeWidth={1.4}
                strokeOpacity={0.9}
                rotation={-18}
                originX={p.x}
                originY={p.y}
              />
            )}
            <Circle
              cx={p.x}
              cy={p.y}
              r={5}
              fill={color}
              onPress={() =>
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
                    { label: "Altitude", value: `${Math.round(body.altitudeDegrees)}°` }
                  ]
                })
              }
            />
            {/* specular highlight for a 3-D feel */}
            {!nightMode && <Circle cx={p.x - 1.4} cy={p.y - 1.4} r={1.6} fill="#FFFFFF" opacity={0.5} />}
            <SvgText x={p.x + 9} y={p.y + 4} fill={palette.starLabel} fontSize={11} fontWeight="700">
              {body.name}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
