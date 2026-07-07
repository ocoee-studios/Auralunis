import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const accent = nightMode ? "#B64A4A" : AuraLunisColors.gold;

  return (
    <View style={styles.shell} pointerEvents="box-none">
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
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${def.label} layer${comingSoon ? ", coming soon" : on ? ", on" : ", off"}`}
              onPress={() => {
                if (comingSoon || locked) onLockedPress(def);
                else onToggle(def.key);
              }}
              style={[
                styles.pill,
                { borderColor: on ? accent : "rgba(217,168,78,0.22)" },
                on && { backgroundColor: accent },
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
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: 14,
    borderRadius: 28,
    backgroundColor: "rgba(2,8,20,0.58)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.16)",
    shadowColor: "#000",
    shadowOpacity: 0.34,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    overflow: "hidden"
  },
  bar: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 7,
    alignItems: "center"
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(5,13,29,0.42)"
  },
  pillDim: { opacity: 0.5 },
  icon: { color: "rgba(231,236,248,0.78)", fontSize: 12, marginRight: 5 },
  iconOn: { color: "#030816" },
  label: {
    color: "rgba(231,236,248,0.82)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.15
  },
  labelOn: { color: "#030816", fontWeight: "900" },
  lock: { color: "rgba(231,236,248,0.72)", fontSize: 10, fontWeight: "800" }
});
