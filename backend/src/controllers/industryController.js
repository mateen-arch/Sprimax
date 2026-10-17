import Industry from '../models/Industry.js';
import Product from '../models/Product.js';

// Pre-configured rich solutions presets for high-performance industrial sectors
const INDUSTRY_SOLUTIONS_PRESETS = {
  fabrication: {
    solutionHeadline: 'STRUCTURAL FABRICATION & HEAVY ASSEMBLY',
    solutionDescription:
      'Precision welding consumables, heavy-duty abrasives, and structural bonding solutions engineered for high-stress metalworking, heavy framework joining, and automated production lines.',
    complianceBadges: ['AWS D1.1', 'ISO 3834-2', 'EN 1090-2', 'ASME Sec IX'],
    hudGaugeLabel: 'DATA//DEPOSITION_EFFICIENCY_RATING',
    hudGaugePercent: 91,
    hudVerifiedText: 'HIGH-EFFICIENCY DEPOSITION QUALIFIED',
    challenges: [
      {
        title: 'HIGH-SPEED THIN & MEDIUM PLATE JOINING',
        text: 'Minimizing burn-through, spatter, and post-weld cleanup while maximizing arc travel speeds across repetitive fabrication joints.',
        recommendedSpec: 'Precision Solid MIG Wire ER70S-6 // Ultra-clean copper coat',
        statValue: '> 1.4 m/min',
        statLabel: 'Weld Travel Speed',
      },
      {
        title: 'DISTORTION & WARPAGE MITIGATION',
        text: 'Excessive heat input during multi-pass structural welding induces angular distortion and costly mechanical straightening.',
        recommendedSpec: 'Low Heat Input Basic Electrodes // High Deposition Rate',
        statValue: '< 15 kJ/cm',
        statLabel: 'Target Heat Input',
      },
      {
        title: 'SURFACE CONTAMINANT & MILL SCALE TOLERANCE',
        text: 'Mill scale, residual rust, and light oil layers causing porosity and poor sidewall fusion in structural workshop fabrication.',
        recommendedSpec: 'Deoxidized Metal-Cored & Rutile Flux-Cored Wires',
        statValue: 'ZERO POROSITY',
        statLabel: 'Radiographic Grade',
      },
    ],
  },
  construction: {
    solutionHeadline: 'CIVIL INFRASTRUCTURE & HIGH-RISE STRUCTURAL STEEL',
    solutionDescription:
      'High-deposition seismic-resistant consumables and all-position welding solutions designed for structural steel columns, bridge trusses, and seismic moment frames.',
    complianceBadges: ['AWS D1.1 (Seismic)', 'AISC 360', 'CWB W47.1', 'EN 1090-2'],
    hudGaugeLabel: 'DATA//SEISMIC_CHARPY_VNOTCH_VERIFIED',
    hudGaugePercent: 88,
    hudVerifiedText: 'SEISMIC DEMAND CRITICAL TESTED',
    challenges: [
      {
        title: 'SEISMIC REVERSAL & DYNAMIC TOUGHNESS',
        text: 'Demand for high Charpy V-Notch impact values in demand critical joints subject to cyclical earthquake stress.',
        recommendedSpec: 'FCAW-S / FCAW-G E71T-8 / E7018-1 // Toughness @ -40°C',
        statValue: '> 47 J @ -40°C',
        statLabel: 'Charpy Impact Energy',
      },
      {
        title: 'ALL-POSITION FIELD WELDING & WIND CONDITIONS',
        text: 'Open-air erection where shielding gas dispersion causes porosity and defect rejection on building sites.',
        recommendedSpec: 'Gasless Self-Shielded Flux-Cored Wire (FCAW-S)',
        statValue: 'UP TO 35 MPH',
        statLabel: 'Wind Tolerance Limit',
      },
      {
        title: 'DIFFUSIBLE HYDROGEN EMBRITTLEMENT',
        text: 'Moisture in field conditions leading to underbead cold cracking in heavy structural columns and thick base plates.',
        recommendedSpec: 'Moisture-Resistant H4R Vacuum-Packed Electrodes',
        statValue: '< 4 ml/100g',
        statLabel: 'Hydrogen Category H4R',
      },
    ],
  },
  'shipbuilding-marine': {
    solutionHeadline: 'NAVAL ARCHITECTURE & OFFSHORE MARINE ENGINEERING',
    solutionDescription:
      'Classification society certified submerged arc and flux-cored consumables engineered for high-deposition hull plating, offshore jackets, subsea pipelines, and harsh saltwater corrosion resistance.',
    complianceBadges: ['DNV-GL III YM', "Lloyd's Register 3YM", 'ABS 3Y400M', 'Bureau Veritas'],
    hudGaugeLabel: 'DATA//CTOD_FRACTURE_TOUGHNESS_PASS',
    hudGaugePercent: 94,
    hudVerifiedText: 'CLASS SOCIETY 3YM CERTIFIED',
    challenges: [
      {
        title: 'THICK HULL PLATING & HIGH DEPOSITION SAW',
        text: 'Joining 40mm-100mm high-tensile EH36 naval steel with full radiographic compliance and minimal distortion.',
        recommendedSpec: 'Submerged Arc Wire & Agglomerated Flux F7A2-EM12K',
        statValue: '> 12 kg/hr',
        statLabel: 'Deposition Rate',
      },
      {
        title: 'CRYOGENIC IMPACT & ARCTIC SEAWATER CORROSION',
        text: 'Exposure to sub-zero seawater conditions demanding microstructural crack-tip opening displacement (CTOD) resistance.',
        recommendedSpec: 'Ni-Alloyed Rutile Flux-Cored Wire (E81T1-Ni1M)',
        statValue: '> 60 J @ -50°C',
        statLabel: 'Sub-Zero Toughness',
      },
      {
        title: 'ROOT PASS RECTIFICATION IN NARROW GROOVES',
        text: 'One-sided welding with ceramic backing strips demanding clean slag detachment and smooth wetting.',
        recommendedSpec: 'Seamless Flux Cored Wire // Fast Freezing Slag',
        statValue: '100% UT PASS',
        statLabel: 'Ultrasonic Tested',
      },
    ],
  },
  'aerospace-defense': {
    solutionHeadline: 'AEROSPACE, DEFENSE & TURBINE PROPULSION',
    solutionDescription:
      'Ultra-high purity nickel, cobalt, and titanium TIG rods and fine-diameter wires designed for aero-engine combustors, tactical missile hulls, and high-temperature structural airframes.',
    complianceBadges: ['AMS 5837', 'AWS A5.14 ERNiCrMo-3', 'AS9100D', 'MIL-SPEC Certified'],
    hudGaugeLabel: 'DATA//VACUUM_INDUCTION_PURITY_METRIC',
    hudGaugePercent: 99,
    hudVerifiedText: 'AEROSPACE FLIGHT CRITICAL SPEC',
    challenges: [
      {
        title: 'HOT CRACKING IN EXOTIC SUPERALLOYS',
        text: 'Micro-fissuring and segregate formation during the solidification of Inconel, Hastelloy, and titanium aerospace alloys.',
        recommendedSpec: 'Triple-Deoxidized Grade Inconel 625 / ERNiCrMo-3',
        statValue: '> 1150°C',
        statLabel: 'Operating Thermal Limit',
      },
      {
        title: 'ZERO INTERSTITIAL GAS CONTAMINATION',
        text: 'Atmospheric oxygen and nitrogen pickup inducing brittle martensite and fatigue failure in flight-critical joints.',
        recommendedSpec: 'Vacuum Induction Melted (VIM) Ultra-High Purity TIG Wire',
        statValue: '< 15 ppm O2',
        statLabel: 'Purity Threshold',
      },
      {
        title: 'STRESS-RUPTURE & HIGH CYCLE FATIGUE',
        text: 'Combustor and exhaust components subject to intense cyclical acoustic vibrations and high G loads.',
        recommendedSpec: 'Solution Annealed High-Strength Solid Wire',
        statValue: '> 780 MPa',
        statLabel: 'Tensile Strength @ 650°C',
      },
    ],
  },
  'pressure-vessels-boilers': {
    solutionHeadline: 'PRESSURE VESSELS, BOILERS & SUPERCRITICAL STEAM',
    solutionDescription:
      'Radiographically clean, low-diffusible hydrogen consumables with exceptional creep-rupture strength for supercritical power boilers, chemical reactors, and ASME Section VIII vessels.',
    complianceBadges: ['ASME Section VIII Div 1 & 2', 'ASME Section IX', 'PED 2014/68/EU', 'AD 2000-Merkblatt'],
    hudGaugeLabel: 'DATA//CREEP_RUPTURE_RESISTANCE_CHECK',
    hudGaugePercent: 92,
    hudVerifiedText: 'ASME SEC IX CODE STAMP VERIFIED',
    challenges: [
      {
        title: 'CREEP RUPTURE AT SUPERCRITICAL TEMPERATURES',
        text: 'Cr-Mo creep-resistant alloy steels (P11, P22, P91) requiring strict X-Factor and Bruscato temper embrittlement control.',
        recommendedSpec: 'Low-Hydrogen Creep Resistant Electrode E9015-B91 / ER90S-B9',
        statValue: '< 12 ppm',
        statLabel: 'Bruscato Factor (X)',
      },
      {
        title: 'POST-WELD HEAT TREATMENT (PWHT) STABILITY',
        text: 'Maintaining high tensile ductility and Charpy toughness after prolonged stress-relief soaking cycles (750°C x 4h).',
        recommendedSpec: 'Basic Covered Low-Alloy Consumables',
        statValue: '> 550 MPa',
        statLabel: 'Yield Strength After PWHT',
      },
      {
        title: 'SEVERE CORROSION IN SOUR REFINERY SERVICE',
        text: 'H2S cracking and wet H2S step-wise cracking (NACE MR0175 / ISO 15156 compliance) in petrochemical reactors.',
        recommendedSpec: 'Stabilized 309LMo / 347 Overlays & Ni-Alloys',
        statValue: '< 22 HRC',
        statLabel: 'NACE Hardness Cap',
      },
    ],
  },
  'oil-gas': {
    solutionHeadline: 'OIL & GAS, SOUR-SERVICE & TRANSMISSION PIPELINES',
    solutionDescription:
      'High-productivity cellulosic and low-hydrogen consumables for cross-country linepipe, subsea sour-service risers, and high-integrity cryogenic LNG storage facilities.',
    complianceBadges: ['API 1104', 'NACE MR0175', 'ASME B31.3 / B31.8', 'DNV-ST-F101'],
    hudGaugeLabel: 'DATA//SOUR_SERVICE_NACE_COMPLIANCE',
    hudGaugePercent: 96,
    hudVerifiedText: 'NACE MR0175 HIC RESISTANT',
    challenges: [
      {
        title: 'HIGH-SPEED VERTICAL-DOWN PIPELINE WELDING',
        text: 'Cellulosic pipeline electrodes delivering fast travel speeds and deep root penetration for cross-country linepipe API 5L X65-X80.',
        recommendedSpec: 'Cellulosic Electrodes E6010 / E7010-P1 / E8010-P1',
        statValue: '> 2.2 m/min',
        statLabel: 'Root Pass Speed',
      },
      {
        title: 'SOUR SERVICE (HIC / SSCC) RESISTANCE',
        text: 'Resistance to hydrogen-induced cracking and stress corrosion in severe H2S environments meeting NACE standard.',
        recommendedSpec: 'Low Moisture Absorption E7018-1 H4R (< 3ml/100g H2)',
        statValue: '< 3 ml/100g',
        statLabel: 'Diffusible Hydrogen',
      },
      {
        title: 'CRYOGENIC LNG STORAGE IMPACT RESISTANCE',
        text: 'Welding 9% Ni steel tanks for liquefied natural gas storage requiring superior toughness at -196°C.',
        recommendedSpec: 'High-Nickel Austenitic / Inconel Consumables',
        statValue: '> 80 J @ -196°C',
        statLabel: 'Cryogenic Toughness',
      },
    ],
  },
  automotive: {
    solutionHeadline: 'AUTOMOTIVE MANUFACTURING & ROBOTIC ASSEMBLY',
    solutionDescription:
      'Spatter-free high-speed robotic GMAW wires, galvanized steel brazing alloys, and structural adhesives engineered for lightweight OEM body-in-white and chassis lines.',
    complianceBadges: ['ISO/TS 16949', 'AWS D8.8 (Automotive)', 'DIN EN ISO 14175', 'JASO Certified'],
    hudGaugeLabel: 'DATA//ROBOTIC_CONTINUOUS_FEED_CHECK',
    hudGaugePercent: 89,
    hudVerifiedText: 'AUTOMOTIVE OEM GRADE TESTED',
    challenges: [
      {
        title: 'ZINC-COATED & DUAL-PHASE HIGH STRENGTH STEEL',
        text: 'Explosive zinc vaporization through weld pool causing blowholes, spatter, and porosity on hot-dip galvanized sheet.',
        recommendedSpec: 'CuSi3 / CuAl8 MIG Brazing Wire & Metal-Cored Wires',
        statValue: 'ZERO BLOWHOLES',
        statLabel: 'Galvanized Grade',
      },
      {
        title: 'ROBOTIC CONTINUOUS FEEDABILITY',
        text: 'Arc wander and wire jamming in high-duty cycle robotic torches operating 24/7 across high-volume assembly lines.',
        recommendedSpec: 'Precision Layer Wound Copper-Free MIG Wire',
        statValue: '> 25 m/min',
        statLabel: 'Feed Wire Velocity',
      },
      {
        title: 'THIN GAUGE PANEL HEAT CONTROL',
        text: 'Preventing burn-through on 0.8mm-1.2mm automotive panels while maintaining high structural joint stiffness.',
        recommendedSpec: 'Controlled Short-Arc & Pulsed GMAW Consumables',
        statValue: '0.8 - 2.5 mm',
        statLabel: 'Sheet Thickness Range',
      },
    ],
  },
  'power-plants': {
    solutionHeadline: 'POWER GENERATION, THERMAL & NUCLEAR ENERGY',
    solutionDescription:
      'High-temperature creep-resistant alloys, dielectric fluids, and specialized nuclear-grade consumables engineered for extreme thermal cycling and high-radiation steam circuits.',
    complianceBadges: ['ASME Section III (Nuclear)', 'ASME Section I (Boilers)', 'RCC-M Certified', 'ISO 3834-2'],
    hudGaugeLabel: 'DATA//DELTA_FERRITE_CONTROL_INDEX',
    hudGaugePercent: 95,
    hudVerifiedText: 'NUCLEAR CODE ASME SEC III QUALIFIED',
    challenges: [
      {
        title: 'THERMAL FATIGUE & CYCLICAL THERMAL SHOCK',
        text: 'Frequent load-cycling in modern combined-cycle power turbines causing severe metallurgical micro-cracking.',
        recommendedSpec: 'Inconel 617 / Alloy 625 Matching Consumables',
        statValue: '> 950°C',
        statLabel: 'Thermal Shock Rating',
      },
      {
        title: 'NUCLEAR CODE COMPLIANCE & FERRITE CONTROL',
        text: 'Tight delta-ferrite control (FN 3-8) in austenitic stainless welds to avoid hot cracking and neutron embrittlement.',
        recommendedSpec: 'Controlled Ferrite 308L / 316L Nuclear Grade Rods',
        statValue: 'FN 4 - 7',
        statLabel: 'Delta Ferrite Range',
      },
      {
        title: 'DISSIMILAR METAL WELDS (DMW)',
        text: 'Joining ferritic alloy boiler tubes to austenitic superheater tubes with matching thermal expansion coefficients.',
        recommendedSpec: 'High-Nickel Transition Electrodes (ERNiCrFe-3)',
        statValue: '100% DUCTILITY',
        statLabel: 'Thermal Expansion Match',
      },
    ],
  },
  'heavy-engineering': {
    solutionHeadline: 'HEAVY ENGINEERING & HEAVY EQUIPMENT',
    solutionDescription:
      'Extreme-pressure consumables, robust machining wires, and low-hydrogen electrodes designed for thick-section joining, heavy mining draglines, and massive high-tensile components.',
    complianceBadges: ['AWS D1.1', 'ASME Sec IX', 'ISO 2560-A', "Lloyd's Reg"],
    hudGaugeLabel: 'DATA//YIELD_STRENGTH_REQUIREMENTS',
    hudGaugePercent: 85,
    hudVerifiedText: 'HIGH-INTEGRITY WELD VERIFIED',
    challenges: [
      {
        title: 'THICK SECTION WELDING',
        text: 'Joining massive plates requires high deposition rates and deep penetration while mitigating residual stress and distortion.',
        recommendedSpec: 'High-Strength Flux-Cored Wires (FCAW) // Multi-pass qualified',
        statValue: '> 9 kg/hr',
        statLabel: 'Deposition Velocity',
      },
      {
        title: 'DYNAMIC LOADING RESISTANCE',
        text: 'Structures subjected to cyclical stress, vibration, and impact demand exceptional fatigue strength and low-temperature toughness.',
        recommendedSpec: 'Low Alloy Electrodes // Impact tested @ -40°C',
        statValue: '> 54 J @ -40°C',
        statLabel: 'Dynamic Impact',
      },
      {
        title: 'HYDROGEN-INDUCED CRACKING (HIC)',
        text: 'High-strength steels are susceptible to cold cracking due to diffusible hydrogen. Extreme moisture control during consumable manufacturing and storage is critical.',
        recommendedSpec: 'Low Hydrogen Electrodes (H4R) // Vacuum Packed (VP)',
        statValue: '< 4 ml/100g',
        statLabel: 'Diffusible Hydrogen Limit',
      },
    ],
  },
};

