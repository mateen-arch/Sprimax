import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Filter,
  Image as ImageIcon,
  Layers,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Shield,
  Trash2,
  X,
  FileCheck,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import {
  fetchIndustries,
  createIndustryApi,
  updateIndustryApi,
  deleteIndustryApi,
  fetchProjectRequirements,
  updateProjectRequirementApi,
  deleteProjectRequirementApi,
} from './api/industries.js';
import { uploadImageApi } from './api/upload.js';
import './IndustriesManagementPage.css';

const AVAILABLE_PRODUCTS = [
  'Industrial Welders',
  'Plasma Cutters',
  'Safety Gear',
  'Welding Electrodes',
  'MIG Wires & Consumables',
  'Protective Helmets & Shields',
  'Heavy Duty Regulators',
];

export default function IndustriesManagementPage({
  onLogout,
  onNavigate,
  onEditIndustrySolution,
  onPreviewIndustrySolution,
}) {
  const [activeTab, setActiveTab] = useState('sectors'); // 'sectors' | 'requirements'
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Requirements State
  const [requirements, setRequirements] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqStatusFilter, setReqStatusFilter] = useState('All');
  const [reqSearch, setReqSearch] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [reqModalStatus, setReqModalStatus] = useState('New');
  const [reqModalNotes, setReqModalNotes] = useState('');

  // Modal State for Industry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndustryId, setEditingIndustryId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState('0');
  const [formImage, setFormImage] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState(['Industrial Welders']);

  // Solutions page fields
  const [formSolutionHeadline, setFormSolutionHeadline] = useState('');
  const [formSolutionDescription, setFormSolutionDescription] = useState('');
  const [formComplianceBadges, setFormComplianceBadges] = useState('AWS D1.1, ASME Sec IX, ISO 3834-2');
  const [formHudGaugePercent, setFormHudGaugePercent] = useState('85');
  const [formHudGaugeLabel, setFormHudGaugeLabel] = useState('DATA//YIELD_STRENGTH_REQUIREMENTS');
  const [formHudVerifiedText, setFormHudVerifiedText] = useState('HIGH-INTEGRITY WELD VERIFIED');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchIndustries();
      setIndustries(data.map((ind) => ({ ...ind, id: ind._id || ind.id })));
    } catch (err) {
      console.error('Failed to load industries:', err);
      showToast('Error connecting to database');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRequirements = useCallback(async () => {
    try {
      setReqLoading(true);
      const data = await fetchProjectRequirements();
      setRequirements(data);
    } catch (err) {
      console.error('Failed to load project requirements:', err);
    } finally {
      setReqLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadRequirements();
  }, [loadData, loadRequirements]);

  // Filtered List
  const filteredIndustries = useMemo(() => {
    if (statusFilter === 'All') return industries;
    return industries.filter((ind) => ind.status === statusFilter);
  }, [industries, statusFilter]);

  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const matchesStatus = reqStatusFilter === 'All' || req.status === reqStatusFilter;
      const q = reqSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.referenceNumber?.toLowerCase().includes(q) ||
        req.projectName?.toLowerCase().includes(q) ||
        req.companyName?.toLowerCase().includes(q) ||
        req.contactPerson?.toLowerCase().includes(q) ||
        req.industryName?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [requirements, reqStatusFilter, reqSearch]);

  const newRequirementsCount = useMemo(() => {
    return requirements.filter((r) => r.status === 'New').length;
  }, [requirements]);

  // Selection
  const allSelected =
    filteredIndustries.length > 0 &&
    filteredIndustries.every((ind) => selectedIds.includes(ind.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIndustries.map((ind) => ind.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingIndustryId(null);
    setFormName('');
    setFormSlug('');
    setFormSubtitle('');
    setFormDescription('');
    setFormStatus(true);
    setFormSortOrder('0');
    setFormImage(null);
    setFormSolutionHeadline('');
    setFormSolutionDescription('');
    setFormComplianceBadges('AWS D1.1, ASME Sec IX, ISO 3834-2');
    setFormHudGaugePercent('85');
    setFormHudGaugeLabel('DATA//YIELD_STRENGTH_REQUIREMENTS');
    setFormHudVerifiedText('HIGH-INTEGRITY WELD VERIFIED');
    setProductSearch('');
    setSelectedProducts(['Industrial Welders', 'Plasma Cutters']);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ind) => {
    setEditingIndustryId(ind.id);
    setFormName(ind.name || '');
    setFormSlug(ind.slug || '');
    setFormSubtitle(ind.subtitle || '');
    setFormDescription(ind.description || '');
    setFormStatus(ind.status === 'Active');
    setFormSortOrder(String(ind.sortOrder || '0'));
    setFormImage(ind.image || null);
    setFormSolutionHeadline(ind.solutionHeadline || '');
    setFormSolutionDescription(ind.solutionDescription || '');
    setFormComplianceBadges(
      Array.isArray(ind.complianceBadges)
        ? ind.complianceBadges.join(', ')
        : 'AWS D1.1, ASME Sec IX'
    );
    setFormHudGaugePercent(String(ind.hudGaugePercent || 85));
    setFormHudGaugeLabel(ind.hudGaugeLabel || 'DATA//YIELD_STRENGTH_REQUIREMENTS');
    setFormHudVerifiedText(ind.hudVerifiedText || 'HIGH-INTEGRITY WELD VERIFIED');
    setProductSearch('');
    setSelectedProducts(['Industrial Welders', 'Plasma Cutters']);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleNameChange = (val) => {
    setFormName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormSlug(generatedSlug);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Uploading industry visual to Cloudinary...');
      const data = await uploadImageApi(file, { folder: 'sprimax/industries' });
      setFormImage(data.secure_url || data.url);
      showToast('Industry visual uploaded.');
    } catch (err) {
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFormImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleProductSelect = (product) => {
    setSelectedProducts((prev) =>
      prev.includes(product)
        ? prev.filter((p) => p !== product)
        : [...prev, product]
    );
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      setSubmitting(true);
      const parsedBadges = formComplianceBadges
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || formName.toLowerCase().replace(/\s+/g, '-'),
        subtitle: formSubtitle || 'Manufacturing & Industrial',
        description: formDescription,
        status: formStatus ? 'Active' : 'Inactive',
        sortOrder: parseInt(formSortOrder, 10) || 0,
        image: formImage || '',
        solutionHeadline: formSolutionHeadline.trim(),
        solutionDescription: formSolutionDescription.trim(),
        complianceBadges: parsedBadges,
        hudGaugePercent: Number(formHudGaugePercent) || 85,
        hudGaugeLabel: formHudGaugeLabel.trim() || 'DATA//YIELD_STRENGTH_REQUIREMENTS',
        hudVerifiedText: formHudVerifiedText.trim() || 'HIGH-INTEGRITY WELD VERIFIED',
      };

      if (editingIndustryId) {
        await updateIndustryApi(editingIndustryId, payload);
        showToast('Industry & Solutions updated in database');
      } else {
        await createIndustryApi(payload);
        showToast('Industry created in database');
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save industry:', err);
      showToast(err.message || 'Error saving industry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIndustry = async (id) => {
    try {
      await deleteIndustryApi(id);
      setActiveMenuId(null);
      showToast('Industry deleted');
      await loadData();
    } catch (err) {
      console.error('Failed to delete industry:', err);
      showToast(err.message || 'Error deleting industry');
    }
  };

  const handleToggleRowStatus = async (id) => {
    try {
      const target = industries.find((ind) => ind.id === id);
      if (!target) return;
      const nextStatus = target.status === 'Active' ? 'Inactive' : 'Active';
      await updateIndustryApi(id, { status: nextStatus });
      setActiveMenuId(null);
      showToast(`Status updated to ${nextStatus}`);
      await loadData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      showToast(err.message || 'Error updating status');
    }
  };

  // Requirements Modal Actions
  const handleOpenReqModal = (req) => {
    setSelectedReq(req);
    setReqModalStatus(req.status || 'New');
    setReqModalNotes(req.adminNotes || '');
  };

  const handleSaveReqModal = async () => {
    if (!selectedReq) return;
    try {
      await updateProjectRequirementApi(selectedReq._id, {
        status: reqModalStatus,
        adminNotes: reqModalNotes,
      });
      showToast('Project requirement updated');
      setSelectedReq(null);
      await loadRequirements();
    } catch (err) {
      console.error('Failed to update requirement:', err);
      showToast(err.message || 'Error updating requirement');
    }
  };

  const handleDeleteReq = async (id) => {
    try {
      await deleteProjectRequirementApi(id);
      showToast('Requirement deleted');
      if (selectedReq?._id === id) setSelectedReq(null);
      await loadRequirements();
    } catch (err) {
      console.error('Failed to delete requirement:', err);
      showToast(err.message || 'Error deleting requirement');
    }
  };

  const filteredModalProducts = AVAILABLE_PRODUCTS.filter((p) =>
    p.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="industries-mgmt-container">
      {/* Static Sticky Admin Sidebar */}
      <AdminSidebar
        currentNav="Industries Management"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      {/* Main Content Area */}
      <div className="industries-mgmt-main-shell">
        <AdminTopbar title="Management" onNavigate={onNavigate} />

        <main className="industries-mgmt-content">
          {/* Header Row */}
          <div className="industries-mgmt-header-row">
            <div>
              <h1 className="industries-mgmt-title">Industries &amp; Solutions Management</h1>
              <p className="industries-mgmt-subtitle">
                Configure key industrial sectors, tailored solutions pages, and review incoming client engineering requirements.
              </p>
            </div>
            {activeTab === 'sectors' && (
              <button
                type="button"
                className="btn-add-industry"
                onClick={() => {
                  if (onEditIndustrySolution) {
                    onEditIndustrySolution(null);
                  } else {
                    handleOpenAddModal();
                  }
                }}
              >
                <Plus aria-hidden="true" />
                <span>Add Industry &amp; Solution</span>
              </button>
            )}
          </div>

          {/* Sub Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('sectors')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.6rem 1.25rem',
                background: activeTab === 'sectors' ? '#000417' : '#ffffff',
                color: activeTab === 'sectors' ? '#ffffff' : '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '2px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <Layers size={15} />
              <span>Industrial Sectors ({industries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('requirements')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.6rem 1.25rem',
                background: activeTab === 'requirements' ? '#000417' : '#ffffff',
                color: activeTab === 'requirements' ? '#ffffff' : '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '2px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <FileCheck size={15} />
              <span>Project Requirements Submissions</span>
              {newRequirementsCount > 0 && (
                <span style={{ background: '#ff0804', color: '#fff', fontSize: '11px', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                  {newRequirementsCount} NEW
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: INDUSTRIAL SECTORS TABLE */}
          {activeTab === 'sectors' ? (
            <div className="industries-table-card">
              {/* Filter Bar */}
              <div className="industries-card-filter-bar">
                <div className="filter-status-shell">
                  <Filter className="filter-status-funnel-icon" aria-hidden="true" />
                  <select
                    className="filter-status-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by Status"
                  >
                    <option value="All">Filter by Status</option>
                    <option value="Active">Active</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="filter-status-chevron" aria-hidden="true" />
                </div>

                <div className="total-industries-count">
                  Showing {filteredIndustries.length} total industries
                </div>
              </div>

              {/* Table */}
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '0.75rem', color: '#64748b' }}>
                  <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Loading industries from database...</span>
                </div>
              ) : (
                <table className="industries-table">
                  <thead>
                    <tr>
                      <th className="th-checkbox">
                        <input
                          type="checkbox"
                          className="ind-table-checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          aria-label="Select all industries"
                        />
                      </th>
                      <th>Industry Name</th>
                      <th>Mapped Products</th>
                      <th>Sort Order</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIndustries.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                          No industries found. Click "+ Add Industry" to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredIndustries.map((ind) => {
                        const isChecked = selectedIds.includes(ind.id);
                        const isMenuOpen = activeMenuId === ind.id;

                        return (
                          <tr key={ind.id} className="industries-table-row">
                            <td className="td-checkbox">
                              <input
                                type="checkbox"
                                className="ind-table-checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectRow(ind.id)}
                                aria-label={`Select ${ind.name}`}
                              />
                            </td>

                            <td>
                              <div className="industry-identity-cell">
                                {ind.image ? (
                                  <img
                                    src={ind.image}
                                    alt={ind.name}
                                    className="industry-image-thumb"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      if (e.currentTarget.nextSibling) {
                                        e.currentTarget.nextSibling.style.display = 'grid';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="industry-thumb-fallback"
                                  style={{ display: ind.image ? 'none' : 'grid' }}
                                >
                                  <ImageIcon aria-hidden="true" />
                                </div>

                                <div
                                  className="industry-name-cluster"
                                  style={{ cursor: onEditIndustrySolution ? 'pointer' : 'default' }}
                                  onClick={() => {
                                    if (onEditIndustrySolution) {
                                      onEditIndustrySolution(ind.id || ind.slug);
                                    }
                                  }}
                                  title={onEditIndustrySolution ? 'Click to edit industry & solution' : undefined}
                                >
                                  <span className="industry-title-text" style={{ color: '#000417', fontWeight: 600 }}>{ind.name}</span>
                                  <span className="industry-subtitle-text">{ind.subtitle}</span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="mapped-products-text">
                                {ind.mappedProductsCount ?? ind.mappedProducts ?? 0}
                              </span>
                            </td>

                            <td>
                              <span className="sort-order-text">{ind.sortOrder ?? 0}</span>
                            </td>

                            <td>
                              <span
                                className={`ind-status-pill ${
                                  ind.status === 'Active'
                                    ? 'ind-status-pill--active'
                                    : ind.status === 'Pending Review'
                                    ? 'ind-status-pill--pending-review'
                                    : 'ind-status-pill--inactive'
                                }`}
                              >
                                {ind.status}
                              </span>
                            </td>

                            <td style={{ textAlign: 'center' }}>
                              <div className="ind-action-wrapper">
                                <button
                                  type="button"
                                  className="ind-action-dots-btn"
                                  aria-label={`Actions for ${ind.name}`}
                                  onClick={() =>
                                    setActiveMenuId(isMenuOpen ? null : ind.id)
                                  }
                                >
                                  <MoreVertical aria-hidden="true" />
                                </button>

                                {isMenuOpen && (
                                  <div className="ind-actions-dropdown">
                                    <button
                                      type="button"
                                      className="ind-action-item"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        if (onEditIndustrySolution) {
                                          onEditIndustrySolution(ind.id || ind.slug);
                                        } else {
                                          handleOpenEditModal(ind);
                                        }
                                      }}
                                    >
                                      <Edit2 aria-hidden="true" />
                                      <span>Edit Industry &amp; Solutions</span>
                                    </button>
                                    <button
                                      type="button"
                                      className="ind-action-item"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        if (onPreviewIndustrySolution) {
                                          onPreviewIndustrySolution(ind.id || ind.slug);
                                        }
                                      }}
                                    >
                                      <Eye aria-hidden="true" />
                                      <span>Preview Solution Page</span>
                                    </button>
                                    <button
                                      type="button"
                                      className="ind-action-item"
                                      onClick={() => handleToggleRowStatus(ind.id)}
                                    >
                                      <Check aria-hidden="true" />
                                      <span>
                                        {ind.status === 'Active'
                                          ? 'Set Inactive'
                                          : 'Set Active'}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      className="ind-action-item ind-action-item--danger"
                                      onClick={() => handleDeleteIndustry(ind.id)}
                                    >
                                      <Trash2 aria-hidden="true" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {/* Pagination Footer */}
              <div className="industries-table-footer">
                <span className="page-indicator-text">Page 1 of 1</span>
                <div className="page-nav-arrow-btns">
                  <button type="button" className="btn-arrow-page" disabled aria-label="Previous page">
                    <ChevronLeft aria-hidden="true" />
                  </button>
                  <button type="button" className="btn-arrow-page" disabled aria-label="Next page">
                    <ChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: PROJECT REQUIREMENTS SUBMISSIONS */
            <div className="industries-table-card">
              {/* Filter Bar */}
              <div className="industries-card-filter-bar">
                <div className="filter-status-shell">
                  <Filter className="filter-status-funnel-icon" aria-hidden="true" />
                  <select
                    className="filter-status-select"
                    value={reqStatusFilter}
                    onChange={(e) => setReqStatusFilter(e.target.value)}
                    aria-label="Filter Requirements by Status"
                  >
                    <option value="All">All Statuses</option>
                    <option value="New">New</option>
                    <option value="In Review">In Review</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Approved">Approved</option>
                    <option value="Archived">Archived</option>
                  </select>
                  <ChevronDown className="filter-status-chevron" aria-hidden="true" />
                </div>

                <div className="products-map-search-wrapper" style={{ margin: 0, maxWidth: '320px' }}>
                  <Search className="products-map-search-icon" aria-hidden="true" />
                  <input
                    type="text"
                    className="products-map-search-input"
                    placeholder="Search reference, project, company..."
                    value={reqSearch}
                    onChange={(e) => setReqSearch(e.target.value)}
                  />
                </div>

                <div className="total-industries-count" style={{ marginLeft: 'auto' }}>
                  Showing {filteredRequirements.length} requirements
                </div>
              </div>

              {/* Requirements Table */}
              {reqLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '0.75rem', color: '#64748b' }}>
                  <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Loading project requirements...</span>
                </div>
              ) : (
                <table className="industries-table">
                  <thead>
                    <tr>
                      <th>Ref Number</th>
                      <th>Project / Company</th>
                      <th>Target Industry</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequirements.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
                          No project requirement submissions found. Submissions from the solutions page appear here.
                        </td>
                      </tr>
                    ) : (
                      filteredRequirements.map((req) => (
                        <tr key={req._id} className="industries-table-row">
                          <td>
                            <strong className="data-tabular" style={{ color: '#ff0804', fontSize: '13px' }}>
                              {req.referenceNumber}
                            </strong>
                          </td>

                          <td>
                            <div className="industry-name-cluster">
                              <span className="industry-title-text" style={{ fontWeight: 600 }}>{req.projectName}</span>
                              <span className="industry-subtitle-text">{req.companyName} &bull; {req.contactPerson}</span>
                            </div>
                          </td>

                          <td>
                            <span style={{ fontSize: '13px', color: '#000417', fontWeight: 500 }}>
                              {req.industryName}
                            </span>
                          </td>

                          <td>
                            <span className="data-tabular" style={{ fontSize: '12px', color: '#64748b' }}>
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`ind-status-pill ${
                                req.status === 'New'
                                  ? 'ind-status-pill--active'
                                  : req.status === 'In Review'
                                  ? 'ind-status-pill--pending-review'
                                  : 'ind-status-pill--inactive'
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenReqModal(req)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 8px',
                                  background: '#000417',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '2px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                }}
                              >
                                <Eye size={12} /> View Specs
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReq(req._id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  padding: '4px',
                                }}
                                title="Delete submission"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Industry & Solutions Modal */}
      {isModalOpen && (
        <div
          className="ind-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="ind-modal-box" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="ind-modal-header">
              <h2 className="ind-modal-title">
                {editingIndustryId ? 'Edit Industry & Solutions' : 'Add Industry'}
              </h2>
              <button
                type="button"
                className="ind-modal-close-btn"
                aria-label="Close modal"
                onClick={() => setIsModalOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="ind-modal-body">
                {/* Industry Name & Slug */}
                <div className="ind-fields-split-row">
                  <div className="ind-field-block">
                    <label className="ind-field-label">
                      Industry Name <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      className="ind-text-input"
                      placeholder="e.g. Heavy Engineering"
                      value={formName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="ind-field-block">
                    <label className="ind-field-label">Slug</label>
                    <input
                      type="text"
                      className="ind-text-input ind-text-input--slug"
                      placeholder="heavy-engineering"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                    />
                  </div>
                </div>

                <div className="ind-field-block">
                  <label className="ind-field-label">Category Subtitle</label>
                  <input
                    type="text"
                    className="ind-text-input"
                    placeholder="e.g. Infrastructure & Machinery"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                  />
                </div>

                <div className="ind-field-block">
                  <label className="ind-field-label">Card Summary Description</label>
                  <textarea
                    className="ind-textarea"
                    placeholder="Brief summary of the industrial sector..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* SOLUTIONS PAGE CUSTOMIZATION SECTION */}
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                    <Shield size={16} color="#ff0804" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#000417' }}>Solutions Page Customization</span>
                  </div>

                  <div className="ind-field-block">
                    <label className="ind-field-label">Solutions Hero Headline</label>
                    <input
                      type="text"
                      className="ind-text-input"
                      placeholder="e.g. NAVAL ARCHITECTURE & OFFSHORE MARINE"
                      value={formSolutionHeadline}
                      onChange={(e) => setFormSolutionHeadline(e.target.value)}
                    />
                  </div>

                  <div className="ind-field-block">
                    <label className="ind-field-label">Solutions Detailed Description</label>
                    <textarea
                      className="ind-textarea"
                      placeholder="Demanding environments require uncompromising structural integrity..."
                      value={formSolutionDescription}
                      onChange={(e) => setFormSolutionDescription(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="ind-field-block">
                    <label className="ind-field-label">Compliance Badges (comma-separated)</label>
                    <input
                      type="text"
                      className="ind-text-input"
                      placeholder="AWS D1.1, ASME Sec IX, DNV-GL III YM, Lloyd's Reg"
                      value={formComplianceBadges}
                      onChange={(e) => setFormComplianceBadges(e.target.value)}
                    />
                  </div>

                  <div className="ind-fields-split-row">
                    <div className="ind-field-block">
                      <label className="ind-field-label">HUD Gauge Label</label>
                      <input
                        type="text"
                        className="ind-text-input"
                        placeholder="DATA//YIELD_STRENGTH_REQUIREMENTS"
                        value={formHudGaugeLabel}
                        onChange={(e) => setFormHudGaugeLabel(e.target.value)}
                      />
                    </div>
                    <div className="ind-field-block">
                      <label className="ind-field-label">HUD Gauge Fill %</label>
                      <input
                        type="number"
                        className="ind-text-input"
                        placeholder="85"
                        value={formHudGaugePercent}
                        onChange={(e) => setFormHudGaugePercent(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Toggle & Sort Order */}
                <div className="ind-fields-split-row" style={{ marginTop: '1rem' }}>
                  <div className="ind-field-block">
                    <label className="ind-field-label">Status</label>
                    <div className="ind-status-box-shell">
                      <span className="ind-status-box-label">Status</span>
                      <div className="ind-status-box-right">
                        <span className="ind-active-status-text">
                          {formStatus ? 'Active' : 'Inactive'}
                        </span>
                        <label className="ind-toggle-switch">
                          <input
                            type="checkbox"
                            checked={formStatus}
                            onChange={(e) => setFormStatus(e.target.checked)}
                          />
                          <span className="ind-toggle-slider" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="ind-field-block">
                    <label className="ind-field-label">Sort Order</label>
                    <input
                      type="number"
                      className="ind-text-input"
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Industry Image */}
                <div className="ind-field-block">
                  <label className="ind-field-label">Industry Image</label>
                  <div className="industry-image-upload-shell">
                    <div
                      className="industry-image-preview-box"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {formImage ? (
                        <img src={formImage} alt="Industry preview" />
                      ) : (
                        <div className="industry-preview-placeholder">
                          <ImageIcon aria-hidden="true" />
                          <span>Preview</span>
                        </div>
                      )}
                    </div>

                    <div className="industry-upload-controls">
                      <div className="upload-button-row">
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <button
                          type="button"
                          className="btn-upload-file"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload
                        </button>
                        {formImage && (
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={handleRemoveImage}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="image-dimension-hint">
                        Recommended size: 1200x800px. Max 5MB.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ind-modal-footer">
                <button
                  type="button"
                  className="btn-ind-cancel"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-ind-submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingIndustryId ? 'Save Changes' : 'Create Industry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View / Edit Project Requirement Modal */}
      {selectedReq && (
        <div
          className="ind-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReq(null);
          }}
        >
          <div className="ind-modal-box" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="ind-modal-header">
              <div>
                <span className="data-tabular" style={{ fontSize: '11px', color: '#ff0804', fontWeight: 700 }}>
                  REFERENCE: {selectedReq.referenceNumber}
                </span>
                <h2 className="ind-modal-title">{selectedReq.projectName}</h2>
              </div>
              <button
                type="button"
                className="ind-modal-close-btn"
                aria-label="Close modal"
                onClick={() => setSelectedReq(null)}
              >
                <X aria-hidden="true" />
              </button>
            </div>

            <div className="ind-modal-body" style={{ fontSize: '13px', lineHeight: '1.6' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                <div><span style={{ color: '#64748b' }}>Company:</span> <strong>{selectedReq.companyName}</strong></div>
                <div><span style={{ color: '#64748b' }}>Contact:</span> <strong>{selectedReq.contactPerson}</strong></div>
                <div><span style={{ color: '#64748b' }}>Email:</span> <strong>{selectedReq.email}</strong></div>
                <div><span style={{ color: '#64748b' }}>Phone:</span> <strong>{selectedReq.phone || 'N/A'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Location:</span> <strong>{selectedReq.location || 'N/A'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Industry:</span> <strong>{selectedReq.industryName}</strong></div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#000417', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>
                  Technical Parameters
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div><strong>Base Materials:</strong> {selectedReq.baseMaterials || 'Standard structural steel'}</div>
                  <div><strong>Welding Process:</strong> {selectedReq.weldingProcess || 'Submerged Arc / FCAW'}</div>
                  <div><strong>Target Codes:</strong> {selectedReq.standards || 'AWS / ASME'}</div>
                  <div><strong>Est. Volume:</strong> {selectedReq.estimatedVolume || 'Unspecified'}</div>
                  <div><strong>Delivery Date:</strong> {selectedReq.targetDeliveryDate || 'Immediate'}</div>
                </div>
              </div>

              {selectedReq.projectScopeDetails && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#000417', marginBottom: '0.35rem' }}>
                    Scope &amp; Operating Constraints
                  </h3>
                  <div style={{ background: '#f1f5f9', padding: '0.75rem', borderRadius: '2px', whiteSpace: 'pre-wrap' }}>
                    {selectedReq.projectScopeDetails}
                  </div>
                </div>
              )}

              {/* Status & Admin Notes */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="ind-field-label">Update Processing Status</label>
                  <select
                    className="filter-status-select"
                    value={reqModalStatus}
                    onChange={(e) => setReqModalStatus(e.target.value)}
                    style={{ width: '100%', height: '38px', borderRadius: '2px' }}
                  >
                    <option value="New">New</option>
                    <option value="In Review">In Review</option>
                    <option value="Quoted">Quoted</option>
                    <option value="Approved">Approved</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="ind-field-label">Internal Engineering &amp; Procurement Notes</label>
                  <textarea
                    className="ind-textarea"
                    placeholder="Add metallurgical review notes, quotation reference, batch certificates..."
                    value={reqModalNotes}
                    onChange={(e) => setReqModalNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="ind-modal-footer">
              <button
                type="button"
                className="btn-ind-cancel"
                onClick={() => setSelectedReq(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-ind-submit"
                onClick={handleSaveReqModal}
              >
                Save Status &amp; Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="industries-toast">
          <CheckCircle2 className="industries-toast-icon" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
