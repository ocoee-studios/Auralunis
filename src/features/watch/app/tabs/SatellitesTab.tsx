import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getLiveISSPosition, type PropagatedPosition } from "@/services/LiveTLEService";
import { tapLight } from "@/services/HapticService";
import type { WatchCtx } from "../WatchAppTheme";

type Status = "loading" | "ok" | "error";

// Great-circle ground distance (km) between observer and a satellite sub-point.
function groundDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Tab 3 — Satellite Passes. Pulls the ISS's live position from Celestrak (SGP4 via
// LiveTLEService) and shows its sub-point + ground distance from you. Full
// overhead-pass timeline (rise/set/peak elevation) is the Phase-3 deepening.
export function SatellitesTab({ ctx }: { ctx: WatchCtx }) {
  const { palette, location } = ctx;
  const [status, setStatus] = useState<Status>("loading");
  const [iss, setIss] = useState<PropagatedPosition | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const pos = await getLiveISSPosition();
      if (pos) {
        setIss(pos);
        setStatus("ok");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const distance =
    iss && groundDistanceKm(location.latitudeDegrees, location.longitudeDegrees, iss.latitudeDegrees, iss.longitudeDegrees);
  const near = distance !== null && distance !== undefined && distance < 1500;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.header, { color: palette.accent }]}>SATELLITE PASSES</Text>

      {status === "loading" && (
        <View style={styles.center}>
          <ActivityIndicator color={palette.accent} />
          <Text style={[styles.muted, { color: palette.dim }]}>Fetching live orbital data…</Text>
        </View>
      )}

      {status === "error" && (
        <View style={[styles.card, { borderColor: palette.line }]}>
          <Text style={[styles.name, { color: palette.text }]}>No live data</Text>
          <Text style={[styles.muted, { color: palette.dim }]}>
            Couldn't reach the satellite feed. Check your connection and retry.
          </Text>
        </View>
      )}

      {status === "ok" && iss && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={tapLight}
          style={[styles.card, { borderColor: palette.accent, backgroundColor: palette.accentSoft }]}
        >
          <View style={styles.row}>
            <Text style={[styles.name, { color: palette.text }]}>◈ ISS (ZARYA)</Text>
            <Text style={[styles.badge, { color: near ? palette.accent : palette.dim }]}>
              {near ? "OVERHEAD REGION" : "EN ROUTE"}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: palette.line }]} />
          <Stat label="Sub-point" value={`${iss.latitudeDegrees.toFixed(1)}°, ${iss.longitudeDegrees.toFixed(1)}°`} palette={palette} />
          <Stat label="Altitude" value={`${Math.round(iss.altitudeKm)} km`} palette={palette} />
          <Stat label="Speed" value={`${iss.velocityKms.toFixed(2)} km/s`} palette={palette} />
          <Stat label="Ground distance" value={distance !== null && distance !== undefined ? `${distance.toLocaleString()} km` : "—"} palette={palette} />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.refresh, { borderColor: palette.line }]}
        onPress={() => { tapLight(); void load(); }}
      >
        <Text style={[styles.refreshText, { color: palette.dim }]}>↻ Refresh</Text>
      </TouchableOpacity>

      <Text style={[styles.note, { color: palette.dim }]}>
        Live ISS position via Celestrak SGP4. Full rise/set pass predictions with countdown haptics arrive in a later update.
      </Text>
    </ScrollView>
  );
}

function Stat({ label, value, palette }: { label: string; value: string; palette: WatchCtx["palette"] }) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: palette.dim }]}>{label}</Text>
      <Text style={[styles.statValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 14, paddingVertical: 8 },
  header: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 8, textAlign: "center" },
  center: { alignItems: "center", paddingVertical: 30, gap: 10 },
  muted: { fontSize: 12, textAlign: "center", lineHeight: 17 },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 15, fontWeight: "900" },
  badge: { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  divider: { height: 1, marginVertical: 10 },
  statRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
  refresh: { borderWidth: 1, borderRadius: 14, paddingVertical: 10, alignItems: "center", marginTop: 4 },
  refreshText: { fontSize: 12, fontWeight: "700" },
  note: { fontSize: 10, lineHeight: 14, marginTop: 12, textAlign: "center" }
});
