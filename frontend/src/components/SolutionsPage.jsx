import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Shield, Award, CheckCircle, Loader2, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { getIndustryById } from '../api/industries.js';
import solutionHeavyEngImg from '../assets/solution-heavy-eng.jpg';
import companyHeroTriptych from '../assets/company-hero-triptych.png';
import sectorFabrication from '../assets/sector-fabrication.png';
import sectorConstruction from '../assets/sector-construction.png';
import sectorAutomotive from '../assets/sector-automotive.png';
import sectorHeavyEng from '../assets/sector-heavy-eng.png';
import sectorMaintenance from '../assets/sector-maintenance.png';
import sectorPowerPlants from '../assets/sector-power-plants.png';
import sectorInfrastructure from '../assets/sector-infrastructure.png';
import sectorManufacturing from '../assets/sector-manufacturing.png';
import sectorOilGas from '../assets/sector-oil-gas.png';
import noImagePlaceholder from '../assets/no-image-placeholder.png';
import { getOptimizedImageUrl } from '../utils/cloudinary.js';

const LOCAL_BANNER_MAP = {
  'fabrication': sectorFabrication,
  'construction': sectorConstruction,
  'automotive': sectorAutomotive,
  'heavy-engineering': solutionHeavyEngImg,
  'heavy-eng': solutionHeavyEngImg,
  'maintenance-mro': sectorMaintenance,
  'maintenance': sectorMaintenance,
  'power-plants': sectorPowerPlants,
  'infrastructure': sectorInfrastructure,
  'manufacturing': sectorManufacturing,
  'oil-gas': sectorOilGas,
};

function resolveIndustryBanner(industry) {
  if (!industry) return solutionHeavyEngImg;
  const banner = industry.solutionBanner || industry.image;

  if (banner && (banner.startsWith('http://') || banner.startsWith('https://') || banner.startsWith('data:'))) {
    return getOptimizedImageUrl(banner, 'banner');
  }

  const slug = (industry.slug || '').toLowerCase().trim();
  if (LOCAL_BANNER_MAP[slug]) {
    return LOCAL_BANNER_MAP[slug];
  }

  return solutionHeavyEngImg;
}

