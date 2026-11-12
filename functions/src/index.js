import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();
const auth = getAuth();

function hasAdminClaim(token = {}) {
  return Boolean(
    token.admin === true ||
      token.superAdmin === true ||
      ['admin', 'super_admin', 'super-admin'].includes(token.role)
  );
}

function hasSuperAdminClaim(token = {}) {
  return Boolean(token.superAdmin === true || ['super_admin', 'super-admin'].includes(token.role));
}

/**
 * Helper to ensure caller has verified admin claims
 */
function assertAdmin(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  const token = request.auth.token || {};
  if (!hasAdminClaim(token)) {
    throw new HttpsError('permission-denied', 'Only verified administrators can execute this privileged function.');
  }
}

function assertSuperAdmin(request) {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }
  const token = request.auth.token || {};
  if (!hasSuperAdminClaim(token)) {
    throw new HttpsError('permission-denied', 'Only super administrators can perform this action.');
  }
}

/**
 * Callable: Set admin custom claims on a user
 */
export const setAdminCustomClaim = onCall(async (request) => {
  assertSuperAdmin(request);

  const { targetUid, role = 'admin' } = request.data || {};
  if (!targetUid || typeof targetUid !== 'string') {
    throw new HttpsError('invalid-argument', 'Target UID is required.');
  }
  if (!['buyer', 'seller', 'editor', 'support', 'admin'].includes(role)) {
    throw new HttpsError('invalid-argument', 'Unsupported user role.');
  }

  try {
    const admin = role === 'admin';
    const target = await auth.getUser(targetUid);
    if (!admin && targetUid === request.auth.uid) {
      throw new HttpsError('failed-precondition', 'You cannot demote your own account.');
    }
    if (!admin) {
      let pageToken;
      let adminCount = 0;
      do {
        const page = await auth.listUsers(1000, pageToken);
        adminCount += page.users.filter((user) => user.customClaims?.admin === true || user.customClaims?.superAdmin === true || ['admin', 'super_admin', 'super-admin'].includes(user.customClaims?.role)).length;
        pageToken = page.pageToken;
      } while (pageToken);
      if (adminCount <= 1 && (target.customClaims?.admin === true || target.customClaims?.superAdmin === true || ['admin', 'super_admin', 'super-admin'].includes(target.customClaims?.role))) {
        throw new HttpsError('failed-precondition', 'The last administrator cannot be demoted.');
      }
    }

    const { admin: _oldAdmin, superAdmin: _oldSuperAdmin, role: _oldRole, ...otherClaims } = target.customClaims || {};
    await auth.setCustomUserClaims(targetUid, { ...otherClaims, ...(admin ? { admin: true } : {}), role });

    const userRef = db.collection('users').doc(targetUid);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.update({
        role,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    const adminRef = db.collection('admins').doc(targetUid);
    if (admin) await adminRef.set({ uid: targetUid, email: target.email, role, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    else await adminRef.delete();

    // Log to adminLogs
    await db.collection('adminLogs').add({
      action: 'ADMIN_CLAIM_PROVISIONED',
      target: 'auth',
      targetId: targetUid,
      details: { role },
      adminEmail: request.auth.token.email || 'system',
      adminUid: request.auth.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, targetUid, claims: { ...(admin ? { admin: true } : {}), role } };
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    console.error('Error setting custom user claims:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Callable: Approve and publish seller submission in a single transaction
 */
export const approveSellerSubmission = onCall(async (request) => {
  assertAdmin(request);

  const { submissionId, customPriceLakhs } = request.data || {};
  if (!submissionId) {
    throw new HttpsError('invalid-argument', 'Submission ID is required.');
  }

  const subRef = db.collection('sellerSubmissions').doc(submissionId);
  const propertiesRef = db.collection('properties');

  try {
    let newPropertyId = null;

    await db.runTransaction(async (transaction) => {
      const subDoc = await transaction.get(subRef);
      if (!subDoc.exists) {
        throw new HttpsError('not-found', 'Submission document not found.');
      }

      const subData = subDoc.data();
      const priceLakhs = Number(customPriceLakhs) || 
        (subData.expectedPrice ? Number((subData.expectedPrice / 100000).toFixed(2)) : 50);
      const price = priceLakhs * 100000;
      const areaSqFt = Number(subData.areaSqFt) || 1200;

      const newPropertyDocRef = propertiesRef.doc();
      newPropertyId = newPropertyDocRef.id;

      const propertyPayload = {
        title: (subData.title || 'Verified Residential Plot').trim(),
        subTitle: `CMDA Verified Plot in ${subData.location || 'Chennai'}`,
        description: subData.description || 'Verified clear-title property approved by legal audit.',
        propertyType: subData.propertyType || 'Residential Plot',
        location: subData.location || 'Chennai',
        area: subData.area || 'OMR',
        city: 'Chennai',
        areaSqFt: areaSqFt,
        price: price,
        priceLakhs: priceLakhs,
        pricePerSqFt: Math.round(price / (areaSqFt || 1)),
        facing: subData.facing || 'East Facing',
        approval: subData.approval || 'CMDA Approved',
        approvalNo: 'CMDA/VERIFIED/' + new Date().getFullYear(),
        dimensions: subData.dimensions || '30 ft x 40 ft',
        roadWidth: '30 Feet Blacktop Road',
        pattaStatus: 'Clear Ownership Patta Verified',
        waterSource: 'Sweet Potable Ground Water',
        bankLoans: ['HDFC', 'SBI', 'ICICI'],
        amenities: ['24/7 Security', 'Tar Road', 'EB Line'],
        landmarks: [`Near ${subData.location || 'Chennai'}`],
        appreciationRate: '+12.0% YoY',
        images: subData.images || [],
        imageUrls: subData.images || [],
        published: false,
        status: 'draft',
        isSoldOut: false,
        soldOutAt: null,
        featured: false,
        verified: true,
        createdBy: request.auth.uid,
        sourceSubmissionId: submissionId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      transaction.set(newPropertyDocRef, propertyPayload);
      transaction.update(subRef, {
        status: 'approved',
        publishedPropertyId: newPropertyId,
        approvedBy: request.auth.token.email || 'admin',
        approvedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    // Record audit
    await db.collection('adminLogs').add({
      action: 'SELLER_SUBMISSION_APPROVED_DRAFT_CREATED',
      target: 'sellerSubmissions',
      targetId: submissionId,
      details: { newPropertyId },
      adminEmail: request.auth.token.email || 'admin',
      adminUid: request.auth.uid,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, submissionId, propertyId: newPropertyId };
  } catch (error) {
    console.error('Error approving seller submission:', error);
    throw new HttpsError('internal', error.message);
  }
});

