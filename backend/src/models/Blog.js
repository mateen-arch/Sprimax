import mongoose from 'mongoose';

const blogBlockSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'paragraph',
        'heading',
        'image',
        'table',
        'callout',
        'list',
        'quote',
        'divider',
        'code',
        'embed',
        'references',
      ],
    },
    // Generic block properties
    content: { type: String, default: '' },
    level: { type: mongoose.Schema.Types.Mixed, default: 'h2' }, // 'h2', 'h3', 2, 3
    isLead: { type: Boolean, default: false }, // for lead paragraph
    // Image properties
    imageUrl: { type: String, default: '' },
    altText: { type: String, default: '' },
    alt: { type: String, default: '' },
    caption: { type: String, default: '' },
    figureNumber: { type: String, default: '' },
    imageWidth: { type: String, default: 'normal' },
    width: { type: String, default: 'normal' },
    // Table properties
    tableHeaders: { type: [String], default: [] },
    headers: { type: [String], default: [] },
    tableRows: { type: [[String]], default: [] },
    rows: { type: [[String]], default: [] },
    tableCaption: { type: String, default: '' },
    tableFootnote: { type: String, default: '' },
    footnote: { type: String, default: '' },
    // Callout / Engineering Note properties
    calloutType: { type: String, default: 'Engineering Note' },
    calloutTitle: { type: String, default: '' },
    title: { type: String, default: '' },
    calloutBody: { type: String, default: '' },
    // List properties
    listType: { type: String, default: 'bullet' },
    listItems: { type: [String], default: [] },
    items: { type: [String], default: [] },
    // Quote properties
    quoteText: { type: String, default: '' },
    quote: { type: String, default: '' },
    quoteAuthor: { type: String, default: '' },
    attribution: { type: String, default: '' },
    // Code / formula properties
    codeLanguage: { type: String, default: '' },
    language: { type: String, default: '' },
    codeContent: { type: String, default: '' },
    code: { type: String, default: '' },
    // Embed properties
    embedType: { type: String, default: 'video' },
    embedUrl: { type: String, default: '' },
    url: { type: String, default: '' },
    embedTitle: { type: String, default: '' },
    // References properties
    referenceItems: { type: [String], default: [] },
    references: { type: [String], default: [] },
  },
  { _id: false, strict: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    bannerImageUrl: {
      type: String,
      default: '',
    },
    bannerAlt: {
      type: String,
      default: '',
    },
    bannerCaption: {
      type: String,
      default: '',
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    content: {
      type: [blogBlockSchema],
      default: [],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogCategory',
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      name: { type: String, default: 'Engineering Team' },
      role: { type: String, default: 'Lead Specialist' },
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Scheduled', 'Archived'],
      default: 'Draft',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    readTimeMinutes: {
      type: Number,
      default: 5,
    },
    readTimeOverride: {
      type: Number,
      default: null,
    },
    // Strictly server-controlled; never accepted from client
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      default: 'Admin',
    },
    updatedBy: {
      type: String,
      default: 'Admin',
    },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      canonicalUrl: { type: String, default: '' },
      ogImageUrl: { type: String, default: '' },
    },
    displayOptions: {
      showShareButton: { type: Boolean, default: true },
      showPrintButton: { type: Boolean, default: true },
      showSidebar: { type: Boolean, default: true },
    },
    featuredProduct: {
      productId: { type: String, default: '' },
      sku: { type: String, default: '' },
      name: { type: String, default: '' },
      description: { type: String, default: '' },
      image: { type: String, default: '' },
      url: { type: String, default: '' },
      isCustom: { type: Boolean, default: false },
    },
    relatedMode: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
    relatedArticleIds: {
      type: [String],
      default: [],
    },
    ctaCard: {
      enabled: { type: Boolean, default: true },
      heading: { type: String, default: 'Require Technical Assistance?' },
      description: {
        type: String,
        default:
          'Our metallurgical engineers are available for consultation on complex structural fabrication challenges.',
      },
      buttonLabel: { type: String, default: 'SUBMIT TECHNICAL ENQUIRY' },
      buttonLink: { type: String, default: '/contact' },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted date strings matching public spec
blogSchema.virtual('formattedPublishedDate').get(function () {
  if (!this.publishedAt) return 'Draft';
  const d = new Date(this.publishedAt);
  return d.toISOString().split('T')[0].replace(/-/g, '.'); // YYYY.MM.DD
});

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
