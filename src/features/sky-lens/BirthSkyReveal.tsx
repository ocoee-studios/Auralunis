// BirthSkyReveal.tsx — the cinematic Birth Sky hero.
//
// After the user taps "Generate My Birth Sky", the form disappears and this takes
// over the full screen. The sky is DARK, then it builds itself, beat by beat, on the
// same premium renderer the live Sky Lens uses (SkyLensCanvas), projected for the
// exact birth moment:
//
//   date → horizon → stars ignite → Moon rises → planets → constellation lines →
//   Milky Way blooms → the dominant constellation is crowned → "This was your sky."
//
// It then settles into an interactive hero (the sky stays live behind the Sky
// Signature) and hands off to the detailed reading via `onDone`.
//
// CRASH-SAFETY: the sequence is a JS-clock state machine (setTimeout → setState) that
// only ever (a) swaps which LayerKeys / bodies we hand the canvas — all STATIC SVG —
// and (b) animates Animated.View opacities (never SVG props). No animated SVG.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SkyLensCanvas } from "./SkyLensCanvas";
import { useSkyData } from "./hooks/useSkyProjection";
import { getVisualGate } from "./PremiumVisualGating";
import type { LayerKey } from "./SkyLensLayerCatalog";
import type { CameraFov, CameraPointing } from "./ar/SkyLensProjection";
import type { ObserverLocation } from "./accuracy/SkyLensAccuracyTypes";
import type { BirthSkyProfile } from "@/services/BirthSkyService";
import { AuraLunisColors } from "@/theme/tokens";
import { tapLight } from "@/services/HapticService";

interface Props {
  profile: BirthSkyProfile;
  location: ObserverLocation;
  isPremium: boolean;
  onDone: () => void; // user tapped through to the full reading
}

// The reveal beats, in order. `step` is an index into this — everything derives from it.
const STEP = {
  DATE: 0,
  HORIZON: 1,
  STARS: 2,
  MOON: 3,
  PLANETS: 4,
  CONSTELLATIONS: 5,
  MILKYWAY: 6,
  SIGNATURE: 7,
  SETTLED: 8,
} as const;

// ms from mount at which each beat fires. Total ~10s, and skippable.
const BEAT_AT: number[] = [200, 1400, 2600, 3800, 4900, 6000, 7200, 8600, 10200];

