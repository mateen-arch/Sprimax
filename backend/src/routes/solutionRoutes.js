import express from 'express';
import {
  getPublicSolutionBySlug,
  getSolutionByPreviewToken,
  getAdminSolutions,
  getAdminSolutionById,
  createAdminSolution,
  updateAdminSolution,
  deleteAdminSolution,
  duplicateAdminSolution,
  publishSolution,
  unpublishSolution,
  restoreSolutionVersion,
  generatePreviewToken,
  revokePreviewToken,
} from '../controllers/solutionController.js';

const router = express.Router();

// Public routes
router.get('/public/:slug', getPublicSolutionBySlug);
router.get('/preview/:token', getSolutionByPreviewToken);

// Admin preview token actions
router.post('/:id/preview-token', generatePreviewToken);
router.delete('/:id/preview-token', revokePreviewToken);

// Admin lifecycle actions
router.post('/:id/publish', publishSolution);
router.post('/:id/unpublish', unpublishSolution);
router.post('/:id/duplicate', duplicateAdminSolution);
router.post('/:id/restore-version/:versionNumber', restoreSolutionVersion);

// Admin standard CRUD
router.route('/')
  .get(getAdminSolutions)
  .post(createAdminSolution);

router.route('/:identifier')
  .get(getAdminSolutionById)
  .put(updateAdminSolution)
  .delete(deleteAdminSolution);

export default router;
