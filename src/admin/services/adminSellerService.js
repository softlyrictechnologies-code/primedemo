import {
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase.js';
import { SELLER_SUBMISSIONS_COLLECTION } from '../../services/sellerService.js';
import { PROPERTIES_COLLECTION } from '../../services/propertyService.js';
import { logAdminAction } from './adminLogService.js';
import { assertValidPropertyTitle } from '../../utils/propertyValidation.js';

export const LANDOWNER_SUBMISSIONS_COLLECTION = 'landowner_submissions';

/**
 * Fetch all landowner/seller property proposals (reads both sellerSubmissions and landowner_submissions)
 */
export async function getAllSubmissions() {
  try {
    const submissions = [];
    const seenIds = new Set();

    try {
      const snap1 = await getDocs(collection(db, SELLER_SUBMISSIONS_COLLECTION));
      snap1.forEach((docSnap) => {
        if (!seenIds.has(docSnap.id)) {
          seenIds.add(docSnap.id);
          submissions.push({ id: docSnap.id, _collection: SELLER_SUBMISSIONS_COLLECTION, ...docSnap.data() });
        }
      });
    } catch (e) {
      console.warn('[AdminSellerService] Could not read sellerSubmissions:', e.message);
    }

    try {
      const snap2 = await getDocs(collection(db, 'sellerSubmissions'));
      snap2.forEach((docSnap) => {
        if (!seenIds.has(docSnap.id)) {
          seenIds.add(docSnap.id);
          submissions.push({ id: docSnap.id, _collection: LANDOWNER_SUBMISSIONS_COLLECTION, ...docSnap.data() });
        }
      });
    } catch (e) {
      // Ignored
    }

    return submissions.sort((a, b) => {
      const timeA = a.createdAt?.seconds || a.submittedAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || b.submittedAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    const message = `adminSellerService.getAllSubmissions() failed: ${error.message}`;
    console.error(`[AdminSellerService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Approves a seller proposal and creates a private draft for admin editing.
 */
export async function approveAndCreateDraft(submission, customOverrides = {}) {
  const currentUser = auth.currentUser;
  if (!submission || !submission.id) {
    throw new Error('Valid submission object with ID is required.');
  }

  try {
    const targetColl = submission._collection || SELLER_SUBMISSIONS_COLLECTION;
    const subDocRef = doc(db, targetColl, submission.id);
    const title = String(customOverrides.title ?? submission.title ?? '').trim().replace(/\s+/g, ' ');
    assertValidPropertyTitle(title);
    const location = String(customOverrides.location ?? submission.location ?? '').trim();
    const areaSqFt = Number(customOverrides.areaSqFt ?? submission.areaSqFt);
    const price = Number(customOverrides.price ?? submission.expectedPrice);
    if (!location) throw new Error('Add a property location before approving this submission.');
    if (!Number.isFinite(areaSqFt) || areaSqFt <= 0) throw new Error('A valid land area is required before creating a listing draft.');
    if (!Number.isFinite(price) || price <= 0) throw new Error('A valid expected price is required before creating a listing draft.');

    const priceLakhs = Number((price / 100000).toFixed(2));
    const images = Array.isArray(submission.images) ? submission.images.filter(Boolean) : [];
    const newPropertyPayload = {
      title,
      subTitle: submission.subTitle || '',
      description: submission.description || '',
      propertyType: submission.propertyType || 'Residential Plot',
      location,
      area: submission.area || location,
      district: submission.district || '',
      town: submission.town || '',
      city: submission.city || 'Chennai',
      areaSqFt,
      price,
      priceLakhs,
      pricePerSqFt: Math.round(price / areaSqFt),
      ...(submission.facing ? { facing: submission.facing } : {}),
      ...(submission.approval ? { approval: submission.approval } : {}),
      ...(submission.approvalNo ? { approvalNo: submission.approvalNo } : {}),
      ...(submission.dimensions ? { dimensions: submission.dimensions } : {}),
      ...(submission.roadAccess ? { roadAccess: submission.roadAccess } : {}),
      ...(submission.approvalDetails ? { approvalDetails: submission.approvalDetails } : {}),
      images,
      imageUrls: images,
      image: images[0] || '',
      published: false,
      status: 'draft',
      isSoldOut: false,
      soldOutAt: null,
      featured: false,
      verified: false,
      createdBy: currentUser?.uid || 'admin',
      originalSellerId: submission.sellerId || null,
      sourceSubmissionId: submission.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const propertyDocRef = doc(collection(db, PROPERTIES_COLLECTION));
    const batch = writeBatch(db);
    batch.set(propertyDocRef, newPropertyPayload);
    batch.update(subDocRef, {
      status: 'approved',
      reviewStatus: 'approved',
      approvedBy: currentUser?.email || 'admin',
      approvedAt: serverTimestamp(),
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedPropertyId: propertyDocRef.id,
    });
    await batch.commit();

    await logAdminAction({
      action: 'SELLER_SUBMISSION_APPROVED_DRAFT_CREATED',
      target: targetColl,
      targetId: submission.id,
      details: {
        submissionTitle: submission.title,
        createdPropertyId: propertyDocRef.id,
      },
    });

    return {
      submissionId: submission.id,
      propertyId: propertyDocRef.id,
      status: 'approved',
    };
  } catch (error) {
    const message = `adminSellerService.approveAndCreateDraft() failed for ${submission?._collection || SELLER_SUBMISSIONS_COLLECTION}/${submission?.id}: ${error.message}`;
    console.error(`[AdminSellerService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Rejects a seller submission with reason
 */
export async function rejectSubmission(id, reason = 'Document verification failed or incomplete title.', collectionName = SELLER_SUBMISSIONS_COLLECTION) {
  if (!id) throw new Error('Submission ID is required.');

  try {
    const targetColl = collectionName || SELLER_SUBMISSIONS_COLLECTION;
    const docRef = doc(db, targetColl, id);
    const payload = {
      status: 'rejected',
      reviewStatus: 'rejected',
      rejectionReason: reason.trim(),
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, payload);

    await logAdminAction({
      action: 'SELLER_SUBMISSION_REJECTED',
      target: targetColl,
      targetId: id,
      details: { reason },
    });

    return { id, ...payload };
  } catch (error) {
    const message = `adminSellerService.rejectSubmission() failed for ${id}: ${error.message}`;
    console.error(`[AdminSellerService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Request corrections/clarifications from seller
 */
export async function requestRevision(id, notes = 'Please provide updated survey sketch and clear patta document.', collectionName = SELLER_SUBMISSIONS_COLLECTION) {
  if (!id) throw new Error('Submission ID is required.');

  try {
    const targetColl = collectionName || SELLER_SUBMISSIONS_COLLECTION;
    const docRef = doc(db, targetColl, id);
    const payload = {
      status: 'needs_revision',
      reviewStatus: 'needs_revision',
      revisionNotes: notes.trim(),
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, payload);

    await logAdminAction({
      action: 'SELLER_REVISION_REQUESTED',
      target: targetColl,
      targetId: id,
      details: { notes },
    });

    return { id, ...payload };
  } catch (error) {
    const message = `adminSellerService.requestRevision() failed for ${id}: ${error.message}`;
    console.error(`[AdminSellerService] ${message}`, error);
    throw new Error(message);
  }
}

