// HomeScreen.tsx
// The living astrolabe — AuraLunis's home screen designed as a single
// interactive celestial instrument, not a stack of cards.
//
// Center: CelestialDial with clock hands, planet positions, sun vector, moon
// Below: golden hour countdown, time scrub, mode shortcuts, visible bodies
// All data from existing services (SkyEphemerisService, TonightScoreService, etc.)

import React, { useEffect, useMemo, useState } from "react";
import { formatClockTime, formatFullWeekdayDate } from "@/utils/formatting";
import {
  Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { ScreenShell } from "@/components/ScreenShell";
import { Starfield } from "@/components/Starfield";
import { GlassPanel } from "@/components/GlassPanel";
import { CelestialDial } from "@/components/CelestialDial";
import { AuraLunisColors } from "@/theme/tokens";
import { useAuraLunisVault } from "@/state/AuraLunisVaultContext";
import { useAuraLunisSettings } from "@/state/AuraLunisSettingsContext";
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import { fetchCurrentWeather, type WeatherSnapshot } from "@/services/WeatherService";
import { computeTonightScore } from "@/services/TonightScoreService";
import { computeStargazingIndex } from "@/services/StargazingIndexService";
import { StargazingIndexCard } from "@/components/StargazingIndexCard";
import { computeSunPosition, findNextGoldenEvents, formatCountdown } from "@/services/ChronoLightService";
import { generateCelestialMood } from "@/services/CelestialMoodService";
import { getTonightInsight } from "@/services/SkyIntelligenceService";
import { tapLight } from "@/services/HapticService";
import { scheduleSkyEventNotifications, scheduleCelestialEventNotifications } from "@/services/NotificationService";
import { CELESTIAL_EVENTS } from "@/data/CelestialEvents";
import { useNavigation } from "@react-navigation/native";

function formatClock(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [noteDraft, setNoteDraft] = useState("");
  const [scrubOffset, setScrubOffset] = useState(0);
  const { items, addNote } = useAuraLunisVault();
  const { settings } = useAuraLunisSettings();
  const { location, status } = useObserverLocation();

  // ── Sky data ──────────────────────────────────────────────────────────────
  const sky = useMemo(() => computeTonightSky(location), [location]);

  const [weather, setWeather] = useState<WeatherSnapshot>({
    cloudPercent: 30, humidity: 50, tempCelsius: 20, description: "loading…", source: "unavailable",
  });
  useEffect(() => {
    fetchCurrentWeather(location).then(setWeather).catch(() => {});
  }, [location]);

  useEffect(() => {
    if (settings.notificationsEnabled) {
      // Sky events cancel-all then reschedule; celestial events are additive and
      // must run AFTER so they survive the cancel (no duplicate stacking).
      scheduleSkyEventNotifications(sky)
        .then(() => scheduleCelestialEventNotifications(CELESTIAL_EVENTS))
        .catch(() => {});
    }
  }, [sky, settings.notificationsEnabled]);

  const tonightScore = useMemo(
    () => computeTonightScore(sky, weather, settings.skyQuality),
    [sky, weather, settings.skyQuality]
  );

  // ── Stargazing Index: one 0-100 number combining cloud, moon, seeing,
  // transparency. Seeing/transparency are estimated from cloud cover (same model
  // as AstroWeatherService) since the Home weather snapshot is lightweight.
  const stargazing = useMemo(() => {
    const moonAlt = sky.bodies.find((b) => b.id === "moon")?.altitudeDegrees ?? -90;
    const cloud = weather.cloudPercent;
    const seeingArcsec = cloud > 80 ? 4.5 : cloud > 50 ? 3.2 : cloud > 20 ? 2.2 : 1.5;
    const transparencyMag = Math.max(3, 6.6 - cloud / 28);
    return computeStargazingIndex(cloud, sky.moonIlluminationPercent, moonAlt, seeingArcsec, transparencyMag);
  }, [sky, weather]);

  // ── Displayed sky: live, or recomputed at the scrubbed time when the user
  // drags the dial. computeTonightSky returns a full TonightSky, so planet
  // positions and visibility actually move with the scrub (not just the clock).
  const displaySky = useMemo(() => {
    if (scrubOffset === 0) return sky;
    return computeTonightSky(location, new Date(Date.now() + scrubOffset * 60000));
  }, [sky, location, scrubOffset]);

  // ── Golden hour ──────────────────────────────────────────────────────────
  const sunPos = useMemo(() => computeSunPosition(location), [location]);
  const goldenEvents = useMemo(() => findNextGoldenEvents(location), [location]);
  const nextGolden = goldenEvents[0] ?? null;

  // Poetic mood headline/description/suggestion from the prebuilt mood engine.
  const mood = useMemo(() => {
    const sunAlt = sky.bodies.find((b) => b.id === "sun")?.altitudeDegrees ?? -90;
    const moonAlt = sky.bodies.find((b) => b.id === "moon")?.altitudeDegrees ?? -90;
    return generateCelestialMood({
      moonIllumination: sky.moonIlluminationPercent,
      moonAltitude: moonAlt,
      visiblePlanets: sky.visibleBodies
        .filter((b) => b.id !== "sun" && b.id !== "moon" && b.altitudeDegrees > 0)
        .map((b) => b.name),
      cloudCover: weather.cloudPercent,
      seeingScore: Math.max(1, Math.min(5, Math.round(5 - weather.cloudPercent / 25))),
      tonightScore: tonightScore.score,
      isGoldenHour: sunPos.isGoldenHour,
      isTwilight: sunAlt < -6 && sunAlt >= -18,
      isDarkNight: sunAlt < -18,
      activeMeteorShower: null,
      auroraKp: 0,
    });
  }, [sky, weather, tonightScore.score, sunPos.isGoldenHour]);

  // ── Tonight's hero insight — the ONE most interesting thing in the sky right
  // now (event > magnificent night > new/full moon > bright planets). A single
  // compelling headline at the very top, above the dial. Planet ids stay
  // lowercase ("jupiter"…) to match the service's checks.
  const tonightInsight = useMemo(() => {
    const moonAlt = sky.bodies.find((b) => b.id === "moon")?.altitudeDegrees ?? -90;
    const visiblePlanets = sky.visibleBodies
      .filter((b) => b.id !== "sun" && b.id !== "moon" && b.altitudeDegrees > 0)
      .map((b) => b.id);
    return getTonightInsight(
      sky.moonIlluminationPercent,
      moonAlt,
      weather.cloudPercent,
      visiblePlanets,
      stargazing.score,
    );
  }, [sky, weather, stargazing.score]);

  // ── Visible planets ──────────────────────────────────────────────────────
  const visibleBodies = displaySky.visibleBodies.filter(
    (b) => b.id !== "sun" && b.altitudeDegrees > 0
  );
  const belowBodies = displaySky.visibleBodies.filter(
    (b) => b.id !== "sun" && b.altitudeDegrees <= 0
  );

  // ── Quick note ───────────────────────────────────────────────────────────
  function saveQuickNote() {
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    tapLight();
    addNote(trimmed);
    setNoteDraft("");
    Alert.alert("Saved", "Note saved to your Cosmic Vault.");
  }

  return (
    <ScreenShell title="AuraLunis" subtitle="Home" background={<Starfield />}>

      {/* Date */}
      <Text style={styles.dateText}>
        {formatFullWeekdayDate(new Date()).toUpperCase()}
      </Text>

      {/* ── Tonight's hero insight — the ONE most interesting thing in the sky.
          Taps through to Sky Lens when the insight suggests an action. ── */}
      <TouchableOpacity
        activeOpacity={tonightInsight.action ? 0.85 : 1}
        onPress={() => {
          if (!tonightInsight.action) return;
          tapLight();
          navigation.navigate("Sky");
        }}
      >
        <GlassPanel accent style={styles.insightCard}>
          <View style={styles.insightRow}>
            <Text style={styles.insightIcon}>{tonightInsight.icon}</Text>
            <View style={styles.insightTextCol}>
              <Text style={styles.insightHeadline}>{tonightInsight.headline}</Text>
              <Text style={styles.insightDetail}>{tonightInsight.detail}</Text>
              {tonightInsight.action ? (
                <Text style={styles.insightAction}>{tonightInsight.action}  ›</Text>
              ) : null}
            </View>
          </View>
        </GlassPanel>
      </TouchableOpacity>

      {/* ── The Celestial Dial ── */}
      <CelestialDial
        sky={displaySky}
        tonightScore={tonightScore.score}
        tonightLabel={tonightScore.label}
        onTimeScrub={setScrubOffset}
        scrubOffsetMinutes={scrubOffset}
      />

      {/* Local time + observer */}
      <View style={styles.timeRow}>
        <Text style={styles.timeValue}>
          {scrubOffset === 0
            ? formatClockTime(new Date())
            : formatClockTime(new Date(Date.now() + scrubOffset * 60_000))
          }
        </Text>
        <Text style={styles.timeDot}>·</Text>
        <Text style={styles.timeLocation}>
          {scrubOffset === 0
            ? (status !== "fallback" ? "Your Location" : "Default Location")
            : `${scrubOffset > 0 ? "+" : ""}${Math.round(scrubOffset / 60)}h from now`
          }
        </Text>
      </View>

      {/* ── Stargazing Index — one number: should I go out tonight? ── */}
      <StargazingIndexCard index={stargazing} />

      {/* ── Golden Hour Countdown ── */}
      {nextGolden && (
        <View style={styles.goldenBar}>
          <View style={styles.goldenIcon}>
            <Text style={styles.goldenIconText}>☀</Text>
          </View>
          <View style={styles.goldenText}>
            <Text style={styles.goldenTitle}>
              {nextGolden.type === "dawn" ? "GOLDEN DAWN" : "GOLDEN DUSK"}
            </Text>
            <Text style={styles.goldenTime}>
              {sunPos.isGoldenHour ? "NOW" : formatCountdown(nextGolden.minutesUntil)}
            </Text>
            <Text style={styles.goldenSub}>
              Sun az {Math.round(sunPos.azimuth)}° · el {sunPos.elevation.toFixed(1)}°
            </Text>
          </View>
        </View>
      )}

      {/* ── Celestial Mood ── */}
      <View style={styles.moodCard}>
        <Text style={styles.moodHeadline}>{mood.emoji}  {mood.headline}</Text>
        <Text style={styles.moodDescription}>{mood.description}</Text>
        <Text style={styles.moodSuggestion}>{mood.suggestion}</Text>
      </View>

      {/* ── Visible Bodies ── */}
      <GlassPanel accent style={styles.bodiesCard}>
        <Text style={styles.sectionLabel}>VISIBLE TONIGHT</Text>
        {visibleBodies.map((body) => (
          <View key={body.id} style={styles.bodyRow}>
            <View style={styles.bodyLeft}>
              <View style={[styles.bodyDot, { backgroundColor: bodyColor(body.id) }]} />
              <Text style={styles.bodyName}>{body.name}</Text>
            </View>
            <Text style={styles.bodyData}>
              az {Math.round(body.azimuthDegrees)}° · {Math.round(body.altitudeDegrees)}°
            </Text>
          </View>
        ))}
        {belowBodies.filter(b => b.id !== "moon").map((body) => (
          <View key={body.id} style={styles.bodyRow}>
            <View style={styles.bodyLeft}>
              <View style={[styles.bodyDot, { backgroundColor: bodyColor(body.id), opacity: 0.3 }]} />
              <Text style={[styles.bodyName, { color: AuraLunisColors.faint }]}>{body.name}</Text>
            </View>
            <Text style={[styles.bodyData, { color: AuraLunisColors.faint }]}>below horizon</Text>
          </View>
        ))}
      </GlassPanel>

      {/* ── Mode Shortcuts ── */}
      <View style={styles.modeRow}>
        <ModeShortcut icon="◎" label="Constellations" sub="Overlay" onPress={() => navigation.navigate("Sky")} />
        <ModeShortcut icon="⊹" label="Sky Lens" sub="Point & find" onPress={() => navigation.navigate("Sky")} />
        <ModeShortcut icon="◈" label="Fleet" sub="Satellites" onPress={() => navigation.navigate("Sky")} />
      </View>

      {/* ── Cosmic Notes (compact) ── */}
      <GlassPanel style={styles.notesCard}>
        <Text style={styles.notesTitle}>Cosmic Notes</Text>
        <TextInput
          value={noteDraft}
          onChangeText={setNoteDraft}
          placeholder="What did you notice in the sky?"
          placeholderTextColor={AuraLunisColors.faint}
          multiline
          style={styles.noteInput}
        />
        <Pressable style={styles.saveBtn} onPress={saveQuickNote}>
          <Text style={styles.saveBtnText}>Save to Vault</Text>
        </Pressable>
        {items.length > 0 && (
          <Text style={styles.vaultCount}>{items.length} vault items</Text>
        )}
      </GlassPanel>
    </ScreenShell>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function bodyColor(id: string): string {
  const map: Record<string, string> = {
    moon: "#C0C6D4", venus: "#FFF6D6", jupiter: "#EF9F27",
    saturn: "#D9A84E", mars: "#F0997B", mercury: "#B4B2A9",
    uranus: "#9FE1CB", neptune: "#85B7EB",
  };
  return map[id] ?? AuraLunisColors.silver;
}

function ModeShortcut({ icon, label, sub, onPress }: { icon: string; label: string; sub: string; onPress?: () => void }) {
  return (
    <TouchableOpacity
      style={styles.modeCard}
      activeOpacity={0.8}
      onPress={() => { tapLight(); onPress?.(); }}
    >
      <Text style={styles.modeIcon}>{icon}</Text>
      <Text style={styles.modeName}>{label}</Text>
      <Text style={styles.modeSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  dateText: {
    fontSize: 10,
    color: AuraLunisColors.faint,
    letterSpacing: 1.5,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 12,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "900",
    color: AuraLunisColors.gold2,
  },
  timeDot: {
    color: AuraLunisColors.faint,
    fontSize: 14,
  },
  timeLocation: {
    fontSize: 10,
    color: AuraLunisColors.faint,
  },
  goldenBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: AuraLunisColors.surface,
    borderWidth: 1,
    borderColor: "rgba(239,159,39,0.25)",
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  goldenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(239,159,39,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,159,39,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  goldenIconText: { fontSize: 16 },
  goldenText: { flex: 1 },
  goldenTitle: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#EF9F27",
  },
  goldenTime: {
    fontSize: 20,
    fontWeight: "900",
    color: AuraLunisColors.gold2,
  },
  goldenSub: {
    fontSize: 9,
    color: AuraLunisColors.faint,
    marginTop: 1,
  },
  insightCard: {
    marginBottom: 12,
    padding: 16,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  insightIcon: {
    fontSize: 30,
    marginRight: 12,
    marginTop: 1,
  },
  insightTextCol: {
    flex: 1,
  },
  insightHeadline: {
    fontSize: 17,
    fontWeight: "900",
    color: AuraLunisColors.gold2,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  insightDetail: {
    fontSize: 13,
    color: AuraLunisColors.silver,
    lineHeight: 19,
    marginTop: 5,
  },
  insightAction: {
    fontSize: 12,
    fontWeight: "800",
    color: AuraLunisColors.gold,
    marginTop: 10,
    letterSpacing: 0.2,
  },
  moodCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "rgba(217,168,78,0.06)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.16)",
  },
  moodHeadline: {
    fontSize: 16,
    fontWeight: "900",
    color: AuraLunisColors.gold2,
    letterSpacing: -0.3,
  },
  moodDescription: {
    fontSize: 13,
    color: AuraLunisColors.silver,
    lineHeight: 20,
    marginTop: 6,
  },
  moodSuggestion: {
    fontSize: 11,
    color: AuraLunisColors.muted,
    marginTop: 8,
    fontWeight: "600",
  },
  bodiesCard: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 2,
    color: AuraLunisColors.gold,
    marginBottom: 8,
  },
  bodyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: AuraLunisColors.borderFaint,
  },
  bodyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 1,
  },
  bodyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bodyName: {
    fontSize: 12,
    fontWeight: "700",
    color: AuraLunisColors.silver,
    flexShrink: 1,
  },
  bodyData: {
    fontSize: 10,
    color: AuraLunisColors.gold,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
    marginLeft: 8,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  modeCard: {
    flex: 1,
    backgroundColor: AuraLunisColors.surface,
    borderWidth: 1,
    borderColor: AuraLunisColors.borderGold,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  modeIcon: {
    fontSize: 20,
    color: AuraLunisColors.gold,
    marginBottom: 4,
  },
  modeName: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: AuraLunisColors.gold,
    textAlign: "center",
  },
  modeSub: {
    fontSize: 8,
    color: AuraLunisColors.faint,
    marginTop: 2,
  },
  notesCard: {
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: AuraLunisColors.gold2,
    marginBottom: 8,
  },
  noteInput: {
    minHeight: 60,
    borderRadius: 12,
    padding: 10,
    color: AuraLunisColors.silver,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
    borderColor: AuraLunisColors.borderSubtle,
    textAlignVertical: "top",
    fontSize: 13,
  },
  saveBtn: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: AuraLunisColors.gold,
  },
  saveBtnText: {
    color: AuraLunisColors.cosmicBlack,
    fontWeight: "900",
    fontSize: 13,
  },
  vaultCount: {
    color: AuraLunisColors.faint,
    fontSize: 10,
    textAlign: "center",
    marginTop: 8,
  },
});
