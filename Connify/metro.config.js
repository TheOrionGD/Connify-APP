const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /.*[/\\]android[/\\]\.cxx[/\\].*/,
  /.*[/\\]android[/\\]build[/\\].*/,
];

config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
