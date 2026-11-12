import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const EXPECTED_PROJECT_ID = 'prime-housing-72330';
const targetEmail = (process.env.ADMIN_EMAIL || process.argv[2] || '').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || '';

if (!targetEmail) {
  console.error('Usage: ADMIN_EMAIL=you@example.com node scripts/set-admin-claim.js');
  process.exit(1);
}

if (!adminPassword) {
  console.error('Missing ADMIN_PASSWORD environment variable.');
  process.exit(1);
}

console.log('='.repeat(72));
console.log('  PRIME HOUSING — SECURE ADMIN CLAIM PROVISIONING');
console.log('='.repeat(72));
console.log(`Target Email       : ${targetEmail}`);
console.log(`Expected Project   : ${EXPECTED_PROJECT_ID}`);
console.log(`Execution Time     : ${new Date().toISOString()}\n`);

function resolveCredentials() {
  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialPath) {
    return { mode: 'applicationDefault' };
  }

  if (!fs.existsSync(credentialPath)) {
    throw new Error(`GOOGLE_APPLICATION_CREDENTIALS points to a missing file: ${credentialPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(credentialPath, 'utf8'));
  if (!parsed.project_id) {
    throw new Error(`Service account JSON at ${credentialPath} is missing project_id.`);
  }

  if (parsed.project_id !== EXPECTED_PROJECT_ID) {
    throw new Error(`Project mismatch: ${parsed.project_id} !== ${EXPECTED_PROJECT_ID}`);
  }

  return { mode: 'cert', data: parsed, path: credentialPath };
}

const credentialConfig = resolveCredentials();
const app = getApps().length === 0
  ? initializeApp({
      credential: credentialConfig.mode === 'cert' ? cert(credentialConfig.data) : applicationDefault(),
      projectId: EXPECTED_PROJECT_ID,
    }, 'adminClaimProvisioner')
  : getApps()[0];

const adminAuth = getAuth(app);
const firestore = getFirestore(app);

async function provision() {
  let userRecord = null;

  try {
    userRecord = await adminAuth.getUserByEmail(targetEmail);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      userRecord = await adminAuth.createUser({
        email: targetEmail,
        emailVerified: true,
        password: adminPassword,
        disabled: false,
      });
    } else {
      throw err;
    }
  }

  if (!userRecord.emailVerified || userRecord.disabled) {
    userRecord = await adminAuth.updateUser(userRecord.uid, {
      emailVerified: true,
      disabled: false,
      password: adminPassword,
    });
  } else {
    userRecord = await adminAuth.updateUser(userRecord.uid, {
      password: adminPassword,
      emailVerified: true,
      disabled: false,
    });
  }

  const existingClaims = userRecord.customClaims || {};
  const updatedClaims = {
    ...existingClaims,
    admin: true,
    role: 'admin',
  };

  await adminAuth.setCustomUserClaims(userRecord.uid, updatedClaims);

  await firestore.collection('admins').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email: userRecord.email,
    role: 'admin',
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  await firestore.collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email: userRecord.email,
    role: 'admin',
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  const refreshedUser = await adminAuth.getUser(userRecord.uid);
  const claimsAreCorrect = refreshedUser.customClaims?.admin === true && refreshedUser.customClaims?.role === 'admin';
  if (!claimsAreCorrect) {
    throw new Error('Admin claims did not persist after update.');
  }

  const oldAdminEmail = (process.env.OLD_ADMIN_EMAIL || '').trim().toLowerCase();
  if (oldAdminEmail && oldAdminEmail !== targetEmail) {
    try {
      const oldUser = await adminAuth.getUserByEmail(oldAdminEmail);
      const oldClaims = { ...(oldUser.customClaims || {}) };
      delete oldClaims.admin;
      delete oldClaims.superAdmin;
      delete oldClaims.role;
      await adminAuth.setCustomUserClaims(oldUser.uid, oldClaims);
      await firestore.collection('admins').doc(oldUser.uid).delete().catch(() => {});
      await firestore.collection('users').doc(oldUser.uid).set({
        role: 'user',
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      if (err.code !== 'auth/user-not-found') {
        console.warn(`Unable to clear previous admin ${oldAdminEmail}: ${err.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(72));
  console.log('🎉 ADMINISTRATOR CLAIM PROVISIONING SUCCESSFUL!');
  console.log('='.repeat(72));
  console.log(`Administrator UID : ${refreshedUser.uid}`);
  console.log(`Admin Email       : ${refreshedUser.email}`);
  console.log(`Admin Custom Claim: ${JSON.stringify(refreshedUser.customClaims)}`);
  console.log('='.repeat(72) + '\n');
  process.exit(0);
}

provision().catch((err) => {
  console.error('\nFatal provisioning error:', err);
  process.exit(1);
});
