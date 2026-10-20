import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Shield,
  Briefcase,
  Layers,
  MapPin,
  Calendar,
  Clock,
  User,
  Award,
  UploadCloud,
  Wrench,
  FlaskConical,
  Snowflake,
  Plane,
  Wallet,
  Globe,
  Check,
  X,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import {
  fetchAdminJobById,
  createAdminJobApi,
  updateAdminJobApi,
  fetchAdminCareersSettings,
} from './api/careers.js';
import ImageUploader from './components/ImageUploader.jsx';
import './CareersJobEditorPage.css';

// Slugify helper
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

export default function CareersJobEditorPage({
  jobId = null,
  onBack,
  onNavigate,
  onPreview,
}) {
  const isEditing = Boolean(jobId);

  // Core Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [reqCode, setReqCode] = useState('');
  const [refCode, setRefCode] = useState('');
  const [tagline, setTagline] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [department, setDepartment] = useState('ENGINEERING');
  const [subDepartment, setSubDepartment] = useState('ADVANCED CLADDING');
  const [workArrangement, setWorkArrangement] = useState('On-site');
  const [remoteRegion, setRemoteRegion] = useState('');
  const [location, setLocation] = useState('Dubai, UAE');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [minExperienceYears, setMinExperienceYears] = useState(5);
  const [educationLevel, setEducationLevel] = useState('BS/MS in Materials Science');
  const [reqSummary, setReqSummary] = useState('');
  const [reqSummaryOverride, setReqSummaryOverride] = useState(false);

  // Status & Timestamps (Server-Set)
  const [status, setStatus] = useState('Draft');
  const [postedAt, setPostedAt] = useState(null);
  const [formattedPostedDate, setFormattedPostedDate] = useState('Not published yet');
  const [scheduledAt, setScheduledAt] = useState('');
  const [closingDate, setClosingDate] = useState('2027-12-31');
  const [featured, setFeatured] = useState(false);
  const [showShare, setShowShare] = useState(true);

  // Highlight Stat Cards
  const [statCards, setStatCards] = useState([
    { label: 'Base Plant', code: 'DXB-04', subtext: 'Jebel Ali South' },
    { label: 'Accreditation', code: 'ISO 17025', subtext: 'Calibrated Testing' },
    { label: 'Team Size', code: '18 Eng.', subtext: 'Materials Div' },
    { label: 'Visa Sponsorship', code: 'Full UAE', subtext: 'Direct Corporate' },
  ]);

  // Body Sections
  const [sections, setSections] = useState([]);

  // Sidebar Configuration
  const [sidebar, setSidebar] = useState({
    targetStartDate: 'Immediate / Q1 2025',
    targetStartDateColor: 'green',
    division: 'Metallurgy & QA',
    location: 'Dubai Technopark',
    employment: 'Permanent Expat',
    travelReq: '15% GCC Regional',
    securityLevel: 'Level-2 Technical',
    reviewCycle: 'TYPICALLY 3-5 BUSINESS DAYS',
    recruiter: {
      name: 'Elena Rostova',
      role: 'LEAD TECH RECRUITER',
      email: 'elena.rostova@sprimax.com',
      quote: 'Have questions about lab equipment specs, ISO scope, or family relocation allowances? Connect directly with our engineering talent cell.',
    },
    integrityGuarantee: {
      enabled: true,
      text: 'Sprimax operates on strict zero-recruitment-fee principles. We never charge candidates for applications, processing, visas, or onboarding. Official communication is strictly conducted through verified @sprimax.com corporate domains.',
    },
  });

  // Application Form Config for this job
  const [formConfig, setFormConfig] = useState({
    templateId: 'standard',
    cvRequired: true,
    allowSupplementaryDocs: true,
    coverStatementRequired: false,
    coverStatementMaxChars: 2000,
    certifications: [
      { name: 'AWS CWI', subtitle: 'American Welding Society Certified Inspector' },
      { name: 'CSWIP 3.1 / 3.2', subtitle: 'TWI Senior Welding Inspector Certification' },
      { name: 'NDT LEVEL II / III', subtitle: 'ISO 9712 / ASNT Non-Destructive Testing' },
      { name: 'ISO 9001 LEAD AUDITOR', subtitle: 'Quality Management Systems Lead Evaluator' },
    ],
    screeningQuestions: [],
    experienceRanges: [
      '0 - 2 Years (Junior / Entry-Level)',
      '3 - 5 Years (Mid-Level Welding Engineer)',
      '5 - 8 Years (Senior Metallurgist / Specialist)',
      '8 - 12 Years (Principal Lead / Operations Manager)',
      '12+ Years (Executive Director / Technical Authority)',
    ],
  });

  // Editor Meta State
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentId, setCurrentId] = useState(jobId);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auto-generate requirements summary if not overridden
  useEffect(() => {
    if (!reqSummaryOverride) {
      const generated = `Req: ${minExperienceYears}+ years experience • ${educationLevel || 'BS/MS'}`;
      setReqSummary(generated);
    }
  }, [minExperienceYears, educationLevel, reqSummaryOverride]);

  // Load Global Settings for dropdowns
  useEffect(() => {
    fetchAdminCareersSettings()
      .then((res) => {
        if (res.settings) setSettingsData(res.settings);
      })
      .catch(() => {});
  }, []);

  // Load Job data if editing
  useEffect(() => {
    if (!jobId) {
      // Set defaults for a new job
      const randomReq = `ENG-${Math.floor(1000 + Math.random() * 9000)}-DXB`;
      setReqCode(randomReq);
      setSections([
        {
          id: 'sec-mission',
          type: 'mission',
          heading: 'Mission & Strategic Impact',
          enabled: true,
          data: {
            paragraphs: [
              'Join our elite engineering division delivering mission-critical welding solutions for global infrastructure projects.',
            ],
            highlights: [
              { title: 'Global Standards Custody', description: 'Oversee compliance signoffs.', icon: 'shield-check' },
            ],
          },
        },
        {
          id: 'sec-resp',
          type: 'responsibilities',
          heading: 'Key Responsibilities',
          enabled: true,
          data: {
            items: [
              'Direct destructive and mechanical test procedures for alloy qualification.',
              'Author and certify procedure qualification records (PQR) and welder qualifications (WQR).',
              'Collaborate with engineering authorities on root-cause failure analysis.',
            ],
          },
        },
        {
          id: 'sec-qual',
          type: 'qualifications',
          heading: 'Required Qualifications & Technical Mastery',
          enabled: true,
          data: {
            mandatory: [
              { label: 'Education', text: 'Bachelor of Science in Materials Science or Metallurgical Engineering.' },
              { label: 'Industrial Experience', text: 'Minimum 5+ years operational experience in heavy structural welding.' },
            ],
            preferred: ['AWS CWI', 'CSWIP 3.1 / 3.2', 'ISO 9712 NDT Level II'],
          },
        },
      ]);
      return;
    }

    setLoading(true);
    fetchAdminJobById(jobId)
      .then((res) => {
        const j = res.job;
        setCurrentId(j._id);
        setTitle(j.title || '');
        setSlug(j.slug || '');
        setSlugManuallyEdited(true);
        setReqCode(j.reqCode || '');
        setRefCode(j.refCode || '');
        setTagline(j.tagline || '');
        setShortDescription(j.shortDescription || '');
        setDepartment(j.department || 'ENGINEERING');
        setSubDepartment(j.subDepartment || j.deptTag || '');
        setWorkArrangement(j.workArrangement || 'On-site');
        setRemoteRegion(j.remoteRegion || '');
        setLocation(j.location || 'Dubai, UAE');
        setEmploymentType(j.employmentType || 'Full-time');
        setMinExperienceYears(j.minExperienceYears || 0);
        setEducationLevel(j.educationLevel || '');
        setReqSummary(j.reqSummary || '');
        setReqSummaryOverride(Boolean(j.reqSummaryOverride));
        setStatus(j.status || 'Draft');
        setPostedAt(j.postedAt || null);
        setFormattedPostedDate(j.formattedPostedDate || 'Not published yet');
        setClosingDate(j.closingDate ? new Date(j.closingDate).toISOString().slice(0, 10) : '');
        setFeatured(Boolean(j.featured));
        setShowShare(j.showShare !== false);

        if (Array.isArray(j.statCards) && j.statCards.length > 0) {
          setStatCards(j.statCards);
        }
        if (Array.isArray(j.sections) && j.sections.length > 0) {
          setSections(j.sections);
        }
        if (j.sidebar) {
          setSidebar((prev) => ({ ...prev, ...j.sidebar }));
        }
        if (j.formConfig) {
          setFormConfig((prev) => ({ ...prev, ...j.formConfig }));
        }
      })
      .catch((err) => {
        showToast(err.message || 'Failed to load job', 'error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [jobId]);

  // Handle title change & auto-slug
  const handleTitleChange = (val) => {
    setTitle(val);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
    if (!slugManuallyEdited && (!isEditing || status === 'Draft')) {
      setSlug(slugify(val));
    }
  };

  // Publish checklist validator
  const checklist = useMemo(() => {
    return {
      hasTitle: Boolean(title.trim()),
      hasReqCode: Boolean(reqCode.trim()),
      hasTagline: Boolean(tagline.trim() || shortDescription.trim()),
      hasDepartment: Boolean(department.trim()),
      hasLocation: Boolean(location.trim()),
      hasSections: sections.length >= 2,
    };
  }, [title, reqCode, tagline, shortDescription, department, location, sections]);

  const canPublish = Object.values(checklist).every(Boolean);

  // Save / Publish Handler
  const handleSave = async (isPublishing = false) => {
    if (!title.trim()) {
      showToast('Please enter a job title before saving.', 'error');
      return;
    }

    if (isPublishing && !canPublish) {
      showToast('Please fulfill all items in the Publish Checklist before publishing.', 'error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('Saving...');

    const payload = {
      title,
      slug: slugify(slug || title),
      reqCode: reqCode.toUpperCase().trim(),
      refCode,
      tagline: tagline || shortDescription,
      shortDescription: shortDescription || tagline,
      department,
      subDepartment,
      deptTag: subDepartment,
      workArrangement,
      remoteRegion,
      location,
      employmentType,
      minExperienceYears: Number(minExperienceYears),
      educationLevel,
      reqSummary,
      reqSummaryOverride,
      statCards,
      sections,
      sidebar: {
        ...sidebar,
        division: sidebar.division || department,
        location: sidebar.location || location,
        employment: sidebar.employment || employmentType,
      },
      formConfig,
      featured,
      showShare,
      status: isPublishing ? 'Open' : status === 'Open' ? 'Open' : 'Draft',
      closingDate: closingDate ? new Date(closingDate) : null,
    };

    try {
      let savedJob;
      if (currentId) {
        const res = await updateAdminJobApi(currentId, payload);
        savedJob = res.job;
      } else {
        const res = await createAdminJobApi(payload);
        savedJob = res.job;
        setCurrentId(savedJob._id);
      }

      setIsDirty(false);
      setSaveStatus('Saved');
      if (savedJob.postedAt) {
        setPostedAt(savedJob.postedAt);
        setFormattedPostedDate(savedJob.formattedPostedDate || 'Just published');
      }
      if (savedJob.status) {
        setStatus(savedJob.status);
      }

      showToast(
        isPublishing
          ? 'Job published successfully to public website!'
          : 'Requisition draft saved successfully.'
      );
    } catch (err) {
      setSaveStatus('Unsaved changes');
      showToast(err.message || 'Error saving job', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Section builder helpers
  const handleToggleSection = (index) => {
    const updated = [...sections];
    updated[index].enabled = !updated[index].enabled;
    setSections(updated);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  };

  const handleMoveSection = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setSections(updated);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  };

  const handleAddCustomSection = () => {
    const newSec = {
      id: `sec-custom-${Date.now()}`,
      type: 'custom',
      heading: 'Additional Engineering Specifications',
      enabled: true,
      data: {
        paragraphs: ['Add custom specifications, field deployment guidelines, or certification requirements here.'],
      },
    };
    setSections([...sections, newSec]);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  };

  const handleDeleteSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  };

  if (loading) {
    return (
      <div className="editor-loading-screen">
        <div className="editor-spinner" />
        <p>Loading requisition editor...</p>
      </div>
    );
  }

  return (
    <div className="careers-editor-container">
      {/* Toast */}
      {toast && (
        <div className={`careers-toast careers-toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sticky Top Action Bar */}
      <header className="editor-top-bar">
        <div className="top-bar-left">
          <button type="button" onClick={onBack} className="btn-editor-back">
            <ArrowLeft size={16} />
            <span>Back to Openings</span>
          </button>
          <div className="top-bar-req-pill">
            <span className="req-tag">REQ:</span>
            <span className="req-val">{reqCode || 'NEW-JOB'}</span>
          </div>
          <span className={`save-status-indicator save-${saveStatus.toLowerCase().replace(/\s+/g, '-')}`}>
            {saveStatus}
          </span>
        </div>

        <div className="top-bar-right">
          {currentId && (
            <button
              type="button"
              className="btn-editor-preview"
              onClick={() => onPreview(currentId)}
            >
              <Eye size={15} />
              <span>Simulated Preview</span>
            </button>
          )}

          <button
            type="button"
            className="btn-editor-draft"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save size={15} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            className="btn-editor-publish"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            <Send size={15} />
            <span>{status === 'Open' ? 'Update & Live Sync' : 'Publish Requisition'}</span>
          </button>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="editor-two-col-layout">
        {/* LEFT COLUMN: Main Form & Section Builder */}
        <main className="editor-main-column">
          {/* 1. Job Basics Card */}
          <div className="editor-card">
            <h2 className="editor-card-heading">Role Title & Position Overview</h2>

            <div className="field-group">
              <label className="field-label">
                Job Title <span className="req-star">*</span>
              </label>
              <input
                type="text"
                className="input-field input-title"
                placeholder="e.g. Senior Metallurgical Engineer"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="field-row-split">
              <div className="field-group flex-1">
                <label className="field-label">Slug (Public URL)</label>
                <div className="slug-input-wrap">
                  <span className="slug-prefix">/careers/</span>
                  <input
                    type="text"
                    className="input-field slug-input"
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setSlugManuallyEdited(true);
                      setIsDirty(true);
                    }}
                  />
                </div>
              </div>

              <div className="field-group flex-1">
                <label className="field-label">Requisition ID (REQ)</label>
                <input
                  type="text"
                  className="input-field req-input"
                  value={reqCode}
                  onChange={(e) => {
                    setReqCode(e.target.value.toUpperCase());
                    setIsDirty(true);
                  }}
                  disabled={status === 'Open' && isEditing}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">
                Role Tagline / Strategic Subtitle <span className="req-star">*</span>
              </label>
              <textarea
                rows={2}
                className="textarea-field"
                placeholder="e.g. Spearhead mechanical fracture mechanics, alloy microstructural verification, and low-hydrogen consumable qualification..."
                value={tagline}
                onChange={(e) => {
                  setTagline(e.target.value);
                  setIsDirty(true);
                  setSaveStatus('Unsaved changes');
                }}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Short Description (Listing Cards)</label>
              <textarea
                rows={2}
                className="textarea-field"
                placeholder="Brief 1-2 sentence description shown on the public Current Openings listing card..."
                value={shortDescription}
                onChange={(e) => {
                  setShortDescription(e.target.value);
                  setIsDirty(true);
                  setSaveStatus('Unsaved changes');
                }}
              />
            </div>

            {/* Requirements line with auto-generation & override */}
            <div className="field-group">
              <div className="label-with-override">
                <label className="field-label">Public Requirements Summary Line</label>
                <label className="override-checkbox">
                  <input
                    type="checkbox"
                    checked={reqSummaryOverride}
                    onChange={(e) => {
                      setReqSummaryOverride(e.target.checked);
                      setIsDirty(true);
                    }}
                  />
                  <span>Manual Override</span>
                </label>
              </div>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Req: 5+ years experience • BS/MS in Materials Science"
                value={reqSummary}
                onChange={(e) => {
                  setReqSummary(e.target.value);
                  setIsDirty(true);
                }}
                disabled={!reqSummaryOverride}
              />
              <span className="field-hint">
                {reqSummaryOverride
                  ? 'Manual override active. You can type any custom requirements text.'
                  : 'Auto-generated from Experience Years and Education Level.'}
              </span>
            </div>
          </div>

          {/* 2. Highlight Stat Cards Repeater (up to 4) */}
          <div className="editor-card">
            <div className="card-header-row">
              <h2 className="editor-card-heading">4 Highlight Stat Cards</h2>
              <span className="card-subtitle-tag">Displayed below header on detail page</span>
            </div>

            <div className="stat-cards-editor-grid">
              {statCards.map((card, idx) => (
                <div key={idx} className="stat-card-editor-item">
                  <span className="stat-card-num">Card 0{idx + 1}</span>
                  <input
                    type="text"
                    className="stat-input stat-label"
                    placeholder="Label (e.g. Base Plant)"
                    value={card.label}
                    onChange={(e) => {
                      const updated = [...statCards];
                      updated[idx].label = e.target.value;
                      setStatCards(updated);
                      setIsDirty(true);
                    }}
                  />
                  <input
                    type="text"
                    className="stat-input stat-code"
                    placeholder="Main Value (e.g. DXB-04)"
                    value={card.code}
                    onChange={(e) => {
                      const updated = [...statCards];
                      updated[idx].code = e.target.value;
                      setStatCards(updated);
                      setIsDirty(true);
                    }}
                  />
                  <input
                    type="text"
                    className="stat-input stat-subtext"
                    placeholder="Subtext (e.g. Jebel Ali)"
                    value={card.subtext}
                    onChange={(e) => {
                      const updated = [...statCards];
                      updated[idx].subtext = e.target.value;
                      setStatCards(updated);
                      setIsDirty(true);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 3. Body Section Builder */}
          <div className="editor-card">
            <div className="card-header-row">
              <h2 className="editor-card-heading">Body Section Builder</h2>
              <button
                type="button"
                className="btn-add-section"
                onClick={handleAddCustomSection}
              >
                <Plus size={14} />
                <span>Add Section</span>
              </button>
            </div>
            <p className="field-hint" style={{ marginBottom: '16px' }}>
              Each section renders with our red accent-bar industrial design. Reorder sections or toggle visibility as needed.
            </p>

            <div className="sections-accordion-list">
              {sections.map((sec, idx) => (
                <div key={sec.id || idx} className={`section-accordion-item ${!sec.enabled ? 'section-disabled' : ''}`}>
                  <div className="section-item-header">
                    <div className="sec-header-left">
                      <span className="sec-type-tag">{sec.type.toUpperCase()}</span>
                      <input
                        type="text"
                        className="sec-heading-input"
                        value={sec.heading}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[idx].heading = e.target.value;
                          setSections(updated);
                          setIsDirty(true);
                        }}
                      />
                    </div>

                    <div className="sec-header-actions">
                      <label className="sec-toggle-label">
                        <input
                          type="checkbox"
                          checked={sec.enabled}
                          onChange={() => handleToggleSection(idx)}
                        />
                        <span>{sec.enabled ? 'Active' : 'Hidden'}</span>
                      </label>
                      <button
                        type="button"
                        className="btn-sec-arrow"
                        onClick={() => handleMoveSection(idx, -1)}
                        disabled={idx === 0}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-sec-arrow"
                        onClick={() => handleMoveSection(idx, 1)}
                        disabled={idx === sections.length - 1}
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-sec-del"
                        onClick={() => handleDeleteSection(idx)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Section Body Editors */}
                  {sec.enabled && (
                    <div className="section-item-body">
                      {/* Mission / Custom Paragraphs */}
                      {(sec.type === 'mission' || sec.type === 'custom') && (
                        <div className="field-group">
                          <label className="field-label-sm">Paragraphs (Separate by empty line)</label>
                          <textarea
                            rows={4}
                            className="textarea-field"
                            value={Array.isArray(sec.data?.paragraphs) ? sec.data.paragraphs.join('\n\n') : ''}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[idx].data = {
                                ...updated[idx].data,
                                paragraphs: e.target.value.split('\n\n').filter(Boolean),
                              };
                              setSections(updated);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      )}

                      {/* Responsibilities list */}
                      {sec.type === 'responsibilities' && (
                        <div className="field-group">
                          <label className="field-label-sm">Numbered Responsibilities (One per line)</label>
                          <textarea
                            rows={6}
                            className="textarea-field"
                            value={Array.isArray(sec.data?.items) ? sec.data.items.join('\n') : ''}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[idx].data = {
                                ...updated[idx].data,
                                items: e.target.value.split('\n').filter(Boolean),
                              };
                              setSections(updated);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      )}

                      {/* Qualifications Mandatory Criteria */}
                      {sec.type === 'qualifications' && (
                        <div className="qualifications-editor-wrap">
                          <label className="field-label-sm">Preferred Credentials Chips (Comma separated)</label>
                          <input
                            type="text"
                            className="input-field"
                            value={Array.isArray(sec.data?.preferred) ? sec.data.preferred.join(', ') : ''}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[idx].data = {
                                ...updated[idx].data,
                                preferred: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              };
                              setSections(updated);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      )}

                      {/* Facility Context Section */}
                      {sec.type === 'facilityContext' && (
                        <div className="facility-context-editor-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div className="field-group">
                            <label className="field-label-sm">Facility Image (Cloudinary)</label>
                            <ImageUploader
                              value={sec.data?.image || ''}
                              onChange={(url) => {
                                const updated = [...sections];
                                updated[idx].data = { ...updated[idx].data, image: url };
                                setSections(updated);
                                setIsDirty(true);
                              }}
                              folder="sprimax/careers/facility"
                              helpText="Industrial testing facility / plant context image (16:9 ratio, max 5MB)"
                            />
                          </div>

                          <div className="field-row-split">
                            <div className="field-group flex-1">
                              <label className="field-label-sm">Hub Label</label>
                              <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. FACILITY HUB: JAFZA SOUTH TECHNOPARK"
                                value={sec.data?.hubLabel || ''}
                                onChange={(e) => {
                                  const updated = [...sections];
                                  updated[idx].data = { ...updated[idx].data, hubLabel: e.target.value };
                                  setSections(updated);
                                  setIsDirty(true);
                                }}
                              />
                            </div>
                            <div className="field-group flex-1">
                              <label className="field-label-sm">Classification / Standards Label</label>
                              <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. ISO 9001 / ISO 14001 Facility"
                                value={sec.data?.classLabel || ''}
                                onChange={(e) => {
                                  const updated = [...sections];
                                  updated[idx].data = { ...updated[idx].data, classLabel: e.target.value };
                                  setSections(updated);
                                  setIsDirty(true);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Job-Specific Application Form Settings */}
          <div className="editor-card">
            <h2 className="editor-card-heading">Application Form & Docket Settings</h2>
            <p className="field-hint" style={{ marginBottom: '16px' }}>
              Configure the candidate intake modal ("Engineering Docket Submission") for this specific role.
            </p>

            <div className="form-settings-grid">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={formConfig.cvRequired}
                  onChange={(e) => {
                    setFormConfig({ ...formConfig, cvRequired: e.target.checked });
                    setIsDirty(true);
                  }}
                />
                <span>CV / Resume Upload Mandatory</span>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={formConfig.allowSupplementaryDocs}
                  onChange={(e) => {
                    setFormConfig({ ...formConfig, allowSupplementaryDocs: e.target.checked });
                    setIsDirty(true);
                  }}
                />
                <span>Allow Supplementary Files (Portfolios, Weld Procedure Logs)</span>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={formConfig.coverStatementRequired}
                  onChange={(e) => {
                    setFormConfig({ ...formConfig, coverStatementRequired: e.target.checked });
                    setIsDirty(true);
                  }}
                />
                <span>Technical Cover Statement Required</span>
              </label>
            </div>
          </div>
        </main>

        {/* RIGHT COLUMN: Settings Sidebar */}
        <aside className="editor-settings-sidebar">
          {/* Publish Checklist */}
          <div className="sidebar-card checklist-card">
            <h3 className="sidebar-card-title">Publish Checklist</h3>
            <div className="checklist-items">
              <div className={`chk-item ${checklist.hasTitle ? 'chk-done' : ''}`}>
                {checklist.hasTitle ? <Check size={14} /> : <X size={14} />}
                <span>Job Title defined</span>
              </div>
              <div className={`chk-item ${checklist.hasReqCode ? 'chk-done' : ''}`}>
                {checklist.hasReqCode ? <Check size={14} /> : <X size={14} />}
                <span>Unique REQ ID specified</span>
              </div>
              <div className={`chk-item ${checklist.hasTagline ? 'chk-done' : ''}`}>
                {checklist.hasTagline ? <Check size={14} /> : <X size={14} />}
                <span>Tagline & overview written</span>
              </div>
              <div className={`chk-item ${checklist.hasDepartment ? 'chk-done' : ''}`}>
                {checklist.hasDepartment ? <Check size={14} /> : <X size={14} />}
                <span>Department assigned</span>
              </div>
              <div className={`chk-item ${checklist.hasLocation ? 'chk-done' : ''}`}>
                {checklist.hasLocation ? <Check size={14} /> : <X size={14} />}
                <span>Primary location selected</span>
              </div>
              <div className={`chk-item ${checklist.hasSections ? 'chk-done' : ''}`}>
                {checklist.hasSections ? <Check size={14} /> : <X size={14} />}
                <span>At least 2 body sections</span>
              </div>
            </div>
          </div>

          {/* Status & Timing (Posted Date is Server-Set) */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Requisition Status</h3>

            <div className="sidebar-field">
              <label className="field-label-sm">Workflow Status</label>
              <select
                className="sidebar-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setIsDirty(true);
                }}
              >
                <option value="Draft">Draft</option>
                <option value="Open">Open (Live on Website)</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Paused">Paused (Temporarily Hidden)</option>
                <option value="Closed">Closed (Not Accepting Apps)</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Read-Only Server-Set Posted Date */}
            <div className="sidebar-field">
              <label className="field-label-sm">
                Posted Date <span className="immutable-tag">(Server-Set Only)</span>
              </label>
              <div className="immutable-date-box">
                <Calendar size={14} />
                <span>{formattedPostedDate}</span>
              </div>
              <span className="field-hint">
                Immutable. Set automatically by the server when this job is first published.
              </span>
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Closing Date (Optional)</label>
              <input
                type="date"
                className="sidebar-input"
                value={closingDate}
                onChange={(e) => {
                  setClosingDate(e.target.value);
                  setIsDirty(true);
                }}
              />
            </div>
          </div>

          {/* Department & Location */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Placement & Classification</h3>

            <div className="sidebar-field">
              <label className="field-label-sm">Department / Division <span className="req-star">*</span></label>
              <select
                className="sidebar-select"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setIsDirty(true);
                }}
              >
                <option value="ENGINEERING">ENGINEERING</option>
                <option value="SALES">SALES</option>
                <option value="ROBOTICS & AUTOMATION">ROBOTICS & AUTOMATION</option>
                <option value="OPERATIONS & QUALITY">OPERATIONS & QUALITY</option>
                <option value="METALLURGY & R&D">METALLURGY & R&D</option>
              </select>
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Sub-Department Tag</label>
              <input
                type="text"
                className="sidebar-input"
                placeholder="e.g. ADVANCED CLADDING"
                value={subDepartment}
                onChange={(e) => {
                  setSubDepartment(e.target.value);
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Primary Location <span className="req-star">*</span></label>
              <input
                type="text"
                className="sidebar-input"
                placeholder="e.g. Dubai, UAE"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Work Arrangement</label>
              <select
                className="sidebar-select"
                value={workArrangement}
                onChange={(e) => {
                  setWorkArrangement(e.target.value);
                  setIsDirty(true);
                }}
              >
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Employment Type</label>
              <select
                className="sidebar-select"
                value={employmentType}
                onChange={(e) => {
                  setEmploymentType(e.target.value);
                  setIsDirty(true);
                }}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>

          {/* Experience & Requirements */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Experience & Qualifications</h3>

            <div className="sidebar-field">
              <label className="field-label-sm">Minimum Experience (Years)</label>
              <input
                type="number"
                min={0}
                max={30}
                className="sidebar-input"
                value={minExperienceYears}
                onChange={(e) => {
                  setMinExperienceYears(e.target.value);
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Education Level</label>
              <input
                type="text"
                className="sidebar-input"
                placeholder="e.g. BS/MS in Materials Science"
                value={educationLevel}
                onChange={(e) => {
                  setEducationLevel(e.target.value);
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Target Start Date</label>
              <input
                type="text"
                className="sidebar-input"
                placeholder="e.g. Immediate / Q1 2025"
                value={sidebar.targetStartDate}
                onChange={(e) => {
                  setSidebar({ ...sidebar, targetStartDate: e.target.value });
                  setIsDirty(true);
                }}
              />
            </div>
          </div>

          {/* Visibility & Badges */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Visibility & Badges</h3>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => {
                  setFeatured(e.target.checked);
                  setIsDirty(true);
                }}
              />
              <span>Featured Role (Priority Sorting)</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={showShare}
                onChange={(e) => {
                  setShowShare(e.target.checked);
                  setIsDirty(true);
                }}
              />
              <span>Show Share Position Button</span>
            </label>
          </div>

          {/* Talent Cell / Recruiter Contact */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Talent Cell Recruiter</h3>
            <p className="card-toggle-desc" style={{ marginBottom: '10px' }}>
              Displayed on public role page so candidates can reach out directly.
            </p>

            <div className="sidebar-field">
              <label className="field-label-sm">Recruiter Photo (Cloudinary)</label>
              <ImageUploader
                value={sidebar.recruiter?.photo || sidebar.recruiter?.image || ''}
                onChange={(url) => {
                  setSidebar((prev) => ({
                    ...prev,
                    recruiter: { ...prev.recruiter, photo: url, image: url },
                  }));
                  setIsDirty(true);
                }}
                folder="sprimax/careers/contacts"
                helpText="Square recruiter portrait (240x240px, max 5MB)"
              />
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Recruiter Name</label>
              <input
                type="text"
                className="sidebar-input"
                placeholder="e.g. Elena Rostova"
                value={sidebar.recruiter?.name || ''}
                onChange={(e) => {
                  setSidebar((prev) => ({
                    ...prev,
                    recruiter: { ...prev.recruiter, name: e.target.value },
                  }));
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Title / Role</label>
              <input
                type="text"
                className="sidebar-input"
                placeholder="e.g. LEAD TECH RECRUITER"
                value={sidebar.recruiter?.role || ''}
                onChange={(e) => {
                  setSidebar((prev) => ({
                    ...prev,
                    recruiter: { ...prev.recruiter, role: e.target.value },
                  }));
                  setIsDirty(true);
                }}
              />
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Contact Email</label>
              <input
                type="email"
                className="sidebar-input"
                placeholder="e.g. elena.rostova@sprimax.com"
                value={sidebar.recruiter?.email || ''}
                onChange={(e) => {
                  setSidebar((prev) => ({
                    ...prev,
                    recruiter: { ...prev.recruiter, email: e.target.value },
                  }));
                  setIsDirty(true);
                }}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
