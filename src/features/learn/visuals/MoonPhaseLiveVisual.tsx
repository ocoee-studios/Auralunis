import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChronauraColors } from "@/theme/tokens";

const PHASES = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];

export function MoonPhaseLiveVisual() {
  const [index, setIndex] = useState(4);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % PHASES.length), 900);
    return () => clearInterval(id);
  }, []);

  const illumination = [2, 18, 50, 74, 100, 76, 50, 20][index];

  return (
    <View style={styles.card}>
      <Text style={styles.label}>LIVE MOON PHASE</Text>
      <View style={styles.row}>
        <View style={styles.moonShell}>
          <View style={styles.moon} />
          <View style={[styles.shadow, { width: `${100 - illumination}%` }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{PHASES[index]}</Text>
          <Text style={styles.meta}>Illumination · {illumination}%</Text>
          <Text style={styles.caption}>Production can bind this to the real lunar cycle, moonrise, moonset, and local date.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28, padding: 16, backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 14
  },
  label: { color: ChronauraColors.gold2, fontSize: 11, letterSpacing: 2, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 10 },
  moonShell: {
    width: 92, height: 92, borderRadius: 46, overflow: "hidden", backgroundColor: "#161b2d",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)"
  },
  moon: { ...StyleSheet.absoluteFillObject, backgroundColor: "#F2F4FF" },
  shadow: { position: "absolute", right: 0, top: 0, bottom: 0, backgroundColor: "#0B0B12" },
  title: { color: "#FFF", fontSize: 19, fontWeight: "900" },
  meta: { color: ChronauraColors.gold2, fontSize: 12, marginTop: 4 },
  caption: { color: ChronauraColors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }
});
