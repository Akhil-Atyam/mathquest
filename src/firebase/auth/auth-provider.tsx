'use client';
import {
  Auth,
  signInAnonymously as firebaseSignInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
 * Creates a user profile document in Firestore.
 * @param userId The UID of the user.
 * @param profileData The user's profile data.
 * @param role The user's role ('student' or 'teacher').
 */
export function createUserProfile(
  userId: string,
  profileData: Omit<Student, 'grade' | 'completedLessons' | 'quizScores' | 'badges'> | Omit<Teacher, 'availability'>,
  role: 'student' | 'teacher'
): void {
  const { firestore } = initializeFirebase();
  const collectionPath = role === 'teacher' ? 'teachers' : 'users';
  const userDocRef = doc(firestore, collectionPath, userId);
  
  setDoc(userDocRef, profileData)
    .then(() => {
        console.log(`${role} profile created for user ${userId}`);
    })
    .catch((error) => {
        const contextualError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: profileData,
        });
        errorEmitter.emit('permission-error', contextualError);
        // We still throw the original error for other potential issues
        // but the listener will catch and display the contextual one.
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
export function setTeacherRole(userId: string): void {
    const { firestore } = initializeFirebase();
    const teacherRoleRef = doc(firestore, 'roles_teacher', userId);
    const roleData = { role: 'teacher' };
    
    setDoc(teacherRoleRef, roleData)
        .then(() => {
            console.log(`Teacher role set for user ${userId}`);
        })
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
 * Finds the email associated with a given username by querying Firestore.
 * @param username The username to look up.
 * @returns A promise that resolves with the user's email, or null if not found.
 */
export async function getUserEmailForUsername(username: string): Promise<string | null> {
    const { firestore } = initializeFirebase();
    
    // Query students collection
    const studentsRef = collection(firestore, 'users');
    const studentQuery = query(studentsRef, where("username", "==", username));
    const studentSnapshot = await getDocs(studentQuery);

    if (!studentSnapshot.empty) {
        // Found student, return email
        const studentData = studentSnapshot.docs[0].data();
        return studentData.email;
    }

    // Query teachers collection if not found in students
    const teachersRef = collection(firestore, 'teachers');
    const teacherQuery = query(teachersRef, where("username", "==", username));
    const teacherSnapshot = await getDocs(teacherQuery);

    if (!teacherSnapshot.empty) {
        // Found teacher, return email
        const teacherData = teacherSnapshot.docs[0].data();
        return teacherData.email;
    }

    // Username not found in either collection
    return null;
}


// You can create a simple component to use this, or integrate it directly
// into your existing login components.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This component can be used to wrap parts of your app that need auth context
  return <>{children}</>;
}
