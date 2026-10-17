import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      trim: true,
      default: 'General Industrial Inquiry',
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    skuOrClass: {
      type: String,
      trim: true,
      default: 'General Inquiry',
    },
    productInterested: {
      type: String,
      trim: true,
      default: '',
    },
    enquiryType: {
      type: String,
      default: 'Product Enquiry',
      index: true,
    },
    projectScope: {
      type: String,
      default: 'Standard Production',
    },
    // Dealer-specific fields
    businessType: {
      type: String,
      default: '',
      trim: true,
    },
    primaryLocation: {
      type: String,
      default: '',
      trim: true,
    },
    currentProductRange: {
      type: String,
      default: '',
      trim: true,
    },
    yearsInBusiness: {
      type: String,
      default: '',
      trim: true,
    },
    // Product-specific fields
    quantity: {
      type: String,
      default: '',
      trim: true,
    },
    unit: {
      type: String,
      default: 'KG',
      trim: true,
    },
    requiredDate: {
      type: String,
      default: '',
      trim: true,
    },
    application: {
      type: String,
      default: '',
      trim: true,
    },
    specifications: {
      type: String,
      default: '',
      trim: true,
    },
    // Technical Support fields
    subject: {
      type: String,
      default: '',
      trim: true,
    },
    industry: {
      type: String,
      default: '',
      trim: true,
    },
    // Project Requirements fields
    industryName: {
      type: String,
      default: '',
      trim: true,
    },
    industrySlug: {
      type: String,
      default: '',
      trim: true,
    },
    projectName: {
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
      default: 'New',
      index: true,
    },
    // Product Relationship
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    // Internal Workflow & Handling
    assignedTo: {
      type: String,
      default: 'Unassigned',
      trim: true,
    },
    followUp: {
      isSet: { type: Boolean, default: false },
      dueDate: { type: Date, default: null },
      priority: { type: String, default: 'Normal' },
    },
    internalNotes: {
      type: String,
      default: '',
      trim: true,
    },
    statusHistory: [
      {
        stage: { type: String, required: true },
        status: { type: String, required: true },
        note: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: String, default: 'System' },
      },
    ],
    isTest: {
      type: Boolean,
      default: false,
      index: true,
    },
    message: {
      type: String,
      default: '',
      trim: true,
    },
    referenceCode: {
      type: String,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals for admin convenience
enquirySchema.virtual('id').get(function () {
  return this._id.toHexString();
});
enquirySchema.virtual('customer').get(function () {
  return this.contactName;
});
enquirySchema.virtual('company').get(function () {
  return this.companyName;
});
enquirySchema.virtual('refNo').get(function () {
  return this.referenceCode || `ENQ-${new Date().getFullYear()}-${this._id.toString().slice(-4).toUpperCase()}`;
});
enquirySchema.virtual('refId').get(function () {
  return `#${this.refNo}`;
});
enquirySchema.virtual('date').get(function () {
  return this.createdAt ? new Date(this.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today';
});

// Auto-generate reference code before saving matching ENQ-YYYY-NNNN format and populate initial statusHistory
enquirySchema.pre('save', function (next) {
  if (!this.referenceCode) {
    const year = this.createdAt ? new Date(this.createdAt).getFullYear() : new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.referenceCode = `ENQ-${year}-${randomSuffix}`;
  }
  if (!this.statusHistory || this.statusHistory.length === 0) {
    this.statusHistory = [
      {
        stage: 'Transmission Received',
        status: 'Logged',
        note: 'Transmission logged in database',
        timestamp: this.createdAt || new Date(),
        updatedBy: 'System',
      },
      {
        stage: `Current State: ${this.status || 'New'}`,
        status: this.status || 'New',
        note: this.status === 'New' ? 'Awaiting initial response' : 'Under active review',
        timestamp: new Date(),
        updatedBy: 'System',
      },
    ];
  }
  next();
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);
export default Enquiry;
