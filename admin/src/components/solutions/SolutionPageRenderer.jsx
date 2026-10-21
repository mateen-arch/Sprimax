import React from 'react';
import { ArrowLeft } from 'lucide-react';
import RenderSection from './SolutionSectionRegistry.jsx';
import './SolutionRenderer.css';

export default function SolutionPageRenderer({
  solution,
  onAction,
  onBack,
  previewMode = false,
}) {
  if (!solution) {
    return (
      <div className="solutions-renderer-empty">
        <p>No solution content available to display.</p>
      </div>
    );
  }

  const breadcrumbs = solution.breadcrumb || [
    { label: 'Company', url: '/company' },
    { label: solution.title || 'Solution', url: '' },
  ];

  const sections = Array.isArray(solution.sections) ? solution.sections : [];

  return (
    <div className={`solutions-page-wrapper ${previewMode ? 'solutions-preview-active' : ''}`}>
      {/* 1. Breadcrumbs Nav Bar */}
      <section className="solutions-nav-bar">
        <div className="solutions-container">
          <div className="solutions-breadcrumbs">
            {onBack && (
              <>
                <button
                  type="button"
                  className="solutions-back-btn data-tabular"
                  onClick={onBack}
                  aria-label="Back"
                >
                  <ArrowLeft size={15} strokeWidth={2.4} />
                  <span>Back</span>
                </button>
                <span className="solutions-breadcrumb-sep">/</span>
              </>
            )}

            {breadcrumbs.map((bc, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="solutions-breadcrumb-slash">/</span>}
                  {isLast ? (
                    <span className="solutions-breadcrumb-active">{bc.label}</span>
                  ) : (
                    <button
                      type="button"
                      className="solutions-breadcrumb-link"
                      onClick={() => onAction?.('breadcrumb', bc)}
                    >
                      {bc.label}
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Dynamic Ordered Sections Stream */}
      <div className="solutions-sections-stream">
        {sections
          .filter((sec) => sec.visible !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((section, idx) => (
            <RenderSection
              key={section.id || `${section.type}-${idx}`}
              section={section}
              onAction={onAction}
            />
          ))}

        {sections.length === 0 && (
          <div className="solutions-empty-notice">
            <p>This solution page has no visible sections yet. Add sections in the editor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
