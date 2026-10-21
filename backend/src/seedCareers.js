import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from './models/Job.js';
import Application from './models/Application.js';
import CareersSetting from './models/CareersSetting.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sprimax';

const initialJobs = [
  {
    title: 'Metallurgical Engineer',
    slug: 'metallurgical-engineer',
    reqCode: 'ENG-7018-DXB',
    refCode: 'SEC-MET-2024.08',
    department: 'ENGINEERING',
    departmentFull: 'ENGINEERING DEPT',
    subDepartment: 'ADVANCED CLADDING',
    deptTag: 'ADVANCED CLADDING',
    workArrangement: 'On-site',
    location: 'Dubai, UAE',
    locationFull: 'DUBAI, UNITED ARAB EMIRATES',
    locations: ['Dubai, UAE'],
    employmentType: 'Full-time',
    minExperienceYears: 5,
    educationLevel: 'BS/MS in Materials Science',
    reqSummary: 'Req: 5+ years experience • BS/MS in Materials Science',
    reqSummaryOverride: true,
    tagline: 'Spearhead mechanical fracture mechanics, alloy microstructural verification, and low-hydrogen consumable qualification at the Sprimax Middle East Regional Materials Testing Complex.',
    shortDescription: 'Responsible for material testing, failure analysis, and developing new alloy specifications for high-stress infrastructure projects in extreme temperature environments.',
    statCards: [
      { label: 'Base Plant', code: 'DXB-04', subtext: 'Jebel Ali South' },
      { label: 'Accreditation', code: 'ISO 17025', subtext: 'Calibrated Testing' },
      { label: 'Team Size', code: '18 Eng.', subtext: 'Materials Div' },
      { label: 'Visa Sponsorship', code: 'Full UAE', subtext: 'Direct Corporate' },
    ],
    sections: [
      {
        id: 'sec-mission',
        type: 'mission',
        heading: 'Mission & Strategic Impact',
        enabled: true,
        data: {
          paragraphs: [
            'At Sprimax Industrial WeldTech, our systems join critical infrastructure where failure is never an option. As our senior Metallurgical Engineer in Dubai, you will serve as the premier scientific authority evaluating weld macro/microstructures, HAZ (Heat Affected Zone) embrittlement, and phase transformations across extreme environments.',
            'You will lead metallurgical validation for heavy subsea pipelines, offshore production manifolds, pressure vessel shells (ASME VIII Div 1 & 2), and cable-stayed bridge spans spanning the Arabian Peninsula, Central Asia, and North Africa. Your laboratory determinations will govern critical weld consumable chemistry, preheat/interpass regimens, and automated orbital TIG/MIG parameters.',
          ],
          highlights: [
            {
              title: 'Global Standards Custody',
              description: 'Direct authority on AWS D1.1, API 1104, ASME IX, and ISO 15614-1 metallurgy signoffs.',
              icon: 'shield-check',
            },
            {
              title: 'Root-Cause Failure Lab',
              description: 'Investigate cracking phenomena (HICC, lamellar tearing, solidification cracking) with scanning electron microscopy.',
              icon: 'microscope',
            },
          ],
        },
      },
      {
        id: 'sec-resp',
        type: 'responsibilities',
        heading: 'Key Responsibilities',
        enabled: true,
        data: {
          items: [
            'Direct daily destructive mechanical testing pipelines: conduct high-rate Charpy V-Notch impact testing down to -60°C, transverse tensiles, side bends, and Vickers microhardness profiling (HV 0.5 to HV 10).',
            'Oversee chemical composition verification using Optical Emission Spectrometry (OES) and X-ray Fluorescence (XRF) to determine Carbon Equivalent (CE / Pcm) values on duplex stainless, super-austenitic, and micro-alloyed linepipe steels.',
            'Author and certify Welder Qualification Records (WQR) and Welding Procedure Specifications (PQR/WPS) in direct coordination with third-party inspection authorities (DNV, Lloyd\'s Register, ABS, Bureau Veritas).',
            'Lead root-cause metallurgical investigations into on-site cracking or porosity defects for major regional EPC contractors, preparing technical forensic failure dossiers.',
            'Partner with robotics and automation teams to calibrate thermal input limits for high-deposition tandem-wire submerged arc (SAW) and laser-hybrid arc weld cells.',
            'Maintain Dubai Central Met-Lab calibration routines under ISO/IEC 17025 accreditation standards, ensuring strict instrument traceability.',
          ],
        },
      },
      {
        id: 'sec-qual',
        type: 'qualifications',
        heading: 'Required Qualifications & Technical Mastery',
        enabled: true,
        data: {
          mandatory: [
            {
              label: 'Education',
              text: 'Bachelor of Science or Master of Science in Materials Science, Metallurgical Engineering, or Welding Engineering.',
            },
            {
              label: 'Industrial Track Record',
              text: 'Minimum 5+ years hands-on operational experience within heavy fabrication, pressure equipment fabrication, pipe mills, or metallurgical inspection laboratories.',
            },
            {
              label: 'Code Mastery',
              text: 'Proven working authority with ASME Section VIII & IX, AWS D1.1/D1.6, API 5L / API 1104, and relevant ISO/EN specs.',
            },
            {
              label: 'Analytical Instrumentation',
              text: 'Proven competency operating Optical Emission Spectrometers, Scanning Electron Microscopes (SEM/EDS), and automated microhardness traverses.',
            },
            {
              label: 'Linguistic',
              text: 'Fluent professional written and spoken English for international customer technical representation.',
            },
          ],
          preferred: [
            'AWS Certified Welding Inspector (CWI)',
            'CSWIP 3.1 / 3.2 Senior Inspector',
            'ISO 9712 NDT Level II (PT/MT/RT/UT)',
            'Middle East EPC project experience',
          ],
        },
      },
      {
        id: 'sec-facility',
        type: 'facilityContext',
        heading: 'Facility Context & Instrumentation Suite',
        enabled: true,
        data: {
          title: 'FACILITY CONTEXT: DUBAI MATERIALS TESTING CENTER',
          hubLabel: 'FACILITY HUB: JAFZA SOUTH TECHNOPARK',
          classLabel: 'ISO 17025 Class A Lab',
          image: '/assets/solution-heavy-eng.jpg',
          pillars: [
            {
              title: 'UNIVERSAL TESTING',
              description: 'Dual 600kN and 1000kN servo-hydraulic load frames equipped with video extensometers for high-temperature tensile analysis.',
              icon: 'wrench',
            },
            {
              title: 'SPECTROSCOPY SUITE',
              description: 'Spark OES with argon purged optics capable of low nitrogen, boron, and sulfur trace analysis in stainless and nickel alloys.',
              icon: 'flask',
            },
            {
              title: 'SUB-ZERO CHARPY',
              description: 'Cryogenic immersion bath and motorized impact pendulum supporting ASTM E23 verification down to liquid nitrogen (-196°C).',
              icon: 'snowflake',
            },
          ],
        },
      },
      {
        id: 'sec-benefits',
        type: 'benefits',
        heading: 'Total Compensation & Executive Expat Package',
        enabled: true,
        data: {
          items: [
            {
              title: '100% Tax-Free Compensation',
              description: 'Competitive executive expat salary paid directly in AED or USD with zero personal income taxation in the UAE.',
              icon: 'wallet',
            },
            {
              title: 'Relocation & Housing Support',
              description: 'Full flight package for employee & family, 45-day serviced apartment allowance, shipping container relocation, and visa handling.',
              icon: 'plane',
            },
            {
              title: 'Global Platinum Health Cover',
              description: 'Comprehensive private hospital coverage for engineer, spouse, and dependents across the UAE and worldwide networks.',
              icon: 'shield',
            },
            {
              title: 'Conferences & Certifications',
              description: 'Fully sponsored attendance at annual AWS Fabtech, IIW General Assemblies, and continued certification renewal funding.',
              icon: 'award',
            },
          ],
        },
      },
    ],
    sidebar: {
      targetStartDate: 'Immediate / Q1 2025',
      targetStartDateColor: 'green',
      division: 'Metallurgy & QA',
      location: 'Dubai Technopark',
      employment: 'Permanent Expat',
      travelReq: '15% GCC Regional',
      securityLevel: 'Level-2 Technical',
      reviewCycle: 'TYPICALLY 3-5 BUSINESS DAYS',
      recruiter: {
        name: 'Elena Rostova',
        role: 'LEAD TECH RECRUITER',
        email: 'elena.rostova@sprimax.com',
        quote: 'Have questions about lab equipment specs, ISO scope, or family relocation allowances? Connect directly with our engineering talent cell.',
      },
      integrityGuarantee: {
        enabled: true,
        text: 'Sprimax operates on strict zero-recruitment-fee principles. We never charge candidates for applications, processing, visas, or onboarding. Official communication is strictly conducted through verified @sprimax.com corporate domains.',
      },
    },
    featured: true,
    showShare: true,
    status: 'Open',
    postedAt: new Date('2024-10-14'),
    closingDate: new Date('2025-06-30'),
    applicantsCount: 3,
  },
  {
    title: 'Regional Sales Manager - MEA',
    slug: 'regional-sales-manager-mea',
    reqCode: 'SLS-4022-MEA',
    refCode: 'SEC-SLS-2024.11',
    department: 'SALES',
    departmentFull: 'SALES & COMMERCIAL',
    subDepartment: 'ENTERPRISE ACCOUNTS',
    deptTag: 'ENTERPRISE ACCOUNTS',
    workArrangement: 'Remote',
    remoteRegion: 'MEA Region',
    location: 'Remote (MEA Region)',
    locationFull: 'REMOTE (MIDDLE EAST & AFRICA)',
    locations: ['Remote (MEA Region)', 'Dubai, UAE', 'Riyadh, KSA'],
    employmentType: 'Full-time',
    minExperienceYears: 8,
    educationLevel: 'BSc Engineering / Commercial Business',
    reqSummary: 'Req: 8+ years technical B2B sales • Extensive regional travel',
    reqSummaryOverride: true,
    tagline: 'Lead commercial expansion across GCC industrial hubs, positioning high-yield welding consumables for mega infrastructure, LNG plants, and petrochemical complexes.',
    shortDescription: 'Drive strategic enterprise sales of heavy structural components across the Middle East and Africa. Requires deep technical knowledge of large-scale construction procurement.',
    statCards: [
      { label: 'Territory', code: 'GCC & MEA', subtext: '14 Active Nations' },
      { label: 'Client Focus', code: 'Tier-1 EPC', subtext: 'Energy & Infrastructure' },
      { label: 'Comp Structure', code: 'Base + Uncapped', subtext: 'USD / AED Direct' },
      { label: 'Travel Req', code: '40% Regional', subtext: 'Full Travel Suite' },
    ],
    sections: [
      {
        id: 'sec-mission-sls',
        type: 'mission',
        heading: 'Commercial Mission & Mandate',
        enabled: true,
        data: {
          paragraphs: [
            'As Regional Sales Manager for the Middle East & Africa, you will champion Sprimax consumable specifications across mega energy projects, desalination trains, and cross-border subsea lines.',
            'You will interface with Chief Procurement Officers, Project Directors, and Welding Technical Authorities across leading regional EPCs and state energy conglomerates.',
          ],
          highlights: [
            {
              title: 'Direct EPC Relationships',
              description: 'Manage flagship accounts across Petrofac, Saipem, McDermott, CCC, and National Petroleum Construction Co.',
              icon: 'briefcase',
            },
            {
              title: 'Multi-Million Pipeline',
              description: 'Accountable for quarterly delivery across automated SAW fluxes, high-nickel wires, and low-hydrogen electrodes.',
              icon: 'trending-up',
            },
          ],
        },
      },
    ],
    sidebar: {
      targetStartDate: 'Q1 2025',
      targetStartDateColor: 'blue',
      division: 'Commercial & Sales',
      location: 'Dubai / Riyadh Hub',
      employment: 'Full-time Executive',
      travelReq: '40% Regional Travel',
      securityLevel: 'Level-1 Commercial',
      reviewCycle: 'TYPICALLY 2-4 BUSINESS DAYS',
      recruiter: {
        name: 'Marcus Sterling',
        role: 'DIRECTOR OF GLOBAL TALENT ACQUISITION',
        email: 'marcus.sterling@sprimax.com',
        quote: 'Leading confidential talent discussions for specialized executive metallurgy and enterprise sales roles.',
      },
    },
    featured: false,
    showShare: true,
    status: 'Open',
    postedAt: new Date('2024-10-18'),
    closingDate: new Date('2025-05-30'),
    applicantsCount: 2,
  },
  {
    title: 'Subsea Welding Robotics Specialist',
    slug: 'subsea-welding-robotics-specialist',
    reqCode: 'AUT-9102-DXB',
    refCode: 'SEC-AUT-2024.12',
    department: 'ROBOTICS & AUTOMATION',
    departmentFull: 'ROBOTIC AUTOMATION DIVISION',
    subDepartment: 'OFFSHORE CELLS',
    deptTag: 'OFFSHORE FABRICATION',
    workArrangement: 'On-site',
    location: 'Dubai, UAE',
    locationFull: 'DUBAI TECHNOPARK & OFFSHORE SITES',
    locations: ['Dubai, UAE'],
    employmentType: 'Full-time',
    minExperienceYears: 6,
    educationLevel: 'BSc Mechatronics / Robotics / Welding',
    reqSummary: 'Req: 6+ years robotic arc integration • Subsea welding cells',
    reqSummaryOverride: true,
    tagline: 'Program, optimize, and deploy high-deposition automated narrow-gap TIG and tandem SAW robotic gantry systems for deepwater offshore spool fabrications.',
    shortDescription: 'Program and deploy automated robotic welding cells for high-pressure subsea flowlines and cryogenic pipe systems.',
    statCards: [
      { label: 'Cell Type', code: 'Narrow-Gap TIG', subtext: 'Subsea J-Lay' },
      { label: 'Controls', code: 'Fanuc / KUKA', subtext: 'Custom Servo Arc' },
      { label: 'Deposition Rate', code: '12 kg/hr', subtext: 'Tandem SAW' },
      { label: 'Deployment', code: 'Offshore & Yard', subtext: 'Jebel Ali Marine' },
    ],
    sections: [],
    sidebar: {
      targetStartDate: 'Immediate',
      targetStartDateColor: 'green',
      division: 'Automation & Robotics',
      location: 'Dubai Yard & Offshore Hub',
      employment: 'Permanent Expat',
      travelReq: '20% Field Deployment',
      securityLevel: 'Level-2 Technical',
      reviewCycle: 'TYPICALLY 3-5 BUSINESS DAYS',
      recruiter: {
        name: 'Elena Rostova',
        role: 'LEAD TECH RECRUITER',
        email: 'elena.rostova@sprimax.com',
        quote: 'Have questions about lab equipment specs, ISO scope, or family relocation allowances? Connect directly with our engineering talent cell.',
      },
    },
    featured: true,
    showShare: true,
    status: 'Open',
    postedAt: new Date('2024-10-20'),
    closingDate: new Date('2025-07-31'),
    applicantsCount: 1,
  },
];

