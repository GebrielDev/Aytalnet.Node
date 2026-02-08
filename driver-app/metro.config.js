// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
// Expo SDK 50's Metro doesn't handle package.json "exports" conditions
// properly, causing axios to resolve to dist/node/axios.cjs which needs
// Node.js built-ins (crypto, http, etc.) that don't exist in React Native.
// Fix: force axios to resolve to its browser bundle instead.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'axios') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(
        __dirname,
        'node_modules',
        'axios',
        'dist',
        'browser',
        'axios.cjs'
      ),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};
module.exports = config;