import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  Search,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
  Layers,
  FlaskConical,
  Activity,
  ArrowDown,
  X,
} from 'lucide-react';
import { getDownloads } from '../api/resources.js';
import heroQualityImg from '../assets/quality-precision-hero.jpg';
import labChemicalImg from '../assets/lab-chemical-analysis.jpg';
import labMechanicalImg from '../assets/lab-mechanical-testing.jpg';
import './IsoCertificationsPage.css';

// Baseline welding standards used if not yet overridden in DB
const DEFAULT_CERTIFICATES = [
  {
    id: 'cert-1',
    name: 'ISO 9001:2015',
    subScope: 'Quality Management System for Welding Consumables',
    issuer: 'TÜV Rheinland',
    issueDate: '2023-05-12',
    validUntil: '2026-05-11',
    status: 'Active',
    documentUrl: '#',
    documentName: 'ISO_9001_2015_Certificate.pdf',
  },
  {
    id: 'cert-2',
    name: 'ASME Section II & IX',
    subScope: 'Boiler & Pressure Vessel Code Materials & Qualifications',
    issuer: 'ASME',
    issueDate: '2022-11-04',
    validUntil: '2025-11-04',
    status: 'Active',
    documentUrl: '#',
    documentName: 'ASME_Section_II_IX_Approval.pdf',
  },
  {
    id: 'cert-3',
    name: "Lloyd's Register (Legacy)",
    subScope: 'Hull Structural Steels & High Tensile Alloys',
    issuer: "Lloyd's Register",
    issueDate: '2019-02-15',
    validUntil: '2022-02-14',
    status: 'Expired',
    documentUrl: '#',
    documentName: 'Lloyds_Register_Legacy_Archive.pdf',
  },
  {
    id: 'cert-4',
    name: 'AWS D1.1 / D1.1M',
    subScope: 'Structural Welding Code (Steel) Fabrication Compliance',
    issuer: 'American Welding Society (AWS)',
    issueDate: '2023-10-10',
    validUntil: '2026-10-09',
    status: 'Active',
    documentUrl: '#',
    documentName: 'AWS_D1_1_Structural_Steel_Compliance.pdf',
  },
  {
    id: 'cert-5',
    name: 'EN 1090-2 (CE Marking)',
    subScope: 'Execution of Steel Structures & Component Traceability',
    issuer: 'TÜV Rheinland Group',
    issueDate: '2024-02-10',
    validUntil: '2026-11-30',
    status: 'Active',
    documentUrl: '#',
    documentName: 'EN_1090_2_CE_Declaration.pdf',
  },
  {
    id: 'cert-6',
    name: 'ISO 3834-2',
    subScope: 'Comprehensive Quality Requirements for Fusion Welding',
    issuer: 'Lloyds Register Quality Assurance',
    issueDate: '2023-09-05',
    validUntil: '2026-09-04',
    status: 'Active',
    documentUrl: '#',
    documentName: 'ISO_3834_2_Comprehensive_Audit.pdf',
  },
];

