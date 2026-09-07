import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from './env';

let firebaseInitialized = false;

export function initFirebase(): void {
  if (!env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not set. Firebase token verification will be unavailable.');
    return;
  }

  try {
    const serviceAccount = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('🔥 Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
  }
}

export function getFirebaseAuth() {
  if (!firebaseInitialized) {
    throw new Error('Firebase Admin SDK is not initialized. Check your FIREBASE_SERVICE_ACCOUNT_KEY.');
  }
  return getAuth();
}
