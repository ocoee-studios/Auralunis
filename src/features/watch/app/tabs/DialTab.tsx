import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CelestialDial } from "@/components/CelestialDial";
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { tapLight } from "@/services/HapticService";
import { watchTonightScore, type WatchCtx } from "../WatchAppTheme";
import { formatClock } from "../WatchFormat";

// Tab 1 — Celestial Dial. Reuses the living-astrolabe instrument and adds the
// Digital-Crown time-scrub (±12h) via drag on the dial or the ± buttons here.
export function DialTab({ ctx }: { ctx: WatchCtx }) {
  const { palette } = ctx;
  const [offset, setOffset] = useState(0); // minutes from now

  const scrubbedSky = useMemo(() => {
    if (offset === 0) return ctx.sky;
    return computeTonightSky(ctx.location, new Date(Date.now() + offset * 60000));
  }, [offset, ctx.sky, ctx.location]);

  const score = useMemo(() => watchTonightScore(scrubbedSky), [scrubbedSky]);
  const scrubLabel =
    offset === 0 ? "Now" : `${offset > 0 ? "+" : "−"}${Math.abs(offset / 60).toFixed(1)}h · ${formatClock(new Date(Date.now() + offset * 60000))}`;

  const step = (delta: number) => {
    tapLight();
    setOffset((o) => Math.max(-720, Math.min(720, o + delta)));
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.scrub, { color: palette.accent }]}>{scrubLabel}</Text>
      <CelestialDial
        sky={scrubbedSky}
        tonightScore={score.score}
        tonightLabel={score.label}
        onTimeScrub={(o) => setOffset(Math.round(o))}
        scrubOffsetMinutes={offset}
      />
      <View style={styles.crownRow}>
        <TouchableOpacity style={[styles.crownBtn, { borderColor: palette.accent }]} onPress={() => step(-60)}>
          <Text style={[styles.crownText, { color: palette.text }]}>−1h</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.crownBtn, { borderColor: palette.line }]}
          onPress={() => { tapLight(); setOffset(0); }}
        >
          <Text style={[styles.crownText, { color: palette.dim }]}>Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.crownBtn, { borderColor: palette.accent }]} onPress={() => step(60)}>
          <Text style={[styles.crownText, { color: palette.text }]}>+1h</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.hint, { color: palette.dim }]}>Drag the dial or use ±1h to scrub time (Digital Crown on watchOS).</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { alignItems: "center", paddingVertical: 8 },
  scrub: { fontSize: 13, fontWeight: "900", marginBottom: 2, fontVariant: ["tabular-nums"] },
  crownRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  crownBtn: { borderWidth: 1, borderRadius: 16, paddingVertical: 8, paddingHorizontal: 16 },
  crownText: { fontSize: 13, fontWeight: "800" },
  hint: { fontSize: 10, textAlign: "center", marginTop: 10, paddingHorizontal: 20, lineHeight: 14 }
});
