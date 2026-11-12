const REPEATED_CHARACTER = /(.)\1{3,}/i;
const REPEATED_WORD = /\b([a-z]{2,})(?:\s+\1){1,}\b/i;

export function validatePropertyTitle(value) {
  if (typeof value !== 'string') return 'A property title is required.';
  const title = value.trim().replace(/\s+/g, ' ');
  if (title.length < 12) return 'Use a descriptive property title with at least 12 characters.';
  if (title.length > 100) return 'Property titles can be up to 100 characters.';
  if (!/[a-z]{3,}/i.test(title) || !/\s/.test(title)) return 'Include a property type and a location, for example “Villa plot in Siruseri”.';
  if (REPEATED_CHARACTER.test(title) || REPEATED_WORD.test(title)) return 'Avoid repeated characters or repeated words in the property title.';
  const letters = title.toLowerCase().replace(/[^a-z]/g, '');
  const variety = new Set(letters).size / Math.max(letters.length, 1);
  if (letters.length > 8 && variety < 0.28) return 'Please enter a clear, descriptive property title.';
  return '';
}

export function assertValidPropertyTitle(value) {
  const message = validatePropertyTitle(value);
  if (message) throw new Error(message);
}

export function validatePublishableProperty(property = {}) {
  const titleError = validatePropertyTitle(property.title);
  if (titleError) return titleError;
  if (!String(property.location || '').trim()) return 'Add a property location before publishing.';
  if (!Number.isFinite(Number(property.areaSqFt)) || Number(property.areaSqFt) <= 0) return 'Add a valid land area before publishing.';
  const price = Number(property.price ?? (Number(property.priceLakhs) * 100000));
  if (!Number.isFinite(price) || price <= 0) return 'Add a valid asking price before publishing.';
  if (property.verified !== true) return 'Verify the legal documents before publishing.';
  if (!/\b(approved|verified|registered)\b/i.test(String(property.approval || ''))) return 'Add confirmed approval details before publishing.';
  const images = Array.isArray(property.images) ? property.images : (property.image ? [property.image] : []);
  if (!images.some(Boolean)) return 'Add at least one property image before publishing.';
  return '';
}

export function assertPublishableProperty(property) {
  const message = validatePublishableProperty(property);
  if (message) throw new Error(message);
}
