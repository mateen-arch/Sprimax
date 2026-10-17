import { useState, useMemo } from 'react';
import {
  Activity,
  Building2,
  Check,
  ExternalLink,
  FileText,
  Flag,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  X,
  Briefcase,
  Wrench,
  Calendar,
  Layers,
  Award,
  ChevronLeft,
  Clock,
  User,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import { generateEnquirySummaryPdf } from './enquiryPdfExport.js';
import './EnquiryDetailsPage.css';

// Helper to format any value or fallback to "Not provided"
function renderVal(val) {
  if (val === undefined || val === null) return 'Not provided';
  const str = String(val).trim();
  return str === '' || str === '—' || str === '-' ? 'Not provided' : str;
}

// Localized timestamp with timezone abbreviation (e.g. "Oct 17, 2026, 12:46 AM PKT")
function formatLocalTime(dateInput) {
  if (!dateInput) return 'Not provided';
  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) return 'Not provided';

  const formatted = dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  let tz = '';
  try {
    const match = dateObj.toLocaleTimeString('en-US', { timeZoneName: 'short' }).match(/[A-Z]{2,5}$/);
    if (match) tz = match[0];
  } catch (e) {
    tz = '';
  }

  return tz ? `${formatted} ${tz}` : formatted;
}

export default function EnquiryDetailsPage({
  enquiry,
  activeType = 'Product Enquiries',
  onBack,
  onNavigate,
  onLogout,
  onViewProductSpecs,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailBody, setEmailBody] = useState('');
  const [isFollowUp, setIsFollowUp] = useState(Boolean(enquiry?.followUp?.isSet));
  const [isExporting, setIsExporting] = useState(false);

  // Raw enquiry document with zero hardcoded fallbacks
  const enq = enquiry || {};

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleSendEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailBody.trim()) return;
    showToast(`Email dispatched to ${enq.email || 'recipient'}.`);
    setEmailModalOpen(false);
    setEmailBody('');
  };

  const handleToggleFollowUp = () => {
    const nextState = !isFollowUp;
    setIsFollowUp(nextState);
    showToast(nextState ? 'Marked as priority follow-up.' : 'Follow-up flag removed.');
  };

  // Export summary 1-page PDF
  const handleExportSummary = async () => {
    try {
      setIsExporting(true);
      showToast('Generating official Enquiry Summary PDF...');
      const filename = await generateEnquirySummaryPdf({
        enquiry: enq,
        adminName: 'Sprimax Administrator',
        matchedProduct: enq.productId || null,
        isFollowUp: isFollowUp,
        internalNotes: enq.internalNotes || '',
      });
      showToast(`Exported ${filename}`);
    } catch (err) {
      console.error('PDF export failed:', err);
      showToast('Failed to export PDF: ' + err.message, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const isDealer = enq.enquiryType?.toLowerCase().includes('dealer');
  const isTechnical = enq.enquiryType?.toLowerCase().includes('tech');
  const isProject = enq.enquiryType?.toLowerCase().includes('project');

  // Standardized Reference format: ENQ-YYYY-NNNN
  const year = enq.createdAt ? new Date(enq.createdAt).getFullYear() : 2026;
  const standardRefNo = enq.referenceCode
    ? enq.referenceCode.replace('#', '')
    : enq.refNo
    ? enq.refNo.replace('#', '')
    : `ENQ-${year}-${(enq._id || enq.id || '0001').slice(-4).toUpperCase()}`;

  // Real product link resolution
  const linkedProduct = enq.productId || null;
  const displayProductName = (linkedProduct && linkedProduct.name) || enq.productName || enq.productInterested || enq.projectName || enq.subject || renderVal(enq.productInterested);
  const displayProductSku = (linkedProduct && linkedProduct.sku) || (enq.productSku && !enq.productSku.startsWith('TDS') ? enq.productSku : renderVal(enq.skuOrClass && !enq.skuOrClass.startsWith('TDS') ? enq.skuOrClass : ''));

  // Status History
  const statusHistory = Array.isArray(enq.statusHistory) && enq.statusHistory.length > 0 ? enq.statusHistory : null;

  return (
    <div className="enquiry-details-container">
      {/* Persistent Sidebar with current category highlighted */}
      <AdminSidebar
        currentNav={activeType}
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="enquiry-details-shell">
        {/* Topbar */}
        <AdminTopbar
          onLogout={onLogout}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSearchChange={setGlobalSearch}
          searchQuery={globalSearch}
          title={activeType}
        />

        <main className="enquiry-details-content">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="enquiry-breadcrumb">
            <button
              className="crumb-link"
              onClick={onBack}
              type="button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <ChevronLeft size={14} />
              <span>{activeType}</span>
            </button>
            <span className="crumb-separator" aria-hidden="true">&gt;</span>
            <span className="crumb-current">{standardRefNo}</span>
          </nav>

          {/* Details Header */}
          <header className="enquiry-details-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: '#ff080415',
                    color: '#ff0804',
                  }}
                >
                  {renderVal(enq.enquiryType || activeType)}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: (enq.status || 'New').toLowerCase() === 'new' ? '#fee2e2' : '#e2e8f0',
                    color: (enq.status || 'New').toLowerCase() === 'new' ? '#dc2626' : '#334155',
                  }}
                >
                  Status: {renderVal(enq.status || 'New')}
                </span>
                {enq.isTest && (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#fef3c7',
                      color: '#d97706',
                    }}
                  >
                    TEST RECORD
                  </span>
                )}
              </div>
              <h1 className="enquiry-page-title">
                {renderVal(enq.companyName || enq.company)} - {displayProductName}
              </h1>
              <p className="enquiry-page-subtitle">Submitted on {formatLocalTime(enq.createdAt || enq.submittedAt || enq.date)}</p>
            </div>
            <div className="enquiry-header-actions">
              <button
                className="btn-enquiry-quote"
                disabled={isExporting}
                onClick={handleExportSummary}
                type="button"
              >
                <FileText className="btn-icon" aria-hidden="true" />
                <span>{isExporting ? 'Generating PDF...' : 'Export Summary'}</span>
              </button>
              <button
                className={`btn-enquiry-secondary${isFollowUp ? ' btn-enquiry-secondary--active' : ''}`}
                onClick={handleToggleFollowUp}
                type="button"
              >
                <Flag className="btn-icon" aria-hidden="true" />
                <span>{isFollowUp ? 'Follow-up Set' : 'Mark Follow-up'}</span>
              </button>
              {enq.email && (
                <button
                  className="btn-enquiry-secondary"
                  onClick={() => {
                    const recipient = encodeURIComponent(enq.email);
                    const subject = encodeURIComponent(`SPRIMAX Technical Response: [${standardRefNo}] ${displayProductName}`);
                    const greeting = enq.contactName || enq.customer ? `Dear ${enq.contactName || enq.customer},\n\n` : 'Dear Client,\n\n';
                    const body = encodeURIComponent(
                      `${greeting}Thank you for contacting SPRIMAX regarding your enquiry (${standardRefNo}).\n\nIn reference to your request for ${displayProductName}:\n\n`
                    );
                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
                    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
                    showToast(`Opening Gmail composer for ${enq.email}...`);
                  }}
                  type="button"
                >
                  <Mail className="btn-icon" aria-hidden="true" />
                  <span>Send Email</span>
                </button>
              )}
            </div>
          </header>

          {/* 2-Column Details Grid */}
          <div className="enquiry-grid-layout">
            {/* Left Column (Client Profile + Message/Scope) */}
            <div className="enquiry-left-col">
              {/* Card 1: Client / Applicant Profile */}
              <div className="enquiry-panel-card">
                <header className="panel-card-header">
                  <div className="panel-header-title">
                    <Building2 className="panel-header-icon" aria-hidden="true" />
                    <h2>
                      {isDealer ? 'Distributor Profile' : isProject ? 'Procurement & Engineering Client' : 'Client Profile'}
                    </h2>
                  </div>
                </header>

                <div className="panel-card-body client-profile-body">
                  {/* Contact Details */}
                  <div className="client-sub-section">
                    <span className="client-section-heading">CONTACT DETAILS</span>
                    <div className="contact-details-row">
                      <div className="client-avatar-initials">
                        {(enq.contactName || enq.customer || 'CL')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="client-personal-info">
                        <strong className="client-name">{renderVal(enq.contactName || enq.customer)}</strong>
                        <span className="client-role">{renderVal(enq.role)}</span>
                        <div className="client-channels">
                          <span className="client-channel-link">
                            <Mail className="channel-icon" aria-hidden="true" />
                            <span>{renderVal(enq.email)}</span>
                          </span>
                          <span className="client-channel-link">
                            <Phone className="channel-icon" aria-hidden="true" />
                            <span>{renderVal(enq.phone)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="client-sub-section company-info-section">
                    <span className="client-section-heading">ORGANIZATION DETAILS</span>
                    <strong className="company-title">{renderVal(enq.companyName || enq.company)}</strong>
                    <span className="company-tier">{renderVal(enq.industryName || enq.industry)}</span>
                    <div className="company-address-block">
                      <MapPin className="address-pin-icon" aria-hidden="true" />
                      <div className="address-lines">
                        <span>{renderVal(enq.primaryLocation || enq.address)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Enquiry Message / Description */}
              <div className="enquiry-panel-card" style={{ marginTop: '24px' }}>
                <header className="panel-card-header">
                  <div className="panel-header-title">
                    <MessageSquare className="panel-header-icon" aria-hidden="true" />
                    <h2>
                      {isDealer
                        ? 'Distribution Capabilities Statement'
                        : isTechnical
                        ? 'Engineering Problem & Scope Description'
                        : isProject
                        ? 'Detailed Scope & Technical Specifications'
                        : 'Customer Inquiry Description'}
                    </h2>
                  </div>
                </header>

                <div className="panel-card-body">
                  <div className="enquiry-quote-box">
                    <span className="quote-watermark" aria-hidden="true">”</span>
                    <div className="enquiry-message-paragraphs">
                      {enq.message || enq.projectScopeDetails ? (
                        (enq.message || enq.projectScopeDetails).split('\n').map((para, idx) => (
                          <p key={idx} style={{ marginBottom: '8px' }}>
                            {para}
                          </p>
                        ))
                      ) : (
                        <p style={{ fontStyle: 'italic', color: '#64748b' }}>Not provided</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Category Specific Attributes + Timeline + Handling) */}
            <div className="enquiry-right-col">
              {/* Category-Specific Specifications Card */}
              <div className="enquiry-panel-card">
                <header className="panel-card-header">
                  <div className="panel-header-title">
                    <Layers className="panel-header-icon" aria-hidden="true" />
                    <h2>
                      {isDealer
                        ? 'Distributor Credentials'
                        : isTechnical
                        ? 'Technical Parameters'
                        : isProject
                        ? 'Project Scope Matrix'
                        : 'Requested Product Specs'}
                    </h2>
                  </div>
                </header>

                <div className="panel-card-body" style={{ padding: '20px' }}>
                  {/* PRODUCT ENQUIRIES SPEC */}
                  {!isDealer && !isTechnical && !isProject && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                          PRODUCT NAME
                        </span>
                        <strong style={{ fontSize: '15px', color: '#0f172a' }}>{displayProductName}</strong>
                        <div style={{ marginTop: '4px' }}>
                          <span className="spec-chip">SKU: {displayProductSku}</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>QUANTITY</span>
                          <strong style={{ fontSize: '15px', color: '#0f172a' }}>{enq.quantity ? `${enq.quantity} ${enq.unit || 'KG'}` : renderVal(enq.quantity)}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>TIMELINE</span>
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{renderVal(enq.timeline || enq.requiredDate || enq.targetDeliveryDate)}</strong>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                          APPLICATION
                        </span>
                        <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#334155' }}>{renderVal(enq.application)}</p>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                          SPECIAL COMPLIANCE / TESTING
                        </span>
                        <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#334155' }}>{renderVal(enq.specifications)}</p>
                      </div>
                    </div>
                  )}

                  {/* DEALER ENQUIRIES SPEC */}
                  {isDealer && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>BUSINESS MODEL</span>
                          <strong style={{ fontSize: '14px', color: '#0369a1' }}>{renderVal(enq.businessType)}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>YEARS IN BUSINESS</span>
                          <strong style={{ fontSize: '14px', color: '#0f172a' }}>{enq.yearsInBusiness ? `${enq.yearsInBusiness} Years` : renderVal(enq.yearsInBusiness)}</strong>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                          PRIMARY OPERATING LOCATION
                        </span>
                        <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#0f172a', fontWeight: 600 }}>{renderVal(enq.primaryLocation)}</p>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                          CURRENT PRIMARY PRODUCT RANGE
                        </span>
                        <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#334155' }}>{renderVal(enq.currentProductRange)}</p>
                      </div>
                    </div>
                  )}

                  {/* TECHNICAL SUPPORT SPEC */}
                  {isTechnical && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                          SUPPORT SUBJECT AREA
                        </span>
                        <strong style={{ fontSize: '15px', color: '#0f172a' }}>{renderVal(enq.subject)}</strong>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>INDUSTRY SECTOR</span>
                        <strong style={{ fontSize: '14px', color: '#0f172a' }}>{renderVal(enq.industry || enq.industryName)}</strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                          RELATED CONSUMABLE / SPECIFICATION
                        </span>
                        <span className="spec-chip" style={{ marginTop: '4px' }}>{renderVal(enq.skuOrClass)}</span>
                      </div>
                    </div>
                  )}

                  {/* PROJECT REQUIREMENTS SPEC */}
                  {isProject && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                          PROJECT NAME &amp; INDUSTRY
                        </span>
                        <strong style={{ fontSize: '16px', color: '#0f172a' }}>{renderVal(enq.projectName)}</strong>
                        <span className="spec-chip" style={{ marginTop: '4px', background: '#fef3c7', color: '#b45309' }}>
                          {renderVal(enq.industry || enq.industryName)}
                        </span>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                          BASE MATERIAL GRADES
                        </span>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#334155' }}>{renderVal(enq.baseMaterials)}</p>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                          WELDING PROCESS
                        </span>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#334155' }}>{renderVal(enq.weldingProcess)}</p>
                      </div>

                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                          GOVERNING STANDARDS
                        </span>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#334155' }}>{renderVal(enq.standards)}</p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>ESTIMATED VOLUME</span>
                          <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{renderVal(enq.estimatedVolume)}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>TARGET DELIVERY</span>
                          <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{renderVal(enq.targetDeliveryDate)}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Processing Timeline Card (Built from statusHistory array) */}
              <div className="enquiry-panel-card" style={{ marginTop: '24px' }}>
                <header className="panel-card-header">
                  <div className="panel-header-title">
                    <Activity className="panel-header-icon" aria-hidden="true" />
                    <h2>Status Workflow</h2>
                  </div>
                </header>

                <div className="panel-card-body timeline-body">
                  <div className="vertical-timeline">
                    {statusHistory && statusHistory.length > 0 ? (
                      statusHistory.map((item, idx) => {
                        const isLast = idx === statusHistory.length - 1;
                        return (
                          <div key={idx} className={`timeline-node ${isLast ? 'timeline-node--active' : 'timeline-node--done'}`}>
                            <div className="node-marker-col">
                              <span className={`node-dot ${isLast ? 'node-dot--orange' : 'node-dot--green'}`}>●</span>
                              {!isLast && <span className="node-line" />}
                            </div>
                            <div className="node-content">
                              <strong className="node-title">{item.stage}</strong>
                              <span className="node-subtitle">
                                {formatLocalTime(item.timestamp)} {item.note ? `• ${item.note}` : ''}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <>
                        <div className="timeline-node timeline-node--done">
                          <div className="node-marker-col">
                            <span className="node-dot node-dot--green">●</span>
                            <span className="node-line" />
                          </div>
                          <div className="node-content">
                            <strong className="node-title">Transmission Received</strong>
                            <span className="node-subtitle">{formatLocalTime(enq.createdAt || enq.submittedAt)}</span>
                          </div>
                        </div>

                        <div className="timeline-node timeline-node--active">
                          <div className="node-marker-col">
                            <span className="node-dot node-dot--orange">●</span>
                            <span className="node-line" />
                          </div>
                          <div className="node-content">
                            <strong className="node-title">Current State: {renderVal(enq.status || 'New')}</strong>
                            <span className="node-subtitle">{formatLocalTime(enq.updatedAt || enq.createdAt)}</span>
                          </div>
                        </div>

                        <div className="timeline-node timeline-node--pending">
                          <div className="node-marker-col">
                            <span className="node-dot node-dot--grey">○</span>
                          </div>
                          <div className="node-content">
                            <strong className="node-title">Commercial Resolution</strong>
                            <span className="node-subtitle">Pending final review</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Internal Handling Block */}
              <div className="enquiry-panel-card" style={{ marginTop: '24px' }}>
                <header className="panel-card-header">
                  <div className="panel-header-title">
                    <User className="panel-header-icon" aria-hidden="true" />
                    <h2>Internal Handling &amp; Notes</h2>
                  </div>
                </header>

                <div className="panel-card-body" style={{ padding: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                        ASSIGNED TO
                      </span>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{renderVal(enq.assignedTo)}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                        FOLLOW-UP
                      </span>
                      <strong style={{ fontSize: '14px', color: isFollowUp ? '#dc2626' : '#0f172a' }}>
                        {isFollowUp ? 'Priority Action Required' : 'Not set'}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 600, marginBottom: '4px' }}>
                      INTERNAL NOTES
                    </span>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '13px', color: '#334155' }}>
                      {enq.internalNotes ? enq.internalNotes : <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Not provided</span>}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="enquiries-toast" role="status">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
