const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const required = [
  "App.tsx",
  "src/navigation/RootTabs.tsx",
  "src/screens/HomeScreen.tsx",
  "src/screens/SkyScreen.tsx",
  "src/screens/WatchScreen.tsx",
  "src/features/watch/WatchFaceCatalog.ts",
  "native-handoff/watchos/README_WATCH_FACE_GALLERY.md",
  "docs/ABOUT_US_SETTINGS_SPEC.md",
  "scripts/native-device-preflight.js",
  "qa/PAYWALL_REVENUECAT_QA_CHECKLIST.md",
  "docs/REVENUECAT_THREE_TIER_SETUP.md",
  "scripts/revenuecat-preflight.js",
  "docs/AURA_PRO_UTILITY_EXPANSION.md",
  "scripts/aura-pro-expansion-preflight.js",
  "src/features/future/DeskObeliskPreview.tsx",
  "src/features/future/SovereignSigilPreview.tsx",
  "src/features/aura-pro/TimeScrubMatrixPanel.tsx",
  "src/features/aura-pro/AstrophotographyPredictorPanel.tsx",
  "src/features/aura-pro/SatelliteThermalOverlayPanel.tsx",
  "src/services/RevenueCatService.ts",
  "src/features/paywall/MonetizationCatalog.ts",
  "src/features/paywall/ThreeTierPaywallModal.tsx",
  "eas.json",
  "qa/SKY_LENS_OUTDOOR_TEST_LOG_TEMPLATE.md",
  "qa/NATIVE_DEVICE_QA_CHECKLIST.md",
  "docs/EAS_INTERNAL_BUILD_HANDOFF.md",
  "docs/NATIVE_DEVICE_FOLLOW_UP_RUNBOOK.md",
  "src/features/device-qa/DeviceDiagnosticsPanel.tsx",
  "src/screens/LearnScreen.tsx",
  "src/screens/SettingsScreen.tsx",
  "src/components/LogoMark.tsx",
  "src/components/ScreenShell.tsx",
  "src/features/paywall/TrialLaunchModal.tsx",
  "src/features/permissions/SkyLensPermissionGate.tsx",
  "src/features/sky-lens/ManualSkyMap.tsx",
  "src/features/archive/DeepSkyCatalog.ts",
  "src/state/ChronauraSettingsContext.tsx",
  "src/state/ChronauraVaultContext.tsx",
  "src/data/brand.ts",
  "src/data/sourceOfTruth.ts",
  "assets/logo/chronaura-stardust-emblem.png",
  "assets/logo/chronaura-stardust-lockup.png",
  "assets/logo/chronaura-app-icon.png",
  "assets/logo/chronaura-splash.png",
  "app.json",
  "package.json"
];

let failed = false;

function fail(label, detail = "") {
  console.error("FAIL", label, detail);
  failed = true;
}

function pass(label) {
  console.log("PASS", label);
}

for (const file of required) {
  const full = path.join(root, file);

  if (!fs.existsSync(full)) {
    fail(file, "missing");
  } else {
    pass(file);
  }
}

const tabs = fs.readFileSync(path.join(root, "src/navigation/RootTabs.tsx"), "utf8");
const expectedTabOrder = [
  '<Tab.Screen name="Home"',
  '<Tab.Screen name="Sky"',
  '<Tab.Screen name="Watch"',
  '<Tab.Screen name="Learn"',
  '<Tab.Screen name="Settings"'
];

for (const tab of expectedTabOrder) {
  if (!tabs.includes(tab)) fail("navigation", `missing ${tab}`);
}
if (tabs.includes('<Tab.Screen name="Now"') || tabs.includes('<Tab.Screen name="Explore"')) {
  fail("navigation", "legacy active tabs still present");
} else {
  pass("approved five-tab navigation");
}

const gate = fs.readFileSync(path.join(root, "src/features/permissions/SkyLensPermissionGate.tsx"), "utf8");
if (!gate.includes('import { useCameraPermissions } from "expo-camera";')) {
  fail("SkyLensPermissionGate", "named useCameraPermissions hook missing");
} else if (gate.includes("Camera.useCameraPermissions()")) {
  fail("SkyLensPermissionGate", "legacy Camera.useCameraPermissions remains");
} else {
  pass("expo-camera permission hook");
}

