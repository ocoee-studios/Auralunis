import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuraLunisVault } from "@/state/AuraLunisVaultContext";
import { tapSuccess } from "@/services/HapticService";
import type { WatchCtx } from "../WatchAppTheme";
import { bodyGlyph, formatClock } from "../WatchFormat";

// Tab 6 — Observation Log. Quick-tap what you saw; each entry is written to the
// AuraLunis Vault with a timestamp + location, ready to sync to the phone.
export function ObservationLogTab({ ctx }: { ctx: WatchCtx }) {
  const { palette, sky, location } = ctx;
  const { addItem } = useAuraLunisVault();
  const [logged, setLogged] = useState<string[]>([]);

  const options = useMemo(() => {
    const visible = sky.visibleBodies.filter((b) => b.id !== "sun").map((b) => ({ id: b.id, name: b.name }));
    return [...visible, { id: "iss", name: "ISS pass" }, { id: "meteor", name: "Meteor" }, { id: "other", name: "Other…" }];
  }, [sky.visibleBodies]);

  const locLabel = `${location.latitudeDegrees.toFixed(2)}°, ${location.longitudeDegrees.toFixed(2)}°`;

  const log = (name: string) => {
    const stamp = formatClock(new Date());
    addItem({
      type: "capture",
      title: `Observed ${name}`,
      detail: `Logged ${stamp} · ${locLabel} · Moon ${Math.round(sky.moonIlluminationPercent)}%`
    });
    tapSuccess();
    setLogged((prev) => [`${name} · ${stamp}`, ...prev].slice(0, 6));
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.header, { color: palette.accent }]}>LOG OBSERVATION</Text>
      <Text style={[styles.meta, { color: palette.dim }]}>📍 {locLabel}   🕐 {formatClock(new Date())}</Text>

      {options.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          activeOpacity={0.8}
          style={[styles.row, { borderColor: palette.line }]}
          onPress={() => log(opt.name.replace("…", ""))}
        >
          <Text style={[styles.glyph, { color: palette.accent }]}>{bodyGlyph(opt.id)}</Text>
          <Text style={[styles.name, { color: palette.text }]}>{opt.name}</Text>
          <Text style={[styles.plus, { color: palette.dim }]}>＋</Text>
        </TouchableOpacity>
      ))}

      {logged.length > 0 && (
        <View style={[styles.recent, { borderColor: palette.line }]}>
          <Text style={[styles.recentTitle, { color: palette.dim }]}>SAVED TO VAULT</Text>
          {logged.map((entry, i) => (
            <Text key={i} style={[styles.recentItem, { color: palette.text }]}>✓ {entry}</Text>
          ))}
        </View>
      )}

      <Text style={[styles.note, { color: palette.dim }]}>
        Entries save to the local Vault and sync to AuraLunis on your phone via WatchConnectivity.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 14, paddingVertical: 8 },
  header: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 4, textAlign: "center" },
  meta: { fontSize: 11, textAlign: "center", marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8 },
  glyph: { fontSize: 18, width: 22, textAlign: "center" },
  name: { fontSize: 15, fontWeight: "700", flex: 1 },
  plus: { fontSize: 18, fontWeight: "900" },
  recent: { borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 8 },
  recentTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 1.5, marginBottom: 6 },
  recentItem: { fontSize: 12, paddingVertical: 2, fontVariant: ["tabular-nums"] },
  note: { fontSize: 10, lineHeight: 14, marginTop: 14, textAlign: "center" }
});
