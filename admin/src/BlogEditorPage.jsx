import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  Upload,
  Image as ImageIcon,
  Heading,
  AlignLeft,
  Table as TableIcon,
  AlertCircle,
  List,
  Quote,
  Minus,
  Code,
  Video,
  FileText,
  BookOpen,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  HelpCircle,
  ExternalLink,
  CheckCircle,
  XCircle,
  Sparkles,
  Search,
  Check,
  X,
  Clock,
  Calendar,
  AlertTriangle,
  RotateCcw,
  RotateCw,
  Sliders,
  Share2,
  Printer,
  Wrench,
  Headphones,
} from 'lucide-react';
import {
  fetchBlogById,
  createBlogApi,
  updateBlogApi,
  fetchBlogCategoriesApi,
  uploadBlogImageApi,
  fetchAdminBlogs,
} from './api/blogs.js';
import { fetchProducts } from './api/products.js';
import ImageUploader from './components/ImageUploader.jsx';
import './BlogEditorPage.css';

// Slugify helper
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

// Word count & read time estimator (~200 words per minute)
const calculateReadTime = (blocks, summary = '') => {
  let text = summary;
  if (Array.isArray(blocks)) {
    blocks.forEach((b) => {
      if (b.content) text += ' ' + b.content;
      if (b.heading) text += ' ' + b.heading;
      if (b.paragraphs) text += ' ' + b.paragraphs.join(' ');
      if (b.caption) text += ' ' + b.caption;
      if (b.quote) text += ' ' + b.quote;
      if (b.tableRows) text += ' ' + b.tableRows.flat().join(' ');
    });
  }
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { words, minutes };
};

