import DownloadResource from '../models/DownloadResource.js';

// Minimal valid base64 PDF template for fallback documents
const DEFAULT_PDF_DATA_URI =
  'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0vQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDQ0Pj5zdHJlYW0KQVQvRjEgMTIgVGYKODAgNzgwIFRkCihTUFJJTUFYIFRlY2huaWNhbCBEb2N1bWVudCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTE3IDAwMDAwIG4gCjAwMDAwMDAyMDEgMDAwMDAgbiAKdHJhaWxlcjw8L1NpemUgNTwvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoyOTUKJSVFT0YK';

// @desc    Get primary catalog resource for homepage
// @route   GET /api/downloads/primary-catalog
// @access  Public
export const getPrimaryCatalog = async (req, res, next) => {
  try {
    let catalog = await DownloadResource.findOne({
      isPrimaryCatalog: true,
      status: { $in: ['Published', 'Active'] },
    });

    if (!catalog) {
      catalog = await DownloadResource.findOne({
        status: { $in: ['Published', 'Active'] },
      });
    }

    if (!catalog) {
      return res.status(200).json({
        success: true,
        catalog: {
          title: 'Complete 2024 Product Catalog',
          description: 'Download the full SPRIMAX Product Guide & Welding Specifications (PDF)',
          fileType: 'PDF',
          fileSize: '4.8 MB',
          fileName: 'sprimax_product_catalog_2024.pdf',
          fileUrl: DEFAULT_PDF_DATA_URI,
        },
      });
    }

    res.status(200).json({
      success: true,
      catalog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all downloadable resources with search and filters
// @route   GET /api/downloads
// @access  Public / Admin
export const getDownloads = async (req, res, next) => {
  try {
    const { category, type, status, search } = req.query;
    const query = {};

    // Filter by status (allow 'All' for admin management)
    if (status && status !== 'All') {
      query.status = status;
    } else if (!status) {
      // Default to public published/active resources
      query.status = { $in: ['Published', 'Active'] };
    }

    // Filter by category or normalized type
    if (category && category !== 'All' && category !== 'all') {
      query.$or = [
        { category: { $regex: new RegExp(category, 'i') } },
        { type: category.toLowerCase() },
      ];
    } else if (type && type !== 'All' && type !== 'all') {
      query.type = type.toLowerCase();
    }

    // Keyword search
    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      query.$or = [
        { title: regex },
        { code: regex },
        { description: regex },
        { relatedProduct: regex },
        { fileName: regex },
        { category: regex },
      ];
    }

    const downloads = await DownloadResource.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: downloads.length,
      downloads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource by ID
// @route   GET /api/downloads/:id
// @access  Public
export const getDownloadById = async (req, res, next) => {
  try {
    const resource = await DownloadResource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Download resource not found',
      });
    }

    res.status(200).json({
      success: true,
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new download resource
// @route   POST /api/downloads
// @access  Private/Admin
export const createDownload = async (req, res, next) => {
  try {
    const {
      title,
      code,
      category,
      type,
      description,
      fileType,
      fileName,
      fileSize,
      fileUrl,
      relatedProduct,
      isPrimaryCatalog,
      status,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    // Normalize type based on category if not explicitly provided
    let normalizedType = (type || '').toLowerCase();
    const cat = (category || 'TDS').toLowerCase();
    if (!normalizedType) {
      if (cat.includes('tds') || cat.includes('technical')) normalizedType = 'tds';
      else if (cat.includes('sds') || cat.includes('safety')) normalizedType = 'sds';
      else if (cat.includes('catalog')) normalizedType = 'catalog';
      else if (cat.includes('profile') || cat.includes('corporate') || cat.includes('cert')) normalizedType = 'profile';
      else normalizedType = 'tds';
    }

    const ext = (fileType || 'PDF').toLowerCase();
    const cleanFileName = fileName || `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${ext}`;

    const newResource = await DownloadResource.create({
      title: title.trim(),
      code: code ? code.trim() : `DOC-${Date.now().toString().slice(-4)}`,
      category: category || 'TDS',
      type: normalizedType,
      description: description || '',
      fileType: (fileType || 'PDF').toUpperCase(),
      fileName: cleanFileName,
      fileSize: fileSize || '2.1 MB',
      fileUrl: fileUrl || DEFAULT_PDF_DATA_URI,
      relatedProduct: relatedProduct || '--',
      isPrimaryCatalog: Boolean(isPrimaryCatalog),
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Download resource created successfully',
      resource: newResource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update download resource
// @route   PUT /api/downloads/:id
// @access  Private/Admin
export const updateDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.category && !updateData.type) {
      const cat = updateData.category.toLowerCase();
      if (cat.includes('tds') || cat.includes('technical')) updateData.type = 'tds';
      else if (cat.includes('sds') || cat.includes('safety')) updateData.type = 'sds';
      else if (cat.includes('catalog')) updateData.type = 'catalog';
      else if (cat.includes('profile') || cat.includes('corporate') || cat.includes('cert')) updateData.type = 'profile';
      else updateData.type = 'tds';
    }

    const resource = await DownloadResource.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Download resource not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Download resource updated successfully',
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete download resource
// @route   DELETE /api/downloads/:id
// @access  Private/Admin
export const deleteDownload = async (req, res, next) => {
  try {
    const resource = await DownloadResource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Download resource not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Download resource deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment download count
// @route   POST /api/downloads/:id/track
// @access  Public
export const trackDownload = async (req, res, next) => {
  try {
    await DownloadResource.findByIdAndUpdate(req.params.id, {
      $inc: { downloadsCount: 1 },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
