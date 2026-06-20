import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { tapSelection } from "@/services/HapticService";
import { ScreenShell } from "@/components/ScreenShell";
import { FeatureCard } from "@/components/FeatureCard";
import { GlassPanel } from "@/components/GlassPanel";
import { LogoMark } from "@/components/LogoMark";
import { AuraLunisColors } from "@/theme/tokens";
import { useAuraLunisSettings } from "@/state/AuraLunisSettingsContext";
import { DeskObeliskPreview } from "@/features/future/DeskObeliskPreview";
import { SovereignSigilPreview } from "@/features/future/SovereignSigilPreview";
import {
  defaultWatchComplications,
  watchComplicationOptions,
  watchFaceOptions,
  watchThemeOptions,
  type WatchComplicationId,
  type WatchFaceId,
  type WatchThemeId
} from "@/features/watch/WatchFaceCatalog";

const WATCH_COMPLICATION_LIMIT = 4;

function themePreview(themeId: WatchThemeId) {
  switch (themeId) {
    case "moon_silver":
      return {
        face: "#10141F",
        border: "rgba(192,198,212,0.58)",
        accent: "#E6EAF2",
        soft: "rgba(192,198,212,0.15)"
      };
    case "deep_space":
      return {
        face: "#04111D",
        border: "rgba(98,207,255,0.52)",
        accent: "#9EE8FF",
        soft: "rgba(98,207,255,0.14)"
      };
    case "soft_moon":
      return {
        face: "#151827",
        border: "rgba(210,220,255,0.46)",
        accent: "#D7DFFF",
        soft: "rgba(210,220,255,0.13)"
      };
    case "liquid_obsidian":
      return {
        face: "#020309",
        border: "rgba(217,168,78,0.66)",
        accent: "#FFF0B8",
        soft: "rgba(217,168,78,0.18)"
      };
    default:
      return {
        face: "#070912",
        border: "rgba(217,168,78,0.52)",
        accent: AuraLunisColors.gold2,
        soft: "rgba(217,168,78,0.15)"
      };
  }
}

function FaceBody({
  faceId,
  accent
}: {
  faceId: WatchFaceId;
  accent: string;
}) {
  switch (faceId) {
    case "moon_keeper":
      return (
        <>
          <Text style={[styles.faceMoonLarge, { color: accent }]}>☾</Text>
          <Text style={styles.faceTitle}>MOON KEEPER</Text>
          <Text style={styles.facePrimary}>78%</Text>
          <Text style={styles.faceSmall}>Waning Gibbous · Moonrise 8:12 PM</Text>
        </>
      );
    case "tonights_sky":
      return (
        <>
          <LogoMark size={58} />
          <Text style={styles.faceTitle}>TONIGHT’S SKY</Text>
          <Text style={styles.facePrimary}>91</Text>
          <Text style={styles.faceSmall}>Venus visible · Orion best after 9 PM</Text>
        </>
      );
    case "deep_sky_portal":
      return (
        <>
          <Text style={[styles.faceGalaxy, { color: accent }]}>✦ 〰 ✧</Text>
          <Text style={styles.faceTitle}>DEEP SKY PORTAL</Text>
          <Text style={styles.facePrimarySmall}>MILKY WAY CORE</Text>
          <Text style={styles.faceSmall}>Sagittarius · Best from dark skies</Text>
        </>
      );
    case "daily_alignment":
      return (
        <>
          <LogoMark size={56} />
          <Text style={styles.faceTitle}>DAILY ALIGNMENT</Text>
          <Text style={styles.faceInsight}>Choose one meaningful task and give it a clear boundary.</Text>
        </>
      );
    case "minimal_auralunis":
      return (
        <>
          <LogoMark size={66} />
          <Text style={styles.faceTitle}>AURALUNIS</Text>
          <Text style={styles.faceTime}>4:42</Text>
          <Text style={styles.faceSmall}>☾ 78% · Venus visible</Text>
        </>
      );
    case "sovereign_sigil":
      return (
        <>
          <Text style={[styles.faceSigil, { color: accent }]}>✧ ◇ ✦ ◇ ✧</Text>
          <Text style={styles.faceTitle}>SOVEREIGN SIGIL</Text>
          <Text style={styles.faceInsight}>Future personalized crest preview</Text>
        </>
      );
    default:
      return (
        <>
          <LogoMark size={76} />
          <Text style={styles.faceTitle}>AURALUNIS</Text>
          <Text style={styles.facePrimary}>91</Text>
          <Text style={styles.faceSmall}>Tonight Score · ☾ Waning Gibbous</Text>
        </>
      );
  }
}

