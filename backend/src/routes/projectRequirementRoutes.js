import express from 'express';
import {
  getProjectRequirements,
  getProjectRequirementById,
  createProjectRequirement,
  updateProjectRequirement,
  deleteProjectRequirement,
} from '../controllers/projectRequirementController.js';

const router = express.Router();

router.route('/')
  .get(getProjectRequirements)
  .post(createProjectRequirement);

router.route('/:id')
  .get(getProjectRequirementById)
  .put(updateProjectRequirement)
  .delete(deleteProjectRequirement);

export default router;
