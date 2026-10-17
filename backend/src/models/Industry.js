import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
  },
  recommendedSpec: {
    type: String,
    default: '',
  },
  statValue: {
    type: String,
    default: '',
  },
  statLabel: {
    type: String,
    default: '',
  },
});

const industrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
    solutionHeadline: {
      type: String,
      default: '',
    },
    solutionDescription: {
      type: String,
      default: '',
    },
    solutionBanner: {
      type: String,
      default: null,
    },
    challenges: [challengeSchema],
    complianceBadges: [
      {
        type: String,
        trim: true,
      },
    ],
    hudGaugeLabel: {
      type: String,
      default: 'DATA//YIELD_STRENGTH_REQUIREMENTS',
    },
    hudGaugePercent: {
      type: Number,
      default: 82,
    },
    hudVerifiedText: {
      type: String,
      default: 'HIGH-INTEGRITY WELD VERIFIED',
    },
    mappedProductsCount: {
      type: Number,
      default: 0,
    },
    sortOrder: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ['Active', 'Pending Review', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Industry = mongoose.model('Industry', industrySchema);
export default Industry;
