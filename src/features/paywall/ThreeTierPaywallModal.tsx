// ThreeTierPaywallModal.tsx
// Optimized three-tier paywall: Annual (default, 7-day trial), Monthly, Lifetime Founders.
// Annual is selected by default and displayed prominently — monthly is secondary.
// Lifetime Founders acts as anchor price ($99.99) making annual feel like a steal.
// Trial is ANNUAL ONLY — no trial on monthly (prevents weekend trial-and-cancel).

import React, { useState } from "react";
import {
  Modal, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { AuraLunisColors } from "@/theme/tokens";
import {
  plans,
  premiumFeatures,
  lifetimeFeatures,
  type PlanOption,
} from "./MonetizationCatalog";
import { tapLight, tapSuccess } from "@/services/HapticService";
import { Starfield } from "@/components/Starfield";
import { TermsScreen } from "@/screens/TermsScreen";
import { PrivacyScreen } from "@/screens/PrivacyScreen";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPurchase: (planId: string) => void;
  onRestore: () => void;
};

export function ThreeTierPaywallModal({ visible, onClose, onPurchase, onRestore }: Props) {
  const [selected, setSelected] = useState<string>("premium_annual");
  const [legal, setLegal] = useState<"terms" | "privacy" | null>(null);

  const annual   = plans.find(p => p.id === "premium_annual")!;
  const monthly  = plans.find(p => p.id === "premium_monthly")!;
  const lifetime = plans.find(p => p.id === "lifetime_founders")!;

  function handleSelect(plan: PlanOption) {
    tapLight();
    setSelected(plan.id);
  }

  function handlePurchase() {
    tapSuccess();
    onPurchase(selected);
  }

  const selectedPlan = plans.find(p => p.id === selected) ?? annual;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.screen}>
        {/* living-sky background so the paywall feels like the rest of the app */}
        <Starfield />

        {/* close — users must always be able to dismiss without purchasing */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => { tapLight(); onClose(); }} hitSlop={12} accessibilityLabel="Close">
          <Text style={styles.closeX}>✕</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

            {/* Header */}
            <Text style={styles.eyebrow}>AURALUNIS PREMIUM</Text>
            <Text style={styles.headline}>Unlock the Full Cosmos</Text>
            <Text style={styles.sub}>
              Live satellite tracking · Cosmic Drift galaxy · All 9 modes
            </Text>

            {/* Plan selector — Annual first (default) */}
            <PlanCard
              plan={annual}
              selected={selected === annual.id}
              onPress={() => handleSelect(annual)}
              highlight
            />
            <PlanCard
              plan={monthly}
              selected={selected === monthly.id}
              onPress={() => handleSelect(monthly)}
            />
            <PlanCard
              plan={lifetime}
              selected={selected === lifetime.id}
              onPress={() => handleSelect(lifetime)}
            />

            {/* CTA */}
            <TouchableOpacity style={styles.cta} onPress={handlePurchase}>
              <Text style={styles.ctaText}>
                {selectedPlan.trial
                  ? `Start ${selectedPlan.trial ? "7-Day Free Trial" : "Now"}`
                  : `Get ${selectedPlan.name}`}
              </Text>
              <Text style={styles.ctaSub}>
                {selectedPlan.trial
                  ? `Then ${selectedPlan.displayPrice} · Cancel anytime`
                  : selectedPlan.subtitle}
              </Text>
            </TouchableOpacity>

            {/* Feature list */}
            <Text style={styles.sectionLabel}>What you get</Text>
            {(selected === "lifetime_founders" ? lifetimeFeatures : premiumFeatures).map(f => (
              <View key={f} style={styles.featureRow}>
                <Text style={styles.featureCheck}>✦</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}

            {/* Footer — required Apple links, all tappable */}
            <View style={styles.footer}>
              <Text style={styles.footerLink} onPress={() => { tapLight(); onRestore(); }}>Restore Purchases</Text>
              <Text style={styles.footerDot}>·</Text>
              <Text style={styles.footerLink} onPress={() => { tapLight(); setLegal("terms"); }}>Terms</Text>
              <Text style={styles.footerDot}>·</Text>
              <Text style={styles.footerLink} onPress={() => { tapLight(); setLegal("privacy"); }}>Privacy</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
              <Text style={styles.skipText}>Continue Free</Text>
            </TouchableOpacity>

        </ScrollView>

        {/* in-app Terms / Privacy */}
        <Modal visible={legal !== null} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setLegal(null)}>
          <View style={styles.screen}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setLegal(null)} hitSlop={12} accessibilityLabel="Close">
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
            {legal === "terms" && <TermsScreen />}
            {legal === "privacy" && <PrivacyScreen />}
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

