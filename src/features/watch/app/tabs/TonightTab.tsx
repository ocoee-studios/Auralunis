import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { SkyBody } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { tapSelection } from "@/services/HapticService";
import type { WatchCtx } from "../WatchAppTheme";
import { bodyGlyph, lookGuidance, formatISOClock } from "../WatchFormat";

// Tab 2 — Tonight's Sky. One card per naked-eye body, brightest first; below-
// horizon bodies fall to the bottom, dimmed. All values are live from the ephemeris.
export function TonightTab({ ctx }: { ctx: WatchCtx }) {
  const { sky, palette } = ctx;

  const ordered = useMemo(() => {
    const bodies = sky.bodies.filter((b) => b.id !== "sun");
    return [...bodies].sort((a, b) => {
      if (a.aboveHorizon !== b.aboveHorizon) return a.aboveHorizon ? -1 : 1;
      return (a.magnitude ?? 99) - (b.magnitude ?? 99);
    });
  }, [sky.bodies]);

  const subText = (body: SkyBody): string => {
    if (body.id === "moon") return `${Math.round(sky.moonIlluminationPercent)}% illuminated`;
    return body.magnitude !== undefined ? `mag ${body.magnitude.toFixed(1)}` : "naked-eye";
  };

  const riseSet = (body: SkyBody): string | null => {
    if (body.id === "moon") return `Rise ${formatISOClock(sky.moon.riseISO)} · Set ${formatISOClock(sky.moon.setISO)}`;
    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={[styles.header, { color: palette.accent }]}>TONIGHT'S SKY</Text>
      {ordered.map((body) => {
        const dimmed = !body.aboveHorizon;
        return (
          <TouchableOpacity
            key={body.id}
            activeOpacity={0.8}
            onPress={tapSelection}
            style={[styles.card, { borderColor: palette.line, backgroundColor: palette.accentSoft }, dimmed && styles.cardDim]}
          >
            <View style={styles.cardHead}>
              <Text style={[styles.glyph, { color: palette.accent }]}>{bodyGlyph(body.id)}</Text>
              <Text style={[styles.name, { color: palette.text }]}>{body.name}</Text>
              <Text style={[styles.sub, { color: palette.dim }]}>{subText(body)}</Text>
            </View>
            {body.aboveHorizon ? (
              <>
                <Text style={[styles.coords, { color: palette.text }]}>
                  az {Math.round(body.azimuthDegrees)}°  ·  alt {Math.round(body.altitudeDegrees)}°
                </Text>
                <View style={[styles.divider, { backgroundColor: palette.line }]} />
                <Text style={[styles.guidance, { color: palette.dim }]}>
                  {lookGuidance(body.azimuthDegrees, body.altitudeDegrees)}
                </Text>
              </>
            ) : (
              <Text style={[styles.below, { color: palette.dim }]}>Below the horizon now</Text>
            )}
            {riseSet(body) ? <Text style={[styles.riseset, { color: palette.dim }]}>{riseSet(body)}</Text> : null}
          </TouchableOpacity>
        );
      })}
      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 14, paddingVertical: 8 },
  header: { fontSize: 11, fontWeight: "900", letterSpacing: 2, marginBottom: 8, textAlign: "center" },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 10 },
  cardDim: { opacity: 0.5 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  glyph: { fontSize: 18 },
  name: { fontSize: 16, fontWeight: "900", flex: 1 },
  sub: { fontSize: 11, fontWeight: "700" },
  coords: { fontSize: 13, fontWeight: "700", marginTop: 8, fontVariant: ["tabular-nums"] },
  divider: { height: 1, marginVertical: 8 },
  guidance: { fontSize: 12, lineHeight: 16 },
  below: { fontSize: 12, marginTop: 8 },
  riseset: { fontSize: 11, marginTop: 6, fontVariant: ["tabular-nums"] }
});
