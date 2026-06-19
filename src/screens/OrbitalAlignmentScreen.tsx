// OrbitalAlignmentScreen.tsx
// Atmosphere Explorer edition — tracks a fleet of LEO satellites simultaneously.
// Tapping any radar blip opens a retro SatelliteDataCard with full mission info.

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
import type { CameraPointing } from "@/features/sky-lens/ar/SkyLensProjection";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";
import { calculateAlignment } from "@/utils/alignmentEngine";
import {
  simulateTick,
  computeFleetState,
  type FleetState,
} from "@/services/AtmosphereExplorerService";
import { ATMOSPHERE_CATALOG } from "@/data/AtmosphereCatalog";
import { HapticController } from "@/utils/hapticController";
import { SpaceRadarGrid, type RadarBlip } from "@/components/SpaceRadarGrid";
import { SatelliteDataCard } from "@/components/SatelliteDataCard";
import { ChronauraColors } from "@/theme/tokens";

// ─── Simulation Mode ─────────────────────────────────────────────────────────
const SIM_LOCATION: ObserverLocation = {
  latitudeDegrees: 40.7128,
  longitudeDegrees: -74.006,
  altitudeMeters: 10,
};

function buildSimPointing(tick: number): CameraPointing {
  return {
    azimuthDegrees: (tick * 1.5) % 360,
    altitudeDegrees: 30 + Math.sin((tick * Math.PI) / 120) * 20,
    rollDegrees: 0,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────
export function OrbitalAlignmentScreen() {
  const { pointing: livePointing, available: sensorAvailable } = useDevicePointing(80);
  const { location: liveLocation, status: gpsStatus } = useObserverLocation();

  const [simMode, setSimMode] = useState(false);
  const [simTick, setSimTick] = useState(0);
  const [fleetState, setFleetState] = useState<FleetState>({ satellites: [], activeTarget: null });
  const [selectedSatId, setSelectedSatId] = useState<string | null>(null);

  const hapticController = useRef(new HapticController());
  const pulseOpacity = useSharedValue(1);

  const location = simMode ? SIM_LOCATION : liveLocation;
  const pointing = simMode ? buildSimPointing(simTick) : livePointing;

  // Fleet tick — simulate orbital movement + recompute alignments
  useEffect(() => {
    const id = setInterval(() => {
      simulateTick();
      setFleetState(computeFleetState(location, pointing));
    }, 1000);
    return () => clearInterval(id);
  }, [location, pointing]);

  // Simulation sweep tick
  useEffect(() => {
    if (!simMode) return;
    const id = setInterval(() => setSimTick((t) => t + 1), 200);
    return () => clearInterval(id);
  }, [simMode]);

  // Recompute fleet on every pointing change (high-frequency)
  useEffect(() => {
    setFleetState(computeFleetState(location, pointing));
  }, [pointing.azimuthDegrees, pointing.altitudeDegrees]);

  // Haptics driven by active target
  useEffect(() => {
    if (!fleetState.activeTarget) return;
    hapticController.current.update(
      fleetState.activeTarget.alignment.alignmentScore,
      fleetState.activeTarget.alignment.isLocked
    );
  }, [fleetState.activeTarget?.alignment.alignmentScore]);

  // Cleanup
  useEffect(() => () => hapticController.current.destroy(), []);

  // Pulse animation
  const isLocked = fleetState.activeTarget?.alignment.isLocked ?? false;
  useEffect(() => {
    if (isLocked) { pulseOpacity.value = withSpring(1); return; }
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 650, easing: Easing.inOut(Easing.ease) })
      ),
      -1, false
    );
  }, [isLocked]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));

  // ── Derived values ──────────────────────────────────────────────────────
  const activeTarget = fleetState.activeTarget;
  const score = activeTarget?.alignment.alignmentScore ?? 0;
  const statusColor = isLocked
    ? ChronauraColors.green
    : activeTarget?.satellite.radarColor ?? ChronauraColors.gold;
  const statusText = isLocked ? "LOCKED" : score > 65 ? "ALIGNING" : "SEARCHING";

  // Build blip array for radar
  const blips: RadarBlip[] = fleetState.satellites.map((state) => ({
    id: state.satellite.id,
    azimuthDiff: state.alignment.azimuthDiff,
    elevationDiff: state.alignment.elevationDiff,
    color: state.satellite.radarColor,
    isActive: state.satellite.id === activeTarget?.satellite.id,
    label: state.satellite.shortName,
  }));

  // Selected satellite for data card
  const selectedSat = selectedSatId
    ? ATMOSPHERE_CATALOG.find((s) => s.id === selectedSatId) ?? null
    : null;
  const selectedState = selectedSatId
    ? fleetState.satellites.find((s) => s.satellite.id === selectedSatId) ?? null
    : null;

  const isReady = simMode || (gpsStatus !== "loading" && sensorAvailable);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!isReady) {
    return (
      <View style={[styles.scroll, styles.loadingOuter]}>
        <Text style={styles.title}>CHRONAURA TELEMETRY</Text>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>Acquiring telemetry…</Text>
          <Text style={styles.loadingDetail}>GPS: {gpsStatus === "loading" ? "acquiring" : gpsStatus}</Text>
          <Text style={styles.loadingDetail}>Sensors: {sensorAvailable ? "ready" : "initialising"}</Text>
        </View>
        <View style={styles.simCard}>
          <Text style={styles.simCardTitle}>Testing indoors?</Text>
          <Text style={styles.simCardBody}>
            Enable Simulation Mode to explore the fleet radar, satellite data cards,
            and proximity haptics without live GPS or physical movement.
          </Text>
          <TouchableOpacity style={styles.simButton} onPress={() => setSimMode(true)}>
            <Text style={styles.simButtonText}>Enable Simulation Mode</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>CHRONAURA TELEMETRY</Text>

        {simMode && (
          <TouchableOpacity style={styles.simBanner} onPress={() => setSimMode(false)}>
            <Text style={styles.simBannerText}>⚙ SIMULATION MODE · Tap to exit</Text>
          </TouchableOpacity>
        )}

        {/* Status badge */}
        <Animated.View style={pulseStyle}>
          <View style={[styles.badge, { borderColor: statusColor }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{statusText}</Text>
          </View>
        </Animated.View>

        {/* Fleet radar */}
        <SpaceRadarGrid
          blips={blips}
          alignmentScore={score}
          isLocked={isLocked}
          onBlipPress={(id) => setSelectedSatId(id)}
        />

        {/* Tap hint */}
        <Text style={styles.tapHint}>Tap a blip to identify the satellite</Text>

        {/* Score bar */}
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreValue, { color: statusColor }]}>{score}%</Text>
          <View style={styles.scoreTrack}>
            <View style={[styles.scoreFill, { width: `${score}%` as `${number}%`, backgroundColor: statusColor }]} />
          </View>
        </View>

        {/* Active target card */}
        {activeTarget && (
          <View style={[styles.card, { borderColor: activeTarget.satellite.radarColor + "55" }]}>
            <Text style={styles.cardTitle}>Active Target</Text>
            <View style={styles.activeHeader}>
              <View style={[styles.colorDot, { backgroundColor: activeTarget.satellite.radarColor }]} />
              <Text style={[styles.cardValue, { color: activeTarget.satellite.radarColor }]}>
                {activeTarget.satellite.name}
              </Text>
            </View>
            <View style={styles.row}>
              <InfoPill label="Az" value={`${activeTarget.alignment.targetAzimuth}°`} />
              <InfoPill label="El" value={`${activeTarget.alignment.targetElevation}°`} />
              <InfoPill label="Error" value={`${activeTarget.alignment.totalAngularError.toFixed(1)}°`} />
              <InfoPill label="Alt" value={`${activeTarget.satellite.altitudeKm} km`} />
            </View>
          </View>
        )}

        {/* Fleet list */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fleet · {fleetState.satellites.length} Objects</Text>
          {fleetState.satellites.map((state) => (
            <TouchableOpacity
              key={state.satellite.id}
              style={styles.fleetRow}
              onPress={() => setSelectedSatId(state.satellite.id)}
            >
              <View style={[styles.colorDot, { backgroundColor: state.satellite.radarColor }]} />
              <View style={styles.fleetRowMeta}>
                <Text style={styles.fleetName}>{state.satellite.shortName}</Text>
                <Text style={styles.fleetDetail}>{state.satellite.agency.split(" /")[0]}</Text>
              </View>
              <Text style={styles.fleetScore}>{state.alignment.alignmentScore}%</Text>
              <Text style={styles.fleetArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Observer */}
        <View style={[styles.card, { marginBottom: 40 }]}>
          <Text style={styles.cardTitle}>Observer</Text>
          <View style={styles.row}>
            <InfoPill label="Lat" value={`${location.latitudeDegrees.toFixed(3)}°`} />
            <InfoPill label="Lon" value={`${location.longitudeDegrees.toFixed(3)}°`} />
            <InfoPill label="Device Az" value={`${Math.round(pointing.azimuthDegrees)}°`} />
          </View>
          {simMode && <Text style={styles.fallbackNote}>Simulated observer: New York City</Text>}
        </View>
      </ScrollView>

      {/* Satellite data card modal */}
      {selectedSat && selectedState && (
        <SatelliteDataCard
          satellite={selectedSat}
          alignmentScore={selectedState.alignment.alignmentScore}
          targetAzimuth={selectedState.alignment.targetAzimuth}
          targetElevation={selectedState.alignment.targetElevation}
          onClose={() => setSelectedSatId(null)}
        />
      )}
    </View>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ChronauraColors.cosmicBlack },
  scroll: { flex: 1, backgroundColor: ChronauraColors.cosmicBlack },
  loadingOuter: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  container: { alignItems: "center", paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  title: { color: ChronauraColors.gold, fontSize: 15, fontWeight: "800", letterSpacing: 4, marginBottom: 14 },
  simBanner: { backgroundColor: ChronauraColors.deepIndigo, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 7, marginBottom: 12, borderWidth: 1, borderColor: ChronauraColors.borderSubtle },
  simBannerText: { color: ChronauraColors.silver, fontSize: 10, fontWeight: "700", letterSpacing: 1.5 },
  badge: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 4, marginBottom: 4 },
  badgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 3 },
  tapHint: { color: ChronauraColors.faint, fontSize: 11, marginBottom: 12, letterSpacing: 0.5 },
  scoreRow: { width: "100%", flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  scoreValue: { fontSize: 20, fontWeight: "900", width: 52, textAlign: "right" },
  scoreTrack: { flex: 1, height: 5, backgroundColor: ChronauraColors.elevated, borderRadius: 3, overflow: "hidden" },
  scoreFill: { height: "100%", borderRadius: 3 },
  card: { width: "100%", backgroundColor: ChronauraColors.surface, borderRadius: 18, borderWidth: 1, borderColor: ChronauraColors.borderGold, padding: 16, marginTop: 12 },
  cardTitle: { color: ChronauraColors.faint, fontSize: 9, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  cardValue: { fontSize: 14, fontWeight: "800", marginBottom: 10, flex: 1 },
  activeHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  colorDot: { width: 9, height: 9, borderRadius: 5 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  pill: { backgroundColor: ChronauraColors.elevated, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  pillLabel: { color: ChronauraColors.faint, fontSize: 9, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  pillValue: { color: ChronauraColors.silver, fontSize: 13, fontWeight: "700", marginTop: 2 },
  fleetRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: ChronauraColors.borderFaint },
  fleetRowMeta: { flex: 1 },
  fleetName: { color: ChronauraColors.silver, fontSize: 13, fontWeight: "700" },
  fleetDetail: { color: ChronauraColors.faint, fontSize: 11, marginTop: 2 },
  fleetScore: { color: ChronauraColors.gold, fontSize: 13, fontWeight: "700", marginRight: 4 },
  fleetArrow: { color: ChronauraColors.faint, fontSize: 18 },
  loadingCard: { alignItems: "center", gap: 8, marginBottom: 32 },
  loadingTitle: { color: ChronauraColors.silver, fontSize: 18, fontWeight: "700" },
  loadingDetail: { color: ChronauraColors.faint, fontSize: 14 },
  simCard: { width: "100%", backgroundColor: ChronauraColors.surface, borderRadius: 18, borderWidth: 1, borderColor: ChronauraColors.borderSubtle, padding: 20, alignItems: "center", gap: 10 },
  simCardTitle: { color: ChronauraColors.silver, fontSize: 15, fontWeight: "700" },
  simCardBody: { color: ChronauraColors.faint, fontSize: 13, textAlign: "center", lineHeight: 19 },
  simButton: { marginTop: 6, backgroundColor: ChronauraColors.deepIndigo, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 11, borderWidth: 1, borderColor: ChronauraColors.borderGold },
  simButtonText: { color: ChronauraColors.gold2, fontSize: 14, fontWeight: "700" },
  fallbackNote: { color: ChronauraColors.gold, fontSize: 12, marginTop: 8, opacity: 0.7 },
});
