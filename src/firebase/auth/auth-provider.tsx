'use client';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  // Make sure you have the Auth type and other necessary imports
} from 'firebase/auth';

// Create a new Google auth provider instance
const provider = new GoogleAuthProvider();

/**
 * Initiates Google Sign-In flow using a popup.
 * @param authInstance The Firebase Auth instance.
 * @returns A promise that resolves with the user's credential.
 */
export async function signInWithGoogle(authInstance: Auth) {
  try {
    const result = await signInWithPopup(authInstance, provider);
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
    return { user, token };
  } catch (error: any) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData?.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    console.error('Google Sign-In Error:', {
      errorCode,
      errorMessage,
      email,
      credential,
    });
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
