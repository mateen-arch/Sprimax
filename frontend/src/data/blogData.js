import blogCncMilling from '../assets/blog-cnc-milling.jpg';
import blogWeldingDetail from '../assets/blog-welding-detail.jpg';
import blogPipingBlueprint from '../assets/blog-piping-blueprint.jpg';
import solutionHeavyEng from '../assets/solution-heavy-eng.jpg';
import qualityPrecisionHero from '../assets/quality-precision-hero.jpg';
import aboutWeldedJoint from '../assets/about-welded-joint.png';
import labChemicalAnalysis from '../assets/lab-chemical-analysis.jpg';
import productLh7018 from '../assets/product-lh7018.png';

export const BLOG_CATEGORIES = [
  { id: 'all', label: 'ALL TOPICS' },
  { id: 'metallurgy', label: 'METALLURGY' },
  { id: 'safety', label: 'SAFETY PROTOCOLS' },
  { id: 'case-studies', label: 'CASE STUDIES' },
  { id: 'technical-guides', label: 'TECHNICAL GUIDES' },
];

export const BLOG_ARTICLES = [
  {
    id: 'impact-of-hydrogen-on-structural-weld-integrity',
    slug: 'impact-of-hydrogen-on-structural-weld-integrity',
    title: 'The Impact of Hydrogen on Structural Weld Integrity',
    category: 'METALLURGY',
    categorySlug: 'metallurgy',
    date: '2023.10.24',
    formattedDate: 'October 24, 2023',
    author: 'Dr. Heinrich Vossen, Lead Metallurgist',
    readTime: '8 min read',
    image: blogWeldingDetail,
    figureCaption: 'Fig 1. Multi-pass fillet weld on high-strength structural steel.',
    excerpt:
      'Understanding the mechanics of hydrogen embrittlement and diffusible hydrogen control in high-tensile structural weld joints.',
    leadParagraph:
      'Hydrogen-induced cracking (HIC), also known as cold cracking, remains one of the most critical challenges in the fabrication of high-strength structural steels. Understanding the mechanics of hydrogen embrittlement is paramount for ensuring the long-term integrity of heavy industrial infrastructure.',
    sections: [
      {
        heading: 'The Mechanics of Embrittlement',
        paragraphs: [
          'During the welding process, moisture or organic compounds can break down in the intense heat of the arc, introducing atomic hydrogen into the molten weld pool. Because atomic hydrogen is highly mobile in the steel lattice at elevated temperatures, it rapidly diffuses into the heat-affected zone (HAZ) and the weld metal itself.',
          'As the welded joint cools below 200°C, the solubility of hydrogen in the ferritic/martensitic lattice drops precipitously. Entrapped atomic hydrogen recombines in micro-voids, crystal lattice dislocations, and grain boundaries, generating tremendous localized hydrostatic internal pressures that precipitate delayed brittle cleavage.',
        ],
        callout: {
          title: 'Pro Tip: Pre-Baking Consumables',
          text: 'Always store low-hydrogen electrodes in a holding oven at 120°C - 150°C. If exposed to atmosphere for prolonged periods, re-bake according to manufacturer specifications (typically 300°C - 350°C for 1-2 hours) before use to drive off absorbed moisture.',
        },
      },
      {
        heading: 'Critical Thresholds & Mitigation',
        paragraphs: [
          'The risk of cold cracking increases significantly when three conditions are simultaneously met: a susceptible microstructure (martensite or bainite), sufficient residual stress, and a critical concentration of diffusible hydrogen. Mitigation relies on controlling heat input, applying appropriate pre-heat, and strictly utilizing low-hydrogen consumables.',
        ],
        table: {
          headers: [
            'STEEL YIELD STRENGTH (MPA)',
            'MAX ALLOWABLE DIFFUSIBLE H2 (ML/100G)',
            'TYPICAL PRE-HEAT TEMP (°C)',
          ],
          rows: [
            ['≤ 355', '15.0', 'Ambient - 50'],
            ['355 - 460', '10.0', '50 - 100'],
            ['460 - 690', '5.0', '100 - 150'],
          ],
        },
      },
      {
        heading: 'Post-Weld Heat Treatment (PWHT) & Effusion',
        paragraphs: [
          'For thick structural sections exceeding 50mm, post-heating (hydrogen bake-out) at 200°C - 250°C immediately following welding allows diffusible hydrogen to effuse out of the weldment before harmful residual cooling stresses can cause intergranular cracking.',
        ],
      },
    ],
    featuredProduct: {
      name: 'E7018-1 H4R LOW-HYDROGEN ELECTRODE',
      sku: 'E7018-1',
      description: 'Ultra-low moisture absorption coating designed for critical high-yield structural fabrications and offshore standards.',
      image: productLh7018,
    },
    relatedArticleIds: [
      'pre-heating-strategies-thick-section-s355',
      'non-destructive-testing-phased-array-ultrasonic',
    ],
  },
  {
    id: 'advancements-in-high-tensile-steel-alloy-microstructures',
    slug: 'advancements-in-high-tensile-steel-alloy-microstructures',
    title: 'Advancements in High-Tensile Steel Alloy Microstructures for Heavy Duty Structural Beams',
    category: 'METALLURGY',
    categorySlug: 'metallurgy',
    date: '2024.10.15',
    formattedDate: 'October 15, 2024',
    author: 'Metallurgical R&D Division',
    readTime: '10 min read',
    image: blogCncMilling,
    figureCaption: 'Fig 1. Multi-axis precision machining of alloy steel structural node components.',
    isFeatured: true,
    excerpt:
      'An in-depth analysis of the latest thermal treatment processes designed to increase the yield strength of structural steel by 15% while mitigating brittle fracture risks in sub-zero environments.',
    leadParagraph:
      'Modern mega-infrastructure and heavy crane girders demand structural sections that provide exceptional yield strength without penalizing ductility or weldability. Recent breakthroughs in Thermo-Mechanical Controlled Processing (TMCP) and micro-alloying with niobium and titanium have unlocked unprecedented strength-to-weight ratios.',
    sections: [
      {
        heading: 'Grain Refinement through TMCP Cooling Gradients',
        paragraphs: [
          'By precisely regulating rolling reduction passes in the non-recrystallization austenite regime followed by accelerated laminar cooling, engineers can achieve ultra-fine ferrite grain sizes below 3 microns. This refined microstructure simultaneously enhances yield strength and lowers ductile-to-brittle transition temperatures.',
        ],
        callout: {
          title: 'Engineering Note: Carbon Equivalent Limits',
          text: 'Maintaining CEV (IIW) below 0.38 ensures outstanding field weldability without requiring excessive preheat temperatures, substantially lowering erection costs for structural contractors.',
        },
      },
      {
        heading: 'Sub-Zero Charpy V-Notch Impact Toughness',
        paragraphs: [
          'Heavy civil works in arctic and sub-zero offshore environments require verified impact absorption down to -50°C. Micro-alloyed additions eliminate coarse carbide precipitations that traditionally act as crack initiation sites under dynamic impact loading.',
        ],
        table: {
          headers: [
            'ALLOY GRADE',
            'MIN YIELD (MPA)',
            'CHARPY IMPACT @ -40°C (JOULES)',
            'WELDABILITY INDEX',
          ],
          rows: [
            ['SPR-S355ML', '355', '≥ 47 J', 'Excellent (Preheat Opt)'],
            ['SPR-S460ML', '460', '≥ 34 J', 'Strict Heat Control'],
            ['SPR-S690QL', '690', '≥ 30 J', 'Low-H2 Mandatory'],
          ],
        },
      },
    ],
    featuredProduct: {
      name: 'E7018-1 H4R LOW-HYDROGEN ELECTRODE',
      sku: 'E7018-1',
      description: 'Ultra-low moisture absorption coating designed for critical high-yield structural fabrications and offshore standards.',
      image: productLh7018,
    },
    relatedArticleIds: [
      'impact-of-hydrogen-on-structural-weld-integrity',
      'project-alpha-overcoming-structural-challenges-seismic-zones',
    ],
  },
  {
    id: 'fluid-dynamics-optimization-high-pressure-piping',
    slug: 'fluid-dynamics-optimization-high-pressure-piping',
    title: 'Fluid Dynamics Optimization in High-Pressure Piping Systems',
    category: 'TECHNICAL GUIDES',
    categorySlug: 'technical-guides',
    date: '2024.10.10',
    formattedDate: 'October 10, 2024',
    author: 'Industrial Fluid Systems Team',
    readTime: '6 min read',
    image: blogPipingBlueprint,
    figureCaption: 'Fig 1. Hydraulic schematics and CFD velocity gradient map for high-pressure industrial loop.',
    excerpt:
      'Addressing cavitation and flow restriction issues in industrial coolant loops through revised joint geometries and predictive modeling.',
    leadParagraph:
      'Cavitation and localized erosion in high-velocity piping loops represent major vectors of premature equipment failure. By deploying computational fluid dynamics (CFD) to analyze turbulence zones at elbows and reducer joints, engineering teams can optimize header geometries to preserve laminar boundary layers.',
    sections: [
      {
        heading: 'Boundary Layer Separation & Vorticity Reduction',
        paragraphs: [
          'Abrupt geometric changes in high-pressure steam and hydraulic lines trigger severe pressure drops that induce micro-vapor bubbles. When these bubbles collapse near the inner pipe wall, shockwaves exceeding 1,000 MPa erode the passivation layer, triggering cavitation-corrosion synergy.',
        ],
        callout: {
          title: 'Design Guideline: Long-Radius Elbows',
          text: 'Specify 3D or 5D bend radii instead of standard 1.5D fittings in lines with flow velocities exceeding 4.5 m/s to reduce localized shear stress by up to 40%.',
        },
      },
      {
        heading: 'Material Compatibility in Erosive Slurry Services',
        paragraphs: [
          'When fluid streams contain suspended particulate or chemical catalysts, joint backing rings and internal weld beads must be ground flush. Protruding weld root penetration acts as a turbulence promoter that accelerates local wall thinning.',
        ],
        table: {
          headers: ['FLOW VELOCITY (M/S)', 'RECOMMENDED BEND RADIUS', 'RECOMMENDED ALLOY', 'CFD PRESSURE DROP (KPA)'],
          rows: [
            ['< 2.5 m/s', '1.5D Standard', 'ASTM A106 Gr B', '12 kPa'],
            ['2.5 - 5.0 m/s', '3.0D Long Sweep', 'ASTM A335 P11', '24 kPa'],
            ['> 5.0 m/s', '5.0D Induction Bend', 'ASTM A312 TP316L', '38 kPa'],
          ],
        },
      },
    ],
    featuredProduct: {
      name: 'ER70S-6 SOLID MIG WIRE',
      sku: 'ER70S-6',
      description: 'High-deoxidizer mild steel welding wire engineered for smooth root pass penetration in pipe spool fabrication.',
      image: productLh7018,
    },
    relatedArticleIds: [
      'revised-lockout-tagout-procedures-automated-assembly-lines',
      'impact-of-hydrogen-on-structural-weld-integrity',
    ],
  },
  {
    id: 'revised-lockout-tagout-procedures-automated-assembly-lines',
    slug: 'revised-lockout-tagout-procedures-automated-assembly-lines',
    title: 'Revised Lockout-Tagout (LOTO) Procedures for Automated Assembly Lines',
    category: 'SAFETY PROTOCOLS',
    categorySlug: 'safety',
    date: '2024.10.05',
    formattedDate: 'October 05, 2024',
    author: 'Occupational Safety & Plant Operations',
    readTime: '5 min read',
    image: solutionHeavyEng,
    figureCaption: 'Fig 1. Tiered zero-energy verification protocol at multi-axis robotic workstation.',
    excerpt:
      'Implementing a tiered access control system to reduce maintenance-related safety incidents while minimizing downtime.',
    leadParagraph:
      'Complex automated manufacturing cells featuring synchronized robotic manipulators and pneumatic transfer stations present unique stored energy hazards. Traditional single-point disconnects are inadequate for modern industrial facilities requiring rapid maintenance changeovers.',
    sections: [
      {
        heading: 'Multi-Energy Source Isolation Architecture',
        paragraphs: [
          'Effective hazardous energy control requires isolating not only electrical power supplies, but also hydraulic accumulators, compressed air reservoirs, and gravitational potential in suspended mechanical arms.',
        ],
        callout: {
          title: 'Mandatory Safety Rule: Zero Energy State Verification',
          text: 'Never proceed with physical servicing until mechanical interlocks, bleed-off valves, and certified voltage detectors confirm complete discharge of all residual stored kinetic and electric energy.',
        },
      },
      {
        heading: 'Digital Smart Lockouts & Tagging Compliance',
        paragraphs: [
          'Integrating RFID-tagged personal safety padlocks with the supervisory PLC system prevents machine reset until all technicians log out of the active maintenance perimeter.',
        ],
        table: {
          headers: ['ENERGY TYPE', 'ISOLATION DEVICE', 'VERIFICATION PROCEDURE', 'SECONDARY RESTRAINTS'],
          rows: [
            ['Electrical (480V 3Ø)', 'Rotary Disconnect Switch', 'Calibrated Multimeter Check', 'Padlock with Danger Tag'],
            ['Pneumatic (7 Bar)', 'Exhaust Ball Valve', 'In-Line Pressure Gauge = 0', 'Air Line Lockout Hasp'],
            ['Hydraulic (210 Bar)', 'Manual Pressure Relief Valve', 'Digital Transducer Readout', 'Mechanical Cylinder Stop Pin'],
          ],
        },
      },
    ],
    featuredProduct: {
      name: 'E7018-1 H4R LOW-HYDROGEN ELECTRODE',
      sku: 'E7018-1',
      description: 'Heavy industrial grade consumables meeting stringent safety and reliability compliance standards.',
      image: productLh7018,
    },
    relatedArticleIds: [
      'project-alpha-overcoming-structural-challenges-seismic-zones',
      'fluid-dynamics-optimization-high-pressure-piping',
    ],
  },
  {
    id: 'project-alpha-overcoming-structural-challenges-seismic-zones',
    slug: 'project-alpha-overcoming-structural-challenges-seismic-zones',
    title: 'Project Alpha: Overcoming Structural Challenges in Seismic Zones',
    category: 'CASE STUDIES',
    categorySlug: 'case-studies',
    date: '2024.09.28',
    formattedDate: 'September 28, 2024',
    author: 'Structural Engineering Review Board',
    readTime: '7 min read',
    image: qualityPrecisionHero,
    figureCaption: 'Fig 1. High-ductility moment frame connections on fault-line industrial manufacturing plant.',
    excerpt:
      'A detailed review of the engineering solutions applied during the construction of a heavy manufacturing facility on a major fault line.',
    leadParagraph:
      'Constructing a 45,000-square-meter heavy manufacturing facility within 12 kilometers of an active strike-slip fault required a radical reimagining of column-beam joints and bracing geometry. Traditional rigid moment frames were replaced with Buckling-Restrained Braced Frames (BRBFs) to absorb cyclic energy without catastrophic fracture.',
    sections: [
      {
        heading: 'Seismic Dissipation & Reduced Beam Sections (RBS)',
        paragraphs: [
          'By introducing dog-bone profile cutouts in beam flanges adjacent to columns, plastic hinging is intentionally concentrated away from the primary weld interface. This preserves column integrity during high-intensity ground accelerations.',
        ],
        callout: {
          title: 'Case Milestone: Cyclic Testing Validation',
          text: 'Prototype full-scale joints withstood 30 complete drift cycles up to 0.04 radians without beam web tearing or weld fracture, exceeding AISC 341-22 seismic qualification criteria.',
        },
      },
      {
        heading: 'Weld Toughness & Demand Critical Specifications',
        paragraphs: [
          'All full-penetration groove welds in seismic load paths were executed using low-hydrogen consumables certified for minimum Charpy V-Notch toughness of 27 J at -29°C and 54 J at 21°C.',
        ],
        table: {
          headers: ['CONNECTION TYPE', 'SEISMIC DRIFT CAPACITY', 'CVN TOUGHNESS @ -29°C', 'NDT INSPECTION PROTOCOL'],
          rows: [
            ['RBS Moment Joint', '0.045 rad (4.5% drift)', '≥ 54 Joules', '100% Phased Array UT'],
            ['BRBF Gusset Plate', '0.050 rad (5.0% drift)', '≥ 40 Joules', '100% Magnetic Particle + UT'],
            ['Base Plate Anchor', '0.035 rad (3.5% drift)', '≥ 35 Joules', '100% Ultrasonic Testing'],
          ],
        },
      },
    ],
    featuredProduct: {
      name: 'E7018-1 H4R LOW-HYDROGEN ELECTRODE',
      sku: 'E7018-1',
      description: 'Ultra-low moisture absorption coating designed for critical high-yield structural fabrications and offshore standards.',
      image: productLh7018,
    },
    relatedArticleIds: [
      'advancements-in-high-tensile-steel-alloy-microstructures',
      'impact-of-hydrogen-on-structural-weld-integrity',
    ],
  },
  {
    id: 'pre-heating-strategies-thick-section-s355',
    slug: 'pre-heating-strategies-thick-section-s355',
    title: 'Pre-Heating Strategies for Thick-Section S355',
    category: 'METALLURGY',
    categorySlug: 'metallurgy',
    date: '2024.09.12',
    formattedDate: 'September 12, 2024',
    author: 'Metallurgy Dept',
    readTime: '6 min read',
    image: aboutWeldedJoint,
    figureCaption: 'Fig 1. Induction heating band array on 80mm S355 structural steel flange.',
    excerpt:
      'Thermal gradient modeling to prevent rapid quenching and hydrogen accumulation in thick plate welding.',
    leadParagraph:
      'Thick plates (>40mm) act as massive heat sinks that accelerate weld cooling rates ($t_{8/5}$), promoting hard and brittle martensitic transformations in the coarse-grained heat-affected zone (CGHAZ). Applying controlled preheat and interpass temperatures is the single most effective defense.',
    sections: [
      {
        heading: 'Calculating Minimum Preheat Temperature ($T_p$)',
        paragraphs: [
          'Based on EN 1011-2 Method B, preheat temperature depends on the carbon equivalent ($CET$), combined thickness, and hydrogen scale ($HDM$). For S355 steel with thickness above 60mm, a minimum preheat of 100°C is required to keep $t_{8/5}$ above critical threshold limits.',
        ],
      },
    ],
    featuredProduct: {
      name: 'E7018-1 H4R LOW-HYDROGEN ELECTRODE',
      sku: 'E7018-1',
      description: 'Ultra-low moisture absorption coating designed for critical high-yield structural fabrications.',
      image: productLh7018,
    },
    relatedArticleIds: [
      'impact-of-hydrogen-on-structural-weld-integrity',
      'advancements-in-high-tensile-steel-alloy-microstructures',
    ],
  },
  {
    id: 'non-destructive-testing-phased-array-ultrasonic',
    slug: 'non-destructive-testing-phased-array-ultrasonic',
    title: 'Non-Destructive Testing: Phased Array Ultrasonic',
    category: 'TECHNICAL GUIDES',
    categorySlug: 'technical-guides',
    date: '2024.08.28',
    formattedDate: 'August 28, 2024',
    author: 'Quality Assurance Team',
    readTime: '9 min read',
    image: labChemicalAnalysis,
    figureCaption: 'Fig 1. Real-time S-scan sectorial beam visualization detecting lack of side-wall fusion.',
    excerpt:
      'Comparing Phased Array Ultrasonic Testing (PAUT) with conventional radiography for structural weld inspection.',
    leadParagraph:
      'Phased Array Ultrasonic Testing (PAUT) has rapidly replaced radiographic inspection across heavy fabrication facilities due to superior volumetric defect sizing, lack of ionizing radiation hazards, and instantaneous sectorial scan displays.',
    sections: [
      {
        heading: 'S-Scan Multi-Angle Defect Characterization',
        paragraphs: [
          'By electronically pulsing 64 to 128 individual piezo-composite transducer elements with microsecond time delays, PAUT sweeps ultrasonic sound waves through angles from 40° to 70° without physical probe repositioning. This enables 100% coverage of the weld bevel and heat-affected zone.',
        ],
      },
    ],
    featuredProduct: {
      name: 'ER70S-6 SOLID MIG WIRE',
      sku: 'ER70S-6',
      description: 'Premium copper-coated MIG wire ensuring high weld bead cleanliness and zero slag entrapment.',
      image: productLh7018,
    },
    relatedArticleIds: [
      'impact-of-hydrogen-on-structural-weld-integrity',
      'project-alpha-overcoming-structural-challenges-seismic-zones',
    ],
  },
];
