const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'prime-housing-72330';
const rootDir = path.resolve(__dirname, '..');
const results = [];

function addResult(name, ok, detail) {
  results.push({ name, ok, detail });
  const status = ok ? 'PASS' : 'FAIL';
  console.log(`${status} ${name}: ${detail}`);
}

function exitIfNeeded() {
  const failed = results.some((result) => !result.ok);
  if (failed) {
    console.log(`SUMMARY: ${results.filter((result) => result.ok).length}/${results.length} checks passed.`);
    process.exit(1);
  }

  console.log(`SUMMARY: ${results.filter((result) => result.ok).length}/${results.length} checks passed.`);
}

function readJsonOrNull(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
}

function isSourceLikeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.js', '.cjs', '.mjs', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.yaml', '.yml', '.env', '.ini'].includes(ext)
    || filePath.includes('package')
    || filePath.endsWith('.env')
    || filePath.endsWith('.env.local');
}

function walkRepo(startDir) {
  const entries = fs.readdirSync(startDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.firebase') {
      continue;
    }

    const fullPath = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkRepo(fullPath));
      continue;
    }

    if (entry.isFile()) {
      const relative = path.relative(rootDir, fullPath).replace(/\\/g, '/');
      if (relative === 'scripts/verify-all.cjs') {
        continue;
      }
      if (isSourceLikeFile(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

async function withFirebase() {
  const { initializeApp, cert, applicationDefault, getApps } = require('firebase-admin/app');
  const { getAuth } = require('firebase-admin/auth');
  const { getFirestore, FieldValue } = require('firebase-admin/firestore');
  const { getStorage } = require('firebase-admin/storage');

  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialPath) {
    const key = readJsonOrNull(credentialPath);
    if (!key || key.project_id !== PROJECT_ID) {
      addResult('GOOGLE_APPLICATION_CREDENTIALS project check', false, key ? `project_id=${key.project_id}` : `credential could not be parsed: ${credentialPath}`);
      process.exit(1);
    }
    addResult('GOOGLE_APPLICATION_CREDENTIALS project check', true, `project_id=${key.project_id}`);
  } else {
    addResult('GOOGLE_APPLICATION_CREDENTIALS project check', true, 'not set; using ADC/default credentials');
  }

  const app = getApps().length === 0
    ? initializeApp({
        credential: credentialPath ? cert(readJsonOrNull(credentialPath)) : applicationDefault(),
        projectId: PROJECT_ID,
      })
    : getApps()[0];

  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  return { auth, db, storage, FieldValue };
}

async function adminAccountChecks({ auth, db, FieldValue }) {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  const oldAdminEmail = (process.env.OLD_ADMIN_EMAIL || '').trim().toLowerCase();

  if (!adminEmail || !adminPassword) {
    addResult('Admin account setup', false, 'ADMIN_EMAIL and ADMIN_PASSWORD must be set.');
    return;
  }

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(adminEmail);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      userRecord = await auth.createUser({
        email: adminEmail,
        emailVerified: true,
        password: adminPassword,
        disabled: false,
      });
    } else {
      throw error;
    }
  }

  await auth.updateUser(userRecord.uid, {
    emailVerified: true,
    disabled: false,
    password: adminPassword,
  });

  const claims = { admin: true, role: 'admin' };
  await auth.setCustomUserClaims(userRecord.uid, claims);
  await db.collection('admins').doc(userRecord.uid).set({
    email: adminEmail,
    role: 'admin',
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  await db.collection('users').doc(userRecord.uid).set({
    email: adminEmail,
    role: 'admin',
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  const reloadedUser = await auth.getUser(userRecord.uid);
  const hasCorrectClaims = reloadedUser.customClaims?.admin === true && reloadedUser.customClaims?.role === 'admin';
  addResult('Admin account setup', hasCorrectClaims, hasCorrectClaims ? `uid=${reloadedUser.uid}, claims=${JSON.stringify(reloadedUser.customClaims)}` : 'custom claims did not match expected admin configuration');

  if (oldAdminEmail && oldAdminEmail !== adminEmail) {
    try {
      const oldUser = await auth.getUserByEmail(oldAdminEmail);
      const existingClaims = oldUser.customClaims || {};
      const clearedClaims = { ...existingClaims };
      delete clearedClaims.admin;
      delete clearedClaims.superAdmin;
      delete clearedClaims.role;
      await auth.setCustomUserClaims(oldUser.uid, clearedClaims);
      try {
        await db.collection('admins').doc(oldUser.uid).delete();
      } catch (error) {
        // ignore missing doc
      }
      await db.collection('users').doc(oldUser.uid).set({
        role: 'user',
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      addResult('Old admin cleanup', true, `old admin ${oldAdminEmail} claims cleared and user role reset to user.`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        addResult('Old admin cleanup', true, `old admin ${oldAdminEmail} not found; nothing to clear.`);
      } else {
        addResult('Old admin cleanup', false, `could not clear old admin: ${error.message}`);
      }
    }
  }
}

async function identityToolkitSignIn() {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) {
    addResult('Firebase web sign-in test', true, 'SKIP (FIREBASE_WEB_API_KEY not set)');
    return;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (!adminEmail || !adminPassword) {
    addResult('Firebase web sign-in test', false, 'ADMIN_EMAIL and ADMIN_PASSWORD must both be set for sign-in test.');
    return;
  }

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      returnSecureToken: true,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    addResult('Firebase web sign-in test', false, body.error?.message || `HTTP ${response.status}`);
    return;
  }

  addResult('Firebase web sign-in test', true, `localId=${body.localId || 'n/a'}`);
}

async function collectionCounts(db) {
  const collections = ['adminLogs', 'contactMessages', 'favorites', 'inquiries', 'insights', 'locations', 'properties', 'sellerSubmissions', 'users'];
  for (const name of collections) {
    const snap = await db.collection(name).get();
    addResult(`Doc count ${name}`, true, `${snap.size}`);
  }
}

async function settingsCheck(db) {
  const settingsDoc = await db.collection('settings').doc('content').get();
  if (settingsDoc.exists) {
    const fields = Object.keys(settingsDoc.data() || {});
    addResult('Settings/content doc', true, `fields=${fields.join(', ') || '(none)'}`);
    return;
  }

  const fallbackDoc = await db.collection('siteSettings').doc('site').get();
  if (fallbackDoc.exists) {
    const fields = Object.keys(fallbackDoc.data() || {});
    addResult('Settings/content doc', true, `fallback siteSettings/site fields=${fields.join(', ') || '(none)'}`);
    return;
  }

  addResult('Settings/content doc', false, 'settings/content document missing');
}

async function propertyConsistency(db) {
  const snap = await db.collection('properties').get();
  const inconsistent = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data() || {};
    const status = data.status;
    if (status === 'published' && data.published !== true) {
      inconsistent.push(docSnap.id);
    }
    if (status === 'draft' && data.published === true) {
      inconsistent.push(docSnap.id);
    }
    if (status === 'sold_out' && data.isSoldOut !== true) {
      inconsistent.push(docSnap.id);
    }
  });

  addResult('Property consistency', inconsistent.length === 0, inconsistent.length ? `inconsistent ids=${inconsistent.join(', ')}` : 'all property statuses are consistent');
}

async function inquiryValidationCheck(db) {
  const snap = await db.collection('inquiries').get();
  const offenders = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data() || {};
    const keys = Object.keys(data);
    if (keys.some((key) => /visit|slot|schedule/i.test(key))) {
      offenders.push(docSnap.id);
    }
  });

  addResult('Inquiry field validation', offenders.length === 0, offenders.length ? `offending ids=${offenders.join(', ')}` : 'no visit/slot/schedule fields present');
}

async function sellerSubmissionCheck(db) {
  const snap = await db.collection('sellerSubmissions').get();
  const missingStatus = [];
  snap.forEach((docSnap) => {
    if (!Object.prototype.hasOwnProperty.call(docSnap.data() || {}, 'status')) {
      missingStatus.push(docSnap.id);
    }
  });

  addResult('Seller submissions status', missingStatus.length === 0, missingStatus.length ? `missing status ids=${missingStatus.join(', ')}` : `${snap.size} documents all contain status`);
}

async function publicRulesCheck() {
  const urlBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
  const checks = [
    { name: 'inquiries', path: 'inquiries' },
    { name: 'users', path: 'users' },
    { name: 'adminLogs', path: 'adminLogs' },
    { name: 'contactMessages', path: 'contactMessages' },
    { name: 'sellerSubmissions', path: 'sellerSubmissions' },
    { name: 'admins', path: 'admins' },
  ];

  for (const item of checks) {
    const response = await fetch(`${urlBase}/${item.path}`);
    addResult(`Public read ${item.name}`, response.status === 403, `HTTP ${response.status}`);
  }

  const settingsResponse = await fetch(`${urlBase}/settings/content`);
  if (settingsResponse.status === 404) {
    addResult('Public read settings/content', true, 'HTTP 404 (missing doc, report only)');
  } else {
    addResult('Public read settings/content', settingsResponse.status === 200, `HTTP ${settingsResponse.status}`);
  }

  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: 'properties' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'published' },
          op: 'EQUAL',
          value: { booleanValue: true },
        },
      },
    },
  };

  const publishedResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queryBody),
  });
  addResult('Public properties query with published=true', publishedResponse.status === 200, `HTTP ${publishedResponse.status}`);

  const unfilteredResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'properties' }] } }),
  });
  addResult('Public unfiltered properties query', unfilteredResponse.status === 403, `HTTP ${unfilteredResponse.status}`);
}

