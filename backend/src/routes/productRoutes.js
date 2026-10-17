import express from 'express';
import {
  getProducts,
  getProductById,
  getRelatedProducts,
  getDiscoveryFilters,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.get('/discovery-filters', getDiscoveryFilters);
router.get('/:id/related', getRelatedProducts);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

export default router;
