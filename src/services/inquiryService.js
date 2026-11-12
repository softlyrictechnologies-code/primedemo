import {
  collection,
  getDocs,
  doc,
  updateDoc,
  runTransaction,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

export const INQUIRIES_COLLECTION = 'inquiries';

function normalizePhone(value) {
  return String(value || '').replace(/[^\d+]/g, '').replace(/^\+91/, '91');
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

/**
 * Validates inquiry payload according to the approved website workflow.
 */
function validateInquiryData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Inquiry payload must be an object.');
  }

  const name = (data.name || data.customerName || '').trim();
  const phone = normalizePhone(data.phone || data.customerPhone || '');
  const address = (data.address || data.customerAddress || '').trim();
  const message = (data.message || '').trim();
  const propertyId = String(data.propertyId || '').trim();
  const propertyTitle = String(data.propertyTitle || '').trim();
  const email = normalizeEmail(data.email || data.customerEmail || '');

  if (!name) {
    throw new Error('Name is required.');
  }
  if (name.length > 100) {
    throw new Error('Name must not exceed 100 characters.');
  }

  if (!phone) {
    throw new Error('Phone number is required.');
  }

  const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
    throw new Error('Please enter a valid Indian mobile number.');
  }

  if (!propertyId) {
    throw new Error('Property reference is required.');
  }

  if (address.length > 300) {
    throw new Error('Address must not exceed 300 characters.');
  }

  if (!message) {
    throw new Error('Message is required.');
  }
  if (message.length > 1000) {
    throw new Error('Message must not exceed 1000 characters.');
  }

  if (email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    throw new Error('Please enter a valid email address.');
  }

  return {
    name,
    phone: phone.replace(/\D/g, ''),
    email: email || null,
    address,
    message,
    propertyId,
    propertyTitle,
  };
}

/**
 * Submits a new customer inquiry for a property.
 * Uses a deterministic document ID to prevent duplicate submissions for the same day.
 */
export async function submitInquiry(inquiryData) {
  try {
    const validated = validateInquiryData(inquiryData);
    const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const docId = `${validated.propertyId}_${validated.phone}_${dateKey}`;
    const docRef = doc(db, INQUIRIES_COLLECTION, docId);

    const payload = {
      propertyId: validated.propertyId,
      propertyTitle: (validated.propertyTitle || '').slice(0, 150),
      name: validated.name,
      phone: validated.phone,
      email: validated.email,
      address: validated.address || null,
      message: validated.message,
      status: 'new',
      source: inquiryData.source || 'website',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await runTransaction(db, async (transaction) => {
      const existingDoc = await transaction.get(docRef);
      if (existingDoc.exists()) throw new Error('We already received your enquiry today');
      transaction.set(docRef, payload);
    });
    return { id: docId, ...payload };
  } catch (error) {
    console.error('Error submitting inquiry to Firestore:', error);
    if (error?.code === 'permission-denied') {
      throw new Error('We already received your enquiry today');
    }
    throw error;
  }
}

/**
 * Fetches all customer inquiries (restricted to authorized administrators)
 */
export async function getInquiries() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to view customer inquiries.');
  }

  try {
    const inquiriesRef = collection(db, INQUIRIES_COLLECTION);
    const q = query(inquiriesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const inquiries = [];
    snapshot.forEach((docSnap) => {
      inquiries.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });
    return inquiries;
  } catch (error) {
    console.error('Error fetching inquiries from Firestore:', error);
    throw error;
  }
}

/**
 * Updates an inquiry status for the buyer-enquiry lifecycle.
 * Supports legacy status aliases so older Firestore records remain usable.
 */
export async function updateInquiryStatus(id, status) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to update inquiry status.');
  }

  const validStatuses = ['new', 'contacted', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  try {
    const docRef = doc(db, INQUIRIES_COLLECTION, id);
    const updatePayload = {
      status,
      updatedAt: serverTimestamp(),
      updatedBy: currentUser.uid,
    };
    await updateDoc(docRef, updatePayload);
    return { id, ...updatePayload };
  } catch (error) {
    console.error(`Error updating inquiry ${id}:`, error);
    throw error;
  }
}
