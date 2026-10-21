import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Award,
  AlertTriangle,
  FileText,
  Megaphone,
  Share2,
  History,
  CheckCircle,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  RotateCcw,
  Clock,
  EyeOff,
  Image as ImageIcon,
  Building2,
  Link as LinkIcon,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import {
  fetchAdminSolutionById,
  createAdminSolutionApi,
  updateAdminSolutionApi,
  publishSolutionApi,
  restoreSolutionVersionApi,
  generatePreviewTokenApi,
  revokePreviewTokenApi,
} from './api/solutions.js';
import {
  fetchIndustryById,
  updateIndustryApi,
  createIndustryApi,
} from './api/industries.js';
import SectionEditor, {
  SECTION_METADATA,
  createDefaultSectionData,
} from './components/SectionEditorRegistry.jsx';
import ImageUploader from './components/ImageUploader.jsx';
import './SolutionEditorPage.css';

// Slugify helper
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

export default function SolutionEditorPage({
  solutionId = null,
  onBack,
  onNavigate,
  onPreview,
}) {
  const isEditing = Boolean(solutionId);
  const [currentId, setCurrentId] = useState(solutionId);
  const [industryRecordId, setIndustryRecordId] = useState(null);
  const [loading, setLoading] = useState(Boolean(solutionId));

  // Industry Profile & Company Page Card State (Synced Live)
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [cardImage, setCardImage] = useState('');
  const [sortOrder, setSortOrder] = useState('10');
  const [status, setStatus] = useState('Active');
  const [publishedAt, setPublishedAt] = useState(null);

  // SEO State
  const [seo, setSeo] = useState({
    title: '',
    metaDescription: '',
    ogImage: '',
  });

  // Breadcrumb
  const [breadcrumb, setBreadcrumb] = useState([
    { label: 'Company', url: '/company' },
  ]);

  // Block Sections State
  const [sections, setSections] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [addSectionMenuOpen, setAddSectionMenuOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [previewToken, setPreviewToken] = useState(null);

  // Modals & UI
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dirty State & Autosave
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Solution & Industry Data if Editing
  useEffect(() => {
    if (!solutionId) {
      // Default initial sections for new industry solution
      const initialSections = [
        {
          id: 'sec-hero-' + Date.now(),
          type: 'hero',
          order: 0,
          visible: true,
          data: createDefaultSectionData('hero'),
        },
        {
          id: 'sec-challenges-' + Date.now(),
          type: 'challenges',
          order: 1,
          visible: true,
          data: createDefaultSectionData('challenges'),
        },
        {
          id: 'sec-compliance-' + Date.now(),
          type: 'compliance',
          order: 2,
          visible: true,
          data: createDefaultSectionData('compliance'),
        },
      ];
      setSections(initialSections);
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadData = async () => {
      try {
        let loadedTitle = '';
        let loadedSlug = '';

        // 1. Fetch industry details first (if solutionId is industryId or slug)
        let ind = null;
        try {
          ind = await fetchIndustryById(solutionId);
        } catch (e) {
          // not found by id directly
        }

        if (ind) {
          setIndustryRecordId(ind._id || ind.id);
          loadedTitle = ind.name || '';
          loadedSlug = ind.slug || '';
          setTitle(loadedTitle);
          setSlug(loadedSlug);
          setSubtitle(ind.subtitle || '');
          setDescription(ind.description || '');
          setCardImage(ind.image || '');
          if (ind.sortOrder !== undefined) setSortOrder(String(ind.sortOrder));
          if (ind.status) setStatus(ind.status);
        }

        // 2. Fetch SolutionPage CMS (try by solutionId, or by ind.slug)
        let sol = null;
        const possibleIdentifiers = [solutionId, ind?.slug].filter(Boolean);
        for (const ident of possibleIdentifiers) {
          try {
            const solRes = await fetchAdminSolutionById(ident);
            if (solRes?.solution) {
              sol = solRes.solution;
              break;
            }
          } catch (e) {}
        }

        if (sol) {
          setCurrentId(sol._id);
          if (sol.title) setTitle(sol.title);
          if (sol.slug) setSlug(sol.slug);
          setSlugManuallyEdited(true);
          setStatus(sol.status === 'Published' ? 'Active' : sol.status);
          setPublishedAt(sol.publishedAt || null);
          if (Array.isArray(sol.breadcrumb) && sol.breadcrumb.length > 0) {
            setBreadcrumb(sol.breadcrumb);
          }
          if (sol.seo) {
            setSeo({
              title: sol.seo.title || '',
              metaDescription: sol.seo.metaDescription || '',
              ogImage: sol.seo.ogImage || '',
            });
          }
          if (Array.isArray(sol.sections) && sol.sections.length > 0) {
            setSections(sol.sections);
          }
          if (Array.isArray(sol.versions)) {
            setVersions(sol.versions);
          }
          if (sol.previewToken) {
            setPreviewToken(sol.previewToken);
          }
        } else if (ind) {
          // No SolutionPage document yet for this industry, seed from industry
          setCurrentId(ind.slug);
          const synthesizedSections = [
            {
              id: 'sec-hero-' + Date.now(),
              type: 'hero',
              order: 0,
              visible: true,
              data: {
                ...createDefaultSectionData('hero'),
                heading: ind.solutionHeadline || `${(ind.name || '').toUpperCase()} SOLUTIONS`,
                description: ind.solutionDescription || ind.description || '',
                image: ind.solutionBanner || ind.image || '',
                imageOverlayCard: {
                  enabled: true,
                  label: ind.hudGaugeLabel || 'DATA//YIELD_STRENGTH_REQUIREMENTS',
                  progressPercent: ind.hudGaugePercent || 82,
                  caption: ind.hudVerifiedText || 'HIGH-INTEGRITY WELD VERIFIED',
                },
              },
            },
            {
              id: 'sec-challenges-' + Date.now(),
              type: 'challenges',
              order: 1,
              visible: true,
              data: {
                ...createDefaultSectionData('challenges'),
                cards: (ind.challenges || []).map((ch, idx) => ({
                  id: `card-${idx}`,
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
              id: 'sec-compliance-' + Date.now(),
              type: 'compliance',
              order: 2,
              visible: true,
              data: {
                ...createDefaultSectionData('compliance'),
                badges: ind.complianceBadges || ['AWS D1.1', 'ASME Sec IX', 'ISO 3834-2'],
              },
            },
          ];
          setSections(synthesizedSections);
        }

        setIsDirty(false);
        setSaveStatus('Saved');
      } catch (err) {
        showToast(err.message || 'Failed to load industry solution', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [solutionId]);

  // Title change & auto-slug
  const handleTitleChange = (val) => {
    setTitle(val);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
    if (!slugManuallyEdited && (!isEditing || status === 'Draft')) {
      setSlug(slugify(val));
    }
  };

  // Publish checklist validator
  const checklist = useMemo(() => {
    const hasHero = sections.some((s) => s.type === 'hero' && s.visible !== false);
    const hasChallenges = sections.some((s) => s.type === 'challenges' && s.visible !== false);
    const hasCompliance = sections.some((s) => s.type === 'compliance' && s.visible !== false);

    return {
      hasTitle: Boolean(title.trim()),
      hasSlug: Boolean(slug.trim()),
      hasDescription: Boolean(description.trim()),
      hasCardImage: Boolean(cardImage?.trim()),
      hasVisibleSections: sections.filter((s) => s.visible !== false).length >= 1,
      hasHeroSection: hasHero,
      hasChallengesSection: hasChallenges,
      hasComplianceSection: hasCompliance,
    };
  }, [title, slug, description, cardImage, sections]);

  const canPublish = checklist.hasTitle && checklist.hasSlug && checklist.hasVisibleSections;

  // Autosave Timer (~30s debounced background save)
  useEffect(() => {
    if (!isDirty || isSaving || !currentId) return;

    const timer = setTimeout(() => {
      handleSave(false, true); // background save
    }, 30000);

    return () => clearTimeout(timer);
  }, [isDirty, isSaving, currentId, title, slug, subtitle, description, cardImage, sortOrder, sections, seo, breadcrumb]);

  // Section Management Helpers
  const handleAddSection = (type) => {
    const newSection = {
      id: `sec-${type}-${Date.now()}`,
      type,
      order: sections.length,
      visible: true,
      data: createDefaultSectionData(type),
    };
    setSections([...sections, newSection]);
    setAddSectionMenuOpen(false);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  };

  const handleUpdateSectionData = (sectionId, updatedData) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === sectionId ? { ...sec, data: updatedData } : sec))
    );
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  };

  const handleToggleSectionVisible = (sectionId) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === sectionId ? { ...sec, visible: sec.visible === false ? true : false } : sec
      )
    );
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  };

  const handleToggleSectionCollapse = (sectionId) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const handleMoveSection = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    const updated = reordered.map((sec, idx) => ({ ...sec, order: idx }));
    setSections(updated);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  };

  const handleDuplicateSection = (index) => {
    const target = sections[index];
    const duplicated = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec-${target.type}-${Date.now()}`,
      order: index + 1,
    };
    const updated = [...sections];
    updated.splice(index + 1, 0, duplicated);
    setSections(updated.map((sec, idx) => ({ ...sec, order: idx })));
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
    showToast(`Duplicated ${SECTION_METADATA[target.type]?.label || 'section'}`);
  };

  const handleDeleteSection = (index) => {
    const target = sections[index];
    if (sections.length <= 1) {
      alert('At least one section must remain on the solution page.');
      return;
    }
    const updated = sections.filter((_, idx) => idx !== index).map((sec, idx) => ({ ...sec, order: idx }));
    setSections(updated);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
    showToast(`Removed ${SECTION_METADATA[target.type]?.label || 'section'}`);
  };

  // Synchronized Save Function (Saves BOTH SolutionPage + Industry)
  const handleSave = async (isPublish = false, isAutosave = false) => {
    if (!title.trim()) {
      showToast('Industry Solution title is required.', 'error');
      return;
    }
    if (!slug.trim()) {
      showToast('Slug is required.', 'error');
      return;
    }
    if (isPublish && !canPublish) {
      showToast('Please satisfy all publication checklist items before publishing live.', 'error');
      return;
    }

    try {
      if (!isAutosave) setIsSaving(true);
      setSaveStatus('Saving...');

      const targetStatus = isPublish ? 'Published' : (status === 'Inactive' ? 'Inactive' : 'Draft');
      const targetIndustryStatus = isPublish ? 'Active' : (status === 'Inactive' ? 'Inactive' : 'Pending Review');

      // 1. Solution Page CMS Payload
      const solutionPayload = {
        title: title.trim(),
        slug: slug.trim(),
        status: targetStatus,
        breadcrumb: [
          { label: 'Company', url: '/company' },
          { label: title.trim(), url: `/solutions/${slug.trim()}` },
        ],
        seo: {
          title: seo.title || title.trim(),
          metaDescription: seo.metaDescription || description || '',
          ogImage: seo.ogImage || cardImage || '',
        },
        sections: sections.map((s, idx) => ({
          ...s,
          order: idx,
        })),
        updatedBy: 'Admin',
      };

      // 2. Synchronize Industry Record Payload (so /company card is 100% synced)
      const heroSec = sections.find((s) => s.type === 'hero');
      const challengesSec = sections.find((s) => s.type === 'challenges');
      const complianceSec = sections.find((s) => s.type === 'compliance');

      const industryPayload = {
        name: title.trim(),
        slug: slug.trim(),
        subtitle: subtitle.trim() || 'Manufacturing & Industrial',
        description: description.trim(),
        image: cardImage || heroSec?.data?.image || '',
        status: targetIndustryStatus,
        sortOrder: parseInt(sortOrder, 10) || 10,
        solutionHeadline: heroSec?.data?.heading || `${title.toUpperCase()} SOLUTIONS`,
        solutionDescription: heroSec?.data?.description || description.trim(),
        solutionBanner: heroSec?.data?.image || cardImage || '',
        complianceBadges: complianceSec?.data?.badges || ['AWS D1.1', 'ASME Sec IX', 'ISO 3834-2'],
        hudGaugePercent: heroSec?.data?.imageOverlayCard?.progressPercent || 82,
        hudGaugeLabel: heroSec?.data?.imageOverlayCard?.label || 'DATA//YIELD_STRENGTH_REQUIREMENTS',
        hudVerifiedText: heroSec?.data?.imageOverlayCard?.caption || 'HIGH-INTEGRITY WELD VERIFIED',
        challenges: (challengesSec?.data?.cards || []).map((c) => ({
          title: c.title || '',
          text: c.description || '',
          recommendedSpec: c.specText || '',
          statValue: c.metricValue || '',
          statLabel: c.metricLabel || '',
        })),
      };

      // Execute Save in SolutionPage collection
      let savedSol = null;
      const targetIdentifier = currentId || slug.trim();
      try {
        const res = await updateAdminSolutionApi(targetIdentifier, solutionPayload);
        savedSol = res.solution;
        if (savedSol?._id) setCurrentId(savedSol._id);
      } catch (upErr) {
        const res = await createAdminSolutionApi(solutionPayload);
        savedSol = res.solution;
        if (savedSol?._id) setCurrentId(savedSol._id);
      }

      // Execute Save in Industry collection
      if (industryRecordId) {
        await updateIndustryApi(industryRecordId, industryPayload);
      } else {
        try {
          const indRes = await createIndustryApi(industryPayload);
          if (indRes?._id || indRes?.id) setIndustryRecordId(indRes._id || indRes.id);
        } catch (indErr) {
          // If already exists with slug, update instead
          await updateIndustryApi(slug.trim(), industryPayload);
        }
      }

      setStatus(targetIndustryStatus);
      if (isPublish && savedSol) {
        await publishSolutionApi(savedSol._id || savedSol.slug || slug.trim());
        setStatus('Active');
      }

      setIsDirty(false);
      setSaveStatus('Saved');
      if (!isAutosave) {
        showToast(
          isPublish
            ? 'Industry & Solutions published live and synchronized with website!'
            : 'Draft saved and synchronized with database!'
        );
      }
    } catch (err) {
      console.error('Failed to save industry solution:', err);
      setSaveStatus('Error saving');
      showToast(err.message || 'Error saving industry solution', 'error');
    } finally {
      if (!isAutosave) setIsSaving(false);
    }
  };

  // Restore Version Snapshot
  const handleRestoreVersion = async (versionNumber) => {
    if (!currentId) return;
    if (!window.confirm(`Restore snapshot version ${versionNumber}? Unsaved changes will be discarded.`)) return;

    try {
      const res = await restoreSolutionVersionApi(currentId, versionNumber);
      const restored = res.solution;
      setTitle(restored.title);
      setSlug(restored.slug);
      setStatus(restored.status === 'Published' ? 'Active' : restored.status);
      setSections(restored.sections || []);
      setVersions(restored.versions || []);
      setVersionModalOpen(false);
      setIsDirty(false);
      setSaveStatus('Saved');
      showToast(`Restored snapshot version v${versionNumber}`);
    } catch (err) {
      showToast(err.message || 'Failed to restore version', 'error');
    }
  };

  // Generate 7-Day Secret Preview Token
  const handleGeneratePreviewToken = async () => {
    if (!currentId) {
      showToast('Please save draft first before generating a share link.', 'error');
      return;
    }
    try {
      const res = await generatePreviewTokenApi(currentId);
      setPreviewToken(res.previewToken);
      setShareModalOpen(true);
    } catch (err) {
      showToast(err.message || 'Failed to generate preview link', 'error');
    }
  };

  if (loading) {
    return (
      <div className="sol-editor-loading">
        <div className="editor-spinner" />
        <p>Loading Industry &amp; Solutions Editor...</p>
      </div>
    );
  }

  return (
    <div className="sol-editor-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`admin-toast-float toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sticky Top Header Bar */}
      <header className="sol-editor-top-bar">
        <div className="top-bar-left">
          <button type="button" className="btn-editor-back" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Industries Management</span>
          </button>

          <span className="top-bar-separator">/</span>

          <div className="editor-doc-meta">
            <span className="doc-title">{title || 'Untitled Industry & Solution'}</span>
            <span
              className={`doc-status-badge ${
                status === 'Active' || status === 'Published'
                  ? 'badge-published'
                  : 'badge-draft'
              }`}
            >
              {status}
            </span>
          </div>

          <span className={`save-status-pill save-${saveStatus.toLowerCase().replace(/\s+/g, '-')}`}>
            {saveStatus}
          </span>
        </div>

        <div className="top-bar-right">
          {/* Simulated Standalone Preview Button (matching Blogs/Careers) */}
          {currentId && (
            <button
              type="button"
              className="btn-toolbar-action"
              onClick={() => onPreview(currentId)}
              title="Open Standalone Simulated Preview"
            >
              <Eye size={15} />
              <span>Simulated Preview</span>
            </button>
          )}

          {/* Share Token Link */}
          {currentId && (
            <button
              type="button"
              className="btn-toolbar-action"
              onClick={handleGeneratePreviewToken}
              title="Shareable Secret Preview Link (7-day token)"
            >
              <Share2 size={15} />
              <span>Share Draft</span>
            </button>
          )}

          {/* Version History Button */}
          {versions.length > 0 && (
            <button
              type="button"
              className="btn-toolbar-action"
              onClick={() => setVersionModalOpen(true)}
              title="Version History Snapshots"
            >
              <History size={15} />
              <span>v{versions[0]?.versionNumber || 1}</span>
            </button>
          )}

          {/* Save Draft Button */}
          <button
            type="button"
            className="btn-editor-draft"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save size={15} />
            <span>Save Draft</span>
          </button>

          {/* Publish / Live Sync Button */}
          <button
            type="button"
            className="btn-editor-publish"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            <Send size={15} />
            <span>{status === 'Active' || status === 'Published' ? 'Update & Live Sync' : 'Publish Live'}</span>
          </button>
        </div>
      </header>

      {/* Main Two-Column Layout (Matching Blogs & Careers Architecture) */}
      <div className="sol-editor-workspace full-form">
        {/* LEFT COLUMN: Main Form & Section Builder */}
        <main className="editor-form-scrollable">
          {/* 1. Industry Profile & Global Sectors Card (Synced Live with /company) */}
          <div className="editor-card">
            <div className="card-header-row">
              <h2 className="editor-card-heading">1. Industry Profile &amp; Company Page Card</h2>
              <span className="card-subtitle-tag">Synced in real-time with /company sector grid</span>
            </div>

            <div className="form-field-row">
              <div className="form-field-col flex-1">
                <label className="field-label-prominent">
                  Industry Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  className="input-field input-title"
                  placeholder="e.g. Heavy Engineering & Heavy Equipment"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div className="form-field-col flex-1">
                <label className="field-label-prominent">Public Slug</label>
                <div className="slug-input-wrapper">
                  <span className="slug-base-url">/solutions/</span>
                  <input
                    type="text"
                    className="input-field-slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setSlugManuallyEdited(true);
                      setIsDirty(true);
                      setSaveStatus('Unsaved changes');
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="form-field-row" style={{ marginTop: '16px' }}>
              <div className="form-field-col flex-1">
                <label className="field-label-prominent">
                  Subtitle / Sector Category <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Infrastructure, Earthmoving & Severe Wear Applications"
                  value={subtitle}
                  onChange={(e) => {
                    setSubtitle(e.target.value);
                    setIsDirty(true);
                    setSaveStatus('Unsaved changes');
                  }}
                />
              </div>

              <div className="form-field-col" style={{ width: '140px' }}>
                <label className="field-label-prominent">Sort Order</label>
                <input
                  type="number"
                  className="input-field"
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setIsDirty(true);
                    setSaveStatus('Unsaved changes');
                  }}
                />
              </div>
            </div>

            <div className="form-field-row" style={{ marginTop: '16px' }}>
              <div className="form-field-col flex-1">
                <label className="field-label-prominent">
                  Company Card Overview Description <span className="req-star">*</span>
                </label>
                <textarea
                  rows={3}
                  className="input-textarea"
                  placeholder="Short, high-impact description displayed on the sector card on /company page..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                    setSaveStatus('Unsaved changes');
                  }}
                />
                <span className="field-hint-xs">
                  This description appears directly inside the card on the public website's Company page.
                </span>
              </div>
            </div>

            <div className="form-field-row" style={{ marginTop: '16px' }}>
              <div className="form-field-col flex-1">
                <label className="field-label-prominent">
                  Industry Visual / Card Image (Cloudinary)
                </label>
                <ImageUploader
                  value={cardImage}
                  onChange={(url) => {
                    setCardImage(url);
                    setIsDirty(true);
                    setSaveStatus('Unsaved changes');
                  }}
                  folder="sprimax/industries"
                  helpText="High-resolution industrial visual displayed on /company cards and hero headers."
                />
              </div>
            </div>
          </div>

          {/* 2. Block-Based Industry Solutions Page CMS */}
          <div className="editor-card">
            <div className="card-header-row">
              <div>
                <h2 className="editor-card-heading">2. Industry Solutions Page Content Builder</h2>
                <p className="card-subtitle-tag">
                  Modular, block-based sections that render on the public /solutions/{slug || 'sector'} page
                </p>
              </div>
            </div>

            {/* Section Blocks Accordion List */}
            <div className="sections-accordion-list">
              {sections.map((section, index) => {
                const meta = SECTION_METADATA[section.type] || {
                  label: section.type,
                  description: '',
                };
                const isCollapsed = collapsedSections.has(section.id);
                const isVisible = section.visible !== false;

                return (
                  <div
                    key={section.id}
                    className={`section-block-card ${!isVisible ? 'section-hidden' : ''}`}
                  >
                    {/* Block Header */}
                    <div className="section-block-header">
                      <div className="sec-block-left">
                        <span className="sec-order-badge">#{index + 1}</span>

                        <div className="sec-type-badge-pill">
                          <Layers size={13} />
                          <span>{meta.label}</span>
                        </div>

                        <span className="sec-block-preview-title">
                          {section.data?.heading || section.data?.eyebrowTag || meta.label}
                        </span>

                        {!isVisible && <span className="sec-hidden-pill">Hidden from Public</span>}
                      </div>

                      <div className="sec-block-actions">
                        {/* Reorder Up */}
                        <button
                          type="button"
                          className="btn-sec-action"
                          onClick={() => handleMoveSection(index, -1)}
                          disabled={index === 0}
                          title="Move Section Up"
                        >
                          <ChevronUp size={15} />
                        </button>

                        {/* Reorder Down */}
                        <button
                          type="button"
                          className="btn-sec-action"
                          onClick={() => handleMoveSection(index, 1)}
                          disabled={index === sections.length - 1}
                          title="Move Section Down"
                        >
                          <ChevronDown size={15} />
                        </button>

                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          className={`btn-sec-action ${!isVisible ? 'muted' : ''}`}
                          onClick={() => handleToggleSectionVisible(section.id)}
                          title={isVisible ? 'Hide Section' : 'Show Section'}
                        >
                          {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>

                        {/* Duplicate */}
                        <button
                          type="button"
                          className="btn-sec-action"
                          onClick={() => handleDuplicateSection(index)}
                          title="Duplicate Section"
                        >
                          <Copy size={15} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          className="btn-sec-action btn-sec-delete"
                          onClick={() => handleDeleteSection(index)}
                          title="Remove Section"
                        >
                          <Trash2 size={15} />
                        </button>

                        {/* Collapse / Expand */}
                        <button
                          type="button"
                          className="btn-sec-action"
                          onClick={() => handleToggleSectionCollapse(section.id)}
                          title={isCollapsed ? 'Expand Block' : 'Collapse Block'}
                        >
                          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Block Editor Body (when not collapsed) */}
                    {!isCollapsed && (
                      <div className="section-block-body">
                        <SectionEditor
                          type={section.type}
                          data={section.data}
                          onChange={(updated) => handleUpdateSectionData(section.id, updated)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </main>

        {/* RIGHT COLUMN: Settings Sidebar (Matching Blog & Careers Structure) */}
        <aside className="editor-settings-sidebar">
          {/* Card 1: Publication Status & Visibility */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Publication Status</h3>

            <div className="sidebar-field">
              <label className="field-label-sm">Workflow Status</label>
              <select
                className="sidebar-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setIsDirty(true);
                  setSaveStatus('Unsaved changes');
                }}
              >
                <option value="Active">Active (Live on Website)</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Draft">Draft (Internal Only)</option>
                <option value="Inactive">Inactive (Hidden)</option>
              </select>
            </div>

            <div className="sidebar-meta-item" style={{ marginTop: '12px' }}>
              <span className="meta-label">Public Website URL:</span>
              <div className="public-url-box">
                <a
                  href={`/solutions/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="public-url-link"
                >
                  <span>/solutions/{slug || '...'}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {publishedAt && (
              <div className="sidebar-meta-item" style={{ marginTop: '8px' }}>
                <span className="meta-label">First Published:</span>
                <span className="meta-val">{new Date(publishedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Card 2: Publish Checklist */}
          <div className="sidebar-card checklist-card">
            <h3 className="sidebar-card-title">Publish Checklist</h3>
            <div className="checklist-items">
              <div className={`chk-item ${checklist.hasTitle ? 'chk-done' : ''}`}>
                {checklist.hasTitle ? <Check size={14} /> : <X size={14} />}
                <span>Industry Name defined</span>
              </div>
              <div className={`chk-item ${checklist.hasSlug ? 'chk-done' : ''}`}>
                {checklist.hasSlug ? <Check size={14} /> : <X size={14} />}
                <span>Public Slug valid</span>
              </div>
              <div className={`chk-item ${checklist.hasCardImage ? 'chk-done' : ''}`}>
                {checklist.hasCardImage ? <Check size={14} /> : <X size={14} />}
                <span>Company Card Image uploaded</span>
              </div>
              <div className={`chk-item ${checklist.hasDescription ? 'chk-done' : ''}`}>
                {checklist.hasDescription ? <Check size={14} /> : <X size={14} />}
                <span>Overview description provided</span>
              </div>
              <div className={`chk-item ${checklist.hasHeroSection ? 'chk-done' : ''}`}>
                {checklist.hasHeroSection ? <Check size={14} /> : <X size={14} />}
                <span>Hero Banner configured</span>
              </div>
              <div className={`chk-item ${checklist.hasChallengesSection ? 'chk-done' : ''}`}>
                {checklist.hasChallengesSection ? <Check size={14} /> : <X size={14} />}
                <span>Challenges &amp; Solutions present</span>
              </div>
              <div className={`chk-item ${checklist.hasComplianceSection ? 'chk-done' : ''}`}>
                {checklist.hasComplianceSection ? <Check size={14} /> : <X size={14} />}
                <span>Technical Compliance banner configured</span>
              </div>
              <div className={`chk-item ${checklist.hasVisibleSections ? 'chk-done' : ''}`}>
                {checklist.hasVisibleSections ? <Check size={14} /> : <X size={14} />}
                <span>At least 1 visible section</span>
              </div>
            </div>
          </div>

          {/* Card 3: Live Company Page Sector Card Preview */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Live Company Page Card</h3>
            <p className="field-hint-xs" style={{ marginBottom: '10px' }}>
              How this industry sector card appears on the public /company page:
            </p>

            <div className="company-mini-card-preview">
              <div className="mini-card-img-wrap">
                {cardImage ? (
                  <img src={cardImage} alt={title} className="mini-card-img" />
                ) : (
                  <div className="mini-card-img-placeholder">
                    <ImageIcon size={20} color="#94a3b8" />
                    <span>No Image Uploaded</span>
                  </div>
                )}
              </div>

              <div className="mini-card-content">
                <h4 className="mini-card-title">{title || 'Sector Name'}</h4>
                <p className="mini-card-desc">
                  {description || 'Industry overview description will appear here on the company page...'}
                </p>
                <div className="mini-card-action">
                  <span>VIEW SOLUTIONS</span>
                  <ArrowRight size={11} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Quick Standalone Preview & Actions */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Preview &amp; Testing</h3>
            <p className="field-hint-xs" style={{ marginBottom: '12px' }}>
              Preview how this solutions page looks on Desktop, Tablet, and Mobile devices in our standalone preview sandbox.
            </p>

            <button
              type="button"
              className="btn-full-width-action"
              onClick={() => (currentId ? onPreview(currentId) : handleSave(false))}
            >
              <Eye size={15} />
              <span>Open Simulated Preview</span>
            </button>

            {currentId && (
              <button
                type="button"
                className="btn-full-width-secondary"
                style={{ marginTop: '8px' }}
                onClick={handleGeneratePreviewToken}
              >
                <Share2 size={14} />
                <span>Create Secret 7-Day Share Link</span>
              </button>
            )}
          </div>

          {/* Card 5: Version History Snapshots */}
          {versions.length > 0 && (
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">Version Snapshots ({versions.length})</h3>
              <div className="version-snapshots-compact">
                {versions.slice(0, 4).map((v) => (
                  <div key={v.versionNumber} className="snapshot-row">
                    <div className="snapshot-info">
                      <span className="snapshot-ver">v{v.versionNumber}</span>
                      <span className="snapshot-date">
                        {new Date(v.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn-snapshot-restore"
                      onClick={() => handleRestoreVersion(v.versionNumber)}
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Version History Modal */}
      {versionModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box version-modal-box">
            <div className="modal-header">
              <History size={20} color="#ff0804" />
              <div>
                <h3 className="modal-title">Published Version History</h3>
                <p className="modal-subtitle">
                  Last 10 published snapshots stored on server with 1-click restore
                </p>
              </div>
            </div>

            <div className="version-modal-list">
              {versions.map((ver) => (
                <div key={ver.versionNumber} className="version-list-item">
                  <div className="version-item-left">
                    <span className="version-badge">v{ver.versionNumber}</span>
                    <div className="version-meta">
                      <span className="version-author">By {ver.createdBy || 'Admin'}</span>
                      <span className="version-time">
                        {new Date(ver.savedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-restore-version"
                    onClick={() => handleRestoreVersion(ver.versionNumber)}
                  >
                    <RotateCcw size={13} />
                    <span>Restore This Version</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setVersionModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Draft Link Modal */}
      {shareModalOpen && previewToken && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-header">
              <Share2 size={20} color="#ff0804" />
              <div>
                <h3 className="modal-title">Shareable Draft Preview Link</h3>
                <p className="modal-subtitle">
                  Secret token allows non-logged-in stakeholders to review this draft (expires in 7 days)
                </p>
              </div>
            </div>

            <div className="modal-body-content">
              <div className="share-link-box">
                <input
                  type="text"
                  readOnly
                  className="share-link-input"
                  value={`${window.location.origin}/solutions/preview?token=${previewToken.token}`}
                />
                <button
                  type="button"
                  className="btn-copy-link"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/solutions/preview?token=${previewToken.token}`
                    );
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="field-hint-xs" style={{ marginTop: '8px' }}>
                Valid until {new Date(previewToken.expiresAt).toLocaleDateString()}. You can revoke this link anytime.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShareModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
