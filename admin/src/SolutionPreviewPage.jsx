import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Send,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { fetchAdminSolutionById, publishSolutionApi } from './api/solutions.js';
import { fetchIndustryById } from './api/industries.js';
import SolutionPageRenderer from './components/solutions/SolutionPageRenderer.jsx';
import './SolutionPreviewPage.css';

export default function SolutionPreviewPage({
  solutionId,
  onBackToEditor,
}) {
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!solutionId) return;

    setLoading(true);
    fetchAdminSolutionById(solutionId)
      .then((res) => {
        if (isMounted) setSolution(res.solution);
      })
      .catch(async () => {
        // Fallback: try loading from Industry record
        try {
          const ind = await fetchIndustryById(solutionId);
          if (isMounted && ind) {
            const fallbackSolution = {
              _id: ind._id || ind.id,
              title: ind.name || 'Industry Solution',
              slug: ind.slug || 'industry-solution',
              status: ind.status === 'Active' ? 'Published' : 'Draft',
              breadcrumb: [
                { label: 'Company', url: '/company' },
                { label: ind.name || 'Solution', url: `/solutions/${ind.slug}` },
              ],
              sections: [
                {
                  id: 'sec-hero-prev',
                  type: 'hero',
                  order: 0,
                  visible: true,
                  data: {
                    eyebrowTag: `INDUSTRY SOLUTIONS // ${(ind.name || 'SECTOR').toUpperCase()}`,
                    heading: ind.solutionHeadline || `${(ind.name || 'SECTOR').toUpperCase()} SOLUTIONS`,
                    description: ind.solutionDescription || ind.description || '',
                    primaryCta: { label: 'SUBMIT PROJECT REQUIREMENTS', url: '/submit-requirements' },
                    secondaryCta: { label: 'VIEW TECHNICAL DOCS', url: '/resources' },
                    image: ind.solutionBanner || ind.image || '/assets/solution-heavy-eng.jpg',
                    imageAlt: ind.name || 'Industry Solution',
                    imageOverlayCard: {
                      enabled: true,
                      label: ind.hudGaugeLabel || 'DATA//YIELD_STRENGTH_REQUIREMENTS',
                      progressPercent: ind.hudGaugePercent || 82,
                      caption: ind.hudVerifiedText || 'HIGH-INTEGRITY WELD VERIFIED',
                    },
                  },
                },
                {
                  id: 'sec-challenges-prev',
                  type: 'challenges',
                  order: 1,
                  visible: true,
                  data: {
                    heading: 'CHALLENGES & SOLUTIONS',
                    sectionLabel: 'SEC // 02',
                    cards: (ind.challenges || []).map((ch, idx) => ({
                      id: `ch-prev-${idx}`,
                      title: ch.title || '',
                      description: ch.text || '',
                      specLabel: 'RECOMMENDED SPECIFICATION',
                      specText: ch.recommendedSpec || '',
                      metricValue: ch.statValue || '',
                      metricLabel: ch.statLabel || '',
                      icon: idx === 0 ? 'AlertTriangle' : idx === 1 ? 'Shield' : 'Flame',
                      layout: idx === 2 ? 'full' : 'half',
                    })),
                  },
                },
                {
                  id: 'sec-compliance-prev',
                  type: 'compliance',
                  order: 2,
                  visible: true,
                  data: {
                    eyebrowTag: 'STANDARDS & ACCREDITATION',
                    heading: 'GLOBAL TECHNICAL COMPLIANCE & QUALITY ETHOS',
                    subheading: 'Certified for Critical Structural Fabrication',
                    badges: ind.complianceBadges || ['AWS D1.1', 'ASME Sec IX', 'ISO 3834-2'],
                  },
                },
              ],
            };
            setSolution(fallbackSolution);
            return;
          }
        } catch (indErr) {
          if (isMounted) setError(indErr.message || 'Failed to load preview');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [solutionId]);

  const handlePublishNow = async () => {
    if (!solution?._id) return;
    setIsPublishing(true);
    try {
      const res = await publishSolutionApi(solution._id);
      setSolution(res.solution);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 4000);
    } catch (err) {
      alert(err.message || 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="sol-preview-loading">
        <div className="preview-spinner" />
        <p>Generating technical solutions preview...</p>
      </div>
    );
  }

  if (error || !solution) {
    return (
      <div className="sol-preview-error">
        <AlertTriangle size={36} color="#ff0804" />
        <h3>Failed to generate preview</h3>
        <p>{error || 'Solution page not found'}</p>
        <button type="button" onClick={onBackToEditor} className="btn-preview-back">
          Back to Editor
        </button>
      </div>
    );
  }

  return (
    <div className="blog-preview-container">
      {/* Top Banner Notice & Viewport Switcher - Matching Blog Preview Page Exactly */}
      <header className="preview-top-toolbar">
        <div className="toolbar-left">
          <button type="button" onClick={onBackToEditor} className="btn-exit-preview">
            <ArrowLeft size={16} />
            <span>Back to Editor</span>
          </button>

          <div className="preview-mode-tag">
            <Eye size={14} />
            <span>Preview Mode (Draft &amp; Server Simulation)</span>
          </div>
        </div>

        {/* Viewport Toggles (Desktop, Tablet, Mobile) */}
        <div className="toolbar-center">
          <div className="viewport-toggle-group">
            <button
              type="button"
              className={`btn-viewport ${viewport === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewport('desktop')}
              title="Desktop View (100%)"
            >
              <Monitor size={16} />
            </button>
            <button
              type="button"
              className={`btn-viewport ${viewport === 'tablet' ? 'active' : ''}`}
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
            >
              <Tablet size={16} />
            </button>
            <button
              type="button"
              className={`btn-viewport ${viewport === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewport('mobile')}
              title="Mobile View (375px)"
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <span className="slug-display">
            /solutions/{solution.slug}
          </span>

          {solution.status !== 'Published' ? (
            <button
              type="button"
              className="btn-preview-publish"
              onClick={handlePublishNow}
              disabled={isPublishing}
            >
              <Send size={14} />
              <span>{isPublishing ? 'Publishing...' : 'Publish Live Now'}</span>
            </button>
          ) : (
            <span className="live-published-pill">
              <CheckCircle size={13} />
              <span>Live Published</span>
            </span>
          )}

          {publishSuccess && (
            <span className="publish-success-flash">Published!</span>
          )}
        </div>
      </header>

      {/* Viewport Outer Scroll Container */}
      <div className="preview-viewport-outer">
        <div className={`preview-viewport-frame frame-${viewport}`}>
          {/* Solution Page Renderer (Mirrors the public website detail page with breadcrumbs and sections) */}
          <SolutionPageRenderer
            solution={solution}
            onBack={onBackToEditor}
            previewMode={true}
          />
        </div>
      </div>
    </div>
  );
}