export function WatchScreen() {
  const { settings, updateSetting } = useAuraLunisSettings();
  const selectedFace = watchFaceOptions.find((face) => face.id === settings.selectedWatchFaceId) ?? watchFaceOptions[0];
  const selectedTheme = watchThemeOptions.find((theme) => theme.id === settings.selectedWatchThemeId) ?? watchThemeOptions[0];
  const previewTheme = themePreview(selectedTheme.id);

  function selectFace(faceId: WatchFaceId) {
    updateSetting("selectedWatchFaceId", faceId);
  }

  function selectTheme(themeId: WatchThemeId) {
    updateSetting("selectedWatchThemeId", themeId);
  }

  function toggleComplication(id: WatchComplicationId) {
    const selected = settings.selectedWatchComplicationIds;

    if (selected.includes(id)) {
      updateSetting(
        "selectedWatchComplicationIds",
        selected.filter((complicationId) => complicationId !== id)
      );
      return;
    }

    if (selected.length >= WATCH_COMPLICATION_LIMIT) {
      Alert.alert(
        "Four complications selected",
        "Remove one selected complication before adding another. Real Apple Watch slot availability varies by system face."
      );
      return;
    }

    updateSetting("selectedWatchComplicationIds", [...selected, id]);
  }

  function resetCuratedSetup() {
    updateSetting("selectedWatchFaceId", "living_astrolabe");
    updateSetting("selectedWatchThemeId", "midnight_gold");
    updateSetting("selectedWatchComplicationIds", defaultWatchComplications);
    Alert.alert("Curated setup restored", "Living Astrolabe · Midnight Gold · Moon · Score · Event · Sky Lens");
  }

  return (
    <ScreenShell title="Watch Face Gallery" subtitle="Watch">
      <View style={styles.watchStage}>
        <View style={styles.watchCase}>
          <View
            style={[
              styles.watchFace,
              {
                backgroundColor: previewTheme.face,
                borderColor: previewTheme.border,
                shadowColor: previewTheme.accent
              }
            ]}
          >
            <FaceBody faceId={selectedFace.id} accent={previewTheme.accent} />
          </View>
        </View>
      </View>

      <View style={styles.previewSummary}>
        <Text style={styles.previewTitle}>{selectedFace.name}</Text>
        <Text style={styles.previewCopy}>{selectedFace.description}</Text>
        <Text style={styles.previewMeta}>
          Theme: {selectedTheme.name} · Complications: {settings.selectedWatchComplicationIds.length}/{WATCH_COMPLICATION_LIMIT}
        </Text>
      </View>

      <GlassPanel style={{ marginBottom: 14 }}>
        <Text style={styles.sectionLabel}>WATCH APP FACE GALLERY</Text>
        <Text style={styles.sectionTitle}>Choose your AuraLunis display</Text>
        <Text style={styles.sectionCopy}>
          These layouts control the full-screen AuraLunis experience when the watch app is open.
        </Text>

        <View style={styles.grid}>
          {watchFaceOptions.map((face) => {
            const active = face.id === settings.selectedWatchFaceId;

            return (
              <Pressable
                key={face.id}
                onPress={() => selectFace(face.id)}
                style={[styles.tile, active && styles.tileActive]}
              >
                <Text style={styles.tileTitle}>{face.name}</Text>
                <Text style={styles.tileCopy}>{face.bestFor}</Text>
                <Text style={[styles.tileState, active && styles.tileStateActive]}>
                  {active ? "Selected" : face.future ? "Future preview" : face.premium ? "Premium" : "Choose"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </GlassPanel>

      <GlassPanel style={{ marginBottom: 14 }}>
        <Text style={styles.sectionLabel}>THEME SELECTOR</Text>
        <Text style={styles.sectionTitle}>Choose the material mood</Text>

        <View style={styles.grid}>
          {watchThemeOptions.map((theme) => {
            const active = theme.id === settings.selectedWatchThemeId;

            return (
              <Pressable
                key={theme.id}
                onPress={() => selectTheme(theme.id)}
                style={[styles.tile, active && styles.tileActive]}
              >
                <Text style={styles.tileTitle}>{theme.name}</Text>
                <Text style={styles.tileCopy}>{theme.description}</Text>
                <Text style={[styles.tileState, active && styles.tileStateActive]}>
                  {active ? "Selected" : theme.future ? "Future preview" : theme.premium ? "Premium" : "Choose"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </GlassPanel>

      <GlassPanel style={{ marginBottom: 14 }}>
        <Text style={styles.sectionLabel}>COMPLICATION PICKER</Text>
        <Text style={styles.sectionTitle}>Select up to four quick modules</Text>
        <Text style={styles.sectionCopy}>
          This stores the user’s preferred complication set. During watchOS implementation, compatible slots will be offered for the selected Apple system face.
        </Text>

        {watchComplicationOptions.map((complication) => {
          const active = settings.selectedWatchComplicationIds.includes(complication.id);

          return (
            <Pressable
              key={complication.id}
              onPress={() => toggleComplication(complication.id)}
              style={[styles.complicationRow, active && styles.complicationActive]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.complicationTitle}>{complication.name}</Text>
                <Text style={styles.complicationCopy}>{complication.description}</Text>
                <Text style={styles.nativeNote}>{complication.nativeNote}</Text>
              </View>
              <Text style={[styles.complicationState, active && styles.complicationStateActive]}>
                {active ? "✓" : "+"}
              </Text>
            </Pressable>
          );
        })}
      </GlassPanel>

      <Pressable style={styles.primaryButton} onPress={resetCuratedSetup}>
        <Text style={styles.primaryButtonText}>Restore Signature Curated Setup</Text>
      </Pressable>

      <FeatureCard
        title="Apple Watch Companion Sync"
        description={`Sync the selected AuraLunis watch-app face, theme, Moon stats, Tonight Score, and next event. Current sync: ${settings.watchSyncEnabled ? "On" : "Off"}.`}
        actionLabel={settings.watchSyncEnabled ? "Disable Watch Sync" : "Enable Watch Sync"}
        onPress={() => updateSetting("watchSyncEnabled", !settings.watchSyncEnabled)}
      />

      <FeatureCard
        title="Real Apple Watch Complications"
        description="The selected complication set is saved now. The real watchOS target will map compatible modules into Apple-supported system-face slots and shareable curated templates."
        actionLabel="Review Native Boundary"
        onPress={() =>
          Alert.alert(
            "Apple Watch boundary",
            "Third-party apps provide watch app layouts and complications. The native watchOS handoff will map your saved modules into compatible Apple system-face slots."
          )
        }
      />

      <FeatureCard
        title="Portal Stack Widgets"
        description={`Moon, Tonight Score, next event, alarm, quick note, daily alignment, and mini astrolabe. Current widgets: ${settings.widgetsEnabled ? "On" : "Off"}.`}
        actionLabel={settings.widgetsEnabled ? "Disable Widgets" : "Enable Widgets"}
        onPress={() => updateSetting("widgetsEnabled", !settings.widgetsEnabled)}
      />

      <FeatureCard
        title="Haptic Breathing"
        description="Apple Watch breathing pattern direction for Astral Breath and Lunar Wind-Down."
        actionLabel="Preview Haptic Pattern"
        onPress={() => Alert.alert("Haptic Breathing", "Native watchOS haptic sequence boundary prepared.")}
      />

      <DeskObeliskPreview />

      <SovereignSigilPreview />

      <FeatureCard
        title="Taptic Astrolabe Crown"
        description="Future Digital Crown kinetic scrubbing with alignment detents and mechanical haptic weight."
        actionLabel="Preview Future Module"
        onPress={() => Alert.alert("Future Module", "Taptic Astrolabe remains a future watchOS-native enhancement.")}
        status="future"
      />

      <FeatureCard
        title="Desk Obelisk / StandBy"
        description="Future StandBy display that turns the charging phone into a luxury kinetic cosmic desk clock."
        actionLabel="Preview Future Module"
        onPress={() => Alert.alert("Future Module", "Desk Obelisk remains a future iOS WidgetKit / StandBy enhancement.")}
        status="future"
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  watchStage: { alignItems: "center", paddingVertical: 12, marginBottom: 12 },
  watchCase: {
    width: 238,
    height: 294,
    borderRadius: 68,
    padding: 18,
    backgroundColor: "#11141D",
    borderWidth: 4,
    borderColor: "rgba(192,198,212,0.34)"
  },
  watchFace: {
    flex: 1,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowOpacity: 0.32,
    shadowRadius: 18
  },
  faceTitle: { color: AuraLunisColors.gold2, fontSize: 12, letterSpacing: 2.4, marginTop: 7, textAlign: "center", fontWeight: "800" },
  facePrimary: { color: "#FFF", fontSize: 38, fontWeight: "900", marginTop: 10 },
  facePrimarySmall: { color: "#FFF", fontSize: 18, fontWeight: "900", marginTop: 12, textAlign: "center" },
  faceSmall: { color: AuraLunisColors.silver, fontSize: 10, lineHeight: 15, marginTop: 7, textAlign: "center", paddingHorizontal: 14 },
  faceMoonLarge: { fontSize: 68, lineHeight: 78 },
  faceGalaxy: { fontSize: 28, letterSpacing: 5 },
  faceSigil: { fontSize: 20, letterSpacing: 4 },
  faceInsight: { color: AuraLunisColors.silver, fontSize: 12, lineHeight: 17, marginTop: 10, textAlign: "center", paddingHorizontal: 18 },
  faceTime: { color: "#FFF", fontSize: 38, fontWeight: "900", marginTop: 10 },
  previewSummary: { borderRadius: 22, padding: 15, marginBottom: 12, backgroundColor: "rgba(217,168,78,0.09)", borderWidth: 1, borderColor: "rgba(217,168,78,0.20)" },
  previewTitle: { color: "#FFF", fontSize: 20, fontWeight: "900" },
  previewCopy: { color: AuraLunisColors.silver, fontSize: 13, lineHeight: 19, marginTop: 5 },
  previewMeta: { color: AuraLunisColors.gold2, fontSize: 11, marginTop: 8 },
  section: { borderRadius: 24, padding: 14, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 14 },
  sectionLabel: { color: AuraLunisColors.gold2, fontSize: 10, letterSpacing: 2.3, fontWeight: "900" },
  sectionTitle: { color: "#FFF", fontSize: 20, fontWeight: "900", marginTop: 7 },
  sectionCopy: { color: AuraLunisColors.silver, fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  tile: { width: "48%", borderRadius: 17, padding: 12, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  tileActive: { backgroundColor: "rgba(217,168,78,0.12)", borderColor: "rgba(217,168,78,0.34)" },
  tileTitle: { color: "#FFF", fontSize: 14, fontWeight: "900" },
  tileCopy: { color: AuraLunisColors.muted, fontSize: 11, lineHeight: 16, marginTop: 5 },
  tileState: { color: AuraLunisColors.silver, fontSize: 10, marginTop: 8, fontWeight: "800" },
  tileStateActive: { color: AuraLunisColors.gold2 },
  complicationRow: { flexDirection: "row", gap: 10, alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  complicationActive: { backgroundColor: "rgba(217,168,78,0.05)" },
  complicationTitle: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  complicationCopy: { color: AuraLunisColors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  nativeNote: { color: AuraLunisColors.gold2, fontSize: 10, lineHeight: 15, marginTop: 4 },
  complicationState: { width: 28, height: 28, borderRadius: 14, textAlign: "center", paddingTop: 4, color: AuraLunisColors.silver, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", fontWeight: "900" },
  complicationStateActive: { color: "#17100A", backgroundColor: AuraLunisColors.gold2, borderColor: AuraLunisColors.gold2 },
  primaryButton: { borderRadius: 17, paddingVertical: 14, alignItems: "center", backgroundColor: AuraLunisColors.gold2, marginBottom: 14 },
  primaryButtonText: { color: "#17100A", fontWeight: "900" }
});