const sampleApplications = [
  {
    firstName: 'Tariq',
    lastName: 'Al-Mansoor',
    email: 'tariq.mansoor@gulf-metallurgy.com',
    phoneCountry: '+971',
    phoneNumber: '50 481 9283',
    currentLocation: 'Abu Dhabi, UAE',
    currentEmployer: 'Emirates Subsea Technologies',
    currentJobTitle: 'Senior Metallurgical Quality Lead',
    experienceLevel: '5 - 8 Years (Senior Metallurgist / Specialist)',
    certifications: ['AWS CWI', 'CSWIP 3.1 / 3.2', 'NDT LEVEL II / III'],
    coverStatement: 'Experienced in pipeline fracture toughness, ISO 17025 lab certifications, and automated welding consumable evaluations.',
    status: 'In Review',
    rating: 4,
    source: 'job',
    appliedAt: new Date('2024-10-18'),
  },
  {
    firstName: 'Sophie',
    lastName: 'Dupont',
    email: 'sophie.dupont@euro-alloy.fr',
    phoneCountry: '+33',
    phoneNumber: '6 12 34 56 78',
    currentLocation: 'Lyon, France',
    currentEmployer: 'Framatome Materials Division',
    currentJobTitle: 'Materials Characterization Specialist',
    experienceLevel: '8 - 12 Years (Principal Lead / Operations Manager)',
    certifications: ['ISO 9001 LEAD AUDITOR', 'IWE / EWE'],
    coverStatement: 'Lead researcher in super-austenitic stainless steel weld microstructures and cryogenic toughness validation.',
    status: 'Shortlisted',
    rating: 5,
    source: 'job',
    appliedAt: new Date('2024-10-19'),
  },
  {
    firstName: 'Vikram',
    lastName: 'Sharma',
    email: 'vikram.sharma@welding-tech.in',
    phoneCountry: '+91',
    phoneNumber: '98201 44921',
    currentLocation: 'Mumbai, India',
    currentEmployer: 'Larsen & Toubro Heavy Engineering',
    currentJobTitle: 'Welding Automation Lead Engineer',
    experienceLevel: '5 - 8 Years',
    fieldOfExpertise: 'Robotics & Automated Welding Cells',
    mobility: 'Open to Global Relocation (EMEA, APAC, Americas)',
    coverStatement: 'Specialized in narrow-gap orbital TIG and tandem wire SAW integration on ASME Section VIII pressure vessels.',
    status: 'Interview',
    rating: 4,
    source: 'general',
    isTalentPool: true,
    appliedAt: new Date('2024-10-17'),
  },
];

