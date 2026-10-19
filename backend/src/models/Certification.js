import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Certification name is required'],
      trim: true,
    },
    subScope: {
      type: String,
      trim: true,
      default: '',
    },
    issuer: {
      type: String,
      required: [true, 'Certification issuer is required'],
      trim: true,
    },
    validityRange: {
      type: String,
      trim: true,
      default: '',
    },
    issueDate: {
      type: String,
      default: '',
    },
    validUntil: {
      type: String,
      default: '',
    },
    expiryCountdown: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Valid', 'Expiring Soon', 'Expired', 'Active'],
      default: 'Valid',
    },
    associatedProducts: {
      type: [String],
      default: [],
    },
    documentName: {
      type: String,
      default: 'certificate.pdf',
    },
    documentUrl: {
      type: String,
      default: '',
    },
    fileSize: {
      type: String,
      default: '1.2 MB',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Certification', certificationSchema);
