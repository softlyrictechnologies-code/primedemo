import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, where, query, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { assertValidPropertyTitle, assertPublishableProperty } from '../utils/propertyValidation.js';

export const PROPERTIES_COLLECTION = 'properties';
export { submitInquiry } from './inquiryService.js';

export function normalizePropertyDoc(id, data = {}) {
  const areaSqFt = Number(data.areaSqFt ?? data.totalAreaSqft ?? data.sqft ?? 1200);
  const price = Number(data.price ?? (Number(data.priceLakhs || 0) * 100000));
  const images = Array.isArray(data.images) && data.images.length ? data.images : (Array.isArray(data.imageUrls) && data.imageUrls.length ? data.imageUrls : (data.image ? [data.image] : []));
  const status = String(data.status || (data.published === false ? 'draft' : 'published')).toLowerCase();
  const isSoldOut = Boolean(data.isSoldOut || status === 'sold_out' || status === 'sold out');
  return {
    ...data,
    id,
    title: data.title || 'Untitled Property',
    description: data.description || '',
    type: data.type || data.propertyType || 'Residential Plot',
    propertyType: data.propertyType || data.type || 'Residential Plot',
    location: data.location || (data.area ? `${data.area}, Chennai` : 'Chennai'),
    area: data.area || 'OMR',
    areaSqFt,
    totalAreaSqft: Number(data.totalAreaSqft ?? areaSqFt),
    price,
    priceLakhs: Number(data.priceLakhs ?? (price / 100000)),
    pricePerSqft: Number(data.pricePerSqFt ?? data.pricePerSqft ?? Math.round(price / Math.max(areaSqFt, 1))),
    pricePerSqFt: Number(data.pricePerSqFt ?? data.pricePerSqft ?? Math.round(price / Math.max(areaSqFt, 1))),
    image: images[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    images,
    gallery: images,
    published: data.published ?? true,
    featured: Boolean(data.featured),
    isSoldOut,
    status: isSoldOut ? 'sold_out' : status,
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

const readAllPublished = async () => {
  const snapshot = await getDocs(query(collection(db, PROPERTIES_COLLECTION), where('published', '==', true)));
  return snapshot.docs.map((item) => normalizePropertyDoc(item.id, item.data()));
};

export async function getPublishedProperties() {
  return readAllPublished();
}

/** Filter and paginate client-side so listing discovery does not depend on a composite Firestore index. */
export async function getPublishedPropertiesPage({ pageSize = 24, cursor = null, sortBy = 'newest', filters = {} } = {}) {
  const all = await readAllPublished();
  const selected = all.filter((property) => {
    const location = String(property.location || '').toLowerCase();
    const type = String(property.type || property.propertyType || '').toLowerCase();
    const selectedLocation = String(filters.location || '').toLowerCase();
    const selectedType = String(filters.type || '').toLowerCase();
    const typeMatches = !selectedType || selectedType === 'all types' || type === selectedType || (selectedType === 'residential plot' && /(residential|villa|gated)/.test(type)) || (selectedType === 'commercial plot' && type.includes('commercial')) || (selectedType === 'agricultural land' && /(agricultural|farm)/.test(type));
    return (!selectedLocation || selectedLocation === 'all locations' || location.includes(selectedLocation) || String(property.area || '').toLowerCase() === selectedLocation) && typeMatches;
  });
  const timestamp = (item) => item.createdAt?.seconds || (item.createdAt ? Date.parse(item.createdAt) / 1000 : 0);
  selected.sort((a, b) => sortBy === 'price-low'
    ? a.priceLakhs - b.priceLakhs
    : sortBy === 'price-high'
      ? b.priceLakhs - a.priceLakhs
      : timestamp(b) - timestamp(a));
  const offset = Math.max(0, Number(cursor) || 0);
  const size = Math.max(1, Math.min(Number(pageSize) || 24, 50));
  const properties = selected.slice(offset, offset + size);
  return { properties, cursor: offset + properties.length, hasMore: offset + properties.length < selected.length };
}

export async function getHomepageProperties({ pageSize = 12, featuredLimit = 6 } = {}) {
  const all = await readAllPublished();
  const featured = all.filter((property) => property.featured).slice(0, featuredLimit);
  const recent = [...all].sort((a, b) => {
    const aTime = a.createdAt?.seconds || (a.createdAt ? Date.parse(a.createdAt) / 1000 : 0);
    const bTime = b.createdAt?.seconds || (b.createdAt ? Date.parse(b.createdAt) / 1000 : 0);
    return bTime - aTime;
  }).slice(0, pageSize);
  return [...new Map([...featured, ...recent].map((property) => [property.id, property])).values()];
}

export async function getPropertyById(id) {
  if (!id) throw new Error('Property ID is required.');
  const snapshot = await getDoc(doc(db, PROPERTIES_COLLECTION, id));
  return snapshot.exists() ? normalizePropertyDoc(snapshot.id, snapshot.data()) : null;
}

function propertyPayload(data = {}) {
  assertValidPropertyTitle(data.title);
  const images = Array.isArray(data.images) ? data.images.filter(Boolean) : (data.image ? [data.image] : []);
  const areaSqFt = Number(data.areaSqFt || data.totalAreaSqft || data.sqft || 1200);
  const price = Number(data.price || Number(data.priceLakhs || 0) * 100000);
  const sold = Boolean(data.isSoldOut || data.status === 'sold_out' || data.status === 'sold out');
  const payload = {
    ...data,
    title: String(data.title).trim().replace(/\s+/g, ' ').slice(0, 100),
    description: String(data.description || '').slice(0, 2500),
    propertyType: data.propertyType || data.type || 'Residential Plot',
    type: data.type || data.propertyType || 'Residential Plot',
    areaSqFt,
    totalAreaSqft: areaSqFt,
    price,
    priceLakhs: Number(data.priceLakhs || price / 100000),
    pricePerSqFt: Number(data.pricePerSqFt || Math.round(price / Math.max(areaSqFt, 1))),
    images,
    imageUrls: images,
    image: images[0] || '',
    published: sold || Boolean(data.published),
    featured: Boolean(data.featured),
    verified: Boolean(data.verified),
    isSoldOut: sold,
    status: sold ? 'sold_out' : (data.published ? 'published' : 'draft'),
    soldOutAt: sold ? (data.soldOutAt || serverTimestamp()) : null,
    updatedAt: serverTimestamp(),
  };
  if (payload.published) assertPublishableProperty(payload);
  return payload;
}

export async function addProperty(data) {
  if (!auth.currentUser) throw new Error('Authentication required to create property listings.');
  const payload = { ...propertyPayload(data), createdBy: auth.currentUser.uid, createdAt: serverTimestamp() };
  const ref = await addDoc(collection(db, PROPERTIES_COLLECTION), payload);
  return { id: ref.id, ...payload };
}

export async function updateProperty(id, data) {
  if (!auth.currentUser) throw new Error('Authentication required to update property listings.');
  const payload = propertyPayload(data);
  await updateDoc(doc(db, PROPERTIES_COLLECTION, id), payload);
  return { id, ...payload };
}

export async function deleteProperty(id) {
  if (!auth.currentUser) throw new Error('Authentication required to delete property listings.');
  await deleteDoc(doc(db, PROPERTIES_COLLECTION, id));
  return { id, deleted: true };
}
