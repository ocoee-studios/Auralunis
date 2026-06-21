module.exports = function(api) {
  api.cache(true);
  return {
    // unstable_transformImportMeta: satellite.js' WASM build uses import.meta,
    // which Hermes doesn't support natively (needed after the SDK 54 upgrade).
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: ["react-native-worklets/plugin"]
  };
};
