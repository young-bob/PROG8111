/**
 * Smart AI Tracker — Firebase Service
 * Handles Firebase Authentication and Realtime Database sync.
 */
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {Transaction, CategoryName, TransactionType, TransactionSource} from '../types';

// ---- Authentication ----

/**
 * Registers a new user with email and password.
 */
export async function registerUser(
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.User> {
  const credential = await auth().createUserWithEmailAndPassword(email, password);
  return credential.user;
}

/**
 * Signs in an existing user with email and password.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.User> {
  const credential = await auth().signInWithEmailAndPassword(email, password);
  return credential.user;
}

/**
 * Signs out the current user.
 */
export async function logoutUser(): Promise<void> {
  await auth().signOut();
}

/**
 * Gets the currently signed-in user (or null).
 */
export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth().currentUser;
}

/**
 * Subscribes to auth state changes.
 */
export function onAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void,
): () => void {
  return auth().onAuthStateChanged(callback);
}

// ---- Realtime Database: Upload (Local → Cloud) ----

/**
 * Pushes a single transaction to Firebase under the user's node.
 */
export async function pushTransactionToCloud(
  uid: string,
  transaction: Transaction,
): Promise<void> {
  await database()
    .ref(`/users/${uid}/transactions/${transaction.id}`)
    .set({
      title: transaction.title,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
      note: transaction.note,
      source: transaction.source,
      createdAt: new Date(transaction.createdAt).getTime(),
    });
}

/**
 * Saves user profile to Firebase.
 */
export async function saveUserProfile(
  uid: string,
  email: string,
  displayName: string,
): Promise<void> {
  await database().ref(`/users/${uid}/profile`).set({
    email,
    displayName,
  });
}

// ---- Realtime Database: Download (Cloud → Local) ----

/**
 * Fetches all transactions from Firebase for a given user.
 * Used when user logs in on a new device and local DB is empty.
 */
export async function fetchTransactionsFromCloud(
  uid: string,
): Promise<Transaction[]> {
  const snapshot = await database()
    .ref(`/users/${uid}/transactions`)
    .once('value');

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();
  const transactions: Transaction[] = [];

  Object.keys(data).forEach(key => {
    const item = data[key];
    transactions.push({
      id: key,
      userId: uid,
      title: item.title || 'Unknown',
      amount: item.amount || 0,
      category: (item.category as CategoryName) || 'Others',
      type: (item.type as TransactionType) || 'Expense',
      date: item.date || new Date().toISOString().split('T')[0],
      note: item.note || '',
      source: (item.source as TransactionSource) || 'manual',
      isSynced: true,
      createdAt: item.createdAt
        ? new Date(item.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  return transactions;
}

/**
 * Deletes a transaction from Firebase.
 */
export async function deleteTransactionFromCloud(
  uid: string,
  transactionId: string,
): Promise<void> {
  await database()
    .ref(`/users/${uid}/transactions/${transactionId}`)
    .remove();
}

// ---- Realtime Sync: Live Listener ----

/**
 * Subscribes to real-time changes on the user's transactions in Firebase.
 * Fires callback whenever any device adds/edits/deletes a transaction.
 * Returns an unsubscribe function.
 */
export function onTransactionsChanged(
  uid: string,
  callback: (transactions: Transaction[]) => void,
): () => void {
  const ref = database().ref(`/users/${uid}/transactions`);

  const listener = ref.on('value', snapshot => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val();
    const transactions: Transaction[] = [];

    Object.keys(data).forEach(key => {
      const item = data[key];
      transactions.push({
        id: key,
        userId: uid,
        title: item.title || 'Unknown',
        amount: item.amount || 0,
        category: (item.category as CategoryName) || 'Others',
        type: (item.type as TransactionType) || 'Expense',
        date: item.date || new Date().toISOString().split('T')[0],
        note: item.note || '',
        source: (item.source as TransactionSource) || 'manual',
        isSynced: true,
        createdAt: item.createdAt
          ? new Date(item.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    callback(transactions);
  });

  // Return unsubscribe function
  return () => ref.off('value', listener);
}