async function seedCareers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Careers seeding');

    // 1. Ensure CareersSetting exists
    let settings = await CareersSetting.findOne();
    if (!settings) {
      await CareersSetting.create({});
      console.log('Created default CareersSetting');
    }

    // 2. Seed Jobs if none exist
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      const createdJobs = await Job.insertMany(initialJobs);
      console.log(`Seeded ${createdJobs.length} real-time Job postings into database`);

      // 3. Link sample applications to first job
      sampleApplications[0].jobId = createdJobs[0]._id;
      sampleApplications[0].jobTitle = createdJobs[0].title;
      sampleApplications[0].reqCode = createdJobs[0].reqCode;
      sampleApplications[0].department = createdJobs[0].department;

      sampleApplications[1].jobId = createdJobs[0]._id;
      sampleApplications[1].jobTitle = createdJobs[0].title;
      sampleApplications[1].reqCode = createdJobs[0].reqCode;
      sampleApplications[1].department = createdJobs[0].department;

      sampleApplications[2].jobId = null; // General application
      sampleApplications[2].jobTitle = 'General Application (Open Intake)';
      sampleApplications[2].reqCode = 'SPRIMAX-TALENT-GEN';
      sampleApplications[2].department = 'OPEN TALENT INTAKE';

      await Application.insertMany(sampleApplications);
      console.log(`Seeded ${sampleApplications.length} candidate applications into database`);
    } else {
      console.log(`Found ${jobCount} existing jobs in database. Skipping duplicate job seeding.`);
    }

    console.log('Careers seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Careers seeding error:', err);
    process.exit(1);
  }
}

seedCareers();
