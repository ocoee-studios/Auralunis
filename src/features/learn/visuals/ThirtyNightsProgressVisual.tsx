import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";

export function ThirtyNightsProgressVisual() {
  const [night, setNight] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setNight((n) => (n % 6) + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>30 NIGHTS PATH</Text>
      <Text style={styles.title}>Night {night}</Text>
      <View style={styles.row}>
        {[1,2,3,4,5,6].map((n) => (
          <View key={n} style={[styles.dot, n <= night && styles.dotActive]} />
        ))}
      </View>
      <Text style={styles.caption}>Complete each night to unlock the next. Your progress is saved automatically.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, padding: 16, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 14 },
  label: { color: AuraLunisColors.gold2, fontSize: 11, letterSpacing: 2, fontWeight: "900" },
  title: { color: "#FFF", fontSize: 26, fontWeight: "900", marginTop: 10 },
  row: { flexDirection: "row", gap: 10, marginTop: 16 },
  dot: { width: 18, height: 18, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.08)" },
  dotActive: { backgroundColor: AuraLunisColors.gold2 },
  caption: { color: AuraLunisColors.muted, fontSize: 12, lineHeight: 18, marginTop: 12 }
});
