import express from 'express';
import {
  getBlogs,
  getPublicBlogs,
  getBlogByIdOrSlug,
  createBlog,
  updateBlog,
  deleteBlog,
  duplicateBlog,
  bulkUpdateBlogs,
  getBlogCategories,
  createBlogCategory,
} from '../controllers/blogController.js';

const router = express.Router();

// Public aggregated endpoint for user-side blog
router.get('/public', getPublicBlogs);

// Category endpoints
router.route('/categories')
  .get(getBlogCategories)
  .post(createBlogCategory);

// Bulk actions
router.post('/bulk', bulkUpdateBlogs);

// Duplicate action
router.post('/:id/duplicate', duplicateBlog);

// Standard CRUD
router.route('/')
  .get(getBlogs)
  .post(createBlog);

router.route('/:identifier')
  .get(getBlogByIdOrSlug)
  .put(updateBlog)
  .delete(deleteBlog);

export default router;
