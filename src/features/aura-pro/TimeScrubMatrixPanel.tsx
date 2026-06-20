import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";
import { buildTimeScrubSnapshot } from "@/features/aura-pro/TimeScrubMatrixService";

const increments = [-30, -7, -1, 1, 7, 30];

function planetLabel(name: string) {
  if (name === "Mercury") return "Me";
  if (name === "Mars") return "Ma";
  return name.slice(0, 1);
}

export function TimeScrubMatrixPanel() {
  const [offsetDays, setOffsetDays] = useState(0);
  const snapshot = useMemo(
    () => buildTimeScrubSnapshot(offsetDays),
    [offsetDays]
  );

  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>AURA PRO · KINETIC TIME</Text>
      <Text style={styles.title}>Time-Scrub Matrix</Text>
      <Text style={styles.copy}>
        Scrub forward or backward through an interactive orbital fixture and
        inspect the retrograde adapter boundary.
      </Text>

      <View style={styles.dateCard}>
        <Text style={styles.date}>{snapshot.displayDateISO}</Text>
        <Text style={styles.offset}>
          {snapshot.offsetDays === 0
            ? "Today"
            : `${snapshot.offsetDays > 0 ? "+" : ""}${snapshot.offsetDays} days`}
        </Text>
      </View>

      <View style={styles.orbitStage}>
        {snapshot.planets.map((planet, index) => (
          <View
            key={planet.id}
            style={[
              styles.planet,
              {
                left: `${planet.orbitPercent}%`,
                top: 18 + index * 24
              },
              planet.direction === "retrograde-fixture" && styles.retrogradePlanet
            ]}
          >
            <Text style={styles.planetText}>{planetLabel(planet.name)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.incrementRow}>
        {increments.map((increment) => (
          <Pressable
            key={increment}
            style={styles.increment}
            onPress={() => setOffsetDays((previous) => previous + increment)}
          >
            <Text style={styles.incrementText}>
              {increment > 0 ? "+" : ""}
              {increment}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.reset} onPress={() => setOffsetDays(0)}>
        <Text style={styles.resetText}>Return to Today</Text>
      </Pressable>

      <Text style={styles.retrogradeTitle}>Retrograde adapter fixture</Text>
      {snapshot.nearbyRetrogradeWindows.length ? (
        snapshot.nearbyRetrogradeWindows.map((window) => (
          <Text key={window.id} style={styles.retrogradeRow}>
            ✦ {window.planet} · {window.startISO} → {window.endISO}
          </Text>
        ))
      ) : (
        <Text style={styles.retrogradeRow}>
          No nearby fixture windows at this scrub position.
        </Text>
      )}

      <Text style={styles.note}>{snapshot.note}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
    backgroundColor: "rgba(139,116,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(139,116,255,0.18)"
  },
  eyebrow: {
    color: AuraLunisColors.gold2,
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: "900"
  },
  title: { color: "#FFF", fontSize: 21, fontWeight: "900", marginTop: 7 },
  copy: {
    color: AuraLunisColors.silver,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6
  },
  dateCard: {
    marginTop: 12,
    borderRadius: 17,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)"
  },
  date: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  offset: { color: AuraLunisColors.gold2, fontSize: 11, marginTop: 4 },
  orbitStage: {
    height: 145,
    borderRadius: 18,
    marginTop: 10,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.20)"
  },
  planet: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: -11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AuraLunisColors.gold2
  },
  retrogradePlanet: { backgroundColor: AuraLunisColors.orange },
  planetText: { color: "#17100A", fontSize: 10, fontWeight: "900" },
  incrementRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  increment: {
    flex: 1,
    borderRadius: 13,
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)"
  },
  incrementText: { color: "#FFF", fontSize: 11, fontWeight: "900" },
  reset: {
    borderRadius: 15,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 9,
    backgroundColor: "rgba(139,116,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(139,116,255,0.25)"
  },
  resetText: { color: "#FFF", fontWeight: "800" },
  retrogradeTitle: {
    color: AuraLunisColors.gold2,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 12
  },
  retrogradeRow: {
    color: AuraLunisColors.silver,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4
  },
  note: {
    color: AuraLunisColors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8
  }
});
