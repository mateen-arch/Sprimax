import labMechanicalTesting from '../assets/lab-mechanical-testing.jpg';
import labChemicalAnalysis from '../assets/lab-chemical-analysis.jpg';

export const CAREERS_STATS = [
  { value: '40+', label: 'GLOBAL SITES' },
  { value: '12K', label: 'ENGINEERS' },
];

export const CAREERS_ADVANTAGES = [
  {
    id: 'continuous-training',
    title: 'Continuous Technical Training',
    description:
      'Access industry-leading certification programs, advanced metallurgical seminars, and hands-on workshops with next-generation manufacturing robotics. We ensure your skills remain at the bleeding edge of industrial technology.',
    icon: 'graduation-cap',
    watermark: 'cap',
    variant: 'featured', // large card
  },
  {
    id: 'safety-first',
    title: 'Safety First Culture',
    description:
      'Zero-compromise protocols. Your well-being is the baseline requirement for every operation we undertake.',
    icon: 'shield-check',
    watermark: 'cross',
    variant: 'dark', // solid black card with red icon
  },
  {
    id: 'global-exposure',
    title: 'Global Exposure',
    description:
      'Collaborate across borders. Assignments in key infrastructural hubs across EMEA, APAC, and the Americas.',
    icon: 'globe',
    variant: 'light',
  },
  {
    id: 'tier-1-comp',
    title: 'Tier-1 Compensation',
    description:
      'Highly competitive base salaries, performance-driven bonuses, and comprehensive family healthcare coverage standard.',
    icon: 'credit-card',
    variant: 'light',
  },
];

