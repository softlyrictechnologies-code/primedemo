import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const sa = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf8'));
const app = getApps().length === 0 ? initializeApp({ credential: cert(sa), projectId: sa.project_id }) : getApps()[0];
const adminAuth = getAuth(app);
const db = getFirestore(app);

async function run() {
  console.log('Project ID in Service Account:', sa.project_id);
  console.log('Client Email:', sa.client_email);

  // 1. Test createCustomToken
  try {
    const token = await adminAuth.createCustomToken('admin-user-gamil', { admin: true, role: 'admin' });
    console.log('createCustomToken: SUCCESS!');

    // Test sign in with custom token via REST
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, returnSecureToken: true })
    });
    const data = await res.json();
    console.log('REST signInWithCustomToken status:', res.status, data);
  } catch (err) {
    console.log('createCustomToken / signInWithCustomToken Error:', err.message);
  }

  // 2. Test create user / get user
  try {
    const user = await adminAuth.getUserByEmail(process.argv[2]);
    console.log('User found in Firebase Auth:', user.uid, user.customClaims);
  } catch (err) {
    console.log('adminAuth.getUserByEmail:', err.message, err.code);
  }

  // 3. Test Firestore users collection
  try {
    const userDoc = await db.collection('users').doc('admin-user-gamil').get();
    console.log('Firestore doc users/admin-user-gamil:', userDoc.exists, userDoc.data());
  } catch (err) {
    console.log('Firestore error:', err.message);
  }
}

run();

