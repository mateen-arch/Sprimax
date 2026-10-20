import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Job slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    reqCode: {
      type: String,
      required: [true, 'Requisition ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    refCode: {
      type: String,
      trim: true,
      default: '',
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    departmentFull: {
      type: String,
      trim: true,
      default: '',
    },
    subDepartment: {
      type: String,
      trim: true,
      default: '',
    },
    deptTag: {
      type: String,
      trim: true,
      default: '',
    },
    workArrangement: {
      type: String,
      enum: ['On-site', 'Hybrid', 'Remote'],
      default: 'On-site',
    },
    remoteRegion: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Primary location is required'],
      trim: true,
      index: true,
    },
    locationFull: {
      type: String,
      trim: true,
      default: '',
    },
    locations: {
      type: [String],
      default: [],
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Executive'],
      default: 'Full-time',
      index: true,
    },
    minExperienceYears: {
      type: Number,
      default: 0,
    },
    educationLevel: {
      type: String,
      trim: true,
      default: '',
    },
    reqSummary: {
      type: String,
      trim: true,
      default: '',
    },
    reqSummaryOverride: {
      type: Boolean,
      default: false,
    },

    // 4 Highlight Stat Cards (Base Plant, Accreditation, Team Size, Visa Sponsorship)
    statCards: {
      type: [
        {
          label: { type: String, default: '' },
          code: { type: String, default: '' },
          subtext: { type: String, default: '' },
        },
      ],
      default: [
        { label: 'Base Plant', code: 'DXB-04', subtext: 'Jebel Ali South' },
        { label: 'Accreditation', code: 'ISO 17025', subtext: 'Calibrated Testing' },
        { label: 'Team Size', code: '18 Eng.', subtext: 'Materials Div' },
        { label: 'Visa Sponsorship', code: 'Full UAE', subtext: 'Direct Corporate' },
      ],
    },

    // Body Sections Builder
    sections: {
      type: [
        {
          id: { type: String },
          type: {
            type: String,
            enum: ['mission', 'responsibilities', 'qualifications', 'facilityContext', 'benefits', 'custom'],
          },
          heading: { type: String, default: '' },
          enabled: { type: Boolean, default: true },
          data: { type: mongoose.Schema.Types.Mixed, default: {} },
        },
      ],
      default: [],
    },

    // Sidebar Configuration
    sidebar: {
      targetStartDate: { type: String, default: 'Immediate / Q1 2025' },
      targetStartDateColor: { type: String, default: 'green' }, // green, blue, amber, gray
      division: { type: String, default: '' },
      location: { type: String, default: '' },
      employment: { type: String, default: '' },
      travelReq: { type: String, default: '15% Regional' },
      securityLevel: { type: String, default: 'Level-2 Technical' },
      reviewCycle: { type: String, default: 'TYPICALLY 3-5 BUSINESS DAYS' },
      recruiter: {
        name: { type: String, default: 'Elena Rostova' },
        role: { type: String, default: 'LEAD TECH RECRUITER' },
        email: { type: String, default: 'elena.rostova@sprimax.com' },
        quote: {
          type: String,
          default: 'Have questions about lab equipment specs, ISO scope, or family relocation allowances? Connect directly with our engineering talent cell.',
        },
      },
      integrityGuarantee: {
        enabled: { type: Boolean, default: true },
        text: { type: String, default: '' },
      },
      keyValues: {
        type: [
          {
            key: { type: String },
            value: { type: String },
          },
        ],
        default: [],
      },
    },

    // Job-Specific Application Form Settings
    formConfig: {
      templateId: { type: String, default: 'standard' },
      cvRequired: { type: Boolean, default: true },
      allowSupplementaryDocs: { type: Boolean, default: true },
      coverStatementRequired: { type: Boolean, default: false },
      coverStatementMaxChars: { type: Number, default: 2000 },
      certifications: {
        type: [
          {
            name: { type: String },
            subtitle: { type: String, default: '' },
          },
        ],
        default: [
          { name: 'AWS CWI', subtitle: 'American Welding Society Certified Inspector' },
          { name: 'CSWIP 3.1 / 3.2', subtitle: 'TWI Senior Welding Inspector Certification' },
          { name: 'NDT LEVEL II / III', subtitle: 'ISO 9712 / ASNT Non-Destructive Testing' },
          { name: 'ISO 9001 LEAD AUDITOR', subtitle: 'Quality Management Systems Lead Evaluator' },
        ],
      },
      screeningQuestions: {
        type: [
          {
            id: { type: String },
            question: { type: String },
            type: { type: String, enum: ['text', 'textarea', 'select', 'yes_no'], default: 'text' },
            options: { type: [String], default: [] },
            required: { type: Boolean, default: false },
            flagValue: { type: String, default: '' },
            helpText: { type: String, default: '' },
          },
        ],
        default: [],
      },
      experienceRanges: {
        type: [String],
        default: [
          '0 - 2 Years (Junior / Entry-Level)',
          '3 - 5 Years (Mid-Level Welding Engineer)',
          '5 - 8 Years (Senior Metallurgist / Specialist)',
          '8 - 12 Years (Principal Lead / Operations Manager)',
          '12+ Years (Executive Director / Technical Authority)',
        ],
      },
    },

    featured: {
      type: Boolean,
      default: false,
    },
    showShare: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'Open', 'Paused', 'Closed', 'Archived'],
      default: 'Draft',
      index: true,
    },

    // Server-set timestamps
    postedAt: {
      type: Date,
      default: null,
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    closingDate: {
      type: Date,
      default: null,
    },
    applicantsCount: {
      type: Number,
      default: 0,
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

// Virtual for formatted posted date: DD MON YYYY
jobSchema.virtual('formattedPostedDate').get(function () {
  if (!this.postedAt) return 'Not published yet';
  const d = new Date(this.postedAt);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
});

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

const Job = mongoose.model('Job', jobSchema);
export default Job;
