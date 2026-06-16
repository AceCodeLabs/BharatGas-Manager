import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, runTransaction, serverTimestamp, collection } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); 
export const auth = getAuth();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Atomically confirms an order:
 * 1. Deducts points from user profile
 * 2. Updates order status to completed
 * 3. Creates a transaction log
 */
export async function confirmOrderAtomic(orderId: string, userId: string, accountMobile: string, points: number) {
  const profileRef = doc(db, 'userProfiles', userId);
  const orderRef = doc(db, 'orders', orderId);
  const txRef = doc(collection(db, 'transactions'));

  try {
    await runTransaction(db, async (transaction) => {
      const profileSnap = await transaction.get(profileRef);
      const orderSnap = await transaction.get(orderRef);

      if (!profileSnap.exists()) throw new Error("User profile not found");
      if (!orderSnap.exists()) throw new Error("Order not found");
      if (orderSnap.data().status === 'completed') throw new Error("Order already completed");

      const currentPoints = profileSnap.data().totalPoints;
      const cost = Math.abs(points);

      if (currentPoints < cost) {
        throw new Error("Insufficient Balance");
      }

      // 1. Update Profile
      transaction.update(profileRef, {
        totalPoints: currentPoints - cost,
        updatedAt: serverTimestamp()
      });

      // 2. Update Order
      transaction.update(orderRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        points: -cost
      });

      // 3. Log Transaction
      transaction.set(txRef, {
        type: 'debit',
        amount: cost,
        reason: `Order #${orderSnap.data().orderId} Confirmed`,
        account: accountMobile,
        ownerId: userId,
        createdAt: serverTimestamp()
      });
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `atomic/order/${orderId}`);
    return false;
  }
}

// Validation connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
