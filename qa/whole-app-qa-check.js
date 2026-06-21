const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const failures = [];
const passes = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function check(label, condition, detail = "") {
  if (condition) {
    passes.push({ label, detail });
    console.log("PASS", label);
  } else {
    failures.push({ label, detail });
    console.error("FAIL", label, detail);
  }
}

const required = [
  "App.tsx",
  "src/navigation/RootTabs.tsx",
  "src/screens/HomeScreen.tsx",
  "src/screens/SkyScreen.tsx",
  "src/screens/WatchScreen.tsx",
  "src/screens/LearnScreen.tsx",
  "src/screens/SettingsScreen.tsx",
  "src/features/paywall/TrialLaunchModal.tsx",
  "src/features/permissions/SkyLensPermissionGate.tsx",
  "src/features/sky-lens/ManualSkyMap.tsx",
  "src/features/sky-lens/SkyLensPlaceholder.tsx",
  "src/features/archive/DeepSkyCatalog.ts",
  "src/features/learn/LearnCatalog.ts",
  "src/features/watch/WatchFaceCatalog.ts",
  "src/state/AuraLunisSettingsContext.tsx",
  "src/state/AuraLunisVaultContext.tsx",
  "src/components/LogoMark.tsx",
  "assets/logo/chronaura-stardust-emblem.png",
  "assets/logo/auralunis-app-icon.png",
  "assets/logo/auralunis-splash.png",
  "docs/ABOUT_US_SETTINGS_SPEC.md"
];

for (const rel of required) check(`required file: ${rel}`, exists(rel));

const app = read("App.tsx");
check("three-tier paywall rendered outside NavigationContainer", app.indexOf("</NavigationContainer>") < app.indexOf("<ThreeTierPaywallModal"));
check("first-open onboarding storage key", app.includes("chronaura.onboarding.seen"));
check("paywall purchase and restore boundaries", app.includes("handlePurchaseTier") && app.includes("handleRestorePurchases"));
check("Sovereign waitlist boundary", app.includes("handleJoinSovereignWaitlist"));

const tabs = read("src/navigation/RootTabs.tsx");
const approvedTabs = ["Home", "Sky", "Watch", "Learn", "Settings"];
for (const tab of approvedTabs) check(`active tab: ${tab}`, tabs.includes(`<Tab.Screen name="${tab}"`));
check("no legacy active tabs", !tabs.includes('<Tab.Screen name="Now"') && !tabs.includes('<Tab.Screen name="Explore"'));

const home = read("src/screens/HomeScreen.tsx");
for (const term of ["Living Astrolabe", "Cosmic Notes", "Save Note to Vault", "LifeSky Timeline", "Astral Sound Bath", "Cosmic Steering Wheel"]) {
  check(`Home: ${term}`, home.includes(term));
}

const sky = read("src/screens/SkyScreen.tsx");
for (const term of ["AuraLunis Sky Lens", "Manual Sky Map", "Find Mode", "X-Ray Lens + Birth Sky Overlay", "Milky Way / Galaxy Mode", "featuredDeepSkyObjects", "Celestial Archive"]) {
  check(`Sky: ${term}`, sky.includes(term));
}

const gate = read("src/features/permissions/SkyLensPermissionGate.tsx");
check("Sky camera hook is named useCameraPermissions", gate.includes('import { useCameraPermissions } from "expo-camera";') && !gate.includes("Camera.useCameraPermissions()"));
check("Sky permission failure has manual fallback", gate.includes("try {") && gate.includes("catch {") && gate.includes("openManualFallback"));

const watch = read("src/screens/WatchScreen.tsx");
for (const term of ["WATCH APP FACE GALLERY", "THEME SELECTOR", "COMPLICATION PICKER", "Restore Signature Curated Setup", "WATCH_COMPLICATION_LIMIT"]) {
  check(`Watch: ${term}`, watch.includes(term));
}
const catalog = read("src/features/watch/WatchFaceCatalog.ts");
for (const term of ["living_astrolabe", "moon_keeper", "tonights_sky", "deep_sky_portal", "daily_alignment", "minimal_auralunis", "sovereign_sigil"]) {
  check(`Watch face: ${term}`, catalog.includes(term));
}
for (const term of ["moon_phase", "tonight_score", "moonrise_countdown", "next_event", "visible_planet", "daily_alignment", "tonights_ritual", "sky_lens_shortcut", "sound_bath_shortcut", "auralunis_logo"]) {
  check(`Watch complication: ${term}`, catalog.includes(term));
}

const learn = read("src/screens/LearnScreen.tsx");
for (const term of ["SolarSystemLiveVisual", "MoonPhaseLiveVisual", "ConstellationIgnitionVisual", "StarBrightnessVisual", "DeepSkyGlowVisual", "MilkyWayBandVisual", "ThirtyNightsProgressVisual", "Teacher Mode"]) {
  check(`Learn: ${term}`, learn.includes(term));
}

const settings = read("src/screens/SettingsScreen.tsx");
for (const term of ["Subscription", "Appearance", "Notifications + Alarms", "Sky Lens", "Privacy + Data", "Watch + Widgets", "Audio + Learning", "Help + About", "About Us"]) {
  check(`Settings: ${term}`, settings.includes(term));
}
check("Settings About Us paragraph", settings.includes("AuraLunis was created to turn the night sky into a living, personal experience."));
check("Settings About card clean style reference", settings.includes("<View style={styles.aboutCard}>"));

const settingsContext = read("src/state/AuraLunisSettingsContext.tsx");
check("Settings persisted with AsyncStorage", settingsContext.includes("AsyncStorage"));
check("Settings local data sanitization", settingsContext.includes("sanitizeSettings") && settingsContext.includes("sanitizeWatchComplications"));
check("Watch settings max four sanitized", settingsContext.includes("MAX_WATCH_COMPLICATIONS = 4"));

const vaultContext = read("src/state/AuraLunisVaultContext.tsx");
check("Vault persisted with AsyncStorage", vaultContext.includes("AsyncStorage"));
check("Vault local data sanitization", vaultContext.includes("sanitizeVaultItems"));

const featureCard = read("src/components/FeatureCard.tsx");
check("Haptics cannot block FeatureCard action", featureCard.includes("selectionAsync().catch") && featureCard.indexOf("selectionAsync().catch") < featureCard.indexOf("onPress?.()"));

const shell = read("src/components/ScreenShell.tsx");
check("Theme gradient tuple preserved", shell.includes("colors={palette.gradient}"));

const appConfig = JSON.parse(read("app.json"));
check("App icon configured", appConfig.expo.icon === "./assets/logo/auralunis-app-icon.png");
check("Splash configured", appConfig.expo.splash && appConfig.expo.splash.image === "./assets/logo/auralunis-splash.png");

const allTsFiles = [];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) allTsFiles.push(full);
  }
}
collect(path.join(root, "src"));
const unsupportedWeights = [];
for (const full of allTsFiles) {
  const text = fs.readFileSync(full, "utf8");
  if (text.includes('fontWeight: "850"')) unsupportedWeights.push(path.relative(root, full));
}
check("No unsupported fontWeight 850 values", unsupportedWeights.length === 0, unsupportedWeights.join(", "));

if (failures.length) {
  console.error(`Whole-app QA failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log(`AuraLunis whole-app QA passed with ${passes.length} checks.`);
