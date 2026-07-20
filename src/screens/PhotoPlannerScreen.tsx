// PhotoPlannerScreen.tsx
// Astrophotography planner — wires the prebuilt AstroPhotographyService into a UI:
// tonight's verdict, your gear's exposure settings (500/NPF rules, ISO, stacking),
// the Milky Way core window, golden/blue hours, and a ranked target list.

import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenShell } from "@/components/ScreenShell";
import { Starfield } from "@/components/Starfield";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import { computePhotoplan, type PhotoTarget } from "@/services/AstroPhotographyService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import { useEntitlement } from "@/hooks/useEntitlement";
import { usePaywallNavigation } from "@/context/PaywallNavigationContext";

interface Props {
  onClose: () => void;
}

const FOCALS = [14, 24, 35, 50, 135, 200];
const APERTURES = [1.4, 1.8, 2.0, 2.8, 4.0];
const DIFF_COLOR: Record<string, string> = {
  beginner: AuraLunisColors.green,
  intermediate: AuraLunisColors.gold2,
  advanced: "#FF8A5A",
};

export function PhotoPlannerScreen({ onClose }: Props) {
  const { isPremium } = useEntitlement();
  const { openPaywall } = usePaywallNavigation();
  const { location, status } = useObserverLocation();
  const [focalMm, setFocalMm] = useState(24);
  const [aperture, setAperture] = useState(2.8);

  const plan = useMemo(() => computePhotoplan(location, focalMm, aperture), [location, focalMm, aperture]);
  const visibleTargets = plan.targets.filter((t) => t.visible);
  const otherTargets = plan.targets.filter((t) => !t.visible);

  // Screen-level entitlement guard (defense-in-depth): Photo Planner is an ENTIRELY premium
  // feature. A non-entitled user must never enter the planner or use any planner control — the
  // verdict, gear/exposure settings, and target list must not render, even if this screen is
  // opened through some other path. Render a premium preview/gate instead; "Unlock Premium"
  // opens the existing paywall.
  if (!isPremium) {
    return (
      <ScreenShell title="Photo Planner" subtitle="Astrophotography" background={<Starfield />}>
        <Pressable style={styles.backBtn} onPress={() => { tapLight(); onClose(); }} hitSlop={12}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <View style={styles.gateCard}>
          <Text style={styles.gateIcon}>◈</Text>
          <Text style={styles.gateTitle}>Photo Planner</Text>
          <Text style={styles.gateBadge}>PREMIUM FEATURE</Text>
          <Text style={styles.gateDesc}>
            Plan your astrophotography night — tonight's shooting verdict, exposure settings dialed
            to your gear (500 & NPF rules, ISO, stacking), the Milky Way core window, golden and
            blue hours, and a ranked list of the best targets above your horizon.
          </Text>
          <Pressable style={styles.unlockBtn} onPress={() => { tapLight(); openPaywall(); }}>
            <Text style={styles.unlockText}>✦ Unlock Premium</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Photo Planner" subtitle="Astrophotography" background={<Starfield />}>
      <Pressable style={styles.backBtn} onPress={() => { tapLight(); onClose(); }} hitSlop={12}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      {/* Verdict */}
      <View style={styles.verdictCard}>
        <Text style={styles.verdictLabel}>TONIGHT</Text>
        <Text style={styles.verdict}>{plan.verdict}</Text>
        <Text style={styles.verdictSub}>
          Moon {plan.moonPhasePercent}% · dark {plan.darkWindowStart}–{plan.darkWindowEnd}
        </Text>
      </View>

      {/* Gear */}
      <Text style={styles.sectionLabel}>YOUR GEAR</Text>
      <View style={styles.gearCard}>
        <Text style={styles.gearRowLabel}>Focal length</Text>
        <View style={styles.chipRow}>
          {FOCALS.map((f) => (
            <Pressable key={f} onPress={() => { tapLight(); setFocalMm(f); }} style={[styles.chip, focalMm === f && styles.chipOn]}>
              <Text style={[styles.chipText, focalMm === f && styles.chipTextOn]}>{f}mm</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.gearRowLabel, { marginTop: 12 }]}>Aperture</Text>
        <View style={styles.chipRow}>
          {APERTURES.map((a) => (
            <Pressable key={a} onPress={() => { tapLight(); setAperture(a); }} style={[styles.chip, aperture === a && styles.chipOn]}>
              <Text style={[styles.chipText, aperture === a && styles.chipTextOn]}>f/{a}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Exposure */}
      <Text style={styles.sectionLabel}>EXPOSURE</Text>
      <View style={styles.exposureCard}>
        <Stat label="500 rule (max)" value={`${plan.exposure.maxExposureSec}s`} />
        <Stat label="NPF rule (sharp)" value={`${plan.exposure.npfExposureSec}s`} />
        <Stat label="ISO" value={`${plan.exposure.isoRecommended}`} />
        <Stat label="Star trails" value={`${plan.exposure.trailExposureMin} min+`} />
        <Text style={styles.stack}>{plan.exposure.stackRecommendation}</Text>
      </View>

      {/* Milky Way + light */}
      <View style={styles.mwCard}>
        <Text style={styles.mwTitle}>
          {plan.milkyWayCoreVisible ? "🌌 Milky Way core is up tonight" : "🌌 Milky Way core not well placed tonight"}
        </Text>
        {plan.milkyWayCoreVisible && (
          <Text style={styles.mwSub}>
            Core toward az {plan.milkyWayCoreAz}° · best {plan.milkyWayCoreTime}
          </Text>
        )}
        <Text style={styles.lightRow}>Golden hour: {plan.goldenHourEvening} eve · {plan.goldenHourMorning} morn</Text>
        <Text style={styles.lightRow}>Blue hour: {plan.blueHourEvening} eve · {plan.blueHourMorning} morn</Text>
      </View>

      {/* Targets */}
      <Text style={styles.sectionLabel}>TONIGHT'S TARGETS</Text>
      {visibleTargets.map((t) => <TargetRow key={t.name} t={t} />)}
      {otherTargets.length > 0 && <Text style={styles.belowLabel}>Not well placed tonight</Text>}
      {otherTargets.map((t) => <TargetRow key={t.name} t={t} dim />)}

      <Text style={styles.footnote}>
        {status === "fallback" ? "Default location — enable location for your exact sky." : "Based on your location."}
      </Text>
    </ScreenShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function TargetRow({ t, dim }: { t: PhotoTarget; dim?: boolean }) {
  return (
    <View style={[styles.targetCard, dim && { opacity: 0.5 }]}>
      <View style={styles.targetHead}>
        <Text style={styles.targetName}>{t.name}</Text>
        <Text style={[styles.diff, { color: DIFF_COLOR[t.difficulty] ?? AuraLunisColors.muted }]}>{t.difficulty}</Text>
      </View>
      <Text style={styles.targetMeta}>
        {t.focalLengthRange}{t.bestTimeTonight ? ` · ${t.bestTimeTonight}` : ""}
      </Text>
      <Text style={styles.targetDesc}>{t.description}</Text>
      <Text style={styles.targetTip}>💡 {t.tip}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { marginBottom: 10 },
  backText: { color: AuraLunisColors.gold, fontSize: 14, fontWeight: "700" },
  gateCard: { marginTop: 24, backgroundColor: "rgba(7,18,37,0.7)", borderRadius: 20, borderWidth: 1, borderColor: AuraLunisColors.gold, padding: 24, alignItems: "center" },
  gateIcon: { fontSize: 32, color: AuraLunisColors.gold, marginBottom: 10 },
  gateTitle: { color: AuraLunisColors.gold2, fontSize: 22, fontWeight: "900", textAlign: "center" },
  gateBadge: { color: AuraLunisColors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", marginTop: 4, marginBottom: 12 },
  gateDesc: { color: AuraLunisColors.silver, fontSize: 14, lineHeight: 21, textAlign: "center", marginBottom: 20 },
  unlockBtn: { backgroundColor: AuraLunisColors.gold, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, alignItems: "center" },
  unlockText: { color: AuraLunisColors.cosmicBlack, fontWeight: "900", fontSize: 14 },
  verdictCard: {
    backgroundColor: "rgba(217,168,78,0.08)", borderRadius: 20, borderWidth: 1,
    borderColor: "rgba(217,168,78,0.22)", padding: 18, marginBottom: 18,
  },
  verdictLabel: { color: AuraLunisColors.faint, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  verdict: { color: AuraLunisColors.gold2, fontSize: 20, fontWeight: "900", marginTop: 4 },
  verdictSub: { color: AuraLunisColors.silver, fontSize: 12, marginTop: 6 },
  sectionLabel: { color: AuraLunisColors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 2, marginBottom: 10 },
  gearCard: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, marginBottom: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  gearRowLabel: { color: AuraLunisColors.muted, fontSize: 11, fontWeight: "700", marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  chipOn: { backgroundColor: "rgba(217,168,78,0.18)", borderColor: AuraLunisColors.gold },
  chipText: { color: AuraLunisColors.silver, fontSize: 12, fontWeight: "700" },
  chipTextOn: { color: AuraLunisColors.gold2 },
  exposureCard: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14, marginBottom: 18,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  stat: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  statLabel: { color: AuraLunisColors.muted, fontSize: 13 },
  statValue: { color: "#FFF", fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
  stack: { color: AuraLunisColors.gold2, fontSize: 13, fontWeight: "800", marginTop: 10, textAlign: "center" },
  mwCard: {
    backgroundColor: "rgba(98,207,255,0.06)", borderRadius: 16, padding: 14, marginBottom: 18,
    borderWidth: 1, borderColor: "rgba(98,207,255,0.16)",
  },
  mwTitle: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  mwSub: { color: AuraLunisColors.gold2, fontSize: 12, marginTop: 4, fontWeight: "700" },
  lightRow: { color: AuraLunisColors.silver, fontSize: 12, marginTop: 8 },
  targetCard: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  targetHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  targetName: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  diff: { fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  targetMeta: { color: AuraLunisColors.gold, fontSize: 11, marginTop: 3, fontWeight: "600" },
  targetDesc: { color: AuraLunisColors.silver, fontSize: 12, lineHeight: 17, marginTop: 5 },
  targetTip: { color: AuraLunisColors.muted, fontSize: 11, marginTop: 5, fontStyle: "italic" },
  belowLabel: { color: AuraLunisColors.faint, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginTop: 8, marginBottom: 8 },
  footnote: { color: AuraLunisColors.faint, fontSize: 11, marginTop: 14, marginBottom: 28, textAlign: "center" },
});
