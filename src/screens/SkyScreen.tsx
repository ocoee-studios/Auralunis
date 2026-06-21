import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TAB_BAR_STYLE } from "@/navigation/RootTabs";
import { ScreenShell } from "@/components/ScreenShell";
import { FeatureCard } from "@/components/FeatureCard";
import { GlassPanel } from "@/components/GlassPanel";
import { SkyLensPermissionGate } from "@/features/permissions/SkyLensPermissionGate";
import { SkyLensScreen } from "@/features/sky-lens/SkyLensScreen";
import { ManualSkyMap } from "@/features/sky-lens/ManualSkyMap";
import { featuredDeepSkyObjects } from "@/features/archive/DeepSkyCatalog";
import { AuraLunisColors } from "@/theme/tokens";
import { useAuraLunisVault } from "@/state/AuraLunisVaultContext";
import { SatelliteThermalOverlayPanel } from "@/features/aura-pro/SatelliteThermalOverlayPanel";
import { AstrophotographyPredictorPanel } from "@/features/aura-pro/AstrophotographyPredictorPanel";
import { computeTonightSky, findBody } from "@/features/sky-lens/ephemeris/SkyEphemerisService";
import { useObserverLocation } from "@/features/sky-lens/ephemeris/useObserverLocation";
import { OrbitalAlignmentScreen } from "@/screens/OrbitalAlignmentScreen";

