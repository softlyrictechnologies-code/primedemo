import { adminDb } from '../config/firebase.js';

export async function searchPublishedProperties({
  location,
  minPrice,
  maxPrice,
  minArea,
  maxArea,
  propertyType,
  sortBy = 'newest',
  page = 1,
  pageSize = 12,
  features = [],
} = {}) {
  const snapshot = await adminDb
    .collection('properties')
    .where('published', '==', true)
    .get();

  let results = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((property) => {
      if (location && !String(property.location || '').toLowerCase().includes(String(location).toLowerCase())) {
        return false;
      }

      if (propertyType && String(property.propertyType || '').toLowerCase() !== String(propertyType).toLowerCase()) {
        return false;
      }

      const price = Number(property.price || 0);
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;

      const area = Number(property.areaSqFt || property.totalAreaSqft || 0);
      if (minArea && area < Number(minArea)) return false;
      if (maxArea && area > Number(maxArea)) return false;

      if (features.length > 0) {
        const propFeatures = (property.features || property.amenities || []).map((feature) => String(feature).toLowerCase());
        const hasAll = features.every((feature) => propFeatures.includes(String(feature).toLowerCase()));
        if (!hasAll) return false;
      }

      return true;
    });

  if (sortBy === 'price_asc') {
    results = results.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortBy === 'price_desc') {
    results = results.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else {
    results = results.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }

  const total = results.length;
  const startIndex = (Number(page) - 1) * Number(pageSize);
  const endIndex = startIndex + Number(pageSize);
  const paged = results.slice(startIndex, endIndex);

  return {
    total,
    page: Number(page),
    pageSize: Number(pageSize),
    totalPages: Math.max(1, Math.ceil(total / Number(pageSize))),
    items: paged,
    hasMore: endIndex < total,
  };
}
