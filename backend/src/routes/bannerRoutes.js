import express from 'express';
import { getBanners, getHeroBanner } from '../controllers/bannerController.js';

const router = express.Router();

router.get('/', getBanners);
router.get('/hero', getHeroBanner);

export default router;
