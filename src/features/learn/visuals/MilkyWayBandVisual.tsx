import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChronauraColors } from "@/theme/tokens";

export function MilkyWayBandVisual() {
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setShift((s) => (s + 1) % 24), 180);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>MILKY WAY / GALAXY MODE</Text>
      <View style={styles.canvas}>
        <View style={[styles.band, { transform: [{ translateX: shift - 12 }, { rotate: "-12deg" }] }]} />
        <View style={styles.coreMarker} />
        <Text style={styles.coreText}>Galactic Center</Text>
        <Text style={styles.rift}>Great Rift</Text>
      </View>
      <Text style={styles.caption}>A living band view for the Milky Way, core, and dust lanes. Production can connect this to visibility windows and low-light guidance.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, padding: 16, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 14 },
  label: { color: ChronauraColors.gold2, fontSize: 11, letterSpacing: 2, fontWeight: "900" },
  canvas: { height: 180, borderRadius: 24, backgroundColor: "#05070D", overflow: "hidden", marginTop: 10 },
  band: { position: "absolute", left: -20, right: -20, top: 58, height: 44, backgroundColor: "rgba(246,220,145,0.16)", borderRadius: 999 },
  coreMarker: { position: "absolute", left: 54, top: 86, width: 12, height: 12, borderRadius: 6, backgroundColor: ChronauraColors.gold2 },
  coreText: { position: "absolute", left: 72, top: 80, color: "#FFF", fontSize: 12, fontWeight: "800" },
  rift: { position: "absolute", right: 24, top: 106, color: ChronauraColors.silver, fontSize: 11 },
  caption: { color: ChronauraColors.muted, fontSize: 12, lineHeight: 18, marginTop: 10 }
});
