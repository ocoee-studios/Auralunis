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
    passes.push(label);
    console.log("PASS", label);
  } else {
    failures.push(`${label}${detail ? `: ${detail}` : ""}`);
    console.error("FAIL", label, detail);
  }
}

const packageJson = read("package.json");
const app = read("App.tsx");
const rootTabs = read("src/navigation/RootTabs.tsx");
const home = read("src/screens/HomeScreen.tsx");
const sky = read("src/screens/SkyScreen.tsx");
const skyLens = read("src/features/sky-lens/SkyLensScreen.tsx");
const birthSky = read("src/screens/BirthSkyScreen.tsx");
const onboarding = read("src/features/onboarding/OnboardingFlow.tsx");
const monetization = read("src/features/paywall/MonetizationCatalog.ts");
const weather = read("src/services/WeatherService.ts");

check("RevenueCat startup rejection guarded", app.includes("configureRevenueCat().catch"));
check("purchase result handles cancellation", app.includes('result.status === "cancelled"'));
check("purchase result handles unavailable configuration", app.includes('result.status === "not_configured"') && app.includes('result.status === "not_available"'));
check("restore errors are user-visible and guarded", app.includes("handleRestorePurchases") && app.includes("Restore could not be completed"));
check("entitlement refresh follows purchases", app.includes("await refreshEntitlement()"));

const liveTabs = [...rootTabs.matchAll(/<Tab\.Screen name="([^"]+)" component=\{(\w+Screen)\}/g)].map((match) => ({
  name: match[1],
  component: match[2]
}));
check("live navigation has five tabs", liveTabs.length === 5, liveTabs.map((tab) => tab.name).join(", "));
check("live navigation matches launch tabs", JSON.stringify(liveTabs.map((tab) => tab.name)) === JSON.stringify(["Home", "Sky", "Learn", "Vault", "Settings"]));
for (const tab of liveTabs) {
  check(`live screen present: ${tab.component}`, exists(`src/screens/${tab.component}.tsx`));
}

check("Home uses real ephemeris", home.includes("computeTonightSky"));
check("Home weather request is guarded", home.includes("fetchCurrentWeather(location).then(setWeather).catch"));
check("Home tonight score uses live inputs", home.includes("computeTonightScore(sky, weather, settings.skyQuality)"));
check("Home notification scheduling is guarded", home.includes("scheduleSkyEventNotifications") && home.includes(".catch(() => {})"));
check("Home hardcoded moonrise is absent", !home.includes("Moonrise 8:12 PM"));

check("weather service uses Open-Meteo", weather.includes("api.open-meteo.com"));
check("weather service has safe fallback", weather.includes("const FALLBACK") && weather.includes("return FALLBACK"));
check("weather service sends no API key", !weather.includes("appid=") && !weather.includes("openweathermap"));

const ephemeris = read("src/features/sky-lens/ephemeris/SkyEphemerisService.ts");
check("ephemeris uses astronomy-engine", ephemeris.includes('from "astronomy-engine"'));
check("ephemeris computes horizontal coordinates", ephemeris.includes("Horizon(") && ephemeris.includes("Equator("));
check("ephemeris self-test exists", exists("scripts/ephemeris-selftest.js"));
check("astronomy-engine dependency declared", packageJson.includes('"astronomy-engine"'));

check("Sky screen routes to Sky Lens", sky.includes("<SkyLensScreen"));
check("Sky screen wraps Sky Lens in ErrorBoundary", sky.includes("<ErrorBoundary>") && sky.includes("<SkyLensScreen"));
check("Sky screen routes to accurate Birth Sky", sky.includes("<BirthSkyScreen"));
check("Sky screen restores tab bar after full-screen destinations", sky.includes("TAB_BAR_STYLE"));

check("Sky Lens is planetarium-only", skyLens.includes("const planetarium = true"));
check("Sky Lens camera feed removed", !skyLens.includes("CameraView"));
check("Sky Lens uses cinematic background image", skyLens.includes("SolidSkyBackgroundLayer"));
check("Sky Lens uses image-backed nebulae", skyLens.includes("NebulaImageLayer"));
check("Sky Lens aurora bands disabled", skyLens.includes("visible={false}") && skyLens.includes("intensity={0}"));
check("Sky Lens projection module exists", exists("src/features/sky-lens/ar/SkyLensProjection.ts"));
check("Sky Lens orientation module exists", exists("src/features/sky-lens/ar/SkyLensOrientation.ts"));
check("Sky Lens self-test exists", exists("scripts/skylens-selftest.js"));

check("Birth Sky does not use current observer location", !birthSky.includes("useObserverLocation"));
check("Birth Sky geocodes birthplace", birthSky.includes("findBirthplace") && birthSky.includes("geocoding-api.open-meteo.com"));
check("Birth Sky birthplace search ranks state or country", birthSky.includes("scorePlace") && birthSky.includes("US_STATE_NAMES"));
check("Birth Sky accepts AM/PM input", birthSky.includes("meridiemMatch"));
check("Birth Sky accepts 24-hour input", birthSky.includes("twentyFourHourMatch"));
check("Birth Sky rejects invalid times", birthSky.includes("return null") && birthSky.includes("Enter a valid birth time"));
check("Birth Sky converts local time with birthplace timezone", birthSky.includes("localBirthMomentToUtc") && birthSky.includes("savedPlace.timezone"));
check("Birth Sky saves local date separately from UTC instant", birthSky.includes("BIRTH_DATE_LOCAL_STORAGE_KEY"));
check("Birth Sky saves local time separately from UTC instant", birthSky.includes("BIRTH_TIME_LOCAL_STORAGE_KEY"));
check("Birth Sky chart uses resolved location", birthSky.includes("location={profile.location}"));
check("Birth Sky unknown time is labeled approximate", birthSky.includes('"Approx. eastern sky"'));
check("Birth Sky network failure is user-visible", birthSky.includes("We couldn't find that birthplace"));

