import { useEffect, useState, useMemo } from 'react';
import {
  Calendar,
  Check,
  ChevronDown,
  Download,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
  Building2,
  Briefcase,
  FileText,
  Wrench,
  ShieldCheck,
  Clock,
  MapPin,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import {
  fetchEnquiries,
  createEnquiryApi,
  updateEnquiryApi,
  deleteEnquiryApi,
} from './api/products.js';
import './EnquiriesPage.css';

const ENQUIRY_CATEGORIES = [
  { id: 'Product Enquiries', label: 'Product Enquiries', icon: FileText, singular: 'Product Enquiry' },
  { id: 'Dealer Enquiries', label: 'Dealer Enquiries', icon: Briefcase, singular: 'Dealer Enquiry' },
  { id: 'Technical Support', label: 'Technical Support', icon: Wrench, singular: 'Technical Support' },
  { id: 'Project Requirements', label: 'Project Requirements', icon: Building2, singular: 'Project Requirement' },
];

function normalizeCategory(rawType) {
  const t = (rawType || '').toLowerCase();
  if (t.includes('dealer') || t.includes('distributor')) return 'Dealer Enquiries';
  if (t.includes('tech') || t.includes('support')) return 'Technical Support';
  if (t.includes('project') || t.includes('requirement')) return 'Project Requirements';
  return 'Product Enquiries';
}

export default function EnquiriesPage({
  activeType = 'Product Enquiries',
  onNavigate,
  onLogout,
  onViewEnquiryDetails,
}) {
  const [currentType, setCurrentType] = useState(activeType);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state if prop changes from sidebar navigation
  useEffect(() => {
    if (activeType && activeType !== 'Enquiries') {
      setCurrentType(activeType);
    }
  }, [activeType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchEnquiries();
      const rawList = Array.isArray(data) ? data : (data?.data || []);
      const formatted = rawList.map((e) => {
        const year = e.createdAt ? new Date(e.createdAt).getFullYear() : 2026;
        const refNo = e.referenceCode
          ? e.referenceCode.replace('#', '')
          : e.refNo
          ? e.refNo.replace('#', '')
          : `ENQ-${year}-${(e._id || e.id || '0001').slice(-4).toUpperCase()}`;

        return {
          ...e,
          id: e.id || e._id,
          refNo: refNo,
          refId: `#${refNo}`,
          date: e.createdAt
            ? new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Recent',
          customer: e.contactName || e.customer || e.name || 'Anonymous',
          company: e.companyName || e.company || 'Direct Client',
          email: e.email || '',
          phone: e.phone || '',
          enquiryType: e.enquiryType || 'Product Enquiry',
          category: normalizeCategory(e.enquiryType),
          productInterested: e.productInterested || (e.productId && e.productId.name) || e.skuOrClass || 'Industrial Supply',
          productId: e.productId || null,
          productName: (e.productId && e.productId.name) || e.productInterested || 'Industrial Consumable',
          productSku: (e.productId && e.productId.sku) || (e.skuOrClass && !e.skuOrClass.startsWith('TDS') ? e.skuOrClass : ''),
          status: e.status || 'New',
          title:
            e.title ||
            (e.projectName
              ? `${e.projectName} - ${e.companyName || 'Project'}`
              : `${e.companyName || e.contactName || 'Client'} - ${e.enquiryType}`),
          submittedAt: e.createdAt
            ? new Date(e.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recently',
          role: e.role || (normalizeCategory(e.enquiryType) === 'Dealer Enquiries' ? 'Authorized Distributor' : 'Engineering Contact'),
          industry: e.industryName || e.industry || 'Heavy Industrial',
          address: e.primaryLocation || e.address || 'Direct submission',
          message: e.message || e.projectScopeDetails || '',
          // Internal workflow fields
          assignedTo: e.assignedTo || 'Unassigned',
          followUp: e.followUp || { isSet: false },
          internalNotes: e.internalNotes || '',
          statusHistory: e.statusHistory || [],
          // Dealer specific
          businessType: e.businessType || 'Wholesale Distributor',
          primaryLocation: e.primaryLocation || 'Global',
          yearsInBusiness: e.yearsInBusiness || '6-10',
          currentProductRange: e.currentProductRange || 'Welding Equipment',
          // Product specific
          quantity: e.quantity || '',
          unit: e.unit || 'KG',
          timeline: e.timeline || e.requiredDate || e.targetDeliveryDate || '',
          requiredDate: e.requiredDate || '',
          application: e.application || '',
          specifications: e.specifications || '',
          // Technical Support specific
          subject: e.subject || e.enquirySubject || 'Technical Assessment',
          // Project Requirements specific
          projectName: e.projectName || '',
          baseMaterials: e.baseMaterials || '',
          weldingProcess: e.weldingProcess || '',
          standards: e.standards || '',
          estimatedVolume: e.estimatedVolume || '',
          targetDeliveryDate: e.targetDeliveryDate || '',
          projectScopeDetails: e.projectScopeDetails || '',
        };
      });
      setEnquiries(formatted);
    } catch (err) {
      console.error('Failed to fetch enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeStatusDropdownId, setActiveStatusDropdownId] = useState(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeEnquiryForReply, setActiveEnquiryForReply] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // New manual enquiry form
  const [newEnqData, setNewEnqData] = useState({
    customer: '',
    company: '',
    email: '',
    phone: '',
    status: 'New',
    message: '',
    // Dynamic fields based on category
    productInterested: 'Submerged Arc Wire SAW-F7A2',
    quantity: '2,500',
    unit: 'KG',
    businessType: 'Regional Wholesaler',
    primaryLocation: 'Houston, TX',
    yearsInBusiness: '6-10',
    subject: 'Welding Procedure Qualification',
    projectName: 'Pipeline Fabrication Phase 2',
    industryName: 'Heavy Engineering',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts = {
      'Product Enquiries': 0,
      'Dealer Enquiries': 0,
      'Technical Support': 0,
      'Project Requirements': 0,
    };
    enquiries.forEach((item) => {
      const cat = item.category || normalizeCategory(item.enquiryType);
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      }
    });
    return counts;
  }, [enquiries]);

  // Filtered list specifically for currentType
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      // Must match current category
      const itemCat = item.category || normalizeCategory(item.enquiryType);
      if (itemCat !== currentType) {
        return false;
      }

      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.customer.toLowerCase().includes(term) ||
        item.company.toLowerCase().includes(term) ||
        item.refId.toLowerCase().includes(term) ||
        (item.productInterested && item.productInterested.toLowerCase().includes(term)) ||
        (item.projectName && item.projectName.toLowerCase().includes(term)) ||
        (item.subject && item.subject.toLowerCase().includes(term)) ||
        (item.businessType && item.businessType.toLowerCase().includes(term)) ||
        (item.primaryLocation && item.primaryLocation.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === 'All' ? true : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enquiries, currentType, searchQuery, statusFilter]);

  // Handle status update
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateEnquiryApi(id, { status: newStatus });
      setEnquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      setActiveStatusDropdownId(null);
      showToast(`Status updated to "${newStatus}"`);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to update status on server.');
    }
  };

  // Handle delete enquiry
  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry record?')) return;
    try {
      await deleteEnquiryApi(id);
      setEnquiries((prev) => prev.filter((item) => item.id !== id));
      showToast('Enquiry removed.');
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
      showToast('Failed to delete enquiry on server.');
    }
  };

  // Handle Add Manual Enquiry Submit
  const handleAddEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!newEnqData.customer.trim() || !newEnqData.company.trim()) {
      showToast('Customer and Company names are required.');
      return;
    }

    try {
      const activeCatObj = ENQUIRY_CATEGORIES.find((c) => c.id === currentType);
      const enqType = activeCatObj ? activeCatObj.singular : 'Product Enquiry';

      const payload = {
        contactName: newEnqData.customer.trim(),
        companyName: newEnqData.company.trim(),
        email: newEnqData.email.trim(),
        phone: newEnqData.phone.trim(),
        enquiryType: enqType,
        status: newEnqData.status,
        message: newEnqData.message || `Manual entry recorded by Admin for ${newEnqData.company}`,
        // Type specific
        productInterested: newEnqData.productInterested,
        quantity: newEnqData.quantity,
        unit: newEnqData.unit,
        businessType: newEnqData.businessType,
        primaryLocation: newEnqData.primaryLocation,
        yearsInBusiness: newEnqData.yearsInBusiness,
        subject: newEnqData.subject,
        projectName: newEnqData.projectName,
        industryName: newEnqData.industryName,
      };

      const created = await createEnquiryApi(payload);
      const raw = created.data || created;
      const newEnq = {
        ...payload,
        id: raw.id || raw._id,
        _id: raw._id || raw.id,
        refId: raw.referenceCode ? `#${raw.referenceCode}` : `#ENQ-${Date.now().toString().slice(-4)}`,
        date: 'Today',
        submittedAt: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: currentType,
      };

      setEnquiries((prev) => [newEnq, ...prev]);
      setNewEnqData({
        customer: '',
        company: '',
        email: '',
        phone: '',
        status: 'New',
        message: '',
        productInterested: 'Submerged Arc Wire SAW-F7A2',
        quantity: '2,500',
        unit: 'KG',
        businessType: 'Regional Wholesaler',
        primaryLocation: 'Houston, TX',
        yearsInBusiness: '6-10',
        subject: 'Welding Procedure Qualification',
        projectName: 'Pipeline Fabrication Phase 2',
        industryName: 'Heavy Engineering',
      });
      setAddModalOpen(false);
      showToast(`Manual enquiry created for ${newEnq.customer}.`);
    } catch (err) {
      console.error('Failed to create manual enquiry:', err);
      showToast('Error saving enquiry to database.');
    }
  };

  // Handle quick reply
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    showToast(`Response dispatched to ${activeEnquiryForReply?.email || 'customer'}.`);
    setReplyModalOpen(false);
    setReplyMessage('');
    setActiveEnquiryForReply(null);
  };

  // Close status dropdown when clicking outside
  useEffect(() => {
    if (!activeStatusDropdownId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.status-dropdown-wrapper')) {
        setActiveStatusDropdownId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeStatusDropdownId]);

  // Export CSV via Blob with UTF-8 BOM
  const handleDownloadReport = () => {
    if (filteredEnquiries.length === 0) {
      showToast('No enquiries to export in current view.');
      return;
    }
    const headers = [
      'Reference ID',
      'Date',
      'Customer/Applicant',
      'Company',
      'Email',
      'Phone',
      'Category',
      'Enquiry Type',
      'Status',
      'Details / Message',
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredEnquiries.map((enq) => [
      escapeCsv(enq.refId),
      escapeCsv(enq.date),
      escapeCsv(enq.customer),
      escapeCsv(enq.company),
      escapeCsv(enq.email || ''),
      escapeCsv(enq.phone || ''),
      escapeCsv(enq.category || currentType),
      escapeCsv(enq.enquiryType || currentType),
      escapeCsv(enq.status),
      escapeCsv(enq.message || enq.projectName || enq.subject || enq.productInterested || ''),
    ]);

    const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentType.toLowerCase().replace(/\s+/g, '_')}_export_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredEnquiries.length} records.`);
  };

  const getSubtitles = () => {
    switch (currentType) {
      case 'Dealer Enquiries':
        return `${filteredEnquiries.length} authorized distributor & wholesaler applications`;
      case 'Technical Support':
        return `${filteredEnquiries.length} metallurgical & engineering consultation transmissions`;
      case 'Project Requirements':
        return `${filteredEnquiries.length} large-scale industrial project scope submissions`;
      case 'Product Enquiries':
      default:
        return `${filteredEnquiries.length} commercial product & SKU quotation requests`;
    }
  };

  const statusOptions = useMemo(() => {
    if (currentType === 'Dealer Enquiries') {
      return ['All', 'New', 'Processing', 'Approved', 'Rejected', 'Closed'];
    }
    if (currentType === 'Technical Support') {
      return ['All', 'New', 'Processing', 'Resolved', 'Closed'];
    }
    if (currentType === 'Project Requirements') {
      return ['All', 'New', 'In Review', 'Quoted', 'Approved', 'Archived'];
    }
    return ['All', 'New', 'Processing', 'Quoted', 'Closed'];
  }, [currentType]);

  return (
    <div className="enquiries-page-container">
      {/* Persistent Sidebar with current category highlighted */}
      <AdminSidebar
        currentNav={currentType}
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="enquiries-main-shell">
        {/* Topbar */}
        <AdminTopbar
          onLogout={onLogout}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSearchChange={setGlobalSearch}
          searchQuery={globalSearch}
          title={currentType}
        />

        <main className="enquiries-content">
          {/* Header Row */}
          <header className="enquiries-header-row">
            <div>
              <h1 className="enquiries-title">{currentType}</h1>
              <p className="enquiries-subtitle">{getSubtitles()}</p>
            </div>
            <div className="enquiries-actions-group">
              <button
                className="btn-download-report"
                onClick={handleDownloadReport}
                type="button"
              >
                <Download className="btn-icon-svg" aria-hidden="true" />
                <span>Export CSV</span>
              </button>
              <button
                className="btn-add-manual"
                onClick={() => setAddModalOpen(true)}
                type="button"
              >
                <Plus className="btn-icon-svg" aria-hidden="true" />
                <span>Add Record</span>
              </button>
            </div>
          </header>

          {/* Four Enquiries Category Tabs */}
          <nav aria-label="Enquiries categories" className="enquiry-type-tabs">
            {ENQUIRY_CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isActive = currentType === id;
              const count = categoryCounts[id] || 0;
              return (
                <button
                  key={id}
                  type="button"
                  className={`enquiry-type-tab-btn${isActive ? ' active' : ''}`}
                  onClick={() => {
                    setCurrentType(id);
                    onNavigate?.(id);
                  }}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  <span className="enquiry-type-tab-count">{count}</span>
                </button>
              );
            })}
          </nav>

          {/* Filter Card */}
          <section className="enquiries-table-card" aria-label="Enquiries table">
            <div className="enquiries-filter-bar">
              {/* Search input */}
              <div className="enquiries-search-box">
                <Search className="search-icon" aria-hidden="true" />
                <input
                  aria-label="Search records"
                  className="search-input"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${currentType.toLowerCase()} by name, ref, or keyword...`}
                  type="text"
                  value={searchQuery}
                />
                {searchQuery && (
                  <button
                    aria-label="Clear search"
                    className="search-clear-btn"
                    onClick={() => setSearchQuery('')}
                    type="button"
                  >
                    <X aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <div className="filter-select-shell">
                <select
                  aria-label="Filter by Status"
                  className="filter-select"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  value={statusFilter}
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      Status: {st}
                    </option>
                  ))}
                </select>
                <ChevronDown className="filter-chevron" aria-hidden="true" />
              </div>

              {/* Refresh Button */}
              <button
                className="btn-date-range"
                onClick={loadData}
                type="button"
                title="Reload from database"
              >
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Table Area */}
            <div className="table-responsive">
              <table className="enquiries-table">
                <thead>
                  {/* Category-specific table headers */}
                  {currentType === 'Product Enquiries' && (
                    <tr>
                      <th scope="col" className="th-ref">Reference ID</th>
                      <th scope="col" className="th-date">Date</th>
                      <th scope="col" className="th-customer">Customer &amp; Company</th>
                      <th scope="col" className="th-contact">Contact</th>
                      <th scope="col" className="th-product">Product &amp; SKU</th>
                      <th scope="col" className="th-qty">Quantity</th>
                      <th scope="col" className="th-status">Status</th>
                      <th scope="col" className="th-actions">Actions</th>
                    </tr>
                  )}

                  {currentType === 'Dealer Enquiries' && (
                    <tr>
                      <th scope="col" className="th-ref">Reference ID</th>
                      <th scope="col" className="th-date">Date</th>
                      <th scope="col" className="th-customer">Applicant &amp; Company</th>
                      <th scope="col" className="th-businesstype">Business Type</th>
                      <th scope="col" className="th-location">Location</th>
                      <th scope="col" className="th-experience">Experience</th>
                      <th scope="col" className="th-status">Status</th>
                      <th scope="col" className="th-actions">Actions</th>
                    </tr>
                  )}

                  {currentType === 'Technical Support' && (
                    <tr>
                      <th scope="col" className="th-ref">Reference ID</th>
                      <th scope="col" className="th-date">Date</th>
                      <th scope="col" className="th-customer">Client &amp; Organization</th>
                      <th scope="col" className="th-subject">Subject Area</th>
                      <th scope="col" className="th-contact">Contact</th>
                      <th scope="col" className="th-industry">Industry</th>
                      <th scope="col" className="th-status">Status</th>
                      <th scope="col" className="th-actions">Actions</th>
                    </tr>
                  )}

                  {currentType === 'Project Requirements' && (
                    <tr>
                      <th scope="col" className="th-ref">Reference ID</th>
                      <th scope="col" className="th-date">Date</th>
                      <th scope="col" className="th-customer">Project &amp; Company</th>
                      <th scope="col" className="th-industry">Industry Sector</th>
                      <th scope="col" className="th-process">Welding Process</th>
                      <th scope="col" className="th-volume">Volume &amp; Target</th>
                      <th scope="col" className="th-status">Status</th>
                      <th scope="col" className="th-actions">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="no-enquiries-cell">
                        Loading {currentType.toLowerCase()} from MongoDB Atlas...
                      </td>
                    </tr>
                  ) : filteredEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="no-enquiries-cell">
                        No {currentType.toLowerCase()} found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredEnquiries.map((enq) => (
                      <tr key={enq.id} className="enquiry-row">
                        {/* Reference ID (Common) */}
                        <td className="td-ref">
                          <button
                            className="ref-id-btn"
                            onClick={() => onViewEnquiryDetails?.(enq)}
                            type="button"
                            title="View Full Technical Details"
                          >
                            {enq.refId}
                          </button>
                        </td>

                        {/* Date (Common) */}
                        <td className="td-date">{enq.date}</td>

                        {/* =======================
                            1. PRODUCT ENQUIRIES ROWS
                            ======================= */}
                        {currentType === 'Product Enquiries' && (
                          <>
                            <td className="td-customer">
                              <div className="customer-info-cell">
                                <strong className="customer-name">{enq.customer}</strong>
                                <span className="customer-company">{enq.company}</span>
                              </div>
                            </td>
                            <td className="td-contact">
                              <div className="contact-icons-row">
                                {enq.email && (
                                  <button
                                    className="contact-icon-btn"
                                    onClick={() => showToast(`Email: ${enq.email}`)}
                                    title={enq.email}
                                    type="button"
                                  >
                                    <Mail aria-hidden="true" />
                                  </button>
                                )}
                                {enq.phone && (
                                  <button
                                    className="contact-icon-btn"
                                    onClick={() => showToast(`Phone: ${enq.phone}`)}
                                    title={enq.phone}
                                    type="button"
                                  >
                                    <Phone aria-hidden="true" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="td-product">
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <strong style={{ color: '#0f172a', fontSize: '13.5px' }}>{enq.productInterested}</strong>
                                {enq.skuOrClass && (
                                  <span className="spec-chip" style={{ width: 'fit-content' }}>
                                    {enq.skuOrClass}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="td-qty">
                              {enq.quantity ? (
                                <span className="data-tabular font-bold" style={{ color: '#000417' }}>
                                  {enq.quantity} {enq.unit || 'KG'}
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>Standard Quote</span>
                              )}
                            </td>
                          </>
                        )}

                        {/* =======================
                            2. DEALER ENQUIRIES ROWS
                            ======================= */}
                        {currentType === 'Dealer Enquiries' && (
                          <>
                            <td className="td-customer">
                              <div className="customer-info-cell">
                                <strong className="customer-name">{enq.customer}</strong>
                                <span className="customer-company">{enq.company}</span>
                              </div>
                            </td>
                            <td className="td-businesstype">
                              <span className="spec-chip" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                                {enq.businessType || 'Distributor'}
                              </span>
                            </td>
                            <td className="td-location">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '13px' }}>
                                <MapPin size={13} style={{ color: '#94a3b8' }} />
                                <span>{enq.primaryLocation || 'Global'}</span>
                              </div>
                            </td>
                            <td className="td-experience">
                              <span className="data-tabular" style={{ fontWeight: 600, color: '#334155' }}>
                                {enq.yearsInBusiness || '6-10'} yrs
                              </span>
                            </td>
                          </>
                        )}

                        {/* =======================
                            3. TECHNICAL SUPPORT ROWS
                            ======================= */}
                        {currentType === 'Technical Support' && (
                          <>
                            <td className="td-customer">
                              <div className="customer-info-cell">
                                <strong className="customer-name">{enq.customer}</strong>
                                <span className="customer-company">{enq.company}</span>
                              </div>
                            </td>
                            <td className="td-subject">
                              <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>
                                {enq.subject || 'Engineering Consultation'}
                              </span>
                            </td>
                            <td className="td-contact">
                              <div className="contact-icons-row">
                                {enq.email && (
                                  <button
                                    className="contact-icon-btn"
                                    onClick={() => showToast(`Email: ${enq.email}`)}
                                    title={enq.email}
                                    type="button"
                                  >
                                    <Mail aria-hidden="true" />
                                  </button>
                                )}
                                {enq.phone && (
                                  <button
                                    className="contact-icon-btn"
                                    onClick={() => showToast(`Phone: ${enq.phone}`)}
                                    title={enq.phone}
                                    type="button"
                                  >
                                    <Phone aria-hidden="true" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="td-industry">
                              <span className="spec-chip">
                                {enq.industry || 'Industrial'}
                              </span>
                            </td>
                          </>
                        )}

                        {/* =======================
                            4. PROJECT REQUIREMENTS ROWS
                            ======================= */}
                        {currentType === 'Project Requirements' && (
                          <>
                            <td className="td-customer">
                              <div className="customer-info-cell">
                                <strong className="customer-name">{enq.projectName || enq.title}</strong>
                                <span className="customer-company">{enq.company} ({enq.customer})</span>
                              </div>
                            </td>
                            <td className="td-industry">
                              <span className="spec-chip" style={{ background: '#fef3c7', color: '#b45309' }}>
                                {enq.industry || 'Heavy Structural'}
                              </span>
                            </td>
                            <td className="td-process">
                              <span style={{ fontSize: '12.5px', color: '#475569' }}>
                                {enq.weldingProcess || 'SAW / FCAW'}
                              </span>
                            </td>
                            <td className="td-volume">
                              <span className="data-tabular font-bold" style={{ fontSize: '12px', color: '#000417' }}>
                                {enq.estimatedVolume || 'TBD'}
                              </span>
                            </td>
                          </>
                        )}

                        {/* Status Dropdown (Common) */}
                        <td className="td-status">
                          <div className="status-dropdown-wrapper">
                            <button
                              className={`status-pill status-pill--${(enq.status || 'new').toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={() =>
                                setActiveStatusDropdownId(
                                  activeStatusDropdownId === enq.id ? null : enq.id
                                )
                              }
                              type="button"
                            >
                              <span className="status-dot">●</span>
                              <span>{enq.status}</span>
                              <ChevronDown className="status-chevron" aria-hidden="true" />
                            </button>

                            {activeStatusDropdownId === enq.id && (
                              <div className="status-menu">
                                {statusOptions
                                  .filter((s) => s !== 'All')
                                  .map((st) => (
                                    <button
                                      key={st}
                                      className={`status-menu-item${enq.status === st ? ' active' : ''}`}
                                      onClick={() => handleUpdateStatus(enq.id, st)}
                                      type="button"
                                    >
                                      {st}
                                      {enq.status === st && (
                                        <Check className="check-icon" aria-hidden="true" />
                                      )}
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions (Common) */}
                        <td className="td-actions">
                          <div className="actions-cell">
                            <button
                              aria-label="View Details"
                              className="action-btn"
                              onClick={() => onViewEnquiryDetails?.(enq)}
                              title="View Details"
                              type="button"
                            >
                              <Eye aria-hidden="true" />
                            </button>
                            {enq.email && (
                              <button
                                aria-label="Reply via Email"
                                className="action-btn"
                                onClick={() => {
                                  const recipient = encodeURIComponent(enq.email);
                                  const refNo = enq.refNo || enq.refId?.replace('#', '') || 'ENQ';
                                  const prod = enq.productName || enq.productInterested || enq.subject || 'Industrial Consumable';
                                  const subject = encodeURIComponent(`SPRIMAX Technical Response: [${refNo}] ${prod}`);
                                  const clientName = enq.customer || enq.contactName || 'Client';
                                  const greeting = clientName && clientName !== 'Anonymous' ? `Dear ${clientName},\n\n` : 'Dear Client,\n\n';
                                  const body = encodeURIComponent(
                                    `${greeting}Thank you for reaching out to SPRIMAX regarding your enquiry (${refNo}).\n\nIn reference to your request for ${prod}:\n\n`
                                  );
                                  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
                                  window.open(gmailUrl, '_blank', 'noopener,noreferrer');
                                  showToast(`Opening Gmail composer for ${enq.email}...`);
                                }}
                                title="Reply via Gmail"
                                type="button"
                              >
                                <MessageSquare aria-hidden="true" />
                              </button>
                            )}
                            <button
                              aria-label="Delete"
                              className="action-btn action-btn--delete"
                              onClick={() => handleDeleteEnquiry(enq.id)}
                              title="Delete Record"
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
            </div>
          </section>
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="enquiries-toast" role="status">
          {toastMessage}
        </div>
      )}

      {/* Quick Reply Modal */}
      {replyModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <header className="modal-header">
              <h2 className="modal-title">Reply to {activeEnquiryForReply?.customer}</h2>
              <button
                className="modal-close-btn"
                onClick={() => setReplyModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>
            <form onSubmit={handleSendReply}>
              <div className="modal-body">
                <div style={{ marginBottom: '12px', fontSize: '13px', color: '#64748b' }}>
                  Recipient: <strong style={{ color: '#0f172a' }}>{activeEnquiryForReply?.email}</strong> ({activeEnquiryForReply?.company})
                </div>
                <label className="modal-label">Response Message</label>
                <textarea
                  className="modal-textarea"
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Draft official engineering response or commercial quote..."
                  rows={5}
                  value={replyMessage}
                  required
                />
              </div>
              <footer className="modal-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setReplyModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-modal-submit-dark" type="submit">
                  Dispatch Email
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Add Manual Record Modal */}
      {addModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '640px' }}>
            <header className="modal-header">
              <h2 className="modal-title">New {currentType.slice(0, -1)} Record</h2>
              <button
                className="modal-close-btn"
                onClick={() => setAddModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>
            <form onSubmit={handleAddEnquirySubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="modal-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="modal-label">Contact Person *</label>
                    <input
                      className="modal-input"
                      onChange={(e) => setNewEnqData({ ...newEnqData, customer: e.target.value })}
                      placeholder="e.g. John Doe"
                      required
                      type="text"
                      value={newEnqData.customer}
                    />
                  </div>
                  <div>
                    <label className="modal-label">Organization / Company *</label>
                    <input
                      className="modal-input"
                      onChange={(e) => setNewEnqData({ ...newEnqData, company: e.target.value })}
                      placeholder="e.g. Acme Industrial"
                      required
                      type="text"
                      value={newEnqData.company}
                    />
                  </div>
                </div>

                <div className="modal-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="modal-label">Corporate Email</label>
                    <input
                      className="modal-input"
                      onChange={(e) => setNewEnqData({ ...newEnqData, email: e.target.value })}
                      placeholder="contact@company.com"
                      type="email"
                      value={newEnqData.email}
                    />
                  </div>
                  <div>
                    <label className="modal-label">Phone Number</label>
                    <input
                      className="modal-input"
                      onChange={(e) => setNewEnqData({ ...newEnqData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      type="tel"
                      value={newEnqData.phone}
                    />
                  </div>
                </div>

                {/* Conditional Fields based on current category */}
                {currentType === 'Product Enquiries' && (
                  <div className="modal-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label className="modal-label">Product SKU / Name</label>
                      <input
                        className="modal-input"
                        onChange={(e) => setNewEnqData({ ...newEnqData, productInterested: e.target.value })}
                        placeholder="e.g. SPRIMAX SAW-F7A2"
                        type="text"
                        value={newEnqData.productInterested}
                      />
                    </div>
                    <div>
                      <label className="modal-label">Quantity</label>
                      <input
                        className="modal-input"
                        onChange={(e) => setNewEnqData({ ...newEnqData, quantity: e.target.value })}
                        placeholder="e.g. 5,000 KG"
                        type="text"
                        value={newEnqData.quantity}
                      />
                    </div>
                  </div>
                )}

                {currentType === 'Dealer Enquiries' && (
                  <div className="modal-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label className="modal-label">Business Type</label>
                      <input
                        className="modal-input"
                        onChange={(e) => setNewEnqData({ ...newEnqData, businessType: e.target.value })}
                        placeholder="e.g. Industrial Wholesaler"
                        type="text"
                        value={newEnqData.businessType}
                      />
                    </div>
                    <div>
                      <label className="modal-label">Primary Location</label>
                      <input
                        className="modal-input"
                        onChange={(e) => setNewEnqData({ ...newEnqData, primaryLocation: e.target.value })}
                        placeholder="e.g. Houston, USA"
                        type="text"
                        value={newEnqData.primaryLocation}
                      />
                    </div>
                  </div>
                )}

                {currentType === 'Technical Support' && (
                  <div style={{ marginBottom: '12px' }}>
                    <label className="modal-label">Technical Subject</label>
                    <input
                      className="modal-input"
                      onChange={(e) => setNewEnqData({ ...newEnqData, subject: e.target.value })}
                      placeholder="e.g. WPS / PQR Consultation"
                      type="text"
                      value={newEnqData.subject}
                    />
                  </div>
                )}

                {currentType === 'Project Requirements' && (
                  <div className="modal-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label className="modal-label">Project Name</label>
                      <input
                        className="modal-input"
                        onChange={(e) => setNewEnqData({ ...newEnqData, projectName: e.target.value })}
                        placeholder="e.g. Bridge Deck Overhaul"
                        type="text"
                        value={newEnqData.projectName}
                      />
                    </div>
                    <div>
                      <label className="modal-label">Industry Sector</label>
                      <input
                        className="modal-input"
                        onChange={(e) => setNewEnqData({ ...newEnqData, industryName: e.target.value })}
                        placeholder="e.g. Heavy Structural"
                        type="text"
                        value={newEnqData.industryName}
                      />
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: '12px' }}>
                  <label className="modal-label">Specifications &amp; Message</label>
                  <textarea
                    className="modal-textarea"
                    onChange={(e) => setNewEnqData({ ...newEnqData, message: e.target.value })}
                    placeholder="Enter complete engineering notes or requirements..."
                    rows={4}
                    value={newEnqData.message}
                  />
                </div>
              </div>
              <footer className="modal-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setAddModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-modal-submit-dark" type="submit">
                  Save to Atlas
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
