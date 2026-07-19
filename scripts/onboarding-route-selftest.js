// First-run onboarding launch-route deterministic self-test.
//
// Proves the guarantees this PR adds:
//   - a genuinely new install routes to onboarding (never straight to the Birth Chart)
//   - a returning user (completion flag) routes to the app
//   - an existing Build 5 user (saved birth data, no flag) routes to the app AND is migrated
//   - the route is "loading" until BOTH signals resolve (no Birth Chart flash on boot)
//   - completing OR skipping persists the flag; the next launch skips onboarding
//   - Replay Tutorial re-shows onboarding without erasing data / entitlement / RC identity
//   - the onboarding Sky Lens copy never says AR / augmented reality / camera overlay / live camera
//   - onboarding never opens the paywall, advertises a trial, or requests permissions
// Pure logic is executed; UI wiring is asserted by scanning source (no RN runtime).

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

// ── transpile-require: load node-safe .ts modules, resolve "@/…" to src/… ──
const ts = require(path.join(ROOT, "node_modules/typescript"));
const Module = require("module");
require.extensions[".ts"] = function (module, filename) {
  const src = fs.readFileSync(filename, "utf8");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    fileName: filename,
  });
  module._compile(outputText, filename);
};
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) {
    const base = path.resolve(SRC, request.slice(2));
    for (const c of [base + ".ts", base + ".tsx", path.join(base, "index.ts")]) {
      if (fs.existsSync(c)) return c;
    }
  }
  return origResolve.call(this, request, ...rest);
};

const {
  resolveLaunchRoute,
  shouldPersistMigration,
  hasExistingUserData,
  EXISTING_USER_DATA_KEYS,
} = require(path.join(SRC, "features/onboarding/onboardingRoute.ts"));

