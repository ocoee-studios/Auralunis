import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import * as Haptics from "expo-haptics";
import { Accelerometer, Gyroscope, Magnetometer } from "expo-sensors";
import { AuraLunisColors } from "@/theme/tokens";

type DiagnosticStatus = "idle" | "pass" | "warn" | "fail";

type DiagnosticState = {
  status: DiagnosticStatus;
  detail: string;
};

type DiagnosticKey =
  | "location"
  | "heading"
  | "photos"
  | "accelerometer"
  | "gyroscope"
  | "magnetometer"
  | "haptics";

const initialState: Record<DiagnosticKey, DiagnosticState> = {
  location: { status: "idle", detail: "Not checked yet." },
  heading: { status: "idle", detail: "Not checked yet." },
  photos: { status: "idle", detail: "Not checked yet." },
  accelerometer: { status: "idle", detail: "Not checked yet." },
  gyroscope: { status: "idle", detail: "Not checked yet." },
  magnetometer: { status: "idle", detail: "Not checked yet." },
  haptics: { status: "idle", detail: "Not checked yet." }
};

function statusLabel(status: DiagnosticStatus) {
  switch (status) {
    case "pass":
      return "PASS";
    case "warn":
      return "CHECK";
    case "fail":
      return "FAIL";
    default:
      return "NOT RUN";
  }
}

function statusStyle(status: DiagnosticStatus) {
  switch (status) {
    case "pass":
      return styles.statusPass;
    case "warn":
      return styles.statusWarn;
    case "fail":
      return styles.statusFail;
    default:
      return styles.statusIdle;
  }
}

function DiagnosticRow({ title, value }: { title: string; value: DiagnosticState }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowCopy}>{value.detail}</Text>
      </View>
      <Text style={[styles.status, statusStyle(value.status)]}>
        {statusLabel(value.status)}
      </Text>
    </View>
  );
}

