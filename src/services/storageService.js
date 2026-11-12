import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, storage } from '../firebase.js';

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates a file before upload
 */
export function validateImageFile(file) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Unsupported image type "${file.type}". Allowed formats: JPEG, PNG, WEBP.`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File size (${sizeMb} MB) exceeds maximum allowed limit of 5 MB.`);
  }

  return true;
}

function cleanFileName(fileName = 'image') {
  const cleaned = String(fileName || 'image')
    .split(/[\\/]/)
    .pop()
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return cleaned || 'image';
}

async function uploadToFirebaseStorage(file, storagePath, onProgress = () => {}, metadata = {}) {
  validateImageFile(file);

  const currentUser = auth.currentUser;
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      ...metadata,
      uploadedBy: currentUser?.uid || 'public-seller',
    },
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.totalBytes > 0 ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 : 0;
        onProgress({
          fileName: file.name,
          progress,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
        });
      },
      (error) => reject(error),
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadUrl,
            storagePath: uploadTask.snapshot.ref.fullPath,
            fileName: file.name,
            fileSize: file.size,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Uploads a property image to Firebase Storage.
 * Returns download URL and storage path.
 */
export async function uploadPropertyImage(file, propertyId = 'general', onProgress = () => {}) {
  const safeFileName = cleanFileName(file.name);
  const storagePath = `properties/${propertyId}/${Date.now()}_${safeFileName}`;
  return uploadToFirebaseStorage(file, storagePath, onProgress, { propertyId });
}

/**
 * Uploads a seller submission image to Firebase Storage.
 */
export async function uploadSellerSubmissionImage(file, submissionId = 'temp', onProgress = () => {}) {
  const safeFileName = cleanFileName(file.name);
  const storagePath = `sellerSubmissions/${submissionId}/${Date.now()}_${safeFileName}`;
  return uploadToFirebaseStorage(file, storagePath, onProgress, { submissionId });
}

export async function deleteSellerSubmissionImageByUrl(imageUrl, submissionId = '') {
  if (!imageUrl) {
    return false;
  }

  let normalizedPath = String(imageUrl).trim();

  if (normalizedPath.includes('firebasestorage.googleapis.com') || normalizedPath.includes('storage.googleapis.com')) {
    const match = normalizedPath.match(/\/o\/(.+?)(\?|$)/);
    if (match) {
      normalizedPath = decodeURIComponent(match[1]).replace(/%2F/g, '/');
    }
  }

  normalizedPath = normalizedPath.replace(/^\/+/, '');

  if (!normalizedPath.startsWith('sellerSubmissions/')) {
    return false;
  }

  if (submissionId && !normalizedPath.startsWith(`sellerSubmissions/${submissionId}/`)) {
    return false;
  }

  await deleteObject(ref(storage, normalizedPath));
  return true;
}

export async function uploadPropertyImages(files = [], propertyId = 'general', onProgress = () => {}) {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const uploads = files.filter(Boolean);
  if (!uploads.length) {
    return [];
  }

  return Promise.all(
    uploads.map((file, index) =>
      uploadPropertyImage(file, propertyId, (progressInfo) => {
        onProgress({ index, ...progressInfo, totalFiles: uploads.length });
      })
    )
  );
}

export async function deletePropertyImageByUrl(imageUrl, propertyId = '') {
  if (!imageUrl) {
    return false;
  }

  let normalizedPath = String(imageUrl).trim();

  if (normalizedPath.includes('firebasestorage.googleapis.com') || normalizedPath.includes('storage.googleapis.com')) {
    const match = normalizedPath.match(/\/o\/(.+?)(\?|$)/);
    if (match) {
      normalizedPath = decodeURIComponent(match[1]).replace(/%2F/g, '/');
    }
  }

  normalizedPath = normalizedPath.replace(/^\/+/, '');

  if (!normalizedPath.startsWith('properties/')) {
    return false;
  }

  if (propertyId && !normalizedPath.startsWith(`properties/${propertyId}/`)) {
    return false;
  }

  await deleteObject(ref(storage, normalizedPath));
  return true;
}
