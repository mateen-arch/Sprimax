import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    cardTheme: {
      type: String,
      enum: ['white', 'navy'],
      default: 'white',
    },
    watermarkType: {
      type: String,
      enum: ['gears', 'layers', 'shield', 'saw', 'default'],
      default: 'default',
    },
    productCount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'Layers',
    },
    subcategories: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    sortOrder: {
      type: Number,
      default: 1,
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
    isFeaturedOnHome: {
      type: Boolean,
      default: false,
    },
    isWideCard: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
