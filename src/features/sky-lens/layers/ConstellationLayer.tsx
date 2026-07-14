import React from "react";
import { Circle, G, Line, Text as SvgText } from "react-native-svg";
import type { HorizontalConstellation } from "../ephemeris/StarPositions";
import { type ProjectFn, type SkyPalette, type SelectedObject } from "../SkyLensVisual";
import type { LabelPlacer } from "../labelLayout";

const GOLD = "#D9A84E";

type Props = {
  constellations: HorizontalConstellation[];
  project: ProjectFn;
  box: { width: number; height: number };
  palette: SkyPalette;
  nightMode: boolean;
  placeLabel?: LabelPlacer;
  showLabels?: boolean;
  showNodes?: boolean;
  fullSphere?: boolean;
  onSelect: (object: SelectedObject) => void;
};

export function ConstellationLayer({ constellations, project, box, palette, nightMode, placeLabel, showLabels = true, showNodes = true, fullSphere = false, onSelect }: Props) {
  return (
    <G>
      {constellations.map((c) => {
        const projected = c.points.map((pt) => project(pt.azimuthDegrees, pt.altitudeDegrees));
        const lineColor = nightMode ? palette.line : GOLD;

        const usedPts = new Set<number>();
        const segments = c.lines
          .filter(([i, j]) => {
            const a = projected[i];
            const b = projected[j];
            if (!a || !b || a.behind || b.behind) return false;
            const margin = 70;
            if (a.x < -margin || a.x > box.width + margin || a.y < -margin || a.y > box.height + margin) return false;
            if (b.x < -margin || b.x > box.width + margin || b.y < -margin || b.y > box.height + margin) return false;
            if (Math.hypot(b.x - a.x, b.y - a.y) > 260) return false;
            return true;
          })
          .map(([i, j], idx) => {
            usedPts.add(i);
            usedPts.add(j);
            const a = projected[i];
            const b = projected[j];
            const belowHorizon = !(c.points[i]?.aboveHorizon && c.points[j]?.aboveHorizon);
            const ix0 = a.x + (b.x - a.x) * 0.18;
            const iy0 = a.y + (b.y - a.y) * 0.18;
            const ix1 = a.x + (b.x - a.x) * 0.82;
            const iy1 = a.y + (b.y - a.y) * 0.82;

            if (!showNodes) {
              return (
                <G key={`${c.id}-l${idx}`} opacity={belowHorizon && !fullSphere ? 0.15 : 1}>
                  <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={0.65} strokeOpacity={0.34} strokeLinecap="round" />
                </G>
              );
            }

            return (
              <G key={`${c.id}-l${idx}`} opacity={belowHorizon && !fullSphere ? 0.15 : 1}>
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={3} strokeOpacity={0.025} strokeLinecap="round" />
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={0.5} strokeOpacity={0.26} strokeLinecap="round" />
                <Line x1={ix0} y1={iy0} x2={ix1} y2={iy1} stroke={lineColor} strokeWidth={1.15} strokeOpacity={0.34} strokeLinecap="round" />
              </G>
            );
          });

        if (segments.length === 0) return null;

        const nodes = showNodes ? [...usedPts].map((pointIndex) => {
          const point = projected[pointIndex];
          if (!point || point.behind) return null;
          const dim = !c.points[pointIndex]?.aboveHorizon;
          return (
            <G key={`${c.id}-n${pointIndex}`} opacity={dim && !fullSphere ? 0.15 : 1}>
              <Circle cx={point.x} cy={point.y} r={4.5} fill={lineColor} opacity={0.055} />
              <Circle cx={point.x} cy={point.y} r={1.2} fill={lineColor} opacity={0.72} />
            </G>
          );
        }) : null;

        const centroid = project(c.centroid.azimuthDegrees, c.centroid.altitudeDegrees);
        const labelVisible =
          showLabels &&
          !centroid.behind &&
          centroid.x > 14 &&
          centroid.x < box.width - 14 &&
          centroid.y > 38 &&
          centroid.y < box.height - 110;

        return (
          <G key={c.id}>
            {segments}
            {nodes}
            {labelVisible && (() => {
              const label = c.name.toUpperCase();
              const position = placeLabel ? placeLabel(centroid.x, centroid.y, label, 11) : { x: centroid.x, y: centroid.y };
              return (
                <>
                  <SvgText
                    x={position.x}
                    y={position.y}
                    fill={nightMode ? palette.conLabel : GOLD}
                    fontSize={11}
                    fontWeight="500"
                    letterSpacing={2.2}
                    opacity={0.42}
                    textAnchor="middle"
                  >
                    {label}
                  </SvgText>
                  <Circle
                    cx={position.x}
                    cy={position.y - 3}
                    r={26}
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
              );
            })()}
          </G>
        );
      })}
    </G>
  );
}