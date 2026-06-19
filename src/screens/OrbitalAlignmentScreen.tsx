// OrbitalAlignmentScreen.tsx
// "Point your phone at the sky and lock onto target" cockpit.
// Wires useDevicePointing + useObserverLocation → alignmentEngine → SpaceRadarGrid + haptics.
// Includes Simulation Mode for App Store reviewers in static test environments.

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

import { useDevicePointing } from "@/features/sky-lens/ar/useDevicePointing";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import {
  calculateAlignment,
  type SpatialTarget,
} from "@/utils/alignmentEngine";
import type { CameraPointing } from "@/features/sky-lens/ar/SkyLensProjection";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import { HapticController } from "@/utils/hapticController";
import { SpaceRadarGrid } from "@/components/SpaceRadarGrid";
import { ChronauraColors } from "@/theme/tokens";

// ─── Default target: ISS (mock position; swap for live SGP4 data) ───────────
const ISS_MOCK: SpatialTarget = {
  id: "iss",
  name: "International Space Station",
  latitudeDegrees: 45.0,
  longitudeDegrees: -90.0,
  altitudeKm: 420,
};

// Simulate ISS orbital movement until live TLE feed is wired
function tickISS(prev: SpatialTarget): SpatialTarget {
  return {
    ...prev,
    longitudeDegrees: ((prev.longitudeDegrees + 0.35 + 180) % 360) - 180,
    latitudeDegrees: Math.max(
      -51.6,
      Math.min(51.6, prev.latitudeDegrees + Math.sin(Date.now() / 5000) * 0.05)
    ),
  };
}

// ─── Simulation Mode ─────────────────────────────────────────────────────────
// Injects synthetic GPS + slowly rotating orientation for App Store review
// testing in static environments without live GPS or physical movement.
const SIM_LOCATION: ObserverLocation = {
  latitudeDegrees: 40.7128,
  longitudeDegrees: -74.006,
  altitudeMeters: 10,
};

function buildSimPointing(tick: number): CameraPointing {
  // Slowly sweep azimuth 0→360 over ~60s, pitch 20→60°
  const azimuth = (tick * 1.5) % 360;
  const altitude = 30 + Math.sin((tick * Math.PI) / 120) * 20;
  return { azimuthDegrees: azimuth, altitudeDegrees: altitude, rollDegrees: 0 };
}

