import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// SPRIMAX Brand Palette
const NAVY = [33, 46, 104]; // #212E68
const SAFETY_ORANGE = [255, 8, 4]; // #FF0804
const STEEL_BLUE = [57, 95, 148]; // #395F94
const BG_LIGHT_GREY = [247, 250, 252]; // #F7FAFC
const TEXT_DARK = [15, 23, 42]; // #0F172A
const TEXT_MUTED = [100, 116, 139]; // #64748B
const BORDER_COLOR = [226, 232, 240]; // #E2E8F0

/**
 * Clean helper to display value or "Not provided"
 */
function displayVal(val) {
  if (val === undefined || val === null) return 'Not provided';
  const str = String(val).trim();
  return str === '' || str === '—' || str === '-' ? 'Not provided' : str;
}

/**
 * Format date in viewer's local timezone with timezone label (e.g. "Oct 17, 2026, 12:46 AM PKT")
 */
function formatLocalTimestampWithTz(dateInput) {
  if (!dateInput) return 'Not provided';
  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return 'Not provided';

  // Get localized formatted string
  const formatted = dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Extract timezone abbreviation/name
  let tzLabel = '';
  try {
    const tzMatch = dateObj.toLocaleTimeString('en-US', { timeZoneName: 'short' }).match(/[A-Z]{2,5}$/);
    if (tzMatch) {
      tzLabel = tzMatch[0];
    } else {
      const offsetMinutes = -dateObj.getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
      const mins = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
      tzLabel = `UTC${sign}${hours}:${mins}`;
    }
  } catch (e) {
    tzLabel = 'Local';
  }

  return `${formatted} ${tzLabel}`;
}

/**
 * Clean & normalize Ref ID (e.g. ENQ-2026-1822)
 */
export function formatEnquiryRef(enq) {
  if (enq.refNo) {
    return enq.refNo.replace('#', '').trim();
  }
  if (enq.referenceCode) {
    return enq.referenceCode.replace('#', '').trim();
  }
  if (enq.refId) {
    const clean = enq.refId.replace('#', '').trim();
    if (clean.startsWith('REQ-')) {
      return clean.replace('REQ-', 'ENQ-');
    }
    return clean;
  }
  const idStr = String(enq._id || enq.id || '');
  if (idStr.length >= 6) {
    const year = new Date().getFullYear();
    const num = idStr.slice(-4).toUpperCase();
    return `ENQ-${year}-${num}`;
  }
  return `ENQ-${new Date().getFullYear()}-0001`;
}

/**
 * Calculate time elapsed since submission
 */
function getTimeSince(submissionDateStr) {
  if (!submissionDateStr) return { text: 'Not provided', isOverdue: false, hours: 0 };
  const subDate = new Date(submissionDateStr);
  if (isNaN(subDate.getTime())) return { text: 'Not provided', isOverdue: false, hours: 0 };

  const now = new Date();
  const diffMs = now - subDate;
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 1) {
    return { text: 'Less than 1 hour', isOverdue: false, hours: 0 };
  }
  if (diffHours < 24) {
    return { text: `${diffHours} hour${diffHours > 1 ? 's' : ''}`, isOverdue: false, hours: diffHours };
  }
  const diffDays = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;
  return {
    text: `${diffDays}d ${remHours}h (${diffHours} hours total)`,
    isOverdue: diffHours > 48,
    hours: diffHours,
  };
}

/**
 * Auto-detect key requirements from enquiry fields
 */
function detectKeyRequirements(enquiry) {
  const textCorpus = [
    enquiry.message || '',
    enquiry.specifications || '',
    enquiry.application || '',
    enquiry.projectScopeDetails || '',
  ]
    .join(' ')
    .toLowerCase();

  const reqs = [];

  // 1. Quotation requested
  const isQuoteRequested =
    textCorpus.includes('quote') ||
    textCorpus.includes('quotation') ||
    textCorpus.includes('pricing') ||
    textCorpus.includes('cost') ||
    Boolean(enquiry.quantity);
  reqs.push({ label: 'Quotation requested', value: isQuoteRequested ? 'Yes' : 'Informational' });

  // 2. Test certificates required
  const isCertRequired =
    textCorpus.includes('cert') ||
    textCorpus.includes('test') ||
    textCorpus.includes('compliance') ||
    textCorpus.includes('mill') ||
    textCorpus.includes('mtr') ||
    textCorpus.includes('iso');
  reqs.push({ label: 'Test certificates required', value: isCertRequired ? 'Yes' : 'Standard Factory Quality' });

  // 3. Quantity
  const qty = enquiry.quantity ? `${enquiry.quantity} ${enquiry.unit || 'KG'}` : (enquiry.estimatedVolume || 'Quote Request');
  reqs.push({ label: 'Quantity', value: qty });

  // 4. Delivery timeline
  const timeline = enquiry.timeline || enquiry.requiredDate || enquiry.targetDeliveryDate || 'Standard Schedule';
  reqs.push({ label: 'Delivery timeline', value: timeline });

  return reqs;
}

