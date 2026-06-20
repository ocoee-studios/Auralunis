// HomeScreen.tsx
// The living astrolabe — AuraLunis's home screen designed as a single
// interactive celestial instrument, not a stack of cards.
//
// Center: CelestialDial with clock hands, planet positions, sun vector, moon
// Below: golden hour countdown, time scrub, mode shortcuts, visible bodies
// All data from existing services (SkyEphemerisService, TonightScoreService, etc.)

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { ScreenShell } from "@/components/ScreenShell";
import { GlassPanel } from "@/components/GlassPanel";
import { CelestialDial } from "@/components/CelestialDial";
import { AuraLunisColors } from "@/theme/tokens";
import { useAuraLunisVault } from "@/state/AuraLunisVaultContext";
import { useAuraLunisSettings } from "@/state/AuraLunisSettingsContext";
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import { fetchCurrentWeather, type WeatherSnapshot } from "@/services/WeatherService";
import { computeTonightScore } from "@/services/TonightScoreService";
import { computeSunPosition, findNextGoldenEvents, formatCountdown } from "@/services/ChronoLightService";
import { tapLight } from "@/services/HapticService";
import { computeSkyAtOffset } from "@/services/TimeScrubService";
import { scheduleSkyEventNotifications } from "@/services/NotificationService";

function formatClock(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function HomeScreen() {
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
      scheduleSkyEventNotifications(sky).catch(() => {});
    }
  }, [sky, settings.notificationsEnabled]);

  const tonightScore = useMemo(
    () => computeTonightScore(sky, weather, settings.skyQuality),
    [sky, weather, settings.skyQuality]
  );

  // ── Scrubbed sky (when user drags the dial) ──────────────────────────
  const scrubbedSky = useMemo(() => {
    if (scrubOffset === 0) return null;
    return computeSkyAtOffset(location, scrubOffset);
  }, [location, scrubOffset]);

  // Use scrubbed sky when active, live sky otherwise
  const displaySky = scrubbedSky
    ? { ...sky, visibleBodies: sky.visibleBodies } // TODO: map scrubbedSky planets back to TonightSky format
    : sky;

  // ── Golden hour ──────────────────────────────────────────────────────────
  const sunPos = useMemo(() => computeSunPosition(location), [location]);
  const goldenEvents = useMemo(() => findNextGoldenEvents(location), [location]);
  const nextGolden = goldenEvents[0] ?? null;

  // ── Visible planets ──────────────────────────────────────────────────────
  const visibleBodies = sky.visibleBodies.filter(
    (b) => b.id !== "sun" && b.altitudeDegrees > 0
  );
  const belowBodies = sky.visibleBodies.filter(
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
    <ScreenShell title="AuraLunis" subtitle="Home">

      {/* Date */}
      <Text style={styles.dateText}>
        {new Date().toLocaleDateString("en-US", {
          weekday: "long", month: "long", day: "numeric",
        }).toUpperCase()}
      </Text>

      {/* ── The Celestial Dial ── */}
      <CelestialDial
        sky={sky}
        tonightScore={tonightScore.score}
        tonightLabel={tonightScore.label}
        onTimeScrub={setScrubOffset}
        scrubOffsetMinutes={scrubOffset}
      />

      {/* Local time + observer */}
      <View style={styles.timeRow}>
        <Text style={styles.timeValue}>
          {scrubOffset === 0
            ? new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
            : new Date(Date.now() + scrubOffset * 60_000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
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

      {/* ── Sky Summary ── */}
      <Text style={styles.skySummary}>
        {visibleBodies.length > 0
          ? `${visibleBodies.map(b => b.name).join(", ")} visible`
          : "No naked-eye planets above the horizon"}
        {" · Moon "}
        {sky.moonIlluminationPercent}%
      </Text>

      {/* ── Visible Bodies ── */}
      <GlassPanel accent style={styles.bodiesCard}>
        <Text style={styles.sectionLabel}>VISIBLE TONIGHT</Text>
        {visibleBodies.map((body) => (
          <View key={body.id} style={styles.bodyRow}>
            <View style={[styles.bodyDot, { backgroundColor: bodyColor(body.id) }]} />
            <Text style={styles.bodyName}>{body.name}</Text>
            <Text style={styles.bodyData}>
              az {Math.round(body.azimuthDegrees)}° · {Math.round(body.altitudeDegrees)}°
            </Text>
          </View>
        ))}
        {belowBodies.filter(b => b.id !== "moon").map((body) => (
          <View key={body.id} style={styles.bodyRow}>
            <View style={[styles.bodyDot, { backgroundColor: bodyColor(body.id), opacity: 0.3 }]} />
            <Text style={[styles.bodyName, { color: AuraLunisColors.faint }]}>{body.name}</Text>
            <Text style={[styles.bodyData, { color: AuraLunisColors.faint }]}>below horizon</Text>
          </View>
        ))}
      </GlassPanel>

      {/* ── Mode Shortcuts ── */}
      <View style={styles.modeRow}>
        <ModeShortcut icon="◎" label="Constellations" sub="Overlay" />
        <ModeShortcut icon="⊹" label="AR Sky" sub="Point & find" />
        <ModeShortcut icon="◈" label="Fleet" sub="Satellites" />
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

function ModeShortcut({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <TouchableOpacity style={styles.modeCard}>
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
    marginBottom: 10,
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
    marginBottom: 10,
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
  skySummary: {
    fontSize: 10,
    color: AuraLunisColors.muted,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 16,
  },
  bodiesCard: {
    marginBottom: 10,
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
    gap: 8,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: AuraLunisColors.borderFaint,
  },
  bodyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  bodyName: {
    fontSize: 12,
    fontWeight: "700",
    color: AuraLunisColors.silver,
    flex: 1,
  },
  bodyData: {
    fontSize: 10,
    color: AuraLunisColors.gold,
  },
  modeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
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
