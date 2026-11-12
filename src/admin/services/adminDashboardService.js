import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { PROPERTIES_COLLECTION } from '../../services/propertyService.js';
import { INQUIRIES_COLLECTION } from '../../services/inquiryService.js';
import { SELLER_SUBMISSIONS_COLLECTION } from '../../services/sellerService.js';
import { CONTACT_MESSAGES_COLLECTION } from '../../services/contactService.js';
import { USERS_COLLECTION } from '../../services/userService.js';
import { ADMIN_LOGS_COLLECTION } from './adminLogService.js';

export async function getDashboardMetrics() {
  try {
    // 1. Fetch properties
    const propertiesSnap = await getDocs(collection(db, PROPERTIES_COLLECTION));
    let totalProperties = 0;
    let publishedProperties = 0;
    let draftProperties = 0;
    let soldOutProperties = 0;
    const corridorCounts = {};

    propertiesSnap.forEach((doc) => {
      totalProperties++;
      const data = doc.data();
      const soldOut = Boolean(data.isSoldOut || data.status === 'sold_out' || data.status === 'sold out');

      if (data.published === true && !soldOut) publishedProperties++;
      else if (soldOut) soldOutProperties++;
      else draftProperties++;

      const area = data.area || 'Other';
      corridorCounts[area] = (corridorCounts[area] || 0) + 1;
    });

    // 2. Fetch inquiries
    const inquiriesSnap = await getDocs(collection(db, INQUIRIES_COLLECTION));
    let totalInquiries = 0;
    let newInquiries = 0;
    let completedInquiries = 0;

    inquiriesSnap.forEach((doc) => {
      totalInquiries++;
      const data = doc.data();
      const status = String(data.status || '').toLowerCase();
      if (status === 'new') newInquiries++;
      if (['completed', 'converted', 'closed'].includes(status)) completedInquiries++;
    });

    // 3. Fetch seller submissions
    const sellerSnap = await getDocs(collection(db, SELLER_SUBMISSIONS_COLLECTION));
    let totalSubmissions = 0;
    let pendingSubmissions = 0;
    let approvedSubmissions = 0;

    sellerSnap.forEach((doc) => {
      totalSubmissions++;
      const data = doc.data();
      if (data.status === 'pending') pendingSubmissions++;
      if (data.status === 'approved') approvedSubmissions++;
    });

    // 4. Fetch users
    const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
    let totalUsers = 0;
    let buyerCount = 0;
    let sellerCount = 0;
    let adminCount = 0;

    usersSnap.forEach((doc) => {
      totalUsers++;
      const data = doc.data();
      if (data.role === 'seller') sellerCount++;
      else if (data.role === 'admin') adminCount++;
      else buyerCount++;
    });

    // 5. Fetch contact messages
    let totalMessages = 0;
    let newMessages = 0;
    try {
      const messagesSnap = await getDocs(collection(db, CONTACT_MESSAGES_COLLECTION));
      messagesSnap.forEach((doc) => {
        totalMessages++;
        if (doc.data().status === 'new') newMessages++;
      });
    } catch {
      // Optional collection
    }

    // 6. Fetch recent activity from adminLogs
    const recentLogs = [];
    try {
      const logsQuery = query(
        collection(db, ADMIN_LOGS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(8)
      );
      const logsSnap = await getDocs(logsQuery);
      logsSnap.forEach((d) => {
        recentLogs.push({ id: d.id, ...d.data() });
      });
    } catch (e) {
      console.warn('[DashboardService] Could not fetch admin logs:', e.message);
    }

    return {
      properties: {
        total: totalProperties,
        published: publishedProperties,
        draft: draftProperties,
        soldOut: soldOutProperties,
        byCorridor: corridorCounts,
      },
      inquiries: {
        total: totalInquiries,
        new: newInquiries,
        completed: completedInquiries,
      },
      sellers: {
        total: totalSubmissions,
        pending: pendingSubmissions,
        approved: approvedSubmissions,
      },
      users: {
        total: totalUsers,
        buyers: buyerCount,
        sellers: sellerCount,
        admins: adminCount,
      },
      messages: {
        total: totalMessages,
        new: newMessages,
      },
      recentActivity: recentLogs,
    };
  } catch (error) {
    const message = `adminDashboardService.getDashboardMetrics() failed while reading required collections: ${error.message}`;
    console.error(`[AdminDashboardService] ${message}`, error);
    throw new Error(message);
  }
}

