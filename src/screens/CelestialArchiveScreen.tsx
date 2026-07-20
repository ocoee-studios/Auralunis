// CelestialArchiveScreen.tsx
// The reference library — 8 sections across the whole sky, each with live counts
// from the app's own catalogs. Educational browse view; taps jump to the matching
// Learn lesson (free) so "read about it → see it in Sky Lens" stays one flow.

import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenShell } from "@/components/ScreenShell";
import { Starfield } from "@/components/Starfield";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import { useEntitlement } from "@/hooks/useEntitlement";
import { usePaywallNavigation } from "@/context/PaywallNavigationContext";
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import { CONSTELLATION_LINES } from "@/features/sky-lens/data/constellationLines";
import { BRIGHT_STARS } from "@/features/sky-lens/data/brightStars";
import { NEBULAE } from "@/features/sky-lens/data/nebulae";
import type { LearnCategoryId } from "@/features/learn/LearnTypes";

interface Props {
  onClose: () => void;
}

type Section = {
  icon: string;
  title: string;
  detail: string;
  category: LearnCategoryId | null;
};

export function CelestialArchiveScreen({ onClose }: Props) {
  const navigation = useNavigation<any>();
  const { location } = useObserverLocation();
  const { isPremium } = useEntitlement();
  const { openPaywall } = usePaywallNavigation();

  const sections: Section[] = useMemo(() => {
    const sky = computeTonightSky(location);
    const planetsUp = sky.visibleBodies.filter((b) => b.id !== "sun" && b.id !== "moon" && b.altitudeDegrees > 0).length;
    return [
      { icon: "☉", title: "Solar System", detail: "The Sun and everything bound to it — planets, moons, asteroids, comets.", category: "solar_system" },
      { icon: "☾", title: "Moon", detail: `Phases, libration, and tonight's ${sky.moonIlluminationPercent}% illumination.`, category: "moon" },
      { icon: "♃", title: "Planets", detail: `${planetsUp} naked-eye planet${planetsUp === 1 ? "" : "s"} above your horizon right now.`, category: "planets" },
      { icon: "✦", title: "Constellations", detail: `${CONSTELLATION_LINES.length} star figures mapped, from Orion to the Big Dipper.`, category: "constellations" },
      { icon: "★", title: "Stars", detail: `${BRIGHT_STARS.length} named bright stars — magnitude, color, and distance.`, category: "stars" },
      { icon: "☄", title: "Deep Sky", detail: `${NEBULAE.length} nebulae, clusters, galaxies, and remnants.`, category: "deep_sky" },
      { icon: "◎", title: "Milky Way", detail: "Our galaxy edge-on — the band, the core, and the Great Rift.", category: "milky_way" },
      { icon: "✶", title: "Events", detail: "Eclipses, meteor showers, and conjunctions on the horizon.", category: null },
    ];
  }, [location]);

  function openSection(section: Section) {
    tapLight();
    onClose();
    if (section.category) navigation.navigate("Learn");
    else navigation.navigate("Sky");
  }

  // Screen-level entitlement guard (defense-in-depth): the full Celestial Archive is premium.
  // A non-entitled user must never browse the reference library, even if this screen is entered
  // by any other path. Render a premium preview/gate; "Unlock Premium" opens the existing paywall.
  if (!isPremium) {
    return (
      <ScreenShell title="Celestial Archive" subtitle="Reference" background={<Starfield />}>
        <Pressable style={styles.backBtn} onPress={() => { tapLight(); onClose(); }} hitSlop={12}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <View style={styles.gateCard}>
          <Text style={styles.gateIcon}>◈</Text>
          <Text style={styles.gateTitle}>Celestial Archive</Text>
          <Text style={styles.gateBadge}>PREMIUM FEATURE</Text>
          <Text style={styles.gateDesc}>
            The full reference library — Solar System, Moon, Planets, Constellations, Stars, Deep
            Sky, the Milky Way, and upcoming events, each with live counts and a jump straight to
            the sky.
          </Text>
          <Pressable style={styles.unlockBtn} onPress={() => { tapLight(); openPaywall(); }}>
            <Text style={styles.unlockText}>✦ Unlock Premium</Text>
          </Pressable>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title="Celestial Archive" subtitle="Reference" background={<Starfield />}>
      <Pressable style={styles.backBtn} onPress={() => { tapLight(); onClose(); }} hitSlop={12}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>

      <Text style={styles.intro}>
        The whole sky, organized. Tap any section to learn it, then find it overhead in Sky Lens.
      </Text>

      {sections.map((s) => (
        <Pressable key={s.title} style={styles.card} onPress={() => openSection(s)}>
          <Text style={styles.icon}>{s.icon}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardDetail}>{s.detail}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}

      <View style={{ height: 28 }} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  gateCard: { marginTop: 24, backgroundColor: "rgba(7,18,37,0.7)", borderRadius: 20, borderWidth: 1, borderColor: AuraLunisColors.gold, padding: 24, alignItems: "center" },
  gateIcon: { fontSize: 32, color: AuraLunisColors.gold, marginBottom: 10 },
  gateTitle: { color: AuraLunisColors.gold2, fontSize: 22, fontWeight: "900", textAlign: "center" },
  gateBadge: { color: AuraLunisColors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", marginTop: 4, marginBottom: 12 },
  gateDesc: { color: AuraLunisColors.silver, fontSize: 14, lineHeight: 21, textAlign: "center", marginBottom: 20 },
  unlockBtn: { backgroundColor: AuraLunisColors.gold, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, alignItems: "center" },
  unlockText: { color: AuraLunisColors.cosmicBlack, fontWeight: "900", fontSize: 14 },
  backBtn: { marginBottom: 10 },
  backText: { color: AuraLunisColors.gold, fontSize: 14, fontWeight: "700" },
  intro: { color: AuraLunisColors.silver, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "rgba(255,255,255,0.045)", borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: "rgba(217,168,78,0.16)",
  },
  icon: { fontSize: 26, color: AuraLunisColors.gold2, width: 30, textAlign: "center" },
  cardText: { flex: 1 },
  cardTitle: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  cardDetail: { color: AuraLunisColors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  chevron: { color: AuraLunisColors.gold, fontSize: 22, fontWeight: "700" },
});
