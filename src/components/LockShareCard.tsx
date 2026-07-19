// LockShareCard.tsx
// Generates a beautiful, branded image card when the user achieves a 100% lock.
// Designed for Instagram Stories / X posts — 1080x1920 aspect ratio at 360x640 dp.
// Captured via react-native-view-shot (or expo-media-library screenshot).
//
// Includes: target name, alignment score, observer location, timestamp,
// azimuth/elevation, AuraLunis branding, and the target's radar color.

import React, { useRef } from "react";
import { formatDateTime } from "@/utils/formatting";
import {
  View, Text, StyleSheet, TouchableOpacity, Share, Platform, Alert,
} from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { AuraLunisColors } from "@/theme/tokens";

export interface LockShareData {
  targetName: string;
  targetColor: string;
  targetType: "satellite" | "planet" | "starlink-train";
  alignmentScore: number;
  azimuth: number;
  elevation: number;
  altitudeKm: number;
  observerLat: number;
  observerLon: number;
  locationLabel: string;
  timestamp: string;
}

interface LockShareCardProps {
  data: LockShareData;
  onClose: () => void;
}

// Small locked radar illustration
function MiniRadar({ color }: { color: string }) {
  const S = 100, C = 50;
  return (
    <Svg width={S} height={S}>
      <Circle cx={C} cy={C} r={48} stroke={color + "33"} strokeWidth={1} fill="none" />
      <Circle cx={C} cy={C} r={30} stroke={color + "22"} strokeWidth={0.5} strokeDasharray="3 3" fill="none" />
      <Line x1={10} y1={C} x2={90} y2={C} stroke={color + "22"} strokeWidth={0.5} />
      <Line x1={C} y1={10} x2={C} y2={90} stroke={color + "22"} strokeWidth={0.5} />
      <Circle cx={C} cy={C} r={8} stroke={AuraLunisColors.green} strokeWidth={1.5} fill="none" />
      <Circle cx={C} cy={C} r={4} fill={AuraLunisColors.green} />
    </Svg>
  );
}

function formatTimestamp(iso: string): string {
  try {
    return formatDateTime(new Date(iso));
  } catch {
    return iso;
  }
}

function formatCoord(val: number, pos: string, neg: string): string {
  const abs = Math.abs(val).toFixed(2);
  return val >= 0 ? `${abs}° ${pos}` : `${abs}° ${neg}`;
}

const TYPE_LABELS: Record<LockShareData["targetType"], string> = {
  satellite: "SATELLITE LOCK",
  planet: "PLANETARY LOCK",
  "starlink-train": "STARLINK CHAIN LOCK",
};

export function LockShareCard({ data, onClose }: LockShareCardProps) {
  const cardRef = useRef<View>(null);

  async function handleShare() {
    const message = [
      `I just locked onto ${data.targetName} with AuraLunis.`,
      `${data.alignmentScore}% alignment · az ${data.azimuth}° · el ${data.elevation}°`,
      `${data.locationLabel} · ${formatTimestamp(data.timestamp)}`,
      "",
      "Made with AuraLunis",
    ].join("\n");

    try {
      await Share.share({ message, title: `AuraLunis Lock — ${data.targetName}` });
    } catch {
      Alert.alert("Share", "Could not open the share sheet.");
    }
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card} ref={cardRef} collapsable={false}>
        {/* Top brand bar */}
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>AURALUNIS</Text>
          <Text style={styles.brandTag}>YOUR SKY. YOUR STORY.</Text>
        </View>

        {/* Lock type badge */}
        <View style={[styles.typeBadge, { borderColor: data.targetColor + "55", backgroundColor: data.targetColor + "15" }]}>
          <Text style={[styles.typeBadgeText, { color: data.targetColor }]}>
            {TYPE_LABELS[data.targetType]}
          </Text>
        </View>

        {/* Locked radar */}
        <MiniRadar color={data.targetColor} />

        {/* Score */}
        <Text style={styles.score}>{data.alignmentScore}%</Text>
        <Text style={[styles.lockedLabel, { color: AuraLunisColors.green }]}>LOCKED</Text>

        {/* Target name */}
        <Text style={[styles.targetName, { color: data.targetColor }]}>{data.targetName}</Text>

        {/* Telemetry pills */}
        <View style={styles.pillRow}>
          <SharePill label="AZIMUTH" value={`${data.azimuth}°`} />
          <SharePill label="ELEVATION" value={`${data.elevation}°`} />
          <SharePill label="ALTITUDE" value={`${Math.round(data.altitudeKm)} km`} />
        </View>

        {/* Location + time */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {formatCoord(data.observerLat, "N", "S")} · {formatCoord(data.observerLon, "E", "W")}
          </Text>
          <Text style={styles.metaText}>{data.locationLabel}</Text>
          <Text style={styles.metaText}>{formatTimestamp(data.timestamp)}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Made with AuraLunis</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SharePill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(11,11,18,0.9)", justifyContent: "center", alignItems: "center", padding: 20, zIndex: 20 },
  card: {
    width: "100%", maxWidth: 340,
    backgroundColor: "#05070D",
    borderRadius: 24,
    borderWidth: 1, borderColor: AuraLunisColors.borderGold,
    padding: 24, alignItems: "center",
  },
  brandRow: { alignItems: "center", marginBottom: 16 },
  brandName: { color: AuraLunisColors.gold, fontSize: 12, fontWeight: "900", letterSpacing: 5 },
  brandTag: { color: AuraLunisColors.faint, fontSize: 7, fontWeight: "700", letterSpacing: 2, marginTop: 3 },
  typeBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 16 },
  typeBadgeText: { fontSize: 9, fontWeight: "800", letterSpacing: 2 },
  score: { color: AuraLunisColors.green, fontSize: 48, fontWeight: "900", lineHeight: 52 },
  lockedLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 4, marginBottom: 10 },
  targetName: { fontSize: 18, fontWeight: "900", textAlign: "center", marginBottom: 16, lineHeight: 24 },
  pillRow: { flexDirection: "row", gap: 8, marginBottom: 16, width: "100%" },
  pill: { flex: 1, backgroundColor: AuraLunisColors.elevated, borderRadius: 10, padding: 10, alignItems: "center" },
  pillLabel: { color: AuraLunisColors.faint, fontSize: 8, fontWeight: "700", letterSpacing: 1 },
  pillValue: { color: AuraLunisColors.silver, fontSize: 13, fontWeight: "800", marginTop: 3 },
  metaRow: { alignItems: "center", gap: 4, marginBottom: 16 },
  metaText: { color: AuraLunisColors.faint, fontSize: 10 },
  footer: { color: AuraLunisColors.gold + "77", fontSize: 9, letterSpacing: 1 },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  shareBtn: { backgroundColor: AuraLunisColors.gold, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 13 },
  shareBtnText: { color: AuraLunisColors.cosmicBlack, fontSize: 15, fontWeight: "900" },
  closeBtn: { borderWidth: 1, borderColor: AuraLunisColors.borderSubtle, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13 },
  closeBtnText: { color: AuraLunisColors.silver, fontSize: 15, fontWeight: "700" },
});