/**
 * Generate 1-page A4 PDF Enquiry Summary
 */
export async function generateEnquirySummaryPdf({
  enquiry,
  adminName = 'System Administrator',
  matchedProduct = null,
  isFollowUp = false,
  internalNotes = '',
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  // Ref No & Timestamps in local viewer timezone
  const refNo = formatEnquiryRef(enquiry);
  const now = new Date();
  const exportTimestamp = formatLocalTimestampWithTz(now);
  const submittedTimestamp = formatLocalTimestampWithTz(enquiry.createdAt || enquiry.submittedAt || enquiry.date);

  const timeElapsed = getTimeSince(enquiry.createdAt || enquiry.submittedAt || enquiry.date);

  // Status on screen at export time
  const currentStatus = displayVal(enquiry.status || 'New');
  let statusBg = [226, 232, 240];
  let statusText = [51, 65, 85];
  if (currentStatus.toLowerCase() === 'new') {
    statusBg = [254, 226, 226]; // light red
    statusText = [220, 38, 38]; // dark red
  } else if (currentStatus.toLowerCase() === 'contacted' || currentStatus.toLowerCase() === 'in progress') {
    statusBg = [219, 234, 254]; // light blue
    statusText = [37, 99, 235]; // dark blue
  } else if (currentStatus.toLowerCase() === 'closed' || currentStatus.toLowerCase() === 'resolved') {
    statusBg = [241, 245, 249]; // grey
    statusText = [71, 85, 105];
  }

  // Enquiry Type badge
  const rawType = (enquiry.enquiryType || 'Product Enquiry').toUpperCase();
  let displayType = 'PRODUCT ENQUIRY';
  if (rawType.includes('DEALER')) displayType = 'DEALER ENQUIRY';
  else if (rawType.includes('TECH')) displayType = 'TECHNICAL SUPPORT';
  else if (rawType.includes('PROJECT')) displayType = 'PROJECT REQUIREMENTS';

  // Resolve Product details via linked productId if available
  const linkedProduct = enquiry.productId || matchedProduct || null;
  const realProductName =
    (linkedProduct && linkedProduct.name) ||
    enquiry.productName ||
    enquiry.productInterested ||
    enquiry.projectName ||
    enquiry.subject ||
    'Not provided';

  // Do NOT use TDS file code TDS-71T1-24 as the product SKU. Use linked product real SKU!
  let realProductSku = 'Not provided';
  if (linkedProduct && linkedProduct.sku) {
    realProductSku = linkedProduct.sku;
  } else if (enquiry.productSku) {
    realProductSku = enquiry.productSku;
  } else if (enquiry.skuOrClass && !enquiry.skuOrClass.startsWith('TDS')) {
    realProductSku = enquiry.skuOrClass;
  }

  const realQuantity = enquiry.quantity
    ? `${enquiry.quantity} ${enquiry.unit || 'KG'}`
    : enquiry.estimatedVolume
    ? enquiry.estimatedVolume
    : 'Not provided';

  const realTimeline = enquiry.timeline || enquiry.requiredDate || enquiry.targetDeliveryDate || 'Standard Schedule';
  const realCategory =
    (linkedProduct && linkedProduct.category) || enquiry.category || 'Welding Consumables';
  const realAwsClass =
    (linkedProduct && (linkedProduct.awsClass || linkedProduct.awsClassification)) ||
    (enquiry.skuOrClass && !enquiry.skuOrClass.startsWith('TDS') ? enquiry.skuOrClass : 'AWS A5.20 E71T-1C');

  // Client Details
  const clientCompany = displayVal(enquiry.companyName || enquiry.company);
  const clientName = displayVal(enquiry.contactName || enquiry.name || enquiry.customer);
  const clientRole = displayVal(enquiry.role || 'Engineering Contact');
  const clientEmail = displayVal(enquiry.email);
  const clientPhone = displayVal(enquiry.phone);
  const clientIndustry = displayVal(enquiry.industryName || enquiry.industry || 'Heavy Industrial');
  const clientLocation = displayVal(enquiry.primaryLocation || enquiry.address || 'Direct submission');
  const clientCountry = displayVal(enquiry.country || enquiry.region || 'Global');

  // =========================================================================
  // 1. HEADER BAND
  // =========================================================================
  doc.setFillColor(...SAFETY_ORANGE);
  doc.rect(margin, 8, contentWidth, 1.2, 'F');

  doc.setFillColor(...NAVY);
  doc.rect(margin, 9.2, contentWidth, 23, 'F');

  // Brand Name & Subtext
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SPRIMAX', margin + 5, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 215, 245);
  doc.text('INDUSTRIAL METALLURGICAL SOLUTIONS', margin + 5, 23);

  doc.setFontSize(7);
  doc.setTextColor(170, 190, 230);
  doc.text(`Reference No: ${refNo}`, margin + 5, 28);

  // Document Title & Badges
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('ENQUIRY SUMMARY', pageWidth - margin - 5, 18, { align: 'right' });

  // Status Badge
  const statusBadgeW = doc.getTextWidth(currentStatus.toUpperCase()) + 6;
  const statusBadgeX = pageWidth - margin - 5 - statusBadgeW;
  doc.setFillColor(...statusBg);
  doc.roundedRect(statusBadgeX, 20.5, statusBadgeW, 4.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...statusText);
  doc.text(currentStatus.toUpperCase(), statusBadgeX + statusBadgeW / 2, 23.7, { align: 'center' });

  // Enquiry Type Badge
  const typeBadgeW = doc.getTextWidth(displayType) + 6;
  const typeBadgeX = statusBadgeX - typeBadgeW - 3;
  doc.setFillColor(255, 230, 230);
  doc.roundedRect(typeBadgeX, 20.5, typeBadgeW, 4.5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...SAFETY_ORANGE);
  doc.text(displayType, typeBadgeX + typeBadgeW / 2, 23.7, { align: 'center' });

  // Timestamps
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(200, 215, 245);
  doc.text(
    `Submitted: ${submittedTimestamp}  |  Exported: ${exportTimestamp} by ${adminName}`,
    pageWidth - margin - 5,
    29.5,
    { align: 'right' }
  );

  let currentY = 36;

  // =========================================================================
  // 2. ENQUIRY TITLE (Company - Product)
  // =========================================================================
  const enquiryTitleText = `${clientCompany} - ${realProductName}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...NAVY);
  doc.text(enquiryTitleText, margin, currentY);

  currentY += 4;
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 4;

  // =========================================================================
  // 3. CLIENT PROFILE (TWO COLUMNS)
  // =========================================================================
  const colWidth = (contentWidth - 6) / 2;
  const leftColX = margin;
  const rightColX = margin + colWidth + 6;
  const cardHeight = 33;

  const drawCard = (x, y, w, h, title) => {
    doc.setFillColor(...BG_LIGHT_GREY);
    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...STEEL_BLUE);
    doc.text(title.toUpperCase(), x + 3.5, y + 5);

    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.2);
    doc.line(x + 3.5, y + 6.5, x + w - 3.5, y + 6.5);
  };

  // Left Card: Contact Details
  drawCard(leftColX, currentY, colWidth, cardHeight, 'Contact Details');
  const contactLines = [
    { label: 'Name', val: clientName },
    { label: 'Role', val: clientRole },
    { label: 'Email', val: clientEmail },
    { label: 'Phone', val: clientPhone },
  ];

  let lineY = currentY + 11;
  contactLines.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(item.label + ':', leftColX + 4, lineY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_DARK);
    doc.text(String(item.val), leftColX + 22, lineY);
    lineY += 5;
  });

  // Right Card: Organization Details
  drawCard(rightColX, currentY, colWidth, cardHeight, 'Organization Details');
  const orgLines = [
    { label: 'Company', val: clientCompany },
    { label: 'Industry', val: clientIndustry },
    { label: 'Source', val: clientLocation },
    { label: 'Country', val: clientCountry },
  ];

  lineY = currentY + 11;
  orgLines.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(item.label + ':', rightColX + 4, lineY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_DARK);
    doc.text(String(item.val), rightColX + 22, lineY);
    lineY += 5;
  });

  currentY += cardHeight + 5;

  // =========================================================================
  // 4. REQUESTED PRODUCT SPECS TABLE
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...NAVY);
  doc.text('REQUESTED PRODUCT & ENGINEERING SPECS', margin, currentY);
  currentY += 2;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Field', 'Product Value', 'Specification / Schedule', 'Classification']],
    body: [
      ['Product Name', realProductName, `Category: ${realCategory}`, `AWS Class: ${realAwsClass}`],
      ['Product SKU', realProductSku, `Quantity: ${realQuantity}`, `Required By: ${realTimeline}`],
      [
        'Application & Standard',
        displayVal(enquiry.application || enquiry.projectScope),
        displayVal(enquiry.specifications || enquiry.standards),
        displayVal(enquiry.baseMaterials || 'Structural Mild & Alloy Steel'),
      ],
    ],
    theme: 'plain',
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2,
    },
    bodyStyles: {
      fillColor: BG_LIGHT_GREY,
      textColor: TEXT_DARK,
      fontSize: 7.5,
      cellPadding: 2.2,
      lineColor: BORDER_COLOR,
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // =========================================================================
  // 5. CUSTOMER INQUIRY DESCRIPTION (QUOTE-STYLE BOX)
  // =========================================================================
  const messageText = displayVal(enquiry.message || enquiry.projectScopeDetails);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...NAVY);
  doc.text('CUSTOMER INQUIRY DESCRIPTION', margin, currentY);
  currentY += 2.5;

  const quoteBoxWidth = contentWidth;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  const wrappedMessage = doc.splitTextToSize(`"${messageText}"`, quoteBoxWidth - 14);
  const quoteHeight = Math.max(13, wrappedMessage.length * 4.2 + 5);

  doc.setFillColor(...BG_LIGHT_GREY);
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, quoteBoxWidth, quoteHeight, 1.5, 1.5, 'FD');

  doc.setFillColor(...SAFETY_ORANGE);
  doc.roundedRect(margin, currentY, 2, quoteHeight, 0.8, 0.8, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_DARK);
  doc.text(wrappedMessage, margin + 6, currentY + 5.5);

  currentY += quoteHeight + 5;

  // =========================================================================
  // 6. KEY REQUIREMENTS & 7. STATUS WORKFLOW (SIDE-BY-SIDE)
  // =========================================================================
  const sideCardHeight = 35;
  const halfColW = (contentWidth - 6) / 2;

  // --- 6. Key Requirements ---
  drawCard(leftColX, currentY, halfColW, sideCardHeight, 'Key Requirements (Auto-Detected)');
  const detectedReqs = detectKeyRequirements(enquiry);

  let reqY = currentY + 11;
  detectedReqs.forEach((req) => {
    doc.setFillColor(16, 185, 129);
    doc.circle(leftColX + 6, reqY - 1, 1.3, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(req.label + ':', leftColX + 10, reqY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_DARK);
    doc.text(String(req.value), leftColX + 44, reqY);

    reqY += 5.2;
  });

  // --- 7. Status Workflow Timeline ---
  drawCard(rightColX, currentY, halfColW, sideCardHeight, 'Status Workflow Timeline');

  // Use real statusHistory if present, otherwise fallback to stages
  const statusHistory = Array.isArray(enquiry.statusHistory) && enquiry.statusHistory.length > 0 ? enquiry.statusHistory : null;

  const isClosed = currentStatus.toLowerCase() === 'closed' || currentStatus.toLowerCase() === 'resolved';
  const isContacted = currentStatus.toLowerCase() === 'contacted' || currentStatus.toLowerCase() === 'in progress' || isClosed;

  const timelineStages = [
    {
      stage: 'Transmission Received',
      date: submittedTimestamp,
      note: 'Logged in database',
      state: 'done',
    },
    {
      stage: `Current State: ${currentStatus}`,
      date: isContacted ? (statusHistory?.[1]?.timestamp ? formatLocalTimestampWithTz(statusHistory[1].timestamp) : 'Action in progress') : submittedTimestamp,
      note: isContacted ? 'Assigned & under review' : 'Awaiting first response',
      state: isContacted ? 'done' : 'amber',
    },
    {
      stage: 'Commercial Resolution',
      date: isClosed ? (statusHistory?.[2]?.timestamp ? formatLocalTimestampWithTz(statusHistory[2].timestamp) : exportTimestamp) : 'Pending',
      note: isClosed ? 'Commercial resolution fulfilled' : 'Awaiting final action',
      state: isClosed ? 'done' : 'pending',
    },
  ];

  let tlY = currentY + 11;
  timelineStages.forEach((step, idx) => {
    if (step.state === 'done') {
      doc.setFillColor(16, 185, 129);
      doc.circle(rightColX + 6, tlY - 1, 1.4, 'F');
    } else if (step.state === 'amber') {
      doc.setFillColor(245, 158, 11);
      doc.circle(rightColX + 6, tlY - 1, 1.4, 'F');
    } else {
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.4);
      doc.circle(rightColX + 6, tlY - 1, 1.4, 'D');
    }

    if (idx < 2) {
      doc.setDrawColor(...BORDER_COLOR);
      doc.setLineWidth(0.3);
      doc.line(rightColX + 6, tlY + 0.8, rightColX + 6, tlY + 4.8);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_DARK);
    doc.text(step.stage, rightColX + 11, tlY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(`- ${step.note}`, rightColX + 46, tlY);

    tlY += 6.5;
  });

  currentY += sideCardHeight + 5;

  // =========================================================================
  // 8. INTERNAL HANDLING BLOCK (Assigned To, Follow-up, Time Since, Internal Notes)
  // =========================================================================
  const handlingHeight = 27;
  drawCard(margin, currentY, contentWidth, handlingHeight, 'Internal Handling & Operational Notes');

  const handY1 = currentY + 11;

  // Assigned To
  const assignedValue = enquiry.assignedTo || 'Unassigned (Sales Queue)';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Assigned to:', margin + 4, handY1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_DARK);
  doc.text(assignedValue, margin + 25, handY1);

  // Follow-up Flag
  const hasFollowUp = isFollowUp || Boolean(enquiry.followUp?.isSet);
  const followUpDateText = enquiry.followUp?.dueDate ? ` (Due: ${new Date(enquiry.followUp.dueDate).toLocaleDateString()})` : '';
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Follow-up Flag:', margin + 75, handY1);
  doc.setFont('helvetica', 'bold');
  if (hasFollowUp) {
    doc.setTextColor(...SAFETY_ORANGE);
    doc.text(`YES - Priority Required${followUpDateText}`, margin + 98, handY1);
  } else {
    doc.setTextColor(...TEXT_DARK);
    doc.text('No (Standard Queue)', margin + 98, handY1);
  }

  // Elapsed Time
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Elapsed Time:', margin + 145, handY1);
  doc.setFont('helvetica', 'bold');
  if (timeElapsed.isOverdue && currentStatus.toLowerCase() === 'new') {
    doc.setTextColor(...SAFETY_ORANGE);
    doc.text(`${timeElapsed.text} [OVERDUE > 48H]`, margin + 165, handY1);
  } else {
    doc.setTextColor(...TEXT_DARK);
    doc.text(timeElapsed.text, margin + 165, handY1);
  }

  // Internal Notes Lined Box
  const noteBoxY = handY1 + 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Handling Notes:', margin + 4, noteBoxY + 3);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin + 25, noteBoxY, contentWidth - 29, 8, 1, 1, 'FD');

  const notesContent = internalNotes || enquiry.internalNotes || 'Internal engineering & commercial assessment pending initial response.';
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_DARK);
  doc.text(doc.splitTextToSize(notesContent, contentWidth - 34)[0] || '', margin + 28, noteBoxY + 5);

  // =========================================================================
  // 9. FOOTER
  // =========================================================================
  const footerY = pageHeight - 8;
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.4);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...SAFETY_ORANGE);
  doc.text('Confidential – For internal use only', margin, footerY + 1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('  |  SPRIMAX Industrial Technologies Ltd.  |  support@sprimax.com', margin + 44, footerY + 1);

  doc.text(`Page 1 of 1  |  Exported: ${exportTimestamp}`, pageWidth - margin, footerY + 1, { align: 'right' });

  // Save PDF
  const filename = `SPRIMAX_Enquiry_${refNo}.pdf`;
  doc.save(filename);
  return filename;
}
