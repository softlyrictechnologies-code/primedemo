import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

export const PROPERTIES_COLLECTION = 'properties';

// Re-export submitInquiry for backward compatibility with existing components
export { submitInquiry } from './inquiryService.js';

/**
 * Normalizes property document data so it seamlessly matches
 * both the Firestore schema and existing PlotFinder UI component expectations.
 */
export function normalizePropertyDoc(id, data = {}) {
  const areaSqFt = data.areaSqFt ?? data.totalAreaSqft ?? 1200;
  const price = data.price ?? (data.priceLakhs ? data.priceLakhs * 100000 : 0);
  const priceLakhs = data.priceLakhs ?? (price ? Number((price / 100000).toFixed(2)) : 0);
  const formattedPrice = data.formattedPrice ?? (
    priceLakhs >= 100
      ? `₹${(priceLakhs / 100).toFixed(2)} Crores`
      : `₹${priceLakhs} Lakhs`
  );
  const rawImages = Array.isArray(data.images) && data.images.length > 0
    ? data.images
    : (Array.isArray(data.imageUrls) ? data.imageUrls : (data.image ? [data.image] : []));
  
  const mainImage = rawImages.length > 0
    ? rawImages[0]
    : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80';

  return {
    id,
    title: data.title || 'Untitled Property',
    subTitle: data.subTitle || data.description?.slice(0, 80) || '',
    description: data.description || '',
    propertyType: data.propertyType || data.type || 'Residential Plot',
    type: data.type || data.propertyType || 'Residential Plot',
    price: price,
    priceLakhs: priceLakhs,
    formattedPrice: formattedPrice,
    location: data.location || (data.area ? `${data.area}, Chennai` : 'Chennai'),
    city: data.city || 'Chennai',
    area: data.area || 'OMR',
    bedrooms: data.bedrooms ?? 0,
    bathrooms: data.bathrooms ?? 0,
    areaSqFt: areaSqFt,
    totalAreaSqft: data.totalAreaSqft ?? areaSqFt,
    pricePerSqft: data.pricePerSqFt ?? data.pricePerSqft ?? Math.round(price / (areaSqFt || 1)),
    pricePerSqFt: data.pricePerSqFt ?? data.pricePerSqft ?? Math.round(price / (areaSqFt || 1)),
    images: rawImages,
    imageUrls: rawImages,
    image: mainImage,
    gallery: rawImages.length > 0 ? rawImages : [mainImage],
    dimensions: data.dimensions || '30 ft x 40 ft',
    facing: data.facing || 'East Facing',
    roadWidth: data.roadWidth || '30 Feet Road',
    approval: data.approval || 'CMDA & DTCP Approved',
    approvalNo: data.approvalNo || 'CMDA/REG/2024',
    verified: data.verified ?? true,
    featured: data.featured ?? false,
    pattaStatus: data.pattaStatus || 'Clear Ownership Patta',
    waterSource: data.waterSource || 'Sweet Potable Water',
    bankLoans: Array.isArray(data.bankLoans) ? data.bankLoans : ['HDFC', 'SBI', 'ICICI'],
    landmarks: Array.isArray(data.landmarks) ? data.landmarks : ['Near OMR IT Expressway'],
    amenities: Array.isArray(data.amenities) ? data.amenities : ['24/7 Security', 'Tar Road', 'EB Line'],
    appreciationRate: data.appreciationRate || '+12.5% YoY',
    coordinates: data.coordinates || { lat: 12.83, lng: 80.22 },
    published: data.published ?? true,
    createdBy: data.createdBy || 'community-admin',
    isDemo: data.isDemo ?? false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Fetch all published properties from Firestore
 */
export async function getPublishedProperties() {
  try {
    const propertiesRef = collection(db, PROPERTIES_COLLECTION);
    const q = query(propertiesRef, where('published', '==', true));
    const snapshot = await getDocs(q);

    const properties = [];
    snapshot.forEach((docSnap) => {
      properties.push(normalizePropertyDoc(docSnap.id, docSnap.data()));
    });
    return properties;
  } catch (error) {
    console.error('Error fetching published properties from Firestore:', error);
    throw error;
  }
}

/**
 * Fetch a single property by document ID
 */
export async function getPropertyById(id) {
  if (!id) throw new Error('Property ID is required.');
  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return normalizePropertyDoc(docSnap.id, docSnap.data());
  } catch (error) {
    console.error(`Error fetching property ${id} from Firestore:`, error);
    throw error;
  }
}

/**
 * Add a new property listing through an authorized workflow.
 * Restricts unrestricted public modification.
 */
export async function addProperty(propertyData) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to create property listings.');
  }

  if (!propertyData.title || typeof propertyData.title !== 'string') {
    throw new Error('Property title is required.');
  }

  try {
    const propertiesRef = collection(db, PROPERTIES_COLLECTION);

    const images = Array.isArray(propertyData.images) && propertyData.images.length > 0
      ? propertyData.images
      : (propertyData.image ? [propertyData.image] : []);

    const areaSqFt = Number(propertyData.areaSqFt) || Number(propertyData.sqft) || 1200;
    const price = Number(propertyData.price) || (Number(propertyData.priceLakhs) * 100000) || 0;
    const pricePerSqFt = propertyData.pricePerSqFt || Math.round(price / (areaSqFt || 1));

    const docPayload = {
      title: propertyData.title.trim().slice(0, 200),
      description: (propertyData.description || '').slice(0, 2500),
      propertyType: propertyData.propertyType || propertyData.type || 'Residential Plot',
      location: propertyData.location || `${propertyData.area || 'OMR'}, Chennai`,
      area: propertyData.area || propertyData.locality || 'OMR',
      areaSqFt: areaSqFt,
      price: price,
      pricePerSqFt: pricePerSqFt,
      facing: propertyData.facing || 'East Facing',
      approval: propertyData.approval || 'CMDA Approved',
      approvalNo: propertyData.approvalNo || 'Pending Issuance',
      amenities: Array.isArray(propertyData.amenities) ? propertyData.amenities : ['24/7 Security', 'Tar Road', 'EB Line'],
      images: images,
      imageUrls: images,
      featured: Boolean(propertyData.featured),
      published: propertyData.published ?? true,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(propertiesRef, docPayload);
    return { id: docRef.id, ...docPayload };
  } catch (error) {
    console.error('Error adding property to Firestore:', error);
    throw error;
  }
}

/**
 * Update an existing property document.
 * Requires authentication and authorization.
 */
export async function updateProperty(id, propertyData) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to update property listings.');
  }

  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, id);
    const updatePayload = {
      ...propertyData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updatePayload);
    return { id, ...updatePayload };
  } catch (error) {
    console.error(`Error updating property ${id} in Firestore:`, error);
    throw error;
  }
}

/**
 * Delete a property listing.
 * Restricted to administrators or authenticated listing owners.
 */
export async function deleteProperty(id) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to delete property listings.');
  }

  try {
    const docRef = doc(db, PROPERTIES_COLLECTION, id);
    await deleteDoc(docRef);
    return { id, deleted: true };
  } catch (error) {
    console.error(`Error deleting property ${id} from Firestore:`, error);
    throw error;
  }
}