const sky = fs.readFileSync(path.join(root, "src/screens/SkyScreen.tsx"), "utf8");
for (const term of ["ManualSkyMap", "featuredDeepSkyObjects", "Milky Way / Galaxy Mode"]) {
  if (!sky.includes(term)) fail("SkyScreen", `missing ${term}`);
}
pass("SkyScreen deep-sky/manual-map scaffold");


const watchScreen = fs.readFileSync(path.join(root, "src/screens/WatchScreen.tsx"), "utf8");
const watchCatalog = fs.readFileSync(path.join(root, "src/features/watch/WatchFaceCatalog.ts"), "utf8");
for (const term of [
  "WATCH APP FACE GALLERY",
  "THEME SELECTOR",
  "COMPLICATION PICKER",
  "Restore Signature Curated Setup"
]) {
  if (!watchScreen.includes(term)) fail("WatchScreen", `missing ${term}`);
}
for (const term of [
  "living_astrolabe",
  "moon_keeper",
  "tonights_sky",
  "deep_sky_portal",
  "daily_alignment",
  "minimal_chronaura",
  "sovereign_sigil",
  "moon_phase",
  "tonight_score",
  "sky_lens_shortcut"
]) {
  if (!watchCatalog.includes(term)) fail("WatchFaceCatalog", `missing ${term}`);
}
pass("watch face gallery, theme selector, and complication picker");

const settingsContext = fs.readFileSync(path.join(root, "src/state/ChronauraSettingsContext.tsx"), "utf8");
if (!settingsContext.includes("AsyncStorage")) fail("settings persistence", "AsyncStorage missing");
else pass("settings persistence");


const settingsScreen = fs.readFileSync(path.join(root, "src/screens/SettingsScreen.tsx"), "utf8");
for (const term of [
  "About Us",
  "Chronaura was created to turn the night sky into a living, personal experience. Blending astronomy, thoughtful design, and quiet daily rituals, we help you slow down, look up, and feel more connected to the universe around you."
]) {
  if (!settingsScreen.includes(term)) fail("SettingsScreen", `missing ${term}`);
}
pass("settings about us section");

const vaultContext = fs.readFileSync(path.join(root, "src/state/ChronauraVaultContext.tsx"), "utf8");
if (!vaultContext.includes("AsyncStorage")) fail("vault persistence", "AsyncStorage missing");
else pass("prototype vault persistence");


const deviceDiagnostics = fs.readFileSync(
  path.join(root, "src/features/device-qa/DeviceDiagnosticsPanel.tsx"),
  "utf8"
);
for (const term of [
  "requestCameraPermission",
  "requestLocationPermission",
  "requestPermissionsAsync",
  "getHeadingAsync",
  "Accelerometer.isAvailableAsync",
  "Gyroscope.isAvailableAsync",
  "Magnetometer.isAvailableAsync",
  "notificationAsync"
]) {
  if (!deviceDiagnostics.includes(term)) {
    fail("DeviceDiagnosticsPanel", `missing ${term}`);
  }
}
pass("native device diagnostics scaffold");

const allSourceFiles = [];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) allSourceFiles.push(full);
  }
}
collect(path.join(root, "src"));

for (const full of allSourceFiles) {
  const text = fs.readFileSync(full, "utf8");
  if (text.includes('fontWeight: "850"')) {
    fail("fontWeight", path.relative(root, full));
  }
}
if (!failed) pass("supported font weights");

const app = JSON.parse(fs.readFileSync(path.join(root, "app.json"), "utf8"));
if (app.expo.icon !== "./assets/logo/chronaura-app-icon.png") fail("app icon config");
else pass("app icon config");
if (!app.expo.splash || app.expo.splash.image !== "./assets/logo/chronaura-splash.png") fail("splash config");
else pass("splash config");

if (failed) process.exit(1);
console.log("Chronaura approved five-tab static QA passed.");
