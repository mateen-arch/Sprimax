import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    awsClass: {
      type: String,
      default: 'N/A',
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    categorySlug: {
      type: String,
      default: function () {
        return this.category
          ? this.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          : 'general';
      },
      trim: true,
      index: true,
    },
    subcategory: {
      type: String,
      default: '',
      trim: true,
    },
    baseMaterial: {
      type: String,
      default: 'Carbon Steel',
      trim: true,
      index: true,
    },
    industries: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
    images: [String],
    features: [String],
    approvals: [String],
    specifications: {
      type: Map,
      of: String,
    },
    chemicalComposition: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    chemicalElements: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    mechProperties: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    documents: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    techSpecsRows: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Draft', 'Pending Review', 'Archived'],
      default: 'Active',
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Full text search index on name, sku, awsClass, description
productSchema.index({ name: 'text', sku: 'text', awsClass: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
