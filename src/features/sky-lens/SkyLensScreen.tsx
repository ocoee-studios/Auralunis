import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { CameraView } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
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
import { projectTarget, DEFAULT_FOV } from "./ar/SkyLensProjection";
import type { SelectedObject } from "./SkyLensVisual";

type Props = { onClose: () => void };

type LayoutEvent = { nativeEvent: { layout: { width: number; height: number } } };

// Screen-space bearing (0=right, 90=down, …) → an arrow glyph for the Moon finder.
const ARROWS = ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"];
const arrowFor = (bearingDegrees: number) => ARROWS[Math.round(bearingDegrees / 45) % 8];

// Full-screen AR Sky Lens (Phase 1): live camera feed with the Stars,
// Constellations, Planets, Moon, and Grid layers projected over it, a toggle
// bar, tap-to-reveal Info Card, and Night Mode. Phase-2 layers appear locked.
export function SkyLensScreen({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { location, status } = useObserverLocation();
  // Zoom state lives up here so the device-pointing smoothing can ramp with it.
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;
  // Ramp EMA smoothing DOWN (steadier, more damped) as zoom climbs, because a
  // narrow FOV amplifies hand-shake: ~0.32 at 1× → 0.10 at 12×.
  const smoothAlpha = Math.max(0.1, 0.32 - (zoom - 1) * 0.02);
  const { pointing, available } = useDevicePointing(120, 0, smoothAlpha);
  const sky = useSkyData(location);
  const { isPremium } = useEntitlement();
  const { addItem } = useAuraLunisVault();

  const [box, setBox] = useState({ width: 360, height: 720 });
  const [active, setActive] = useState<Set<LayerKey>>(() => new Set(DEFAULT_ACTIVE_LAYERS));
  const [nightMode, setNightMode] = useState(false);
  const [selected, setSelected] = useState<SelectedObject | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set());

  // Pinch-to-zoom: zoom magnifies the sky by narrowing the field of view (and
  // nudges the camera's optical zoom to match). 1× = full 60°×45° FOV.
  const zoomStart = useRef(1);
  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .runOnJS(true)
        .onStart(() => {
          zoomStart.current = zoomRef.current;
        })
        .onUpdate((e) => setZoom(Math.max(1, Math.min(12, zoomStart.current * e.scale)))),
    []
  );
  const fov = useMemo(
    () => ({
      horizontalDegrees: DEFAULT_FOV.horizontalDegrees / zoom,
      verticalDegrees: DEFAULT_FOV.verticalDegrees / zoom
    }),
    [zoom]
  );
  const cameraZoom = Math.min(0.5, (zoom - 1) * 0.05);

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

  // Moon finder: tells you where the Moon is (or that it's below the horizon) so
  // it's never a mystery why you can't see it.
  const moonFinder = useMemo(() => {
    const moon = sky.bodies.find((b) => b.id === "moon");
    if (!moon) return null;
    if (!moon.aboveHorizon) return "☾  The Moon is below the horizon right now";
    const p = projectTarget(pointing, moon.azimuthDegrees, moon.altitudeDegrees, fov, box);
    if (p.onScreen) return null; // it's in view — no need to point you to it
    return p.behind ? "☾  Turn around for the Moon ↻" : `☾  Pan ${arrowFor(p.bearingDegrees)} to the Moon`;
  }, [sky.bodies, pointing, box, fov]);

  const accent = nightMode ? "#C24A4A" : AuraLunisColors.gold;

  return (
    <View style={styles.root} onLayout={onLayout}>
      <GestureDetector gesture={pinch}>
        <View style={StyleSheet.absoluteFill} collapsable={false}>
          <CameraView style={StyleSheet.absoluteFillObject} facing="back" zoom={cameraZoom} />
          {/* Atmospheric twilight glow rising from the horizon (skipped in Night Mode) */}
          {!nightMode && (
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(46,58,120,0.10)", "rgba(40,110,130,0.30)"] as const}
              locations={[0.5, 0.8, 1]}
              style={styles.atmosphere}
              pointerEvents="none"
            />
          )}
          {nightMode && <View style={styles.nightFilter} pointerEvents="none" />}

          <SkyLensCanvas
            box={box}
            pointing={pointing}
            sky={sky}
            fov={fov}
            activeLayers={active}
            nightMode={nightMode}
            onSelect={setSelected}
          />
        </View>
      </GestureDetector>

      {/* Zoom indicator — pinch to zoom, tap to reset */}
      {zoom > 1.05 && (
        <TouchableOpacity
          style={[styles.zoomChip, { top: insets.top + 58 }]}
          onPress={() => setZoom(1)}
          activeOpacity={0.85}
        >
          <Text style={[styles.zoomText, { color: accent }]}>{zoom.toFixed(1)}×  ·  tap to reset</Text>
        </TouchableOpacity>
      )}

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

      {/* Moon finder banner (hidden while an info card is open) */}
      {!selected && moonFinder && (
        <View style={[styles.finder, { bottom: insets.bottom + 82 }]} pointerEvents="none">
          <Text style={[styles.finderText, { color: accent }]}>{moonFinder}</Text>
        </View>
      )}

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
  atmosphere: { position: "absolute", left: 0, right: 0, bottom: 0, height: "42%" },
  zoomChip: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "rgba(7,18,37,0.78)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  zoomText: { fontSize: 12, fontWeight: "800", fontVariant: ["tabular-nums"] },
  finder: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  finderText: {
    backgroundColor: "rgba(7,18,37,0.78)",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    overflow: "hidden"
  },
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
