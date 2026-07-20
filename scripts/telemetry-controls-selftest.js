// Telemetry (Orbital Alignment) controls deterministic self-test.
//
// Proves the fix + the surrounding contract:
//   1. A simulated lock does NOT present the LockShareCard (so the overlay can't trap the
//      Telemetry controls during Simulation Mode).
//   2. A non-simulation eligible lock STILL presents the LockShareCard (real-device unchanged).
//   3. Free-mode selection is unconditional (mode buttons always call setMode).
//   4. Premium modes stay gated for non-entitled users.
//   5. Unlock Premium invokes the paywall (openPaywall).
//   6. Simulation-Mode exit stays wired.
// Pure gating logic is executed; UI wiring is asserted by scanning source.

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

const { shouldPresentLockShareCard, LOCK_SHARE_MODES } = require(path.join(SRC, "screens/telemetryLockShare.ts"));

let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const eq = (n, a, b) => (a === b ? ok(n) : bad(`${n} — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));

const ALL_MODES = ["fleet", "deep-space", "train", "golden", "debris", "meteor", "chain", "static", "reentry"];

console.log("── 1. Simulated locks NEVER present the LockShareCard ──");
for (const m of ALL_MODES) {
  eq(`sim lock in "${m}" → no share card`, shouldPresentLockShareCard(m, true), false);
}

console.log("\n── 2. Non-simulation eligible locks STILL present the LockShareCard ──");
for (const m of LOCK_SHARE_MODES) {
  eq(`real-device lock in "${m}" → share card`, shouldPresentLockShareCard(m, false), true);
}
// Non-eligible modes never present it, even off-sim (golden/meteor/chain/static are excluded).
for (const m of ALL_MODES.filter((x) => !LOCK_SHARE_MODES.includes(x))) {
  eq(`non-eligible "${m}" → no share card even off-sim`, shouldPresentLockShareCard(m, false), false);
}
eq("LOCK_SHARE_MODES is exactly the eligible set", LOCK_SHARE_MODES.slice().sort().join(","), ["fleet","deep-space","train","debris","reentry"].sort().join(","));

console.log("\n── Screen wires the guard into the lock effect ──");
const screen = read("src/screens/OrbitalAlignmentScreen.tsx");
has(screen, "if (shouldPresentLockShareCard(mode, simMode)) {", "setLockShareData is guarded by shouldPresentLockShareCard");
has(screen, "setLockShareData({", "the lock-share card is still presented (non-sim path preserved)");
has(screen, "if (justLocked && LOCK_SHARE_MODES.includes(mode)) {", "recordLock/lock block still fires for eligible modes (drift + real-device share)");
// The overlay component itself must be untouched by this fix.
const lockCard = read("src/components/LockShareCard.tsx");
has(lockCard, 'overlay: { position: "absolute"', "LockShareCard overlay style unchanged (fix does not touch the component)");

console.log("\n── 3. Free-mode selection is unconditional ──");
has(screen, "onPress={() => setMode(m)}", "every mode button calls setMode(m) with no pre-gate");

console.log("\n── 4. Premium modes stay gated for non-entitled users ──");
has(screen, "isModeGated(mode) && !isPremium", "gated modes render the PremiumModeGate for non-premium users");
has(screen, "<PremiumModeGate", "PremiumModeGate is rendered");

console.log("\n── 5. Unlock Premium invokes the paywall ──");
const gate = read("src/components/PremiumModeGate.tsx");
has(gate, "usePaywallNavigation", "PremiumModeGate consumes the paywall navigation context");
has(gate, "openPaywall()", "Unlock Premium calls openPaywall()");
has(gate, "onPress={handleUpgrade}", "the Unlock Premium CTA is wired to handleUpgrade");

console.log("\n── 6. Simulation-Mode exit stays wired ──");
has(screen, "onPress={() => setSimMode(false)}", "the SIMULATION MODE banner exits sim mode");
has(screen, "onPress={() => setSimMode(true)}", "the Enable Simulation Mode button still works");

console.log(`\nTelemetry controls self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
