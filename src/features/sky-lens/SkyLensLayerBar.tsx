import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";
import { SKY_LENS_LAYERS, type LayerDef, type LayerKey } from "./SkyLensLayerCatalog";

type Props = {
  active: Set<LayerKey>;
  isPremium: boolean;
  nightMode: boolean;
  onToggle: (key: LayerKey) => void;
  onLockedPress: (def: LayerDef) => void;
};

export function SkyLensLayerBar({ active, isPremium, nightMode, onToggle, onLockedPress }: Props) {
  const accent = nightMode ? "#8B2020" : AuraLunisColors.gold;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.bar}
      pointerEvents="box-none"
    >
      {SKY_LENS_LAYERS.map((def) => {
        const locked = def.premium && !isPremium;
        const comingSoon = !def.available;
        const on = active.has(def.key) && def.available;

        return (
          <TouchableOpacity
            key={def.key}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${def.label} layer${comingSoon ? ", coming soon" : on ? ", on" : ", off"}`}
            onPress={() => {
              if (comingSoon || locked) onLockedPress(def);
              else onToggle(def.key);
            }}
            style={[
              styles.pill,
              { borderColor: accent },
              on && { backgroundColor: accent, borderColor: accent },
              comingSoon && styles.pillDim
            ]}
          >
            <Text style={[styles.icon, on && styles.iconOn]}>{def.icon}</Text>
            <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>
              {def.label}
            </Text>
            {/* No lock icon (Paywall Strategy) — premium layers stay enticing with a
                gold sparkle; tapping previews the beauty, then offers the upgrade. */}
            {comingSoon ? (
              <Text style={styles.lock}> ◷</Text>
            ) : locked && !on ? (
              <Text style={[styles.lock, { color: accent }]}> ✦</Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, alignItems: "center" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: "rgba(7,18,37,0.7)"
  },
  pillDim: { opacity: 0.55 },
  icon: { color: "#E7ECF8", fontSize: 13, marginRight: 6 },
  iconOn: { color: "#030816" },
  label: { color: "#E7ECF8", fontSize: 12, fontWeight: "700" },
  labelOn: { color: "#030816", fontWeight: "900" },
  lock: { color: "#E7ECF8", fontSize: 11 }
});
