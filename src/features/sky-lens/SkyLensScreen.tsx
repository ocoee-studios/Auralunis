import React, { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuraLunisColors } from "@/theme/tokens";
import { useAuraLunisVault } from "@/state/AuraLunisVaultContext";
import { useEntitlement } from "@/hooks/useEntitlement";
import { useObserverLocation } from "./ephemeris/useObserverLocation";
import { useDevicePointing } from "./ar/useDevicePointing";
import { useSkyData } from "./hooks/useSkyProjection";
import { SkyLensCanvas } from "./SkyLensCanvas";
import { SkyLensLayerBar } from "./SkyLensLayerBar";
import { SkyLensInfoCard } from "./SkyLensInfoCard";
import { DEFAULT_ACTIVE_LAYERS, type LayerDef, type LayerKey } from "./SkyLensLayerCatalog";
import type { SelectedObject } from "./SkyLensVisual";

type Props = { onClose: () => void };

type LayoutEvent = { nativeEvent: { layout: { width: number; height: number } } };

// Full-screen AR Sky Lens (Phase 1): live camera feed with the Stars,
// Constellations, Planets, Moon, and Grid layers projected over it, a toggle
// bar, tap-to-reveal Info Card, and Night Mode. Phase-2 layers appear locked.
export function SkyLensScreen({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { location, status } = useObserverLocation();
  const { pointing, available } = useDevicePointing();
  const sky = useSkyData(location);
  const { isPremium } = useEntitlement();
  const { addItem } = useAuraLunisVault();

  const [box, setBox] = useState({ width: 360, height: 720 });
  const [active, setActive] = useState<Set<LayerKey>>(() => new Set(DEFAULT_ACTIVE_LAYERS));
  const [nightMode, setNightMode] = useState(false);
  const [selected, setSelected] = useState<SelectedObject | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());

  const onLayout = useCallback((e: LayoutEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ width, height });
  }, []);

  const toggleLayer = useCallback((key: LayerKey) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const onLockedPress = useCallback(
    (def: LayerDef) => {
      Alert.alert(
        `${def.label} · Coming Soon`,
        isPremium
          ? `The ${def.label} layer arrives in the next Sky Lens update.`
          : `${def.label} is part of AuraLunis Premium and is coming in the next update — Satellites, Deep Sky, the Milky Way band, and Find Mode.`
      );
    },
    [isPremium]
  );

  const onSave = useCallback(
    (object: SelectedObject) => {
      addItem({
        type: "archive",
        title: object.name,
        detail: object.description ?? object.facts.map((f) => `${f.label}: ${f.value}`).join(" · ")
      });
      setSavedIds((prev) => new Set(prev).add(object.id));
    },
    [addItem]
  );

  const hud = useMemo(
    () =>
      available
        ? `Heading ${Math.round(pointing.azimuthDegrees)}°  ·  Alt ${Math.round(pointing.altitudeDegrees)}°`
        : "Calibrating compass…",
    [available, pointing.azimuthDegrees, pointing.altitudeDegrees]
  );

  const accent = nightMode ? "#C24A4A" : AuraLunisColors.gold;

  return (
    <View style={styles.root} onLayout={onLayout}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
      {nightMode && <View style={styles.nightFilter} pointerEvents="none" />}

      <SkyLensCanvas
        box={box}
        pointing={pointing}
        sky={sky}
        activeLayers={active}
        nightMode={nightMode}
        onSelect={setSelected}
      />

      {/* Top HUD */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.iconBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.iconBtnText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.hudPill} pointerEvents="none">
          <Text style={[styles.hudText, { color: accent }]}>{hud}</Text>
          {status === "fallback" ? <Text style={styles.hudSub}>Default location</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.iconBtn, nightMode && { backgroundColor: "rgba(139,32,32,0.5)" }]}
          onPress={() => setNightMode((n) => !n)}
          activeOpacity={0.8}
        >
          <Text style={styles.iconBtnText}>{nightMode ? "🌙" : "◐"}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 6 }]} pointerEvents="box-none">
        {selected ? (
          <SkyLensInfoCard
            object={selected}
            nightMode={nightMode}
            saved={savedIds.has(selected.id)}
            onSave={onSave}
            onClose={() => setSelected(null)}
          />
        ) : (
          <SkyLensLayerBar
            active={active}
            isPremium={isPremium}
            nightMode={nightMode}
            onToggle={toggleLayer}
            onLockedPress={onLockedPress}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  nightFilter: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(7,18,37,0.8)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.34)",
    alignItems: "center",
    justifyContent: "center"
  },
  iconBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  hudPill: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "rgba(7,18,37,0.6)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center"
  },
  hudText: { fontSize: 13, fontWeight: "900", fontVariant: ["tabular-nums"] },
  hudSub: { color: AuraLunisColors.muted, fontSize: 10, marginTop: 1 },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0 }
});
