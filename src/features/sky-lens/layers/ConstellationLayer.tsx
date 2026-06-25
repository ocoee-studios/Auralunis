import React from "react";
import { Circle, G, Line, Text as SvgText } from "react-native-svg";
import type { HorizontalConstellation } from "../ephemeris/StarPositions";
import { type ProjectFn, type SkyPalette, type SelectedObject } from "../SkyLensVisual";

// AuraLunis brand gold — every other star app uses blue/white lines; we use gold.
const GOLD = "#D9A84E"; // rgb(217, 168, 78)

type Props = {
  constellations: HorizontalConstellation[];
  project: ProjectFn;
  box: { width: number; height: number };
  palette: SkyPalette;
  nightMode: boolean;
  onSelect: (object: SelectedObject) => void;
};

export function ConstellationLayer({ constellations, project, box, palette, nightMode, onSelect }: Props) {
  return (
    <G>
      {constellations.map((c) => {
        const projected = c.points.map((pt) => project(pt.azimuthDegrees, pt.altitudeDegrees));
        // Brand gold for every figure (Night Mode stays dark-adapted red) — no
        // rainbow tints, no box shapes, just gold lines connecting the stars.
        const lineColor = nightMode ? palette.line : GOLD;

        // Only draw a segment when both endpoints are in front of the camera AND
        // above the horizon — otherwise lines streak across the view or dive into
        // the ground for stars that have already set.
        const segments = c.lines
          .filter(
            ([i, j]) =>
              projected[i] &&
              projected[j] &&
              !projected[i].behind &&
              !projected[j].behind
          )
          .map(([i, j], idx) => {
            const a = projected[i];
            const b = projected[j];
            const belowH = !(c.points[i]?.aboveHorizon && c.points[j]?.aboveHorizon);
            return (
              <G key={`${c.id}-l${idx}`} opacity={belowH ? 0.2 : 1}>
<<<<<<< Updated upstream
                {/* soft 4px gold glow behind the line (dialed back ~18% per feedback) */}
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={4} strokeOpacity={0.065} strokeLinecap="round" />
                {/* crisp gold thread — subtler so it doesn't compete with the real sky */}
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={1.2} strokeOpacity={0.5} strokeLinecap="round" />
=======
                {/* soft 4px gold glow behind the line */}
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={4} strokeOpacity={0.06} strokeLinecap="round" />
                {/* crisp gold thread — rgba(217,168,78,0.6) */}
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={1.2} strokeOpacity={0.45} strokeLinecap="round" />
>>>>>>> Stashed changes
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
              <>
                <SvgText
                  x={centroid.x}
                  y={centroid.y}
                  fill={nightMode ? palette.conLabel : GOLD}
                  fontSize={13}
                  fontWeight="700"
                  letterSpacing={2}
                  textAnchor="middle"
                >
                  {c.name.toUpperCase()}
                </SvgText>
                {/* generous transparent tap target over the label (≈20px hit area) */}
                <Circle
                  cx={centroid.x}
                  cy={centroid.y - 3}
                  r={32}
                  fill="transparent"
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
                />
              </>
            )}
          </G>
        );
      })}
    </G>
  );
}
