import express from 'express';
import {
  createEnquiry,
  getEnquiries,
  updateEnquiry,
  deleteEnquiry,
} from '../controllers/enquiryController.js';

const router = express.Router();

router.route('/')
  .post(createEnquiry)
  .get(getEnquiries);

router.route('/:id')
  .patch(updateEnquiry)
  .put(updateEnquiry)
  .delete(deleteEnquiry);

export default router;
