import express from 'express';
import healthRoutes from './healthRoutes.js';
import userRoutes from './userRoutes.js';
import enquiryRoutes from './enquiryRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import bannerRoutes from './bannerRoutes.js';
import downloadRoutes from './downloadRoutes.js';
import industryRoutes from './industryRoutes.js';
import projectRequirementRoutes from './projectRequirementRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import certificationRoutes from './certificationRoutes.js';
import supportTicketRoutes from './supportTicketRoutes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/banners', bannerRoutes);
router.use('/downloads', downloadRoutes);
router.use('/industries', industryRoutes);
router.use('/project-requirements', projectRequirementRoutes);
router.use('/upload', uploadRoutes);
router.use('/certifications', certificationRoutes);
router.use('/support-tickets', supportTicketRoutes);

export default router;
