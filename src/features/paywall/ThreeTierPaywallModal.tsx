// ThreeTierPaywallModal.tsx
// Optimized three-tier paywall: Annual (default), Monthly, Lifetime.
// Annual is selected by default and displayed prominently — monthly is secondary.
// Lifetime acts as anchor price ($129.99) making annual feel like a steal.
//
// FREE TRIAL: the monthly/annual subscriptions may carry an Apple-configured introductory
// free trial. The app does NOT invent it — usePaywallOffers() reads the real StoreKit offer
// and this account's eligibility, and trial copy renders ONLY when both are confirmed
// (trial.status === "eligible"). Ineligible/unavailable → normal pricing + "Continue".
// Lifetime is a one-time purchase and never shows trial wording.

import React, { useState } from "react";
import {
  Modal, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { AuraLunisColors, AuraLunisTypography } from "@/theme/tokens";
import {
  plans,
  premiumFeatures,
  lifetimeFeatures,
  type PlanOption,
} from "./MonetizationCatalog";
import { usePaywallOffers, type PlanOffer } from "./usePaywallOffers";
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

// "month" for a monthly plan, "year" for annual — the "/{period}" half of a price line.
function periodWord(interval: PlanOption["interval"]): string {
  return interval === "annual" ? "year" : "month";
}

// Localized price line, live store price preferred over the catalog fallback. Subscriptions
// read "$9.99/month"; lifetime reads "$129.99 one-time".
function priceLine(plan: PlanOption, offer?: PlanOffer): string {
  if (plan.interval === "lifetime") {
    return `${offer?.localizedPrice ?? plan.displayPrice} one-time`;
  }
  if (offer?.localizedPrice) return `${offer.localizedPrice}/${periodWord(plan.interval)}`;
  return plan.displayPrice; // catalog fallback already includes the period, e.g. "$9.99/month"
}

// The line under each plan name. Trial framing only when the store confirms eligibility;
// while loading or when unavailable, the plan's normal marketing subtitle / price shows —
// so "free trial" never flashes before eligibility resolves.
function detailLine(plan: PlanOption, offer?: PlanOffer): string {
  if (plan.interval !== "lifetime" && offer?.trial.status === "eligible") {
    return `${offer.trial.durationText} free, then ${priceLine(plan, offer)}`;
  }
  return plan.subtitle;
}

// "7 days" → "7-day"; "1 month" → "1-month".
function trialAdjective(durationText: string): string {
  return durationText.replace(/^(\d+)\s+(day|week|month|year)s?$/i, "$1-$2");
}

// "7-day" → "7-Day" (title-cased for the button label).
function titleCaseAdjective(adjective: string): string {
  return adjective
    .split("-")
    .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join("-");
}

export function ThreeTierPaywallModal({ visible, onClose, onPurchase, onRestore }: Props) {
  const [selected, setSelected] = useState<string>("premium_annual");
  const [legal, setLegal] = useState<"terms" | "privacy" | null>(null);

  // Live prices + per-account trial eligibility. Only loads while the paywall is visible.
  const { offers } = usePaywallOffers(visible);

  const annual   = plans.find(p => p.id === "premium_annual")!;
  const monthly  = plans.find(p => p.id === "premium_monthly")!;
  const lifetime = plans.find(p => p.id === "lifetime")!;

  function handleSelect(plan: PlanOption) {
    tapLight();
    setSelected(plan.id);
  }

  function handlePurchase() {
    tapSuccess();
    onPurchase(selected);
  }

  const selectedPlan = plans.find(p => p.id === selected) ?? annual;
  const selectedOffer = offers[selected];
  const selectedTrial = selectedOffer?.trial;
  const selectedEligible = selectedTrial?.status === "eligible";
  const trialAdj = selectedEligible ? trialAdjective(selectedTrial.durationText) : "";

  // Headline follows the SELECTED plan: a confirmed trial leads with the offer.
  const headline = selectedEligible
    ? `Start your ${trialAdj} free trial`
    : "Unlock the Living Universe";

  // Primary button: trial → "Start 7-Day Free Trial"; lifetime → "Unlock Lifetime";
  // ineligible / unavailable / still loading → "Continue".
  const ctaLabel =
    selectedPlan.interval === "lifetime"
      ? "Unlock Lifetime"
      : selectedEligible
        ? `Start ${titleCaseAdjective(trialAdj)} Free Trial`
        : "Continue";

  // Renewal disclosure near the button. The "after the free trial" wording is used ONLY for
  // a confirmed eligible offer; lifetime (one-time) shows none.
  const disclosure =
    selectedPlan.interval === "lifetime"
      ? null
      : selectedEligible
        ? "After the free trial, your subscription renews automatically at the displayed price unless canceled at least 24 hours before the trial ends. Manage or cancel in your Apple ID subscription settings."
        : "Your subscription renews automatically at the displayed price unless canceled at least 24 hours before the end of the period. Manage or cancel in your Apple ID subscription settings.";

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

            {/* Header — headline leads with the trial only when the store confirms one. */}
            <Text style={styles.eyebrow}>AURALUNIS PREMIUM</Text>
            <Text style={styles.headline}>{headline}</Text>
            <Text style={styles.sub}>
              You're not paying to unlock the sky. You're paying to see it in a way you've never seen before.
            </Text>

            {/* Plan selector — Annual first (default) */}
            <PlanCard
              plan={annual}
              offer={offers[annual.id]}
              selected={selected === annual.id}
              onPress={() => handleSelect(annual)}
              highlight
            />
            <PlanCard
              plan={monthly}
              offer={offers[monthly.id]}
              selected={selected === monthly.id}
              onPress={() => handleSelect(monthly)}
            />
            <PlanCard
              plan={lifetime}
              offer={offers[lifetime.id]}
              selected={selected === lifetime.id}
              onPress={() => handleSelect(lifetime)}
            />

            {/* CTA — wording follows the selected tier and its confirmed trial state. */}
            <TouchableOpacity
              style={styles.cta}
              onPress={handlePurchase}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
            >
              <Text style={styles.ctaText}>{ctaLabel}</Text>
              <Text style={styles.ctaSub}>{detailLine(selectedPlan, selectedOffer)}</Text>
            </TouchableOpacity>

            {/* Renewal disclosure — required near the purchase button. Trial wording only
                for a confirmed eligible offer; omitted entirely for one-time lifetime. */}
            {disclosure && <Text style={styles.disclosure}>{disclosure}</Text>}

            {/* Feature list */}
            <Text style={styles.sectionLabel}>What you get</Text>
            {(selected === "lifetime" ? lifetimeFeatures : premiumFeatures).map(f => (
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
  plan, offer, selected, onPress, highlight,
}: {
  plan: PlanOption;
  offer?: PlanOffer;
  selected: boolean;
  onPress: () => void;
  highlight?: boolean;
}) {
  const eligible = plan.interval !== "lifetime" && offer?.trial.status === "eligible";
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
        <View style={styles.planTextCol}>
          <Text style={[styles.planName, selected && { color: AuraLunisColors.gold2 }]}>
            {plan.name}
          </Text>
          {/* Trial framing only for a store-confirmed eligible offer; otherwise the plan's
              normal subtitle. Highlighted gold when a trial is active. */}
          <Text style={[styles.planSubtitle, eligible && styles.planSubtitleTrial]}>
            {detailLine(plan, offer)}
          </Text>
        </View>
      </View>
      <View style={styles.planRight}>
        <Text style={[styles.planPrice, selected && { color: AuraLunisColors.gold }]}>
          {priceLine(plan, offer)}
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

// Brand type: Cinzel (display) for headings/labels, Playfair Display (body) for
// prose. Both are loaded app-wide via useAuraLunisFonts(); they fall back cleanly
// to serif/system until loaded, so applying them here can't crash.
const DISPLAY = AuraLunisTypography.display.fontFamily;
const BODY = AuraLunisTypography.body.fontFamily;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AuraLunisColors.cosmicBlack },
  closeBtn: { position: "absolute", top: 52, right: 20, zIndex: 10, width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(7,18,37,0.7)", borderWidth: 1, borderColor: AuraLunisColors.borderGold },
  closeX: { color: AuraLunisColors.silver, fontSize: 16, fontWeight: "700", lineHeight: 18 },
  content: { padding: 24, paddingTop: 72, paddingBottom: 48 },
  eyebrow: { fontFamily: DISPLAY, color: AuraLunisColors.gold, fontSize: 10, fontWeight: "800", letterSpacing: 3, textAlign: "center", marginBottom: 6 },
  headline: { fontFamily: DISPLAY, color: AuraLunisColors.gold2, fontSize: 24, fontWeight: "900", textAlign: "center", marginBottom: 6 },
  sub: { fontFamily: BODY, color: AuraLunisColors.muted, fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 22 },
  planCard: { backgroundColor: AuraLunisColors.elevated, borderRadius: 14, borderWidth: 1, borderColor: AuraLunisColors.borderSubtle, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planCardSelected: { borderColor: AuraLunisColors.gold, backgroundColor: "rgba(217,168,78,0.1)" },
  planCardHighlight: { borderColor: AuraLunisColors.borderGold },
  planLeft: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  planTextCol: { flexShrink: 1 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: AuraLunisColors.faint, marginTop: 2, flexShrink: 0 },
  radioSelected: { borderColor: AuraLunisColors.gold, backgroundColor: AuraLunisColors.gold },
  planName: { fontFamily: DISPLAY, color: AuraLunisColors.silver, fontSize: 14, fontWeight: "700" },
  planSubtitle: { fontFamily: BODY, color: AuraLunisColors.faint, fontSize: 11, marginTop: 2 },
  // Trial framing ("7 days free, then …") reads as a benefit, so lift it to gold.
  planSubtitleTrial: { color: AuraLunisColors.gold2 },
  planRight: { alignItems: "flex-end", gap: 4, flexShrink: 0, marginLeft: 8 },
  planPrice: { fontFamily: DISPLAY, color: AuraLunisColors.silver, fontSize: 15, fontWeight: "800" },
  badge: { backgroundColor: "rgba(217,168,78,0.2)", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontFamily: DISPLAY, color: AuraLunisColors.gold, fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  cta: { backgroundColor: AuraLunisColors.gold, borderRadius: 16, padding: 16, alignItems: "center", marginTop: 20, marginBottom: 10 },
  ctaText: { fontFamily: DISPLAY, color: AuraLunisColors.cosmicBlack, fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
  ctaSub: { fontFamily: BODY, color: "rgba(11,11,18,0.7)", fontSize: 11, marginTop: 3 },
  // Auto-renewal / trial-renewal disclosure directly beneath the CTA (Apple requirement).
  disclosure: { fontFamily: BODY, color: AuraLunisColors.faint, fontSize: 10, lineHeight: 15, textAlign: "center", marginBottom: 14, paddingHorizontal: 4 },
  sectionLabel: { fontFamily: DISPLAY, color: AuraLunisColors.faint, fontSize: 9, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  featureRow: { flexDirection: "row", gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: AuraLunisColors.borderFaint },
  featureCheck: { color: AuraLunisColors.gold, fontSize: 11, marginTop: 1 },
  featureText: { fontFamily: BODY, color: AuraLunisColors.silver, fontSize: 12, flex: 1, lineHeight: 18 },
  footer: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 20, marginBottom: 10 },
  footerLink: { fontFamily: BODY, color: AuraLunisColors.faint, fontSize: 11 },
  footerDot: { color: AuraLunisColors.faint, fontSize: 11 },
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { fontFamily: BODY, color: AuraLunisColors.faint, fontSize: 12 },
});
