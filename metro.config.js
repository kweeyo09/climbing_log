const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'zustand') {
    return {
      type: 'sourceFile',
      filePath: path.join(__dirname, 'node_modules/zustand/index.js'),
    };
  }

  if (moduleName === 'zustand/vanilla') {
    return {
      type: 'sourceFile',
      filePath: path.join(__dirname, 'node_modules/zustand/vanilla.js'),
    };
  }

  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
