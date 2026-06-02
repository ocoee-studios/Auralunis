// Horizon+ paywall with selectable plan cards matching the approved clickthrough.
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LogoMark } from "@/components/LogoMark";
import { ChronauraColors } from "@/theme/tokens";
import { FOUNDER_ANNUAL_COPY, SEVEN_DAY_TRIAL_COPY, type BillingPeriod, type ChronauraPaidTierId } from "@/features/paywall/MonetizationCatalog";
import { trackPaywallEvent } from "@/services/AnalyticsService";

type Props = {
  visible: boolean;
  onPurchaseTier: (tierId: ChronauraPaidTierId, billingPeriod: BillingPeriod) => void;
  onContinueFree: () => void;
  onRestorePurchases: () => void;
  onJoinSovereignWaitlist: () => void;
};

const FOUNDER_DEADLINE = new Date("2026-12-31T23:59:59Z");
function founderActive() { return Date.now() < FOUNDER_DEADLINE.getTime(); }
function daysLeft() { return Math.max(0, Math.ceil((FOUNDER_DEADLINE.getTime() - Date.now()) / 86_400_000)); }

export function ThreeTierPaywallModal({ visible, onPurchaseTier, onContinueFree, onRestorePurchases }: Props) {
  const [plan, setPlan] = useState<BillingPeriod>("annual");
  const founder = founderActive();

  useEffect(() => { if (visible) trackPaywallEvent("paywall_impression", { plan }); }, [visible]);

  function purchase() {
    trackPaywallEvent("purchase_tap", { plan, founder });
    onPurchaseTier("horizon_plus", plan);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent={false}>
      <ScrollView style={s.root} contentContainerStyle={s.content}>
        <LogoMark size={52} />
        <Text style={s.eyebrow}>EVERYDAY STARGAZING</Text>
        <Text style={s.title}>Horizon+</Text>
        <Text style={s.subtitle}>Begin at the horizon.</Text>
        <Text style={s.body}>
          Full Sky Lens with every visible body labeled. All 88 constellation lessons.
          Celestial alarms, premium themes, and the expanded encrypted Vault.
        </Text>

        {/* Annual plan card */}
        <Pressable style={[s.planCard, plan === "annual" && s.planSelected]} onPress={() => { setPlan("annual"); trackPaywallEvent("toggle_annual", {}); }}>
          <Text style={s.planBadge}>{founder ? "BEST VALUE · FOUNDER OFFER" : "BEST VALUE"}</Text>
          <Text style={s.planName}>Annual Horizon+</Text>
          {founder ? (
            <>
              <Text style={s.planPrice}>$24.99 for your first year</Text>
              <Text style={s.planFine}>Eligible 7-day free trial · standard annual price $29.99/year</Text>
              <Text style={s.planUrgency}>{daysLeft()} days left at founder pricing</Text>
            </>
          ) : (
            <>
              <Text style={s.planPrice}>$29.99/year</Text>
              <Text style={s.planFine}>That's $2.50/month · eligible 7-day free trial</Text>
            </>
          )}
        </Pressable>

        {/* Monthly plan card */}
        <Pressable style={[s.planCard, plan === "monthly" && s.planSelected]} onPress={() => { setPlan("monthly"); trackPaywallEvent("toggle_monthly", {}); }}>
          <Text style={s.planName}>Monthly Horizon+</Text>
          <Text style={s.planPrice}>$4.99/month</Text>
          <Text style={s.planFine}>Eligible 7-day free trial · then $4.99/month</Text>
        </Pressable>

        <Pressable style={s.cta} onPress={purchase}>
          <Text style={s.ctaText}>Start My 7-Day Free Trial</Text>
        </Pressable>

        <View style={s.linkRow}>
          <Pressable onPress={onRestorePurchases}><Text style={s.link}>Restore Purchases</Text></Pressable>
          <Text style={s.linkDot}>·</Text>
          <Text style={s.link}>Terms of Use</Text>
          <Text style={s.linkDot}>·</Text>
          <Text style={s.link}>Privacy Policy</Text>
        </View>

        <Pressable style={s.freeBtn} onPress={() => { trackPaywallEvent("continue_free", {}); onContinueFree(); }}>
          <Text style={s.freeBtnText}>Continue with Horizon Free</Text>
        </Pressable>

        <Text style={s.legal}>
          7-day free trial for eligible new subscribers. Subscription renews
          automatically unless canceled. Cancel anytime in your Apple Account
          subscription settings.
        </Text>
      </ScrollView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#05070D" },
  content: { paddingHorizontal: 22, paddingTop: 56, paddingBottom: 50, alignItems: "center" },
  eyebrow: { color: ChronauraColors.gold2, fontSize: 10, letterSpacing: 2, fontWeight: "900", marginTop: 16 },
  title: { color: "#FFF", fontSize: 32, fontWeight: "900", marginTop: 6, letterSpacing: -0.5 },
  subtitle: { fontStyle: "italic", color: ChronauraColors.gold2, fontSize: 17, marginTop: 6 },
  body: { color: ChronauraColors.silver, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 12, marginBottom: 18, maxWidth: 310 },
  planCard: { width: "100%", borderRadius: 18, borderWidth: 1, borderColor: "rgba(216,220,231,0.14)", backgroundColor: "rgba(16,21,34,0.75)", padding: 14, marginTop: 10 },
  planSelected: { borderColor: ChronauraColors.gold, backgroundColor: "rgba(199,166,106,0.10)" },
  planBadge: { color: ChronauraColors.gold, fontSize: 9, letterSpacing: 1.2, fontWeight: "900", marginBottom: 6 },
  planName: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  planPrice: { color: ChronauraColors.gold2, fontSize: 15, fontWeight: "800", marginTop: 5 },
  planFine: { color: ChronauraColors.muted, fontSize: 11, lineHeight: 16, marginTop: 5 },
  planUrgency: { color: ChronauraColors.gold2, fontSize: 11, fontWeight: "900", marginTop: 5 },
  cta: { width: "100%", borderRadius: 15, backgroundColor: ChronauraColors.gold, paddingVertical: 15, alignItems: "center", marginTop: 16 },
  ctaText: { color: "#17120B", fontWeight: "900", fontSize: 15 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
  link: { color: ChronauraColors.gold2, fontSize: 11 },
  linkDot: { color: ChronauraColors.muted, fontSize: 11 },
  freeBtn: { paddingVertical: 14, marginTop: 4 },
  freeBtnText: { color: ChronauraColors.silver, fontWeight: "700", fontSize: 13 },
  legal: { color: ChronauraColors.muted, fontSize: 10, lineHeight: 15, textAlign: "center", marginTop: 14, maxWidth: 280 }
});
