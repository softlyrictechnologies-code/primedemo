import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

export const USERS_COLLECTION = 'users';

/**
 * Fetch a user profile by UID
 */
export async function getUserProfile(uid) {
  if (!uid) throw new Error('User UID is required.');
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }
    return { uid: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error(`Error fetching user profile for ${uid}:`, error);
    throw error;
  }
}

/**
 * Creates a user profile upon registration.
 * Explicitly guards against unauthorized 'admin' role assignment.
 */
export async function createUserProfile(userData) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to create user profile.');
  }

  const targetUid = userData.uid || currentUser.uid;
  if (currentUser.uid !== targetUid) {
    throw new Error('You cannot create a profile for another user.');
  }

  // Prevent users from granting themselves admin role
  let role = userData.role || 'buyer';
  if (role === 'admin') {
    // Only permit if current user's token already contains verified admin claim
    const idTokenResult = await currentUser.getIdTokenResult(true).catch(() => null);
    const isVerifiedAdmin = idTokenResult?.claims?.admin === true || idTokenResult?.claims?.role === 'admin';
    if (!isVerifiedAdmin) {
      console.warn('[Security] User attempted to assign admin role without authorization. Defaulting to buyer.');
      role = 'buyer';
    }
  }

  const payload = {
    uid: targetUid,
    name: (userData.name || currentUser.displayName || 'PlotFinder User').trim().slice(0, 100),
    email: (userData.email || currentUser.email || '').trim().toLowerCase(),
    phone: (userData.phone || currentUser.phoneNumber || '').trim().slice(0, 20),
    role: role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = doc(db, USERS_COLLECTION, targetUid);
    await setDoc(docRef, payload, { merge: true });
    return { ...payload };
  } catch (error) {
    console.error('Error creating user profile in Firestore:', error);
    throw error;
  }
}

/**
 * Updates an existing user profile.
 * Prohibits self-escalation to the 'admin' role.
 */
export async function updateUserProfile(uid, updateData) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to update profile.');
  }

  if (currentUser.uid !== uid) {
    throw new Error('You may only update your own profile.');
  }

  // Strip or protect the role field against self-escalation
  const sanitized = { ...updateData };
  if ('role' in sanitized && sanitized.role === 'admin') {
    const idTokenResult = await currentUser.getIdTokenResult(true).catch(() => null);
    const isVerifiedAdmin = idTokenResult?.claims?.admin === true || idTokenResult?.claims?.role === 'admin';
    if (!isVerifiedAdmin) {
      delete sanitized.role;
      console.warn('[Security] Blocked unauthorized role escalation attempt to admin.');
    }
  }

  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const updatePayload = {
      ...sanitized,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updatePayload);
    return { uid, ...updatePayload };
  } catch (error) {
    console.error(`Error updating user profile for ${uid}:`, error);
    throw error;
  }
}
