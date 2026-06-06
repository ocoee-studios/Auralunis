import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { GlassPanel } from "@/components/GlassPanel";
import { ScreenShell } from "@/components/ScreenShell";
import { FeatureCard } from "@/components/FeatureCard";
import { ChronauraColors } from "@/theme/tokens";
import { learnCategories, learnTopics } from "@/features/learn/LearnCatalog";
import type { LearnCategoryId } from "@/features/learn/LearnTypes";
import { SolarSystemLiveVisual } from "@/features/learn/visuals/SolarSystemLiveVisual";
import { MoonPhaseLiveVisual } from "@/features/learn/visuals/MoonPhaseLiveVisual";
import { ConstellationIgnitionVisual } from "@/features/learn/visuals/ConstellationIgnitionVisual";
import { StarBrightnessVisual } from "@/features/learn/visuals/StarBrightnessVisual";
import { DeepSkyGlowVisual } from "@/features/learn/visuals/DeepSkyGlowVisual";
import { MilkyWayBandVisual } from "@/features/learn/visuals/MilkyWayBandVisual";
import { ThirtyNightsProgressVisual } from "@/features/learn/visuals/ThirtyNightsProgressVisual";

function LearnVisualForCategory({ categoryId }: { categoryId: LearnCategoryId }) {
  switch (categoryId) {
    case "solar_system":
    case "planets":
      return <SolarSystemLiveVisual />;
    case "moon":
      return <MoonPhaseLiveVisual />;
    case "constellations":
      return <ConstellationIgnitionVisual />;
    case "stars":
      return <StarBrightnessVisual />;
    case "deep_sky":
      return <DeepSkyGlowVisual />;
    case "milky_way":
      return <MilkyWayBandVisual />;
    case "beginner_path":
      return <ThirtyNightsProgressVisual />;
    default:
      return null;
  }
}

export function LearnScreen() {
  const [selectedCategory, setSelectedCategory] = useState<LearnCategoryId>("solar_system");

  const selectedTopics = useMemo(
    () => learnTopics.filter((topic) => topic.categoryId === selectedCategory),
    [selectedCategory]
  );

  const selectedMeta = learnCategories.find((category) => category.id === selectedCategory);

  return (
    <ScreenShell title="Learn the Cosmos" subtitle="Education">
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>A living astronomy guide.</Text>
        <Text style={styles.heroCopy}>
          Learn planets, constellations, stars, the Moon, nebulae, galaxies, and the Milky Way
          through real live visuals instead of static blocks alone.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Choose a learning path</Text>
      <View style={styles.categoryGrid}>
        {learnCategories.map((category) => {
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

      <LearnVisualForCategory categoryId={selectedCategory} />

      {selectedTopics.map((topic) => (
        <FeatureCard
          key={topic.id}
          title={topic.title}
          description={`${topic.summary}\n\nKey facts:\n• ${topic.keyFacts.join("\n• ")}`}
          actionLabel={topic.skyLensAction ?? "Open Lesson"}
          onPress={() =>
            Alert.alert(
              topic.title,
              `${topic.archiveAction ?? "Open Archive"}\n\nThis lesson connects to the live visual module and can later connect to Sky Lens and Celestial Archive.`
            )
          }
          status={topic.level}
        />
      ))}

      <FeatureCard
        title="Teacher Mode"
        description="Future option: simplified explanations, pronunciation help, object quizzes, and guided sky challenges for families, children, and true beginners."
        actionLabel="Preview Teacher Mode"
        onPress={() => Alert.alert("Teacher Mode", "Future educational mode preview.")}
        status="future"
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(212,175,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.18)",
    marginBottom: 16
  },
  heroTitle: {
    color: "#FFF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.8
  },
  heroCopy: {
    color: ChronauraColors.silver,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8
  },
  sectionLabel: {
    color: ChronauraColors.gold2,
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
    backgroundColor: "rgba(212,175,55,0.12)",
    borderColor: "rgba(212,175,55,0.28)"
  },
  categoryIcon: { fontSize: 24, color: ChronauraColors.gold2 },
  categoryTitle: { color: "#FFF", fontSize: 14, fontWeight: "900", marginTop: 7 },
  categoryDescription: { color: ChronauraColors.muted, fontSize: 11, lineHeight: 15, marginTop: 5 },
  selectedHeader: {
    marginTop: 4,
    marginBottom: 10
  },
  selectedTitle: { color: "#FFF", fontSize: 23, fontWeight: "900", letterSpacing: -0.7 },
  selectedCopy: { color: ChronauraColors.muted, fontSize: 13, lineHeight: 19, marginTop: 4 }
});
