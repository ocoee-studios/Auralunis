import React from "react";
import { Circle, G, Text as SvgText } from "react-native-svg";
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
            {/* Glow ring */}
            <Circle cx={p.x} cy={p.y} r={9} fill={color} opacity={0.18} />
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
            <SvgText x={p.x + 9} y={p.y + 4} fill={palette.starLabel} fontSize={11} fontWeight="700">
              {body.name}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
