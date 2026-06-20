import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";

const modules = [
  ["Desk Obelisk", "WidgetKit StandBy extension scaffold added"],
  ["Stellar Portal", "visionOS ImmersiveSpace handoff added"],
  ["Sovereign Sigil", "SHA-256 local-safe preview + WidgetKit handoff added"],
  ["Taptic Astrolabe Crown", "watchOS Digital Crown handoff added"]
];

export function FutureLuxuryModulesPanel() {
  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>FUTURE LUXURY MODULES</Text>
      <Text style={styles.title}>Native handoff layer</Text>
      <Text style={styles.copy}>
        These platform-specific targets are documented and scaffolded, but they
        remain disabled until each Apple-native extension is compiled and
        device-tested.
      </Text>

      {modules.map(([name, detail]) => (
        <View key={name} style={styles.row}>
          <Text style={styles.rowTitle}>{name}</Text>
          <Text style={styles.rowCopy}>{detail}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(139,116,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(139,116,255,0.18)"
  },
  eyebrow: {
    color: AuraLunisColors.gold2,
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: "900"
  },
  title: { color: "#FFF", fontSize: 20, fontWeight: "900", marginTop: 7 },
  copy: {
    color: AuraLunisColors.silver,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5
  },
  row: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 10,
    marginTop: 10
  },
  rowTitle: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  rowCopy: {
    color: AuraLunisColors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3
  }
});
