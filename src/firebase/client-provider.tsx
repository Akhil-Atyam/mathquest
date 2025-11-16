'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * A client-side provider that ensures Firebase is initialized only once.
 *
 * How it works:
 * 1. This is a Client Component (`'use client'`).
 * 2. It uses `useMemo` with an empty dependency array `[]`.
 * 3. This means the `initializeFirebase()` function inside `useMemo` is called only
 *    **once** when the component first mounts on the client.
 * 4. The initialized Firebase services (app, auth, firestore) are then passed down
 *    to the main `FirebaseProvider`, which makes them available to the rest of the app via context.
 *
 * This pattern is crucial for preventing Firebase from being re-initialized on every render,
 * which would cause errors and performance issues.
 *
 * @param {FirebaseClientProviderProps} props - The component props.
 * @param {ReactNode} props.children - The child components to be rendered.
 * @returns {JSX.Element} The FirebaseProvider with initialized services.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Memoize the Firebase services to ensure they are initialized only once.
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount.

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
