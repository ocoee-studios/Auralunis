import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuraLunisColors } from "@/theme/tokens";
import { PRIMARY_LAYERS, SECONDARY_LAYERS, type LayerKey } from "./SkyLensLayerCatalog";

type Props = {
  active: Set<LayerKey>;
  nightMode: boolean;
  onToggle: (key: LayerKey) => void;
  onOpenLayers: () => void;
};

// THE BOTTOM BAR IS NOW THE BEAUTY SET, AND NOTHING ELSE.
//
// It used to be a horizontally-scrolling strip of all NINE layers. Two things were wrong
// with that: the fifth pill sat permanently half-cut at the screen edge (so the very
// first thing under a beautiful sky was a chopped-off technical control), and the strip
// gave equal billing to "Milky Way" and "Ecliptic" — which are not equal.
//
// Now: the four beauty layers get permanent pills, and every analytical overlay lives
// behind one quiet "Layers" button (SkyLensLayersSheet). No ScrollView, nothing clipped,
// nothing hidden off-screen. The row fits, always.
//
// Nebulae is a secondary layer that ships ON — it's part of the default beauty set (max 2
// curated heroes, low opacity), but its CONTROL lives in the sheet rather than earning a
// fifth pill. Zodiac / Grid / Satellites / Ecliptic remain off until the user asks.
export function SkyLensLayerBar({ active, nightMode, onToggle, onOpenLayers }: Props) {
  const accent = nightMode ? "#B64A4A" : AuraLunisColors.gold;

  // A quiet count so the button reveals that overlays are live without shouting.
  //
  // Counts only overlays the USER turned on — layers that ship on by default (Nebulae)
  // are excluded, or the badge would read "1" on a fresh launch and imply the user had
  // changed something they hadn't. The badge answers "what did I switch on?", not "what
  // is rendering?".
  const activeExtras = SECONDARY_LAYERS.filter(
    (def) => !def.defaultOn && active.has(def.key)
  ).length;

  return (
    <View style={styles.shell} pointerEvents="box-none">
      <View style={styles.bar}>
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

        <View style={styles.divider} />

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
          <Text style={[styles.icon, activeExtras > 0 && { color: accent }]}>⋮</Text>
          <Text style={styles.label} numberOfLines={1}>
            Layers
          </Text>
          {activeExtras > 0 && (
            <View style={[styles.badge, { backgroundColor: accent }]}>
              <Text style={styles.badgeText}>{activeExtras}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignSelf: "stretch",
    marginHorizontal: 8,
    borderRadius: 24,
    // Glass tray, not a dark slab (matches the lightened HUD chrome).
    backgroundColor: "rgba(2,8,20,0.52)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(217,168,78,0.13)",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    overflow: "hidden",
  },
  // Wraps to a second line on narrow phones rather than clipping or scrolling — the old
  // bar's cardinal sin was hiding a control off the edge of the screen.
  bar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(5,13,29,0.38)",
  },
  layersPill: { backgroundColor: "rgba(5,13,29,0.55)" },
  // A hairline breath between the beauty set and the way into everything else.
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: "rgba(231,236,248,0.14)",
    marginHorizontal: 3,
  },
  icon: { color: "rgba(231,236,248,0.8)", fontSize: 11, marginRight: 4 },
  iconOn: { color: "#030816" },
  label: {
    color: "rgba(231,236,248,0.86)",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.1,
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
  badgeText: {
    color: "#030816",
    fontSize: 9,
    fontWeight: "900",
  },
});
