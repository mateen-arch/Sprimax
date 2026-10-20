const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Upload an image to Cloudinary via server-side endpoint with progress tracking
 * @param {File} file - Image file to upload
 * @param {Object} options - { folder, onProgress }
 * @returns {Promise<Object>} { url, secure_url, public_id, width, height, format, bytes }
 */
export function uploadImageApi(file, options = {}) {
  const { folder = 'sprimax/general', onProgress } = options;

  // Client-side quick checks
  if (!file) {
    return Promise.reject(new Error('No file selected'));
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
    return Promise.reject(new Error('Invalid image type. Please select a JPG, PNG, WebP, GIF, or SVG image.'));
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    return Promise.reject(new Error('Image is too large. Maximum size is 5MB.'));
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.open('POST', `${API_BASE}/upload`, true);

    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText || '{}');
      } catch {
        data = { message: xhr.statusText };
      }

      if (xhr.status >= 200 && xhr.status < 300 && data.success) {
        resolve(data);
      } else {
        const errorMsg = data.message || `Upload failed with status ${xhr.status}`;
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during image upload. Check backend connection.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Image upload timed out. Please try again.'));
    };

    xhr.send(formData);
  });
}

/**
 * Delete an image asset from Cloudinary by public_id
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<Object>}
 */
export async function deleteImageApi(publicId) {
  if (!publicId) return null;

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: publicId }),
    });
    return await res.json();
  } catch (err) {
    console.warn('[deleteImageApi] Error deleting asset:', err.message);
    return null;
  }
}
