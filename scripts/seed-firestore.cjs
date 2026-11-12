const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('../serviceAccountKey.json');

if (serviceAccount.project_id !== 'prime-housing-72330') {
  console.error('Wrong key project:', serviceAccount.project_id);
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const ts = FieldValue.serverTimestamp();

const put = async (path, data) => {
  await db.doc(path).set({ ...data, isSample: true, createdAt: ts }, { merge: true });
  console.log('ready:', path);
};

async function main() {
  const email = process.argv[2];
  if (email) {
    try {
      const user = await getAuth().getUserByEmail(email);
      await db.doc(`admins/${user.uid}`).set({ email, role: 'admin', createdAt: ts }, { merge: true });
      console.log('admin ready:', email, user.uid);
    } catch (e) {
      console.log('admin skipped ->', e.code || e.message);
    }
  }

  await put('locations/sample-chennai', { name: 'Chennai', state: 'Tamil Nadu', active: true });
  await put('properties/sample-property-1', {
    title: 'Sample 3BHK Apartment', description: 'Sample listing. Delete after testing.',
    price: 5500000, location: 'Chennai', propertyType: 'apartment',
    bedrooms: 3, bathrooms: 2, areaSqFt: 1450, images: [], published: true, featured: false,
  });
  await put('sellerSubmissions/sample-submission-1', {
    title: 'Sample Seller Plot', ownerName: 'Sample Seller', phone: '0000000000',
    location: 'Chennai', price: 2500000, status: 'pending', approval: 'Pending Verification',
  });
  await put('inquiries/sample-inquiry-1', {
    propertyId: 'sample-property-1', name: 'Sample Buyer', phone: '0000000000',
    message: 'Sample enquiry.', status: 'new',
  });
  await put('contactMessages/sample-contact-1', {
    name: 'Sample Visitor', email: 'visitor@example.com', message: 'Sample message.', status: 'new',
  });
  await put('insights/sample-insight-1', { title: 'Sample market insight', summary: 'Sample content.', published: true });
  await put('favorites/sample-favorite-1', { userId: 'sample-user', propertyId: 'sample-property-1' });
  await put('adminLogs/sample-log-1', { action: 'seed', by: email || 'script', details: 'Collections created' });
  await put('users/sample-user', { name: 'Sample User', email: 'user@example.com', role: 'user' });
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
