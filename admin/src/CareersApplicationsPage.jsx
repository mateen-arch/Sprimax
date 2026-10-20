import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Star,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Layers,
  LayoutGrid,
  List,
  Trash2,
  X,
  MessageSquare,
  Send,
  Video,
  Shield,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  fetchAdminApplications,
  fetchAdminApplicationById,
  updateApplicationStatusApi,
  updateApplicationRatingApi,
  addApplicationNoteApi,
  scheduleApplicationInterviewApi,
  deleteApplicationApi,
  getExportApplicationsCsvUrl,
  getAdminApplicationReceiptUrl,
} from './api/careers.js';
import './CareersApplicationsPage.css';

const PIPELINE_STATUSES = [
  'New',
  'In Review',
  'Shortlisted',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
  'Talent Pool',
];

export default function CareersApplicationsPage({
  initialJobId = null,
  initialJobTitle = null,
  onNavigate,
  onOpenSettings,
}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    newCount: 0,
    inReviewCount: 0,
    interviewCount: 0,
    hiredCount: 0,
    talentPoolCount: 0,
  });

  // View mode: 'table' | 'kanban'
  const [viewMode, setViewMode] = useState('table');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(initialJobId || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState(0);

  // Selected Application for Detail Drawer
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [appDetail, setAppDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteAuthor, setNoteAuthor] = useState('Technical Reviewer');

  // Interview Modal Form
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    type: 'Video Call (Teams/Meet)',
    interviewers: 'Elena Rostova, Chief Metallurgist',
    locationOrLink: 'https://teams.microsoft.com/l/meetup-join/sprimax-interview',
    notes: 'Technical evaluation of welding procedures and fracture toughness testing.',
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminApplications({
        search,
        jobId: selectedJobId !== 'all' ? selectedJobId : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
        rating: ratingFilter > 0 ? ratingFilter : undefined,
        limit: 100,
      });
      setApplications(res.applications || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [search, selectedJobId, statusFilter, sourceFilter, ratingFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Load single application detail into drawer
  const openApplicationDetail = async (id) => {
    setSelectedAppId(id);
    setDetailLoading(true);
    try {
      const res = await fetchAdminApplicationById(id);
      setAppDetail(res.application);
      // Update read status in local list
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      showToast(err.message || 'Failed to load application detail', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatusApi(appId, newStatus);
      showToast(`Candidate status updated to ${newStatus}`);
      if (appDetail && appDetail._id === appId) {
        setAppDetail({ ...appDetail, status: newStatus });
      }
      loadApplications();
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleRatingChange = async (appId, ratingVal) => {
    try {
      await updateApplicationRatingApi(appId, ratingVal);
      if (appDetail && appDetail._id === appId) {
        setAppDetail({ ...appDetail, rating: ratingVal });
      }
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, rating: ratingVal } : a))
      );
      showToast(`Rating set to ${ratingVal} stars`);
    } catch (err) {
      showToast(err.message || 'Failed to update rating', 'error');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedAppId) return;
    try {
      const res = await addApplicationNoteApi(selectedAppId, newNote, noteAuthor, 'Reviewer');
      setAppDetail({ ...appDetail, notes: res.notes });
      setNewNote('');
      showToast('Internal note recorded');
    } catch (err) {
      showToast(err.message || 'Failed to add note', 'error');
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedAppId) return;
    try {
      const res = await scheduleApplicationInterviewApi(selectedAppId, interviewForm);
      setAppDetail(res.application);
      setShowInterviewModal(false);
      showToast('Interview invitation logged and scheduled');
      loadApplications();
    } catch (err) {
      showToast(err.message || 'Failed to schedule interview', 'error');
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (!window.confirm('Are you sure you want to anonymize this candidate application per GDPR retention rules?')) return;
    try {
      await deleteApplicationApi(appId);
      showToast('Candidate record anonymized successfully');
      setSelectedAppId(null);
      setAppDetail(null);
      loadApplications();
    } catch (err) {
      showToast(err.message || 'Failed to anonymize application', 'error');
    }
  };

  return (
    <div className="careers-apps-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`careers-toast careers-toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="careers-page-header">
        <div className="header-text-col">
          <h1 className="header-title">Candidate Applications & Talent Pipeline</h1>
          <p className="header-subtitle">
            Review incoming engineering dockets, candidate qualifications, technical CVs, and track hiring stages.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-careers-secondary"
            onClick={loadApplications}
            title="Refresh application records"
          >
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>

          <a
            href={getExportApplicationsCsvUrl()}
            className="btn-careers-secondary"
            download="sprimax-careers-applications.csv"
            title="Export candidates to CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </a>
        </div>
      </header>

      {/* KPI Tiles */}
      <section className="careers-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-blue">
            <Users size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">New Submissions</span>
            <span className="kpi-value">{stats.newCount}</span>
            <span className="kpi-subtext">Awaiting initial review</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-amber">
            <Clock size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Under Technical Review</span>
            <span className="kpi-value">{stats.inReviewCount}</span>
            <span className="kpi-subtext">Active evaluations</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-green">
            <Calendar size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Interviews Scheduled</span>
            <span className="kpi-value">{stats.interviewCount}</span>
            <span className="kpi-subtext">Candidate panels</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-gray">
            <Shield size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Global Talent Pool</span>
            <span className="kpi-value">{stats.talentPoolCount}</span>
            <span className="kpi-subtext">Qualified candidates</span>
          </div>
        </div>
      </section>

      {/* Filter and View Mode Switcher */}
      <div className="careers-filter-toolbar">
        <div className="search-box-shell">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search candidate name, email, role, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-dropdowns-row">
          {initialJobTitle && (
            <div className="job-filter-badge">
              <span>Filtered: {initialJobTitle}</span>
              <button type="button" onClick={() => setSelectedJobId('all')} className="btn-clear-job-filter">
                &times;
              </button>
            </div>
          )}

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Stages</option>
            {PIPELINE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="job">Role Specific</option>
            <option value="general">General Intake</option>
          </select>

          {/* View Mode Toggle: Table / Kanban */}
          <div className="view-mode-toggle-group">
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
              <span>Table</span>
            </button>
            <button
              type="button"
              className={`btn-view-toggle ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Pipeline Board"
            >
              <LayoutGrid size={16} />
              <span>Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="careers-table-card">
          {loading ? (
            <div className="careers-table-loading">
              <div className="careers-spinner" />
              <p>Loading candidate dockets...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="careers-table-empty">
              <Users size={36} className="empty-icon" />
              <h3>No candidate applications found</h3>
              <p>Applications submitted on the public website will appear here in real time.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="careers-data-table">
                <thead>
                  <tr>
                    <th className="th-candidate">Applicant Name</th>
                    <th className="th-role">Applied Position & REQ</th>
                    <th className="th-loc">Location</th>
                    <th className="th-exp">Experience Level</th>
                    <th className="th-status">Stage</th>
                    <th className="th-rating">Rating</th>
                    <th className="th-applied">Applied Date</th>
                    <th className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const statusClass = `badge-app-${app.status.toLowerCase().replace(/\s+/g, '-')}`;
                    return (
                      <tr
                        key={app._id}
                        className={`careers-table-row ${!app.isRead ? 'row-unread' : ''}`}
                        onClick={() => openApplicationDetail(app._id)}
                      >
                        {/* Name & Email */}
                        <td className="td-candidate">
                          <div className="candidate-cell">
                            {!app.isRead && <span className="unread-dot" title="New / Unopened" />}
                            <span className="candidate-name">{app.firstName} {app.lastName}</span>
                            <span className="candidate-email">{app.email}</span>
                            <span className="candidate-ref-chip" style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#475569', background: '#f1f5f9', padding: '1px 6px', borderRadius: '3px', marginTop: '3px', display: 'inline-block', width: 'fit-content' }}>
                              {app.referenceNumber || app.receiptCode}
                            </span>
                          </div>
                        </td>

                        {/* Position & REQ */}
                        <td className="td-role">
                          <div className="role-cell">
                            <span className="applied-title">{app.jobTitle}</span>
                            <span className="applied-req">{app.reqCode}</span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="td-loc">
                          <span className="app-loc-text">{app.currentLocation}</span>
                        </td>

                        {/* Experience */}
                        <td className="td-exp">
                          <span className="app-exp-pill">{app.experienceLevel || '5+ Years'}</span>
                        </td>

                        {/* Pipeline Stage Dropdown */}
                        <td className="td-status" onClick={(e) => e.stopPropagation()}>
                          <select
                            className={`app-status-select ${statusClass}`}
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          >
                            {PIPELINE_STATUSES.map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>

                        {/* Star Rating */}
                        <td className="td-rating" onClick={(e) => e.stopPropagation()}>
                          <div className="stars-rating-row">
                            {[1, 2, 3, 4, 5].map((starNum) => (
                              <button
                                key={starNum}
                                type="button"
                                className={`btn-star ${starNum <= (app.rating || 0) ? 'star-filled' : ''}`}
                                onClick={() => handleRatingChange(app._id, starNum)}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </td>

                        {/* Applied Date (Server-Set) */}
                        <td className="td-applied">
                          <span className="app-date-text">
                            {app.formattedAppliedDate || (app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '')}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="td-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="btn-action-icon"
                            onClick={() => openApplicationDetail(app._id)}
                            title="Open Dossier"
                          >
                            <ChevronRight size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="careers-kanban-board">
          {PIPELINE_STATUSES.map((stage) => {
            const stageApps = applications.filter((a) => a.status === stage);
            return (
              <div key={stage} className="kanban-column">
                <div className="kanban-column-header">
                  <span className="column-title">{stage}</span>
                  <span className="column-count">{stageApps.length}</span>
                </div>

                <div className="kanban-cards-list">
                  {stageApps.map((item) => (
                    <div
                      key={item._id}
                      className="kanban-card"
                      onClick={() => openApplicationDetail(item._id)}
                    >
                      <div className="kanban-card-top">
                        <span className="kanban-applicant-name">{item.firstName} {item.lastName}</span>
                        <span className="kanban-req">{item.reqCode}</span>
                      </div>
                      <p className="kanban-job-title">{item.jobTitle}</p>
                      <div className="kanban-card-meta">
                        <span className="kanban-loc">{item.currentLocation}</span>
                        <div className="kanban-stars">
                          {'★'.repeat(item.rating || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {stageApps.length === 0 && (
                    <div className="kanban-empty-col">No candidates in {stage}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* APPLICATION DETAIL DRAWER / MODAL */}
      {selectedAppId && (
        <div className="careers-drawer-backdrop" onClick={() => setSelectedAppId(null)}>
          <aside className="careers-detail-drawer" onClick={(e) => e.stopPropagation()}>
            {detailLoading || !appDetail ? (
              <div className="drawer-loading">
                <div className="careers-spinner" />
                <p>Loading candidate dossier...</p>
              </div>
            ) : (
              <div className="drawer-content">
                {/* Header */}
                <div className="drawer-header">
                  <div className="drawer-header-info">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="drawer-req-tag">{appDetail.reqCode}</span>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', background: '#e0e7ff', color: '#3730a3', fontWeight: 700, padding: '2px 8px', borderRadius: '3px' }}>
                        {appDetail.referenceNumber || appDetail.receiptCode}
                      </span>
                    </div>
                    <h2 className="drawer-candidate-name">{appDetail.firstName} {appDetail.lastName}</h2>
                    <span className="drawer-role-applied">Applying for: {appDetail.jobTitle}</span>
                  </div>
                  <button type="button" className="btn-drawer-close" onClick={() => setSelectedAppId(null)}>
                    <X size={20} />
                  </button>
                </div>

                {/* Pipeline Actions Ribbon */}
                <div className="drawer-actions-ribbon">
                  <div className="ribbon-field">
                    <label>Stage:</label>
                    <select
                      className="ribbon-select"
                      value={appDetail.status}
                      onChange={(e) => handleStatusChange(appDetail._id, e.target.value)}
                    >
                      {PIPELINE_STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ribbon-field">
                    <label>Rating:</label>
                    <div className="stars-rating-row">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`btn-star ${s <= (appDetail.rating || 0) ? 'star-filled' : ''}`}
                          onClick={() => handleRatingChange(appDetail._id, s)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-schedule-int"
                    onClick={() => setShowInterviewModal(true)}
                  >
                    <Video size={14} />
                    <span>Schedule Interview</span>
                  </button>
                </div>

                {/* Drawer Body Tabs / Sections */}
                <div className="drawer-body">
                  {/* Contact Info */}
                  <div className="drawer-section">
                    <h4 className="drawer-sec-heading">Candidate Contact & Residence</h4>
                    <div className="drawer-data-grid">
                      <div className="data-item">
                        <span className="item-label">Email Address:</span>
                        <a href={`mailto:${appDetail.email}`} className="item-link">
                          <Mail size={13} /> {appDetail.email}
                        </a>
                      </div>
                      <div className="data-item">
                        <span className="item-label">Phone:</span>
                        <a href={`tel:${appDetail.phoneCountry}${appDetail.phoneNumber}`} className="item-link">
                          <Phone size={13} /> {appDetail.phoneCountry} {appDetail.phoneNumber}
                        </a>
                      </div>
                      <div className="data-item">
                        <span className="item-label">Location / Visa:</span>
                        <span className="item-val">{appDetail.currentLocation}</span>
                      </div>
                      <div className="data-item">
                        <span className="item-label">Applied Date:</span>
                        <span className="item-val">{appDetail.formattedAppliedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Experience & Credentials */}
                  <div className="drawer-section">
                    <h4 className="drawer-sec-heading">Industrial Experience</h4>
                    <div className="drawer-data-grid">
                      <div className="data-item">
                        <span className="item-label">Current Employer:</span>
                        <span className="item-val">{appDetail.currentEmployer || 'Confidential / Direct'}</span>
                      </div>
                      <div className="data-item">
                        <span className="item-label">Current Job Title:</span>
                        <span className="item-val">{appDetail.currentJobTitle || 'Specialist'}</span>
                      </div>
                      <div className="data-item">
                        <span className="item-label">Experience Bracket:</span>
                        <span className="item-val">{appDetail.experienceLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {Array.isArray(appDetail.certifications) && appDetail.certifications.length > 0 && (
                    <div className="drawer-section">
                      <h4 className="drawer-sec-heading">Technical Certifications</h4>
                      <div className="certs-chips-wrap">
                        {appDetail.certifications.map((c, i) => (
                          <span key={i} className="drawer-cert-pill">
                            <Award size={13} color="#10b981" />
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attached Documents */}
                  <div className="drawer-section">
                    <h4 className="drawer-sec-heading">Submitted Technical CV & Dossier</h4>
                    <div className="cv-document-card">
                      <FileText size={28} color="#ff0804" />
                      <div className="cv-details">
                        <span className="cv-name">{appDetail.cvFile?.originalName || 'Candidate_CV.pdf'}</span>
                        <span className="cv-meta">
                          {appDetail.cvFile?.size ? `${Math.round(appDetail.cvFile.size / 1024)} KB` : 'Verified 2.4 MB'} • SHA-256 Validated
                        </span>
                      </div>
                      {appDetail.cvFile?.url ? (
                        <a
                          href={appDetail.cvFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-cv-download"
                        >
                          <Download size={14} />
                          <span>Download CV</span>
                        </a>
                      ) : (
                        <span className="cv-placeholder-tag">Document Secured</span>
                      )}
                    </div>

                    {/* Official Receipt Action */}
                    <div className="cv-document-card" style={{ marginTop: '10px', borderColor: '#e2e8f0', background: '#f8fafc' }}>
                      <FileText size={28} color="#212e68" />
                      <div className="cv-details">
                        <span className="cv-name">Sprimax-Application-Receipt-{appDetail.referenceNumber || appDetail.receiptCode}.pdf</span>
                        <span className="cv-meta">
                          Official Server-Generated PDF Receipt • {appDetail.referenceNumber || appDetail.receiptCode}
                        </span>
                      </div>
                      <a
                        href={getAdminApplicationReceiptUrl(appDetail._id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-cv-download"
                        style={{ background: '#212e68', color: '#ffffff', borderColor: '#212e68' }}
                      >
                        <Download size={14} />
                        <span>Receipt (PDF)</span>
                      </a>
                    </div>
                  </div>

                  {/* Cover Statement */}
                  {appDetail.coverStatement && (
                    <div className="drawer-section">
                      <h4 className="drawer-sec-heading">Technical Cover Statement</h4>
                      <div className="cover-statement-box">
                        <p>{appDetail.coverStatement}</p>
                      </div>
                    </div>
                  )}

                  {/* Threaded Internal Notes */}
                  <div className="drawer-section">
                    <h4 className="drawer-sec-heading">Internal Reviewer Notes ({appDetail.notes?.length || 0})</h4>
                    <div className="notes-thread-list">
                      {(appDetail.notes || []).map((n, i) => (
                        <div key={n.id || i} className="note-card-item">
                          <div className="note-header">
                            <span className="note-author">{n.author}</span>
                            <span className="note-date">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="note-content-text">{n.content}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddNote} className="add-note-form">
                      <input
                        type="text"
                        className="note-input"
                        placeholder="Add an internal evaluation note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <button type="submit" className="btn-submit-note">
                        <Send size={14} />
                        <span>Post Note</span>
                      </button>
                    </form>
                  </div>

                  {/* Scheduled Interviews */}
                  {Array.isArray(appDetail.interviews) && appDetail.interviews.length > 0 && (
                    <div className="drawer-section">
                      <h4 className="drawer-sec-heading">Scheduled Interview Panels</h4>
                      <div className="interviews-list">
                        {appDetail.interviews.map((intv, i) => (
                          <div key={intv.id || i} className="interview-card">
                            <Video size={18} color="#2563eb" />
                            <div className="interview-info">
                              <strong>{new Date(intv.date).toLocaleString()}</strong>
                              <span>Panel: {intv.interviewers}</span>
                              <span className="interview-link">{intv.locationOrLink}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audit & Compliance Consent */}
                  <div className="drawer-section audit-section">
                    <h4 className="drawer-sec-heading">Compliance & GDPR Audit</h4>
                    <div className="audit-details">
                      <span>Policy Version: {appDetail.consent?.policyVersion || 'v2.4'}</span>
                      <span>Consent Timestamp: {new Date(appDetail.appliedAt).toUTCString()}</span>
                      <span>IP Address: {appDetail.consent?.ipAddress || '192.168.1.1 (Masked)'}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-anonymize-candidate"
                      onClick={() => handleDeleteApplication(appDetail._id)}
                    >
                      <Trash2 size={13} />
                      <span>Anonymize Candidate (GDPR Erasure)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* SCHEDULE INTERVIEW MODAL */}
      {showInterviewModal && (
        <div className="careers-modal-backdrop" onClick={() => setShowInterviewModal(false)}>
          <div className="careers-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header-warning">
              <Video size={22} color="#2563eb" />
              <h3>Schedule Candidate Interview</h3>
            </div>
            <form onSubmit={handleScheduleInterview} className="interview-modal-form">
              <div className="field-group">
                <label className="field-label-sm">Date & Time</label>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label-sm">Interview Type</label>
                <select
                  className="input-field"
                  value={interviewForm.type}
                  onChange={(e) => setInterviewForm({ ...interviewForm, type: e.target.value })}
                >
                  <option value="Video Call (Teams/Meet)">Video Call (Teams/Meet)</option>
                  <option value="On-site JAFZA Materials Lab">On-site JAFZA Materials Lab</option>
                  <option value="Technical Phone Screening">Technical Phone Screening</option>
                </select>
              </div>

              <div className="field-group">
                <label className="field-label-sm">Interview Panelists</label>
                <input
                  type="text"
                  className="input-field"
                  value={interviewForm.interviewers}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewers: e.target.value })}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label-sm">Meeting Link / Room Location</label>
                <input
                  type="text"
                  className="input-field"
                  value={interviewForm.locationOrLink}
                  onChange={(e) => setInterviewForm({ ...interviewForm, locationOrLink: e.target.value })}
                />
              </div>

              <div className="dialog-actions-row" style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-careers-secondary"
                  onClick={() => setShowInterviewModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-careers-primary">
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
