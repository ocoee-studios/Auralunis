// SkyShareScreen.tsx
// Turn tonight's sky into a shareable card — wires the prebuilt SkyShareService
// (4 card styles, headline generation). Builds a "tonight" observation from the
// live sky, previews the styled card, and shares via the native sheet.

import React, { useMemo, useState } from "react";
import { Pressable, Share, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { ScreenShell } from "@/components/ScreenShell";
import { Starfield } from "@/components/Starfield";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import { buildShareCard, getShareStyles, type ShareCardStyle, type SkyObservation } from "@/services/SkyShareService";
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { computeTonightScore } from "@/services/TonightScoreService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import { useAuraLunisSettings } from "@/state/AuraLunisSettingsContext";

interface Props {
  onClose: () => void;
}

export function SkyShareScreen({ onClose }: Props) {
  const { location, status } = useObserverLocation();
  const { settings } = useAuraLunisSettings();
  const locationName = status === "fallback" ? "Default Location" : "Your Location";

  const [note, setNote] = useState("");
  const [style, setStyle] = useState<ShareCardStyle>("cosmic");
  const [includeLocation, setIncludeLocation] = useState(true);
  const [includeScore, setIncludeScore] = useState(true);
  const [includeSkyData, setIncludeSkyData] = useState(true);

  const styles4 = useMemo(() => getShareStyles(), []);

  const observation = useMemo<SkyObservation>(() => {
    const sky = computeTonightSky(location);
    const objects = sky.visibleBodies
      .filter((b) => b.id !== "sun" && b.altitudeDegrees > 0)
      .map((b) => b.name);
    // Clear-sky potential score (no live weather fetch on this screen) — labelled as such
    // below so the card never falsely claims the current weather is clear.
    const score = computeTonightScore(
      sky,
      { cloudPercent: 0, humidity: 50, tempCelsius: 15, description: "clear", source: "unavailable" },
      settings.skyQuality
    ).score;
    // Real, honest condition from the actual moon (not a fabricated cloud state).
    const conditions = sky.moonIlluminationPercent < 35 ? "Dark skies" : "Moonlit skies";
    return {
      id: "tonight",
      timestamp: new Date().toISOString(),
      locationName,
      location,
      note,
      objects,
      moonPhasePercent: sky.moonIlluminationPercent,
      tonightScore: score,
      conditions,
      tags: [],
    };
  }, [location, locationName, note, settings.skyQuality]);

  const card = useMemo(
    () => buildShareCard(observation, { style, includeLocation, includeScore, includeSkyData, includeTimestamp: true }),
    [observation, style, includeLocation, includeScore, includeSkyData]
  );

  async function share() {
    tapLight();
    const lines = [
      card.headline,
      card.subheadline,
      "",
      card.bodyText,
      "",
      ...(includeSkyData ? card.skyData : []),
      includeScore ? card.scoreLabel : "",
      "",
      card.brandLine,
    ].filter(Boolean);
    try {
      await Share.share({ message: lines.join("\n") });
    } catch { /* cancelled */ }
  }

  return (
    <ScreenShell title="Share Your Sky" subtitle="Sky Share" background={<Starfield />}>
      <Pressable style={s.backBtn} onPress={() => { tapLight(); onClose(); }} hitSlop={12}>
        <Text style={s.backText}>‹ Back</Text>
      </Pressable>

      {/* Live card preview */}
      <View style={[s.preview, style === "minimal" && s.previewMinimal]}>
        <Text style={s.cardHeadline}>{card.headline}</Text>
        <Text style={s.cardSub}>{card.subheadline}</Text>
        {card.bodyText ? <Text style={s.cardBody}>{card.bodyText}</Text> : null}
        {includeSkyData && style !== "minimal" && (
          <View style={s.cardData}>
            {card.skyData.map((d, i) => <Text key={i} style={s.cardDataLine}>{d}</Text>)}
          </View>
        )}
        {includeScore && <Text style={s.cardScore}>{card.scoreLabel}</Text>}
        <Text style={s.cardBrand}>{card.brandLine}</Text>
      </View>

      {/* Note */}
      <TextInput
        style={s.noteInput}
        value={note}
        onChangeText={setNote}
        placeholder="Add a note (what did you see tonight?)"
        placeholderTextColor={AuraLunisColors.faint}
        multiline
      />

      {/* Style picker */}
      <Text style={s.sectionLabel}>CARD STYLE</Text>
      <View style={s.styleRow}>
        {styles4.map((st) => (
          <Pressable
            key={st.id}
            onPress={() => { tapLight(); setStyle(st.id); }}
            style={[s.styleChip, style === st.id && s.styleChipOn]}
          >
            <Text style={[s.styleName, style === st.id && s.styleNameOn]}>{st.name}</Text>
          </Pressable>
        ))}
      </View>

      {/* Toggles */}
      <View style={s.toggles}>
        <ToggleRow label="Include location" value={includeLocation} onChange={setIncludeLocation} />
        <ToggleRow label="Include Tonight Score" value={includeScore} onChange={setIncludeScore} />
        <ToggleRow label="Include sky data" value={includeSkyData} onChange={setIncludeSkyData} />
      </View>

      <Pressable style={s.shareBtn} onPress={share}>
        <Text style={s.shareText}>Share Card</Text>
      </Pressable>
      <View style={{ height: 28 }} />
    </ScreenShell>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.toggleRow}>
      <Text style={s.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: AuraLunisColors.gold, false: "rgba(255,255,255,0.15)" }}
        thumbColor="#FFF"
      />
    </View>
  );
}