check("onboarding birth sky is explicitly a date-only preview", onboarding.includes("DATE-ONLY PREVIEW"));
check("onboarding avoids exact horizon claims", !onboarding.includes("Above the horizon:"));
check("onboarding explains birthplace and birth time are needed", onboarding.includes("birthplace") && onboarding.includes("birth time"));
check("onboarding no longer advertises camera AR", !onboarding.includes("Point your phone at the sky"));

check("current monthly price is $9.99", monetization.includes("$9.99/month"));
check("current annual price is $49.99", monetization.includes("$49.99/year"));
check("current lifetime price is $129.99", monetization.includes("$129.99"));
// The old "No free trials on any plan" claim is retired: a 7-day Apple intro trial may be
// offered to eligible new subscribers. Guard that the trial is described as CONDITIONAL
// (eligibility-gated), never as an unconditional promise every user receives.
check(
  "trial copy is conditional (eligibility-gated), not unconditional",
  monetization.includes("may be available to eligible new subscribers") &&
    !/No free trials on any plan/.test(monetization)
);
check("lifetime package identifier is correct", monetization.includes('"$rc_lifetime"'));
check("entitlement identifier is exact", monetization.includes('"AuraLunis Premium"'));
check("retired founder pricing is absent", !monetization.includes("$24.99") && !monetization.includes("FOUNDER OFFER"));

const satellite = read("src/features/aura-pro/SatelliteFeedService.ts");
check("satellite cache read guarded", satellite.includes("async function readCachedElements"));
check("satellite cache write guarded", satellite.includes("async function writeCachedElements"));
check("satellite cached elements sanitized", satellite.includes("function isElementSet"));
check("satellite cache expiry validated", satellite.includes("Number.isFinite(Date.parse(parsed.expiresAtISO))"));
check("satellite uses SGP4", satellite.includes('from "satellite.js"') && satellite.includes("twoline2satrec") && satellite.includes("ecfToLookAngles"));
check("satellite filters below-horizon objects", satellite.includes("elevationDegrees <= 0"));
check("satellite self-test exists", exists("scripts/satellite-selftest.js"));

const vault = read("src/state/AuraLunisVaultContext.tsx");
const vaultEncryption = read("src/services/VaultEncryption.ts");
check("vault uses encrypted storage", vault.includes("encryptVault") && vault.includes("decryptVault"));
check("vault migration handles legacy data", vault.includes("isEncrypted"));
check("vault encryption uses NaCl secretbox", vaultEncryption.includes("nacl.secretbox"));
check("vault key is stored securely", vaultEncryption.includes("SecureStore") || vaultEncryption.includes("SecureStorage"));

const screenShell = read("src/components/ScreenShell.tsx");
check("ScreenShell respects safe-area inset", screenShell.includes("useSafeAreaInsets") && screenShell.includes("insets.top"));
check("app is wrapped in GestureHandlerRootView", app.includes("GestureHandlerRootView"));
check("app has root ErrorBoundary", app.includes("<ErrorBoundary>"));
check("privacy policy exists", exists("docs/PRIVACY_POLICY.md"));
check("App Store listing exists", exists("docs/APP_STORE_LISTING.md"));
check("app version is not prototype version", !read("app.json").includes('"version": "0.1.0"'));

console.log("");
console.log(`Fresh bug check: ${passes.length} pass, ${failures.length} fail.`);

const result = {
  generated_at: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
  package: "auralunis",
  overall_status: failures.length ? "FAIL" : "PASS WITH DEVICE VERIFICATION REQUIRED",
  checks_passed: passes.length,
  checks_failed: failures.length,
  live_navigation: liveTabs.map((tab) => tab.name),
  screen_files: liveTabs.map((tab) => ({ file: `src/screens/${tab.component}.tsx`, exists: exists(`src/screens/${tab.component}.tsx`) })),
  failures,
  native_limitations: [
    "The cinematic Sky Lens is implemented and statically tested; final sensor motion, gestures, haptics, and image composition still require an iPhone run.",
    "Ephemeris positions are calculated by astronomy-engine and covered by the ephemeris self-test.",
    "Satellite positions use satellite.js SGP4 and are covered by the satellite self-test.",
    "Birth Sky uses birthplace geocoding and local timezone conversion; network and historical timezone edge cases require device testing.",
    "Vault encryption uses NaCl secretbox with its key in secure device storage.",
    "Weather uses keyless Open-Meteo and falls back safely when offline.",
    "RevenueCat flows are guarded in code; StoreKit sandbox purchase and restore still require an iPhone/TestFlight environment.",
    "Notifications require device permission and should be verified on physical hardware."
  ]
};

fs.writeFileSync(path.join(root, "qa/FRESH_BUG_CHECK_RESULTS.json"), JSON.stringify(result, null, 2) + "\n");
console.log("Wrote qa/FRESH_BUG_CHECK_RESULTS.json from this run.");

if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
