import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import type { FirebaseConfigState } from '../types';

/**
 * Firebase Web App Configuration for project habitale28
 *
 * Reads values directly via static property access (import.meta.env.VITE_*)
 * so Vite's compiler can statically replace environment variables in the bundle.
 */
const rawApiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
const rawProjectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || 'habitale28').trim();
const rawAuthDomain = (
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
  (rawProjectId ? `${rawProjectId}.firebaseapp.com` : '')
).trim();
const rawStorageBucket = (
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
  (rawProjectId ? `${rawProjectId}.firebasestorage.app` : '')
).trim();
const rawMessagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim();
const rawAppId = (import.meta.env.VITE_FIREBASE_APP_ID || '').trim();
const rawMeasurementId = (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '').trim();

// A valid Firebase API key must be non-empty and not a placeholder string
const isValidApiKey = Boolean(
  rawApiKey &&
    !rawApiKey.includes('placeholder') &&
    !rawApiKey.includes('your_') &&
    !rawApiKey.includes('AIzaSyB_HabitaleApp')
);

export const firebaseConfig: FirebaseConfigState = {
  apiKey: rawApiKey,
  authDomain: rawAuthDomain,
  projectId: rawProjectId,
  storageBucket: rawStorageBucket,
  messagingSenderId: rawMessagingSenderId,
  appId: rawAppId,
  measurementId: rawMeasurementId || undefined,
  isConfigured: isValidApiKey && Boolean(rawProjectId),
};

export function validateFirebaseConfig(): { isValid: boolean; missingKeys: string[] } {
  const missing: string[] = [];
  if (!rawApiKey || !isValidApiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!rawProjectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!rawAppId) missing.push('VITE_FIREBASE_APP_ID');

  return {
    isValid: missing.length === 0,
    missingKeys: missing,
  };
}

export function getStoredFirebaseConfig(): FirebaseConfigState {
  return firebaseConfig;
}

// Singleton instances - initialized exactly once
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export function initializeFirebaseApp(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  isReady: boolean;
} {
  if (!appInstance && firebaseConfig.isConfigured) {
    try {
      appInstance =
        getApps().length > 0
          ? getApp()
          : initializeApp({
              apiKey: firebaseConfig.apiKey,
              authDomain: firebaseConfig.authDomain,
              projectId: firebaseConfig.projectId,
              storageBucket: firebaseConfig.storageBucket,
              messagingSenderId: firebaseConfig.messagingSenderId,
              appId: firebaseConfig.appId,
              ...(firebaseConfig.measurementId ? { measurementId: firebaseConfig.measurementId } : {}),
            });

      authInstance = getAuth(appInstance);

      try {
        dbInstance = getFirestore(appInstance);
      } catch (err) {
        console.warn('Optional Firestore initialization deferred:', err);
        dbInstance = null;
      }
    } catch (error) {
      console.error('Failed to initialize Firebase singleton:', error);
      appInstance = null;
      authInstance = null;
      dbInstance = null;
    }
  }

  return {
    app: appInstance,
    auth: authInstance,
    db: dbInstance,
    isReady: Boolean(authInstance),
  };
}

// Initial bootstrap
initializeFirebaseApp();

export const auth: Auth | null = authInstance;
export const db: Firestore | null = dbInstance;
export const isReady: boolean = Boolean(authInstance);

/**
 * Maps Firebase Auth errors to clear, friendly user explanations
 */
export function formatFirebaseAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'An unexpected error occurred during sign in. Please try again.';
  }

  const err = error as { code?: string; message?: string };

  if (err.message === 'CONFIG_MISSING') {
    const validation = validateFirebaseConfig();
    if (validation.missingKeys.length > 0) {
      return `Firebase configuration is incomplete. Missing or invalid: ${validation.missingKeys.join(', ')}. Please check your local .env file.`;
    }
    return 'Firebase API key is missing. Please add your Firebase Web App credentials for project "habitale28" to the local .env file.';
  }

  switch (err.code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. The Google sign-in window was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in request was started. Please try again.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this page.';
    case 'auth/unauthorized-domain':
      return 'This domain (e.g. localhost) is not authorized in your Firebase project. In Firebase Console, go to Authentication > Settings > Authorized domains and ensure localhost is listed.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in your Firebase Console. Go to Authentication > Sign-in method and enable Google.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return 'The configured Firebase API key is invalid. Please check your VITE_FIREBASE_API_KEY in .env.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Please check your internet connection.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/internal-error':
      return 'Firebase internal error. Please check your Firebase Console project settings.';
    default:
      return err.message || 'Failed to authenticate with Google. Please check your configuration.';
  }
}

/**
 * Initiates real Google sign-in via Firebase popup using the single initialized auth instance
 */
export async function signInWithGooglePopup(): Promise<User> {
  const { auth: currentAuth } = initializeFirebaseApp();
  if (!currentAuth) {
    throw new Error('CONFIG_MISSING');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(currentAuth, provider);
  return result.user;
}

/**
 * Signs out from Firebase using the single initialized auth instance
 */
export async function signOutFirebase(): Promise<void> {
  const { auth: currentAuth } = initializeFirebaseApp();
  if (currentAuth) {
    await fbSignOut(currentAuth);
  }
}
