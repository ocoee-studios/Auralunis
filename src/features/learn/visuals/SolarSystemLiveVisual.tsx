import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";

const C = 130; // center of the 260×260 orrery stage
const P = C - 5; // planet dots are 10px — offset so they sit ON the orbit point

export function SolarSystemLiveVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 100), 120);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>LIVE ORRERY</Text>
      <View style={styles.center}>
        {/* Everything anchors to the same container center (C), so the planets
            actually ride the orbit rings instead of orbiting an offset point. */}
        <View style={[styles.sun, { top: C - 14, left: C - 14 }]} />
        {[42, 62, 86, 112].map((size) => (
          <View key={size} style={[styles.orbit, { width: size * 2, height: size * 2, borderRadius: size, top: C - size, left: C - size }]} />
        ))}
        <View style={[styles.planet, { top: P + Math.sin(step / 8) * 42, left: P + Math.cos(step / 8) * 42, backgroundColor: AuraLunisColors.gold2 }]} />
        <View style={[styles.planet, { top: P + Math.sin(step / 10 + 1.2) * 62, left: P + Math.cos(step / 10 + 1.2) * 62, backgroundColor: "#d0d8ff" }]} />
        <View style={[styles.planet, { top: P + Math.sin(step / 12 + 2.1) * 86, left: P + Math.cos(step / 12 + 2.1) * 86, backgroundColor: "#62CFFF" }]} />
        <View style={[styles.planet, { top: P + Math.sin(step / 14 + 2.8) * 112, left: P + Math.cos(step / 14 + 2.8) * 112, backgroundColor: "#FFB07A" }]} />
      </View>
      <Text style={styles.caption}>The planets orbit the Sun at different speeds. Inner planets move fastest, outer planets take years to complete one orbit.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 14
  },
  label: { color: AuraLunisColors.gold2, fontSize: 11, letterSpacing: 2, fontWeight: "900" },
  center: {
    marginTop: 12,
    width: 260,
    height: 260,
    alignSelf: "center"
  },
  sun: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AuraLunisColors.gold2,
    shadowColor: AuraLunisColors.gold,
    shadowOpacity: 0.9,
    shadowRadius: 16
  },
  orbit: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.18)"
  },
  planet: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5
  },
  caption: { color: AuraLunisColors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }
});
