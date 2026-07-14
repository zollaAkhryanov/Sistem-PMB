import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBULj_qwDx7IUWFtkwWeXvYxbjwpvlC490",
  authDomain: "mypmb-b19b7.firebaseapp.com",
  projectId: "mypmb-b19b7",
  storageBucket: "mypmb-b19b7.firebasestorage.app",
  messagingSenderId: "795887338786",
  appId: "1:795887338786:web:88cbea6ca80738416c117b",
  measurementId: "G-R6JL2NG5VS",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection
export let isFirebaseConnected = false;
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    isFirebaseConnected = true;
    console.log("Firebase initialized and connected successfully!");
  } catch (error) {
    console.warn("Firebase is operating, but could not verify live Firestore connection. Fallback to responsive offline state if needed.", error);
    isFirebaseConnected = false;
  }
}

testConnection();

export default app;
