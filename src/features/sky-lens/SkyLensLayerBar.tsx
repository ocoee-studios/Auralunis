import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";
import { PRIMARY_LAYERS, SECONDARY_LAYERS, type LayerKey } from "./SkyLensLayerCatalog";

type Props = {
  active: Set<LayerKey>;
  nightMode: boolean;
  onToggle: (key: LayerKey) => void;
  onOpenLayers: () => void;
};

// ONE ROW. NEVER TWO.
//
// The previous version used `flexWrap: "wrap"` to avoid clipping. On a 430pt screen the
// five pills need ~516pt, so it wrapped — and "Layers" landed on a row of its own,
// doubling the height of the dock and eating ~45pt of sky. Wrapping traded a clipped
// pill for a stolen row, which is the worse deal in a planetarium.
//
// Now: the four beauty pills SCROLL horizontally (so they can never be clipped mid-pill),
// and the Layers pill is PINNED outside the scroller on the right — always visible, never
// scrolled away, never on its own row. Fixed height, one line, always.
export function SkyLensLayerBar({ active, nightMode, onToggle, onOpenLayers }: Props) {
  const accent = nightMode ? "#B64A4A" : AuraLunisColors.gold;

  // Counts only overlays the USER turned on — layers that ship on by default (Nebulae)
  // are excluded, or the badge would read "1" on a fresh launch and imply the user had
  // changed something they hadn't.
  const activeExtras = SECONDARY_LAYERS.filter(
    (def) => !def.defaultOn && active.has(def.key)
  ).length;

  return (
    <View style={styles.shell} pointerEvents="box-none">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroller}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        alwaysBounceHorizontal={false}
        decelerationRate="fast"
      >
        {PRIMARY_LAYERS.map((def) => {
          const on = active.has(def.key);
          return (
            <TouchableOpacity
              key={def.key}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${def.label} layer, ${on ? "on" : "off"}`}
              onPress={() => onToggle(def.key)}
              style={[
                styles.pill,
                { borderColor: on ? accent : "rgba(217,168,78,0.22)" },
                on && { backgroundColor: accent },
              ]}
            >
              <Text style={[styles.icon, on && styles.iconOn]}>{def.icon}</Text>
              <Text style={[styles.label, on && styles.labelOn]} numberOfLines={1}>
                {def.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pinned — outside the scroller, so it is always reachable and can never be the
          half-cut sliver at the screen edge that started all this. */}
      <TouchableOpacity
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel={
          activeExtras > 0 ? `Layers, ${activeExtras} overlays on` : "Layers, more overlays"
        }
        onPress={onOpenLayers}
        style={[
          styles.pill,
          styles.layersPill,
          { borderColor: activeExtras > 0 ? accent : "rgba(217,168,78,0.22)" },
        ]}
      >
        {/* ICON ONLY. The word "Layers" cost ~50pt of the row — enough that the Planets
            pill got squeezed off the edge. The glyph carries it; the badge says the rest. */}
        <Text style={[styles.layersIcon, activeExtras > 0 && { color: accent }]}>☰</Text>
        {activeExtras > 0 && (
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>{activeExtras}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

/** The bar's fixed height, exported so the screen can derive the dock/exclusion zones
 *  from it instead of hard-coding a magic number that silently drifts out of sync. */
export const LAYER_BAR_HEIGHT = 52;

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    height: LAYER_BAR_HEIGHT,
    marginHorizontal: 8,
    paddingRight: 6,
    borderRadius: 22,
    backgroundColor: "rgba(2,8,20,0.52)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(217,168,78,0.13)",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    overflow: "hidden",
  },
  scroller: { flex: 1 },
  scrollContent: {
    alignItems: "center",
    paddingLeft: 8,
    // Trailing breath so the LAST pill (Planets) can always scroll fully clear of the
    // pinned Layers button instead of dying half-cut against it.
    paddingRight: 10,
    gap: 5,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    // 9 → 8 → 7. Measured: at padding 8 with a 10.5pt label the four pills + the pinned
    // Layers button needed ~446pt on a 430pt screen, so Planets died at the edge. This
    // (with fontSize 10) brings it to ~428pt — it fits, with the ScrollView still there
    // as the safety net if a device's font metrics run wider than my estimate.
    paddingHorizontal: 7,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(5,13,29,0.38)",
  },
  // Square-ish icon button, not a text pill — ~38pt instead of ~88pt.
  layersPill: {
    marginLeft: 4,
    minWidth: 38,
    paddingHorizontal: 8,
    justifyContent: "center",
    backgroundColor: "rgba(5,13,29,0.62)",
  },
  layersIcon: { color: "rgba(231,236,248,0.86)", fontSize: 14, fontWeight: "700" },
  icon: { color: "rgba(231,236,248,0.8)", fontSize: 11, marginRight: 3 },
  iconOn: { color: "#030816" },
  label: {
    color: "rgba(231,236,248,0.86)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0,
  },
  labelOn: { color: "#030816", fontWeight: "900" },
  badge: {
    marginLeft: 5,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#030816", fontSize: 9, fontWeight: "900" },
});
