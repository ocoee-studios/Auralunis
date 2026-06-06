// Chronaura Premium paywall — single tier, two billing options.
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ChronauraColors, ChronauraPricing } from "@/theme/tokens";
import { GlassPanel } from "@/components/GlassPanel";
import { premiumFeatures } from "./MonetizationCatalog";
import { tapLight, tapSuccess } from "@/services/HapticService";
import { trackPaywallEvent } from "@/services/AnalyticsService";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPurchase: (planId: string) => void;
};

export function ThreeTierPaywallModal({ visible, onClose, onPurchase }: Props) {
  const [plan, setPlan] = useState<"annual" | "monthly">("annual");

  function selectPlan(p: "annual" | "monthly") {
    tapLight();
    setPlan(p);
    trackPaywallEvent(p === "annual" ? "toggle_annual" : "toggle_monthly");
  }

  function handlePurchase() {
    tapSuccess();
    trackPaywallEvent("purchase_tap");
    onPurchase(plan === "annual" ? "premium_annual" : "premium_monthly");
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.overlay}>
        <View style={s.modal}>
          <ScrollView contentContainerStyle={s.scroll}>
            <Pressable style={s.close} onPress={onClose}>
              <Text style={s.closeText}>✕</Text>
            </Pressable>

            <Text style={s.title}>Unlock the Full Cosmos</Text>
            <Text style={s.subtitle}>Everything Chronaura has to offer.</Text>

            {premiumFeatures.map((f, i) => (
              <Text key={i} style={s.feature}>✦ {f}</Text>
            ))}

            <Pressable style={[s.planCard, plan === "annual" && s.planSelected]} onPress={() => selectPlan("annual")}>
              <Text style={s.badge}>BEST VALUE</Text>
              <Text style={s.planName}>Annual</Text>
              <Text style={s.planPrice}>{ChronauraPricing.annual}</Text>
              <Text style={s.planNote}>{ChronauraPricing.annualMonthly} effective · {ChronauraPricing.trial}</Text>
            </Pressable>

            <Pressable style={[s.planCard, plan === "monthly" && s.planSelected]} onPress={() => selectPlan("monthly")}>
              <Text style={s.planName}>Monthly</Text>
              <Text style={s.planPrice}>{ChronauraPricing.monthly}</Text>
              <Text style={s.planNote}>{ChronauraPricing.trial}</Text>
            </Pressable>

            <Pressable style={s.cta} onPress={handlePurchase}>
              <Text style={s.ctaText}>Start My 7-Day Free Trial</Text>
            </Pressable>

            <Pressable onPress={() => { trackPaywallEvent("continue_free"); onClose(); }}>
              <Text style={s.skip}>Continue Exploring</Text>
            </Pressable>

            <Text style={s.legal}>Restore Purchases · Terms · Privacy</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  modal: { backgroundColor: ChronauraColors.cosmicBlack, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "90%", borderWidth: 1, borderColor: "rgba(212,175,55,0.2)" },
  scroll: { padding: 24, paddingBottom: 40 },
  close: { position: "absolute", right: 0, top: 0, padding: 8, zIndex: 1 },
  closeText: { color: ChronauraColors.gold2, fontSize: 18 },
  title: { fontSize: 24, fontWeight: "900", color: "#FFF", textAlign: "center", marginTop: 8 },
  subtitle: { fontSize: 13, color: ChronauraColors.gold2, textAlign: "center", marginTop: 4, marginBottom: 16 },
  feature: { fontSize: 12, color: ChronauraColors.silver, lineHeight: 22, marginLeft: 4 },
  planCard: { borderWidth: 1, borderColor: "rgba(212,175,55,0.2)", borderRadius: 18, padding: 16, marginTop: 12 },
  planSelected: { borderColor: ChronauraColors.gold, backgroundColor: "rgba(212,175,55,0.08)" },
  badge: { fontSize: 8, letterSpacing: 1.5, color: ChronauraColors.gold, fontWeight: "800", marginBottom: 4 },
  planName: { fontSize: 16, fontWeight: "800", color: "#FFF" },
  planPrice: { fontSize: 20, fontWeight: "900", color: ChronauraColors.gold2, marginTop: 2 },
  planNote: { fontSize: 11, color: ChronauraColors.muted, marginTop: 4 },
  cta: { backgroundColor: ChronauraColors.gold, borderRadius: 16, padding: 16, marginTop: 18, alignItems: "center" },
  ctaText: { color: "#0B0B12", fontWeight: "900", fontSize: 15 },
  skip: { color: ChronauraColors.gold2, fontWeight: "800", fontSize: 13, textAlign: "center", marginTop: 14 },
  legal: { fontSize: 10, color: ChronauraColors.faint, textAlign: "center", marginTop: 12 }
});
