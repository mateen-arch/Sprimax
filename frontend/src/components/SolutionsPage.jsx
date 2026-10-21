import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import SolutionPageRenderer from './solutions/SolutionPageRenderer.jsx';
import { getIndustryById } from '../api/industries.js';
import solutionHeavyEngImg from '../assets/solution-heavy-eng.jpg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SolutionsPage({
  industrySlug = 'heavy-engineering',
  onBackToCompany,
  onSubmitRequirements,
  onViewTechnicalDocs,
  onViewProductDetails,
}) {
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSolutionData() {
      setLoading(true);
      setError(null);

      const targetSlug = (industrySlug || 'heavy-engineering').toLowerCase().trim();

      // 1. First, attempt to load published solution from CMS API
      try {
        const res = await fetch(`${API_BASE}/solutions/public/${encodeURIComponent(targetSlug)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.solution) {
            setSolution(data.solution);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[SolutionsPage] CMS API request failed, falling back to legacy industry data:', err);
      }

      // 2. Fallback: load from existing getIndustryById
      try {
        const ind = await getIndustryById(targetSlug);
        if (isMounted && ind) {
          // Adapt legacy industry object to standard SolutionPage schema
          const fallbackSolution = {
            title: ind.name || 'Heavy Engineering',
            slug: ind.slug || targetSlug,
            status: 'Published',
            breadcrumb: [
              { label: 'Company', url: '/company' },
              { label: ind.name || 'Heavy Engineering', url: `/solutions/${ind.slug || targetSlug}` },
            ],
            sections: [
              {
                id: 'sec-hero',
                type: 'hero',
                order: 0,
                visible: true,
                data: {
                  eyebrowTag: `INDUSTRY SOLUTIONS // ${(ind.name || 'HEAVY ENGINEERING').toUpperCase()}`,
                  heading: ind.solutionHeadline || (ind.name ? `${ind.name.toUpperCase()} & ADVANCED CONSUMABLES` : 'HEAVY ENGINEERING & HEAVY EQUIPMENT'),
                  description: ind.solutionDescription || ind.description || 'Engineered welding solutions for extreme load-bearing structures and heavy manufacturing.',
                  primaryCta: { label: 'SUBMIT PROJECT REQUIREMENTS', url: '/submit-requirements' },
                  secondaryCta: { label: 'VIEW TECHNICAL DOCS', url: '/resources' },
                  image: ind.solutionBanner || ind.image || solutionHeavyEngImg,
                  imageAlt: ind.name || 'Heavy Engineering Applications',
                  imageOverlayCard: {
                    enabled: true,
                    label: ind.hudGaugeLabel || 'DATA//YIELD_STRENGTH_REQUIREMENTS',
                    progressPercent: ind.hudGaugePercent || 82,
                    caption: ind.hudVerifiedText || 'HIGH-INTEGRITY WELD VERIFIED',
                  },
                },
              },
              {
                id: 'sec-challenges',
                type: 'challenges',
                order: 1,
                visible: true,
                data: {
                  heading: 'CHALLENGES & SOLUTIONS',
                  sectionLabel: 'SEC // 02',
                  cards: (ind.challenges || []).map((ch, i) => ({
                    id: `ch-${i}`,
                    title: ch.title,
                    icon: i === 0 ? 'AlertTriangle' : i === 1 ? 'Shield' : 'Flame',
                    description: ch.text,
                    specLabel: 'RECOMMENDED SPECIFICATION',
                    specText: ch.recommendedSpec,
                    metricValue: ch.statValue,
                    metricLabel: ch.statLabel,
                    layout: i === 2 ? 'full' : 'half',
                  })),
                },
              },
              {
                id: 'sec-compliance',
                type: 'compliance',
                order: 2,
                visible: true,
                data: {
                  heading: 'TECHNICAL COMPLIANCE',
                  description: `Our ${(ind.name || 'heavy engineering').toLowerCase()} consumables adhere strictly to international manufacturing and classification society standards, guaranteeing full heat-traceability and certified mechanical properties.`,
                  link: {
                    label: `View Quality Certificates for ${ind.name || 'Heavy Engineering'}`,
                    url: '#quality-certificates',
                  },
                  badges: (ind.complianceBadges || ['AWS D1.1', 'ASME Sec IX', 'ISO 3834-2', "Lloyd's Reg"]).map((b) => ({
                    label: b,
                    icon: 'Award',
                  })),
                },
              },
            ],
          };

          setSolution(fallbackSolution);
          setLoading(false);
          return;
        }
      } catch (legacyErr) {
        if (isMounted) {
          setError(legacyErr.message || 'Unable to load industry solutions data');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSolutionData();

    return () => {
      isMounted = false;
    };
  }, [industrySlug]);

  const handleAction = (type, payload) => {
    if (type === 'primaryCta') {
      if (onSubmitRequirements) {
        onSubmitRequirements({
          name: solution?.title || 'Heavy Engineering',
          slug: solution?.slug || industrySlug,
        });
      }
    } else if (type === 'secondaryCta' || type === 'complianceLink') {
      if (onViewTechnicalDocs) {
        onViewTechnicalDocs(solution?.title || 'Heavy Engineering');
      }
    } else if (type === 'breadcrumb') {
      if (payload?.url === '/company' && onBackToCompany) {
        onBackToCompany();
      }
    }
  };

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

  if (error || !solution) {
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

  return (
    <SolutionPageRenderer
      solution={solution}
      onAction={handleAction}
      onBack={onBackToCompany}
      previewMode={false}
    />
  );
}
