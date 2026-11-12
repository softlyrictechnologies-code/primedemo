import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const EXPECTED_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'prime-housing-72330';
const targetEmail = (process.argv[2] || '').trim().toLowerCase();
if (!targetEmail) {
  console.error('Usage: node scripts/check-claim.js <account-email>');
  process.exit(1);
}

function resolveCredentials() {
  const candidatePaths = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    'D:\\secure\\serviceAccountKey.json',
    path.join(rootDir, 'serviceAccountKey.json'),
  ].filter(Boolean);

  for (const candidate of candidatePaths) {
    if (!fs.existsSync(candidate)) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'));
      if (parsed.project_id) {
        return { data: parsed, path: candidate };
      }
    } catch (error) {
      console.warn(`Skipping unreadable credentials file: ${candidate} (${error.message})`);
    }
  }

  return null;
}

const credentials = resolveCredentials();
if (!credentials) {
  console.error('Missing Firebase service account credentials.');
  process.exit(1);
}

if (credentials.data.project_id !== EXPECTED_PROJECT_ID) {
  console.warn(`Service account project mismatch. Expected ${EXPECTED_PROJECT_ID}, found ${credentials.data.project_id}.`);
}

const app = getApps().length === 0
  ? initializeApp({
      credential: cert(credentials.data),
      projectId: credentials.data.project_id,
    }, 'claimCheck')
  : getApps()[0];

const auth = getAuth(app);

try {
  const user = await auth.getUserByEmail(targetEmail);
  console.log(`Email: ${user.email}`);
  console.log(`UID: ${user.uid}`);
  console.log('customClaims:', JSON.stringify(user.customClaims || {}, null, 2));

  if (user.customClaims?.admin === true) {
    console.log('Status: admin=true present');
  } else {
    console.log('Status: admin=true missing');
  }
} catch (error) {
  console.error(`Failed to fetch user by email ${targetEmail}: ${error.message}`);
  if (error.code === 'auth/user-not-found') {
    console.log('Status: user not found');
  }
  process.exit(1);
}
