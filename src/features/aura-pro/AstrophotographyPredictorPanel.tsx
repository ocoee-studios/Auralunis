import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChronauraColors } from "@/theme/tokens";
import {
  astroPhotoScenarios,
  getAstroPhotoScenario
} from "@/features/aura-pro/AstrophotographyPredictorService";
import type { AstroPhotoScenario } from "@/features/aura-pro/AuraProUtilityTypes";

export function AstrophotographyPredictorPanel() {
  const [scenarioId, setScenarioId] =
    useState<AstroPhotoScenario["id"]>("suburban");
  const scenario = getAstroPhotoScenario(scenarioId);

  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>AURA PRO · NIGHT PLANNER</Text>
      <Text style={styles.title}>Light Pollution + AstroPhoto Predictor</Text>
      <Text style={styles.copy}>
        Preview a localized planning model for sky darkness, clouds, Moon
        brightness, visibility, and recommended targets.
      </Text>

      <View style={styles.scenarioRow}>
        {astroPhotoScenarios.map((item) => (
          <Pressable
            key={item.id}
            style={[
              styles.scenarioButton,
              item.id === scenarioId && styles.scenarioButtonActive
            ]}
            onPress={() => setScenarioId(item.id)}
          >
            <Text
              style={[
                styles.scenarioName,
                item.id === scenarioId && styles.scenarioNameActive
              ]}
            >
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.score}>{scenario.score}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.scoreLabel}>ASTROPHOTO WINDOW SCORE</Text>
          <Text style={styles.scoreCopy}>
            Bortle {scenario.bortleClass} · Cloud {scenario.cloudCoverPercent}% ·
            Moon {scenario.moonIlluminationPercent}%
          </Text>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{scenario.humidityPercent}%</Text>
          <Text style={styles.metricLabel}>Humidity</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{scenario.visibilityKilometers} km</Text>
          <Text style={styles.metricLabel}>Visibility</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>B{scenario.bortleClass}</Text>
          <Text style={styles.metricLabel}>Sky Class</Text>
        </View>
      </View>

      <Text style={styles.targetsTitle}>Recommended targets</Text>
      <Text style={styles.targets}>
        {scenario.recommendedTargets.join(" · ")}
      </Text>
      <Text style={styles.note}>{scenario.note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
    backgroundColor: "rgba(98,207,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(98,207,255,0.18)"
  },
  eyebrow: {
    color: ChronauraColors.gold2,
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: "900"
  },
  title: { color: "#FFF", fontSize: 21, fontWeight: "900", marginTop: 7 },
  copy: {
    color: ChronauraColors.silver,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6
  },
  scenarioRow: { flexDirection: "row", gap: 7, marginTop: 12 },
  scenarioButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)"
  },
  scenarioButtonActive: {
    backgroundColor: "rgba(98,207,255,0.13)",
    borderColor: "rgba(98,207,255,0.28)"
  },
  scenarioName: { color: ChronauraColors.muted, fontSize: 10, fontWeight: "800" },
  scenarioNameActive: { color: "#FFF" },
  scoreCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 13,
    padding: 13,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.20)"
  },
  score: { color: ChronauraColors.gold2, fontSize: 42, fontWeight: "900" },
  scoreLabel: {
    color: "#FFF",
    fontSize: 10,
    letterSpacing: 1.6,
    fontWeight: "900"
  },
  scoreCopy: {
    color: ChronauraColors.silver,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  metricGrid: { flexDirection: "row", gap: 8, marginTop: 10 },
  metric: {
    flex: 1,
    borderRadius: 15,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)"
  },
  metricValue: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  metricLabel: { color: ChronauraColors.muted, fontSize: 10, marginTop: 3 },
  targetsTitle: { color: ChronauraColors.gold2, fontSize: 11, fontWeight: "900", marginTop: 12 },
  targets: { color: "#FFF", fontSize: 12, lineHeight: 18, marginTop: 4 },
  note: { color: ChronauraColors.muted, fontSize: 11, lineHeight: 16, marginTop: 8 }
});
