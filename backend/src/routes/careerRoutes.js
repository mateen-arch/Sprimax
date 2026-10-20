import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getPublicJobs,
  getPublicJobById,
  submitJobApplication,
  submitGeneralApplication,
  getPublicCareersSettings,
  getAdminJobs,
  getAdminJobById,
  createAdminJob,
  updateAdminJob,
  deleteAdminJob,
  duplicateAdminJob,
  getAdminApplications,
  getAdminApplicationById,
  updateApplicationStatus,
  updateApplicationRating,
  addApplicationNote,
  scheduleApplicationInterview,
  deleteApplication,
  getAdminSettings,
  updateAdminSettings,
  exportApplicationsCsv,
  downloadApplicationReceipt,
  downloadAdminApplicationReceipt,
  verifyReceiptPublic,
} from '../controllers/careerController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `cv-${safeBase}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = /pdf|doc|docx/;
  const ext = allowedExts.test(path.extname(file.originalname).toLowerCase());
  if (ext) {
    cb(null, true);
  } else {
    cb(new Error('Uploaded file must be a PDF or Word document (.pdf, .docx, .doc)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter,
});

const router = express.Router();

// =========================================================================
// PUBLIC CAREERS ROUTES
// =========================================================================
router.get('/jobs', getPublicJobs);
router.get('/jobs/:identifier', getPublicJobById);
router.post('/apply', upload.any(), submitJobApplication);
router.post('/apply-general', upload.any(), submitGeneralApplication);
router.get('/settings/public', getPublicCareersSettings);
router.get('/applications/receipt', downloadApplicationReceipt);
router.get('/verify-receipt', verifyReceiptPublic);

// =========================================================================
// ADMIN CAREERS ROUTES
// =========================================================================
router.get('/admin/jobs', getAdminJobs);
router.get('/admin/jobs/:id', getAdminJobById);
router.post('/admin/jobs', createAdminJob);
router.put('/admin/jobs/:id', updateAdminJob);
router.delete('/admin/jobs/:id', deleteAdminJob);
router.post('/admin/jobs/:id/duplicate', duplicateAdminJob);

// Admin Applications
router.get('/admin/applications', getAdminApplications);
router.get('/admin/applications/:id', getAdminApplicationById);
router.get('/admin/applications/:id/receipt', downloadAdminApplicationReceipt);
router.patch('/admin/applications/:id/status', updateApplicationStatus);
router.patch('/admin/applications/:id/rating', updateApplicationRating);
router.post('/admin/applications/:id/notes', addApplicationNote);
router.post('/admin/applications/:id/interviews', scheduleApplicationInterview);
router.delete('/admin/applications/:id', deleteApplication);
router.get('/admin/export', exportApplicationsCsv);

// Admin Settings
router.get('/admin/settings', getAdminSettings);
router.put('/admin/settings', updateAdminSettings);

export default router;
