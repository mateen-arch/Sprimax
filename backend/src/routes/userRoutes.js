import express from 'express';
import {
  getUsers,
  createUser,
  getAdminProfile,
  updateAdminProfile,
} from '../controllers/userController.js';

const router = express.Router();

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/profile')
  .get(getAdminProfile)
  .put(updateAdminProfile);

export default router;
