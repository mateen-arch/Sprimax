import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import SolutionPage from './models/SolutionPage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const heavyEngineeringSolution = {
  title: 'Heavy Engineering',
  slug: 'heavy-engineering',
  status: 'Published',
  publishedAt: new Date(),
  breadcrumb: [
    { label: 'Company', url: '/company' },
    { label: 'Heavy Engineering', url: '/solutions/heavy-engineering' },
  ],
  seo: {
    title: 'Heavy Engineering & Structural Steel Welding Solutions | Sprimax',
    metaDescription:
      'Engineered welding consumables and metallurgical solutions for heavy equipment, thick section structural steel, and high-impact applications.',
    ogImage: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
  },
  sections: [
    {
      id: 'sec-hero-1',
      type: 'hero',
      order: 0,
      visible: true,
      data: {
        eyebrowTag: 'INDUSTRY SOLUTIONS // HEAVY ENGINEERING',
        heading: 'HEAVY ENGINEERING & HEAVY EQUIPMENT',
        description:
          'Engineered welding solutions for extreme load-bearing structures, mining equipment, pressure vessels, and heavy manufacturing. Designed to withstand severe dynamic stress, cyclic fatigue, and hydrogen embrittlement.',
        primaryCta: {
          label: 'SUBMIT PROJECT REQUIREMENTS',
          url: '/submit-requirements',
          openInNewTab: false,
        },
        secondaryCta: {
          label: 'VIEW TECHNICAL DOCS',
          url: '/resources',
          openInNewTab: false,
        },
        image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
        imageAlt: 'Heavy Engineering & Heavy Equipment Applications',
        imageOverlayCard: {
          enabled: true,
          label: 'DATA//YIELD_STRENGTH_REQUIREMENTS',
          progressPercent: 82,
          caption: 'HIGH-INTEGRITY WELD VERIFIED',
        },
      },
    },
    {
      id: 'sec-challenges-2',
      type: 'challenges',
      order: 1,
      visible: true,
      data: {
        heading: 'CHALLENGES & SOLUTIONS',
        sectionLabel: 'SEC // 02',
        cards: [
          {
            id: 'card-1',
            title: 'THICK SECTION WELDING',
            icon: 'AlertTriangle',
            description:
              'Joining structural steels exceeding 50mm thickness presents acute risks of high residual stresses, uneven thermal dissipation, and severe root cracking.',
            specLabel: 'RECOMMENDED SPECIFICATION',
            specText: 'Low-hydrogen basic-coated consumables with preheat controls (AWS E7018-1 / E8018-G).',
            metricValue: '> 9 kg/hr',
            metricLabel: 'Deposition Velocity',
            layout: 'half',
          },
          {
            id: 'card-2',
            title: 'EXTREME IMPACT TOUGHNESS',
            icon: 'Shield',
            description:
              'Heavy earthmoving and mining excavators endure sub-zero shock loading requiring minimum CVN impact values of 47J at -40°C without micro-fracture propagation.',
            specLabel: 'RECOMMENDED SPECIFICATION',
            specText: 'Micro-alloyed nickel flux-cored wires (E81T1-Ni1M-JH4) with verified Charpy V-Notch properties.',
            metricValue: '47J @ -40°C',
            metricLabel: 'CVN Toughness',
            layout: 'half',
          },
          {
            id: 'card-3',
            title: 'HYDROGEN-INDUCED CRACKING (HIC)',
            icon: 'Flame',
            description:
              'High-yield structural alloys (S690QL, Weldox 700) are vulnerable to diffusible hydrogen penetration in humid ambient conditions, causing catastrophic delayed cracking.',
            specLabel: 'RECOMMENDED SPECIFICATION',
            specText:
              'Ultra-low diffusible hydrogen consumables (H4 / <4ml per 100g deposited weld metal) with hermetically sealed vacuum packaging.',
            metricValue: '< 3 ml/100g',
            metricLabel: 'Diffusible H2',
            layout: 'full',
          },
        ],
      },
    },
    {
      id: 'sec-compliance-3',
      type: 'compliance',
      order: 2,
      visible: true,
      data: {
        heading: 'TECHNICAL COMPLIANCE',
        description:
          'Our heavy engineering consumables adhere strictly to international manufacturing and classification society standards, guaranteeing full heat-traceability and certified mechanical properties.',
        link: {
          label: 'View Quality Certificates for Heavy Engineering',
          url: '#quality-certificates',
        },
        badges: [
          { label: 'AWS D1.1', icon: 'Award', certUrl: '' },
          { label: 'ASME Sec IX', icon: 'Award', certUrl: '' },
          { label: 'ISO 3834-2', icon: 'Award', certUrl: '' },
          { label: "Lloyd's Reg", icon: 'Award', certUrl: '' },
        ],
      },
    },
    {
      id: 'sec-richtext-4',
      type: 'richText',
      order: 3,
      visible: true,
      data: {
        heading: 'ENGINEERING FIELD METHODOLOGY',
        content:
          'Continuous submerged arc welding (SAW) and tandem wire processes ensure deep penetration in thick structural welds. Controlled thermal monitoring ensures HAZ hardness remains below 350 HV10 across high-tensile steels, preventing localized embrittlement.',
        calloutType: 'Engineering Note',
        calloutText:
          'Preheat and interpass temperatures must be continuously monitored via calibrated infrared pyrometry before depositing subsequent passes.',
      },
    },
    {
      id: 'sec-cta-5',
      type: 'ctaBanner',
      order: 4,
      visible: true,
      data: {
        eyebrow: 'NEED BESPOKE WELDING PROCEDURES?',
        heading: 'Custom Metallurgical Consultation & Procedure Development',
        description:
          'Consult directly with our regional welding specialists to formulate certified WPS/PQR documentation tailored to your heavy engineering project.',
        primaryCta: {
          label: 'REQUEST CONSULTATION',
          url: '/contact',
          openInNewTab: false,
        },
        secondaryCta: {
          label: 'DOWNLOAD CATALOGUE',
          url: '/resources',
          openInNewTab: false,
        },
        theme: 'dark',
      },
    },
  ],
};

async function seedSolutions() {
  try {
    await connectDB();
    console.log('[Seed Solutions] Connected to DB. Upserting Heavy Engineering page...');

    const existing = await SolutionPage.findOne({ slug: heavyEngineeringSolution.slug });
    if (existing) {
      existing.title = heavyEngineeringSolution.title;
      existing.status = heavyEngineeringSolution.status;
      existing.breadcrumb = heavyEngineeringSolution.breadcrumb;
      existing.seo = heavyEngineeringSolution.seo;
      existing.sections = heavyEngineeringSolution.sections;
      existing.publishedAt = existing.publishedAt || new Date();
      existing.createVersionSnapshot('Seed Script');
      await existing.save();
      console.log('[Seed Solutions] Updated existing Heavy Engineering solution page:', existing._id);
    } else {
      const created = new SolutionPage(heavyEngineeringSolution);
      created.createVersionSnapshot('Initial Seed');
      await created.save();
      console.log('[Seed Solutions] Created Heavy Engineering solution page:', created._id);
    }

    console.log('[Seed Solutions] Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Solutions] Error seeding solutions:', err);
    process.exit(1);
  }
}

seedSolutions();
