'use client';
import { getAuth, type User } from 'firebase/auth';

/**
 * Defines the context for a Firestore operation that might fail due to security rules.
 * This information is used to construct a detailed error message.
 */
type SecurityRuleContext = {
  path: string; // The Firestore path of the operation (e.g., 'users/userId').
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write'; // The type of Firestore operation.
  requestResourceData?: any; // The data being sent with a write operation (create, update, set).
};

/**
 * An interface that mimics the structure of the `request.auth.token` object
 * available within Firestore Security Rules.
 */
interface FirebaseAuthToken {
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string; // The user's UID.
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    tenant: string | null;
  };
}

/**
 * An interface that mimics the structure of the `request.auth` object
 * available within Firestore Security Rules.
 */
interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

/**
 * An interface that mimics the overall `request` object in security rules.
 * This is the final object that gets stringified and shown in the error overlay.
 */
interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/**
 * Builds a security-rule-compliant auth object from the Firebase `User` object.
 * This function translates the client-side User object into a format that
 * developers will recognize from writing security rules.
 * @param {User | null} currentUser - The currently authenticated Firebase user.
 * @returns {FirebaseAuthObject | null} An object that mirrors `request.auth` in security rules, or null if no user.
 */
function buildAuthObject(currentUser: User | null): FirebaseAuthObject | null {
  if (!currentUser) {
    return null;
  }

  // Construct the token object with relevant user details.
  const token: FirebaseAuthToken = {
    name: currentUser.displayName,
    email: currentUser.email,
    email_verified: currentUser.emailVerified,
    phone_number: currentUser.phoneNumber,
    sub: currentUser.uid,
    firebase: {
      identities: currentUser.providerData.reduce((acc, p) => {
        if (p.providerId) {
          acc[p.providerId] = [p.uid];
        }
        return acc;
      }, {} as Record<string, string[]>),
      sign_in_provider: currentUser.providerData[0]?.providerId || 'custom',
      tenant: currentUser.tenantId,
    },
  };

  return {
    uid: currentUser.uid,
    token: token,
  };
}

/**
 * Builds the complete, simulated request object for the error message.
 * It safely tries to get the current authenticated user and combines it with
 * the operation context.
 * @param {SecurityRuleContext} context - The context of the failed Firestore operation.
 * @returns {SecurityRuleRequest} A structured request object for debugging.
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;
  try {
    // Safely attempt to get the current user. This might fail if Firebase isn't initialized.
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      authObject = buildAuthObject(currentUser);
    }
  } catch {
    // If getting the auth instance fails, we proceed without auth info.
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`, // Format path to match security rule logs.
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

/**
 * Builds the final, formatted error message string to be displayed.
 * @param {SecurityRuleRequest} requestObject - The simulated request object.
 * @returns {string} A string containing the error message and the JSON payload.
 */
function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(requestObject, null, 2)}`;
}

/**
 * A custom error class for Firestore permission errors.
 * It is designed to be thrown when a Firestore operation fails due to security rules.
 * The error message is structured to be highly informative for debugging, mimicking
 * the information available within the security rules environment itself.
 */
export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    // Call the parent `Error` constructor with the formatted message.
    super(buildErrorMessage(requestObject));
    // Set the error name for easier identification.
    this.name = 'FirebaseError';
    // Store the request object on the error for programmatic access if needed.
    this.request = requestObject;
  }
}
