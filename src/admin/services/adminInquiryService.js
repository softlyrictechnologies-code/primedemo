import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from '../../firebase.js';
import { INQUIRIES_COLLECTION } from '../../services/inquiryService.js';
import { logAdminAction } from './adminLogService.js';

export const BUYER_ENQUIRIES_COLLECTION = INQUIRIES_COLLECTION;

/**
 * Fetch all buyer enquiries (supports both inquiries and buyer_enquiries)
 */
export async function getAllInquiries() {
  try {
    const inquiries = [];
    const seenIds = new Set();

    const snapshot = await getDocs(collection(db, INQUIRIES_COLLECTION));
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!seenIds.has(docSnap.id)) {
        seenIds.add(docSnap.id);
        inquiries.push({
          ...data,
          id: docSnap.id,
          _collection: INQUIRIES_COLLECTION,
          name: data.name || data.customerName || '',
          phone: data.phone || data.customerPhone || '',
          email: data.email || data.customerEmail || '',
          propertyTitle: data.propertyTitle || '',
        });
      }
    });

    // Sort by createdAt descending
    return inquiries.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    const message = `adminInquiryService.getAllInquiries() failed: ${error.message}`;
    console.error(`[AdminInquiryService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Update an inquiry's workflow status
 */
export async function updateInquiryStatus(id, newStatus, internalNote = '', collectionName = INQUIRIES_COLLECTION) {
  if (!id) throw new Error('Inquiry ID is required.');

  try {
    const currentUser = auth.currentUser;
    const targetColl = collectionName || INQUIRIES_COLLECTION;
    const docRef = doc(db, targetColl, id);

    const normalizedStatus = String(newStatus).toLowerCase().trim();
    const validStatuses = [
      'new',
      'contacted',
      'contacted',
      'new',
      'closed',
    ];
    if (!validStatuses.includes(normalizedStatus)) {
      throw new Error(`Invalid inquiry status: ${newStatus}.`);
    }

    const updatePayload = {
      status: normalizedStatus,
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

