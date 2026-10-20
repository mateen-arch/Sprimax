import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Clock,
  ArrowRight,
  ArrowDown,
  ChevronRight,
  Shield,
  ShieldCheck,
  Award,
  Globe,
  CreditCard,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Activity,
  Wrench,
  FlaskConical,
  Snowflake,
  Plane,
  Wallet,
  CheckCircle2,
  HelpCircle,
  Mail,
  Share2,
  FileText,
  UploadCloud,
  Check,
  X,
  Lock,
  Download,
  AlertCircle,
  HardHat,
  Microscope,
  Loader2,
  Copy,
  RefreshCw,
} from 'lucide-react';
import {
  CAREERS_STATS,
  CAREERS_ADVANTAGES,
  OPEN_ROLES,
} from '../data/careersData';
import { generateApplicationReceiptPdf } from '../utils/generateApplicationReceiptPdf';
import { getOptimizedImageUrl } from '../utils/cloudinary.js';
import './CareersPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CareersPage({
  initialRoleSlug = null,
  onBackToHome,
  onNavigateContact,
}) {
  // Live Roles State
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [availableLocations, setAvailableLocations] = useState([]);

  const [activeRole, setActiveRole] = useState(null);

  // Filter state for openings
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');

  // Modals state
  const [applyRoleModalData, setApplyRoleModalData] = useState(null);
  const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const [shareToast, setShareToast] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Receipt download and reference copy states
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [receiptDownloadError, setReceiptDownloadError] = useState(null);
  const [receiptCopied, setReceiptCopied] = useState(false);
  const [receiptAnnouncement, setReceiptAnnouncement] = useState('');

  // File Upload Refs and State
  const roleFileInputRef = useRef(null);
  const [roleFile, setRoleFile] = useState(null);

  const generalFileInputRef = useRef(null);
  const [generalFile, setGeneralFile] = useState(null);

  // Role Application Form state (clean, no dummy data)
  const [roleForm, setRoleForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneCountry: '+971',
    phoneNumber: '',
    location: '',
    currentEmployer: '',
    currentJobTitle: '',
    experienceLevel: '5 - 8 Years (Senior Metallurgist / Automated TIG Cladding)',
    fileName: '',
    fileSize: '',
    fileChecksum: '',
    certifications: [],
    coverStatement: '',
    certifiedConsent: false,
  });

  // General Application Form state (clean, no dummy data)
  const [generalForm, setGeneralForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneCountry: '+971',
    phoneNumber: '',
    fieldOfExpertise: 'Metallurgy & Materials Engineering',
    experienceLevel: '5 - 8 Years',
    currentLocation: '',
    mobility: 'Open to Global Relocation (EMEA, APAC, Americas)',
    fileName: '',
    summary: '',
    authorizedConsent: false,
  });

  // Fetch live roles from backend on mount
  useEffect(() => {
    const fetchJobs = async () => {
      setRolesLoading(true);
      try {
        const res = await fetch(`${API_BASE}/careers/jobs`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data.jobs) && data.jobs.length > 0) {
          setRoles(data.jobs);
          if (Array.isArray(data.availableLocations)) {
            setAvailableLocations(data.availableLocations);
          }
          // If initialRoleSlug was provided, match it
          if (initialRoleSlug) {
            const found = data.jobs.find(
              (r) => r.slug === initialRoleSlug || r._id === initialRoleSlug || r.id === initialRoleSlug
            );
            if (found) {
              setActiveRole(found);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }
        } else {
          // Fallback to cached OPEN_ROLES if database is empty
          setRoles(OPEN_ROLES);
        }
      } catch (err) {
        console.warn('Live careers API unavailable, using cached roles:', err);
        setRoles(OPEN_ROLES);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchJobs();
  }, [initialRoleSlug]);

  const handleOpenRoleDetail = (role) => {
    setActiveRole(role);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOpenings = () => {
    setActiveRole(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToOpenings = () => {
    const el = document.getElementById('current-openings-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenRoleModal = (role) => {
    setApplyRoleModalData(role);
    setSubmitError(null);
    setRoleFile(null);
    setRoleForm({
      firstName: '',
      lastName: '',
      email: '',
      phoneCountry: '+971',
      phoneNumber: '',
      location: '',
      currentEmployer: '',
      currentJobTitle: '',
      experienceLevel: '5 - 8 Years (Senior Metallurgist / Automated TIG Cladding)',
      fileName: '',
      fileSize: '',
      fileChecksum: '',
      certifications: [],
      coverStatement: '',
      certifiedConsent: false,
    });
  };

  const handleRoleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB limit. Please upload a smaller document.');
        return;
      }
      setRoleFile(file);
      setRoleForm((prev) => ({
        ...prev,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        fileChecksum: 'SHA-256 Validated',
      }));
    }
  };

  const handleGeneralFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('File size exceeds 15MB limit. Please upload a smaller document.');
        return;
      }
      setGeneralFile(file);
      setGeneralForm((prev) => ({
        ...prev,
        fileName: file.name,
      }));
    }
  };

  const handleToggleCert = (certName) => {
    setRoleForm((prev) => {
      const exists = prev.certifications.includes(certName);
      return {
        ...prev,
        certifications: exists
          ? prev.certifications.filter((c) => c !== certName)
          : [...prev.certifications, certName],
      };
    });
  };

  const handleRoleApplicationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('jobId', applyRoleModalData?._id || applyRoleModalData?.id || '');
      formData.append('jobTitle', applyRoleModalData?.title || '');
      formData.append('reqCode', applyRoleModalData?.reqCode || '');
      formData.append('firstName', roleForm.firstName);
      formData.append('lastName', roleForm.lastName);
      formData.append('email', roleForm.email);
      formData.append('phoneCountry', roleForm.phoneCountry);
      formData.append('phoneNumber', roleForm.phoneNumber);
      formData.append('currentLocation', roleForm.location);
      formData.append('currentEmployer', roleForm.currentEmployer || '');
      formData.append('currentJobTitle', roleForm.currentJobTitle || '');
      formData.append('experienceLevel', roleForm.experienceLevel || '');
      formData.append('certifications', JSON.stringify(roleForm.certifications || []));
      formData.append('coverStatement', roleForm.coverStatement || '');
      formData.append('agreed', roleForm.certifiedConsent ? 'true' : 'false');

      if (roleFile) {
        formData.append('cv', roleFile);
      }

      const res = await fetch(`${API_BASE}/careers/apply`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Application submission failed.');
      }

      const submission = {
        isGeneral: false,
        receiptId: data.referenceNumber || data.receiptCode || `APP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        referenceNumber: data.referenceNumber || data.receiptCode || `APP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        receiptToken: data.receiptToken || null,
        jobTitle: data.jobTitle || applyRoleModalData?.title || 'Engineering Role',
        reqCode: data.reqCode || applyRoleModalData?.reqCode || 'ENG-7018-DXB',
        department: data.department || applyRoleModalData?.department || applyRoleModalData?.deptTag || 'Materials Division',
        firstName: roleForm.firstName,
        lastName: roleForm.lastName,
        email: roleForm.email,
        phoneCountry: roleForm.phoneCountry,
        phoneNumber: roleForm.phoneNumber,
        location: roleForm.location,
        experienceLevel: roleForm.experienceLevel,
        fileName: roleFile ? roleFile.name : (roleForm.fileName || 'Candidate_CV.pdf'),
        coverStatement: roleForm.coverStatement,
        certifications: roleForm.certifications,
      };

      setReceiptDownloadError(null);
      setReceiptCopied(false);
      setApplyRoleModalData(null);
      setSuccessModalData(submission);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application. Please verify details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneralApplicationSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('firstName', generalForm.firstName);
      formData.append('lastName', generalForm.lastName);
      formData.append('email', generalForm.email);
      formData.append('phoneCountry', generalForm.phoneCountry);
      formData.append('phoneNumber', generalForm.phoneNumber);
      formData.append('currentLocation', generalForm.currentLocation);
      formData.append('experienceLevel', generalForm.experienceLevel);
      formData.append('fieldOfExpertise', generalForm.fieldOfExpertise);
      formData.append('mobility', generalForm.mobility);
      formData.append('summary', generalForm.summary);
      formData.append('agreed', generalForm.authorizedConsent ? 'true' : 'false');

      if (generalFile) {
        formData.append('cv', generalFile);
      }

      const res = await fetch(`${API_BASE}/careers/apply-general`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'General application submission failed.');
      }

      const submission = {
        isGeneral: true,
        receiptId: data.referenceNumber || data.receiptCode || `APP-2026-G${Math.floor(10000 + Math.random() * 90000)}`,
        referenceNumber: data.referenceNumber || data.receiptCode || `APP-2026-G${Math.floor(10000 + Math.random() * 90000)}`,
        receiptToken: data.receiptToken || null,
        jobTitle: 'General Application (Open Intake)',
        reqCode: 'SPRIMAX-TALENT-GEN',
        department: 'Sprimax Talent Acquisition',
        deptTag: generalForm.fieldOfExpertise,
        firstName: generalForm.firstName || 'Candidate',
        lastName: generalForm.lastName || '',
        email: generalForm.email,
        phoneCountry: generalForm.phoneCountry,
        phoneNumber: generalForm.phoneNumber,
        location: generalForm.currentLocation,
        experienceLevel: generalForm.experienceLevel,
        fileName: generalFile ? generalFile.name : 'Engineering_Dossier_Portfolio.pdf',
        coverStatement: generalForm.summary,
        certifications: ['General Talent Pool Intake'],
      };

      setReceiptDownloadError(null);
      setReceiptCopied(false);
      setIsGeneralModalOpen(false);
      setSuccessModalData(submission);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application. Please verify details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSharePosition = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const handleDownloadReceiptPdf = async () => {
    if (!successModalData) return;
    setDownloadingReceipt(true);
    setReceiptDownloadError(null);
    setReceiptAnnouncement('Preparing official application receipt PDF...');

    try {
      if (!successModalData.receiptToken) {
        throw new Error('Receipt download token is unavailable. Please reach out to talent@sprimax.com.');
      }

      const res = await fetch(
        `${API_BASE}/careers/applications/receipt?token=${encodeURIComponent(successModalData.receiptToken)}`,
        {
          method: 'GET',
        }
      );

      if (!res.ok) {
        let errMsg = 'Failed to generate application receipt.';
        try {
          const errData = await res.json();
          errMsg = errData.message || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const downloadName = `Sprimax-Application-Receipt-${successModalData.referenceNumber || 'RECORD'}.pdf`;
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      setReceiptAnnouncement('Receipt downloaded successfully.');
    } catch (err) {
      console.error('[ReceiptDownload] Error:', err);
      setReceiptDownloadError(err.message || 'Unable to download receipt. Please try again.');
      setReceiptAnnouncement(`Error downloading receipt: ${err.message}`);
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const handleCopyReferenceNumber = async () => {
    if (!successModalData?.referenceNumber) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(successModalData.referenceNumber);
        setReceiptCopied(true);
        setTimeout(() => setReceiptCopied(false), 2500);
      }
    } catch (_) {}
  };

  // Filter live roles
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      !searchQuery ||
      role.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.reqCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      locationFilter === 'all' ||
      role.location?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="careers-page-root">
      {/* =========================================================================
          VIEW 1: ROLE DETAIL VIEW (Screenshots 3, 4, 5)
          ========================================================================= */}
      {activeRole ? (
        <article className="careers-role-detail-container">
          {/* Top Navigation */}
          <div className="careers-detail-topbar">
            <nav className="careers-breadcrumbs" aria-label="Breadcrumb">
              <span className="careers-bc-dim">CAREERS</span>
              <ChevronRight size={13} className="careers-bc-separator" />
              <button
                type="button"
                className="careers-bc-link"
                onClick={handleBackToOpenings}
              >
                OPEN ROLES
              </button>
              <ChevronRight size={13} className="careers-bc-separator" />
              <span className="careers-bc-current">{activeRole.title}</span>
            </nav>

            <button
              type="button"
              className="careers-back-to-all-btn"
              onClick={handleBackToOpenings}
            >
              ← BACK TO ALL OPENINGS
            </button>
          </div>

          {/* Job Header Banner */}
          <header className="careers-role-hero-banner">
            <div className="careers-role-hero-meta-row">
              <span className="careers-badge-solid-dark">
                {activeRole.departmentFull}
              </span>
              <span className="careers-badge-tag">
                <MapPin size={12} /> {activeRole.location}
              </span>
              <span className="careers-badge-tag">{activeRole.type}</span>
              <span className="careers-badge-code">
                REQ: {activeRole.reqCode}
              </span>
              <span className="careers-badge-posted">
                POSTED: {activeRole.postedDate}
              </span>
            </div>

            <div className="careers-role-hero-body">
              <div className="careers-role-hero-titles">
                <h1 className="careers-role-h1">{activeRole.title}</h1>
                <p className="careers-role-subtitle">{activeRole.subtitle}</p>
              </div>

              <div className="careers-role-hero-actions">
                <button
                  type="button"
                  className="careers-btn-apply-hero"
                  onClick={() => handleOpenRoleModal(activeRole)}
                >
                  <Check size={16} /> APPLY FOR THIS ROLE
                </button>
                <button
                  type="button"
                  className="careers-btn-share-hero"
                  onClick={handleSharePosition}
                >
                  <Share2 size={16} /> SHARE POSITION
                  {shareToast && (
                    <span className="careers-toast-copied">Link Copied!</span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Key Metrics Cards (Grid of 4) */}
          <div className="careers-metrics-grid">
            <div className="careers-metric-card">
              <span className="careers-metric-label">BASE PLANT</span>
              <div className="careers-metric-code">
                {activeRole.basePlant.code}
              </div>
              <span className="careers-metric-sub">
                {activeRole.basePlant.subtext}
              </span>
            </div>

            <div className="careers-metric-card">
              <span className="careers-metric-label">ACCREDITATION</span>
              <div className="careers-metric-code">
                {activeRole.accreditation.code}
              </div>
              <span className="careers-metric-sub">
                {activeRole.accreditation.subtext}
              </span>
            </div>

            <div className="careers-metric-card">
              <span className="careers-metric-label">TEAM SIZE</span>
              <div className="careers-metric-code">
                {activeRole.teamSize.code}
              </div>
              <span className="careers-metric-sub">
                {activeRole.teamSize.subtext}
              </span>
            </div>

            <div className="careers-metric-card">
              <span className="careers-metric-label">VISA SPONSORSHIP</span>
              <div className="careers-metric-code">
                {activeRole.visaSponsorship.code}
              </div>
              <span className="careers-metric-sub">
                {activeRole.visaSponsorship.subtext}
              </span>
            </div>
          </div>

          {/* Main Content Layout (Left Main Content + Right Sticky Sidebar) */}
          <div className="careers-detail-layout">
            {/* Left Content Column */}
            <div className="careers-detail-left-col">
              {/* Mission & Impact */}
              <section className="careers-section-block">
                <h2 className="careers-section-h2">
                  <span className="careers-accent-bar" /> MISSION & IMPACT
                </h2>

                <div className="careers-white-card">
                  {activeRole.mission.paragraphs.map((para, idx) => (
                    <p key={idx} className="careers-body-p">
                      {para}
                    </p>
                  ))}

                  <div className="careers-highlights-grid">
                    {activeRole.mission.highlights.map((h, idx) => (
                      <div key={idx} className="careers-highlight-box">
                        <div className="careers-highlight-icon-wrap">
                          {h.icon === 'shield-check' ? (
                            <ShieldCheck
                              size={20}
                              className="careers-hl-icon-blue"
                            />
                          ) : (
                            <Search
                              size={20}
                              className="careers-hl-icon-blue"
                            />
                          )}
                        </div>
                        <div className="careers-highlight-text">
                          <h4 className="careers-highlight-title">
                            {h.title}
                          </h4>
                          <p className="careers-highlight-desc">
                            {h.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Key Responsibilities */}
              <section className="careers-section-block">
                <h2 className="careers-section-h2">
                  <span className="careers-accent-bar" /> KEY RESPONSIBILITIES
                </h2>

                <div className="careers-white-card">
                  <ol className="careers-responsibilities-list">
                    {activeRole.responsibilities.map((resp, idx) => (
                      <li key={idx} className="careers-resp-item">
                        <span className="careers-resp-index">
                          {String(idx + 1).padStart(2, '0')}/
                        </span>
                        <p className="careers-resp-text">{resp}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              {/* Required Qualifications & Experience */}
              <section className="careers-section-block">
                <h2 className="careers-section-h2">
                  <span className="careers-accent-bar" /> REQUIRED QUALIFICATIONS & EXPERIENCE
                </h2>

                <div className="careers-white-card">
                  <div className="careers-criteria-header">
                    <CheckCircle2 size={18} className="careers-check-blue" />
                    <h3 className="careers-criteria-h3">Mandatory Criteria</h3>
                  </div>

                  <ul className="careers-criteria-list">
                    {activeRole.qualifications.mandatory.map((c, idx) => (
                      <li key={idx} className="careers-criteria-item">
                        <strong>{c.label}:</strong> {c.text}
                      </li>
                    ))}
                  </ul>

                  <div className="careers-preferred-block">
                    <span className="careers-preferred-label">
                      PREFERRED / HIGH VALUE CREDENTIALS
                    </span>
                    <div className="careers-preferred-tags">
                      {activeRole.qualifications.preferred.map((p, idx) => (
                        <span key={idx} className="careers-preferred-tag">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Facility Context */}
              {activeRole.facilityContext && (
                <section className="careers-section-block">
                  <h2 className="careers-section-h2">
                    <span className="careers-accent-bar" />{' '}
                    {activeRole.facilityContext.title}
                  </h2>

                  <div className="careers-facility-card">
                    <div className="careers-facility-media-wrap">
                      <img
                        src={activeRole.facilityContext.image}
                        alt="Materials Testing Center"
                        className="careers-facility-img"
                      />
                      <div className="careers-facility-overlay-bar">
                        <span className="careers-facility-pill-red">
                          ● {activeRole.facilityContext.hubLabel}
                        </span>
                        <span className="careers-facility-pill-dark">
                          {activeRole.facilityContext.classLabel}
                        </span>
                      </div>
                    </div>

                    <div className="careers-facility-pillars-grid">
                      {activeRole.facilityContext.pillars.map((pill, idx) => (
                        <div key={idx} className="careers-pillar-col">
                          <div className="careers-pillar-header">
                            {pill.icon === 'wrench' && (
                              <Wrench size={14} className="careers-pillar-icon" />
                            )}
                            {pill.icon === 'flask' && (
                              <FlaskConical
                                size={14}
                                className="careers-pillar-icon"
                              />
                            )}
                            {pill.icon === 'snowflake' && (
                              <Snowflake
                                size={14}
                                className="careers-pillar-icon"
                              />
                            )}
                            <span className="careers-pillar-title">
                              {pill.title}
                            </span>
                          </div>
                          <p className="careers-pillar-desc">
                            {pill.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Total Compensation & Benefits */}
              <section className="careers-section-block">
                <h2 className="careers-section-h2">
                  <span className="careers-accent-bar" /> TOTAL COMPENSATION & BENEFITS
                </h2>

                <div className="careers-benefits-grid">
                  {activeRole.benefits.map((b, idx) => (
                    <div key={idx} className="careers-benefit-item-card">
                      <div className="careers-benefit-icon-box">
                        {b.icon === 'wallet' && <Wallet size={20} />}
                        {b.icon === 'plane' && <Plane size={20} />}
                        {b.icon === 'shield' && <Shield size={20} />}
                        {b.icon === 'award' && <Award size={20} />}
                        {b.icon === 'trending-up' && <TrendingUp size={20} />}
                        {b.icon === 'credit-card' && <CreditCard size={20} />}
                      </div>
                      <div className="careers-benefit-info">
                        <h4 className="careers-benefit-title">{b.title}</h4>
                        <p className="careers-benefit-desc">
                          {b.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Facility & Operational Context */}
              {activeRole.facilityContext?.imageUrl && (
                <section className="careers-section-block">
                  <h2 className="careers-section-h2">
                    <span className="careers-accent-bar" /> FACILITY & WORKSPACE
                  </h2>
                  <div className="careers-white-card" style={{ padding: '16px' }}>
                    <img
                      src={getOptimizedImageUrl(activeRole.facilityContext.imageUrl, 'facility')}
                      alt={activeRole.facilityContext.caption || 'Facility Context'}
                      style={{ width: '100%', borderRadius: '6px', maxHeight: '360px', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    {activeRole.facilityContext.caption && (
                      <p style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
                        {activeRole.facilityContext.caption}
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sticky Sidebar */}
            <aside className="careers-detail-right-sidebar">
              {/* Application Summary Card */}
              <div className="careers-sidebar-card careers-summary-box">
                <div className="careers-target-date-row">
                  <span className="careers-target-label">TARGET START DATE</span>
                  <div className="careers-target-status">
                    <span>{activeRole.sidebar.targetStartDate}</span>
                    <span className="careers-blue-dot" />
                  </div>
                </div>

                <div className="careers-facts-table">
                  <div className="careers-fact-row">
                    <span className="careers-fact-key">Division:</span>
                    <span className="careers-fact-val">
                      {activeRole.sidebar.division}
                    </span>
                  </div>
                  <div className="careers-fact-row">
                    <span className="careers-fact-key">Location:</span>
                    <span className="careers-fact-val">
                      {activeRole.sidebar.location}
                    </span>
                  </div>
                  <div className="careers-fact-row">
                    <span className="careers-fact-key">Employment:</span>
                    <span className="careers-fact-val">
                      {activeRole.sidebar.employment}
                    </span>
                  </div>
                  <div className="careers-fact-row">
                    <span className="careers-fact-key">Travel Req:</span>
                    <span className="careers-fact-val">
                      {activeRole.sidebar.travelReq}
                    </span>
                  </div>
                  <div className="careers-fact-row">
                    <span className="careers-fact-key">Security Level:</span>
                    <span className="careers-fact-val">
                      {activeRole.sidebar.securityLevel}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="careers-btn-apply-sidebar"
                  onClick={() => handleOpenRoleModal(activeRole)}
                >
                  ⚡ APPLY NOW FOR {activeRole.reqCode.split('-')[0]}-
                  {activeRole.reqCode.split('-')[1]}
                </button>

                <div className="careers-review-cycle">
                  REVIEW CYCLE: {activeRole.sidebar.reviewCycle}
                </div>
              </div>

              {/* Recruiter / Talent Contact Card */}
              <div className="careers-sidebar-card careers-recruiter-box">
                <span className="careers-recruiter-label">TALENT CONTACT</span>

                <div className="careers-recruiter-profile">
                  <div className="careers-recruiter-avatar">
                    {activeRole.sidebar?.recruiter?.avatarUrl ? (
                      <img
                        src={getOptimizedImageUrl(activeRole.sidebar.recruiter.avatarUrl, 'avatar')}
                        alt={activeRole.sidebar.recruiter.name}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <HardHat size={24} className="careers-recruiter-svg" />
                    )}
                  </div>
                  <div className="careers-recruiter-meta">
                    <h4 className="careers-recruiter-name">
                      {activeRole.sidebar.recruiter.name}
                    </h4>
                    <span className="careers-recruiter-role">
                      {activeRole.sidebar.recruiter.role}
                    </span>
                    <a
                      href={`mailto:${activeRole.sidebar.recruiter.email}`}
                      className="careers-recruiter-email"
                    >
                      {activeRole.sidebar.recruiter.email}
                    </a>
                  </div>
                </div>

                <p className="careers-recruiter-quote">
                  "{activeRole.sidebar.recruiter.quote}"
                </p>

                <button
                  type="button"
                  className="careers-btn-inquire-recruiter"
                  onClick={() => {
                    if (onNavigateContact) onNavigateContact();
                  }}
                >
                  <Mail size={14} /> INQUIRE WITH{' '}
                  {activeRole.sidebar.recruiter.name.split(' ')[0].toUpperCase()}
                </button>
              </div>

              {/* Integrity Guarantee Card */}
              <div className="careers-sidebar-card careers-integrity-card">
                <div className="careers-integrity-header">
                  <Shield size={16} className="careers-shield-red" />
                  <span className="careers-integrity-title">
                    INTEGRITY GUARANTEE
                  </span>
                </div>
                <p className="careers-integrity-text">
                  Sprimax Industrial operates under strict direct employment
                  mandates. No recruitment fees are charged to candidates under
                  any circumstance.
                </p>
              </div>
            </aside>
          </div>
        </article>
      ) : (
        /* =========================================================================
           VIEW 2: CAREERS LANDING PAGE (Screenshots 1 & 2)
           ========================================================================= */
        <div className="careers-landing-container">
          {/* Top Hero Section */}
          <section className="careers-hero-section">
            <div className="careers-hero-inner">
              {/* Left Column */}
              <div className="careers-hero-content">
                <div className="careers-hero-eyebrow">
                  <span className="careers-eyebrow-dash" /> CAREERS AT SPRIMAX
                </div>

                <h1 className="careers-hero-h1">
                  Build the Backbone of Global Infrastructure
                </h1>

                <p className="careers-hero-subhead">
                  We don't just manufacture parts; we engineer reliability for the
                  world's most demanding environments. Join a team of
                  uncompromising professionals dedicated to structural
                  integrity, technical precision, and industrial innovation.
                </p>

                <button
                  type="button"
                  className="careers-btn-view-roles"
                  onClick={handleScrollToOpenings}
                >
                  VIEW OPEN ROLES <ArrowDown size={16} />
                </button>
              </div>

              {/* Right Floating Card: Our Culture */}
              <div className="careers-culture-floating-card">
                <h3 className="careers-culture-title">Our Culture</h3>
                <p className="careers-culture-desc">
                  Forged in resilience, driven by precision. We value technical
                  expertise and a safety-first mindset above all.
                </p>

                <div className="careers-culture-stats-row">
                  <div className="careers-culture-stat-col">
                    <span className="careers-culture-stat-val">
                      {CAREERS_STATS[0].value}
                    </span>
                    <span className="careers-culture-stat-lbl">
                      {CAREERS_STATS[0].label}
                    </span>
                  </div>

                  <div className="careers-culture-stat-col">
                    <span className="careers-culture-stat-val">
                      {CAREERS_STATS[1].value}
                    </span>
                    <span className="careers-culture-stat-lbl">
                      {CAREERS_STATS[1].label}
                    </span>
                  </div>

                  {/* Hardhat subtle icon watermark */}
                  <div className="careers-culture-icon-watermark" aria-hidden="true">
                    <HardHat size={56} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* The Forge-Craft Advantage Section */}
          <section className="careers-advantage-section">
            <div className="careers-advantage-header">
              <h2 className="careers-advantage-h2">The Sprimax Advantage</h2>
              <p className="careers-advantage-subhead">
                We invest in our people with the same rigor we apply to our
                manufacturing processes. Expect comprehensive support for your
                professional and personal development.
              </p>
            </div>

            <div className="careers-advantage-grid">
              {/* Card 1: Continuous Technical Training (Large span) */}
              <div className="careers-adv-card adv-card-featured">
                <div className="careers-adv-card-watermark" aria-hidden="true">
                  <GraduationCap size={130} strokeWidth={1} />
                </div>
                <h3 className="careers-adv-card-title">
                  Continuous Technical Training
                </h3>
                <p className="careers-adv-card-desc">
                  Access industry-leading certification programs, advanced
                  metallurgical seminars, and hands-on workshops with
                  next-generation manufacturing robotics. We ensure your skills
                  remain at the bleeding edge of industrial technology.
                </p>
              </div>

              {/* Card 2: Safety First Culture (Solid Dark) */}
              <div className="careers-adv-card adv-card-dark">
                <div className="careers-adv-dark-watermark" aria-hidden="true">
                  <Shield size={110} strokeWidth={1.2} />
                </div>
                <div className="careers-adv-icon-red-box">
                  <ShieldCheck size={20} className="careers-red-icon" />
                </div>
                <h3 className="careers-adv-card-title text-white">
                  Safety First Culture
                </h3>
                <p className="careers-adv-card-desc text-muted-slate">
                  Zero-compromise protocols. Your well-being is the baseline
                  requirement for every operation we undertake.
                </p>
              </div>

              {/* Card 3: Global Exposure */}
              <div className="careers-adv-card adv-card-light">
                <div className="careers-adv-icon-gray-box">
                  <Globe size={22} className="careers-gray-icon" />
                </div>
                <h3 className="careers-adv-card-title">Global Exposure</h3>
                <p className="careers-adv-card-desc">
                  Collaborate across borders. Assignments in key infrastructural
                  hubs across EMEA, APAC, and the Americas.
                </p>
              </div>

              {/* Card 4: Tier-1 Compensation */}
              <div className="careers-adv-card adv-card-light">
                <div className="careers-adv-icon-gray-box">
                  <CreditCard size={22} className="careers-gray-icon" />
                </div>
                <h3 className="careers-adv-card-title">Tier-1 Compensation</h3>
                <p className="careers-adv-card-desc">
                  Highly competitive base salaries, performance-driven bonuses,
                  and comprehensive family healthcare coverage standard.
                </p>
              </div>
            </div>
          </section>

          {/* Current Openings Section */}
          <section
            id="current-openings-section"
            className="careers-openings-section"
          >
            <div className="careers-openings-header-row">
              <div className="careers-openings-title-col">
                <h2 className="careers-openings-h2">Current Openings</h2>
                <p className="careers-openings-subhead">
                  Showing available positions across all global divisions.
                </p>
              </div>

              {/* Search & Location Filter Bar */}
              <div className="careers-filter-controls">
                <div className="careers-search-input-wrap">
                  <Search size={16} className="careers-search-icon" />
                  <input
                    type="text"
                    placeholder="Search roles or SKUs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="careers-search-input"
                  />
                </div>

                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="careers-location-select"
                >
                  <option value="all">All Locations</option>
                  {availableLocations.length > 0 ? (
                    availableLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Dubai">Dubai, UAE</option>
                      <option value="Remote">Remote (MEA Region)</option>
                      <option value="Houston">Houston, TX</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Job Cards List */}
            <div className="careers-job-cards-list">
              {rolesLoading ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                  <Loader2 size={32} className="spinning" style={{ margin: '0 auto 12px' }} />
                  <p>Loading active engineering openings...</p>
                </div>
              ) : filteredRoles.map((role) => (
                <div key={role._id || role.id} className="careers-job-card">
                  <div className="careers-job-card-main">
                    <div className="careers-job-meta-row">
                      <span className="careers-job-dept-pill">
                        {role.department}
                      </span>
                      <span className="careers-job-loc-pill">
                        <MapPin size={13} /> {role.location}
                      </span>
                      <span className="careers-job-type-pill">
                        <Clock size={13} /> {role.type || role.employmentType || 'Full-time'}
                      </span>
                    </div>

                    <h3
                      className="careers-job-title"
                      onClick={() => handleOpenRoleDetail(role)}
                    >
                      {role.title}
                    </h3>

                    <p className="careers-job-desc">{role.shortDescription}</p>

                    <div className="careers-job-req-line">
                      {role.reqSummary}
                    </div>
                  </div>

                  <div className="careers-job-card-actions">
                    <button
                      type="button"
                      className="careers-btn-apply-job"
                      onClick={() => handleOpenRoleModal(role)}
                    >
                      APPLY NOW
                    </button>
                    <button
                      type="button"
                      className="careers-btn-view-job"
                      onClick={() => handleOpenRoleDetail(role)}
                    >
                      VIEW ROLE
                    </button>
                  </div>
                </div>
              ))}

              {filteredRoles.length === 0 && (
                <div className="careers-no-results">
                  <AlertCircle size={32} className="careers-no-res-icon" />
                  <p>No active openings found matching your criteria.</p>
                  <button
                    type="button"
                    className="careers-btn-reset-filters"
                    onClick={() => {
                      setSearchQuery('');
                      setLocationFilter('all');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Don't see the right fit? / HR Contact Desk Section */}
          <section className="careers-footer-callout-grid">
            {/* Left Card: General Application */}
            <div className="careers-callout-left">
              <h3 className="careers-callout-title">Don't see the right fit?</h3>
              <p className="careers-callout-text">
                We are always looking for exceptional talent in engineering,
                production, and technical sales. If you have a background in heavy
                industry and a drive for structural excellence, submit your
                resume to our talent pool.
              </p>
              <button
                type="button"
                className="careers-btn-general-app"
                onClick={() => setIsGeneralModalOpen(true)}
              >
                SEND GENERAL APPLICATION
              </button>
            </div>

            {/* Right Card: HR Contact Desk */}
            <div className="careers-callout-right-card">
              <div className="careers-hr-header">
                <HelpCircle size={20} className="careers-hr-icon-blue" />
                <h4 className="careers-hr-title">HR Contact Desk</h4>
              </div>
              <p className="careers-hr-desc">
                For specific inquiries regarding recruitment processes,
                partnerships, or university programs, reach out directly to our
                HR team.
              </p>
              <a
                href="mailto:careers@sprimax.com"
                className="careers-hr-email-link"
              >
                careers@sprimax.com
              </a>
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ROLE APPLICATION MODAL (Screenshot 6)
          ========================================================================= */}
      {applyRoleModalData && (
        <div className="careers-modal-backdrop" role="dialog" aria-modal="true">
          <div className="careers-modal-wrapper careers-docket-modal">
            {/* Top Navy Docket Header */}
            <header className="careers-docket-header">
              <div className="careers-docket-brand">
                <span className="careers-docket-logo-square">S</span>
                <span className="careers-docket-brand-text">
                  SPRIMAX TALENTS / ENGINEERING DOCKET SUBMISSION
                </span>
              </div>
              <div className="careers-docket-header-right">
                <span className="careers-docket-online-tag">SYSTEM ONLINE</span>
                <button
                  type="button"
                  className="careers-docket-close-btn"
                  onClick={() => setApplyRoleModalData(null)}
                  aria-label="Close form"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* Strip 1: Requisition ID & Operational Department */}
            <div className="careers-docket-strip careers-docket-strip-top">
              <div className="careers-docket-strip-left">
                <span className="careers-docket-tag-label">REQUISITION:</span>
                <span className="careers-docket-job-id">
                  JOB ID: {applyRoleModalData.reqCode}
                </span>
              </div>
              <div className="careers-docket-strip-right">
                <span className="careers-docket-tag-label">DEPARTMENT:</span>
                <span className="careers-docket-dept">
                  {applyRoleModalData.deptTag || applyRoleModalData.departmentFull}
                </span>
              </div>
            </div>

            {/* Strip 2: Base Plant / Location & Technical Reference */}
            <div className="careers-docket-strip careers-docket-strip-bottom">
              <div className="careers-docket-strip-left">
                <span className="careers-docket-job-loc">
                  <MapPin size={12} className="careers-strip-pin-icon" /> {applyRoleModalData.locationFull}
                </span>
              </div>
              <div className="careers-docket-strip-right">
                <span className="careers-docket-ref">
                  REF: {applyRoleModalData.refCode}
                </span>
              </div>
            </div>

            <h2 className="careers-docket-title">
              Apply for {applyRoleModalData.title}
            </h2>

            {/* Form */}
            <form
              onSubmit={handleRoleApplicationSubmit}
              className="careers-docket-form"
            >
              {/* Section 01: Personal Identification */}
              <div className="careers-form-section">
                <div className="careers-form-section-header">
                  <span className="careers-section-num-tag">
                    📁 01 // PERSONAL IDENTIFICATION
                  </span>
                  <span className="careers-required-notice">
                    REQUIRED FIELDS MARKED WITH *
                  </span>
                </div>

                <div className="careers-form-grid-2">
                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      FIRST NAME <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={roleForm.firstName}
                      onChange={(e) =>
                        setRoleForm({ ...roleForm, firstName: e.target.value })
                      }
                      className="careers-form-input"
                    />
                  </div>

                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      LAST NAME <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={roleForm.lastName}
                      onChange={(e) =>
                        setRoleForm({ ...roleForm, lastName: e.target.value })
                      }
                      className="careers-form-input"
                    />
                  </div>
                </div>

                <div className="careers-form-grid-2">
                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      CORPORATE / PRIMARY EMAIL <span className="text-red">*</span>
                    </label>
                    <div className="careers-input-with-icon">
                      <span className="careers-input-adornment">@</span>
                      <input
                        type="email"
                        required
                        value={roleForm.email}
                        onChange={(e) =>
                          setRoleForm({ ...roleForm, email: e.target.value })
                        }
                        className="careers-form-input"
                      />
                    </div>
                  </div>

                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      PHONE NUMBER <span className="text-red">*</span>
                    </label>
                    <div className="careers-phone-input-row">
                      <span className="careers-phone-prefix">
                        🇦🇪 {roleForm.phoneCountry}
                      </span>
                      <input
                        type="tel"
                        required
                        value={roleForm.phoneNumber}
                        onChange={(e) =>
                          setRoleForm({
                            ...roleForm,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="careers-form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="careers-form-field">
                  <label className="careers-form-label">
                    CURRENT LOCATION / COUNTRY OF RESIDENCE{' '}
                    <span className="text-red">*</span>
                  </label>
                  <div className="careers-input-with-icon">
                    <span className="careers-input-adornment">🌐</span>
                    <input
                      type="text"
                      required
                      value={roleForm.location}
                      onChange={(e) =>
                        setRoleForm({ ...roleForm, location: e.target.value })
                      }
                      className="careers-form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Section 02: Industry Experience & Credentials Dossier */}
              <div className="careers-form-section">
                <div className="careers-form-section-header">
                  <span className="careers-section-num-tag">
                    🔬 02 // INDUSTRY EXPERIENCE & CREDENTIALS DOSSIER
                  </span>
                  <span className="careers-domain-tag">METALLURGY DOMAIN</span>
                </div>

                <div className="careers-form-grid-2">
                  <div className="careers-form-field">
                    <label className="careers-form-label">CURRENT EMPLOYER</label>
                    <input
                      type="text"
                      value={roleForm.currentEmployer}
                      onChange={(e) =>
                        setRoleForm({
                          ...roleForm,
                          currentEmployer: e.target.value,
                        })
                      }
                      className="careers-form-input"
                    />
                  </div>

                  <div className="careers-form-field">
                    <label className="careers-form-label">CURRENT JOB TITLE</label>
                    <input
                      type="text"
                      value={roleForm.currentJobTitle}
                      onChange={(e) =>
                        setRoleForm({
                          ...roleForm,
                          currentJobTitle: e.target.value,
                        })
                      }
                      className="careers-form-input"
                    />
                  </div>
                </div>

                <div className="careers-form-field">
                  <label className="careers-form-label">
                    TOTAL RELEVANT METALLURGICAL EXPERIENCE{' '}
                    <span className="text-red">*</span>
                  </label>
                  <select
                    value={roleForm.experienceLevel}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        experienceLevel: e.target.value,
                      })
                    }
                    className="careers-form-select"
                  >
                    <option value="1 - 3 Years (Junior Metallurgist / QA Inspector)">
                      1 - 3 Years (Junior Metallurgist / QA Inspector)
                    </option>
                    <option value="3 - 5 Years (Mid-Level Metallurgical Specialist)">
                      3 - 5 Years (Mid-Level Metallurgical Specialist)
                    </option>
                    <option value="5 - 8 Years (Senior Metallurgist / Automated TIG Cladding)">
                      5 - 8 Years (Senior Metallurgist / Automated TIG Cladding)
                    </option>
                    <option value="8+ Years (Chief Metallurgist / Principal Engineer)">
                      8+ Years (Chief Metallurgist / Principal Engineer)
                    </option>
                  </select>
                </div>

                {/* CV Dossier Upload Box */}
                <div className="careers-form-field">
                  <div className="careers-file-header-row">
                    <label className="careers-form-label">
                      CURRICULUM VITAE / TECHNICAL DOSSIER{' '}
                      <span className="text-red">*</span>
                    </label>
                    <span className="careers-file-rules">
                      PDF, DOCX • MAX 15MB
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={roleFileInputRef}
                    accept=".pdf,.docx,.doc"
                    style={{ display: 'none' }}
                    onChange={handleRoleFileChange}
                  />

                  {roleFile ? (
                    <div className="careers-uploaded-file-card">
                      <div className="careers-file-icon-wrap">
                        <FileText size={22} className="careers-file-doc-icon" />
                      </div>
                      <div className="careers-file-info">
                        <div className="careers-file-name-row">
                          <span className="careers-file-name">
                            {roleFile.name}
                          </span>
                          <span className="careers-badge-verified">ATTACHED</span>
                        </div>
                        <span className="careers-file-subtext">
                          {roleForm.fileSize} • Validated Technical CV
                        </span>
                      </div>
                      <div className="careers-file-actions">
                        <button
                          type="button"
                          className="careers-file-btn"
                          onClick={() => roleFileInputRef.current?.click()}
                        >
                          ↻ REPLACE
                        </button>
                        <button
                          type="button"
                          className="careers-file-btn"
                          onClick={() => {
                            setRoleFile(null);
                            setRoleForm((prev) => ({
                              ...prev,
                              fileName: '',
                              fileSize: '',
                              fileChecksum: '',
                            }));
                          }}
                        >
                          🗑 DELETE
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="careers-drag-zone"
                      style={{ cursor: 'pointer' }}
                      onClick={() => roleFileInputRef.current?.click()}
                    >
                      <UploadCloud size={20} /> CLICK TO ATTACH TECHNICAL CV (PDF, DOCX)
                    </div>
                  )}
                </div>
              </div>

              {/* Section 03: Metallurgical & Inspection Certifications */}
              <div className="careers-form-section">
                <div className="careers-form-section-header">
                  <span className="careers-section-num-tag">
                    ☑ 03 // METALLURGICAL & INSPECTION CERTIFICATIONS
                  </span>
                  <span className="careers-domain-tag">CHECK ALL RELEVANT</span>
                </div>

                <div className="careers-checkbox-grid">
                  <label
                    className={`careers-checkbox-box ${
                      roleForm.certifications.includes('AWS CWI')
                        ? 'checked'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={roleForm.certifications.includes('AWS CWI')}
                      onChange={() => handleToggleCert('AWS CWI')}
                    />
                    <div>
                      <strong className="careers-cb-title">AWS CWI</strong>
                      <p className="careers-cb-desc">
                        American Welding Society Certified Inspector
                      </p>
                    </div>
                  </label>

                  <label
                    className={`careers-checkbox-box ${
                      roleForm.certifications.includes('CSWIP 3.1 / 3.2')
                        ? 'checked'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={roleForm.certifications.includes(
                        'CSWIP 3.1 / 3.2'
                      )}
                      onChange={() => handleToggleCert('CSWIP 3.1 / 3.2')}
                    />
                    <div>
                      <strong className="careers-cb-title">
                        CSWIP 3.1 / 3.2
                      </strong>
                      <p className="careers-cb-desc">
                        Senior Welding Inspector Scheme
                      </p>
                    </div>
                  </label>

                  <label
                    className={`careers-checkbox-box ${
                      roleForm.certifications.includes('NDT LEVEL II / III')
                        ? 'checked'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={roleForm.certifications.includes(
                        'NDT LEVEL II / III'
                      )}
                      onChange={() => handleToggleCert('NDT LEVEL II / III')}
                    />
                    <div>
                      <strong className="careers-cb-title">
                        NDT LEVEL II / III
                      </strong>
                      <p className="careers-cb-desc">
                        ISO 9712 / ASNT (UT, RT, PT & MT Qualification)
                      </p>
                    </div>
                  </label>

                  <label
                    className={`careers-checkbox-box ${
                      roleForm.certifications.includes('ISO 9001 LEAD AUDITOR')
                        ? 'checked'
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={roleForm.certifications.includes(
                        'ISO 9001 LEAD AUDITOR'
                      )}
                      onChange={() =>
                        handleToggleCert('ISO 9001 LEAD AUDITOR')
                      }
                    />
                    <div>
                      <strong className="careers-cb-title">
                        ISO 9001 LEAD AUDITOR
                      </strong>
                      <p className="careers-cb-desc">
                        Quality Management Systems Auditor
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Technical Cover Statement */}
              <div className="careers-form-section">
                <div className="careers-form-section-header">
                  <span className="careers-section-num-tag">
                    ⌨ TECHNICAL COVER STATEMENT / EXPERIENCE NOTES
                  </span>
                  <span className="careers-domain-tag">
                    OPTIONAL • MAX 2000 CHARACTERS
                  </span>
                </div>

                <textarea
                  rows={4}
                  value={roleForm.coverStatement}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      coverStatement: e.target.value,
                    })
                  }
                  className="careers-form-textarea"
                />
              </div>

              {/* Consent Box */}
              <label className="careers-consent-row">
                <input
                  type="checkbox"
                  required
                  checked={roleForm.certifiedConsent}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      certifiedConsent: e.target.checked,
                    })
                  }
                />
                <span className="careers-consent-text">
                  I certify that all technical and personal credentials provided
                  are authentic. I agree to the processing of personal and
                  professional data for recruitment and engineering verification
                  purposes in accordance with the{' '}
                  <strong className="underline">
                    Sprimax Industrial Privacy Policy
                  </strong>{' '}
                  and DIN EN ISO compliance standards.
                </span>
              </label>

              {submitError && (
                <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', margin: '14px 0' }}>
                  {submitError}
                </div>
              )}

              {/* Footer Actions */}
              <footer className="careers-docket-footer">
                <div className="careers-transmission-lock">
                  <Lock size={14} /> 256-BIT ENCRYPTED TRANSMISSION
                </div>

                <div className="careers-docket-actions">
                  <button
                    type="button"
                    className="careers-btn-cancel-docket"
                    onClick={() => setApplyRoleModalData(null)}
                    disabled={submitting}
                  >
                    CANCEL
                  </button>
                  <button type="submit" className="careers-btn-submit-docket" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="spinning" /> SUBMITTING...
                      </>
                    ) : (
                      'SUBMIT APPLICATION ▷'
                    )}
                  </button>
                </div>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: GENERAL APPLICATION MODAL (Screenshot 7)
          ========================================================================= */}
      {isGeneralModalOpen && (
        <div className="careers-modal-backdrop" role="dialog" aria-modal="true">
          <div className="careers-modal-wrapper careers-general-modal">
            <header className="careers-general-modal-header">
              <div className="careers-general-title-col">
                <span className="careers-general-ref">
                  ■ REF: SPRIMAX-TALENT-GEN // OPEN INTAKE
                </span>
                <h2 className="careers-general-title">
                  General Engineering & Corporate Application
                </h2>
              </div>
              <button
                type="button"
                className="careers-general-close-btn"
                onClick={() => setIsGeneralModalOpen(false)}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </header>

            <form
              onSubmit={handleGeneralApplicationSubmit}
              className="careers-general-form"
            >
              {/* Section 01 */}
              <div className="careers-general-section">
                <div className="careers-gen-section-tag">
                  📁 SECTION 01: IDENTIFICATION & CONTACT
                </div>

                <div className="careers-form-grid-2">
                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      FIRST NAME <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex"
                      value={generalForm.firstName}
                      onChange={(e) =>
                        setGeneralForm({
                          ...generalForm,
                          firstName: e.target.value,
                        })
                      }
                      className="careers-form-input"
                    />
                  </div>

                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      LAST NAME <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vance"
                      value={generalForm.lastName}
                      onChange={(e) =>
                        setGeneralForm({
                          ...generalForm,
                          lastName: e.target.value,
                        })
                      }
                      className="careers-form-input"
                    />
                  </div>
                </div>

                <div className="careers-form-grid-2">
                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      PROFESSIONAL EMAIL <span className="text-red">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex.vance@precision.com"
                      value={generalForm.email}
                      onChange={(e) =>
                        setGeneralForm({
                          ...generalForm,
                          email: e.target.value,
                        })
                      }
                      className="careers-form-input"
                    />
                  </div>

                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      PHONE NUMBER <span className="text-red">*</span>
                    </label>
                    <div className="careers-phone-input-row">
                      <span className="careers-phone-prefix">+1</span>
                      <input
                        type="tel"
                        required
                        placeholder="(555) 019-2834"
                        value={generalForm.phoneNumber}
                        onChange={(e) =>
                          setGeneralForm({
                            ...generalForm,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="careers-form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 02 */}
              <div className="careers-general-section">
                <div className="careers-gen-section-tag">
                  🔬 SECTION 02: DISCIPLINE & AVAILABILITY
                </div>

                <div className="careers-form-grid-2">
                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      PRIMARY FIELD OF EXPERTISE{' '}
                      <span className="text-red">*</span>
                    </label>
                    <select
                      value={generalForm.fieldOfExpertise}
                      onChange={(e) =>
                        setGeneralForm({
                          ...generalForm,
                          fieldOfExpertise: e.target.value,
                        })
                      }
                      className="careers-form-select"
                    >
                      <option value="Metallurgy & Materials Engineering">
                        Metallurgy & Materials Engineering
                      </option>
                      <option value="Automation & Robotics Welding">
                        Automation & Robotics Welding
                      </option>
                      <option value="Quality Assurance / ISO Compliance">
                        Quality Assurance / ISO Compliance
                      </option>
                      <option value="Piping & Structural Design">
                        Piping & Structural Design
                      </option>
                      <option value="Field Technical Sales & Operations">
                        Field Technical Sales & Operations
                      </option>
                      <option value="Plant Maintenance & LOTO Safety">
                        Plant Maintenance & LOTO Safety
                      </option>
                    </select>
                  </div>

                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      INDUSTRIAL EXPERIENCE{' '}
                      <span className="text-red">*</span>
                    </label>
                    <select
                      value={generalForm.experienceLevel}
                      onChange={(e) =>
                        setGeneralForm({
                          ...generalForm,
                          experienceLevel: e.target.value,
                        })
                      }
                      className="careers-form-select"
                    >
                      <option value="1 - 3 Years">1 - 3 Years</option>
                      <option value="3 - 5 Years">3 - 5 Years</option>
                      <option value="5 - 8 Years">5 - 8 Years</option>
                      <option value="8+ Years (Senior / Directorate)">
                        8+ Years (Senior / Directorate)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="careers-form-grid-2">
                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      CURRENT LOCATION <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="City, Country (e.g. Houston, USA)"
                      value={generalForm.currentLocation}
                      onChange={(e) =>
                        setGeneralForm({
                          ...generalForm,
                          currentLocation: e.target.value,
                        })
                      }
                      className="careers-form-input"
                    />
                  </div>

                  <div className="careers-form-field">
                    <label className="careers-form-label">
                      MOBILITY / RELOCATION
                    </label>
                    <select
                      value={generalForm.mobility}
                      onChange={(e) =>
                        setGeneralForm({
                          ...generalForm,
                          mobility: e.target.value,
                        })
                      }
                      className="careers-form-select"
                    >
                      <option value="Open to Global Relocation (EMEA, APAC, Americas)">
                        Open to Global Relocation (EMEA, APAC, Americas)
                      </option>
                      <option value="Regional UAE / GCC Only">
                        Regional UAE / GCC Only
                      </option>
                      <option value="Regional North America Only">
                        Regional North America Only
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 03 */}
              <div className="careers-general-section">
                <div className="careers-gen-section-tag">
                  📄 SECTION 03: CREDENTIALS & PORTFOLIO
                </div>

                <input
                  type="file"
                  ref={generalFileInputRef}
                  accept=".pdf,.docx,.doc"
                  style={{ display: 'none' }}
                  onChange={handleGeneralFileChange}
                />

                {generalFile ? (
                  <div className="careers-uploaded-file-card" style={{ marginBottom: '14px' }}>
                    <div className="careers-file-icon-wrap">
                      <FileText size={22} className="careers-file-doc-icon" />
                    </div>
                    <div className="careers-file-info">
                      <div className="careers-file-name-row">
                        <span className="careers-file-name">{generalFile.name}</span>
                        <span className="careers-badge-verified">ATTACHED</span>
                      </div>
                      <span className="careers-file-subtext">
                        {(generalFile.size / (1024 * 1024)).toFixed(1)} MB • Validated Resume
                      </span>
                    </div>
                    <div className="careers-file-actions">
                      <button
                        type="button"
                        className="careers-file-btn"
                        onClick={() => generalFileInputRef.current?.click()}
                      >
                        ↻ REPLACE
                      </button>
                      <button
                        type="button"
                        className="careers-file-btn"
                        onClick={() => {
                          setGeneralFile(null);
                          setGeneralForm((prev) => ({ ...prev, fileName: '' }));
                        }}
                      >
                        🗑 DELETE
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="careers-gen-drop-zone"
                    style={{ cursor: 'pointer' }}
                    onClick={() => generalFileInputRef.current?.click()}
                  >
                    <UploadCloud size={28} className="careers-cloud-orange" />
                    <strong>
                      Click or drop your CV / Resume file here (PDF, DOCX)
                    </strong>
                    <span className="careers-gen-drop-sub">
                      Accepted standards: PDF, DOCX (Max: 15MB). Include
                      certifications (ASNT, AWS, Six Sigma, PE license).
                    </span>
                  </div>
                )}

                <div className="careers-form-field">
                  <label className="careers-form-label">
                    BRIEF TECHNICAL SUMMARY / STATEMENT
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Summarize core competencies, specialized machinery certifications, or high-value infrastructure projects managed..."
                    value={generalForm.summary}
                    onChange={(e) =>
                      setGeneralForm({
                        ...generalForm,
                        summary: e.target.value,
                      })
                    }
                    className="careers-form-textarea"
                  />
                </div>
              </div>

              {/* Consent Box */}
              <label className="careers-consent-row">
                <input
                  type="checkbox"
                  required
                  checked={generalForm.authorizedConsent}
                  onChange={(e) =>
                    setGeneralForm({
                      ...generalForm,
                      authorizedConsent: e.target.checked,
                    })
                  }
                />
                <span className="careers-consent-text">
                  I authorize Sprimax Industrial Solutions to retain and process
                  my application data for ongoing talent evaluation across global
                  operational divisions under strict ISO / GDPR compliance
                  standards.
                </span>
              </label>

              {submitError && (
                <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', margin: '14px 0' }}>
                  {submitError}
                </div>
              )}

              {/* Footer */}
              <footer className="careers-general-footer">
                <div className="careers-transmission-lock text-orange">
                  <ShieldCheck size={14} /> Encrypted 256-bit Recruitment
                  Dossier
                </div>

                <div className="careers-general-actions">
                  <button
                    type="button"
                    className="careers-btn-cancel-gen"
                    onClick={() => setIsGeneralModalOpen(false)}
                    disabled={submitting}
                  >
                    CANCEL
                  </button>
                  <button type="submit" className="careers-btn-submit-gen" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 size={14} className="spinning" /> SUBMITTING...
                      </>
                    ) : (
                      'SUBMIT APPLICATION ▷'
                    )}
                  </button>
                </div>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: APPLICATION SUCCESS MODAL
          ========================================================================= */}
      {successModalData && (
        <div className="careers-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="success-modal-heading">
          <div className="careers-modal-wrapper careers-success-modal">
            {/* Screen reader live notification */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {receiptAnnouncement}
            </div>

            <div className="careers-success-icon-wrap" aria-hidden="true">
              <Check size={36} className="careers-success-check" />
            </div>

            <h2 id="success-modal-heading" className="careers-success-title">
              Application Successfully Lodged
            </h2>

            {/* Dynamic role/general intake narrative */}
            <p className="careers-success-desc">
              {successModalData.isGeneral ? (
                <>
                  Your profile and credentials have been securely received by the{' '}
                  <strong>Sprimax Talent Acquisition</strong> team.
                </>
              ) : (
                <>
                  Your application for <strong>{successModalData.jobTitle}</strong> has been securely received by the{' '}
                  <strong>{successModalData.department || 'Technical Recruitment'}</strong> team.
                </>
              )}
            </p>

            {/* Reference Number Badge */}
            <div className="careers-receipt-ref-banner">
              <span className="careers-ref-label">Official Submission Reference</span>
              <div className="careers-ref-value-row">
                <code className="careers-ref-code">{successModalData.referenceNumber}</code>
                <button
                  type="button"
                  className="careers-copy-ref-btn"
                  onClick={handleCopyReferenceNumber}
                  title="Copy Reference Number"
                  aria-label="Copy Reference Number to clipboard"
                >
                  {receiptCopied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{receiptCopied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            <div className="careers-success-actions-row">
              <button
                type="button"
                className="careers-btn-download-pdf"
                onClick={handleDownloadReceiptPdf}
                disabled={downloadingReceipt}
                aria-busy={downloadingReceipt}
              >
                {downloadingReceipt ? (
                  <>
                    <Loader2 size={16} className="spinning" /> PREPARING RECEIPT...
                  </>
                ) : (
                  <>
                    <Download size={16} /> DOWNLOAD RECEIPT (PDF)
                  </>
                )}
              </button>

              <button
                type="button"
                className="careers-btn-return-portal"
                onClick={() => {
                  setSuccessModalData(null);
                  setActiveRole(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                RETURN TO CAREERS PORTAL <ArrowRight size={16} />
              </button>
            </div>

            {/* Inline Error Message on Failure with Retry */}
            {receiptDownloadError && (
              <div className="careers-download-error-box" role="alert">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <AlertCircle size={15} /> Failed to retrieve receipt
                </div>
                <div>{receiptDownloadError}</div>
                <div style={{ fontSize: '11px', color: '#7F1D1D', marginTop: '2px' }}>
                  If the problem persists, please contact{' '}
                  <a
                    href={`mailto:talent@sprimax.com?subject=${encodeURIComponent(
                      `Application update - ${successModalData.referenceNumber}`
                    )}`}
                    style={{ textDecoration: 'underline', color: '#991B1B' }}
                  >
                    talent@sprimax.com
                  </a>{' '}
                  quoting your reference number <strong>{successModalData.referenceNumber}</strong>.
                </div>
                <button
                  type="button"
                  className="careers-retry-btn"
                  onClick={handleDownloadReceiptPdf}
                >
                  <RefreshCw size={12} style={{ display: 'inline', marginRight: '4px' }} /> RETRY DOWNLOAD
                </button>
              </div>
            )}

            <footer className="careers-success-footer-note">
              Have urgent credentials updates? Reach out to{' '}
              <a
                href={`mailto:talent@sprimax.com?subject=${encodeURIComponent(
                  `Application update - ${successModalData.referenceNumber}`
                )}`}
                className="careers-email-underlined"
              >
                talent@sprimax.com
              </a>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
