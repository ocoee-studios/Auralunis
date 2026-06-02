import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ChronauraColors, ChronauraPricing } from "@/theme/tokens";

export function PaywallCard() {
  const [selected, setSelected] = useState<"annual" | "monthly">("annual");

  const selectedPrice =
    selected === "annual"
      ? ChronauraPricing.auraAnnual
      : ChronauraPricing.auraMonthly;

  function startTrial() {
    Alert.alert(
      "Aura Pro Trial",
      `Selected ${selectedPrice}. The RevenueCat purchase handler is wired for sandbox setup.`
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>MOST POPULAR</Text>
      <Text style={styles.title}>Aura Pro</Text>
      <Text style={styles.copy}>
        Unlock the complete Chronaura experience with a {ChronauraPricing.trial}.
      </Text>

      <View style={styles.row}>
        <Pressable
          style={[styles.price, selected === "annual" && styles.selected]}
          onPress={() => setSelected("annual")}
        >
          <Text style={styles.label}>Best Value</Text>
          <Text style={styles.priceText}>{ChronauraPricing.auraAnnual}</Text>
        </Pressable>

        <Pressable
          style={[styles.price, selected === "monthly" && styles.selected]}
          onPress={() => setSelected("monthly")}
        >
          <Text style={styles.label}>Flexible</Text>
          <Text style={styles.priceText}>{ChronauraPricing.auraMonthly}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={startTrial}>
        <Text style={styles.buttonText}>Start Aura Pro Trial</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(4,5,11,0.74)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.22)",
    marginBottom: 14
  },
  eyebrow: {
    color: ChronauraColors.gold2,
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: "900"
  },
  title: { color: "#FFF", fontSize: 25, fontWeight: "900", letterSpacing: -0.8, marginTop: 5 },
  copy: { color: ChronauraColors.muted, lineHeight: 20, fontSize: 13, marginTop: 7 },
  row: { flexDirection: "row", gap: 10, marginTop: 14 },
  price: {
    flex: 1,
    borderRadius: 18,
    padding: 13,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  selected: {
    backgroundColor: "rgba(212,175,55,0.14)",
    borderColor: "rgba(212,175,55,0.32)"
  },
  label: { color: ChronauraColors.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 },
  priceText: { color: "#FFF", fontSize: 18, fontWeight: "900", marginTop: 6 },
  button: {
    marginTop: 14,
    backgroundColor: ChronauraColors.gold2,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center"
  },
  buttonText: { color: "#17100A", fontWeight: "900" }
});
