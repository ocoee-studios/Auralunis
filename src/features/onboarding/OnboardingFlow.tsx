// First-launch onboarding: welcome → birthday → birth sky reveal → feature showcase.
// After the reveal, the user can "Continue Exploring" (enters free) or
// "Unlock Premium" (opens the paywall). Matches the approved clickthrough.
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { LogoMark } from "@/components/LogoMark";
import { AuraLunisColors } from "@/theme/tokens";
import { tapSuccess } from "@/services/HapticService";

type Props = {
  visible: boolean;
  onComplete: () => void;
  onOpenPaywall: () => void;
};

export function OnboardingFlow({ visible, onComplete, onOpenPaywall }: Props) {
  const [step, setStep] = useState(0);
  const [birthday, setBirthday] = useState("");

  // Birth sky reveal animation
  const ringScale = useSharedValue(0.3);
  const ringOpacity = useSharedValue(0);
  const coreGlow = useSharedValue(0.4);

  useEffect(() => {
    if (step === 2) {
      ringScale.value = withSpring(1, { damping: 12, stiffness: 80 });
      ringOpacity.value = withTiming(1, { duration: 600 });
      coreGlow.value = withSpring(1, { damping: 8, stiffness: 60 });
      tapSuccess();
    }
  }, [step]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value
  }));
  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreGlow.value }],
    shadowOpacity: coreGlow.value
  }));

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <ScrollView style={s.root} contentContainerStyle={s.content}>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <View style={s.center}>
            <LogoMark size={80} />
            <Text style={s.welcome}>AURALUNIS</Text>
            <Text style={s.tagline}>Your Time, Written in the Stars</Text>
            <Text style={s.descriptor}>THE INTERACTIVE ASTRAL CLOCK</Text>
            <Text style={s.bodyText}>
              The universe has been waiting. AuraLunis turns your phone into a
              living astral instrument — real astronomy, not a toy.
            </Text>
            <Pressable style={s.cta} onPress={() => setStep(1)}>
              <Text style={s.ctaText}>Begin</Text>
            </Pressable>
          </View>
        )}

        {/* Step 1: Birthday */}
        {step === 1 && (
          <View style={s.center}>
            <Text style={s.stepEyebrow}>PERSONALIZE</Text>
            <Text style={s.stepTitle}>When were you born?</Text>
            <Text style={s.bodyText}>
              Enter your birthday to personalize the birth-sky reveal and daily rhythm.
            </Text>
            <TextInput
              style={s.input}
              placeholder="MM / DD / YYYY"
              placeholderTextColor={AuraLunisColors.muted}
              value={birthday}
              onChangeText={setBirthday}
              keyboardType="numbers-and-punctuation"
            />
            <Pressable style={s.cta} onPress={() => setStep(2)}>
              <Text style={s.ctaText}>Reveal My Birth Sky</Text>
            </Pressable>
            <Pressable onPress={() => setStep(2)}>
              <Text style={s.skipText}>Skip for now</Text>
            </Pressable>
          </View>
        )}

        {/* Step 2: Birth Sky Reveal */}
        {step === 2 && (
          <View style={s.center}>
            <Text style={s.stepEyebrow}>YOUR BIRTH SKY</Text>
            <Text style={s.stepTitle}>The sky remembers.</Text>
            <Animated.View style={[s.revealRing, ringStyle]}>
              <Animated.View style={[s.revealCore, coreStyle]} />
            </Animated.View>
            <Text style={s.bodyText}>
              {birthday
                ? `On the night of ${birthday}, these stars were above you. Your celestial fingerprint is part of AuraLunis now.`
                : "Your celestial fingerprint awaits. Add your birthday anytime in Settings to unlock your birth sky."}
            </Text>
            <Pressable style={s.cta} onPress={() => setStep(3)}>
              <Text style={s.ctaText}>Continue</Text>
            </Pressable>
          </View>
        )}

        {/* Step 3: Feature Showcase + Enter App */}
        {step === 3 && (
          <View style={s.showcase}>
            <Text style={s.stepEyebrow}>EXPLORE AURALUNIS</Text>
            <Text style={s.stepTitle}>What's inside</Text>

            <View style={s.card}><Text style={s.cardLabel}>ALARMS</Text><Text style={s.cardTitle}>Celestial Alarms</Text><Text style={s.cardBody}>Moonrise, sunset, visible-planet, and wind-down reminders.</Text></View>
            <View style={s.card}><Text style={s.cardLabel}>AR</Text><Text style={s.cardTitle}>Sky Lens</Text><Text style={s.cardBody}>Point your phone at the sky. Real positions, compass-aligned overlay.</Text></View>
            <View style={s.card}><Text style={s.cardLabel}>LEARN</Text><Text style={s.cardTitle}>30 Nights of Stargazing</Text><Text style={s.cardBody}>Guided lessons from the Moon to deep-sky nebulae.</Text></View>
            <View style={s.card}><Text style={s.cardLabel}>WATCH</Text><Text style={s.cardTitle}>Watch Faces & Widgets</Text><Text style={s.cardBody}>Six astral faces, ten complications, StandBy widgets.</Text></View>
            <View style={s.card}><Text style={s.cardLabel}>VAULT</Text><Text style={s.cardTitle}>Cosmic Vault</Text><Text style={s.cardBody}>Encrypted notes and sky captures. Your astronomy journal.</Text></View>
            <View style={s.card}><Text style={s.cardLabel}>TONIGHT</Text><Text style={s.cardTitle}>Tonight Score</Text><Text style={s.cardBody}>Viewing quality from cloud cover, moon brightness, and your location.</Text></View>

            <Pressable style={s.cta} onPress={onComplete}>
              <Text style={s.ctaText}>Continue Exploring</Text>
            </Pressable>
            <Pressable style={s.secondaryCta} onPress={() => { onComplete(); onOpenPaywall(); }}>
              <Text style={s.secondaryCtaText}>Unlock the Full Cosmos — Premium</Text>
            </Pressable>
          </View>
        )}

      </ScrollView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#040611" },
  content: { paddingHorizontal: 22, paddingTop: 72, paddingBottom: 50 },
  center: { alignItems: "center" },
  welcome: { color: AuraLunisColors.gold2, fontSize: 28, letterSpacing: 4, fontWeight: "900", marginTop: 20 },
  tagline: { fontStyle: "italic", color: AuraLunisColors.silver, fontSize: 15, marginTop: 8 },
  descriptor: { color: AuraLunisColors.muted, fontSize: 9, letterSpacing: 3, marginTop: 8 },
  bodyText: { color: AuraLunisColors.silver, fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 20, maxWidth: 300 },
  stepEyebrow: { color: AuraLunisColors.gold, fontSize: 10, letterSpacing: 2, fontWeight: "900" },
  stepTitle: { color: "#FFF", fontSize: 28, fontWeight: "900", marginTop: 8, textAlign: "center" },
  input: { width: "100%", paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(199,166,106,0.30)", backgroundColor: "rgba(4,7,14,0.62)", color: "#FFF", fontSize: 15, marginTop: 20, textAlign: "center" },
  skipText: { color: AuraLunisColors.gold2, fontWeight: "800", fontSize: 13, marginTop: 16 },
  revealRing: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: "rgba(199,166,106,0.6)", alignItems: "center", justifyContent: "center", marginTop: 24, marginBottom: 12 },
  revealCore: { width: 48, height: 48, borderRadius: 24, backgroundColor: AuraLunisColors.gold },
  cta: { width: "100%", borderRadius: 15, backgroundColor: AuraLunisColors.gold, paddingVertical: 15, alignItems: "center", marginTop: 24 },
  ctaText: { color: "#17120B", fontWeight: "900", fontSize: 15 },
  secondaryCta: { width: "100%", borderRadius: 15, borderWidth: 1, borderColor: "rgba(199,166,106,0.34)", backgroundColor: "rgba(199,166,106,0.11)", paddingVertical: 14, alignItems: "center", marginTop: 10 },
  secondaryCtaText: { color: AuraLunisColors.gold2, fontWeight: "800", fontSize: 14 },
  showcase: { width: "100%" },
  card: { borderWidth: 1, borderColor: "rgba(199,166,106,0.22)", backgroundColor: "rgba(16,21,34,0.75)", borderRadius: 20, padding: 14, marginTop: 10 },
  cardLabel: { color: AuraLunisColors.gold, fontSize: 9, letterSpacing: 1.5, fontWeight: "900", marginBottom: 4 },
  cardTitle: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  cardBody: { color: AuraLunisColors.silver, fontSize: 12.5, lineHeight: 18, marginTop: 4 }
});
