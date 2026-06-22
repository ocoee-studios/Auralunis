import React from "react";
import { Circle, G, Line, Text as SvgText } from "react-native-svg";
import type { ZodiacData } from "../ephemeris/Zodiac";
import { magnitudeToRadius, type ProjectFn, type SkyPalette, type SelectedObject } from "../SkyLensVisual";

type Props = {
  zodiac: ZodiacData;
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  sun?: { azimuthDegrees: number; altitudeDegrees: number; aboveHorizon: boolean } | null;
  birthSignId?: string | null;
  onSelect: (object: SelectedObject) => void;
};

const GOLD = "#D9A84E";
const CARDINALS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const cardinalFor = (az: number) => CARDINALS[Math.round(((az % 360) + 360) % 360 / 45) % 8];

// The 12 zodiac constellations along the ecliptic — the FREE "find your sign" layer.
// Gold lines (brighter for the sign the Sun is in), magnitude-sized star dots, the
// zodiac glyph + name at each center, faint boundary ticks between bands, a ☀ marker
// on the Sun, and an optional "Your sign" marker. Tap opens the sign's info card.
export function ZodiacLayer({ zodiac, project, palette, nightMode, sun, birthSignId, onSelect }: Props) {
  const lineColor = nightMode ? palette.line : GOLD;
  const symbolColor = nightMode ? palette.conLabel : GOLD;

  return (
    <G>
      {/* Boundary ticks — perpendicular to the ecliptic, very subtle */}
      {zodiac.boundaries.map((b, i) => {
        const a = project(b.a.azimuthDegrees, b.a.altitudeDegrees);
        const c = project(b.b.azimuthDegrees, b.b.altitudeDegrees);
        if (a.behind || c.behind) return null;
        return (
          <Line key={`zb-${i}`} x1={a.x} y1={a.y} x2={c.x} y2={c.y} stroke={GOLD} strokeWidth={1} strokeOpacity={0.08} strokeDasharray="3 5" />
        );
      })}

      {zodiac.signs.map((sign, idx) => {
        const isCurrent = !nightMode && idx === zodiac.sunSignIndex;
        const isBirth = !!birthSignId && sign.id === birthSignId;
        const proj = sign.starPositions.map((s) => project(s.azimuthDegrees, s.altitudeDegrees));
        const lineOpacity = isCurrent ? 0.8 : 0.5;

        // Stick-figure lines (both endpoints in front + above horizon).
        const segs = sign.lines
          .filter(([i, j]) =>
            proj[i] && proj[j] && !proj[i].behind && !proj[j].behind &&
            sign.starPositions[i]?.aboveHorizon && sign.starPositions[j]?.aboveHorizon)
          .map(([i, j], k) => (
            <Line key={`${sign.id}-l${k}`} x1={proj[i].x} y1={proj[i].y} x2={proj[j].x} y2={proj[j].y}
              stroke={lineColor} strokeWidth={isCurrent ? 1.6 : 1.2} strokeOpacity={lineOpacity} strokeLinecap="round" />
          ));

        // Star dots.
        const dots = sign.starPositions.map((s, k) => {
          if (!s.aboveHorizon || !proj[k] || !proj[k].onScreen) return null;
          const r = magnitudeToRadius(s.magnitude);
          return <Circle key={`${sign.id}-s${k}`} cx={proj[k].x} cy={proj[k].y} r={r} fill={nightMode ? palette.star : "#FFF1C4"} />;
        });

        const c = project(sign.center.azimuthDegrees, sign.center.altitudeDegrees);
        const centerVisible = !c.behind && sign.center.aboveHorizon;

        return (
          <G key={sign.id}>
            {segs}
            {dots}
            {centerVisible && (
              <G>
                {/* hit target */}
                <Circle cx={c.x} cy={c.y} r={26} fill="transparent" onPress={() => {
                  const where = sign.center.aboveHorizon ? `Visible (${cardinalFor(sign.center.azimuthDegrees)} sky)` : "Below horizon";
                  onSelect({
                    kind: "zodiac",
                    id: `zodiac-${sign.id}`,
                    name: `${sign.symbol}  ${sign.name}`,
                    subtitle: `Zodiac · ${sign.element} Sign`,
                    facts: [
                      { label: "Sun transits", value: sign.sunTransit },
                      { label: "Currently", value: where },
                      { label: "Brightest star", value: sign.brightestStar },
                    ],
                    description: sign.myth,
                  });
                }} />
                {/* glyph (brighter + glow when it's the current Sun sign) */}
                {isCurrent && <Circle cx={c.x} cy={c.y - 4} r={15} fill={GOLD} opacity={0.18} />}
                <SvgText x={c.x} y={c.y} textAnchor="middle" fontSize={isCurrent ? 19 : 16}
                  fill={symbolColor} opacity={isCurrent ? 0.95 : 0.4}>
                  {sign.symbol}
                </SvgText>
                <SvgText x={c.x} y={c.y + 15} textAnchor="middle" fontSize={9} fontWeight="700"
                  fill={symbolColor} opacity={isCurrent ? 0.9 : 0.5} letterSpacing={1}>
                  {sign.name.toUpperCase()}
                </SvgText>
                {isCurrent && (
                  <SvgText x={c.x} y={c.y + 27} textAnchor="middle" fontSize={8} fontWeight="800" fill={GOLD} opacity={0.85}>
                    ☀ Sun is here · {sign.name} season
                  </SvgText>
                )}
                {isBirth && (
                  <SvgText x={c.x} y={c.y - 22} textAnchor="middle" fontSize={8} fontWeight="800" fill="#FFE9B0" opacity={0.9}>
                    ✦ Your sign
                  </SvgText>
                )}
              </G>
            )}
          </G>
        );
      })}

      {/* The Sun's actual position marked on the ecliptic */}
      {sun && sun.aboveHorizon && !nightMode && (() => {
        const sp = project(sun.azimuthDegrees, sun.altitudeDegrees);
        if (sp.behind || !sp.onScreen) return null;
        return <SvgText x={sp.x} y={sp.y + 5} textAnchor="middle" fontSize={16}>☀</SvgText>;
      })()}
    </G>
  );
}
