// Notification-permission deferral deterministic self-test.
//
// Proves the guarantee this fix adds: the iOS notification authorization prompt is NEVER shown
// from an automatic path (app startup, onboarding, Home mount-time scheduling). It is requested
// ONLY from an explicit, user-initiated action (turning Notifications on in Settings).
//
//   - scheduleSkyEventNotifications / scheduleCelestialEventNotifications only CHECK permission
//     (getPermissionsAsync) and never call requestPermissionsAsync
//   - a fresh/undetermined user schedules nothing and is never prompted
//   - an already-authorized user still schedules (functionality preserved)
//   - requestNotificationPermission() (the explicit path) DOES prompt when undetermined
// The real NotificationService is executed against a stubbed expo-notifications, so the behavior
// (not just the source shape) is verified; UI wiring is asserted by scanning source.

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

// ── Stub expo-notifications so we can observe exactly which API the code calls ──
const spy = {
  status: "undetermined",
  getCount: 0,
  reqCount: 0,
  schedCount: 0,
  cancelCount: 0,
  reset(status) {
    this.status = status;
    this.getCount = 0;
    this.reqCount = 0;
    this.schedCount = 0;
    this.cancelCount = 0;
  },
};
const notifStub = {
  getPermissionsAsync: async () => { spy.getCount += 1; return { status: spy.status }; },
  requestPermissionsAsync: async () => { spy.reqCount += 1; spy.status = "granted"; return { status: spy.status }; },
  scheduleNotificationAsync: async () => { spy.schedCount += 1; return "id-" + spy.schedCount; },
  cancelAllScheduledNotificationsAsync: async () => { spy.cancelCount += 1; },
  setNotificationHandler: () => {},
};
const origLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === "expo-notifications") return notifStub;
  return origLoad.call(this, request, ...rest);
};

const {
  hasNotificationPermission,
  requestNotificationPermission,
  scheduleSkyEventNotifications,
  scheduleCelestialEventNotifications,
  configureNotificationHandler,
} = require(path.join(SRC, "services/NotificationService.ts"));

let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const eq = (n, a, b) => (a === b ? ok(n) : bad(`${n} — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));
const hasnt = (hay, needle, n) => (!hay.includes(needle) ? ok(n) : bad(`${n} — should be absent: ${needle}`));

// A future-dated sky so scheduling WOULD fire if permission were granted.
const future = (mins) => new Date(Date.now() + mins * 60000).toISOString();
const SKY = { sun: { setISO: future(120) }, moon: { riseISO: future(180), }, moonIlluminationPercent: 62 };
const CELESTIAL = [{ id: "e1", name: "Perseids", date: "2999-08-12", type: "meteor", bestTime: "after midnight", rating: 5 }];

async function main() {
  console.log("── hasNotificationPermission is check-only (never prompts) ──");
  spy.reset("undetermined");
  const h1 = await hasNotificationPermission();
  eq("undetermined → not granted", h1, false);
  eq("check read permission", spy.getCount, 1);
  eq("check NEVER requested (no prompt)", spy.reqCount, 0);
  spy.reset("granted");
  eq("granted → true", await hasNotificationPermission(), true);
  eq("still no request", spy.reqCount, 0);

  console.log("\n── A/B/C. Automatic mount-time scheduling NEVER prompts ──");
  spy.reset("undetermined");
  const s0 = await scheduleSkyEventNotifications(SKY);
  eq("fresh user: schedules nothing", s0, 0);
  eq("fresh user: permission checked", spy.getCount >= 1, true);
  eq("fresh user: NEVER prompted (requestPermissionsAsync not called)", spy.reqCount, 0);
  eq("fresh user: nothing scheduled", spy.schedCount, 0);

  spy.reset("denied");
  const s1 = await scheduleSkyEventNotifications(SKY);
  eq("denied user: schedules nothing", s1, 0);
  eq("denied user: NEVER prompted", spy.reqCount, 0);

  spy.reset("undetermined");
  const c0 = await scheduleCelestialEventNotifications(CELESTIAL);
  eq("fresh user: celestial schedules nothing", c0, 0);
  eq("fresh user: celestial NEVER prompts", spy.reqCount, 0);

  console.log("\n── Already-authorized users still schedule (functionality preserved) ──");
  spy.reset("granted");
  const s2 = await scheduleSkyEventNotifications(SKY);
  eq("authorized: sky events scheduled", s2 > 0, true);
  eq("authorized: cancel-all ran before reschedule", spy.cancelCount, 1);
  eq("authorized: still NEVER prompted (already granted)", spy.reqCount, 0);
  spy.reset("granted");
  const c1 = await scheduleCelestialEventNotifications(CELESTIAL);
  eq("authorized: celestial events scheduled", c1 > 0, true);
  eq("authorized: celestial did not prompt", spy.reqCount, 0);

  console.log("\n── Explicit user action MAY prompt (the only allowed request path) ──");
  spy.reset("undetermined");
  const g = await requestNotificationPermission();
  eq("explicit request prompts when undetermined", spy.reqCount, 1);
  eq("explicit request returns granted result", g, true);
  spy.reset("granted");
  const g2 = await requestNotificationPermission();
  eq("explicit request short-circuits when already granted (no prompt)", spy.reqCount, 0);
  eq("explicit request returns true when already granted", g2, true);

  console.log("\n── configureNotificationHandler never touches permissions ──");
  spy.reset("undetermined");
  configureNotificationHandler();
  eq("handler setup does not read permission", spy.getCount, 0);
  eq("handler setup does not request permission", spy.reqCount, 0);

  console.log("\n── Source wiring: automatic paths use check-only; request is contextual only ──");
  const svc = read("src/services/NotificationService.ts");
  const reqAsyncCount = (svc.match(/requestPermissionsAsync\(\)/g) || []).length;
  eq("requestPermissionsAsync is called exactly once (inside requestNotificationPermission)", reqAsyncCount, 1);
  eq("both schedulers gate on hasNotificationPermission()", (svc.match(/await hasNotificationPermission\(\)/g) || []).length, 2);

  const home = read("src/screens/HomeScreen.tsx");
  hasnt(home, "requestNotificationPermission", "Home mount scheduling never requests permission");
  has(home, "scheduleSkyEventNotifications(sky)", "Home still schedules for authorized users");

  const app = read("App.tsx");
  hasnt(app, "requestNotificationPermission", "App startup never requests notification permission");
  hasnt(app, "requestPermissionsAsync", "App startup never calls requestPermissionsAsync");
  has(app, "configureNotificationHandler()", "App still configures the notification handler");

  const settings = read("src/screens/SettingsScreen.tsx");
  has(settings, "handleNotificationsToggle", "Settings has a contextual notifications toggle handler");
  has(settings, "await requestNotificationPermission()", "Settings requests permission on explicit enable");
  has(settings, "onValueChange={handleNotificationsToggle}", "Notifications switch is wired to the contextual handler");

  const flow = read("src/features/onboarding/OnboardingFlow.tsx");
  hasnt(flow, "requestPermission", "onboarding never requests any permission");
  hasnt(flow, "expo-notifications", "onboarding does not import notifications");

  console.log(`\nNotification-permission self-test: ${pass} passed, ${fail} failed.`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