export function SkyScreen() {
  const [showPermission, setShowPermission] = useState(false);
  const [skyLensOpen, setSkyLensOpen] = useState(false);
  const [manualMapOpen, setManualMapOpen] = useState(false);
  const [galaxyModeOn, setGalaxyModeOn] = useState(false);
  const [alignmentOpen, setAlignmentOpen] = useState(false);
  const { addItem } = useAuraLunisVault();

  const { location, status } = useObserverLocation();
  const sky = useMemo(() => computeTonightSky(location), [location]);

  // Hide the (absolute-positioned) bottom tab bar during full-screen immersive
  // modes so it doesn't sit on top of the Sky Lens layer pills / Alignment controls.
  const navigation = useNavigation<any>();
  useEffect(() => {
    const immersive = skyLensOpen || alignmentOpen;
    navigation.setOptions({ tabBarStyle: immersive ? { display: "none" } : TAB_BAR_STYLE });
  }, [navigation, skyLensOpen, alignmentOpen]);

  if (showPermission && !skyLensOpen && !manualMapOpen) {
    return (
      <SkyLensPermissionGate
        onGranted={() => {
          setShowPermission(false);
          setSkyLensOpen(true);
        }}
        onDenied={() => setShowPermission(false)}
        onManualMap={() => {
          setShowPermission(false);
          setManualMapOpen(true);
        }}
      />
    );
  }

  // The Sky Lens takes over the full screen (camera + AR overlay), so render it
  // as a standalone screen rather than an embedded card.
  if (skyLensOpen) {
    return <SkyLensScreen onClose={() => setSkyLensOpen(false)} />;
  }

  // Orbital Alignment also takes over the full screen. It used to render as an
  // absoluteFill overlay INSIDE ScreenShell's ScrollView, which positioned it
  // under the brand header and let it scroll — that's why it looked off.
  if (alignmentOpen) {
    return (
      <View style={styles.alignmentRoot}>
        <OrbitalAlignmentScreen />
        <TouchableOpacity style={styles.backButton} onPress={() => setAlignmentOpen(false)}>
          <Text style={styles.backButtonText}>← Sky</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScreenShell title="Sky Lens + Archive" subtitle="Sky">
      {manualMapOpen ? <ManualSkyMap onClose={() => setManualMapOpen(false)} /> : null}

      <FeatureCard
        title="AuraLunis Sky Lens"
        description="Privacy-safe AR-style viewer with gold overlays, Find Mode, X-Ray Lens, Birth Overlay, guided tour, and capture."
        actionLabel="Open Sky Lens"
        onPress={() => setShowPermission(true)}
      />

      <FeatureCard
        title="Manual Sky Map"
        description="Explore a privacy-safe fallback map without camera access. Ideal when indoors or when camera permission is declined."
        actionLabel="Open Manual Map"
        onPress={() => setManualMapOpen(true)}
      />

      <FeatureCard
        title="Orbital Alignment"
        description="Point your phone at the sky and lock onto a satellite or celestial target using live GPS and device orientation. Radar scope tracks the target in real time."
        actionLabel="Open Alignment"
        onPress={() => setAlignmentOpen(true)}
      />

      <GlassPanel accent style={{ marginBottom: 12 }}>
        <Text style={styles.sectionLabel}>TONIGHT’S SKY · LIVE</Text>
        <Text style={styles.sectionTitle}>Real positions for your location</Text>
        {sky.bodies.map((body) => (
          <View key={body.id} style={styles.skyRow}>
            <Text style={styles.skyName}>{body.name}</Text>
            <Text style={body.aboveHorizon ? styles.skyVal : styles.skyValDim}>
              {body.aboveHorizon
                ? `az ${Math.round(body.azimuthDegrees)}° · alt ${Math.round(body.altitudeDegrees)}°`
                : "below horizon"}
            </Text>
          </View>
        ))}
        {status === "fallback" ? (
          <Text style={styles.skyHint}>Default location · enable location for your exact sky.</Text>
        ) : null}
      </GlassPanel>

      <FeatureCard
        title="Find Mode"
        description="Guide to the Moon, Venus, Jupiter, and tonight’s best targets using live ephemeris and device orientation."
        actionLabel="Find Venus"
        onPress={() => {
          const venus = findBody(sky, "venus");
          Alert.alert(
            "Find Mode · Venus",
            venus && venus.aboveHorizon
              ? `Venus is up now: compass azimuth ${Math.round(venus.azimuthDegrees)}°, altitude ${Math.round(venus.altitudeDegrees)}° above the horizon. Point your phone there. On-device, the compass and gyro align the overlay arrow to this position.`
              : "Venus is below the horizon right now. Find Mode will point you to it once it rises."
          );
        }}
      />

      <FeatureCard
        title="X-Ray Lens + Birth Sky Overlay"
        description="Reveal orbital geometry, ecliptic paths, moon path, transit vectors, and birth-sky comparison."
        actionLabel="Reveal Geometry"
        onPress={() => Alert.alert("X-Ray Lens", "Orbital geometry layer prepared.")}
      />

      <FeatureCard
        title="Milky Way / Galaxy Mode"
        description={`Milky Way band, Galactic Center, Great Rift, dust lanes, and best viewing guidance. Current state: ${galaxyModeOn ? "On" : "Off"}.`}
        actionLabel={galaxyModeOn ? "Hide Galaxy Mode" : "Show Galaxy Mode"}
        onPress={() => setGalaxyModeOn((previous) => !previous)}
      />

      <SatelliteThermalOverlayPanel />

      <AstrophotographyPredictorPanel />

      <GlassPanel style={{ marginBottom: 12 }}>
        <Text style={styles.sectionLabel}>DEEP SKY HIGHLIGHTS</Text>
        <Text style={styles.sectionTitle}>Nebulae, galaxies, clusters, and remnants</Text>
        <Text style={styles.sectionCopy}>
          Most deep-sky objects need dark skies, binoculars, or a telescope. AuraLunis shows their true sky location honestly.
        </Text>
      </GlassPanel>

      {featuredDeepSkyObjects.slice(0, 8).map((object) => (
        <FeatureCard
          key={object.id}
          title={object.name}
          description={`${object.summary}\n\nLayer: ${object.skyLensLayer.replace("_", " ")} · Best season: ${object.bestSeason ?? "Varies"} · Naked-eye: ${object.visibleToNakedEye ? "sometimes" : "usually no"}`}
          actionLabel="Save + Find"
          onPress={() => {
            addItem({ type: "archive", title: object.name, detail: object.summary });
            Alert.alert(object.name, "Saved to the local prototype Vault. Find Mode boundary prepared.");
          }}
          status={object.type.replace("_", " ")}
        />
      ))}

      <FeatureCard
        title="Celestial Archive"
        description="Solar System, planets, moons, all 88 official constellations, named stars, events, Deep Sky, and Milky Way education."
        actionLabel="Open Archive Summary"
        onPress={() => Alert.alert("Celestial Archive", "Archive sections prepared: Solar System · Moon · Planets · Moons · Constellations · Stars · Events · Deep Sky · Milky Way.")}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "rgba(98,207,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(98,207,255,0.18)"
  },
  sectionLabel: { color: AuraLunisColors.gold2, fontSize: 10, letterSpacing: 2.4, fontWeight: "900" },
  sectionTitle: { color: "#FFF", fontSize: 20, fontWeight: "900", marginTop: 8 },
  sectionCopy: { color: AuraLunisColors.silver, fontSize: 13, lineHeight: 19, marginTop: 6 },
  skyCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "rgba(217,168,78,0.08)",
    borderWidth: 1,
    borderColor: "rgba(217,168,78,0.20)"
  },
  skyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)"
  },
  skyName: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  skyVal: { color: AuraLunisColors.gold2, fontSize: 13, fontVariant: ["tabular-nums"] },
  skyValDim: { color: AuraLunisColors.muted, fontSize: 13 },
  skyHint: { color: AuraLunisColors.muted, fontSize: 11, marginTop: 10 },
  alignmentRoot: { flex: 1, backgroundColor: AuraLunisColors.cosmicBlack },
  backButton: {
    position: "absolute",
    top: 54,
    left: 20,
    backgroundColor: "rgba(7,18,37,0.88)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: AuraLunisColors.borderGold,
  },
  backButtonText: {
    color: AuraLunisColors.gold2,
    fontSize: 14,
    fontWeight: "700",
  },
});
