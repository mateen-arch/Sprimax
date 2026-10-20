import { useState, useMemo, useRef } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  Monitor,
  Pause,
  Pencil,
  Play,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import ImageUploader from './components/ImageUploader.jsx';
import './BannerManagementPage.css';

const INITIAL_BANNERS = [
  {
    id: 'b-1',
    title: 'Q3 Heavy Duty Sale',
    heading: 'Next-Gen Welding Solutions',
    supportingText:
      'Discover our new line of automated arc welders designed for heavy industrial applications.',
    ctaLabel: 'Explore Products',
    ctaDestination: '/products/automated-welders',
    desktopImage:
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=640&q=80',
    desktopAlt: 'Automated robotic welding arm in operation',
    mobileImage:
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=480&q=80',
    mobileAlt: 'Close up of welding arc',
    placement: 'Homepage Hero',
    schedule: 'Sep 1 - Sep 30, 2023',
    sortOrder: '1',
    status: 'Active',
  },
  {
    id: 'b-2',
    title: 'New Safety Gear (Mobile Only)',
    heading: 'Advanced Personal Protection',
    supportingText:
      'Engineered for extreme welding environments and maximum safety standard compliance.',
    ctaLabel: 'View Safety Catalog',
    ctaDestination: '/category/safety-gear',
    desktopImage: null,
    desktopAlt: '',
    mobileImage:
      'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=480&q=80',
    mobileAlt: 'Safety helmet and respirator gear',
    placement: 'Sidebar Ad',
    schedule: 'Oct 1 - Oct 31, 2023',
    sortOrder: '2',
    status: 'Scheduled',
  },
  {
    id: 'b-3',
    title: 'Summer Clearance',
    heading: 'Mid-Year Warehouse Clearance',
    supportingText:
      'Exclusive industrial discounts on MIG wires, electrodes, and plasma cutters.',
    ctaLabel: 'Shop Deals',
    ctaDestination: '/promotions/summer-clearance',
    desktopImage:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=640&q=80',
    desktopAlt: 'Warehouse machinery and consumables',
    mobileImage:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=480&q=80',
    mobileAlt: 'Industrial supplies and tools',
    placement: 'Homepage Hero',
    schedule: 'Jun 1 - Aug 31, 2023',
    sortOrder: '-',
    status: 'Inactive',
  },
];

