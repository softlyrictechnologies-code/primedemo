import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

export const INQUIRIES_COLLECTION = 'inquiries';

/**
 * Validates inquiry payload according to business rules & security schema
 */
function validateInquiryData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Inquiry payload must be an object.');
  }

  const customerName = (data.customerName || '').trim();
  const customerPhone = (data.customerPhone || '').trim();
  const propertyId = (data.propertyId || '').trim();

  if (!customerName) {
    throw new Error('Customer name is required.');
  }
  if (customerName.length > 100) {
    throw new Error('Customer name must not exceed 100 characters.');
  }

  if (!customerPhone) {
    throw new Error('Customer phone number is required.');
  }

  const normalizedPhone = customerPhone.replace(/[\s\-()+]/g, '');
  if (normalizedPhone.length < 8 || normalizedPhone.length > 20) {
    throw new Error('Please enter a valid phone number with at least 8 digits.');
  }

  if (!propertyId) {
    throw new Error('Property reference ID is required.');
  }

  if (data.customerEmail && typeof data.customerEmail === 'string') {
    const email = data.customerEmail.trim();
    if (email.length > 0 && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      throw new Error('Please enter a valid email address.');
    }
  }

  if (data.message && typeof data.message === 'string' && data.message.length > 2000) {
    throw new Error('Inquiry message must not exceed 2000 characters.');
  }

  return {
    customerName,
    customerPhone,
    propertyId,
  };
}

/**
 * Submits a new customer inquiry or site visit request.
 * Sets default status to 'new'.
 */
export async function submitInquiry(inquiryData) {
  try {
    const validated = validateInquiryData(inquiryData);
    const inquiriesRef = collection(db, INQUIRIES_COLLECTION);
    const email = (inquiryData.customerEmail || '').trim().toLowerCase();

    const payload = {
      propertyId: validated.propertyId,
      propertyTitle: (inquiryData.propertyTitle || '').slice(0, 150),
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      customerEmail: email || null,
      preferredDate: (inquiryData.preferredDate || 'Tomorrow').slice(0, 80),
      preferredTime: (inquiryData.preferredTime || '10:00 AM').slice(0, 80),
      transport: inquiryData.transport === 'shuttle' ? 'shuttle' : 'self',
      message: (inquiryData.message || '').slice(0, 2000),
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(inquiriesRef, payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error('Error submitting inquiry to Firestore:', error);
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
 * Updates an inquiry status (e.g., 'contacted', 'completed', 'cancelled')
 * Restricted to administrators.
 */
export async function updateInquiryStatus(id, status) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to update inquiry status.');
  }

  const validStatuses = ['new', 'contacted', 'site_visit_scheduled', 'completed', 'cancelled'];
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