function PlanCard({
  plan, selected, onPress, highlight,
}: {
  plan: PlanOption;
  selected: boolean;
  onPress: () => void;
  highlight?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        selected && styles.planCardSelected,
        highlight && !selected && styles.planCardHighlight,
      ]}
      onPress={onPress}
    >
      <View style={styles.planLeft}>
        <View style={[styles.radio, selected && styles.radioSelected]} />
        <View>
          <Text style={[styles.planName, selected && { color: AuraLunisColors.gold2 }]}>
            {plan.name}
            {plan.interval === "lifetime" ? " — Founders" : ""}
          </Text>
          <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
          {plan.trial && (
            <Text style={styles.trialBadge}>7-day free trial included</Text>
          )}
        </View>
      </View>
      <View style={styles.planRight}>
        {plan.anchorPrice && (
          <Text style={styles.anchorPrice}>{plan.anchorPrice}</Text>
        )}
        <Text style={[styles.planPrice, selected && { color: AuraLunisColors.gold }]}>
          {plan.displayPrice}
        </Text>
        {plan.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{plan.badge}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AuraLunisColors.cosmicBlack },
  closeBtn: { position: "absolute", top: 52, right: 20, zIndex: 10, width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(7,18,37,0.7)", borderWidth: 1, borderColor: AuraLunisColors.borderGold },
  closeX: { color: AuraLunisColors.silver, fontSize: 16, fontWeight: "700", lineHeight: 18 },
  content: { padding: 24, paddingTop: 72, paddingBottom: 48 },
  eyebrow: { color: AuraLunisColors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 3, textAlign: "center", marginBottom: 6 },
  headline: { color: AuraLunisColors.gold2, fontSize: 24, fontWeight: "900", textAlign: "center", marginBottom: 6 },
  sub: { color: AuraLunisColors.muted, fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 22 },
  planCard: { backgroundColor: AuraLunisColors.elevated, borderRadius: 14, borderWidth: 1, borderColor: AuraLunisColors.borderSubtle, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planCardSelected: { borderColor: AuraLunisColors.gold, backgroundColor: "rgba(217,168,78,0.1)" },
  planCardHighlight: { borderColor: AuraLunisColors.borderGold },
  planLeft: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: AuraLunisColors.faint, marginTop: 2, flexShrink: 0 },
  radioSelected: { borderColor: AuraLunisColors.gold, backgroundColor: AuraLunisColors.gold },
  planName: { color: AuraLunisColors.silver, fontSize: 14, fontWeight: "700" },
  planSubtitle: { color: AuraLunisColors.faint, fontSize: 11, marginTop: 2 },
  trialBadge: { color: AuraLunisColors.green, fontSize: 10, fontWeight: "700", marginTop: 4 },
  planRight: { alignItems: "flex-end", gap: 4 },
  anchorPrice: { color: AuraLunisColors.faint, fontSize: 11, textDecorationLine: "line-through" },
  planPrice: { color: AuraLunisColors.silver, fontSize: 15, fontWeight: "800" },
  badge: { backgroundColor: "rgba(217,168,78,0.2)", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: AuraLunisColors.gold, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  cta: { backgroundColor: AuraLunisColors.gold, borderRadius: 16, padding: 16, alignItems: "center", marginVertical: 20 },
  ctaText: { color: AuraLunisColors.cosmicBlack, fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
  ctaSub: { color: "rgba(11,11,18,0.7)", fontSize: 11, marginTop: 3 },
  sectionLabel: { color: AuraLunisColors.faint, fontSize: 9, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  featureRow: { flexDirection: "row", gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: AuraLunisColors.borderFaint },
  featureCheck: { color: AuraLunisColors.gold, fontSize: 11, marginTop: 1 },
  featureText: { color: AuraLunisColors.silver, fontSize: 12, flex: 1, lineHeight: 18 },
  footer: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 20, marginBottom: 10 },
  footerLink: { color: AuraLunisColors.faint, fontSize: 11 },
  footerDot: { color: AuraLunisColors.faint, fontSize: 11 },
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { color: AuraLunisColors.faint, fontSize: 12 },
});
