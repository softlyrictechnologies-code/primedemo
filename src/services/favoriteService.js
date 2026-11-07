import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

export const FAVORITES_COLLECTION = 'favorites';

/**
 * Deterministic document ID to prevent duplicate favorites per user/property
 */
function getFavoriteDocId(userId, propertyId) {
  return `${userId}_${propertyId}`;
}

/**
 * Fetch favorite property records for a specific user.
 * Enforces ownership: only current authenticated user can read their favorites.
 */
export async function getFavorites(userId) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return [];
  }

  // Enforce access control
  const targetUserId = userId || currentUser.uid;
  if (currentUser.uid !== targetUserId) {
    throw new Error('Access denied: You cannot view another user\'s favorites.');
  }

  try {
    const favoritesRef = collection(db, FAVORITES_COLLECTION);
    const q = query(favoritesRef, where('userId', '==', targetUserId));
    const snapshot = await getDocs(q);

    const favorites = [];
    snapshot.forEach((docSnap) => {
      favorites.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });
    return favorites;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
}

/**
 * Add a property to the current authenticated user's favorites.
 */
export async function addFavorite(propertyId) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to save favorite properties.');
  }
  if (!propertyId) {
    throw new Error('Property ID is required.');
  }

  try {
    const docId = getFavoriteDocId(currentUser.uid, propertyId);
    const docRef = doc(db, FAVORITES_COLLECTION, docId);

    const payload = {
      userId: currentUser.uid,
      propertyId: propertyId,
      createdAt: serverTimestamp(),
    };

    await setDoc(docRef, payload, { merge: true });
    return { id: docId, ...payload };
  } catch (error) {
    console.error('Error adding favorite to Firestore:', error);
    throw error;
  }
}

/**
 * Remove a property from the current authenticated user's favorites.
 */
export async function removeFavorite(propertyId) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to remove favorite.');
  }
  if (!propertyId) {
    throw new Error('Property ID is required.');
  }

  try {
    const docId = getFavoriteDocId(currentUser.uid, propertyId);
    const docRef = doc(db, FAVORITES_COLLECTION, docId);
    await deleteDoc(docRef);
    return { propertyId, removed: true };
  } catch (error) {
    console.error('Error removing favorite from Firestore:', error);
    throw error;
  }
}
