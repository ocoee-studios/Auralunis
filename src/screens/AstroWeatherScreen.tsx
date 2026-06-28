// AstroWeatherScreen.tsx
// Tonight's observing forecast — a GO / MAYBE / STAY IN verdict, the best clear
// window, and an hour-by-hour breakdown (cloud, seeing, transparency). Driven by
// the prebuilt AstroWeatherService (Open-Meteo, with a simulated fallback).

import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenShell } from "@/components/ScreenShell";
import { Starfield } from "@/components/Starfield";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import { fetchAstroWeather, type AstroWeatherForecast, type AstroWeatherHour } from "@/services/AstroWeatherService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";

interface Props {
  onClose: () => void;
}

const VERDICT_COLORS: Record<string, string> = {
  GO: AuraLunisColors.green,
  MAYBE: AuraLunisColors.gold2,
  "STAY IN": "#FF6A4A",
};

export function AstroWeatherScreen({ onClose }: Props) {
  const { location, status } = useObserverLocation();
  const locationName = status === "fallback" ? "Default Location" : "Your Location";
  const [forecast, setForecast] = useState<AstroWeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchAstroWeather(location, locationName)
      .then((f) => { if (alive) { setForecast(f); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [location.latitudeDegrees, location.longitudeDegrees]);

  const inBestWindow = (h: AstroWeatherHour) =>
    !!forecast?.bestWindow && h.time >= forecast.bestWindow.start && h.time <= forecast.bestWindow.end;

  const verdict = forecast?.tonightVerdict ?? "—";
  const verdictColor = VERDICT_COLORS[verdict] ?? AuraLunisColors.gold;

  return (
    <ScreenShell title="Astro Weather" subtitle="Tonight" background={<Starfield />}>
      <Pressable style={styles.backBtn} onPress={() => { tapLight(); onClose(); }} hitSlop={12}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={AuraLunisColors.gold} />
          <Text style={styles.loadingText}>Reading tonight's sky…</Text>
        </View>
      ) : forecast ? (
        <>
          {/* Verdict */}
          <View style={[styles.verdictCard, { borderColor: verdictColor }]}>
            <Text style={styles.verdictLabel}>TONIGHT</Text>
            <Text style={[styles.verdict, { color: verdictColor }]}>{verdict}</Text>
            <Text style={styles.summary}>{forecast.summary}</Text>
          </View>

          {/* Best window */}
          {forecast.bestWindow && (
            <View style={styles.bestWindow}>
              <Text style={styles.bestLabel}>★ BEST WINDOW</Text>
              <Text style={styles.bestValue}>
                {forecast.bestWindow.start} – {forecast.bestWindow.end} · score {forecast.bestWindow.score}
              </Text>
            </View>
          )}

          {/* Hour-by-hour */}
          <Text style={styles.sectionLabel}>HOUR BY HOUR</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourRow}>
            {forecast.hours.map((h) => {
              const best = inBestWindow(h);
              return (
                <View key={h.time} style={[styles.hourCard, best && styles.hourCardBest]}>
                  <Text style={[styles.hourLabel, best && { color: AuraLunisColors.gold2 }]}>{h.hourLabel}</Text>
                  <Text style={[styles.hourScore, { color: scoreColor(h.overallScore) }]}>{h.overallScore}</Text>
                  <Text style={styles.hourVerdict}>{h.overallLabel}</Text>
                  <View style={styles.hourDivider} />
                  <Metric label="Cloud" value={`${h.cloudCoverPercent}%`} />
                  <Metric label="Seeing" value={`${h.seeingScore}/5`} />
                  <Metric label="Trans" value={`${h.transparencyScore}/5`} />
                  {h.isDark && <Text style={styles.darkTag}>● dark</Text>}
                </View>
              );
            })}
          </ScrollView>

          <Text style={styles.footnote}>
            {forecast.locationName} · forecast {status === "fallback" ? "(simulated — enable location for your sky)" : "from Open-Meteo"}
          </Text>
        </>
      ) : (
        <Text style={styles.summary}>Couldn't load the forecast. Check your connection and try again.</Text>
      )}
    </ScreenShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function scoreColor(s: number): string {
  if (s >= 70) return AuraLunisColors.green;
  if (s >= 45) return AuraLunisColors.gold2;
  return "#FF6A4A";
}

const styles = StyleSheet.create({
  backBtn: { marginBottom: 10 },
  backText: { color: AuraLunisColors.gold, fontSize: 14, fontWeight: "700" },
  loading: { alignItems: "center", paddingVertical: 60, gap: 14 },
  loadingText: { color: AuraLunisColors.muted, fontSize: 13 },
  verdictCard: {
    backgroundColor: "rgba(7,18,37,0.6)", borderRadius: 22, borderWidth: 1.5,
    padding: 22, alignItems: "center", marginBottom: 14,
  },
  verdictLabel: { color: AuraLunisColors.faint, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  verdict: { fontSize: 46, fontWeight: "900", letterSpacing: -1, marginTop: 4 },
  summary: { color: AuraLunisColors.silver, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 8 },
  bestWindow: {
    backgroundColor: "rgba(217,168,78,0.1)", borderRadius: 14, borderWidth: 1,
    borderColor: "rgba(217,168,78,0.3)", padding: 12, marginBottom: 18,
  },
  bestLabel: { color: AuraLunisColors.gold, fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  bestValue: { color: AuraLunisColors.gold2, fontSize: 15, fontWeight: "800", marginTop: 3 },
  sectionLabel: { color: AuraLunisColors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 2, marginBottom: 10 },
  hourRow: { gap: 8, paddingBottom: 4 },
  hourCard: {
    width: 92, borderRadius: 14, padding: 10, alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  hourCardBest: { borderColor: AuraLunisColors.gold, backgroundColor: "rgba(217,168,78,0.1)" },
  hourLabel: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  hourScore: { fontSize: 22, fontWeight: "900", marginTop: 4 },
  hourVerdict: { color: AuraLunisColors.muted, fontSize: 9, fontWeight: "700" },
  hourDivider: { height: 1, alignSelf: "stretch", backgroundColor: "rgba(255,255,255,0.08)", marginVertical: 8 },
  metric: { flexDirection: "row", justifyContent: "space-between", alignSelf: "stretch", paddingVertical: 2 },
  metricLabel: { color: AuraLunisColors.faint, fontSize: 10 },
  metricValue: { color: AuraLunisColors.silver, fontSize: 10, fontWeight: "700" },
  darkTag: { color: AuraLunisColors.gold2, fontSize: 8, marginTop: 6, fontWeight: "700" },
  footnote: { color: AuraLunisColors.faint, fontSize: 11, marginTop: 16, marginBottom: 28, textAlign: "center" },
});