function formatBirthLine(iso: string): string {
  const d = new Date(iso);
  const month = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"][d.getUTCMonth()];
  return `${month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function BirthSkyReveal({ profile, location, isPremium, onDone }: Props) {
  const { width, height } = useWindowDimensions();
  const box = useMemo(() => ({ width, height }), [width, height]);
  const birthDate = useMemo(() => new Date(profile.birthDate), [profile.birthDate]);

  // The whole sky, frozen to the birth instant (timeOverride → no live tick).
  const sky = useSkyData(location, 60000, birthDate);
  const gate = useMemo(() => getVisualGate(isPremium), [isPremium]);

  const [step, setStep] = useState<number>(STEP.DATE);

  // Aim a fixed cinematic camera at the dominant constellation if it's comfortably up,
  // so it lands centre-frame for the gold crowning; otherwise a pleasant south-up view.
  const pointing = useMemo<CameraPointing>(() => {
    const c = sky.constellations.find((k) => k.name === profile.dominantConstellation)?.centroid;
    if (c && c.altitudeDegrees > 12 && c.altitudeDegrees < 82) {
      return { azimuthDegrees: c.azimuthDegrees, altitudeDegrees: c.altitudeDegrees, rollDegrees: 0 };
    }
    return { azimuthDegrees: 180, altitudeDegrees: 52, rollDegrees: 0 };
  }, [sky.constellations, profile.dominantConstellation]);

  // Portrait field of view — tall, so the sky fills a phone screen naturally.
  const fov = useMemo<CameraFov>(() => {
    const verticalDegrees = 94;
    return { horizontalDegrees: Math.round((verticalDegrees * width) / height), verticalDegrees };
  }, [width, height]);

  // Which layers are live at this beat (cumulative). Stars → planets → lines → MW.
  const activeLayers = useMemo(() => {
    const s = new Set<LayerKey>();
    if (step >= STEP.STARS) s.add("stars");
    if (step >= STEP.PLANETS) s.add("planets");
    if (step >= STEP.CONSTELLATIONS) s.add("constellations");
    if (step >= STEP.MILKYWAY) s.add("milkyway");
    return s;
  }, [step]);

  // Hide the Moon until its beat by withholding it from the bodies we hand the canvas
  // (MoonLayer is ungated; PlanetLayer only renders the five naked-eye planets).
  const stagedSky = useMemo(() => {
    if (step >= STEP.MOON) return sky;
    return { ...sky, bodies: sky.bodies.filter((b) => b.id !== "moon") };
  }, [sky, step]);

  const milkyWayBoost = step >= STEP.MILKYWAY ? 2.2 : 0.7;

  // ---- Animated overlays (opacity only — Animated.View, native driver) ----
  const canvasFade = useRef(new Animated.Value(0)).current;   // black → sky
  const dateOpacity = useRef(new Animated.Value(0)).current;  // birth date card
  const crownOpacity = useRef(new Animated.Value(0)).current; // gold crown glow
  const sigOpacity = useRef(new Animated.Value(0)).current;   // Sky Signature text
  const ctaOpacity = useRef(new Animated.Value(0)).current;   // settled buttons

  const fade = (v: Animated.Value, to: number, ms: number, delay = 0) =>
    Animated.timing(v, { toValue: to, duration: ms, delay, useNativeDriver: true }).start();

  // Drive the sequence. One effect owns all timers; skip() short-circuits to SETTLED.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finished = useRef(false);

  const settle = () => {
    setStep(STEP.SETTLED);
    canvasFade.setValue(1);
    fade(dateOpacity, 0, 300);
    fade(crownOpacity, 1, 900);
    fade(sigOpacity, 1, 900, 200);
    fade(ctaOpacity, 1, 700, 900);
  };

  const skip = () => {
    if (finished.current) return;
    finished.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    tapLight();
    settle();
  };

  useEffect(() => {
    const at = (i: number, fn: () => void) => timers.current.push(setTimeout(fn, BEAT_AT[i]));

    at(STEP.DATE, () => { setStep(STEP.DATE); fade(dateOpacity, 1, 900); tapLight(); });
    at(STEP.HORIZON, () => { setStep(STEP.HORIZON); fade(canvasFade, 1, 1600); });
    at(STEP.STARS, () => { setStep(STEP.STARS); tapLight(); });
    at(STEP.MOON, () => { setStep(STEP.MOON); tapLight(); });
    at(STEP.PLANETS, () => { setStep(STEP.PLANETS); tapLight(); });
    at(STEP.CONSTELLATIONS, () => { setStep(STEP.CONSTELLATIONS); tapLight(); });
    at(STEP.MILKYWAY, () => { setStep(STEP.MILKYWAY); tapLight(); });
    at(STEP.SIGNATURE, () => {
      setStep(STEP.SIGNATURE);
      fade(dateOpacity, 0, 500);
      fade(crownOpacity, 1, 1200);
      fade(sigOpacity, 1, 1100, 300);
      tapLight();
    });
    at(STEP.SETTLED, () => {
      if (finished.current) return;
      finished.current = true;
      setStep(STEP.SETTLED);
      fade(ctaOpacity, 1, 700);
    });

    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revealing = step < STEP.SIGNATURE;
  const birthLine = formatBirthLine(profile.birthDate);

  return (
    <View style={styles.root}>
      {/* Solid cosmic base — the sky fades in over it, so early beats read as true dark. */}
      <View style={styles.base} pointerEvents="none" />

      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: canvasFade }]}>
        <SkyLensCanvas
          box={box}
          pointing={pointing}
          sky={stagedSky}
          fov={fov}
          activeLayers={activeLayers}
          nightMode={false}
          milkyWayBoost={milkyWayBoost}
          gate={gate}
          domeStarMultiplier={1}
          nebulaOpacity={0}
          extinction={false}
          isPremium={isPremium}
          focus={null}
          showcase={null}
          parallax={{ x: 0, y: 0 }}
          satellites={[]}
          cinematic
          fullSphere
          photographicCore={false}
          onSelect={() => {}}
        />
      </Animated.View>

      {/* Gold crown — a soft radial bloom behind the centred dominant constellation. */}
      <Animated.View pointerEvents="none" style={[styles.crown, { opacity: crownOpacity }]} />

      {/* Birth date card — the first thing that appears, dissolves before the Signature. */}
      <Animated.View pointerEvents="none" style={[styles.dateWrap, { opacity: dateOpacity }]}>
        <Text style={styles.dateEyebrow}>THE MOMENT YOU ARRIVED</Text>
        <Text style={styles.dateLine}>{birthLine}</Text>
        <Text style={styles.dateLoc}>{profile.locationName}</Text>
      </Animated.View>

      {/* Sky Signature — the payoff. Fades in as the sky settles. */}
      <Animated.View pointerEvents="box-none" style={[styles.sigWrap, { opacity: sigOpacity }]}>
        <Text style={styles.thisWasYourSky}>This was your sky.</Text>
        <Text style={styles.sigTitle}>{profile.skySignatureTitle}</Text>
        <Text style={styles.sigSubtitle}>{profile.skySignatureSubtitle}</Text>

        <Animated.View style={{ opacity: ctaOpacity, width: "100%", alignItems: "center" }}>
          <Pressable style={styles.cta} onPress={() => { tapLight(); onDone(); }} hitSlop={10}>
            <Text style={styles.ctaText}>See your reading →</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>

      {/* Skip — available during the sequence only. */}
      {revealing && (
        <Pressable style={styles.skip} onPress={skip} hitSlop={12}>
          <Text style={styles.skipText}>Skip ›</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: "#03040A" },
  base: { ...StyleSheet.absoluteFillObject, backgroundColor: "#03040A" },
  crown: {
    position: "absolute", alignSelf: "center", top: "26%",
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: "rgba(217,168,78,0.16)",
  },
  dateWrap: { position: "absolute", top: "40%", left: 0, right: 0, alignItems: "center" },
  dateEyebrow: { color: AuraLunisColors.gold, fontSize: 10, letterSpacing: 3, fontWeight: "800", marginBottom: 10 },
  dateLine: { color: "#FFFFFF", fontSize: 26, fontWeight: "300", letterSpacing: 0.5 },
  dateLoc: { color: AuraLunisColors.silver, fontSize: 13, marginTop: 8 },
  sigWrap: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 28, paddingBottom: 56, alignItems: "center" },
  thisWasYourSky: { color: AuraLunisColors.silver, fontSize: 15, fontStyle: "italic", marginBottom: 16, letterSpacing: 0.5 },
  sigTitle: { color: AuraLunisColors.gold2, fontSize: 30, fontWeight: "800", textAlign: "center", letterSpacing: 0.3 },
  sigSubtitle: { color: "#EDE6D6", fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 12, marginBottom: 26, maxWidth: 340 },
  cta: {
    borderRadius: 16, paddingVertical: 15, paddingHorizontal: 40, alignItems: "center",
    backgroundColor: AuraLunisColors.gold,
  },
  ctaText: { color: AuraLunisColors.cosmicBlack, fontWeight: "900", fontSize: 15 },
  skip: { position: "absolute", top: 56, right: 22 },
  skipText: { color: AuraLunisColors.silver, fontSize: 14, fontWeight: "700", opacity: 0.8 },
});
