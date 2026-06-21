import React from "react";
import { G, Line, Text as SvgText } from "react-native-svg";
import type { HorizontalConstellation } from "../ephemeris/StarPositions";
import type { ProjectFn, SkyPalette, SelectedObject } from "../SkyLensVisual";

type Props = {
  constellations: HorizontalConstellation[];
  project: ProjectFn;
  box: { width: number; height: number };
  palette: SkyPalette;
  onSelect: (object: SelectedObject) => void;
};

export function ConstellationLayer({ constellations, project, box, palette, onSelect }: Props) {
  return (
    <G>
      {constellations.map((c) => {
        const projected = c.points.map((pt) => project(pt.azimuthDegrees, pt.altitudeDegrees));

        // Only draw a segment when both endpoints are in front of the camera AND
        // above the horizon — otherwise lines streak across the view or dive into
        // the ground for stars that have already set.
        const segments = c.lines
          .filter(
            ([i, j]) =>
              !projected[i].behind &&
              !projected[j].behind &&
              c.points[i].aboveHorizon &&
              c.points[j].aboveHorizon
          )
          .map(([i, j], idx) => {
            const a = projected[i];
            const b = projected[j];
            return (
              <G key={`${c.id}-l${idx}`}>
                {/* glow */}
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={palette.line} strokeWidth={4} strokeOpacity={0.18} strokeLinecap="round" />
                {/* crisp */}
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={palette.line} strokeWidth={1.4} strokeOpacity={0.92} strokeLinecap="round" />
              </G>
            );
          });

        if (segments.length === 0) return null;

        const centroid = project(c.centroid.azimuthDegrees, c.centroid.altitudeDegrees);
        const labelVisible =
          !centroid.behind &&
          centroid.x > -40 &&
          centroid.x < box.width + 40 &&
          centroid.y > -20 &&
          centroid.y < box.height + 20;

        return (
          <G key={c.id}>
            {segments}
            {labelVisible && (
              <SvgText
                x={centroid.x}
                y={centroid.y}
                fill={palette.conLabel}
                fontSize={11}
                fontWeight="700"
                textAnchor="middle"
                onPress={() =>
                  onSelect({
                    kind: "constellation",
                    id: c.id,
                    name: c.name,
                    subtitle: "Constellation",
                    facts: [{ label: "Best season", value: c.season }],
                    description: c.myth
                  })
                }
              >
                {c.name.toUpperCase()}
              </SvgText>
            )}
          </G>
        );
      })}
    </G>
  );
}
