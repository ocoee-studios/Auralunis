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

      {/* A fixed hairline divider gives the Layers button a CONSISTENT relationship to the
          scrolling pills, whatever the slack. Without it the button floated a variable
          distance from Planets depending on how much room the row had left — the "spacing
          and alignment" wobble. This is a fixed structural seam, not a margin. */}
      <View style={styles.divider} />

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
export const LAYER_BAR_HEIGHT = 56;

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
    paddingLeft: 6,
    paddingRight: 6,
    gap: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    // Measured on a 430pt screen: four pills + divider + Layers = ~419pt, ~12pt of real
    // slack. The ScrollView remains the safety net if a device's font metrics run wider.
    paddingHorizontal: 6,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(5,13,29,0.38)",
  },
  // A fixed seam between the scrolling pills and the Layers button — always the same
  // width, so the Layers button sits in a consistent place instead of drifting with slack.
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    marginHorizontal: 5,
    backgroundColor: "rgba(217,168,78,0.2)",
  },
  // Square-ish icon button, not a text pill — ~38pt instead of ~88pt. Fixed width so the
  // badge appearing/disappearing can't shift it.
  layersPill: {
    width: 46,
    justifyContent: "center",
    backgroundColor: "rgba(5,13,29,0.62)",
  },
  layersIcon: { color: "rgba(231,236,248,0.92)", fontSize: 17, fontWeight: "700" },
  icon: { color: "rgba(231,236,248,0.85)", fontSize: 13, marginRight: 4 },
  iconOn: { color: "#030816" },
  label: {
    color: "rgba(231,236,248,0.92)",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0,
  },
  labelOn: { color: "#030816", fontWeight: "900" },
  badge: {
    marginLeft: 5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#030816", fontSize: 11, fontWeight: "900" },
});