// Helper to get enriched industry with fallback presets
function enrichIndustry(rawIndustry) {
  const obj = rawIndustry.toObject ? rawIndustry.toObject() : rawIndustry;
  const slug = (obj.slug || '').toLowerCase().trim();
  const preset =
    INDUSTRY_SOLUTIONS_PRESETS[slug] ||
    INDUSTRY_SOLUTIONS_PRESETS['heavy-engineering'];

  return {
    ...obj,
    solutionHeadline:
      obj.solutionHeadline || preset.solutionHeadline || `${obj.name.toUpperCase()} SOLUTIONS`,
    solutionDescription:
      obj.solutionDescription || preset.solutionDescription || obj.description,
    solutionBanner: obj.solutionBanner || obj.image,
    complianceBadges:
      obj.complianceBadges && obj.complianceBadges.length > 0
        ? obj.complianceBadges
        : preset.complianceBadges,
    hudGaugeLabel: obj.hudGaugeLabel || preset.hudGaugeLabel,
    hudGaugePercent: obj.hudGaugePercent || preset.hudGaugePercent,
    hudVerifiedText: obj.hudVerifiedText || preset.hudVerifiedText,
    challenges:
      obj.challenges && obj.challenges.length > 0
        ? obj.challenges
        : preset.challenges,
  };
}

