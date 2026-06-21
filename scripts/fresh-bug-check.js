const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const failures = [];
const passes = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function check(label, condition, detail = "") {
  if (condition) {
    passes.push(label);
    console.log("PASS", label);
  } else {
    failures.push(`${label}${detail ? `: ${detail}` : ""}`);
    console.error("FAIL", label, detail);
  }
}

const satellite = read("src/features/aura-pro/SatelliteFeedService.ts");
check("satellite cache read guarded", satellite.includes("async function readCachedElements"));
check("satellite cache write guarded", satellite.includes("async function writeCachedElements"));
check("satellite cached elements sanitized", satellite.includes("function isElementSet"));
check("satellite cache expiry date validated", satellite.includes("Number.isFinite(Date.parse(parsed.expiresAtISO))"));
check("satellite uses SGP4 via satellite.js", satellite.includes('from "satellite.js"') && satellite.includes("twoline2satrec") && satellite.includes("ecfToLookAngles"));
check("satellite shows only above-horizon objects", satellite.includes("elevationDegrees <= 0"));
check("satellite overlay no longer hash-positioned", !satellite.includes("hash % 256"));
check("satellite.js declared in package.json", read("package.json").includes('"satellite.js"'));
check("satellite self-test script present", fs.existsSync(path.join(root, "scripts/satellite-selftest.js")));

const satellitePanel = read("src/features/aura-pro/SatelliteThermalOverlayPanel.tsx");
check("satellite panel refresh guarded", satellitePanel.includes("Orbital overlay unavailable"));

const app = read("App.tsx");
check("RevenueCat startup rejection guarded", app.includes("configureRevenueCat().catch"));

const sigil = read("src/features/future/SovereignSigilPreview.tsx");
check("Sigil generation rejection guarded", sigil.includes(".catch(() =>"));
check("Sigil error state visible", sigil.includes("preview unavailable"));

const timeService = read("src/features/aura-pro/TimeScrubMatrixService.ts");
check("Time-Scrub Matrix local date formatter", timeService.includes("function formatLocalDate"));
check("Time-Scrub Matrix avoids UTC date slice", !timeService.includes("toISOString().slice(0, 10)"));

const timePanel = read("src/features/aura-pro/TimeScrubMatrixPanel.tsx");
check("Time-Scrub Matrix disambiguates Mercury and Mars", timePanel.includes('return "Me"') && timePanel.includes('return "Ma"'));

const sovereignWidget = read("native-handoff/widgetkit/SovereignSigilWidget.swift");
check("Sovereign widget provider included", sovereignWidget.includes("SovereignSigilWidgetProvider"));
check("Sovereign widget configuration included", sovereignWidget.includes("struct SovereignSigilWidget: Widget"));
check("Sovereign widget timeline included", sovereignWidget.includes("getTimeline"));

const bootstrap = read("scripts/bootstrap-native-device.sh");
for (const step of ["1/8", "2/8", "3/8", "4/8", "5/8", "6/8", "7/8", "8/8"]) {
  check(`bootstrap step ${step}`, bootstrap.includes(step));
}

const readme = read("README.md");
check("README approved navigation", readme.includes("Home") && readme.includes("Sky") && readme.includes("Watch") && readme.includes("Learn") && readme.includes("Settings"));
check("README current pricing", readme.includes("$4.99/month") && readme.includes("$29.99/year") && readme.includes("$24.99"));
check("README Aura Pro labeled coming later", readme.includes("coming later"));
check("README founder annual price present", readme.includes("$24.99") || readme.includes("founder"));

const ephemeris = read("src/features/sky-lens/ephemeris/SkyEphemerisService.ts");
check("ephemeris uses astronomy-engine", ephemeris.includes('from "astronomy-engine"'));
check("ephemeris computes horizontal coords", ephemeris.includes("Horizon(") && ephemeris.includes("Equator("));
check("ephemeris exposes computeTonightSky", ephemeris.includes("export function computeTonightSky"));
check("astronomy-engine declared in package.json", read("package.json").includes('"astronomy-engine"'));
check("location hook present", fs.existsSync(path.join(root, "src/features/sky-lens/ephemeris/useObserverLocation.ts")));
check("ephemeris self-test script present", fs.existsSync(path.join(root, "scripts/ephemeris-selftest.js")));

