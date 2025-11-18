'use client';
import {
  Auth,
  signInAnonymously as firebaseSignInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
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
  try {
    const userCredential = await createUserWithEmailAndPassword(
      authInstance,
      email,
      password
    );
    return userCredential;
  } catch (error: any) {
    console.error('Email Sign-Up Error:', error);
    throw error;
  }
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
  
  // Create user profile
  await setDoc(userDocRef, profileData)
    .catch((error) => {
        const contextualError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: profileData,
        });
        errorEmitter.emit('permission-error', contextualError);
        throw error;
    });

  // Create username to email mapping
  const usernameRef = doc(firestore, "usernames", profileData.username);
  const usernameData = { email: profileData.email, uid: userId };
  await setDoc(usernameRef, usernameData)
    .catch((error) => {
        const contextualError = new FirestorePermissionError({
            path: usernameRef.path,
            operation: 'create',
            requestResourceData: usernameData,
        });
        errorEmitter.emit('permission-error', contextualError);
        throw error;
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
  try {
    const userCredential = await signInWithEmailAndPassword(
      authInstance,
      email,
      password
    );
    return userCredential;
  } catch (error: any) {
    console.error('Email Sign-In Error:', error);
    throw error;
  }
}

/**
 * Creates a document in the 'roles_teacher' collection to assign a teacher role.
 * @param userId The UID of the user to be assigned the teacher role.
 */
export async function setTeacherRole(userId: string): Promise<void> {
    const { firestore } = initializeFirebase();
    const teacherRoleRef = doc(firestore, 'roles_teacher', userId);
    const roleData = { role: 'teacher' };
    
    await setDoc(teacherRoleRef, roleData)
        .catch((error) => {
            const contextualError = new FirestorePermissionError({
                path: teacherRoleRef.path,
                operation: 'create',
                requestResourceData: roleData
            });
            errorEmitter.emit('permission-error', contextualError);
            throw error;
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
        console.error("Error checking teacher status:", error);
        // In case of error (e.g. permissions), assume not a teacher.
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
            console.log("No such username!");
            return null;
        }
    } catch (error) {
        console.error("Error getting username doc:", error);
        // We don't throw a contextual error here because a failed read is expected
        // if a user mistypes their username. We just return null.
        return null;
    }
}


// You can create a simple component to use this, or integrate it directly
// into your existing login components.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This component can be used to wrap parts of your app that need auth context
  return <>{children}</>;
}
