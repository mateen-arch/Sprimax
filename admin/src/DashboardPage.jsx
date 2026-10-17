import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  CircleUserRound,
  ClipboardCheck,
  Folder,
  GalleryVerticalEnd,
  Grid2X2,
  LayoutDashboard,
  LogOut,
  MailCheck,
  Menu,
  MessagesSquare,
  PanelsTopLeft,
  Plus,
  RotateCw,
  Search,
  Settings,
  SquarePlus,
  TrendingUp,
  X,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import CreateReportModal from './CreateReportModal.jsx';
import { generatePdfReport, generateExcelReport } from './reportGenerator.js';
import {
  fetchProducts,
  fetchCategories,
  fetchEnquiries,
  updateEnquiryApi,
  fetchBanners,
  fetchDownloads,
} from './api/products.js';
import './DashboardPage.css';

const quickActions = [
  { label: 'Add New Product', icon: SquarePlus, target: 'Catalogue' },
  { label: 'Update Catalogue', icon: RotateCw, target: 'Catalogue' },
  { label: 'Review Enquiries', icon: MailCheck, target: 'Enquiries' },
  { label: 'Manage Banners', icon: GalleryVerticalEnd, target: 'Banner Management' },
];

function todayLabel() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

function DashboardPage({ onLogout, onNavigate }) {
  const [enquiries, setEnquiries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [rawProducts, setRawProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // Load live statistics and records from MongoDB
  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        const [catsRes, prodsRes, enqsRes, bannersRes, downloadsRes] = await Promise.allSettled([
          fetchCategories(),
          fetchProducts({ limit: 1000 }),
          fetchEnquiries(),
          fetchBanners(),
          fetchDownloads(),
        ]);

        if (!mounted) return;

        // Process Categories
        if (catsRes.status === 'fulfilled') {
          const catsData = catsRes.value;
          const catList = catsData?.categories || (Array.isArray(catsData) ? catsData : []);
          setCategories(catList);
        }

        // Process Products
        if (prodsRes.status === 'fulfilled') {
          const prodsData = prodsRes.value;
          const list = prodsData?.products || (Array.isArray(prodsData) ? prodsData : []);
          const count = prodsData?.total ?? list.length;
          setProductsCount(count);
          setRawProducts(list);
        }

        // Process Enquiries (Excluding seeded test records isTest: true)
        if (enqsRes.status === 'fulfilled') {
          const rawEnqs = Array.isArray(enqsRes.value) ? enqsRes.value : (enqsRes.value?.data || []);
          const liveEnqs = rawEnqs.filter((e) => e.isTest !== true);
          const formatted = liveEnqs.map((e) => {
            const rawId = e.id || e._id;
            const year = e.createdAt ? new Date(e.createdAt).getFullYear() : 2026;
            const code = e.referenceCode
              ? e.referenceCode.replace('#', '')
              : e.refNo
              ? e.refNo.replace('#', '')
              : `ENQ-${year}-${String(rawId || '0001').slice(-4).toUpperCase()}`;

            return {
              ...e,
              id: rawId,
              ref: code,
              refNo: code,
              refId: `#${code}`,
              customer: e.customer || e.contactName || e.name || 'Not provided',
              company: e.company || e.companyName || 'Not provided',
              product: e.productInterested || (e.productId && e.productId.name) || e.skuOrClass || e.subject || 'Not provided',
              date: e.date || (e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not provided'),
              status: e.status || 'New',
              message: e.message || '',
              email: e.email || '',
              phone: e.phone || '',
            };
          });
          setEnquiries(formatted);
        }

        // Process Banners & Downloads
        if (bannersRes.status === 'fulfilled') {
          setBanners(bannersRes.value || []);
        }
        if (downloadsRes.status === 'fulfilled') {
          setDownloads(downloadsRes.value || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute live metrics
  const totalCategoriesCount = categories.length;
  const totalSubcategoriesCount = useMemo(() => {
    return categories.reduce((acc, c) => acc + (c.subcategories ? c.subcategories.length : 0), 0);
  }, [categories]);

  const newEnquiriesCount = useMemo(() => {
    return enquiries.filter((e) => (e.status || '').toLowerCase() === 'new').length;
  }, [enquiries]);

  const contactedEnquiriesCount = useMemo(() => {
    return enquiries.filter((e) => {
      const st = (e.status || '').toLowerCase();
      return st === 'contacted' || st === 'processing' || st === 'quoted';
    }).length;
  }, [enquiries]);

  const closedEnquiriesCount = useMemo(() => {
    return enquiries.filter((e) => {
      const st = (e.status || '').toLowerCase();
      return st === 'closed' || st === 'resolved';
    }).length;
  }, [enquiries]);

  const totalEnquiriesCount = enquiries.length;

  const dynamicMetrics = useMemo(() => [
    {
      label: 'Total Active Categories',
      value: loading ? '—' : String(totalCategoriesCount),
      icon: Folder,
    },
    {
      label: 'Total Subcategories',
      value: loading ? '—' : String(totalSubcategoriesCount),
      icon: BookOpen,
    },
    {
      label: 'Total Products',
      value: loading ? '—' : String(productsCount),
      icon: ClipboardCheck,
    },
    {
      label: 'New Enquiries',
      value: loading ? '—' : String(newEnquiriesCount),
      icon: MessagesSquare,
      urgent: newEnquiriesCount > 0,
    },
  ], [loading, totalCategoriesCount, totalSubcategoriesCount, productsCount, newEnquiriesCount]);

  const visibleEnquiries = useMemo(() => {
    const query = searchText.trim().toLocaleLowerCase();
    if (!query) return enquiries;
    return enquiries.filter((enquiry) =>
      [enquiry.ref, enquiry.customer, enquiry.company, enquiry.product, enquiry.status]
        .some((value) => (value || '').toLocaleLowerCase().includes(query))
    );
  }, [enquiries, searchText]);

  function showToast(message) {
    setToast(message);
    setNotificationsOpen(false);
  }

  async function markContacted(ref, id) {
    try {
      if (id) {
        await updateEnquiryApi(id, { status: 'Contacted' });
      }
      setEnquiries((rows) =>
        rows.map((row) => (row.ref === ref || (id && row.id === id) ? { ...row, status: 'Contacted' } : row))
      );
      setSelectedEnquiry(null);
      showToast(`${ref} marked as contacted.`);
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
      showToast('Error updating status on server.');
    }
  }

  async function handleGenerateReport(config) {
    try {
      showToast(`Generating ${config.reportType} (${config.format})...`);
      if (config.format === 'Excel') {
        generateExcelReport({
          reportType: config.reportType,
          dateRange: config.dateRange,
          customStart: config.customStart,
          customEnd: config.customEnd,
          categories,
          products: rawProducts,
          enquiries,
          downloads,
        });
      } else {
        await generatePdfReport({
          reportType: config.reportType,
          dateRange: config.dateRange,
          customStart: config.customStart,
          customEnd: config.customEnd,
          sections: config.sections,
          categories,
          products: rawProducts,
          enquiries,
          banners,
          downloads,
          adminName: 'Mateen Baig (Admin)',
        });
      }
      showToast(`Report downloaded successfully!`);
    } catch (err) {
      console.error('Error in handleGenerateReport:', err);
      showToast('Error generating report: ' + err.message);
    }
  }

  // Calculate live breakdown percentages
  const newPercent = totalEnquiriesCount > 0 ? Math.round((newEnquiriesCount / totalEnquiriesCount) * 100) : 0;
  const contactedPercent = totalEnquiriesCount > 0 ? Math.round((contactedEnquiriesCount / totalEnquiriesCount) * 100) : 0;
  const closedPercent = totalEnquiriesCount > 0 ? Math.round((closedEnquiriesCount / totalEnquiriesCount) * 100) : 0;

  return (
    <div className="admin-shell">
      {/* Unified AdminSidebar */}
      <AdminSidebar
        currentNav="Dashboard"
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            aria-label="Open navigation"
            className="mobile-menu-button"
            onClick={() => setMobileSidebarOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" />
          </button>
          <h1 className="topbar-title">Dashboard</h1>

          <div className="topbar-tools">
            <label className="dashboard-search">
              <Search aria-hidden="true" />
              <input
                aria-label="Search enquiries"
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search..."
                type="search"
                value={searchText}
              />
            </label>

            <div className="topbar-popover-anchor">
              <button
                aria-expanded={notificationsOpen}
                aria-label="Notifications"
                className="topbar-icon-button"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                }}
                type="button"
              >
                <Bell aria-hidden="true" />
                {newEnquiriesCount > 0 && <span className="notification-dot" />}
              </button>
              {notificationsOpen && (
                <div className="topbar-popover">
                  <strong>Notifications</strong>
                  <p>
                    {newEnquiriesCount > 0
                      ? `You have ${newEnquiriesCount} new ${newEnquiriesCount === 1 ? 'enquiry' : 'enquiries'} to review.`
                      : 'All customer enquiries are currently up to date.'}
                  </p>
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      onNavigate?.('Enquiries');
                    }}
                    type="button"
                    style={{ cursor: 'pointer' }}
                  >
                    Review enquiries <ArrowRight aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            <button
              aria-label="Global Settings"
              className="topbar-icon-button"
              onClick={() => {
                setNotificationsOpen(false);
                onNavigate?.('Global Settings');
              }}
              type="button"
              title="Global Settings"
            >
              <Settings aria-hidden="true" />
            </button>

            <button
              aria-label="Admin profile"
              className="profile-avatar"
              onClick={() => showToast('Admin Profile: baigmateen80')}
              type="button"
            >
              AD
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="dashboard-heading-row">
            <div>
              <h2 className="dashboard-greeting">Good morning, Admin</h2>
              <p className="dashboard-date">{todayLabel()}</p>
            </div>
            <button
              className="create-report-button"
              onClick={() => setReportModalOpen(true)}
              type="button"
            >
              <Plus aria-hidden="true" />
              <span>Create Report</span>
            </button>
          </div>

          <section aria-label="Overview metrics" className="metrics-grid">
            {dynamicMetrics.map(({ label, value, icon: Icon, urgent }) => (
              <article className={`metric-card${urgent ? ' metric-card--urgent' : ''}`} key={label}>
                <div className={`metric-icon${urgent ? ' metric-icon--urgent' : ''}`}>
                  <Icon aria-hidden="true" />
                </div>
                {urgent && <span className="urgent-badge">Urgent</span>}
                <p className="metric-label">{label}</p>
                <p className="metric-value">{value}</p>
              </article>
            ))}
          </section>

          <div className="dashboard-columns">
            <section aria-labelledby="recent-enquiries-title" className="dashboard-panel enquiries-panel">
              <div className="panel-heading">
                <h2 id="recent-enquiries-title">Recent Enquiries</h2>
                <button
                  className="panel-link"
                  onClick={() => onNavigate?.('Enquiries')}
                  type="button"
                >
                  View All <ArrowRight aria-hidden="true" />
                </button>
              </div>
              <div className="enquiry-table-wrap">
                <table className="enquiry-table">
                  <thead>
                    <tr>
                      <th scope="col">Ref</th>
                      <th scope="col">Customer / Company</th>
                      <th scope="col">Product</th>
                      <th scope="col">Date</th>
                      <th scope="col">Status</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td className="empty-results" colSpan="6">
                          Loading enquiries from database...
                        </td>
                      </tr>
                    ) : visibleEnquiries.length === 0 ? (
                      <tr>
                        <td className="empty-results" colSpan="6">
                          {searchText ? 'No enquiries match your search.' : 'No enquiries registered yet.'}
                        </td>
                      </tr>
                    ) : (
                      visibleEnquiries.slice(0, 8).map((enquiry) => (
                        <tr key={enquiry.ref + (enquiry.id || '')}>
                          <td className="enquiry-ref">#{enquiry.ref}</td>
                          <td>
                            <span className="customer-name">{enquiry.customer}</span>
                            <span className="customer-company">{enquiry.company}</span>
                          </td>
                          <td className="enquiry-product">{enquiry.product}</td>
                          <td className="enquiry-date">{enquiry.date}</td>
                          <td>
                            <span className={`status-badge status-badge--${(enquiry.status || '').toLowerCase().replace('-', '')}`}>
                              {enquiry.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="view-enquiry-button"
                              onClick={() => setSelectedEnquiry(enquiry)}
                              type="button"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="dashboard-side-panels">
              <section aria-labelledby="quick-actions-title" className="dashboard-panel quick-actions-panel">
                <div className="panel-heading panel-heading--simple">
                  <h2 id="quick-actions-title">Quick Actions</h2>
                </div>
                <div className="quick-actions-grid">
                  {quickActions.map(({ label, icon: Icon, target }) => (
                    <button
                      className="quick-action-button"
                      key={label}
                      onClick={() => onNavigate?.(target)}
                      type="button"
                    >
                      <span className="quick-action-icon"><Icon aria-hidden="true" /></span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section aria-labelledby="enquiry-status-title" className="dashboard-panel enquiry-status-panel">
                <div className="panel-heading panel-heading--simple">
                  <h2 id="enquiry-status-title">Enquiry Status</h2>
                </div>
                <div className="status-summary">
                  <div className="status-summary-item">
                    <div className="status-summary-label">
                      <span className="status-dot status-dot--new" />
                      New
                      <strong>{loading ? '—' : newEnquiriesCount}</strong>
                    </div>
                    <span className="status-track">
                      <span className="status-fill status-fill--new" style={{ width: `${newPercent}%` }} />
                    </span>
                  </div>
                  <div className="status-summary-item">
                    <div className="status-summary-label">
                      <span className="status-dot status-dot--contacted" />
                      Contacted
                      <strong>{loading ? '—' : contactedEnquiriesCount}</strong>
                    </div>
                    <span className="status-track">
                      <span className="status-fill status-fill--contacted" style={{ width: `${contactedPercent}%` }} />
                    </span>
                  </div>
                  <div className="status-summary-item">
                    <div className="status-summary-label">
                      <span className="status-dot status-dot--closed" />
                      Closed
                      <strong>{loading ? '—' : closedEnquiriesCount}</strong>
                    </div>
                    <span className="status-track">
                      <span className="status-fill status-fill--closed" style={{ width: `${closedPercent}%` }} />
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {toast && (
        <div className="dashboard-toast" role="status">
          <Check aria-hidden="true" />
          <span>{toast}</span>
          <button aria-label="Dismiss message" onClick={() => setToast('')} type="button">
            <X aria-hidden="true" />
          </button>
        </div>
      )}

      {selectedEnquiry && (
        <div className="dialog-backdrop" onClick={() => setSelectedEnquiry(null)}>
          <section
            aria-labelledby="enquiry-dialog-title"
            aria-modal="true"
            className="enquiry-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="dialog-heading">
              <div>
                <p className="dialog-reference">#{selectedEnquiry.ref}</p>
                <h2 id="enquiry-dialog-title">Enquiry details</h2>
              </div>
              <button
                aria-label="Close enquiry details"
                className="dialog-close"
                onClick={() => setSelectedEnquiry(null)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <dl className="enquiry-details-list">
              <div><dt>Customer</dt><dd>{selectedEnquiry.customer}</dd></div>
              <div><dt>Company</dt><dd>{selectedEnquiry.company}</dd></div>
              <div><dt>Product</dt><dd>{selectedEnquiry.product}</dd></div>
              <div><dt>Received</dt><dd>{selectedEnquiry.date}</dd></div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={`status-badge status-badge--${(selectedEnquiry.status || '').toLowerCase().replace('-', '')}`}>
                    {selectedEnquiry.status}
                  </span>
                </dd>
              </div>
              {selectedEnquiry.email && (
                <div><dt>Email</dt><dd>{selectedEnquiry.email}</dd></div>
              )}
              {selectedEnquiry.phone && (
                <div><dt>Phone</dt><dd>{selectedEnquiry.phone}</dd></div>
              )}
              {selectedEnquiry.message && (
                <div><dt>Message</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{selectedEnquiry.message}</dd></div>
              )}
            </dl>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              {selectedEnquiry.status !== 'Contacted' && selectedEnquiry.status !== 'Closed' && (
                <button
                  className="dialog-primary-button"
                  onClick={() => markContacted(selectedEnquiry.ref, selectedEnquiry.id)}
                  type="button"
                >
                  Mark as Contacted
                </button>
              )}
              <button
                className="view-enquiry-button"
                onClick={() => {
                  setSelectedEnquiry(null);
                  onNavigate?.('Enquiries');
                }}
                type="button"
              >
                Open in Enquiries Page
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Create Report Dialog */}
      <CreateReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onGenerate={handleGenerateReport}
        liveMetrics={{
          productsCount,
          categoriesCount: totalCategoriesCount,
          enquiriesCount: totalEnquiriesCount,
        }}
      />
    </div>
  );
}

export default DashboardPage;
