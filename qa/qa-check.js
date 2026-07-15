const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// Static QA audits the files and scaffolds that the SHIPPED app actually contains.
//
// It used to demand a set of never-built files (a Watch-face gallery, "future" preview
// screens, extra Aura Pro panels, an old `chronaura-*` logo asset) and to require a
// `Watch` navigation tab. None of those exist on `main` or on any branch — they were
// aspirational entries from an abandoned plan, some using the project's OLD name. The
// check then `readFileSync`'d several of those missing files UNCONDITIONALLY, so a single
// absent file crashed the whole run with ENOENT instead of reporting a clean FAIL — which
// is why the Branch Audit kept going red on unrelated commits.
//
// This audit now reflects the real app: a five-tab shell of Home · Sky · Learn · Vault ·
// Settings, the RevenueCat/paywall stack, the Sky Lens scaffold, and the device-QA panel.
// Every file read is guarded, so a genuinely missing file reports FAIL and the script
// still runs to completion instead of crashing.

let failed = false;

function fail(label, detail = "") {
  console.error("FAIL", label, detail);
  failed = true;
}

function pass(label) {
  console.log("PASS", label);
}

// Read a required file. If missing, record a clean FAIL and return null — NEVER throw.
// Callers must null-check before inspecting contents.
function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    fail(file, "missing");
    return null;
  }
  return fs.readFileSync(full, "utf8");
}

// ── 1. Required files that genuinely ship in the app ────────────────────────────
const required = [
  "App.tsx",
  "src/navigation/RootTabs.tsx",
  "src/screens/HomeScreen.tsx",
  "src/screens/SkyScreen.tsx",
  "src/screens/LearnScreen.tsx",
  "src/screens/SettingsScreen.tsx",
  "docs/ABOUT_US_SETTINGS_SPEC.md",
  "scripts/native-device-preflight.js",
  "qa/PAYWALL_REVENUECAT_QA_CHECKLIST.md",
  "docs/REVENUECAT_THREE_TIER_SETUP.md",
  "scripts/revenuecat-preflight.js",
  "docs/AURA_PRO_UTILITY_EXPANSION.md",
  "scripts/aura-pro-expansion-preflight.js",
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
  "src/components/LogoMark.tsx",
  "src/components/ScreenShell.tsx",
  "src/features/sky-lens/ManualSkyMap.tsx",
  "src/features/archive/DeepSkyCatalog.ts",
  "src/state/AuraLunisSettingsContext.tsx",
  "src/state/AuraLunisVaultContext.tsx",
  "src/data/brand.ts",
  "assets/logo/auralunis-app-icon.png",
  "assets/logo/auralunis-splash.png",
  "app.json",
  "package.json",
];

for (const file of required) {
  if (fs.existsSync(path.join(root, file))) pass(file);
  else fail(file, "missing");
}

// ── 2. Navigation: the real five-tab shell ──────────────────────────────────────
const tabs = read("src/navigation/RootTabs.tsx");
if (tabs) {
  const expectedTabOrder = [
    '<Tab.Screen name="Home"',
    '<Tab.Screen name="Sky"',
    '<Tab.Screen name="Learn"',
    '<Tab.Screen name="Vault"',
    '<Tab.Screen name="Settings"',
  ];
  for (const tab of expectedTabOrder) {
    if (!tabs.includes(tab)) fail("navigation", `missing ${tab}`);
  }
  if (tabs.includes('<Tab.Screen name="Now"') || tabs.includes('<Tab.Screen name="Explore"')) {
    fail("navigation", "legacy active tabs still present");
  } else {
    pass("approved five-tab navigation");
  }
}

// (Sky Lens is a camera-free planetarium — no camera-permission gate to audit.)

// ── 4. Sky screen scaffold ──────────────────────────────────────────────────────
const sky = read("src/screens/SkyScreen.tsx");
if (sky) {
  for (const term of ["ManualSkyMap", "featuredDeepSkyObjects", "Milky Way / Galaxy Mode"]) {
    if (!sky.includes(term)) fail("SkyScreen", `missing ${term}`);
  }
  pass("SkyScreen deep-sky/manual-map scaffold");
}

// ── 5. Persistence + About Us ───────────────────────────────────────────────────
const settingsContext = read("src/state/AuraLunisSettingsContext.tsx");
if (settingsContext) {
  if (!settingsContext.includes("AsyncStorage")) fail("settings persistence", "AsyncStorage missing");
  else pass("settings persistence");
}

const settingsScreen = read("src/screens/SettingsScreen.tsx");
if (settingsScreen) {
  for (const term of [
    "About Us",
    "AuraLunis was created to turn the night sky into a living, personal experience. Blending astronomy, thoughtful design, and quiet daily rituals, we help you slow down, look up, and feel more connected to the universe around you.",
  ]) {
    if (!settingsScreen.includes(term)) fail("SettingsScreen", `missing ${term}`);
  }
  pass("settings about us section");
}

const vaultContext = read("src/state/AuraLunisVaultContext.tsx");
if (vaultContext) {
  if (!vaultContext.includes("AsyncStorage")) fail("vault persistence", "AsyncStorage missing");
  else pass("prototype vault persistence");
}

// ── 6. Device diagnostics scaffold ──────────────────────────────────────────────
const deviceDiagnostics = read("src/features/device-qa/DeviceDiagnosticsPanel.tsx");
if (deviceDiagnostics) {
  for (const term of [
    "requestLocationPermission",
    "requestPermissionsAsync",
    "getHeadingAsync",
    "Accelerometer.isAvailableAsync",
    "Gyroscope.isAvailableAsync",
    "Magnetometer.isAvailableAsync",
    "notificationAsync",
  ]) {
    if (!deviceDiagnostics.includes(term)) fail("DeviceDiagnosticsPanel", `missing ${term}`);
  }
  pass("native device diagnostics scaffold");
}

// ── 7. Only supported font weights (RN can't render "850") ──────────────────────
const allSourceFiles = [];
function collect(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) allSourceFiles.push(full);
  }
}
collect(path.join(root, "src"));

let fontWeightBad = false;
for (const full of allSourceFiles) {
  if (fs.readFileSync(full, "utf8").includes('fontWeight: "850"')) {
    fail("fontWeight", path.relative(root, full));
    fontWeightBad = true;
  }
}
if (!fontWeightBad) pass("supported font weights");

// ── 8. App icon + splash config ─────────────────────────────────────────────────
const appJsonRaw = read("app.json");
if (appJsonRaw) {
  const app = JSON.parse(appJsonRaw);
  if (app.expo.icon !== "./assets/logo/auralunis-app-icon.png") fail("app icon config");
  else pass("app icon config");
  if (!app.expo.splash || app.expo.splash.image !== "./assets/logo/auralunis-splash.png") fail("splash config");
  else pass("splash config");
}

if (failed) process.exit(1);
console.log("AuraLunis five-tab static QA passed.");
