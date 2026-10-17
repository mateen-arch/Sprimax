import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import {
  fetchDownloads,
  createDownloadApi,
  updateDownloadApi,
  deleteDownloadApi,
} from './api/downloads.js';
import { fetchProducts } from './api/products.js';
import './DownloadsManagementPage.css';

const DEFAULT_PDF_DATA_URI =
  'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNTk1IDg0Ml0vQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDQ0Pj5zdHJlYW0KQVQvRjEgMTIgVGYKODAgNzgwIFRkCihTUFJJTUFYIFRlY2huaWNhbCBEb2N1bWVudCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTE3IDAwMDAwIG4gCjAwMDAwMDAyMDEgMDAwMDAgbiAKdHJhaWxlcjw8L1NpemUgNTwvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoyOTUKJSVFT0YK';

export default function DownloadsManagementPage({ onLogout, onNavigate }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Available products for character-by-character autocomplete
  const [productsList, setProductsList] = useState([]);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const autocompleteContainerRef = useRef(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Add / Edit Resource Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingResource, setEditingResource] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newRefId, setNewRefId] = useState('');
  const [newType, setNewType] = useState('TDS');
  const [newLanguage, setNewLanguage] = useState('English');
  const [newRelatedProduct, setNewRelatedProduct] = useState('');
  const [newVersion, setNewVersion] = useState('v1.0');
  const [newActiveStatus, setNewActiveStatus] = useState(true);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileDataUrl, setUploadedFileDataUrl] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  // Fetch products from database for live character-by-character autocomplete
  useEffect(() => {
    fetchProducts({ limit: 100 })
      .then((data) => {
        if (data && data.products) {
          setProductsList(data.products);
        }
      })
      .catch((err) => console.warn('Could not load products for autocomplete:', err));
  }, []);

  // Close product autocomplete dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (autocompleteContainerRef.current && !autocompleteContainerRef.current.contains(e.target)) {
        setProductDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Load resources from MongoDB Atlas
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDownloads({ status: 'All' });
      setResources(
        data.map((r) => ({
          ...r,
          id: r._id || r.id,
          refId: r.code || r.refId || 'DOC-2024',
          fileExt: (r.fileType || (r.fileName ? r.fileName.split('.').pop() : 'pdf')).toLowerCase(),
          updatedDate: r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Recent',
        }))
      );
    } catch (err) {
      console.error('Failed to load resources:', err);
      showToast('Error loading resources from database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Type Filter
      if (typeFilter !== 'All') {
        const itemType = (res.type || '').toLowerCase();
        const itemCat = (res.category || '').toLowerCase();
        const target = typeFilter.toLowerCase();
        const matchesType =
          itemType === target ||
          itemCat.includes(target) ||
          (target === 'catalogue' && (itemType === 'catalog' || itemCat.includes('catalog'))) ||
          (target === 'corporate profile' && (itemType === 'profile' || itemCat.includes('profile')));
        if (!matchesType) return false;
      }

      // Status Filter
      if (statusFilter !== 'All') {
        const statusNormalized = res.status === 'Active' || res.status === 'Published' ? 'Active' : 'Inactive';
        if (statusNormalized !== statusFilter) return false;
      }

      // Search Filter
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matches =
          res.title?.toLowerCase().includes(query) ||
          res.refId?.toLowerCase().includes(query) ||
          res.fileName?.toLowerCase().includes(query) ||
          res.category?.toLowerCase().includes(query) ||
          res.relatedProduct?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      return true;
    });
  }, [resources, typeFilter, statusFilter, searchFilter]);

  const totalEntries = filteredResources.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResources.slice(start, start + pageSize);
  }, [filteredResources, currentPage, pageSize]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingId(null);
    setEditingResource(null);
    setNewTitle('');
    setNewRefId(`DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setNewType('TDS');
    setNewLanguage('English');
    setNewRelatedProduct('');
    setNewVersion('v1.0');
    setNewActiveStatus(true);
    setUploadedFile(null);
    setUploadedFileDataUrl(null);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (res) => {
    setEditingId(res.id);
    setEditingResource(res);
    setNewTitle(res.title || '');
    setNewRefId(res.refId || res.code || '');
    setNewType(res.category || (res.type === 'catalog' ? 'Catalogue' : res.type === 'sds' ? 'SDS' : 'TDS'));
    setNewLanguage('English');
    setNewRelatedProduct(res.relatedProduct || '');
    setNewVersion('v1.0');
    setNewActiveStatus(res.status === 'Active' || res.status === 'Published');
    setUploadedFile(null);
    setUploadedFileDataUrl(res.fileUrl || null);
    setModalOpen(true);
  };

  // Handle Delete
  const handleDeleteResource = async (id, title) => {
    try {
      await deleteDownloadApi(id);
      showToast(`Removed "${title}".`);
      await loadData();
    } catch (err) {
      console.error('Failed to delete resource:', err);
      showToast(err.message || 'Error deleting resource');
    }
  };

  // Auto-detect and select file type based on file properties
  const autoDetectFileType = (file) => {
    if (!file) return 'TDS';
    const name = file.name.toLowerCase();
    const ext = name.split('.').pop();

    if (name.includes('sds') || name.includes('msds') || name.includes('safety')) {
      return 'SDS';
    }
    if (name.includes('catalog') || name.includes('brochure')) {
      return 'Catalogue';
    }
    if (name.includes('profile') || name.includes('corporate') || name.includes('company')) {
      return 'Corporate Profile';
    }
    if (name.includes('manual') || name.includes('guide') || name.includes('instruction')) {
      return 'Manual';
    }
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return 'Catalogue';
    }
    return 'TDS';
  };

  // Handle File Selection with auto-detection of file type
  const handleFileChange = (file) => {
    if (!file) return;
    setUploadedFile(file);

    // Auto-detect and select Resource Type
    const detectedType = autoDetectFileType(file);
    setNewType(detectedType);

    // If title is empty, pre-fill from filename without extension
    if (!newTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewTitle(cleanName);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedFileDataUrl(reader.result);
    };
    reader.readAsDataURL(file);

    showToast(`Detected file type: ${detectedType}`);
  };

  // Handle Submit Form (Add or Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter a Resource Title.');
      return;
    }

    try {
      setSubmitting(true);
      const typeValue = newType || 'TDS';
      const catLower = typeValue.toLowerCase();
      let normalizedType = 'tds';
      if (catLower.includes('catalog')) normalizedType = 'catalog';
      else if (catLower.includes('sds')) normalizedType = 'sds';
      else if (catLower.includes('profile') || catLower.includes('cert')) normalizedType = 'profile';

      const filename = uploadedFile?.name || (editingResource ? editingResource.fileName : `${newTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      const ext = filename.split('.').pop().toLowerCase();
      const size = uploadedFile
        ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : editingResource
        ? editingResource.fileSize
        : '2.1 MB';

      const payload = {
        title: newTitle.trim(),
        code: newRefId.trim() || `DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        category: typeValue,
        type: normalizedType,
        fileName: filename,
        fileSize: size,
        fileType: ext.toUpperCase(),
        fileUrl: uploadedFileDataUrl || (editingResource ? editingResource.fileUrl : DEFAULT_PDF_DATA_URI),
        relatedProduct: newRelatedProduct.trim() || '--',
        status: newActiveStatus ? 'Published' : 'Internal',
      };

      if (editingId) {
        await updateDownloadApi(editingId, payload);
        showToast(`Resource "${newTitle.trim()}" updated successfully.`);
      } else {
        await createDownloadApi(payload);
        showToast(`Resource "${newTitle.trim()}" created successfully.`);
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save resource:', err);
      showToast(err.message || 'Error saving resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="downloads-mgmt-container">
      {/* Static sticky sidebar with Download Management active */}
      <AdminSidebar
        currentNav="Download Management"
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="downloads-mgmt-main-shell">
        {/* Topbar */}
        <AdminTopbar
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onToast={showToast}
          title="Management"
        />

        <main className="downloads-mgmt-content">
          {/* Header Row */}
          <div className="downloads-mgmt-header-row">
            <div>
              <h1 className="downloads-mgmt-title">Downloads Management</h1>
              <p className="downloads-mgmt-subtitle">
                Manage and organize technical resources, specifications, and catalogues in real-time.
              </p>
            </div>
            <button
              className="btn-add-resource"
              onClick={handleOpenAddModal}
              type="button"
            >
              <Plus aria-hidden="true" />
              <span>Add Resource</span>
            </button>
          </div>

          {/* Filter Controls Bar */}
          <div className="downloads-filter-bar">
            <div className="downloads-filter-left">
              {/* Type Filter */}
              <div className="dropdown-select-wrapper">
                <select
                  aria-label="Filter by Type"
                  className="downloads-dropdown-select"
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  value={typeFilter}
                >
                  <option value="All">All Types</option>
                  <option value="Catalogue">Catalogue</option>
                  <option value="SDS">SDS</option>
                  <option value="TDS">TDS</option>
                  <option value="Corporate Profile">Corporate Profile</option>
                  <option value="Manual">Manual</option>
                </select>
                <ChevronDown className="dropdown-chevron-icon" aria-hidden="true" />
              </div>

              {/* Status Filter */}
              <div className="dropdown-select-wrapper">
                <select
                  aria-label="Filter by Status"
                  className="downloads-dropdown-select"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  value={statusFilter}
                >
                  <option value="All">Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="dropdown-chevron-icon" aria-hidden="true" />
              </div>
            </div>

            {/* Filter Search Input on right */}
            <div className="downloads-filter-search-wrapper">
              <Filter className="filter-funnel-icon" aria-hidden="true" />
              <input
                aria-label="Filter resources"
                className="downloads-filter-input"
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search resources by title, SKU, or filename..."
                type="text"
                value={searchFilter}
              />
            </div>
          </div>

          {/* Table Card */}
          <div className="downloads-table-card">
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '0.75rem', color: '#64748b' }}>
                <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Loading resources from database...</span>
              </div>
            ) : (
              <table className="downloads-table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '28%' }}>Document Title</th>
                    <th scope="col" style={{ width: '13%' }}>Type</th>
                    <th scope="col" style={{ width: '23%' }}>File</th>
                    <th scope="col" style={{ width: '13%' }}>Related Product</th>
                    <th scope="col" style={{ width: '10%' }}>Status</th>
                    <th scope="col" style={{ width: '12%' }}>Updated</th>
                    <th scope="col" style={{ width: '8%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResources.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No technical resources found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedResources.map((res) => (
                      <tr key={res.id} className="downloads-table-row">
                        {/* Document Title & ID */}
                        <td>
                          <div className="doc-title-cell">
                            <span className="doc-name-text">{res.title}</span>
                            <span className="doc-id-text">ID: {res.refId}</span>
                          </div>
                        </td>

                        {/* Type Badge */}
                        <td>
                          <span
                            className={`type-badge type-badge--${(res.category || res.type || 'tds').toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {res.category || res.type?.toUpperCase()}
                          </span>
                        </td>

                        {/* File attachment */}
                        <td>
                          <div className="file-attachment-cell">
                            {res.fileExt === 'pdf' ? (
                              <FileText className="file-type-icon file-type-icon--pdf" aria-hidden="true" />
                            ) : (
                              <FileSpreadsheet className="file-type-icon file-type-icon--doc" aria-hidden="true" />
                            )}
                            <span className="file-info-text">
                              {res.fileName}{' '}
                              <span className="file-size-text">({res.fileSize})</span>
                            </span>
                          </div>
                        </td>

                        {/* Related Product */}
                        <td>
                          <div className="related-product-cell">{res.relatedProduct}</div>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`status-indicator-pill status-indicator-pill--${res.status === 'Published' || res.status === 'Active' ? 'active' : 'inactive'}`}
                          >
                            <span className="status-dot-circle" aria-hidden="true" />
                            <span>{res.status === 'Published' ? 'Active' : res.status}</span>
                          </span>
                        </td>

                        {/* Updated */}
                        <td>
                          <span className="updated-date-cell">{res.updatedDate}</span>
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'center' }}>
                          <div className="row-actions-cluster">
                            <button
                              aria-label={`Edit ${res.title}`}
                              className="action-tool-btn"
                              onClick={() => handleOpenEditModal(res)}
                              title="Edit"
                              type="button"
                            >
                              <Pencil aria-hidden="true" />
                            </button>
                            <button
                              aria-label={`Delete ${res.title}`}
                              className="action-tool-btn action-tool-btn--delete"
                              onClick={() => handleDeleteResource(res.id, res.title)}
                              title="Delete"
                              type="button"
                            >
                              <Trash2 aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Table Footer / Pagination */}
            <div className="downloads-table-footer">
              <span className="footer-entry-count">
                Showing {filteredResources.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
              </span>
              <div className="footer-pagination-buttons">
                <button
                  className="btn-nav-pagination"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  type="button"
                >
                  Previous
                </button>
                <button
                  className="btn-nav-pagination"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add / Edit Resource Modal */}
      {modalOpen && (
        <div
          className="resource-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-resource-title"
        >
          <div className="resource-modal-box">
            {/* Modal Header */}
            <div className="resource-modal-header">
              <div className="header-modal-icon-badge">
                <FileText aria-hidden="true" />
              </div>
              <div className="header-modal-texts">
                <h3 className="resource-modal-title" id="modal-add-resource-title">
                  {editingId ? 'Edit Resource' : 'Add New Resource'}
                </h3>
                <p className="resource-modal-subtitle">
                  {editingId
                    ? 'Modify the technical specifications and file attachments in the database.'
                    : 'Upload a new document to the industrial repository in MongoDB Atlas.'}
                </p>
              </div>
              <button
                aria-label="Close modal"
                className="resource-modal-close-btn"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitForm}>
              <div className="resource-modal-body">
                {/* Resource Title */}
                <div className="modal-field-group">
                  <label className="modal-field-label" htmlFor="res-title-input">
                    Resource Title <span className="required-star">*</span>
                  </label>
                  <input
                    id="res-title-input"
                    className="modal-text-input"
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., TIG Welding Master Catalogue 2024"
                    required
                    type="text"
                    value={newTitle}
                    autoFocus
                  />
                </div>

                {/* Reference ID / Code */}
                <div className="modal-field-group">
                  <label className="modal-field-label" htmlFor="res-ref-input">
                    Reference Code / SKU
                  </label>
                  <input
                    id="res-ref-input"
                    className="modal-text-input"
                    onChange={(e) => setNewRefId(e.target.value)}
                    placeholder="e.g., TDS-71T1-24"
                    type="text"
                    value={newRefId}
                  />
                </div>

                {/* Split Row: Resource Type & Language */}
                <div className="modal-fields-split-row">
                  <div className="modal-field-group">
                    <label className="modal-field-label" htmlFor="res-type-select">
                      Resource Type <span className="required-star">*</span>
                    </label>
                    <div className="modal-select-wrapper">
                      <select
                        id="res-type-select"
                        className="modal-select-input"
                        onChange={(e) => setNewType(e.target.value)}
                        value={newType}
                      >
                        <option value="TDS">TDS (Technical Data Sheet)</option>
                        <option value="Catalogue">Catalogue</option>
                        <option value="SDS">SDS (Safety Data Sheet)</option>
                        <option value="Corporate Profile">Corporate Profile</option>
                        <option value="Manual">Manual</option>
                      </select>
                      <ChevronDown className="modal-select-chevron" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="modal-field-group">
                    <label className="modal-field-label" htmlFor="res-lang-select">
                      Language
                    </label>
                    <div className="modal-select-wrapper">
                      <select
                        id="res-lang-select"
                        className="modal-select-input"
                        onChange={(e) => setNewLanguage(e.target.value)}
                        value={newLanguage}
                      >
                        <option value="English">English</option>
                        <option value="German">German</option>
                        <option value="French">French</option>
                        <option value="Spanish">Spanish</option>
                        <option value="Arabic">Arabic</option>
                      </select>
                      <ChevronDown className="modal-select-chevron" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Related Product with Character-by-Character Autocomplete Dropdown */}
                <div className="modal-field-group">
                  <label className="modal-field-label" htmlFor="res-product-input">
                    Related Product or Sector
                  </label>
                  <div className="autocomplete-container" ref={autocompleteContainerRef}>
                    <div className="modal-input-with-icon">
                      <Search className="modal-input-icon" aria-hidden="true" />
                      <input
                        id="res-product-input"
                        autoComplete="off"
                        className="modal-text-input"
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewRelatedProduct(val);
                          setProductDropdownOpen(true);
                        }}
                        onFocus={() => setProductDropdownOpen(true)}
                        placeholder="Search product SKUs, series, or sectors..."
                        type="text"
                        value={newRelatedProduct}
                      />
                      {newRelatedProduct && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewRelatedProduct('');
                            setProductDropdownOpen(false);
                          }}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Clear"
                        >
                          <X style={{ width: '15px', height: '15px' }} />
                        </button>
                      )}
                    </div>

                    {/* Dropdown Menu matching character by character */}
                    {productDropdownOpen && (
                      <ul className="autocomplete-dropdown" role="listbox">
                        {(() => {
                          const query = newRelatedProduct.trim().toLowerCase();
                          const matches = productsList.filter((prod) => {
                            if (!query) return true;
                            return (
                              prod.name?.toLowerCase().includes(query) ||
                              prod.sku?.toLowerCase().includes(query) ||
                              prod.category?.toLowerCase().includes(query) ||
                              prod.series?.toLowerCase().includes(query)
                            );
                          });

                          if (matches.length === 0) {
                            return (
                              <li className="autocomplete-item-empty">
                                No matching products found.
                              </li>
                            );
                          }

                          return matches.slice(0, 10).map((prod) => (
                            <li
                              key={prod._id || prod.id || prod.sku}
                              className="autocomplete-item"
                              onClick={() => {
                                setNewRelatedProduct(`${prod.name} (${prod.sku || prod.category || 'Product'})`);
                                setProductDropdownOpen(false);
                              }}
                              role="option"
                            >
                              <div className="autocomplete-item-main">
                                <span className="autocomplete-item-title">{prod.name}</span>
                                <span className="autocomplete-item-sub">
                                  {prod.sku && <span>SKU: {prod.sku}</span>}
                                  {prod.series && <span>• Series: {prod.series}</span>}
                                </span>
                              </div>
                              {prod.category && (
                                <span className="autocomplete-item-category">
                                  {prod.category}
                                </span>
                              )}
                            </li>
                          ));
                        })()}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Version & Active Toggle Split Row */}
                <div className="version-status-row">
                  <div className="modal-field-group">
                    <label className="modal-field-label" htmlFor="res-version-input">
                      Version/Revision Number
                    </label>
                    <input
                      id="res-version-input"
                      className="modal-text-input"
                      onChange={(e) => setNewVersion(e.target.value)}
                      placeholder="e.g., v1.2"
                      type="text"
                      value={newVersion}
                    />
                  </div>

                  <div className="modal-field-group">
                    <label className="modal-field-label">Status</label>
                    <div className="active-status-toggle-shell">
                      <label className="toggle-switch-container">
                        <input
                          checked={newActiveStatus}
                          onChange={(e) => setNewActiveStatus(e.target.checked)}
                          type="checkbox"
                        />
                        <span className="toggle-slider" />
                      </label>
                      <span className="toggle-label-text">
                        {newActiveStatus ? 'Published (Active)' : 'Internal (Inactive)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* File Upload Dropzone */}
                <div className="modal-field-group">
                  <label className="modal-field-label">
                    File Upload {!editingId && <span className="required-star">*</span>}
                  </label>
                  <div
                    className="file-dropzone-box"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) {
                        handleFileChange(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    <UploadCloud className="dropzone-upload-icon" aria-hidden="true" />
                    <p className="dropzone-main-text">
                      <span className="dropzone-click-link">Click to upload</span> or drag and drop
                    </p>
                    <p className="dropzone-sub-text">PDF, DOCX up to 25MB</p>

                    {uploadedFile ? (
                      <div className="dropzone-selected-file-info">
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span>Selected: <strong>{uploadedFile.name}</strong> ({(uploadedFile.size / 1024).toFixed(0)} KB)</span>
                      </div>
                    ) : editingResource ? (
                      <div className="dropzone-selected-file-info">
                        <CheckCircle2 size={16} />
                        <span>Current File: <strong>{editingResource.fileName}</strong> ({editingResource.fileSize})</span>
                      </div>
                    ) : null}

                    <input
                      ref={fileInputRef}
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                      type="file"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="resource-modal-footer">
                <button
                  className="btn-resource-cancel"
                  onClick={() => setModalOpen(false)}
                  type="button"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button className="btn-resource-submit" type="submit" disabled={submitting}>
                  {submitting ? (
                    <span>Saving...</span>
                  ) : (
                    <span>{editingId ? 'Save Changes' : 'Add Resource'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <aside aria-live="polite" className="downloads-toast" role="status">
          <CheckCircle2 className="downloads-toast-icon" aria-hidden="true" />
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
