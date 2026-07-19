// First-run onboarding: four short, honest screens that introduce AuraLunis, the birth
// chart, what the chart reveals, and Sky Lens — ending with "Create My Birth Chart", which
// completes onboarding and drops the user into the app. It is purely informational: it never
// shows the paywall, advertises a trial, requests permissions, or touches entitlement state.
//
// Sky Lens is described truthfully as a fully rendered, sensor-aligned planetarium — never as
// AR / augmented reality / a camera overlay / a live camera (see onboarding-route-selftest.js).
import React, { useEffect, useState } from "react";
import { AccessibilityInfo, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoMark } from "@/components/LogoMark";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  /** Optional truthful caveat / detail lines rendered under the body. */
  points?: { label: string; text: string }[];
  note?: string;
};

// Copy is deliberately scoped to what AuraLunis actually delivers: Sun sign, rising sign,
// the planets and moon over your birthplace, and a personal reading. Houses and aspects are
// NOT introduced because the app does not compute or display them.
const SLIDES: Slide[] = [
  {
    eyebrow: "WELCOME",
    title: "Welcome to AuraLunis",
    body: "Discover your birth chart, understand what it means, and explore the real sky above you.",
  },
  {
    eyebrow: "YOUR CHART",
    title: "Create Your Birth Chart",
    body: "Your birth date, birth time, and birthplace shape your chart. The more exact they are, the more precise your sky becomes.",
    note: "Don't know your birth time? You'll still get your Sun sign and the planets — but your rising sign, exact horizon, and other time-sensitive details need the local time you were born.",
  },
  {
    eyebrow: "YOUR BLUEPRINT",
    title: "Understand Your Cosmic Blueprint",
    body: "Your chart is built from real astronomy — here's what it reveals:",
    points: [
      { label: "Planets", text: "Where each planet stood in the sky the moment you were born." },
      { label: "Signs", text: "Your Sun sign, and your rising sign on the eastern horizon." },
      { label: "Your sky", text: "The moon phase and constellations overhead at your birthplace." },
      { label: "Your reading", text: "A personal interpretation that ties it all together." },
    ],
  },
  {
    eyebrow: "SKY LENS",
    title: "Explore Sky Lens",
    body: "Sky Lens is a fully rendered planetarium. It aligns with your device's compass and motion sensors to show the real positions of stars, planets, and constellations — point your phone and the sky moves with you.",
  },
];

type Props = {
  visible: boolean;
  /** Called when onboarding is completed OR skipped — App persists the flag and enters the app. */
  onDone: () => void;
};

