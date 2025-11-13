'use client';
import {
  Auth,
  signInAnonymously as firebaseSignInAnonymously,
} from 'firebase/auth';


/**
 * Initiates Anonymous Sign-In flow.
 * @param authInstance The Firebase Auth instance.
 * @returns A promise that resolves with the user's credential.
 */
export async function signInAnonymously(authInstance: Auth) {
  try {
    const result = await firebaseSignInAnonymously(authInstance);
    const user = result.user;
    return { user };
  } catch (error: any) {
    console.error('Anonymous Sign-In Error:', error);
    // Re-throw the error to be handled by the calling function
    throw error;
  }
}

// You can create a simple component to use this, or integrate it directly
// into your existing login components.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This component can be used to wrap parts of your app that need auth context
  return <>{children}</>;
}
