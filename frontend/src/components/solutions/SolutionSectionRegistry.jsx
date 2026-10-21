import React from 'react';
import {
  ArrowRight,
  AlertTriangle,
  Info,
} from 'lucide-react';
import DynamicIcon from './DynamicIcon.jsx';

/**
 * Helper to ensure image URLs (Cloudinary, local assets, root-relative) resolve properly
 */
export function resolveImageUrl(img) {
  if (!img || typeof img !== 'string') return '/assets/solution-heavy-eng.jpg';
  const trimmed = img.trim();
  if (!trimmed) return '/assets/solution-heavy-eng.jpg';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
}

/**
 * 1. HERO SECTION RENDERER
 */
export function HeroSection({ data = {}, onAction }) {
  const eyebrowTag = data.eyebrowTag || 'INDUSTRY SOLUTIONS';
  const heading = data.heading || 'ENGINEERED SOLUTIONS';
  const description = data.description || '';
  const primaryCta = data.primaryCta || {};
  const secondaryCta = data.secondaryCta || {};
  const rawImage = data.image || data.bannerImageUrl || data.heroImage;
  const image = resolveImageUrl(rawImage);
  const imageAlt = data.imageAlt || heading;
  const overlay = data.imageOverlayCard || {};

  return (
    <section className="solutions-hero-section">
      <div className="solutions-container">
        <div className="solutions-hero-grid">
          {/* Left Column */}
          <div className="solutions-hero-text-col">
            {eyebrowTag && (
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
                <span>{eyebrowTag}</span>
              </div>
            )}

            <h1 className="solutions-hero-title headline-lg" style={{ textTransform: 'uppercase' }}>
              {heading}
            </h1>

            {description && (
              <p className="solutions-hero-desc body-md">
                {description}
              </p>
            )}

            {/* Actions */}
            <div className="solutions-hero-actions">
              {primaryCta.label && (
                <button
                  type="button"
                  className="solutions-btn-primary data-tabular"
                  onClick={() => onAction?.('primaryCta', primaryCta)}
                >
                  <span>{primaryCta.label}</span>
                  <ArrowRight size={15} strokeWidth={2.5} />
                </button>
              )}

              {secondaryCta.label && (
                <button
                  type="button"
                  className="solutions-btn-secondary data-tabular"
                  onClick={() => onAction?.('secondaryCta', secondaryCta)}
                >
                  <span>{secondaryCta.label}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Hero Image with HUD Card */}
          <div className="solutions-hero-img-col">
            <div className="solutions-img-frame">
              <img
                src={image}
                alt={imageAlt}
                className="solutions-hero-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/solution-heavy-eng.jpg';
                }}
              />

              {/* Technical HUD Overlay Card */}
              {overlay.enabled !== false && (
                <div className="solutions-hud-card">
                  {overlay.label && (
                    <div className="solutions-hud-header data-tabular">
                      <span>{overlay.label}</span>
                    </div>
                  )}
                  <div className="solutions-hud-gauge">
                    <div
                      className="solutions-hud-bar-fill"
                      style={{ width: `${overlay.progressPercent || 82}%` }}
                    />
                    <div
                      className="solutions-hud-bar-empty"
                      style={{ width: `${100 - (overlay.progressPercent || 82)}%` }}
                    />
                  </div>
                  {overlay.caption && (
                    <div className="solutions-hud-footer data-tabular">
                      <span>{overlay.caption}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 2. CHALLENGES & SOLUTIONS SECTION RENDERER
 */
export function ChallengesSection({ data = {} }) {
  const heading = data.heading || 'CHALLENGES & SOLUTIONS';
  const sectionLabel = data.sectionLabel || 'SEC // 02';
  const cards = data.cards || [];

  return (
    <section className="solutions-challenges-section">
      <div className="solutions-container">
        <div className="solutions-sec-header">
          <h2 className="solutions-sec-title headline-sm">{heading}</h2>
          {sectionLabel && <div className="solutions-sec-tag data-tabular">{sectionLabel}</div>}
        </div>
        <div className="solutions-sec-divider" aria-hidden="true" />

        <div className="solutions-challenges-grid">
          {cards.map((ch, idx) => {
            const isFullWidth = ch.layout === 'full' || (cards.length === 1);

            return (
              <div
                key={ch.id || idx}
                className={`solutions-challenge-card ${isFullWidth ? 'solutions-card-full-width' : ''}`}
              >
                <div className={isFullWidth ? 'solutions-card-main-col' : ''}>
                  <div className="solutions-card-header">
                    <span className="solutions-warn-icon" aria-hidden="true">
                      {ch.icon ? (
                        <DynamicIcon name={ch.icon} size={18} color="#ffffff" strokeWidth={2} />
                      ) : (
                        <AlertTriangle size={18} color="#ffffff" />
                      )}
                    </span>
                    <h3 className="solutions-card-title data-tabular">{ch.title}</h3>
                  </div>

                  {ch.description && (
                    <p className="solutions-card-text body-sm">{ch.description}</p>
                  )}

                  {ch.specText && (
                    <div className="solutions-spec-box">
                      <span className="solutions-spec-label data-tabular">
                        {ch.specLabel || 'RECOMMENDED SPECIFICATION'}
                      </span>
                      <p className="solutions-spec-val data-tabular">{ch.specText}</p>
                    </div>
                  )}
                </div>

                {ch.metricValue && (
                  <div className="solutions-stat-badge-box">
                    <div className="solutions-stat-number headline-md">{ch.metricValue}</div>
                    {ch.metricLabel && (
                      <div className="solutions-stat-label data-tabular">{ch.metricLabel}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * 3. TECHNICAL COMPLIANCE SECTION RENDERER
 */
export function ComplianceSection({ data = {}, onAction }) {
  const heading = data.heading || 'TECHNICAL COMPLIANCE';
  const description = data.description || '';
  const link = data.link || {};
  const badges = data.badges || [];

  return (
    <section className="solutions-compliance-section">
      <div className="solutions-container">
        <div className="solutions-compliance-banner">
          {/* Left Column */}
          <div className="solutions-compliance-text-col">
            <h2 className="solutions-compliance-title headline-md">{heading}</h2>
            {description && (
              <p className="solutions-compliance-desc body-sm">
                {description}
              </p>
            )}

            {link.label && (
              <a
                href={link.url || '#quality-certificates'}
                className="solutions-compliance-link"
                onClick={(e) => {
                  e.preventDefault();
                  onAction?.('complianceLink', link);
                }}
              >
                <span>{link.label}</span>
                <ArrowRight size={14} strokeWidth={2.4} />
              </a>
            )}
          </div>

          {/* Right Badges Grid */}
          <div className="solutions-compliance-badges-grid">
            {badges.map((badge, bIdx) => (
              <div key={bIdx} className="solutions-cert-card">
                <div className="solutions-cert-rosette" aria-hidden="true">
                  {badge.icon ? (
                    <DynamicIcon name={badge.icon} size={18} color="#ff0804" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="#ff0804" stroke="#ff0804">
                      <path d="M12 2l1.6 2.3 2.7-.8.7 2.7 2.7.7-.8 2.7 2.3 1.6-1.6 2.3.8 2.7-2.7.7-.7 2.7-2.7-.8-1.6 2.3-1.6-2.3-2.7.8-.7-2.7-2.7-.7.8-2.7-2.3-1.6 1.6-2.3-.8-2.7 2.7-.7.7-2.7 2.7.8z" />
                      <path d="M8.5 12l2.5 2.5 5-5" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="solutions-cert-code data-tabular">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 4. RICH TEXT / METHODOLOGY SECTION RENDERER
 */
export function RichTextSection({ data = {} }) {
  const heading = data.heading || '';
  const content = data.content || '';
  const calloutType = data.calloutType || 'Engineering Note';
  const calloutText = data.calloutText || '';

  return (
    <section className="solutions-richtext-section">
      <div className="solutions-container">
        <div className="solutions-richtext-card">
          {heading && <h2 className="solutions-richtext-title headline-sm">{heading}</h2>}
          {content && <p className="solutions-richtext-body body-md">{content}</p>}

          {calloutText && (
            <div className="solutions-richtext-callout">
              <div className="callout-badge data-tabular">
                <Info size={14} />
                <span>{calloutType}</span>
              </div>
              <p className="callout-text">{calloutText}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * 5. CTA CONVERSION BANNER RENDERER
 */
export function CtaBannerSection({ data = {}, onAction }) {
  const eyebrow = data.eyebrow || 'NEED BESPOKE WELDING PROCEDURES?';
  const heading = data.heading || 'Custom Metallurgical Consultation';
  const description = data.description || '';
  const primaryCta = data.primaryCta || {};
  const secondaryCta = data.secondaryCta || {};
  const theme = data.theme || 'dark';

  return (
    <section className={`solutions-cta-banner-section theme-${theme}`}>
      <div className="solutions-container">
        <div className="solutions-cta-inner">
          {eyebrow && <div className="cta-eyebrow data-tabular">{eyebrow}</div>}
          <h2 className="cta-heading headline-md">{heading}</h2>
          {description && <p className="cta-desc body-md">{description}</p>}

          <div className="cta-actions-row">
            {primaryCta.label && (
              <button
                type="button"
                className="solutions-btn-primary data-tabular"
                onClick={() => onAction?.('primaryCta', primaryCta)}
              >
                <span>{primaryCta.label}</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            )}

            {secondaryCta.label && (
              <button
                type="button"
                className="solutions-btn-secondary data-tabular"
                onClick={() => onAction?.('secondaryCta', secondaryCta)}
              >
                <span>{secondaryCta.label}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export const SECTION_RENDERER_REGISTRY = {
  hero: HeroSection,
  challenges: ChallengesSection,
  compliance: ComplianceSection,
  richText: RichTextSection,
  ctaBanner: CtaBannerSection,
};

export default function RenderSection({ section, onAction }) {
  if (!section || section.visible === false) return null;
  const Component = SECTION_RENDERER_REGISTRY[section.type];
  if (!Component) {
    return (
      <div className="solutions-unknown-section">
        <p>Unregistered section type: {section.type}</p>
      </div>
    );
  }
  return <Component data={section.data || {}} onAction={onAction} />;
}
