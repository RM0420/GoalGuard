// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import("expo/metro-config").MetroConfig} */
// Get the default config
const defaultConfig = getDefaultConfig(__dirname);

// Path to your empty shim file
const emptyShim = path.resolve(__dirname, "empty-shim.js");

// Define your shims
const shims = {
  http: emptyShim,
  https: emptyShim,
  fs: emptyShim,
  tls: emptyShim,
  net: emptyShim,
  zlib: emptyShim,
  os: emptyShim,
  path: emptyShim,
  stream: emptyShim,
  crypto: emptyShim,
  events: emptyShim,
  util: emptyShim,
  url: emptyShim,
  assert: emptyShim,
  constants: emptyShim,
  tty: emptyShim,
  vm: emptyShim,
  dgram: emptyShim,
  child_process: emptyShim,
};

// Merge our shims with existing extraNodeModules from the default config
// Our shims will take precedence for the keys they define.
defaultConfig.resolver.extraNodeModules = {
  ...(defaultConfig.resolver.extraNodeModules || {}), // Spread existing ones first (if any)
  ...shims, // Then override/add our shims
};

// You can still use blockList if necessary, uncomment and adjust if needed:
// defaultConfig.resolver.blockList = [
//   /node_modules\/ws\/lib\/websocket-server\.js$/,
//   /node_modules\/ws\/lib\/websocket\.js$/,
// ];

module.exports = defaultConfig;
