import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import BlogCategory from '../models/BlogCategory.js';
import BlogRedirect from '../models/BlogRedirect.js';
import { ensureInitialBlogsSeeded } from '../utils/seedBlogs.js';

// Helper: Calculate read time (~200 wpm from blocks & summary)
function calculateReadTime(summary = '', content = []) {
  let wordCount = summary.split(/\s+/).filter(Boolean).length;
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block.content) wordCount += block.content.split(/\s+/).filter(Boolean).length;
      if (block.calloutTitle) wordCount += block.calloutTitle.split(/\s+/).filter(Boolean).length;
      if (block.calloutBody) wordCount += block.calloutBody.split(/\s+/).filter(Boolean).length;
      if (Array.isArray(block.listItems)) {
        block.listItems.forEach((item) => {
          if (item) wordCount += item.split(/\s+/).filter(Boolean).length;
        });
      }
      if (Array.isArray(block.tableRows)) {
        block.tableRows.forEach((row) => {
          if (Array.isArray(row)) {
            row.forEach((cell) => {
              if (cell) wordCount += cell.split(/\s+/).filter(Boolean).length;
            });
          }
        });
      }
    }
  }
  return Math.max(1, Math.ceil(wordCount / 200));
}

// Helper: Generate URL-safe slug from title
function generateSlug(title = '') {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * @desc Get all blogs (for admin or public)
 * @route GET /api/blogs
 */
export const getBlogs = async (req, res, next) => {
  try {
    await ensureInitialBlogsSeeded();

    const {
      status,
      category,
      search,
      featured,
      sort = '-createdAt',
      page = 1,
      limit = 10,
      isAdmin = false,
      includeDeleted = false,
    } = req.query;

    const query = {};

    // Soft delete filter
    if (includeDeleted !== 'true') {
      query.isDeleted = false;
    }

    // Role-based status filter
    if (isAdmin === 'true') {
      if (status && status !== 'All') {
        query.status = status;
      }
    } else {
      // Strictly public: only Published and publishedAt <= now
      query.status = 'Published';
      query.publishedAt = { $lte: new Date() };
    }

    // Category filter
    if (category && category !== 'all' && category !== 'All Topics') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    // Featured filter
    if (featured !== undefined && featured !== '') {
      query.featured = featured === 'true';
    }

    // Search query across title, slug, and author
    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: 'i' } },
        { slug: { $regex: term, $options: 'i' } },
        { summary: { $regex: term, $options: 'i' } },
        { 'author.name': { $regex: term, $options: 'i' } },
        { category: { $regex: term, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting map
    let sortOptions = { createdAt: -1 };
    if (sort === 'publishedAt' || sort === '-publishedAt') {
      sortOptions = { publishedAt: -1, createdAt: -1 };
    } else if (sort === 'title') {
      sortOptions = { title: 1 };
    } else if (sort === 'updatedAt' || sort === '-updatedAt') {
      sortOptions = { updatedAt: -1 };
    } else if (sort.startsWith('-')) {
      sortOptions = { [sort.substring(1)]: -1 };
    } else {
      sortOptions = { [sort]: 1 };
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Blog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get public blogs with featured separation and category counts
 * @route GET /api/blogs/public
 */
export const getPublicBlogs = async (req, res, next) => {
  try {
    await ensureInitialBlogsSeeded();

    const { category, page = 1, limit = 9 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 9);

    const baseQuery = {
      isDeleted: false,
      status: 'Published',
      publishedAt: { $lte: new Date() },
    };

    if (category && category !== 'all' && category !== 'All Topics') {
      baseQuery.category = new RegExp(`^${category}$`, 'i');
    }

    // Find featured article (if unfiltered or if matching category)
    let featuredBlog = null;
    if (pageNum === 1) {
      featuredBlog = await Blog.findOne({ ...baseQuery, featured: true }).sort({
        publishedAt: -1,
      });
      // Fallback to latest published if none explicitly featured
      if (!featuredBlog) {
        featuredBlog = await Blog.findOne(baseQuery).sort({ publishedAt: -1 });
      }
    }

    // Grid blogs query: exclude the featured post from the grid
    const gridQuery = { ...baseQuery };
    if (featuredBlog) {
      gridQuery._id = { $ne: featuredBlog._id };
    }

    const skip = (pageNum - 1) * limitNum;
    const [blogs, totalGrid, categories] = await Promise.all([
      Blog.find(gridQuery).sort({ publishedAt: -1 }).skip(skip).limit(limitNum),
      Blog.countDocuments(gridQuery),
      BlogCategory.find().sort({ sortOrder: 1 }),
    ]);

    res.status(200).json({
      success: true,
      featuredBlog,
      blogs,
      total: totalGrid,
      page: pageNum,
      totalPages: Math.ceil(totalGrid / limitNum) || 1,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single blog by ID or Slug (with redirect support)
 * @route GET /api/blogs/:identifier
 */
export const getBlogByIdOrSlug = async (req, res, next) => {
  try {
    await ensureInitialBlogsSeeded();

    const { identifier } = req.params;
    const { isPreview = 'false' } = req.query;

    let blog = null;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(identifier);
    } else {
      blog = await Blog.findOne({ slug: identifier.toLowerCase() });
    }

    // If not found by slug, check redirect table
    if (!blog) {
      const redirect = await BlogRedirect.findOne({ oldSlug: identifier.toLowerCase() });
      if (redirect) {
        return res.status(301).json({
          success: true,
          redirect: true,
          newSlug: redirect.newSlug,
        });
      }
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }

    // Check publication state for public queries
    if (isPreview !== 'true') {
      if (blog.isDeleted) {
        return res.status(404).json({ success: false, message: 'Article has been removed' });
      }
      if (blog.status !== 'Published' || (blog.publishedAt && blog.publishedAt > new Date())) {
        return res.status(403).json({ success: false, message: 'Article is not yet published' });
      }
    }

    // Fetch related articles if configured
    let relatedArticles = [];
    if (blog.relatedArticleIds && blog.relatedArticleIds.length > 0) {
      relatedArticles = await Blog.find({
        $or: [
          { _id: { $in: blog.relatedArticleIds.filter((id) => id.match(/^[0-9a-fA-F]{24}$/)) } },
          { slug: { $in: blog.relatedArticleIds } },
        ],
        isDeleted: false,
        status: 'Published',
      })
        .select('title slug author formattedPublishedDate publishedAt category bannerImageUrl')
        .limit(4);
    } else {
      // Auto related by shared category
      relatedArticles = await Blog.find({
        category: blog.category,
        _id: { $ne: blog._id },
        isDeleted: false,
        status: 'Published',
      })
        .select('title slug author formattedPublishedDate publishedAt category bannerImageUrl')
        .sort({ publishedAt: -1 })
        .limit(3);
    }

    res.status(200).json({
      success: true,
      blog,
      relatedArticles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new blog
 * @route POST /api/blogs
 */
export const createBlog = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      summary,
      bannerImageUrl,
      bannerAlt,
      bannerCaption,
      thumbnailUrl,
      content,
      category,
      tags,
      author,
      status = 'Draft',
      featured = false,
      readTimeOverride,
      scheduledAt,
      seo,
      displayOptions,
      featuredProduct,
      relatedMode,
      relatedArticleIds,
      ctaCard,
      authorUser,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!summary || !summary.trim()) {
      return res.status(400).json({ success: false, message: 'Summary is required' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    // Validate publishing requirements
    if (status === 'Published') {
      if (!bannerImageUrl) {
        return res.status(400).json({ success: false, message: 'Banner image is required to publish' });
      }
      if (!bannerAlt) {
        return res.status(400).json({ success: false, message: 'Banner image alt text is required for accessibility' });
      }
    }

    // Resolve unique slug
    let candidateSlug = slug ? generateSlug(slug) : generateSlug(title);
    if (!candidateSlug) candidateSlug = `post-${Date.now()}`;

    let slugExists = await Blog.findOne({ slug: candidateSlug });
    let counter = 1;
    while (slugExists) {
      candidateSlug = `${generateSlug(slug || title)}-${counter}`;
      slugExists = await Blog.findOne({ slug: candidateSlug });
      counter++;
    }

    // Calculate read time
    const calcMinutes = calculateReadTime(summary, content);
    const finalReadTime = readTimeOverride ? Number(readTimeOverride) : calcMinutes;

    // Server-enforced publish date
    let serverPublishedAt = null;
    if (status === 'Published') {
      serverPublishedAt = new Date();
    }

    // Single featured post guarantee
    if (featured === true) {
      await Blog.updateMany({ featured: true }, { featured: false });
    }

    const newBlog = new Blog({
      title: title.trim(),
      slug: candidateSlug,
      summary: summary.trim(),
      bannerImageUrl: bannerImageUrl || '',
      bannerAlt: bannerAlt || '',
      bannerCaption: bannerCaption || '',
      thumbnailUrl: thumbnailUrl || bannerImageUrl || '',
      content: Array.isArray(content) ? content : [],
      category: category.trim(),
      tags: Array.isArray(tags) ? tags : [],
      author: {
        name: author?.name || authorUser?.name || 'Dr. Heinrich Vossen',
        role: author?.role || authorUser?.role || 'Lead Metallurgist',
      },
      status,
      featured: featured === true,
      readTimeMinutes: finalReadTime,
      readTimeOverride: readTimeOverride || null,
      publishedAt: serverPublishedAt,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      seo: seo || {
        metaTitle: title,
        metaDescription: summary,
        canonicalUrl: '',
        ogImageUrl: bannerImageUrl || '',
      },
      displayOptions: displayOptions || {
        showShareButton: true,
        showPrintButton: true,
        showSidebar: true,
      },
      featuredProduct: featuredProduct || {
        name: 'E7018-1 H4R LOW-HYDROGEN ELECTRODE',
        sku: 'E7018-1',
        description: 'Ultra-low moisture absorption coating designed for critical high-yield structural fabrications.',
        image: '/assets/product-lh7018.png',
        url: '/products',
        isCustom: false,
      },
      relatedMode: relatedMode || 'auto',
      relatedArticleIds: Array.isArray(relatedArticleIds) ? relatedArticleIds : [],
      ctaCard: ctaCard || {
        enabled: true,
        heading: 'Require Technical Assistance?',
        description: 'Our metallurgical engineers are available for consultation on complex structural fabrication challenges.',
        buttonLabel: 'SUBMIT TECHNICAL ENQUIRY',
        buttonLink: '/contact',
      },
      createdBy: authorUser?.name || 'Admin',
      updatedBy: authorUser?.name || 'Admin',
    });

    await newBlog.save();

    res.status(201).json({
      success: true,
      message: status === 'Published' ? 'Blog post published successfully' : 'Draft saved successfully',
      blog: newBlog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update existing blog
 * @route PUT /api/blogs/:id
 */
export const updateBlog = async (req, res, next) => {
  try {
    const id = req.params.identifier || req.params.id;
    let blog = null;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id);
    }
    if (!blog && id) {
      blog = await Blog.findOne({ $or: [{ slug: id }, { slug: id.toLowerCase() }] });
    }

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const {
      title,
      slug,
      summary,
      bannerImageUrl,
      bannerAlt,
      bannerCaption,
      thumbnailUrl,
      content,
      category,
      tags,
      author,
      status,
      featured,
      readTimeOverride,
      scheduledAt,
      seo,
      displayOptions,
      featuredProduct,
      relatedMode,
      relatedArticleIds,
      ctaCard,
      authorUser,
    } = req.body;

    if (title) blog.title = title.trim();
    if (summary) blog.summary = summary.trim();
    if (category) blog.category = category.trim();
    if (bannerImageUrl !== undefined) blog.bannerImageUrl = bannerImageUrl;
    if (bannerAlt !== undefined) blog.bannerAlt = bannerAlt;
    if (bannerCaption !== undefined) blog.bannerCaption = bannerCaption;
    if (thumbnailUrl !== undefined) blog.thumbnailUrl = thumbnailUrl;
    if (content !== undefined && Array.isArray(content)) blog.content = content;
    if (tags !== undefined) blog.tags = tags;
    if (author) {
      blog.author = {
        name: author.name || blog.author.name,
        role: author.role || blog.author.role,
      };
    }

    // Slug management & URL redirect recording
    if (slug && slug.trim() && slug.trim().toLowerCase() !== blog.slug) {
      const newSlug = generateSlug(slug);
      const existing = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Slug is already in use by another article' });
      }

      // If the post was previously published, record redirect from old to new slug
      if (blog.publishedAt) {
        await BlogRedirect.findOneAndUpdate(
          { oldSlug: blog.slug },
          { newSlug, blogId: blog._id },
          { upsert: true, new: true }
        );
      }
      blog.slug = newSlug;
    }

    // Recalculate read time
    const calcMinutes = calculateReadTime(blog.summary, blog.content);
    blog.readTimeMinutes = readTimeOverride ? Number(readTimeOverride) : calcMinutes;
    if (readTimeOverride !== undefined) blog.readTimeOverride = readTimeOverride;

    // Status & server-enforced publish date transitions
    if (status) {
      // Transition to Published for the first time
      if (status === 'Published' && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
      blog.status = status;
    }

    if (scheduledAt !== undefined) {
      blog.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    }

    // Single featured post rule
    if (featured === true && !blog.featured) {
      await Blog.updateMany({ _id: { $ne: blog._id }, featured: true }, { featured: false });
      blog.featured = true;
    } else if (featured === false) {
      blog.featured = false;
    }

    if (seo) blog.seo = { ...blog.seo, ...seo };
    if (displayOptions) blog.displayOptions = { ...blog.displayOptions, ...displayOptions };
    if (featuredProduct) blog.featuredProduct = { ...blog.featuredProduct, ...featuredProduct };
    if (relatedMode) blog.relatedMode = relatedMode;
    if (relatedArticleIds) blog.relatedArticleIds = relatedArticleIds;
    if (ctaCard) blog.ctaCard = { ...blog.ctaCard, ...ctaCard };

    blog.updatedBy = authorUser?.name || 'Admin';

    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog article updated successfully',
      blog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Soft delete blog
 * @route DELETE /api/blogs/:id
 */
export const deleteBlog = async (req, res, next) => {
  try {
    const id = req.params.identifier || req.params.id;
    let blog = null;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id);
    }
    if (!blog && id) {
      blog = await Blog.findOne({ $or: [{ slug: id }, { slug: id.toLowerCase() }] });
    }

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.isDeleted = true;
    blog.deletedAt = new Date();
    blog.status = 'Archived';
    blog.featured = false;

    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog article removed successfully (soft deleted)',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Duplicate blog as draft
 * @route POST /api/blogs/:id/duplicate
 */
export const duplicateBlog = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.identifier;
    let original = null;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      original = await Blog.findById(id);
    }
    if (!original && id) {
      original = await Blog.findOne({ $or: [{ slug: id }, { slug: id.toLowerCase() }] });
    }

    if (!original) {
      return res.status(404).json({ success: false, message: 'Original blog not found' });
    }

    let copySlug = `${original.slug}-copy`;
    let existing = await Blog.findOne({ slug: copySlug });
    let counter = 1;
    while (existing) {
      copySlug = `${original.slug}-copy-${counter}`;
      existing = await Blog.findOne({ slug: copySlug });
      counter++;
    }

    const duplicated = new Blog({
      title: `${original.title} (Copy)`,
      slug: copySlug,
      summary: original.summary,
      bannerImageUrl: original.bannerImageUrl,
      bannerAlt: original.bannerAlt,
      bannerCaption: original.bannerCaption,
      thumbnailUrl: original.thumbnailUrl,
      content: original.content,
      category: original.category,
      tags: original.tags,
      author: original.author,
      status: 'Draft',
      featured: false,
      readTimeMinutes: original.readTimeMinutes,
      publishedAt: null,
      scheduledAt: null,
      isDeleted: false,
      seo: original.seo,
      displayOptions: original.displayOptions,
      featuredProduct: original.featuredProduct,
      relatedMode: original.relatedMode,
      relatedArticleIds: original.relatedArticleIds,
      ctaCard: original.ctaCard,
      createdBy: 'Admin',
    });

    await duplicated.save();

    res.status(201).json({
      success: true,
      message: 'Article duplicated successfully as draft',
      blog: duplicated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Bulk actions on blogs (publish, draft, archive, delete, changeCategory)
 * @route POST /api/blogs/bulk
 */
export const bulkUpdateBlogs = async (req, res, next) => {
  try {
    const { ids, action, targetCategory } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No article IDs provided' });
    }

    if (action === 'publish') {
      const now = new Date();
      await Blog.updateMany(
        { _id: { $in: ids }, publishedAt: null },
        { status: 'Published', publishedAt: now }
      );
      await Blog.updateMany({ _id: { $in: ids }, publishedAt: { $ne: null } }, { status: 'Published' });
    } else if (action === 'unpublish') {
      await Blog.updateMany({ _id: { $in: ids } }, { status: 'Draft' });
    } else if (action === 'archive') {
      await Blog.updateMany({ _id: { $in: ids } }, { status: 'Archived', featured: false });
    } else if (action === 'delete') {
      await Blog.updateMany(
        { _id: { $in: ids } },
        { isDeleted: true, deletedAt: new Date(), status: 'Archived', featured: false }
      );
    } else if (action === 'changeCategory' && targetCategory) {
      await Blog.updateMany({ _id: { $in: ids } }, { category: targetCategory });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid bulk action specified' });
    }

    res.status(200).json({
      success: true,
      message: `Successfully executed ${action} for ${ids.length} articles`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all blog categories
 * @route GET /api/blogs/categories
 */
export const getBlogCategories = async (req, res, next) => {
  try {
    await ensureInitialBlogsSeeded();
    const categories = await BlogCategory.find().sort({ sortOrder: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create new blog category
 * @route POST /api/blogs/categories
 */
export const createBlogCategory = async (req, res, next) => {
  try {
    const { name, sortOrder } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const slug = generateSlug(name);
    const existing = await BlogCategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = new BlogCategory({
      name: name.trim(),
      slug,
      sortOrder: sortOrder || 0,
    });

    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};
