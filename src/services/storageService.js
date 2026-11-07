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

function getCloudinaryEnv() {
  const cloudName =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) ||
    (typeof process !== 'undefined' && process.env && process.env.VITE_CLOUDINARY_CLOUD_NAME) ||
    '';

  const uploadPreset =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) ||
    (typeof process !== 'undefined' && process.env && process.env.VITE_CLOUDINARY_UPLOAD_PRESET) ||
    '';

  return { cloudName, uploadPreset };
}

async function uploadToCloudinary(file, folder, onProgress = () => {}) {
  validateImageFile(file);

  const { cloudName, uploadPreset } = getCloudinaryEnv();

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your environment.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress({
        fileName: file.name,
        progress,
        bytesTransferred: event.loaded,
        totalBytes: event.total,
      });
    };

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText || '{}');

        if (xhr.status >= 200 && xhr.status < 300 && response?.secure_url) {
          resolve({
            downloadUrl: response.secure_url,
            storagePath: response.public_id,
            fileName: file.name,
            fileSize: file.size,
          });
          return;
        }

        reject(new Error(response?.error?.message || 'Cloudinary image upload failed.'));
      } catch (error) {
        reject(new Error('Cloudinary image upload failed.'));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading image to Cloudinary.'));
    };

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    xhr.send(formData);
  });
}

/**
 * Uploads a property image to Cloudinary.
 * Returns download URL and storage path.
 */
export async function uploadPropertyImage(file, propertyId = 'general', onProgress = () => {}) {
  return uploadToCloudinary(file, `properties/${propertyId}`, onProgress);
}

/**
 * Uploads a seller submission image to Cloudinary.
 */
export async function uploadSellerSubmissionImage(file, submissionId = 'temp', onProgress = () => {}) {
  return uploadToCloudinary(file, `submissions/${submissionId}`, onProgress);
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

/**
 * Unsigned Cloudinary uploads cannot be safely deleted from the browser,
 * so this is intentionally a safe no-op.
 */
export async function deletePropertyImageByUrl() {
  return false;
}
