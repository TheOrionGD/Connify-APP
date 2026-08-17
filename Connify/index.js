import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import './src/services/QueueHandlers';

/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import { initializeApp, getApps } from '@react-native-firebase/app';
import { 
  FIREBASE_API_KEY, 
  FIREBASE_AUTH_DOMAIN, 
  FIREBASE_PROJECT_ID, 
  FIREBASE_STORAGE_BUCKET, 
  FIREBASE_MESSAGING_SENDER_ID, 
  FIREBASE_APP_ID,
  FIREBASE_DATABASE_URL
} from '@env';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

if (Platform.OS === 'web') {
  // Inject MaterialIcons font for Web
  const iconFontStyles = `@font-face {
    src: url(${require('react-native-vector-icons/Fonts/MaterialIcons.ttf')});
    font-family: MaterialIcons;
  }`;
  const style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = iconFontStyles;
  } else {
    style.appendChild(document.createTextNode(iconFontStyles));
  }
  document.head.appendChild(style);

  if (getApps().length === 0) {
    initializeApp({
      apiKey: FIREBASE_API_KEY,
      authDomain: FIREBASE_AUTH_DOMAIN,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
      messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
      appId: FIREBASE_APP_ID,
      databaseURL: FIREBASE_DATABASE_URL || `https://${FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
    });
  }

  const rootTag = document.getElementById('root') ?? document.getElementById('main');
  AppRegistry.runApplication(appName, {
    rootTag,
  });
}
