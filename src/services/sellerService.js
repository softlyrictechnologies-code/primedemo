import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { assertValidPropertyTitle } from '../utils/propertyValidation.js';

export const SELLER_SUBMISSIONS_COLLECTION = 'sellerSubmissions';

/**
 * Submit a property proposal by a landowner/seller for review.
 * Default status is strictly forced to 'pending'.
 * Public sellers cannot publish listings directly.
 */
export async function submitPropertyForReview(submissionData, submissionId = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`)) {
  const currentUser = auth.currentUser;
  const sellerId = currentUser ? currentUser.uid : 'community-seller';
  const title = String(submissionData.title || '').trim().replace(/\s+/g, ' ');
  const sellerName = String(submissionData.sellerName || '').trim();
  const phone = String(submissionData.sellerPhone || '').replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  const location = String(submissionData.location || '').trim();
  const areaSqFt = Number(submissionData.areaSqFt);
  const expectedPrice = Number(submissionData.expectedPrice);
  const description = String(submissionData.description || '').trim();
  assertValidPropertyTitle(title);
  if (!sellerName || sellerName.length > 100) throw new Error('Enter the landowner full name (up to 100 characters).');
  if (!/^[6-9]\d{9}$/.test(phone)) throw new Error('Enter a valid 10-digit Indian mobile number.');
  if (!location || location.length > 160) throw new Error('Enter a property location (up to 160 characters).');
  if (!Number.isFinite(areaSqFt) || areaSqFt <= 0) throw new Error('Enter a valid land area greater than zero.');
  if (!Number.isFinite(expectedPrice) || expectedPrice <= 0) throw new Error('Enter an expected price greater than zero.');
  if (!description || description.length > 2500) throw new Error('Add a property description (up to 2,500 characters).');
  if (submissionData.consent !== true) throw new Error('Consent to be contacted is required.');

  try {
    const submissionsRef = collection(db, SELLER_SUBMISSIONS_COLLECTION);
    const normalizedImages = Array.isArray(submissionData.images)
      ? submissionData.images.filter(Boolean)
      : (submissionData.image ? [submissionData.image] : []);

    const payload = {
      sellerId: sellerId,
      submissionRef: submissionId,
      title,
      propertyType: submissionData.propertyType || 'Residential Plot',
      location,
      district: String(submissionData.district || '').trim().slice(0, 100),
      town: String(submissionData.town || '').trim().slice(0, 100),
      areaSqFt,
      areaUnit: 'sqft',
      expectedPrice,
      description,
      roadAccess: String(submissionData.roadAccess || '').trim().slice(0, 500),
      approvalDetails: String(submissionData.approvalDetails || '').trim().slice(0, 500),
      additionalNotes: String(submissionData.additionalNotes || '').trim().slice(0, 1000),
      images: normalizedImages,
      status: 'pending',
      reviewStatus: 'pending',
      sellerName,
      ownerName: sellerName,
      sellerPhone: phone,
      phone,
      sellerEmail: String(submissionData.sellerEmail || '').trim().toLowerCase().slice(0, 160),
      consentToContact: true,
      dimensions: submissionData.dimensions || '',
      approval: String(submissionData.approvalDetails || '').trim().slice(0, 500) || 'Pending Verification',
      submittedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = doc(submissionsRef, submissionId);
    await setDoc(docRef, payload);
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

  // Allow public sellers to update their own pending submission with uploaded images.
  const sanitized = { ...updateData };
  if (currentUser) {
    if ('status' in sanitized) {
      const idTokenResult = await currentUser.getIdTokenResult(true).catch(() => null);
      const isVerifiedAdmin = idTokenResult?.claims?.admin === true || idTokenResult?.claims?.role === 'admin';
      if (!isVerifiedAdmin) {
        delete sanitized.status;
        console.warn('[Security] Unauthorized status override removed from seller submission update.');
      }
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
