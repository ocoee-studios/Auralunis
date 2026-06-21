import React from "react";
import { Circle, G, Text as SvgText } from "react-native-svg";
import type { HorizontalStar } from "../ephemeris/StarPositions";
import { magnitudeToRadius, starColor, type ProjectFn, type SkyPalette, type SelectedObject } from "../SkyLensVisual";

type Props = {
  stars: HorizontalStar[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  onSelect: (object: SelectedObject) => void;
};

// Named stars at or above this brightness get a text label; fainter ones render
// as dots only to avoid clutter.
const LABEL_MAG_LIMIT = 2.2;

export function StarLayer({ stars, project, palette, nightMode, onSelect }: Props) {
  return (
    <G>
      {stars.map((star) => {
        if (!star.aboveHorizon) return null;
        const p = project(star.azimuthDegrees, star.altitudeDegrees);
        if (!p.onScreen) return null;

        const r = magnitudeToRadius(star.magnitude);
        // Night Mode stays monochrome red for dark adaptation; otherwise stars
        // take their spectral color, and the brightest get a soft colored glow.
        const color = nightMode ? palette.star : starColor(star.id, star.magnitude);
        const bright = !nightMode && star.magnitude < 1.6;
        const labeled = star.name !== undefined && star.magnitude <= LABEL_MAG_LIMIT;

        return (
          <G key={star.id}>
            {/* Slightly larger invisible hit target for easy tapping */}
            <Circle
              cx={p.x}
              cy={p.y}
              r={Math.max(r + 6, 10)}
              fill="transparent"
              onPress={() =>
                onSelect({
                  kind: "star",
                  id: star.id,
                  name: star.name ?? "Star",
                  subtitle: star.name ? "Star" : undefined,
                  facts: [
                    { label: "Magnitude", value: star.magnitude.toFixed(2) },
                    { label: "Azimuth", value: `${Math.round(star.azimuthDegrees)}°` },
                    { label: "Altitude", value: `${Math.round(star.altitudeDegrees)}°` }
                  ]
                })
              }
            />
            {bright && <Circle cx={p.x} cy={p.y} r={r + 4} fill={color} opacity={0.22} />}
            <Circle cx={p.x} cy={p.y} r={r} fill={color} />
            {labeled && (
              <SvgText
                x={p.x + r + 3}
                y={p.y + 3}
                fill={palette.starLabel}
                fontSize={10}
                fontWeight="600"
              >
                {star.name}
              </SvgText>
            )}
          </G>
        );
      })}
    </G>
  );
}
