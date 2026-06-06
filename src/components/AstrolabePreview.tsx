import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Line, Defs, RadialGradient, Stop, Polygon, G } from "react-native-svg";
import { ChronauraColors } from "@/theme/tokens";
import {
  computeTonightSky,
  type TonightSky
} from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { DEFAULT_OBSERVER } from "@/features/sky-lens/ephemeris/SkyEphemerisService";

type Props = { sky?: TonightSky };

const SIZE = 240;
const CENTER = SIZE / 2;
const RADIUS = 104;

// All-sky projection: center = zenith (alt 90), rim = horizon (alt 0),
// azimuth measured from north (top), increasing clockwise.
function project(azimuthDegrees: number, altitudeDegrees: number) {
  const alt = Math.max(0, Math.min(90, altitudeDegrees));
  const r = (RADIUS * (90 - alt)) / 90;
  const rad = (azimuthDegrees * Math.PI) / 180;
  return { x: CENTER + r * Math.sin(rad), y: CENTER - r * Math.cos(rad) };
}

function dotRadius(magnitude?: number) {
  if (magnitude == null) return 3;
  return Math.max(2.5, Math.min(7, 5 - magnitude * 0.6));
}

function bodyColor(id: string) {
  if (id === "moon") return ChronauraColors.silver;
  if (id === "sun") return ChronauraColors.gold;
  return ChronauraColors.gold2;
}

// A single slim compass-rose ray (kite) from the center toward `angleDeg`.
function rosePoints(angleDeg: number, length: number, shoulder: number, halfWidthDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  const aL = ((angleDeg - halfWidthDeg) * Math.PI) / 180;
  const aR = ((angleDeg + halfWidthDeg) * Math.PI) / 180;
  const tip = { x: CENTER + length * Math.sin(a), y: CENTER - length * Math.cos(a) };
  const left = { x: CENTER + shoulder * Math.sin(aL), y: CENTER - shoulder * Math.cos(aL) };
  const right = { x: CENTER + shoulder * Math.sin(aR), y: CENTER - shoulder * Math.cos(aR) };
  return `${tip.x},${tip.y} ${left.x},${left.y} ${CENTER},${CENTER} ${right.x},${right.y}`;
}

const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
const STARBURST = Array.from({ length: 16 }, (_, i) => i * 22.5);

