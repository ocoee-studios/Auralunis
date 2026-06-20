// Centralized permission handling with graceful denial recovery.
import { Alert, Linking, Platform } from "react-native";

type PermissionModule = { requestForegroundPermissionsAsync: () => Promise<{ status: string }> };
type CameraModule = { requestCameraPermissionsAsync: () => Promise<{ status: string }> };
type NotifModule = { requestPermissionsAsync: () => Promise<{ status: string }> };

let Location: PermissionModule | null = null;
let Camera: CameraModule | null = null;
let Notifications: NotifModule | null = null;

try { Location = require("expo-location") as PermissionModule; } catch {}
try { Camera = require("expo-camera") as CameraModule; } catch {}
try { Notifications = require("expo-notifications") as NotifModule; } catch {}

function openSettings() {
  if (Platform.OS === "ios") Linking.openURL("app-settings:");
}

async function requestWithFallback(
  name: string,
  requestFn: () => Promise<{ status: string }>
): Promise<boolean> {
  try {
    const result = await requestFn();
    if (result.status === "granted") return true;

    Alert.alert(
      `${name} Access Needed`,
      `AuraLunis needs ${name.toLowerCase()} access for this feature. You can enable it in Settings.`,
      [
        { text: "Not Now", style: "cancel" },
        { text: "Open Settings", onPress: openSettings }
      ]
    );
    return false;
  } catch {
    return false;
  }
}

export async function requestLocation(): Promise<boolean> {
  if (!Location) return false;
  return requestWithFallback("Location", () => Location!.requestForegroundPermissionsAsync());
}

export async function requestCamera(): Promise<boolean> {
  if (!Camera) return false;
  return requestWithFallback("Camera", () => Camera!.requestCameraPermissionsAsync());
}

export async function requestNotifications(): Promise<boolean> {
  if (!Notifications) return false;
  return requestWithFallback("Notifications", () => Notifications!.requestPermissionsAsync());
}
