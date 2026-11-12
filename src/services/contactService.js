import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

export const CONTACT_MESSAGES_COLLECTION = 'contactMessages';

function normalizePhone(value) {
  return String(value || '').replace(/[^\d+]/g, '').replace(/^\+91/, '91');
}

/**
 * Validates and submits general contact messages from visitors.
 * Enforces default status: 'new'.
 */
export async function submitContactMessage(contactData) {
  if (!contactData || typeof contactData !== 'object') {
    throw new Error('Contact message payload must be an object.');
  }

  const name = (contactData.name || '').trim();
  const message = (contactData.message || '').trim();
  const honeypot = (contactData.website || '').trim();

  if (honeypot) {
    throw new Error('Invalid submission.');
  }

  if (!name) {
    throw new Error('Name is required.');
  }
  if (name.length > 100) {
    throw new Error('Name must not exceed 100 characters.');
  }

  if (!message) {
    throw new Error('Message is required.');
  }
  if (message.length > 1000) {
    throw new Error('Message must not exceed 1000 characters.');
  }

  const email = (contactData.email || '').trim().toLowerCase();
  const phone = normalizePhone(contactData.phone || '');

  if (!phone || !/^(?:\+91|91)?[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
    throw new Error('Please enter a valid Indian mobile number.');
  }

  if (email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
    throw new Error('Please provide a valid email address.');
  }

  try {
    const contactRef = collection(db, CONTACT_MESSAGES_COLLECTION);
    const payload = {
      name,
      email,
      phone: phone.replace(/\D/g, ''),
      subject: (contactData.subject || 'General Inquiry').trim().slice(0, 150),
      message,
      status: 'new',
      source: 'website',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(contactRef, payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error('Error submitting contact message to Firestore:', error);
    throw error;
  }
}

/**
 * Fetch all contact messages (restricted to administrators)
 */
export async function getContactMessages() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to view contact messages.');
  }

  try {
    const contactRef = collection(db, CONTACT_MESSAGES_COLLECTION);
    const q = query(contactRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const messages = [];
    snapshot.forEach((docSnap) => {
      messages.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });
    return messages;
  } catch (error) {
    console.error('Error fetching contact messages from Firestore:', error);
    throw error;
  }
}
