import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChronauraColors } from "@/theme/tokens";

// The orbit container is a fixed 260×260 square (see styles.center), so its
// center is at 130,130. Planet dots are 10px, so offset by half to center them
// on the orbit rings (which are centered by flexbox).
const ORRERY_SIZE = 260;
const PLANET_CENTER = ORRERY_SIZE / 2 - 5;

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
        <View style={styles.sun} />
        {[42, 62, 86, 112].map((size, i) => (
          <View key={size} style={[styles.orbit, { width: size * 2, height: size * 2, borderRadius: size }]} />
        ))}
        <View style={[styles.planet, { top: PLANET_CENTER + Math.sin(step / 8) * 42, left: PLANET_CENTER + Math.cos(step / 8) * 42, backgroundColor: ChronauraColors.gold2 }]} />
        <View style={[styles.planet, { top: PLANET_CENTER + Math.sin(step / 10 + 1.2) * 62, left: PLANET_CENTER + Math.cos(step / 10 + 1.2) * 62, backgroundColor: "#d0d8ff" }]} />
        <View style={[styles.planet, { top: PLANET_CENTER + Math.sin(step / 12 + 2.1) * 86, left: PLANET_CENTER + Math.cos(step / 12 + 2.1) * 86, backgroundColor: "#62CFFF" }]} />
        <View style={[styles.planet, { top: PLANET_CENTER + Math.sin(step / 14 + 2.8) * 112, left: PLANET_CENTER + Math.cos(step / 14 + 2.8) * 112, backgroundColor: "#FFB07A" }]} />
      </View>
      <Text style={styles.caption}>A living mini-orrery for the Sun and planetary motion. Production can wire this to real orbital time scrubbing.</Text>
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
  label: { color: ChronauraColors.gold2, fontSize: 11, letterSpacing: 2, fontWeight: "900" },
  center: {
    marginTop: 12,
    width: ORRERY_SIZE,
    height: ORRERY_SIZE,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center"
  },
  sun: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ChronauraColors.gold2,
    shadowColor: ChronauraColors.gold,
    shadowOpacity: 0.9,
    shadowRadius: 16
  },
  orbit: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.18)"
  },
  planet: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5
  },
  caption: { color: ChronauraColors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }
});
