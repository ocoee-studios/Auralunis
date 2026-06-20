import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
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

export function AstrolabePreview({ sky }: Props) {
  const data: TonightSky = useMemo(() => sky ?? computeTonightSky(DEFAULT_OBSERVER), [sky]);

  return (
    <View style={styles.wrap}>
      <View style={styles.board}>
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFillObject}>
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} fill="rgba(217,168,78,0.04)" stroke={ChronauraColors.gold} strokeWidth={1.5} />
          <Circle cx={CENTER} cy={CENTER} r={(RADIUS * 2) / 3} fill="none" stroke="rgba(192,198,212,0.18)" strokeWidth={1} />
          <Circle cx={CENTER} cy={CENTER} r={RADIUS / 3} fill="none" stroke="rgba(192,198,212,0.18)" strokeWidth={1} />
          <Line x1={CENTER} y1={CENTER - RADIUS} x2={CENTER} y2={CENTER + RADIUS} stroke="rgba(192,198,212,0.12)" strokeWidth={0.5} />
          <Line x1={CENTER - RADIUS} y1={CENTER} x2={CENTER + RADIUS} y2={CENTER} stroke="rgba(192,198,212,0.12)" strokeWidth={0.5} />
          {data.visibleBodies.map((body) => {
            const { x, y } = project(body.azimuthDegrees, body.altitudeDegrees);
            return <Circle key={body.id} cx={x} cy={y} r={dotRadius(body.magnitude)} fill={bodyColor(body.id)} />;
          })}
          <Circle cx={CENTER} cy={CENTER} r={2} fill={ChronauraColors.muted} />
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
