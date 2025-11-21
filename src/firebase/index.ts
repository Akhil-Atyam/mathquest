'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * @fileoverview
 * This is the main entry point for Firebase services in the application.
 * It provides a singleton pattern for initializing Firebase and exports key hooks and providers.
 *
 * How it works:
 * 1. `initializeFirebase()`: This function ensures Firebase is initialized only once.
 *    It checks if an app is already initialized. If not, it calls `initializeApp()`.
 *    This is crucial to avoid re-initialization errors in a Next.js environment with Fast Refresh.
 *
 * 2. Exporting Hooks & Providers: It acts as a "barrel file" by re-exporting all the necessary
 *    Firebase-related hooks and providers from other files. This allows other parts of the app
 *    to import everything they need from a single, consistent location (e.g., `import { useUser } from '@/firebase'`).
 */


/**
 * Initializes the Firebase app and returns the SDK instances for Auth and Firestore.
 * This function implements a singleton pattern to prevent multiple Firebase initializations.
 *
 * @returns An object containing the initialized `firebaseApp`, `auth`, and `firestore` instances.
 */
export function initializeFirebase() {
  // Check if a Firebase app has already been initialized.
  if (!getApps().length) {
    // If not, initialize a new app using the configuration object.
    const firebaseApp = initializeApp(firebaseConfig);
    // Return the SDKs for the newly created app.
    return getSdks(firebaseApp);
  }

  // If an app is already initialized, get the existing app and return its SDKs.
  return getSdks(getApp());
}

/**
 * A helper function to get the Auth and Firestore SDKs from a FirebaseApp instance.
 * @param {FirebaseApp} firebaseApp - The initialized Firebase app instance.
 * @returns An object containing the `auth` and `firestore` services.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// Re-export all necessary providers and hooks for easy importing elsewhere.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';