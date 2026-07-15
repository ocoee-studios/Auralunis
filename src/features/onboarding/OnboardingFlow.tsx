// First-launch onboarding: welcome → date-only preview → feature showcase.
// The full Birth Sky asks for local birth time and birthplace inside the app.
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogoMark } from "@/components/LogoMark";
import { BirthSkyCanvas } from "@/components/BirthSkyCanvas";
import { AuraLunisColors } from "@/theme/tokens";
import { tapSuccess } from "@/services/HapticService";
import { computeBirthSky, BIRTHDAY_STORAGE_KEY, type BirthSkyProfile } from "@/services/BirthSkyService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";

// Parse the onboarding birthday field (placeholder "MM / DD / YYYY", but tolerate
// YYYY-MM-DD too) into a noon-UTC ISO string. Returns null if it is not a real date.
function parseBirthdayToISO(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  let year = Number(digits.slice(4, 8));
  let month = Number(digits.slice(0, 2));
  let day = Number(digits.slice(2, 4));

  if (month > 12) {
    year = Number(digits.slice(0, 4));
    month = Number(digits.slice(4, 6));
    day = Number(digits.slice(6, 8));
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) return null;

  const pad = (value: number) => String(value).padStart(2, "0");
  const date = new Date(`${year}-${pad(month)}-${pad(day)}T12:00:00Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
}

type Props = {
  visible: boolean;
  onComplete: () => void;
  onOpenPaywall: () => void;
};

export function OnboardingFlow({ visible, onComplete, onOpenPaywall }: Props) {
  const [step, setStep] = useState(0);
  const [birthday, setBirthday] = useState("");
  const [profile, setProfile] = useState<BirthSkyProfile | null>(null);
  const { location } = useObserverLocation();

  // This is intentionally only a date-based preview. Noon and the current/fallback
  // observer location are used so we can show date-stable details such as moon phase
  // and sun sign. Horizon, visible-planet, and eastern-sky claims are reserved for the
  // full Birth Sky after the user supplies birthplace and local birth time.
  function handleReveal() {
    const iso = parseBirthdayToISO(birthday);
    if (iso) {
      try {
        setProfile(computeBirthSky(iso, location, "Date-only preview"));
        AsyncStorage.setItem(BIRTHDAY_STORAGE_KEY, iso).catch(() => {});
      } catch {
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
    setStep(2);
  }

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
        {step === 0 && (
          <View style={s.center}>
            <LogoMark size={80} />
            <Text style={s.welcome}>AURALUNIS</Text>
            <Text style={s.tagline}>Your Time, Written in the Stars</Text>
            <Text style={s.descriptor}>YOUR SKY. YOUR STORY.</Text>
            <Text style={s.bodyText}>
              The universe has been waiting. AuraLunis turns your phone into a
              living celestial instrument grounded in real astronomy.
            </Text>
            <Pressable style={s.cta} onPress={() => setStep(1)}>
              <Text style={s.ctaText}>Begin</Text>
            </Pressable>
          </View>
        )}

        {step === 1 && (
          <View style={s.center}>
            <Text style={s.stepEyebrow}>PERSONALIZE</Text>
            <Text style={s.stepTitle}>When were you born?</Text>
            <Text style={s.bodyText}>
              Enter your birthday for a date-only preview. You can add your birthplace and birth time in the full Birth Sky for an exact horizon.
            </Text>
            <TextInput
              style={s.input}
              placeholder="MM / DD / YYYY"
              placeholderTextColor={AuraLunisColors.muted}
              value={birthday}
              onChangeText={setBirthday}
              keyboardType="numbers-and-punctuation"
              autoCorrect={false}
            />
            <Pressable style={s.cta} onPress={handleReveal}>
              <Text style={s.ctaText}>Preview My Birth Sky</Text>
            </Pressable>
            <Pressable onPress={() => { setProfile(null); setStep(2); }}>
              <Text style={s.skipText}>Skip for now</Text>
            </Pressable>
          </View>
        )}

        {step === 2 && (
          <View style={s.center}>
            <Text style={s.stepEyebrow}>DATE-ONLY PREVIEW</Text>
            <Text style={s.stepTitle}>A glimpse of your sky.</Text>
            {profile ? (
              <View style={s.revealChart}>
                <BirthSkyCanvas birthDate={new Date(profile.birthDate)} location={location} size={276} />
              </View>
            ) : (
              <Animated.View style={[s.revealRing, ringStyle]}>
                <Animated.View style={[s.revealCore, coreStyle]} />
              </Animated.View>
            )}

            {profile ? (
              <>
                <Text style={s.birthSignature}>
                  Born beneath a {profile.moonPhase.toLowerCase()} moon in {profile.sunSign} season.
                </Text>
                <View style={s.birthStats}>
                  <View style={s.birthStat}>
                    <Text style={s.birthStatValue}>{profile.moonPhase}</Text>
                    <Text style={s.birthStatLabel}>MOON · {Math.round(profile.moonIllumination)}%</Text>
                  </View>
                  <View style={s.birthStat}>
                    <Text style={s.birthStatValue}>{profile.sunSign}</Text>
                    <Text style={s.birthStatLabel}>SUN SIGN</Text>
                  </View>
                </View>
                <Text style={s.previewNote}>
                  This preview uses noon and a temporary observer location. Add your birthplace and local birth time in Sky → Your Birth Sky for exact planets, horizon, and eastern sky.
                </Text>
              </>
            ) : (
              <Text style={s.bodyText}>
                Add your birthday, birthplace, and birth time later in Sky → Your Birth Sky.
              </Text>
            )}

            <Pressable style={s.cta} onPress={() => setStep(3)}>
              <Text style={s.ctaText}>Continue</Text>
            </Pressable>
          </View>
        )}

        {step === 3 && (
          <View style={s.showcase}>
            <Text style={s.stepEyebrow}>EXPLORE AURALUNIS</Text>
            <Text style={s.stepTitle}>What's inside</Text>

            <View style={s.card}><Text style={s.cardLabel}>ALARMS</Text><Text style={s.cardTitle}>Celestial Alarms</Text><Text style={s.cardBody}>Moonrise, sunset, visible-planet, and wind-down reminders.</Text></View>
            <View style={s.card}><Text style={s.cardLabel}>SKY LENS</Text><Text style={s.cardTitle}>Cinematic Planetarium</Text><Text style={s.cardBody}>Explore real positions in a compass-aligned celestial view with stars, planets, constellations, and deep-sky imagery.</Text></View>
            <View style={s.card}><Text style={s.cardLabel}>LEARN</Text><Text style={s.cardTitle}>30 Nights of Stargazing</Text><Text style={s.cardBody}>Guided lessons from the Moon to deep-sky nebulae.</Text></View>
            <View style={s.card}><Text style={s.cardLabel}>VAULT</Text><Text style={s.cardTitle}>Cosmic Vault</Text><Text style={s.cardBody}>Encrypted notes and saved observations for your astronomy journal.</Text></View>
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
  content: { paddingHorizontal: 22, paddingTop: 58, paddingBottom: 36 },
  center: { alignItems: "center" },
  welcome: { color: AuraLunisColors.gold2, fontSize: 28, letterSpacing: 4, fontWeight: "900", marginTop: 20 },
  tagline: { fontStyle: "italic", color: AuraLunisColors.silver, fontSize: 15, marginTop: 8 },
  descriptor: { color: AuraLunisColors.muted, fontSize: 9, letterSpacing: 3, marginTop: 8 },
  bodyText: { color: AuraLunisColors.silver, fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 20, maxWidth: 340 },
  stepEyebrow: { color: AuraLunisColors.gold, fontSize: 10, letterSpacing: 2, fontWeight: "900" },
  stepTitle: { color: "#FFF", fontSize: 30, fontWeight: "900", marginTop: 8, textAlign: "center" },
  input: { width: "100%", paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(199,166,106,0.30)", backgroundColor: "rgba(4,7,14,0.62)", color: "#FFF", fontSize: 15, marginTop: 20, textAlign: "center" },
  skipText: { color: AuraLunisColors.gold2, fontWeight: "800", fontSize: 13, marginTop: 16 },
  revealRing: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, borderColor: "rgba(199,166,106,0.6)", alignItems: "center", justifyContent: "center", marginTop: 24, marginBottom: 12 },
  revealCore: { width: 48, height: 48, borderRadius: 24, backgroundColor: AuraLunisColors.gold },
  revealChart: { marginTop: 18, marginBottom: 8, alignItems: "center" },
  birthSignature: { color: "#F3E6C7", fontSize: 16, lineHeight: 24, textAlign: "center", fontStyle: "italic", marginTop: 12, maxWidth: 340 },
  birthStats: { flexDirection: "row", justifyContent: "center", gap: 38, marginTop: 22 },
  birthStat: { alignItems: "center", maxWidth: 130 },
  birthStatValue: { color: AuraLunisColors.gold, fontSize: 17, fontWeight: "900", textAlign: "center" },
  birthStatLabel: { color: AuraLunisColors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1.2, marginTop: 5, textAlign: "center" },
  previewNote: { color: AuraLunisColors.muted, fontSize: 11.5, lineHeight: 18, textAlign: "center", marginTop: 18, maxWidth: 350 },
  cta: { width: "100%", borderRadius: 15, backgroundColor: AuraLunisColors.gold, paddingVertical: 16, alignItems: "center", marginTop: 22 },
  ctaText: { color: "#17120B", fontWeight: "900", fontSize: 15 },
  secondaryCta: { width: "100%", borderRadius: 15, borderWidth: 1, borderColor: "rgba(199,166,106,0.34)", backgroundColor: "rgba(199,166,106,0.11)", paddingVertical: 14, alignItems: "center", marginTop: 10 },
  secondaryCtaText: { color: AuraLunisColors.gold2, fontWeight: "800", fontSize: 14 },
  showcase: { width: "100%" },
  card: { borderWidth: 1, borderColor: "rgba(199,166,106,0.22)", backgroundColor: "rgba(16,21,34,0.75)", borderRadius: 20, padding: 14, marginTop: 10 },
  cardLabel: { color: AuraLunisColors.gold, fontSize: 9, letterSpacing: 1.5, fontWeight: "900", marginBottom: 4 },
  cardTitle: { color: "#FFF", fontSize: 16, fontWeight: "900" },
  cardBody: { color: AuraLunisColors.silver, fontSize: 12.5, lineHeight: 18, marginTop: 4 }
});