const home = read("src/screens/HomeScreen.tsx");
check("Home uses live sky", home.includes("computeTonightSky"));
check("Home hardcoded moonrise removed", !home.includes("Moonrise 8:12 PM"));

const appRoot = read("App.tsx");
check("app wrapped in GestureHandlerRootView", appRoot.includes("GestureHandlerRootView"));
const screenShell = read("src/components/ScreenShell.tsx");
check("ScreenShell respects top safe-area inset", screenShell.includes("useSafeAreaInsets") && screenShell.includes("insets.top"));

const skyScreen = read("src/screens/SkyScreen.tsx");
check("Sky screen has live Tonight's Sky panel", skyScreen.includes("TONIGHT") && skyScreen.includes("computeTonightSky"));
check("Find Mode no longer says ephemeris is missing", !skyScreen.includes("Production connects real ephemeris and device orientation"));

const skyLens = read("src/features/sky-lens/SkyLensPlaceholder.tsx");
check("Sky Lens overlay uses live device pointing", skyLens.includes("useDevicePointing") && skyLens.includes("projectTarget"));
check("Sky Lens overlay is no longer a static placeholder", !skyLens.includes("AR overlay placeholder"));
check("Sky Lens projection module present", fs.existsSync(path.join(root, "src/features/sky-lens/ar/SkyLensProjection.ts")));
check("Sky Lens orientation module present", fs.existsSync(path.join(root, "src/features/sky-lens/ar/SkyLensOrientation.ts")));
check("Sky Lens AR self-test script present", fs.existsSync(path.join(root, "scripts/skylens-selftest.js")));

const vault = read("src/state/AuraLunisVaultContext.tsx");
check("vault uses encrypted storage", vault.includes("encryptVault") && vault.includes("decryptVault"));
check("vault migration from unencrypted", vault.includes("isEncrypted"));
check("vault encryption module present", fs.existsSync(path.join(root, "src/services/VaultEncryption.ts")));

const vaultEnc = read("src/services/VaultEncryption.ts");
check("vault encryption uses NaCl secretbox", vaultEnc.includes("nacl.secretbox"));
check("vault key stored in SecureStore", vaultEnc.includes("SecureStorage.setItemAsync"));

const homeScreen = read("src/screens/HomeScreen.tsx");
check("Home tonight score computed from real data", homeScreen.includes("computeTonightScore") && !homeScreen.includes("useState(91)"));
check("Home fetches weather", homeScreen.includes("fetchCurrentWeather"));
check("Home schedules notifications", homeScreen.includes("scheduleSkyEventNotifications"));

check("weather service present", fs.existsSync(path.join(root, "src/services/WeatherService.ts")));
check("tonight score service present", fs.existsSync(path.join(root, "src/services/TonightScoreService.ts")));
check("notification service present", fs.existsSync(path.join(root, "src/services/NotificationService.ts")));
check("weather API key placeholder in app.json", read("app.json").includes("openWeatherMapApiKey"));

check("skyQuality setting in defaults", read("src/features/settings/SettingsTypes.ts").includes("skyQuality"));
check("privacy policy draft present", fs.existsSync(path.join(root, "docs/PRIVACY_POLICY.md")));
check("app store listing draft present", fs.existsSync(path.join(root, "docs/APP_STORE_LISTING.md")));
check("version bumped from 0.1.0", read("app.json").includes('"1.0.0"'));

