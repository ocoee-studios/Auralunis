// BirthSkyScreen.tsx
// "What did the sky look like the night you were born?" — the most shareable
// feature in AuraLunis. Enter a birthday (+ optional time), generate the birth-sky
// profile from BirthSkyService, and share the poetic cosmic signature.

import React, { useEffect, useState } from "react";
import { Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenShell } from "@/components/ScreenShell";
import { Starfield } from "@/components/Starfield";
import { BirthSkyCanvas } from "@/components/BirthSkyCanvas";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import { computeBirthSky, BIRTHDAY_STORAGE_KEY, type BirthSkyProfile } from "@/services/BirthSkyService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";

interface Props {
  onClose: () => void;
}

export function BirthSkyScreen({ onClose }: Props) {
  const { location, status } = useObserverLocation();
  const locationName = status === "fallback" ? "Default Location" : "Your Location";

  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:MM (optional)
  const [profile, setProfile] = useState<BirthSkyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preload the birthday saved during onboarding so the birth sky reveals immediately
  // without re-asking. Runs once on mount; location falls back to DEFAULT_OBSERVER.
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(BIRTHDAY_STORAGE_KEY)
      .then((iso) => {
        if (!active || !iso) return;
        setDate(iso.slice(0, 10));
        setTime(iso.slice(11, 16));
        try {
          setProfile(computeBirthSky(iso, location, locationName));
        } catch {
          /* ignore — the user can regenerate manually */
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generate() {
    tapLight();
    setError(null);
    const trimmed = date.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      setError("Enter your birth date as YYYY-MM-DD (e.g. 1990-06-21).");
      return;
    }
    const t = /^\d{1,2}:\d{2}$/.test(time.trim()) ? time.trim() : "12:00";
    const iso = `${trimmed}T${t.padStart(5, "0")}:00Z`;
    try {
      setProfile(computeBirthSky(iso, location, locationName));
    } catch {
      setError("Couldn't read that date. Try YYYY-MM-DD.");
    }
  }

  async function shareBirthSky() {
    if (!profile) return;
    tapLight();
    const visible = profile.planets.filter((p) => p.visible).map((p) => p.name);
    const message =
      `✦ My Birth Sky · ${profile.birthDate.slice(0, 10)} ✦\n\n` +
      `${profile.cosmicSignature}\n\n` +
      `☉ Sun sign: ${profile.sunSign}\n` +
      `☾ Moon: ${profile.moonPhase} (${profile.moonIllumination}%)\n` +
      `↑ Rising: ${profile.risingSign}\n` +
      (visible.length ? `🪐 Planets up: ${visible.join(", ")}\n` : "") +
      `\nDiscovered with AuraLunis`;
    try {
      await Share.share({ message });
    } catch { /* user cancelled */ }
  }

  return (
    <ScreenShell title="Your Birth Sky" subtitle="Birth Sky" background={<Starfield />}>
      <Pressable style={styles.backBtn} onPress={() => { tapLight(); onClose(); }} hitSlop={12}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <Text style={styles.intro}>
        The sky is different every night. Enter your birthday to reveal exactly what was overhead the moment you arrived.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>BIRTH DATE</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={AuraLunisColors.faint}
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
        />
        <Text style={styles.label}>BIRTH TIME (optional)</Text>
        <TextInput
          style={styles.input}
          value={time}
          onChangeText={setTime}
          placeholder="HH:MM (defaults to noon)"
          placeholderTextColor={AuraLunisColors.faint}
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
        />
        <Text style={styles.locationNote}>Location: {locationName}</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.generateBtn} onPress={generate}>
          <Text style={styles.generateText}>Generate My Birth Sky</Text>
        </Pressable>
      </View>

      {profile && (
        <View style={styles.resultCard}>
          <View style={styles.chartWrap}>
            <BirthSkyCanvas birthDate={new Date(profile.birthDate)} location={location} size={272} />
            <Text style={styles.chartCaption}>The sky over {locationName.toLowerCase()} the night you were born</Text>
          </View>
          <Text style={styles.signature}>“{profile.cosmicSignature}”</Text>
          <View style={styles.divider} />
          <Row label="Sun sign" value={profile.sunSign} />
          <Row label="Moon phase" value={`${profile.moonPhase} · ${profile.moonIllumination}%`} />
          <Row label="Rising" value={profile.risingSign} />
          <Row label="Dominant" value={profile.dominantConstellation} />
          <Row label="Seasonal sky" value={profile.seasonalSky} />
          <Row
            label="Planets up"
            value={
              profile.planets.filter((p) => p.visible).map((p) => p.name).join(", ") || "None above horizon"
            }
          />
          <Pressable style={styles.shareBtn} onPress={shareBirthSky}>
            <Text style={styles.shareText}>Share Birth Sky</Text>
          </Pressable>
        </View>
      )}
    </ScreenShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { marginBottom: 10 },
  backText: { color: AuraLunisColors.gold, fontSize: 14, fontWeight: "700" },
  intro: { color: AuraLunisColors.silver, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  form: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 18,
  },
  label: { color: AuraLunisColors.gold, fontSize: 9, fontWeight: "800", letterSpacing: 1.5, marginBottom: 6, marginTop: 6 },
  input: {
    borderRadius: 12, padding: 12, color: "#FFF", backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1, borderColor: AuraLunisColors.borderSubtle, fontSize: 15,
  },
  locationNote: { color: AuraLunisColors.faint, fontSize: 11, marginTop: 12 },
  error: { color: "#FF9166", fontSize: 12, marginTop: 10 },
  generateBtn: {
    marginTop: 16, borderRadius: 14, paddingVertical: 14, alignItems: "center",
    backgroundColor: AuraLunisColors.gold,
  },
  generateText: { color: AuraLunisColors.cosmicBlack, fontWeight: "900", fontSize: 14 },
  resultCard: {
    backgroundColor: "rgba(217,168,78,0.07)", borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: "rgba(217,168,78,0.22)", marginBottom: 28,
  },
  chartWrap: { alignItems: "center", marginBottom: 16 },
  chartCaption: { color: AuraLunisColors.faint, fontSize: 11, fontStyle: "italic", marginTop: 10, textAlign: "center" },
  signature: { color: AuraLunisColors.gold2, fontSize: 17, lineHeight: 25, fontWeight: "800", fontStyle: "italic" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginVertical: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, gap: 12 },
  rowLabel: { color: AuraLunisColors.muted, fontSize: 13 },
  rowValue: { color: "#FFF", fontSize: 13, fontWeight: "700", flexShrink: 1, textAlign: "right" },
  shareBtn: {
    marginTop: 18, borderRadius: 14, paddingVertical: 13, alignItems: "center",
    borderWidth: 1, borderColor: AuraLunisColors.gold,
  },
  shareText: { color: AuraLunisColors.gold2, fontWeight: "900", fontSize: 14 },
});
