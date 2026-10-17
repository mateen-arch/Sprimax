import { useState, useRef } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Contact2,
  Globe,
  LayoutTemplate,
  Mail,
  MessagesSquare,
  Pencil,
  Plus,
  Share2,
  ShieldAlert,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import './GlobalSettingsPage.css';

const TABS = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'contact', label: 'Contact', icon: Contact2 },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'enquiry', label: 'Enquiry', icon: MessagesSquare },
  { id: 'seo', label: 'SEO & Analytics', icon: TrendingUp },
  { id: 'footer', label: 'Footer', icon: LayoutTemplate },
];

const INITIAL_HOURS = [
  { day: 'Monday', open: true, from: '09:00 AM', to: '05:00 PM' },
  { day: 'Tuesday', open: true, from: '09:00 AM', to: '05:00 PM' },
  { day: 'Wednesday', open: true, from: '09:00 AM', to: '05:00 PM' },
  { day: 'Thursday', open: true, from: '09:00 AM', to: '05:00 PM' },
  { day: 'Friday', open: true, from: '09:00 AM', to: '05:00 PM' },
  { day: 'Saturday', open: false, from: '09:00 AM', to: '01:00 PM' },
  { day: 'Sunday', open: false, from: '09:00 AM', to: '01:00 PM' },
];

const TIME_OPTIONS = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '12:00 PM',
  '01:00 PM',
  '04:00 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
];

