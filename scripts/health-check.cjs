const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');
const key = require('../serviceAccountKey.json');
if (key.project_id !== 'prime-housing-72330') { console.error('WRONG KEY:', key.project_id); process.exit(1); }
initializeApp({ credential: cert(key), storageBucket: 'prime-housing-72330.firebasestorage.app' });
const db = getFirestore();
(async () => {
  console.log('PROJECT:', key.project_id);
  const cols = ['adminLogs','admins','adminUsers','contactMessages','favorites','inquiries','insights','locations','properties','sellerSubmissions','settings','users'];
  for (const c of cols) {
    try { const s = await db.collection(c).count().get(); console.log('collection', c.padEnd(18), s.data().count); }
    catch (e) { console.log('collection', c.padEnd(18), 'ERROR', e.code || e.message); }
  }
  const pub = await db.collection('properties').where('published','==',true).count().get();
  console.log('published properties:', pub.data().count);
  const sold = await db.collection('properties').where('isSoldOut','==',true).count().get();
  console.log('sold out properties:', sold.data().count);
  try {
    const u = await getAuth().getUserByEmail('softlyrictechnologies@gmail.com');
    console.log('admin user:', u.uid, 'disabled:', u.disabled, 'claims:', JSON.stringify(u.customClaims));
    const a = await db.doc('admins/' + u.uid).get();
    console.log('admins doc exists:', a.exists);
  } catch (e) { console.log('admin user ERROR', e.code || e.message); }
  try {
    const [files] = await getStorage().bucket().getFiles({ maxResults: 10 });
    console.log('storage files (first 10):', files.map(f => f.name));
  } catch (e) { console.log('storage ERROR', e.code || e.message); }
  process.exit(0);
})();
