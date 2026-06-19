// OrbitalAlignmentScreen.tsx
// Unified tracking screen with four modes:
//   "fleet"      — Atmosphere Explorer (LEO satellite fleet)
//   "deep-space" — Planetary Deep Space Mode (Solar System)
//   "train"      — Starlink Train Tracker (Atmospheric Wake)
//   "golden"     — Chrono-Light Golden Hour Shadow Sniper
//
// Every 100% lock in fleet/deep-space/train is recorded to Cosmic Drift.

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withSpring, Easing,
} from "react-native-reanimated";

import { useDevicePointing } from "@/features/sky-lens/ar/useDevicePointing";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import type { CameraPointing } from "@/features/sky-lens/ar/SkyLensProjection";
import type { ObserverLocation } from "@/features/sky-lens/accuracy/SkyLensAccuracyTypes";

// Fleet
import { simulateTick, computeFleetState, type FleetState } from "@/services/AtmosphereExplorerService";
import { ATMOSPHERE_CATALOG } from "@/data/AtmosphereCatalog";
import { SatelliteDataCard } from "@/components/SatelliteDataCard";
import { SpaceRadarGrid, type RadarBlip } from "@/components/SpaceRadarGrid";

// Haptics
import { HapticController } from "@/utils/hapticController";

// Deep Space
import { computePlanetaryTargets, planetAlignmentDiff, PLANETS } from "@/utils/planetaryEphemeris";

// Starlink Train
import { getActiveTrain, tickTrainSimulation, trainToRadarBlips, trainHapticInterval } from "@/services/StarlinkTrainService";
import { WatchHaptics } from "@/modules/WatchHaptics";

// Chrono-Light
import { computeSunPosition, findNextGoldenEvents, formatCountdown } from "@/services/ChronoLightService";

// Cosmic Drift
import { recordLock } from "@/services/CosmicDriftService";
import { CosmicDriftGalaxy } from "@/components/CosmicDriftGalaxy";

// Theme
import { ChronauraColors } from "@/theme/tokens";

// ─── Types ────────────────────────────────────────────────────────────────────
type TrackingMode = "fleet" | "deep-space" | "train" | "golden";

const MODE_LABELS: Record<TrackingMode, string> = {
  "fleet":       "Fleet",
  "deep-space":  "Deep Space",
  "train":       "Train",
  "golden":      "Golden Hour",
};

// ─── Simulation ───────────────────────────────────────────────────────────────
const SIM_LOCATION: ObserverLocation = { latitudeDegrees: 40.7128, longitudeDegrees: -74.006, altitudeMeters: 10 };
function buildSimPointing(tick: number): CameraPointing {
  return { azimuthDegrees: (tick * 1.5) % 360, altitudeDegrees: 30 + Math.sin((tick * Math.PI) / 120) * 20, rollDegrees: 0 };
}

