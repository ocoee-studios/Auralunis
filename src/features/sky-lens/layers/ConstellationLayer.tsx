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
          .map(([i, j], idx) => (
            <Line
              key={`${c.id}-l${idx}`}
              x1={projected[i].x}
              y1={projected[i].y}
              x2={projected[j].x}
              y2={projected[j].y}
              stroke={palette.line}
              strokeWidth={1}
            />
          ));

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
