import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Ban,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  FlaskConical,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Pencil,
  Ruler,
  Sliders,
  Trash2,
  Upload,
  X,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import {
  fetchProductById,
  updateProductApi,
  fetchDownloads,
  uploadImageApi,
} from './api/products.js';
import './ProductDescriptionPage.css';

// Element metadata mapping for clean human-readable element names and tooltips/impacts
const ELEMENT_NAMES = {
  C: { name: 'Carbon', impact: 'Hardness & Tensile Strength' },
  Mn: { name: 'Manganese', impact: 'Toughness, Hardenability & Deoxidation' },
  Si: { name: 'Silicon', impact: 'Deoxidation & Arc Stability' },
  P: { name: 'Phosphorus', impact: 'Kept minimal for crack resistance' },
  S: { name: 'Sulfur', impact: 'Kept minimal for hot crack prevention' },
  Cr: { name: 'Chromium', impact: 'Corrosion Resistance & Ferrite Stability' },
  Ni: { name: 'Nickel', impact: 'Austenite Stability & Low-Temp Toughness' },
  Mo: { name: 'Molybdenum', impact: 'Pitting Resistance & High-Temp Strength' },
  Nb: { name: 'Niobium', impact: 'Stabilizer against intergranular corrosion' },
  Ti: { name: 'Titanium', impact: 'Grain Refinement & High-Temp Strength' },
  Cu: { name: 'Copper', impact: 'Atmospheric Corrosion Resistance' },
  Al: { name: 'Aluminum', impact: 'Base Matrix / Primary Deoxidizer' },
  Fe: { name: 'Iron', impact: 'Base Matrix / Balance' },
  V: { name: 'Vanadium', impact: 'Grain refinement & secondary hardening' },
  W: { name: 'Tungsten', impact: 'Abrasion & wear resistance at heat' },
};