export const OPEN_ROLES = [
  {
    id: 'metallurgical-engineer',
    slug: 'metallurgical-engineer',
    title: 'Metallurgical Engineer',
    department: 'ENGINEERING',
    departmentFull: 'ENGINEERING DEPT',
    location: 'Dubai, UAE',
    locationFull: 'DUBAI, UNITED ARAB EMIRATES',
    type: 'Full-time',
    reqCode: 'ENG-7018-DXB',
    refCode: 'SEC-MET-2024.08',
    deptTag: 'ADVANCED CLADDING',
    postedDate: '14 OCT 2024',
    shortDescription:
      'Responsible for material testing, failure analysis, and developing new alloy specifications for high-stress infrastructure projects in extreme temperature environments.',
    reqSummary: 'Req: 5+ years experience • BS/MS in Materials Science',
    subtitle:
      'Spearhead mechanical fracture mechanics, alloy microstructural verification, and low-hydrogen consumable qualification at the Sprimax Middle East Regional Materials Testing Complex.',
    basePlant: {
      code: 'DXB-04',
      subtext: 'Jebel Ali South',
    },
    accreditation: {
      code: 'ISO 17025',
      subtext: 'Calibrated Testing',
    },
    teamSize: {
      code: '18 Eng.',
      subtext: 'Materials Div',
    },
    visaSponsorship: {
      code: 'Full UAE',
      subtext: 'Direct Corporate',
    },
    mission: {
      paragraphs: [
        'At Sprimax Industrial WeldTech, our systems join critical infrastructure where failure is never an option. As our senior Metallurgical Engineer in Dubai, you will serve as the premier scientific authority evaluating weld macro/microstructures, HAZ (Heat Affected Zone) embrittlement, and phase transformations across extreme environments.',
        'You will lead metallurgical validation for heavy subsea pipelines, offshore production manifolds, pressure vessel shells (ASME VIII Div 1 & 2), and cable-stayed bridge spans spanning the Arabian Peninsula, Central Asia, and North Africa. Your laboratory determinations will govern critical weld consumable chemistry, preheat/interpass regimens, and automated orbital TIG/MIG parameters.',
      ],
      highlights: [
        {
          title: 'Global Standards Custody',
          description:
            'Direct authority on AWS D1.1, API 1104, ASME IX, and ISO 15614-1 metallurgy signoffs.',
          icon: 'shield-check',
        },
        {
          title: 'Root-Cause Failure Lab',
          description:
            'Investigate cracking phenomena (HICC, lamellar tearing, solidification cracking) with scanning electron microscopy.',
          icon: 'microscope',
        },
      ],
    },
    responsibilities: [
      'Direct daily destructive mechanical testing pipelines: conduct high-rate Charpy V-Notch impact testing down to -60°C, transverse tensiles, side bends, and Vickers microhardness profiling (HV 0.5 to HV 10).',
      'Oversee chemical composition verification using Optical Emission Spectrometry (OES) and X-ray Fluorescence (XRF) to determine Carbon Equivalent (CE / Pcm) values on duplex stainless, super-austenitic, and micro-alloyed linepipe steels.',
      'Author and certify Welder Qualification Records (WQR) and Welding Procedure Specifications (PQR/WPS) in direct coordination with third-party inspection authorities (DNV, Lloyd\'s Register, ABS, Bureau Veritas).',
      'Lead root-cause metallurgical investigations into on-site cracking or porosity defects for major regional EPC contractors, preparing technical forensic failure dossiers.',
      'Partner with robotics and automation teams to calibrate thermal input limits for high-deposition tandem-wire submerged arc (SAW) and laser-hybrid arc weld cells.',
      'Maintain Dubai Central Met-Lab calibration routines under ISO/IEC 17025 accreditation standards, ensuring strict instrument traceability.',
    ],
    qualifications: {
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
    facilityContext: {
      title: 'FACILITY CONTEXT: DUBAI MATERIALS TESTING CENTER',
      hubLabel: 'FACILITY HUB: JAFZA SOUTH TECHNOPARK',
      classLabel: 'ISO 17025 Class A Lab',
      image: labMechanicalTesting,
      pillars: [
        {
          title: 'UNIVERSAL TESTING',
          description:
            'Dual 600kN and 1000kN servo-hydraulic load frames equipped with video extensometers for high-temperature tensile analysis.',
          icon: 'wrench',
        },
        {
          title: 'SPECTROSCOPY SUITE',
          description:
            'Spark OES with argon purged optics capable of low nitrogen, boron, and sulfur trace analysis in stainless and nickel alloys.',
          icon: 'flask',
        },
        {
          title: 'SUB-ZERO CHARPY',
          description:
            'Cryogenic immersion bath and motorized impact pendulum supporting ASTM E23 verification down to liquid nitrogen (-196°C).',
          icon: 'snowflake',
        },
      ],
    },
    benefits: [
      {
        title: '100% Tax-Free Compensation',
        description:
          'Competitive executive expat salary paid directly in AED or USD with zero personal income taxation in the UAE.',
        icon: 'wallet',
      },
      {
        title: 'Relocation & Housing Support',
        description:
          'Full flight package for employee & family, 45-day serviced apartment allowance, shipping container relocation, and visa handling.',
        icon: 'plane',
      },
      {
        title: 'Global Platinum Health Cover',
        description:
          'Comprehensive private hospital coverage for engineer, spouse, and dependents across the UAE and worldwide networks.',
        icon: 'shield',
      },
      {
        title: 'Conferences & Certifications',
        description:
          'Fully sponsored attendance at annual AWS Fabtech, IIW General Assemblies, and continued certification renewal funding.',
        icon: 'award',
      },
    ],
    sidebar: {
      targetStartDate: 'Immediate / Q1 2025',
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
        quote:
          'Have questions about lab equipment specs, ISO scope, or family relocation allowances? Connect directly with our engineering talent cell.',
      },
    },
    applicationFormDefault: {
      firstName: 'Alexandre',
      lastName: 'Vance',
      email: 'a.vance@metallurgy-spec.com',
      phoneCountry: '+971',
      phoneNumber: '50 892 4104',
      location: 'Dubai Silicon Oasis, United Arab Emirates (Valid UAE Gold Visa)',
      currentEmployer: 'Emirates Heavy Cladding Industries LLC',
      currentJobTitle: 'Senior Alloy Cladding Specialist',
      experienceLevel: '5 - 8 Years (Senior Metallurgist / Automated TIG Cladding)',
      fileName: 'Alex_Vance_Metallurgical_CV.pdf',
      fileSize: '2.4 MB',
      fileChecksum: 'SHA-256 Valid',
      certifications: ['AWS CWI', 'CSWIP 3.1 / 3.2', 'NDT LEVEL II / III'],
      coverStatement:
        'Over the past 6 years, I have spearheaded metallurgical qualification and dilution mitigation testing for automated cladding cells handling nickel-based superalloys (Inconel 625/825) on low alloy steels for subsea riser spools. Very keen to bring high-reliability metallurgy protocols to Sprimax DXB.',
    },
  },
  {
    id: 'regional-sales-manager-mea',
    slug: 'regional-sales-manager-mea',
    title: 'Regional Sales Manager - MEA',
    department: 'SALES',
    departmentFull: 'SALES & COMMERCIAL',
    location: 'Remote (MEA Region)',
    locationFull: 'REMOTE (MIDDLE EAST & AFRICA)',
    type: 'Full-time',
    reqCode: 'SLS-4022-MEA',
    refCode: 'SEC-SLS-2024.11',
    deptTag: 'ENTERPRISE ACCOUNTS',
    postedDate: '18 OCT 2024',
    shortDescription:
      'Drive strategic enterprise sales of heavy structural components across the Middle East and Africa. Requires deep technical knowledge of large-scale construction procurement.',
    reqSummary: 'Req: 8+ years technical B2B sales • Extensive regional travel',
    subtitle:
      'Scale high-yield welding consumables, submerged arc wires, and industrial fabrication contracts across Tier-1 EPC contractors in the MEA region.',
    basePlant: {
      code: 'REG-MEA',
      subtext: 'Dubai & Riyadh Hub',
    },
    accreditation: {
      code: 'ISO 9001',
      subtext: 'Commercial Standards',
    },
    teamSize: {
      code: '12 Execs',
      subtext: 'Sales Directorate',
    },
    visaSponsorship: {
      code: 'Full UAE / KSA',
      subtext: 'Direct Corporate',
    },
    mission: {
      paragraphs: [
        'As our Regional Sales Manager for the Middle East & Africa, you will champion multi-million dollar structural supply partnerships with national oil corporations, desalination consortia, and maritime shipyards.',
        'Working closely with our Dubai materials testing lab and field metallurgical consultants, you will position Sprimax certified welding solutions directly within engineering specifications during the FEED and procurement phases of mega-projects.',
      ],
      highlights: [
        {
          title: 'Key Enterprise Portfolios',
          description:
            'Spearhead contracts with Saudi Aramco, ADNOC, QatarEnergy, and top-tier global EPCs.',
          icon: 'briefcase',
        },
        {
          title: 'Technical Value-Engineering',
          description:
            'Partner with welding engineers to demonstrate total cost of fabrication reductions via low-hydrogen, high-deposition wire alloys.',
          icon: 'trending-up',
        },
      ],
    },
    responsibilities: [
      'Manage regional revenue quotas exceeding $25M across industrial weld consumables, automation fluxes, and pipeline welding systems.',
      'Lead direct negotiations on multi-year vendor framework agreements with major EPC procurement directors.',
      'Conduct regular on-site technical presentations with chief welding engineers and quality managers across Saudi Arabia, UAE, Oman, and Egypt.',
      'Collaborate with supply chain teams to guarantee regional safety stocks across Jebel Ali, Dammam, and regional distributor depots.',
      'Deliver detailed quarterly pipeline forecasts, competitive pricing intelligence, and market expansion strategies to executive management.',
    ],
    qualifications: {
      mandatory: [
        {
          label: 'Education',
          text: 'Bachelor’s Degree in Mechanical Engineering, Metallurgy, or Business Administration.',
        },
        {
          label: 'Track Record',
          text: '8+ years of proven commercial success selling heavy industrial consumables, steel, or capital equipment in the GCC/MEA region.',
        },
        {
          label: 'Network',
          text: 'Established relationships with key decision-makers at EPCs, structural fabricators, and oil & gas pipeline contractors.',
        },
        {
          label: 'Mobility',
          text: 'Willingness to travel 40-50% regionally across GCC and North Africa.',
        },
      ],
      preferred: [
        'Deep technical knowledge of AWS / ASME welding consumables',
        'Bilingual English and Arabic fluency',
        'Demonstrated CRM mastery (Salesforce / SAP)',
      ],
    },
    facilityContext: {
      title: 'FACILITY CONTEXT: REGIONAL COMMERCIAL OPERATIONS',
      hubLabel: 'REGIONAL HQ: DUBAI & RIYADH',
      classLabel: 'Commercial Excellence Center',
      image: labChemicalAnalysis,
      pillars: [
        {
          title: 'KEY CLIENT DEMO CELL',
          description:
            'Dedicated robotics and welding automation showroom in JAFZA for live weld demonstration and mechanical testing with clients.',
          icon: 'wrench',
        },
        {
          title: 'SUPPLY CHAIN NETWORK',
          description:
            'Regional bonded warehousing ensuring 48-hour delivery of certified electrodes and spools across GCC industrial zones.',
          icon: 'box',
        },
        {
          title: 'CONTRACT AUDITING',
          description:
            'Direct legal and compliance support for complex international Letters of Credit (LC) and performance bonding.',
          icon: 'shield',
        },
      ],
    },
    benefits: [
      {
        title: 'Uncapped Performance Bonus',
        description:
          'Highly rewarding quarterly incentive scheme tied to gross margin and new enterprise customer onboarding.',
        icon: 'trending-up',
      },
      {
        title: 'Executive Relocation or Remote Expat',
        description:
          'Available as a remote MEA role or fully relocated package to Dubai or Riyadh with comprehensive family visa support.',
        icon: 'plane',
      },
      {
        title: 'Premium Healthcare & Travel Cover',
        description:
          'Comprehensive global medical and VIP travel insurance for you and your dependents.',
        icon: 'shield',
      },
      {
        title: 'Executive Vehicle Allowance',
        description:
          'Generous executive transport allowance and company fuel/toll card covering all regional operational travel.',
        icon: 'credit-card',
      },
    ],
    sidebar: {
      targetStartDate: 'Q1 / Q2 2025',
      division: 'Commercial & Sales',
      location: 'Dubai / Riyadh Hub',
      employment: 'Full-time Executive',
      travelReq: '40% Regional GCC',
      securityLevel: 'Standard Commercial',
      reviewCycle: 'TYPICALLY 2-4 BUSINESS DAYS',
      recruiter: {
        name: 'Marcus Sterling',
        role: 'HEAD OF COMMERCIAL RECRUITMENT',
        email: 'marcus.sterling@sprimax.com',
        quote:
          'Seeking high-performing enterprise leaders ready to drive structural market share across GCC infrastructure megaprojects.',
      },
    },
    applicationFormDefault: {
      firstName: '',
      lastName: '',
      email: '',
      phoneCountry: '+971',
      phoneNumber: '',
      location: '',
      currentEmployer: '',
      currentJobTitle: '',
      experienceLevel: '8+ Years (Enterprise Technical Sales / Regional Directorate)',
      fileName: '',
      fileSize: '',
      fileChecksum: '',
      certifications: [],
      coverStatement: '',
    },
  },
  {
    id: 'production-quality-supervisor',
    slug: 'production-quality-supervisor',
    title: 'Production Quality Supervisor',
    department: 'OPERATIONS',
    departmentFull: 'OPERATIONS & QA',
    location: 'Houston, TX',
    locationFull: 'HOUSTON, TEXAS, USA',
    type: 'Full-time (Shift)',
    reqCode: 'OPS-9001-HOU',
    refCode: 'SEC-OPS-2024.12',
    deptTag: 'MANUFACTURING CELL',
    postedDate: '20 OCT 2024',
    shortDescription:
      'Oversee floor operations to ensure 100% compliance with ISO 9001 standards. Manage a team of inspectors and implement continuous improvement methodologies on the assembly line.',
    reqSummary: 'Req: 3+ years supervisory exp • Six Sigma Green Belt minimum',
    subtitle:
      'Supervise automated electrode extrusion, wire drawing, and flux formulation production lines at our Houston manufacturing plant.',
    basePlant: {
      code: 'HOU-01',
      subtext: 'Houston Energy Corridor',
    },
    accreditation: {
      code: 'ISO 9001 / ASME',
      subtext: 'Nuclear & Offshore QA',
    },
    teamSize: {
      code: '24 Insp.',
      subtext: 'Plant QA Cell',
    },
    visaSponsorship: {
      code: 'US Work Auth',
      subtext: 'Citizen / Perm Resident',
    },
    mission: {
      paragraphs: [
        'At our Houston manufacturing complex, quality is manufactured into every foot of wire and every batch of coated electrode. As Production Quality Supervisor, you will lead the plant inspection team to maintain zero-defect standards across critical production cycles.',
        'You will act as the frontline guardian of batch traceability, testing raw flux minerals, wire chemistry, and coating concentricity under strict ASME Section II Part C and AWS A5.1 specifications.',
      ],
      highlights: [
        {
          title: 'ASME Nuclear Grade Compliance',
          description:
            'Maintain zero-defect quality oversight for nuclear-stamped and critical offshore consumables.',
          icon: 'shield-check',
        },
        {
          title: 'Statistical Process Control (SPC)',
          description:
            'Deploy automated laser micrometers and real-time SPC charting to eliminate coating dimensional variation.',
          icon: 'activity',
        },
      ],
    },
    responsibilities: [
      'Supervise 24 shift QA technicians and line inspectors across continuous wire drawing and high-speed extrusion lines.',
      'Enforce strict adherence to ISO 9001:2015 standard operating procedures, containment protocols, and non-conformance reports (NCRs).',
      'Conduct daily batch release testing, including moisture re-absorption bake testing, radiographic weld tests, and coating concentricity checks.',
      'Lead root-cause analysis using 5-Why and Fishbone diagrams whenever defect thresholds approach control limits.',
      'Coordinate external customer and third-party audits with ABS, ASME, and DNV surveyors.',
    ],
    qualifications: {
      mandatory: [
        {
          label: 'Education',
          text: 'Associate or Bachelor’s degree in Manufacturing Engineering, Quality Management, or related technical discipline.',
        },
        {
          label: 'Experience',
          text: '3+ years of supervisory experience in industrial manufacturing, welding consumables, or precision metallurgy production.',
        },
        {
          label: 'Quality Certification',
          text: 'Certified Six Sigma Green Belt (CSSGB) or ASQ Certified Quality Inspector (CQI).',
        },
        {
          label: 'Technical Knowledge',
          text: 'Thorough familiarity with ASME Section II/IX, AWS welding standards, and calibrated dimensional tooling.',
        },
      ],
      preferred: [
        'CWI (Certified Welding Inspector) credential',
        'Experience with lean manufacturing and 5S kaizen implementation',
        'Forklift and overhead crane safety certified',
      ],
    },
    facilityContext: {
      title: 'FACILITY CONTEXT: HOUSTON ADVANCED FABRICATION PLANT',
      hubLabel: 'PLANT HUB: HOUSTON SHIP CHANNEL',
      classLabel: 'ISO 9001 / ISO 14001 Facility',
      image: labMechanicalTesting,
      pillars: [
        {
          title: 'WIRE DRAWING CELLS',
          description:
            'Multi-die drawing lines producing precision diameter MIG/MAG and submerged arc wires with mirror finish copper coating.',
          icon: 'wrench',
        },
        {
          title: 'FLUX BLENDING COMPLEX',
          description:
            'Computerized dry mineral blending and wet mixing lines maintaining strict moisture balance below 0.15%.',
          icon: 'flask',
        },
        {
          title: 'X-RAY INSPECTION BAY',
          description:
            'Digital real-time radioscopy checking test weld pads for internal porosity, tungsten inclusion, or slag lines.',
          icon: 'shield',
        },
      ],
    },
    benefits: [
      {
        title: 'Top-Tier Industry Compensation',
        description:
          'Competitive hourly/salary package with shift differential, overtime premiums, and annual profit sharing.',
        icon: 'credit-card',
      },
      {
        title: 'Comprehensive 401(k) Matching',
        description:
          '100% dollar-for-dollar company match up to 6% of compensation, immediately vested.',
        icon: 'trending-up',
      },
      {
        title: 'Medical, Dental & Vision Standard',
        description:
          'Low-deductible Blue Cross PPO coverage with employer-funded Health Savings Account (HSA).',
        icon: 'shield',
      },
      {
        title: 'Tuition Assistance & Training',
        description:
          'Up to $6,000 annually for continuing engineering education and ASQ / AWS professional certifications.',
        icon: 'award',
      },
    ],
    sidebar: {
      targetStartDate: 'Immediate / Q1 2025',
      division: 'Plant Operations & QA',
      location: 'Houston, TX',
      employment: 'Full-time (Rotating Shifts)',
      travelReq: '< 5% Occasional',
      securityLevel: 'Standard Manufacturing',
      reviewCycle: 'TYPICALLY 2-3 BUSINESS DAYS',
      recruiter: {
        name: 'Sarah Jenkins',
        role: 'PLANT TALENT PARTNER',
        email: 'sarah.jenkins@sprimax.com',
        quote:
          'Looking for disciplined quality supervisors dedicated to manufacturing reliability for North America’s energy infrastructure.',
      },
    },
    applicationFormDefault: {
      firstName: '',
      lastName: '',
      email: '',
      phoneCountry: '+1',
      phoneNumber: '',
      location: '',
      currentEmployer: '',
      currentJobTitle: '',
      experienceLevel: '3 - 5 Years (Quality Control Supervisor / Assembly Line QA)',
      fileName: '',
      fileSize: '',
      fileChecksum: '',
      certifications: ['ISO 9001 LEAD AUDITOR'],
      coverStatement: '',
    },
  },
];
