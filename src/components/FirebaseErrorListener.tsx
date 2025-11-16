'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible client component that listens for globally emitted 'permission-error' events.
 *
 * How it works:
 * 1. It subscribes to the `errorEmitter` for 'permission-error' events.
 * 2. When an error is caught (e.g., from a Firestore `.catch()` block), it's emitted globally.
 * 3. This component catches the emitted error and sets it to its local state.
 * 4. A state change triggers a re-render.
 * 5. During the re-render, if the error state is not null, the component **throws** the error.
 * 6. This thrown error is then caught by the nearest Next.js Error Boundary,
 *    which in development is the Next.js development overlay, displaying the rich, contextual error.
 *
 * This architecture allows any component to report a Firestore permission error
 * without needing to be directly coupled with UI-level error handling.
 */
export function FirebaseErrorListener() {
  // State to hold the caught error. Using the specific error type for type safety.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    /**
     * The callback function that handles the received error.
     * It sets the error in the component's state to trigger a re-render.
     * @param {FirestorePermissionError} error - The error object emitted from the emitter.
     */
    const handleError = (error: FirestorePermissionError) => {
      setError(error);
    };

    // Subscribe to the 'permission-error' event on the global emitter.
    errorEmitter.on('permission-error', handleError);

    // Cleanup function to unsubscribe from the event when the component unmounts.
    // This is crucial to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  // If an error has been set in the state, throw it.
  // This is the key step that propagates the error to the Next.js Error Boundary.
  if (error) {
    throw error;
  }

  // This component renders nothing to the DOM. Its sole purpose is to listen and throw.
  return null;
}
