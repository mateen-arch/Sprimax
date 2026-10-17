import express from 'express';
import {
  getIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} from '../controllers/industryController.js';

const router = express.Router();

router.route('/')
  .get(getIndustries)
  .post(createIndustry);

router.route('/:id')
  .get(getIndustryById)
  .put(updateIndustry)
  .delete(deleteIndustry);

export default router;