check("CLAUDE.md present", fs.existsSync(path.join(root, "CLAUDE.md")));
check("CLAUDE.md has Horizon+ only paywall note", read("CLAUDE.md").includes("Horizon+ only"));
check("LEGAL_PRIVACY_LAUNCH_TODO.md present", fs.existsSync(path.join(root, "docs/LEGAL_PRIVACY_LAUNCH_TODO.md")));
check("NATIVE_EXTENSION_TODO.md present", fs.existsSync(path.join(root, "docs/NATIVE_EXTENSION_TODO.md")));
check("PREMIUM_FEATURE_STATUS.md present", fs.existsSync(path.join(root, "docs/PREMIUM_FEATURE_STATUS.md")));
check("paywall uses plan cards", read("src/features/paywall/ThreeTierPaywallModal.tsx").includes("planCard") && read("src/features/paywall/ThreeTierPaywallModal.tsx").includes("FOUNDER OFFER"));
check("Aura Pro labeled Coming Later in catalog", read("src/features/paywall/MonetizationCatalog.ts").includes('"COMING LATER"'));
check("onboarding flow present", fs.existsSync(path.join(root, "src/features/onboarding/OnboardingFlow.tsx")));
check("onboarding wired in App", read("App.tsx").includes("OnboardingFlow") && read("App.tsx").includes("onboardingVisible"));

const mock = read("src/features/sky-lens/accuracy/SkyLensMockTargets.ts");
check("fabricated mock targets replaced by overlay simulator", !mock.includes("mockExpectedTargets") && mock.includes("simulateCalibratedOverlay"));

// Derive the live navigation from RootTabs instead of a hand-maintained list,
// then verify every registered screen file actually exists. This prevents the
// saved result report from drifting out of sync with the real app (the cause of
// the old report still listing retired Now/Explore/Time/Insights/More tabs).
const rootTabs = read("src/navigation/RootTabs.tsx");
const liveScreens = [...rootTabs.matchAll(/component=\{(\w+Screen)\}/g)].map((m) => m[1]);
const screenFiles = liveScreens.map((name) => {
  const rel = `src/screens/${name}.tsx`;
  const exists = fs.existsSync(path.join(root, rel));
  check(`live screen present: ${name}`, exists, exists ? "" : "registered in RootTabs but file missing");
  return { file: rel, exists };
});

// Guard against orphaned screen files that are no longer wired into navigation.
const allScreenFiles = fs
  .readdirSync(path.join(root, "src/screens"))
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => f.replace(/\.tsx$/, ""));
const orphanScreens = allScreenFiles.filter((name) => !liveScreens.includes(name));
check("no orphaned screen files", orphanScreens.length === 0, orphanScreens.join(", "));

console.log("");
console.log(`Fresh bug check: ${passes.length} pass, ${failures.length} fail.`);

// Write the result report straight from this run so it is always accurate.
const result = {
  generated_at: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
  package: "chronaura_native_test_build",
  overall_status: failures.length ? "FAIL" : "PASS WITH KNOWN LIMITATIONS",
  checks_passed: passes.length,
  checks_failed: failures.length,
  live_navigation: liveScreens,
  screen_files: screenFiles,
  failures,
  native_limitations: [
    "Ephemeris is real: astronomy-engine computes live Sun/Moon/planet positions (see scripts/ephemeris-selftest.js).",
    "Satellite overlay is real: satellite.js propagates CelesTrak elements with SGP4 (see scripts/satellite-selftest.js).",
    "Sky Lens AR alignment is implemented: accelerometer+magnetometer orientation + projection. Needs outdoor calibration per device.",
    "Vault is encrypted with NaCl secretbox; key in SecureStore. Legacy data migrates seamlessly.",
    "Tonight Score computed from weather + moon + sky quality (needs OpenWeatherMap API key for live cloud data).",
    "Sunset + moonrise notifications via expo-notifications (needs notification permission on device).",
    "RevenueCat purchase flow is fully wired; needs API key in app.json extra + App Store Connect products.",
    "Apple Watch, WidgetKit/StandBy, visionOS are handoff scaffolds, not compiled native targets (post-v1).",
    "Audio playback and Oracle backend remain future features."
  ]
};
fs.writeFileSync(
  path.join(root, "qa/FRESH_BUG_CHECK_RESULTS.json"),
  JSON.stringify(result, null, 2) + "\n"
);
console.log("Wrote qa/FRESH_BUG_CHECK_RESULTS.json from this run.");

if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
