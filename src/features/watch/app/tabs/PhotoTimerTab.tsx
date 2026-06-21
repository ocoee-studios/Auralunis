import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { tapLight, tapMedium, tapSuccess } from "@/services/HapticService";
import type { WatchCtx } from "../WatchAppTheme";
import { formatDuration } from "../WatchFormat";

const MIN_SEC = 30;
const MAX_SEC = 600;
const PRESETS: { label: string; seconds: number }[] = [
  { label: "500 Rule · 20s", seconds: 20 < MIN_SEC ? MIN_SEC : 20 },
  { label: "Milky Way · 2m", seconds: 120 },
  { label: "Star Trails · 5m", seconds: 300 }
];

// Tab 5 — Astrophotography Timer. Crown-adjustable exposure with a progress ring,
// haptics at the halfway point, T-10s, and completion. Stacking mode auto-repeats
// the exposure for N frames with a haptic between each.
export function PhotoTimerTab({ ctx }: { ctx: WatchCtx }) {
  const { palette } = ctx;
  const [duration, setDuration] = useState(120);
  const [remaining, setRemaining] = useState(120);
  const [running, setRunning] = useState(false);
  const [frames, setFrames] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(1);
  const firedHalf = useRef(false);
  const firedTen = useRef(false);

  // Pure 1-second tick — the updater stays side-effect-free (no haptics/setState
  // nesting), which is what React 18/19 requires and avoids double-fired haptics.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Side effects driven by the remaining count: cue haptics, advance stacking
  // frames, and stop at the end. Each haptic is latched by a ref so it fires once.
  useEffect(() => {
    if (!running) return;
    if (remaining <= duration / 2 && !firedHalf.current) { firedHalf.current = true; tapLight(); }
    if (remaining <= 10 && remaining > 0 && !firedTen.current) { firedTen.current = true; tapMedium(); }
    if (remaining <= 0) {
      tapSuccess();
      if (currentFrame < frames) {
        firedHalf.current = false;
        firedTen.current = false;
        setCurrentFrame((cf) => cf + 1);
        setRemaining(duration);
      } else {
        setRunning(false);
      }
    }
  }, [remaining, running, duration, frames, currentFrame]);

  const start = () => {
    tapMedium();
    firedHalf.current = false;
    firedTen.current = false;
    setCurrentFrame(1);
    setRemaining(duration);
    setRunning(true);
  };
  const stop = () => { tapLight(); setRunning(false); setRemaining(duration); setCurrentFrame(1); };

  const adjust = (delta: number) => {
    if (running) return;
    tapLight();
    setDuration((d) => {
      const next = Math.max(MIN_SEC, Math.min(MAX_SEC, d + delta));
      setRemaining(next);
      return next;
    });
  };

  const progress = running ? 1 - remaining / duration : 0;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.header, { color: palette.accent }]}>EXPOSURE TIMER</Text>

      <Text style={[styles.big, { color: palette.text }]}>{formatDuration(running ? remaining : duration)}</Text>

      <View style={[styles.track, { backgroundColor: palette.line }]}>
        <View style={[styles.fill, { backgroundColor: palette.accent, width: `${Math.round(progress * 100)}%` }]} />
      </View>

      {!running && (
        <View style={styles.adjustRow}>
          <TouchableOpacity style={[styles.adjBtn, { borderColor: palette.line }]} onPress={() => adjust(-30)}>
            <Text style={[styles.adjText, { color: palette.text }]}>−30s</Text>
          </TouchableOpacity>
          <Text style={[styles.adjRange, { color: palette.dim }]}>{MIN_SEC}s–{MAX_SEC / 60}m</Text>
          <TouchableOpacity style={[styles.adjBtn, { borderColor: palette.line }]} onPress={() => adjust(30)}>
            <Text style={[styles.adjText, { color: palette.text }]}>+30s</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: running ? "transparent" : palette.accent, borderColor: palette.accent }]}
        onPress={running ? stop : start}
      >
        <Text style={[styles.startText, { color: running ? palette.accent : palette.bg }]}>
          {running ? "STOP" : "START"}
        </Text>
      </TouchableOpacity>

      {/* Stacking */}
      <View style={[styles.stack, { borderColor: palette.line }]}>
        <Text style={[styles.stackTitle, { color: palette.dim }]}>
          Stacking · {frames} × {formatDuration(duration)}{frames > 1 ? `  (total ${formatDuration(frames * duration)})` : ""}
        </Text>
        <View style={styles.stackBtns}>
          <TouchableOpacity style={[styles.stackBtn, { borderColor: palette.line }]} onPress={() => { if (!running) { tapLight(); setFrames((f) => Math.max(1, f - 1)); } }}>
            <Text style={[styles.adjText, { color: palette.text }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.frameNum, { color: palette.text }]}>{running ? `${currentFrame}/${frames}` : frames}</Text>
          <TouchableOpacity style={[styles.stackBtn, { borderColor: palette.line }]} onPress={() => { if (!running) { tapLight(); setFrames((f) => Math.min(30, f + 1)); } }}>
            <Text style={[styles.adjText, { color: palette.text }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.label}
            disabled={running}
            style={[styles.preset, { borderColor: palette.line }]}
            onPress={() => { tapLight(); setDuration(p.seconds); setRemaining(p.seconds); }}
          >
            <Text style={[styles.presetText, { color: palette.dim }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingVertical: 8, alignItems: "center" },
  header: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 10 },
  big: { fontSize: 52, fontWeight: "900", fontVariant: ["tabular-nums"], marginBottom: 12 },
  track: { width: "100%", height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  adjustRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: 16 },
  adjBtn: { borderWidth: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16 },
  adjText: { fontSize: 14, fontWeight: "800" },
  adjRange: { fontSize: 11 },
  startBtn: { borderWidth: 1, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 50, marginTop: 18 },
  startText: { fontSize: 16, fontWeight: "900", letterSpacing: 1 },
  stack: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 18, width: "100%", alignItems: "center", gap: 10 },
  stackTitle: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  stackBtns: { flexDirection: "row", alignItems: "center", gap: 18 },
  stackBtn: { borderWidth: 1, borderRadius: 14, width: 40, height: 36, alignItems: "center", justifyContent: "center" },
  frameNum: { fontSize: 18, fontWeight: "900", fontVariant: ["tabular-nums"], minWidth: 40, textAlign: "center" },
  presets: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16, justifyContent: "center" },
  preset: { borderWidth: 1, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12 },
  presetText: { fontSize: 11, fontWeight: "700" }
});
