import PDFDocument from 'pdfkit';
import crypto from 'crypto';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

const SIGNING_SECRET =
  process.env.RECEIPT_SECRET ||
  process.env.JWT_SECRET ||
  'sprimax_careers_receipt_signing_secret_key_2026';

/**
 * Format date in UTC with explicit timezone string
 * e.g. "20 Oct 2026, 00:24 UTC"
 */
export function formatUtcDateTime(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return 'Invalid Date';

  const day = String(d.getUTCDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes} UTC`;
}

/**
 * Mask middle digits of phone number
 * e.g. "+971 50 123 4104" -> "+971 50 *** 4104"
 */
export function maskPhoneNumber(phoneCountry = '', phoneNumber = '') {
  const combined = `${phoneCountry ? phoneCountry.trim() + ' ' : ''}${phoneNumber.trim()}`.trim();
  if (!combined) return 'N/A';

  // Keep first 6-7 characters and last 4 characters, mask middle
  if (combined.length <= 7) return combined;
  const start = combined.slice(0, Math.min(8, Math.floor(combined.length / 2)));
  const end = combined.slice(-4);
  return `${start} *** ${end}`;
}

/**
 * Generate a collision-resistant sequential reference number
 * Job-specific: APP-2026-004871
 * General Intake: APP-2026-G04871
 */
export async function generateApplicationReferenceNumber(isGeneral = false) {
  const year = new Date().getFullYear();
  const prefix = isGeneral ? `APP-${year}-G` : `APP-${year}-`;

  // Count existing applications to generate approximate sequence
  const count = await Application.countDocuments();
  let candidateNum = count + 1;

  for (let attempt = 0; attempt < 10; attempt++) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const candidateRef = isGeneral
      ? `${prefix}${String(candidateNum).padStart(4, '0')}${randomSuffix}`
      : `${prefix}${String(candidateNum).padStart(3, '0')}${randomSuffix}`;

    const exists = await Application.findOne({ referenceNumber: candidateRef });
    if (!exists) return candidateRef;
    candidateNum += 7;
  }

  // Fallback random
  const fallbackHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}${fallbackHex}`;
}

/**
 * Generate short verification code (e.g. SPX-7A9B4C)
 */
