import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ChronauraColors } from "@/theme/tokens";
import {
  getSatelliteFixture,
  loadSatelliteOverlay
} from "@/features/aura-pro/SatelliteFeedService";
import type {
  SatelliteOverlayMode,
  SatelliteOverlaySnapshot
} from "@/features/aura-pro/AuraProUtilityTypes";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";

const modes: Array<[SatelliteOverlayMode, string]> = [
  ["brightest", "Brightest"],
  ["stations", "Stations"],
  ["decaying", "Decaying"]
];

export function SatelliteThermalOverlayPanel() {
  const [mode, setMode] = useState<SatelliteOverlayMode>("brightest");
  const [snapshot, setSnapshot] = useState<SatelliteOverlaySnapshot>(() =>
    getSatelliteFixture("brightest")
  );
  const [loading, setLoading] = useState(false);
  const { location } = useObserverLocation();

  // Recompute fixture positions whenever the mode or the observer location
  // changes, so the bundled view also reflects real look-angles for the user.
  useEffect(() => {
    setSnapshot(getSatelliteFixture(mode, location));
  }, [mode, location]);

  function chooseMode(nextMode: SatelliteOverlayMode) {
    setMode(nextMode);
  }

  async function refreshLiveFeed() {
    setLoading(true);

    try {
      setSnapshot(await loadSatelliteOverlay(mode, location, true));
    } catch {
      Alert.alert(
        "Orbital overlay unavailable",
        "Chronaura could not refresh the satellite overlay. The safe fixture view remains available."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>AURA PRO · ORBITAL OVERLAY</Text>
      <Text style={styles.title}>Satellite + Space-Junk Thermal Layer</Text>
      <Text style={styles.copy}>
        Explore bright satellites, stations, and potential-decay objects. The
        thermal look represents attention density, not physical temperature.
      </Text>

      <View style={styles.modeRow}>
        {modes.map(([id, label]) => (
          <Pressable
            key={id}
            style={[styles.modeButton, mode === id && styles.modeButtonActive]}
            onPress={() => chooseMode(id)}
          >
            <Text
              style={[
                styles.modeText,
                mode === id && styles.modeTextActive
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.map}>
        <View style={styles.earthGlow} />
        <Text style={styles.mapLabel}>ORBITAL DENSITY PREVIEW</Text>
        {snapshot.points.slice(0, 36).map((point) => {
          const size = 6 + point.intensity * 8;

          return (
            <View
              key={point.id}
              style={[
                styles.orbitPoint,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  left: `${point.left}%`,
                  top: `${point.top}%`,
                  opacity: Math.max(0.48, point.intensity)
                }
              ]}
            />
          );
        })}
      </View>

      <Text style={styles.source}>
        Source: {snapshot.source.toUpperCase()} · {snapshot.points.length} objects
      </Text>
      <Text style={styles.note}>{snapshot.note}</Text>

      <Pressable style={styles.button} onPress={refreshLiveFeed}>
        <Text style={styles.buttonText}>
          {loading ? "Refreshing…" : "Refresh Live Feed"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
    backgroundColor: "rgba(255,176,122,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,176,122,0.17)"
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
  modeRow: { flexDirection: "row", gap: 7, marginTop: 12 },
  modeButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)"
  },
  modeButtonActive: {
    backgroundColor: "rgba(255,176,122,0.14)",
    borderColor: "rgba(255,176,122,0.28)"
  },
  modeText: { color: ChronauraColors.muted, fontSize: 11, fontWeight: "800" },
  modeTextActive: { color: "#FFF" },
  map: {
    height: 178,
    marginTop: 12,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#040814"
  },
  earthGlow: {
    position: "absolute",
    width: 250,
    height: 110,
    borderRadius: 150,
    left: 44,
    bottom: -60,
    backgroundColor: "rgba(98,207,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(98,207,255,0.22)"
  },
  mapLabel: {
    position: "absolute",
    left: 12,
    top: 10,
    color: ChronauraColors.muted,
    fontSize: 9,
    letterSpacing: 1.5
  },
  orbitPoint: {
    position: "absolute",
    backgroundColor: ChronauraColors.orange,
    shadowColor: ChronauraColors.orange,
    shadowOpacity: 0.8,
    shadowRadius: 7
  },
  source: {
    color: ChronauraColors.gold2,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 10
  },
  note: {
    color: ChronauraColors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4
  },
  button: {
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,176,122,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,176,122,0.26)"
  },
  buttonText: { color: "#FFF", fontWeight: "900" }
});
