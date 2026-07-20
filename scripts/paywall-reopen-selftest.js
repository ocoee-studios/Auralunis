// Paywall re-open deterministic self-test.
//
// Bug: the paywall opened only ONCE per app session. PaywallNavigationContext.isPaywallVisible was
// set true on openPaywall() and NEVER reset (closePaywall unused); the modal's onClose reset only
// App's local `paywallVisible`. PaywallBridge's `[isPaywallVisible]` effect fires only on a
// false→true transition, so every later openPaywall() (flag already true) was a no-op.
//
// Fix: treat isPaywallVisible as a ONE-SHOT request — PaywallBridge opens the modal then clears the
// request (relayPaywallRequest), so a later openPaywall() from any caller re-fires.
//
// This test runs a faithful simulation of the wiring using the REAL relay helper, plus static +
// safety scans of App.tsx / the context.

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

const { relayPaywallRequest } = require(path.join(SRC, "context/paywallRelay.ts"));

let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const eq = (n, a, b) => (a === b ? ok(n) : bad(`${n} — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`));
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const has = (hay, needle, n) => (hay.includes(needle) ? ok(n) : bad(`${n} — expected present: ${needle}`));

// ── Faithful simulation of the real wiring ────────────────────────────────────────────────────
// req   = PaywallNavigationContext.isPaywallVisible (one-shot request flag)
// modal = App.tsx local `paywallVisible` (actual modal visibility)
// bridge() models PaywallBridge's effect (re-runs whenever `req` changes, per [isPaywallVisible]).
function makeSim() {
  let req = false;
  let modal = false;
  function bridge() {
    const { openModal, clearRequest } = relayPaywallRequest(req);
    if (openModal) modal = true;                 // onOpen()  → App setPaywallVisible(true)
    if (clearRequest) { req = false; bridge(); } // closePaywall() → req false → effect re-runs (no-op)
  }
  return {
    openPaywall() { req = true; bridge(); },      // any caller's openPaywall()
    close() { modal = false; },                   // onClose / purchase success / continue-free
    rerender() { bridge(); },                     // an unrelated re-render firing the effect
    get modal() { return modal; },
    get req() { return req; },
  };
}

console.log("── relay helper is a pure one-shot ──");
eq("relay(true) → open + clear", JSON.stringify(relayPaywallRequest(true)), JSON.stringify({ openModal: true, clearRequest: true }));
eq("relay(false) → neither", JSON.stringify(relayPaywallRequest(false)), JSON.stringify({ openModal: false, clearRequest: false }));

console.log("\n── 1. First openPaywall request opens the modal ──");
{
  const s = makeSim();
  s.openPaywall();
  eq("first open → modal visible", s.modal, true);
  eq("request flag cleared after open (one-shot)", s.req, false);
}

console.log("\n── 2. Closing the modal allows a second open request ──");
{
  const s = makeSim();
  s.openPaywall(); s.close();
  eq("after close → modal hidden", s.modal, false);
  s.openPaywall();
  eq("second open → modal visible again", s.modal, true);
}

console.log("\n── 3. Repeated opens work across different callers (same shared openPaywall) ──");
{
  const s = makeSim();
  let opens = 0;
  for (let i = 0; i < 5; i++) { s.openPaywall(); if (s.modal) opens += 1; s.close(); } // Settings, Telemetry, BirthSky, …
  eq("5 sequential opens all showed the modal", opens, 5);
}

console.log("\n── 4. Closing does NOT immediately reopen ──");
{
  const s = makeSim();
  s.openPaywall(); s.close();
  s.rerender(); s.rerender(); // effect re-runs with req=false
  eq("modal stays hidden after close across re-renders", s.modal, false);
}

console.log("\n── 5. Purchase / restore close paths still clear the visible modal ──");
{
  const s = makeSim();
  s.openPaywall();
  s.close(); // models handlePurchase success / handleContinueFree / onRestore → setPaywallVisible(false)
  eq("close path hides the modal", s.modal, false);
  eq("and a subsequent open still works", (s.openPaywall(), s.modal), true);
}

console.log("\n── Wiring: PaywallBridge implements the one-shot relay ──");
const app = read("App.tsx");
has(app, "relayPaywallRequest(isPaywallVisible)", "PaywallBridge uses the relay helper");
has(app, "if (openModal) onOpen();", "bridge opens the modal on request");
has(app, "if (clearRequest) closePaywall();", "bridge clears the request so the next open re-fires");
has(app, "const { isPaywallVisible, closePaywall } = usePaywallNavigation();", "bridge consumes closePaywall");
has(app, "onClose={() => setPaywallVisible(false)}", "modal onClose clears App visibility");

console.log("\n── Safety: isPaywallVisible has no other consumer ──");
// The definition file (context) and the pure helper (which only NAMES it in a comment) are not
// consumers. Everything else that references it is a real reader — must be App.tsx alone.
const NON_CONSUMERS = new Set(["src/context/PaywallNavigationContext.tsx", "src/context/paywallRelay.ts"]);
const readers = require("child_process")
  .execSync("grep -rl isPaywallVisible src App.tsx --include=*.ts --include=*.tsx || true", { cwd: ROOT })
  .toString().trim().split("\n").filter(Boolean)
  .filter((f) => !NON_CONSUMERS.has(f));
eq("only App.tsx (PaywallBridge) reads isPaywallVisible", readers.join(","), "App.tsx");

// NOTE: a hardcoded-base git "untouched files" block used to live here. It was removed because it
// produced false failures the moment a sibling paywall PR legitimately touched a listed file (e.g.
// ThreeTierPaywallModal for the trial-copy refactor) — the same rot that required hotfix PR #185.
// Pricing/entitlement/RevenueCat behavior is guarded by qa:revenuecat, qa:paywall-restore, and the
// behavioral qa:paywall-copy suite, plus qa:all + PR review.

console.log(`\nPaywall re-open self-test: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
