import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from '../../firebase.js';
import { INQUIRIES_COLLECTION } from '../../services/inquiryService.js';
import { logAdminAction } from './adminLogService.js';

/**
 * Fetch all customer site-visit inquiries
 */
export async function getAllInquiries() {
  try {
    const inquiriesRef = collection(db, INQUIRIES_COLLECTION);
    const snap = await getDocs(inquiriesRef);

    const inquiries = [];
    snap.forEach((docSnap) => {
      inquiries.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });

    // Sort by createdAt descending
    return inquiries.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    const message = `adminInquiryService.getAllInquiries() failed while reading the inquiries collection: ${error.message}`;
    console.error(`[AdminInquiryService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Update an inquiry's workflow status
 */
export async function updateInquiryStatus(id, newStatus, internalNote = '') {
  if (!id) throw new Error('Inquiry ID is required.');

  try {
    const currentUser = auth.currentUser;
    const docRef = doc(db, INQUIRIES_COLLECTION, id);

    const updatePayload = {
      status: newStatus,
      updatedAt: serverTimestamp(),
    };

    if (internalNote.trim()) {
      const noteEntry = {
        text: internalNote.trim(),
        addedBy: currentUser?.email || 'admin',
        addedAt: new Date().toISOString(),
      };
      updatePayload.notes = arrayUnion(noteEntry);
    }

    await updateDoc(docRef, updatePayload);

    await logAdminAction({
      action: 'INQUIRY_STATUS_UPDATED',
      target: 'inquiries',
      targetId: id,
      details: { newStatus, note: internalNote || null },
    });

    return { id, ...updatePayload };
  } catch (error) {
    const message = `adminInquiryService.updateInquiryStatus() failed for inquiry ${id} in inquiries: ${error.message}`;
    console.error(`[AdminInquiryService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Delete an inquiry
 */
export async function deleteInquiry(id, customerName = '') {
  if (!id) throw new Error('Inquiry ID is required.');

  try {
    const docRef = doc(db, INQUIRIES_COLLECTION, id);
    await deleteDoc(docRef);

    await logAdminAction({
      action: 'INQUIRY_DELETED',
      target: 'inquiries',
      targetId: id,
      details: { customerName },
    });

    return { id, deleted: true };
  } catch (error) {
    const message = `adminInquiryService.deleteInquiry() failed for inquiry ${id} in inquiries: ${error.message}`;
    console.error(`[AdminInquiryService] ${message}`, error);
    throw new Error(message);
  }
}