export function AstrolabePreview({ sky }: Props) {
  const data: TonightSky = useMemo(() => sky ?? computeTonightSky(DEFAULT_OBSERVER), [sky]);

  return (
    <View style={styles.wrap}>
      <View style={styles.board}>
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFillObject}>
          <Defs>
            <RadialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={ChronauraColors.gold} stopOpacity={0.22} />
              <Stop offset="55%" stopColor={ChronauraColors.gold} stopOpacity={0.06} />
              <Stop offset="100%" stopColor={ChronauraColors.gold} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Inner aura glow */}
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill="url(#auraGlow)" />

          {/* Outer dial + concentric rings */}
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill="rgba(212,175,55,0.04)" stroke={ChronauraColors.gold} strokeWidth={1.5} />
          <Circle cx={CENTER} cy={CENTER} r={RADIUS - 7} fill="none" stroke="rgba(212,175,55,0.22)" strokeWidth={0.75} />
          <Circle cx={CENTER} cy={CENTER} r={(RADIUS * 2) / 3} fill="none" stroke="rgba(192,198,212,0.18)" strokeWidth={1} />
          <Circle cx={CENTER} cy={CENTER} r={RADIUS / 3} fill="none" stroke="rgba(192,198,212,0.18)" strokeWidth={1} />

          {/* Degree tick ring */}
          {TICKS.map((deg) => {
            const major = deg % 30 === 0;
            const a = (deg * Math.PI) / 180;
            const outer = RADIUS - 1;
            const inner = RADIUS - (major ? 9 : 4.5);
            return (
              <Line
                key={`tick-${deg}`}
                x1={CENTER + outer * Math.sin(a)}
                y1={CENTER - outer * Math.cos(a)}
                x2={CENTER + inner * Math.sin(a)}
                y2={CENTER - inner * Math.cos(a)}
                stroke={major ? ChronauraColors.gold : "rgba(212,175,55,0.32)"}
                strokeWidth={major ? 1.2 : 0.6}
              />
            );
          })}

          {/* Compass axis lines */}
          <Line x1={CENTER} y1={CENTER - RADIUS} x2={CENTER} y2={CENTER + RADIUS} stroke={ChronauraColors.borderSubtle} strokeWidth={0.5} />
          <Line x1={CENTER - RADIUS} y1={CENTER} x2={CENTER + RADIUS} y2={CENTER} stroke={ChronauraColors.borderSubtle} strokeWidth={0.5} />

          {/* Eight-point gold compass rose (behind body markers) */}
          <G opacity={0.9}>
            {[0, 90, 180, 270].map((deg) => (
              <Polygon
                key={`rose-major-${deg}`}
                points={rosePoints(deg, RADIUS * 0.6, RADIUS * 0.2, 7)}
                fill="rgba(243,217,155,0.30)"
                stroke="rgba(212,175,55,0.55)"
                strokeWidth={0.6}
              />
            ))}
            {[45, 135, 225, 315].map((deg) => (
              <Polygon
                key={`rose-minor-${deg}`}
                points={rosePoints(deg, RADIUS * 0.36, RADIUS * 0.13, 6)}
                fill="rgba(212,175,55,0.16)"
                stroke={ChronauraColors.borderGold}
                strokeWidth={0.5}
              />
            ))}
          </G>

          {/* Central starburst */}
          <G>
            {STARBURST.map((deg) => {
              const a = (deg * Math.PI) / 180;
              const len = deg % 90 === 0 ? 17 : deg % 45 === 0 ? 12 : 8;
              return (
                <Line
                  key={`burst-${deg}`}
                  x1={CENTER}
                  y1={CENTER}
                  x2={CENTER + len * Math.sin(a)}
                  y2={CENTER - len * Math.cos(a)}
                  stroke={ChronauraColors.gold2}
                  strokeWidth={deg % 90 === 0 ? 1 : 0.5}
                  opacity={0.75}
                />
              );
            })}
            <Circle cx={CENTER} cy={CENTER} r={3.4} fill={ChronauraColors.gold2} />
            <Circle cx={CENTER} cy={CENTER} r={1.6} fill="#FFFDF4" />
          </G>

          {/* Live celestial bodies */}
          {data.visibleBodies.map((body) => {
            const { x, y } = project(body.azimuthDegrees, body.altitudeDegrees);
            return <Circle key={body.id} cx={x} cy={y} r={dotRadius(body.magnitude)} fill={bodyColor(body.id)} />;
          })}
        </Svg>

        <Text style={[styles.cardinal, { top: 0, left: CENTER - 6 }]}>N</Text>
        <Text style={[styles.cardinal, { top: CENTER - 8, left: SIZE - 14 }]}>E</Text>
        <Text style={[styles.cardinal, { top: SIZE - 16, left: CENTER - 6 }]}>S</Text>
        <Text style={[styles.cardinal, { top: CENTER - 8, left: 2 }]}>W</Text>

        {data.visibleBodies.map((body) => {
          const { x, y } = project(body.azimuthDegrees, body.altitudeDegrees);
          return (
            <Text
              key={body.id}
              style={[styles.bodyLabel, { left: x + dotRadius(body.magnitude) + 3, top: y - 7 }]}
              numberOfLines={1}
            >
              {body.name}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 250, alignItems: "center", justifyContent: "center" },
  board: { width: SIZE, height: SIZE, position: "relative" },
  cardinal: { position: "absolute", color: ChronauraColors.muted, fontSize: 11, fontWeight: "700" },
  bodyLabel: { position: "absolute", color: ChronauraColors.silver, fontSize: 9 }
});
