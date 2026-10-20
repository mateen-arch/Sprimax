import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  isCloudinaryConfigured, 
  uploadBufferToCloudinary, 
  deleteFromCloudinary 
} from '../config/cloudinary.js';

const router = express.Router();

// Allowed image types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|svg)$/i;

// 5 MB max file size by default
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Memory storage for direct streaming to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const mimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase());
  const extValid = ALLOWED_EXTENSIONS.test(path.extname(file.originalname).toLowerCase());

  if (mimeValid && extValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed formats: JPG, PNG, WebP, GIF, SVG.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter,
});

/**
 * Sanitize folder path so it always lives under 'sprimax/'
 */
const sanitizeFolder = (folderInput) => {
  if (!folderInput || typeof folderInput !== 'string') {
    return 'sprimax/general';
  }
  const clean = folderInput.trim().replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9_\-\/]/g, '');
  return clean.startsWith('sprimax') ? clean : `sprimax/${clean}`;
};

/**
 * @route POST /api/upload
 * @desc Upload an image to Cloudinary and return full details
 */
router.post('/', (req, res) => {
  upload.any()(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File is too large. Maximum size is 5MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }

    const file = req.files?.[0];
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Verify Cloudinary configuration
    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Cloudinary is not configured. Please check your environment variables.',
      });
    }

    try {
      const ext = path.extname(file.originalname).toLowerCase();
      const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      const publicId = `${baseName}-${uniqueSuffix}`;

      // Destination folder from body or query param
      const targetFolder = sanitizeFolder(req.body?.folder || req.query?.folder);

      const result = await uploadBufferToCloudinary(file.buffer, {
        folder: targetFolder,
        public_id: publicId,
        resource_type: 'image',
      });

      return res.status(200).json({
        success: true,
        message: 'Image uploaded successfully to Cloudinary',
        url: result.secure_url,
        secure_url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        originalName: file.originalname,
      });
    } catch (uploadError) {
      console.error('[Upload API Error]:', uploadError.message);
      return res.status(500).json({
        success: false,
        message: uploadError.message || 'Failed to upload image to Cloudinary',
      });
    }
  });
});

/**
 * @route DELETE /api/upload
 * @desc Remove an asset from Cloudinary by public_id
 */
router.delete('/', async (req, res) => {
  const { public_id } = req.body || req.query || {};

  if (!public_id) {
    return res.status(400).json({
      success: false,
      message: 'public_id is required to delete an asset',
    });
  }

  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Cloudinary is not configured',
    });
  }

  try {
    const result = await deleteFromCloudinary(public_id);
    return res.status(200).json({
      success: true,
      message: 'Asset deleted from Cloudinary',
      result,
    });
  } catch (err) {
    console.error('[Delete Asset Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete asset from Cloudinary',
    });
  }
});

export default router;