export function DeviceDiagnosticsPanel() {
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();
  const [diagnostics, setDiagnostics] =
    useState<Record<DiagnosticKey, DiagnosticState>>(initialState);
  const [running, setRunning] = useState(false);

  function setResult(key: DiagnosticKey, status: DiagnosticStatus, detail: string) {
    setDiagnostics((previous) => ({
      ...previous,
      [key]: { status, detail }
    }));
  }

  async function refreshPermissionStatus() {
    setRunning(true);

    try {
      const [locationStatus, photoStatus, servicesEnabled] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        MediaLibrary.getPermissionsAsync(true),
        Location.hasServicesEnabledAsync()
      ]);

      setResult(
        "location",
        locationStatus.granted && servicesEnabled ? "pass" : "warn",
        locationStatus.granted
          ? servicesEnabled
            ? "Foreground location permission granted and location services enabled."
            : "Foreground permission is granted, but device location services are off."
          : "Foreground location permission has not been granted yet."
      );

      setResult(
        "photos",
        photoStatus.granted ? "pass" : "warn",
        photoStatus.granted
          ? "Photo-save permission granted."
          : "Photo-save permission has not been granted yet."
      );
    } catch {
      setResult("location", "fail", "Permission status could not be read on this device.");
    } finally {
      setRunning(false);
    }
  }

  async function requestLocation() {
    try {
      const result = await requestLocationPermission();
      const servicesEnabled = await Location.hasServicesEnabledAsync();

      setResult(
        "location",
        result.granted && servicesEnabled ? "pass" : "warn",
        result.granted
          ? servicesEnabled
            ? "Foreground location permission granted and services enabled."
            : "Permission granted, but device location services are off."
          : "Location permission declined. Manual Sky Map remains available."
      );
    } catch {
      setResult("location", "fail", "Location permission prompt could not open.");
    }
  }

  async function requestPhotoSave() {
    try {
      const result = await MediaLibrary.requestPermissionsAsync(true);
      setResult(
        "photos",
        result.granted ? "pass" : "warn",
        result.granted
          ? "Photo-save permission granted."
          : "Photo-save permission declined. Captures can stay inside the app only."
      );
    } catch {
      setResult("photos", "fail", "Photo-save permission prompt could not open.");
    }
  }

  async function testHeading() {
    try {
      const permission =
        locationPermission?.granted
          ? locationPermission
          : await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        setResult(
          "heading",
          "warn",
          "Heading test skipped because location permission is not enabled."
        );
        return;
      }

      const heading = await Location.getHeadingAsync();
      const selectedHeading =
        heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;

      setResult(
        "heading",
        heading.accuracy >= 2 ? "pass" : "warn",
        `Heading ${selectedHeading.toFixed(1)}° · calibration accuracy ${heading.accuracy}.`
      );
    } catch {
      setResult(
        "heading",
        "fail",
        "Heading could not be read. Try the figure-eight calibration outdoors."
      );
    }
  }

  async function testMotionSensors() {
    setRunning(true);

    try {
      const [accelerometer, gyroscope, magnetometer] = await Promise.all([
        Accelerometer.isAvailableAsync(),
        Gyroscope.isAvailableAsync(),
        Magnetometer.isAvailableAsync()
      ]);

      setResult(
        "accelerometer",
        accelerometer ? "pass" : "warn",
        accelerometer ? "Accelerometer is available." : "Accelerometer is not available on this device."
      );
      setResult(
        "gyroscope",
        gyroscope ? "pass" : "warn",
        gyroscope ? "Gyroscope is available." : "Gyroscope is not available on this device."
      );
      setResult(
        "magnetometer",
        magnetometer ? "pass" : "warn",
        magnetometer ? "Magnetometer is available." : "Magnetometer is not available on this device."
      );
    } catch {
      setResult("accelerometer", "fail", "Motion sensor check failed.");
      setResult("gyroscope", "fail", "Motion sensor check failed.");
      setResult("magnetometer", "fail", "Motion sensor check failed.");
    } finally {
      setRunning(false);
    }
  }

  async function testHaptic() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setResult("haptics", "pass", "Success haptic requested. Confirm that you felt the vibration.");
    } catch {
      setResult("haptics", "warn", "Haptic feedback is unavailable in this environment or device mode.");
    }
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>NATIVE DEVICE QA</Text>
      <Text style={styles.title}>Device Diagnostics</Text>
      <Text style={styles.copy}>
        Run this on a physical iPhone before outdoor Sky Lens testing. Permission
        prompts are intentionally separate so the user stays in control.
      </Text>

      <DiagnosticRow title="Location permission" value={diagnostics.location} />
      <DiagnosticRow title="Compass heading" value={diagnostics.heading} />
      <DiagnosticRow title="Photo-save permission" value={diagnostics.photos} />
      <DiagnosticRow title="Accelerometer" value={diagnostics.accelerometer} />
      <DiagnosticRow title="Gyroscope" value={diagnostics.gyroscope} />
      <DiagnosticRow title="Magnetometer" value={diagnostics.magnetometer} />
      <DiagnosticRow title="Haptics" value={diagnostics.haptics} />

      <Pressable style={styles.primary} onPress={refreshPermissionStatus}>
        <Text style={styles.primaryText}>{running ? "Checking…" : "Refresh Permission Status"}</Text>
      </Pressable>

      <View style={styles.buttonGrid}>
        <Pressable style={styles.secondary} onPress={requestLocation}>
          <Text style={styles.secondaryText}>Request Location</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={requestPhotoSave}>
          <Text style={styles.secondaryText}>Request Photo Save</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={testHeading}>
          <Text style={styles.secondaryText}>Test Compass</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={testMotionSensors}>
          <Text style={styles.secondaryText}>Test Motion Sensors</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={testHaptic}>
          <Text style={styles.secondaryText}>Test Haptic</Text>
        </Pressable>
      </View>

      <Text style={styles.footnote}>
        A PASS here confirms the device APIs responded. It does not prove astronomical
        overlay accuracy. Run the outdoor object-by-object test log after this panel passes.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 22,
    padding: 14,
    marginTop: 10,
    backgroundColor: "rgba(98,207,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(98,207,255,0.18)"
  },
  eyebrow: { color: AuraLunisColors.gold2, fontSize: 10, letterSpacing: 2.4, fontWeight: "900" },
  title: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 7 },
  copy: { color: AuraLunisColors.silver, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  rowTitle: { color: "#FFF", fontSize: 14, fontWeight: "800" },
  rowCopy: { color: AuraLunisColors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  status: { minWidth: 58, overflow: "hidden", borderRadius: 999, paddingVertical: 5, paddingHorizontal: 7, textAlign: "center", fontSize: 10, fontWeight: "900" },
  statusIdle: { color: AuraLunisColors.silver, backgroundColor: "rgba(255,255,255,0.06)" },
  statusPass: { color: "#17100A", backgroundColor: AuraLunisColors.green },
  statusWarn: { color: "#17100A", backgroundColor: AuraLunisColors.orange },
  statusFail: { color: "#FFF", backgroundColor: "rgba(255,105,105,0.72)" },
  primary: { borderRadius: 16, marginTop: 14, paddingVertical: 13, alignItems: "center", backgroundColor: AuraLunisColors.gold2 },
  primaryText: { color: "#17100A", fontWeight: "900" },
  buttonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  secondary: { width: "48%", borderRadius: 15, paddingVertical: 11, paddingHorizontal: 8, alignItems: "center", backgroundColor: "rgba(217,168,78,0.10)", borderWidth: 1, borderColor: "rgba(217,168,78,0.20)" },
  secondaryText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  footnote: { color: AuraLunisColors.muted, fontSize: 11, lineHeight: 16, marginTop: 12 }
});
