#!/usr/bin/env node
"use strict";

// Release-cleanup regression guard (PR-6). Deterministic, dependency-free.
//
// PR-6 removed ~24 MB of proven-unreferenced tracked assets and five dead Sky Lens
// modules, and excluded the untracked assets/nebula-art/ source art from the EAS
// upload. Nothing in the previous suite guards those removals, so this test freezes
// the outcome: deleted things must stay deleted, retained things must stay present,
// assetBundlePatterns must not drift, and no live require() may point at a file we
// removed. Pure Node + fs — no build, no network, no new dependency.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
let pass = 0;
let fail = 0;
const ok = (m) => { pass += 1; console.log("PASS " + m); };
const bad = (m) => { fail += 1; console.log("FAIL " + m); };
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// 1. Deleted tracked assets must not reappear.
const NEBULA_BAKED = ["carina", "crab", "dumbbell", "eagle", "lagoon", "north-america",
  "orion", "ring", "rosette", "swan", "trifid", "veil"].map((n) => `assets/nebula-baked/${n}-nebula.png`);
const DELETED_ASSETS = [
  "assets/sky/nebula-reference-trifid.jpg",
  "assets/sky/milkyway-reference.webp",
  "assets/sky/milkyway-core.png",
  "assets/splash.png",
  "assets/sky-backgrounds/sky-background-rose-cyan.png",
  "assets/sky-backgrounds/sky-background-warm-amber.png",
  "assets/brand/chronaura-adaptive-foreground.png",
  "assets/brand/chronaura-splash.png",
  "assets/brand/chronaura-stardust-emblem.png",
  "assets/brand/chronaura-stardust-lockup.png",
  "assets/logo/chronaura-splash.png",
  "assets/logo/chronaura-stardust-emblem.png",
  ...NEBULA_BAKED,
];
for (const a of DELETED_ASSETS) {
  if (exists(a)) bad(`deleted asset reappeared: ${a}`);
  else ok(`stays deleted: ${a}`);
}

// 2. Deleted dead modules must not reappear.
const DELETED_MODULES = [
  "src/features/sky-lens/layers/LuxuryStarfieldFXLayer.tsx",
  "src/features/sky-lens/layers/MilkyWayLayer.tsx",
  "src/features/sky-lens/layers/MilkyWayCoreLayer.tsx",
  "src/features/sky-lens/layers/NebulaLayer.tsx",
  "src/hooks/usePremium.ts",
];
for (const m of DELETED_MODULES) {
  if (exists(m)) bad(`deleted module reappeared: ${m}`);
  else ok(`stays deleted: ${m}`);
}

// 3. .easignore must keep excluding the untracked source art from the EAS upload.
const easignore = fs.readFileSync(path.join(ROOT, ".easignore"), "utf8");
if (/^assets\/nebula-art\/$/m.test(easignore)) ok(".easignore excludes assets/nebula-art/");
else bad(".easignore no longer excludes assets/nebula-art/");

// 4. Retained production assets must still exist.
const RETAINED = [
  "assets/logo/auralunis-app-icon.png",
  "assets/logo/auralunis-splash.png",
  "assets/logo/auralunis-adaptive-foreground.png",
  "assets/icon.png",
  "assets/sky-backgrounds/sky-background-cool-violet.png",
];
for (const r of RETAINED) {
  if (exists(r)) ok(`retained asset present: ${r}`);
  else bad(`retained asset MISSING: ${r}`);
}

// 5. assetBundlePatterns must remain exactly as PR-6 left it (unchanged).
const app = JSON.parse(fs.readFileSync(path.join(ROOT, "app.json"), "utf8"));
const abp = JSON.stringify(app.expo.assetBundlePatterns);
if (abp === JSON.stringify(["assets/**/*"])) ok("assetBundlePatterns unchanged ([\"assets/**/*\"])");
else bad(`assetBundlePatterns changed: ${abp}`);

// 6. No live require() in src/ may point at a missing asset file (catches a deletion
//    that orphaned a real reference). Line/block comments are stripped first so the
//    commented-out audio requires in IonosphericAudioEngine are correctly ignored.
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) out.push(p);
  }
  return out;
}
const ASSET_EXT = "png|jpg|jpeg|webp|gif|mp3|wav|m4a|ttf|otf";
const reqRe = new RegExp(`require\\(\\s*["'\`]([^"'\`]+\\.(?:${ASSET_EXT}))["'\`]\\s*\\)`, "g");
let checked = 0;
let missing = 0;
for (const file of walk(path.join(ROOT, "src"))) {
  const raw = fs.readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")                 // block comments
    .split("\n").map((l) => l.replace(/(^|[^:])\/\/.*$/, "$1")).join("\n"); // line comments (keep :// )
  let m;
  while ((m = reqRe.exec(raw)) !== null) {
    const spec = m[1];
    const target = spec.startsWith("@/")
      ? path.join(ROOT, "src", spec.slice(2))
      : path.resolve(path.dirname(file), spec);
    checked += 1;
    if (!fs.existsSync(target)) {
      missing += 1;
      bad(`live require() -> missing asset: ${spec} (in ${path.relative(ROOT, file)})`);
    }
  }
}
if (missing === 0) ok(`all ${checked} live asset require() targets resolve to existing files`);
else bad(`${missing} live require() call(s) point at a missing asset`);

console.log(`\nRelease-cleanup guard: ${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
