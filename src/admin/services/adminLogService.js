import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase.js';

export const ADMIN_LOGS_COLLECTION = 'adminLogs';

/**
 * Records an administrative audit trail record in Firestore.
 */
export async function logAdminAction({
  action,
  target,
  targetId = null,
  details = {},
  adminEmail = null,
}) {
  try {
    const currentUser = auth.currentUser;
    const actorEmail = adminEmail || currentUser?.email || 'system-admin';

    const logsRef = collection(db, ADMIN_LOGS_COLLECTION);
    const payload = {
      action: action.toUpperCase(),
      target: target || 'general',
      targetId: targetId ? String(targetId) : null,
      details: typeof details === 'object' ? details : { message: String(details) },
      adminEmail: actorEmail,
      adminUid: currentUser?.uid || null,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(logsRef, payload);
    return { id: docRef.id, ...payload };
  } catch (err) {
    const message = `adminLogService.logAdminAction() failed while writing adminLogs: ${err.message}`;
    console.error(`[AdminLogService] ${message}`, err);
    throw new Error(message);
  }
}

/**
 * Fetches recent audit logs for the security overview.
 */
export async function getAdminLogs(limitCount = 50) {
  try {
    const logsRef = collection(db, ADMIN_LOGS_COLLECTION);
    const q = query(logsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);

    const logs = [];
    snap.forEach((docSnap) => {
      logs.push({
        id: docSnap.id,
        ...docSnap.data(),
      });
    });
    return logs;
  } catch (err) {
    const message = `adminLogService.getAdminLogs() failed while reading adminLogs: ${err.message}`;
    console.error(`[AdminLogService] ${message}`, err);
    throw new Error(message);
  }
}

