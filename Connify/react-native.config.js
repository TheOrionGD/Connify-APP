const android = require('@react-native-community/cli-platform-android');
const { bundleCommand, startCommand } = require('@react-native/community-cli-plugin');

module.exports = {
  commands: [bundleCommand, startCommand],
  platforms: {
    android: {
      projectConfig: android.projectConfig,
      dependencyConfig: android.dependencyConfig,
    },
  },
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
      packageName: 'com.connify',
    },
    ios: {},
  },
  dependencies: {
    expo: {
      platforms: {
        android: null,
        ios: null,
        macos: null,
      },
    },
  },
  assets: ['./src/assets/fonts'],
};


