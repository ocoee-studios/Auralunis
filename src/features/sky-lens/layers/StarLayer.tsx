import React from "react";
import { Circle, G, Line, Text as SvgText } from "react-native-svg";
import type { HorizontalStar } from "../ephemeris/StarPositions";
import { magnitudeToRadius, starColor, warmShift, STAR_FEATURES, focusFactor, type ProjectFn, type SkyPalette, type SelectedObject, type FocusZone } from "../SkyLensVisual";
import { getExtinctionWarmth } from "@/services/SkyQualityService";
import type { LabelPlacer } from "../labelLayout";

type Props = {
  stars: HorizontalStar[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  focus?: FocusZone;
  showcase?: FocusZone; // auto-lit hero region (e.g. Orion in view) — stronger star glow
  placeLabel?: LabelPlacer;
  labelMagLimit?: number; // progressive reveal: raised when zoomed so more labels appear
  showLabels?: boolean; // false in cinematic Immersive Sky mode → dots only, no text
  extinction?: boolean; // warm low-altitude stars toward orange (atmospheric extinction)
  bloom?: boolean; // premium: bright stars bloom (glow rings + diffraction spikes). free: clean dots.
  fullSphere?: boolean; // Planetarium: show below-horizon stars at full brightness (no dim/cull)
  onSelect: (object: SelectedObject) => void;
};

// Named stars at or above this brightness get a text label; fainter ones render
// as dots only to avoid clutter.
const LABEL_MAG_LIMIT = 2.2;

// deterministic per-star hash → a tiny, repeatable wobble so each showpiece bloom is
// a slightly different soft shape (feathered, not an identical perfect circle).
const hashStar = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

export function StarLayer({ stars, project, palette, nightMode, focus = null, showcase = null, placeLabel, labelMagLimit = LABEL_MAG_LIMIT, showLabels = true, extinction = false, bloom = true, fullSphere = false, onSelect }: Props) {
  return (
    <G>
      {stars.map((star) => {
        // Render all stars, dim those below horizon
        const belowHorizon = !star.aboveHorizon;
        if (belowHorizon && !fullSphere && star.altitudeDegrees < -30) return null;
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
        const baseColor = nightMode ? palette.star : starColor(star.id, star.magnitude);
        // Atmospheric extinction: stars low on the horizon redden (more air in the
        // line of sight). Skipped in Night Mode (monochrome red for dark adaptation).
        const color = extinction && !nightMode ? warmShift(baseColor, getExtinctionWarmth(star.altitudeDegrees)) : baseColor;
        // Bloom is premium. EVERY star mag 2.0 or brighter gets a soft luminous bloom
        // in its spectral colour — so the bright stars are the heroes, not just the
        // hand-listed showpieces. Free keeps the spectral disc, no bloom.
        const bloomOn = bloom && !nightMode && star.magnitude <= 2.0;
        const glint = bloom && !nightMode && star.magnitude < 1.3; // diffraction spikes on the very brightest
        // Bloom radius: hand-tuned for the showpieces, else derived from magnitude
        // (brighter = wider glow). mag0 ≈ 17px, mag1 ≈ 12.5px, mag2 ≈ 8px.
        const glowR = (feature ? feature.glowRadius : Math.max(8, 17 - star.magnitude * 4.5)) * (1 + sf * 0.8);
        const spike = r + 9;
        const labeled = showLabels && star.name !== undefined && star.magnitude <= labelMagLimit;

        return (
          <G key={star.id} opacity={belowHorizon && !fullSphere ? 0.25 : 1}>
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
            {/* STAR BLOOM — every bright star (mag ≤ 2) gets a soft, feathered luminous
                glow in its spectral colour: a wide faint aura (depth) melting into a
                brighter inner glow, with a tiny per-star offset so each is organic. Soft
                light, never a lens flare. This is what makes the bright stars the heroes. */}
            {bloomOn && (() => {
              const h = hashStar(star.id);
              const ox = ((h % 7) - 3) * 0.07, oy = (((h >> 3) % 7) - 3) * 0.07;
              return (
                <G>
                  <Circle cx={p.x + glowR * ox} cy={p.y + glowR * oy} r={glowR * 1.4} fill={color} opacity={0.04} />
                  <Circle cx={p.x} cy={p.y} r={glowR} fill={color} opacity={0.09} />
                  <Circle cx={p.x} cy={p.y} r={glowR * 0.62} fill={color} opacity={0.17} />
                  <Circle cx={p.x} cy={p.y} r={glowR * 0.36} fill={color} opacity={0.28} />
                </G>
              );
            })()}
            {glint && (
              <>
                {/* tapered 4-point diffraction — a faint wide underlay glow + a crisp
                    narrow core, so the spikes shimmer softly instead of reading as hard
                    cross-hairs (premium 'jewel' look on Sirius/Vega/etc.) */}
                <Line x1={p.x - spike * 1.18} y1={p.y} x2={p.x + spike * 1.18} y2={p.y} stroke={color} strokeWidth={2.4} strokeOpacity={0.1} strokeLinecap="round" />
                <Line x1={p.x} y1={p.y - spike * 1.18} x2={p.x} y2={p.y + spike * 1.18} stroke={color} strokeWidth={2.4} strokeOpacity={0.1} strokeLinecap="round" />
                <Line x1={p.x - spike} y1={p.y} x2={p.x + spike} y2={p.y} stroke={color} strokeWidth={0.8} strokeOpacity={0.42} strokeLinecap="round" />
                <Line x1={p.x} y1={p.y - spike} x2={p.x} y2={p.y + spike} stroke={color} strokeWidth={0.8} strokeOpacity={0.42} strokeLinecap="round" />
              </>
            )}
            <Circle cx={p.x} cy={p.y} r={r} fill={color} />
            {/* luminous white-hot core — the "tiny diamond" centre. Showpieces get a
                brighter core; other bright stars a subtle one so they read as light,
                not a flat colour disc. */}
            {bloomOn && !glint && <Circle cx={p.x} cy={p.y} r={Math.max(r - 1.5, 0.9)} fill="#FFFFFF" opacity={0.6} />}
            {glint && <Circle cx={p.x} cy={p.y} r={Math.max(r - 1, 1)} fill="#FFFFFF" opacity={0.9} />}
            {labeled && (() => {
              const lp = placeLabel ? placeLabel(p.x + r + 3, p.y + 3, star.name ?? "", 13) : { x: p.x + r + 3, y: p.y + 3 };
              return (
                <SvgText x={lp.x} y={lp.y} fill={palette.starLabel} fontSize={13} fontWeight="500" opacity={0.9}>
                  {star.name}
                </SvgText>
              );
            })()}
          </G>
        );
      })}
    </G>
  );
}
