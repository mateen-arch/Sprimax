import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  Award,
  FileText,
  Megaphone,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Copy,
  Sliders,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import ImageUploader from './ImageUploader.jsx';
import IconPicker from './IconPicker.jsx';
import './SectionEditorRegistry.css';

export const SECTION_METADATA = {
  hero: {
    label: 'Hero Section',
    description: 'Header, dual CTAs, sector image, and technical HUD gauge overlay card',
    icon: Sparkles,
  },
  challenges: {
    label: 'Challenges & Solutions',
    description: 'Grid of technical challenge cards with specifications and performance metrics',
    icon: AlertTriangle,
  },
  compliance: {
    label: 'Technical Compliance',
    description: 'Dark banner with quality certificates link and classification society badges',
    icon: Award,
  },
  richText: {
    label: 'Engineering Methodology',
    description: 'In-depth metallurgical narrative and highlighted engineering notes',
    icon: FileText,
  },
  ctaBanner: {
    label: 'CTA Conversion Banner',
    description: 'Call-to-action banner for custom WPS/PQR engineering consultations',
    icon: Megaphone,
  },
};

export function createDefaultSectionData(type) {
  switch (type) {
    case 'hero':
      return {
        eyebrowTag: 'INDUSTRY SOLUTIONS // ENGINEERING',
        heading: 'INDUSTRIAL SOLUTIONS & ADVANCED CONSUMABLES',
        description: 'Engineered welding solutions designed for structural integrity and severe operating environments.',
        primaryCta: { label: 'SUBMIT PROJECT REQUIREMENTS', url: '/submit-requirements', openInNewTab: false },
        secondaryCta: { label: 'VIEW TECHNICAL DOCS', url: '/resources', openInNewTab: false },
        image: '',
        imageAlt: 'Industry solution application',
        imageOverlayCard: {
          enabled: true,
          label: 'DATA//YIELD_STRENGTH_REQUIREMENTS',
          progressPercent: 82,
          caption: 'HIGH-INTEGRITY WELD VERIFIED',
        },
      };
    case 'challenges':
      return {
        heading: 'CHALLENGES & SOLUTIONS',
        sectionLabel: 'SEC // 02',
        cards: [
          {
            id: 'ch-' + Date.now() + '-1',
            title: 'THICK SECTION WELDING',
            icon: 'AlertTriangle',
            description: 'Joining heavy structural sections requires strict heat input and crack prevention.',
            specLabel: 'RECOMMENDED SPECIFICATION',
            specText: 'Low-hydrogen basic-coated electrodes (AWS E7018-1).',
            metricValue: '> 9 kg/hr',
            metricLabel: 'Deposition Velocity',
            layout: 'half',
          },
          {
            id: 'ch-' + Date.now() + '-2',
            title: 'EXTREME IMPACT TOUGHNESS',
            icon: 'Shield',
            description: 'Low-temperature impact absorption in demanding arctic or subsea environments.',
            specLabel: 'RECOMMENDED SPECIFICATION',
            specText: 'Nickel-alloyed flux-cored wire with verified Charpy V-Notch properties.',
            metricValue: '47J @ -40°C',
            metricLabel: 'CVN Toughness',
            layout: 'half',
          },
        ],
      };
    case 'compliance':
      return {
        heading: 'TECHNICAL COMPLIANCE',
        description: 'Our consumables adhere strictly to international manufacturing and classification society standards.',
        link: { label: 'View Quality Certificates', url: '#quality-certificates' },
        badges: [
          { label: 'AWS D1.1', icon: 'Award', certUrl: '' },
          { label: 'ASME Sec IX', icon: 'Award', certUrl: '' },
          { label: 'ISO 3834-2', icon: 'Award', certUrl: '' },
          { label: "Lloyd's Reg", icon: 'Award', certUrl: '' },
        ],
      };
    case 'richText':
      return {
        heading: 'ENGINEERING FIELD METHODOLOGY',
        content: 'Controlled heat input and preheat parameters prevent hydrogen-assisted cold cracking in high-strength alloys.',
        calloutType: 'Engineering Note',
        calloutText: 'Maintain interpass temperatures between 120°C and 180°C throughout all deposition sequences.',
      };
    case 'ctaBanner':
      return {
        eyebrow: 'NEED BESPOKE WELDING PROCEDURES?',
        heading: 'Custom Metallurgical Consultation & Procedure Development',
        description: 'Consult directly with our regional welding specialists to formulate certified WPS/PQR documentation.',
        primaryCta: { label: 'REQUEST CONSULTATION', url: '/contact', openInNewTab: false },
        secondaryCta: { label: 'DOWNLOAD CATALOGUE', url: '/resources', openInNewTab: false },
        theme: 'dark',
      };
    default:
      return {};
  }
}

