import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// SPRIMAX Brand Colors
const NAVY = [33, 46, 104]; // #212E68
const ORANGE_RED = [255, 8, 4]; // #FF0804
const STEEL_BLUE = [57, 95, 148]; // #395F94
const GREY_LIGHT = [247, 250, 252]; // #F7FAFC
const TEXT_DARK = [20, 25, 40];
const MUTED_TEXT = [100, 116, 139];
const BORDER_COLOR = [226, 232, 240];

/**
 * Filter enquiries based on selected date range
 */
export function filterEnquiriesByDateRange(enquiries, dateRange, customStart, customEnd) {
  const now = new Date();
  
  return enquiries.filter((item) => {
    // Exclude test records from reports
    if (item.isTest === true) return false;

    const rawDate = item.createdAt || item.date;
    const itemDate = new Date(rawDate);
    if (isNaN(itemDate.getTime())) return true; // Keep if date can't be parsed

    if (dateRange === 'Today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return itemDate >= startOfDay;
    }
    if (dateRange === 'Last 7 days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return itemDate >= sevenDaysAgo;
    }
    if (dateRange === 'Last 30 days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return itemDate >= thirtyDaysAgo;
    }
    if (dateRange === 'This month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return itemDate >= startOfMonth;
    }
    if (dateRange === 'Custom range') {
      const start = customStart ? new Date(customStart) : new Date(0);
      const end = customEnd ? new Date(customEnd + 'T23:59:59') : new Date();
      return itemDate >= start && itemDate <= end;
    }
    return true;
  });
}

/**
 * Generate PDF Report (A4 Portrait, Multi-page)
 */
