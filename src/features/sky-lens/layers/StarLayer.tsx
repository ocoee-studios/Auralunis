import React from "react";
import { Circle, G, Line, Text as SvgText } from "react-native-svg";
import type { HorizontalStar } from "../ephemeris/StarPositions";
import { magnitudeToRadius, starColor, STAR_FEATURES, focusFactor, type ProjectFn, type SkyPalette, type SelectedObject, type FocusZone } from "../SkyLensVisual";

type Props = {
  stars: HorizontalStar[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  focus?: FocusZone;
  showcase?: FocusZone; // auto-lit hero region (e.g. Orion in view) — stronger star glow
  onSelect: (object: SelectedObject) => void;
};

// Named stars at or above this brightness get a text label; fainter ones render
// as dots only to avoid clutter.
const LABEL_MAG_LIMIT = 2.2;

export function StarLayer({ stars, project, palette, nightMode, focus = null, showcase = null, onSelect }: Props) {
  return (
    <G>
      {stars.map((star) => {
        // Render all stars, dim those below horizon
        const belowHorizon = !star.aboveHorizon;
        const p = project(star.azimuthDegrees, star.altitudeDegrees);
        if (!p.onScreen) return null;

        const feature = nightMode ? undefined : STAR_FEATURES[star.id];
        // focus mode (tap) + auto showcase region (e.g. Orion in view): stars swell + glow
        const ff = focusFactor(p.x, p.y, focus);
        const sf = focusFactor(p.x, p.y, showcase);
        const lit = Math.max(ff, sf); // combined "in a lit region" strength
        const r = (feature ? feature.radius : magnitudeToRadius(star.magnitude)) * (1 + ff * 0.4 + sf * 0.3);
        // Night Mode stays monochrome red for dark adaptation; otherwise stars
        // take their spectral color, and the brightest get a soft colored glow.
        const color = nightMode ? palette.star : starColor(star.id, star.magnitude);
        const brightest = !nightMode && star.magnitude < 1.5; // Vega, Deneb, Sirius… — the showpieces
        const bright = !nightMode && star.magnitude < 2.0;
        const glint = !nightMode && star.magnitude < 1.2; // diffraction spike on the showpiece stars
        const spike = r + 9;
        const labeled = star.name !== undefined && star.magnitude <= LABEL_MAG_LIMIT;

        return (
          <G key={star.id} opacity={belowHorizon ? 0.25 : 1}>
            {/* Bigger invisible hit target — 24px minimum for easy tapping with AR jitter */}
            <Circle
              cx={p.x}
              cy={p.y}
              r={Math.max(r + 16, 24)}
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
            {/* focus/showcase aura: any star in a lit region gets a soft halo */}
            {lit > 0 && <Circle cx={p.x} cy={p.y} r={(r + 9) * (1 + lit)} fill={color} opacity={0.16 * lit} />}
            {/* hand-tuned ember glow for showpiece stars — grows in a showcase region
                so Betelgeuse/Rigel blaze when Orion is on screen */}
            {feature && <Circle cx={p.x} cy={p.y} r={feature.glowRadius * (1 + sf * 1.2)} fill={feature.glowColor} />}
            {/* wide 8px glow ring so the magnitude-0 stars genuinely POP */}
            {brightest && <Circle cx={p.x} cy={p.y} r={r + 8} fill={color} opacity={0.1} />}
            {bright && <Circle cx={p.x} cy={p.y} r={r + 6} fill={color} opacity={0.16} />}
            {bright && <Circle cx={p.x} cy={p.y} r={r + 2.5} fill={color} opacity={0.32} />}
            {glint && (
              <>
                <Line x1={p.x - spike} y1={p.y} x2={p.x + spike} y2={p.y} stroke={color} strokeWidth={0.9} strokeOpacity={0.5} strokeLinecap="round" />
                <Line x1={p.x} y1={p.y - spike} x2={p.x} y2={p.y + spike} stroke={color} strokeWidth={0.9} strokeOpacity={0.5} strokeLinecap="round" />
              </>
            )}
            <Circle cx={p.x} cy={p.y} r={r} fill={color} />
            {/* white-hot core for the showpiece stars */}
            {glint && <Circle cx={p.x} cy={p.y} r={Math.max(r - 1, 1)} fill="#FFFFFF" opacity={0.85} />}
            {labeled && (
              <SvgText
                x={p.x + r + 3}
                y={p.y + 3}
                fill={palette.starLabel}
                fontSize={13}
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
