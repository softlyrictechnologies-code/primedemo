import { adminDb } from '../config/firebase.js';

const VALID_STATUSES = ['new', 'contacted', 'follow-up', 'closed'];

export function validateEnquiryInput(payload = {}) {
  const buyerName = String(payload.buyerName || '').trim();
  const buyerPhone = String(payload.buyerPhone || '').trim();
  const propertyId = String(payload.propertyId || '').trim();
  const buyerEmail = String(payload.buyerEmail || '').trim();

  if (!buyerName) {
    throw new Error('Buyer name is required.');
  }

  if (!buyerPhone) {
    throw new Error('Buyer phone number is required.');
  }

  if (!propertyId) {
    throw new Error('Property reference is required.');
  }

  const validEmail = buyerEmail === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail);
  if (!validEmail) {
    throw new Error('Please provide a valid buyer email address.');
  }

  return {
    buyerName,
    buyerPhone,
    propertyId,
    buyerEmail,
    message: String(payload.message || '').trim().slice(0, 2000),
    followUpNotes: String(payload.followUpNotes || '').trim().slice(0, 2000),
  };
}

export async function createBuyerEnquiry(payload) {
  const sanitized = validateEnquiryInput(payload);

  const enquiry = {
    propertyId: sanitized.propertyId,
    buyerName: sanitized.buyerName,
    buyerPhone: sanitized.buyerPhone,
    buyerEmail: sanitized.buyerEmail,
    message: sanitized.message,
    followUpNotes: sanitized.followUpNotes,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ref = await adminDb.collection('inquiries').add(enquiry);
  return { id: ref.id, ...enquiry };
}

export async function getAllEnquiries() {
  const snapshot = await adminDb.collection('inquiries').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateEnquiryStatus(enquiryId, { status, followUpNotes = '' }) {
  if (!enquiryId) {
    throw new Error('Enquiry ID is required.');
  }

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Unsupported enquiry status: ${status}`);
  }

  const payload = {
    status,
    followUpNotes: String(followUpNotes || '').trim().slice(0, 2000),
    updatedAt: new Date().toISOString(),
  };

  await adminDb.collection('inquiries').doc(enquiryId).update(payload);
  return payload;
}
