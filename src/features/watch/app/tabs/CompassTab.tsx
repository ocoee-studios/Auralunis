import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDevicePointing } from "@/features/sky-lens/ar/useDevicePointing";
import { computeStarPositions, type HorizontalStar } from "@/features/sky-lens/ephemeris/StarPositions";
import { BRIGHT_STARS } from "@/features/sky-lens/data/brightStars";
import { tapLight, tapMedium, tapHeavy } from "@/services/HapticService";
import type { WatchCtx } from "../WatchAppTheme";
import { azimuthToCompass } from "../WatchFormat";

const WINDOW_HALF = 70; // degrees of azimuth visible left/right of center
const CENTER_THRESHOLD = 4; // |Δaz| under this = "passing center" → haptic + label

type SkyDot = {
  id: string;
  name: string;
  kind: "planet" | "moon" | "star";
  azimuthDegrees: number;
  altitudeDegrees: number;
  magnitude: number;
};

function signedDelta(a: number): number {
  return ((((a + 180) % 360) + 360) % 360) - 180;
}

// Tab 4 — Star Compass (flagship). Sweep your wrist: bright objects drift across
// the band by azimuth; altitude sets their height. A haptic fires as each passes
// center, keyed to type. The ± buttons are the Digital-Crown magnitude filter.
export function CompassTab({ ctx }: { ctx: WatchCtx }) {
  const { palette, sky, location } = ctx;
  const { pointing, available } = useDevicePointing();
  const [magLimit, setMagLimit] = useState(2);
  const [bandW, setBandW] = useState(280);
  const bandH = 150;
  const centeredRef = useRef<Set<string>>(new Set());

  // Visible objects: planets + Moon from the live sky, plus bright stars resolved
  // for the observer/time, filtered by the crown magnitude limit.
  const objects = useMemo<SkyDot[]>(() => {
    const bodies: SkyDot[] = sky.visibleBodies
      .filter((b) => b.id !== "sun")
      .map((b) => ({
        id: b.id,
        name: b.name,
        kind: b.id === "moon" ? "moon" : "planet",
        azimuthDegrees: b.azimuthDegrees,
        altitudeDegrees: b.altitudeDegrees,
        magnitude: b.magnitude ?? 0
      }));
    const stars: SkyDot[] = computeStarPositions(BRIGHT_STARS, location, new Date(sky.whenISO))
      .filter((s: HorizontalStar) => s.aboveHorizon && s.name && s.magnitude <= magLimit)
      .map((s: HorizontalStar) => ({
        id: s.id,
        name: s.name as string,
        kind: "star",
        azimuthDegrees: s.azimuthDegrees,
        altitudeDegrees: s.altitudeDegrees,
        magnitude: s.magnitude
      }));
    return [...bodies, ...stars];
  }, [sky.visibleBodies, sky.whenISO, location, magLimit]);

  // Which objects are within the compass window right now, with screen positions.
  const placed = useMemo(() => {
    return objects
      .map((o) => ({ o, d: signedDelta(o.azimuthDegrees - pointing.azimuthDegrees) }))
      .filter(({ d }) => Math.abs(d) <= WINDOW_HALF)
      .map(({ o, d }) => ({
        o,
        d,
        x: bandW / 2 + (d / WINDOW_HALF) * (bandW / 2),
        y: bandH * (1 - Math.max(0, Math.min(90, o.altitudeDegrees)) / 90)
      }));
  }, [objects, pointing.azimuthDegrees, bandW]);

  // Fire a type-keyed haptic when an object newly enters the center threshold.
  useEffect(() => {
    const nowCentered = new Set<string>();
    for (const p of placed) {
      if (Math.abs(p.d) < CENTER_THRESHOLD) {
        nowCentered.add(p.o.id);
        if (!centeredRef.current.has(p.o.id)) {
          if (p.o.kind === "moon") tapHeavy();
          else if (p.o.kind === "planet") tapMedium();
          else tapLight();
        }
      }
    }
    centeredRef.current = nowCentered;
  }, [placed]);

  const centered = placed.filter((p) => Math.abs(p.d) < CENTER_THRESHOLD * 1.5);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: palette.accent }]}>
        {available ? `${Math.round(pointing.azimuthDegrees)}° ${azimuthToCompass(pointing.azimuthDegrees)}` : "Calibrating…"}
      </Text>

      <View
        style={[styles.band, { borderColor: palette.line, height: bandH }]}
        onLayout={(e: { nativeEvent: { layout: { width: number } } }) => setBandW(e.nativeEvent.layout.width)}
      >
        {/* center reticle */}
        <View style={[styles.reticle, { backgroundColor: palette.accent, left: bandW / 2 - 0.5 }]} />
        {placed.map(({ o, d, x, y }) => {
          const size = o.kind === "moon" ? 12 : o.kind === "planet" ? 9 : Math.max(3, 6 - o.magnitude);
          const isCentered = Math.abs(d) < CENTER_THRESHOLD * 1.5;
          return (
            <View key={o.id} style={[styles.dotWrap, { left: x - 30, top: y - 8 }]} pointerEvents="none">
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: o.kind === "star" ? palette.text : palette.accent
                  }}
                />
                {isCentered && <Text style={[styles.dotLabel, { color: palette.text }]} numberOfLines={1}>{o.name}</Text>}
              </View>
            </View>
          );
        })}
      </View>

      <Text style={[styles.target, { color: palette.dim }]}>
        {centered.length > 0 ? `On target: ${centered.map((c) => c.o.name).join(", ")}` : "Sweep your wrist across the sky"}
      </Text>

      <View style={styles.magRow}>
        <Text style={[styles.magLabel, { color: palette.dim }]}>Magnitude ≤ {magLimit}</Text>
        <View style={styles.magBtns}>
          <TouchableOpacity
            style={[styles.magBtn, { borderColor: palette.line }]}
            onPress={() => { tapLight(); setMagLimit((m) => Math.max(0, m - 1)); }}
          >
            <Text style={[styles.magBtnText, { color: palette.text }]}>− brighter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.magBtn, { borderColor: palette.line }]}
            onPress={() => { tapLight(); setMagLimit((m) => Math.min(4, m + 1)); }}
          >
            <Text style={[styles.magBtnText, { color: palette.text }]}>+ dimmer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 14, paddingTop: 8 },
  heading: { fontSize: 16, fontWeight: "900", textAlign: "center", marginBottom: 8, fontVariant: ["tabular-nums"] },
  band: { borderWidth: 1, borderRadius: 16, overflow: "hidden", position: "relative" },
  reticle: { position: "absolute", top: 0, bottom: 0, width: 1, opacity: 0.6 },
  dotWrap: { position: "absolute", width: 60, alignItems: "center" },
  dotLabel: { fontSize: 9, fontWeight: "700", marginTop: 2 },
  target: { fontSize: 11, textAlign: "center", marginTop: 10, lineHeight: 15 },
  magRow: { marginTop: 14, alignItems: "center", gap: 8 },
  magLabel: { fontSize: 12, fontWeight: "800" },
  magBtns: { flexDirection: "row", gap: 10 },
  magBtn: { borderWidth: 1, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14 },
  magBtnText: { fontSize: 12, fontWeight: "700" }
});