let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const eq = (n, a, b) => (a === b ? ok(n) : bad(`${n} — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));
const hasnt = (hay, needle, n) => (!hay.includes(needle) ? ok(n) : bad(`${n} — should be absent: ${needle}`));

// Strip // line comments and /* */ block comments so copy scans never trip on the file's
// own explanatory comments (which legitimately name the forbidden terms).
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const SIG_NEW = { onboardingComplete: false, hasExistingUserData: false };
const SIG_RETURNING = { onboardingComplete: true, hasExistingUserData: false };
const SIG_RETURNING_WITH_DATA = { onboardingComplete: true, hasExistingUserData: true };
const SIG_EXISTING = { onboardingComplete: false, hasExistingUserData: true };

console.log("── A. New install → onboarding (never straight to Birth Chart) ──");
eq("A new user routes to onboarding", resolveLaunchRoute(SIG_NEW), "onboarding");
eq("A new user is NOT sent to the app", resolveLaunchRoute(SIG_NEW) !== "app", true);
eq("A new user is not falsely migrated", shouldPersistMigration(SIG_NEW), false);

console.log("\n── B. Returning user (completion flag) → app ──");
eq("B returning user routes to app", resolveLaunchRoute(SIG_RETURNING), "app");
eq("B returning user w/ data routes to app", resolveLaunchRoute(SIG_RETURNING_WITH_DATA), "app");
eq("B returning user is not re-migrated", shouldPersistMigration(SIG_RETURNING), false);

console.log("\n── C. Existing user (saved data, no flag) → app + migrate ──");
eq("C existing user routes to app", resolveLaunchRoute(SIG_EXISTING), "app");
eq("C existing user is migrated (persist flag)", shouldPersistMigration(SIG_EXISTING), true);

console.log("\n── G. Boot: route is 'loading' until BOTH signals resolve ──");
eq("G both signals null → loading", resolveLaunchRoute({ onboardingComplete: null, hasExistingUserData: null }), "loading");
eq("G flag unread → loading", resolveLaunchRoute({ onboardingComplete: null, hasExistingUserData: false }), "loading");
eq("G data unread → loading", resolveLaunchRoute({ onboardingComplete: false, hasExistingUserData: null }), "loading");
eq("G loading never resolves to onboarding early", resolveLaunchRoute({ onboardingComplete: null, hasExistingUserData: false }) !== "onboarding", true);

console.log("\n── Existing-user data detection (durable prior-use signal) ──");
eq("empty store → no existing data", hasExistingUserData({}), false);
eq("whitespace-only value → no existing data", hasExistingUserData({ "auralunis.birthday": "   " }), false);
eq("saved birthday → existing data", hasExistingUserData({ "auralunis.birthday": "1990-06-21T12:00:00.000Z" }), true);
eq("saved birthplace → existing data", hasExistingUserData({ "auralunis.birthplace": '{"lat":1}' }), true);
// The keys we read must be a subset of the keys the birth-chart flow actually writes.
const birthSvc = read("src/services/BirthSkyService.ts");
const birthScreen = read("src/screens/BirthSkyScreen.tsx");
for (const key of EXISTING_USER_DATA_KEYS) {
  const written = birthSvc.includes(`"${key}"`) || birthScreen.includes(`"${key}"`);
  eq(`existing-data key is really written by birth flow: ${key}`, written, true);
}

console.log("\n── App.tsx: boot state, resolver wiring, migration, no paywall-in-onboarding ──");
const app = read("App.tsx");
has(app, 'useState<LaunchRoute>("loading")', "route starts in the loading/boot state");
has(app, "resolveLaunchRoute(signals)", "App resolves the route via the pure resolver");
has(app, "shouldPersistMigration(signals)", "App migrates existing users via shouldPersistMigration");
has(app, "hasExistingUserData(store)", "App derives existing-user data from stored keys");
has(app, 'route === "loading" && <BootSplash', "App renders the boot cover while loading");
has(app, 'visible={route === "onboarding"}', "OnboardingFlow is gated on the resolved route");
has(app, "onDone={handleOnboardingDone}", "OnboardingFlow completion enters the app");
has(app, "AsyncStorage.setItem(ONBOARDING_SEEN_KEY", "completion/skip persists the onboarding flag");
hasnt(app, "onOpenPaywall", "onboarding no longer wires a paywall trigger");
has(app, "<SafeAreaProvider>", "app is wrapped in SafeAreaProvider (safe-area aware onboarding)");

console.log("\n── SettingsScreen: Replay Tutorial (no data/entitlement loss) ──");
const settings = read("src/screens/SettingsScreen.tsx");
has(settings, "Replay Tutorial", "Settings exposes a 'Replay Tutorial' action");
has(settings, "useOnboarding()", "Settings uses the onboarding replay context");
has(settings, "onPress={replayTutorial}", "Replay Tutorial calls replayTutorial()");

console.log("\n── OnboardingContext: replay is presentational only ──");
// Scan code only (comments legitimately name these systems to document what replay avoids).
const ctx = stripComments(read("src/context/OnboardingContext.tsx"));
hasnt(ctx, "AsyncStorage", "replay context never touches storage");
hasnt(ctx, "removeItem", "replay context never clears any data");
hasnt(ctx, "RevenueCat", "replay context never touches RevenueCat identity");
hasnt(ctx, "Entitlement", "replay context never touches entitlement state");

console.log("\n── H. Onboarding copy contract (truthful planetarium, no AR/camera) ──");
const flowRaw = read("src/features/onboarding/OnboardingFlow.tsx");
const flow = stripComments(flowRaw).toLowerCase();
for (const term of ["augmented reality", "camera overlay", "live camera", "camera-based", "\\bar\\b"]) {
  const re = new RegExp(term);
  eq(`onboarding copy free of "${term}"`, re.test(flow), false);
}
hasnt(stripComments(flowRaw), "camera", "onboarding copy contains no 'camera' language at all");
has(flowRaw, "fully rendered planetarium", "Sky Lens described truthfully as a fully rendered planetarium");
has(flowRaw, "motion sensors", "Sky Lens copy references device motion sensors");
has(flowRaw, "Create My Birth Chart", "final CTA is 'Create My Birth Chart'");

console.log("\n── Onboarding is purely informational (no paywall / trial / permission asks) ──");
hasnt(flowRaw, "Paywall", "onboarding does not import or open the paywall");
hasnt(flowRaw, "openPaywall", "onboarding never opens the paywall");
hasnt(flow, "free trial", "onboarding never advertises a free trial");
hasnt(flowRaw, "requestPermission", "onboarding requests no permissions");
hasnt(flowRaw, "Location", "onboarding requests no location permission");
has(flowRaw, "useReducedMotion", "onboarding respects Reduce Motion");
has(flowRaw, "useSafeAreaInsets", "onboarding is safe-area aware");
has(flowRaw, 'accessibilityRole="header"', "onboarding titles are announced as headers");
has(flowRaw, 'accessibilityRole="progressbar"', "onboarding progress is exposed to VoiceOver");

console.log(`\nOnboarding route self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
