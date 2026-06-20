import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";

export function StarBrightnessVisual() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 10), 260);
    return () => clearInterval(id);
  }, []);

  const opacityA = 0.35 + (tick % 5) * 0.12;
  const opacityB = 0.55 + ((tick + 2) % 5) * 0.08;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>STAR BRIGHTNESS + COLOR</Text>
      <View style={styles.row}>
        <View style={[styles.star, { opacity: opacityA, backgroundColor: "#EAF1FF" }]} />
        <View style={[styles.star, { opacity: opacityB, backgroundColor: "#9EDCFF", width: 22, height: 22, borderRadius: 11 }]} />
        <View style={[styles.star, { opacity: 0.8, backgroundColor: "#FFD3A8", width: 16, height: 16, borderRadius: 8 }]} />
      </View>
      <Text style={styles.caption}>Compare how stars vary by brightness and color. Production can link this to magnitude and temperature examples like Sirius, Vega, Betelgeuse, and Rigel.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, padding: 16, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 14 },
  label: { color: AuraLunisColors.gold2, fontSize: 11, letterSpacing: 2, fontWeight: "900" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", marginTop: 16, marginBottom: 4 },
  star: { width: 28, height: 28, borderRadius: 14, shadowColor: "#FFF", shadowOpacity: 0.7, shadowRadius: 14 },
  caption: { color: AuraLunisColors.muted, fontSize: 12, lineHeight: 18, marginTop: 10 }
});
