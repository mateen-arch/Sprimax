import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  Share2,
  ChevronRight,
  Shield,
  Award,
  Wallet,
  Plane,
  FileText,
  AlertCircle,
  HelpCircle,
  Check,
  Lock,
  UploadCloud,
  CheckCircle2,
  User,
} from 'lucide-react';
import { fetchAdminJobById, fetchAdminJobs } from './api/careers.js';
import './CareersJobPreviewPage.css';

export default function CareersJobPreviewPage({
  jobId,
  onBackToEditor,
}) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Viewport mode: 'desktop' | 'tablet' | 'mobile'
  const [viewport, setViewport] = useState('desktop');
  // Preview Tab: 'detail' | 'listing' | 'modal'
  const [previewTab, setPreviewTab] = useState('detail');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadTargetJob = async () => {
      try {
        let targetId = jobId;
        if (!targetId) {
          const match = window.location.pathname.match(/\/careers\/jobs\/([^/]+)\/preview/);
          if (match && match[1]) targetId = match[1];
        }

        if (!targetId) {
          const allRes = await fetchAdminJobs({ limit: 1 });
          if (allRes.jobs && allRes.jobs.length > 0) {
            targetId = allRes.jobs[0]._id;
          }
        }

        if (!targetId) {
          if (isMounted) {
            setError('No job requisition found to preview. Please create a job first.');
            setLoading(false);
          }
          return;
        }

        const res = await fetchAdminJobById(targetId);
        if (isMounted) {
          setJob(res.job);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load preview');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTargetJob();

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  if (loading) {
    return (
      <div className="preview-loading-screen">
        <div className="preview-spinner" />
        <p>Generating requisition preview...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="preview-error-screen">
        <AlertCircle size={36} color="#ff0804" />
        <h3>Failed to generate preview</h3>
        <p>{error || 'Job not found'}</p>
        <button type="button" onClick={onBackToEditor} className="btn-preview-back">
          Back to Editor
        </button>
      </div>
    );
  }

  return (
    <div className="careers-preview-container">
      {/* Top Banner Toolbar */}
      <header className="preview-top-toolbar">
        <div className="toolbar-left">
          <button type="button" onClick={onBackToEditor} className="btn-exit-preview">
            <ArrowLeft size={16} />
            <span>Back to Editor</span>
          </button>
          <div className="preview-mode-tag">
            <Eye size={14} />
            <span>Preview Mode (Simulation)</span>
          </div>
        </div>

        {/* Preview Tabs: Detail / Card / Application Modal */}
        <div className="toolbar-center">
          <div className="preview-tab-pills">
            <button
              type="button"
              className={`btn-tab-pill ${previewTab === 'detail' ? 'active' : ''}`}
              onClick={() => setPreviewTab('detail')}
            >
              Detail Page
            </button>
            <button
              type="button"
              className={`btn-tab-pill ${previewTab === 'listing' ? 'active' : ''}`}
              onClick={() => setPreviewTab('listing')}
            >
              Listing Card
            </button>
            <button
              type="button"
              className={`btn-tab-pill ${previewTab === 'modal' ? 'active' : ''}`}
              onClick={() => setPreviewTab('modal')}
            >
              Application Docket Modal
            </button>
          </div>

          {/* Viewport Toggles */}
          <div className="viewport-toggle-group">
            <button
              type="button"
              className={`btn-viewport ${viewport === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewport('desktop')}
              title="Desktop View (100%)"
            >
              <Monitor size={15} />
            </button>
            <button
              type="button"
              className={`btn-viewport ${viewport === 'tablet' ? 'active' : ''}`}
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
            >
              <Tablet size={15} />
            </button>
            <button
              type="button"
              className={`btn-viewport ${viewport === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewport('mobile')}
              title="Mobile View (375px)"
            >
              <Smartphone size={15} />
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <span className="slug-display">/careers/{job.slug}</span>
        </div>
      </header>

      {/* Simulated Viewport Frame */}
      <div className="preview-viewport-outer">
        <div className={`preview-viewport-frame frame-${viewport}`}>
          {/* TAB 1: FULL DETAIL PAGE PREVIEW */}
          {previewTab === 'detail' && (
            <div className="public-job-detail-mirror">
              {/* Breadcrumb */}
              <nav className="preview-breadcrumb">
                <span>Careers</span>
                <ChevronRight size={13} />
                <span>Open Roles</span>
                <ChevronRight size={13} />
                <span className="bc-current">{job.title}</span>
              </nav>

              {/* Header Box */}
              <header className="public-role-header-card">
                <div className="header-meta-pills">
                  <span className="badge-dept">{job.department}</span>
                  <span className="meta-pill">
                    <MapPin size={12} />
                    {job.location}
                  </span>
                  <span className="meta-pill">
                    <Clock size={12} />
                    {job.employmentType}
                  </span>
                  <span className="meta-pill-req">REQ: {job.reqCode}</span>
                  <span className="meta-pill-date">POSTED: {job.formattedPostedDate || 'JUST NOW'}</span>
                </div>

                <h1 className="role-main-title">{job.title}</h1>
                <p className="role-tagline">{job.tagline || job.shortDescription}</p>

                <div className="header-action-buttons">
                  <button type="button" className="btn-role-apply">
                    Apply for this role
                  </button>
                  <button type="button" className="btn-role-share">
                    <Share2 size={15} />
                    <span>Share position</span>
                  </button>
                </div>
              </header>

              {/* Highlight Stat Cards (up to 4) */}
              {Array.isArray(job.statCards) && job.statCards.length > 0 && (
                <div className="public-stats-grid">
                  {job.statCards.map((sc, i) => (
                    <div key={i} className="public-stat-item">
                      <span className="stat-item-label">{sc.label}</span>
                      <span className="stat-item-code">{sc.code}</span>
                      <span className="stat-item-subtext">{sc.subtext}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Two-Column Detail Layout */}
              <div className="public-detail-grid">
                {/* Main Content Sections */}
                <div className="detail-body-sections">
                  {Array.isArray(job.sections) &&
                    job.sections
                      .filter((s) => s.enabled !== false)
                      .map((sec, idx) => (
                        <section key={sec.id || idx} className="public-detail-section">
                          <h2 className="section-red-heading">{sec.heading}</h2>

                          {sec.type === 'mission' && sec.data?.paragraphs && (
                            <div className="section-paragraphs">
                              {sec.data.paragraphs.map((p, pIdx) => (
                                <p key={pIdx} className="sec-para-text">{p}</p>
                              ))}
                            </div>
                          )}

                          {sec.type === 'responsibilities' && sec.data?.items && (
                            <div className="section-ordered-list">
                              {sec.data.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="ordered-list-row">
                                  <span className="order-number">
                                    {String(itemIdx + 1).padStart(2, '0')}/
                                  </span>
                                  <p className="order-text">{item}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {sec.type === 'qualifications' && (
                            <div className="section-qualifications-box">
                              {sec.data?.mandatory && (
                                <div className="mandatory-box">
                                  <h4 className="qual-subtitle">Mandatory Criteria:</h4>
                                  {sec.data.mandatory.map((m, mIdx) => (
                                    <div key={mIdx} className="mandatory-row">
                                      <strong>{m.label}:</strong> <span>{m.text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {sec.data?.preferred && (
                                <div className="preferred-chips-box">
                                  <h4 className="qual-subtitle">Preferred Credentials:</h4>
                                  <div className="chips-row">
                                    {sec.data.preferred.map((c, cIdx) => (
                                      <span key={cIdx} className="pref-chip">{c}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {sec.type === 'custom' && sec.data?.paragraphs && (
                            <div className="section-paragraphs">
                              {sec.data.paragraphs.map((p, pIdx) => (
                                <p key={pIdx} className="sec-para-text">{p}</p>
                              ))}
                            </div>
                          )}
                        </section>
                      ))}
                </div>

                {/* Right Sidebar */}
                <aside className="detail-public-sidebar">
                  {/* Target Start Date & Metadata Card */}
                  <div className="public-sidebar-card">
                    <div className="start-date-header">
                      <span className="dot-indicator dot-green" />
                      <span className="start-date-label">TARGET START DATE:</span>
                      <span className="start-date-val">{job.sidebar?.targetStartDate || 'Immediate / Q1 2025'}</span>
                    </div>

                    <div className="sidebar-meta-list">
                      <div className="meta-row">
                        <span className="meta-key">Division:</span>
                        <span className="meta-val">{job.sidebar?.division || job.department}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">Location:</span>
                        <span className="meta-val">{job.sidebar?.location || job.location}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">Employment:</span>
                        <span className="meta-val">{job.sidebar?.employment || job.employmentType}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">Travel Req:</span>
                        <span className="meta-val">{job.sidebar?.travelReq || '15% Regional'}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-key">Security Level:</span>
                        <span className="meta-val">{job.sidebar?.securityLevel || 'Level-2 Technical'}</span>
                      </div>
                    </div>

                    <button type="button" className="btn-sidebar-apply">
                      Apply Now For {job.reqCode}
                    </button>
                    <span className="review-cycle-note">{job.sidebar?.reviewCycle || 'Review cycle: typically 2-4 business days'}</span>
                  </div>

                  {/* Recruiter / Talent Contact Card */}
                  {job.sidebar?.recruiter?.name && (
                    <div className="public-sidebar-card recruiter-card">
                      <div className="recruiter-header">
                        <div className="recruiter-avatar">
                          <User size={20} />
                        </div>
                        <div>
                          <h4 className="recruiter-name">{job.sidebar.recruiter.name}</h4>
                          <span className="recruiter-role">{job.sidebar.recruiter.role}</span>
                        </div>
                      </div>
                      <p className="recruiter-quote">"{job.sidebar.recruiter.quote}"</p>
                      <button type="button" className="btn-recruiter-inquire">
                        Inquire with {job.sidebar.recruiter.name.split(' ')[0]}
                      </button>
                    </div>
                  )}

                  {/* Integrity Guarantee Card */}
                  {job.sidebar?.integrityGuarantee?.enabled !== false && (
                    <div className="public-sidebar-card integrity-card">
                      <div className="integrity-title-row">
                        <Shield size={18} color="#10b981" />
                        <h4>Integrity Guarantee</h4>
                      </div>
                      <p>
                        {job.sidebar?.integrityGuarantee?.text ||
                          'Sprimax operates on strict zero-recruitment-fee principles. We never charge candidates for applications, processing, visas, or onboarding.'}
                      </p>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          )}

          {/* TAB 2: LISTING CARD PREVIEW */}
          {previewTab === 'listing' && (
            <div className="public-listing-card-mirror-wrapper">
              <div className="preview-listing-card">
                <div className="card-top-tags">
                  <span className="badge-dept">{job.department}</span>
                  <span className="card-location">
                    <MapPin size={13} className="pin-icon" />
                    {job.location}
                  </span>
                  <span className="card-type-tag">{job.employmentType}</span>
                </div>

                <h3 className="card-role-title">{job.title}</h3>
                <p className="card-desc-text">{job.shortDescription || job.tagline}</p>
                <div className="card-req-summary-row">
                  <span className="card-req-pill">{job.reqSummary}</span>
                </div>

                <div className="card-actions-bottom">
                  <button type="button" className="btn-card-apply">
                    Apply Now
                  </button>
                  <button type="button" className="btn-card-view">
                    View Role <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPLICATION MODAL SIMULATION */}
          {previewTab === 'modal' && (
            <div className="modal-simulation-wrapper">
              <div className="public-application-modal-mirror">
                <header className="modal-header-strip">
                  <div className="strip-badges">
                    <span className="strip-badge-id">REQ: {job.reqCode}</span>
                    <span className="strip-badge-dept">{job.department}</span>
                    <span className="strip-badge-loc">{job.location}</span>
                  </div>
                  <h2 className="modal-title">Apply for {job.title}</h2>
                  <p className="modal-subtitle">Engineering Docket Submission • Secure Candidate Portal</p>
                </header>

                <div className="modal-form-body-sim">
                  <div className="sim-section">
                    <h4 className="sim-sec-title">01 / Personal Identification</h4>
                    <div className="sim-grid-2">
                      <div className="sim-field-shell">First Name *</div>
                      <div className="sim-field-shell">Last Name *</div>
                    </div>
                    <div className="sim-grid-2">
                      <div className="sim-field-shell">Corporate / Work Email *</div>
                      <div className="sim-field-shell">+971 Contact Phone Number *</div>
                    </div>
                    <div className="sim-field-shell">Current Location / Country of Residence *</div>
                  </div>

                  <div className="sim-section">
                    <h4 className="sim-sec-title">02 / Industry Experience & Credentials</h4>
                    <div className="sim-grid-2">
                      <div className="sim-field-shell">Current Employer (e.g. EPC / Heavy Fabrication)</div>
                      <div className="sim-field-shell">Current Job Title</div>
                    </div>
                    <div className="sim-upload-box-sim">
                      <UploadCloud size={24} color="#ff0804" />
                      <span>Attach Candidate CV / Technical Resume (PDF, DOCX max 15MB)</span>
                    </div>
                  </div>

                  <div className="sim-section">
                    <h4 className="sim-sec-title">03 / Recognized Technical Certifications</h4>
                    <div className="sim-certs-grid">
                      {((job?.formConfig?.certifications) || job?.sidebar?.certifications || ['AWS CWI', 'CSWIP 3.1 / 3.2', 'NDT LEVEL II / III']).map((c, i) => {
                        const name = typeof c === 'string' ? c : (c.name || c.label || 'Certified Specialist');
                        const subtitle = typeof c === 'object' ? (c.subtitle || c.subtext || '') : '';
                        return (
                          <div key={i} className="sim-cert-card">
                            <Check size={14} color="#10b981" />
                            <div>
                              <strong>{name}</strong>
                              {subtitle && <small>{subtitle}</small>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="modal-footer-sim">
                    <span className="footer-encrypted-tag">
                      <Lock size={13} />
                      Encrypted 256-bit TLS Transmission
                    </span>
                    <button type="button" className="btn-modal-submit-sim" disabled>
                      Submit Application Docket (Preview Only)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
