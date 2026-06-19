// RadarTutorial.tsx
// First-time tutorial shown when the user opens OrbitalAlignmentScreen
// for the first time. 3 screens explaining the radar, modes, and locking.
// Stored in AsyncStorage so it only shows once.

import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  Easing, withSequence,
} from "react-native-reanimated";
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChronauraColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";

const TUTORIAL_KEY = "chronaura.radar_tutorial.seen";
const { width: SCREEN_W } = Dimensions.get("window");

interface RadarTutorialProps {
  /** Force show even if already seen (for Settings > "Replay Tutorial") */
  forceShow?: boolean;
  onComplete: () => void;
}

interface TutorialPage {
  title: string;
  subtitle: string;
  body: string;
  illustration: "radar" | "modes" | "lock";
}

const PAGES: TutorialPage[] = [
  {
    title: "The Radar Scope",
    subtitle: "YOUR SKY IN 2D",
    body: "The center of the scope is where your phone is pointing. Colored blips are satellites and planets. Move your phone and the blips drift — guide one into the crosshair center to track it.",
    illustration: "radar",
  },
  {
    title: "Nine Tracking Modes",
    subtitle: "FLEET · DEEP SPACE · TRAIN · MORE",
    body: "Tap the mode buttons to switch what the radar tracks. Fleet shows real LEO satellites. Deep Space shows planets. Train tracks Starlink chains. Some modes are Premium — look for the ◈ icon.",
    illustration: "modes",
  },
  {
    title: "Lock On",
    subtitle: "100% ALIGNMENT",
    body: "When a blip reaches the center reticle, you hit a Lock. Your watch buzzes, the blip turns green, and the event is saved to your Cosmic Drift galaxy — your personal star map of discoveries.",
    illustration: "lock",
  },
];

