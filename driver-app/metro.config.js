// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Force Metro to prefer browser/react-native builds of packages.
// This prevents axios from loading its Node.js-specific bundle
// (which requires 'crypto', 'http', etc. – unavailable in React Native).
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
];

module.exports = config;
