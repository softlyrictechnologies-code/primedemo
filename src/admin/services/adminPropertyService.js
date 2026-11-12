import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase.js';
import { normalizePropertyDoc, PROPERTIES_COLLECTION } from '../../services/propertyService.js';
import { deletePropertyImageByUrl } from '../../services/storageService.js';
import { logAdminAction } from './adminLogService.js';
import { assertValidPropertyTitle, assertPublishableProperty } from '../../utils/propertyValidation.js';

/**
 * Fetch ALL properties (both published and drafts) for administration
 */
export async function getAllProperties() {
  try {
    const propertiesRef = collection(db, PROPERTIES_COLLECTION);
    const snap = await getDocs(propertiesRef);

    const properties = [];
    snap.forEach((docSnap) => {
      properties.push(normalizePropertyDoc(docSnap.id, docSnap.data()));
    });

    // Sort by createdAt or title descending
    return properties.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    const message = `adminPropertyService.getAllProperties() failed while reading the properties collection: ${error.message}`;
    console.error(`[AdminPropertyService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Create a new property from Admin panel
 */
export async function createProperty(propertyData) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Authentication required.');
  assertValidPropertyTitle(propertyData.title);
  if (propertyData.published === true) assertPublishableProperty(propertyData);

  try {
    const propertiesRef = collection(db, PROPERTIES_COLLECTION);

    const priceLakhs = Number(propertyData.priceLakhs) || 0;
    const price = Number(propertyData.price) || (priceLakhs * 100000);
    const areaSqFt = Number(propertyData.areaSqFt) || 1200;
    const pricePerSqFt = Number(propertyData.pricePerSqFt) || Math.round(price / (areaSqFt || 1));

    const rawImages = Array.isArray(propertyData.images)
      ? propertyData.images.filter(Boolean)
      : (Array.isArray(propertyData.imageUrls) ? propertyData.imageUrls.filter(Boolean) : (propertyData.image ? [propertyData.image] : []));
    const rawStoragePaths = Array.isArray(propertyData.storagePaths)
      ? propertyData.storagePaths.filter(Boolean)
      : [];

    const payload = {
      title: propertyData.title.trim().replace(/\s+/g, ' '),
      subTitle: (propertyData.subTitle || '').slice(0, 150),
      description: (propertyData.description || '').slice(0, 3000),
      propertyType: propertyData.propertyType || propertyData.type || 'Residential Plot',
      location: (propertyData.location || `${propertyData.area || 'OMR'}, Chennai`).trim(),
      area: propertyData.area || 'OMR',
      city: propertyData.city || 'Chennai',
      areaSqFt: areaSqFt,
      price: price,
      priceLakhs: priceLakhs || Number((price / 100000).toFixed(2)),
      pricePerSqFt: pricePerSqFt,
      facing: propertyData.facing || 'East Facing',
      approval: propertyData.approval || 'CMDA Approved',
      approvalNo: propertyData.approvalNo || 'CMDA/REG/2026',
      dimensions: propertyData.dimensions || '30 ft x 40 ft',
      roadWidth: propertyData.roadWidth || '30 Feet Blacktop Road',
      pattaStatus: propertyData.pattaStatus || 'Clear Single Ownership Patta',
      waterSource: propertyData.waterSource || 'Sweet Potable Water at 30 ft',
      bankLoans: Array.isArray(propertyData.bankLoans) ? propertyData.bankLoans : ['HDFC', 'SBI', 'ICICI'],
      amenities: Array.isArray(propertyData.amenities) ? propertyData.amenities : ['24/7 Security', 'Tar Road', 'EB Line'],
      landmarks: Array.isArray(propertyData.landmarks) ? propertyData.landmarks : ['Near OMR IT Corridor'],
      appreciationRate: propertyData.appreciationRate || '+12.5% YoY',
      images: rawImages,
      imageUrls: rawImages,
      storagePaths: rawStoragePaths,
      image: rawImages[0] || '',
      published: Boolean(propertyData.published),
      status: propertyData.status === 'sold_out' ? 'sold_out' : propertyData.published ? 'published' : 'draft',
      isSoldOut: propertyData.status === 'sold_out',
      soldOutAt: propertyData.status === 'sold_out' ? (propertyData.soldOutAt || serverTimestamp()) : null,
      featured: Boolean(propertyData.featured),
      verified: Boolean(propertyData.verified),
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(propertiesRef, payload);

    await logAdminAction({
      action: 'PROPERTY_CREATED',
      target: 'properties',
      targetId: docRef.id,
      details: { title: payload.title, area: payload.area, priceLakhs: payload.priceLakhs },
    });

    return { id: docRef.id, ...payload };
  } catch (error) {
    const message = `adminPropertyService.createProperty() failed while writing the properties collection: ${error.message}`;
    console.error(`[AdminPropertyService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Update an existing property
 */
export async function updateProperty(id, updateData) {
  if (!id) throw new Error('Property ID is required.');
  if (Object.prototype.hasOwnProperty.call(updateData, 'title')) {
    assertValidPropertyTitle(updateData.title);
    updateData = { ...updateData, title: updateData.title.trim().replace(/\s+/g, ' ') };
  }

  try {
    const rawImages = Array.isArray(updateData.images)
      ? updateData.images.filter(Boolean)
      : (Array.isArray(updateData.imageUrls) ? updateData.imageUrls.filter(Boolean) : (updateData.image ? [updateData.image] : []));
    const rawStoragePaths = Array.isArray(updateData.storagePaths)
      ? updateData.storagePaths.filter(Boolean)
      : [];
    const docRef = doc(db, PROPERTIES_COLLECTION, id);
    if (updateData.published === true) {
      const existing = await getDoc(docRef);
      const merged = { ...(existing.exists() ? existing.data() : {}), ...updateData };
      assertPublishableProperty(merged);
    }
    const payload = {
      ...updateData,
      images: rawImages,
      imageUrls: rawImages,
      storagePaths: rawStoragePaths,
      image: updateData.image || rawImages[0] || '',
      updatedAt: serverTimestamp(),
    };
    if (Object.prototype.hasOwnProperty.call(updateData, 'published')) {
      if (updateData.status !== 'sold_out') {
        payload.status = updateData.published ? 'published' : 'draft';
        payload.isSoldOut = false;
        payload.soldOutAt = null;
      }
    }
    if (updateData.status === 'sold_out' || updateData.isSoldOut === true) {
      payload.status = 'sold_out';
      payload.published = true;
      payload.isSoldOut = true;
      payload.soldOutAt = updateData.soldOutAt || serverTimestamp();
    }

    await updateDoc(docRef, payload);

    await logAdminAction({
      action: 'PROPERTY_UPDATED',
      target: 'properties',
      targetId: id,
      details: { updatedFields: Object.keys(updateData) },
    });

    return { id, ...payload };
  } catch (error) {
    const message = `adminPropertyService.updateProperty() failed for properties/${id}: ${error.message}`;
    console.error(`[AdminPropertyService] ${message}`, error);
    throw new Error(message);
  }
}

/**
 * Toggle publish status
 */
export async function togglePublishStatus(id, currentPublished) {
  const newStatus = !currentPublished;
  await updateProperty(id, {
    published: newStatus,
    status: newStatus ? 'published' : 'draft',
    isSoldOut: false,
    soldOutAt: null,
  });
  await logAdminAction({
    action: newStatus ? 'PROPERTY_PUBLISHED' : 'PROPERTY_UNPUBLISHED',
    target: 'properties',
    targetId: id,
    details: { published: newStatus },
  });
  return newStatus;
}

export async function markPropertySoldOut(id, reason = '', actor = auth.currentUser) {
  if (!id) throw new Error('Property ID is required.');

  const note = reason || 'Manual sale confirmation';
  const actorLabel = actor?.email || actor?.uid || 'system-admin';

  await updateProperty(id, {
    published: true,
    status: 'sold_out',
    isSoldOut: true,
    soldOutAt: serverTimestamp(),
    soldOutNote: note,
    soldOutReason: note,
    statusChangedBy: actorLabel,
  });

  await logAdminAction({
    action: 'PROPERTY_MARKED_SOLD_OUT',
    target: 'properties',
    targetId: id,
    details: { reason: note, statusChangedBy: actorLabel },
  });

  return true;
}

export async function restorePropertyToPublished(id, actor = auth.currentUser) {
  if (!id) throw new Error('Property ID is required.');

  const actorLabel = actor?.email || actor?.uid || 'system-admin';

  await updateProperty(id, {
    published: true,
    status: 'published',
    isSoldOut: false,
    soldOutAt: null,
    soldOutNote: null,
    soldOutReason: null,
    statusChangedBy: actorLabel,
  });

  await logAdminAction({
    action: 'PROPERTY_RESTORED_TO_PUBLISHED',
    target: 'properties',
    targetId: id,
    details: { published: true, statusChangedBy: actorLabel },
  });

  return true;
}

/**
 * Toggle featured flag
 */
export async function toggleFeaturedStatus(id, currentFeatured) {
  const newStatus = !currentFeatured;
  await updateProperty(id, { featured: newStatus });
  return newStatus;
}

/**
 * Delete a property permanently
 */
export async function deleteProperty(id, propertyTitle = '') {
  if (!id) throw new Error('Property ID is required.');

  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    const propertyData = docSnap.data() || {};

    const storagePaths = Array.isArray(propertyData.storagePaths)
      ? propertyData.storagePaths.filter(Boolean)
      : [];
    const imageUrls = Array.isArray(propertyData.images)
      ? propertyData.images.filter(Boolean)
      : (Array.isArray(propertyData.imageUrls) ? propertyData.imageUrls.filter(Boolean) : []);

    for (const storagePath of storagePaths) {
      try {
        await deletePropertyImageByUrl(storagePath, id);
      } catch (err) {
        console.warn('[AdminPropertyService] Unable to delete stored image during property deletion:', err?.message || err);
      }
    }

    for (const imageUrl of imageUrls) {
      try {
        await deletePropertyImageByUrl(imageUrl, id);
      } catch (err) {
        console.warn('[AdminPropertyService] Unable to delete image URL during property deletion:', err?.message || err);
      }
    }

    await deleteDoc(docRef);

    await logAdminAction({
      action: 'PROPERTY_DELETED',
      target: 'properties',
      targetId: id,
      details: { title: propertyTitle },
    });

    return { id, deleted: true };
  } catch (error) {
    const message = `adminPropertyService.deleteProperty() failed for properties/${id}: ${error.message}`;
    console.error(`[AdminPropertyService] ${message}`, error);
    throw new Error(message);
  }
}

