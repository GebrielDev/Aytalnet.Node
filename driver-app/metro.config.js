// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Node.js built-in modules that don't exist in React Native.
// Axios 1.x conditionally loads its Node.js bundle which requires these.
// Returning { type: 'empty' } tells Metro to treat them as empty modules.
const NODE_BUILTINS = new Set([
  'crypto', 'http', 'https', 'net', 'tls', 'fs', 'path', 'os',
  'stream', 'zlib', 'events', 'buffer', 'util', 'querystring',
  'string_decoder', 'assert', 'url', 'child_process', 'dns',
  'http2', 'tty', 'worker_threads', 'process', 'vm',
  'proxy-from-env', 'follow-redirects',
]);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Return empty module for Node.js built-ins that don't exist in RN
  if (NODE_BUILTINS.has(moduleName)) {
    return { type: 'empty' };
  }
  // Default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