// @desc    Get all industries with optional status/search filters and real-time product counts
// @route   GET /api/industries
// @access  Public
export const getIndustries = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { subtitle: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const industries = await Industry.find(query).sort('sortOrder');

    // Aggregate real-time product count per industry
    const productCounts = await Product.aggregate([
      { $unwind: '$industries' },
      { $group: { _id: '$industries', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    productCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const enrichedIndustries = industries.map((ind) => {
      const enriched = enrichIndustry(ind);
      return {
        ...enriched,
        mappedProductsCount: countMap[ind.name] || ind.mappedProductsCount || 0,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedIndustries.length,
      industries: enrichedIndustries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single industry by ID or Slug with mapped real-time products
// @route   GET /api/industries/:id
// @access  Public
export const getIndustryById = async (req, res, next) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const industry = await Industry.findOne(query);

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: 'Industry not found',
      });
    }

    const enriched = enrichIndustry(industry);

    // Query real mapped products for this industry
    const cleanPattern = (industry.name || '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .join('|');

    let mappedProducts = await Product.find({
      status: 'Active',
      $or: [
        { industries: { $regex: new RegExp(industry.slug.replace(/-/g, '.*'), 'i') } },
        { industries: { $regex: new RegExp(cleanPattern || industry.name, 'i') } },
      ],
    }).limit(6);

    // If fewer than 2 mapped, pull top active products so the solutions page always features real products
    if (mappedProducts.length < 2) {
      const fallbackProducts = await Product.find({ status: 'Active' })
        .sort('-createdAt')
        .limit(4);
      mappedProducts = fallbackProducts;
    }

    res.status(200).json({
      success: true,
      industry: enriched,
      mappedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new industry
// @route   POST /api/industries
// @access  Private/Admin
export const createIndustry = async (req, res, next) => {
  try {
    const {
      name,
      subtitle,
      slug,
      description,
      image,
      solutionHeadline,
      solutionDescription,
      solutionBanner,
      challenges,
      complianceBadges,
      hudGaugeLabel,
      hudGaugePercent,
      hudVerifiedText,
      sortOrder,
      status,
    } = req.body;

    const generatedSlug = slug
      ? slug.trim().toLowerCase()
      : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const industry = await Industry.create({
      name: name.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      slug: generatedSlug,
      description: description ? description.trim() : '',
      image: image || null,
      solutionHeadline: solutionHeadline || '',
      solutionDescription: solutionDescription || '',
      solutionBanner: solutionBanner || null,
      challenges: Array.isArray(challenges) ? challenges : [],
      complianceBadges: Array.isArray(complianceBadges) ? complianceBadges : [],
      hudGaugeLabel: hudGaugeLabel || 'DATA//YIELD_STRENGTH_REQUIREMENTS',
      hudGaugePercent: hudGaugePercent !== undefined ? Number(hudGaugePercent) : 85,
      hudVerifiedText: hudVerifiedText || 'HIGH-INTEGRITY WELD VERIFIED',
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 10,
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      industry: enrichIndustry(industry),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update industry
// @route   PUT /api/industries/:id
// @access  Private/Admin
export const updateIndustry = async (req, res, next) => {
  try {
    const industry = await Industry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: 'Industry not found',
      });
    }

    res.status(200).json({
      success: true,
      industry: enrichIndustry(industry),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete industry
// @route   DELETE /api/industries/:id
// @access  Private/Admin
export const deleteIndustry = async (req, res, next) => {
  try {
    const industry = await Industry.findByIdAndDelete(req.params.id);

    if (!industry) {
      return res.status(404).json({
        success: false,
        message: 'Industry not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Industry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