export default function BlogEditorPage({
  blogId = null,
  onBack,
  onNavigate,
  onPreview,
}) {
  const isEditing = Boolean(blogId);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [initialPublishedSlug, setInitialPublishedSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerAlt, setBannerAlt] = useState('');
  const [bannerCaption, setBannerCaption] = useState('Fig 1. Engineering overview and macro-examination.');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [authorName, setAuthorName] = useState('Metallurgical R&D Division');
  const [authorRole, setAuthorRole] = useState('Lead Research Group');
  const [status, setStatus] = useState('Draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [featured, setFeatured] = useState(false);
  const [readTimeOverride, setReadTimeOverride] = useState('');
  const [blocks, setBlocks] = useState([]);

  // Server-managed timestamps
  const [publishedAt, setPublishedAt] = useState(null);
  const [formattedPublishedDate, setFormattedPublishedDate] = useState('');
  const [createdAt, setCreatedAt] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  // Featured Product relation (null unless added from content block options)
  const [featuredProduct, setFeaturedProduct] = useState(null);

  // CTA Card
  const [ctaCard, setCtaCard] = useState({
    enabled: true,
    heading: 'Require Technical Assistance?',
    description: 'Our metallurgical engineers are available for consultation on complex structural fabrication challenges.',
    buttonLabel: 'SUBMIT TECHNICAL ENQUIRY',
    buttonLink: '/contact',
  });

  // Related Articles
  const [relatedMode, setRelatedMode] = useState('auto');
  const [relatedIds, setRelatedIds] = useState([]);
  const [allOtherBlogs, setAllOtherBlogs] = useState([]);

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Display Options
  const [displayOptions, setDisplayOptions] = useState({
    showShareButton: true,
    showPrintButton: true,
    showSidebar: true,
    enableTableOfContents: true,
  });

  // Editor Meta State
  const [categoriesList, setCategoriesList] = useState([]);
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saved', 'Saving...', 'Unsaved changes'
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentId, setCurrentId] = useState(blogId);

  // Undo / Redo History for Blocks
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Image Uploading State
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const bannerFileRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Push block state to undo/redo history
  const pushBlocksToHistory = useCallback((newBlocks) => {
    setBlocks(newBlocks);
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, newBlocks];
    });
    setHistoryIndex((prev) => prev + 1);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  }, [historyIndex]);

  // Load Categories, Other Blogs & Real-Time Products
  useEffect(() => {
    fetchBlogCategoriesApi()
      .then((res) => {
        if (res.categories && res.categories.length > 0) {
          setCategoriesList(res.categories);
          if (!category) setCategory(res.categories[0].name);
        }
      })
      .catch(() => {});

    fetchAdminBlogs({ limit: 50 })
      .then((res) => {
        if (res.blogs) setAllOtherBlogs(res.blogs);
      })
      .catch(() => {});

    fetchProducts({ limit: 150 })
      .then((res) => {
        if (res && res.products && Array.isArray(res.products)) {
          setDbProducts(res.products);
        } else if (Array.isArray(res)) {
          setDbProducts(res);
        }
      })
      .catch((err) => {
        console.error('Failed to load catalogue products for blog editor:', err);
      });
  }, []);

  // Load Blog Data if Editing
  useEffect(() => {
    if (blogId) {
      setLoading(true);
      fetchBlogById(blogId, true)
        .then((res) => {
          const b = res.blog;
          setCurrentId(b._id);
          setTitle(b.title || '');
          setSlug(b.slug || '');
          setInitialPublishedSlug(b.status === 'Published' ? b.slug : '');
          setSlugManuallyEdited(true);
          setSummary(b.summary || '');
          setBannerImageUrl(b.bannerImageUrl || '');
          setBannerAlt(b.bannerAlt || '');
          setBannerCaption(b.bannerCaption || '');
          setCategory(b.category || '');
          setTags(b.tags || []);
          setAuthorName(b.author?.name || '');
          setAuthorRole(b.author?.role || '');
          setStatus(b.status || 'Draft');
          setScheduledAt(b.scheduledAt ? new Date(b.scheduledAt).toISOString().slice(0, 16) : '');
          setFeatured(Boolean(b.featured));
          setReadTimeOverride(b.readTimeOverride || '');
          setPublishedAt(b.publishedAt || null);
          setFormattedPublishedDate(b.formattedPublishedDate || '');
          setCreatedAt(b.createdAt || null);
          setUpdatedAt(b.updatedAt || null);

          if (b.featuredProduct && b.featuredProduct.name && (b.content?.some((block) => block.type === 'featuredProduct') || b.featuredProduct.productId)) {
            setFeaturedProduct(b.featuredProduct);
          } else {
            setFeaturedProduct(null);
          }
          if (b.ctaCard) {
            setCtaCard((prev) => ({ ...prev, ...b.ctaCard }));
          }
          if (b.seo) {
            setMetaTitle(b.seo.metaTitle || '');
            setMetaDescription(b.seo.metaDescription || '');
            setCanonicalUrl(b.seo.canonicalUrl || '');
          }
          if (b.displayOptions) {
            setDisplayOptions((prev) => ({ ...prev, ...b.displayOptions }));
          }

          const loadedBlocks = Array.isArray(b.content) ? b.content : [];
          setBlocks(loadedBlocks);
          setHistory([loadedBlocks]);
          setHistoryIndex(0);
          setIsDirty(false);
          setSaveStatus('Saved');
        })
        .catch((err) => {
          showToast(err.message, 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Default Initial Blocks for New Blog
      const defaultBlocks = [
        {
          id: 'blk-' + Date.now() + '-1',
          type: 'paragraph',
          isLead: true,
          content: 'Modern heavy manufacturing and critical welded structures require exceptional precision, controlled thermal cooling, and rigorous quality inspection protocols.',
        },
        {
          id: 'blk-' + Date.now() + '-2',
          type: 'heading',
          level: 'h2',
          heading: '1. Technical Fundamentals & Microstructural Integrity',
        },
        {
          id: 'blk-' + Date.now() + '-3',
          type: 'paragraph',
          content: 'Grain refinement achieved through controlled thermo-mechanical rolling ensures optimal impact toughness even at temperatures down to -40°C.',
        },
        {
          id: 'blk-' + Date.now() + '-4',
          type: 'callout',
          calloutType: 'Engineering Note',
          title: 'Engineering Note: Interpass Temperature Bounds',
          content: 'Maintain strict preheat and interpass temperatures between 120°C and 180°C to eliminate cold-cracking susceptibility in high-yield alloy welds.',
        },
      ];
      setBlocks(defaultBlocks);
      setHistory([defaultBlocks]);
      setHistoryIndex(0);
    }
  }, [blogId]);

  // Handle Title Change and auto-slug
  const handleTitleChange = (val) => {
    setTitle(val);
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
    if (!slugManuallyEdited && (!isEditing || status === 'Draft')) {
      setSlug(slugify(val));
    }
  };

  // Auto-calculated Read Time
  const calculatedStats = useMemo(() => {
    return calculateReadTime(blocks, summary);
  }, [blocks, summary]);

  const effectiveReadTime = readTimeOverride ? Number(readTimeOverride) : calculatedStats.minutes;

  // Publish Checklist
  const checklist = useMemo(() => {
    return {
      hasTitle: Boolean(title.trim()),
      hasSlug: Boolean(slug.trim()),
      hasSummary: summary.trim().length >= 40,
      hasBanner: Boolean(bannerImageUrl.trim()),
      hasBannerAlt: Boolean(bannerAlt.trim()),
      hasCategory: Boolean(category.trim()),
      hasBlocks: blocks.length > 0,
    };
  }, [title, slug, summary, bannerImageUrl, bannerAlt, category, blocks]);

  const canPublish = Object.values(checklist).every(Boolean);

  // Autosave Timer (~30 seconds)
  useEffect(() => {
    if (!isDirty || isSaving) return;

    const timer = setTimeout(() => {
      handleSave(false, true); // save as draft in background
    }, 30000);

    return () => clearTimeout(timer);
  }, [isDirty, isSaving, title, slug, summary, bannerImageUrl, blocks, category]);

  // Window unload confirmation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Banner Image Upload
  const handleBannerUpload = async (file) => {
    if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await uploadBlogImageApi(file);
      setBannerImageUrl(url);
      setIsDirty(true);
      setSaveStatus('Unsaved changes');
      showToast('Banner image uploaded successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploadingBanner(false);
    }
  };

  // Add / Remove Tags
  const handleAddTag = () => {
    const clean = tagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
      setIsDirty(true);
      setSaveStatus('Unsaved changes');
    }
  };

  const handleRemoveTag = (t) => {
    setTags(tags.filter((item) => item !== t));
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  };

  // Core Save / Publish Handler
  const handleSave = async (isPublishing = false, isAutoSave = false) => {
    if (!title.trim()) {
      if (!isAutoSave) showToast('Please enter a post title before saving.', 'error');
      return;
    }

    if (isPublishing && !canPublish) {
      showToast('Please fulfill all items in the Publish Checklist before publishing.', 'error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('Saving...');

    const payload = {
      title,
      slug: slugify(slug || title),
      summary,
      bannerImageUrl,
      bannerAlt,
      bannerCaption,
      category,
      tags,
      author: {
        name: authorName,
        role: authorRole,
      },
      status: isPublishing ? 'Published' : status === 'Published' ? 'Published' : 'Draft',
      scheduledAt: status === 'Scheduled' && scheduledAt ? new Date(scheduledAt) : null,
      featured,
      readTimeMinutes: effectiveReadTime,
      readTimeOverride: readTimeOverride ? Number(readTimeOverride) : null,
      content: blocks,
      featuredProduct: (() => {
        const fpBlock = blocks.find((b) => b.type === 'featuredProduct' && b.name);
        if (fpBlock) {
          return {
            productId: fpBlock.productId || '',
            name: fpBlock.name || '',
            sku: fpBlock.sku || '',
            description: fpBlock.description || '',
            image: fpBlock.image || '',
            url: fpBlock.url || '',
          };
        }
        return null;
      })(),
      ctaCard,
      relatedMode,
      relatedIds,
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || summary,
        canonicalUrl,
        ogImage: bannerImageUrl,
      },
      displayOptions,
    };

    try {
      let savedBlog;
      if (currentId) {
        const res = await updateBlogApi(currentId, payload);
        savedBlog = res.blog;
      } else {
        const res = await createBlogApi(payload);
        savedBlog = res.blog;
        setCurrentId(savedBlog._id);
      }

      setIsDirty(false);
      setSaveStatus('Saved');
      if (savedBlog.publishedAt) {
        setPublishedAt(savedBlog.publishedAt);
        setFormattedPublishedDate(savedBlog.formattedPublishedDate);
      }
      if (savedBlog.status) {
        setStatus(savedBlog.status);
      }

      if (!isAutoSave) {
        showToast(
          isPublishing
            ? 'Article published successfully to public portal!'
            : 'Draft saved successfully.'
        );
      }
    } catch (err) {
      setSaveStatus('Unsaved changes');
      if (!isAutoSave) {
        showToast(err.message || 'Error saving blog', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Block Helpers
  const addBlock = (type, atIndex = blocks.length) => {
    let newBlock = { id: 'blk-' + Date.now(), type };
    if (type === 'paragraph') {
      newBlock.content = '';
      newBlock.isLead = false;
    } else if (type === 'heading') {
      newBlock.level = 'h2';
      newBlock.heading = '';
    } else if (type === 'image') {
      newBlock.imageUrl = '';
      newBlock.alt = '';
      newBlock.caption = '';
      newBlock.width = 'normal'; // 'normal', 'wide', 'full'
    } else if (type === 'table') {
      newBlock.caption = 'Table 1: Technical Specifications';
      newBlock.footnote = 'Source: Sprimax Metallurgical Standards';
      newBlock.hasHeader = true;
      newBlock.headers = ['Parameter', 'Min Standard', 'Test Result', 'Compliance'];
      newBlock.rows = [
        ['Tensile Strength (MPa)', '490', '545', 'Pass (ASTM A572)'],
        ['Yield Strength (MPa)', '345', '390', 'Pass'],
        ['Elongation (%)', '21.0', '24.5', 'Optimal'],
      ];
    } else if (type === 'callout') {
      newBlock.calloutType = 'Engineering Note';
      newBlock.title = 'Engineering Note';
      newBlock.content = 'Document critical parameters before initiating welding operations.';
    } else if (type === 'list') {
      newBlock.listType = 'bullet'; // bullet, numbered, checklist
      newBlock.items = ['Initial surface degreasing', 'Preheat verification at 150°C', 'Post-weld visual inspection'];
    } else if (type === 'quote') {
      newBlock.quote = 'Precision metallurgy is not merely about meeting tolerances—it is about ensuring structural predictability.';
      newBlock.attribution = 'Chief Metallurgist, Sprimax Engineering';
    } else if (type === 'divider') {
      newBlock.style = 'solid';
    } else if (type === 'code') {
      newBlock.language = 'CEV Formula';
      newBlock.code = 'CEV = C + Mn/6 + (Cr + Mo + V)/5 + (Ni + Cu)/15';
    } else if (type === 'embed') {
      newBlock.embedType = 'video';
      newBlock.url = '';
      newBlock.caption = '';
    } else if (type === 'references') {
      newBlock.references = [
        'AWS D1.1/D1.1M:2020 - Structural Welding Code — Steel',
        'ASTM A572 / A572M - Standard Specification for High-Strength Low-Alloy Structural Steel',
      ];
    } else if (type === 'featuredProduct') {
      newBlock.productId = '';
      newBlock.name = '';
      newBlock.sku = '';
      newBlock.category = '';
      newBlock.description = '';
      newBlock.image = '';
      newBlock.url = '';
    }

    const updated = [...blocks];
    updated.splice(atIndex, 0, newBlock);
    pushBlocksToHistory(updated);
  };

  const updateBlock = (index, field, value) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], [field]: value };
    pushBlocksToHistory(updated);
  };

  const updateBlockObject = (index, updates) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], ...updates };
    pushBlocksToHistory(updated);
  };

  const handleFeaturedProductSelect = (blockIndex, selectedId) => {
    if (!selectedId) {
      updateBlockObject(blockIndex, {
        productId: '',
        name: '',
        sku: '',
        category: '',
        description: '',
        image: '',
        url: '',
      });
      return;
    }

    const prod = dbProducts.find((p) => String(p._id) === String(selectedId));
    if (!prod) return;

    const resolvedImage = prod.image || (prod.images && prod.images[0]) || '/assets/product-lh7018.png';
    const resolvedUrl = `/products?sku=${encodeURIComponent(prod.sku || '')}`;
    const resolvedDesc = prod.description || prod.overview || '';

    updateBlockObject(blockIndex, {
      productId: prod._id,
      name: prod.name,
      sku: prod.sku || '',
      category: prod.category || '',
      description: resolvedDesc,
      image: resolvedImage,
      url: resolvedUrl,
    });

    // Sync to blog level featuredProduct so sidebar card also has it
    setFeaturedProduct({
      productId: prod._id,
      name: prod.name,
      sku: prod.sku || '',
      description: resolvedDesc,
      image: resolvedImage,
      url: resolvedUrl,
    });
    setIsDirty(true);
    setSaveStatus('Unsaved changes');
  };

  const removeBlock = (index) => {
    const updated = blocks.filter((_, i) => i !== index);
    pushBlocksToHistory(updated);
  };

  const duplicateBlock = (index) => {
    const blockToCopy = { ...blocks[index], id: 'blk-' + Date.now() };
    const updated = [...blocks];
    updated.splice(index + 1, 0, blockToCopy);
    pushBlocksToHistory(updated);
  };

  const moveBlock = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    pushBlocksToHistory(updated);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex((i) => i - 1);
      setBlocks(prev);
      setIsDirty(true);
      setSaveStatus('Unsaved changes');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex((i) => i + 1);
      setBlocks(next);
      setIsDirty(true);
      setSaveStatus('Unsaved changes');
    }
  };

  // Figure numbering calculation for images
  const getImageFigureNumber = (blockIndex) => {
    let count = 1; // Fig 1 is the main banner
    for (let i = 0; i <= blockIndex; i++) {
      if (blocks[i].type === 'image') count++;
    }
    return `Fig ${count}`;
  };

  // Open Preview
  const handleOpenPreview = () => {
    if (currentId) {
      onPreview?.(currentId);
    } else {
      handleSave(false).then(() => {
        if (currentId) onPreview?.(currentId);
      });
    }
  };

  if (loading) {
    return (
      <div className="blog-editor-loading">
        <div className="editor-spinner" />
        <p>Loading Technical Blog Editor...</p>
      </div>
    );
  }

  return (
    <div className="blog-editor-container">
      {/* Sticky Top Bar */}
      <header className="editor-sticky-topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="btn-editor-back"
            onClick={() => {
              if (isDirty) {
                if (window.confirm('You have unsaved changes. Return to list?')) {
                  onBack?.();
                }
              } else {
                onBack?.();
              }
            }}
          >
            <ArrowLeft size={16} />
            <span>Blogs List</span>
          </button>

          <div className="save-status-indicator">
            <span
              className={`status-dot dot-${saveStatus === 'Saved' ? 'saved' : saveStatus === 'Saving...' ? 'saving' : 'dirty'}`}
            />
            <span className="status-label">{saveStatus}</span>
          </div>
        </div>

        <div className="topbar-center">
          <button
            type="button"
            className="btn-history"
            disabled={historyIndex <= 0}
            onClick={handleUndo}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            className="btn-history"
            disabled={historyIndex >= history.length - 1}
            onClick={handleRedo}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw size={15} />
          </button>
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className="btn-editor-preview"
            onClick={handleOpenPreview}
          >
            <Eye size={16} />
            <span>Preview</span>
          </button>

          <button
            type="button"
            className="btn-editor-draft"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            <Save size={16} />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            className="btn-editor-publish"
            onClick={() => handleSave(true)}
            disabled={isSaving || !canPublish}
            title={!canPublish ? 'Complete Publish Checklist to enable' : 'Publish live to user portal'}
          >
            <Send size={16} />
            <span>{status === 'Published' ? 'Update Live Post' : 'Publish Post'}</span>
          </button>
        </div>
      </header>

      {/* Toast Alert */}
      {toast && (
        <div className={`blog-editor-toast toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="toast-close">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="editor-two-col-layout">
        {/* =========================================================================
            LEFT COLUMN: MAIN CONTENT BUILDER
            ========================================================================= */}
        <main className="editor-main-column">
          {/* Article Title */}
          <div className="editor-field-card">
            <div className="field-header-row">
              <label htmlFor="blog-title-input" className="field-label-prominent">
                Article Title <span className="req-star">*</span>
              </label>
              <span className={`char-counter ${title.length > 90 ? 'counter-warning' : ''}`}>
                {title.length} / 100
              </span>
            </div>
            <input
              id="blog-title-input"
              type="text"
              placeholder="e.g. Advancements in High-Tensile Steel Alloy Microstructures"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="blog-title-input"
              maxLength={120}
            />
          </div>

          {/* URL Slug */}
          <div className="editor-field-card">
            <div className="field-header-row">
              <label htmlFor="blog-slug-input" className="field-label-prominent">
                URL Slug <span className="req-star">*</span>
              </label>
              <span className="slug-preview-label">
                /blog/<strong>{slug || 'your-slug-here'}</strong>
              </span>
            </div>
            <input
              id="blog-slug-input"
              type="text"
              placeholder="advancements-in-high-tensile-steel-alloy"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugManuallyEdited(true);
                setIsDirty(true);
              }}
              className="blog-slug-input"
            />
            {initialPublishedSlug && initialPublishedSlug !== slug && (
              <div className="slug-warning-alert">
                <AlertCircle size={16} />
                <span>
                  <strong>Notice:</strong> Changing the slug of an already published post will create an automatic 301 redirect from <code>/blog/{initialPublishedSlug}</code> to avoid broken links.
                </span>
              </div>
            )}
          </div>

          {/* Short Summary / Excerpt */}
          <div className="editor-field-card">
            <div className="field-header-row">
              <label htmlFor="blog-summary-input" className="field-label-prominent">
                Short Summary / Excerpt <span className="req-star">*</span>
              </label>
              <span className={`char-counter ${summary.length < 40 || summary.length > 220 ? 'counter-warning' : ''}`}>
                {summary.length} / 200 chars
              </span>
            </div>
            <p className="field-hint">
              Displayed on public listing cards and used as fallback search meta description.
            </p>
            <textarea
              id="blog-summary-input"
              rows={3}
              placeholder="Provide a compelling 160-200 character engineering summary..."
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                setIsDirty(true);
                setSaveStatus('Unsaved changes');
              }}
              className="blog-summary-textarea"
              maxLength={300}
            />
          </div>

          {/* Hero Banner Image */}
          <div className="editor-field-card">
            <div className="field-header-row">
              <label className="field-label-prominent">
                Hero Banner Image <span className="req-star">*</span>
              </label>
              <span className="img-format-hint">Recommended: 1600x900 (16:9), WebP/JPG/PNG</span>
            </div>

            <ImageUploader
              value={bannerImageUrl}
              onChange={(url) => {
                setBannerImageUrl(url);
                setIsDirty(true);
                setSaveStatus('Unsaved changes');
              }}
              folder="sprimax/blog/banners"
              helpText="Direct Cloudinary upload • 1600x900 (16:9), WebP/JPG/PNG max 5MB"
              onUploadStart={() => setUploadingBanner(true)}
              onUploadEnd={() => setUploadingBanner(false)}
            />

            {/* Banner Alt & Caption fields */}
            <div className="banner-metadata-inputs">
              <div className="banner-meta-field">
                <label className="meta-sublabel">
                  Banner Alt Text (Accessibility & SEO) <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Describe image content for screen readers & SEO..."
                  value={bannerAlt}
                  onChange={(e) => {
                    setBannerAlt(e.target.value);
                    setIsDirty(true);
                  }}
                  className="meta-input"
                />
              </div>

              <div className="banner-meta-field">
                <label className="meta-sublabel">Figure Caption (Shown as "Fig 1.")</label>
                <input
                  type="text"
                  placeholder="e.g. Fig 1. Multi-axis precision machining of alloy steel node components."
                  value={bannerCaption}
                  onChange={(e) => {
                    setBannerCaption(e.target.value);
                    setIsDirty(true);
                  }}
                  className="meta-input"
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              BLOCK BUILDER SECTION
              ========================================================================= */}
          <section className="block-builder-section">
            <div className="builder-header">
              <div>
                <h2 className="builder-title">Article Body & Content Blocks</h2>
                <p className="builder-subtitle">
                  Build structured technical articles with headings, data tables, callouts, and formulas.
                </p>
              </div>
              <span className="blocks-count-pill">{blocks.length} Blocks</span>
            </div>

            {/* Blocks List */}
            <div className="blocks-container">
              {blocks.map((block, idx) => {
                return (
                  <div key={block.id || idx} className="content-block-wrapper">
                    {/* Block Toolbar Header */}
                    <div className="block-top-handle">
                      <div className="block-type-badge">
                        <span className="block-index">#{idx + 1}</span>
                        <span className="block-name">{block.type.toUpperCase()}</span>
                        {block.isLead && <span className="lead-tag">Lead Style</span>}
                      </div>

                      <div className="block-actions">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveBlock(idx, -1)}
                          className="btn-block-action"
                          title="Move Up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === blocks.length - 1}
                          onClick={() => moveBlock(idx, 1)}
                          className="btn-block-action"
                          title="Move Down"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateBlock(idx)}
                          className="btn-block-action"
                          title="Duplicate Block"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(idx)}
                          className="btn-block-action btn-delete"
                          title="Delete Block"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Block Content Area Based on Type */}
                    <div className="block-editor-body">
                      {/* 1. PARAGRAPH BLOCK */}
                      {block.type === 'paragraph' && (
                        <div className="block-paragraph-editor">
                          <div className="paragraph-controls">
                            <label className="toggle-lead-label">
                              <input
                                type="checkbox"
                                checked={Boolean(block.isLead)}
                                onChange={(e) => updateBlock(idx, 'isLead', e.target.checked)}
                              />
                              <span>Lead / Intro Paragraph (Larger 18px font)</span>
                            </label>
                          </div>
                          <textarea
                            rows={4}
                            placeholder="Write technical paragraph body. Supports scientific notation (e.g. H₂O, Fe₃C)..."
                            value={block.content || ''}
                            onChange={(e) => updateBlock(idx, 'content', e.target.value)}
                            className={`block-textarea ${block.isLead ? 'textarea-lead' : ''}`}
                          />
                        </div>
                      )}

                      {/* 2. SECTION HEADING BLOCK */}
                      {block.type === 'heading' && (
                        <div className="block-heading-editor">
                          <div className="heading-level-selector">
                            <button
                              type="button"
                              className={`btn-level ${block.level === 'h2' ? 'active' : ''}`}
                              onClick={() => updateBlock(idx, 'level', 'h2')}
                            >
                              H2 (Primary with Red Accent Bar)
                            </button>
                            <button
                              type="button"
                              className={`btn-level ${block.level === 'h3' ? 'active' : ''}`}
                              onClick={() => updateBlock(idx, 'level', 'h3')}
                            >
                              H3 (Sub-heading)
                            </button>
                          </div>
                          <div className="heading-input-wrap">
                            {block.level === 'h2' && <span className="red-accent-preview" />}
                            <input
                              type="text"
                              placeholder="Enter section heading title..."
                              value={block.heading || ''}
                              onChange={(e) => updateBlock(idx, 'heading', e.target.value)}
                              className="block-heading-input"
                            />
                          </div>
                        </div>
                      )}

                      {/* 3. IMAGE BLOCK */}
                      {block.type === 'image' && (
                        <div className="block-image-editor">
                          <ImageUploader
                            value={block.imageUrl}
                            onChange={(url) => updateBlock(idx, 'imageUrl', url)}
                            folder="sprimax/blog/inline"
                            helpText="In-article technical figure • WebP/JPG/PNG up to 5MB"
                          />

                          <div className="inline-img-meta" style={{ marginTop: '0.85rem' }}>
                              <label>
                                Alt Text <span className="req-star">*</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Descriptive alt text for image..."
                                value={block.alt || ''}
                                onChange={(e) => updateBlock(idx, 'alt', e.target.value)}
                                className="meta-input"
                              />

                              <label>Figure Caption ({getImageFigureNumber(idx)})</label>
                              <input
                                type="text"
                                placeholder={`e.g. ${getImageFigureNumber(idx)}. Metallographic grain boundary structure under 500x magnification.`}
                                value={block.caption || ''}
                                onChange={(e) => updateBlock(idx, 'caption', e.target.value)}
                                className="meta-input"
                              />

                              <div className="width-toggle-group">
                                <span>Width:</span>
                                {['normal', 'wide', 'full'].map((w) => (
                                  <button
                                    key={w}
                                    type="button"
                                    className={`btn-width-toggle ${block.width === w ? 'active' : ''}`}
                                    onClick={() => updateBlock(idx, 'width', w)}
                                  >
                                    {w.toUpperCase()}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                      )}

                      {/* 4. TABLE BLOCK (With TSV / CSV paste and cell editing) */}
                      {block.type === 'table' && (
                        <div className="block-table-editor">
                          <div className="table-top-actions">
                            <input
                              type="text"
                              placeholder="Table title (e.g. Table 1: Chemical Composition Limits wt %)"
                              value={block.caption || ''}
                              onChange={(e) => updateBlock(idx, 'caption', e.target.value)}
                              className="table-caption-input"
                            />
                            <div className="table-btn-row">
                              <button
                                type="button"
                                className="btn-table-util"
                                onClick={() => {
                                  const newRows = [...(block.rows || [])];
                                  const colCount = block.headers?.length || 3;
                                  newRows.push(new Array(colCount).fill(''));
                                  updateBlock(idx, 'rows', newRows);
                                }}
                              >
                                + Add Row
                              </button>
                              <button
                                type="button"
                                className="btn-table-util"
                                onClick={() => {
                                  const newHeaders = [...(block.headers || []), `Col ${(block.headers?.length || 0) + 1}`];
                                  const newRows = (block.rows || []).map((row) => [...row, '']);
                                  updateBlock(idx, 'headers', newHeaders);
                                  updateBlock(idx, 'rows', newRows);
                                }}
                              >
                                + Add Column
                              </button>
                              <button
                                type="button"
                                className="btn-table-util"
                                onClick={() => {
                                  const tsv = prompt('Paste tab-separated data from Excel/Sheets or CSV:');
                                  if (tsv) {
                                    const lines = tsv.trim().split('\n').map((l) => l.split(tsv.includes('\t') ? '\t' : ',').map((c) => c.trim()));
                                    if (lines.length > 0) {
                                      updateBlock(idx, 'headers', lines[0]);
                                      updateBlock(idx, 'rows', lines.slice(1));
                                    }
                                  }
                                }}
                              >
                                Paste from Excel / CSV
                              </button>
                            </div>
                          </div>

                          <div className="table-render-scroll">
                            <table className="editable-data-table">
                              <thead>
                                <tr>
                                  {(block.headers || []).map((h, hIdx) => (
                                    <th key={hIdx}>
                                      <input
                                        type="text"
                                        value={h}
                                        onChange={(e) => {
                                          const nextHeaders = [...block.headers];
                                          nextHeaders[hIdx] = e.target.value;
                                          updateBlock(idx, 'headers', nextHeaders);
                                        }}
                                        className="cell-input header-cell-input"
                                      />
                                    </th>
                                  ))}
                                  <th className="th-del-col"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {(block.rows || []).map((row, rIdx) => (
                                  <tr key={rIdx}>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx}>
                                        <input
                                          type="text"
                                          value={cell}
                                          onChange={(e) => {
                                            const nextRows = [...block.rows];
                                            nextRows[rIdx][cIdx] = e.target.value;
                                            updateBlock(idx, 'rows', nextRows);
                                          }}
                                          className="cell-input"
                                        />
                                      </td>
                                    ))}
                                    <td className="td-del-row">
                                      <button
                                        type="button"
                                        className="btn-del-cell-row"
                                        onClick={() => {
                                          const nextRows = block.rows.filter((_, i) => i !== rIdx);
                                          updateBlock(idx, 'rows', nextRows);
                                        }}
                                        title="Delete Row"
                                      >
                                        &times;
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <input
                            type="text"
                            placeholder="Footnote / Source (e.g. Source: EN 10025-4 Standard)"
                            value={block.footnote || ''}
                            onChange={(e) => updateBlock(idx, 'footnote', e.target.value)}
                            className="table-footnote-input"
                          />
                        </div>
                      )}

                      {/* 5. CALLOUT / ENGINEERING NOTE BLOCK */}
                      {block.type === 'callout' && (
                        <div className={`block-callout-editor callout-${slugify(block.calloutType || 'note')}`}>
                          <div className="callout-header-row">
                            <select
                              value={block.calloutType || 'Engineering Note'}
                              onChange={(e) => {
                                updateBlock(idx, 'calloutType', e.target.value);
                                if (!block.title || block.title.includes('Note') || block.title.includes('Warning')) {
                                  updateBlock(idx, 'title', e.target.value);
                                }
                              }}
                              className="callout-type-select"
                            >
                              <option value="Engineering Note">Engineering Note (Red / Navy Accent)</option>
                              <option value="Warning">Warning (Safety Hazard)</option>
                              <option value="Safety">Safety Protocol</option>
                              <option value="Tip">Best Practice / Pro Tip</option>
                            </select>

                            <input
                              type="text"
                              placeholder="Callout title..."
                              value={block.title || ''}
                              onChange={(e) => updateBlock(idx, 'title', e.target.value)}
                              className="callout-title-input"
                            />
                          </div>

                          <textarea
                            rows={3}
                            placeholder="Engineering recommendation, standard rule, or hazard note..."
                            value={block.content || ''}
                            onChange={(e) => updateBlock(idx, 'content', e.target.value)}
                            className="callout-content-textarea"
                          />
                        </div>
                      )}

                      {/* 6. LIST BLOCK */}
                      {block.type === 'list' && (
                        <div className="block-list-editor">
                          <div className="list-type-row">
                            {['bullet', 'numbered', 'checklist'].map((t) => (
                              <button
                                key={t}
                                type="button"
                                className={`btn-list-type ${block.listType === t ? 'active' : ''}`}
                                onClick={() => updateBlock(idx, 'listType', t)}
                              >
                                {t.toUpperCase()}
                              </button>
                            ))}
                          </div>
                          {(block.items || []).map((item, itemIdx) => (
                            <div key={itemIdx} className="list-item-edit-row">
                              <span className="list-bullet-sym">
                                {block.listType === 'numbered' ? `${itemIdx + 1}.` : '•'}
                              </span>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const nextItems = [...block.items];
                                  nextItems[itemIdx] = e.target.value;
                                  updateBlock(idx, 'items', nextItems);
                                }}
                                className="list-item-input"
                              />
                              <button
                                type="button"
                                className="btn-del-item"
                                onClick={() => {
                                  const nextItems = block.items.filter((_, i) => i !== itemIdx);
                                  updateBlock(idx, 'items', nextItems);
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn-add-list-item"
                            onClick={() => {
                              const nextItems = [...(block.items || []), ''];
                              updateBlock(idx, 'items', nextItems);
                            }}
                          >
                            + Add Item
                          </button>
                        </div>
                      )}

                      {/* 7. QUOTE BLOCK */}
                      {block.type === 'quote' && (
                        <div className="block-quote-editor">
                          <textarea
                            rows={3}
                            placeholder="Quote text..."
                            value={block.quote || ''}
                            onChange={(e) => updateBlock(idx, 'quote', e.target.value)}
                            className="quote-textarea"
                          />
                          <input
                            type="text"
                            placeholder="Attribution / Author citation (e.g. Dr. H. Vossen, Head of Metallurgy)"
                            value={block.attribution || ''}
                            onChange={(e) => updateBlock(idx, 'attribution', e.target.value)}
                            className="quote-attribution-input"
                          />
                        </div>
                      )}

                      {/* 8. CODE / FORMULA BLOCK */}
                      {block.type === 'code' && (
                        <div className="block-code-editor">
                          <div className="code-lang-row">
                            <input
                              type="text"
                              placeholder="Standard / Formula label (e.g. CEV Equation - AWS D1.1)"
                              value={block.language || ''}
                              onChange={(e) => updateBlock(idx, 'language', e.target.value)}
                              className="code-lang-input"
                            />
                          </div>
                          <textarea
                            rows={4}
                            placeholder="Paste formula or code snippet..."
                            value={block.code || ''}
                            onChange={(e) => updateBlock(idx, 'code', e.target.value)}
                            className="code-textarea"
                          />
                        </div>
                      )}

                      {/* 9. REFERENCES / SOURCES BLOCK */}
                      {block.type === 'references' && (
                        <div className="block-references-editor">
                          <p className="field-hint">
                            Technical standards, ISO codes, and research papers cited in this publication:
                          </p>
                          {(block.references || []).map((refItem, refIdx) => (
                            <div key={refIdx} className="ref-item-row">
                              <span className="ref-num">[{refIdx + 1}]</span>
                              <input
                                type="text"
                                value={refItem}
                                onChange={(e) => {
                                  const nextRefs = [...block.references];
                                  nextRefs[refIdx] = e.target.value;
                                  updateBlock(idx, 'references', nextRefs);
                                }}
                                className="ref-input"
                              />
                              <button
                                type="button"
                                className="btn-del-item"
                                onClick={() => {
                                  const nextRefs = block.references.filter((_, i) => i !== refIdx);
                                  updateBlock(idx, 'references', nextRefs);
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn-add-list-item"
                            onClick={() => {
                              const nextRefs = [...(block.references || []), ''];
                              updateBlock(idx, 'references', nextRefs);
                            }}
                          >
                            + Add Reference
                          </button>
                        </div>
                      )}

                      {/* 10. FEATURED PRODUCT BLOCK WITH REAL-TIME CATALOGUE DROPDOWN */}
                      {block.type === 'featuredProduct' && (
                        <div className="block-featured-product-editor">
                          <div className="product-picker-header">
                            <div className="picker-header-title">
                              <Wrench size={16} color="#FF0804" />
                              <label className="field-label-sm" style={{ margin: 0, fontWeight: 700 }}>
                                Select Product from Live Catalogue (Real-time)
                              </label>
                            </div>
                            <span className="live-products-counter">
                              {dbProducts.length} catalogue products synced
                            </span>
                          </div>

                          <div className="product-select-wrapper">
                            <select
                              className="product-live-select"
                              value={block.productId || ''}
                              onChange={(e) => handleFeaturedProductSelect(idx, e.target.value)}
                            >
                              <option value="">-- Choose a Product from Catalogue --</option>
                              {dbProducts.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name} {p.sku ? `— [SKU: ${p.sku}]` : ''} {p.category ? `(${p.category})` : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Auto-populated Product Details Preview Card */}
                          {block.name ? (
                            <div className="selected-product-card-preview">
                              <div className="selected-product-img-box">
                                <img
                                  src={block.image || '/assets/product-placeholder.png'}
                                  alt={block.name}
                                  className="selected-product-img"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/assets/product-placeholder.png';
                                  }}
                                />
                              </div>
                              <div className="selected-product-details">
                                <div className="selected-product-tags-row">
                                  {block.sku && <span className="product-sku-tag">SKU: {block.sku}</span>}
                                  {block.category && <span className="product-cat-tag">{block.category}</span>}
                                  <span className="product-synced-badge">
                                    <CheckCircle size={13} color="#10b981" />
                                    <span>Details Auto-Fetched</span>
                                  </span>
                                </div>
                                <h4 className="selected-product-name">{block.name}</h4>
                                <p className="selected-product-desc">
                                  {block.description || 'No description provided in catalogue.'}
                                </p>
                                <div className="selected-product-link-row">
                                  <span className="product-target-url">
                                    Target Product Link: <code>{block.url || `/products?sku=${block.sku}`}</code>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="empty-product-prompt">
                              <p>No product selected yet. Choose a product from the dropdown above to auto-fetch all specifications, images, and designations directly into this blog.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Block Toolbar / Menu */}
            <div className="add-block-menu-dock">
              <span className="dock-label">+ Add Content Block:</span>
              <div className="dock-buttons">
                <button type="button" onClick={() => addBlock('paragraph')} className="btn-dock">
                  <AlignLeft size={15} />
                  <span>Paragraph</span>
                </button>
                <button type="button" onClick={() => addBlock('heading')} className="btn-dock">
                  <Heading size={15} />
                  <span>Heading (H2/H3)</span>
                </button>
                <button type="button" onClick={() => addBlock('table')} className="btn-dock">
                  <TableIcon size={15} />
                  <span>Data Table</span>
                </button>
                <button type="button" onClick={() => addBlock('callout')} className="btn-dock">
                  <AlertCircle size={15} />
                  <span>Engineering Note</span>
                </button>
                <button type="button" onClick={() => addBlock('image')} className="btn-dock">
                  <ImageIcon size={15} />
                  <span>Image Visual</span>
                </button>
                <button type="button" onClick={() => addBlock('featuredProduct')} className="btn-dock btn-dock-product">
                  <Wrench size={15} />
                  <span>Featured Product</span>
                </button>
                <button type="button" onClick={() => addBlock('list')} className="btn-dock">
                  <List size={15} />
                  <span>List</span>
                </button>
                <button type="button" onClick={() => addBlock('quote')} className="btn-dock">
                  <Quote size={15} />
                  <span>Quote</span>
                </button>
                <button type="button" onClick={() => addBlock('code')} className="btn-dock">
                  <Code size={15} />
                  <span>Formula / Code</span>
                </button>
                <button type="button" onClick={() => addBlock('references')} className="btn-dock">
                  <BookOpen size={15} />
                  <span>References</span>
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* =========================================================================
            RIGHT COLUMN: SETTINGS SIDEBAR
            ========================================================================= */}
        <aside className="editor-settings-sidebar">
          {/* Publish Checklist Card */}
          <div className="sidebar-card checklist-card">
            <h3 className="sidebar-card-title">Publish Checklist</h3>
            <ul className="checklist-items">
              <li className={checklist.hasTitle ? 'item-pass' : 'item-missing'}>
                {checklist.hasTitle ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span>Post title defined</span>
              </li>
              <li className={checklist.hasSlug ? 'item-pass' : 'item-missing'}>
                {checklist.hasSlug ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span>Valid URL slug generated</span>
              </li>
              <li className={checklist.hasSummary ? 'item-pass' : 'item-missing'}>
                {checklist.hasSummary ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span>Excerpt / summary (40+ chars)</span>
              </li>
              <li className={checklist.hasBanner ? 'item-pass' : 'item-missing'}>
                {checklist.hasBanner ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span>Hero banner image uploaded</span>
              </li>
              <li className={checklist.hasBannerAlt ? 'item-pass' : 'item-missing'}>
                {checklist.hasBannerAlt ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span>Banner alt text provided</span>
              </li>
              <li className={checklist.hasCategory ? 'item-pass' : 'item-missing'}>
                {checklist.hasCategory ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span>Category assigned</span>
              </li>
              <li className={checklist.hasBlocks ? 'item-pass' : 'item-missing'}>
                {checklist.hasBlocks ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span>Content blocks added</span>
              </li>
            </ul>
          </div>

          {/* Publishing & Timestamps */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Publishing Status</h3>

            {/* Read-Only Server Publish Date */}
            <div className="sidebar-field">
              <label className="field-label-sm">Published Date (Server-Set, Non-Editable)</label>
              <div className="readonly-timestamp-box">
                <Calendar size={15} />
                <span>
                  {publishedAt
                    ? formattedPublishedDate || new Date(publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Not published yet'}
                </span>
              </div>
              <p className="field-hint-xs">
                Timestamp is locked and automatically assigned by server upon initial publication.
              </p>
            </div>

            {/* Status Select */}
            <div className="sidebar-field">
              <label className="field-label-sm">Publication State</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setIsDirty(true);
                }}
                className="sidebar-select"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published (Live to Portal)</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {status === 'Scheduled' && (
              <div className="sidebar-field">
                <label className="field-label-sm">Schedule Launch Date & Time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => {
                    setScheduledAt(e.target.value);
                    setIsDirty(true);
                  }}
                  className="sidebar-input"
                />
              </div>
            )}

            {/* Read-Only Created & Updated Timestamps */}
            {createdAt && (
              <div className="timestamp-audit-meta">
                <p>Created: {new Date(createdAt).toLocaleString()}</p>
                {updatedAt && <p>Last Updated: {new Date(updatedAt).toLocaleString()}</p>}
              </div>
            )}
          </div>

          {/* Featured Post Toggle */}
          <div className="sidebar-card">
            <div className="toggle-card-row">
              <div>
                <h4 className="card-toggle-title">Featured Article</h4>
                <p className="card-toggle-desc">
                  Displays in the top prominent hero spot of the public technical blog page.
                </p>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => {
                  setFeatured(e.target.checked);
                  setIsDirty(true);
                }}
                className="switch-checkbox"
              />
            </div>
          </div>

          {/* Category & Tags */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Classification</h3>

            <div className="sidebar-field">
              <label className="field-label-sm">
                Category <span className="req-star">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setIsDirty(true);
                }}
                className="sidebar-select"
              >
                {categoriesList.map((c) => (
                  <option key={c._id || c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Tags & Keywords</label>
              <div className="tags-chip-list">
                {tags.map((t) => (
                  <span key={t} className="tag-chip">
                    {t}
                    <button type="button" onClick={() => handleRemoveTag(t)}>
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="tag-add-row">
                <input
                  type="text"
                  placeholder="Add tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="sidebar-input tag-input"
                />
                <button type="button" onClick={handleAddTag} className="btn-tag-add">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Author & Read Time */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Author & Read Time</h3>

            <div className="sidebar-field">
              <label className="field-label-sm">Author / Organization Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  setIsDirty(true);
                }}
                className="sidebar-input"
              />
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Author Role / Division</label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => {
                  setAuthorRole(e.target.value);
                  setIsDirty(true);
                }}
                className="sidebar-input"
              />
            </div>

            <div className="sidebar-field">
              <label className="field-label-sm">Read Time (Minutes)</label>
              <div className="readtime-wrap">
                <input
                  type="number"
                  placeholder={`Auto (${calculatedStats.minutes} min)`}
                  value={readTimeOverride}
                  onChange={(e) => {
                    setReadTimeOverride(e.target.value);
                    setIsDirty(true);
                  }}
                  className="sidebar-input"
                  min={1}
                  max={120}
                />
                <span className="auto-calc-tag">
                  ~{calculatedStats.words} words ({calculatedStats.minutes}m auto)
                </span>
              </div>
            </div>
          </div>

          {/* Display Toggles */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Display Options</h3>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={displayOptions.showShareButton}
                onChange={(e) => {
                  setDisplayOptions({ ...displayOptions, showShareButton: e.target.checked });
                  setIsDirty(true);
                }}
              />
              <span>Show Share Protocol button</span>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={displayOptions.showPrintButton}
                onChange={(e) => {
                  setDisplayOptions({ ...displayOptions, showPrintButton: e.target.checked });
                  setIsDirty(true);
                }}
              />
              <span>Show Print Protocol button</span>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={displayOptions.showSidebar}
                onChange={(e) => {
                  setDisplayOptions({ ...displayOptions, showSidebar: e.target.checked });
                  setIsDirty(true);
                }}
              />
              <span>Show Right Sidebar Widgets</span>
            </label>
          </div>
        </aside>
      </div>
    </div>
  );
}
