import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    supportingText: {
      type: String,
      trim: true,
      default: '',
    },
    ctaLabel: {
      type: String,
      trim: true,
      default: 'EXPLORE PRODUCTS',
    },
    ctaDestination: {
      type: String,
      trim: true,
      default: '/products',
    },
    desktopImage: {
      type: String,
      default: null,
    },
    desktopAlt: {
      type: String,
      default: '',
    },
    mobileImage: {
      type: String,
      default: null,
    },
    mobileAlt: {
      type: String,
      default: '',
    },
    placement: {
      type: String,
      enum: ['Homepage Hero', 'Sidebar Ad', 'Category Banner'],
      default: 'Homepage Hero',
    },
    schedule: {
      type: String,
      default: 'Continuous',
    },
    sortOrder: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['Active', 'Scheduled', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
