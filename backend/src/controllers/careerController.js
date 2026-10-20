import mongoose from 'mongoose';
import fs from 'fs';
import crypto from 'crypto';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import CareersSetting from '../models/CareersSetting.js';
import {
  generateApplicationReferenceNumber,
  generateVerificationCode,
  generateReceiptToken,
  verifyReceiptToken,
  renderApplicationReceiptPdf,
  backfillExistingApplications,
} from '../utils/receiptService.js';

// Trigger non-blocking backfill for any existing records
backfillExistingApplications();

// In-memory sliding-window rate limiter for receipt downloads
const downloadRateMap = new Map();
const checkRateLimit = (key, maxRequests = 30, windowMs = 60000) => {
  const now = Date.now();
  const timestamps = downloadRateMap.get(key) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);
  if (validTimestamps.length >= maxRequests) {
    return false;
  }
  validTimestamps.push(now);
  downloadRateMap.set(key, validTimestamps);
  return true;
};

// Helper to ensure a unique slug for a job
const generateUniqueSlug = async (title, currentId = null) => {
  let baseSlug = title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
  if (!baseSlug) baseSlug = 'job-opening';

  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const query = { slug };
    if (currentId) query._id = { $ne: currentId };
    const exists = await Job.findOne(query);
    if (!exists) break;
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
};

// Helper to generate a unique Requisition ID if not provided
const generateUniqueReqCode = async (department = 'ENG', location = 'DXB') => {
  const deptCode = department.slice(0, 3).toUpperCase();
  const locCode = location.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'MEA';
  let counter = 1000 + Math.floor(Math.random() * 9000);
  let reqCode = `${deptCode}-${counter}-${locCode}`;

  while (await Job.findOne({ reqCode })) {
    counter = 1000 + Math.floor(Math.random() * 9000);
    reqCode = `${deptCode}-${counter}-${locCode}`;
  }
  return reqCode;
};

// Ensure settings exist
const getOrCreateSettings = async () => {
  let settings = await CareersSetting.findOne();
  if (!settings) {
    settings = await CareersSetting.create({});
  }
  return settings;
};

// =========================================================================
// PUBLIC CONTROLLERS
// =========================================================================

/**
 * @desc Get all open jobs for public careers listing
 * @route GET /api/careers/jobs
 */
