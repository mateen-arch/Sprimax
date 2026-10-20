import Blog from '../models/Blog.js';
import BlogCategory from '../models/BlogCategory.js';

export const INITIAL_BLOG_CATEGORIES = [
  { name: 'Metallurgy', slug: 'metallurgy', sortOrder: 1 },
  { name: 'Safety Protocols', slug: 'safety-protocols', sortOrder: 2 },
  { name: 'Case Studies', slug: 'case-studies', sortOrder: 3 },
  { name: 'Technical Guides', slug: 'technical-guides', sortOrder: 4 },
];

export const INITIAL_REAL_BLOGS = [
  {
    title: 'Advancements in High-Tensile Steel Alloy Microstructures for Heavy Duty Structural Beams',
    slug: 'advancements-in-high-tensile-steel-alloy-microstructures',
    summary:
      'An in-depth analysis of the latest thermal treatment processes designed to increase the yield strength of structural steel by 15% while mitigating brittle fracture risks in sub-zero environments.',
    bannerImageUrl: '/assets/blog-cnc-milling.jpg',
    bannerAlt: 'High-Tensile Steel Alloy Microstructures CNC Milling',
    bannerCaption: 'Fig 1. Multi-axis precision machining of alloy steel structural node components.',
    category: 'Metallurgy',
    tags: ['Metallurgy', 'Structural Steel', 'TMCP', 'Impact Toughness'],
    author: {
      name: 'Metallurgical R&D Division',
      role: 'Lead Research Group',
    },
    status: 'Published',
    featured: true,
    readTimeMinutes: 10,
    publishedAt: new Date('2024-10-15T09:00:00.000Z'),
    seo: {
      metaTitle: 'Advancements in High-Tensile Steel Alloy Microstructures',
      metaDescription:
        'An in-depth analysis of thermal treatment processes designed to increase the yield strength of structural steel while mitigating brittle fracture risks.',
    },
    featuredProduct: {
      name: 'E7018-1 H4R LOW-HYDROGEN ELECTRODE',
      sku: 'E7018-1',
      description:
        'Ultra-low moisture absorption coating designed for critical high-yield structural fabrications and offshore standards.',
      image: '/assets/product-lh7018.png',
      url: '/products',
    },
    ctaCard: {
      enabled: true,
      heading: 'Require Technical Assistance?',
      description:
        'Our metallurgical engineers are available for consultation on complex structural fabrication challenges.',
      buttonLabel: 'SUBMIT TECHNICAL ENQUIRY',
      buttonLink: '/contact',
    },
    content: [
      {
        id: 'block-p-1',
        type: 'paragraph',
        isLead: true,
        content:
          'Modern mega-infrastructure and heavy crane girders demand structural sections that provide exceptional yield strength without penalizing ductility or weldability. Recent breakthroughs in Thermo-Mechanical Controlled Processing (TMCP) and micro-alloying with niobium and titanium have unlocked unprecedented strength-to-weight ratios.',
      },
      {
        id: 'block-h2-1',
        type: 'heading',
        level: 2,
        content: 'Grain Refinement through TMCP Cooling Gradients',
      },
      {
        id: 'block-p-2',
        type: 'paragraph',
        content:
          'By precisely regulating rolling reduction passes in the non-recrystallization austenite regime followed by accelerated laminar cooling, engineers can achieve ultra-fine ferrite grain sizes below 3 microns. This refined microstructure simultaneously enhances yield strength and lowers ductile-to-brittle transition temperatures.',
      },
      {
        id: 'block-callout-1',
        type: 'callout',
        calloutType: 'note',
        calloutTitle: 'Engineering Note: Carbon Equivalent Limits',
        calloutBody:
          'Maintaining CEV (IIW) below 0.38 ensures outstanding field weldability without requiring excessive preheat temperatures, substantially lowering erection costs for structural contractors.',
      },
      {
        id: 'block-h2-2',
        type: 'heading',
        level: 2,
        content: 'Sub-Zero Charpy V-Notch Impact Toughness',
      },
      {
        id: 'block-p-3',
        type: 'paragraph',
        content:
          'Heavy civil works in arctic and sub-zero offshore environments require verified impact absorption down to -40°C. Micro-alloyed additions eliminate coarse carbide precipitations that traditionally act as crack initiation sites under dynamic impact loading.',
      },
      {
        id: 'block-table-1',
        type: 'table',
        tableHeaders: [
          'ALLOY GRADE',
          'MIN YIELD (MPA)',
          'CHARPY IMPACT @ -40°C (JOULES)',
          'WELDABILITY INDEX',
        ],
        tableRows: [
          ['SPR-S355ML', '355', '≥ 47 J', 'Excellent (Preheat Opt)'],
          ['SPR-S460ML', '460', '≥ 34 J', 'Strict Heat Control'],
          ['SPR-S690QL', '690', '≥ 30 J', 'Low-H2 Mandatory'],
        ],
        tableCaption: 'Table 1. Mechanical properties comparison across structural alloy grades.',
      },
    ],
  },
  {
    title: 'The Impact of Hydrogen on Structural Weld Integrity',
    slug: 'impact-of-hydrogen-on-structural-weld-integrity',
    summary:
      'Understanding the mechanics of hydrogen embrittlement and diffusible hydrogen control in high-tensile structural weld joints.',
    bannerImageUrl: '/assets/blog-welding-detail.jpg',
    bannerAlt: 'Structural Weld Integrity Arc Fillet Weld',
    bannerCaption: 'Fig 1. Multi-pass fillet weld on high-strength structural steel.',
    category: 'Metallurgy',
    tags: ['Metallurgy', 'Hydrogen Embrittlement', 'Welding', 'Testing'],
    author: {
      name: 'Dr. Heinrich Vossen',
      role: 'Lead Metallurgist',
    },
    status: 'Published',
    featured: false,
    readTimeMinutes: 8,
    publishedAt: new Date('2023-10-24T10:00:00.000Z'),
    seo: {
      metaTitle: 'The Impact of Hydrogen on Structural Weld Integrity',
      metaDescription:
        'Understanding hydrogen-induced cold cracking (HIC) mechanisms and effective mitigation thresholds in structural steel.',
    },
    featuredProduct: {
      name: 'E7018-1 H4R LOW-HYDROGEN ELECTRODE',
      sku: 'E7018-1',
      description:
        'Ultra-low moisture absorption coating designed for critical high-yield structural fabrications and offshore standards.',
      image: '/assets/product-lh7018.png',
      url: '/products',
    },
    ctaCard: {
      enabled: true,
      heading: 'Require Technical Assistance?',
      description:
        'Our metallurgical engineers are available for consultation on complex structural fabrication challenges.',
      buttonLabel: 'SUBMIT TECHNICAL ENQUIRY',
      buttonLink: '/contact',
    },
    content: [
      {
        id: 'block-p-1',
        type: 'paragraph',
        isLead: true,
        content:
          'Hydrogen-induced cracking (HIC), also known as cold cracking, remains one of the most critical challenges in the fabrication of high-strength structural steels. Understanding the mechanics of hydrogen embrittlement is paramount for ensuring the long-term integrity of heavy industrial infrastructure.',
      },
      {
        id: 'block-h2-1',
        type: 'heading',
        level: 2,
        content: 'The Mechanics of Embrittlement',
      },
      {
        id: 'block-p-2',
        type: 'paragraph',
        content:
          'During the welding process, moisture or organic compounds can break down in the intense heat of the arc, introducing atomic hydrogen into the molten weld pool. Because atomic hydrogen is highly mobile in the steel lattice at elevated temperatures, it rapidly diffuses into the heat-affected zone (HAZ) and the weld metal itself.',
      },
      {
        id: 'block-callout-1',
        type: 'callout',
        calloutType: 'tip',
        calloutTitle: 'Pro Tip: Pre-Baking Consumables',
        calloutBody:
          'Always store low-hydrogen electrodes in a holding oven at 120°C - 150°C. If exposed to atmosphere for prolonged periods, re-bake according to manufacturer specifications (typically 300°C - 350°C for 1-2 hours) before use to drive off absorbed moisture.',
      },
      {
        id: 'block-h2-2',
        type: 'heading',
        level: 2,
        content: 'Critical Thresholds & Mitigation',
      },
      {
        id: 'block-p-3',
        type: 'paragraph',
        content:
          'The risk of cold cracking increases significantly when three conditions are simultaneously met: a susceptible microstructure (martensite or bainite), sufficient residual stress, and a critical concentration of diffusible hydrogen. Mitigation relies on controlling heat input, applying appropriate pre-heat, and strictly utilizing low-hydrogen consumables.',
      },
      {
        id: 'block-table-1',
        type: 'table',
        tableHeaders: [
          'STEEL YIELD STRENGTH (MPA)',
          'MAX ALLOWABLE DIFFUSIBLE H2 (ML/100G)',
          'TYPICAL PRE-HEAT TEMP (°C)',
        ],
        tableRows: [
          ['≤ 355', '15.0', 'Ambient - 50'],
          ['355 - 460', '10.0', '50 - 100'],
          ['460 - 690', '5.0', '100 - 150'],
        ],
        tableCaption: 'Table 1. Maximum allowable diffusible hydrogen and preheat recommendations.',
      },
    ],
  },
  {
    title: 'Fluid Dynamics Optimization in High-Pressure Piping Systems',
    slug: 'fluid-dynamics-optimization-high-pressure-piping',
    summary:
      'Addressing cavitation and flow restriction issues in industrial coolant loops through revised joint geometries and predictive modeling.',
    bannerImageUrl: '/assets/blog-piping-blueprint.jpg',
    bannerAlt: 'Industrial Fluid Dynamics Blueprint',
    bannerCaption: 'Fig 1. Hydraulic schematics and CFD velocity gradient map for high-pressure industrial loop.',
    category: 'Technical Guides',
    tags: ['Technical Guides', 'Fluid Dynamics', 'Piping', 'CFD'],
    author: {
      name: 'Industrial Systems Engineering',
      role: 'Fluid Mechanics Lead',
    },
    status: 'Published',
    featured: false,
    readTimeMinutes: 6,
    publishedAt: new Date('2024-10-10T11:00:00.000Z'),
    seo: {
      metaTitle: 'Fluid Dynamics Optimization in High-Pressure Piping Systems',
      metaDescription:
        'Addressing cavitation and flow restriction issues in industrial coolant loops through revised joint geometries.',
    },
    featuredProduct: {
      name: 'ER70S-6 SOLID MIG WIRE',
      sku: 'ER70S-6',
      description:
        'High-deoxidizer mild steel welding wire engineered for smooth root pass penetration in pipe spool fabrication.',
      image: '/assets/product-lh7018.png',
      url: '/products',
    },
    ctaCard: {
      enabled: true,
      heading: 'Require Technical Assistance?',
      description:
        'Our metallurgical engineers are available for consultation on complex structural fabrication challenges.',
      buttonLabel: 'SUBMIT TECHNICAL ENQUIRY',
      buttonLink: '/contact',
    },
    content: [
      {
        id: 'block-p-1',
        type: 'paragraph',
        isLead: true,
        content:
          'Cavitation and localized erosion in high-velocity piping loops represent major vectors of premature equipment failure. By deploying computational fluid dynamics (CFD) to analyze turbulence zones at elbows and reducer joints, engineering teams can optimize header geometries to preserve laminar boundary layers.',
      },
      {
        id: 'block-h2-1',
        type: 'heading',
        level: 2,
        content: 'Boundary Layer Separation & Vorticity Reduction',
      },
      {
        id: 'block-p-2',
        type: 'paragraph',
        content:
          'Abrupt geometric changes in high-pressure steam and hydraulic lines trigger severe pressure drops that induce micro-vapor bubbles. When these bubbles collapse near the inner pipe wall, shockwaves exceeding 1,000 MPa erode the passivation layer, triggering cavitation-corrosion synergy.',
      },
      {
        id: 'block-callout-1',
        type: 'callout',
        calloutType: 'tip',
        calloutTitle: 'Design Guideline: Long-Radius Elbows',
        calloutBody:
          'Specify 3D or 5D bend radii instead of standard 1.5D fittings in lines with flow velocities exceeding 4.5 m/s to reduce localized shear stress by up to 40%.',
      },
      {
        id: 'block-table-1',
        type: 'table',
        tableHeaders: [
          'FLOW VELOCITY (M/S)',
          'RECOMMENDED BEND RADIUS',
          'RECOMMENDED ALLOY',
          'CFD PRESSURE DROP (KPA)',
        ],
        tableRows: [
          ['< 2.5 m/s', '1.5D Standard', 'ASTM A106 Gr B', '12 kPa'],
          ['2.5 - 5.0 m/s', '3.0D Long Sweep', 'ASTM A335 P11', '24 kPa'],
          ['> 5.0 m/s', '5.0D Induction Bend', 'ASTM A312 TP316L', '38 kPa'],
        ],
        tableCaption: 'Table 1. Piping flow velocity vs bend geometry design matrix.',
      },
    ],
  },
  {
    title: 'Revised Lockout-Tagout (LOTO) Procedures for Automated Assembly Lines',
    slug: 'revised-lockout-tagout-procedures-automated-assembly-lines',
    summary:
      'Implementing a tiered access control system to reduce maintenance-related safety incidents while minimizing downtime.',
    bannerImageUrl: '/assets/solution-heavy-eng.jpg',
    bannerAlt: 'LOTO Safety Procedures in Automated Plant',
    bannerCaption: 'Fig 1. Tiered zero-energy verification protocol at multi-axis robotic workstation.',
    category: 'Safety Protocols',
    tags: ['Safety Protocols', 'LOTO', 'Automation', 'Compliance'],
    author: {
      name: 'Plant Safety & Compliance Board',
      role: 'Safety Director',
    },
    status: 'Published',
    featured: false,
    readTimeMinutes: 5,
    publishedAt: new Date('2024-10-05T08:30:00.000Z'),
    seo: {
      metaTitle: 'Revised Lockout-Tagout (LOTO) Procedures for Automated Assembly Lines',
      metaDescription:
        'Implementing a tiered access control system to reduce maintenance-related safety incidents.',
    },
    content: [
      {
        id: 'block-p-1',
        type: 'paragraph',
        isLead: true,
        content:
          'Complex automated manufacturing cells featuring synchronized robotic manipulators and pneumatic transfer stations present unique stored energy hazards. Traditional single-point disconnects are inadequate for modern industrial facilities requiring rapid maintenance changeovers.',
      },
      {
        id: 'block-h2-1',
        type: 'heading',
        level: 2,
        content: 'Multi-Energy Source Isolation Architecture',
      },
      {
        id: 'block-p-2',
        type: 'paragraph',
        content:
          'Effective hazardous energy control requires isolating not only electrical power supplies, but also hydraulic accumulators, compressed air reservoirs, and gravitational potential in suspended mechanical arms.',
      },
      {
        id: 'block-callout-1',
        type: 'callout',
        calloutType: 'safety',
        calloutTitle: 'Mandatory Safety Rule: Zero Energy State Verification',
        calloutBody:
          'Never proceed with physical servicing until mechanical interlocks, bleed-off valves, and certified voltage detectors confirm complete discharge of all residual stored kinetic and electric energy.',
      },
    ],
  },
  {
    title: 'Project Alpha: Overcoming Structural Challenges in Seismic Zones',
    slug: 'project-alpha-overcoming-structural-challenges-seismic-zones',
    summary:
      'A detailed review of the engineering solutions applied during the construction of a heavy manufacturing facility on a major fault line.',
    bannerImageUrl: '/assets/quality-precision-hero.jpg',
    bannerAlt: 'Structural Bracing in Seismic Zone Construction',
    bannerCaption: 'Fig 1. High-ductility moment frame connections on fault-line industrial manufacturing plant.',
    category: 'Case Studies',
    tags: ['Case Studies', 'Seismic Design', 'Structural Steel', 'Moment Frames'],
    author: {
      name: 'Structural Engineering Review Board',
      role: 'Senior Project Principal',
    },
    status: 'Published',
    featured: false,
    readTimeMinutes: 7,
    publishedAt: new Date('2024-09-28T14:15:00.000Z'),
    seo: {
      metaTitle: 'Project Alpha: Overcoming Structural Challenges in Seismic Zones',
      metaDescription:
        'A detailed review of engineering solutions applied during construction of heavy manufacturing facilities in fault zones.',
    },
    content: [
      {
        id: 'block-p-1',
        type: 'paragraph',
        isLead: true,
        content:
          'Constructing a 45,000-square-meter heavy manufacturing facility within 12 kilometers of an active strike-slip fault required a radical reimagining of column-beam joints and bracing geometry. Traditional rigid moment frames were replaced with Buckling-Restrained Braced Frames (BRBFs) to absorb cyclic energy without catastrophic fracture.',
      },
      {
        id: 'block-h2-1',
        type: 'heading',
        level: 2,
        content: 'Seismic Dissipation & Reduced Beam Sections (RBS)',
      },
      {
        id: 'block-p-2',
        type: 'paragraph',
        content:
          'By introducing dog-bone profile cutouts in beam flanges adjacent to columns, plastic hinging is intentionally concentrated away from the primary weld interface. This preserves column integrity during high-intensity ground accelerations.',
      },
      {
        id: 'block-callout-1',
        type: 'callout',
        calloutType: 'note',
        calloutTitle: 'Case Milestone: Cyclic Testing Validation',
        calloutBody:
          'Prototype full-scale joints withstood 30 complete drift cycles up to 0.04 radians without beam web tearing or weld fracture, exceeding AISC 341-22 seismic qualification criteria.',
      },
    ],
  },
];

export async function ensureInitialBlogsSeeded() {
  try {
    // 1. Ensure Categories exist
    const catCount = await BlogCategory.countDocuments();
    if (catCount === 0) {
      await BlogCategory.insertMany(INITIAL_BLOG_CATEGORIES);
      console.log('[BlogSeeder] Successfully initialized BlogCategories in MongoDB.');
    }

    // 2. Ensure Blogs exist
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      // Fetch category IDs to link properly
      const categories = await BlogCategory.find();
      const catMap = {};
      categories.forEach((c) => {
        catMap[c.name.toLowerCase()] = c._id;
      });

      const blogsToInsert = INITIAL_REAL_BLOGS.map((b) => ({
        ...b,
        categoryId: catMap[b.category.toLowerCase()] || null,
      }));

      await Blog.insertMany(blogsToInsert);
      console.log(`[BlogSeeder] Successfully seeded ${blogsToInsert.length} real industrial technical blogs into MongoDB.`);
    }
  } catch (err) {
    console.warn(`[BlogSeeder] Notice: ${err.message}`);
  }
}
