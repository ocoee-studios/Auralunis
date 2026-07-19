// Release-config guard.
//
// The iOS permission set must match AuraLunis's REAL features. Sky Lens is a fully rendered,
// sensor-aligned planetarium — NOT a camera/AR experience — so there must be no camera or
// microphone permission. Location is foreground-only; photos are save-only. And because this
// is a managed / CNG Expo project (ios/ and android/ are gitignored prebuild artifacts), EAS
// must regenerate native config from app.json rather than uploading a stale local prebuild.
//
// This is a fast, deterministic static guard over app.json + .easignore (matches the other
// qa:* scripts). The AUTHORITATIVE effective-config check at build time is:
//     npx expo config --type introspect --json
// which must show only NSLocationWhenInUse / NSPhotoLibraryAdd / NSMotion usage descriptions.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

let failed = 0;
const check = (name, ok, detail) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failed += 1;
};

const app = JSON.parse(read("app.json")).expo;
const plugins = app.plugins || [];
const pluginConfig = (name) => {
  const entry = plugins.find((p) => Array.isArray(p) && p[0] === name);
  return (entry && entry[1]) || null;
};
const infoPlist = (app.ios && app.ios.infoPlist) || {};
const easignore = read(".easignore");
const deps = require(path.join(root, "package.json")).dependencies || {};

// ── Managed/CNG: stale local prebuild must be excluded from the EAS upload archive ──
check(".easignore excludes ios/", /^ios\/?\s*$/m.test(easignore));
check(".easignore excludes android/", /^android\/?\s*$/m.test(easignore));

// ── Product contract: no camera anywhere (neither dependency nor declared permission) ──
check("no expo-camera dependency", !("expo-camera" in deps));
check("no NSCamera usage description declared", !Object.keys(infoPlist).some((k) => /NSCamera/.test(k)));

// ── Config-plugin permission suppression (unused permissions stay suppressed) ──
const av = pluginConfig("expo-av");
check("expo-av microphone permission suppressed (playback-only app)", !!av && av.microphonePermission === false);

const loc = pluginConfig("expo-location");
check(
  "expo-location Always permissions suppressed (foreground-only app)",
  !!loc && loc.locationAlwaysAndWhenInUsePermission === false && loc.locationAlwaysPermission === false
);
check("expo-location WhenInUse permission present", !!loc && typeof loc.locationWhenInUsePermission === "string");

const media = pluginConfig("expo-media-library");
check("expo-media-library full-read photos suppressed (save-only app)", !!media && media.photosPermission === false);
check("expo-media-library save permission present", !!media && typeof media.savePhotosPermission === "string");

console.log("");
if (failed) {
  console.error(`Release-config guard: ${failed} FAILED.`);
  process.exit(1);
}
console.log(
  "Release-config guard passed: no camera/microphone/always-location; save-only photos; foreground-only location; managed prebuild protected."
);
