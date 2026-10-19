import Product from '../models/Product.js';
import Category from '../models/Category.js';

// @desc    Get all products with filtering, searching, sorting & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      categorySlug,
      subcategory,
      awsClass,
      baseMaterial,
      industry,
      status,
      featured,
      sort = '-createdAt',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Filter by category or categorySlug
    if (category && category !== 'All' && category !== 'All Categories') {
      query.category = category;
    }
    if (categorySlug && categorySlug !== 'all') {
      query.categorySlug = categorySlug;
    }

    // Filter by subcategory
    if (subcategory && subcategory !== 'All') {
      query.subcategory = subcategory;
    }

    // Filter by awsClass
    if (awsClass && awsClass.trim() !== '') {
      query.awsClass = awsClass.trim();
    }

    // Filter by baseMaterial
    if (baseMaterial && baseMaterial.trim() !== '') {
      query.baseMaterial = baseMaterial.trim();
    }

    // Filter by industry
    if (industry && industry.trim() !== '') {
      const cleanInd = industry.trim().replace(/-/g, '.*');
      query.industries = { $regex: new RegExp(cleanInd, 'i') };
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by featured
    if (featured !== undefined) {
      query.featured = featured === 'true' || featured === true;
    }

    // Search query across name, sku, awsClass, description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { awsClass: searchRegex },
        { awsClassification: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sort).skip(skip).limit(limitNum),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage: pageNum,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or SKU
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }

    if (!product) {
      product = await Product.findOne({ sku: id.toUpperCase() });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with identifier: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get related products by category or keywords
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ sku: id.toUpperCase() });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with identifier: ${id}`,
      });
    }

    // Find products in same category excluding current product
    let related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: 'Active',
    }).limit(3);

    // If less than 3, backfill with other active products
    if (related.length < 3) {
      const more = await Product.find({
        _id: { $nin: [product._id, ...related.map((r) => r._id)] },
        status: 'Active',
      }).limit(3 - related.length);
      related = [...related, ...more];
    }

    res.status(200).json({
      success: true,
      count: related.length,
      products: related,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Public (or Admin protected in future)
export const createProduct = async (req, res, next) => {
  try {
    const { sku, name, category } = req.body;

    if (!name || !sku || !category) {
      return res.status(400).json({
        success: false,
        message: 'Product name, SKU, and category are required fields.',
      });
    }

    const cleanSku = sku.trim().toUpperCase();
    const existingProduct = await Product.findOne({ sku: cleanSku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: `A product with SKU '${sku}' already exists.`,
      });
    }

    const productPayload = { ...req.body };
    productPayload.sku = cleanSku;
    productPayload.name = name.trim();

    // Auto-resolve or derive categorySlug
    if (!productPayload.categorySlug && productPayload.category) {
      const foundCategory = await Category.findOne({ name: productPayload.category.trim() });
      productPayload.categorySlug =
        foundCategory?.slug ||
        productPayload.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Default baseMaterial if not supplied
    if (!productPayload.baseMaterial) {
      productPayload.baseMaterial = 'Carbon Steel';
    }

    // Default awsClass if not supplied
    if (!productPayload.awsClass) {
      productPayload.awsClass = 'N/A';
    }

    // Ensure industries is an array
    if (!productPayload.industries) {
      productPayload.industries = [];
    }

    const newProduct = new Product(productPayload);
    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing product
// @route   PUT /api/products/:id
// @access  Public (or Admin protected in future)
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ sku: id.toUpperCase() });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with identifier: ${id}`,
      });
    }

    // If SKU is being updated, verify it doesn't collide
    if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
      const duplicateSku = await Product.findOne({
        sku: req.body.sku.toUpperCase(),
        _id: { $ne: product._id },
      });
      if (duplicateSku) {
        return res.status(400).json({
          success: false,
          message: `SKU '${req.body.sku}' is already taken by another product.`,
        });
      }
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public (or Admin protected in future)
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ sku: id.toUpperCase() });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with identifier: ${id}`,
      });
    }

    await Product.deleteOne({ _id: product._id });

    res.status(200).json({
      success: true,
      message: `Product '${product.name}' (${product.sku}) removed successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dynamic discovery filter options for Homepage Technical Discovery
// @route   GET /api/products/discovery-filters
// @access  Public
export const getDiscoveryFilters = async (req, res, next) => {
  try {
    const [rawAwsClasses, rawBaseMaterials, rawIndustries, rawProducts] = await Promise.all([
      Product.distinct('awsClass', { status: 'Active' }),
      Product.distinct('baseMaterial', { status: 'Active' }),
      Product.distinct('industries', { status: 'Active' }),
      Product.find({ status: 'Active' }).select('name sku awsClass subcategory').sort('awsClass'),
    ]);

    // Format classifications with human friendly labels
    const classifications = [];
    rawProducts.forEach((prod) => {
      if (prod.awsClass && !classifications.some((c) => c.value === prod.awsClass)) {
        classifications.push({
          value: prod.awsClass,
          label: `${prod.awsClass}${prod.subcategory ? ` (${prod.subcategory})` : ''}`,
        });
      }
    });

    rawAwsClasses.forEach((aws) => {
      if (!classifications.some((c) => c.value === aws)) {
        classifications.push({ value: aws, label: aws });
      }
    });

    const baseMaterials = rawBaseMaterials.filter(Boolean).sort();
    const industries = rawIndustries.filter(Boolean).sort();

    res.status(200).json({
      success: true,
      classifications,
      baseMaterials,
      industries,
    });
  } catch (error) {
    next(error);
  }
};
