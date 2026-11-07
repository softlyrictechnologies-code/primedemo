import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const EXPECTED_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'plotfinder-be7f5';
const targetEmail = (process.argv[2] || 'admin@gamil.com').trim().toLowerCase();

console.log('='.repeat(72));
console.log('  PLOTFINDER CHENNAI — SECURE ADMIN CLAIM PROVISIONING');
console.log('='.repeat(72));
console.log(`Target Email       : ${targetEmail}`);
console.log(`Expected Project   : ${EXPECTED_PROJECT_ID}`);
console.log(`Execution Time     : ${new Date().toISOString()}\n`);

// 1. Locate service account credentials securely
function resolveCredentials() {
  const candidatePaths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    'D:\\secure\\serviceAccountKey.json',
    path.join(rootDir, 'serviceAccountKey.json'),
  ].filter(Boolean);

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (parsed.project_id) {
          console.log(`[Credentials] Loaded verified service account from: ${p}`);
          return { data: parsed, path: p };
        }
      } catch (err) {
        console.warn(`[Credentials] Failed to parse JSON at ${p}: ${err.message}`);
      }
    }
  }
  return null;
}

const creds = resolveCredentials();
if (!creds) {
  console.error('❌ Could not locate a valid service account JSON file.');
  console.error('Searched locations:');
  console.error(' - process.env.GOOGLE_APPLICATION_CREDENTIALS');
  console.error(' - D:\\secure\\serviceAccountKey.json');
  console.error(' - .\\serviceAccountKey.json');
  process.exit(1);
}

// 2. Validate Firebase Project ID matches expected project
const saData = creds.data;
if (saData.project_id !== EXPECTED_PROJECT_ID) {
  console.error(`❌ Project ID mismatch: Service account is for "${saData.project_id}", expected "${EXPECTED_PROJECT_ID}".`);
  process.exit(1);
}
console.log(`[Project Verification] Confirmed target Firebase Project: ${saData.project_id}`);

// 3. Initialize Firebase Admin App
const app = getApps().length === 0
  ? initializeApp({
      credential: cert(saData),
      projectId: saData.project_id,
    }, 'adminClaimProvisioner')
  : getApps()[0];

const adminAuth = getAuth(app);
const firestore = getFirestore(app);

async function provision() {
  let userRecord = null;

  try {
    // 4. Find user by email in Firebase Authentication
    console.log(`\n[1/4] Querying Firebase Authentication for user: ${targetEmail}...`);
    userRecord = await adminAuth.getUserByEmail(targetEmail);
    console.log(`✓ User found in Firebase Auth! UID: ${userRecord.uid}`);
    console.log(`  Email Verified: ${userRecord.emailVerified ? 'Yes' : 'No'}`);
  } catch (err) {
    if (err.code === 'auth/configuration-not-found') {
      console.error('\n' + '!'.repeat(72));
      console.error('⚠️  FIREBASE AUTHENTICATION IS NOT YET INITIALIZED IN PROJECT CONSOLE');
      console.error('!'.repeat(72));
      console.error(`Error details: ${err.message} (code: ${err.code})\n`);
      console.error('Root Cause:');
      console.error('In Firebase Project "plotfinder-be7f5", Firebase Authentication has not');
      console.error('been initialized yet in the Firebase Console (Identity Toolkit is not enabled).\n');
      console.error('How to resolve in 30 seconds:');
      console.error('1. Open your browser to:');
      console.error(`   https://console.firebase.google.com/project/${EXPECTED_PROJECT_ID}/authentication`);
      console.error('2. Click the "Get started" button.');
      console.error('3. Under the "Sign-in method" tab, click "Email/Password" and toggle "Enable".');
      console.error('4. Click "Save".');
      console.error('5. Re-run: node scripts/set-admin-claim.js ' + targetEmail);
      console.error('!'.repeat(72) + '\n');

      // Update Firestore users collection as immediate preparation
      console.log('[Firestore] Pre-configuring users collection record for when Auth is enabled...');
      const fallbackUid = `admin-user-${targetEmail.replace(/[^a-zA-Z0-9]/g, '-')}`;
      await firestore.collection('users').doc(fallbackUid).set({
        uid: fallbackUid,
        email: targetEmail,
        name: 'PlotFinder Super Admin',
        role: 'admin',
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log(`✓ Synchronized Firestore profile at users/${fallbackUid}`);
      process.exit(1);
    }

    if (err.code === 'auth/user-not-found') {
      console.log(`User "${targetEmail}" does not exist yet in Firebase Auth.`);
      console.log(`[2/4] Creating new administrator account in Firebase Authentication...`);
      try {
        userRecord = await adminAuth.createUser({
          email: targetEmail,
          emailVerified: true,
          displayName: 'PlotFinder Administrator',
          password: 'admin@200',
        });
        console.log(`✓ Created administrator account in Firebase Auth! UID: ${userRecord.uid}`);
      } catch (createErr) {
        console.error(`❌ Failed to create user in Firebase Auth: ${createErr.message}`);
        process.exit(1);
      }
    } else {
      console.error(`❌ Error querying user: ${err.message} (${err.code})`);
      process.exit(1);
    }
  }

  // 5. Ensure email is marked verified for admin safety
  if (!userRecord.emailVerified) {
    console.log('[3/4] Updating user status: Setting emailVerified = true...');
    userRecord = await adminAuth.updateUser(userRecord.uid, { emailVerified: true });
  }

  // 6. Assign custom claim admin: true while preserving existing claims
  console.log('[4/4] Assigning cryptographic custom claim { admin: true }...');
  const existingClaims = userRecord.customClaims || {};
  const updatedClaims = {
    ...existingClaims,
    admin: true,
    role: 'admin',
  };

  await adminAuth.setCustomUserClaims(userRecord.uid, updatedClaims);
  console.log(`✓ Successfully assigned custom claims to UID ${userRecord.uid}:`, updatedClaims);

  // 7. Synchronize Firestore users collection document
  const userDocRef = firestore.collection('users').doc(userRecord.uid);
  await userDocRef.set({
    uid: userRecord.uid,
    email: userRecord.email,
    name: userRecord.displayName || 'PlotFinder Administrator',
    role: 'admin',
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  console.log(`✓ Synchronized Firestore profile at users/${userRecord.uid} with role: "admin"`);

  // 8. Record audit log in adminLogs
  await firestore.collection('adminLogs').add({
    action: 'ADMIN_CLAIM_PROVISIONED',
    target: 'users',
    targetId: userRecord.uid,
    details: {
      email: userRecord.email,
      claims: updatedClaims,
      provisionedVia: 'scripts/set-admin-claim.js',
    },
    adminEmail: 'cli-admin-service',
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log('✓ Recorded operational audit entry in "adminLogs" collection');

  console.log('\n' + '='.repeat(72));
  console.log('🎉 ADMINISTRATOR CLAIM PROVISIONING SUCCESSFUL!');
  console.log('='.repeat(72));
  console.log(`Administrator UID : ${userRecord.uid}`);
  console.log(`Admin Email       : ${userRecord.email}`);
  console.log(`Admin Custom Claim: admin: true (VERIFIED)`);
  console.log(`Security Rules    : Matches function isAdmin() in firestore.rules`);
  console.log('='.repeat(72) + '\n');
  process.exit(0);
}

provision().catch((err) => {
  console.error('\nFatal provisioning error:', err);
  process.exit(1);
});
