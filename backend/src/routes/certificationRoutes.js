import express from 'express';
import {
  getCertifications,
  getCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
} from '../controllers/certificationController.js';

const router = express.Router();

router.route('/')
  .get(getCertifications)
  .post(createCertification);

router.route('/:id')
  .get(getCertificationById)
  .put(updateCertification)
  .delete(deleteCertification);

export default router;