// ─── Component ───────────────────────────────────────────────────────────────
export function OrbitalAlignmentScreen() {
  const { pointing: livePointing, available: sensorAvailable } = useDevicePointing(80);
  const { location: liveLocation, status: gpsStatus } = useObserverLocation();

  const [target, setTarget] = useState<SpatialTarget>(ISS_MOCK);
  const [simMode, setSimMode] = useState(false);
  const [simTick, setSimTick] = useState(0);
  const hapticController = useRef(new HapticController());

  // Active location and pointing — real or simulated
  const location = simMode ? SIM_LOCATION : liveLocation;
  const pointing = simMode ? buildSimPointing(simTick) : livePointing;

  // Pulse animation for "Searching" state
  const pulseOpacity = useSharedValue(1);
  const lockProgress = useSharedValue(0);

  // ISS mock movement
  useEffect(() => {
    const id = setInterval(() => setTarget((prev) => tickISS(prev)), 1000);
    return () => clearInterval(id);
  }, []);

  // Simulation tick — advances orientation sweep
  useEffect(() => {
    if (!simMode) return;
    const id = setInterval(() => setSimTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, [simMode]);

  // Cleanup haptics on unmount
  useEffect(() => {
    return () => hapticController.current.destroy();
  }, []);

  // Alignment calculation
  const alignment = useMemo(() => {
    if (!simMode && gpsStatus === "loading") return null;
    return calculateAlignment(location, pointing, target);
  }, [
    simMode,
    location,
    gpsStatus,
    pointing.azimuthDegrees,
    pointing.altitudeDegrees,
    target.latitudeDegrees,
    target.longitudeDegrees,
  ]);

  // Haptic updates
  useEffect(() => {
    if (!alignment) return;
    hapticController.current.update(alignment.alignmentScore, alignment.isLocked);
  }, [alignment?.alignmentScore, alignment?.isLocked]);

  // Pulse animation — active while searching
  useEffect(() => {
    if (!alignment || alignment.isLocked) {
      pulseOpacity.value = withSpring(1);
      return;
    }
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 650, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [alignment?.isLocked]);

  // Lock color cross-fade
  useEffect(() => {
    lockProgress.value = withTiming(alignment?.isLocked ? 1 : 0, { duration: 400 });
  }, [alignment?.isLocked]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // ── Derived display values ────────────────────────────────────────────────
  const score = alignment?.alignmentScore ?? 0;
  const isLocked = alignment?.isLocked ?? false;
  const statusColor = isLocked
    ? ChronauraColors.green
    : score > 65
    ? ChronauraColors.gold
    : ChronauraColors.silver;
  const statusText = isLocked ? "LOCKED" : score > 65 ? "ALIGNING" : "SEARCHING";

  const isReady = simMode || (gpsStatus !== "loading" && sensorAvailable && alignment !== null);

  // ── Loading / permission state ────────────────────────────────────────────
  if (!isReady) {
    return (
      <View style={[styles.scroll, styles.loadingOuter]}>
        <Text style={styles.title}>Orbital Alignment</Text>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>Acquiring telemetry…</Text>
          <Text style={styles.loadingDetail}>
            GPS: {gpsStatus === "loading" ? "acquiring" : gpsStatus}
          </Text>
          <Text style={styles.loadingDetail}>
            Sensors: {sensorAvailable ? "ready" : "initialising"}
          </Text>
        </View>

        {/* Simulation mode entry — shown when sensors/GPS are unavailable */}
        <View style={styles.simCard}>
          <Text style={styles.simCardTitle}>Testing indoors?</Text>
          <Text style={styles.simCardBody}>
            Enable Simulation Mode to explore the radar, alignment score, and
            haptics without live GPS or physical movement.
          </Text>
          <TouchableOpacity
            style={styles.simButton}
            onPress={() => setSimMode(true)}
          >
            <Text style={styles.simButtonText}>Enable Simulation Mode</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Orbital Alignment</Text>

      {/* Simulation Mode banner */}
      {simMode && (
        <TouchableOpacity
          style={styles.simBanner}
          onPress={() => setSimMode(false)}
        >
          <Text style={styles.simBannerText}>⚙ SIMULATION MODE · Tap to exit</Text>
        </TouchableOpacity>
      )}

      {/* Status badge */}
      <Animated.View style={pulseStyle}>
        <View style={[styles.badge, { borderColor: statusColor }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
      </Animated.View>

      {/* Radar */}
      <SpaceRadarGrid
        azimuthDiff={alignment!.azimuthDiff}
        elevationDiff={alignment!.elevationDiff}
        alignmentScore={score}
        isLocked={isLocked}
      />

      {/* Score bar */}
      <View style={styles.scoreRow}>
        <Text style={[styles.scoreValue, { color: statusColor }]}>{score}%</Text>
        <View style={styles.scoreTrack}>
          <View
            style={[
              styles.scoreFill,
              { width: `${score}%` as `${number}%`, backgroundColor: statusColor },
            ]}
          />
        </View>
      </View>

      {/* Target info card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Target</Text>
        <Text style={styles.cardValue}>{target.name}</Text>
        <View style={styles.row}>
          <InfoPill label="Lat" value={`${target.latitudeDegrees.toFixed(1)}°`} />
          <InfoPill label="Lon" value={`${target.longitudeDegrees.toFixed(1)}°`} />
          <InfoPill label="Alt" value={`${target.altitudeKm} km`} />
        </View>
      </View>

      {/* Pointing telemetry card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pointing</Text>
        <View style={styles.row}>
          <InfoPill label="Target Az" value={`${alignment!.targetAzimuth}°`} />
          <InfoPill label="Target El" value={`${alignment!.targetElevation}°`} />
        </View>
        <View style={[styles.row, { marginTop: 10 }]}>
          <InfoPill label="Device Az" value={`${Math.round(pointing.azimuthDegrees)}°`} />
          <InfoPill label="Device Pitch" value={`${Math.round(pointing.altitudeDegrees)}°`} />
        </View>
        <View style={[styles.row, { marginTop: 10 }]}>
          <InfoPill label="Az Error" value={`${alignment!.azimuthDiff.toFixed(1)}°`} />
          <InfoPill label="El Error" value={`${alignment!.elevationDiff.toFixed(1)}°`} />
          <InfoPill label="Total Error" value={`${alignment!.totalAngularError.toFixed(1)}°`} />
        </View>
      </View>

      {/* Observer location card */}
      <View style={[styles.card, { marginBottom: 40 }]}>
        <Text style={styles.cardTitle}>Observer</Text>
        <View style={styles.row}>
          <InfoPill label="Lat" value={`${location.latitudeDegrees.toFixed(3)}°`} />
          <InfoPill label="Lon" value={`${location.longitudeDegrees.toFixed(3)}°`} />
        </View>
        {gpsStatus === "fallback" && !simMode && (
          <Text style={styles.fallbackNote}>Using default location — GPS unavailable</Text>
        )}
        {simMode && (
          <Text style={styles.fallbackNote}>Simulated observer: New York City</Text>
        )}
      </View>
    </ScrollView>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────
function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: ChronauraColors.cosmicBlack,
  },
  loadingOuter: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  container: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: ChronauraColors.gold,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 16,
  },
  simBanner: {
    backgroundColor: ChronauraColors.deepIndigo,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: ChronauraColors.borderSubtle,
  },
  simBannerText: {
    color: ChronauraColors.silver,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  badge: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 3,
  },
  scoreRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: "900",
    width: 58,
    textAlign: "right",
  },
  scoreTrack: {
    flex: 1,
    height: 6,
    backgroundColor: ChronauraColors.elevated,
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    borderRadius: 3,
  },
  card: {
    width: "100%",
    backgroundColor: ChronauraColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ChronauraColors.borderGold,
    padding: 18,
    marginTop: 14,
  },
  cardTitle: {
    color: ChronauraColors.faint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  cardValue: {
    color: ChronauraColors.gold2,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    backgroundColor: ChronauraColors.elevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
  },
  pillLabel: {
    color: ChronauraColors.faint,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  pillValue: {
    color: ChronauraColors.silver,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  loadingCard: {
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  loadingTitle: {
    color: ChronauraColors.silver,
    fontSize: 18,
    fontWeight: "700",
  },
  loadingDetail: {
    color: ChronauraColors.faint,
    fontSize: 14,
  },
  simCard: {
    width: "100%",
    backgroundColor: ChronauraColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ChronauraColors.borderSubtle,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  simCardTitle: {
    color: ChronauraColors.silver,
    fontSize: 15,
    fontWeight: "700",
  },
  simCardBody: {
    color: ChronauraColors.faint,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  simButton: {
    marginTop: 6,
    backgroundColor: ChronauraColors.deepIndigo,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: ChronauraColors.borderGold,
  },
  simButtonText: {
    color: ChronauraColors.gold2,
    fontSize: 14,
    fontWeight: "700",
  },
  fallbackNote: {
    color: ChronauraColors.gold,
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7,
  },
});
