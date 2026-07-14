import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";
import { SECONDARY_LAYERS, type LayerDef, type LayerKey } from "./SkyLensLayerCatalog";

type Props = {
  visible: boolean;
  active: Set<LayerKey>;
  isPremium: boolean;
  nightMode: boolean;
  onToggle: (key: LayerKey) => void;
  onLockedPress: (def: LayerDef) => void;
  onClose: () => void;
};

// The analytical overlays live here, not on the sky.
//
// They used to sit in a horizontally-scrolling pill row along the bottom of Sky Lens,
// which meant the first thing you saw under a beautiful sky was a strip of technical
// controls — and the fifth pill was permanently half-cut at the screen edge, hinting at
// hidden UI. Now the main screen keeps only the four BEAUTY layers, and everything
// analytical is one tap away behind "Layers".
//
// Crucially this changes only WHERE the toggles live, never what's on: every overlay in
// here still starts OFF (defaultOn: false) and stays off until the user asks for it.
export function SkyLensLayersSheet({
  visible,
  active,
  isPremium,
  nightMode,
  onToggle,
  onLockedPress,
  onClose,
}: Props) {
  const accent = nightMode ? "#B64A4A" : AuraLunisColors.gold;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Tap anywhere off the sheet to dismiss — the sky stays visible behind it. */}
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />

          <Text style={styles.title}>Layers</Text>
          <Text style={styles.subtitle}>Optional overlays for a closer look</Text>

          <View style={styles.rows}>
            {SECONDARY_LAYERS.map((def) => {
              const locked = def.premium && !isPremium;
              const comingSoon = !def.available;
              const on = active.has(def.key) && def.available;

              return (
                <Pressable
                  key={def.key}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: on, disabled: comingSoon }}
                  accessibilityLabel={`${def.label}${comingSoon ? ", coming soon" : on ? ", on" : ", off"}`}
                  onPress={() => {
                    if (comingSoon || locked) onLockedPress(def);
                    else onToggle(def.key);
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                    comingSoon && styles.rowDim,
                  ]}
                >
                  <Text style={[styles.rowIcon, { color: on ? accent : "rgba(231,236,248,0.62)" }]}>
                    {def.icon}
                  </Text>

                  <View style={styles.rowText}>
                    <View style={styles.rowLabelLine}>
                      <Text style={styles.rowLabel}>{def.label}</Text>
                      {comingSoon ? (
                        <Text style={styles.rowTag}>◷ Soon</Text>
                      ) : locked ? (
                        <Text style={[styles.rowTag, { color: accent }]}>✦ Premium</Text>
                      ) : null}
                    </View>
                    {def.description ? (
                      <Text style={styles.rowDesc} numberOfLines={1}>
                        {def.description}
                      </Text>
                    ) : null}
                  </View>

                  {/* A quiet track/knob switch — no platform Switch, so it inherits the
                      gold-on-midnight language of the rest of Sky Lens. */}
                  <View
                    style={[
                      styles.track,
                      on && { backgroundColor: accent, borderColor: accent },
                    ]}
                  >
                    <View style={[styles.knob, on && styles.knobOn]} />
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.done, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.doneText, { color: accent }]}>Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2,6,16,0.55)",
  },
  sheet: {
    backgroundColor: "rgba(6,13,28,0.94)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(217,168,78,0.18)",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 34,
  },
  grabber: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(231,236,248,0.22)",
    marginBottom: 14,
  },
  title: {
    color: "#F1E7D0",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  subtitle: {
    color: AuraLunisColors.muted,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  rows: { marginTop: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(231,236,248,0.07)",
  },
  rowPressed: { opacity: 0.62 },
  rowDim: { opacity: 0.45 },
  rowIcon: {
    fontSize: 14,
    width: 26,
  },
  rowText: { flex: 1 },
  rowLabelLine: { flexDirection: "row", alignItems: "center" },
  rowLabel: {
    color: "rgba(240,244,253,0.94)",
    fontSize: 15,
    fontWeight: "700",
  },
  rowTag: {
    color: "rgba(231,236,248,0.6)",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 8,
  },
  rowDesc: {
    color: AuraLunisColors.muted,
    fontSize: 11.5,
    marginTop: 2,
    opacity: 0.75,
  },
  track: {
    width: 42,
    height: 25,
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(217,168,78,0.28)",
    backgroundColor: "rgba(5,13,29,0.7)",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  knob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(231,236,248,0.55)",
  },
  knobOn: {
    backgroundColor: "#050D1D",
    alignSelf: "flex-end",
  },
  done: {
    marginTop: 18,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  doneText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
});
