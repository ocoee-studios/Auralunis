// Metro config — Expo defaults plus a narrow shim for satellite.js.
//
// satellite.js exposes its WASM runtime through package.json "imports" subpaths
// (#wasm-single-thread / #wasm-multi-thread). Metro does not resolve subpath
// imports by default, which breaks the web bundle. Map just those two
// specifiers to their real files. Native resolution is unaffected.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const satelliteDir = path.join(__dirname, "node_modules", "satellite.js");
const satelliteWasmImports = {
  "#wasm-single-thread": path.join(satelliteDir, "wasm-build/base-release/index.js"),
  "#wasm-multi-thread": path.join(satelliteDir, "wasm-build/pthreads-release/index.js")
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const mapped = satelliteWasmImports[moduleName];
  if (mapped) {
    return { type: "sourceFile", filePath: mapped };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
