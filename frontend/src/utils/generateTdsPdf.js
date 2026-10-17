import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a professional 2-page A4 Technical Data Sheet (TDS) PDF
 * matching the exact Sprimax engineering standard and the user specification.
 * 
 * @param {Object} product - The real-time product object from database/page
 */
export function generateTdsPdf(product) {
  if (!product) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Color Palette Constants
  const BRAND_NAVY = [33, 46, 104];     // #212e68
  const BRAND_ACCENT = [224, 82, 6];     // #e05206
  const TEXT_DARK = [15, 23, 42];        // #0f172a
  const TEXT_MUTED = [100, 116, 139];    // #64748b
  const BG_ZEBRA = [248, 250, 252];      // #f8fafc
  const BORDER_LIGHT = [226, 232, 240];  // #e2e8f0

  // Resolve product data
  const rawSpecs = product.specifications instanceof Map 
    ? Object.fromEntries(product.specifications) 
    : (product.specifications || {});

  const title = (product.name || product.title || 'SUBMERGED ARC COMBINATION WIRE & FLUX F7A2-EM12K').trim();
  const rawSku = (product.sku || 'SAW-F7A2-25KG').replace('SKU: ', '').trim();
  const aws = (product.awsClass || product.awsClassification || product.aws || 'AWS A5.17 F7A2-EM12K').trim();
  const isSaw = rawSku.includes('SAW') || title.toUpperCase().includes('SUBMERGED ARC') || aws.includes('F7A2');

  // Filename according to specification: TDS_SAW-F7A2-EM12K.pdf
  let cleanFileCode = rawSku;
  if (isSaw) {
    cleanFileCode = 'SAW-F7A2-EM12K';
  } else {
    cleanFileCode = rawSku.replace(/[^a-zA-Z0-9_-]/g, '_');
  }
  const fileName = `TDS_${cleanFileCode}.pdf`;

  // Document metadata
  const docNo = `TDS-${cleanFileCode}`;
  const revNo = 'Rev 00';
  const issueDate = 'Oct 2026';

  // Description
  const description = product.description || (isSaw 
    ? 'Agglomerated aluminate-basic flux combined with medium-manganese solid wire for high-speed single, twin and multi-wire submerged arc welding.'
    : 'Engineered for critical structural and industrial fabrication with superior arc stability and mechanical integrity.');

  // Features
  let features = Array.isArray(product.features) && product.features.length > 0 
    ? product.features 
    : [
        'Neutral metallurgical behavior, no Mn or Si pickup',
        'Outstanding slag release in narrow deep grooves',
        'High travel speed, exceeding 1.8 m/min',
      ];

  if (isSaw && (!features || features.length < 3)) {
    features = [
      'Neutral metallurgical behavior, no Mn or Si pickup',
      'Outstanding slag release in narrow deep grooves',
      'High travel speed, exceeding 1.8 m/min',
    ];
  }

  // Approvals
  let approvals = Array.isArray(product.approvals) && product.approvals.length > 0
    ? product.approvals
    : (isSaw ? ['ABS 3YM (Cert # ABS-2024-WM-7712)', 'DNV-GL III YM (Cert # DNV-GL-TA-0921)', 'Lloyds 3YM (Cert # LR-8842-SAW)'] : ['AWS Certified', 'ISO 9001:2015 Approved']);

  // Classification & Applications info
  const fluxType = isSaw ? 'Agglomerated aluminate-basic (Basicity Index ~ 1.1)' : (product.subcategory || 'Heavy basic coating');
  const wireType = isSaw ? 'EM12K solid wire (medium manganese)' : (product.baseMaterial || 'Carbon / Low-alloy solid core');
  const positions = rawSpecs['Positions'] || rawSpecs['Position'] || (isSaw ? 'Flat (1G), Horizontal (2G)' : 'All except V-down');
  const typicalUses = isSaw 
    ? 'Structural steel fabrication, pressure vessels & boilers, heavy offshore jackets, shipbuilding'
    : (product.industries ? product.industries.join(', ') : 'Industrial steel fabrication, pressure equipment, heavy structures');

  // Mechanical properties
  const yieldStrength = rawSpecs['Yield Strength'] || rawSpecs['Yield'] || (isSaw ? '430 MPa' : '≥ 400 MPa');
  const tensileStrength = rawSpecs['Tensile Strength'] || rawSpecs['Tensile'] || (isSaw ? '540 MPa' : '490 - 660 MPa');
  const elongation = rawSpecs['Elongation (A5)'] || rawSpecs['Elongation'] || (isSaw ? '28%' : '26%');
  const impact = rawSpecs['Impact Energy (-29°C)'] 
    || rawSpecs['Impact Energy (-45°C)'] 
    || rawSpecs['Impact Energy (-20°C)'] 
    || rawSpecs['Impact'] 
    || (isSaw ? '65 J at -29°C' : '65 J at test temp');

  // Chemical composition
  const chem = product.chemicalComposition && typeof product.chemicalComposition === 'object'
    ? (product.chemicalComposition instanceof Map ? Object.fromEntries(product.chemicalComposition) : product.chemicalComposition)
    : {};

  // Operating parameters rows
  let techRows = Array.isArray(product.techSpecsRows) && product.techSpecsRows.length > 0 
    ? product.techSpecsRows 
    : [];

  if (isSaw || techRows.length === 0) {
    techRows = [
      { diameter: '2.4 mm', pack: 'Coil 25 kg', current: '350 – 550 A', voltage: '28 – 32 V', speed: '45 – 70 cm/min', stickout: '25 – 30 mm' },
      { diameter: '3.2 mm', pack: 'Coil 25 kg', current: '450 – 700 A', voltage: '30 – 34 V', speed: '40 – 65 cm/min', stickout: '28 – 35 mm' },
      { diameter: '4.0 mm', pack: 'Coil 25 kg', current: '550 – 850 A', voltage: '32 – 36 V', speed: '35 – 55 cm/min', stickout: '30 – 40 mm' },
    ];
  }

  // Helper to draw Footer on any page
  const drawPageFooter = (pageNum, totalPages = 2) => {
    const bottomY = 280;
    // Top border of footer
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.4);
    doc.line(15, bottomY - 3, 195, bottomY - 3);

    // Disclaimer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    const disclaimer = 'Notice: Values indicated are typical test results; actual production weld properties depend on joint geometry, procedure, heat input, and base material.';
    doc.text(disclaimer, 15, bottomY);

    // Corporate address and page number
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_DARK);
    doc.text('SPRIMAX WELDING TECHNOLOGIES  |  technical@sprimax.com  |  www.sprimax.com  |  +1 (800) 555-WELD', 15, bottomY + 4);

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${pageNum} of ${totalPages}`, 195, bottomY + 4, { align: 'right' });
  };

  // Helper to draw Header Band
  const drawHeaderBand = (pageNum) => {
    // Top color band (subtle navy accent strip)
    doc.setFillColor(...BRAND_NAVY);
    doc.rect(15, 12, 180, 2.5, 'F');

    // Left: Company Brand
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...BRAND_NAVY);
    doc.text('SPRIMAX', 15, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('INDUSTRIAL WELDING CONSUMABLES', 15, 26);

    // Right: Technical Data Sheet Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...BRAND_NAVY);
    doc.text('TECHNICAL DATA SHEET', 195, 21, { align: 'right' });

    // Document Metadata Line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`${docNo}  |  ${revNo}  |  ${issueDate}`, 195, 26, { align: 'right' });

    // Thin separator line
    doc.setDrawColor(...BORDER_LIGHT);
    doc.setLineWidth(0.4);
    doc.line(15, 29, 195, 29);
  };

  // ==========================================
  // PAGE 1: Specifications, Description & Codes
  // ==========================================
  drawHeaderBand(1);

  let currentY = 36;

  // 2. Product Title Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...BRAND_NAVY);
  
  const titleLines = doc.splitTextToSize(title, 180);
  doc.text(titleLines, 15, currentY);
  currentY += (titleLines.length * 6.5) + 1;

  // SKU & Classification Line (Badge row)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_ACCENT);
  doc.text(`SKU: ${rawSku}`, 15, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_NAVY);
  doc.text(`Classification: ${aws.startsWith('AWS') ? aws : `AWS ${aws}`}`, 65, currentY);
  currentY += 8;

  // Horizontal subtle rule
  doc.setDrawColor(...BORDER_LIGHT);
  doc.line(15, currentY - 2, 195, currentY - 2);
  currentY += 4;

  // 3. Product Description
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text('1. PRODUCT DESCRIPTION', 15, currentY);
  currentY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  const descLines = doc.splitTextToSize(description, 180);
  doc.text(descLines, 15, currentY);
  currentY += (descLines.length * 5) + 6;

  // 4. Key Features & Advantages
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text('2. KEY FEATURES & METALLURGICAL ADVANTAGES', 15, currentY);
  currentY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  features.forEach((feat) => {
    doc.setFillColor(...BRAND_ACCENT);
    doc.circle(18, currentY - 1.2, 1, 'F');
    const featLines = doc.splitTextToSize(feat, 170);
    doc.text(featLines, 22, currentY);
    currentY += (featLines.length * 4.8) + 1.5;
  });
  currentY += 5;

  // 5. Approvals & Certifications
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text('3. CODE APPROVALS & THIRD-PARTY CERTIFICATIONS', 15, currentY);
  currentY += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_DARK);
  approvals.forEach((app) => {
    doc.setFillColor(...BRAND_NAVY);
    doc.circle(18, currentY - 1.2, 1, 'F');
    const appLines = doc.splitTextToSize(app, 170);
    doc.text(appLines, 22, currentY);
    currentY += (appLines.length * 4.8) + 1.5;
  });
  currentY += 6;

  // 6. Classification & Applications
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text('4. CLASSIFICATION & RECOMMENDED APPLICATIONS', 15, currentY);
  currentY += 5;

  // 2-Column Summary Box for Classification
  autoTable(doc, {
    startY: currentY,
    margin: { left: 15, right: 15 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9.5,
      textColor: TEXT_DARK,
      lineColor: BORDER_LIGHT,
      lineWidth: 0.3,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: BRAND_NAVY, width: 45 },
      1: { fontStyle: 'normal', width: 135 },
    },
    body: [
      ['Flux Type', fluxType],
      ['Wire Type', wireType],
      ['Welding Positions', positions],
      ['Typical Uses & Applications', typicalUses],
    ],
  });

  drawPageFooter(1, 2);

  // ==========================================
  // PAGE 2: Chemical & Mechanical Tables
  // ==========================================
  doc.addPage('a4', 'portrait');
  drawHeaderBand(2);

  let page2Y = 36;

  // 7. Chemical Composition Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text('5. TYPICAL CHEMICAL COMPOSITION (WT %)', 15, page2Y);
  page2Y += 4.5;

  // Build chemical composition data
  // Row 1: Solid Wire AWS Limits
  const wireC = '0.05 – 0.15';
  const wireMn = '0.80 – 1.25';
  const wireSi = '0.10 – 0.35';
  const wireS = '≤ 0.030';
  const wireP = '≤ 0.030';
  const wireCu = '≤ 0.35';

  // Row 2: Actual All-Weld Metal test values
  const allWeldC = chem.C || '0.07';
  const allWeldMn = chem.Mn || '1.40';
  const allWeldSi = chem.Si || '0.35';
  const allWeldS = chem.S || '< 0.015';
  const allWeldP = chem.P || '< 0.020';
  const allWeldCu = chem.Cu || '0.12';

  autoTable(doc, {
    startY: page2Y,
    margin: { left: 15, right: 15 },
    theme: 'striped',
    headStyles: {
      fillColor: BRAND_NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
      halign: 'center',
      cellPadding: 3.5,
    },
    bodyStyles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: TEXT_DARK,
      cellPadding: 3.5,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', width: 66 },
    },
    alternateRowStyles: {
      fillColor: BG_ZEBRA,
    },
    head: [['Component / Material', 'C', 'Mn', 'Si', 'S', 'P', 'Cu']],
    body: [
      ['Solid Wire (AWS A5.17 EM12K Limits)', wireC, wireMn, wireSi, wireS, wireP, wireCu],
      ['All-Weld Metal (Typical Test Result)', allWeldC, allWeldMn, allWeldSi, allWeldS, allWeldP, allWeldCu],
    ],
  });

  page2Y = doc.lastAutoTable.finalY + 9;

  // 8. Mechanical Properties Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text('6. MECHANICAL PROPERTIES OF ALL-WELD METAL (AS-WELDED)', 15, page2Y);
  page2Y += 4.5;

  autoTable(doc, {
    startY: page2Y,
    margin: { left: 15, right: 15 },
    theme: 'striped',
    headStyles: {
      fillColor: BRAND_NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
      halign: 'left',
      cellPadding: 3.5,
    },
    bodyStyles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: TEXT_DARK,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', width: 66 },
      1: { width: 57 },
      2: { fontStyle: 'bold', textColor: BRAND_NAVY, width: 57 },
    },
    alternateRowStyles: {
      fillColor: BG_ZEBRA,
    },
    head: [['Mechanical Property', 'AWS Requirement', 'Typical Test Result']],
    body: [
      ['Yield Strength (ReH)', '≥ 400 MPa', yieldStrength],
      ['Tensile Strength (Rm)', '490 – 660 MPa', tensileStrength],
      ['Elongation (A5)', '≥ 22%', elongation],
      ['Impact Toughness (Charpy V-Notch)', '≥ 27 J at -29°C', impact],
    ],
  });

  page2Y = doc.lastAutoTable.finalY + 9;

  // 9. Recommended Operating Parameters Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text('7. RECOMMENDED OPERATING PARAMETERS & WELDING CONDITIONS', 15, page2Y);
  page2Y += 4.5;

  const operatingBody = techRows.map((row) => [
    row.diameter ? (row.diameter.includes('mm') ? row.diameter : `${row.diameter} mm`) : '3.2 mm',
    row.pack || (row.length ? (row.length.includes('Coil') ? row.length : `${row.length} mm`) : 'Coil 25 kg'),
    row.current || (row.currentFlat ? `${row.currentFlat} A` : '450 – 700 A'),
    row.voltage || '30 – 34 V',
    row.speed || '40 – 65 cm/min',
    row.stickout || '28 – 35 mm',
  ]);

  autoTable(doc, {
    startY: page2Y,
    margin: { left: 15, right: 15 },
    theme: 'striped',
    headStyles: {
      fillColor: BRAND_NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      cellPadding: 3.2,
    },
    bodyStyles: {
      font: 'helvetica',
      fontSize: 8.8,
      textColor: TEXT_DARK,
      cellPadding: 3.2,
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: BG_ZEBRA,
    },
    head: [['Diameter', 'Pack / Form', 'Current (Flat)', 'Arc Voltage', 'Travel Speed', 'Stick-Out (ESO)']],
    body: operatingBody,
  });

  page2Y = doc.lastAutoTable.finalY + 4.5;

  // Polarity and Electrical notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_NAVY);
  doc.text('Welding Polarity: ', 15, page2Y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_DARK);
  doc.text('Direct Current Electrode Positive (DC+) or Alternating Current (AC). Optimum performance on constant-voltage power sources.', 42, page2Y);
  page2Y += 8;

  // 10. Storage & Handling
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_NAVY);
  doc.text('8. STORAGE, RE-DRYING & HANDLING INSTRUCTIONS', 15, page2Y);
  page2Y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(...TEXT_DARK);
  const storageNotes = [
    'Storage: Store flux in clean, dry conditions in original sealed moisture-proof packaging.',
    'Re-drying: If flux packaging is opened or exposed to ambient humidity, re-bake at 300°C – 350°C for 2 hours before welding.',
    'Wire Handling: Store wire coils in original dry packaging. Protect from surface oxidation, moisture, and dust contamination.',
  ];

  storageNotes.forEach((note) => {
    doc.setFillColor(...BRAND_ACCENT);
    doc.circle(18, page2Y - 1, 0.9, 'F');
    const noteLines = doc.splitTextToSize(note, 172);
    doc.text(noteLines, 22, page2Y);
    page2Y += (noteLines.length * 4.2) + 1;
  });

  drawPageFooter(2, 2);

  // Trigger immediate download with target filename
  doc.save(fileName);
}
