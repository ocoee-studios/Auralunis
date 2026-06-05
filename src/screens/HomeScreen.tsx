import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenShell } from "@/components/ScreenShell";
import { FeatureCard } from "@/components/FeatureCard";
import { GlassPanel } from "@/components/GlassPanel";
import { AstrolabePreview } from "@/components/AstrolabePreview";
import { ChronauraColors } from "@/theme/tokens";
import { useChronauraVault } from "@/state/ChronauraVaultContext";
import { useChronauraSettings } from "@/state/ChronauraSettingsContext";
import { TimeScrubMatrixPanel } from "@/features/aura-pro/TimeScrubMatrixPanel";
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import { fetchCurrentWeather, type WeatherSnapshot } from "@/services/WeatherService";
import { computeTonightScore } from "@/services/TonightScoreService";
import { scheduleSkyEventNotifications } from "@/services/NotificationService";

function formatClock(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function HomeScreen() {
  const [soundBathOn, setSoundBathOn] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [timeOffsetDays, setTimeOffsetDays] = useState(0);
  const { items, addItem, addNote } = useChronauraVault();
  const { settings } = useChronauraSettings();

  const { location, status } = useObserverLocation();
  const sky = useMemo(() => computeTonightSky(location), [location]);

  const [weather, setWeather] = useState<WeatherSnapshot>({
    cloudPercent: 30, humidity: 50, tempCelsius: 20, description: "loading…", source: "unavailable"
  });
  useEffect(() => {
    fetchCurrentWeather(location).then(setWeather).catch(() => {});
  }, [location]);

  // Schedule sunset + moonrise local notifications when sky data is ready.
  useEffect(() => {
    if (settings.notificationsEnabled) {
      scheduleSkyEventNotifications(sky).catch(() => {});
    }
  }, [sky, settings.notificationsEnabled]);

  const tonightScore = useMemo(
    () => computeTonightScore(sky, weather, settings.skyQuality),
    [sky, weather, settings.skyQuality]
  );

  const planetsVisible = sky.visibleBodies
    .filter((body) => body.id !== "sun" && body.id !== "moon")
    .map((body) => body.name);
  const skySummary =
    (planetsVisible.length
      ? `${planetsVisible.join(", ")} visible now`
      : "No naked-eye planets above the horizon") +
    ` · Moon ${sky.moonIlluminationPercent}% · Next moonrise ${formatClock(sky.moon.riseISO)}`;

  function saveQuickNote() {
    const trimmed = noteDraft.trim();

    if (!trimmed) {
      Alert.alert("Add a note", "Write a short observation before saving it to your local prototype Vault.");
      return;
    }

    addNote(trimmed);
    setNoteDraft("");
    Alert.alert("Saved", "Your cosmic note was saved locally in the prototype Vault.");
  }

  return (
    <ScreenShell title="Living Astrolabe" subtitle="Home">
      <AstrolabePreview sky={sky} />

      <GlassPanel accent style={{ marginBottom: 12 }}>
        <Text style={styles.summaryTitle}>Tonight Score · {tonightScore.score}/100 · {tonightScore.label}</Text>
        <Text style={styles.summaryCopy}>{skySummary}</Text>
        {status === "fallback" ? (
          <Text style={styles.summaryHint}>
            Showing a default location. Enable location access for your exact sky.
          </Text>
        ) : null}
        <Pressable style={styles.compactButton} onPress={() => fetchCurrentWeather(location).then(setWeather).catch(() => {})}>
          <Text style={styles.compactButtonText}>Refresh Tonight Score</Text>
        </Pressable>
      </GlassPanel>

      <GlassPanel style={{ marginBottom: 12 }}>
        <Text style={styles.noteTitle}>Cosmic Notes</Text>
        <Text style={styles.noteCopy}>Save observations, ritual thoughts, dreams, or LifeSky moments locally.</Text>
        <TextInput
          value={noteDraft}
          onChangeText={setNoteDraft}
          placeholder="What did you notice in the sky?"
          placeholderTextColor={ChronauraColors.muted}
          multiline
          style={styles.input}
        />
        <Pressable style={styles.primaryButton} onPress={saveQuickNote}>
          <Text style={styles.primaryButtonText}>Save Note to Vault</Text>
        </Pressable>
        <Text style={styles.vaultCount}>{items.length} locally saved prototype Vault items</Text>
      </GlassPanel>

      <FeatureCard
        title="Daily Cosmic Alignment"
        description="A daily ritual insight tied to the current sky. Today: build structure around the ideas that keep returning."
        actionLabel="Generate Insight"
        onPress={() => Alert.alert("Daily Cosmic Alignment", "Saturn steadies the day. Choose one meaningful task and give it a clear boundary.")}
      />

      <FeatureCard
        title="Celestial Alarms"
        description="Sunrise, moonrise, Venus visible, stargazing window, and Lunar Wind-Down reminders."
        actionLabel="Add Moonrise Alarm"
        onPress={() => Alert.alert("Celestial Alarm", "Moonrise reminder prepared for 20 minutes before visibility. Native notifications connect during device integration.")}
      />

      <FeatureCard
        title="Tonight’s Ritual"
        description="Find the Moon, listen to Saturn, save one note, and begin a three-minute Astral Breath."
        actionLabel="Begin Ritual"
        onPress={() => Alert.alert("Tonight’s Ritual", "Step 1: open Sky Lens or Manual Sky Map and locate the Moon.")}
      />

      <TimeScrubMatrixPanel />

      <FeatureCard
        title="Cosmic Steering Wheel"
        description={`Legacy quick-scrub shortcut offset: ${timeOffsetDays} day${Math.abs(timeOffsetDays) === 1 ? "" : "s"}.`}
        actionLabel="Quick Scrub Forward One Day"
        onPress={() => setTimeOffsetDays((previous) => previous + 1)}
      />

      <FeatureCard
        title="LifeSky Timeline"
        description="Save a meaningful moment with its exact sky-state snapshot."
        actionLabel="Save LifeSky Moment"
        onPress={() => {
          addItem({ type: "lifesky", title: "LifeSky Moment", detail: `Saved at time offset ${timeOffsetDays} days.` });
          Alert.alert("LifeSky", "A local prototype LifeSky moment was saved.");
        }}
      />

      <FeatureCard
        title="Astral Sound Bath"
        description={`Resonant Geometry prototype. Current state: ${soundBathOn ? "Playing" : "Paused"}.`}
        actionLabel={soundBathOn ? "Pause Sound Bath" : "Play Sound Bath"}
        onPress={() => setSoundBathOn((previous) => !previous)}
      />

      <FeatureCard
        title="Cosmic Vault"
        description="Saved notes, LifeSky moments, lessons, captures, objects, and Astral Seals."
        actionLabel="Review Vault Summary"
        onPress={() => Alert.alert("Cosmic Vault", `${items.length} local prototype items are currently saved.`)}
        status={`${items.length} items`}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summary: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(212,175,55,0.10)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.22)",
    marginBottom: 12
  },
  summaryTitle: { color: "#FFF", fontSize: 21, fontWeight: "900" },
  summaryCopy: { color: ChronauraColors.silver, fontSize: 13, lineHeight: 19, marginTop: 6 },
  summaryHint: { color: ChronauraColors.muted, fontSize: 11, lineHeight: 16, marginTop: 6 },
  compactButton: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "rgba(212,175,55,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.22)"
  },
  compactButtonText: { color: "#FFF", fontWeight: "800" },
  noteCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12
  },
  noteTitle: { color: "#FFF", fontSize: 19, fontWeight: "900" },
  noteCopy: { color: ChronauraColors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  input: {
    minHeight: 84,
    borderRadius: 16,
    marginTop: 12,
    padding: 12,
    color: "#FFF",
    backgroundColor: "rgba(0,0,0,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    textAlignVertical: "top"
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: ChronauraColors.gold2
  },
  primaryButtonText: { color: "#17100A", fontWeight: "900" },
  vaultCount: { color: ChronauraColors.gold2, fontSize: 11, marginTop: 10 }
});