export default function IsoCertificationsPage({ onNavigateToContact }) {
  const [certificates, setCertificates] = useState(DEFAULT_CERTIFICATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalCert, setActiveModalCert] = useState(null);

  // Fetch real-time certificates from MongoDB download resources and shared storage
  useEffect(() => {
    async function loadCertData() {
      try {
        // 1. Fetch certificate downloads from MongoDB
        const dbResources = await getDownloads({ type: 'cert' });

        // 2. Read from localStorage for live admin edits
        let localData = [];
        try {
          const raw = localStorage.getItem('sprimax_certifications_data');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localData = parsed;
            }
          }
        } catch (e) {
          console.warn('Could not read local cert data:', e);
        }

        if (Array.isArray(dbResources) && dbResources.length > 0) {
          const formattedFromDb = dbResources.map((res, idx) => ({
            id: res._id || `db-cert-${idx}`,
            name: res.title,
            subScope: res.description || 'Quality & Metallurgy Certification',
            issuer: res.code || 'International Standard Body',
            issueDate: res.createdAt ? res.createdAt.substring(0, 10) : '2023-01-01',
            validUntil: res.updatedAt ? res.updatedAt.substring(0, 10) : '2026-12-31',
            status: res.status === 'Archived' ? 'Expired' : 'Active',
            documentUrl: res.fileUrl || '#',
            documentName: res.fileName || `${res.title.replace(/\s+/g, '_')}.pdf`,
          }));
          setCertificates(formattedFromDb);
        } else if (localData.length > 0) {
          const formattedFromLocal = localData.map((item, idx) => {
            const dates = (item.validityRange || '').split('-').map((s) => s.trim());
            return {
              id: item.id || `local-${idx}`,
              name: item.name,
              subScope: item.subScope,
              issuer: item.issuer,
              issueDate: dates[0] || '2023-01-01',
              validUntil: dates[1] || '2026-12-31',
              status: item.status === 'Expired' ? 'Expired' : 'Active',
              documentUrl: '#',
              documentName: item.documentName || `${item.name.replace(/\s+/g, '_')}.pdf`,
            };
          });
          setCertificates(formattedFromLocal);
        }
      } catch (err) {
        console.warn('Using baseline certificate standards:', err);
      }
    }
    loadCertData();
  }, []);

  const scrollToRegistry = () => {
    const el = document.getElementById('certificate-registry-section');
    if (el) {
      const yOffset = -70;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const filteredCerts = certificates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.issuer?.toLowerCase().includes(q) ||
      c.subScope?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="iso-page-wrapper">
      {/* 1. HERO SECTION: Precision Without Compromise */}
      <section className="iso-hero-section">
        <div className="iso-container iso-hero-grid">
          {/* Left Text Column */}
          <div className="iso-hero-text-col">
            <div className="iso-badge-tag">
              <ShieldCheck size={14} className="iso-badge-icon" />
              <span>QUALITY ASSURANCE</span>
            </div>

            <h1 className="iso-hero-headline">
              Precision Without<br />Compromise
            </h1>

            <p className="iso-hero-description">
              At Sprimax Industrial, quality is not a department; it&apos;s an engineering fundamental.
              Our stringent metallurgical standards and exhaustive testing protocols ensure every
              component performs under the most extreme industrial pressures.
            </p>

            <button
              type="button"
              className="iso-view-certs-btn"
              onClick={scrollToRegistry}
            >
              <span>View Certificates</span>
              <ArrowDown size={15} />
            </button>
          </div>

          {/* Right Image with Tolerance Card */}
          <div className="iso-hero-image-col">
            <div className="iso-hero-img-wrapper">
              <img
                src={heroQualityImg}
                alt="Precision Industrial Manufacturing and Tolerancing"
                className="iso-hero-img"
              />
              <div className="iso-tolerance-card">
                <Compass size={24} className="iso-tolerance-icon" />
                <div className="iso-tolerance-info">
                  <span className="iso-tolerance-value">0.001mm</span>
                  <span className="iso-tolerance-label">TOLERANCE THRESHOLD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GLOBAL STANDARDS & 4-STAGE QC */}
      <section className="iso-qc-section">
        <div className="iso-container">
          <div className="iso-section-heading-row">
            <span className="iso-accent-bar" aria-hidden="true" />
            <h2 className="iso-section-title">Global Standards &amp; 4-Stage QC</h2>
          </div>

          <div className="iso-qc-grid">
            {/* Left Column: Accreditation Badges */}
            <div className="iso-standards-col">
              <div className="iso-standard-box">
                <div className="iso-standard-main">
                  <h3 className="iso-standard-name">ISO 9001:2015</h3>
                  <p className="iso-standard-sub">
                    Certified Quality Management System covering all manufacturing nodes.
                  </p>
                </div>
                <Award size={24} className="iso-standard-icon" />
              </div>

              <div className="iso-standard-box">
                <div className="iso-standard-main">
                  <h3 className="iso-standard-name">AWS D1.1</h3>
                  <p className="iso-standard-sub">
                    Structural welding code compliant for structural steel integration.
                  </p>
                </div>
                <ShieldCheck size={24} className="iso-standard-icon" />
              </div>
            </div>

            {/* Right Column: 4-Stage QC Grid */}
            <div className="iso-stages-card">
              <div className="iso-stages-grid">
                {/* Stage 01 */}
                <div className="iso-stage-item">
                  <div className="iso-stage-indicator">STAGE 01</div>
                  <h4 className="iso-stage-title">Raw Material Analysis</h4>
                  <p className="iso-stage-desc">
                    Chemical composition verification via optical emission spectroscopy upon receiving.
                  </p>
                </div>

                {/* Stage 02 */}
                <div className="iso-stage-item">
                  <div className="iso-stage-indicator">STAGE 02</div>
                  <h4 className="iso-stage-title">Inline Inspection</h4>
                  <p className="iso-stage-desc">
                    Dimensional and non-destructive testing (NDT) during critical machining phases.
                  </p>
                </div>

                {/* Stage 03 */}
                <div className="iso-stage-item">
                  <div className="iso-stage-indicator">STAGE 03</div>
                  <h4 className="iso-stage-title">Batch Mechanical Testing</h4>
                  <p className="iso-stage-desc">
                    Tensile, yield, and impact testing conducted on randomized batch samples.
                  </p>
                </div>

                {/* Stage 04 */}
                <div className="iso-stage-item">
                  <div className="iso-stage-indicator">STAGE 04</div>
                  <h4 className="iso-stage-title">Final Release</h4>
                  <p className="iso-stage-desc">
                    Comprehensive document collation, Mill Test Certificate (MTC) generation, and visual sign-off.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CERTIFICATE REGISTRY SECTION */}
      <section id="certificate-registry-section" className="iso-registry-section">
        <div className="iso-container">
          <div className="iso-registry-header">
            <div>
              <h2 className="iso-registry-title">Certificate Registry</h2>
              <p className="iso-registry-subtitle">
                Official documentation and compliance certificates available for verification and download.
              </p>
            </div>

            {/* Search Box */}
            <div className="iso-registry-search">
              <Search size={16} className="iso-search-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search certifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="iso-search-input"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="iso-registry-grid">
            {filteredCerts.map((cert) => {
              const isActive = cert.status === 'Active';
              return (
                <div key={cert.id} className="iso-cert-card">
                  {/* Status Tag */}
                  <div className="iso-cert-status-row">
                    <span
                      className={`iso-cert-tag ${
                        isActive ? 'iso-cert-tag--active' : 'iso-cert-tag--expired'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>STATUS: ACTIVE</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          <span>EXPIRED</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Cert Title & Issuer */}
                  <h3 className="iso-cert-title">{cert.name}</h3>
                  <div className="iso-cert-issuer">Issuer: {cert.issuer}</div>

                  <div className="iso-cert-divider" />

                  {/* Dates Row */}
                  <div className="iso-cert-dates-row">
                    <div>
                      <span className="iso-cert-date-label">ISSUED</span>
                      <span className="iso-cert-date-val">{cert.issueDate}</span>
                    </div>
                    <div>
                      <span className="iso-cert-date-label">VALID UNTIL</span>
                      <span
                        className={`iso-cert-date-val ${
                          !isActive ? 'iso-cert-date-val--expired' : ''
                        }`}
                      >
                        {cert.validUntil}
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="iso-cert-actions">
                    {isActive ? (
                      <>
                        <button
                          type="button"
                          className="iso-cert-action-btn"
                          onClick={() => setActiveModalCert(cert)}
                        >
                          <Compass size={14} />
                          <span>View</span>
                        </button>
                        <a
                          href={cert.documentUrl || '#'}
                          download={cert.documentName}
                          onClick={(e) => {
                            if (!cert.documentUrl || cert.documentUrl === '#') {
                              e.preventDefault();
                              alert(`Downloading ${cert.documentName} official compliance copy.`);
                            }
                          }}
                          className="iso-cert-action-btn"
                        >
                          <Download size={14} />
                          <span>PDF</span>
                        </a>
                      </>
                    ) : (
                      <span className="iso-cert-archive-label">Archive Only</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. IN-HOUSE TESTING FACILITIES */}
      <section className="iso-facilities-section">
        <div className="iso-container">
          <div className="iso-section-heading-row">
            <span className="iso-accent-bar" aria-hidden="true" />
            <h2 className="iso-section-title">In-House Testing Facilities</h2>
          </div>
          <p className="iso-facilities-subtitle">
            Our laboratory is equipped with state-of-the-art diagnostic equipment to validate
            material integrity before, during, and after the manufacturing cycle.
          </p>

          <div className="iso-facilities-grid">
            {/* Card 1: Chemical Analysis */}
            <div className="iso-facility-card">
              <div className="iso-facility-img-wrap">
                <img
                  src={labChemicalImg}
                  alt="Optical Emission Spectroscopy Chemical Analysis Laboratory"
                  className="iso-facility-img"
                />
              </div>
              <div className="iso-facility-content">
                <div className="iso-facility-header">
                  <FlaskConical size={20} className="iso-facility-icon" />
                  <h3 className="iso-facility-title">Chemical Analysis</h3>
                </div>
                <ul className="iso-facility-list">
                  <li>
                    <span className="iso-bullet" />
                    <span>Optical Emission Spectroscopy (OES)</span>
                  </li>
                  <li>
                    <span className="iso-bullet" />
                    <span>Positive Material Identification (PMI)</span>
                  </li>
                  <li>
                    <span className="iso-bullet" />
                    <span>Carbon &amp; Sulfur determination</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: Mechanical Testing */}
            <div className="iso-facility-card">
              <div className="iso-facility-img-wrap">
                <img
                  src={labMechanicalImg}
                  alt="Universal Tensile and Mechanical Charpy Impact Testing"
                  className="iso-facility-img"
                />
              </div>
              <div className="iso-facility-content">
                <div className="iso-facility-header">
                  <Activity size={20} className="iso-facility-icon" />
                  <h3 className="iso-facility-title">Mechanical Testing</h3>
                </div>
                <ul className="iso-facility-list">
                  <li>
                    <span className="iso-bullet" />
                    <span>Universal Tensile &amp; Yield Testing</span>
                  </li>
                  <li>
                    <span className="iso-bullet" />
                    <span>Charpy V-Notch Impact Testing (-196°C)</span>
                  </li>
                  <li>
                    <span className="iso-bullet" />
                    <span>Brinell &amp; Rockwell Hardness Testing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate Details Modal */}
      {activeModalCert && (
        <div
          className="iso-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalCert(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="iso-modal-card">
            <div className="iso-modal-header">
              <div className="iso-modal-title-cluster">
                <Award size={20} className="iso-modal-icon" />
                <h3 className="iso-modal-title">{activeModalCert.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalCert(null)}
                className="iso-modal-close"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="iso-modal-body">
              <div className="iso-modal-row">
                <span className="iso-modal-label">Scope &amp; Baseline:</span>
                <span className="iso-modal-val">{activeModalCert.subScope}</span>
              </div>
              <div className="iso-modal-row">
                <span className="iso-modal-label">Issuing Authority:</span>
                <span className="iso-modal-val">{activeModalCert.issuer}</span>
              </div>
              <div className="iso-modal-row">
                <span className="iso-modal-label">Issue Date:</span>
                <span className="iso-modal-val">{activeModalCert.issueDate}</span>
              </div>
              <div className="iso-modal-row">
                <span className="iso-modal-label">Valid Until:</span>
                <span className="iso-modal-val">{activeModalCert.validUntil}</span>
              </div>
              <div className="iso-modal-row">
                <span className="iso-modal-label">Compliance Status:</span>
                <span className="iso-modal-val" style={{ color: '#059669', fontWeight: 700 }}>
                  Active &amp; Audited
                </span>
              </div>
            </div>

            <div className="iso-modal-footer">
              <button
                type="button"
                onClick={() => setActiveModalCert(null)}
                className="iso-modal-btn-cancel"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading ${activeModalCert.documentName}`);
                  setActiveModalCert(null);
                }}
                className="iso-modal-btn-download"
              >
                <Download size={15} />
                <span>Download Official Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