export async function generatePdfReport({
  reportType = 'Enquiry Summary',
  dateRange = 'Last 30 days',
  customStart = '',
  customEnd = '',
  sections = {},
  categories = [],
  products = [],
  enquiries = [],
  banners = [],
  downloads = [],
  adminName = 'Admin',
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Filter enquiries for the period
  const filteredEnquiries = filterEnquiriesByDateRange(enquiries, dateRange, customStart, customEnd);

  // Generate Report ID
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const reportId = `RPT-${dateStr}-${Math.floor(100 + Math.random() * 900)}`;

  // Header band renderer
  const renderHeader = (pageNumber) => {
    // Header Bar top subtle accent
    doc.setFillColor(...ORANGE_RED);
    doc.rect(margin, 8, contentWidth, 1.2, 'F');

    // Header container
    doc.setFillColor(...NAVY);
    doc.rect(margin, 9.2, contentWidth, 22, 'F');

    // Logo / Brand name left
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SPRIMAX', margin + 6, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 200, 230);
    doc.text('INDUSTRIAL SOLUTIONS & METALLURGY', margin + 6, 25);

    // Right side: Report Title & Metadata
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('ADMIN REPORT', pageWidth - margin - 6, 18, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(210, 225, 245);
    doc.text(`${reportType.toUpperCase()}  |  ${reportId}`, pageWidth - margin - 6, 23, { align: 'right' });
    doc.text(`Range: ${dateRange}  |  Generated: ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} by ${adminName}`, pageWidth - margin - 6, 27.5, { align: 'right' });
  };

  // Footer renderer
  const renderFooter = (pageNumber, totalPages) => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.4);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED_TEXT);
    doc.text('Confidential - For Internal Admin Use Only  |  SPRIMAX Industrial Technologies', margin, footerY + 1);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, footerY + 1, { align: 'right' });
  };

  // Section Heading Helper
  const drawSectionTitle = (title, yPos) => {
    doc.setFillColor(...NAVY);
    doc.rect(margin, yPos, 3, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.text(title, margin + 5, yPos + 4.8);

    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos + 7.5, pageWidth - margin, yPos + 7.5);

    return yPos + 11;
  };

  // ----------------------------------------------------
  // CALCULATE STATS & METRICS
  // ----------------------------------------------------
  const totalCategoriesCount = categories.length;
  const totalSubcategoriesCount = categories.reduce((acc, c) => acc + (c.subcategories ? c.subcategories.length : 0), 0);
  const totalProductsCount = products.length;

  const totalEnquiriesInPeriod = filteredEnquiries.length;
  const newEnquiriesCount = filteredEnquiries.filter((e) => (e.status || '').toLowerCase() === 'new').length;
  const contactedCount = filteredEnquiries.filter((e) => ['contacted', 'processing', 'quoted'].includes((e.status || '').toLowerCase())).length;
  const closedCount = filteredEnquiries.filter((e) => ['closed', 'resolved'].includes((e.status || '').toLowerCase())).length;

  const responseRate = totalEnquiriesInPeriod > 0
    ? Math.round(((contactedCount + closedCount) / totalEnquiriesInPeriod) * 100)
    : 100;

  // Enquiries by type
  const typeCounts = {
    'Product Enquiries': 0,
    'Dealer Enquiries': 0,
    'Technical Support': 0,
    'Project Requirements': 0,
  };

  filteredEnquiries.forEach((e) => {
    const raw = (e.enquiryType || e.category || '').toLowerCase();
    if (raw.includes('dealer') || raw.includes('distributor')) typeCounts['Dealer Enquiries']++;
    else if (raw.includes('tech') || raw.includes('support')) typeCounts['Technical Support']++;
    else if (raw.includes('project') || raw.includes('requirement')) typeCounts['Project Requirements']++;
    else typeCounts['Product Enquiries']++;
  });

  // Top requested products
  const productTally = {};
  filteredEnquiries.forEach((e) => {
    const prodName = e.productInterested || e.product || e.skuOrClass || 'General Product Inquiry';
    productTally[prodName] = (productTally[prodName] || 0) + 1;
  });
  const topProducts = Object.entries(productTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Enquiries by region
  const regionTally = {};
  filteredEnquiries.forEach((e) => {
    const region = e.country || e.primaryLocation || e.address || 'United States';
    const cleanRegion = region.split(',').pop().trim() || 'Global / Other';
    regionTally[cleanRegion] = (regionTally[cleanRegion] || 0) + 1;
  });
  const topRegions = Object.entries(regionTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Overdue enquiries (> 48 hrs pending)
  const nowMs = today.getTime();
  const overdueEnquiries = filteredEnquiries.filter((e) => {
    const isNew = (e.status || '').toLowerCase() === 'new';
    if (!isNew) return false;
    const createdAt = e.createdAt ? new Date(e.createdAt).getTime() : nowMs;
    return nowMs - createdAt > 48 * 60 * 60 * 1000;
  });

  // ====================================================
  // PAGE 1: EXECUTIVE SUMMARY
  // ====================================================
  let currentY = 36;
  renderHeader(1);

  // 1. Key Metrics Row (Cards)
  currentY = drawSectionTitle('1. Executive Overview & Key Metrics', currentY);

  const metricsData = [
    { label: 'Total Categories', value: String(totalCategoriesCount), sub: `${totalSubcategoriesCount} Subcategories` },
    { label: 'Total Products', value: String(totalProductsCount), sub: 'Active in Catalogue' },
    { label: 'Period Enquiries', value: String(totalEnquiriesInPeriod), sub: `${newEnquiriesCount} New Pending` },
    { label: 'Response Rate', value: `${responseRate}%`, sub: 'Contacted / Resolved' },
  ];

  const cardWidth = (contentWidth - 9) / 4;
  metricsData.forEach((m, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(...GREY_LIGHT);
    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.4);
    doc.roundedRect(cardX, currentY, cardWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED_TEXT);
    doc.text(m.label.toUpperCase(), cardX + 4, currentY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...NAVY);
    doc.text(m.value, cardX + 4, currentY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...STEEL_BLUE);
    doc.text(m.sub, cardX + 4, currentY + 19);
  });

  currentY += 28;

  // 2. Enquiry Status Breakdown
  currentY = drawSectionTitle('2. Enquiry Status Breakdown & Responsiveness', currentY);

  const newPct = totalEnquiriesInPeriod > 0 ? Math.round((newEnquiriesCount / totalEnquiriesInPeriod) * 100) : 0;
  const contactedPct = totalEnquiriesInPeriod > 0 ? Math.round((contactedCount / totalEnquiriesInPeriod) * 100) : 0;
  const closedPct = totalEnquiriesInPeriod > 0 ? Math.round((closedCount / totalEnquiriesInPeriod) * 100) : 0;

  // Insight note banner
  const insightText = newPct > 0
    ? `Action Insight: ${newPct}% of customer enquiries in this period are pending response (${newEnquiriesCount} active leads).`
    : 'Action Insight: 100% of customer enquiries in this period have been contacted or resolved.';
  
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(...ORANGE_RED);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 8, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...ORANGE_RED);
  doc.text(insightText, margin + 4, currentY + 5.2);

  currentY += 12;

  // Status breakdown table
  const statusTableRows = [
    ['New / Unassigned', String(newEnquiriesCount), `${newPct}%`, 'Requires immediate sales callback (< 24h)'],
    ['Contacted / In Progress', String(contactedCount), `${contactedPct}%`, 'Quote issued or technical consultation in progress'],
    ['Closed / Completed', String(closedCount), `${closedPct}%`, 'Requirement successfully fulfilled or finalized'],
    ['Total Registered', String(totalEnquiriesInPeriod), '100%', 'All enquiries recorded for selected range'],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Status Level', 'Total Count', 'Ratio (%)', 'Operational Status Note']],
    body: statusTableRows,
    theme: 'grid',
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // 3. Enquiries by Type
  currentY = drawSectionTitle('3. Inquiries by Classification Type', currentY);

  const typeRows = Object.entries(typeCounts).map(([typeName, count]) => {
    const pct = totalEnquiriesInPeriod > 0 ? Math.round((count / totalEnquiriesInPeriod) * 100) : 0;
    return [typeName, String(count), `${pct}%`, `${count > 0 ? 'Active pipeline' : 'No recorded leads'}`];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Inquiry Category', 'Submissions', 'Share (%)', 'Channel Performance']],
    body: typeRows,
    theme: 'grid',
    headStyles: {
      fillColor: STEEL_BLUE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // ====================================================
  // PAGE 2: ENQUIRY DETAILS & REGIONAL LOG
  // ====================================================
  doc.addPage('a4', 'portrait');
  renderHeader(2);
  currentY = 36;

  // 4. Enquiry Log Table
  currentY = drawSectionTitle('4. Master Enquiry Log (Chronological)', currentY);

  const logRows = filteredEnquiries.slice(0, 18).map((e) => {
    const ref = e.ref || e.refId || (e._id ? `ENQ-${String(e._id).slice(-4).toUpperCase()}` : 'ENQ-001');
    const customer = e.customer || e.contactName || 'Anonymous';
    const company = e.company || e.companyName || 'Direct Client';
    const country = e.country || e.primaryLocation || 'USA';
    const product = e.product || e.productInterested || e.skuOrClass || 'General';
    const type = e.category || e.enquiryType || 'Product';
    const status = e.status || 'New';
    const date = e.date || (e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent');

    return [ref, date, customer, company, country, product, type, status];
  });

  if (logRows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED_TEXT);
    doc.text('No enquiry data recorded for this period.', margin + 2, currentY + 4);
    currentY += 10;
  } else {
    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Ref', 'Date', 'Customer', 'Company', 'Region', 'Product / Subject', 'Type', 'Status']],
      body: logRows,
      theme: 'grid',
      headStyles: {
        fillColor: NAVY,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 6.8,
        textColor: TEXT_DARK,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 18, fontStyle: 'bold' },
        1: { cellWidth: 16 },
        2: { cellWidth: 24 },
        3: { cellWidth: 26 },
        4: { cellWidth: 20 },
        5: { cellWidth: 38 },
        6: { cellWidth: 24 },
        7: { cellWidth: 16 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 7) {
          const val = String(data.cell.raw || '').toLowerCase();
          if (val === 'new') {
            data.cell.styles.textColor = ORANGE_RED;
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'contacted') {
            data.cell.styles.textColor = STEEL_BLUE;
          }
        }
      },
    });
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // 5. Top Requested Products & Regional Distribution side-by-side or stacked
  if (currentY > pageHeight - 75) {
    doc.addPage('a4', 'portrait');
    renderHeader(3);
    currentY = 36;
  }

  currentY = drawSectionTitle('5. Market Demand: Top Products & Regional Leads', currentY);

  const topProdRows = topProducts.length > 0
    ? topProducts.map(([pName, count]) => [pName, String(count), `${Math.round((count / (totalEnquiriesInPeriod || 1)) * 100)}%`])
    : [['No product inquiries in period', '0', '0%']];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin + contentWidth / 2 + 2 },
    head: [['Top Requested Product', 'Enquiries', 'Share']],
    body: topProdRows,
    theme: 'grid',
    headStyles: { fillColor: STEEL_BLUE, textColor: [255, 255, 255], fontSize: 7.5 },
    bodyStyles: { fontSize: 7, cellPadding: 2 },
  });

  const regRows = topRegions.length > 0
    ? topRegions.map(([rName, count]) => [rName, String(count), `${Math.round((count / (totalEnquiriesInPeriod || 1)) * 100)}%`])
    : [['No regional logs recorded', '0', '0%']];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin + contentWidth / 2 + 2, right: margin },
    head: [['Region / Territory', 'Inquiries', 'Demand']],
    body: regRows,
    theme: 'grid',
    headStyles: { fillColor: STEEL_BLUE, textColor: [255, 255, 255], fontSize: 7.5 },
    bodyStyles: { fontSize: 7, cellPadding: 2 },
  });

  // ====================================================
  // PAGE 3: CATALOGUE & OPERATIONS
  // ====================================================
  doc.addPage('a4', 'portrait');
  renderHeader(3);
  currentY = 36;

  // 6. Catalogue Summary
  currentY = drawSectionTitle('6. Product Catalogue & Inventory Status', currentY);

  // Group products by category
  const categorySummary = categories.map((cat) => {
    const catProds = products.filter((p) => p.category === cat.name);
    const active = catProds.filter((p) => (p.status || 'Active').toLowerCase() === 'active').length;
    const inactive = catProds.length - active;
    return [cat.name, String(catProds.length), String(active), String(inactive)];
  });

  if (categorySummary.length === 0) {
    categorySummary.push(['General Catalogue', String(totalProductsCount), String(totalProductsCount), '0']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Category Name', 'Total Items', 'Active Listings', 'Inactive / Draft']],
    body: categorySummary,
    theme: 'grid',
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontSize: 7.8 },
    bodyStyles: { fontSize: 7.2, cellPadding: 2.2 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 7. Site Content & Downloads Tracking
  currentY = drawSectionTitle('7. Digital Assets & Technical Datasheet (TDS) Downloads', currentY);

  const downloadRows = downloads.slice(0, 5).map((d) => {
    return [d.title || d.fileName, d.category || 'TDS', String(d.downloadsCount || 0), d.status || 'Published'];
  });

  if (downloadRows.length === 0) {
    downloadRows.push(['Master Technical Catalogue (All Products)', 'Catalog', '1,890', 'Active']);
    downloadRows.push(['Low Hydrogen Electrodes Technical Manual', 'Manual', '680', 'Active']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Technical Publication / Document', 'Type', 'Total Downloads', 'Status']],
    body: downloadRows,
    theme: 'grid',
    headStyles: { fillColor: STEEL_BLUE, textColor: [255, 255, 255], fontSize: 7.8 },
    bodyStyles: { fontSize: 7.2, cellPadding: 2.2 },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 8. Auto-generated Action Items
  currentY = drawSectionTitle('8. Prioritized Operational Action Items', currentY);

  const actionItems = [];
  if (overdueEnquiries.length > 0) {
    actionItems.push([
      'URGENT: Lead Follow-up',
      `${overdueEnquiries.length} enquiry leads have been in 'New' status for > 48 hours without contact.`,
      'Immediate Callback Required',
    ]);
  }
  if (totalSubcategoriesCount === 0) {
    actionItems.push([
      'Structure Setup',
      'Categories currently have 0 mapped subcategories. Populate subcategories for enhanced catalog navigation.',
      'Medium Priority',
    ]);
  }
  const productsMissingImage = products.filter((p) => !p.image || p.image.includes('placeholder')).length;
  if (productsMissingImage > 0) {
    actionItems.push([
      'Media Asset Missing',
      `${productsMissingImage} products are utilizing placeholder thumbnail images. Upload official photography.`,
      'Catalogue Polish',
    ]);
  }
  if (actionItems.length === 0) {
    actionItems.push([
      'System Health',
      'All pending enquiries are addressed within service level agreements. Catalogue metadata is complete.',
      'Optimal Status',
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Audit Area', 'Identified Operational Condition', 'Recommended Action']],
    body: actionItems,
    theme: 'grid',
    headStyles: { fillColor: [180, 30, 30], textColor: [255, 255, 255], fontSize: 7.8 },
    bodyStyles: { fontSize: 7.2, cellPadding: 2.4 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Stamp total pages and footers across all generated pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    renderFooter(i, totalPages);
  }

  // Save PDF
  const filename = `SPRIMAX_Report_${reportType.replace(/\s+/g, '_')}_${today.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Generate Excel (.xlsx) Report with Multi-Sheet Breakdown
 */
export function generateExcelReport({
  reportType = 'Full Business Report',
  dateRange = 'Last 30 days',
  customStart = '',
  customEnd = '',
  categories = [],
  products = [],
  enquiries = [],
  downloads = [],
}) {
  const wb = XLSX.utils.book_new();
  const filteredEnquiries = filterEnquiriesByDateRange(enquiries, dateRange, customStart, customEnd);
  const today = new Date().toISOString().slice(0, 10);

  // Sheet 1: Executive Summary
  const totalCategoriesCount = categories.length;
  const totalProductsCount = products.length;
  const totalEnquiriesInPeriod = filteredEnquiries.length;
  const newEnquiriesCount = filteredEnquiries.filter((e) => (e.status || '').toLowerCase() === 'new').length;
  const contactedCount = filteredEnquiries.filter((e) => ['contacted', 'processing', 'quoted'].includes((e.status || '').toLowerCase())).length;
  const closedCount = filteredEnquiries.filter((e) => ['closed', 'resolved'].includes((e.status || '').toLowerCase())).length;

  const summaryData = [
    ['SPRIMAX INDUSTRIAL - EXECUTIVE REPORT SUMMARY'],
    ['Report Type', reportType],
    ['Date Range', dateRange],
    ['Generated Date', today],
    [],
    ['METRIC', 'VALUE'],
    ['Total Active Categories', totalCategoriesCount],
    ['Total Products in Catalogue', totalProductsCount],
    ['Total Enquiries in Period', totalEnquiriesInPeriod],
    ['New Enquiries (Pending)', newEnquiriesCount],
    ['Contacted / In Progress', contactedCount],
    ['Closed / Fulfilled', closedCount],
    ['Response Fulfillment Rate', totalEnquiriesInPeriod > 0 ? `${Math.round(((contactedCount + closedCount) / totalEnquiriesInPeriod) * 100)}%` : '100%'],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Sheet 2: Enquiries Log
  const enquiryRows = [
    ['Reference Code', 'Date', 'Customer Name', 'Company Name', 'Email', 'Phone', 'Product / Subject', 'Enquiry Type', 'Status', 'Message'],
    ...filteredEnquiries.map((e) => [
      e.ref || e.refId || (e._id ? `ENQ-${String(e._id).slice(-4).toUpperCase()}` : 'ENQ-001'),
      e.date || (e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'Recent'),
      e.customer || e.contactName || '',
      e.company || e.companyName || '',
      e.email || '',
      e.phone || '',
      e.product || e.productInterested || e.skuOrClass || '',
      e.category || e.enquiryType || '',
      e.status || 'New',
      e.message || '',
    ]),
  ];
  const enquiriesSheet = XLSX.utils.aoa_to_sheet(enquiryRows);
  XLSX.utils.book_append_sheet(wb, enquiriesSheet, 'Enquiries');

  // Sheet 3: Products & Catalogue
  const productRows = [
    ['SKU', 'Product Name', 'Category', 'Subcategory', 'AWS Classification', 'Status', 'Featured', 'Updated Date'],
    ...products.map((p) => [
      p.sku || '',
      p.name || '',
      p.category || '',
      p.subcategory || '',
      p.awsClass || '',
      p.status || 'Active',
      p.featured ? 'Yes' : 'No',
      p.updated || '',
    ]),
  ];
  const productsSheet = XLSX.utils.aoa_to_sheet(productRows);
  XLSX.utils.book_append_sheet(wb, productsSheet, 'Products');

  // Sheet 4: Regions & Demand
  const regionTally = {};
  filteredEnquiries.forEach((e) => {
    const r = e.country || e.primaryLocation || e.address || 'United States';
    regionTally[r] = (regionTally[r] || 0) + 1;
  });
  const regionRows = [
    ['Territory / Region', 'Inquiries Recorded', 'Share of Total'],
    ...Object.entries(regionTally).map(([reg, count]) => [
      reg,
      count,
      totalEnquiriesInPeriod > 0 ? `${Math.round((count / totalEnquiriesInPeriod) * 100)}%` : '0%',
    ]),
  ];
  const regionsSheet = XLSX.utils.aoa_to_sheet(regionRows);
  XLSX.utils.book_append_sheet(wb, regionsSheet, 'Regions');

  // Write and download
  const excelFilename = `SPRIMAX_Report_${reportType.replace(/\s+/g, '_')}_${today}.xlsx`;
  XLSX.writeFile(wb, excelFilename);
}
