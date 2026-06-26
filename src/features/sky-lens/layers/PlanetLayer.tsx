import React from "react";
import { Circle, Ellipse, G, Line, Text as SvgText } from "react-native-svg";
import type { SkyBody } from "../ephemeris/SkyEphemerisService";
import { PLANET_COLORS, type ProjectFn, type SkyPalette, type SelectedObject } from "../SkyLensVisual";
import type { LabelPlacer } from "../labelLayout";
import { renderPlanetIllustration } from "./PlanetIllustrations";

type Props = {
  bodies: SkyBody[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  placeLabel?: LabelPlacer;
  showLabels?: boolean; // false in cinematic Immersive Sky mode → bodies only, no names
  useIllustrations?: boolean; // premium: Jupiter bands, Saturn rings, moons, auras. free: colored dots.
  fullSphere?: boolean; // Planetarium: show below-horizon planets at full brightness
  onSelect: (object: SelectedObject) => void;
};

const PLANET_IDS = new Set(["mercury", "venus", "mars", "jupiter", "saturn"]);

// Per-planet "personality": disc radius + glow size. Bumped ~2.5× (SkyView-parity
// pass) so planets read as prominent spheres, not small illustrations: Jupiter 45px,
// Saturn 38px (+ rings beyond), Venus 32, Mars 25, Mercury 15. The SVG illustrations
// (bands/rings/markings) are vector, so they scale up cleanly. Glows held to ≤1.2× the
// disc so the BODY leads, not fog (tighter than before since the bodies are big now).
const STYLE: Record<string, { disc: number; glow: number }> = {
  venus: { disc: 32, glow: 38 },
  jupiter: { disc: 45, glow: 54 },
  saturn: { disc: 38, glow: 45 },
  mars: { disc: 25, glow: 30 },
  mercury: { disc: 15, glow: 18 },
};

// Galilean moons — offsets as MULTIPLES of the disc radius (× d at render) so they sit
// just outside Jupiter's much larger disc, scattered like the real set along the plane.
const JUPITER_MOONS = [1.45, 2.05, -1.55, -2.2];

export function PlanetLayer({ bodies, project, palette, nightMode, placeLabel, showLabels = true, useIllustrations = true, fullSphere = false, onSelect }: Props) {
  return (
    <G>
      {bodies.map((body) => {
        if (!PLANET_IDS.has(body.id)) return null;
        const belowHorizon = !body.aboveHorizon;
        const p = project(body.azimuthDegrees, body.altitudeDegrees);
        if (!p.onScreen) return null;

        const color = nightMode ? palette.accent : PLANET_COLORS[body.id] ?? palette.accent;
        const st = STYLE[body.id] ?? { disc: 5, glow: 12 };
        const { x, y } = p;
        const d = st.disc;

        const onPress = () =>
          onSelect({
            kind: "planet",
            id: body.id,
            name: body.name,
            subtitle: "Planet",
            facts: [
              ...(body.magnitude !== undefined ? [{ label: "Magnitude", value: body.magnitude.toFixed(1) }] : []),
              { label: "Azimuth", value: `${Math.round(body.azimuthDegrees)}°` },
              { label: "Altitude", value: `${Math.round(body.altitudeDegrees)}°` }
            ]
          });

        return (
          <G key={body.id} opacity={belowHorizon && !fullSphere ? 0.2 : 1}>
            {/* SCATTERING — ultra-faint outermost halo (~3× the disc) so the planet's
                light feels like it scatters into space around it, not a hard cutout. */}
            <Circle cx={x} cy={y} r={d * 3} fill={color} opacity={0.02} />
            {/* base glow / BLOOM */}
            <Circle cx={x} cy={y} r={st.glow} fill={color} opacity={0.12} />
            <Circle cx={x} cy={y} r={st.glow * 0.6} fill={color} opacity={0.26} />

            {/* Mars — deep red atmospheric aura (recognition: the red planet) */}
            {useIllustrations && body.id === "mars" && !nightMode && (
              <>
                <Circle cx={x} cy={y} r={st.glow * 2.0} fill="#C8341A" opacity={0.08} />
                <Circle cx={x} cy={y} r={st.glow * 1.25} fill="#FF5A33" opacity={0.16} />
              </>
            )}

            {/* Jupiter — tighter golden glow (crisper per feedback) */}
            {useIllustrations && body.id === "jupiter" && !nightMode && (
              <Circle cx={x} cy={y} r={st.glow * 1.3} fill="#EBB44E" opacity={0.11} />
            )}

            {/* Jupiter — the four GALILEAN MOONS strung along the equatorial plane (a
                slight tilt), the detail that makes Jupiter instantly recognisable in a
                telescope/binoculars. Tiny bright pinpoints just off the disc. */}
            {useIllustrations && body.id === "jupiter" && !nightMode &&
              JUPITER_MOONS.map((mf, idx) => (
                <Circle key={`jmoon-${idx}`} cx={x + mf * d} cy={y - mf * d * 0.12} r={Math.max(1.5, d * 0.05)} fill="#FFF8E8" opacity={0.92} />
              ))}

            {/* Venus — tighter pearl halo + diffraction glints (crisper per feedback) */}
            {useIllustrations && body.id === "venus" && !nightMode && (
              <>
                <Circle cx={x} cy={y} r={st.glow * 1.9} fill="#FBF3DC" opacity={0.06} />
                <Circle cx={x} cy={y} r={st.glow * 1.2} fill="#FFFFFF" opacity={0.12} />
                <Line x1={x - d * 1.05} y1={y} x2={x + d * 1.05} y2={y} stroke="#FFF6D6" strokeWidth={Math.max(0.8, d * 0.035)} strokeOpacity={0.55} strokeLinecap="round" />
                <Line x1={x} y1={y - d * 1.05} x2={x} y2={y + d * 1.05} stroke="#FFF6D6" strokeWidth={Math.max(0.8, d * 0.035)} strokeOpacity={0.55} strokeLinecap="round" />
              </>
            )}

            {/* Saturn — ring system behind the disc: A ring, a dark CASSINI DIVISION,
                then the brighter B ring, with a pearly shimmer highlight. The Cassini
                gap is what makes Saturn read as Saturn and not "a dot with a line". */}
            {useIllustrations && body.id === "saturn" && (
              <G>
                {/* soft golden glow cradling the rings */}
                <Ellipse cx={x} cy={y} rx={d * 2.7} ry={d * 0.85} fill="#E8C77E" opacity={0.08} rotation={-18} originX={x} originY={y} />
                {/* A ring (outer) */}
                <Ellipse cx={x} cy={y} rx={d * 2.2} ry={d * 0.66} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.9} rotation={-18} originX={x} originY={y} />
                {/* Cassini division — a dark gap carved between A and B rings */}
                <Ellipse cx={x} cy={y} rx={d * 1.96} ry={d * 0.588} fill="none" stroke="#080B18" strokeWidth={0.9} strokeOpacity={0.85} rotation={-18} originX={x} originY={y} />
                {/* B ring (inner, brighter) */}
                <Ellipse cx={x} cy={y} rx={d * 1.72} ry={d * 0.516} fill="none" stroke={color} strokeWidth={1.2} strokeOpacity={0.62} rotation={-18} originX={x} originY={y} />
                {/* shimmer — a bright pearly highlight pass along the outer ring */}
                {!nightMode && (
                  <Ellipse cx={x} cy={y} rx={d * 2.2} ry={d * 0.66} fill="none" stroke="#FFF6E0" strokeWidth={0.6} strokeOpacity={0.7} rotation={-18} originX={x} originY={y} />
                )}
              </G>
            )}

            {/* Rich planet illustrations for major planets (premium). Free tier falls
                through to the basic colored disc below. */}
            {(() => {
              if (useIllustrations) {
                const ill = renderPlanetIllustration(body.id, x, y, d, nightMode);
                if (ill) return ill;
              }
              return (
                <G>
                  <Circle cx={x} cy={y} r={d} fill={color} />
                  {!nightMode && <Circle cx={x - d * 0.3} cy={y - d * 0.3} r={Math.max(1.3, d * 0.3)} fill="#FFFFFF" opacity={0.5} />}
                </G>
              );
            })()}

            {/* ATMOSPHERE — a thin color-matched limb ring hugging the disc, the
                terminator-glow that makes the body read as a lit sphere in space
                rather than a flat dot. Above the illustration so it rims the planet. */}
            {!nightMode && <Circle cx={x} cy={y} r={d + 1} fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.2} />}

            {/* generous transparent tap target on top (≈15px beyond the disc) */}
            <Circle cx={x} cy={y} r={Math.max(d + 18, 28)} fill="transparent" onPress={onPress} />

            {showLabels && (() => {
              const lx = x + st.glow * 0.6 + 4;
              const lp = placeLabel ? placeLabel(lx, y + 4, body.name, 14) : { x: lx, y: y + 4 };
              return (
                <SvgText x={lp.x} y={lp.y} fill={palette.starLabel} fontSize={14} fontWeight="700">
                  {body.name}
                </SvgText>
              );
            })()}
          </G>
        );
      })}
    </G>
  );
}