async function storageCheck(storage) {
  const bucketNames = ['prime-housing-72330.firebasestorage.app', 'prime-housing-72330.appspot.com'];
  let lastError = null;

  for (const bucketName of bucketNames) {
    try {
      const bucket = storage.bucket(bucketName);
      const [files] = await bucket.getFiles({ maxResults: 1 });
      addResult('Storage bucket reachability', true, `bucket=${bucketName}, firstFileCount=${files.length}`);
      return;
    } catch (error) {
      lastError = error;
    }
  }

  addResult('Storage bucket reachability', false, lastError ? lastError.message : 'no buckets available');
}

async function repoSecretScan() {
  const ignoredNames = new Set(['.git', 'node_modules', 'dist', '.firebase']);
  const files = walkRepo(rootDir);
  const targetPatterns = ['prime2005', 'ChooseYourOwn123', 'admin@200'];
  const passwordValue = (process.env.ADMIN_PASSWORD || '').trim();
  if (passwordValue) {
    targetPatterns.push(passwordValue);
  }

  const sensitiveFiles = [];
  for (const file of files) {
    if (file.endsWith('verify-all.cjs')) {
      continue;
    }
    try {
      const contents = fs.readFileSync(file, 'utf8');
      const hasSecret = targetPatterns.some((pattern) => contents.includes(pattern));
      if (hasSecret) {
        sensitiveFiles.push(path.relative(rootDir, file).replace(/\\/g, '/'));
      }
    } catch (error) {
      // ignore binary or unreadable files
    }
  }

  const gitignorePath = path.join(rootDir, '.gitignore');
  const gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  const requiredIgnores = ['scripts/serviceAccountKey*.json', '*.serviceaccount.json', '.env', '.env.local'];
  const missingIgnores = requiredIgnores.filter((rule) => !gitignore.includes(rule));

  if (sensitiveFiles.length > 0) {
    addResult('Secret scan', false, `sensitive files=${sensitiveFiles.join(', ')}`);
  } else {
    addResult('Secret scan', missingIgnores.length === 0, missingIgnores.length ? `missing .gitignore entries=${missingIgnores.join(', ')}` : 'no secrets found and .gitignore coverage present');
  }

  if (missingIgnores.length > 0) {
    addResult('Git ignore service account keys', false, `missing=${missingIgnores.join(', ')}`);
  } else {
    addResult('Git ignore service account keys', true, 'service account and env files are ignored');
  }
}

async function main() {
  try {
    const { auth, db, storage, FieldValue } = await withFirebase();

    await adminAccountChecks({ auth, db, FieldValue });
    await identityToolkitSignIn();
    await collectionCounts(db);
    await settingsCheck(db);
    await propertyConsistency(db);
    await inquiryValidationCheck(db);
    await sellerSubmissionCheck(db);
    await publicRulesCheck();
    await storageCheck(storage);
    await repoSecretScan();
  } catch (error) {
    addResult('Backend verification', false, error.message);
  } finally {
    exitIfNeeded();
  }
}

main();
