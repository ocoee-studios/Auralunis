import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { ChronauraColors } from "@/theme/tokens";
import { LogoMark } from "@/components/LogoMark";

type Props = {
  onGranted: () => void;
  onDenied: () => void;
  onManualMap?: () => void;
};

export function SkyLensPermissionGate({ onGranted, onDenied, onManualMap }: Props) {
  const [permission, requestPermission] = useCameraPermissions();

  function openManualFallback() {
    if (onManualMap) onManualMap();
    else onDenied();
  }

  async function handleContinue() {
    try {
      const result = await requestPermission();

      if (result.granted) {
        onGranted();
        return;
      }

      Alert.alert(
        "Camera not enabled",
        "You can still browse the Manual Sky Map and Celestial Archive. Enable the camera later in Settings."
      );
      openManualFallback();
    } catch {
      Alert.alert(
        "Camera access unavailable",
        "Chronaura could not open the native permission prompt. The Manual Sky Map is available instead."
      );
      openManualFallback();
    }
  }

  if (permission?.granted) {
    return (
      <View style={styles.root}>
        <LogoMark size={86} showWordmark showDescriptor centered />
        <Text style={styles.body}>Camera access is already enabled.</Text>
        <Pressable style={styles.button} onPress={onGranted}>
          <Text style={styles.buttonText}>Open Sky Lens</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={openManualFallback}>
          <Text style={styles.secondaryText}>Open Manual Sky Map Instead</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LogoMark size={102} showWordmark showDescriptor centered />
      <Text style={styles.title}>Map the sky through your camera</Text>
      <Text style={styles.body}>
        Chronaura uses your camera to overlay stars, planets, constellations,
        and alignment guides onto your real sky view. Your camera is active only
        while Sky Lens is open. Nothing is saved unless you capture it.
      </Text>
      <Pressable style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue to Camera Access</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={openManualFallback}>
        <Text style={styles.secondaryText}>Use Manual Sky Map</Text>
      </Pressable>
      <Pressable style={styles.textButton} onPress={onDenied}>
        <Text style={styles.textButtonText}>Not Now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ChronauraColors.black,
    padding: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: "#FFF",
    fontSize: 31,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1,
    marginTop: 28
  },
  body: {
    color: ChronauraColors.silver,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 24
  },
  button: {
    backgroundColor: ChronauraColors.gold2,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 18,
    width: "100%",
    alignItems: "center"
  },
  buttonText: { color: "#17100A", fontWeight: "900" },
  secondary: {
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.28)",
    backgroundColor: "rgba(212,175,55,0.10)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    width: "100%",
    alignItems: "center",
    marginTop: 12
  },
  secondaryText: { color: "#FFF", fontWeight: "800" },
  textButton: { marginTop: 12, padding: 10 },
  textButtonText: { color: ChronauraColors.silver, fontWeight: "800" }
});
