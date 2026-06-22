import React from "react";
import { Circle, Ellipse, G, Line, Text as SvgText } from "react-native-svg";
import type { SkyBody } from "../ephemeris/SkyEphemerisService";
import { PLANET_COLORS, type ProjectFn, type SkyPalette, type SelectedObject } from "../SkyLensVisual";

type Props = {
  bodies: SkyBody[];
  project: ProjectFn;
  palette: SkyPalette;
  nightMode: boolean;
  onSelect: (object: SelectedObject) => void;
};

const PLANET_IDS = new Set(["mercury", "venus", "mars", "jupiter", "saturn"]);

// Per-planet "personality": disc radius + glow size. Brighter planets read bigger.
const STYLE: Record<string, { disc: number; glow: number }> = {
  venus: { disc: 6, glow: 18 },
  jupiter: { disc: 6, glow: 13 },
  saturn: { disc: 5, glow: 12 },
  mars: { disc: 4.5, glow: 14 },
  mercury: { disc: 3.5, glow: 8 },
};

// Galilean moons — small offsets along the ring plane, scattered like the real set.
const JUPITER_MOONS = [9, 14, -11, -17];

export function PlanetLayer({ bodies, project, palette, nightMode, onSelect }: Props) {
  return (
    <G>
      {bodies.map((body) => {
        if (!PLANET_IDS.has(body.id) || !body.aboveHorizon) return null;
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
          <G key={body.id}>
            {/* base glow */}
            <Circle cx={x} cy={y} r={st.glow} fill={color} opacity={0.12} />
            <Circle cx={x} cy={y} r={st.glow * 0.6} fill={color} opacity={0.26} />

            {/* Mars — fiery ember halo */}
            {body.id === "mars" && !nightMode && (
              <Circle cx={x} cy={y} r={st.glow * 1.25} fill="#FF5A33" opacity={0.12} />
            )}

            {/* Venus — brilliance: white-gold bloom + diffraction glints */}
            {body.id === "venus" && !nightMode && (
              <>
                <Circle cx={x} cy={y} r={st.glow * 1.4} fill="#FFFFFF" opacity={0.1} />
                <Line x1={x - 13} y1={y} x2={x + 13} y2={y} stroke="#FFF6D6" strokeWidth={0.8} strokeOpacity={0.55} strokeLinecap="round" />
                <Line x1={x} y1={y - 13} x2={x} y2={y + 13} stroke="#FFF6D6" strokeWidth={0.8} strokeOpacity={0.55} strokeLinecap="round" />
              </>
            )}

            {/* Saturn — ring system behind the disc */}
            {body.id === "saturn" && (
              <G>
                <Ellipse cx={x} cy={y} rx={d * 2.2} ry={d * 0.66} fill="none" stroke={color} strokeWidth={1.4} strokeOpacity={0.9} rotation={-18} originX={x} originY={y} />
                <Ellipse cx={x} cy={y} rx={d * 1.7} ry={d * 0.5} fill="none" stroke={color} strokeWidth={0.8} strokeOpacity={0.5} rotation={-18} originX={x} originY={y} />
              </G>
            )}

            {/* the planet disc (tap target) */}
            <Circle cx={x} cy={y} r={d} fill={color} onPress={onPress} />

            {/* Jupiter — cloud bands + Galilean moons */}
            {body.id === "jupiter" && (
              <G>
                <Line x1={x - d * 0.75} y1={y - d * 0.32} x2={x + d * 0.75} y2={y - d * 0.32} stroke="#C77F1E" strokeWidth={0.9} strokeOpacity={0.7} />
                <Line x1={x - d * 0.8} y1={y + d * 0.3} x2={x + d * 0.8} y2={y + d * 0.3} stroke="#C77F1E" strokeWidth={1.1} strokeOpacity={0.7} />
                {JUPITER_MOONS.map((dx, i) => (
                  <Circle key={i} cx={x + dx} cy={y + (i % 2 === 0 ? -1 : 1)} r={1.1} fill="#EAF0FF" opacity={0.85} />
                ))}
              </G>
            )}

            {/* specular highlight for a 3-D feel */}
            {!nightMode && <Circle cx={x - d * 0.3} cy={y - d * 0.3} r={Math.max(1.3, d * 0.3)} fill="#FFFFFF" opacity={0.5} />}

            <SvgText x={x + st.glow * 0.6 + 4} y={y + 4} fill={palette.starLabel} fontSize={11} fontWeight="700">
              {body.name}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
