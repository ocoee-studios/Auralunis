// Beautiful empty state for the Cosmic Vault.
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChronauraColors } from "@/theme/tokens";

export function VaultEmptyState() {
  return (
    <View style={s.container}>
      <Text style={s.icon}>✦</Text>
      <Text style={s.title}>Your constellation of moments begins here.</Text>
      <Text style={s.body}>
        Save observations, ritual thoughts, and LifeSky moments.
        Each entry is encrypted and stored only on your device.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20 },
  icon: { fontSize: 36, color: ChronauraColors.gold, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: ChronauraColors.gold2, textAlign: "center", lineHeight: 24 },
  body: { fontSize: 13, color: ChronauraColors.muted, textAlign: "center", lineHeight: 20, marginTop: 10 }
});
