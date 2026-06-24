import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, RadialGradient, Rect, Stop } from "react-native-svg";
import { AuraLunisColors } from "@/theme/tokens";
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
        "AuraLunis could not refresh the satellite overlay. The safe fixture view remains available."
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
        <Svg width="100%" height="100%" viewBox="0 0 320 178" style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="earthBody" cx="50%" cy="115%" r="60%">
              <Stop offset="0%" stopColor="#1A3858" stopOpacity={0.9} />
              <Stop offset="40%" stopColor="#0D2240" stopOpacity={0.7} />
              <Stop offset="80%" stopColor="#061428" stopOpacity={0.4} />
              <Stop offset="100%" stopColor="#030816" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="earthAtmo" cx="45%" cy="110%" r="55%">
              <Stop offset="0%" stopColor="#4FC8FF" stopOpacity={0.06} />
              <Stop offset="50%" stopColor="#4FC8FF" stopOpacity={0.03} />
              <Stop offset="100%" stopColor="#4FC8FF" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="skyBg" cx="50%" cy="40%" r="70%">
              <Stop offset="0%" stopColor="#0A1428" stopOpacity={1} />
              <Stop offset="100%" stopColor="#030816" stopOpacity={1} />
            </RadialGradient>
          </Defs>

          {/* Deep space background */}
          <Rect width={320} height={178} fill="url(#skyBg)" />

          {/* Background stars */}
          {Array.from({ length: 40 }, (_, i) => (
            <Circle
              key={`bgstar-${i}`}
              cx={((i * 47 + 13) % 310) + 5}
              cy={((i * 31 + 7) % 130) + 5}
              r={i % 7 === 0 ? 1 : 0.5}
              fill={i % 3 === 0 ? "#D9A84E" : "#FFF6D6"}
              opacity={0.15 + (i % 5) * 0.06}
            />
          ))}

          {/* Orbital arcs (thin, subtle) */}
          <Ellipse cx={160} cy={210} rx={150} ry={65} fill="none" stroke="rgba(217,168,78,0.06)" strokeWidth={0.5} strokeDasharray="3,5" />
          <Ellipse cx={160} cy={210} rx={120} ry={52} fill="none" stroke="rgba(217,168,78,0.04)" strokeWidth={0.5} strokeDasharray="3,5" />
          <Ellipse cx={160} cy={210} rx={90} ry={38} fill="none" stroke="rgba(217,168,78,0.04)" strokeWidth={0.5} strokeDasharray="3,5" />

          {/* Earth atmosphere glow */}
          <Circle cx={160} cy={235} r={100} fill="url(#earthAtmo)" />

          {/* Earth body */}
          <Circle cx={160} cy={235} r={80} fill="url(#earthBody)" />

          {/* Earth terminator highlight */}
          <Ellipse cx={145} cy={230} rx={75} ry={78} fill="none" stroke="rgba(79,200,255,0.08)" strokeWidth={1} />

          {/* Satellite blips with glow */}
          {snapshot.points.slice(0, 36).map((point) => {
            const x = (point.left / 100) * 320;
            const y = (point.top / 100) * 178;
            const r = 2 + point.intensity * 3;
            const isDecaying = mode === "decaying";
            const dotColor = isDecaying ? "#FF6B4A" : mode === "stations" ? "#4FC8FF" : "#D9A84E";
            return (
              <React.Fragment key={point.id}>
                <Circle cx={x} cy={y} r={r * 3} fill={dotColor} opacity={0.08} />
                <Circle cx={x} cy={y} r={r * 1.5} fill={dotColor} opacity={0.15} />
                <Circle cx={x} cy={y} r={r} fill={dotColor} opacity={0.7} />
              </React.Fragment>
            );
          })}
        </Svg>
        <Text style={styles.mapLabel}>ORBITAL DENSITY PREVIEW</Text>
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
  modeText: { color: AuraLunisColors.muted, fontSize: 11, fontWeight: "800" },
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
    color: AuraLunisColors.muted,
    fontSize: 9,
    letterSpacing: 1.5
  },
  orbitPoint: {
    position: "absolute",
    backgroundColor: AuraLunisColors.orange,
    shadowColor: AuraLunisColors.orange,
    shadowOpacity: 0.8,
    shadowRadius: 7
  },
  source: {
    color: AuraLunisColors.gold2,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 10
  },
  note: {
    color: AuraLunisColors.muted,
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
