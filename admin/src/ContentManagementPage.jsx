import { useState, useMemo, useEffect } from 'react';
import {
  AlignLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Factory,
  FileText,
  Home,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  Mail,
  MoreVertical,
  Pencil,
  Power,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import './ContentManagementPage.css';

// The actual public website pages rendered by frontend/src/App.jsx
const REAL_WEBSITE_PAGES = [
  {
    id: 'page-home',
    name: 'Home Page',
    slug: '/',
    frontendPath: '',
    status: 'Published',
    lastUpdated: 'Live',
    iconType: 'home',
    iconNavy: true,
    description: 'Hero announcement banner, real-time welding categories, and featured technical solutions.',
  },
  {
    id: 'page-products',
    name: 'Product Catalogue',
    slug: '/products',
    frontendPath: 'products',
    status: 'Published',
    lastUpdated: 'Live',
    iconType: 'grid',
    iconNavy: false,
    description: 'Comprehensive welding consumables & machines catalog with dynamic search and category filters.',
  },
  {
    id: 'page-about',
    name: 'About Sprimax',
    slug: '/about',
    frontendPath: 'about',
    status: 'Published',
    lastUpdated: 'Live',
    iconType: 'info',
    iconNavy: false,
    description: 'Company heritage, engineering mission, global fabrication capabilities, and quality ethos.',
  },
  {
    id: 'page-company',
    name: 'Company & Solutions',
    slug: '/company',
    frontendPath: 'company',
    status: 'Published',
    lastUpdated: 'Live',
    iconType: 'factory',
    iconNavy: false,
    description: 'Industry solutions overview for shipyard, pressure vessel, pipelines, and heavy fabrication.',
  },
  {
    id: 'page-resources',
    name: 'Technical Resources & Downloads',
    slug: '/resources',
    frontendPath: 'resources',
    status: 'Published',
    lastUpdated: 'Live',
    iconType: 'file',
    iconNavy: false,
    description: 'Technical datasheets, compliance certificates, welding procedure specifications (WPS), and user guides.',
  },
  {
    id: 'page-contact',
    name: 'Contact & Support',
    slug: '/contact',
    frontendPath: 'contact',
    status: 'Published',
    lastUpdated: 'Live',
    iconType: 'mail',
    iconNavy: false,
    description: 'Corporate headquarters contact info, interactive location map, and technical support inquiry form.',
  },
  {
    id: 'page-dealer',
    name: 'Become a Dealer',
    slug: '/become-dealer',
    frontendPath: 'become-dealer',
    status: 'Published',
    lastUpdated: 'Live',
    iconType: 'users',
    iconNavy: false,
    description: 'Global distribution network onboarding, partner tier benefits, and dealership application.',
  },
  {
    id: 'page-submit-requirements',
    name: 'Custom Project Requirements',
    slug: '/submit-requirements',
    frontendPath: 'submit-requirements',
    status: 'Draft',
    lastUpdated: 'Recent',
    iconType: 'file',
    iconNavy: false,
    description: 'Engineering consultation form for custom alloy specifications and turn-key welding setups.',
  },
];

const STORAGE_KEY = 'sprimax_content_pages_data';

export default function ContentManagementPage({ onLogout, onNavigate }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const pageSize = 5;

  // Real-time pages state (persisted locally so changes survive page refresh)
  const [pages, setPages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read saved pages:', e);
    }
    return REAL_WEBSITE_PAGES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
    } catch (e) {
      console.warn('Could not persist pages:', e);
    }
  }, [pages]);

  // Modals & Menu State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [currentEditPage, setCurrentEditPage] = useState(null);
  const [currentViewPage, setCurrentViewPage] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  // Close actions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.actions-cell-relative')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter pages by search query
  const filteredPages = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
    );
  }, [pages, globalSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredPages.length / pageSize));
  const activePage = Math.min(currentPageNum, totalPages);

  const paginatedPages = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return filteredPages.slice(start, start + pageSize);
  }, [filteredPages, activePage, pageSize]);

  // Real-time Content Status Counters
  const statusStats = useMemo(() => {
    const published = pages.filter((p) => p.status === 'Published').length;
    const draft = pages.filter((p) => p.status === 'Draft').length;
    const archived = pages.filter((p) => p.status === 'Archived').length;
    return { published, draft, archived, total: pages.length };
  }, [pages]);

  // Render Page Row Icon
  const renderPageIcon = (iconType, iconNavy) => {
    const className = `page-icon-box${iconNavy ? ' page-icon-box--navy' : ''}`;
    switch (iconType) {
      case 'home':
        return (
          <div className={className}>
            <Home aria-hidden="true" />
          </div>
        );
      case 'info':
        return (
          <div className={className}>
            <Info aria-hidden="true" />
          </div>
        );
      case 'factory':
        return (
          <div className={className}>
            <Factory aria-hidden="true" />
          </div>
        );
      case 'grid':
        return (
          <div className={className}>
            <LayoutGrid aria-hidden="true" />
          </div>
        );
      case 'mail':
        return (
          <div className={className}>
            <Mail aria-hidden="true" />
          </div>
        );
      case 'users':
        return (
          <div className={className}>
            <Users aria-hidden="true" />
          </div>
        );
      default:
        return (
          <div className={className}>
            <FileText aria-hidden="true" />
          </div>
        );
    }
  };

  // 1. View Action: Open view details modal
  const handleViewPage = (page) => {
    setCurrentViewPage(page);
    setViewModalOpen(true);
    setActiveMenuId(null);
  };

  // 2. Open Live Preview in client website with correct URL endpoint
  const handleOpenLivePreview = (page) => {
    const frontendPort = '5173';
    const origin = window.location.origin.replace(/:\d+$/, `:${frontendPort}`);
    const cleanPath = (page.frontendPath || page.slug || '').replace(/^\/+/, '');
    const url = cleanPath ? `${origin}/?page=${encodeURIComponent(cleanPath)}` : `${origin}/`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast(`Opening live preview for "${page.name}"`);
  };

  // 3. Edit Action: Open edit modal
  const handleEditPage = (page) => {
    setCurrentEditPage({ ...page });
    setEditModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSavePageEdit = (e) => {
    e.preventDefault();
    if (!currentEditPage) return;

    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setPages((prev) =>
      prev.map((p) =>
        p.id === currentEditPage.id
          ? {
              ...currentEditPage,
              lastUpdated: now,
            }
          : p
      )
    );
    setEditModalOpen(false);
    showToast(`Page "${currentEditPage.name}" updated successfully.`);
  };

  // 4. Status Toggle / Quick Actions from Options menu
  const handleToggleStatus = (pageId) => {
    const target = pages.find((p) => p.id === pageId);
    if (!target) return;
    const nextStatus = target.status === 'Published' ? 'Draft' : 'Published';
    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, status: nextStatus, lastUpdated: now } : p))
    );
    setActiveMenuId(null);
    showToast(`"${target.name}" status changed to ${nextStatus}.`);
  };

  const handleArchivePage = (pageId) => {
    const target = pages.find((p) => p.id === pageId);
    if (!target) return;
    const nextStatus = target.status === 'Archived' ? 'Published' : 'Archived';

    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, status: nextStatus } : p))
    );
    setActiveMenuId(null);
    showToast(`"${target.name}" marked as ${nextStatus}.`);
  };

  return (
    <div className="content-mgmt-container">
      {/* Static sticky sidebar with Management -> Content Management active */}
      <AdminSidebar
        currentNav="Content Management"
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="content-mgmt-main-shell">
        {/* Topbar with Title 'Management' */}
        <AdminTopbar
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onToast={showToast}
          title="Management"
        />

        <main className="content-mgmt-content">
          {/* Header Row: Title and Subtitle */}
          <div className="content-mgmt-header-row">
            <div>
              <h1 className="content-mgmt-title">Content Management</h1>
              <p className="content-mgmt-subtitle">
                Manage and publish technical documentation and public website pages.
              </p>
            </div>
          </div>

          {/* 2-Column Content Layout: Table on left, Content Status summary card on right */}
          <div className="content-mgmt-grid">
            {/* Left: Pages Table Card */}
            <div className="content-table-card">
              <table className="content-mgmt-table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '42%' }}>Page Name</th>
                    <th scope="col" style={{ width: '18%' }}>Status</th>
                    <th scope="col" style={{ width: '22%' }}>Last Updated</th>
                    <th scope="col" style={{ width: '18%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPages.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No pages found matching your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedPages.map((page) => (
                      <tr key={page.id} className="content-mgmt-row">
                        {/* Page Name */}
                        <td>
                          <div className="page-name-cell">
                            {renderPageIcon(page.iconType, page.iconNavy)}
                            <div className="page-name-info">
                              <span className="page-title-text">{page.name}</span>
                              <span className="page-slug-text">{page.slug}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`status-pill-badge status-pill-badge--${page.status.toLowerCase()}`}
                          >
                            {page.status}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td>
                          <span className="last-updated-text">{page.lastUpdated}</span>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="actions-cell-group actions-cell-relative">
                            {/* 1. View button */}
                            <button
                              aria-label={`View details for ${page.name}`}
                              className="action-icon-button"
                              onClick={() => handleViewPage(page)}
                              title="View Page Details"
                              type="button"
                            >
                              <Eye aria-hidden="true" />
                            </button>

                            {/* 2. Edit button */}
                            <button
                              aria-label={`Edit ${page.name}`}
                              className="action-icon-button"
                              onClick={() => handleEditPage(page)}
                              title="Edit Page"
                              type="button"
                            >
                              <Pencil aria-hidden="true" />
                            </button>

                            {/* 3. Options Menu button */}
                            <button
                              aria-label={`More options for ${page.name}`}
                              className="action-icon-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === page.id ? null : page.id);
                              }}
                              title="More Options"
                              type="button"
                            >
                              <MoreVertical aria-hidden="true" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuId === page.id && (
                              <div className="content-actions-dropdown" role="menu">
                                <button
                                  className="content-dropdown-item"
                                  onClick={() => handleOpenLivePreview(page)}
                                  role="menuitem"
                                  type="button"
                                >
                                  <ExternalLink aria-hidden="true" />
                                  <span>Live Preview</span>
                                </button>

                                <button
                                  className="content-dropdown-item"
                                  onClick={() => handleToggleStatus(page.id)}
                                  role="menuitem"
                                  type="button"
                                >
                                  <Power aria-hidden="true" />
                                  <span>
                                    Set as {page.status === 'Published' ? 'Draft' : 'Published'}
                                  </span>
                                </button>

                                <div className="content-dropdown-divider" />

                                <button
                                  className="content-dropdown-item content-dropdown-item--danger"
                                  onClick={() => handleArchivePage(page.id)}
                                  role="menuitem"
                                  type="button"
                                >
                                  <Trash2 aria-hidden="true" />
                                  <span>
                                    {page.status === 'Archived' ? 'Restore Page' : 'Archive Page'}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Table Footer / Real Pagination */}
              <div className="content-table-footer">
                <span className="table-entries-count">
                  {filteredPages.length === 0
                    ? 'Showing 0 entries'
                    : `Showing ${(activePage - 1) * pageSize + 1} to ${Math.min(
                        activePage * pageSize,
                        filteredPages.length
                      )} of ${filteredPages.length} entries`}
                </span>
                <div className="pagination-group">
                  <button
                    className="pagination-btn"
                    disabled={activePage <= 1}
                    onClick={() => setCurrentPageNum((p) => Math.max(p - 1, 1))}
                    type="button"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-btn${activePage === pageNum ? ' pagination-btn--active' : ''}`}
                        onClick={() => setCurrentPageNum(pageNum)}
                        type="button"
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    className="pagination-btn"
                    disabled={activePage >= totalPages}
                    onClick={() => setCurrentPageNum((p) => Math.min(p + 1, totalPages))}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Real-time Content Status Summary Card */}
            <aside className="content-status-card" aria-label="Content Status Overview">
              <h2 className="content-status-card-title">Content Status</h2>
              <ul className="status-summary-list">
                <li className="status-summary-item">
                  <div className="status-summary-label">
                    <span className="status-dot-indicator status-dot-indicator--published" />
                    <span>Published</span>
                  </div>
                  <span className="status-summary-count-badge">{statusStats.published}</span>
                </li>
                <li className="status-summary-item">
                  <div className="status-summary-label">
                    <span className="status-dot-indicator status-dot-indicator--draft" />
                    <span>Draft</span>
                  </div>
                  <span className="status-summary-count-badge">{statusStats.draft}</span>
                </li>
                <li className="status-summary-item">
                  <div className="status-summary-label">
                    <span className="status-dot-indicator status-dot-indicator--archived" />
                    <span>Archived</span>
                  </div>
                  <span className="status-summary-count-badge">{statusStats.archived}</span>
                </li>
              </ul>
            </aside>
          </div>
        </main>
      </div>

      {/* View Page Details Modal */}
      {viewModalOpen && currentViewPage && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="page-edit-modal-box">
            <div className="section-modal-header">
              <h3 className="section-modal-title">Page Overview</h3>
              <p className="section-modal-subtitle">
                Live details for {currentViewPage.name}
              </p>
              <button
                aria-label="Close modal"
                className="section-modal-close-btn"
                onClick={() => setViewModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="section-modal-body" style={{ padding: '24px 28px' }}>
              <div className="page-edit-field">
                <span className="page-edit-label">Page Title</span>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{currentViewPage.name}</strong>
              </div>
              <div className="page-edit-field">
                <span className="page-edit-label">URL Slug</span>
                <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>
                  {currentViewPage.slug}
                </code>
              </div>
              <div className="page-edit-field">
                <span className="page-edit-label">Status</span>
                <div>
                  <span className={`status-pill-badge status-pill-badge--${currentViewPage.status.toLowerCase()}`}>
                    {currentViewPage.status}
                  </span>
                </div>
              </div>
              <div className="page-edit-field">
                <span className="page-edit-label">Description</span>
                <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>
                  {currentViewPage.description || 'Public website route organizing Sprimax welding catalogue and company profiles.'}
                </p>
              </div>
            </div>
            <div className="section-modal-footer">
              <button
                className="btn-modal-secondary"
                onClick={() => setViewModalOpen(false)}
                type="button"
              >
                Close
              </button>
              <button
                className="btn-modal-primary"
                onClick={() => handleOpenLivePreview(currentViewPage)}
                type="button"
              >
                <ExternalLink style={{ width: '15px', height: '15px' }} aria-hidden="true" />
                <span>Open in Website</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Page Modal */}
      {editModalOpen && currentEditPage && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="page-edit-modal-box">
            <div className="section-modal-header">
              <h3 className="section-modal-title">Edit Page</h3>
              <p className="section-modal-subtitle">
                Update page metadata, title, and publishing status.
              </p>
              <button
                aria-label="Close modal"
                className="section-modal-close-btn"
                onClick={() => setEditModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSavePageEdit}>
              <div className="section-modal-body" style={{ padding: '24px 28px' }}>
                <div className="page-edit-field">
                  <label className="page-edit-label" htmlFor="edit-page-name">Page Title</label>
                  <input
                    id="edit-page-name"
                    className="page-edit-input"
                    type="text"
                    value={currentEditPage.name}
                    onChange={(e) => setCurrentEditPage({ ...currentEditPage, name: e.target.value })}
                    required
                  />
                </div>

                <div className="page-edit-field">
                  <label className="page-edit-label" htmlFor="edit-page-slug">Route / Slug</label>
                  <input
                    id="edit-page-slug"
                    className="page-edit-input"
                    type="text"
                    value={currentEditPage.slug}
                    onChange={(e) => setCurrentEditPage({ ...currentEditPage, slug: e.target.value })}
                    required
                  />
                </div>

                <div className="page-edit-field">
                  <label className="page-edit-label" htmlFor="edit-page-status">Publishing Status</label>
                  <select
                    id="edit-page-status"
                    className="page-edit-select"
                    value={currentEditPage.status}
                    onChange={(e) => setCurrentEditPage({ ...currentEditPage, status: e.target.value })}
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="page-edit-field">
                  <label className="page-edit-label" htmlFor="edit-page-desc">Description</label>
                  <textarea
                    id="edit-page-desc"
                    className="page-edit-input"
                    style={{ height: '70px', padding: '8px 14px', resize: 'vertical' }}
                    value={currentEditPage.description || ''}
                    onChange={(e) => setCurrentEditPage({ ...currentEditPage, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="section-modal-footer">
                <button
                  className="btn-modal-secondary"
                  onClick={() => setEditModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-modal-primary" type="submit">
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <aside aria-live="polite" className="content-toast" role="status">
          <CheckCircle2 className="toast-icon-check" aria-hidden="true" />
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
