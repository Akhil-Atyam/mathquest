'use client';
import {
  Auth,
  signInAnonymously as firebaseSignInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { Student, Teacher } from '@/lib/types';

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
 * Creates a user profile document in Firestore.
 * @param userId The UID of the user.
 * @param profileData The user's profile data.
 * @param role The user's role ('student' or 'teacher').
 */
export async function createUserProfile(
  userId: string,
  profileData: Omit<Student, 'grade' | 'completedLessons' | 'quizScores' | 'badges'> | Omit<Teacher, 'availability'>,
  role: 'student' | 'teacher'
): Promise<void> {
  const { firestore } = initializeFirebase();
  const collectionPath = role === 'teacher' ? 'teachers' : 'users';
  const userDocRef = doc(firestore, collectionPath, userId);
  try {
    await setDoc(userDocRef, profileData);
    console.log(`${role} profile created for user ${userId}`);
  } catch (error) {
    console.error(`Failed to create ${role} profile for user ${userId}`, error);
    throw error;
  }
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
    try {
        await setDoc(teacherRoleRef, { role: 'teacher' });
        console.log(`Teacher role set for user ${userId}`);
    } catch (error) {
        console.error(`Failed to set teacher role for user ${userId}`, error);
        throw error;
    }
}


// You can create a simple component to use this, or integrate it directly
// into your existing login components.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This component can be used to wrap parts of your app that need auth context
  return <>{children}</>;
}
