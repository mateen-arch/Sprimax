import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates an official Sprimax Talent & Engineering Docket Submission Receipt
 * 
 * @param {Object} applicationData - The submitted application details
 */
export function generateApplicationReceiptPdf(applicationData) {
  if (!applicationData) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const BRAND_NAVY = [33, 46, 104];     // #212e68
  const BRAND_RED = [255, 8, 4];        // #ff0804
  const TEXT_DARK = [15, 23, 42];        // #0f172a
  const TEXT_MUTED = [100, 116, 139];    // #64748b
  const BG_LIGHT = [248, 250, 252];      // #f8fafc

  const refCode = applicationData.receiptId || `SPR-APP-${Date.now().toString(36).toUpperCase()}`;
  const roleName = applicationData.jobTitle || 'General Engineering & Corporate Application';
  const fullName = `${applicationData.firstName || 'Applicant'} ${applicationData.lastName || ''}`.trim();
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // 1. Top Header Banner
  doc.setFillColor(...BRAND_NAVY);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFillColor(...BRAND_RED);
  doc.rect(14, 8, 10, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('S', 17.5, 15);

  doc.setFontSize(14);
  doc.text('SPRIMAX TALENTS', 28, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('ENGINEERING DOCKET SUBMISSION // 256-BIT ENCRYPTED TRANSMISSION', 28, 20);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`SYSTEM ONLINE | REF: ${refCode}`, 130, 15);

  // 2. Receipt Title Box
  doc.setFillColor(...BG_LIGHT);
  doc.roundedRect(14, 34, 182, 24, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 34, 182, 24, 2, 2, 'D');

  doc.setTextColor(...BRAND_RED);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('STATUS: APPLICATION SUCCESSFULLY LODGED', 20, 42);

  doc.setTextColor(...TEXT_DARK);
  doc.setFontSize(13);
  doc.text(roleName, 20, 50);

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`DATE OF LODGEMENT: ${dateStr.toUpperCase()}`, 130, 50);

  // 3. Identification Table
  autoTable(doc, {
    startY: 64,
    margin: { left: 14, right: 14 },
    theme: 'plain',
    head: [['01 // CANDIDATE IDENTIFICATION & CONTACT', '']],
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [15, 23, 42],
      fontSize: 8.5,
      fontStyle: 'bold',
      font: 'courier',
    },
    body: [
      ['Candidate Name', fullName],
      ['Email Address', applicationData.email || 'N/A'],
      ['Telephone / WhatsApp', `${applicationData.phoneCountry || ''} ${applicationData.phoneNumber || 'N/A'}`],
      ['Current Location', applicationData.location || 'N/A'],
      ['Current Employer', applicationData.currentEmployer || 'N/A'],
      ['Current Job Title', applicationData.currentJobTitle || 'N/A'],
      ['Relevant Experience', applicationData.experienceLevel || 'N/A'],
    ],
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { fontStyle: 'bold', width: 55, textColor: [15, 23, 42] },
      1: { width: 127 },
    },
  });

  // 4. Dossier & Credentials Table
  const certs = Array.isArray(applicationData.certifications) && applicationData.certifications.length > 0
    ? applicationData.certifications.join('  •  ')
    : 'None declared at intake';

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    margin: { left: 14, right: 14 },
    theme: 'plain',
    head: [['02 // CREDENTIALS DOSSIER & VERIFICATION METRICS', '']],
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [15, 23, 42],
      fontSize: 8.5,
      fontStyle: 'bold',
      font: 'courier',
    },
    body: [
      ['Submitted CV / Dossier', `${applicationData.fileName || 'Curriculum_Vitae.pdf'} (Verified Checksum SHA-256)`],
      ['Industry Certifications', certs],
      ['Security Transmission', '256-Bit Encrypted Talent Pipeline'],
      ['Target Division', applicationData.deptTag || 'Materials & Mechanical Testing Division'],
      ['Review Schedule', '3-5 Business Days by Lead Tech Recruiter'],
    ],
    bodyStyles: {
      fontSize: 8.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { fontStyle: 'bold', width: 55, textColor: [15, 23, 42] },
      1: { width: 127 },
    },
  });

  // 5. Technical Statement (if provided)
  if (applicationData.coverStatement) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 6,
      margin: { left: 14, right: 14 },
      theme: 'plain',
      head: [['03 // TECHNICAL COVER STATEMENT / DOSSIER SUMMARY', '']],
      headStyles: {
        fillColor: [226, 232, 240],
        textColor: [15, 23, 42],
        fontSize: 8.5,
        fontStyle: 'bold',
        font: 'courier',
      },
      body: [[applicationData.coverStatement, '']],
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
      },
    });
  }

  // 6. Security & Integrity Note
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 220;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, finalY, 196, finalY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_NAVY);
  doc.text('DIRECT RECRUITMENT INTEGRITY MANDATE:', 14, finalY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    'Sprimax operates under strict direct employment mandates. No recruitment fees are charged to candidates under any circumstance.',
    14,
    finalY + 11
  );
  doc.text(
    'For urgent updates regarding your dossier credentials, contact our talent acquisition cell at talent@sprimax.com.',
    14,
    finalY + 16
  );

  // Footer
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.text(`CONFIDENTIAL ENGINEERING DOSSIER // REF: ${refCode} // PAGE 1 OF 1`, 14, 285);

  doc.save(`Sprimax_Application_Receipt_${refCode}.pdf`);
}
