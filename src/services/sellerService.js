import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

export const SELLER_SUBMISSIONS_COLLECTION = 'sellerSubmissions';

/**
 * Submit a property proposal by a landowner/seller for review.
 * Default status is strictly forced to 'pending'.
 * Public sellers cannot publish listings directly.
 */
export async function submitPropertyForReview(submissionData) {
  const currentUser = auth.currentUser;
  const sellerId = currentUser ? currentUser.uid : 'community-seller';

  if (!submissionData.title || typeof submissionData.title !== 'string') {
    throw new Error('Property title is required.');
  }

  try {
    const submissionsRef = collection(db, SELLER_SUBMISSIONS_COLLECTION);
    const payload = {
      sellerId: sellerId,
      title: submissionData.title.trim().slice(0, 200),
      propertyType: submissionData.propertyType || 'Residential Plot',
      location: submissionData.location || `${submissionData.locality || 'OMR'}, Chennai`,
      areaSqFt: Number(submissionData.areaSqFt) || Number(submissionData.sqft) || 1200,
      expectedPrice: Number(submissionData.expectedPrice) || (Number(submissionData.priceLakhs) * 100000) || 0,
      description: (submissionData.description || '').slice(0, 2500),
      images: Array.isArray(submissionData.images) ? submissionData.images : (submissionData.image ? [submissionData.image] : []),
      status: 'pending', // Strictly enforced default
      sellerName: submissionData.sellerName || '',
      sellerPhone: submissionData.sellerPhone || '',
      dimensions: submissionData.dimensions || '',
      facing: submissionData.facing || 'East Facing',
      approval: submissionData.approval || 'Pending Verification',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(submissionsRef, payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error('Error submitting property for review:', error);
    throw error;
  }
}

/**
 * Fetch all submissions submitted by the current authenticated seller.
 */
export async function getMySubmissions() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to view your submissions.');
  }

  try {
    const submissionsRef = collection(db, SELLER_SUBMISSIONS_COLLECTION);
    const q = query(submissionsRef, where('sellerId', '==', currentUser.uid));
    const snapshot = await getDocs(q);

    const submissions = [];
    snapshot.forEach((docSnap) => {
      submissions.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });
    return submissions;
  } catch (error) {
    console.error('Error fetching seller submissions:', error);
    throw error;
  }
}

/**
 * Update an existing submission where authorized.
 * Prevents non-admins from changing the status to 'approved' or 'published'.
 */
export async function updateSubmission(id, updateData) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to update submission.');
  }

  // Prevent unauthorized status changes from the client
  const sanitized = { ...updateData };
  if ('status' in sanitized) {
    const idTokenResult = await currentUser.getIdTokenResult(true).catch(() => null);
    const isVerifiedAdmin = idTokenResult?.claims?.admin === true || idTokenResult?.claims?.role === 'admin';
    if (!isVerifiedAdmin) {
      delete sanitized.status;
      console.warn('[Security] Unauthorized status override removed from seller submission update.');
    }
  }

  try {
    const docRef = doc(db, SELLER_SUBMISSIONS_COLLECTION, id);
    const updatePayload = {
      ...sanitized,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updatePayload);
    return { id, ...updatePayload };
  } catch (error) {
    console.error(`Error updating submission ${id}:`, error);
    throw error;
  }
}
