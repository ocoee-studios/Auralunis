import React from "react";
import { Circle, G, Line, Text as SvgText } from "react-native-svg";
import type { HorizontalConstellation } from "../ephemeris/StarPositions";
import { type ProjectFn, type SkyPalette, type SelectedObject } from "../SkyLensVisual";
import type { LabelPlacer } from "../labelLayout";

// AuraLunis brand gold — every other star app uses blue/white lines; we use gold.
const GOLD = "#D9A84E"; // rgb(217, 168, 78)

type Props = {
  constellations: HorizontalConstellation[];
  project: ProjectFn;
  box: { width: number; height: number };
  palette: SkyPalette;
  nightMode: boolean;
  placeLabel?: LabelPlacer;
  showLabels?: boolean; // false in cinematic Immersive Sky mode → gold threads only
  showNodes?: boolean; // premium: gold junction nodes + tapered glow lines. free: thin plain lines.
  fullSphere?: boolean; // Planetarium: show below-horizon figures at full brightness
  onSelect: (object: SelectedObject) => void;
};

export function ConstellationLayer({ constellations, project, box, palette, nightMode, placeLabel, showLabels = true, showNodes = true, fullSphere = false, onSelect }: Props) {
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
        const usedPts = new Set<number>();
        const segments = c.lines
          .filter(
            ([i, j]) =>
              projected[i] &&
              projected[j] &&
              !projected[i].behind &&
              !projected[j].behind
          )
          .map(([i, j], idx) => {
            usedPts.add(i);
            usedPts.add(j);
            const a = projected[i];
            const b = projected[j];
            const belowH = !(c.points[i]?.aboveHorizon && c.points[j]?.aboveHorizon);
            // TAPERED THREAD — a fine full-length line (fading at the joints) under a
            // thicker INSET centre segment, so each stroke is wide in the middle and
            // fine where it meets a star. Reads handcrafted, not a uniform CAD line.
            const ix0 = a.x + (b.x - a.x) * 0.16, iy0 = a.y + (b.y - a.y) * 0.16;
            const ix1 = a.x + (b.x - a.x) * 0.84, iy1 = a.y + (b.y - a.y) * 0.84;
            // Free tier: a single thin, plain gold line — a clean star-map figure
            // without the handcrafted glow/taper that premium gets.
            if (!showNodes) {
              return (
                <G key={`${c.id}-l${idx}`} opacity={belowH && !fullSphere ? 0.2 : 1}>
                  <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={0.8} strokeOpacity={0.5} strokeLinecap="round" />
                </G>
              );
            }
            return (
              <G key={`${c.id}-l${idx}`} opacity={belowH && !fullSphere ? 0.2 : 1}>
                {/* soft gold glow behind the line (subtle so it doesn't compete) */}
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={4} strokeOpacity={0.06} strokeLinecap="round" />
                {/* fine tapered endpoints */}
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lineColor} strokeWidth={0.6} strokeOpacity={0.4} strokeLinecap="round" />
                {/* fuller centre */}
                <Line x1={ix0} y1={iy0} x2={ix1} y2={iy1} stroke={lineColor} strokeWidth={1.6} strokeOpacity={0.5} strokeLinecap="round" />
              </G>
            );
          });

        if (segments.length === 0) return null;

        // GOLD NODES — a tiny luminous dot at each star where lines meet, with a soft
        // glow, so the figure reads as a luxury instrument panel rather than a diagram.
        // Premium only; free tier shows the bare lines.
        const nodes = showNodes ? [...usedPts].map((pi) => {
          const pt = projected[pi];
          if (!pt || pt.behind) return null;
          const dim = !c.points[pi]?.aboveHorizon;
          return (
            <G key={`${c.id}-n${pi}`} opacity={dim && !fullSphere ? 0.2 : 1}>
              <Circle cx={pt.x} cy={pt.y} r={6} fill={lineColor} opacity={0.1} />
              <Circle cx={pt.x} cy={pt.y} r={1.5} fill={lineColor} opacity={0.9} />
            </G>
          );
        }) : null;

        const centroid = project(c.centroid.azimuthDegrees, c.centroid.altitudeDegrees);
        const labelVisible =
          showLabels &&
          !centroid.behind &&
          centroid.x > -40 &&
          centroid.x < box.width + 40 &&
          centroid.y > -20 &&
          centroid.y < box.height + 20;

        return (
          <G key={c.id}>
            {segments}
            {nodes}
            {labelVisible && (() => {
              const lp = placeLabel ? placeLabel(centroid.x, centroid.y, c.name.toUpperCase(), 13) : { x: centroid.x, y: centroid.y };
              return (
                <>
                  <SvgText
                    x={lp.x}
                    y={lp.y}
                    fill={nightMode ? palette.conLabel : GOLD}
                    fontSize={13}
                    fontWeight="400"
                    letterSpacing={3.5}
                    opacity={0.5}
                    textAnchor="middle"
                  >
                    {c.name.toUpperCase()}
                  </SvgText>
                  {/* generous transparent tap target over the label (≈20px hit area) */}
                  <Circle
                    cx={lp.x}
                    cy={lp.y - 3}
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
              );
            })()}
          </G>
        );
      })}
    </G>
  );
}
