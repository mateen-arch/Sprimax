import mongoose from 'mongoose';

const projectRequirementSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    industryName: {
      type: String,
      required: true,
      trim: true,
    },
    industrySlug: {
      type: String,
      required: true,
      trim: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    baseMaterials: {
      type: String,
      default: '',
    },
    weldingProcess: {
      type: String,
      default: '',
    },
    standards: {
      type: String,
      default: '',
    },
    estimatedVolume: {
      type: String,
      default: '',
    },
    targetDeliveryDate: {
      type: String,
      default: '',
    },
    projectScopeDetails: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'In Review', 'Quoted', 'Approved', 'Archived'],
      default: 'New',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate unique reference number if not set
projectRequirementSchema.pre('save', function (next) {
  if (!this.referenceNumber) {
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    this.referenceNumber = `REQ-${Date.now().toString().slice(-4)}${randomHex}`;
  }
  next();
});

const ProjectRequirement = mongoose.model('ProjectRequirement', projectRequirementSchema);
export default ProjectRequirement;
