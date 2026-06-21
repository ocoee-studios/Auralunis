import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuraLunisColors, AuraLunisPricing } from "@/theme/tokens";
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
          <Text style={s.planPrice}>{AuraLunisPricing.annual}</Text>
          <Text style={s.planEffective}>{AuraLunisPricing.annualMonthly} effective</Text>
        </Pressable>

        <Pressable style={s.plan} onPress={() => onSelectPlan?.(monthly.id)}>
          <Text style={s.planPrice}>{AuraLunisPricing.monthly}</Text>
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
  subtitle: { fontSize: 12, color: AuraLunisColors.gold2, textAlign: "center", marginTop: 4, marginBottom: 14 },
  feature: { fontSize: 12, color: AuraLunisColors.silver, lineHeight: 20, marginLeft: 4 },
  planSelected: { borderWidth: 1, borderColor: AuraLunisColors.gold, borderRadius: 16, padding: 14, marginTop: 14, backgroundColor: "rgba(217,168,78,0.08)" },
  plan: { borderWidth: 1, borderColor: "rgba(217,168,78,0.2)", borderRadius: 16, padding: 14, marginTop: 8 },
  badge: { fontSize: 8, letterSpacing: 1.5, color: AuraLunisColors.gold, fontWeight: "800", marginBottom: 4 },
  planPrice: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  planEffective: { fontSize: 11, color: AuraLunisColors.muted, marginTop: 2 },
  cta: { backgroundColor: AuraLunisColors.gold, borderRadius: 14, padding: 14, marginTop: 14, alignItems: "center" },
  ctaText: { color: "#030816", fontWeight: "900", fontSize: 14 },
  legal: { fontSize: 10, color: AuraLunisColors.faint, textAlign: "center", marginTop: 12 }
});
