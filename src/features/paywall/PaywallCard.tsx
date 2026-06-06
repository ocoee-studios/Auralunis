import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChronauraColors, ChronauraPricing } from "@/theme/tokens";
import { GlassPanel } from "@/components/GlassPanel";
import { plans, premiumFeatures } from "./MonetizationCatalog";

type Props = { onSelectPlan?: (planId: string) => void };

export function PaywallCard({ onSelectPlan }: Props) {
  const annual = plans[0];
  const monthly = plans[1];

  return (
    <View>
      <GlassPanel accent>
        <Text style={s.title}>Unlock the Full Cosmos</Text>
        <Text style={s.subtitle}>7-day free trial · cancel anytime</Text>

        {premiumFeatures.slice(0, 6).map((f, i) => (
          <Text key={i} style={s.feature}>✦ {f}</Text>
        ))}

        <Pressable style={s.planSelected} onPress={() => onSelectPlan?.(annual.id)}>
          <Text style={s.badge}>{annual.badge}</Text>
          <Text style={s.planPrice}>{ChronauraPricing.annual}</Text>
          <Text style={s.planEffective}>{annual.effectiveMonthly} effective</Text>
        </Pressable>

        <Pressable style={s.plan} onPress={() => onSelectPlan?.(monthly.id)}>
          <Text style={s.planPrice}>{ChronauraPricing.monthly}</Text>
        </Pressable>

        <Pressable style={s.cta} onPress={() => onSelectPlan?.(annual.id)}>
          <Text style={s.ctaText}>Start My 7-Day Free Trial</Text>
        </Pressable>

        <Text style={s.legal}>Restore Purchases · Terms · Privacy</Text>
      </GlassPanel>
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "900", color: "#FFF", textAlign: "center" },
  subtitle: { fontSize: 12, color: ChronauraColors.gold2, textAlign: "center", marginTop: 4, marginBottom: 14 },
  feature: { fontSize: 12, color: ChronauraColors.silver, lineHeight: 20, marginLeft: 4 },
  planSelected: { borderWidth: 1, borderColor: ChronauraColors.gold, borderRadius: 16, padding: 14, marginTop: 14, backgroundColor: "rgba(212,175,55,0.08)" },
  plan: { borderWidth: 1, borderColor: "rgba(212,175,55,0.2)", borderRadius: 16, padding: 14, marginTop: 8 },
  badge: { fontSize: 8, letterSpacing: 1.5, color: ChronauraColors.gold, fontWeight: "800", marginBottom: 4 },
  planPrice: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  planEffective: { fontSize: 11, color: ChronauraColors.muted, marginTop: 2 },
  cta: { backgroundColor: ChronauraColors.gold, borderRadius: 14, padding: 14, marginTop: 14, alignItems: "center" },
  ctaText: { color: "#0B0B12", fontWeight: "900", fontSize: 14 },
  legal: { fontSize: 10, color: ChronauraColors.faint, textAlign: "center", marginTop: 12 }
});
