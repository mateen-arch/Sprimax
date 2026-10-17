import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Enquiry from './models/Enquiry.js';
import ProjectRequirement from './models/ProjectRequirement.js';

dotenv.config();

const sampleEnquiries = [
  // ==========================================
  // 1. PRODUCT ENQUIRIES
  // ==========================================
  {
    companyName: 'Apex Heavy Infrastructure Ltd',
    contactName: 'Marcus Vance',
    email: 'm.vance@apex-infra.com',
    phone: '+1 (412) 555-8921',
    enquiryType: 'Product Enquiry',
    skuOrClass: 'SAW-F7A2-25KG',
    productInterested: 'Submerged Arc Combination Wire & Flux F7A2-EM12K',
    projectScope: 'High-Volume OEM',
    quantity: '12,500',
    unit: 'KG',
    requiredDate: '2026-11-15',
    application: 'Longitudinal seam welding for heavy structural column sections',
    specifications: 'AWS A5.17 F7A2-EM12K, Charpy impact >= 47J at -29°C with ABS 3YM approval certificates.',
    message: 'Looking for prompt CIF delivery to Houston Port. Need batch test certificates with full chemical analysis before shipment dispatch.',
    status: 'New',
    referenceCode: 'ENQ-PRD-8102',
  },
  {
    companyName: 'Gulf Coast Marine Fabricators',
    contactName: 'Elena Rostova',
    email: 'e.rostova@gulfmarinefab.com',
    phone: '+1 (713) 555-4390',
    enquiryType: 'Product Enquiry',
    skuOrClass: 'TDS-71T1-24',
    productInterested: 'WeldCore 71T-1 Gas-Shielded Flux Cored Wire',
    projectScope: 'Standard Production',
    quantity: '3,000',
    unit: 'KG',
    requiredDate: '2026-11-01',
    application: 'Offshore platform jacket bracing welds in 3G/4G positions',
    specifications: 'AWS A5.20 E71T-1M, DNV-GL III YMS certified, vacuum-sealed spool packaging.',
    message: 'Require 200 spools of 15kg wire. Please provide volume pricing and freight timeline to Galveston shipyard.',
    status: 'Processing',
    referenceCode: 'ENQ-PRD-6721',
  },
  {
    companyName: 'Pinnacle Pressure Vessels Corp',
    contactName: 'David K. Hoffman',
    email: 'dhoffman@pinnacle-pv.com',
    phone: '+1 (330) 555-9014',
    enquiryType: 'Product Enquiry',
    skuOrClass: 'SMAW-E7018-1-5KG',
    productInterested: 'SPRIMAX UltraClean 7018-1 H4R Low Hydrogen Electrode',
    projectScope: 'Urgent Maintenance',
    quantity: '1,500',
    unit: 'KG',
    requiredDate: '2026-10-25',
    application: 'Boiler drum repair welds and nozzle attachment in ASME Sec VIII refinery reactor',
    specifications: 'ASME SFA 5.1 E7018-1 H4R, diffusible hydrogen < 3.0 ml/100g, moisture-resistant hermetic cans.',
    message: 'Urgent requirement for scheduled turnaround maintenance next week. Need immediate dispatch confirmation.',
    status: 'Quoted',
    referenceCode: 'ENQ-PRD-4490',
  },

  // ==========================================
  // 2. DEALER ENQUIRIES
  // ==========================================
  {
    companyName: 'Nordic Welding Supplies AS',
    contactName: 'Lars Lindqvist',
    email: 'lars@nordicwelding.no',
    phone: '+47 22 55 98 00',
    enquiryType: 'Dealer Enquiry',
    businessType: 'Industrial Supply Chain',
    primaryLocation: 'Oslo, Norway (Scandinavia Hub)',
    yearsInBusiness: '10+',
    currentProductRange: 'MIG/TIG Equipment, Gas Regulators, Personal Protective Equipment, Plasma Cutters',
    message: 'We operate 8 regional distribution warehouses across Norway and Sweden servicing the North Sea maritime and offshore wind sector. We want to become the exclusive regional distributor for Sprimax flux-cored and submerged arc consumables.',
    status: 'New',
    referenceCode: 'ENQ-DLR-3011',
  },
  {
    companyName: 'Midwest Industrial Arc & Gas Distribution',
    contactName: 'Sarah Jenkins',
    email: 'sjenkins@midwestindustrialarc.com',
    phone: '+1 (312) 555-7281',
    enquiryType: 'Dealer Enquiry',
    businessType: 'Regional Wholesaler',
    primaryLocation: 'Chicago, Illinois, USA',
    yearsInBusiness: '6-10',
    currentProductRange: 'Bulk welding wires, shielding gases, robotic automation cells, grinding abrasives',
    message: 'Looking to expand our catalog with Sprimax heavy structural fabrication consumables. We have 14 direct field sales engineers covering Illinois, Indiana, and Wisconsin with annual consumable throughput exceeding $18M.',
    status: 'Processing',
    referenceCode: 'ENQ-DLR-5120',
  },
  {
    companyName: 'Al-Bahar Heavy Welding Equipment LLC',
    contactName: 'Tariq Al-Mansoor',
    email: 'tariq.mansoor@albaharwelding.ae',
    phone: '+971 4 332 9901',
    enquiryType: 'Dealer Enquiry',
    businessType: 'Welding Equipment Specialist',
    primaryLocation: 'Dubai & Abu Dhabi, United Arab Emirates',
    yearsInBusiness: '10+',
    currentProductRange: 'Pipeline welding tractors, SAW power sources, orbital TIG systems, SMAW consumables',
    message: 'We supply Tier-1 EPC contractors for ADNOC and Saudi Aramco offshore pipeline and tank farm installations. Seeking stocking distributorship agreement for Sprimax SAW fluxes and low-hydrogen electrodes.',
    status: 'Approved',
    referenceCode: 'ENQ-DLR-9043',
  },

  // ==========================================
  // 3. TECHNICAL SUPPORT
  // ==========================================
  {
    companyName: 'Stellar Aerospace Structures Inc',
    contactName: 'Dr. Gregory Hayes',
    email: 'ghayes@stellar-aero.com',
    phone: '+1 (206) 555-6672',
    enquiryType: 'Technical Support',
    subject: 'Metallurgical Testing / Hydrogen Embrittlement Qualification',
    industry: 'Aerospace & Defense',
    skuOrClass: 'WPS-AERO-TITANIUM',
    productInterested: 'Aerospace Grade Consumables',
    message: 'We are qualifying an orbital TIG welding procedure on Inconel 718 and high-strength titanium alloy assemblies. We need your engineering team to verify shielding gas dew-point thresholds and micro-hardness profiles across the heat-affected zone (HAZ) per AMS 5837.',
    status: 'New',
    referenceCode: 'ENQ-TEC-7714',
  },
  {
    companyName: 'Atlantic Shipyard & Drydock Ltd',
    contactName: 'Chief Metallurgist Colin Campbell',
    email: 'c.campbell@atlantic-drydock.co.uk',
    phone: '+44 141 555 0192',
    enquiryType: 'Technical Support',
    subject: 'Welding Procedure Qualification (WPS / PQR Assistance)',
    industry: 'Shipbuilding & Marine',
    skuOrClass: 'SAW-F7A2-EM12K',
    productInterested: 'F7A2-EM12K Submerged Arc Wire & Flux',
    message: 'Observing slight chevron slag entrapment when running twin-arc submerged arc at 750A on 45mm EH36 grade shipbuilding plate. Requesting parameter tuning recommendations for flux depth, electrode stick-out, and interpass cooling parameters.',
    status: 'Processing',
    referenceCode: 'ENQ-TEC-2983',
  },
  {
    companyName: 'Vulcan Thermal Boilers & Engineering',
    contactName: 'Robert Chang',
    email: 'rchang@vulcan-boilers.com',
    phone: '+1 (514) 555-8833',
    enquiryType: 'Technical Support',
    subject: 'Product Specifications / Data Sheets Compliance',
    industry: 'Pressure Vessels & Boilers',
    skuOrClass: 'SMAW-E7018-1-5KG',
    productInterested: 'UltraClean 7018-1 H4R',
    message: 'Our client inspector requires mill test reports (MTR) including EN 10204 Type 3.1 certification and batch Charpy V-notch values tested down to -45°C. Please send updated compliance documents signed by your metallurgical laboratory.',
    status: 'Resolved',
    referenceCode: 'ENQ-TEC-1150',
  },

  // ==========================================
  // 4. PROJECT REQUIREMENTS
  // ==========================================
  {
    companyName: 'Daewoo Marine & Offshore Construction',
    contactName: 'Min-Soo Park',
    email: 'mspark@dmoc-shipyard.kr',
    phone: '+82 55 680 1100',
    enquiryType: 'Project Requirement',
    referenceCode: 'REQ-3496507838',
    projectName: 'FPSO Hull Plate Joining Test',
    industryName: 'Shipbuilding & Marine',
    industrySlug: 'shipbuilding-marine',
    primaryLocation: 'Geoje Shipyard, South Korea',
    baseMaterials: 'NV E36, NV E40, DH36 Naval Steel Plates (40mm - 75mm)',
    weldingProcess: 'Submerged Arc Welding (Tandem Wire) & FCAW-G',
    standards: 'DNV-OS-C401, IACS W17, AWS D1.1',
    estimatedVolume: '140 Metric Tons Consumables',
    targetDeliveryDate: '2027-02-15',
    projectScopeDetails: 'Full hull girder fabrication for Ultra-Deepwater FPSO turret unit. Consumables must guarantee sub-zero CTOD fracture toughness at -40°C in post-weld heat treated (PWHT) conditions.',
    message: 'Full hull girder fabrication for Ultra-Deepwater FPSO turret unit. Consumables must guarantee sub-zero CTOD fracture toughness at -40°C in post-weld heat treated (PWHT) conditions.',
    status: 'New',
  },
  {
    companyName: 'Trans-Eurasia Energy Pipeline Consortium',
    contactName: 'Viktor Orlov',
    email: 'v.orlov@te-pipeline.com',
    phone: '+43 1 710 4420',
    enquiryType: 'Project Requirement',
    referenceCode: 'REQ-8891204419',
    projectName: 'Northern Corridor Gas Trunkline Expansion',
    industryName: 'Oil & Gas and Pipeline',
    industrySlug: 'oil-gas-pipeline',
    primaryLocation: 'Baku - Tbilisi - Ceyhan Pipeline Sector',
    baseMaterials: 'API 5L Grade X70 & X80 High-Yield Pipeline Steel',
    weldingProcess: 'Mechanized Internal/External GMAW & Cellulosic SMAW Root',
    standards: 'API 1104 22nd Edition, DNV-ST-F101 Submarine Pipeline Systems',
    estimatedVolume: '85 Metric Tons High-Strength Solid Wire & E8010-P1 Electrodes',
    targetDeliveryDate: '2027-04-30',
    projectScopeDetails: 'Cross-country 48-inch pipeline laying across high-seismic mountainous terrain. Requirements include low yield-to-tensile ratio and overmatching weld metal with maximum hardness below 250 HV10.',
    message: 'Cross-country 48-inch pipeline laying across high-seismic mountainous terrain. Requirements include low yield-to-tensile ratio and overmatching weld metal with maximum hardness below 250 HV10.',
    status: 'In Review',
  },
  {
    companyName: 'Metropolitan Rapid Transit Authority',
    contactName: 'Samantha Brooks, P.E.',
    email: 'sbrooks@mrta-transit.gov',
    phone: '+1 (212) 555-3419',
    enquiryType: 'Project Requirement',
    referenceCode: 'REQ-5510294812',
    projectName: 'Harbor Narrows Suspension Bridge Retrofit',
    industryName: 'Heavy Engineering & Structural Steel',
    industrySlug: 'heavy-engineering',
    primaryLocation: 'New York Harbor, USA',
    baseMaterials: 'A709 Grade 50W Weathering Steel & High-Toughness Box Girders',
    weldingProcess: 'Flux Cored Arc Welding (FCAW) Self-Shielded & Gas-Shielded',
    standards: 'AASHTO/AWS D1.5M/D1.5 Bridge Welding Code (Fracture Critical Members FCM)',
    estimatedVolume: '45 Metric Tons Weathering Steel Consumables',
    targetDeliveryDate: '2027-01-15',
    projectScopeDetails: 'Complete seismic orthotropic steel deck replacement and main tower stay cable anchor bracket reinforcements. Atmospheric corrosion resistant weathering steel consumables required with CVN impact >= 50J at -20°F.',
    message: 'Complete seismic orthotropic steel deck replacement and main tower stay cable anchor bracket reinforcements. Atmospheric corrosion resistant weathering steel consumables required with CVN impact >= 50J at -20°F.',
    status: 'Quoted',
  },
];

