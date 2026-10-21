import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

/**
 * Check if all required Cloudinary environment variables are set
 */
export const isCloudinaryConfigured = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
    dotenv.config();
  }
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Centralized Cloudinary instance getter
 * Throws non-secret error if not configured
 */
export const getCloudinary = () => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
};

/**
 * Upload a memory buffer directly to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {Object} options - Upload options (folder, public_id, etc.)
 * @returns {Promise<Object>} Upload result details
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  const cld = getCloudinary();

  const folder = options.folder || 'sprimax/general';
  const uploadOptions = {
    folder,
    resource_type: options.resource_type || 'image',
    public_id: options.public_id,
    overwrite: options.overwrite !== undefined ? options.overwrite : true,
    tags: options.tags || ['sprimax'],
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(new Error(error.message || 'Cloudinary upload failed'));
      }
      resolve({
        secure_url: result.secure_url,
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        resource_type: result.resource_type,
      });
    });

    uploadStream.end(buffer);
  });
};

/**
 * Best-effort deletion of an asset from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<Object|null>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  if (!isCloudinaryConfigured()) {
    console.warn('[Cloudinary] Skipping deletion: Cloudinary is not configured');
    return null;
  }

  try {
    const cld = getCloudinary();
    const res = await cld.uploader.destroy(publicId);
    return res;
  } catch (err) {
    console.warn(`[Cloudinary Warning] Failed to delete public_id "${publicId}":`, err.message);
    return null;
  }
};

/**
 * Generate optimized transformation URL
 * @param {string} publicIdOrUrl - Cloudinary public ID or secure URL
 * @param {Object} options - { width, height, crop, gravity, quality, format }
 * @returns {string} Optimized URL
 */
export const buildOptimizedUrl = (publicIdOrUrl, options = {}) => {
  if (!publicIdOrUrl) return '';

  // If already a full URL and not from Cloudinary, return as-is
  if (typeof publicIdOrUrl === 'string' && publicIdOrUrl.startsWith('http') && !publicIdOrUrl.includes('res.cloudinary.com')) {
    return publicIdOrUrl;
  }

  let publicId = publicIdOrUrl;
  // If it's a Cloudinary URL, extract the public_id
  if (typeof publicIdOrUrl === 'string' && publicIdOrUrl.includes('res.cloudinary.com')) {
    const match = publicIdOrUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
    if (match && match[1]) {
      publicId = match[1];
    }
  }

  try {
    const cld = isCloudinaryConfigured() ? getCloudinary() : cloudinary;
    return cld.url(publicId, {
      secure: true,
      fetch_format: options.format || 'auto',
      quality: options.quality || 'auto',
      width: options.width,
      height: options.height,
      crop: options.crop || (options.width && options.height ? 'fill' : undefined),
      gravity: options.gravity || 'auto',
      ...options,
    });
  } catch {
    return publicIdOrUrl;
  }
};

export default {
  isCloudinaryConfigured,
  getCloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  buildOptimizedUrl,
};
