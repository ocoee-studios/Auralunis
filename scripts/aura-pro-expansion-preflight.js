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

// Only the Aura Pro pieces that actually ship or have real native-handoff scaffolds.
// The never-built "future luxury" modules were pruned (see note further down).
const required = [
  "src/features/aura-pro/AuraProUtilityTypes.ts",
  "src/features/aura-pro/SatelliteFeedService.ts",
  "src/features/aura-pro/SatelliteThermalOverlayPanel.tsx",
  "src/features/aura-pro/AstrophotographyPredictorService.ts",
  "src/features/aura-pro/AstrophotographyPredictorPanel.tsx",
  "native-handoff/widgetkit/DeskObeliskWidget.swift",
  "native-handoff/widgetkit/SovereignSigilWidget.swift",
  "native-handoff/watchos/TapticAstrolabeCrownView.swift",
  "native-handoff/visionos/StellarPortalImmersiveSpace.swift",
  "native-handoff/FUTURE_LUXURY_NATIVE_TARGETS.md",
  "docs/AURA_PRO_UTILITY_EXPANSION.md"
];

for (const rel of required) check(`required: ${rel}`, exists(rel));

const satellite = read("src/features/aura-pro/SatelliteFeedService.ts");
for (const term of [
  "GROUP=VISUAL",
  "GROUP=STATIONS",
  "SPECIAL=DECAYING",
  "FORMAT=TLE",
  "twoline2satrec",
  "ecfToLookAngles",
  "CACHE_TTL_MS = 2 * 60 * 60 * 1000",
  "AsyncStorage"
]) {
  check(`satellite adapter: ${term}`, satellite.includes(term));
}

const sky = read("src/screens/SkyScreen.tsx");
check("Sky includes satellite overlay", sky.includes("<SatelliteThermalOverlayPanel />"));
check("Sky includes predictor", sky.includes("<AstrophotographyPredictorPanel />"));

// TimeScrubMatrix / SovereignSigil / DeskObelisk / FutureLuxury and the Watch screen
// were on an abandoned "future luxury" roadmap and were never built (absent on main and
// every branch). Their audits are removed; the native-handoff Swift SCAFFOLDS that DO
// exist are still checked below.

const taptic = read("native-handoff/watchos/TapticAstrolabeCrownView.swift");
check("watchOS crown scaffold", taptic.includes("digitalCrownRotation") && taptic.includes("isHapticFeedbackEnabled: true"));

const portal = read("native-handoff/visionos/StellarPortalImmersiveSpace.swift");
check("visionOS immersive scaffold", portal.includes("RealityView") && portal.includes("AuraLunisStellarPortalRoot"));

const obelisk = read("native-handoff/widgetkit/DeskObeliskWidget.swift");
check("WidgetKit StandBy-oriented scaffold", obelisk.includes(".systemSmall") && obelisk.includes("containerBackground"));

console.log("");
console.log(`Aura Pro expansion preflight: ${passes.length} pass, ${failures.length} fail.`);

if (failures.length) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
