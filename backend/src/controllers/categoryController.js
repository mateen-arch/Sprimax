import Category from '../models/Category.js';
import Product from '../models/Product.js';

// @desc    Get all categories with dynamic product counts
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('sortOrder');

    // Aggregate real-time product count per category
    const productCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    productCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap[cat.name] || 0,
    }));

    res.status(200).json({
      success: true,
      count: enrichedCategories.length,
      categories: enrichedCategories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured product lines for homepage
// @route   GET /api/categories/featured
// @access  Public
export const getFeaturedCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isFeaturedOnHome: true, status: { $ne: 'Inactive' } }).sort('sortOrder');

    const productCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    productCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap[cat.name] || 0,
    }));

    res.status(200).json({
      success: true,
      count: enrichedCategories.length,
      categories: enrichedCategories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Public / Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, subcategories, description, icon, displayOrder, image, status, sortOrder, slug } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: `Category '${name}' already exists.`,
      });
    }

    const finalSlug = slug || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newCategory = new Category({
      name: name.trim(),
      slug: finalSlug,
      subcategories: subcategories || [],
      description: description || '',
      icon: icon || 'Layers',
      displayOrder: displayOrder || sortOrder || 0,
      sortOrder: sortOrder || displayOrder || 0,
      image: image || '',
      status: status || 'Active',
      isFeaturedOnHome: req.body.isFeaturedOnHome === true,
      isWideCard: req.body.isWideCard === true,
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: savedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Public / Admin
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`,
      });
    }

    Object.assign(category, req.body);
    const updated = await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Public / Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category with ID ${id} not found`,
      });
    }

    await Category.deleteOne({ _id: category._id });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
