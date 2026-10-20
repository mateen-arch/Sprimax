import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Building,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  fetchAdminJobs,
  deleteAdminJobApi,
  duplicateAdminJobApi,
} from './api/careers.js';
import './CareersJobsPage.css';

export default function CareersJobsPage({
  onNavigate,
  onAddJob,
  onEditJob,
  onPreviewJob,
  onOpenSettings,
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    openCount: 0,
    draftCount: 0,
    closingSoonCount: 0,
    newApplicationsThisWeek: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [employmentFilter, setEmploymentFilter] = useState('all');

  // Confirmation Modals
  const [deleteModalJob, setDeleteModalJob] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminJobs({
        search,
        status: statusFilter,
        department: departmentFilter,
        location: locationFilter,
        employmentType: employmentFilter,
        limit: 100,
      });
      setJobs(res.jobs || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, departmentFilter, locationFilter, employmentFilter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleDeleteJob = async () => {
    if (!deleteModalJob) return;
    setActionInProgress(true);
    try {
      const res = await deleteAdminJobApi(deleteModalJob._id);
      showToast(res.message || 'Job archived successfully');
      setDeleteModalJob(null);
      loadJobs();
    } catch (err) {
      showToast(err.message || 'Failed to delete job', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDuplicateJob = async (job) => {
    try {
      const res = await duplicateAdminJobApi(job._id);
      showToast(res.message || 'Job duplicated as draft');
      loadJobs();
    } catch (err) {
      showToast(err.message || 'Failed to duplicate job', 'error');
    }
  };

  return (
    <div className="careers-jobs-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`careers-toast careers-toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <header className="careers-page-header">
        <div className="header-text-col">
          <h1 className="header-title">Job Postings & Requisition Management</h1>
          <p className="header-subtitle">
            Create and maintain enterprise engineering job openings, monitor application pipelines, and manage custom application dockets.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-careers-secondary"
            onClick={loadJobs}
            title="Refresh jobs list"
          >
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn-careers-primary"
            onClick={onAddJob}
          >
            <Plus size={16} />
            <span>Add Job</span>
          </button>
        </div>
      </header>

      {/* KPI Metric Summary Tiles */}
      <section className="careers-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-green">
            <CheckCircle size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Open Positions</span>
            <span className="kpi-value">{stats.openCount}</span>
            <span className="kpi-subtext">Active on public site</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-gray">
            <Clock size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Draft Requisitions</span>
            <span className="kpi-value">{stats.draftCount}</span>
            <span className="kpi-subtext">Pending review or publish</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-amber">
            <AlertCircle size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Closing Soon</span>
            <span className="kpi-value">{stats.closingSoonCount}</span>
            <span className="kpi-subtext">Closing within 7 days</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap kpi-blue">
            <Users size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">New Applications</span>
            <span className="kpi-value">{stats.newApplicationsThisWeek}</span>
            <span className="kpi-subtext">Received this week</span>
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div className="careers-filter-toolbar">
        <div className="search-box-shell">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search roles, REQ ID, department, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-dropdowns-row">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Draft">Draft</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Paused">Paused</option>
            <option value="Closed">Closed</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            className="filter-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="ENGINEERING">Engineering</option>
            <option value="SALES">Sales</option>
            <option value="ROBOTICS & AUTOMATION">Robotics & Automation</option>
            <option value="OPERATIONS & QUALITY">Operations & Quality</option>
            <option value="METALLURGY & R&D">Metallurgy & R&D</option>
          </select>

          <select
            className="filter-select"
            value={employmentFilter}
            onChange={(e) => setEmploymentFilter(e.target.value)}
          >
            <option value="all">All Work Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Executive">Executive</option>
          </select>
        </div>
      </div>

      {/* Jobs Data Table Card */}
      <div className="careers-table-card">
        {loading ? (
          <div className="careers-table-loading">
            <div className="careers-spinner" />
            <p>Loading enterprise job postings...</p>
          </div>
        ) : error ? (
          <div className="careers-table-error">
            <AlertCircle size={32} color="#ff0804" />
            <p>{error}</p>
            <button type="button" className="btn-careers-secondary" onClick={loadJobs}>
              Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="careers-table-empty">
            <Briefcase size={40} className="empty-icon" />
            <h3>No job postings found</h3>
            <p>Try clearing your filters or create a new requisition to begin hiring.</p>
            <button type="button" className="btn-careers-primary" onClick={onAddJob}>
              <Plus size={16} />
              <span>Create First Job</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="careers-data-table">
              <thead>
                <tr>
                  <th className="th-req">REQ ID</th>
                  <th className="th-title">Job Title & Overview</th>
                  <th className="th-dept">Department</th>
                  <th className="th-loc">Location / Type</th>
                  <th className="th-status">Status</th>
                  <th className="th-posted">Posted Date</th>
                  <th className="th-apps">Applications</th>
                  <th className="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const statusClass = `badge-status-${job.status.toLowerCase()}`;
                  return (
                    <tr key={job._id} className="careers-table-row">
                      {/* REQ ID */}
                      <td className="td-req">
                        <span className="req-code-pill">{job.reqCode}</span>
                        {job.featured && <span className="featured-star" title="Featured Role">★</span>}
                      </td>

                      {/* Job Title & Tagline */}
                      <td className="td-title">
                        <div className="title-cell-wrap">
                          <button
                            type="button"
                            className="job-title-link"
                            onClick={() => onEditJob(job._id)}
                          >
                            {job.title}
                          </button>
                          <span className="job-tagline-text">{job.tagline || job.shortDescription}</span>
                          {job.reqSummary && (
                            <span className="job-req-summary-pill">{job.reqSummary}</span>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="td-dept">
                        <span className="dept-badge">{job.department}</span>
                        {job.deptTag && <span className="subdept-text">{job.deptTag}</span>}
                      </td>

                      {/* Location & Work Type */}
                      <td className="td-loc">
                        <div className="loc-cell-wrap">
                          <span className="loc-text">
                            {job.location}
                          </span>
                          <span className="type-pill">{job.employmentType} • {job.workArrangement}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="td-status">
                        <span className={`status-badge ${statusClass}`}>
                          {job.status}
                        </span>
                      </td>

                      {/* Posted Date (Read-only Server Set) */}
                      <td className="td-posted">
                        <div className="posted-cell">
                          <span className="posted-date-text">
                            {job.formattedPostedDate || 'Not published yet'}
                          </span>
                          {job.closingDate && (
                            <span className="closing-note">
                              Closes: {new Date(job.closingDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Clickable Applications Count */}
                      <td className="td-apps">
                        <button
                          type="button"
                          className="btn-apps-link"
                          onClick={() => onNavigate('CareersApplications', { jobId: job._id, jobTitle: job.title })}
                          title={`View ${job.applicantsCount || 0} candidate submissions for this role`}
                        >
                          <Users size={14} />
                          <span className="apps-count-num">{job.applicantsCount || 0}</span>
                          <span className="apps-text-label">Applicants</span>
                          <ArrowRight size={13} className="apps-chevron" />
                        </button>
                      </td>

                      {/* Row Actions */}
                      <td className="td-actions">
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="btn-action-icon"
                            onClick={() => onEditJob(job._id)}
                            title="Edit Job"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon"
                            onClick={() => onPreviewJob(job._id)}
                            title="Live Simulated Preview"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon"
                            onClick={() => handleDuplicateJob(job)}
                            title="Duplicate as Draft"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon btn-action-delete"
                            onClick={() => setDeleteModalJob(job)}
                            title="Archive / Delete Job"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete / Archive Confirmation Modal */}
      {deleteModalJob && (
        <div className="careers-modal-backdrop">
          <div className="careers-confirm-dialog">
            <div className="dialog-header-warning">
              <AlertCircle size={24} color="#ff0804" />
              <h3>Archive Requisition</h3>
            </div>
            <p className="dialog-body-text">
              Are you sure you want to archive <strong>{deleteModalJob.title}</strong> (REQ: {deleteModalJob.reqCode})?
            </p>
            {deleteModalJob.applicantsCount > 0 && (
              <div className="dialog-callout-notice">
                <Users size={16} />
                <span>
                  This job has <strong>{deleteModalJob.applicantsCount} candidate applications</strong>. All candidate dossiers and submitted files will be safely preserved.
                </span>
              </div>
            )}
            <div className="dialog-actions-row">
              <button
                type="button"
                className="btn-careers-secondary"
                onClick={() => setDeleteModalJob(null)}
                disabled={actionInProgress}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-careers-danger"
                onClick={handleDeleteJob}
                disabled={actionInProgress}
              >
                {actionInProgress ? 'Archiving...' : 'Yes, Archive Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
