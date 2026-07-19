// Location-permission deferral deterministic self-test.
//
// Proves the guarantee this fix adds: the iOS location authorization prompt is NEVER shown
// from an automatic path (app startup, onboarding, HomeScreen mount, passive refresh). It is
// requested ONLY from an explicit, user-initiated action ("Use My Location").
//
//   - the passive path reads permission with getForegroundPermissionsAsync (check-only)
//   - undetermined/denied/unavailable → "fallback" (existing default/manual behavior), no prompt
//   - already-granted → a real fix loads with NO request
//   - the explicit path DOES call requestForegroundPermissionsAsync
//   - no unrelated permission API is touched
// The real pure resolver is executed against spy APIs; UI wiring is asserted by scanning source.

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

const { resolveObserverLocation } = require(
  path.join(SRC, "features/sky-lens/ephemeris/observerLocationResolver.ts")
);

let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const eq = (n, a, b) => (a === b ? ok(n) : bad(`${n} — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));
const hasnt = (hay, needle, n) => (!hay.includes(needle) ? ok(n) : bad(`${n} — should be absent: ${needle}`));

// Spy expo-location surface. `checkStatus` is what a check-only read returns; `requestStatus`
// is what an explicit request resolves to.
function makeApi(checkStatus, requestStatus) {
  const spy = { getCount: 0, reqCount: 0, posCount: 0 };
  const api = {
    getForegroundPermissionsAsync: async () => { spy.getCount += 1; return { status: checkStatus }; },
    requestForegroundPermissionsAsync: async () => { spy.reqCount += 1; return { status: requestStatus ?? checkStatus }; },
    getCurrentPositionAsync: async () => { spy.posCount += 1; return { coords: { latitude: 40.7128, longitude: -74.006, altitude: 10 } }; },
  };
  return { spy, api };
}

async function main() {
  console.log("── A–D. Passive path (mount / onboarding / Home / refresh) NEVER prompts ──");
  {
    const { spy, api } = makeApi("undetermined");
    const r = await resolveObserverLocation(api, false);
    eq("undetermined passive → fallback", r.status, "fallback");
    eq("passive read permission (check-only)", spy.getCount, 1);
    eq("passive NEVER requested (no prompt)", spy.reqCount, 0);
    eq("passive did not read a position when not granted", spy.posCount, 0);
  }

  console.log("\n── E. Already-granted user loads location WITHOUT requesting again ──");
  {
    const { spy, api } = makeApi("granted");
    const r = await resolveObserverLocation(api, false);
    eq("granted passive → granted", r.status, "granted");
    eq("granted passive → real fix loaded", r.location && r.location.latitudeDegrees, 40.7128);
    eq("granted passive → NEVER prompted", spy.reqCount, 0);
    eq("granted passive → position fetched once", spy.posCount, 1);
  }

  console.log("\n── F. Denied / unavailable → graceful fallback, no prompt ──");
  {
    const { spy, api } = makeApi("denied");
    const r = await resolveObserverLocation(api, false);
    eq("denied passive → fallback", r.status, "fallback");
    eq("denied passive → NEVER prompted", spy.reqCount, 0);
    eq("denied passive → no position read", spy.posCount, 0);
  }
  {
    // Unavailable / throwing location services → fallback, never throws, never prompts.
    const spy = { reqCount: 0 };
    const api = {
      getForegroundPermissionsAsync: async () => { throw new Error("location services unavailable"); },
      requestForegroundPermissionsAsync: async () => { spy.reqCount += 1; return { status: "granted" }; },
      getCurrentPositionAsync: async () => ({ coords: { latitude: 0, longitude: 0, altitude: 0 } }),
    };
    const r = await resolveObserverLocation(api, false);
    eq("unavailable passive → fallback", r.status, "fallback");
    eq("unavailable passive → NEVER prompted", spy.reqCount, 0);
  }

  console.log("\n── G. Explicit 'Use My Location' action MAY prompt (only allowed request path) ──");
  {
    const { spy, api } = makeApi("undetermined", "granted");
    const r = await resolveObserverLocation(api, true);
    eq("explicit request prompts", spy.reqCount, 1);
    eq("explicit request did NOT use the check-only read", spy.getCount, 0);
    eq("explicit grant → granted", r.status, "granted");
    eq("explicit grant → fix loaded", r.location && r.location.latitudeDegrees, 40.7128);
  }
  {
    const { spy, api } = makeApi("undetermined", "denied");
    const r = await resolveObserverLocation(api, true);
    eq("explicit request that stays denied → fallback", r.status, "fallback");
    eq("explicit denied → prompted exactly once", spy.reqCount, 1);
  }

  console.log("\n── H. No unrelated permission API is called by the resolver ──");
  {
    // The resolver only ever touches the three provided location methods; a spy that fails on
    // any other access proves no stray permission API is reached.
    const { spy, api } = makeApi("granted");
    await resolveObserverLocation(api, false);
    eq("resolver only used location get + position (no request, no extras)", spy.getCount === 1 && spy.reqCount === 0 && spy.posCount === 1, true);
  }

  console.log("\n── Source wiring: mount is check-only; request is explicit-only ──");
  const resolver = read("src/features/sky-lens/ephemeris/observerLocationResolver.ts");
  has(resolver, "prompt\n      ? await api.requestForegroundPermissionsAsync()", "resolver requests ONLY when prompt is true");
  has(resolver, ": await api.getForegroundPermissionsAsync()", "resolver uses check-only read on the passive path");

  const hook = read("src/features/sky-lens/ephemeris/useObserverLocation.ts");
  has(hook, "const prompt = shouldPromptRef.current;", "hook resolves with the consumed prompt flag");
  has(hook, "shouldPromptRef.current = false;", "hook defaults the passive/mount path to no-prompt");
  has(hook, "resolveObserverLocation(ExpoLocation, prompt)", "hook delegates to the pure resolver");
  has(hook, "enableLocation:", "hook exposes an explicit enableLocation() action");
  has(hook, "shouldPromptRef.current = true;", "enableLocation opts into a prompt");
  hasnt(hook, "requestForegroundPermissionsAsync(", "hook never calls the prompting API directly");
  // No unrelated permission API imported/used by the hook or resolver.
  for (const term of ["expo-notifications", "requestPermissionsAsync", "Camera", "MediaLibrary", "Accelerometer", "Magnetometer"]) {
    hasnt(hook + resolver, term, `location code does not touch unrelated API: ${term}`);
  }

  console.log("\n── SkyScreen wires the explicit 'Use My Location' action ──");
  const sky = read("src/screens/SkyScreen.tsx");
  has(sky, "enableLocation", "SkyScreen consumes enableLocation");
  has(sky, "onPress={enableLocation}", "fallback hint triggers enableLocation on tap");
  has(sky, "Use My Location", "explicit action is labeled 'Use My Location'");

  console.log("\n── Automatic paths (Home / onboarding) never request location ──");
  const home = read("src/screens/HomeScreen.tsx");
  hasnt(home, "enableLocation", "Home never triggers the explicit location request");
  hasnt(home, "requestForegroundPermissions", "Home never requests location permission");
  const flow = read("src/features/onboarding/OnboardingFlow.tsx");
  hasnt(flow, "requestForegroundPermissions", "onboarding never requests location permission");
  hasnt(flow, "useObserverLocation", "onboarding does not even mount the location hook");

  console.log(`\nLocation-permission self-test: ${pass} passed, ${fail} failed.`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
