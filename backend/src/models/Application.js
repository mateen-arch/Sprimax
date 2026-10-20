import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
      index: true,
    },
    jobTitle: {
      type: String,
      default: 'General Application',
      trim: true,
    },
    reqCode: {
      type: String,
      default: 'SPRIMAX-TALENT-GEN',
      trim: true,
      index: true,
    },
    department: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    source: {
      type: String,
      enum: ['job', 'general'],
      default: 'job',
      index: true,
    },

    // Candidate identification
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    phoneCountry: {
      type: String,
      default: '+971',
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    currentLocation: {
      type: String,
      required: [true, 'Current location is required'],
      trim: true,
    },

    // Professional experience
    currentEmployer: {
      type: String,
      default: '',
      trim: true,
    },
    currentJobTitle: {
      type: String,
      default: '',
      trim: true,
    },
    experienceLevel: {
      type: String,
      default: '',
      trim: true,
    },
    fieldOfExpertise: {
      type: String,
      default: '',
      trim: true,
    },
    mobility: {
      type: String,
      default: '',
      trim: true,
    },

    // Attached CV & documents
    cvFile: {
      originalName: { type: String, default: '' },
      filename: { type: String, default: '' },
      url: { type: String, default: '' },
      size: { type: Number, default: 0 },
      mime: { type: String, default: '' },
      sha256: { type: String, default: '' },
    },
    supplementaryFiles: {
      type: [
        {
          originalName: { type: String, default: '' },
          filename: { type: String, default: '' },
          url: { type: String, default: '' },
          size: { type: Number, default: 0 },
          mime: { type: String, default: '' },
        },
      ],
      default: [],
    },

    // Certifications & custom answers
    certifications: {
      type: [String],
      default: [],
    },
    customAnswers: {
      type: [
        {
          questionId: { type: String },
          question: { type: String },
          answer: { type: mongoose.Schema.Types.Mixed },
          flagged: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    coverStatement: {
      type: String,
      default: '',
      trim: true,
    },

    // Pipeline status & evaluation
    status: {
      type: String,
      enum: ['New', 'In Review', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected', 'Withdrawn', 'Talent Pool'],
      default: 'New',
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    assignedReviewer: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isTalentPool: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Internal notes & interview tracking
    notes: {
      type: [
        {
          id: { type: String },
          author: { type: String, default: 'Hiring Team' },
          authorRole: { type: String, default: 'Technical Reviewer' },
          content: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    interviews: {
      type: [
        {
          id: { type: String },
          date: { type: Date },
          type: { type: String, default: 'Video Call (Teams/Meet)' },
          interviewers: { type: String, default: '' },
          locationOrLink: { type: String, default: '' },
          status: { type: String, default: 'Scheduled' },
          notes: { type: String, default: '' },
        },
      ],
      default: [],
    },
    statusHistory: {
      type: [
        {
          fromStatus: { type: String },
          toStatus: { type: String },
          changedBy: { type: String, default: 'Admin' },
          note: { type: String, default: '' },
          changedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    // Compliance & audit consent
    consent: {
      agreed: { type: Boolean, default: true },
      policyVersion: { type: String, default: 'v2.4' },
      ipAddress: { type: String, default: '' },
      userAgent: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now },
    },

    // Official Server-Generated Unique Reference Number (e.g. APP-2026-004871)
    referenceNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    // Immutable snapshot of the Job details at time of submission
    jobSnapshot: {
      title: { type: String, default: '' },
      reqCode: { type: String, default: '' },
      department: { type: String, default: '' },
      subDepartment: { type: String, default: '' },
      location: { type: String, default: '' },
      employmentType: { type: String, default: '' },
      reviewCycleNote: { type: String, default: 'Typically 2-4 business days' },
      retentionMonths: { type: Number, default: 12 },
    },
    // Receipt verification code for QR and verification endpoint
    receiptVerificationCode: {
      type: String,
      default: '',
      index: true,
      trim: true,
    },
    // Audit log of receipt downloads
    downloadAudit: {
      type: [Date],
      default: [],
    },

    // Server-set immutable applied date
    appliedAt: {
      type: Date,
      default: Date.now,
      immutable: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for formatted applied date
applicationSchema.virtual('formattedAppliedDate').get(function () {
  if (!this.appliedAt) return '';
  const d = new Date(this.appliedAt);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
});

// Virtual for unique candidate receipt code
applicationSchema.virtual('receiptCode').get(function () {
  if (this.referenceNumber) return this.referenceNumber;
  if (this.source === 'general') {
    return `SPR-GEN-${this._id ? this._id.toString().slice(-6).toUpperCase() : Math.floor(10000 + Math.random() * 90000)}`;
  }
  return `SPR-APP-${this._id ? this._id.toString().slice(-6).toUpperCase() : Math.floor(10000 + Math.random() * 90000)}`;
});

applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
