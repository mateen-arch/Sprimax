import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { getIndustries } from '../api/industries.js';
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

const LOCAL_ASSET_MAP = {
  'fabrication': sectorFabrication,
  'sector-fabrication': sectorFabrication,
  'construction': sectorConstruction,
  'sector-construction': sectorConstruction,
  'automotive': sectorAutomotive,
  'sector-automotive': sectorAutomotive,
  'heavy-engineering': sectorHeavyEng,
  'heavy-eng': sectorHeavyEng,
  'sector-heavy-eng': sectorHeavyEng,
  'maintenance-mro': sectorMaintenance,
  'maintenance': sectorMaintenance,
  'sector-maintenance': sectorMaintenance,
  'power-plants': sectorPowerPlants,
  'sector-power-plants': sectorPowerPlants,
  'infrastructure': sectorInfrastructure,
  'sector-infrastructure': sectorInfrastructure,
  'manufacturing': sectorManufacturing,
  'sector-manufacturing': sectorManufacturing,
  'oil-gas': sectorOilGas,
  'sector-oil-gas': sectorOilGas,
};

function resolveIndustryImage(industry) {
  if (!industry) return noImagePlaceholder;
  const img = industry.image;

  // 1. Prioritize image fed from admin database (Cloudinary, HTTPS/HTTP, or uploaded URL)
  if (img && typeof img === 'string' && img.trim() !== '') {
    const trimmed = img.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return getOptimizedImageUrl(trimmed, 'card');
    }
    return trimmed;
  }

  // 2. Fallback to bundled asset only if no image was provided in admin panel
  const slug = (industry.slug || '').toLowerCase().trim();
  if (LOCAL_ASSET_MAP[slug]) {
    return LOCAL_ASSET_MAP[slug];
  }

  return noImagePlaceholder;
}

export default function CompanyPage({ onViewSolutions }) {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchActiveIndustries() {
      try {
        setLoading(true);
        setError(null);
        const data = await getIndustries({ status: 'Active' });
        if (isMounted) {
          setIndustries(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching industries from database:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load industries');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchActiveIndustries();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="company-page-wrapper">
      {/* 1. Header / Hero Section */}
      <section className="company-hero-section">
        <div className="company-hero-container">
          <div className="company-hero-grid">
            {/* Left Column: Eyebrow, Main Headline & Description */}
            <div className="company-hero-text-col">
              {/* Global Sectors Tag */}
              <div className="company-eyebrow-pill data-tabular">
                <span className="company-red-dot" aria-hidden="true" />
                <span>GLOBAL SECTORS</span>
              </div>

              {/* Main Headline */}
              <h1 className="company-hero-title headline-lg">
                Engineered for High-<br />
                Performance<br />
                Environments.
              </h1>

              {/* Subtitle Description */}
              <p className="company-hero-desc body-md">
                Delivering structural integrity and precision welding solutions across critical heavy industry sectors globally. Our consumables meet the most stringent specifications.
              </p>
            </div>

            {/* Right Column: Architectural Bracket Framed Triptych Image */}
            <div className="company-hero-img-col">
              <div className="company-triptych-frame-wrap">
                {/* Architectural Corner Brackets (Top-Left & Bottom-Right) */}
                <div className="company-bracket-tl" aria-hidden="true" />
                <div className="company-bracket-br" aria-hidden="true" />

                <div className="company-photo-card">
                  <img 
                    src={companyHeroTriptych} 
                    alt="Offshore Oil Rig, Automotive Robotics, and Heavy Engineering Sectors" 
                    className="company-triptych-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Global Sectors Card Grid Section (Real-Time Database Data) */}
      <section className="company-sectors-section">
        <div className="company-sectors-container">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem', color: '#64748b' }}>
              <Loader2 size={36} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '15px', fontWeight: 500 }}>Loading industrial sectors from database...</p>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center', background: '#fff', border: '1px solid #fee2e2', borderRadius: '4px', gap: '1rem' }}>
              <AlertCircle size={32} color="#dc2626" />
              <p style={{ color: '#991b1b', fontWeight: 600 }}>{error}</p>
              <button 
                type="button" 
                onClick={() => window.location.reload()}
                style={{ padding: '0.5rem 1.25rem', background: '#000417', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 600 }}
              >
                Retry
              </button>
            </div>
          ) : industries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
              <p style={{ fontSize: '16px' }}>No industrial sectors available at this time.</p>
            </div>
          ) : (
            <div className="company-sectors-grid">
              {industries.map((industry) => {
                const imageSrc = resolveIndustryImage(industry);
                const title = industry.name || industry.title || 'Industrial Sector';
                const desc = industry.description || '';
                const sectorKey = industry.slug || industry._id || industry.id;

                return (
                  <article key={industry._id || industry.id || industry.slug} className="company-sector-card">
                    <div className="company-card-img-box">
                      <img 
                        src={imageSrc} 
                        alt={`${title} industrial sector application`} 
                        className="company-card-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = noImagePlaceholder;
                        }}
                      />
                    </div>

                    <div className="company-card-body">
                      <h2 className="company-card-title headline-sm">{title}</h2>
                      <p className="company-card-desc body-sm">{desc}</p>
                      
                      <button 
                        type="button" 
                        className="company-card-link data-tabular"
                        onClick={() => onViewSolutions ? onViewSolutions(sectorKey) : null}
                      >
                        <span>VIEW SOLUTIONS</span>
                        <ArrowRight size={13} strokeWidth={2.6} className="company-link-arrow" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
