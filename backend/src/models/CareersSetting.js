import mongoose from 'mongoose';

const careersSettingSchema = new mongoose.Schema(
  {
    departments: {
      type: [
        {
          name: { type: String, required: true },
          code: { type: String, required: true },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      default: [
        { name: 'ENGINEERING', code: 'ENG', sortOrder: 1 },
        { name: 'SALES', code: 'SLS', sortOrder: 2 },
        { name: 'ROBOTICS & AUTOMATION', code: 'AUT', sortOrder: 3 },
        { name: 'OPERATIONS & QUALITY', code: 'OPS', sortOrder: 4 },
        { name: 'METALLURGY & R&D', code: 'MET', sortOrder: 5 },
      ],
    },
    locations: {
      type: [
        {
          name: { type: String, required: true },
          country: { type: String, default: '' },
          isRemote: { type: Boolean, default: false },
        },
      ],
      default: [
        { name: 'Dubai, UAE', country: 'United Arab Emirates', isRemote: false },
        { name: 'Remote (MEA Region)', country: 'MEA', isRemote: true },
        { name: 'Riyadh, KSA', country: 'Saudi Arabia', isRemote: false },
        { name: 'Doha, Qatar', country: 'Qatar', isRemote: false },
        { name: 'Singapore Hub', country: 'Singapore', isRemote: false },
        { name: 'Houston, USA', country: 'United States', isRemote: false },
      ],
    },
    employmentTypes: {
      type: [String],
      default: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Executive'],
    },
    talentContacts: {
      type: [
        {
          id: { type: String },
          name: { type: String, required: true },
          role: { type: String, default: 'Lead Technical Recruiter' },
          email: { type: String, required: true },
          quote: { type: String, default: '' },
          buttonLabel: { type: String, default: 'Inquire with Recruiter' },
        },
      ],
      default: [
        {
          id: 'contact-elena',
          name: 'Elena Rostova',
          role: 'LEAD TECH RECRUITER',
          email: 'elena.rostova@sprimax.com',
          quote: 'Have questions about lab equipment specs, ISO scope, or family relocation allowances? Connect directly with our engineering talent cell.',
          buttonLabel: 'Inquire with Elena',
        },
        {
          id: 'contact-marcus',
          name: 'Marcus Sterling',
          role: 'DIRECTOR OF GLOBAL TALENT ACQUISITION',
          email: 'marcus.sterling@sprimax.com',
          quote: 'Leading confidential talent discussions for specialized executive metallurgy and enterprise sales roles.',
          buttonLabel: 'Inquire with Marcus',
        },
      ],
    },
    certificationsLibrary: {
      type: [
        {
          name: { type: String, required: true },
          subtitle: { type: String, default: '' },
          category: { type: String, default: 'Welding & Inspection' },
        },
      ],
      default: [
        { name: 'AWS CWI', subtitle: 'American Welding Society Certified Inspector', category: 'Welding' },
        { name: 'CSWIP 3.1 / 3.2', subtitle: 'TWI Senior Welding Inspector Certification', category: 'Inspection' },
        { name: 'NDT LEVEL II / III', subtitle: 'ISO 9712 / ASNT Non-Destructive Testing', category: 'NDT' },
        { name: 'ISO 9001 LEAD AUDITOR', subtitle: 'Quality Management Systems Lead Evaluator', category: 'Quality' },
        { name: 'API 510 / 570 / 653', subtitle: 'American Petroleum Institute Inspector', category: 'Petroleum' },
        { name: 'IWE / EWE', subtitle: 'International / European Welding Engineer Diploma', category: 'Engineering' },
      ],
    },
    globalTexts: {
      integrityGuarantee: {
        type: String,
        default:
          'Sprimax operates on strict zero-recruitment-fee principles. We never charge candidates for applications, processing, visas, or onboarding. Official communication is strictly conducted through verified @sprimax.com corporate domains.',
      },
      reviewCycleNote: {
        type: String,
        default: 'Review cycle: typically 2-4 business days',
      },
      consentText: {
        type: String,
        default:
          'I hereby certify that all submitted technical credentials and professional representations are accurate and verifiable. I authorize Sprimax Engineering to retain my dossier for evaluation.',
      },
      privacyPolicyUrl: {
        type: String,
        default: '/privacy',
      },
      privacyPolicyVersion: {
        type: String,
        default: 'v2.4 (2024.10)',
      },
    },
    notificationRecipients: {
      type: [String],
      default: ['careers@sprimax.com', 'talent.mea@sprimax.com'],
    },
    fieldsOfExpertise: {
      type: [String],
      default: [
        'Metallurgy & Materials Engineering',
        'Robotics & Automated Welding Cells',
        'International Enterprise Sales',
        'Quality Assurance & ISO 17025 Compliance',
        'Supply Chain & Heavy Logistics',
        'Field Technical Services & Commissioning',
      ],
    },
    mobilityOptions: {
      type: [String],
      default: [
        'Open to Global Relocation (EMEA, APAC, Americas)',
        'GCC / Middle East Regional Relocation Only',
        'Remote / Telecommute Only',
        'Specific Location Preference',
      ],
    },
  },
  {
    timestamps: true,
  }
);

const CareersSetting = mongoose.model('CareersSetting', careersSettingSchema);
export default CareersSetting;
