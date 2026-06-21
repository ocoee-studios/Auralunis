// SatelliteDataCard.tsx
// Retro data card modal displayed when the user taps a satellite blip
// on the radar scope. Shows launch year, agency, mission, status, NORAD ID.
// Styled with the AuraLunis Midnight Gold design system.

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { AuraLunisColors } from "@/theme/tokens";
import {
  type AtmosphericSatellite,
  CLASS_LABELS,
} from "@/data/AtmosphereCatalog";

interface SatelliteDataCardProps {
  satellite: AtmosphericSatellite;
  alignmentScore: number;
  targetAzimuth: number;
  targetElevation: number;
  onClose: () => void;
}

const STATUS_COLORS: Record<AtmosphericSatellite["status"], string> = {
  active: AuraLunisColors.green,
  partial: AuraLunisColors.gold,
  decommissioned: AuraLunisColors.muted,
};

const STATUS_LABELS: Record<AtmosphericSatellite["status"], string> = {
  active: "OPERATIONAL",
  partial: "PARTIAL",
  decommissioned: "DECOMMISSIONED",
};

export function SatelliteDataCard({
  satellite,
  alignmentScore,
  targetAzimuth,
  targetElevation,
  onClose,
}: SatelliteDataCardProps) {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 14,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  function handleClose() {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }

  const statusColor = STATUS_COLORS[satellite.status];
  const classLabel = CLASS_LABELS[satellite.class];

  return (
    <Animated.View
      style={[styles.overlay, { opacity: fadeAnim }]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.card,
          { borderColor: satellite.radarColor, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.classBadge, { backgroundColor: satellite.radarColor + "22", borderColor: satellite.radarColor + "55" }]}>
              <Text style={[styles.classBadgeText, { color: satellite.radarColor }]}>
                {classLabel.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.shortName}>{satellite.shortName}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.fullName}>{satellite.name}</Text>

        {/* Status row */}
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {STATUS_LABELS[satellite.status]}
          </Text>
          <Text style={styles.norad}>NORAD #{satellite.noradId}</Text>
        </View>

        {/* Telemetry pills */}
        <View style={styles.pillRow}>
          <DataPill label="LAUNCH" value={String(satellite.launchYear)} color={satellite.radarColor} />
          <DataPill label="ALTITUDE" value={`${satellite.altitudeKm} km`} color={satellite.radarColor} />
          <DataPill label="ALIGNMENT" value={`${alignmentScore}%`} color={satellite.radarColor} />
        </View>
        <View style={[styles.pillRow, { marginTop: 8 }]}>
          <DataPill label="AZIMUTH" value={`${targetAzimuth}°`} color={satellite.radarColor} />
          <DataPill label="ELEVATION" value={`${targetElevation}°`} color={satellite.radarColor} />
          <DataPill label="COUNTRY" value={satellite.country.split(" ")[0]} color={satellite.radarColor} />
        </View>

        {/* Agency */}
        <View style={styles.divider} />
        <Text style={styles.agencyLabel}>AGENCY</Text>
        <Text style={styles.agencyValue}>{satellite.agency}</Text>

        {/* Mission */}
        <Text style={styles.missionLabel}>MISSION</Text>
        <ScrollView style={styles.missionScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.missionText}>{satellite.mission}</Text>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

function DataPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color + "33" }]}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(11,11,18,0.75)",
  },
  card: {
    backgroundColor: AuraLunisColors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 22,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  classBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  classBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  shortName: {
    color: AuraLunisColors.silver,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: AuraLunisColors.faint,
    fontSize: 16,
  },
  fullName: {
    color: AuraLunisColors.gold2,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    lineHeight: 26,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  norad: {
    color: AuraLunisColors.faint,
    fontSize: 11,
    marginLeft: "auto" as unknown as number,
    fontVariant: ["tabular-nums"],
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flex: 1,
    backgroundColor: AuraLunisColors.elevated,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  pillLabel: {
    color: AuraLunisColors.faint,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  pillValue: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
    fontVariant: ["tabular-nums"],
  },
  divider: {
    height: 1,
    backgroundColor: AuraLunisColors.borderSubtle,
    marginVertical: 14,
  },
  agencyLabel: {
    color: AuraLunisColors.faint,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
  },
  agencyValue: {
    color: AuraLunisColors.silver,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  missionLabel: {
    color: AuraLunisColors.faint,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 6,
  },
  missionScroll: {
    maxHeight: 80,
  },
  missionText: {
    color: AuraLunisColors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