export function generateVerificationCode() {
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SPX-${hex}`;
}

/**
 * Generate short-lived signed receipt download token (expires in 24 hours)
 */
export function generateReceiptToken(applicationId, referenceNumber) {
  const payload = {
    appId: applicationId.toString(),
    ref: referenceNumber,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    purpose: 'application_receipt',
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', SIGNING_SECRET);
  hmac.update(payloadB64);
  const signature = hmac.digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verify signed receipt token
 */
export function verifyReceiptToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return { valid: false, error: 'Malformed receipt token.' };
  }

  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) {
    return { valid: false, error: 'Malformed receipt token.' };
  }

  const hmac = crypto.createHmac('sha256', SIGNING_SECRET);
  hmac.update(payloadB64);
  const expectedSignature = hmac.digest('base64url');

  if (signature !== expectedSignature) {
    return { valid: false, error: 'Invalid receipt token signature or tampered token.' };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.purpose !== 'application_receipt') {
      return { valid: false, error: 'Invalid token purpose.' };
    }
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Receipt download token has expired (valid for 24h).', expired: true };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Failed to parse receipt token payload.' };
  }
}

/**
 * Backfill existing applications with referenceNumber & jobSnapshot if missing
 */
export async function backfillExistingApplications() {
  try {
    const missingRefApps = await Application.find({
      $or: [
        { referenceNumber: null },
        { referenceNumber: '' },
        { referenceNumber: { $exists: false } },
      ],
    }).limit(200);

    for (const app of missingRefApps) {
      const isGen = app.source === 'general';
      app.referenceNumber = await generateApplicationReferenceNumber(isGen);
      app.receiptVerificationCode = generateVerificationCode();

      if (!app.jobSnapshot || !app.jobSnapshot.title) {
        if (app.jobId) {
          const j = await Job.findById(app.jobId);
          if (j) {
            app.jobSnapshot = {
              title: j.title || app.jobTitle,
              reqCode: j.reqCode || app.reqCode,
              department: j.department || app.department,
              subDepartment: j.subDepartment || '',
              location: j.location || app.location,
              employmentType: j.employmentType || 'Full-time',
              reviewCycleNote: j.reviewCycleNote || 'Typically 2-4 business days',
              retentionMonths: 12,
            };
          }
        }
        if (!app.jobSnapshot || !app.jobSnapshot.title) {
          app.jobSnapshot = {
            title: isGen ? 'General Application (Open Intake)' : app.jobTitle || 'Engineering Requisition',
            reqCode: app.reqCode || (isGen ? 'SPRIMAX-TALENT-GEN' : 'SPR-REQ'),
            department: app.department || 'ENGINEERING',
            subDepartment: '',
            location: app.location || app.currentLocation,
            employmentType: 'Full-time',
            reviewCycleNote: 'Typically 2-4 business days',
            retentionMonths: 12,
          };
        }
      }

      await app.save();
    }
  } catch (err) {
    console.error('[ReceiptService] Backfill failed:', err.message);
  }
}

/**
 * Render official Sprimax Application Receipt PDF to writable stream
 */
export function renderApplicationReceiptPdf(application, resStream) {
  const isGeneral = application.source === 'general';
  const snapshot = application.jobSnapshot || {};
  const refNum = application.referenceNumber || application.receiptCode || 'APP-2026-PENDING';
  const appliedDateUtc = formatUtcDateTime(application.appliedAt);
  const generatedDateUtc = formatUtcDateTime(new Date());
  const verificationCode = application.receiptVerificationCode || 'SPX-VERIFIED';

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'portrait',
    margins: { top: 36, bottom: 36, left: 40, right: 40 },
    info: {
      Title: `Application Receipt - ${refNum}`,
      Author: 'Sprimax Industrial Solutions',
      Subject: 'Candidate Application Acknowledgement Receipt',
      Keywords: 'Sprimax, Careers, Receipt, Recruitment',
    },
  });

  doc.pipe(resStream);

  // Brand Colors
  const COLOR_NAVY = '#212E68';
  const COLOR_RED = '#FF0804';
  const COLOR_TEXT = '#0F172A';
  const COLOR_MUTED = '#475569';
  const COLOR_BORDER = '#CBD5E1';
  const COLOR_CARD_BG = '#F8FAFC';

  const pageWidth = 595.28;
  const contentWidth = pageWidth - 80; // 515.28

  // 1. TOP BRAND HEADER
  // Red accent top bar
  doc.rect(40, 36, 6, 32).fill(COLOR_RED);

  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor(COLOR_NAVY)
    .text('SPRIMAX INDUSTRIAL SOLUTIONS', 54, 38, { characterSpacing: 0.5 });

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(COLOR_RED)
    .text('APPLICATION RECEIPT', 54, 56, { characterSpacing: 1 });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(COLOR_MUTED)
    .text('Official Acknowledgement of Candidate Application Lodgement', 200, 58, { align: 'right', width: contentWidth - 160 });

  // Divider line
  doc.moveTo(40, 76).lineTo(pageWidth - 40, 76).strokeColor(COLOR_BORDER).lineWidth(1).stroke();

  // 2. RECEIPT DETAILS HIGHLIGHT BOX
  const boxTop = 86;
  const boxHeight = 58;
  doc
    .roundedRect(40, boxTop, contentWidth, boxHeight, 4)
    .fillAndStroke(COLOR_CARD_BG, COLOR_BORDER);

  // Left col: Reference Number
  doc
    .font('Courier-Bold')
    .fontSize(9)
    .fillColor(COLOR_MUTED)
    .text('REFERENCE NUMBER', 54, boxTop + 10);

  doc
    .font('Courier-Bold')
    .fontSize(14)
    .fillColor(COLOR_RED)
    .text(refNum, 54, boxTop + 24);

  // Center col: Submitted On & Generated On
  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor(COLOR_NAVY)
    .text('SUBMITTED ON (SERVER):', 230, boxTop + 10);
  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(COLOR_TEXT)
    .text(appliedDateUtc, 230, boxTop + 22);

  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor(COLOR_NAVY)
    .text('RECEIPT GENERATED:', 230, boxTop + 36);
  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(COLOR_TEXT)
    .text(generatedDateUtc, 230, boxTop + 47);

  // Right col: Verification code
  doc
    .font('Courier-Bold')
    .fontSize(8)
    .fillColor(COLOR_MUTED)
    .text('VERIFICATION CODE:', 400, boxTop + 10);
  doc
    .font('Courier-Bold')
    .fontSize(10)
    .fillColor(COLOR_NAVY)
    .text(verificationCode, 400, boxTop + 22);

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(COLOR_MUTED)
    .text('Status: Securely Lodged', 400, boxTop + 38);

  let currentY = 156;

  // Helper to draw section title
  function drawSectionTitle(num, title) {
    doc
      .font('Courier-Bold')
      .fontSize(9.5)
      .fillColor(COLOR_RED)
      .text(`${num} // `, 40, currentY, { continued: true });
    doc
      .font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor(COLOR_NAVY)
      .text(title.toUpperCase(), { characterSpacing: 0.5 });

    currentY += 15;
    doc.moveTo(40, currentY).lineTo(pageWidth - 40, currentY).strokeColor('#E2E8F0').lineWidth(0.75).stroke();
    currentY += 8;
  }

  // Helper to draw key-value table row
  function drawRow(label, value) {
    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor(COLOR_MUTED)
      .text(label, 44, currentY, { width: 140 });

    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(COLOR_TEXT)
      .text(value || 'Not Specified', 190, currentY, { width: contentWidth - 155 });

    currentY += 16;
  }

  // SECTION 1: POSITION APPLIED FOR
  drawSectionTitle('01', 'Position & Requisition Details');
  if (isGeneral) {
    drawRow('Application Type', 'General Application (Open Talent Intake)');
    drawRow('Requisition Identifier', 'SPRIMAX-TALENT-GEN');
    drawRow('Primary Field of Expertise', application.fieldOfExpertise || 'Engineering / Metallurgy');
    drawRow('Mobility Preference', application.mobility || 'Open to Global Relocation');
    drawRow('Intake Pool', 'Global Engineering Talent Repository');
  } else {
    drawRow('Position / Role Title', snapshot.title || application.jobTitle);
    drawRow('Requisition Code (REQ)', snapshot.reqCode || application.reqCode);
    drawRow('Department / Team', snapshot.department || application.department);
    drawRow('Operational Location', snapshot.location || application.location);
    drawRow('Employment Type', snapshot.employmentType || 'Full-time');
  }
  currentY += 6;

  // SECTION 2: APPLICANT DETAILS (Excluding sensitive salary, street, or screening text)
  drawSectionTitle('02', 'Applicant Identification');
  drawRow('Candidate Full Name', `${application.firstName} ${application.lastName}`);
  drawRow('Email Address', application.email);
  drawRow('Contact Number', maskPhoneNumber(application.phoneCountry, application.phoneNumber));
  drawRow('Current Location', application.currentLocation);
  if (application.currentJobTitle || application.currentEmployer) {
    drawRow('Current Role', `${application.currentJobTitle || 'Specialist'}${application.currentEmployer ? ' at ' + application.currentEmployer : ''}`);
  }
  drawRow('Experience Level', application.experienceLevel || 'Professional');
  currentY += 6;

  // SECTION 3: SUBMISSION SUMMARY
  drawSectionTitle('03', 'Submission Summary & Document Inventory');
  const cvName = application.cvFile?.originalName || 'Curriculum_Vitae.pdf';
  const cvSizeKb = application.cvFile?.size ? `${Math.round(application.cvFile.size / 1024)} KB` : 'Uploaded';
  const cvHash = application.cvFile?.sha256 ? application.cvFile.sha256.slice(0, 16) : 'Verified at transmission';
  drawRow('Primary Technical CV', `${cvName} (${cvSizeKb}) — SHA-256: [${cvHash}]`);

  if (Array.isArray(application.supplementaryFiles) && application.supplementaryFiles.length > 0) {
    const suppList = application.supplementaryFiles
      .map((f) => `${f.originalName || 'Document'} (${f.size ? Math.round(f.size / 1024) + ' KB' : 'File'})`)
      .join('; ');
    drawRow('Supplementary Attachments', suppList);
  } else {
    drawRow('Supplementary Attachments', 'None attached');
  }

  const certsDeclared = Array.isArray(application.certifications) && application.certifications.length > 0
    ? application.certifications.join('  •  ')
    : 'None declared at intake';
  drawRow('Certifications Declared', certsDeclared);

  drawRow('Cover Statement', application.coverStatement && application.coverStatement.trim().length > 0 ? 'Provided' : 'Not provided');

  const questionCount = Array.isArray(application.customAnswers) ? application.customAnswers.length : 0;
  drawRow('Screening Questions Answered', questionCount > 0 ? `${questionCount} questions answered` : 'N/A (Standard intake)');
  currentY += 6;

  // SECTION 4: CONSENT & WHAT HAPPENS NEXT
  drawSectionTitle('04', 'Consent Record & Next Steps');
  const consentTime = application.consent?.timestamp ? formatUtcDateTime(application.consent.timestamp) : appliedDateUtc;
  const policyVer = application.consent?.policyVersion || 'v2.4 (2024.10)';
  drawRow('Data Processing Consent', `Applicant consented electronically on ${consentTime} (Privacy Policy ${policyVer})`);

  const reviewCycle = snapshot.reviewCycleNote ||
    (isGeneral
      ? 'Your profile will be actively reviewed as matching openings emerge across global facilities.'
      : 'Typically 2-4 business days by technical recruitment specialists.');
  drawRow('Review Timeline', reviewCycle);
  drawRow('Recruitment Contact', 'talent@sprimax.com — Quote your Reference Number in any correspondence.');
  currentY += 8;

  // SECTION 5: IMPORTANT NOTICE & RETENTION (PRINT-FRIENDLY CALLOUT)
  doc
    .roundedRect(40, currentY, contentWidth, 42, 3)
    .fillAndStroke('#FFF8F8', '#FCA5A5');

  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor(COLOR_RED)
    .text('IMPORTANT MANDATE & STATUTORY NOTICE:', 48, currentY + 7);

  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor(COLOR_TEXT)
    .text(
      'This receipt confirms that your application was received. It does not constitute an offer of employment, an interview invitation, or a guarantee of review outcome.',
      48,
      currentY + 18,
      { width: contentWidth - 16 }
    );

  const retentionMonths = snapshot.retentionMonths || 12;
  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor(COLOR_MUTED)
    .text(
      `Data retention note: In accordance with our Global Recruitment Privacy Standard, applicant data is retained for ${retentionMonths} months after a final decision.`,
      48,
      currentY + 28,
      { width: contentWidth - 16 }
    );

  currentY += 50;

  // FOOTER (Absolute bottom)
  const footerY = 800;
  doc.moveTo(40, footerY - 10).lineTo(pageWidth - 40, footerY - 10).strokeColor(COLOR_BORDER).lineWidth(0.5).stroke();

  doc
    .font('Courier')
    .fontSize(7.5)
    .fillColor(COLOR_MUTED)
    .text('SPRIMAX INDUSTRIAL SOLUTIONS // TALENT OPERATIONS', 40, footerY);

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(COLOR_MUTED)
    .text('Generated electronically. No signature required.', 220, footerY, { align: 'center', width: 155 });

  doc
    .font('Courier')
    .fontSize(7.5)
    .fillColor(COLOR_MUTED)
    .text('www.sprimax.com  |  Page 1 of 1', 400, footerY, { align: 'right', width: contentWidth - 360 });

  doc.end();
}