export default function GlobalSettingsPage({ onLogout, onNavigate }) {
  const [activeTab, setActiveTab] = useState('company');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

  // Tab 1: Company
  const [companyName, setCompanyName] = useState('WeldTech Industrial');
  const [tradingAs, setTradingAs] = useState('WeldTech');
  const [shortDescription, setShortDescription] = useState(
    'Leading provider of heavy manufacturing equipment and industrial supply chain solutions.'
  );
  const [companyLogo, setCompanyLogo] = useState('/logo.png');

  // Tab 2: Contact
  const [primaryPhone, setPrimaryPhone] = useState('+1 (555) 123-4567');
  const [additionalPhone, setAdditionalPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('+15551234567');
  const [primaryEmail, setPrimaryEmail] = useState('info@weldtech.com');
  const [salesEmail, setSalesEmail] = useState('sales@weldtech.com');
  const [supportEmail, setSupportEmail] = useState('support@weldtech.com');
  const [addressLabel, setAddressLabel] = useState('Headquarters');
  const [fullAddress, setFullAddress] = useState(
    '123 Industrial Way, Manufacturing District'
  );
  const [city, setCity] = useState('Chicago');
  const [stateProvince, setStateProvince] = useState('IL');
  const [country, setCountry] = useState('United States');
  const [postalCode, setPostalCode] = useState('60601');
  const [mapUrl, setMapUrl] = useState('https://goo.gl/maps/...');
  const [businessHours, setBusinessHours] = useState(INITIAL_HOURS);

  // Tab 3: Social Profiles
  const [socialProfiles, setSocialProfiles] = useState([
    {
      id: 's-1',
      platform: 'LinkedIn',
      url: 'https://linkedin.com/company/weldtech-industrial',
    },
    {
      id: 's-2',
      platform: 'LinkedIn',
      url: 'https://...',
    },
  ]);

  // Tab 4: Enquiry
  const [recipients, setRecipients] = useState([
    { id: 'r-1', email: 'sales@weldtech.com', notifyProduct: true, notifySupport: true },
    { id: 'r-2', email: 'admin@weldtech.com', notifyProduct: true, notifySupport: false },
  ]);
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newRecipientPrefProduct, setNewRecipientPrefProduct] = useState(false);
  const [newRecipientPrefSupport, setNewRecipientPrefSupport] = useState(false);

  const [whatsappTemplate, setWhatsappTemplate] = useState(
    'Hello, I am interested in the {product_name} (Code: {product_code}). Could you please provide more details?'
  );
  const [responseSuccessMessage, setResponseSuccessMessage] = useState(
    'Thank you for your enquiry! Our team will get back to you within 24 business hours.'
  );

  // Tab 5: SEO & Analytics
  const [metaTitle, setMetaTitle] = useState(
    'WeldTech Industrial | Heavy Manufacturing & Industrial Solutions'
  );
  const [metaDescription, setMetaDescription] = useState(
    'Leading provider of heavy manufacturing equipment and industrial supply chain solutions. Quality welding and industrial tools for global markets.'
  );
  const [canonicalUrl, setCanonicalUrl] = useState('https://weldtech-industrial.com');
  const [gaEnabled, setGaEnabled] = useState(true);
  const [gaMeasurementId, setGaMeasurementId] = useState('G-XXXXXXXXXX');
  const [gscEnabled, setGscEnabled] = useState(false);
  const [gscPropertyId, setGscPropertyId] = useState('');

  // Tab 6: Footer
  const [footerSummary, setFooterSummary] = useState(
    'Sprimax is a leading provider of heavy manufacturing equipment and industrial supply chain solutions, committed to engineering excellence since 1992.'
  );
  const [copyrightText, setCopyrightText] = useState(
    '© 2026 Sprimax. All rights reserved.'
  );

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Business Hours handlers
  const handleToggleDayOpen = (dayIndex) => {
    setBusinessHours((prev) =>
      prev.map((item, idx) =>
        idx === dayIndex ? { ...item, open: !item.open } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleChangeTime = (dayIndex, field, value) => {
    setBusinessHours((prev) =>
      prev.map((item, idx) =>
        idx === dayIndex ? { ...item, [field]: value } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  // Social handlers
  const handleAddSocialProfile = () => {
    setSocialProfiles((prev) => [
      ...prev,
      { id: `s-${Date.now()}`, platform: 'LinkedIn', url: '' },
    ]);
    setHasUnsavedChanges(true);
  };

  const handleRemoveSocialProfile = (id) => {
    setSocialProfiles((prev) => prev.filter((item) => item.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleUpdateSocial = (id, field, value) => {
    setSocialProfiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setHasUnsavedChanges(true);
  };

  // Enquiry recipient handlers
  const handleOpenAddRecipient = () => {
    setNewRecipientEmail('');
    setNewRecipientPrefProduct(false);
    setNewRecipientPrefSupport(false);
    setIsRecipientModalOpen(true);
  };

  const handleAddRecipientSubmit = (e) => {
    e.preventDefault();
    if (!newRecipientEmail.trim()) return;

    setRecipients((prev) => [
      ...prev,
      {
        id: `r-${Date.now()}`,
        email: newRecipientEmail.trim(),
        notifyProduct: newRecipientPrefProduct,
        notifySupport: newRecipientPrefSupport,
      },
    ]);
    setIsRecipientModalOpen(false);
    setHasUnsavedChanges(true);
    showToast('Recipient added');
  };

  const handleRemoveRecipient = (id) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    setHasUnsavedChanges(true);
    showToast('Recipient removed');
  };

  const handleUploadLogo = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyLogo(URL.createObjectURL(file));
      setHasUnsavedChanges(true);
      showToast('Logo updated');
    }
  };

  const handleSaveSettings = () => {
    setHasUnsavedChanges(false);
    showToast('Settings saved successfully');
  };

  const handleDiscardChanges = () => {
    setCompanyName('WeldTech Industrial');
    setTradingAs('WeldTech');
    setShortDescription(
      'Leading provider of heavy manufacturing equipment and industrial supply chain solutions.'
    );
    setBusinessHours(INITIAL_HOURS);
    setHasUnsavedChanges(false);
    showToast('Changes discarded');
  };

  return (
    <div className="settings-page-container">
      {/* Static Sticky Sidebar */}
      <AdminSidebar
        currentNav="Global Settings"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      {/* Main Shell */}
      <div className="settings-main-shell">
        <AdminTopbar title="Global Settings" onNavigate={onNavigate} />

        <main className="settings-content">
          {/* Header */}
          <div className="settings-header-cluster">
            <h1 className="settings-title">Global Settings</h1>
            <p className="settings-subtitle">
              Manage fundamental company information and platform preferences.
            </p>
          </div>

          {/* 2-Column Layout */}
          <div className="settings-layout-grid">
            {/* Left Navigation Card */}
            <aside className="settings-nav-card" aria-label="Settings categories">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`settings-nav-btn ${activeTab === id ? 'active' : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </aside>

            {/* Right Form Card / Cards Stack */}
            <div className="settings-content-col">
              {/* ============================================================
                  TAB 1: COMPANY PROFILE
                  ============================================================ */}
              {activeTab === 'company' && (
                <section className="settings-form-card">
                  <div className="settings-card-header">
                    <h2 className="settings-card-title">Company Profile</h2>
                    <p className="settings-card-subtitle">
                      Core identity details displayed across the platform and invoices.
                    </p>
                  </div>

                  <div className="settings-split-row">
                    <div className="settings-field-group">
                      <label className="settings-field-label">
                        Company Name <span className="required-star">*</span>
                      </label>
                      <input
                        type="text"
                        className="settings-text-input"
                        value={companyName}
                        onChange={(e) => {
                          setCompanyName(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="settings-field-group">
                      <label className="settings-field-label">
                        Trading As (Optional)
                      </label>
                      <input
                        type="text"
                        className="settings-text-input"
                        value={tradingAs}
                        onChange={(e) => {
                          setTradingAs(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="settings-field-group">
                    <label className="settings-field-label">Short Description</label>
                    <textarea
                      className="settings-textarea"
                      value={shortDescription}
                      maxLength={160}
                      onChange={(e) => {
                        setShortDescription(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      rows={3}
                    />
                    <div className="settings-char-counter">
                      {shortDescription.length} / 160 characters
                    </div>
                  </div>

                  {/* Media Upload Cards */}
                  <div className="settings-media-cards-grid">
                    {/* Logo Card */}
                    <div
                      className="settings-upload-dropzone"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={logoInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleUploadLogo}
                      />
                      <div className="settings-media-preview-box">
                        <img
                          src={companyLogo}
                          alt="Company Logo Preview"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="settings-media-card-title">Company Logo</span>
                      <span className="settings-media-card-specs">
                        PNG or SVG, max 2MB
                      </span>
                    </div>

                    {/* Favicon Card */}
                    <div
                      className="settings-upload-dropzone"
                      onClick={() => faviconInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={faviconInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                      />
                      <div className="settings-favicon-preview-box">
                        <Globe aria-hidden="true" />
                      </div>
                      <span className="settings-media-card-title">Favicon</span>
                      <span className="settings-media-card-specs">
                        32x32px ICO or PNG
                      </span>
                    </div>
                  </div>
                </section>
              )}

              {/* ============================================================
                  TAB 2: CONTACT INFORMATION
                  ============================================================ */}
              {activeTab === 'contact' && (
                <section className="settings-form-card">
                  <div className="settings-card-header">
                    <h2 className="settings-card-title">Contact Information</h2>
                    <p className="settings-card-subtitle">
                      Manage how customers reach your business across different channels.
                    </p>
                  </div>

                  {/* Section 1: Phone & Messaging */}
                  <div className="settings-group-heading">Phone & Messaging</div>

                  <div className="settings-split-row">
                    <div className="settings-field-group">
                      <label className="settings-field-label">Primary Phone</label>
                      <input
                        type="text"
                        className="settings-text-input"
                        value={primaryPhone}
                        onChange={(e) => {
                          setPrimaryPhone(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="settings-field-group">
                      <label className="settings-field-label">Additional Phone</label>
                      <input
                        type="text"
                        className="settings-text-input"
                        placeholder="e.g. +1 (555) 987-6543"
                        value={additionalPhone}
                        onChange={(e) => {
                          setAdditionalPhone(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="settings-split-row">
                    <div className="settings-field-group">
                      <label className="settings-field-label">WhatsApp Number</label>
                      <input
                        type="text"
                        className="settings-text-input"
                        value={whatsappNumber}
                        onChange={(e) => {
                          setWhatsappNumber(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div />
                  </div>

                  {/* Section 2: Email Addresses */}
                  <div className="settings-group-heading">Email Addresses</div>

                  <div className="settings-triple-row">
                    <div className="settings-field-group">
                      <label className="settings-field-label">Primary Email</label>
                      <input
                        type="email"
                        className="settings-text-input"
                        value={primaryEmail}
                        onChange={(e) => {
                          setPrimaryEmail(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="settings-field-group">
                      <label className="settings-field-label">Sales Email</label>
                      <input
                        type="email"
                        className="settings-text-input"
                        value={salesEmail}
                        onChange={(e) => {
                          setSalesEmail(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="settings-field-group">
                      <label className="settings-field-label">Support Email</label>
                      <input
                        type="email"
                        className="settings-text-input"
                        value={supportEmail}
                        onChange={(e) => {
                          setSupportEmail(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  {/* Section 3: Physical Address */}
                  <div className="settings-group-heading">Physical Address</div>

                  <div className="settings-split-row">
                    <div className="settings-field-group">
                      <label className="settings-field-label">Address Label</label>
                      <input
                        type="text"
                        className="settings-text-input"
                        value={addressLabel}
                        onChange={(e) => {
                          setAddressLabel(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div />
                  </div>

                  <div className="settings-field-group">
                    <label className="settings-field-label">Full Address</label>
                    <input
                      type="text"
                      className="settings-text-input"
                      value={fullAddress}
                      onChange={(e) => {
                        setFullAddress(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>

                  <div className="settings-split-row">
                    <div className="settings-field-group">
                      <label className="settings-field-label">City</label>
                      <input
                        type="text"
                        className="settings-text-input"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="settings-field-group">
                      <label className="settings-field-label">State / Province</label>
                      <input
                        type="text"
                        className="settings-text-input"
                        value={stateProvince}
                        onChange={(e) => {
                          setStateProvince(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="settings-split-row">
                    <div className="settings-field-group">
                      <label className="settings-field-label">Country</label>
                      <input
                        type="text"
                        className="settings-text-input"
                        value={country}
                        onChange={(e) => {
                          setCountry(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="settings-field-group">
                      <label className="settings-field-label">Postal Code</label>
                      <input
                        type="text"
                        className="settings-text-input"
                        value={postalCode}
                        onChange={(e) => {
                          setPostalCode(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>

                  <div className="settings-field-group">
                    <label className="settings-field-label">
                      Map URL (Google Maps)
                    </label>
                    <input
                      type="text"
                      className="settings-text-input"
                      value={mapUrl}
                      onChange={(e) => {
                        setMapUrl(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>

                  {/* Section 4: Business Hours */}
                  <h3 className="settings-business-hours-title">Business Hours</h3>

                  <div className="business-hours-table">
                    {businessHours.map((item, idx) => (
                      <div
                        key={item.day}
                        className={`business-hour-row ${!item.open ? 'is-closed' : ''}`}
                      >
                        <span className="hour-day-label">{item.day}</span>

                        {item.open ? (
                          <div className="hour-timing-controls">
                            <select
                              className="hour-time-select"
                              value={item.from}
                              onChange={(e) =>
                                handleChangeTime(idx, 'from', e.target.value)
                              }
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <span className="hour-to-sep">to</span>
                            <select
                              className="hour-time-select"
                              value={item.to}
                              onChange={(e) =>
                                handleChangeTime(idx, 'to', e.target.value)
                              }
                            >
                              {TIME_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="hour-closed-text">Closed</span>
                        )}

                        <label className="hour-open-toggle-label">
                          <input
                            type="checkbox"
                            className="hour-checkbox"
                            checked={item.open}
                            onChange={() => handleToggleDayOpen(idx)}
                          />
                          <span>Open</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ============================================================
                  TAB 3: SOCIAL PROFILES
                  ============================================================ */}
              {activeTab === 'social' && (
                <section className="settings-form-card">
                  <div className="settings-card-header">
                    <h2 className="settings-card-title">Social Profiles</h2>
                    <p className="settings-card-subtitle">
                      Manage your company's presence across social media platforms.
                    </p>
                  </div>

                  <div className="social-profile-rows">
                    {socialProfiles.map((prof) => (
                      <div key={prof.id} className="social-profile-row">
                        <div className="settings-field-group">
                          <label className="settings-field-label">Platform</label>
                          <div className="social-platform-select-shell">
                            <select
                              className="social-platform-select"
                              value={prof.platform}
                              onChange={(e) =>
                                handleUpdateSocial(
                                  prof.id,
                                  'platform',
                                  e.target.value
                                )
                              }
                            >
                              <option value="LinkedIn">LinkedIn</option>
                              <option value="Twitter">Twitter / X</option>
                              <option value="Facebook">Facebook</option>
                              <option value="Instagram">Instagram</option>
                              <option value="YouTube">YouTube</option>
                            </select>
                            <ChevronDown
                              className="social-select-chevron"
                              aria-hidden="true"
                            />
                          </div>
                        </div>

                        <div className="settings-field-group">
                          <label className="settings-field-label">Profile URL</label>
                          <input
                            type="text"
                            className="settings-text-input"
                            placeholder="https://..."
                            value={prof.url}
                            onChange={(e) =>
                              handleUpdateSocial(prof.id, 'url', e.target.value)
                            }
                          />
                        </div>

                        <button
                          type="button"
                          className="btn-remove-social-row"
                          title="Remove profile"
                          onClick={() => handleRemoveSocialProfile(prof.id)}
                        >
                          <Trash2 aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-add-social-profile"
                    onClick={handleAddSocialProfile}
                  >
                    <Plus aria-hidden="true" />
                    <span>+ Add Social Profile</span>
                  </button>
                </section>
              )}

              {/* ============================================================
                  TAB 4: ENQUIRY SETTINGS (3 Cards)
                  ============================================================ */}
              {activeTab === 'enquiry' && (
                <div className="settings-cards-stack">
                  {/* Card 1: Notification Recipients */}
                  <section className="settings-form-card">
                    <div className="settings-card-header-split">
                      <div>
                        <h2 className="settings-card-title">Notification Recipients</h2>
                        <p className="settings-card-subtitle">
                          Emails that will receive notifications for new enquiries.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn-outline-add-recipient"
                        onClick={handleOpenAddRecipient}
                      >
                        <Plus aria-hidden="true" />
                        <span>+ Add Recipient</span>
                      </button>
                    </div>

                    <div className="recipients-list-stack">
                      {recipients.map((rec) => (
                        <div key={rec.id} className="recipient-card-item">
                          <div className="recipient-card-left">
                            <Mail aria-hidden="true" />
                            <span>{rec.email}</span>
                          </div>
                          <div className="recipient-card-actions">
                            <button
                              type="button"
                              className="btn-recipient-action"
                              title="Edit recipient"
                              onClick={() => {
                                setNewRecipientEmail(rec.email);
                                setNewRecipientPrefProduct(rec.notifyProduct);
                                setNewRecipientPrefSupport(rec.notifySupport);
                                setIsRecipientModalOpen(true);
                              }}
                            >
                              <Pencil aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="btn-recipient-action btn-recipient-action--delete"
                              title="Remove recipient"
                              onClick={() => handleRemoveRecipient(rec.id)}
                            >
                              <Trash2 aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Card 2: WhatsApp Message Template */}
                  <section className="settings-form-card">
                    <div className="settings-card-header">
                      <h2 className="settings-card-title">WhatsApp Message Template</h2>
                      <p className="settings-card-subtitle">
                        Configure the prefilled message for customers reaching out via WhatsApp.
                      </p>
                    </div>

                    <div className="settings-field-group">
                      <label className="settings-field-label">Message Template</label>
                      <textarea
                        className="settings-textarea"
                        rows={3}
                        value={whatsappTemplate}
                        onChange={(e) => {
                          setWhatsappTemplate(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                      <div className="template-variables-row">
                        <span>Available Variables:</span>
                        <span
                          className="var-pill-tag"
                          onClick={() => {
                            setWhatsappTemplate((prev) => `${prev} {product_name}`);
                            setHasUnsavedChanges(true);
                          }}
                        >
                          &#123;product_name&#125;
                        </span>
                        <span
                          className="var-pill-tag"
                          onClick={() => {
                            setWhatsappTemplate((prev) => `${prev} {product_code}`);
                            setHasUnsavedChanges(true);
                          }}
                        >
                          &#123;product_code&#125;
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Card 3: Response Text */}
                  <section className="settings-form-card">
                    <div className="settings-card-header">
                      <h2 className="settings-card-title">Response Text</h2>
                      <p className="settings-card-subtitle">
                        The message displayed to customers after a successful enquiry submission.
                      </p>
                    </div>

                    <div className="settings-field-group">
                      <label className="settings-field-label">Success Message</label>
                      <textarea
                        className="settings-textarea"
                        rows={3}
                        value={responseSuccessMessage}
                        onChange={(e) => {
                          setResponseSuccessMessage(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </section>
                </div>
              )}

              {/* ============================================================
                  TAB 5: SEO & ANALYTICS (Callout + 3 Cards)
                  ============================================================ */}
              {activeTab === 'seo' && (
                <div className="settings-cards-stack">
                  {/* Warning Callout Box */}
                  <div className="settings-sensitive-alert-box">
                    <ShieldAlert aria-hidden="true" />
                    <span>
                      Sensitive integration values should only be exposed when secure storage and handling are supported.
                    </span>
                  </div>

                  {/* Card 1: Default SEO */}
                  <section className="settings-form-card">
                    <div className="settings-card-header">
                      <h2 className="settings-card-title">Default SEO</h2>
                      <p className="settings-card-subtitle">
                        Configure how your site appears in search engine results.
                      </p>
                    </div>

                    <div className="settings-field-group">
                      <label className="settings-field-label">Meta Title</label>
                      <input
                        type="text"
                        className="settings-text-input"
                        value={metaTitle}
                        onChange={(e) => {
                          setMetaTitle(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="settings-field-group">
                      <label className="settings-field-label">Meta Description</label>
                      <textarea
                        className="settings-textarea"
                        rows={3}
                        value={metaDescription}
                        onChange={(e) => {
                          setMetaDescription(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="settings-field-group">
                      <label className="settings-field-label">Canonical URL</label>
                      <input
                        type="text"
                        className="settings-text-input"
                        value={canonicalUrl}
                        onChange={(e) => {
                          setCanonicalUrl(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    {/* Search Result Preview */}
                    <div className="search-result-preview-box">
                      <span className="search-result-preview-tag">
                        Search Result Preview
                      </span>
                      <div className="search-preview-url">
                        {canonicalUrl || 'https://weldtech-industrial.com'}
                      </div>
                      <h4 className="search-preview-title">
                        {metaTitle || 'WeldTech Industrial | Heavy Manufacturing & Industrial Solutions'}
                      </h4>
                      <p className="search-preview-desc">
                        {metaDescription ||
                          'Leading provider of heavy manufacturing equipment and industrial supply chain solutions. Quality welding and industrial tools for global markets.'}
                      </p>
                    </div>
                  </section>

                  {/* Card 2: Google Analytics */}
                  <section className="settings-form-card">
                    <div className="settings-card-header-split">
                      <div>
                        <h2 className="settings-card-title">Google Analytics</h2>
                        <p className="settings-card-subtitle">
                          Track website traffic and user behavior.
                        </p>
                      </div>
                      <label className="ind-toggle-switch">
                        <input
                          type="checkbox"
                          checked={gaEnabled}
                          onChange={(e) => {
                            setGaEnabled(e.target.checked);
                            setHasUnsavedChanges(true);
                          }}
                        />
                        <span className="ind-toggle-slider" />
                      </label>
                    </div>

                    {gaEnabled && (
                      <div className="settings-field-group">
                        <label className="settings-field-label">
                          Measurement ID (G-XXXXXXXXXX)
                        </label>
                        <input
                          type="text"
                          className="settings-text-input"
                          value={gaMeasurementId}
                          onChange={(e) => {
                            setGaMeasurementId(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>
                    )}
                  </section>

                  {/* Card 3: Google Search Console */}
                  <section className="settings-form-card">
                    <div className="settings-card-header-split">
                      <div>
                        <h2 className="settings-card-title">Google Search Console</h2>
                        <p className="settings-card-subtitle">
                          Monitor and maintain your site's presence in Google Search results.
                        </p>
                      </div>
                      <label className="ind-toggle-switch">
                        <input
                          type="checkbox"
                          checked={gscEnabled}
                          onChange={(e) => {
                            setGscEnabled(e.target.checked);
                            setHasUnsavedChanges(true);
                          }}
                        />
                        <span className="ind-toggle-slider" />
                      </label>
                    </div>

                    <div className="settings-field-group">
                      <label className="settings-field-label">Property ID</label>
                      <input
                        type="text"
                        className="settings-text-input"
                        placeholder="Enter Property ID"
                        value={gscPropertyId}
                        onChange={(e) => {
                          setGscPropertyId(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </section>
                </div>
              )}

              {/* ============================================================
                  TAB 6: FOOTER SETTINGS (with Sprimax Live Mockup)
                  ============================================================ */}
              {activeTab === 'footer' && (
                <section className="settings-form-card">
                  <div className="settings-card-header">
                    <h2 className="settings-card-title">Footer Settings</h2>
                    <p className="settings-card-subtitle">
                      Configure the information displayed at the bottom of every page.
                    </p>
                  </div>

                  <div className="settings-field-group">
                    <label className="settings-field-label">Footer Summary</label>
                    <textarea
                      className="settings-textarea"
                      rows={3}
                      value={footerSummary}
                      onChange={(e) => {
                        setFooterSummary(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>

                  <div className="settings-field-group">
                    <label className="settings-field-label">Copyright Text</label>
                    <input
                      type="text"
                      className="settings-text-input"
                      value={copyrightText}
                      onChange={(e) => {
                        setCopyrightText(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>

                  {/* Footer Live Preview Mockup */}
                  <div style={{ marginTop: '24px' }}>
                    <label className="settings-field-label">Footer Preview</label>
                    <div className="footer-preview-mockup-frame">
                      {/* Left: Brand & Tagline */}
                      <div className="footer-mockup-brand-col">
                        <img
                          src="/logo-white.png"
                          alt="Sprimax"
                          className="footer-mockup-logo"
                        />
                        <p className="footer-mockup-tagline">
                          {footerSummary ||
                            'Engineered precision for heavy industrial applications. Partnering with global manufacturing leaders.'}
                        </p>
                        <div className="footer-mockup-copyright">
                          {copyrightText || '© 2026 SPRIMAX. ALL RIGHTS RESERVED.'}
                        </div>
                      </div>

                      {/* Middle: Technical Resources */}
                      <div className="footer-mockup-links-col">
                        <div className="footer-mockup-col-heading">
                          Technical Resources
                        </div>
                        <span className="footer-mockup-link-item">&gt; Careers</span>
                        <span className="footer-mockup-link-item">&gt; Sitemap</span>
                        <span className="footer-mockup-link-item">
                          &gt; ISO Certifications
                        </span>
                        <span className="footer-mockup-link-item">&gt; Blog</span>
                      </div>

                      {/* Right: Corporate */}
                      <div className="footer-mockup-links-col">
                        <div className="footer-mockup-col-heading">Corporate</div>
                        <span className="footer-mockup-link-item">
                          &gt; Contact Technical Support
                        </span>
                        <span className="footer-mockup-link-item">
                          &gt; Privacy Policy
                        </span>
                        <span className="footer-mockup-link-item">
                          &gt; Terms of Service
                        </span>
                        <span className="footer-mockup-link-item">&gt; FAQ</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <footer className="settings-bottom-bar">
        {hasUnsavedChanges ? (
          <div className="settings-unsaved-warning">
            <AlertTriangle aria-hidden="true" />
            <span>Unsaved changes</span>
          </div>
        ) : (
          <div />
        )}

        <div className="settings-actions-group">
          <button
            type="button"
            className="btn-settings-discard"
            onClick={handleDiscardChanges}
          >
            Discard Changes
          </button>
          <button
            type="button"
            className="btn-settings-save"
            onClick={handleSaveSettings}
          >
            Save Settings
          </button>
        </div>
      </footer>

      {/* Add Notification Recipient Modal */}
      {isRecipientModalOpen && (
        <div
          className="ind-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRecipientModalOpen(false);
          }}
        >
          <div className="ind-modal-box" style={{ maxWidth: '480px' }}>
            <div className="ind-modal-header">
              <div>
                <h3 className="ind-modal-title">Add Notification Recipient</h3>
                <p
                  style={{
                    margin: '4px 0 0',
                    color: '#64748b',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Enter an email address to receive notifications for new customer enquiries.
                </p>
              </div>
              <button
                type="button"
                className="ind-modal-close-btn"
                onClick={() => setIsRecipientModalOpen(false)}
              >
                <X aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleAddRecipientSubmit}>
              <div className="ind-modal-body" style={{ gap: '18px' }}>
                <div className="settings-field-group">
                  <label className="settings-field-label">Email Address</label>
                  <input
                    type="email"
                    className="settings-text-input"
                    placeholder="e.g. manager@weldtech.ind"
                    value={newRecipientEmail}
                    onChange={(e) => setNewRecipientEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="settings-field-group">
                  <label className="settings-field-label">
                    Notification Preferences
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      marginTop: '4px',
                    }}
                  >
                    <label className="modal-pref-checkbox-row">
                      <input
                        type="checkbox"
                        className="hour-checkbox"
                        checked={newRecipientPrefProduct}
                        onChange={(e) =>
                          setNewRecipientPrefProduct(e.target.checked)
                        }
                      />
                      <span>Notify for Product Enquiries</span>
                    </label>

                    <label className="modal-pref-checkbox-row">
                      <input
                        type="checkbox"
                        className="hour-checkbox"
                        checked={newRecipientPrefSupport}
                        onChange={(e) =>
                          setNewRecipientPrefSupport(e.target.checked)
                        }
                      />
                      <span>Notify for Technical Support</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="ind-modal-footer">
                <button
                  type="button"
                  className="btn-ind-cancel"
                  onClick={() => setIsRecipientModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-ind-submit">
                  Add Recipient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="settings-toast">
          <CheckCircle2 className="settings-toast-icon" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