export function OnboardingFlow({ visible, onDone }: Props) {
  const [step, setStep] = useState(0);
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const isLast = step === SLIDES.length - 1;
  const slide = SLIDES[step];

  // Reset to the first slide every time onboarding (re)opens, including Replay Tutorial.
  useEffect(() => {
    if (visible) setStep(0);
  }, [visible]);

  // Gentle cross-fade on slide change — fully skipped when Reduce Motion is on.
  const fade = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) {
      fade.value = 1;
      return;
    }
    fade.value = 0;
    fade.value = withTiming(1, { duration: 260 });
  }, [step, reduceMotion]);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  function announce(message: string) {
    // Keep VoiceOver oriented as the slide changes.
    AccessibilityInfo.announceForAccessibility(message);
  }

  function goNext() {
    tapLight();
    if (isLast) {
      onDone();
      return;
    }
    const next = step + 1;
    setStep(next);
    announce(`${SLIDES[next].title}. Step ${next + 1} of ${SLIDES.length}.`);
  }

  function goBack() {
    if (step === 0) return;
    tapLight();
    const prev = step - 1;
    setStep(prev);
    announce(`${SLIDES[prev].title}. Step ${prev + 1} of ${SLIDES.length}.`);
  }

  function skip() {
    tapLight();
    onDone();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={goBack}>
      <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
        {/* Header: progress + skip */}
        <View style={styles.header}>
          <Pressable
            style={styles.backHit}
            onPress={goBack}
            disabled={step === 0}
            accessibilityRole="button"
            accessibilityLabel="Back"
            accessibilityState={{ disabled: step === 0 }}
          >
            <Text style={[styles.backText, step === 0 && styles.backTextHidden]}>‹ Back</Text>
          </Pressable>

          <View
            style={styles.dots}
            accessibilityRole="progressbar"
            accessibilityLabel={`Step ${step + 1} of ${SLIDES.length}`}
          >
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>

          <Pressable
            style={styles.skipHit}
            onPress={skip}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding and go to the app"
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.slide, fadeStyle]}>
            {step === 0 && (
              <View style={styles.logoWrap}>
                <LogoMark size={78} />
              </View>
            )}
            <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
            <Text style={styles.title} accessibilityRole="header">
              {slide.title}
            </Text>
            <Text style={styles.body}>{slide.body}</Text>

            {slide.points?.map((point) => (
              <View key={point.label} style={styles.point}>
                <Text style={styles.pointLabel}>{point.label}</Text>
                <Text style={styles.pointText}>{point.text}</Text>
              </View>
            ))}

            {slide.note ? <Text style={styles.note}>{slide.note}</Text> : null}
          </Animated.View>
        </ScrollView>

        {/* Primary CTA pinned above the safe area */}
        <View style={styles.footer}>
          <Pressable
            style={styles.cta}
            onPress={goNext}
            accessibilityRole="button"
            accessibilityLabel={isLast ? "Create my birth chart" : "Continue"}
          >
            <Text style={styles.ctaText}>{isLast ? "Create My Birth Chart" : "Continue"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#040611", paddingHorizontal: 22 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 40 },
  backHit: { minWidth: 64, minHeight: 44, justifyContent: "center" },
  backText: { color: AuraLunisColors.gold2, fontSize: 14, fontWeight: "800" },
  backTextHidden: { opacity: 0 },
  dots: { flexDirection: "row", gap: 8, alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(199,166,106,0.28)" },
  dotActive: { width: 22, backgroundColor: AuraLunisColors.gold },
  skipHit: { minWidth: 64, minHeight: 44, alignItems: "flex-end", justifyContent: "center" },
  skipText: { color: AuraLunisColors.muted, fontSize: 14, fontWeight: "800" },
  scroll: { flex: 1 },
  content: { paddingTop: 18, paddingBottom: 20, flexGrow: 1, justifyContent: "center" },
  slide: { alignItems: "center" },
  logoWrap: { marginBottom: 18 },
  eyebrow: { color: AuraLunisColors.gold, fontSize: 11, letterSpacing: 3, fontWeight: "900" },
  title: { color: "#FFF", fontSize: 30, fontWeight: "900", marginTop: 10, textAlign: "center", lineHeight: 36 },
  body: { color: AuraLunisColors.silver, fontSize: 15.5, lineHeight: 24, textAlign: "center", marginTop: 16, maxWidth: 360 },
  point: {
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderColor: "rgba(199,166,106,0.22)",
    backgroundColor: "rgba(16,21,34,0.7)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginTop: 12,
  },
  pointLabel: { color: AuraLunisColors.gold, fontSize: 10, letterSpacing: 1.5, fontWeight: "900" },
  pointText: { color: AuraLunisColors.silver, fontSize: 13.5, lineHeight: 20, marginTop: 4 },
  note: {
    color: AuraLunisColors.muted,
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 20,
    maxWidth: 360,
    fontStyle: "italic",
  },
  footer: { paddingTop: 10 },
  cta: { width: "100%", borderRadius: 15, backgroundColor: AuraLunisColors.gold, paddingVertical: 16, alignItems: "center" },
  ctaText: { color: "#17120B", fontWeight: "900", fontSize: 15 },
});
