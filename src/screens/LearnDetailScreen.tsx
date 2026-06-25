// LearnDetailScreen.tsx
// A full-screen, FREE lesson — opened when a Learn topic card is tapped (no Alert,
// no paywall). Shows the live visual, gold key-facts, the full lesson body, a
// "Try in Sky Lens" jump, and a "Next lesson" button. Reuses ScreenShell + the
// living Starfield so it reads like a beautiful astronomy textbook.

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenShell } from "@/components/ScreenShell";
import { Starfield } from "@/components/Starfield";
import { GlassPanel } from "@/components/GlassPanel";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import { LearnVisualForCategory } from "@/features/learn/LearnCategoryVisual";
import { useEntitlement } from "@/hooks/useEntitlement";
import { usePaywallNavigation } from "@/context/PaywallNavigationContext";
import type { LearnTopic } from "@/features/learn/LearnTypes";

interface LearnDetailScreenProps {
  topic: LearnTopic;
  categoryTitle: string;
  nextTopicTitle: string | null;
  onBack: () => void;
  onNext: () => void;
  onOpenSkyLens: () => void;
}

export function LearnDetailScreen({
  topic,
  categoryTitle,
  nextTopicTitle,
  onBack,
  onNext,
  onOpenSkyLens,
}: LearnDetailScreenProps) {
  const { isPremium } = useEntitlement();
  const { openPaywall } = usePaywallNavigation();
  return (
    <ScreenShell title={topic.title} subtitle={categoryTitle} background={<Starfield />}>
      {/* Back + free-lesson badges */}
      <Pressable
        style={styles.backBtn}
        onPress={() => { tapLight(); onBack(); }}
        hitSlop={12}
      >
        <Text style={styles.backText}>‹ Learn</Text>
      </Pressable>

      <View style={styles.badgeRow}>
        <Text style={styles.freeTag}>FREE LESSON</Text>
        <Text style={styles.levelTag}>{topic.level.toUpperCase()}</Text>
      </View>

      {/* Live visual up top */}
      <GlassPanel accent style={styles.visualCard}>
        <LearnVisualForCategory categoryId={topic.categoryId} />
      </GlassPanel>

      {/* Key facts as gold bullets */}
      <Text style={styles.sectionLabel}>KEY FACTS</Text>
      <View style={styles.factsCard}>
        {topic.keyFacts.map((fact, i) => (
          <View key={i} style={styles.factRow}>
            <Text style={styles.bullet}>✦</Text>
            <Text style={styles.factText}>{fact}</Text>
          </View>
        ))}
      </View>

      {/* Full description */}
      <Text style={styles.sectionLabel}>THE LESSON</Text>
      <Text style={styles.summary}>{topic.summary}</Text>
      {(topic.body ?? "").split("\n\n").filter(Boolean).map((para, i) => (
        <Text key={i} style={styles.bodyPara}>{para}</Text>
      ))}

      {/* Try in Sky Lens */}
      <Pressable style={styles.skyBtn} onPress={() => { tapLight(); onOpenSkyLens(); }}>
        <Text style={styles.skyBtnText}>{topic.skyLensAction ?? "Try in Sky Lens"} →</Text>
      </Pressable>

      {/* Next lesson */}
      {nextTopicTitle && (
        <Pressable style={styles.nextBtn} onPress={() => { tapLight(); onNext(); }}>
          <Text style={styles.nextLabel}>NEXT LESSON</Text>
          <Text style={styles.nextTitle}>{nextTopicTitle} →</Text>
        </Pressable>
      )}

      {/* Soft Premium nudge — every lesson stays free; this gently surfaces Premium
          at the end for free users only (never blocks the content). */}
      {!isPremium && (
        <View style={styles.nudge}>
          <Text style={styles.nudgeTitle}>✦  Go deeper with Premium</Text>
          <Text style={styles.nudgeBody}>
            Every lesson is free. Premium adds Sky Lens AR over your live sky, your Birth
            Sky chart, 88 constellations with cultural stories, and the full deep-sky catalogue.
          </Text>
          <Pressable style={styles.nudgeBtn} onPress={() => { tapLight(); openPaywall(); }}>
            <Text style={styles.nudgeBtnText}>Unlock Premium</Text>
          </Pressable>
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  backBtn: { marginBottom: 10 },
  backText: { color: AuraLunisColors.gold, fontSize: 14, fontWeight: "700" },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  freeTag: {
    fontSize: 9, fontWeight: "900", letterSpacing: 1.5, color: AuraLunisColors.cosmicBlack,
    backgroundColor: AuraLunisColors.gold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden",
  },
  levelTag: {
    fontSize: 9, fontWeight: "800", letterSpacing: 1.5, color: AuraLunisColors.gold2,
    borderWidth: 1, borderColor: "rgba(217,168,78,0.35)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden",
  },
  visualCard: { marginBottom: 18, paddingVertical: 10 },
  sectionLabel: {
    fontSize: 10, fontWeight: "900", letterSpacing: 2, color: AuraLunisColors.gold, marginBottom: 10,
  },
  factsCard: {
    backgroundColor: "rgba(217,168,78,0.06)",
    borderWidth: 1, borderColor: "rgba(217,168,78,0.16)",
    borderRadius: 16, padding: 14, marginBottom: 20, gap: 10,
  },
  factRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  bullet: { color: AuraLunisColors.gold2, fontSize: 13, lineHeight: 20, marginTop: 0 },
  factText: { color: "#FFF", fontSize: 14, lineHeight: 20, flex: 1, fontWeight: "600" },
  summary: { color: AuraLunisColors.gold2, fontSize: 15, lineHeight: 23, fontWeight: "700", marginBottom: 12 },
  bodyPara: { color: AuraLunisColors.silver, fontSize: 14, lineHeight: 23, marginBottom: 14 },
  skyBtn: {
    marginTop: 4, marginBottom: 14, borderRadius: 14, paddingVertical: 14, alignItems: "center",
    backgroundColor: AuraLunisColors.gold,
  },
  skyBtnText: { color: AuraLunisColors.cosmicBlack, fontWeight: "900", fontSize: 14, letterSpacing: 0.3 },
  nextBtn: {
    marginBottom: 24, borderRadius: 14, padding: 14,
    backgroundColor: "rgba(255,255,255,0.045)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  nextLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 2, color: AuraLunisColors.faint, marginBottom: 3 },
  nextTitle: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  nudge: {
    marginBottom: 28, borderRadius: 16, padding: 16,
    backgroundColor: "rgba(217,168,78,0.07)", borderWidth: 1, borderColor: "rgba(217,168,78,0.22)",
  },
  nudgeTitle: { color: AuraLunisColors.gold2, fontSize: 14, fontWeight: "800", marginBottom: 6 },
  nudgeBody: { color: AuraLunisColors.silver, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  nudgeBtn: { borderRadius: 12, paddingVertical: 11, alignItems: "center", backgroundColor: AuraLunisColors.gold },
  nudgeBtnText: { color: AuraLunisColors.cosmicBlack, fontWeight: "900", fontSize: 13, letterSpacing: 0.3 },
});
