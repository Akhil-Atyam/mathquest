'use client';
import {
  Auth,
  signInAnonymously as firebaseSignInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, writeBatch } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { Student, Teacher } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


/**
 * Initiates Anonymous Sign-In flow.
 * @param authInstance The Firebase Auth instance.
 * @returns A promise that resolves with the user's credential.
 */
export async function signInAnonymously(authInstance: Auth) {
  try {
    const result = await firebaseSignInAnonymously(authInstance);
    return result;
  } catch (error: any) {
    console.error('Anonymous Sign-In Error:', error);
    throw error;
  }
}

/**
 * Initiates email/password sign-up.
 * @param authInstance The Firebase Auth instance.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves with the user's credential.
 */
export async function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(
      authInstance,
      email,
      password
    );
    return userCredential;
}

/**
 * Creates a user profile document in Firestore and a username mapping.
 * @param userId The UID of the user.
 * @param profileData The user's profile data, including username.
 * @param role The user's role ('student' or 'teacher').
 */
export async function createUserProfile(
  userId: string,
  profileData: Omit<Student, 'completedLessons' | 'quizScores' | 'badges'> | Omit<Teacher, 'availability'>,
  role: 'student' | 'teacher'
): Promise<void> {
  const { firestore } = initializeFirebase();
  const collectionPath = role === 'teacher' ? 'teachers' : 'users';
  const userDocRef = doc(firestore, collectionPath, userId);
  const usernameRef = doc(firestore, "usernames", profileData.username);
  const usernameData = { email: profileData.email, uid: userId };

  const batch = writeBatch(firestore);

  batch.set(userDocRef, profileData);
  batch.set(usernameRef, usernameData);
  
  await batch.commit()
    .catch((error) => {
        // Since this is a batch, we can't know which write failed.
        // We'll emit a general error, but a more sophisticated implementation
        // might try to determine the failed operation.
        const contextualError = new FirestorePermissionError({
            path: `batch write to ${collectionPath} and usernames`,
            operation: 'create',
            requestResourceData: { profile: profileData, username: usernameData },
        });
        errorEmitter.emit('permission-error', contextualError);
        throw error; // Re-throw original error
    });
}


/**
 * Initiates email/password sign-in.
 * @param authInstance The Firebase Auth instance.
 * @param email The user's email.
 * @param password The user's password.
 * @returns A promise that resolves with the user's credential.
 */
export async function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
    const userCredential = await signInWithEmailAndPassword(
      authInstance,
      email,
      password
    );
    return userCredential;
}

/**
 * Creates a document in the 'roles_teacher' collection to assign a teacher role.
 * @param userId The UID of the user to be assigned the teacher role.
 */
export async function setTeacherRole(userId: string): Promise<void> {
    const { firestore } = initializeFirebase();
    const teacherRoleRef = doc(firestore, 'roles_teacher', userId);
    const roleData = { role: 'teacher' };
    
    setDoc(teacherRoleRef, roleData)
        .catch((error) => {
            const contextualError = new FirestorePermissionError({
                path: teacherRoleRef.path,
                operation: 'create',
                requestResourceData: roleData
            });
            errorEmitter.emit('permission-error', contextualError);
            // We don't re-throw here because the login flow might need to continue,
            // but the error will be surfaced in the dev overlay.
        });
}

/**
 * Checks if a user has a teacher profile document.
 * @param userId The UID of the user to check.
 * @returns A promise that resolves with true if the user is a teacher, false otherwise.
 */
export async function isTeacher(userId: string): Promise<boolean> {
    const { firestore } = initializeFirebase();
    const teacherDocRef = doc(firestore, 'teachers', userId);
    try {
        const docSnap = await getDoc(teacherDocRef);
        return docSnap.exists();
    } catch (error) {
        // This read operation is not expected to fail under normal circumstances,
        // but if it does (e.g., offline), we don't want to show a permission error.
        // We'll log it and assume not a teacher.
        console.error("Error checking teacher status:", error);
        return false;
    }
}

/**
 * Finds the email associated with a given username by looking up the mapping in the `/usernames` collection.
 * @param username The username to look up.
 * @returns A promise that resolves with the user's email, or null if not found.
 */
export async function getUserEmailForUsername(username: string): Promise<string | null> {
    const { firestore } = initializeFirebase();
    const usernameDocRef = doc(firestore, 'usernames', username);

    try {
        const docSnap = await getDoc(usernameDocRef);

        if (docSnap.exists()) {
            return docSnap.data().email;
        } else {
            return null;
        }
    } catch (error) {
       // A failed read for a non-existent username is an expected scenario, not a permission error.
       // We don't emit a contextual error here.
       return null;
    }
}


// You can create a simple component to use this, or integrate it directly
// into your existing login components.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This component can be used to wrap parts of your app that need auth context
  return <>{children}</>;
}