function RadarIllustration({ type }: { type: TutorialPage["illustration"] }) {
  const SIZE = 160;
  const C = SIZE / 2;

  // Animated blip position
  const blipX = useSharedValue(C + 40);
  const blipY = useSharedValue(C - 30);

  useEffect(() => {
    if (type === "lock") {
      // Animate blip drifting to center for lock illustration
      blipX.value = withTiming(C, { duration: 1200, easing: Easing.inOut(Easing.ease) });
      blipY.value = withTiming(C, { duration: 1200, easing: Easing.inOut(Easing.ease) });
    } else if (type === "radar") {
      // Slow orbit around the scope
      blipX.value = withSequence(
        withTiming(C + 35, { duration: 800 }),
        withTiming(C - 20, { duration: 1200 }),
        withTiming(C + 40, { duration: 1000 })
      );
      blipY.value = withSequence(
        withTiming(C - 25, { duration: 1000 }),
        withTiming(C + 30, { duration: 1000 }),
        withTiming(C - 30, { duration: 800 })
      );
    }
  }, [type]);

  const blipStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: blipX.value - 8 },
      { translateY: blipY.value - 8 },
    ],
  }));

  const lockColor = type === "lock" ? ChronauraColors.green : ChronauraColors.gold;

  if (type === "modes") {
    return (
      <View style={styles.modesGrid}>
        {["Fleet", "Deep Space", "Train", "Golden", "Debris", "Meteor", "Chain", "Static", "Re-Entry"].map((name, i) => (
          <View key={name} style={[styles.modeChip, i > 3 && { borderColor: ChronauraColors.gold + "55" }]}>
            {i > 3 && <Text style={styles.modeLock}>◈</Text>}
            <Text style={[styles.modeChipText, i > 3 && { color: ChronauraColors.faint }]}>{name}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.illustrationWrap}>
      <Svg width={SIZE} height={SIZE}>
        <Defs>
          <RadialGradient id="tg" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={lockColor} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={lockColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={C} cy={C} r={C - 2} fill="url(#tg)" />
        <Circle cx={C} cy={C} r={C - 2} stroke={ChronauraColors.borderGold} strokeWidth={1} fill="none" />
        <Circle cx={C} cy={C} r={C * 0.55} stroke={ChronauraColors.borderSubtle} strokeWidth={0.5} strokeDasharray="3 3" fill="none" />
        <Line x1={12} y1={C} x2={SIZE - 12} y2={C} stroke={ChronauraColors.borderSubtle} strokeWidth={0.5} />
        <Line x1={C} y1={12} x2={C} y2={SIZE - 12} stroke={ChronauraColors.borderSubtle} strokeWidth={0.5} />
        <Circle cx={C} cy={C} r={8} stroke={lockColor} strokeWidth={1.5} fill="none" />
        <Circle cx={C} cy={C} r={2} fill={lockColor} />
      </Svg>
      <Animated.View style={[styles.tutorialBlip, blipStyle, { backgroundColor: lockColor }]} />
    </View>
  );
}

export function RadarTutorial({ forceShow, onComplete }: RadarTutorialProps) {
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (forceShow) { setVisible(true); return; }
    AsyncStorage.getItem(TUTORIAL_KEY).then(seen => {
      if (!seen) setVisible(true);
    }).catch(() => setVisible(true));
  }, [forceShow]);

  function handleNext() {
    tapLight();
    if (page < PAGES.length - 1) {
      setPage(p => p + 1);
    } else {
      AsyncStorage.setItem(TUTORIAL_KEY, "true").catch(() => {});
      setVisible(false);
      onComplete();
    }
  }

  function handleSkip() {
    AsyncStorage.setItem(TUTORIAL_KEY, "true").catch(() => {});
    setVisible(false);
    onComplete();
  }

  if (!visible) return null;

  const currentPage = PAGES[page];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Page indicator dots */}
          <View style={styles.dots}>
            {PAGES.map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
            ))}
          </View>

          <Text style={styles.subtitle}>{currentPage.subtitle}</Text>
          <Text style={styles.title}>{currentPage.title}</Text>

          <View style={styles.illustrationContainer}>
            <RadarIllustration type={currentPage.illustration} />
          </View>

          <Text style={styles.body}>{currentPage.body}</Text>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {page < PAGES.length - 1 ? "Next" : "Start Tracking"}
            </Text>
          </TouchableOpacity>

          {page < PAGES.length - 1 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip tutorial</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(11,11,18,0.92)", justifyContent: "center", alignItems: "center", padding: 24 },
  card: { width: "100%", maxWidth: 360, backgroundColor: ChronauraColors.surface, borderRadius: 28, borderWidth: 1, borderColor: ChronauraColors.borderGold, padding: 28, alignItems: "center" },
  dots: { flexDirection: "row", gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ChronauraColors.elevated },
  dotActive: { backgroundColor: ChronauraColors.gold, width: 24 },
  subtitle: { color: ChronauraColors.gold, fontSize: 9, fontWeight: "800", letterSpacing: 3, marginBottom: 6 },
  title: { color: ChronauraColors.gold2, fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 16 },
  illustrationContainer: { marginBottom: 20, alignItems: "center" },
  illustrationWrap: { width: 160, height: 160 },
  tutorialBlip: { position: "absolute", width: 16, height: 16, borderRadius: 8, shadowOpacity: 0.6, shadowRadius: 8, elevation: 5 },
  body: { color: ChronauraColors.silver, fontSize: 14, lineHeight: 22, textAlign: "center", marginBottom: 24 },
  nextBtn: { backgroundColor: ChronauraColors.gold, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 13, width: "100%", alignItems: "center" },
  nextBtnText: { color: ChronauraColors.cosmicBlack, fontSize: 15, fontWeight: "900" },
  skipBtn: { marginTop: 14 },
  skipText: { color: ChronauraColors.faint, fontSize: 12 },
  modesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center", paddingHorizontal: 8 },
  modeChip: { borderWidth: 1, borderColor: ChronauraColors.borderSubtle, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, flexDirection: "row", alignItems: "center", gap: 3 },
  modeChipText: { color: ChronauraColors.silver, fontSize: 10, fontWeight: "700" },
  modeLock: { color: ChronauraColors.gold, fontSize: 8 },
});