// ─── Component ────────────────────────────────────────────────────────────────
export function OrbitalAlignmentScreen() {
  const { pointing: livePointing, available: sensorAvailable } = useDevicePointing(80);
  const { location: liveLocation, status: gpsStatus } = useObserverLocation();

  const [simMode, setSimMode] = useState(false);
  const [simTick, setSimTick] = useState(0);
  const [trackingMode, setTrackingMode] = useState<TrackingMode>("fleet");
  const [fleetState, setFleetState] = useState<FleetState>({ satellites: [], activeTarget: null });
  const [selectedSatId, setSelectedSatId] = useState<string | null>(null);
  const [showDrift, setShowDrift] = useState(false);
  const [driftRefresh, setDriftRefresh] = useState(0);

  const hapticController = useRef(new HapticController());
  const trainHapticRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasLockedRef = useRef(false);
  const pulseOpacity = useSharedValue(1);

  const location = simMode ? SIM_LOCATION : liveLocation;
  const pointing = simMode ? buildSimPointing(simTick) : livePointing;

  // Sim sweep tick
  useEffect(() => {
    if (!simMode) return;
    const id = setInterval(() => setSimTick(t => t + 1), 200);
    return () => clearInterval(id);
  }, [simMode]);

  // Fleet tick
  useEffect(() => {
    if (trackingMode !== "fleet") return;
    const id = setInterval(() => {
      simulateTick();
      setFleetState(computeFleetState(location, pointing));
    }, 1000);
    return () => clearInterval(id);
  }, [trackingMode, location, pointing]);

  useEffect(() => {
    if (trackingMode === "fleet") setFleetState(computeFleetState(location, pointing));
  }, [trackingMode, pointing.azimuthDegrees, pointing.altitudeDegrees]);

  // Train tick
  useEffect(() => {
    if (trackingMode !== "train") return;
    const id = setInterval(() => tickTrainSimulation(), 1000);
    return () => clearInterval(id);
  }, [trackingMode]);

  // Cleanup
  useEffect(() => () => {
    hapticController.current.destroy();
    if (trainHapticRef.current) clearInterval(trainHapticRef.current);
  }, []);

  // ── Derived state per mode ──────────────────────────────────────────────────
  const planetaryTargets = useMemo(() => {
    if (trackingMode !== "deep-space") return [];
    return computePlanetaryTargets(location);
  }, [trackingMode, location]);

  const planetaryBlips: RadarBlip[] = useMemo(() => {
    if (trackingMode !== "deep-space") return [];
    return planetaryTargets.map(pt => {
      const diff = planetAlignmentDiff(pointing.azimuthDegrees, pointing.altitudeDegrees, pt.azimuth, pt.altitude);
      return {
        id: pt.id,
        azimuthDiff: diff.azimuthDiff,
        elevationDiff: diff.elevationDiff,
        color: pt.planet.radarColor,
        isActive: false,
        label: pt.planet.name,
      };
    });
  }, [trackingMode, planetaryTargets, pointing.azimuthDegrees, pointing.altitudeDegrees]);

  const activePlanet = useMemo(() => {
    if (trackingMode !== "deep-space" || planetaryTargets.length === 0) return null;
    return planetaryTargets.reduce((best, pt) => {
      const diff = planetAlignmentDiff(pointing.azimuthDegrees, pointing.altitudeDegrees, pt.azimuth, pt.altitude);
      const bestDiff = planetAlignmentDiff(pointing.azimuthDegrees, pointing.altitudeDegrees, best.azimuth, best.altitude);
      return diff.totalAngularError < bestDiff.totalAngularError ? pt : best;
    });
  }, [trackingMode, planetaryTargets, pointing.azimuthDegrees, pointing.altitudeDegrees]);

  const planetaryBlipsWithActive: RadarBlip[] = useMemo(() => {
    if (!activePlanet) return planetaryBlips;
    return planetaryBlips.map(b => ({ ...b, isActive: b.id === activePlanet.id }));
  }, [planetaryBlips, activePlanet]);

  const trainBlips = useMemo(() => {
    if (trackingMode !== "train") return [];
    const train = getActiveTrain();
    return trainToRadarBlips(train, location, pointing);
  }, [trackingMode, pointing.azimuthDegrees, pointing.altitudeDegrees, simTick]);

  const trainBlipsAsRadar: RadarBlip[] = useMemo(() => trainBlips.map(b => ({
    id: b.id,
    azimuthDiff: b.azimuthDiff,
    elevationDiff: b.elevationDiff,
    color: b.color,
    isActive: b.isActive,
    label: b.isLead ? "Lead" : "",
  })), [trainBlips]);

  const sunPosition = useMemo(() => {
    if (trackingMode !== "golden") return null;
    return computeSunPosition(location);
  }, [trackingMode, location, simTick]);

  const goldenEvents = useMemo(() => {
    if (trackingMode !== "golden") return [];
    return findNextGoldenEvents(location);
  }, [trackingMode, location]);

  // ── Active target for score/haptics/lock ────────────────────────────────────
  const { activeScore, isLocked, activeColor, activeName, activeAzimuth, activeElevation, activeAltKm } = useMemo(() => {
    if (trackingMode === "fleet" && fleetState.activeTarget) {
      const t = fleetState.activeTarget;
      return {
        activeScore: t.alignment.alignmentScore,
        isLocked: t.alignment.isLocked,
        activeColor: t.satellite.radarColor,
        activeName: t.satellite.name,
        activeAzimuth: t.alignment.targetAzimuth,
        activeElevation: t.alignment.targetElevation,
        activeAltKm: t.satellite.altitudeKm,
      };
    }
    if (trackingMode === "deep-space" && activePlanet) {
      const diff = planetAlignmentDiff(pointing.azimuthDegrees, pointing.altitudeDegrees, activePlanet.azimuth, activePlanet.altitude);
      return {
        activeScore: diff.alignmentScore,
        isLocked: diff.isLocked,
        activeColor: activePlanet.planet.radarColor,
        activeName: activePlanet.planet.name,
        activeAzimuth: Math.round(activePlanet.azimuth),
        activeElevation: Math.round(activePlanet.altitude * 10) / 10,
        activeAltKm: Math.round(activePlanet.distAU * 149_597_870),
      };
    }
    if (trackingMode === "train") {
      const active = trainBlips.find(b => b.isActive);
      const score = active?.alignmentScore ?? 0;
      return {
        activeScore: score,
        isLocked: (active?.totalAngularError ?? 999) < 3.5,
        activeColor: "#A78BFA",
        activeName: "Starlink Group 12",
        activeAzimuth: 0,
        activeElevation: 0,
        activeAltKm: 340,
      };
    }
    return { activeScore: 0, isLocked: false, activeColor: ChronauraColors.gold, activeName: "—", activeAzimuth: 0, activeElevation: 0, activeAltKm: 0 };
  }, [trackingMode, fleetState, activePlanet, trainBlips, pointing]);

  const statusColor = isLocked ? ChronauraColors.green : activeScore > 65 ? activeColor : ChronauraColors.silver;
  const statusText = isLocked ? "LOCKED" : activeScore > 65 ? "ALIGNING" : "SEARCHING";

  // ── Haptics ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (trackingMode === "fleet" || trackingMode === "deep-space") {
      hapticController.current.update(activeScore, isLocked);
    }
    if (trackingMode === "train") {
      const active = trainBlips.find(b => b.isActive);
      const interval = trainHapticInterval(active?.totalAngularError ?? 999);
      if (trainHapticRef.current) clearInterval(trainHapticRef.current);
      if (interval) {
        trainHapticRef.current = setInterval(() => WatchHaptics.triggerCompassTick(), interval);
      }
    }
  }, [activeScore, isLocked, trackingMode, trainBlips]);

  // ── Cosmic Drift lock recording ──────────────────────────────────────────────
  useEffect(() => {
    if (isLocked && !wasLockedRef.current && (trackingMode === "fleet" || trackingMode === "deep-space" || trackingMode === "train")) {
      const type = trackingMode === "fleet" ? "satellite" : trackingMode === "deep-space" ? "planet" : "starlink-train";
      recordLock({
        targetId: trackingMode === "fleet" ? (fleetState.activeTarget?.satellite.id ?? "unknown") : activeName,
        targetName: activeName,
        targetType: type,
        targetColor: activeColor,
        observerLat: location.latitudeDegrees,
        observerLon: location.longitudeDegrees,
        azimuth: activeAzimuth,
        elevation: activeElevation,
        altitudeKm: activeAltKm,
      }).then(() => setDriftRefresh(n => n + 1)).catch(() => {});
    }
    wasLockedRef.current = isLocked;
  }, [isLocked, trackingMode]);

  // ── Pulse animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLocked) { pulseOpacity.value = withSpring(1); return; }
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 650, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 650, easing: Easing.inOut(Easing.ease) })
      ), -1, false
    );
  }, [isLocked]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));
  const isReady = simMode || (gpsStatus !== "loading" && sensorAvailable);

  // ── Active blips for radar ───────────────────────────────────────────────────
  const activeBlips: RadarBlip[] = useMemo(() => {
    if (trackingMode === "fleet") {
      return fleetState.satellites.map(s => ({
        id: s.satellite.id,
        azimuthDiff: s.alignment.azimuthDiff,
        elevationDiff: s.alignment.elevationDiff,
        color: s.satellite.radarColor,
        isActive: s.satellite.id === fleetState.activeTarget?.satellite.id,
        label: s.satellite.shortName,
      }));
    }
    if (trackingMode === "deep-space") return planetaryBlipsWithActive;
    if (trackingMode === "train") return trainBlipsAsRadar;
    return [];
  }, [trackingMode, fleetState, planetaryBlipsWithActive, trainBlipsAsRadar]);

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (!isReady) {
    return (
      <View style={[styles.screen, styles.loadingOuter]}>
        <Text style={styles.title}>CHRONAURA TELEMETRY</Text>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingTitle}>Acquiring telemetry…</Text>
          <Text style={styles.loadingDetail}>GPS: {gpsStatus === "loading" ? "acquiring" : gpsStatus}</Text>
          <Text style={styles.loadingDetail}>Sensors: {sensorAvailable ? "ready" : "initialising"}</Text>
        </View>
        <View style={styles.simCard}>
          <Text style={styles.simCardTitle}>Testing indoors?</Text>
          <TouchableOpacity style={styles.simButton} onPress={() => setSimMode(true)}>
            <Text style={styles.simButtonText}>Enable Simulation Mode</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>CHRONAURA TELEMETRY</Text>

        {simMode && (
          <TouchableOpacity style={styles.simBanner} onPress={() => setSimMode(false)}>
            <Text style={styles.simBannerText}>⚙ SIMULATION MODE · Tap to exit</Text>
          </TouchableOpacity>
        )}

        {/* Mode switcher */}
        <View style={styles.modeRow}>
          {(["fleet", "deep-space", "train", "golden"] as TrackingMode[]).map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, trackingMode === m && { borderColor: ChronauraColors.gold, backgroundColor: "rgba(212,175,55,0.12)" }]}
              onPress={() => setTrackingMode(m)}
            >
              <Text style={[styles.modeBtnText, trackingMode === m && { color: ChronauraColors.gold }]}>{MODE_LABELS[m]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Golden Hour mode ── */}
        {trackingMode === "golden" && sunPosition && (
          <>
            <View style={[styles.card, { borderColor: "#EF9F27" + "55" }]}>
              <Text style={styles.cardTitle}>Sun Position</Text>
              <View style={styles.row}>
                <InfoPill label="Azimuth" value={`${Math.round(sunPosition.azimuth)}°`} />
                <InfoPill label="Elevation" value={`${sunPosition.elevation.toFixed(1)}°`} />
                <InfoPill label="Phase" value={sunPosition.phase.replace("-", " ")} />
              </View>
              <View style={[styles.phaseBar, { marginTop: 14 }]}>
                <View style={[styles.phaseFill, { width: `${Math.max(0, Math.min(100, (sunPosition.elevation + 6) / 12 * 100))}%` as `${number}%`, backgroundColor: sunPosition.isGoldenHour ? "#EF9F27" : sunPosition.isMagicHour ? "#D4AF37" : "#4ADE80" }]} />
              </View>
            </View>

            {goldenEvents.map(evt => (
              <View key={evt.type} style={[styles.card, { borderColor: "#EF9F27" + "44" }]}>
                <Text style={styles.cardTitle}>{evt.type === "dawn" ? "Golden Dawn" : "Golden Dusk"}</Text>
                <View style={styles.row}>
                  <InfoPill label="Countdown" value={formatCountdown(evt.minutesUntil)} />
                  <InfoPill label="Sun Az" value={`${Math.round(evt.azimuth)}°`} />
                </View>
                <Text style={[styles.fallbackNote, { marginTop: 8 }]}>
                  {sunPosition.isGoldenHour ? "Golden hour active now — light is perfect." : `Point your camera at azimuth ${Math.round(evt.azimuth)}°.`}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* ── Radar (fleet / deep-space / train) ── */}
        {trackingMode !== "golden" && (
          <>
            <Animated.View style={pulseStyle}>
              <View style={[styles.badge, { borderColor: statusColor }]}>
                <Text style={[styles.badgeText, { color: statusColor }]}>{statusText}</Text>
              </View>
            </Animated.View>

            <SpaceRadarGrid
              blips={activeBlips}
              alignmentScore={activeScore}
              isLocked={isLocked}
              onBlipPress={trackingMode === "fleet" ? setSelectedSatId : undefined}
            />

            {trackingMode === "train" && (
              <Text style={styles.tapHint}>Starlink Group 12 · {getActiveTrain().nodeCount} nodes · chain heading {Math.round(pointing.azimuthDegrees)}°</Text>
            )}
            {trackingMode !== "train" && <Text style={styles.tapHint}>Tap a blip to identify</Text>}

            <View style={styles.scoreRow}>
              <Text style={[styles.scoreValue, { color: statusColor }]}>{activeScore}%</Text>
              <View style={styles.scoreTrack}>
                <View style={[styles.scoreFill, { width: `${activeScore}%` as `${number}%`, backgroundColor: statusColor }]} />
              </View>
            </View>

            {/* Active target card */}
            <View style={[styles.card, { borderColor: activeColor + "55" }]}>
              <Text style={styles.cardTitle}>Active Target</Text>
              <View style={styles.activeHeader}>
                <View style={[styles.colorDot, { backgroundColor: activeColor }]} />
                <Text style={[styles.cardValue, { color: activeColor }]}>{activeName}</Text>
              </View>
              <View style={styles.row}>
                <InfoPill label="Az" value={`${activeAzimuth}°`} />
                <InfoPill label="El" value={`${activeElevation}°`} />
                {trackingMode === "deep-space" && activePlanet && (
                  <InfoPill label="Distance" value={`${activePlanet.distAU.toFixed(2)} AU`} />
                )}
                {trackingMode !== "deep-space" && <InfoPill label="Alt" value={`${activeAltKm} km`} />}
              </View>
              {trackingMode === "deep-space" && activePlanet && (
                <Text style={[styles.fallbackNote, { marginTop: 8 }]}>{activePlanet.planet.fact}</Text>
              )}
            </View>

            {/* Fleet list */}
            {trackingMode === "fleet" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Fleet · {fleetState.satellites.length} Objects</Text>
                {fleetState.satellites.map(state => (
                  <TouchableOpacity key={state.satellite.id} style={styles.fleetRow} onPress={() => setSelectedSatId(state.satellite.id)}>
                    <View style={[styles.colorDot, { backgroundColor: state.satellite.radarColor }]} />
                    <View style={styles.fleetRowMeta}>
                      <Text style={styles.fleetName}>{state.satellite.shortName}</Text>
                      <Text style={styles.fleetDetail}>{state.satellite.agency.split(" /")[0]}</Text>
                    </View>
                    <Text style={[styles.fleetScore, { color: state.satellite.radarColor }]}>{state.alignment.alignmentScore}%</Text>
                    <Text style={styles.fleetArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Planet list */}
            {trackingMode === "deep-space" && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Solar System · {planetaryTargets.length} Bodies</Text>
                {planetaryTargets.map(pt => {
                  const diff = planetAlignmentDiff(pointing.azimuthDegrees, pointing.altitudeDegrees, pt.azimuth, pt.altitude);
                  return (
                    <View key={pt.id} style={styles.fleetRow}>
                      <View style={[styles.colorDot, { backgroundColor: pt.planet.radarColor }]} />
                      <View style={styles.fleetRowMeta}>
                        <Text style={styles.fleetName}>{pt.planet.name}</Text>
                        <Text style={styles.fleetDetail}>{pt.altitude > 0 ? `el ${pt.altitude.toFixed(1)}°` : "below horizon"}</Text>
                      </View>
                      <Text style={[styles.fleetScore, { color: pt.planet.radarColor }]}>{diff.alignmentScore}%</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {/* Cosmic Drift toggle */}
        <TouchableOpacity style={[styles.card, { borderColor: ChronauraColors.violet + "55" }]} onPress={() => setShowDrift(v => !v)}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[styles.cardTitle, { color: ChronauraColors.violet }]}>✦ COSMIC DRIFT GALAXY</Text>
            <Text style={[styles.cardTitle, { color: ChronauraColors.violet }]}>{showDrift ? "▲" : "▼"}</Text>
          </View>
          {!showDrift && <Text style={styles.fleetDetail}>Your personal lock history — tap to expand</Text>}
        </TouchableOpacity>

        {showDrift && <CosmicDriftGalaxy refreshTrigger={driftRefresh} />}

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
      {selectedSatId && (() => {
        const sat = ATMOSPHERE_CATALOG.find(s => s.id === selectedSatId);
        const state = fleetState.satellites.find(s => s.satellite.id === selectedSatId);
        if (!sat || !state) return null;
        return (
          <SatelliteDataCard
            satellite={sat}
            alignmentScore={state.alignment.alignmentScore}
            targetAzimuth={state.alignment.targetAzimuth}
            targetElevation={state.alignment.targetElevation}
            onClose={() => setSelectedSatId(null)}
          />
        );
      })()}
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
  scroll: { flex: 1 },
  loadingOuter: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  container: { alignItems: "center", paddingTop: 56, paddingHorizontal: 16, paddingBottom: 20 },
  title: { color: ChronauraColors.gold, fontSize: 13, fontWeight: "800", letterSpacing: 4, marginBottom: 12 },
  simBanner: { backgroundColor: ChronauraColors.deepIndigo, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 10, borderWidth: 1, borderColor: ChronauraColors.borderSubtle },
  simBannerText: { color: ChronauraColors.silver, fontSize: 9, fontWeight: "700", letterSpacing: 1.5 },
  modeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14, width: "100%", justifyContent: "center" },
  modeBtn: { borderWidth: 1, borderColor: ChronauraColors.borderSubtle, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  modeBtnText: { color: ChronauraColors.faint, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  badge: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 4, marginBottom: 4, alignSelf: "center" },
  badgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 3 },
  tapHint: { color: ChronauraColors.faint, fontSize: 10, marginBottom: 10 },
  scoreRow: { width: "100%", flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  scoreValue: { fontSize: 18, fontWeight: "900", width: 48, textAlign: "right" },
  scoreTrack: { flex: 1, height: 4, backgroundColor: ChronauraColors.elevated, borderRadius: 2, overflow: "hidden" },
  scoreFill: { height: "100%", borderRadius: 2 },
  card: { width: "100%", backgroundColor: ChronauraColors.surface, borderRadius: 16, borderWidth: 1, borderColor: ChronauraColors.borderGold, padding: 14, marginBottom: 10 },
  cardTitle: { color: ChronauraColors.faint, fontSize: 9, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 },
  cardValue: { fontSize: 13, fontWeight: "800", marginBottom: 8, flex: 1 },
  activeHeader: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 },
  colorDot: { width: 8, height: 8, borderRadius: 4 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  pill: { backgroundColor: ChronauraColors.elevated, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, flex: 1 },
  pillLabel: { color: ChronauraColors.faint, fontSize: 8, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  pillValue: { color: ChronauraColors.silver, fontSize: 12, fontWeight: "700", marginTop: 2 },
  fleetRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: ChronauraColors.borderFaint },
  fleetRowMeta: { flex: 1 },
  fleetName: { color: ChronauraColors.silver, fontSize: 12, fontWeight: "700" },
  fleetDetail: { color: ChronauraColors.faint, fontSize: 10, marginTop: 1 },
  fleetScore: { fontSize: 12, fontWeight: "700", marginRight: 4 },
  fleetArrow: { color: ChronauraColors.faint, fontSize: 16 },
  phaseBar: { width: "100%", height: 5, backgroundColor: ChronauraColors.elevated, borderRadius: 3, overflow: "hidden" },
  phaseFill: { height: "100%", borderRadius: 3 },
  loadingCard: { alignItems: "center", gap: 8, marginBottom: 28 },
  loadingTitle: { color: ChronauraColors.silver, fontSize: 16, fontWeight: "700" },
  loadingDetail: { color: ChronauraColors.faint, fontSize: 13 },
  simCard: { width: "100%", backgroundColor: ChronauraColors.surface, borderRadius: 16, borderWidth: 1, borderColor: ChronauraColors.borderSubtle, padding: 18, alignItems: "center", gap: 10 },
  simCardTitle: { color: ChronauraColors.silver, fontSize: 14, fontWeight: "700" },
  simButton: { backgroundColor: ChronauraColors.deepIndigo, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: ChronauraColors.borderGold },
  simButtonText: { color: ChronauraColors.gold2, fontSize: 13, fontWeight: "700" },
  fallbackNote: { color: ChronauraColors.gold, fontSize: 11, opacity: 0.75 },
});