/**
 * Hero Section Editor
 */
function HeroSectionEditor({ data = {}, onChange }) {
  const updateField = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const overlay = data.imageOverlayCard || {};

  return (
    <div className="section-editor-inner">
      <div className="form-field-row">
        <div className="form-field-col flex-1">
          <label className="sec-field-label">Eyebrow Tag (Monospace)</label>
          <input
            type="text"
            className="sec-input sec-input-mono"
            placeholder="e.g. INDUSTRY SOLUTIONS // HEAVY ENGINEERING"
            value={data.eyebrowTag || ''}
            onChange={(e) => updateField('eyebrowTag', e.target.value)}
          />
        </div>
      </div>

      <div className="form-field-row">
        <div className="form-field-col flex-1">
          <label className="sec-field-label">
            Main Heading <span className="req-star">*</span>
          </label>
          <input
            type="text"
            className="sec-input sec-input-heading"
            placeholder="e.g. HEAVY ENGINEERING & HEAVY EQUIPMENT"
            value={data.heading || ''}
            onChange={(e) => updateField('heading', e.target.value)}
          />
        </div>
      </div>

      <div className="form-field-row">
        <div className="form-field-col flex-1">
          <label className="sec-field-label">Hero Description</label>
          <textarea
            rows={3}
            className="sec-textarea"
            placeholder="Comprehensive description of the industry solution..."
            value={data.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>
      </div>

      <div className="form-field-grid-2">
        {/* Primary CTA */}
        <div className="sec-nested-box">
          <span className="sec-nested-title">Primary CTA Button</span>
          <div className="form-field-col">
            <label className="sec-field-label-sm">Label</label>
            <input
              type="text"
              className="sec-input"
              value={data.primaryCta?.label || ''}
              onChange={(e) =>
                updateField('primaryCta', { ...(data.primaryCta || {}), label: e.target.value })
              }
            />
          </div>
          <div className="form-field-col">
            <label className="sec-field-label-sm">Destination URL</label>
            <input
              type="text"
              className="sec-input sec-input-mono"
              placeholder="/submit-requirements"
              value={data.primaryCta?.url || ''}
              onChange={(e) =>
                updateField('primaryCta', { ...(data.primaryCta || {}), url: e.target.value })
              }
            />
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="sec-nested-box">
          <span className="sec-nested-title">Secondary CTA Button</span>
          <div className="form-field-col">
            <label className="sec-field-label-sm">Label</label>
            <input
              type="text"
              className="sec-input"
              value={data.secondaryCta?.label || ''}
              onChange={(e) =>
                updateField('secondaryCta', { ...(data.secondaryCta || {}), label: e.target.value })
              }
            />
          </div>
          <div className="form-field-col">
            <label className="sec-field-label-sm">Destination URL</label>
            <input
              type="text"
              className="sec-input sec-input-mono"
              placeholder="/resources"
              value={data.secondaryCta?.url || ''}
              onChange={(e) =>
                updateField('secondaryCta', { ...(data.secondaryCta || {}), url: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Hero Sector Image */}
      <div className="form-field-row" style={{ marginTop: '12px' }}>
        <div className="form-field-col flex-1">
          <label className="sec-field-label">Sector Hero Image (Upload or Cloudinary URL)</label>
          <ImageUploader
            value={data.image || ''}
            onChange={(url) => updateField('image', url)}
            altText={data.imageAlt || ''}
            onAltChange={(alt) => updateField('imageAlt', alt)}
            showAltInput={true}
            folder="sprimax/solutions"
            helpText="Upload photographic sector visual (high resolution recommended)"
          />
        </div>
      </div>

      {/* Technical HUD Overlay Card */}
      <div className="sec-nested-box hud-config-box">
        <div className="hud-header-toggle">
          <span className="sec-nested-title">Technical HUD Overlay Card (Floating on Sector Image)</span>
          <label className="toggle-switch-label">
            <input
              type="checkbox"
              checked={overlay.enabled !== false}
              onChange={(e) =>
                updateField('imageOverlayCard', { ...overlay, enabled: e.target.checked })
              }
            />
            <span className="toggle-text">Show HUD Card</span>
          </label>
        </div>

        {overlay.enabled !== false && (
          <div className="hud-fields-grid">
            <div className="form-field-col">
              <label className="sec-field-label-sm">Header Label (Monospace)</label>
              <input
                type="text"
                className="sec-input sec-input-mono"
                placeholder="DATA//YIELD_STRENGTH_REQUIREMENTS"
                value={overlay.label || ''}
                onChange={(e) =>
                  updateField('imageOverlayCard', { ...overlay, label: e.target.value })
                }
              />
            </div>

            <div className="form-field-col">
              <label className="sec-field-label-sm">
                Progress Gauge ({overlay.progressPercent || 0}%)
              </label>
              <div className="range-slider-row">
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="sec-range-input"
                  value={overlay.progressPercent !== undefined ? overlay.progressPercent : 82}
                  onChange={(e) =>
                    updateField('imageOverlayCard', {
                      ...overlay,
                      progressPercent: Number(e.target.value),
                    })
                  }
                />
                <span className="range-num-val">{overlay.progressPercent || 0}%</span>
              </div>
            </div>

            <div className="form-field-col">
              <label className="sec-field-label-sm">Footer Caption (Monospace)</label>
              <input
                type="text"
                className="sec-input sec-input-mono"
                placeholder="HIGH-INTEGRITY WELD VERIFIED"
                value={overlay.caption || ''}
                onChange={(e) =>
                  updateField('imageOverlayCard', { ...overlay, caption: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Challenges & Solutions Section Editor
 */
function ChallengesSectionEditor({ data = {}, onChange }) {
  const cards = data.cards || [];

  const updateField = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const updateCard = (index, updatedCard) => {
    const nextCards = [...cards];
    nextCards[index] = updatedCard;
    updateField('cards', nextCards);
  };

  const addCard = (layout = 'half') => {
    const newCard = {
      id: 'ch-' + Date.now(),
      title: 'NEW TECHNICAL CHALLENGE',
      icon: 'AlertTriangle',
      description: 'Describe the technical challenge faced in industrial fabrication.',
      specLabel: 'RECOMMENDED SPECIFICATION',
      specText: 'Recommended welding consumable or alloy specification.',
      metricValue: '> 10 kg/hr',
      metricLabel: 'Performance Metric',
      layout,
    };
    updateField('cards', [...cards, newCard]);
  };

  const removeCard = (index) => {
    updateField('cards', cards.filter((_, i) => i !== index));
  };

  const duplicateCard = (index) => {
    const cardToCopy = { ...cards[index], id: 'ch-' + Date.now() };
    const nextCards = [...cards];
    nextCards.splice(index + 1, 0, cardToCopy);
    updateField('cards', nextCards);
  };

  const moveCard = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= cards.length) return;
    const nextCards = [...cards];
    const [moved] = nextCards.splice(index, 1);
    nextCards.splice(target, 0, moved);
    updateField('cards', nextCards);
  };

  return (
    <div className="section-editor-inner">
      <div className="form-field-grid-2">
        <div className="form-field-col">
          <label className="sec-field-label">Section Heading</label>
          <input
            type="text"
            className="sec-input"
            value={data.heading || ''}
            onChange={(e) => updateField('heading', e.target.value)}
          />
        </div>

        <div className="form-field-col">
          <label className="sec-field-label">Section Tag / Number (Monospace)</label>
          <input
            type="text"
            className="sec-input sec-input-mono"
            placeholder="SEC // 02"
            value={data.sectionLabel || ''}
            onChange={(e) => updateField('sectionLabel', e.target.value)}
          />
        </div>
      </div>

      <div className="cards-builder-header">
        <span className="cards-builder-title">Challenge Cards ({cards.length})</span>
        <div className="cards-builder-actions">
          <button
            type="button"
            className="btn-add-item"
            onClick={() => addCard('half')}
          >
            <Plus size={14} />
            <span>Add Half Card</span>
          </button>
          <button
            type="button"
            className="btn-add-item"
            onClick={() => addCard('full')}
          >
            <Plus size={14} />
            <span>Add Full-Width Card</span>
          </button>
        </div>
      </div>

      <div className="cards-list">
        {cards.map((card, idx) => (
          <div key={card.id || idx} className={`card-editor-item layout-${card.layout || 'half'}`}>
            <div className="card-item-topbar">
              <div className="card-topbar-left">
                <span className="card-order-tag">#{idx + 1}</span>
                <span className="card-title-preview">{card.title || 'Untitled Card'}</span>
                <span className={`card-layout-badge ${card.layout === 'full' ? 'badge-full' : 'badge-half'}`}>
                  {card.layout === 'full' ? 'Full Width (Metric on Right)' : 'Half Width'}
                </span>
              </div>
              <div className="card-topbar-actions">
                <button
                  type="button"
                  className="card-action-btn"
                  onClick={() => moveCard(idx, -1)}
                  disabled={idx === 0}
                  title="Move Up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  className="card-action-btn"
                  onClick={() => moveCard(idx, 1)}
                  disabled={idx === cards.length - 1}
                  title="Move Down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  className="card-action-btn"
                  onClick={() => duplicateCard(idx)}
                  title="Duplicate Card"
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  className="card-action-btn card-delete-btn"
                  onClick={() => removeCard(idx)}
                  title="Delete Card"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="card-item-body">
              <div className="form-field-grid-3">
                <div className="form-field-col flex-2">
                  <label className="sec-field-label-sm">Card Title (Uppercase)</label>
                  <input
                    type="text"
                    className="sec-input sec-input-mono"
                    value={card.title || ''}
                    onChange={(e) => updateCard(idx, { ...card, title: e.target.value })}
                  />
                </div>

                <div className="form-field-col">
                  <IconPicker
                    label="Card Icon"
                    value={card.icon || 'AlertTriangle'}
                    onChange={(icon) => updateCard(idx, { ...card, icon })}
                  />
                </div>

                <div className="form-field-col">
                  <label className="sec-field-label-sm">Card Layout Mode</label>
                  <select
                    className="sec-select"
                    value={card.layout || 'half'}
                    onChange={(e) => updateCard(idx, { ...card, layout: e.target.value })}
                  >
                    <option value="half">Half Width (Stacked)</option>
                    <option value="full">Full Width (Side Metric Badge)</option>
                  </select>
                </div>
              </div>

              <div className="form-field-row">
                <div className="form-field-col flex-1">
                  <label className="sec-field-label-sm">Problem Description</label>
                  <textarea
                    rows={2}
                    className="sec-textarea"
                    value={card.description || ''}
                    onChange={(e) => updateCard(idx, { ...card, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field-grid-2">
                <div className="form-field-col">
                  <label className="sec-field-label-sm">Specification Label (Monospace)</label>
                  <input
                    type="text"
                    className="sec-input sec-input-mono"
                    placeholder="RECOMMENDED SPECIFICATION"
                    value={card.specLabel || ''}
                    onChange={(e) => updateCard(idx, { ...card, specLabel: e.target.value })}
                  />
                </div>
                <div className="form-field-col">
                  <label className="sec-field-label-sm">Recommended Spec Value</label>
                  <input
                    type="text"
                    className="sec-input sec-input-mono"
                    placeholder="e.g. AWS E7018-1 / E8018-G"
                    value={card.specText || ''}
                    onChange={(e) => updateCard(idx, { ...card, specText: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field-grid-2 metric-config-row">
                <div className="form-field-col">
                  <label className="sec-field-label-sm">Metric Number / Stat (Optional)</label>
                  <input
                    type="text"
                    className="sec-input sec-input-bold"
                    placeholder="e.g. > 9 kg/hr, 47J @ -40°C"
                    value={card.metricValue || ''}
                    onChange={(e) => updateCard(idx, { ...card, metricValue: e.target.value })}
                  />
                </div>
                <div className="form-field-col">
                  <label className="sec-field-label-sm">Metric Label (Monospace)</label>
                  <input
                    type="text"
                    className="sec-input sec-input-mono"
                    placeholder="e.g. Deposition Velocity, CVN Toughness"
                    value={card.metricLabel || ''}
                    onChange={(e) => updateCard(idx, { ...card, metricLabel: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Technical Compliance Section Editor
 */
function ComplianceSectionEditor({ data = {}, onChange }) {
  const badges = data.badges || [];

  const updateField = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const updateBadge = (index, updated) => {
    const nextBadges = [...badges];
    nextBadges[index] = updated;
    updateField('badges', nextBadges);
  };

  const addBadge = () => {
    const newBadge = { label: 'ISO 9001', icon: 'Award', certUrl: '' };
    updateField('badges', [...badges, newBadge]);
  };

  const removeBadge = (index) => {
    updateField('badges', badges.filter((_, i) => i !== index));
  };

  const moveBadge = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= badges.length) return;
    const nextBadges = [...badges];
    const [moved] = nextBadges.splice(index, 1);
    nextBadges.splice(target, 0, moved);
    updateField('badges', nextBadges);
  };

  return (
    <div className="section-editor-inner">
      <div className="form-field-row">
        <div className="form-field-col flex-1">
          <label className="sec-field-label">Compliance Banner Title</label>
          <input
            type="text"
            className="sec-input"
            value={data.heading || ''}
            onChange={(e) => updateField('heading', e.target.value)}
          />
        </div>
      </div>

      <div className="form-field-row">
        <div className="form-field-col flex-1">
          <label className="sec-field-label">Compliance Description Text</label>
          <textarea
            rows={2}
            className="sec-textarea"
            value={data.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>
      </div>

      <div className="form-field-grid-2">
        <div className="form-field-col">
          <label className="sec-field-label">Certificates Link Text</label>
          <input
            type="text"
            className="sec-input"
            value={data.link?.label || ''}
            onChange={(e) =>
              updateField('link', { ...(data.link || {}), label: e.target.value })
            }
          />
        </div>
        <div className="form-field-col">
          <label className="sec-field-label">Certificates Link URL / Anchor</label>
          <input
            type="text"
            className="sec-input sec-input-mono"
            placeholder="#quality-certificates"
            value={data.link?.url || ''}
            onChange={(e) =>
              updateField('link', { ...(data.link || {}), url: e.target.value })
            }
          />
        </div>
      </div>

      {/* Compliance Badges List */}
      <div className="cards-builder-header" style={{ marginTop: '16px' }}>
        <span className="cards-builder-title">Accreditation Rosette Badges ({badges.length})</span>
        <button type="button" className="btn-add-item" onClick={addBadge}>
          <Plus size={14} />
          <span>Add Badge</span>
        </button>
      </div>

      <div className="badges-list-grid">
        {badges.map((badge, idx) => (
          <div key={idx} className="badge-item-editor">
            <div className="badge-order-col">
              <span className="badge-order-num">#{idx + 1}</span>
              <button
                type="button"
                className="mini-arrow-btn"
                disabled={idx === 0}
                onClick={() => moveBadge(idx, -1)}
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                className="mini-arrow-btn"
                disabled={idx === badges.length - 1}
                onClick={() => moveBadge(idx, 1)}
              >
                <ChevronDown size={12} />
              </button>
            </div>

            <div className="badge-inputs-col">
              <div className="form-field-col">
                <label className="sec-field-label-sm">Code / Standard Name</label>
                <input
                  type="text"
                  className="sec-input sec-input-mono"
                  placeholder="AWS D1.1, ASME Sec IX"
                  value={badge.label || ''}
                  onChange={(e) => updateBadge(idx, { ...badge, label: e.target.value })}
                />
              </div>

              <div className="form-field-col">
                <IconPicker
                  label="Badge Rosette Icon"
                  value={badge.icon || 'Award'}
                  onChange={(icon) => updateBadge(idx, { ...badge, icon })}
                />
              </div>

              <div className="form-field-col">
                <label className="sec-field-label-sm">Certificate Download URL (Optional)</label>
                <input
                  type="text"
                  className="sec-input sec-input-mono"
                  placeholder="https://... or /downloads/cert.pdf"
                  value={badge.certUrl || ''}
                  onChange={(e) => updateBadge(idx, { ...badge, certUrl: e.target.value })}
                />
              </div>
            </div>

            <button
              type="button"
              className="badge-remove-btn"
              onClick={() => removeBadge(idx)}
              title="Delete Badge"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Rich Text / Engineering Methodology Editor
 */
function RichTextSectionEditor({ data = {}, onChange }) {
  const updateField = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="section-editor-inner">
      <div className="form-field-row">
        <div className="form-field-col flex-1">
          <label className="sec-field-label">Section Heading</label>
          <input
            type="text"
            className="sec-input"
            value={data.heading || ''}
            onChange={(e) => updateField('heading', e.target.value)}
          />
        </div>
      </div>

      <div className="form-field-row">
        <div className="form-field-col flex-1">
          <label className="sec-field-label">Content Body / Methodology</label>
          <textarea
            rows={4}
            className="sec-textarea"
            placeholder="Detailed engineering narrative, metallurgy standards, and field procedures..."
            value={data.content || ''}
            onChange={(e) => updateField('content', e.target.value)}
          />
        </div>
      </div>

      <div className="sec-nested-box">
        <span className="sec-nested-title">Highlighted Engineering Note / Callout</span>
        <div className="form-field-grid-2">
          <div className="form-field-col">
            <label className="sec-field-label-sm">Callout Tag / Type</label>
            <input
              type="text"
              className="sec-input sec-input-mono"
              placeholder="e.g. Engineering Note, Warning, Critical Parameter"
              value={data.calloutType || ''}
              onChange={(e) => updateField('calloutType', e.target.value)}
            />
          </div>
          <div className="form-field-col">
            <label className="sec-field-label-sm">Callout Text</label>
            <textarea
              rows={2}
              className="sec-textarea"
              placeholder="Specific temperature range, flux ratio, or welding limitation..."
              value={data.calloutText || ''}
              onChange={(e) => updateField('calloutText', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * CTA Conversion Banner Editor
 */
function CtaBannerSectionEditor({ data = {}, onChange }) {
  const updateField = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="section-editor-inner">
      <div className="form-field-grid-2">
        <div className="form-field-col">
          <label className="sec-field-label">Eyebrow Tag (Monospace)</label>
          <input
            type="text"
            className="sec-input sec-input-mono"
            placeholder="NEED BESPOKE WELDING PROCEDURES?"
            value={data.eyebrow || ''}
            onChange={(e) => updateField('eyebrow', e.target.value)}
          />
        </div>
        <div className="form-field-col">
          <label className="sec-field-label">Visual Theme</label>
          <select
            className="sec-select"
            value={data.theme || 'dark'}
            onChange={(e) => updateField('theme', e.target.value)}
          >
            <option value="dark">Dark Industrial Navy (#0a1118)</option>
            <option value="accent">Sprimax Red Accent (#ff0804)</option>
            <option value="light">Clean Technical White (#ffffff)</option>
          </select>
        </div>
      </div>

      <div className="form-field-row">
        <div className="form-field-col flex-1">
          <label className="sec-field-label">Banner Heading</label>
          <input
            type="text"
            className="sec-input"
            value={data.heading || ''}
            onChange={(e) => updateField('heading', e.target.value)}
          />
        </div>
      </div>

      <div className="form-field-row">
        <div className="form-field-col flex-1">
          <label className="sec-field-label">Supporting Description</label>
          <textarea
            rows={2}
            className="sec-textarea"
            value={data.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>
      </div>

      <div className="form-field-grid-2">
        <div className="sec-nested-box">
          <span className="sec-nested-title">Primary Action</span>
          <div className="form-field-col">
            <label className="sec-field-label-sm">Label</label>
            <input
              type="text"
              className="sec-input"
              value={data.primaryCta?.label || ''}
              onChange={(e) =>
                updateField('primaryCta', { ...(data.primaryCta || {}), label: e.target.value })
              }
            />
          </div>
          <div className="form-field-col">
            <label className="sec-field-label-sm">Destination URL</label>
            <input
              type="text"
              className="sec-input sec-input-mono"
              value={data.primaryCta?.url || ''}
              onChange={(e) =>
                updateField('primaryCta', { ...(data.primaryCta || {}), url: e.target.value })
              }
            />
          </div>
        </div>

        <div className="sec-nested-box">
          <span className="sec-nested-title">Secondary Action</span>
          <div className="form-field-col">
            <label className="sec-field-label-sm">Label</label>
            <input
              type="text"
              className="sec-input"
              value={data.secondaryCta?.label || ''}
              onChange={(e) =>
                updateField('secondaryCta', { ...(data.secondaryCta || {}), label: e.target.value })
              }
            />
          </div>
          <div className="form-field-col">
            <label className="sec-field-label-sm">Destination URL</label>
            <input
              type="text"
              className="sec-input sec-input-mono"
              value={data.secondaryCta?.url || ''}
              onChange={(e) =>
                updateField('secondaryCta', { ...(data.secondaryCta || {}), url: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Master Section Editor Component Dispatcher
 */
export default function SectionEditor({ type, data, onChange }) {
  switch (type) {
    case 'hero':
      return <HeroSectionEditor data={data} onChange={onChange} />;
    case 'challenges':
      return <ChallengesSectionEditor data={data} onChange={onChange} />;
    case 'compliance':
      return <ComplianceSectionEditor data={data} onChange={onChange} />;
    case 'richText':
      return <RichTextSectionEditor data={data} onChange={onChange} />;
    case 'ctaBanner':
      return <CtaBannerSectionEditor data={data} onChange={onChange} />;
    default:
      return (
        <div className="section-editor-unknown">
          <span>Unknown section type: {type}</span>
        </div>
      );
  }
}
