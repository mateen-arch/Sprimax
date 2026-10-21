import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Search,
  Eye,
  Edit3,
  Copy,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Send,
  RotateCcw,
  Sparkles,
  FileText,
  Award,
} from 'lucide-react';
import {
  fetchAdminSolutions,
  deleteAdminSolutionApi,
  duplicateAdminSolutionApi,
  publishSolutionApi,
  unpublishSolutionApi,
} from './api/solutions.js';
import './SolutionsManagementPage.css';

export default function SolutionsManagementPage({
  onNavigate,
  onAddSolution,
  onEditSolution,
  onPreviewSolution,
}) {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCount: 0,
    publishedCount: 0,
    draftCount: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Menu
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteModalSolution, setDeleteModalSolution] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadSolutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminSolutions({
        search,
        status: statusFilter,
        limit: 100,
      });
      setSolutions(res.solutions || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      setError(err.message || 'Failed to load industry solutions');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadSolutions();
  }, [loadSolutions]);

  // Close menus on outside click
  useEffect(() => {
    const handleWindowClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  const handleDelete = async () => {
    if (!deleteModalSolution) return;
    setActionInProgress(true);
    try {
      await deleteAdminSolutionApi(deleteModalSolution._id);
      showToast(`Solution "${deleteModalSolution.title}" deleted.`);
      setDeleteModalSolution(null);
      loadSolutions();
    } catch (err) {
      showToast(err.message || 'Failed to delete solution', 'error');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await duplicateAdminSolutionApi(id);
      showToast(res.message || 'Duplicated solution as draft.');
      loadSolutions();
    } catch (err) {
      showToast(err.message || 'Failed to duplicate solution', 'error');
    }
  };

  const handleTogglePublish = async (sol, e) => {
    e.stopPropagation();
    try {
      if (sol.status === 'Published') {
        const res = await unpublishSolutionApi(sol._id);
        showToast(res.message || 'Solution moved to draft.');
      } else {
        const res = await publishSolutionApi(sol._id);
        showToast(res.message || 'Solution published live.');
      }
      loadSolutions();
    } catch (err) {
      showToast(err.message || 'Failed to update publication status', 'error');
    }
  };

  return (
    <div className="solutions-mgmt-page">
      {/* Toast Notification */}
      {toast && (
        <div className={`admin-toast-float toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="solutions-mgmt-header">
        <div className="header-left">
          <div className="page-title-row">
            <Layers className="page-header-icon" />
            <div>
              <h1 className="page-header-title">Industry Solutions CMS</h1>
              <p className="page-header-subtitle">
                Modular, section-based technical landing pages and specifications
              </p>
            </div>
          </div>
        </div>

        <div className="header-right">
          <button
            type="button"
            className="btn-create-solution"
            onClick={onAddSolution}
          >
            <Plus size={16} />
            <span>Create Solution Page</span>
          </button>
        </div>
      </header>

      {/* KPI Stat Cards */}
      <div className="solutions-stat-cards-grid">
        <div className="sol-stat-card">
          <div className="sol-stat-icon-wrap icon-total">
            <Layers size={18} />
          </div>
          <div className="sol-stat-content">
            <span className="sol-stat-label">Total Solutions</span>
            <span className="sol-stat-val">{stats.totalCount || solutions.length}</span>
          </div>
        </div>

        <div className="sol-stat-card">
          <div className="sol-stat-icon-wrap icon-published">
            <CheckCircle size={18} />
          </div>
          <div className="sol-stat-content">
            <span className="sol-stat-label">Published (Live)</span>
            <span className="sol-stat-val">{stats.publishedCount || 0}</span>
          </div>
        </div>

        <div className="sol-stat-card">
          <div className="sol-stat-icon-wrap icon-draft">
            <Clock size={18} />
          </div>
          <div className="sol-stat-content">
            <span className="sol-stat-label">In Draft</span>
            <span className="sol-stat-val">{stats.draftCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="solutions-filter-bar">
        <div className="search-input-box">
          <Search size={15} className="search-box-icon" />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-box-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="Published">Published Only</option>
            <option value="Draft">Draft Only</option>
          </select>

          <button
            type="button"
            className="btn-refresh"
            onClick={loadSolutions}
            title="Refresh list"
          >
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="solutions-table-wrapper">
        {loading ? (
          <div className="solutions-table-loading">
            <div className="loading-spinner" />
            <p>Loading Industry Solutions registry...</p>
          </div>
        ) : error ? (
          <div className="solutions-table-error">
            <AlertCircle size={24} color="#dc2626" />
            <p>{error}</p>
            <button type="button" onClick={loadSolutions} className="btn-retry">
              Retry
            </button>
          </div>
        ) : solutions.length === 0 ? (
          <div className="solutions-table-empty">
            <Layers size={36} color="#94a3b8" />
            <h3>No industry solutions found</h3>
            <p>Create your first modular industry solution page or adjust your search filter.</p>
            <button type="button" className="btn-create-solution" onClick={onAddSolution}>
              <Plus size={15} />
              <span>Create Solution Page</span>
            </button>
          </div>
        ) : (
          <table className="solutions-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Solution Title & Public URL</th>
                <th style={{ width: '25%' }}>Configured Sections</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '15%' }}>Last Updated</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {solutions.map((sol) => {
                const isPublished = sol.status === 'Published';
                const sectionsList = sol.sections || [];
                const updatedDate = sol.updatedAt
                  ? new Date(sol.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '—';

                return (
                  <tr key={sol._id} className="solutions-table-row">
                    <td>
                      <div className="sol-title-col">
                        <button
                          type="button"
                          className="sol-title-link"
                          onClick={() => onEditSolution(sol._id)}
                        >
                          {sol.title}
                        </button>
                        <span className="sol-slug-preview">
                          /solutions/<strong>{sol.slug}</strong>
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="sol-sections-badges-row">
                        <span className="sections-count-badge">
                          {sectionsList.length} {sectionsList.length === 1 ? 'Section' : 'Sections'}
                        </span>
                        {sectionsList.slice(0, 3).map((sec, idx) => (
                          <span key={idx} className="section-pill">
                            {sec.type}
                          </span>
                        ))}
                        {sectionsList.length > 3 && (
                          <span className="section-pill-more">+{sectionsList.length - 3}</span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={`sol-status-badge badge-${sol.status?.toLowerCase()}`}>
                        <span className="status-dot" />
                        <span>{sol.status}</span>
                      </span>
                    </td>

                    <td>
                      <span className="sol-date-text">{updatedDate}</span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="sol-actions-group">
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => onEditSolution(sol._id)}
                          title="Edit in CMS"
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => onPreviewSolution(sol._id)}
                          title="Simulated Preview"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={(e) => handleDuplicate(sol._id, e)}
                          title="Duplicate as Draft"
                        >
                          <Copy size={15} />
                        </button>

                        <button
                          type="button"
                          className={`action-icon-btn ${isPublished ? 'btn-unpublish' : 'btn-publish'}`}
                          onClick={(e) => handleTogglePublish(sol, e)}
                          title={isPublished ? 'Unpublish (Move to Draft)' : 'Publish Live'}
                        >
                          {isPublished ? <RotateCcw size={15} /> : <Send size={15} />}
                        </button>

                        <button
                          type="button"
                          className="action-icon-btn btn-delete"
                          onClick={() => setDeleteModalSolution(sol)}
                          title="Delete Solution"
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalSolution && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-header">
              <div className="modal-icon-danger">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="modal-title">Delete Solution Page</h3>
                <p className="modal-subtitle">
                  Are you sure you want to permanently remove this industry solution?
                </p>
              </div>
            </div>

            <div className="modal-body-content">
              <p>
                This will delete <strong>"{deleteModalSolution.title}"</strong> (
                <code>/solutions/{deleteModalSolution.slug}</code>) and remove all its sections and version history.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDeleteModalSolution(null)}
                disabled={actionInProgress}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-danger"
                onClick={handleDelete}
                disabled={actionInProgress}
              >
                {actionInProgress ? 'Deleting...' : 'Delete Solution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
