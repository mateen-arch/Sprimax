import express from 'express';
import {
  getPrimaryCatalog,
  getDownloads,
  getDownloadById,
  createDownload,
  updateDownload,
  deleteDownload,
  trackDownload,
} from '../controllers/downloadController.js';

const router = express.Router();

router.get('/primary-catalog', getPrimaryCatalog);

router.route('/')
  .get(getDownloads)
  .post(createDownload);

router.route('/:id')
  .get(getDownloadById)
  .put(updateDownload)
  .delete(deleteDownload);

router.post('/:id/track', trackDownload);

export default router;
