// Shareable image card: astrolabe snapshot, tonight score, visible planets,
// moon phase. Rendered as a React Native view, captured by ViewShot.
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChronauraColors } from "@/theme/tokens";
import type { TonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import type { TonightScoreResult } from "@/services/TonightScoreService";

type Props = { sky: TonightSky; score: TonightScoreResult };

export function SkyShareCard({ sky, score }: Props) {
  const planets = sky.visibleBodies.filter((b) => b.id !== "sun" && b.id !== "moon");

  return (
    <View style={s.card} collapsable={false}>
      <Text style={s.brand}>CHRONAURA</Text>
      <Text style={s.score}>{score.score}</Text>
      <Text style={s.label}>TONIGHT SCORE · {score.label.toUpperCase()}</Text>
      <Text style={s.moon}>Moon {sky.moonIlluminationPercent}%</Text>
      {planets.length > 0 && (
        <Text style={s.planets}>{planets.map((b) => b.name).join(" · ")} visible</Text>
      )}
      <Text style={s.tag}>ocoeestudios.com/chronaura</Text>
    </View>
  );
});

const s = StyleSheet.create({
  card: { width: 360, height: 480, backgroundColor: "#05070D", borderRadius: 28, padding: 28, alignItems: "center", justifyContent: "center" },
  brand: { color: ChronauraColors.gold2, fontSize: 14, letterSpacing: 4, fontWeight: "900" },
  score: { color: ChronauraColors.gold2, fontSize: 72, fontWeight: "900", marginTop: 12 },
  label: { color: ChronauraColors.gold, fontSize: 11, letterSpacing: 2, fontWeight: "900", marginTop: 4 },
  moon: { color: ChronauraColors.silver, fontSize: 16, fontWeight: "700", marginTop: 16 },
  planets: { color: ChronauraColors.muted, fontSize: 13, marginTop: 6 },
  tag: { color: ChronauraColors.muted, fontSize: 10, position: "absolute", bottom: 20 }
});
