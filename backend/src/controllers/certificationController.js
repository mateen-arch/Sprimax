import Certification from '../models/Certification.js';

// Minimal valid base64 PDF template generator
const createPdfDataUrl = (title, issuer, validity) => {
  const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R>>endobj
4 0 obj<</Length 180>>stream
BT
/F1 18 Tf
50 780 Td
(SPRIMAX INDUSTRIAL CERTIFICATION) Tj
/F1 12 Tf
0 -40 Td
(Document: ${title.replace(/[()]/g, '')}) Tj
0 -25 Td
(Accredited By: ${issuer.replace(/[()]/g, '')}) Tj
0 -25 Td
(Validity: ${validity.replace(/[()]/g, '')}) Tj
0 -40 Td
(Certified for Structural Welding & Heavy Industry Applications) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000057 00000 n 
0000000115 00000 n 
0000000201 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref
440
%%EOF`;
  return `data:application/pdf;base64,${Buffer.from(content).toString('base64')}`;
};

const DEFAULT_SEEDS = [
  {
    name: 'ISO 9001:2015 Quality Management System',
    subScope: 'Global Welding Manufacturing Baseline & Quality Assurance',
    issuer: 'International Organization for Standardization (ISO)',
    validityRange: 'Jan 15, 2024 - Jan 14, 2027',
    issueDate: '2024-01-15',
    validUntil: '2027-01-14',
    status: 'Valid',
    associatedProducts: ['WeldCore 71T-1 Flux Cored Wire', 'LOW HYDROGEN ELECTRODE E7018-1'],
    documentName: 'ISO_9001_2015_Certificate.pdf',
    fileSize: '1.4 MB',
    order: 1,
  },
  {
    name: 'AWS D1.1 Structural Welding Code (Steel)',
    subScope: 'Fabrication & Erection of Welded Steel Structures',
    issuer: 'American Welding Society (AWS)',
    validityRange: 'Oct 10, 2023 - Oct 09, 2026',
    issueDate: '2023-10-10',
    validUntil: '2026-10-09',
    status: 'Valid',
    associatedProducts: ['LOW HYDROGEN ELECTRODE E7018-1', 'Stainless Steel TIG Rod ER308L'],
    documentName: 'AWS_D1_1_Structural_Steel_Compliance.pdf',
    fileSize: '2.1 MB',
    order: 2,
  },
  {
    name: 'ASME Boiler & Pressure Vessel Code (Section IX)',
    subScope: 'Welding, Brazing & Fusing Qualifications',
    issuer: 'American Society of Mechanical Engineers (ASME)',
    validityRange: 'Jul 22, 2023 - Jul 21, 2026',
    issueDate: '2023-07-22',
    validUntil: '2026-07-21',
    status: 'Valid',
    associatedProducts: ['Argon Gas Regulators (Industrial)', 'WeldCore 71T-1 Flux Cored Wire'],
    documentName: 'ASME_BPVC_Section_IX_Approval.pdf',
    fileSize: '1.8 MB',
    order: 3,
  },
  {
    name: 'EN 1090-2 Execution of Steel Structures (CE Marking)',
    subScope: 'Conformity European (CE) Class EXC3 / EXC4',
    issuer: 'TÜV Rheinland Group',
    validityRange: 'Feb 10, 2024 - Nov 30, 2026',
    issueDate: '2024-02-10',
    validUntil: '2026-11-30',
    status: 'Valid',
    associatedProducts: ['LOW HYDROGEN ELECTRODE E7018-1'],
    documentName: 'EN_1090_2_CE_Declaration.pdf',
    fileSize: '1.6 MB',
    order: 4,
  },
  {
    name: 'ISO 3834-2 Comprehensive Quality Requirements',
    subScope: 'Fusion Welding of Metallic Materials',
    issuer: 'Lloyds Register Quality Assurance',
    validityRange: 'Sep 05, 2023 - Sep 04, 2026',
    issueDate: '2023-09-05',
    validUntil: '2026-09-04',
    status: 'Valid',
    associatedProducts: ['Industrial Plasma Cutters Series X', 'TIG Torches Pro Series 200A'],
    documentName: 'ISO_3834_2_Comprehensive_Audit.pdf',
    fileSize: '1.5 MB',
    order: 5,
  },
  {
    name: 'ASTM E1417 Liquid Penetrant Inspection Standard',
    subScope: 'Non-Destructive Examination (NDE) Protocol',
    issuer: 'ASTM International',
    validityRange: 'Nov 01, 2023 - Nov 20, 2026',
    issueDate: '2023-11-01',
    validUntil: '2026-11-20',
    status: 'Valid',
    associatedProducts: ['WeldCore 71T-1 Flux Cored Wire'],
    documentName: 'ASTM_E1417_NDE_Methodology.pdf',
    fileSize: '1.1 MB',
    order: 6,
  },
  {
    name: 'CWB CSA W47.1 Certification for Fusion Welding',
    subScope: 'Canadian Welding Bureau Division 2 Standard',
    issuer: 'Canadian Welding Bureau (CWB)',
    validityRange: 'Mar 15, 2024 - Mar 14, 2027',
    issueDate: '2024-03-15',
    validUntil: '2027-03-14',
    status: 'Valid',
    associatedProducts: ['Stainless Steel TIG Rod ER308L', 'LOW HYDROGEN ELECTRODE E7018-1'],
    documentName: 'CWB_CSA_W47_1_Certification.pdf',
    fileSize: '2.0 MB',
    order: 7,
  },
];

// @desc    Get all certifications (auto-seeds if empty)
// @route   GET /api/certifications
// @access  Public
export const getCertifications = async (req, res, next) => {
  try {
    let count = await Certification.countDocuments();
    if (count === 0) {
      const prepared = DEFAULT_SEEDS.map((s) => ({
        ...s,
        documentUrl: createPdfDataUrl(s.name, s.issuer, s.validityRange),
      }));
      await Certification.insertMany(prepared);
    }

    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: 'i' } },
        { subScope: { $regex: term, $options: 'i' } },
        { issuer: { $regex: term, $options: 'i' } },
      ];
    }

    const certifications = await Certification.find(query).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certifications.length,
      certifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single certification
// @route   GET /api/certifications/:id
// @access  Public
export const getCertificationById = async (req, res, next) => {
  try {
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }
    res.status(200).json({ success: true, certification });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new certification
// @route   POST /api/certifications
// @access  Public (or Admin protected)
export const createCertification = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.documentUrl || !data.documentUrl.startsWith('data:')) {
      data.documentUrl = createPdfDataUrl(
        data.name || 'Certification',
        data.issuer || 'Sprimax Quality Standards',
        data.validityRange || '2024 - 2027'
      );
    }
    if (!data.documentName) {
      data.documentName = `${(data.name || 'certificate').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    }

    const newCert = await Certification.create(data);
    res.status(201).json({
      success: true,
      message: 'Certification created successfully',
      certification: newCert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update certification
// @route   PUT /api/certifications/:id
// @access  Public (or Admin protected)
export const updateCertification = async (req, res, next) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    Object.assign(cert, req.body);
    const updated = await cert.save();

    res.status(200).json({
      success: true,
      message: 'Certification updated successfully',
      certification: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete certification
// @route   DELETE /api/certifications/:id
// @access  Public (or Admin protected)
export const deleteCertification = async (req, res, next) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certification not found' });
    }

    await Certification.deleteOne({ _id: cert._id });

    res.status(200).json({
      success: true,
      message: `Certification '${cert.name}' deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