export default function SolutionsPage({
  industrySlug = 'heavy-engineering',
  onBackToCompany,
  onSubmitRequirements,
  onViewTechnicalDocs,
  onViewProductDetails,
}) {
  const [industry, setIndustry] = useState(null);
  const [mappedProducts, setMappedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchIndustryData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getIndustryById(industrySlug || 'heavy-engineering');
        if (isMounted) {
          setIndustry(data);
          setMappedProducts(data.mappedProducts || []);
        }
      } catch (err) {
        console.error('Failed to fetch industry solutions:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load industry solutions data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchIndustryData();

    return () => {
      isMounted = false;
    };
  }, [industrySlug]);

  if (loading) {
    return (
      <div className="solutions-page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={36} className="animate-spin" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '15px', fontWeight: 500 }}>Loading verified industry solutions from database...</p>
        </div>
      </div>
    );
  }

  if (error || !industry) {
    return (
      <div className="solutions-page-wrapper" style={{ minHeight: '60vh', padding: '4rem 1rem' }}>
        <div className="solutions-container" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', background: '#fff', border: '1px solid #fee2e2', padding: '3rem 2rem', borderRadius: '4px' }}>
          <AlertCircle size={40} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <h2 className="headline-sm" style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Unable to Load Solutions</h2>
          <p className="body-md" style={{ color: '#475569', marginBottom: '1.5rem' }}>{error || 'The requested industrial sector could not be located.'}</p>
          <button
            type="button"
            className="solutions-btn-primary data-tabular"
            onClick={onBackToCompany}
          >
            <ArrowLeft size={15} />
            <span>RETURN TO GLOBAL SECTORS</span>
          </button>
        </div>
      </div>
    );
  }

  const industryName = industry.name || 'Industrial Sector';
  const headline = industry.solutionHeadline || industry.name;
  const description = industry.solutionDescription || industry.description;
  const heroImg = resolveIndustryBanner(industry);
  const challenges = industry.challenges || [];
  const complianceBadges = industry.complianceBadges || ['AWS D1.1', 'ASME Sec IX', 'ISO 3834', "Lloyd's Reg"];
  const gaugePercent = industry.hudGaugePercent || 85;
  const gaugeLabel = industry.hudGaugeLabel || 'DATA//YIELD_STRENGTH_REQUIREMENTS';
  const gaugeVerified = industry.hudVerifiedText || 'HIGH-INTEGRITY WELD VERIFIED';

  return (
    <div className="solutions-page-wrapper">
      {/* 1. Breadcrumbs Header Bar */}
      <section className="solutions-nav-bar">
        <div className="solutions-container">
          <div className="solutions-breadcrumbs">
            <button
              type="button"
              className="solutions-back-btn data-tabular"
              onClick={onBackToCompany}
              aria-label="Back to Company Sectors"
            >
              <ArrowLeft size={15} strokeWidth={2.4} />
              <span>Back</span>
            </button>
            <span className="solutions-breadcrumb-sep">/</span>
            <button
              type="button"
              className="solutions-breadcrumb-link"
              onClick={onBackToCompany}
            >
              Company
            </button>
            <span className="solutions-breadcrumb-slash">/</span>
            <span className="solutions-breadcrumb-active">{industryName}</span>
          </div>
        </div>
      </section>

      {/* 2. Hero Section */}
      <section className="solutions-hero-section">
        <div className="solutions-container">
          <div className="solutions-hero-grid">
            {/* Left Column: Eyebrow badge, Title, Description, and Actions */}
            <div className="solutions-hero-text-col">
              {/* Industry Detail Tag */}
              <div className="solutions-industry-badge data-tabular">
                <svg
                  className="solutions-badge-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="6" cy="6" r="3" />
                  <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                  <line x1="6" y1="9" x2="6" y2="15" />
                </svg>
                <span>Industry Solutions // {industryName.toUpperCase()}</span>
              </div>

              {/* Main Headline */}
              <h1 className="solutions-hero-title headline-lg" style={{ textTransform: 'uppercase' }}>
                {headline}
              </h1>

              {/* Subtitle Description */}
              <p className="solutions-hero-desc body-md">
                {description}
              </p>

              {/* Action Buttons */}
              <div className="solutions-hero-actions">
                <button
                  type="button"
                  className="solutions-btn-primary data-tabular"
                  onClick={() => onSubmitRequirements ? onSubmitRequirements(industry) : null}
                >
                  <span>SUBMIT PROJECT REQUIREMENTS</span>
                  <ArrowRight size={15} strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  className="solutions-btn-secondary data-tabular"
                  onClick={() => onViewTechnicalDocs ? onViewTechnicalDocs(industryName) : null}
                >
                  <span>VIEW TECHNICAL DOCS</span>
                </button>
              </div>
            </div>

            {/* Right Column: Hero Sector Image with HUD Gauge Card */}
            <div className="solutions-hero-img-col">
              <div className="solutions-img-frame">
                <img
                  src={heroImg}
                  alt={`${industryName} engineered solutions applications`}
                  className="solutions-hero-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = solutionHeavyEngImg;
                  }}
                />

                {/* Technical HUD Overlay Card */}
                <div className="solutions-hud-card">
                  <div className="solutions-hud-header data-tabular">
                    <span>{gaugeLabel}</span>
                  </div>
                  <div className="solutions-hud-gauge">
                    <div className="solutions-hud-bar-fill" style={{ width: `${gaugePercent}%` }} />
                    <div className="solutions-hud-bar-empty" style={{ width: `${100 - gaugePercent}%` }} />
                  </div>
                  <div className="solutions-hud-footer data-tabular">
                    <span>{gaugeVerified}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Challenges & Solutions Section (Dynamic from Database) */}
      <section className="solutions-challenges-section">
        <div className="solutions-container">
          <div className="solutions-sec-header">
            <h2 className="solutions-sec-title headline-sm">CHALLENGES &amp; SOLUTIONS</h2>
            <div className="solutions-sec-tag data-tabular">SEC // 02</div>
          </div>
          <div className="solutions-sec-divider" aria-hidden="true" />

          {/* Cards Grid */}
          <div className="solutions-challenges-grid">
            {challenges.map((ch, idx) => {
              const isFullWidth = idx === 2 || challenges.length === 1;

              return (
                <div
                  key={idx}
                  className={`solutions-challenge-card ${isFullWidth ? 'solutions-card-full-width' : ''}`}
                >
                  <div className={isFullWidth ? 'solutions-card-main-col' : ''}>
                    <div className="solutions-card-header">
                      <span className="solutions-warn-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="#ff0804" stroke="#ffffff" strokeWidth="1.5">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                          <line x1="12" y1="17" x2="12.01" y2="17" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                      </span>
                      <h3 className="solutions-card-title data-tabular">{ch.title}</h3>
                    </div>
                    <p className="solutions-card-text body-sm">{ch.text}</p>
                    <div className="solutions-spec-box">
                      <span className="solutions-spec-label data-tabular">RECOMMENDED SPECIFICATION</span>
                      <p className="solutions-spec-val data-tabular">{ch.recommendedSpec}</p>
                    </div>
                  </div>

                  {ch.statValue && (
                    <div className="solutions-stat-badge-box">
                      <div className="solutions-stat-number headline-md">{ch.statValue}</div>
                      <div className="solutions-stat-label data-tabular">{ch.statLabel}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Live Mapped Consumables & Systems for this Industry */}
      {mappedProducts && mappedProducts.length > 0 && (
        <section style={{ padding: '4rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <div className="solutions-container">
            <div className="solutions-sec-header">
              <div>
                <h2 className="solutions-sec-title headline-sm">RECOMMENDED CONSUMABLES FOR {industryName.toUpperCase()}</h2>
                <p className="body-sm" style={{ color: '#64748b', marginTop: '0.35rem' }}>
                  Laboratory-verified batch consumables engineered specifically for {industryName} environments.
                </p>
              </div>
              <div className="solutions-sec-tag data-tabular">SEC // 03</div>
            </div>
            <div className="solutions-sec-divider" aria-hidden="true" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
              {mappedProducts.map((prod) => {
                const prodImage = prod.image || (prod.images && prod.images[0]) || noImagePlaceholder;
                const tensile = prod.specifications ? prod.specifications.tensileStrength || prod.specifications.get?.('tensileStrength') : null;

                return (
                  <div
                    key={prod._id || prod.sku}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 1px 3px rgba(0,4,23,0.04)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    <div style={{ height: '180px', background: '#0b1329', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={prodImage}
                        alt={prod.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = noImagePlaceholder;
                        }}
                      />
                      <span
                        className="data-tabular"
                        style={{
                          position: 'absolute',
                          top: '10px',
                          left: '10px',
                          background: '#ff0804',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '2px',
                        }}
                      >
                        {prod.awsClass || 'AWS SPECIFIED'}
                      </span>
                    </div>

                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div className="data-tabular" style={{ fontSize: '12px', color: '#64748b', marginBottom: '0.35rem' }}>
                        SKU: {prod.sku}
                      </div>
                      <h3 className="headline-sm" style={{ fontSize: '16px', color: '#000417', marginBottom: '0.75rem', lineHeight: '1.3' }}>
                        {prod.name}
                      </h3>
                      <p className="body-sm" style={{ color: '#475569', fontSize: '13px', lineHeight: '1.5', marginBottom: '1.25rem', flex: 1 }}>
                        {prod.description?.slice(0, 110)}...
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                        <span className="data-tabular" style={{ fontSize: '12px', color: '#000417', fontWeight: 600 }}>
                          {prod.category}
                        </span>
                        <button
                          type="button"
                          className="data-tabular"
                          onClick={() => onViewProductDetails ? onViewProductDetails(prod.sku || prod._id) : null}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'none',
                            border: 'none',
                            color: '#ff0804',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          <span>VIEW SPECS</span>
                          <ArrowRight size={13} strokeWidth={2.6} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. Technical Compliance Section */}
      <section className="solutions-compliance-section">
        <div className="solutions-container">
          <div className="solutions-compliance-banner">
            {/* Left Content */}
            <div className="solutions-compliance-text-col">
              <h2 className="solutions-compliance-title headline-md">TECHNICAL COMPLIANCE &amp; APPROVALS</h2>
              <p className="solutions-compliance-desc body-sm">
                Our {industryName.toLowerCase()} consumables adhere strictly to international manufacturing and classification society standards, guaranteeing full heat-traceability and certified mechanical properties.
              </p>
              <a
                href="#quality-certificates"
                className="solutions-compliance-link"
                onClick={(e) => {
                  e.preventDefault();
                  if (onViewTechnicalDocs) onViewTechnicalDocs(industryName);
                }}
              >
                <span>View Quality Certificates for {industryName}</span>
                <ArrowRight size={14} strokeWidth={2.4} />
              </a>
            </div>

            {/* Right Badges Grid */}
            <div className="solutions-compliance-badges-grid">
              {complianceBadges.map((badgeText, bIdx) => (
                <div key={bIdx} className="solutions-cert-card">
                  <div className="solutions-cert-rosette" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="#ff0804" stroke="#ff0804">
                      <path d="M12 2l1.6 2.3 2.7-.8.7 2.7 2.7.7-.8 2.7 2.3 1.6-1.6 2.3.8 2.7-2.7.7-.7 2.7-2.7-.8-1.6 2.3-1.6-2.3-2.7.8-.7-2.7-2.7-.7.8-2.7-2.3-1.6 1.6-2.3-.8-2.7 2.7-.7.7-2.7 2.7.8z" />
                      <path d="M8.5 12l2.5 2.5 5-5" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="solutions-cert-code data-tabular">{badgeText}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
