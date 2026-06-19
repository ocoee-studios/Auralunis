// CosmicDriftGalaxy.tsx
// Renders the personal particle galaxy from lock history.
// Each star = one real lock event. Tapping a star opens the telemetry card.
// Uses react-native-svg for the particle field — no canvas, no WebGL.
// The galaxy rotates slowly via Reanimated so it feels alive even when still.

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import Svg, { Circle, Line, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { getLockEntries, type LockEntry } from "@/services/CosmicDriftService";
import { ChronauraColors } from "@/theme/tokens";

const AnimatedG = Animated.createAnimatedComponent(G);

const SIZE = 280;
const CENTER = SIZE / 2;
const SCALE = 110; // particle coords are -1..1, map to ±SCALE px

interface CosmicDriftGalaxyProps {
  refreshTrigger?: number; // increment to force reload
}

export function CosmicDriftGalaxy({ refreshTrigger = 0 }: CosmicDriftGalaxyProps) {
  const [entries, setEntries] = useState<LockEntry[]>([]);
  const [selected, setSelected] = useState<LockEntry | null>(null);

  const rotationDeg = useSharedValue(0);

  useEffect(() => {
    rotationDeg.value = withRepeat(
      withTiming(360, { duration: 40_000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    getLockEntries().then(setEntries).catch(() => {});
  }, [refreshTrigger]);

  const animatedProps = useAnimatedProps(() => ({
    rotation: rotationDeg.value,
    origin: `${CENTER}, ${CENTER}`,
  }));

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your galaxy is empty</Text>
        <Text style={styles.emptyBody}>
          Achieve a 100% alignment lock on any satellite or planet to add your first star.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Particle cloud */}
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        {/* Background star field */}
        {Array.from({ length: 60 }).map((_, i) => {
          const x = ((Math.sin(i * 137.5) + 1) / 2) * SIZE;
          const y = ((Math.cos(i * 97.3) + 1) / 2) * SIZE;
          const r = (Math.sin(i * 43) + 1) * 0.4 + 0.3;
          return (
            <Circle
              key={`bg-${i}`}
              cx={x}
              cy={y}
              r={r}
              fill="white"
              opacity={0.18 + (i % 5) * 0.04}
            />
          );
        })}

        {/* Rotating lock particles */}
        <AnimatedG animatedProps={animatedProps}>
          {entries.map((entry, i) => {
            // Project 3D particle onto 2D using simple isometric-ish projection
            const px = CENTER + entry.particleX * SCALE - entry.particleZ * SCALE * 0.3;
            const py = CENTER + entry.particleY * SCALE - entry.particleZ * SCALE * 0.2;
            const depth = (entry.particleZ + 1) / 2; // 0..1
            const radius = 3 + depth * 4;
            const opacity = 0.5 + depth * 0.5;

            return (
              <G key={entry.id}>
                {/* Glow ring */}
                <Circle
                  cx={px}
                  cy={py}
                  r={radius + 4}
                  fill="none"
                  stroke={entry.targetColor}
                  strokeWidth={0.5}
                  opacity={opacity * 0.35}
                />
                {/* Core star */}
                <Circle
                  cx={px}
                  cy={py}
                  r={radius}
                  fill={entry.targetColor}
                  opacity={opacity}
                  onPress={() => setSelected(entry)}
                />
              </G>
            );
          })}
        </AnimatedG>
      </Svg>

      <Text style={styles.count}>
        {entries.length} {entries.length === 1 ? "star" : "stars"} in your universe
      </Text>
      <Text style={styles.hint}>Tap a star to view telemetry</Text>

      {/* Recent locks list */}
      <View style={styles.logCard}>
        <Text style={styles.logTitle}>Lock History</Text>
        {entries.slice(0, 8).map((entry) => (
          <TouchableOpacity
            key={entry.id}
            style={styles.logRow}
            onPress={() => setSelected(entry)}
          >
            <View style={[styles.logDot, { backgroundColor: entry.targetColor }]} />
            <View style={styles.logMeta}>
              <Text style={styles.logName}>{entry.targetName}</Text>
              <Text style={styles.logDate}>{formatDate(entry.timestamp)}</Text>
            </View>
            <Text style={styles.logLocation}>{entry.locationLabel}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Telemetry detail modal */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderColor: selected?.targetColor ?? ChronauraColors.borderGold }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTarget, { color: selected?.targetColor }]}>
                {selected?.targetName}
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDate}>{selected ? formatDate(selected.timestamp) : ""}</Text>
            <Text style={styles.modalLocation}>📍 {selected?.locationLabel}</Text>

            <View style={styles.modalDivider} />

            <View style={styles.pillRow}>
              <ModalPill label="Azimuth" value={`${selected?.azimuth}°`} color={selected?.targetColor ?? ChronauraColors.gold} />
              <ModalPill label="Elevation" value={`${selected?.elevation}°`} color={selected?.targetColor ?? ChronauraColors.gold} />
              <ModalPill label="Altitude" value={`${selected?.altitudeKm} km`} color={selected?.targetColor ?? ChronauraColors.gold} />
            </View>
            <View style={[styles.pillRow, { marginTop: 8 }]}>
              <ModalPill label="Lat" value={`${selected?.observerLat.toFixed(3)}°`} color={selected?.targetColor ?? ChronauraColors.gold} />
              <ModalPill label="Lon" value={`${selected?.observerLon.toFixed(3)}°`} color={selected?.targetColor ?? ChronauraColors.gold} />
              <ModalPill label="Type" value={selected?.targetType ?? "—"} color={selected?.targetColor ?? ChronauraColors.gold} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ModalPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", width: "100%" },
  svg: { alignSelf: "center" },
  count: { color: ChronauraColors.gold, fontSize: 13, fontWeight: "800", marginTop: 4 },
  hint: { color: ChronauraColors.faint, fontSize: 10, marginTop: 2, marginBottom: 14 },
  empty: { alignItems: "center", padding: 32, gap: 10 },
  emptyTitle: { color: ChronauraColors.silver, fontSize: 16, fontWeight: "700" },
  emptyBody: { color: ChronauraColors.faint, fontSize: 13, textAlign: "center", lineHeight: 20 },
  logCard: {
    width: "100%",
    backgroundColor: ChronauraColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ChronauraColors.borderGold,
    padding: 14,
  },
  logTitle: { color: ChronauraColors.faint, fontSize: 9, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  logRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: ChronauraColors.borderFaint },
  logDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  logMeta: { flex: 1 },
  logName: { color: ChronauraColors.silver, fontSize: 12, fontWeight: "700" },
  logDate: { color: ChronauraColors.faint, fontSize: 10, marginTop: 1 },
  logLocation: { color: ChronauraColors.gold, fontSize: 10, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(11,11,18,0.88)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: ChronauraColors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 22,
    paddingBottom: 44,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  modalTarget: { fontSize: 18, fontWeight: "800", flex: 1 },
  modalClose: { color: ChronauraColors.faint, fontSize: 16, padding: 4 },
  modalDate: { color: ChronauraColors.silver, fontSize: 13, fontWeight: "600", marginBottom: 4 },
  modalLocation: { color: ChronauraColors.muted, fontSize: 12, marginBottom: 14 },
  modalDivider: { height: 1, backgroundColor: ChronauraColors.borderSubtle, marginBottom: 14 },
  pillRow: { flexDirection: "row", gap: 8 },
  pill: { flex: 1, backgroundColor: ChronauraColors.elevated, borderRadius: 10, padding: 10 },
  pillLabel: { color: ChronauraColors.faint, fontSize: 9, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  pillValue: { fontSize: 12, fontWeight: "800", marginTop: 3 },
});
