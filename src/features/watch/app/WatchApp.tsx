import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { computeTonightSky } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import { tapSelection, tapLight } from "@/services/HapticService";
import {
  WATCH_DAY,
  WATCH_NIGHT,
  WATCH_TABS,
  type WatchCtx,
  type WatchTabKey
} from "./WatchAppTheme";
import { DialTab } from "./tabs/DialTab";
import { TonightTab } from "./tabs/TonightTab";
import { SatellitesTab } from "./tabs/SatellitesTab";
import { CompassTab } from "./tabs/CompassTab";
import { PhotoTimerTab } from "./tabs/PhotoTimerTab";
import { ObservationLogTab } from "./tabs/ObservationLogTab";

type Props = { onClose: () => void };

// The in-app AuraLunis Watch experience: a phone-rendered watch with a 6-tab bar,
// each tab wired to the live ephemeris / sensors / vault. Night Mode swaps the
// whole palette for dark-adapted viewing.
export function WatchApp({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { location, status } = useObserverLocation();
  const [now, setNow] = useState(() => new Date());
  const [nightMode, setNightMode] = useState(false);
  const [tab, setTab] = useState<WatchTabKey>("dial");

  // Keep the shared sky snapshot live without thrashing astronomy-engine.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const sky = useMemo(() => computeTonightSky(location, now), [location, now]);
  const palette = nightMode ? WATCH_NIGHT : WATCH_DAY;
  const ctx: WatchCtx = { sky, location, palette, nightMode };

  const renderTab = () => {
    switch (tab) {
      case "dial": return <DialTab ctx={ctx} />;
      case "tonight": return <TonightTab ctx={ctx} />;
      case "sats": return <SatellitesTab ctx={ctx} />;
      case "compass": return <CompassTab ctx={ctx} />;
      case "timer": return <PhotoTimerTab ctx={ctx} />;
      case "log": return <ObservationLogTab ctx={ctx} />;
      default: return <DialTab ctx={ctx} />;
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.bg, paddingTop: insets.top + 6 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={[styles.iconBtn, { borderColor: palette.line }]} onPress={onClose}>
          <Text style={[styles.iconText, { color: palette.text }]}>✕</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.title, { color: palette.accent }]}>AURALUNIS WATCH</Text>
          <Text style={[styles.subtitle, { color: palette.dim }]}>
            {status === "fallback" ? "Default location" : "Live · your location"}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.iconBtn, { borderColor: palette.line }, nightMode && { backgroundColor: palette.accentSoft }]}
          onPress={() => { tapLight(); setNightMode((n) => !n); }}
        >
          <Text style={[styles.iconText, { color: palette.text }]}>{nightMode ? "🌙" : "◐"}</Text>
        </TouchableOpacity>
      </View>

      {/* Watch "screen" */}
      <View style={[styles.screen, { backgroundColor: palette.screen, borderColor: palette.line }]}>
        {renderTab()}
      </View>

      {/* Tab bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom + 6, borderTopColor: palette.line }]}>
        {WATCH_TABS.map((t) => {
          const active = t.key === tab;
          return (
            <TouchableOpacity
              key={t.key}
              style={styles.tab}
              activeOpacity={0.8}
              onPress={() => { tapSelection(); setTab(t.key); }}
            >
              <Text style={[styles.tabIcon, { color: active ? palette.accent : palette.dim }]}>{t.icon}</Text>
              <Text style={[styles.tabLabel, { color: active ? palette.accent : palette.dim }]}>{t.label}</Text>
              {active && <View style={[styles.activeDot, { backgroundColor: palette.accent }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 16, fontWeight: "800" },
  title: { fontSize: 13, fontWeight: "900", letterSpacing: 2 },
  subtitle: { fontSize: 10, marginTop: 1 },
  screen: { flex: 1, marginHorizontal: 12, borderRadius: 32, borderWidth: 1, overflow: "hidden", paddingTop: 10 },
  tabBar: { flexDirection: "row", paddingTop: 8, borderTopWidth: 1, marginTop: 8 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 2 },
  tabIcon: { fontSize: 18 },
  tabLabel: { fontSize: 9, fontWeight: "700", marginTop: 2 },
  activeDot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 }
});