export const getPublicJobs = async (req, res) => {
  try {
    const { search, location, department, type } = req.query;
    const now = new Date();

    const query = {
      status: 'Open',
      deletedAt: null,
      $or: [{ postedAt: { $lte: now } }, { postedAt: null }],
    };

    // Filter out expired jobs if closingDate is past
    query.$and = [
      {
        $or: [{ closingDate: { $gt: now } }, { closingDate: null }],
      },
    ];

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { reqCode: searchRegex },
        { department: searchRegex },
        { location: searchRegex },
        { tagline: searchRegex },
      ];
    }

    if (location && location !== 'all') {
      query.location = new RegExp(location.trim(), 'i');
    }

    if (department && department !== 'all') {
      query.department = new RegExp(department.trim(), 'i');
    }

    if (type && type !== 'all') {
      query.employmentType = type;
    }

    // Sort: Featured first, then newest posted
    const jobs = await Job.find(query).sort({ featured: -1, postedAt: -1, createdAt: -1 });

    // Distinct locations from open jobs for filter dropdown
    const allOpenJobs = await Job.find({ status: 'Open', deletedAt: null }).select('location department');
    const availableLocations = Array.from(new Set(allOpenJobs.map((j) => j.location).filter(Boolean)));
    const availableDepartments = Array.from(new Set(allOpenJobs.map((j) => j.department).filter(Boolean)));

    return res.status(200).json({
      success: true,
      jobs,
      total: jobs.length,
      availableLocations,
      availableDepartments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get single job details by slug or ID
 * @route GET /api/careers/jobs/:identifier
 */
export const getPublicJobById = async (req, res) => {
  try {
    const { identifier } = req.params;
    let job = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      job = await Job.findOne({ _id: identifier, deletedAt: null });
    }
    if (!job) {
      job = await Job.findOne({ slug: identifier, deletedAt: null });
    }

    if (!job) {
      return res.status(404).json({ success: false, message: 'Career role not found' });
    }

    // If job is closed or paused, return flag so frontend can render friendly closed page
    const isClosed = job.status !== 'Open' || (job.closingDate && new Date(job.closingDate) < new Date());

    return res.status(200).json({
      success: true,
      job,
      isClosed,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Submit a job-specific candidate application
 * @route POST /api/careers/apply
 */
export const submitJobApplication = async (req, res) => {
  try {
    const {
      jobId,
      firstName,
      lastName,
      email,
      phoneCountry = '+971',
      phoneNumber,
      currentLocation,
      currentEmployer = '',
      currentJobTitle = '',
      experienceLevel = '',
      certifications = [],
      customAnswers = [],
      coverStatement = '',
      agreed = true,
      cvUrl = '',
      cvOriginalName = '',
      cvSize = 0,
    } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !currentLocation) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, phone number, and location are required.',
      });
    }

    // Check if job exists
    let job = null;
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      job = await Job.findById(jobId);
    }

    // Duplicate check: prevent duplicate application from same email for the same job within 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingApp = await Application.findOne({
      email: email.toLowerCase().trim(),
      jobId: job ? job._id : null,
      appliedAt: { $gte: twentyFourHoursAgo },
      deletedAt: null,
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'An application for this position has already been submitted from this email address within the last 24 hours.',
      });
    }

    // Process file uploaded via multipart if present
    let cvFile = {
      originalName: cvOriginalName || 'Uploaded_CV.pdf',
      filename: '',
      url: cvUrl || '/uploads/sample-cv.pdf',
      size: Number(cvSize) || 0,
      mime: 'application/pdf',
      sha256: '',
    };

    const supplementaryFiles = [];

    if (req.files && req.files.length > 0) {
      const primaryFile = req.files.find((f) => f.fieldname === 'cv' || f.fieldname === 'file') || req.files[0];
      if (primaryFile) {
        let fileSha256 = '';
        try {
          if (primaryFile.path && fs.existsSync(primaryFile.path)) {
            const buf = fs.readFileSync(primaryFile.path);
            fileSha256 = crypto.createHash('sha256').update(buf).digest('hex');
          }
        } catch (e) {
          console.warn('[Careers] Could not compute sha256 for cv:', e.message);
        }

        cvFile = {
          originalName: primaryFile.originalname,
          filename: primaryFile.filename,
          url: `/uploads/${primaryFile.filename}`,
          size: primaryFile.size,
          mime: primaryFile.mimetype,
          sha256: fileSha256,
        };
      }

      // Process supplementary files
      for (const f of req.files) {
        if (f.filename === cvFile.filename) continue;
        let fileSha256 = '';
        try {
          if (f.path && fs.existsSync(f.path)) {
            const buf = fs.readFileSync(f.path);
            fileSha256 = crypto.createHash('sha256').update(buf).digest('hex');
          }
        } catch (e) {}

        supplementaryFiles.push({
          originalName: f.originalname,
          filename: f.filename,
          url: `/uploads/${f.filename}`,
          size: f.size,
          mime: f.mimetype,
          sha256: fileSha256,
        });
      }
    }

    const referenceNumber = await generateApplicationReferenceNumber(false);
    const receiptVerificationCode = generateVerificationCode();

    const jobSnapshot = {
      title: job ? job.title : 'Engineering Position',
      reqCode: job ? job.reqCode : 'SPRIMAX-ENG-GEN',
      department: job ? job.department : 'ENGINEERING',
      subDepartment: job?.subDepartment || '',
      location: job ? job.location : currentLocation,
      employmentType: job?.employmentType || 'Full-time',
      reviewCycleNote: job?.reviewCycleNote || 'Typically 2-4 business days',
      retentionMonths: 12,
    };

    const application = await Application.create({
      jobId: job ? job._id : null,
      jobTitle: job ? job.title : 'General Engineering Docket',
      reqCode: job ? job.reqCode : 'SPRIMAX-TALENT-GEN',
      department: job ? job.department : 'ENGINEERING',
      location: job ? job.location : currentLocation,
      source: 'job',
      referenceNumber,
      receiptVerificationCode,
      jobSnapshot,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phoneCountry,
      phoneNumber: phoneNumber.trim(),
      currentLocation: currentLocation.trim(),
      currentEmployer: currentEmployer.trim(),
      currentJobTitle: currentJobTitle.trim(),
      experienceLevel,
      cvFile,
      supplementaryFiles,
      certifications: Array.isArray(certifications) ? certifications : typeof certifications === 'string' ? JSON.parse(certifications) : [],
      customAnswers: Array.isArray(customAnswers) ? customAnswers : typeof customAnswers === 'string' ? JSON.parse(customAnswers) : [],
      coverStatement: coverStatement.trim(),
      status: 'New',
      consent: {
        agreed: Boolean(agreed),
        policyVersion: 'v2.4 (2024.10)',
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
        userAgent: req.headers['user-agent'] || '',
        timestamp: new Date(),
      },
      appliedAt: new Date(), // Server-set
    });

    // Increment applicantsCount on the job
    if (job) {
      await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });
    }

    const receiptToken = generateReceiptToken(application._id, application.referenceNumber);

    return res.status(201).json({
      success: true,
      message: 'Your engineering docket has been recorded and submitted successfully.',
      applicationId: application._id,
      referenceNumber: application.referenceNumber,
      receiptToken,
      receiptCode: application.referenceNumber,
      reqCode: application.reqCode,
      jobTitle: application.jobSnapshot?.title || application.jobTitle,
      department: application.jobSnapshot?.department || application.department,
      appliedAt: application.appliedAt,
      application,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Submit a general open talent intake application
 * @route POST /api/careers/apply-general
 */
export const submitGeneralApplication = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneCountry = '+971',
      phoneNumber,
      fieldOfExpertise = 'Metallurgy & Materials Engineering',
      experienceLevel = '5 - 8 Years',
      currentLocation,
      mobility = 'Open to Global Relocation (EMEA, APAC, Americas)',
      summary = '',
      agreed = true,
      cvUrl = '',
      cvOriginalName = '',
      cvSize = 0,
    } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !currentLocation) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, phone number, and location are required.',
      });
    }

    let cvFile = {
      originalName: cvOriginalName || 'General_Engineering_Dossier.pdf',
      filename: '',
      url: cvUrl || '/uploads/sample-cv.pdf',
      size: Number(cvSize) || 0,
      mime: 'application/pdf',
      sha256: '',
    };

    const supplementaryFiles = [];

    if (req.files && req.files.length > 0) {
      const primaryFile = req.files[0];
      let fileSha256 = '';
      try {
        if (primaryFile.path && fs.existsSync(primaryFile.path)) {
          const buf = fs.readFileSync(primaryFile.path);
          fileSha256 = crypto.createHash('sha256').update(buf).digest('hex');
        }
      } catch (e) {}

      cvFile = {
        originalName: primaryFile.originalname,
        filename: primaryFile.filename,
        url: `/uploads/${primaryFile.filename}`,
        size: primaryFile.size,
        mime: primaryFile.mimetype,
        sha256: fileSha256,
      };

      for (let i = 1; i < req.files.length; i++) {
        const f = req.files[i];
        let suppSha256 = '';
        try {
          if (f.path && fs.existsSync(f.path)) {
            const buf = fs.readFileSync(f.path);
            suppSha256 = crypto.createHash('sha256').update(buf).digest('hex');
          }
        } catch (e) {}

        supplementaryFiles.push({
          originalName: f.originalname,
          filename: f.filename,
          url: `/uploads/${f.filename}`,
          size: f.size,
          mime: f.mimetype,
          sha256: suppSha256,
        });
      }
    }

    const referenceNumber = await generateApplicationReferenceNumber(true);
    const receiptVerificationCode = generateVerificationCode();

    const jobSnapshot = {
      title: 'General Application (Open Intake)',
      reqCode: 'SPRIMAX-TALENT-GEN',
      department: 'TALENT ACQUISITION',
      subDepartment: fieldOfExpertise || 'Open Intake',
      location: currentLocation,
      employmentType: 'Full-time / Project-based',
      reviewCycleNote: 'Your profile will be actively reviewed as matching openings emerge across global facilities.',
      retentionMonths: 12,
    };

    const application = await Application.create({
      jobId: null,
      jobTitle: 'General Application (Open Intake)',
      reqCode: 'SPRIMAX-TALENT-GEN',
      department: 'OPEN TALENT INTAKE',
      location: currentLocation,
      source: 'general',
      referenceNumber,
      receiptVerificationCode,
      jobSnapshot,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phoneCountry,
      phoneNumber: phoneNumber.trim(),
      currentLocation: currentLocation.trim(),
      fieldOfExpertise,
      experienceLevel,
      mobility,
      cvFile,
      supplementaryFiles,
      coverStatement: summary.trim(),
      status: 'New',
      isTalentPool: true,
      consent: {
        agreed: Boolean(agreed),
        policyVersion: 'v2.4 (2024.10)',
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
        userAgent: req.headers['user-agent'] || '',
        timestamp: new Date(),
      },
      appliedAt: new Date(),
    });

    const receiptToken = generateReceiptToken(application._id, application.referenceNumber);

    return res.status(201).json({
      success: true,
      message: 'Your talent dossier has been registered in our global talent repository.',
      applicationId: application._id,
      referenceNumber: application.referenceNumber,
      receiptToken,
      receiptCode: application.referenceNumber,
      refCode: 'SPRIMAX-TALENT-GEN',
      jobTitle: 'General Application (Open Intake)',
      department: 'TALENT ACQUISITION',
      appliedAt: application.appliedAt,
      application,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get public careers settings (departments, locations, talent contacts)
 * @route GET /api/careers/settings/public
 */
export const getPublicCareersSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({
      success: true,
      departments: settings.departments,
      locations: settings.locations,
      employmentTypes: settings.employmentTypes,
      talentContacts: settings.talentContacts,
      certificationsLibrary: settings.certificationsLibrary,
      globalTexts: settings.globalTexts,
      fieldsOfExpertise: settings.fieldsOfExpertise,
      mobilityOptions: settings.mobilityOptions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// ADMIN CONTROLLERS - JOB POSTINGS
// =========================================================================

/**
 * @desc Get admin jobs list with filters, stats, pagination
 * @route GET /api/careers/admin/jobs
 */
export const getAdminJobs = async (req, res) => {
  try {
    const { search, status, department, location, employmentType, page = 1, limit = 50 } = req.query;

    const query = { deletedAt: null };

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { reqCode: searchRegex }, { department: searchRegex }, { location: searchRegex }];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (location && location !== 'all') {
      query.location = location;
    }

    if (employmentType && employmentType !== 'all') {
      query.employmentType = employmentType;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const jobs = await Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await Job.countDocuments(query);

    // Compute KPI Stats
    const openCount = await Job.countDocuments({ status: 'Open', deletedAt: null });
    const draftCount = await Job.countDocuments({ status: 'Draft', deletedAt: null });

    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const closingSoonCount = await Job.countDocuments({
      status: 'Open',
      closingDate: { $gt: new Date(), $lte: sevenDaysFromNow },
      deletedAt: null,
    });

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newApplicationsThisWeek = await Application.countDocuments({
      appliedAt: { $gte: oneWeekAgo },
      deletedAt: null,
    });

    return res.status(200).json({
      success: true,
      jobs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      stats: {
        openCount,
        draftCount,
        closingSoonCount,
        newApplicationsThisWeek,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get single job for admin editor
 * @route GET /api/careers/admin/jobs/:id
 */
export const getAdminJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, deletedAt: null });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, job });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Create new job (Draft or Published)
 * @route POST /api/careers/admin/jobs
 */
export const createAdminJob = async (req, res) => {
  try {
    const jobData = { ...req.body };

    if (!jobData.title) {
      return res.status(400).json({ success: false, message: 'Job title is required' });
    }

    jobData.slug = await generateUniqueSlug(jobData.slug || jobData.title);

    if (!jobData.reqCode) {
      jobData.reqCode = await generateUniqueReqCode(jobData.department || 'ENG', jobData.location || 'DXB');
    }

    // SERVER-SET POSTED DATE: If published, set postedAt on server; client cannot inject
    if (jobData.status === 'Open') {
      jobData.postedAt = new Date();
    } else {
      jobData.postedAt = null;
    }

    const job = await Job.create(jobData);
    return res.status(201).json({ success: true, job, message: 'Job posting created successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update existing job posting
 * @route PUT /api/careers/admin/jobs/:id
 */
export const updateAdminJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, deletedAt: null });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const updateData = { ...req.body };

    // Do not allow client to overwrite postedAt directly
    delete updateData.postedAt;

    // If publishing for the first time or re-opening, set postedAt if not already set
    if (updateData.status === 'Open' && !job.postedAt) {
      updateData.postedAt = new Date();
    }

    // Update slug if edited and not yet published
    if (updateData.slug && updateData.slug !== job.slug && job.status === 'Draft') {
      updateData.slug = await generateUniqueSlug(updateData.slug, job._id);
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    return res.status(200).json({ success: true, job: updatedJob, message: 'Job updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Soft delete job
 * @route DELETE /api/careers/admin/jobs/:id
 */
export const deleteAdminJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const appCount = await Application.countDocuments({ jobId: job._id, deletedAt: null });

    // Mark as soft deleted
    job.deletedAt = new Date();
    job.status = 'Archived';
    await job.save();

    return res.status(200).json({
      success: true,
      message: `Job ${job.title} archived successfully. ${appCount} candidate applications preserved.`,
      associatedApplicationsCount: appCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Duplicate job as a Draft
 * @route POST /api/careers/admin/jobs/:id/duplicate
 */
export const duplicateAdminJob = async (req, res) => {
  try {
    const sourceJob = await Job.findById(req.params.id);
    if (!sourceJob) {
      return res.status(404).json({ success: false, message: 'Source job not found' });
    }

    const raw = sourceJob.toObject();
    delete raw._id;
    delete raw.createdAt;
    delete raw.updatedAt;
    delete raw.postedAt;
    delete raw.applicantsCount;

    raw.title = `${sourceJob.title} (Copy)`;
    raw.slug = await generateUniqueSlug(`${sourceJob.title}-copy`);
    raw.reqCode = await generateUniqueReqCode(sourceJob.department, sourceJob.location);
    raw.status = 'Draft';

    const duplicatedJob = await Job.create(raw);
    return res.status(201).json({
      success: true,
      job: duplicatedJob,
      message: `Duplicated job as draft (${duplicatedJob.reqCode})`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// ADMIN CONTROLLERS - APPLICATIONS MANAGEMENT
// =========================================================================

/**
 * @desc Get applications list with filters, pagination, and KPI counts
 * @route GET /api/careers/admin/applications
 */
export const getAdminApplications = async (req, res) => {
  try {
    const {
      search,
      jobId,
      department,
      status,
      source,
      experienceLevel,
      rating,
      page = 1,
      limit = 50,
    } = req.query;

    const query = { deletedAt: null };

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { referenceNumber: searchRegex },
        { receiptVerificationCode: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
        { jobTitle: searchRegex },
        { reqCode: searchRegex },
        { currentEmployer: searchRegex },
        { currentJobTitle: searchRegex },
        { coverStatement: searchRegex },
      ];
    }

    if (jobId && jobId !== 'all') {
      query.jobId = jobId;
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (source && source !== 'all') {
      query.source = source;
    }

    if (experienceLevel && experienceLevel !== 'all') {
      query.experienceLevel = experienceLevel;
    }

    if (rating && Number(rating) > 0) {
      query.rating = { $gte: Number(rating) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const applications = await Application.find(query).sort({ appliedAt: -1 }).skip(skip).limit(Number(limit));
    const total = await Application.countDocuments(query);

    // KPI Counters
    const newCount = await Application.countDocuments({ status: 'New', deletedAt: null });
    const inReviewCount = await Application.countDocuments({ status: 'In Review', deletedAt: null });
    const interviewCount = await Application.countDocuments({ status: 'Interview', deletedAt: null });
    const hiredCount = await Application.countDocuments({ status: 'Hired', deletedAt: null });
    const talentPoolCount = await Application.countDocuments({ isTalentPool: true, deletedAt: null });

    return res.status(200).json({
      success: true,
      applications,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      stats: {
        newCount,
        inReviewCount,
        interviewCount,
        hiredCount,
        talentPoolCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get application details by ID
 * @route GET /api/careers/admin/applications/:id
 */
export const getAdminApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, deletedAt: null });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Mark as read
    if (!application.isRead) {
      application.isRead = true;
      await application.save();
    }

    // Check for previous applications with same email
    const otherApplications = await Application.find({
      email: application.email,
      _id: { $ne: application._id },
      deletedAt: null,
    }).select('jobTitle reqCode appliedAt status');

    return res.status(200).json({
      success: true,
      application,
      otherApplications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update application pipeline status
 * @route PATCH /api/careers/admin/applications/:id/status
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, note, changedBy = 'Recruitment Lead' } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const fromStatus = application.status;
    application.status = status;
    if (status === 'Talent Pool') {
      application.isTalentPool = true;
    }

    application.statusHistory.push({
      fromStatus,
      toStatus: status,
      changedBy,
      note: note || `Status updated from ${fromStatus} to ${status}`,
      changedAt: new Date(),
    });

    await application.save();
    return res.status(200).json({ success: true, application, message: `Status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update star rating
 * @route PATCH /api/careers/admin/applications/:id/rating
 */
export const updateApplicationRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { rating: Math.max(0, Math.min(5, Number(rating))) },
      { new: true }
    );
    return res.status(200).json({ success: true, application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Add internal team note
 * @route POST /api/careers/admin/applications/:id/notes
 */
export const addApplicationNote = async (req, res) => {
  try {
    const { content, author = 'Technical Lead', authorRole = 'Reviewer' } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.notes.push({
      id: `note-${Date.now()}`,
      author,
      authorRole,
      content,
      createdAt: new Date(),
    });

    await application.save();
    return res.status(201).json({ success: true, notes: application.notes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Schedule interview for applicant
 * @route POST /api/careers/admin/applications/:id/interviews
 */
export const scheduleApplicationInterview = async (req, res) => {
  try {
    const { date, type = 'Video Call (Teams/Meet)', interviewers, locationOrLink, notes } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.interviews.push({
      id: `int-${Date.now()}`,
      date: new Date(date),
      type,
      interviewers: interviewers || 'Technical Panel',
      locationOrLink: locationOrLink || 'Teams Conference Room',
      status: 'Scheduled',
      notes: notes || '',
    });

    if (application.status === 'New' || application.status === 'In Review') {
      application.status = 'Interview';
      application.statusHistory.push({
        fromStatus: application.status,
        toStatus: 'Interview',
        changedBy: 'Admin',
        note: `Interview scheduled for ${new Date(date).toLocaleDateString()}`,
        changedAt: new Date(),
      });
    }

    await application.save();
    return res.status(201).json({ success: true, interviews: application.interviews, application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Anonymize / Soft delete applicant data (GDPR Compliance)
 * @route DELETE /api/careers/admin/applications/:id
 */
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Anonymize personal identification fields
    application.firstName = 'Anonymized';
    application.lastName = 'Applicant';
    application.email = `anonymized_${Date.now()}@gdpr-erased.local`;
    application.phoneNumber = '+000000000';
    application.currentLocation = 'Redacted';
    application.coverStatement = 'Candidate dossier anonymized per retention policy.';
    application.deletedAt = new Date();
    application.status = 'Withdrawn';

    await application.save();
    return res.status(200).json({ success: true, message: 'Candidate record anonymized successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get and Update Careers Settings
 * @route GET /api/careers/admin/settings & PUT /api/careers/admin/settings
 */
export const getAdminSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminSettings = async (req, res) => {
  try {
    let settings = await getOrCreateSettings();
    Object.assign(settings, req.body);
    await settings.save();
    return res.status(200).json({ success: true, settings, message: 'Careers settings updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Export applications to CSV
 * @route GET /api/careers/admin/export
 */
export const exportApplicationsCsv = async (req, res) => {
  try {
    const applications = await Application.find({ deletedAt: null }).sort({ appliedAt: -1 });

    const headers = [
      'Applicant ID',
      'Name',
      'Email',
      'Phone',
      'Current Location',
      'Role Applied For',
      'REQ ID',
      'Department',
      'Current Employer',
      'Experience Level',
      'Status',
      'Rating',
      'Applied Date',
    ];

    const rows = applications.map((app) => [
      `"${app._id}"`,
      `"${app.firstName} ${app.lastName}"`,
      `"${app.email}"`,
      `"${app.phoneCountry} ${app.phoneNumber}"`,
      `"${app.currentLocation}"`,
      `"${app.jobTitle}"`,
      `"${app.reqCode}"`,
      `"${app.department}"`,
      `"${app.currentEmployer || ''}"`,
      `"${app.experienceLevel || ''}"`,
      `"${app.status}"`,
      `"${app.rating || 0}"`,
      `"${app.appliedAt ? new Date(app.appliedAt).toISOString().slice(0, 10) : ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sprimax-careers-applications.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Public endpoint to download application receipt PDF using signed token
 * @route GET /api/careers/applications/receipt?token=...
 */
export const downloadApplicationReceipt = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing receipt download token.' });
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || 'client';
    if (!checkRateLimit(`ip:${ip}`) || !checkRateLimit(`tok:${token.slice(-16)}`)) {
      return res.status(429).json({ success: false, message: 'Too many receipt download requests. Please try again shortly.' });
    }

    const verification = verifyReceiptToken(token);
    if (!verification.valid) {
      return res.status(verification.expired ? 401 : 403).json({
        success: false,
        message: verification.error,
        expired: verification.expired || false,
      });
    }

    const { appId, ref } = verification.payload;
    const application = await Application.findById(appId);

    if (!application || application.deletedAt) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    // Verify reference number matches token
    if (application.referenceNumber && application.referenceNumber !== ref) {
      return res.status(403).json({ success: false, message: 'Receipt reference number mismatch.' });
    }

    // Audit log (timestamp only, no file content)
    if (!Array.isArray(application.downloadAudit)) {
      application.downloadAudit = [];
    }
    application.downloadAudit.push(new Date());
    await application.save();

    const fileName = `Sprimax-Application-Receipt-${application.referenceNumber || 'RECORD'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    renderApplicationReceiptPdf(application, res);
  } catch (error) {
    console.error('[ReceiptDownload] Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to generate receipt PDF.' });
    }
  }
};

/**
 * @desc Admin endpoint to download application receipt PDF by ID
 * @route GET /api/careers/admin/applications/:id/receipt
 */
export const downloadAdminApplicationReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    // Ensure referenceNumber exists
    if (!application.referenceNumber) {
      application.referenceNumber = await generateApplicationReferenceNumber(application.source === 'general');
      application.receiptVerificationCode = generateVerificationCode();
      if (!application.jobSnapshot || !application.jobSnapshot.title) {
        application.jobSnapshot = {
          title: application.jobTitle || 'Engineering Position',
          reqCode: application.reqCode || 'SPR-REQ',
          department: application.department || 'ENGINEERING',
          subDepartment: '',
          location: application.location || application.currentLocation,
          employmentType: 'Full-time',
          reviewCycleNote: 'Typically 2-4 business days',
          retentionMonths: 12,
        };
      }
      await application.save();
    }

    // Audit log
    if (!Array.isArray(application.downloadAudit)) {
      application.downloadAudit = [];
    }
    application.downloadAudit.push(new Date());
    await application.save();

    const fileName = `Sprimax-Application-Receipt-${application.referenceNumber}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    renderApplicationReceiptPdf(application, res);
  } catch (error) {
    console.error('[AdminReceiptDownload] Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Failed to generate receipt PDF.' });
    }
  }
};

/**
 * @desc Public verification endpoint for QR code or verification link
 * @route GET /api/careers/verify-receipt
 */
export const verifyReceiptPublic = async (req, res) => {
  try {
    const { code, ref } = req.query;
    if (!code && !ref) {
      return res.status(400).json({ success: false, message: 'Verification code or reference number required.' });
    }

    const query = { deletedAt: null };
    if (code) query.receiptVerificationCode = code.trim();
    if (ref) query.referenceNumber = ref.trim();

    const application = await Application.findOne(query);
    if (!application) {
      return res.status(404).json({ success: false, valid: false, message: 'Receipt verification record not found.' });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      referenceNumber: application.referenceNumber,
      submittedAt: application.appliedAt,
      jobTitle: application.jobSnapshot?.title || application.jobTitle,
      department: application.jobSnapshot?.department || application.department,
      status: 'Lodged',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

