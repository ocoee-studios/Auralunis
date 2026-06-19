import React, { useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ChronauraColors, ChronauraPricing } from "@/theme/tokens";
import { GlassPanel } from "@/components/GlassPanel";
import { plans, premiumFeatures } from "./MonetizationCatalog";
import { getCurrentPackages } from "@/services/RevenueCatService";

const TERMS_URL = "https://ocoeestudios.com/chronaura/terms";
const PRIVACY_URL = "https://ocoeestudios.com/chronaura/privacy";
const EULA_URL = "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";

type Props = {
  onSelectPlan?: (planId: string) => void;
  onRestore?: () => void;
};

export function PaywallCard({ onSelectPlan, onRestore }: Props) {
  const annual = plans[0];
  const monthly = plans[1];

  // Live StoreKit prices, falling back to static pricing tokens until loaded.
  const [livePrices, setLivePrices] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    getCurrentPackages()
      .then((packages) => {
        if (!active) return;
        const map: Record<string, string> = {};
        for (const plan of [annual, monthly]) {
          const match = packages.find(
            (pkg) =>
              pkg.identifier === plan.revenueCatPackageId ||
              pkg.product.identifier === plan.productId
          );
          if (match?.product.priceString) map[plan.id] = match.product.priceString;
        }
        setLivePrices(map);
      })
      .catch(() => {
        // RevenueCat unavailable — keep static fallback prices.
      });
    return () => {
      active = false;
    };
  }, [annual, monthly]);

  const annualPrice = livePrices[annual.id] ?? ChronauraPricing.annual;
  const monthlyPrice = livePrices[monthly.id] ?? ChronauraPricing.monthly;

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
          <Text style={s.planPrice}>{annualPrice}</Text>
          <Text style={s.planEffective}>{ChronauraPricing.annualMonthly} effective</Text>
        </Pressable>

        <Pressable style={s.plan} onPress={() => onSelectPlan?.(monthly.id)}>
          <Text style={s.planPrice}>{monthlyPrice}</Text>
        </Pressable>

        <Pressable style={s.cta} onPress={() => onSelectPlan?.(annual.id)}>
          <Text style={s.ctaText}>Start My 7-Day Free Trial</Text>
        </Pressable>

        <Text style={s.disclosure}>
          Subscription auto-renews unless cancelled at least 24h before the period
          ends. Manage or cancel in your Apple ID settings.
        </Text>

        <Text style={s.legal}>
          <Text onPress={() => onRestore?.()}>Restore Purchases</Text>
          {" · "}
          <Text onPress={() => Linking.openURL(TERMS_URL)}>Terms</Text>
          {" · "}
          <Text onPress={() => Linking.openURL(PRIVACY_URL)}>Privacy</Text>
          {" · "}
          <Text onPress={() => Linking.openURL(EULA_URL)}>EULA</Text>
        </Text>
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
  disclosure: { fontSize: 9, color: ChronauraColors.faint, textAlign: "center", lineHeight: 13, marginTop: 12 },
  legal: { fontSize: 10, color: ChronauraColors.faint, textAlign: "center", marginTop: 8 }
});
