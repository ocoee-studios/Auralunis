import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChronauraColors } from "@/theme/tokens";

export function DeepSkyGlowVisual() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((value) => (value + 1) % 4), 1000);
    return () => clearInterval(id);
  }, []);

  const labels = ["Nebula", "Galaxy", "Cluster", "Remnant"];
  const glowPositions = [styles.g0, styles.g1, styles.g2, styles.g3];

  return (
    <View style={styles.card}>
      <Text style={styles.label}>DEEP SKY LAYER</Text>
      <View style={styles.canvas}>
        {glowPositions.map((positionStyle, index) => (
          <View
            key={labels[index]}
            style={[styles.glow, positionStyle, active === index && styles.active]}
          />
        ))}
      </View>
      <View style={styles.row}>
        {labels.map((label, index) => (
          <Text key={label} style={[styles.pill, active === index && styles.pillActive]}>
            {label}
          </Text>
        ))}
      </View>
      <Text style={styles.caption}>
        Live deep-sky visuals for nebulae, galaxies, star clusters, and supernova remnants.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, padding: 16, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 14 },
  label: { color: ChronauraColors.gold2, fontSize: 11, letterSpacing: 2, fontWeight: "900" },
  canvas: { height: 170, borderRadius: 22, overflow: "hidden", marginTop: 10, backgroundColor: "rgba(3,5,10,0.8)" },
  glow: { position: "absolute", borderRadius: 999, opacity: 0.7 },
  g0: { width: 110, height: 74, left: 28, top: 48, backgroundColor: "rgba(139,116,255,0.45)" },
  g1: { width: 82, height: 82, right: 36, top: 26, backgroundColor: "rgba(98,207,255,0.42)" },
  g2: { width: 70, height: 70, left: 130, bottom: 28, backgroundColor: "rgba(246,220,145,0.28)" },
  g3: { width: 92, height: 62, right: 46, bottom: 34, backgroundColor: "rgba(255,176,122,0.34)" },
  active: { opacity: 1, transform: [{ scale: 1.08 }] },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  pill: { color: ChronauraColors.silver, fontSize: 11, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  pillActive: { color: ChronauraColors.gold2, borderColor: "rgba(217,168,78,0.28)", backgroundColor: "rgba(217,168,78,0.1)" },
  caption: { color: ChronauraColors.muted, fontSize: 12, lineHeight: 18, marginTop: 10 }
});
