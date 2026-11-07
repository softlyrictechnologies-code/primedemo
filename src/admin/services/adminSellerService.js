import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase.js';
import { SELLER_SUBMISSIONS_COLLECTION } from '../../services/sellerService.js';
import { PROPERTIES_COLLECTION } from '../../services/propertyService.js';
import { logAdminAction } from './adminLogService.js';

/**
 * Fetch all seller property proposals
 */
export async function getAllSubmissions() {
  try {
    const submissionsRef = collection(db, SELLER_SUBMISSIONS_COLLECTION);
    const snap = await getDocs(submissionsRef);

    const submissions = [];
    snap.forEach((docSnap) => {
      submissions.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    return submissions.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    const message = `adminSellerService.getAllSubmissions() failed while reading the sellerSubmissions collection: ${error.message}`;
    console.error(`[AdminSellerService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Approves a seller proposal and converts it into an active listing in `properties`
 */
export async function approveAndPublishSubmission(submission, customOverrides = {}) {
  const currentUser = auth.currentUser;
  if (!submission || !submission.id) {
    throw new Error('Valid submission object with ID is required.');
  }

  try {
    const subDocRef = doc(db, SELLER_SUBMISSIONS_COLLECTION, submission.id);

    // 1. Mark submission as approved
    await updateDoc(subDocRef, {
      status: 'approved',
      approvedBy: currentUser?.email || 'admin',
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 2. Publish as an active listing into properties collection
    const priceLakhs = Number(customOverrides.priceLakhs) || 
      (submission.expectedPrice ? Number((submission.expectedPrice / 100000).toFixed(2)) : 50);
    const price = Number(customOverrides.price) || (priceLakhs * 100000);
    const areaSqFt = Number(customOverrides.areaSqFt) || Number(submission.areaSqFt) || 1200;
    const pricePerSqFt = Math.round(price / (areaSqFt || 1));

    const images = Array.isArray(submission.images) && submission.images.length > 0
      ? submission.images
      : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'];

    const newPropertyPayload = {
      title: (customOverrides.title || submission.title || 'Verified Residential Plot').trim(),
      subTitle: `CMDA Verified Plot in ${submission.location || 'Chennai'}`,
      description: submission.description || 'Verified clear-title property approved by legal audit.',
      propertyType: submission.propertyType || 'Residential Plot',
      location: submission.location || 'Chennai',
      area: submission.area || 'OMR',
      city: 'Chennai',
      areaSqFt: areaSqFt,
      price: price,
      priceLakhs: priceLakhs,
      pricePerSqFt: pricePerSqFt,
      facing: submission.facing || 'East Facing',
      approval: submission.approval || 'CMDA Approved',
      approvalNo: 'CMDA/VERIFIED/' + new Date().getFullYear(),
      dimensions: submission.dimensions || '30 ft x 40 ft',
      roadWidth: '30 Feet Blacktop Road',
      pattaStatus: 'Clear Ownership Patta Verified',
      waterSource: 'Sweet Potable Ground Water',
      bankLoans: ['HDFC', 'SBI', 'ICICI'],
      amenities: ['24/7 Security', 'Tar Road', 'EB Line'],
      landmarks: [`Near ${submission.location || 'Chennai'}`],
      appreciationRate: '+12.0% YoY',
      images: images,
      imageUrls: images,
      published: true, // Published to public listing immediately
      featured: false,
      verified: true,
      createdBy: currentUser?.uid || 'admin',
      originalSellerId: submission.sellerId || null,
      sourceSubmissionId: submission.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const propertiesRef = collection(db, PROPERTIES_COLLECTION);
    const propertyDocRef = await addDoc(propertiesRef, newPropertyPayload);

    // Link the created property back to the submission
    await updateDoc(subDocRef, {
      publishedPropertyId: propertyDocRef.id,
    });

    await logAdminAction({
      action: 'SELLER_SUBMISSION_APPROVED_AND_PUBLISHED',
      target: 'sellerSubmissions',
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
    const message = `adminSellerService.approveAndPublishSubmission() failed for sellerSubmissions/${submission?.id}: ${error.message}`;
    console.error(`[AdminSellerService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Rejects a seller submission with reason
 */
export async function rejectSubmission(id, reason = 'Document verification failed or incomplete title.') {
  if (!id) throw new Error('Submission ID is required.');

  try {
    const docRef = doc(db, SELLER_SUBMISSIONS_COLLECTION, id);
    const payload = {
      status: 'rejected',
      rejectionReason: reason.trim(),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, payload);

    await logAdminAction({
      action: 'SELLER_SUBMISSION_REJECTED',
      target: 'sellerSubmissions',
      targetId: id,
      details: { reason },
    });

    return { id, ...payload };
  } catch (error) {
    const message = `adminSellerService.rejectSubmission() failed for sellerSubmissions/${id}: ${error.message}`;
    console.error(`[AdminSellerService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Request corrections/clarifications from seller
 */
export async function requestRevision(id, notes = 'Please provide updated survey sketch and clear patta document.') {
  if (!id) throw new Error('Submission ID is required.');

  try {
    const docRef = doc(db, SELLER_SUBMISSIONS_COLLECTION, id);
    const payload = {
      status: 'needs_revision',
      revisionNotes: notes.trim(),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, payload);

    await logAdminAction({
      action: 'SELLER_REVISION_REQUESTED',
      target: 'sellerSubmissions',
      targetId: id,
      details: { notes },
    });

    return { id, ...payload };
  } catch (error) {
    const message = `adminSellerService.requestRevision() failed for sellerSubmissions/${id}: ${error.message}`;
    console.error(`[AdminSellerService] ${message}`, error);
    throw new Error(message);
  }
}

