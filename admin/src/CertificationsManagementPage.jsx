import { useState, useMemo, useRef, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  FileUp,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  Power,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import { fetchProducts } from './api/products.js';
import {
  fetchCertifications,
  createCertificationApi,
  updateCertificationApi,
  deleteCertificationApi
} from './api/certifications.js';
import { uploadImageApi } from './api/upload.js';
import './CertificationsManagementPage.css';

const STORAGE_KEY = 'sprimax_certifications_data';

// Real-world welding certifications and standards used by Sprimax
const DEFAULT_CERTIFICATES = [
  {
    id: 'cert-1',
    name: 'ISO 9001:2015 Quality Management System',
    subScope: 'Global Welding Manufacturing Baseline',
    issuer: 'International Organization for Standardization (ISO)',
    validityRange: 'Jan 15, 2024 - Jan 14, 2027',
    expiryCountdown: null,
    status: 'Valid',
    associatedProducts: ['WeldCore 71T-1 Flux Cored Wire', 'LOW HYDROGEN ELECTRODE E7018-1'],
    documentName: 'ISO_9001_2015_Certificate.pdf',
  },
  {
    id: 'cert-2',
    name: 'AWS D1.1 Structural Welding Code (Steel)',
    subScope: 'Fabrication & Erection of Welded Steel Structures',
    issuer: 'American Welding Society (AWS)',
    validityRange: 'Oct 10, 2023 - Oct 09, 2026',
    expiryCountdown: null,
    status: 'Valid',
    associatedProducts: ['LOW HYDROGEN ELECTRODE E7018-1', 'Stainless Steel TIG Rod ER308L'],
    documentName: 'AWS_D1_1_Structural_Steel_Compliance.pdf',
  },
  {
    id: 'cert-3',
    name: 'ASME Boiler & Pressure Vessel Code (Section IX)',
    subScope: 'Welding & Brazing Qualifications',
    issuer: 'American Society of Mechanical Engineers (ASME)',
    validityRange: 'Jul 22, 2023 - Jul 21, 2026',
    expiryCountdown: null,
    status: 'Valid',
    associatedProducts: ['Argon Gas Regulators (Industrial)', 'WeldCore 71T-1 Flux Cored Wire'],
    documentName: 'ASME_BPVC_Section_IX_Approval.pdf',
  },
  {
    id: 'cert-4',
    name: 'EN 1090-2 Execution of Steel Structures (CE Marking)',
    subScope: 'Conformity European (CE) Class EXC3 / EXC4',
    issuer: 'TÜV Rheinland Group',
    validityRange: 'Feb 10, 2024 - Nov 30, 2026',
    expiryCountdown: null,
    status: 'Valid',
    associatedProducts: ['LOW HYDROGEN ELECTRODE E7018-1'],
    documentName: 'EN_1090_2_CE_Declaration.pdf',
  },
  {
    id: 'cert-5',
    name: 'ISO 3834-2 Comprehensive Quality Requirements',
    subScope: 'Fusion Welding of Metallic Materials',
    issuer: 'Lloyds Register Quality Assurance',
    validityRange: 'Sep 05, 2023 - Sep 04, 2026',
    expiryCountdown: null,
    status: 'Valid',
    associatedProducts: ['Industrial Plasma Cutters Series X', 'TIG Torches Pro Series 200A'],
    documentName: 'ISO_3834_2_Comprehensive_Audit.pdf',
  },
  {
    id: 'cert-6',
    name: 'ASTM E1417 Liquid Penetrant Inspection Standard',
    subScope: 'Non-Destructive Examination Protocol',
    issuer: 'ASTM International',
    validityRange: 'Nov 01, 2023 - Nov 20, 2024',
    expiryCountdown: 'Expires in 18 days',
    status: 'Expiring Soon',
    associatedProducts: ['WeldCore 71T-1 Flux Cored Wire'],
    documentName: 'ASTM_E1417_NDE_Methodology.pdf',
  },
  {
    id: 'cert-7',
    name: 'CWB CSA W47.1 Certification of Companies for Fusion Welding',
    subScope: 'Canadian Welding Bureau Division 2 Standard',
    issuer: 'Canadian Welding Bureau (CWB)',
    validityRange: 'Aug 10, 2021 - Aug 09, 2024',
    expiryCountdown: 'Expired recently',
    status: 'Expired',
    associatedProducts: ['LOW HYDROGEN ELECTRODE E7018-1'],
    documentName: 'CWB_W47_1_Division_2_Archive.pdf',
  },
];

export default function CertificationsManagementPage({ onLogout, onNavigate }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const pageSize = 5;

  // Real-time certificates state stored locally & synced with DB
  const [certificates, setCertificates] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved certificates:', e);
    }
    return DEFAULT_CERTIFICATES;
  });

  const loadCertificationsFromDb = async () => {
    try {
      const data = await fetchCertifications();
      if (data && data.certifications && data.certifications.length > 0) {
        const formatted = data.certifications.map((c) => ({
          ...c,
          id: c._id || c.id,
        }));
        setCertificates(formatted);
      }
    } catch (err) {
      console.warn('Could not load certifications from DB, using cache:', err);
    }
  };

  useEffect(() => {
    loadCertificationsFromDb();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
    } catch (e) {
      console.warn('Could not persist certificates:', e);
    }
  }, [certificates]);

  // Real-time products from MongoDB Atlas for character-by-character autocomplete
  const [productsList, setProductsList] = useState([]);
  const [productQuery, setProductQuery] = useState('');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [selectedProductNames, setSelectedProductNames] = useState([]);
  const autocompleteRef = useRef(null);

  // Filter / Sort States
  const [activeFilterStatus, setActiveFilterStatus] = useState('All');
  const [sortAscending, setSortAscending] = useState(true);

  // Modals & Menus
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Form states
  const [certName, setCertName] = useState('');
  const [certScope, setCertScope] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certValidity, setCertValidity] = useState('');
  const [certStatus, setCertStatus] = useState('Valid');
  const [uploadedDoc, setUploadedDoc] = useState(null);

  const [currentEditCert, setCurrentEditCert] = useState(null);
  const [currentViewCert, setCurrentViewCert] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const docInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3200);
  };

  // Load live products from database
  useEffect(() => {
    fetchProducts({ limit: 100 })
      .then((data) => {
        if (data && data.products) {
          setProductsList(data.products);
        }
      })
      .catch((err) => console.warn('Could not load products for certs autocomplete:', err));
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setProductDropdownOpen(false);
      }
      if (!e.target.closest('.cert-actions-cell')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Real-Time Stats Computation
  const realTimeStats = useMemo(() => {
    const active = certificates.filter((c) => c.status === 'Valid').length;
    const expiringSoon = certificates.filter((c) => c.status === 'Expiring Soon').length;
    const expired = certificates.filter((c) => c.status === 'Expired').length;
    return { active, expiringSoon, expired, total: certificates.length };
  }, [certificates]);

  // Filter & Search & Sort
  const filteredCerts = useMemo(() => {
    let list = [...certificates];

    // Status filter
    if (activeFilterStatus !== 'All') {
      list = list.filter((c) => c.status === activeFilterStatus);
    }

    // Global / Topbar search
    const q = globalSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.issuer.toLowerCase().includes(q) ||
          (c.subScope && c.subScope.toLowerCase().includes(q))
      );
    }

    // Sort by Name
    list.sort((a, b) => {
      return sortAscending
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    });

    return list;
  }, [certificates, activeFilterStatus, globalSearch, sortAscending]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCerts.length / pageSize));
  const activePage = Math.min(currentPageNum, totalPages);

  const paginatedCerts = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return filteredCerts.slice(start, start + pageSize);
  }, [filteredCerts, activePage, pageSize]);

  // Open Add Certificate Modal
  const handleOpenAddModal = () => {
    setCertName('');
    setCertScope('Technical Standard Compliance');
    setCertIssuer('');
    setCertValidity(
      `Jan 01, ${new Date().getFullYear()} - Dec 31, ${new Date().getFullYear() + 3}`
    );
    setCertStatus('Valid');
    setUploadedDoc(null);
    setSelectedProductNames([]);
    setProductQuery('');
    setProductDropdownOpen(false);
    setModalOpen(true);
  };

  // Submit Add Certificate
  const handleAddCertSubmit = async (e) => {
    e.preventDefault();
    if (!certName.trim()) {
      showToast('Please enter a Certificate Name.');
      return;
    }

    let imageUrl = '';
    if (uploadedDoc) {
      try {
        const data = await uploadImageApi(uploadedDoc, { folder: 'sprimax/certifications' });
        imageUrl = data.secure_url || data.url;
      } catch (err) {
        console.warn('Doc upload warning:', err.message);
      }
    }

    const payload = {
      name: certName.trim(),
      subScope: certScope.trim() || 'Technical Standard Compliance',
      issuer: certIssuer.trim() || 'Accredited Verification Authority',
      validityRange: certValidity.trim(),
      expiryCountdown: certStatus === 'Expiring Soon' ? 'Expires in 30 days' : certStatus === 'Expired' ? 'Expired' : null,
      status: certStatus,
      associatedProducts: selectedProductNames,
      documentName: uploadedDoc?.name || `${certName.trim().replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image: imageUrl,
      certificateImage: imageUrl,
    };

    try {
      const res = await createCertificationApi(payload);
      const created = res.certification || res;
      setCertificates((prev) => [{ ...created, id: created._id || created.id }, ...prev]);
      setModalOpen(false);
      showToast(`Certificate "${payload.name}" registered successfully.`);
    } catch (err) {
      console.warn('Saved cert locally (DB fallback):', err);
      const localItem = { ...payload, id: `cert-${Date.now()}` };
      setCertificates((prev) => [localItem, ...prev]);
      setModalOpen(false);
      showToast(`Certificate "${payload.name}" registered.`);
    }
  };

  // Actions: View Details Modal
  const handleViewCert = (cert) => {
    setCurrentViewCert(cert);
    setViewModalOpen(true);
    setActiveMenuId(null);
  };

  // Actions: Open Edit Modal
  const handleOpenEditModal = (cert) => {
    setCurrentEditCert({ ...cert });
    setEditModalOpen(true);
    setActiveMenuId(null);
  };

  // Actions: Submit Edit
  const handleSaveEditCert = async (e) => {
    e.preventDefault();
    if (!currentEditCert) return;

    const payload = {
      ...currentEditCert,
      expiryCountdown:
        currentEditCert.status === 'Expiring Soon'
          ? 'Expires in 30 days'
          : currentEditCert.status === 'Expired'
          ? 'Expired'
          : null,
    };

    try {
      const targetId = currentEditCert._id || currentEditCert.id;
      if (targetId && !targetId.startsWith('cert-')) {
        await updateCertificationApi(targetId, payload);
      }
    } catch (err) {
      console.warn('Could not update cert in DB:', err);
    }

    setCertificates((prev) =>
      prev.map((c) =>
        (c.id === currentEditCert.id || c._id === currentEditCert._id)
          ? { ...payload }
          : c
      )
    );
    setEditModalOpen(false);
    showToast(`Certificate "${currentEditCert.name}" updated successfully.`);
  };

  // Actions: Toggle / Set Status
  const handleSetStatus = async (certId, nextStatus) => {
    const payload = {
      status: nextStatus,
      expiryCountdown:
        nextStatus === 'Expiring Soon'
          ? 'Expires in 30 days'
          : nextStatus === 'Expired'
          ? 'Expired'
          : null,
    };

    try {
      if (certId && !certId.startsWith('cert-')) {
        await updateCertificationApi(certId, payload);
      }
    } catch (err) {
      console.warn('Could not update cert status in DB:', err);
    }

    setCertificates((prev) =>
      prev.map((c) =>
        (c.id === certId || c._id === certId)
          ? {
              ...c,
              ...payload,
            }
          : c
      )
    );
    setActiveMenuId(null);
    showToast(`Status updated to "${nextStatus}".`);
  };

  // Actions: Delete
  const handleDeleteCert = async (certId, name) => {
    try {
      if (certId && !certId.startsWith('cert-')) {
        await deleteCertificationApi(certId);
      }
    } catch (err) {
      console.warn('Could not delete cert in DB:', err);
    }

    setCertificates((prev) => prev.filter((c) => c.id !== certId && c._id !== certId));
    setActiveMenuId(null);
    showToast(`Removed certificate "${name}".`);
  };

  return (
    <div className="certs-mgmt-container">
      {/* Static sticky sidebar with Certifications Management active */}
      <AdminSidebar
        currentNav="Certifications Management"
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="certs-mgmt-main-shell">
        {/* Topbar */}
        <AdminTopbar
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onToast={showToast}
          title="Management"
        />

        <main className="certs-mgmt-content">
          {/* Header Row */}
          <div className="certs-mgmt-header-row">
            <div>
              <h1 className="certs-mgmt-title">Certifications Management</h1>
              <p className="certs-mgmt-subtitle">
                Monitor and manage quality standards and compliance validity.
              </p>
            </div>
            <button
              className="btn-add-certificate"
              onClick={handleOpenAddModal}
              type="button"
            >
              <Plus aria-hidden="true" />
              <span>Add Certificate</span>
            </button>
          </div>

          {/* 3 Real-Time Overview Stats Cards */}
          <section aria-label="Certifications Overview Metrics" className="certs-stats-grid">
            {/* Active Card */}
            <article
              className={`cert-stat-card${activeFilterStatus === 'Valid' ? ' cert-stat-card--selected' : ''}`}
              onClick={() => setActiveFilterStatus(activeFilterStatus === 'Valid' ? 'All' : 'Valid')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon-wrapper stat-icon-wrapper--active">
                <CheckCircle2 aria-hidden="true" />
              </div>
              <div className="stat-info-cluster">
                <span className="stat-card-label">Active Valid</span>
                <span className="stat-card-value">{realTimeStats.active}</span>
              </div>
            </article>

            {/* Expiring Soon Card */}
            <article
              className={`cert-stat-card${activeFilterStatus === 'Expiring Soon' ? ' cert-stat-card--selected' : ''}`}
              onClick={() => setActiveFilterStatus(activeFilterStatus === 'Expiring Soon' ? 'All' : 'Expiring Soon')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon-wrapper stat-icon-wrapper--warning">
                <AlertTriangle aria-hidden="true" />
              </div>
              <div className="stat-info-cluster">
                <span className="stat-card-label">Expiring Soon (30D)</span>
                <span className="stat-card-value">{realTimeStats.expiringSoon}</span>
              </div>
            </article>

            {/* Expired Card */}
            <article
              className={`cert-stat-card${activeFilterStatus === 'Expired' ? ' cert-stat-card--selected' : ''}`}
              onClick={() => setActiveFilterStatus(activeFilterStatus === 'Expired' ? 'All' : 'Expired')}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon-wrapper stat-icon-wrapper--expired">
                <AlertCircle aria-hidden="true" />
              </div>
              <div className="stat-info-cluster">
                <span className="stat-card-label">Expired</span>
                <span className="stat-card-value">{realTimeStats.expired}</span>
              </div>
            </article>
          </section>

          {/* Table Card */}
          <div className="certs-table-card">
            {/* Controls Header Bar: Filter, Sort & Count */}
            <div className="certs-card-header-bar">
              <div className="certs-header-btn-group">
                <button
                  className={`btn-card-filter-action${activeFilterStatus !== 'All' ? ' active' : ''}`}
                  onClick={() =>
                    setActiveFilterStatus((prev) => {
                      if (prev === 'All') return 'Valid';
                      if (prev === 'Valid') return 'Expiring Soon';
                      if (prev === 'Expiring Soon') return 'Expired';
                      return 'All';
                    })
                  }
                  type="button"
                >
                  <Filter aria-hidden="true" />
                  <span>Filter: {activeFilterStatus}</span>
                </button>
                <button
                  className="btn-card-filter-action"
                  onClick={() => setSortAscending((prev) => !prev)}
                  type="button"
                >
                  <ArrowUpDown aria-hidden="true" />
                  <span>Sort: {sortAscending ? 'A to Z' : 'Z to A'}</span>
                </button>
              </div>

              <span className="entries-count-text">
                {filteredCerts.length} of {certificates.length} Total Standards
              </span>
            </div>

            {/* Table */}
            <table className="certs-table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '38%' }}>Certificate Name</th>
                  <th scope="col" style={{ width: '25%' }}>Issuer / Standard</th>
                  <th scope="col" style={{ width: '20%' }}>Validity Period</th>
                  <th scope="col" style={{ width: '11%' }}>Status</th>
                  <th scope="col" style={{ width: '6%', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCerts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      No certificates match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedCerts.map((cert) => {
                    const isWarning = cert.status === 'Expiring Soon';
                    const isExpired = cert.status === 'Expired';
                    const rowClass = `cert-row${
                      isWarning ? ' cert-row--warning' : isExpired ? ' cert-row--expired' : ''
                    }`;

                    return (
                      <tr key={cert.id} className={rowClass}>
                        {/* Certificate Name */}
                        <td>
                          <div className="cert-name-cell">
                            {isWarning && (
                              <AlertTriangle className="cert-row-badge-icon cert-row-badge-icon--warning" aria-hidden="true" />
                            )}
                            {isExpired && (
                              <AlertCircle className="cert-row-badge-icon cert-row-badge-icon--expired" aria-hidden="true" />
                            )}
                            <div className="cert-name-info">
                              <span className="cert-title-text">{cert.name}</span>
                              <span className="cert-sub-text">{cert.subScope}</span>
                            </div>
                          </div>
                        </td>

                        {/* Issuer / Standard */}
                        <td>
                          <span className="cert-issuer-text">{cert.issuer}</span>
                        </td>

                        {/* Validity (Issue - Expiry) */}
                        <td>
                          <div className="validity-cell">
                            <span
                              className={`validity-dates-text${
                                isWarning
                                  ? ' validity-dates-text--warning'
                                  : isExpired
                                  ? ' validity-dates-text--expired'
                                  : ''
                              }`}
                            >
                              {cert.validityRange}
                            </span>
                            {cert.expiryCountdown && (
                              <span
                                className={`validity-sub-countdown${
                                  isWarning
                                    ? ' validity-sub-countdown--warning'
                                    : isExpired
                                    ? ' validity-sub-countdown--expired'
                                    : ''
                                  }`}
                              >
                                {cert.expiryCountdown}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Pill */}
                        <td>
                          <span
                            className={`cert-status-pill cert-status-pill--${cert.status
                              .toLowerCase()
                              .replace(/\s+/g, '-')}`}
                          >
                            {cert.status === 'Valid' && (
                              <span className="cert-status-dot" aria-hidden="true" />
                            )}
                            <span>{cert.status}</span>
                          </span>
                        </td>

                        {/* Actions Button & Working Menu */}
                        <td className="cert-actions-cell">
                          <button
                            aria-label={`Actions for ${cert.name}`}
                            className="cert-action-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === cert.id ? null : cert.id);
                            }}
                            type="button"
                          >
                            <MoreVertical aria-hidden="true" />
                          </button>

                          {activeMenuId === cert.id && (
                            <div className="cert-actions-dropdown" role="menu">
                              <button
                                className="cert-dropdown-item"
                                onClick={() => handleViewCert(cert)}
                                role="menuitem"
                                type="button"
                              >
                                <Eye aria-hidden="true" />
                                <span>View Details</span>
                              </button>

                              <button
                                className="cert-dropdown-item"
                                onClick={() => handleOpenEditModal(cert)}
                                role="menuitem"
                                type="button"
                              >
                                <Pencil aria-hidden="true" />
                                <span>Edit Certificate</span>
                              </button>

                              <button
                                className="cert-dropdown-item"
                                onClick={() =>
                                  handleSetStatus(
                                    cert.id,
                                    cert.status === 'Valid' ? 'Expired' : 'Valid'
                                  )
                                }
                                role="menuitem"
                                type="button"
                              >
                                <Power aria-hidden="true" />
                                <span>
                                  Set as {cert.status === 'Valid' ? 'Expired' : 'Valid'}
                                </span>
                              </button>

                              <div className="cert-dropdown-divider" />

                              <button
                                className="cert-dropdown-item cert-dropdown-item--danger"
                                onClick={() => handleDeleteCert(cert.id, cert.name)}
                                role="menuitem"
                                type="button"
                              >
                                <Trash2 aria-hidden="true" />
                                <span>Delete Standard</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Table Footer / Real Pagination */}
            <div className="certs-table-footer">
              <button
                className="btn-cert-page"
                disabled={activePage <= 1}
                onClick={() => setCurrentPageNum((p) => Math.max(p - 1, 1))}
                type="button"
              >
                Previous
              </button>
              <div className="certs-pagination-cluster">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`btn-cert-page${activePage === pageNum ? ' btn-cert-page--active' : ''}`}
                      onClick={() => setCurrentPageNum(pageNum)}
                      type="button"
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                className="btn-cert-page"
                disabled={activePage >= totalPages}
                onClick={() => setCurrentPageNum((p) => Math.min(p + 1, totalPages))}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* View Certificate Modal */}
      {viewModalOpen && currentViewCert && (
        <div
          className="cert-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="cert-modal-box">
            <div className="cert-modal-header">
              <h3 className="cert-modal-title">Certificate Standard Details</h3>
              <p className="cert-modal-subtitle">
                Official compliance record and associated product lines.
              </p>
              <button
                aria-label="Close modal"
                className="cert-modal-close-btn"
                onClick={() => setViewModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="cert-modal-body" style={{ padding: '24px 28px' }}>
              <div className="modal-field-block">
                <span className="modal-field-label">Certificate Standard</span>
                <strong style={{ fontSize: '16px', color: '#0f172a' }}>{currentViewCert.name}</strong>
              </div>
              <div className="modal-field-block">
                <span className="modal-field-label">Scope / Specification</span>
                <span style={{ fontSize: '14px', color: '#475569' }}>{currentViewCert.subScope}</span>
              </div>
              <div className="modal-field-block">
                <span className="modal-field-label">Accredited Issuer</span>
                <span style={{ fontSize: '14px', color: '#334155', fontWeight: 600 }}>{currentViewCert.issuer}</span>
              </div>
              <div className="modal-field-block">
                <span className="modal-field-label">Validity Period</span>
                <span style={{ fontSize: '14px', color: '#0f172a' }}>{currentViewCert.validityRange}</span>
              </div>
              <div className="modal-field-block">
                <span className="modal-field-label">Current Status</span>
                <div>
                  <span className={`cert-status-pill cert-status-pill--${currentViewCert.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    <span>{currentViewCert.status}</span>
                  </span>
                </div>
              </div>
              <div className="modal-field-block">
                <span className="modal-field-label">Associated Products</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {(currentViewCert.associatedProducts || []).length > 0 ? (
                    currentViewCert.associatedProducts.map((p, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#f1f5f9',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: 500,
                          color: '#334155',
                        }}
                      >
                        {p}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>No products explicitly linked</span>
                  )}
                </div>
              </div>
            </div>
            <div className="cert-modal-footer">
              <button
                className="btn-cert-modal-cancel"
                onClick={() => setViewModalOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Certificate Modal */}
      {editModalOpen && currentEditCert && (
        <div
          className="cert-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="cert-modal-box">
            <div className="cert-modal-header">
              <h3 className="cert-modal-title">Edit Certificate Standard</h3>
              <p className="cert-modal-subtitle">
                Update standard specifications, issuer, and validity dates.
              </p>
              <button
                aria-label="Close modal"
                className="cert-modal-close-btn"
                onClick={() => setEditModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCert}>
              <div className="cert-modal-body">
                <div className="modal-field-block">
                  <label className="modal-field-label" htmlFor="edit-cert-name">
                    Certificate Name <span className="required-star">*</span>
                  </label>
                  <input
                    id="edit-cert-name"
                    className="modal-input-field"
                    onChange={(e) => setCurrentEditCert({ ...currentEditCert, name: e.target.value })}
                    required
                    type="text"
                    value={currentEditCert.name}
                  />
                </div>

                <div className="modal-field-block">
                  <label className="modal-field-label" htmlFor="edit-cert-scope">
                    Scope / Technical Description
                  </label>
                  <input
                    id="edit-cert-scope"
                    className="modal-input-field"
                    onChange={(e) => setCurrentEditCert({ ...currentEditCert, subScope: e.target.value })}
                    type="text"
                    value={currentEditCert.subScope}
                  />
                </div>

                <div className="modal-field-block">
                  <label className="modal-field-label" htmlFor="edit-cert-issuer">
                    Issuing Authority / Standard Body
                  </label>
                  <input
                    id="edit-cert-issuer"
                    className="modal-input-field"
                    onChange={(e) => setCurrentEditCert({ ...currentEditCert, issuer: e.target.value })}
                    type="text"
                    value={currentEditCert.issuer}
                  />
                </div>

                <div className="modal-field-block">
                  <label className="modal-field-label" htmlFor="edit-cert-validity">
                    Validity Period
                  </label>
                  <input
                    id="edit-cert-validity"
                    className="modal-input-field"
                    onChange={(e) => setCurrentEditCert({ ...currentEditCert, validityRange: e.target.value })}
                    type="text"
                    value={currentEditCert.validityRange}
                  />
                </div>

                <div className="modal-field-block">
                  <label className="modal-field-label" htmlFor="edit-cert-status">
                    Status
                  </label>
                  <select
                    id="edit-cert-status"
                    className="modal-input-field"
                    onChange={(e) => setCurrentEditCert({ ...currentEditCert, status: e.target.value })}
                    value={currentEditCert.status}
                  >
                    <option value="Valid">Valid</option>
                    <option value="Expiring Soon">Expiring Soon</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="cert-modal-footer">
                <button
                  className="btn-cert-modal-cancel"
                  onClick={() => setEditModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-cert-modal-submit" type="submit">
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Certificate Modal */}
      {modalOpen && (
        <div
          className="cert-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="cert-modal-box">
            {/* Header */}
            <div className="cert-modal-header">
              <h3 className="cert-modal-title">Add Certification</h3>
              <p className="cert-modal-subtitle">
                Upload and document technical certifications, ISO standards, or quality marks.
              </p>
              <button
                aria-label="Close modal"
                className="cert-modal-close-btn"
                onClick={() => setModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleAddCertSubmit}>
              <div className="cert-modal-body">
                {/* BASIC INFORMATION Section */}
                <div>
                  <h4 className="modal-section-caption">BASIC INFORMATION</h4>
                  <div className="modal-field-block">
                    <label className="modal-field-label" htmlFor="cert-name-input">
                      Certificate Name <span className="required-star">*</span>
                    </label>
                    <input
                      id="cert-name-input"
                      className="modal-input-field"
                      onChange={(e) => setCertName(e.target.value)}
                      placeholder="e.g., ISO 9001:2015 Quality Management"
                      required
                      type="text"
                      value={certName}
                    />
                  </div>

                  <div className="modal-field-block" style={{ marginTop: '12px' }}>
                    <label className="modal-field-label" htmlFor="cert-issuer-input">
                      Issuing Authority
                    </label>
                    <input
                      id="cert-issuer-input"
                      className="modal-input-field"
                      onChange={(e) => setCertIssuer(e.target.value)}
                      placeholder="e.g., TÜV Rheinland / American Welding Society"
                      type="text"
                      value={certIssuer}
                    />
                  </div>

                  <div className="modal-field-block" style={{ marginTop: '14px' }}>
                    <label className="modal-field-label">Certificate Document</label>
                    <div
                      className="cert-dropzone-box"
                      onClick={() => docInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) {
                          setUploadedDoc(e.dataTransfer.files[0]);
                        }
                      }}
                    >
                      <div className="cert-dropzone-icon-shell">
                        <FileUp aria-hidden="true" />
                      </div>
                      <p className="cert-dropzone-headline">
                        {uploadedDoc ? uploadedDoc.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="cert-dropzone-hint">
                        {uploadedDoc
                          ? `${(uploadedDoc.size / 1024).toFixed(0)} KB ready for upload`
                          : 'PDF, JPG, or PNG (Max 10MB)'}
                      </p>
                      <input
                        ref={docInputRef}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setUploadedDoc(e.target.files[0]);
                          }
                        }}
                        style={{ display: 'none' }}
                        type="file"
                      />
                    </div>
                  </div>
                </div>

                {/* MAPPING Section with Character-by-Character Autocomplete Dropdown */}
                <div>
                  <h4 className="modal-section-caption">PRODUCT MAPPING</h4>
                  <div className="modal-field-block">
                    <label className="modal-field-label" htmlFor="product-search-input">
                      Associated Products
                    </label>

                    {/* Selected Tags */}
                    {selectedProductNames.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {selectedProductNames.map((name, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '12px',
                              color: '#1e293b',
                            }}
                          >
                            <span>{name}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedProductNames((prev) => prev.filter((_, i) => i !== idx))
                              }
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                              }}
                            >
                              <X style={{ width: '12px', height: '12px' }} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Character-by-character autocomplete search */}
                    <div className="cert-autocomplete-container" ref={autocompleteRef}>
                      <div className="checklist-search-wrapper">
                        <Search className="checklist-search-icon" aria-hidden="true" />
                        <input
                          id="product-search-input"
                          autoComplete="off"
                          className="checklist-search-input"
                          onChange={(e) => {
                            setProductQuery(e.target.value);
                            setProductDropdownOpen(true);
                          }}
                          onFocus={() => setProductDropdownOpen(true)}
                          placeholder="Search product SKUs, series, or names..."
                          type="text"
                          value={productQuery}
                        />
                        {productQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setProductQuery('');
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
                          >
                            <X style={{ width: '15px', height: '15px' }} />
                          </button>
                        )}
                      </div>

                      {/* Dropdown Menu matching character by character */}
                      {productDropdownOpen && (
                        <ul className="cert-autocomplete-dropdown" role="listbox">
                          {(() => {
                            const query = productQuery.trim().toLowerCase();
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
                                <li className="cert-autocomplete-empty">
                                  No matching products found.
                                </li>
                              );
                            }

                            return matches.slice(0, 10).map((prod) => {
                              const alreadyAdded = selectedProductNames.includes(prod.name);
                              return (
                                <li
                                  key={prod._id || prod.id || prod.sku}
                                  className="cert-autocomplete-item"
                                  onClick={() => {
                                    if (!alreadyAdded) {
                                      setSelectedProductNames((prev) => [...prev, prod.name]);
                                    }
                                    setProductQuery('');
                                    setProductDropdownOpen(false);
                                  }}
                                  role="option"
                                  style={{
                                    opacity: alreadyAdded ? 0.6 : 1,
                                    background: alreadyAdded ? '#f8fafc' : undefined,
                                  }}
                                >
                                  <div className="cert-autocomplete-item-main">
                                    <span className="cert-autocomplete-item-title">
                                      {prod.name} {alreadyAdded ? '(Already linked)' : ''}
                                    </span>
                                    <span className="cert-autocomplete-item-sub">
                                      {prod.sku && <span>SKU: {prod.sku}</span>}
                                      {prod.series && <span>• Series: {prod.series}</span>}
                                    </span>
                                  </div>
                                  {prod.category && (
                                    <span className="cert-autocomplete-item-category">
                                      {prod.category}
                                    </span>
                                  )}
                                </li>
                              );
                            });
                          })()}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="cert-modal-footer">
                <button
                  className="btn-cert-modal-cancel"
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-cert-modal-submit" type="submit">
                  <span>Add Certification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <aside aria-live="polite" className="certs-toast" role="status">
          <CheckCircle2 className="certs-toast-icon" aria-hidden="true" />
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
