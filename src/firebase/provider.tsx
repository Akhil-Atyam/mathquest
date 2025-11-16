'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

/**
 * @fileoverview This file defines the core Firebase React Context provider.
 * It is responsible for holding the Firebase App, Auth, and Firestore instances,
 * as well as managing and distributing the current user's authentication state.
 */

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Defines the shape of the user authentication state.
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Defines the complete shape of the data stored in the FirebaseContext.
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if app, firestore, and auth instances are provided.
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  // User authentication state is merged into the main context.
  user: User | null;
  isUserLoading: boolean; // True during the initial auth state check.
  userError: Error | null; // Any error from the auth state listener.
}

// The return type for the `useFirebase()` hook.
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// The return type for the `useUser()` hook.
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Create the React Context with an undefined initial value.
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * The `FirebaseProvider` is a React component that uses the Context API to provide
 * Firebase services and user authentication state to its children.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  // State to hold the authentication status (user object, loading state, and error).
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start in a loading state until the first auth event is received.
    userError: null,
  });

  // This effect subscribes to Firebase's authentication state changes.
  useEffect(() => {
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null });

    // `onAuthStateChanged` is the key Firebase function for listening to sign-in/sign-out events.
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // When the auth state is determined, update the state.
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        // Handle any errors from the listener itself.
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    // The returned function is the cleanup function that unsubscribes when the component unmounts.
    return () => unsubscribe();
  }, [auth]); // This effect re-runs if the `auth` instance itself changes.

  // Memoize the context value to prevent unnecessary re-renders of consuming components.
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {/* The listener for handling global Firestore permission errors. */}
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


// --- Custom Hooks ---

/**
 * A custom hook to access the core Firebase services (app, firestore, auth) and user state.
 * It ensures that it's used within a `FirebaseProvider` and that services are available.
 * @returns {FirebaseServicesAndUser} An object containing the Firebase services and user state.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/**
 * A convenience hook to get only the Firebase Auth instance.
 * @returns {Auth} The Firebase Auth service instance.
 */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/**
 * A convenience hook to get only the Firestore instance.
 * @returns {Firestore} The Firestore service instance.
 */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/**
 * A convenience hook to get only the Firebase App instance.
 * @returns {FirebaseApp} The Firebase App instance.
 */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

/**
 * A custom hook that wraps `useMemo` to add a flag for internal checks.
 * This is a workaround to help ensure that dynamic Firestore queries/references
 * passed to other hooks like `useCollection` are properly memoized.
 * @param factory - The function to memoize.
 * @param deps - The dependency array.
 * @returns The memoized value.
 */
type MemoFirebase <T> = T & {__memo?: boolean};
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * A hook that provides only the user authentication state.
 * This is useful for components that only need to know about the current user.
 * @returns {UserHookResult} An object with `user`, `isUserLoading`, and `userError`.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
