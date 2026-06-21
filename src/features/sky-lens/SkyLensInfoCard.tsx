import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";
import type { SelectedObject } from "./SkyLensVisual";

type Props = {
  object: SelectedObject | null;
  nightMode: boolean;
  saved: boolean;
  onSave: (object: SelectedObject) => void;
  onClose: () => void;
};

// Slides up from the bottom when the user taps a star, planet, the Moon, or a
// constellation. Save to Vault is the only action (no dead buttons): Share Card
// arrives with the Phase-2 SkyShareService.
export function SkyLensInfoCard({ object, nightMode, saved, onSave, onClose }: Props) {
  if (!object) return null;
  const accent = nightMode ? "#C24A4A" : AuraLunisColors.gold;

  return (
    <View style={styles.card} pointerEvents="box-none">
      <View style={[styles.inner, { borderColor: accent }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: accent }]}>{object.name}</Text>
            {object.subtitle ? <Text style={styles.subtitle}>{object.subtitle}</Text> : null}
          </View>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        {object.facts.length > 0 && (
          <View style={styles.facts}>
            {object.facts.map((f) => (
              <View key={f.label} style={styles.factRow}>
                <Text style={styles.factLabel}>{f.label}</Text>
                <Text style={styles.factValue}>{f.value}</Text>
              </View>
            ))}
          </View>
        )}

        {object.description ? <Text style={styles.desc}>{object.description}</Text> : null}

        <TouchableOpacity
          style={[styles.saveBtn, { borderColor: accent }, saved && { backgroundColor: accent }]}
          onPress={() => onSave(object)}
          disabled={saved}
          activeOpacity={0.85}
        >
          <Text style={[styles.saveText, saved && styles.saveTextOn]}>
            {saved ? "✓ Saved to Vault" : "Save to Vault"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 12 },
  inner: {
    backgroundColor: "rgba(7,18,37,0.94)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  headerRow: { flexDirection: "row", alignItems: "flex-start" },
  name: { fontSize: 20, fontWeight: "900" },
  subtitle: { color: AuraLunisColors.silver, fontSize: 12, marginTop: 2 },
  close: { color: "#E7ECF8", fontSize: 18, fontWeight: "800", paddingHorizontal: 4 },
  facts: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 10
  },
  factRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4
  },
  factLabel: { color: AuraLunisColors.muted, fontSize: 13 },
  factValue: { color: "#FFF", fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
  desc: { color: AuraLunisColors.silver, fontSize: 13, lineHeight: 19, marginTop: 12 },
  saveBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center"
  },
  saveText: { color: "#FFF", fontWeight: "800", fontSize: 14 },
  saveTextOn: { color: "#030816", fontWeight: "900" }
});
