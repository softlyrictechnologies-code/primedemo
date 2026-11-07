import { adminDb } from '../config/firebase.js';

export async function getDashboardSnapshot() {
  const [propertiesSnap, submissionsSnap, enquiriesSnap] = await Promise.all([
    adminDb.collection('properties').get(),
    adminDb.collection('sellerSubmissions').get(),
    adminDb.collection('inquiries').get(),
  ]);

  const publishedProperties = propertiesSnap.docs.filter((doc) => doc.data().published === true).length;
  const pendingSubmissions = submissionsSnap.docs.filter((doc) => doc.data().status === 'pending').length;
  const totalBuyerEnquiries = enquiriesSnap.docs.length;

  return {
    totalPublishedProperties: publishedProperties,
    totalPendingLandownerSubmissions: pendingSubmissions,
    totalBuyerEnquiries: totalBuyerEnquiries,
    metadata: {
      properties: propertiesSnap.size,
      submissions: submissionsSnap.size,
      enquiries: enquiriesSnap.size,
    },
  };
}
