// ThreeTierPaywallModal.tsx
// Optimized three-tier paywall: Annual (default, 7-day trial), Monthly, Lifetime Founders.
// Annual is selected by default and displayed prominently — monthly is secondary.
// Lifetime Founders acts as anchor price ($99.99) making annual feel like a steal.
// Trial is ANNUAL ONLY — no trial on monthly (prevents weekend trial-and-cancel).

import React, { useState } from "react";
import {
  Modal, Pressable, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { ChronauraColors } from "@/theme/tokens";
import {
  plans,
  premiumFeatures,
  lifetimeFeatures,
  type PlanOption,
} from "./MonetizationCatalog";
import { tapLight, tapSuccess } from "@/services/HapticService";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPurchase: (planId: string) => void;
};

export function ThreeTierPaywallModal({ visible, onClose, onPurchase }: Props) {
  const [selected, setSelected] = useState<string>("premium_annual");

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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

            {/* Header */}
            <Text style={styles.eyebrow}>CHRONAURA PREMIUM</Text>
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

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerLink} onPress={onClose}>Restore Purchases</Text>
              <Text style={styles.footerDot}>·</Text>
              <Text style={styles.footerLink}>Terms</Text>
              <Text style={styles.footerDot}>·</Text>
              <Text style={styles.footerLink}>Privacy</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
              <Text style={styles.skipText}>Continue Free</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
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
          <Text style={[styles.planName, selected && { color: ChronauraColors.gold2 }]}>
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
        <Text style={[styles.planPrice, selected && { color: ChronauraColors.gold }]}>
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
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  sheet: { backgroundColor: ChronauraColors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "92%", borderTopWidth: 1, borderColor: ChronauraColors.borderGold },
  content: { padding: 24, paddingBottom: 48 },
  eyebrow: { color: ChronauraColors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 3, textAlign: "center", marginBottom: 6 },
  headline: { color: ChronauraColors.gold2, fontSize: 24, fontWeight: "900", textAlign: "center", marginBottom: 6 },
  sub: { color: ChronauraColors.muted, fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 22 },
  planCard: { backgroundColor: ChronauraColors.elevated, borderRadius: 14, borderWidth: 1, borderColor: ChronauraColors.borderSubtle, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planCardSelected: { borderColor: ChronauraColors.gold, backgroundColor: "rgba(217,168,78,0.1)" },
  planCardHighlight: { borderColor: ChronauraColors.borderGold },
  planLeft: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: ChronauraColors.faint, marginTop: 2, flexShrink: 0 },
  radioSelected: { borderColor: ChronauraColors.gold, backgroundColor: ChronauraColors.gold },
  planName: { color: ChronauraColors.silver, fontSize: 14, fontWeight: "700" },
  planSubtitle: { color: ChronauraColors.faint, fontSize: 11, marginTop: 2 },
  trialBadge: { color: ChronauraColors.green, fontSize: 10, fontWeight: "700", marginTop: 4 },
  planRight: { alignItems: "flex-end", gap: 4 },
  anchorPrice: { color: ChronauraColors.faint, fontSize: 11, textDecorationLine: "line-through" },
  planPrice: { color: ChronauraColors.silver, fontSize: 15, fontWeight: "800" },
  badge: { backgroundColor: "rgba(217,168,78,0.2)", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: ChronauraColors.gold, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  cta: { backgroundColor: ChronauraColors.gold, borderRadius: 16, padding: 16, alignItems: "center", marginVertical: 20 },
  ctaText: { color: ChronauraColors.cosmicBlack, fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
  ctaSub: { color: "rgba(11,11,18,0.7)", fontSize: 11, marginTop: 3 },
  sectionLabel: { color: ChronauraColors.faint, fontSize: 9, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  featureRow: { flexDirection: "row", gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: ChronauraColors.borderFaint },
  featureCheck: { color: ChronauraColors.gold, fontSize: 11, marginTop: 1 },
  featureText: { color: ChronauraColors.silver, fontSize: 12, flex: 1, lineHeight: 18 },
  footer: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 20, marginBottom: 10 },
  footerLink: { color: ChronauraColors.faint, fontSize: 11 },
  footerDot: { color: ChronauraColors.faint, fontSize: 11 },
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { color: ChronauraColors.faint, fontSize: 12 },
});
