import React, { useState } from "react";
import { Alert, Image, Linking, Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEntitlement } from "@/hooks/useEntitlement";
import { usePaywallNavigation } from "@/context/PaywallNavigationContext";
import { TermsScreen } from "@/screens/TermsScreen";
import { PrivacyScreen } from "@/screens/PrivacyScreen";
import { GlassPanel } from "@/components/GlassPanel";
import { ScreenShell } from "@/components/ScreenShell";
import { LogoMark } from "@/components/LogoMark";
import { AuraLunisColors, AuraLunisPricing } from "@/theme/tokens";
import { AuraLunisBrand } from "@/data/brand";
import type { AuraLunisThemeMode } from "@/features/settings/SettingsTypes";
import { useAuraLunisSettings } from "@/state/AuraLunisSettingsContext";
import { useAuraLunisVault } from "@/state/AuraLunisVaultContext";
import { DeviceDiagnosticsPanel } from "@/features/device-qa/DeviceDiagnosticsPanel";
import { openAuraLunisSubscriptionManagement, restoreAuraLunisPurchases } from "@/services/RevenueCatService";

type SettingRowProps = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SettingRow({ title, description, value, onValueChange }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "rgba(255,255,255,0.14)", true: "rgba(217,168,78,0.42)" }}
        thumbColor={value ? AuraLunisColors.gold2 : AuraLunisColors.silver}
      />
    </View>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function SettingsScreen() {
  const { settings, hydrated, updateSetting, resetSettings } = useAuraLunisSettings();
  const { isPremium } = useEntitlement();
  const { openPaywall } = usePaywallNavigation();
  const { items, clearPrototypeVault } = useAuraLunisVault();
  const [deviceDiagnosticsOpen, setDeviceDiagnosticsOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);


  async function handleRestorePurchases() {
    try {
      const result = await restoreAuraLunisPurchases();
      Alert.alert(
        "Restore Purchases",
        result.status === "not_configured"
          ? "The restore handler is wired. Add the public RevenueCat SDK key before sandbox restore testing."
          : "AuraLunis refreshed the membership status for this App Store account."
      );
    } catch {
      Alert.alert("Restore Purchases", "Restore could not be completed. Confirm the StoreKit sandbox account and try again.");
    }
  }

  async function handleManageSubscription() {
    try {
      const result = await openAuraLunisSubscriptionManagement();

      if (result.status === "opened") return;

      Alert.alert(
        "Subscription management",
        result.status === "not_configured"
          ? "RevenueCat management is wired. Add the public RevenueCat SDK key before testing the App Store management link."
          : "No active App Store subscription-management URL is available for this account yet."
      );
    } catch {
      Alert.alert(
        "Subscription management",
        "The App Store subscription-management page could not be opened."
      );
    }
  }

  const themes: Array<[AuraLunisThemeMode, string]> = [
    ["midnight_gold", "Midnight Gold"],
    ["soft_moon", "Soft Moon"],
    ["deep_space", "Deep Space"],
    ["system", "System"]
  ];

  return (
    <ErrorBoundary>
    <ScreenShell title="Settings" subtitle="Control Center">
      <View style={styles.hero}>
        <LogoMark size={126} showWordmark showDescriptor centered />
        <Text style={styles.heroCopy}>
          {AuraLunisBrand.tagline} Manage subscription, appearance, privacy, Sky Lens calibration,
          notifications, Watch, widgets, learning preferences, and local data.
        </Text>
        <Text style={styles.syncState}>{hydrated ? "Settings saved locally" : "Loading local settings…"}</Text>
      </View>

      <SettingsSection title="Subscription">
        <GlassPanel accent>
          <Text style={styles.infoTitle}>AuraLunis Memberships</Text>
          <Text style={styles.infoCopy}>
            AuraLunis Premium: {AuraLunisPricing.monthly} or {AuraLunisPricing.annual}. Includes {AuraLunisPricing.trial}.
          </Text>
          <Text style={styles.infoCopy}>
            Start with a free trial, upgrade when you're ready. Cancel anytime.
          </Text>
          {!isPremium && (
            <Pressable style={styles.actionButton} onPress={openPaywall}>
              <Text style={styles.actionButtonText}>Upgrade to Premium</Text>
            </Pressable>
          )}
          <Pressable
            style={isPremium ? styles.actionButton : styles.secondaryButton}
            onPress={handleManageSubscription}
          >
            <Text style={isPremium ? styles.actionButtonText : styles.secondaryButtonText}>Manage Subscription</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={handleRestorePurchases}
          >
            <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
          </Pressable>
        </GlassPanel>
      </SettingsSection>

      <SettingsSection title="Appearance">
        <View style={styles.themeGrid}>
          {themes.map(([mode, label]) => {
            const active = settings.themeMode === mode;
            return (
              <Pressable
                key={mode}
                style={[styles.themeTile, active && styles.themeTileActive]}
                onPress={() => updateSetting("themeMode", mode)}
              >
                <Text style={styles.themeTitle}>{label}</Text>
                <Text style={styles.themeSub}>{active ? "Active globally" : "Tap to apply"}</Text>
              </Pressable>
            );
          })}
        </View>
        <SettingRow
          title="Night Vision Mode"
          description="Deep red for dark adaptation. Syncs with the Sky Lens night toggle."
          value={settings.nightVision}
          onValueChange={(value) => updateSetting("nightVision", value)}
        />
      </SettingsSection>

      <SettingsSection title="Notifications + Alarms">
        <SettingRow title="Notifications" description="Master switch for reminders and celestial alerts." value={settings.notificationsEnabled} onValueChange={(value) => updateSetting("notificationsEnabled", value)} />
        <SettingRow title="Celestial Alarms" description="Sunrise, moonrise, Venus visible, and stargazing-window alerts." value={settings.celestialAlarmsEnabled} onValueChange={(value) => updateSetting("celestialAlarmsEnabled", value)} />
        <SettingRow title="Tonight’s Ritual Reminders" description="Gentle evening ritual reminders." value={settings.tonightRitualRemindersEnabled} onValueChange={(value) => updateSetting("tonightRitualRemindersEnabled", value)} />
      </SettingsSection>

      <SettingsSection title="Sky Lens">
        <SettingRow title="Calibration Reminders" description="Prompt when compass or motion accuracy is poor." value={settings.skyLensCalibrationRemindersEnabled} onValueChange={(value) => updateSetting("skyLensCalibrationRemindersEnabled", value)} />

        <Text style={styles.qualityLabel}>Sky Quality</Text>
        <Text style={styles.qualityDescription}>
          Bortle scale of your usual site — Urban (7–9), Suburban (5–6), Rural (3–4), Dark (1–2). Affects the Tonight Score.
        </Text>
        <View style={styles.segmentRow}>
          {(["urban", "suburban", "rural", "dark"] as const).map((quality) => (
            <Pressable
              key={quality}
              style={[styles.segment, settings.skyQuality === quality && styles.segmentActive]}
              onPress={() => updateSetting("skyQuality", quality)}
            >
              <Text style={[styles.segmentText, settings.skyQuality === quality && styles.segmentTextActive]}>
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.secondaryButton} onPress={() => Alert.alert("Sky Lens Calibration", "Move your phone slowly in a figure-eight, then recenter on a visible object such as the Moon.")}>
          <Text style={styles.secondaryButtonText}>Run Sky Lens Calibration</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => Alert.alert("Manual Sky Map", "Open the Sky tab and choose Manual Sky Map for the privacy-safe fallback.")}>
          <Text style={styles.secondaryButtonText}>Manual Sky Map Instructions</Text>
        </Pressable>
      </SettingsSection>

      <SettingsSection title="Privacy + Data">
        <SettingRow title="Local-First Vault" description="Keep Notes, LifeSky moments, lessons, and saved objects local by default." value={settings.localFirstVaultEnabled} onValueChange={(value) => updateSetting("localFirstVaultEnabled", value)} />
        <SettingRow title="Cloud Sync" description="Optional future device sync. Off by default." value={settings.cloudSyncEnabled} onValueChange={(value) => updateSetting("cloudSyncEnabled", value)} />
        <SettingRow title="AI Oracle Opt-In" description="Enable personalized Oracle briefings only when you choose." value={settings.aiOracleOptIn} onValueChange={(value) => updateSetting("aiOracleOptIn", value)} />
        <Text style={styles.localCount}>{items.length} local prototype Vault items</Text>
        <Pressable style={styles.secondaryButton} onPress={() => Alert.alert("Permissions", "Camera: Sky Lens only\nLocation: local sky calculations\nMotion: alignment\nPhotos: only when saving")}>
          <Text style={styles.secondaryButtonText}>Review Permissions</Text>
        </Pressable>
        <Pressable style={styles.dangerButton} onPress={() => clearPrototypeVault().then(() => Alert.alert("Prototype Vault", "Local prototype Vault items cleared."))}>
          <Text style={styles.dangerButtonText}>Clear Prototype Vault</Text>
        </Pressable>
      </SettingsSection>

      <SettingsSection title="Watch + Widgets">
        <SettingRow title="Apple Watch Sync" description="Sync watch face state, Moon stats, and next event." value={settings.watchSyncEnabled} onValueChange={(value) => updateSetting("watchSyncEnabled", value)} />
        <SettingRow title="Portal Stack Widgets" description="Moon, Tonight Score, Note, Event, Alarm, and mini astrolabe widgets." value={settings.widgetsEnabled} onValueChange={(value) => updateSetting("widgetsEnabled", value)} />
      </SettingsSection>

      <SettingsSection title="Learning">
        <Pressable style={styles.secondaryButton} onPress={() => Alert.alert("Learning Preferences", "Teacher Mode, difficulty, pronunciation help, quizzes, and saved progress direction prepared.")}>
          <Text style={styles.secondaryButtonText}>Learning Preferences</Text>
        </Pressable>
      </SettingsSection>


      <SettingsSection title="Native Device QA">
        <Text style={styles.infoCopy}>
          Run camera, location, compass, motion-sensor, photo-save, and haptic
          checks on a physical iPhone before outdoor Sky Lens calibration.
        </Text>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => setDeviceDiagnosticsOpen((previous) => !previous)}
        >
          <Text style={styles.secondaryButtonText}>
            {deviceDiagnosticsOpen ? "Hide Device Diagnostics" : "Open Device Diagnostics"}
          </Text>
        </Pressable>
        {deviceDiagnosticsOpen ? <DeviceDiagnosticsPanel /> : null}
      </SettingsSection>

      <SettingsSection title="Help + About">
        <View style={styles.aboutCard}>
          <LogoMark size={62} />
          <View style={{ flex: 1 }}>
            <Text style={styles.aboutTitle}>About Us</Text>
            <Text style={styles.aboutCopy}>
              AuraLunis was created to turn the night sky into a living, personal experience. Blending astronomy, thoughtful design, and quiet daily rituals, we help you slow down, look up, and feel more connected to the universe around you.
            </Text>
          </View>
        </View>

        <Pressable style={styles.secondaryButton} onPress={() => Alert.alert("Q&A / Help", "Astrolabe · Sky Lens · Learn · Vault · Watch · Widgets · Privacy · Subscription")}>
          <Text style={styles.secondaryButtonText}>Open Q&A / Help</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => Alert.alert("About AuraLunis", `${AuraLunisBrand.name} · ${AuraLunisBrand.descriptor}\n${AuraLunisBrand.tagline}`)}>
          <Text style={styles.secondaryButtonText}>About AuraLunis</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => setLegalModal("privacy")}>
          <Text style={styles.secondaryButtonText}>Privacy Policy</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => setLegalModal("terms")}>
          <Text style={styles.secondaryButtonText}>Terms of Use</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => Linking.openURL("mailto:support@ocoeestudios.com")}>
          <Text style={styles.secondaryButtonText}>Contact Support</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => resetSettings().then(() => Alert.alert("Settings", "Local settings reset to safe defaults."))}>
          <Text style={styles.secondaryButtonText}>Reset Settings</Text>
        </Pressable>
      </SettingsSection>

      {/* Brand footer with app icon */}
      <View style={styles.brandFooter}>
        <Image
          source={require("../../assets/icon.png")}
          style={styles.brandIcon}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>AuraLunis</Text>
        <Text style={styles.brandTagline}>Your Time, Written in the Stars</Text>
        <Text style={styles.brandVersion}>v1.0.0 · Ocoee Studios</Text>
        <Text style={styles.brandEmail}>admin@ocoeestudios.com</Text>
      </View>
      {/* Legal modals — in-app, no web hosting needed */}
      <Modal visible={legalModal !== null} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: AuraLunisColors.cosmicBlack }}>
          <Pressable
            style={{ padding: 16, paddingTop: 20, alignItems: "flex-end" }}
            onPress={() => setLegalModal(null)}
          >
            <Text style={{ color: AuraLunisColors.gold, fontSize: 16, fontWeight: "700" }}>Done</Text>
          </Pressable>
          {legalModal === "terms" && <TermsScreen />}
          {legalModal === "privacy" && <PrivacyScreen />}
        </View>
      </Modal>
    </ScreenShell>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 28, padding: 18, backgroundColor: "rgba(217,168,78,0.08)", borderWidth: 1, borderColor: "rgba(217,168,78,0.18)", marginBottom: 16 },
  heroCopy: { color: AuraLunisColors.silver, fontSize: 14, lineHeight: 21, marginTop: 14, textAlign: "center" },
  syncState: { color: AuraLunisColors.gold2, fontSize: 11, marginTop: 10, textAlign: "center" },
  section: { borderRadius: 24, padding: 14, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 14 },
  sectionTitle: { color: AuraLunisColors.gold2, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: "900", marginBottom: 10 },
  infoCard: { borderRadius: 20, padding: 14, backgroundColor: "rgba(4,5,11,0.65)", borderWidth: 1, borderColor: "rgba(217,168,78,0.18)" },
  infoTitle: { color: "#FFF", fontSize: 21, fontWeight: "900" },
  infoCopy: { color: AuraLunisColors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  settingRow: { flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  settingTitle: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  settingDescription: { color: AuraLunisColors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  themeTile: { width: "48%", borderRadius: 18, padding: 13, backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  themeTileActive: { backgroundColor: "rgba(217,168,78,0.12)", borderColor: "rgba(217,168,78,0.32)" },
  themeTitle: { color: "#FFF", fontSize: 14, fontWeight: "900" },
  themeSub: { color: AuraLunisColors.muted, fontSize: 11, marginTop: 4 },
  actionButton: { backgroundColor: AuraLunisColors.gold2, borderRadius: 17, paddingVertical: 13, alignItems: "center", marginTop: 14 },
  actionButtonText: { color: "#17100A", fontWeight: "900" },
  secondaryButton: { borderRadius: 17, paddingVertical: 13, paddingHorizontal: 12, alignItems: "center", marginTop: 10, backgroundColor: "rgba(217,168,78,0.10)", borderWidth: 1, borderColor: "rgba(217,168,78,0.22)" },
  secondaryButtonText: { color: "#FFF", fontWeight: "800" },
  dangerButton: { borderRadius: 17, paddingVertical: 13, paddingHorizontal: 12, alignItems: "center", marginTop: 10, backgroundColor: "rgba(255,120,120,0.08)", borderWidth: 1, borderColor: "rgba(255,120,120,0.22)" },
  dangerButtonText: { color: "#FFD2D2", fontWeight: "800" },
  qualityLabel: { color: "#FFF", fontSize: 14, fontWeight: "800", marginTop: 12 },
  qualityDescription: { color: AuraLunisColors.silver, fontSize: 12, lineHeight: 17, marginTop: 4, marginBottom: 10 },
  segmentRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: "center", backgroundColor: "rgba(217,168,78,0.06)", borderWidth: 1, borderColor: "rgba(217,168,78,0.15)" },
  segmentActive: { backgroundColor: "rgba(217,168,78,0.20)", borderColor: AuraLunisColors.gold2 },
  segmentText: { color: AuraLunisColors.silver, fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: AuraLunisColors.gold2 },
  localCount: { color: AuraLunisColors.gold2, fontSize: 12, marginTop: 12 },
  aboutCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    padding: 14,
    marginBottom: 4,
    backgroundColor: "rgba(217,168,78,0.08)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.18)"
  },
  aboutTitle: { color: "#FFF", fontSize: 18, fontWeight: "900" },
  aboutCopy: { color: AuraLunisColors.silver, fontSize: 13, lineHeight: 19, marginTop: 5 },
  brandFooter: {
    alignItems: "center",
    paddingVertical: 32,
    paddingBottom: 48,
    marginTop: 8,
  },
  brandIcon: {
    width: 80,
    height: 80,
    borderRadius: 18,
    marginBottom: 12,
  },
  brandName: {
    color: AuraLunisColors.gold,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  brandTagline: {
    color: AuraLunisColors.gold,
    fontSize: 10,
    letterSpacing: 1.5,
    opacity: 0.5,
    marginTop: 4,
    fontStyle: "italic",
  },
  brandVersion: {
    color: AuraLunisColors.faint,
    fontSize: 10,
    marginTop: 10,
  },
  brandEmail: {
    color: AuraLunisColors.gold,
    fontSize: 10,
    marginTop: 2,
    opacity: 0.6,
  },
});