export default function BannerManagementPage({ onLogout, onNavigate }) {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'edit'
  const [banners, setBanners] = useState(INITIAL_BANNERS);

  // Filters
  const [placementFilter, setPlacementFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Editor Form State
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formHeading, setFormHeading] = useState('Next-Gen Welding Solutions');
  const [formSupportingText, setFormSupportingText] = useState(
    'Discover our new line of automated arc welders designed for heavy industrial applications.'
  );
  const [formCtaLabel, setFormCtaLabel] = useState('Explore Products');
  const [formCtaDestination, setFormCtaDestination] = useState(
    '/products/automated-welders'
  );
  const [formDesktopImage, setFormDesktopImage] = useState(
    'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=640&q=80'
  );
  const [formDesktopAlt, setFormDesktopAlt] = useState(
    'Automated robotic welding arm in operation'
  );
  const [formMobileImage, setFormMobileImage] = useState(
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=480&q=80'
  );
  const [formMobileAlt, setFormMobileAlt] = useState('Close up of welding arc');
  const [formSortOrder, setFormSortOrder] = useState('1');
  const [formStatus, setFormStatus] = useState(true); // true = Active, false = Inactive
  const [formPlacement, setFormPlacement] = useState('Homepage Hero');

  // Preview Mode in Editor: 'desktop' | 'mobile'
  const [previewDevice, setPreviewDevice] = useState('desktop');

  // Preview Modal for List View
  const [quickPreviewBanner, setQuickPreviewBanner] = useState(null);

  // File Inputs
  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filtered List
  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      const matchPlacement =
        placementFilter === 'All' || b.placement === placementFilter;
      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      const matchSearch =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.heading.toLowerCase().includes(searchQuery.toLowerCase());
      return matchPlacement && matchStatus && matchSearch;
    });
  }, [banners, placementFilter, statusFilter, searchQuery]);

  // Open Create Mode
  const handleOpenCreate = () => {
    setEditingBannerId(null);
    setFormTitle('New Promotional Banner');
    setFormHeading('');
    setFormSupportingText('');
    setFormCtaLabel('Explore Products');
    setFormCtaDestination('/products');
    setFormDesktopImage(
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=640&q=80'
    );
    setFormDesktopAlt('');
    setFormMobileImage(
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=480&q=80'
    );
    setFormMobileAlt('');
    setFormSortOrder('1');
    setFormStatus(true);
    setFormPlacement('Homepage Hero');
    setPreviewDevice('desktop');
    setViewMode('edit');
  };

  // Open Edit Mode
  const handleOpenEdit = (b) => {
    setEditingBannerId(b.id);
    setFormTitle(b.title);
    setFormHeading(b.heading);
    setFormSupportingText(b.supportingText);
    setFormCtaLabel(b.ctaLabel);
    setFormCtaDestination(b.ctaDestination);
    setFormDesktopImage(b.desktopImage);
    setFormDesktopAlt(b.desktopAlt);
    setFormMobileImage(b.mobileImage);
    setFormMobileAlt(b.mobileAlt);
    setFormSortOrder(b.sortOrder === '-' ? '0' : b.sortOrder);
    setFormStatus(b.status === 'Active');
    setFormPlacement(b.placement);
    setPreviewDevice(b.desktopImage ? 'desktop' : 'mobile');
    setViewMode('edit');
  };

  // Toggle status in list row
  const handleToggleBannerStatus = (id) => {
    setBanners((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const next = b.status === 'Active' ? 'Inactive' : 'Active';
          return { ...b, status: next };
        }
        return b;
      })
    );
    showToast('Banner status updated');
  };

  // Delete banner
  const handleDeleteBanner = (id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    showToast('Banner deleted');
  };

  // Save Banner Form
  const handleSaveBanner = (e) => {
    e?.preventDefault();
    if (editingBannerId) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingBannerId
            ? {
                ...b,
                title: formTitle || formHeading || 'Promotional Banner',
                heading: formHeading,
                supportingText: formSupportingText,
                ctaLabel: formCtaLabel,
                ctaDestination: formCtaDestination,
                desktopImage: formDesktopImage,
                desktopAlt: formDesktopAlt,
                mobileImage: formMobileImage,
                mobileAlt: formMobileAlt,
                sortOrder: formSortOrder || '1',
                status: formStatus ? 'Active' : 'Inactive',
                placement: formPlacement,
              }
            : b
        )
      );
      showToast('Banner updated successfully');
    } else {
      const newBanner = {
        id: `b-${Date.now()}`,
        title: formTitle || formHeading || 'New Promotional Banner',
        heading: formHeading || 'Special Offer',
        supportingText: formSupportingText,
        ctaLabel: formCtaLabel,
        ctaDestination: formCtaDestination,
        desktopImage: formDesktopImage,
        desktopAlt: formDesktopAlt,
        mobileImage: formMobileImage,
        mobileAlt: formMobileAlt,
        placement: formPlacement,
        schedule: 'Now - Continuous',
        sortOrder: formSortOrder || '1',
        status: formStatus ? 'Active' : 'Inactive',
      };
      setBanners((prev) => [newBanner, ...prev]);
      showToast('Banner created successfully');
    }
    setViewMode('list');
  };

  // Image Upload Handlers
  const handleUploadDesktop = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormDesktopImage(URL.createObjectURL(file));
      showToast('Desktop image uploaded');
    }
  };

  const handleUploadMobile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormMobileImage(URL.createObjectURL(file));
      showToast('Mobile image uploaded');
    }
  };

  return (
    <div className="banner-mgmt-container">
      {/* Sticky Sidebar */}
      <AdminSidebar
        currentNav="Banner Management"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      {/* Main Shell */}
      <div className="banner-mgmt-main-shell">
        <AdminTopbar title="Management" onNavigate={onNavigate} />

        {viewMode === 'list' ? (
          /* ================================================================
             LIST VIEW
             ================================================================ */
          <main className="banner-mgmt-content">
            {/* Header Row */}
            <div className="banner-mgmt-header-row">
              <div>
                <h1 className="banner-mgmt-title">Banner Management</h1>
                <p className="banner-mgmt-subtitle">
                  Manage homepage and section promotional banners.
                </p>
              </div>
              <button
                type="button"
                className="btn-add-banner"
                onClick={handleOpenCreate}
              >
                <Plus aria-hidden="true" />
                <span>Add Banner</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="banner-filter-card">
              <div className="banner-filter-left-group">
                <div className="banner-select-shell">
                  <select
                    className="banner-filter-select"
                    value={placementFilter}
                    onChange={(e) => setPlacementFilter(e.target.value)}
                    aria-label="Filter by placement"
                  >
                    <option value="All">All Placements</option>
                    <option value="Homepage Hero">Homepage Hero</option>
                    <option value="Sidebar Ad">Sidebar Ad</option>
                    <option value="Category Banner">Category Banner</option>
                  </select>
                  <ChevronDown className="banner-select-chevron" aria-hidden="true" />
                </div>

                <div className="banner-select-shell">
                  <select
                    className="banner-filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by status"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="banner-select-chevron" aria-hidden="true" />
                </div>
              </div>

              <div className="banner-search-shell">
                <Search className="banner-search-icon" aria-hidden="true" />
                <input
                  type="text"
                  className="banner-search-input"
                  placeholder="Search banners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="banner-table-card">
              <table className="banner-table">
                <thead>
                  <tr>
                    <th>Desktop/Mobile Preview</th>
                    <th>Banner Title</th>
                    <th>Placement</th>
                    <th>Schedule</th>
                    <th>Sort Order</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right', paddingRight: '28px' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanners.map((b) => (
                    <tr key={b.id} className="banner-table-row">
                      {/* Dual Preview Thumbnail */}
                      <td>
                        <div className="banner-dual-preview-cell">
                          {/* Desktop Thumbnail */}
                          <div className="thumb-preview-wrapper thumb-preview-desktop">
                            {b.desktopImage ? (
                              <img
                                src={b.desktopImage}
                                alt={b.desktopAlt || b.title}
                                className="thumb-preview-img"
                              />
                            ) : (
                              <div className="thumb-preview-empty">
                                <ImageIcon aria-hidden="true" />
                              </div>
                            )}
                            <div className="thumb-device-badge">
                              <Monitor aria-hidden="true" />
                            </div>
                          </div>

                          {/* Mobile Thumbnail */}
                          <div className="thumb-preview-wrapper thumb-preview-mobile">
                            {b.mobileImage ? (
                              <img
                                src={b.mobileImage}
                                alt={b.mobileAlt || b.title}
                                className="thumb-preview-img"
                              />
                            ) : (
                              <div className="thumb-preview-empty">
                                <ImageIcon aria-hidden="true" />
                              </div>
                            )}
                            <div className="thumb-device-badge">
                              <Smartphone aria-hidden="true" />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Banner Title */}
                      <td>
                        <span className="banner-title-text">{b.title}</span>
                      </td>

                      {/* Placement */}
                      <td>
                        <span className="banner-placement-text">{b.placement}</span>
                      </td>

                      {/* Schedule */}
                      <td>
                        <span className="banner-schedule-text">{b.schedule}</span>
                      </td>

                      {/* Sort Order */}
                      <td>
                        <span className="banner-sort-text">{b.sortOrder}</span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`banner-status-pill ${
                            b.status === 'Active'
                              ? 'banner-status-pill--active'
                              : b.status === 'Scheduled'
                              ? 'banner-status-pill--scheduled'
                              : 'banner-status-pill--inactive'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Row Action Buttons */}
                      <td>
                        <div className="banner-row-actions-group">
                          <button
                            type="button"
                            className="banner-icon-action-btn"
                            title="Edit Banner"
                            onClick={() => handleOpenEdit(b)}
                          >
                            <Pencil aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            className="banner-icon-action-btn"
                            title="Preview Banner"
                            onClick={() => setQuickPreviewBanner(b)}
                          >
                            <Eye aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            className="banner-icon-action-btn"
                            title={
                              b.status === 'Active'
                                ? 'Pause Banner'
                                : 'Activate Banner'
                            }
                            onClick={() => handleToggleBannerStatus(b.id)}
                          >
                            {b.status === 'Active' ? (
                              <Pause aria-hidden="true" />
                            ) : (
                              <Play aria-hidden="true" />
                            )}
                          </button>

                          <button
                            type="button"
                            className="banner-icon-action-btn banner-icon-action-btn--delete"
                            title="Delete Banner"
                            onClick={() => handleDeleteBanner(b.id)}
                          >
                            <Trash2 aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table Footer */}
              <div className="banner-table-footer">
                <span className="banner-entries-count">
                  Showing 1 to {filteredBanners.length} of {banners.length} entries
                </span>
                <div className="banner-pagination-group">
                  <button
                    type="button"
                    className="banner-page-btn"
                    disabled
                    aria-label="Previous page"
                  >
                    <ChevronLeft aria-hidden="true" />
                  </button>
                  <button type="button" className="banner-page-btn active">
                    1
                  </button>
                  <button type="button" className="banner-page-btn">
                    2
                  </button>
                  <button type="button" className="banner-page-btn">
                    3
                  </button>
                  <button
                    type="button"
                    className="banner-page-btn"
                    aria-label="Next page"
                  >
                    <ChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </main>
        ) : (
          /* ================================================================
             EDIT / CREATE BANNER SCREEN
             ================================================================ */
          <main className="banner-mgmt-content">
            {/* Breadcrumbs */}
            <div className="banner-edit-breadcrumbs">
              <span
                className="banner-breadcrumb-item"
                onClick={() => setViewMode('list')}
              >
                Content
              </span>
              <span className="banner-breadcrumb-sep">&gt;</span>
              <span
                className="banner-breadcrumb-item"
                onClick={() => setViewMode('list')}
              >
                Banners
              </span>
              <span className="banner-breadcrumb-sep">&gt;</span>
              <span className="banner-breadcrumb-active">
                {editingBannerId ? 'Edit' : 'Add New'}
              </span>
            </div>

            {/* Title Row */}
            <div className="banner-edit-top-row">
              <div className="banner-edit-title-cluster">
                <h1 className="banner-edit-title">
                  {editingBannerId ? 'Edit Banner' : 'Create Banner'}
                </h1>
                <span
                  className={`banner-status-pill ${
                    formStatus
                      ? 'banner-status-pill--active'
                      : 'banner-status-pill--inactive'
                  }`}
                >
                  {formStatus ? 'Active' : 'Inactive'}
                </span>
              </div>

              <button
                type="button"
                className="btn-preview-browser"
                onClick={() =>
                  window.open('/', '_blank', 'noopener,noreferrer')
                }
              >
                <ExternalLink aria-hidden="true" />
                <span>Preview in Browser</span>
              </button>
            </div>

            {/* 2-Column Editor Grid */}
            <div className="banner-editor-grid">
              {/* Left Column: Form Cards */}
              <div className="banner-editor-left-col">
                {/* Card 1: Banner Content */}
                <div className="banner-section-card">
                  <div className="banner-section-header">
                    <Type className="banner-section-icon" aria-hidden="true" />
                    <h2 className="banner-section-title">Banner Content</h2>
                  </div>

                  <div className="banner-form-group">
                    <label className="banner-form-label">Heading</label>
                    <input
                      type="text"
                      className="banner-input-text"
                      placeholder="e.g. Next-Gen Welding Solutions"
                      value={formHeading}
                      onChange={(e) => setFormHeading(e.target.value)}
                    />
                  </div>

                  <div className="banner-form-group">
                    <label className="banner-form-label">Supporting Text</label>
                    <textarea
                      className="banner-textarea"
                      placeholder="Discover our new line of automated arc welders..."
                      value={formSupportingText}
                      onChange={(e) => setFormSupportingText(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="banner-split-row">
                    <div className="banner-form-group">
                      <label className="banner-form-label">CTA Label</label>
                      <input
                        type="text"
                        className="banner-input-text"
                        placeholder="Explore Products"
                        value={formCtaLabel}
                        onChange={(e) => setFormCtaLabel(e.target.value)}
                      />
                    </div>

                    <div className="banner-form-group">
                      <label className="banner-form-label">CTA Destination</label>
                      <div className="banner-input-icon-shell">
                        <LinkIcon
                          className="banner-input-prefix-icon"
                          aria-hidden="true"
                        />
                        <input
                          type="text"
                          className="banner-input-text banner-input-text--with-icon"
                          placeholder="/products/automated-welders"
                          value={formCtaDestination}
                          onChange={(e) =>
                            setFormCtaDestination(e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Media Assets */}
                <div className="banner-section-card">
                  <div className="banner-section-header">
                    <ImageIcon className="banner-section-icon" aria-hidden="true" />
                    <h2 className="banner-section-title">Media Assets</h2>
                  </div>

                  {/* Desktop Image Block */}
                  <div className="media-asset-item" style={{ marginBottom: '1.25rem' }}>
                    <ImageUploader
                      label="Desktop Image (Cloudinary)"
                      helpText="(16:9 ratio, min 1920x1080px, max 5MB)"
                      value={formDesktopImage}
                      onChange={setFormDesktopImage}
                      altText={formDesktopAlt}
                      onAltChange={setFormDesktopAlt}
                      showAltInput={true}
                      folder="sprimax/banners"
                    />
                  </div>

                  <div className="media-asset-divider" style={{ margin: '1rem 0' }} />

                  {/* Mobile Image Block */}
                  <div className="media-asset-item">
                    <ImageUploader
                      label="Mobile Image (Cloudinary)"
                      helpText="(9:16 ratio, min 1080x1920px, max 5MB)"
                      value={formMobileImage}
                      onChange={setFormMobileImage}
                      altText={formMobileAlt}
                      onAltChange={setFormMobileAlt}
                      showAltInput={true}
                      folder="sprimax/banners"
                    />
                  </div>
                </div>

                {/* Card 3: Display Settings */}
                <div className="banner-section-card">
                  <div className="banner-section-header">
                    <SlidersHorizontal
                      className="banner-section-icon"
                      aria-hidden="true"
                    />
                    <h2 className="banner-section-title">Display Settings</h2>
                  </div>

                  <div className="display-settings-row">
                    <div className="display-setting-block">
                      <span className="display-setting-title">Sort Order</span>
                      <p className="display-setting-hint">
                        Lower numbers appear first in the carousel.
                      </p>
                      <input
                        type="number"
                        className="display-sort-input"
                        value={formSortOrder}
                        onChange={(e) => setFormSortOrder(e.target.value)}
                      />
                    </div>

                    <div className="display-setting-block">
                      <span className="display-setting-title">Status</span>
                      <p className="display-setting-hint">
                        Toggle visibility on the live site.
                      </p>
                      <div className="display-status-toggle-shell">
                        <label className="ind-toggle-switch">
                          <input
                            type="checkbox"
                            checked={formStatus}
                            onChange={(e) => setFormStatus(e.target.checked)}
                          />
                          <span className="ind-toggle-slider" />
                        </label>
                        <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
                          {formStatus ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Preview Card */}
              <div className="banner-editor-right-col">
                <div className="live-preview-card">
                  <div className="live-preview-header">
                    <div className="live-preview-header-left">
                      <Eye className="live-preview-eye-icon" aria-hidden="true" />
                      <h3 className="live-preview-title">Live Preview</h3>
                    </div>

                    <div className="live-preview-device-tabs">
                      <button
                        type="button"
                        className={`btn-device-tab ${
                          previewDevice === 'desktop' ? 'active' : ''
                        }`}
                        onClick={() => setPreviewDevice('desktop')}
                      >
                        <Monitor aria-hidden="true" />
                        <span>Desktop</span>
                      </button>
                      <button
                        type="button"
                        className={`btn-device-tab ${
                          previewDevice === 'mobile' ? 'active' : ''
                        }`}
                        onClick={() => setPreviewDevice('mobile')}
                      >
                        <Smartphone aria-hidden="true" />
                        <span>Mobile</span>
                      </button>
                    </div>
                  </div>

                  {/* Render Mockup Container */}
                  <div
                    className={`live-preview-frame ${
                      previewDevice === 'desktop'
                        ? 'live-preview-frame--desktop'
                        : 'live-preview-frame--mobile'
                    }`}
                  >
                    {/* Background Image */}
                    {(previewDevice === 'desktop'
                      ? formDesktopImage
                      : formMobileImage) && (
                      <img
                        src={
                          previewDevice === 'desktop'
                            ? formDesktopImage
                            : formMobileImage
                        }
                        alt="Live banner preview"
                        className="live-preview-bg-image"
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className="live-preview-gradient-overlay" />

                    {/* Content Overlay */}
                    <div className="live-preview-content-overlay">
                      <h4 className="live-preview-heading">
                        {formHeading || 'Banner Heading Goes Here'}
                      </h4>
                      {formSupportingText && (
                        <p className="live-preview-support-text">
                          {formSupportingText}
                        </p>
                      )}
                      {formCtaLabel && (
                        <button type="button" className="live-preview-cta-btn">
                          {formCtaLabel}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notice Info Callout */}
                  <div className="live-preview-info-callout">
                    <Info className="live-preview-info-icon" aria-hidden="true" />
                    <p className="live-preview-info-text">
                      The preview shows approximate rendering. Actual appearance
                      may vary slightly based on screen resolution and browser
                      viewport.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Fixed Action Bar */}
            <div className="banner-bottom-bar">
              <button
                type="button"
                className="btn-discard-changes"
                onClick={() => setViewMode('list')}
              >
                Discard Changes
              </button>
              <button
                type="button"
                className="btn-save-banner"
                onClick={handleSaveBanner}
              >
                <Save aria-hidden="true" />
                <span>Save Banner</span>
              </button>
            </div>
          </main>
        )}
      </div>

      {/* Quick Preview Modal for List View */}
      {quickPreviewBanner && (
        <div
          className="ind-modal-overlay"
          onClick={() => setQuickPreviewBanner(null)}
        >
          <div
            className="ind-modal-box"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ind-modal-header">
              <h3 className="ind-modal-title">{quickPreviewBanner.title}</h3>
              <button
                type="button"
                className="ind-modal-close-btn"
                onClick={() => setQuickPreviewBanner(null)}
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <div
                className="live-preview-frame live-preview-frame--desktop"
                style={{ margin: 0 }}
              >
                {quickPreviewBanner.desktopImage && (
                  <img
                    src={quickPreviewBanner.desktopImage}
                    alt={quickPreviewBanner.title}
                    className="live-preview-bg-image"
                  />
                )}
                <div className="live-preview-gradient-overlay" />
                <div className="live-preview-content-overlay">
                  <h4 className="live-preview-heading">
                    {quickPreviewBanner.heading}
                  </h4>
                  <p className="live-preview-support-text">
                    {quickPreviewBanner.supportingText}
                  </p>
                  <button type="button" className="live-preview-cta-btn">
                    {quickPreviewBanner.ctaLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="banner-toast">
          <CheckCircle2 className="banner-toast-icon" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
