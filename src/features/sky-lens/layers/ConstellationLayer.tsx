import React from "react";
import { Circle, G, Line, Text as SvgText } from "react-native-svg";
import type { HorizontalConstellation } from "../ephemeris/StarPositions";
import { type ProjectFn, type SkyPalette, type SelectedObject } from "../SkyLensVisual";
import type { LabelPlacer } from "../labelLayout";

const GOLD = "#D9A84E";
// Constellation NAMES get a softer, warmer gold than the line work. The saturated
// #D9A84E reads as UI chrome when set as text; this is closer to engraved brass — it
// sits back into the sky instead of sitting on top of it.
const CON_LABEL_GOLD = "#C9A468";

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

            // LINE WORK STEPS BACK (−15% opacity, thinner). The figures were still reading
            // as a diagram drawn ON the sky rather than a constellation felt WITHIN it.
            // The stars are the heroes; the lines are only a hint that joins them.
            if (!showNodes) {
              return (
                <G key={`${c.id}-l${idx}`} opacity={belowHorizon && !fullSphere ? 0.15 : 1}>
                  <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={0.55} strokeOpacity={0.29} strokeLinecap="round" />
                </G>
              );
            }

            return (
              <G key={`${c.id}-l${idx}`} opacity={belowHorizon && !fullSphere ? 0.15 : 1}>
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={3} strokeOpacity={0.022} strokeLinecap="round" />
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={0.45} strokeOpacity={0.22} strokeLinecap="round" />
                <Line x1={ix0} y1={iy0} x2={ix1} y2={iy1} stroke={lineColor} strokeWidth={1} strokeOpacity={0.29} strokeLinecap="round" />
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
              // A REGION name, not an object name — so it must sit BELOW star and planet
              // labels in the visual hierarchy. Lighter weight (500 → 400), smaller
              // (11 → 10.5), fainter (0.42 → 0.36) and warmed into brass. Wider letter
              // spacing keeps it legible while it recedes: engraved, not printed.
              const label = c.name.toUpperCase();
              const position = placeLabel ? placeLabel(centroid.x, centroid.y, label, 10.5) : { x: centroid.x, y: centroid.y };
              return (
                <>
                  <SvgText
                    x={position.x}
                    y={position.y}
                    fill={nightMode ? palette.conLabel : CON_LABEL_GOLD}
                    fontSize={10.5}
                    fontWeight="400"
                    letterSpacing={2.6}
                    opacity={0.36}
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