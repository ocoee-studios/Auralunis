import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenShell } from "@/components/ScreenShell";
import { FeatureCard } from "@/components/FeatureCard";
import { AuraLunisColors } from "@/theme/tokens";
import { TAB_BAR_STYLE } from "@/navigation/RootTabs";
import { learnCategories, learnTopics } from "@/features/learn/LearnCatalog";
import type { LearnCategoryId } from "@/features/learn/LearnTypes";
import { LearnVisualForCategory } from "@/features/learn/LearnCategoryVisual";
import { useLearnPreferences } from "@/features/learn/learnPreferences";
import { LearnDetailScreen } from "@/screens/LearnDetailScreen";

export function LearnScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<LearnCategoryId>("solar_system");
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);
  // Which Deep Sky tab is active (Nebula/Galaxy/Cluster/Remnant) — drives which
  // deep_sky topic is shown beneath the live visual.
  const [deepSkyTabIndex, setDeepSkyTabIndex] = useState(0);
  // Learning Preferences (skill level + interests) personalize ordering.
  const { prefs } = useLearnPreferences();

  // Go full-screen for a lesson: hide the tab bar, restore it on exit (mirrors
  // the Sky Lens immersive pattern).
  useEffect(() => {
    navigation.setOptions?.({ tabBarStyle: openTopicId ? { display: "none" } : TAB_BAR_STYLE });
  }, [navigation, openTopicId]);

  // Order categories so the user's interests come first (rest keep catalog order).
  const orderedCategories = useMemo(() => {
    if (!prefs.interests.length) return learnCategories;
    const rank = (id: string) => {
      const i = prefs.interests.indexOf(id as (typeof prefs.interests)[number]);
      return i === -1 ? prefs.interests.length + 1 : i;
    };
    return [...learnCategories].sort((a, b) => rank(a.id) - rank(b.id));
  }, [prefs.interests]);

  // On first load, default the selected category to the top interest (once — never
  // overrides a category the user later taps).
  const appliedDefault = useRef(false);
  useEffect(() => {
    if (!appliedDefault.current && prefs.interests.length > 0) {
      appliedDefault.current = true;
      const top = prefs.interests[0];
      // Only default to it if it's a real category (guards against a future interest key
      // that doesn't map to a LearnCategoryId → blank screen).
      if (learnCategories.some((c) => c.id === top)) setSelectedCategory(top as LearnCategoryId);
    }
  }, [prefs.interests]);

  const selectedTopics = useMemo(() => {
    const inCategory = learnTopics.filter((topic) => topic.categoryId === selectedCategory);
    // Deep Sky shows one topic at a time, matched to the active tab in the visual.
    if (selectedCategory === "deep_sky") {
      const wantId = ["nebulae", "galaxies", "clusters", "remnants"][deepSkyTabIndex];
      return inCategory.filter((topic) => topic.id === wantId);
    }
    // Lessons matching the chosen skill level surface first.
    if (!prefs.level) return inCategory;
    return [...inCategory].sort((a, b) => {
      const am = a.level === prefs.level ? 0 : 1;
      const bm = b.level === prefs.level ? 0 : 1;
      return am - bm;
    });
  }, [selectedCategory, deepSkyTabIndex, prefs.level]);

  const selectedMeta = learnCategories.find((category) => category.id === selectedCategory);

  // ── Full-screen lesson ──────────────────────────────────────────────────────
  if (openTopicId) {
    const idx = learnTopics.findIndex((t) => t.id === openTopicId);
    const topic = learnTopics[idx];
    if (topic) {
      const next = learnTopics[(idx + 1) % learnTopics.length];
      const categoryTitle =
        learnCategories.find((c) => c.id === topic.categoryId)?.title ?? "Lesson";
      return (
        <LearnDetailScreen
          topic={topic}
          categoryTitle={categoryTitle}
          nextTopicTitle={next && next.id !== topic.id ? next.title : null}
          onBack={() => setOpenTopicId(null)}
          onNext={() => setOpenTopicId(next.id)}
          onOpenSkyLens={() => {
            setOpenTopicId(null);
            navigation.navigate("Sky", topic.skyTarget ? { focusTarget: topic.skyTarget } : undefined);
          }}
        />
      );
    }
  }

  return (
    <ScreenShell title="Learn the Cosmos" subtitle="Education">
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>A living astronomy guide.</Text>
        <Text style={styles.heroCopy}>
          Learn planets, constellations, stars, the Moon, nebulae, galaxies, and the Milky Way
          through real live visuals instead of static blocks alone.
        </Text>
        <Text style={styles.heroFree}>Every lesson is free.</Text>
      </View>

      <Text style={styles.sectionLabel}>Choose a learning path</Text>
      <View style={styles.categoryGrid}>
        {orderedCategories.map((category) => {
          const active = selectedCategory === category.id;
          return (
            <Pressable
              key={category.id}
              style={[styles.categoryCard, active && styles.categoryCardActive]}
              onPress={() => setSelectedCategory(category.id as LearnCategoryId)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.selectedHeader}>
        <Text style={styles.selectedTitle}>{selectedMeta?.title}</Text>
        <Text style={styles.selectedCopy}>{selectedMeta?.description}</Text>
      </View>

      <LearnVisualForCategory categoryId={selectedCategory} onDeepSkyTabChange={setDeepSkyTabIndex} />

      {selectedTopics.map((topic) => (
        <FeatureCard
          key={topic.id}
          title={topic.title}
          description={`${topic.summary}\n\nKey facts:\n• ${topic.keyFacts.join("\n• ")}`}
          actionLabel="Open Lesson"
          onPress={() => setOpenTopicId(topic.id)}
          status={topic.level}
        />
      ))}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(217,168,78,0.08)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.18)",
    marginBottom: 16
  },
  heroTitle: {
    color: "#FFF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.8
  },
  heroCopy: {
    color: AuraLunisColors.silver,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8
  },
  heroFree: {
    color: AuraLunisColors.gold2,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 10
  },
  sectionLabel: {
    color: AuraLunisColors.gold2,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "900",
    marginBottom: 10
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16
  },
  categoryCard: {
    width: "48%",
    minHeight: 132,
    borderRadius: 22,
    padding: 13,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)"
  },
  categoryCardActive: {
    backgroundColor: "rgba(217,168,78,0.12)",
    borderColor: "rgba(217,168,78,0.28)"
  },
  categoryIcon: { fontSize: 24, color: AuraLunisColors.gold2 },
  categoryTitle: { color: "#FFF", fontSize: 14, fontWeight: "900", marginTop: 7 },
  categoryDescription: { color: AuraLunisColors.muted, fontSize: 11, lineHeight: 15, marginTop: 5 },
  selectedHeader: {
    marginTop: 4,
    marginBottom: 10
  },
  selectedTitle: { color: "#FFF", fontSize: 23, fontWeight: "900", letterSpacing: -0.7 },
  selectedCopy: { color: AuraLunisColors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 }
});