async function seed() {
  try {
    await connectDB();
    console.log('Clearing existing enquiries...');
    await Enquiry.deleteMany({});

    console.log(`Inserting ${sampleEnquiries.length} categorized enquiries...`);
    const inserted = await Enquiry.insertMany(sampleEnquiries);
    console.log(`Successfully seeded ${inserted.length} enquiries across all 4 types!`);

    // Also sync the ProjectRequirement collection if needed
    for (const enq of sampleEnquiries) {
      if (enq.enquiryType === 'Project Requirement') {
        const existingReq = await ProjectRequirement.findOne({ referenceNumber: enq.referenceCode });
        if (!existingReq) {
          await ProjectRequirement.create({
            referenceNumber: enq.referenceCode,
            industryName: enq.industryName,
            industrySlug: enq.industrySlug,
            projectName: enq.projectName,
            companyName: enq.companyName,
            contactPerson: enq.contactName,
            email: enq.email,
            phone: enq.phone,
            location: enq.primaryLocation,
            baseMaterials: enq.baseMaterials,
            weldingProcess: enq.weldingProcess,
            standards: enq.standards,
            estimatedVolume: enq.estimatedVolume,
            targetDeliveryDate: enq.targetDeliveryDate,
            projectScopeDetails: enq.projectScopeDetails,
            status: enq.status,
          });
          console.log(`Synced ProjectRequirement: ${enq.referenceCode}`);
        }
      }
    }

    console.log('Enquiries seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed enquiries:', err);
    process.exit(1);
  }
}

seed();