export default function ProductDescriptionPage({
  product: initialProduct,
  onBack,
  onLogout,
  onNavigate,
  onEditProduct,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeTab, setActiveTab] = useState('chemical'); // 'chemical' | 'mechanical'
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Real database state
  const [product, setProduct] = useState(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [allDownloads, setAllDownloads] = useState([]);

  // Media Management State
  const [isManageMediaOpen, setIsManageMediaOpen] = useState(false);
  const [selectedMediaIndices, setSelectedMediaIndices] = useState([]);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImagePreview, setNewImagePreview] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSavingMedia, setIsSavingMedia] = useState(false);

  const fileInputRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // Fetch product from DB on mount or when initialProduct changes
  useEffect(() => {
    let isMounted = true;
    const identifier = initialProduct?._id || initialProduct?.id || initialProduct?.sku;

    async function loadData() {
      try {
        const [downloadsData, productData] = await Promise.all([
          fetchDownloads().catch(() => []),
          identifier ? fetchProductById(identifier).catch(() => null) : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        if (downloadsData) {
          setAllDownloads(downloadsData);
        }

        if (productData && productData.product) {
          setProduct(productData.product);
        } else if (initialProduct) {
          setProduct(initialProduct);
        }
      } catch (err) {
        console.error('Error fetching product description data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [initialProduct]);

  // Toggle active / inactive status in DB
  const toggleStatus = async () => {
    if (!product) return;
    const nextStatus = product.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const idToUpdate = product._id || product.id || product.sku;
      const res = await updateProductApi(idToUpdate, { status: nextStatus });
      const updated = res.product || { ...product, status: nextStatus };
      setProduct(updated);
      showToast(`Product status changed to ${nextStatus}.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to change product status: ' + err.message, 'error');
    }
  };

  // Compute matched documents for this product (both product.documents uploaded directly and downloads matching product)
  const productDocuments = (() => {
    if (!product) return [];
    
    // 1. Direct documents attached to product (from Edit Product page)
    const directDocs = Array.isArray(product.documents)
      ? product.documents.map((d, index) => {
          const rawMeta = d.meta || '';
          const parts = rawMeta.split('•').map((s) => s.trim());
          const fileType = parts[0] || (d.type ? d.type.toUpperCase() : 'PDF');
          const fileSize = parts[1] || '1.5 MB';
          return {
            _id: d.id || d._id || `pdoc-${index}`,
            id: d.id || d._id || `pdoc-${index}`,
            title: d.title || `Document ${index + 1}`,
            fileUrl: d.fileUrl || '',
            fileType: fileType,
            fileSize: fileSize,
            category: (d.type || 'TDS').toUpperCase(),
            type: (d.type || 'pdf').toLowerCase(),
            isDirect: true,
          };
        })
      : [];

    // 2. Global download resources matching this product
    const pName = (product.name || '').toLowerCase();
    const pSku = (product.sku || '').toLowerCase();
    const pCat = (product.category || '').toLowerCase();
    const pAws = (product.awsClass || '').toLowerCase();

    const matchedGlobalDocs = (allDownloads || []).filter((doc) => {
      const rel = (doc.relatedProduct || '').toLowerCase();
      const title = (doc.title || '').toLowerCase();

      const matchesSku = pSku && (rel.includes(pSku) || title.includes(pSku));
      const matchesAws = pAws && (rel.includes(pAws) || title.includes(pAws));
      const matchesName = pName && (rel.includes(pName) || title.includes(pName));
      const matchesCat = pCat && rel.includes(pCat.split(' ')[0]);

      return matchesSku || matchesAws || matchesName || matchesCat;
    });

    // Merge direct docs first, then avoid duplicates by fileUrl or title
    const seen = new Set();
    const merged = [];

    for (const doc of [...directDocs, ...matchedGlobalDocs]) {
      const key = (doc.fileUrl || doc.title || '').toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(doc);
      }
    }

    return merged;
  })();

  // Handle document download trigger
  const handleDownloadDoc = (doc) => {
    if (!doc.fileUrl) {
      showToast(`No file URL available for "${doc.title}".`, 'error');
      return;
    }

    // Resolve full URL if path is relative (/uploads/...)
    let downloadHref = doc.fileUrl;
    if (downloadHref.startsWith('/')) {
      downloadHref = `http://localhost:5000${downloadHref}`;
    }

    // Extract exact extension from fileUrl or default to doc.fileType
    let extension = '';
    const cleanUrl = doc.fileUrl.split('?')[0];
    const dotIndex = cleanUrl.lastIndexOf('.');
    if (dotIndex !== -1) {
      extension = cleanUrl.substring(dotIndex).toLowerCase();
    }
    if (!extension || extension.length > 6) {
      extension = `.${(doc.fileType || 'pdf').toLowerCase()}`;
    }

    // Clean filename
    const cleanTitle = (doc.title || 'document').replace(/[\\/:*?"<>|]/g, '_');
    const finalFilename = doc.fileName || (cleanTitle.toLowerCase().endsWith(extension) ? cleanTitle : `${cleanTitle}${extension}`);

    showToast(`Downloading "${doc.title}"...`);

    // Fetch as blob to force browser download and ensure binary integrity
    fetch(downloadHref)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      })
      .catch((err) => {
        console.warn('Direct blob download failed, falling back to window.open:', err);
        window.open(downloadHref, '_blank');
      });
  };

  // Selected file object to upload to /api/upload
  const [selectedFile, setSelectedFile] = useState(null);

  // Quick select presets available in public
  const AVAILABLE_PRESETS = [
    { label: 'E7018 Electrode', path: '/product-7018.png' },
    { label: 'LH-7018 Electrode', path: '/product-lh7018.png' },
    { label: 'ER70S MIG Spool', path: '/product-er70s.png' },
    { label: 'MIG Wire Spool', path: '/cat-mig-spool.png' },
    { label: 'E6010 Cellulosic', path: '/product-6010.png' },
    { label: 'Welding Joint', path: '/welding-joint.png' },
    { label: 'Cross Section', path: '/media-cross-section.jpg' },
    { label: 'Warehouse Pallet', path: '/media-warehouse-pallet.jpg' },
  ];

  // Image file selection for Add Media
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast('Image file size must be less than 25MB', 'error');
      return;
    }

    setSelectedFile(file);
    setNewImageUrl('');

    // Generate local preview
    const objectUrl = URL.createObjectURL(file);
    setNewImagePreview(objectUrl);
  };

  // Submit adding new media
  const handleAddMediaSubmit = async (e) => {
    e.preventDefault();

    let finalImageUrl = '';

    try {
      setIsSavingMedia(true);

      if (selectedFile) {
        // Upload the actual image file to backend server via /api/upload
        showToast('Uploading image to server...');
        const uploadResult = await uploadImageApi(selectedFile);
        finalImageUrl = uploadResult.url;
      } else if (newImageUrl.trim()) {
        finalImageUrl = newImageUrl.trim();
      }

      if (!finalImageUrl) {
        showToast('Please choose an image file or select a preset', 'error');
        setIsSavingMedia(false);
        return;
      }

      const currentImages = Array.isArray(product.images) ? [...product.images] : [];
      const updatedImages = [...currentImages, finalImageUrl];

      const idToUpdate = product._id || product.id || product.sku;
      const payload = { images: updatedImages };

      // If product has no main image or current image is invalid, set it as primary
      if (!product.image || product.image.includes('placeholder') || product.image.includes('google.com')) {
        payload.image = finalImageUrl;
      }

      const res = await updateProductApi(idToUpdate, payload);
      setProduct(res.product || { ...product, ...payload });
      setIsAddMediaOpen(false);
      setNewImageUrl('');
      setNewImagePreview('');
      setSelectedFile(null);
      showToast('Media image uploaded and saved successfully!');
    } catch (err) {
      console.error('Failed to add media image:', err);
      showToast('Failed to add media: ' + err.message, 'error');
    } finally {
      setIsSavingMedia(false);
    }
  };

  // Execute deletion of selected images
  const executeDeleteImages = async () => {
    if (!product || !selectedMediaIndices.length) return;

    try {
      setIsSavingMedia(true);
      const currentImages = Array.isArray(product.images) ? [...product.images] : [];
      const updatedImages = currentImages.filter((_, idx) => !selectedMediaIndices.includes(idx));

      const idToUpdate = product._id || product.id || product.sku;
      const res = await updateProductApi(idToUpdate, { images: updatedImages });

      setProduct(res.product || { ...product, images: updatedImages });
      setSelectedMediaIndices([]);
      setIsDeleteConfirmOpen(false);
      setIsManageMediaOpen(false);
      showToast(`${selectedMediaIndices.length} image(s) deleted successfully.`);
    } catch (err) {
      console.error('Failed to delete media:', err);
      showToast('Failed to delete media: ' + err.message, 'error');
    } finally {
      setIsSavingMedia(false);
    }
  };

  // Format chemical composition data from database object
  const chemicalEntries = (() => {
    if (!product?.chemicalComposition) return [];
    if (typeof product.chemicalComposition === 'object') {
      return Object.entries(product.chemicalComposition).map(([key, val]) => {
        const info = ELEMENT_NAMES[key] || { name: key, impact: 'Alloying constituent' };
        const valStr = String(val).trim();
        return {
          symbol: key,
          element: info.name,
          value: valStr,
          impact: info.impact,
          highlight: ['Ti', 'Mo', 'Ni', 'Cr'].includes(key),
        };
      });
    }
    return [];
  })();

  // Format mechanical properties from database specifications map/object
  const mechanicalEntries = (() => {
    if (!product?.specifications) return [];
    const specs = product.specifications;
    const entries = [];

    // Check if it's a Map or Object
    const specEntries =
      specs instanceof Map
        ? Array.from(specs.entries())
        : Object.entries(specs);

    for (const [prop, val] of specEntries) {
      let requirement = 'Standard requirement met';
      let notes = 'Certified metallurgical testing';

      if (prop.toLowerCase().includes('tensile')) {
        requirement = 'Per AWS / ISO standard';
        notes = 'High ultimate strength';
      } else if (prop.toLowerCase().includes('yield')) {
        requirement = 'Structural load capacity';
        notes = 'Guaranteed yield proof';
      } else if (prop.toLowerCase().includes('elongation')) {
        requirement = 'A5 gauge length';
        notes = 'Ductility & formability';
      } else if (prop.toLowerCase().includes('impact')) {
        requirement = 'Charpy V-Notch test';
        notes = 'Sub-zero notch toughness';
      } else if (prop.toLowerCase().includes('hardness')) {
        requirement = 'Rockwell C scale';
        notes = 'Abrasion resistance';
      }

      entries.push({
        property: prop,
        typical: String(val),
        requirement,
        notes,
      });
    }

    return entries;
  })();

  // Primary image with fallback to /cat-placeholder.png
  const mainImageSrc = product?.image || '/cat-placeholder.png';
  const mediaList = Array.isArray(product?.images) ? product.images : [];

  if (loading) {
    return (
      <div className="admin-shell">
        <AdminSidebar
          currentNav="Catalogue"
          mobileOpen={mobileSidebarOpen}
          onLogout={onLogout}
          onNavigate={onNavigate}
          setMobileOpen={setMobileSidebarOpen}
        />
        <div className="admin-main loading-screen-centered">
          <Loader2 className="spinner-large" />
          <p>Loading product details from database...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="admin-shell">
        <AdminSidebar
          currentNav="Catalogue"
          mobileOpen={mobileSidebarOpen}
          onLogout={onLogout}
          onNavigate={onNavigate}
          setMobileOpen={setMobileSidebarOpen}
        />
        <div className="admin-main">
          <div className="product-details-content">
            <button className="topbar-back-button" onClick={onBack} type="button">
              <ArrowLeft />
            </button>
            <div className="no-data-card">
              <h2>Product Not Found</h2>
              <p>The requested product could not be retrieved from the database.</p>
              <button className="btn-edit-primary" onClick={onBack}>
                Return to Catalogue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      {/* Sidebar with Catalogue navigation active */}
      <AdminSidebar
        currentNav="Catalogue"
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left-cluster">
            <button
              aria-label="Back to Catalogue"
              className="topbar-back-button"
              onClick={onBack}
              title="Back to Catalogue"
              type="button"
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <h1 className="topbar-title topbar-title--clickable" onClick={onBack}>
              Catalogue
            </h1>
          </div>

          <div className="topbar-tools">
            <label className="dashboard-search">
              <input
                aria-label="Search"
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search..."
                type="search"
                value={globalSearch}
              />
            </label>

            <button aria-label="Notifications" className="topbar-icon-button" type="button">
              <span className="bell-icon-wrapper">
                <span className="notification-dot" />
              </span>
            </button>

            <button aria-label="Admin profile" className="profile-avatar" type="button">
              <img
                alt="Admin"
                className="profile-avatar-img"
                src="/avatar-admin.jpg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="profile-avatar-fallback">AD</span>
            </button>
          </div>
        </header>

        {/* Product Details Content */}
        <main className="product-details-content">
          {/* Breadcrumbs Row */}
          <nav aria-label="Breadcrumb" className="details-breadcrumbs">
            <button className="breadcrumb-link" onClick={onBack} type="button">
              Catalogue
            </button>
            <ChevronRight className="breadcrumb-separator" aria-hidden="true" />
            <span className="breadcrumb-segment">{product.category || 'Consumables'}</span>
            <ChevronRight className="breadcrumb-separator" aria-hidden="true" />
            <span className="breadcrumb-current">{product.name}</span>
          </nav>

          {/* Header Row: Title, Status badge, SKU, and Action Buttons */}
          <div className="details-header-row">
            <div className="details-title-cluster">
              <div className="title-and-status">
                <h1 className="product-main-title">{product.name}</h1>
                <span
                  className={`status-pill-badge status-pill-badge--${(
                    product.status || 'Active'
                  ).toLowerCase()}`}
                >
                  <span className="status-dot-indicator" />
                  <span>{product.status || 'Active'}</span>
                </span>
                {product.featured && (
                  <span className="featured-star-badge" title="Featured in catalogue">
                    ★ Featured
                  </span>
                )}
              </div>
              <p className="product-sku-subtitle">
                SKU: <span className="sku-code-text">{product.sku}</span> &bull; AWS Class:{' '}
                <strong>{product.awsClass || 'N/A'}</strong>
              </p>
            </div>

            <div className="details-header-actions">
              <button
                className={`btn-deactivate ${
                  product.status === 'Inactive' ? 'btn-deactivate--inactive' : ''
                }`}
                onClick={toggleStatus}
                type="button"
              >
                <Ban aria-hidden="true" />
                <span>{product.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
              </button>
              <button
                className="btn-edit-primary"
                onClick={() => {
                  if (onEditProduct) {
                    onEditProduct(product);
                  }
                }}
                type="button"
              >
                <Pencil aria-hidden="true" />
                <span>Edit Product</span>
              </button>
            </div>
          </div>

          {/* Top Grid: Hero Left + Classification & Dimensions Middle/Right */}
          <div className="details-top-grid">
            {/* Primary Application Card (Left Hero) */}
            <article className="details-card hero-primary-card">
              <div className="hero-card-image-wrap">
                <img
                  alt={product.name}
                  className="hero-card-image"
                  src={mainImageSrc}
                  onError={(e) => {
                    e.currentTarget.src = '/cat-placeholder.png';
                  }}
                />
                <div className="iso-badge">
                  <CheckCircle2 className="iso-badge-icon" aria-hidden="true" />
                  <span>ISO-9001 Certified</span>
                </div>
              </div>

              <div className="hero-card-body">
                <h2 className="card-section-title">Primary Application & Description</h2>
                <p className="primary-application-desc">
                  {product.description || 'No detailed description provided for this product.'}
                </p>

                {/* Base price & Inventory */}
                <div className="price-inventory-row">
                  <div className="stat-pill-box">
                    <span className="stat-pill-label">Base Price</span>
                    <strong className="stat-pill-value">
                      {product.basePrice || '$14.50 /kg'}
                    </strong>
                  </div>
                  <div className="stat-pill-box">
                    <span className="stat-pill-label">Inventory / Weight</span>
                    <strong className="stat-pill-value">
                      {product.inventory ||
                        (product.techSpecsRows?.[0]?.length
                          ? `Pack: ${product.techSpecsRows[0].length}`
                          : 'In Stock')}
                    </strong>
                  </div>
                </div>

                {/* Key features pill list */}
                {Array.isArray(product.features) && product.features.length > 0 && (
                  <div className="hero-features-list">
                    <span className="features-list-title">Key Highlights:</span>
                    <ul>
                      {product.features.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>

            {/* Right Top Area: Classification & Dimensions, plus Tabs Table */}
            <div className="details-top-right-column">
              <div className="specs-cards-row">
                {/* Classification Card */}
                <article className="details-card spec-card">
                  <div className="spec-card-header">
                    <Layers className="spec-card-icon" aria-hidden="true" />
                    <h2 className="spec-card-title">Classification</h2>
                  </div>
                  <div className="spec-kv-list">
                    <div className="spec-kv-item">
                      <span className="spec-kv-key">Category</span>
                      <strong className="spec-kv-val">{product.category || 'N/A'}</strong>
                    </div>
                    <div className="spec-kv-item">
                      <span className="spec-kv-key">Subcategory</span>
                      <strong className="spec-kv-val">{product.subcategory || 'Standard Consumable'}</strong>
                    </div>
                    <div className="spec-kv-item">
                      <span className="spec-kv-key">Base Material</span>
                      <strong className="spec-kv-val">{product.baseMaterial || 'N/A'}</strong>
                    </div>
                    <div className="spec-kv-item">
                      <span className="spec-kv-key">AWS Class</span>
                      <strong className="spec-kv-val spec-kv-val--tabular">
                        {product.awsClass || 'N/A'}
                      </strong>
                    </div>
                    <div className="spec-kv-item">
                      <span className="spec-kv-key">Target Industries</span>
                      <strong className="spec-kv-val">
                        {Array.isArray(product.industries) && product.industries.length
                          ? product.industries.join(', ')
                          : 'General Manufacturing'}
                      </strong>
                    </div>
                  </div>
                </article>

                {/* Dimensions & Tech Specs Card */}
                <article className="details-card spec-card">
                  <div className="spec-card-header">
                    <Ruler className="spec-card-icon" aria-hidden="true" />
                    <h2 className="spec-card-title">Dimensions & Parameters</h2>
                  </div>
                  <div className="spec-kv-list">
                    <div className="spec-kv-item">
                      <span className="spec-kv-key">Available Diameters</span>
                      <strong className="spec-kv-val spec-kv-val--tabular">
                        {product.techSpecsRows?.length
                          ? product.techSpecsRows.map((r) => r.diameter ? `${r.diameter}mm` : '').filter(Boolean).join(', ')
                          : 'Standard Ranges'}
                      </strong>
                    </div>
                    <div className="spec-kv-item">
                      <span className="spec-kv-key">Length / Package</span>
                      <strong className="spec-kv-val spec-kv-val--tabular">
                        {product.techSpecsRows?.length
                          ? product.techSpecsRows[0].length || 'Standard Packaging'
                          : '350mm - 450mm'}
                      </strong>
                    </div>
                    <div className="spec-kv-item">
                      <span className="spec-kv-key">Welding Current</span>
                      <strong className="spec-kv-val">
                        {product.specifications?.['Welding Current'] ||
                          product.specifications?.get?.('Welding Current') ||
                          'AC / DC+'}
                      </strong>
                    </div>
                    <div className="spec-kv-item">
                      <span className="spec-kv-key">Welding Positions</span>
                      <strong className="spec-kv-val">
                        {product.specifications?.Positions ||
                          product.specifications?.get?.('Positions') ||
                          'All positions'}
                      </strong>
                    </div>
                    <div className="spec-kv-item">
                      <span className="spec-kv-key">Approvals & Certs</span>
                      <strong className="spec-kv-val">
                        {Array.isArray(product.approvals) && product.approvals.length
                          ? product.approvals.join(', ')
                          : 'CE, ISO 9001'}
                      </strong>
                    </div>
                  </div>
                </article>
              </div>

              {/* Chemical Comp. & Mechanical Props. Tabs */}
              <article className="details-card tabs-table-card">
                <div className="tabs-header-bar">
                  <button
                    aria-selected={activeTab === 'chemical'}
                    className={`tab-pill-button${
                      activeTab === 'chemical' ? ' tab-pill-button--active' : ''
                    }`}
                    onClick={() => setActiveTab('chemical')}
                    role="tab"
                    type="button"
                  >
                    <FlaskConical className="tab-icon" aria-hidden="true" />
                    <span>Chemical Composition ({chemicalEntries.length})</span>
                  </button>

                  <button
                    aria-selected={activeTab === 'mechanical'}
                    className={`tab-pill-button${
                      activeTab === 'mechanical' ? ' tab-pill-button--active' : ''
                    }`}
                    onClick={() => setActiveTab('mechanical')}
                    role="tab"
                    type="button"
                  >
                    <Sliders className="tab-icon" aria-hidden="true" />
                    <span>Mechanical Properties ({mechanicalEntries.length})</span>
                  </button>
                </div>

                <div className="tabs-content-area">
                  {activeTab === 'chemical' ? (
                    chemicalEntries.length > 0 ? (
                      <div className="table-responsive">
                        <table className="specs-data-table">
                          <thead>
                            <tr>
                              <th scope="col">Element</th>
                              <th scope="col">Symbol</th>
                              <th scope="col">Typical Content (%)</th>
                              <th scope="col">Metallurgical Impact</th>
                            </tr>
                          </thead>
                          <tbody>
                            {chemicalEntries.map((row) => (
                              <tr key={row.symbol}>
                                <td className="td-element">
                                  <strong>{row.element}</strong>
                                </td>
                                <td className="td-symbol">{row.symbol}</td>
                                <td
                                  className={`td-typical${
                                    row.highlight ? ' td-highlight-cell' : ''
                                  }`}
                                >
                                  {row.value}
                                </td>
                                <td className="td-impact">{row.impact}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="no-data-msg">No chemical composition recorded for this product.</p>
                    )
                  ) : mechanicalEntries.length > 0 ? (
                    <div className="table-responsive">
                      <table className="specs-data-table">
                        <thead>
                          <tr>
                            <th scope="col">Property</th>
                            <th scope="col">Typical Value</th>
                            <th scope="col">Requirement / Standard</th>
                            <th scope="col">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mechanicalEntries.map((row) => (
                            <tr key={row.property}>
                              <td className="td-element">
                                <strong>{row.property}</strong>
                              </td>
                              <td className="td-typical">{row.typical}</td>
                              <td className="td-requirement">{row.requirement}</td>
                              <td className="td-notes">{row.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="no-data-msg">No mechanical properties recorded for this product.</p>
                  )}
                </div>
              </article>
            </div>
          </div>

          {/* Product Media Card */}
          <article className="details-card media-section-card">
            <div className="media-section-header">
              <div className="media-title-group">
                <ImageIcon className="section-header-icon" aria-hidden="true" />
                <h2 className="card-section-title">
                  Product Media ({mediaList.length})
                </h2>
              </div>
              <div className="media-header-actions">
                <button
                  className="btn-text-manage"
                  onClick={() => {
                    setSelectedMediaIndices([]);
                    setIsManageMediaOpen(true);
                  }}
                  type="button"
                >
                  Manage Media
                </button>
              </div>
            </div>

            {mediaList.length > 0 ? (
              <div className="media-thumbnails-grid">
                {mediaList.map((imgSrc, idx) => (
                  <div key={idx} className="media-thumb-item" title={`Product image ${idx + 1}`}>
                    <img
                      alt={`Product media ${idx + 1}`}
                      className="media-thumb-img"
                      src={imgSrc}
                      onError={(e) => {
                        e.currentTarget.src = '/cat-placeholder.png';
                      }}
                    />
                  </div>
                ))}

                <button
                  className="media-add-button"
                  onClick={() => setIsAddMediaOpen(true)}
                  type="button"
                >
                  <ImagePlus className="media-add-icon" aria-hidden="true" />
                  <span className="media-add-text">Add Media</span>
                </button>
              </div>
            ) : (
              <div className="media-empty-cluster">
                <p className="no-data-msg">No media for this product</p>
                <button
                  className="media-add-button media-add-button--inline"
                  onClick={() => setIsAddMediaOpen(true)}
                  type="button"
                >
                  <ImagePlus className="media-add-icon" aria-hidden="true" />
                  <span className="media-add-text">Add Media</span>
                </button>
              </div>
            )}
          </article>

          {/* Technical Documents Card */}
          <article className="details-card docs-section-card">
            <div className="docs-section-header">
              <div className="media-title-group">
                <FileText className="section-header-icon" aria-hidden="true" />
                <h2 className="card-section-title">
                  Technical Documents ({productDocuments.length})
                </h2>
              </div>
            </div>

            {productDocuments.length > 0 ? (
              <div className="docs-cards-grid">
                {productDocuments.map((doc) => (
                  <div key={doc._id || doc.id} className="doc-card-item">
                    <div
                      className={`doc-badge doc-badge--${
                        doc.type === 'cad' ? 'cad' : 'pdf'
                      }`}
                    >
                      <FileText aria-hidden="true" />
                    </div>
                    <div className="doc-meta-block">
                      <h3 className="doc-title" title={doc.title}>
                        {doc.title}
                      </h3>
                      <p className="doc-subtitle">
                        {doc.fileType || 'PDF'} &bull; {doc.fileSize || '1.2 MB'} &bull; {doc.category || 'TDS'}
                      </p>
                    </div>
                    <button
                      aria-label={`Download ${doc.title}`}
                      className="doc-download-btn"
                      onClick={() => handleDownloadDoc(doc)}
                      title="Download document"
                      type="button"
                    >
                      <Download aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data-msg">No documents for this product</p>
            )}
          </article>
        </main>
      </div>

      {/* MANAGE MEDIA MODAL */}
      {isManageMediaOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card manage-media-modal">
            <header className="modal-header">
              <div className="modal-title-with-badge">
                <h2 className="modal-title">Manage Product Media</h2>
                <span className="modal-badge-count">{mediaList.length} items</span>
              </div>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => {
                  setIsManageMediaOpen(false);
                  setSelectedMediaIndices([]);
                }}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <div className="manage-media-body">
              <p className="manage-media-instruction">
                Select images you want to remove from this product. You will be prompted to confirm before deletion.
              </p>

              {mediaList.length > 0 ? (
                <div className="manage-media-grid">
                  {mediaList.map((imgSrc, idx) => {
                    const isSelected = selectedMediaIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`manage-media-item ${isSelected ? 'manage-media-item--selected' : ''}`}
                        onClick={() => {
                          setSelectedMediaIndices((prev) =>
                            prev.includes(idx)
                              ? prev.filter((i) => i !== idx)
                              : [...prev, idx]
                          );
                        }}
                      >
                        <img
                          alt={`Media ${idx + 1}`}
                          className="manage-media-img"
                          src={imgSrc}
                          onError={(e) => {
                            e.currentTarget.src = '/cat-placeholder.png';
                          }}
                        />
                        <label
                          className="manage-media-checkbox-overlay"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMediaIndices((prev) => [...prev, idx]);
                              } else {
                                setSelectedMediaIndices((prev) => prev.filter((i) => i !== idx));
                              }
                            }}
                            type="checkbox"
                          />
                          <span className="custom-check-box" />
                        </label>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-data-msg">No media available to manage.</p>
              )}
            </div>

            <footer className="modal-actions-footer manage-media-footer">
              <div className="selected-count-label">
                {selectedMediaIndices.length > 0 ? (
                  <span>
                    <strong>{selectedMediaIndices.length}</strong> image(s) selected
                  </span>
                ) : (
                  <span>No images selected</span>
                )}
              </div>

              <div className="modal-footer-buttons">
                <button
                  className="btn-modal-cancel"
                  onClick={() => {
                    setIsManageMediaOpen(false);
                    setSelectedMediaIndices([]);
                  }}
                  type="button"
                >
                  Close
                </button>
                <button
                  className="btn-danger-delete"
                  disabled={selectedMediaIndices.length === 0}
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  type="button"
                >
                  <Trash2 aria-hidden="true" />
                  <span>Delete Selected</span>
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteConfirmOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card confirm-modal-card">
            <div className="confirm-icon-wrap confirm-icon-wrap--danger">
              <AlertTriangle className="confirm-icon" aria-hidden="true" />
            </div>
            <h2 className="confirm-modal-title">Delete Selected Images?</h2>
            <p className="confirm-modal-text">
              Are you sure you want to delete{' '}
              <strong>{selectedMediaIndices.length} image(s)</strong> from this product? This action will immediately update the database and cannot be undone.
            </p>
            <div className="confirm-modal-actions">
              <button
                className="btn-modal-cancel"
                disabled={isSavingMedia}
                onClick={() => setIsDeleteConfirmOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn-danger-confirm"
                disabled={isSavingMedia}
                onClick={executeDeleteImages}
                type="button"
              >
                {isSavingMedia ? (
                  <>
                    <Loader2 className="spinner-inline" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 aria-hidden="true" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MEDIA MODAL */}
      {isAddMediaOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card add-media-modal">
            <header className="modal-header">
              <h2 className="modal-title">Add Product Media</h2>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => {
                  setIsAddMediaOpen(false);
                  setNewImageUrl('');
                  setNewImagePreview('');
                }}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleAddMediaSubmit} className="modal-form">
              <div className="modal-field">
                <label className="modal-label">Upload Image File from Device</label>
                <input
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  className="file-input-hidden"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  type="file"
                />
                <button
                  className="upload-dropzone-button"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Upload className="dropzone-icon" aria-hidden="true" />
                  <span className="dropzone-text">
                    {selectedFile ? selectedFile.name : 'Click to select photo / document (PNG, JPG, WebP)'}
                  </span>
                  <span className="dropzone-sub">
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload` : 'High resolution up to 25MB'}
                  </span>
                </button>
              </div>

              <div className="modal-divider-row">
                <span>OR SELECT FROM SAMPLE GALLERY</span>
              </div>

              <div className="modal-field">
                <label className="modal-label">Pre-loaded Consumables & Lab Photos</label>
                <div className="preset-chips-grid">
                  {AVAILABLE_PRESETS.map((preset) => {
                    const isSelected = newImageUrl === preset.path;
                    return (
                      <button
                        key={preset.path}
                        className={`preset-chip-btn ${isSelected ? 'preset-chip-btn--active' : ''}`}
                        onClick={() => {
                          setSelectedFile(null);
                          setNewImageUrl(preset.path);
                          setNewImagePreview(preset.path);
                        }}
                        type="button"
                      >
                        <img
                          alt={preset.label}
                          className="preset-chip-thumb"
                          src={preset.path}
                        />
                        <span className="preset-chip-name">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              {newImagePreview && (
                <div className="add-media-preview-box">
                  <span className="preview-label">Selected Image Preview:</span>
                  <div className="preview-img-frame">
                    <img
                      alt="Preview"
                      className="preview-img"
                      src={newImagePreview}
                      onError={(e) => {
                        e.currentTarget.src = '/cat-placeholder.png';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  disabled={isSavingMedia}
                  onClick={() => {
                    setIsAddMediaOpen(false);
                    setNewImageUrl('');
                    setNewImagePreview('');
                    setSelectedFile(null);
                  }}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn-modal-submit"
                  disabled={isSavingMedia || (!selectedFile && !newImageUrl && !newImagePreview)}
                  type="submit"
                >
                  {isSavingMedia ? (
                    <>
                      <Loader2 className="spinner-inline" />
                      <span>Uploading & Saving...</span>
                    </>
                  ) : (
                    <span>Upload & Save Media</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <aside
          aria-live="polite"
          className={`catalogue-toast catalogue-toast--${toastType}`}
          role="status"
        >
          {toastType === 'error' ? (
            <AlertTriangle className="toast-icon toast-icon--error" aria-hidden="true" />
          ) : (
            <Check className="toast-icon" aria-hidden="true" />
          )}
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