const s = StyleSheet.create({
  backBtn: { marginBottom: 10 },
  backText: { color: AuraLunisColors.gold, fontSize: 14, fontWeight: "700" },
  preview: {
    backgroundColor: "rgba(7,12,28,0.9)", borderRadius: 22, padding: 20, marginBottom: 16,
    borderWidth: 1.5, borderColor: AuraLunisColors.gold,
  },
  previewMinimal: { borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(3,8,22,0.95)" },
  cardHeadline: { color: AuraLunisColors.gold2, fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  cardSub: { color: AuraLunisColors.silver, fontSize: 12, marginTop: 6 },
  cardBody: { color: "#FFF", fontSize: 14, lineHeight: 20, marginTop: 12, fontStyle: "italic" },
  cardData: { marginTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)", paddingTop: 10, gap: 3 },
  cardDataLine: { color: AuraLunisColors.silver, fontSize: 12, fontVariant: ["tabular-nums"] },
  cardScore: { color: AuraLunisColors.gold, fontSize: 13, fontWeight: "800", marginTop: 12 },
  cardBrand: { color: AuraLunisColors.faint, fontSize: 11, marginTop: 14, letterSpacing: 1 },
  noteInput: {
    minHeight: 56, borderRadius: 12, padding: 12, color: "#FFF", backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1, borderColor: AuraLunisColors.borderSubtle, fontSize: 14, textAlignVertical: "top", marginBottom: 18,
  },
  sectionLabel: { color: AuraLunisColors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 2, marginBottom: 10 },
  styleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  styleChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  styleChipOn: { backgroundColor: "rgba(217,168,78,0.18)", borderColor: AuraLunisColors.gold },
  styleName: { color: AuraLunisColors.silver, fontSize: 13, fontWeight: "700" },
  styleNameOn: { color: AuraLunisColors.gold2 },
  toggles: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, paddingHorizontal: 14, marginBottom: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  toggleLabel: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  shareBtn: { borderRadius: 14, paddingVertical: 15, alignItems: "center", backgroundColor: AuraLunisColors.gold },
  shareText: { color: AuraLunisColors.cosmicBlack, fontWeight: "900", fontSize: 15 },
});
