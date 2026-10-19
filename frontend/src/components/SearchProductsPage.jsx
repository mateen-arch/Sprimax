import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ArrowLeft, FileText, Check, ArrowRight, Download, BadgeCheck } from 'lucide-react';
import { getProducts, getCategories } from '../api/products.js';
import { getDownloads, trackDownload } from '../api/resources.js';
import noImagePlaceholder from '../assets/no-image-placeholder.png';
import weldionBanner from '../assets/weldion-product-banner.png';

export default function SearchProductsPage({ 
  onBackToHome, 
  initialQuery = 'Electrodes',
  initialTab = 'products',
  onTabChange,
  onSelectGuide,
  onSendEnquiry,
  onViewProductDetails,
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialTab || 'products');
  const [selectedGuideModal, setSelectedGuideModal] = useState(null);
  const [downloadToast, setDownloadToast] = useState(null);

  // Database State
  const [productsList, setProductsList] = useState([]);
  const [downloadsList, setDownloadsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Filters State (all start completely UNSELECTED per user requirement)
  const [selectedAws, setSelectedAws] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Sync if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialQuery !== undefined) {
      setSearchQuery(initialQuery);
      setSelectedAws([]);
      setSelectedMaterials([]);
      setSelectedCategories([]);
    }
  }, [initialQuery]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  // Fetch real-time products and downloads from MongoDB Atlas
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      getProducts({ limit: 1000 }).catch(() => ({ products: [] })),
      getCategories().catch(() => ({ categories: [] })),
      getDownloads().catch(() => []),
    ])
      .then(([productsData, categoriesData, downloadsData]) => {
        if (!mounted) return;

        // 1. Process Products
        if (productsData?.products) {
          const mapped = productsData.products.map((p) => {
            const specsMap = p.specifications && typeof p.specifications === 'object'
              ? (p.specifications instanceof Map ? Object.fromEntries(p.specifications) : p.specifications)
              : {};

            const tensile = specsMap['Tensile Strength'] 
              || specsMap['Tensile'] 
              || specsMap['Hardness (As Welded)'] 
              || specsMap['Hardness'] 
              || '—';

            const yieldVal = specsMap['Yield Strength'] 
              || specsMap['Yield'] 
              || specsMap['Carbide Fraction'] 
              || specsMap['Machinability'] 
              || '—';

            const elongation = specsMap['Elongation (A5)'] 
              || specsMap['Elongation'] 
              || specsMap['Impact Energy (-45°C)'] 
              || specsMap['Impact Energy (-29°C)'] 
              || specsMap['Impact Energy (-20°C)'] 
              || specsMap['Impact Energy (-196°C)'] 
              || specsMap['Basicity Index'] 
              || '—';

            const current = specsMap['Welding Current'] 
              || specsMap['Shielding Gas'] 
              || specsMap['Current'] 
              || '—';

            let resolvedImage = noImagePlaceholder;
            let isPlaceholder = true;

            if (p.image && !p.image.includes('cat-placeholder')) {
              if (p.image === '/product-lh7018.png') {
                resolvedImage = weldionBanner;
                isPlaceholder = false;
              } else if (p.image.startsWith('http') || p.image.startsWith('data:') || p.image.startsWith('/')) {
                resolvedImage = p.image;
                isPlaceholder = false;
              }
            }

            return {
              id: p._id || p.id,
              sku: p.sku ? (p.sku.startsWith('SKU:') ? p.sku : `SKU: ${p.sku}`) : 'SKU: N/A',
              aws: p.awsClass || p.awsClassification || 'AWS Certified',
              title: p.name,
              category: p.category || 'General',
              categorySlug: p.categorySlug || '',
              subcategory: p.subcategory || '',
              baseMaterial: p.baseMaterial || 'Carbon Steel',
              industries: p.industries || [],
              description: p.description || 'Precision-engineered industrial welding consumable.',
              tensile,
              yield: yieldVal,
              elongation,
              current,
              image: resolvedImage,
              isPlaceholder,
              rawProduct: p,
            };
          });
          setProductsList(mapped);
        }

        // 2. Process Downloads from Atlas
        if (Array.isArray(downloadsData)) {
          setDownloadsList(downloadsData);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching search data from Atlas:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Extract dynamic AWS options from DB products
  const availableAwsList = useMemo(() => {
    const counts = {};
    productsList.forEach((p) => {
      if (p.aws && p.aws !== 'AWS Certified') {
        counts[p.aws] = (counts[p.aws] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [productsList]);

  // Extract dynamic Materials from DB products
  const availableMaterialsList = useMemo(() => {
    const counts = {};
    productsList.forEach((p) => {
      if (p.baseMaterial) {
        counts[p.baseMaterial] = (counts[p.baseMaterial] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [productsList]);

  // Extract dynamic Categories from DB products
  const availableCategoriesList = useMemo(() => {
    const counts = {};
    productsList.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [productsList]);

  // Filter handlers
  const handleAwsToggle = (awsVal) => {
    setSelectedAws((prev) =>
      prev.includes(awsVal) ? prev.filter((a) => a !== awsVal) : [...prev, awsVal]
    );
  };

  const handleMaterialToggle = (matVal) => {
    setSelectedMaterials((prev) =>
      prev.includes(matVal) ? prev.filter((m) => m !== matVal) : [...prev, matVal]
    );
  };

  const handleCategoryToggle = (catVal) => {
    setSelectedCategories((prev) =>
      prev.includes(catVal) ? prev.filter((c) => c !== catVal) : [...prev, catVal]
    );
  };

  const handleClearFilters = () => {
    setSelectedAws([]);
    setSelectedMaterials([]);
    setSelectedCategories([]);
  };

  // Technical Guides (curated engineering repository)
  const technicalPagesList = useMemo(() => [
    {
      id: 'eng-7018',
      category: 'ENGINEERING GUIDE',
      docId: 'Doc ID: ENG-7018',
      title: 'Low Hydrogen Welding Best Practices & Storage Guide',
      description: 'Essential handling protocols, holding oven specifications, and atmospheric exposure thresholds for low hydrogen stick electrodes in critical structural joints.',
      updated: 'Updated Oct 2024',
      keywords: ['electrodes', 'stick', '7018', 'hydrogen', 'structural', 'storage'],
    },
    {
      id: 'sop-402',
      category: 'SOP PROCEDURE',
      docId: 'Doc ID: SOP-402',
      title: 'Electrode Re-baking & Moisture Control Procedures',
      description: 'Standard operating procedures for redrying opened electrode packages, bake-out temperature ramp curves, and moisture-resistant wrapper verification.',
      updated: 'Updated Aug 2024',
      keywords: ['rebaking', 'moisture', 'electrodes', 'welding', 'quality'],
    },
    {
      id: 'aws-d11-1',
      category: 'CODE COMPLIANCE',
      docId: 'Doc ID: AWS-D1.1-24',
      title: 'AWS D1.1 Structural Welding Code Compliance Overview',
      description: 'Cross-reference matrix matching Sprimax electrode specifications with AWS D1.1 prequalified WPS joint design and filler metal qualification tables.',
      updated: 'Updated Nov 2024',
      keywords: ['aws', 'd1.1', 'code', 'structural', 'compliance', 'prequalified'],
    },
    {
      id: 'saw-proc-09',
      category: 'PROCESS GUIDE',
      docId: 'Doc ID: SAW-PROC-09',
      title: 'Submerged Arc Welding Flux-Wire Combination Handbook',
      description: 'Detailed operational parameters, flux basicity indices, and tandem wire configuration guidelines for heavy structural and pressure vessel fabrication.',
      updated: 'Updated Dec 2024',
      keywords: ['saw', 'submerged', 'flux', 'wire', 'pressure', 'tandem'],
    },
  ], []);

  // Metallurgical Articles
  const articlesList = useMemo(() => [
    {
      id: 'art-01',
      category: 'METALLURGY',
      date: 'November 12, 2024',
      readTime: '6 min read',
      title: 'Choosing the Right Low Hydrogen Electrode for Heavy Fabrication',
      description: 'A technical evaluation comparing H4R and H8 classifications across varying plate thicknesses, ambient humidity constraints, and pre-heat protocols in heavy bridge construction.',
      author: 'Author: Dr. M. Jensen, CWE',
      keywords: ['hydrogen', 'electrodes', 'fabrication', 'bridge', 'metallurgy', '7018'],
    },
    {
      id: 'art-02',
      category: 'FAILURE ANALYSIS',
      date: 'October 28, 2024',
      readTime: '8 min read',
      title: 'Mitigating Hydrogen-Induced Cracking in High Strength Steels',
      description: 'Investigating the tri-axial stress states, diffusible hydrogen levels, and microstructural vulnerabilities that precipitate delayed cracking in ASTM A514/A517 steel weldments.',
      author: 'Author: T. Vance, Welding QA Lead',
      keywords: ['cracking', 'hydrogen', 'steel', 'failure', 'high strength'],
    },
    {
      id: 'art-03',
      category: 'WELDING EFFICIENCY',
      date: 'December 4, 2024',
      readTime: '5 min read',
      title: 'Optimizing Deposition Rates with Seamless Flux-Cored Wires',
      description: 'Comparative productivity analysis between traditional solid GMAW wires and gas-shielded seamless FCAW wires in automated production lines.',
      author: 'Author: Engineering Team, Sprimax',
      keywords: ['flux-cored', 'deposition', 'fcaw', 'wire', 'efficiency', 'automated'],
    },
  ], []);

  // Real-time filtered products
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const indStr = Array.isArray(product.industries) ? product.industries.join(' ') : (product.industries || '');
        const combined = `${product.title || ''} ${product.sku || ''} ${product.aws || ''} ${product.description || ''} ${product.category || ''} ${product.subcategory || ''} ${product.baseMaterial || ''} ${indStr}`.toLowerCase();
        
        let matches = combined.includes(q);
        if (!matches) {
          const tokens = q.split(/\s+/).filter(Boolean);
          if (tokens.length > 1) {
            matches = tokens.every((token) => combined.includes(token));
          }
        }
        if (!matches) {
          return false;
        }
      }

      // 2. AWS Filter
      if (selectedAws.length > 0) {
        if (!selectedAws.includes(product.aws)) return false;
      }

      // 3. Material Filter
      if (selectedMaterials.length > 0) {
        if (!selectedMaterials.includes(product.baseMaterial)) return false;
      }

      // 4. Category Filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(product.category)) return false;
      }

      return true;
    });
  }, [productsList, searchQuery, selectedAws, selectedMaterials, selectedCategories]);

  // Real-time filtered downloads
  const filteredDownloads = useMemo(() => {
    return downloadsList.filter((doc) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const combined = `${doc.title || ''} ${doc.description || ''} ${doc.category || ''} ${doc.resourceType || ''} ${doc.fileType || ''}`.toLowerCase();
      let matches = combined.includes(q);
      if (!matches) {
        const tokens = q.split(/\s+/).filter(Boolean);
        if (tokens.length > 1) {
          matches = tokens.every((t) => combined.includes(t));
        }
      }
      return matches;
    });
  }, [downloadsList, searchQuery]);

  // Real-time filtered technical pages
  const filteredTechnical = useMemo(() => {
    return technicalPagesList.filter((page) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const keyStr = (page.keywords || []).join(' ');
      const combined = `${page.title || ''} ${page.description || ''} ${page.category || ''} ${keyStr}`.toLowerCase();
      let matches = combined.includes(q);
      if (!matches) {
        const tokens = q.split(/\s+/).filter(Boolean);
        if (tokens.length > 1) {
          matches = tokens.every((token) => combined.includes(token));
        }
      }
      return matches;
    });
  }, [technicalPagesList, searchQuery]);

  // Real-time filtered articles
  const filteredArticles = useMemo(() => {
    return articlesList.filter((art) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const keyStr = (art.keywords || []).join(' ');
      const combined = `${art.title || ''} ${art.description || ''} ${art.category || ''} ${keyStr}`.toLowerCase();
      let matches = combined.includes(q);
      if (!matches) {
        const tokens = q.split(/\s+/).filter(Boolean);
        if (tokens.length > 1) {
          matches = tokens.every((token) => combined.includes(token));
        }
      }
      return matches;
    });
  }, [articlesList, searchQuery]);

  // Total results count across all tabs
  const totalResultsCount = filteredProducts.length + filteredTechnical.length + filteredDownloads.length + filteredArticles.length;

  // Real download handler
  const handleDownloadFile = (item) => {
    const filename = item.fileName || `${(item.title || 'document').toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${(item.fileType || 'pdf').toLowerCase()}`;
    setDownloadToast(`Downloading ${filename} (${item.fileSize || 'PDF'})...`);
    setTimeout(() => setDownloadToast(null), 3500);

    if (item._id || item.id) {
      trackDownload(item._id || item.id);
    }

    const fileUrl = item.fileUrl;
    if (fileUrl && fileUrl.startsWith('data:')) {
      try {
        const parts = fileUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const binary = atob(parts[1]);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        return;
      } catch (err) {
        console.error('Error downloading base64 file:', err);
      }
    }

    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const hasActiveFilters = selectedAws.length > 0 || selectedMaterials.length > 0 || selectedCategories.length > 0;

  return (
    <div className="search-page-wrapper">
      <div className="search-page-container">
        {/* Breadcrumb row */}
        <div className="search-breadcrumb-row">
          <button 
            type="button" 
            onClick={onBackToHome}
            className="breadcrumb-back-btn"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <div className="breadcrumb-trail">
            <span className="breadcrumb-link" onClick={onBackToHome}>Home</span>
            <span className="breadcrumb-separator">&rsaquo;</span>
            <span className="breadcrumb-current">Search Results</span>
          </div>
        </div>

        {/* Top Search Input & Live Results Count Bar */}
        <div className="search-query-banner">
          <div className="search-input-box">
            <Search size={18} className="search-box-icon" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU, AWS classification, or keyword..."
              className="search-main-input"
              aria-label="Search term"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="search-clear-btn"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="search-results-count-box">
            <span className="results-count-number">{totalResultsCount} Results</span>
            <span className="results-count-query">for &quot;{searchQuery || 'All Consumables'}&quot;</span>
          </div>
        </div>

        {/* Tab Navigation with Live Accurate Counts */}
        <div className="search-tabs-nav" role="tablist">
          <button 
            type="button"
            className={`search-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleTabClick('products')}
            role="tab"
          >
            PRODUCTS ({filteredProducts.length})
            {activeTab === 'products' && <span className="tab-active-indicator" />}
          </button>

          <button 
            type="button"
            className={`search-tab-btn ${activeTab === 'technical' ? 'active' : ''}`}
            onClick={() => handleTabClick('technical')}
            role="tab"
          >
            TECHNICAL PAGES ({filteredTechnical.length})
            {activeTab === 'technical' && <span className="tab-active-indicator" />}
          </button>

          <button 
            type="button"
            className={`search-tab-btn ${activeTab === 'downloads' ? 'active' : ''}`}
            onClick={() => handleTabClick('downloads')}
            role="tab"
          >
            DOWNLOADS ({filteredDownloads.length})
            {activeTab === 'downloads' && <span className="tab-active-indicator" />}
          </button>

          <button 
            type="button"
            className={`search-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => handleTabClick('articles')}
            role="tab"
          >
            ARTICLES ({filteredArticles.length})
            {activeTab === 'articles' && <span className="tab-active-indicator" />}
          </button>
        </div>

        {/* Main Content Area: Sidebar Filters + Dynamic Results Grid */}
        <div className="search-content-grid">
          {/* Left Sidebar: Real-time Filters */}
          <aside className="search-filters-sidebar">
            <div className="filters-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <h2 className="filters-title" style={{ margin: 0 }}>Filters</h2>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--safety-orange)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Reset All
                  </button>
                )}
              </div>
              <div className="filters-divider" />

              {/* Dynamic Filter Group: AWS Classification */}
              {availableAwsList.length > 0 && (
                <div className="filter-group">
                  <span className="filter-group-heading">AWS CLASSIFICATION</span>
                  <div className="filter-checkbox-list">
                    {availableAwsList.map(({ name, count }) => {
                      const isChecked = selectedAws.includes(name);
                      return (
                        <label key={name} className="filter-checkbox-label">
                          <span 
                            className={`custom-checkbox ${isChecked ? 'checked' : ''}`}
                            onClick={() => handleAwsToggle(name)}
                          >
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </span>
                          <span className="checkbox-text">
                            {name} <span style={{ color: '#94a3b8', fontSize: '12px' }}>({count})</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Filter Group: Base Material */}
              {availableMaterialsList.length > 0 && (
                <div className="filter-group">
                  <span className="filter-group-heading">BASE MATERIAL</span>
                  <div className="filter-checkbox-list">
                    {availableMaterialsList.map(({ name, count }) => {
                      const isChecked = selectedMaterials.includes(name);
                      return (
                        <label key={name} className="filter-checkbox-label">
                          <span 
                            className={`custom-checkbox ${isChecked ? 'checked' : ''}`}
                            onClick={() => handleMaterialToggle(name)}
                          >
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </span>
                          <span className="checkbox-text">
                            {name} <span style={{ color: '#94a3b8', fontSize: '12px' }}>({count})</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Filter Group: Product Category */}
              {availableCategoriesList.length > 0 && (
                <div className="filter-group">
                  <span className="filter-group-heading">CATEGORY</span>
                  <div className="filter-checkbox-list">
                    {availableCategoriesList.map(({ name, count }) => {
                      const isChecked = selectedCategories.includes(name);
                      return (
                        <label key={name} className="filter-checkbox-label">
                          <span 
                            className={`custom-checkbox ${isChecked ? 'checked' : ''}`}
                            onClick={() => handleCategoryToggle(name)}
                          >
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </span>
                          <span className="checkbox-text">
                            {name} <span style={{ color: '#94a3b8', fontSize: '12px' }}>({count})</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right Main Area */}
          <section className="search-results-area" aria-label="Search Results">
            {/* TAB 1: PRODUCTS (Exact Standard Catalogue Card) */}
            {activeTab === 'products' ? (
              loading ? (
                <div style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                  <p>Loading real-time products from database...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                    No products found matching &quot;{searchQuery}&quot;.
                  </p>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.25rem' }}>
                    Try searching for AWS classes (e.g. E7018, ER70S-6) or clear active filters.
                  </p>
                  {hasActiveFilters && (
                    <button 
                      type="button" 
                      className="btn-hero-primary" 
                      style={{ display: 'inline-flex', padding: '0.6rem 1.25rem', fontSize: '13px' }}
                      onClick={handleClearFilters}
                    >
                      CLEAR ALL FILTERS
                    </button>
                  )}
                </div>
              ) : (
                <div className="catalogue-products-grid">
                  {filteredProducts.map((product) => (
                    <article key={product.id} className="catalogue-product-card">
                      {/* Product Image Box with Error Fallback */}
                      <div className={`catalogue-img-box ${product.isPlaceholder ? 'catalogue-img-box-placeholder' : ''}`}>
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className={`catalogue-card-img ${product.isPlaceholder ? 'img-placeholder' : ''}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = noImagePlaceholder;
                            e.target.classList.add('img-placeholder');
                            e.target.parentElement.classList.add('catalogue-img-box-placeholder');
                          }}
                        />
                      </div>

                      {/* Card Content */}
                      <div className="catalogue-card-content">
                        {/* SKU & AWS Pill */}
                        <div className="catalogue-meta-row">
                          <span className="catalogue-sku data-tabular">{product.sku}</span>
                          <span className="catalogue-aws-pill data-tabular">{product.aws}</span>
                        </div>

                        {/* Title */}
                        <h2 className="catalogue-product-title headline-md">
                          {product.title}
                        </h2>

                        {/* Description */}
                        <p className="catalogue-product-desc body-md">
                          {product.description}
                        </p>

                        <div className="catalogue-card-divider" />

                        {/* Specs Matrix 2x2 */}
                        <div className="catalogue-specs-matrix data-tabular">
                          <div className="spec-item">
                            <span className="spec-label">Tensile</span>
                            <span className="spec-val">{product.tensile}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Yield</span>
                            <span className="spec-val">{product.yield}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Elongation</span>
                            <span className="spec-val">{product.elongation}</span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Current</span>
                            <span className="spec-val">{product.current}</span>
                          </div>
                        </div>

                        {/* Actions Row: SEND ENQUIRY + VIEW DETAILS */}
                        <div className="catalogue-btn-row">
                          <button 
                            type="button" 
                            className="btn-catalogue-enquiry"
                            onClick={() => onSendEnquiry ? onSendEnquiry(product) : alert(`Enquiry initiated for ${product.title}`)}
                          >
                            SEND ENQUIRY
                          </button>

                          <button 
                            type="button" 
                            className="btn-catalogue-details"
                            onClick={() => onViewProductDetails ? onViewProductDetails(product.rawProduct || product) : alert(`Viewing details for ${product.title}`)}
                          >
                            VIEW DETAILS
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )
            ) : null}

            {/* TAB 2: TECHNICAL PAGES */}
            {activeTab === 'technical' ? (
              <div className="technical-results-grid">
                {filteredTechnical.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <p>No technical pages matching &quot;{searchQuery}&quot;.</p>
                  </div>
                ) : (
                  filteredTechnical.map((doc) => (
                    <article key={doc.id} className="tech-guide-card">
                      <div className="tech-card-header">
                        <span className="tech-card-badge">{doc.category}</span>
                        <span className="tech-card-doc-id data-tabular">{doc.docId}</span>
                      </div>

                      <h3 className="tech-card-title headline-md">{doc.title}</h3>
                      <p className="tech-card-desc body-md">{doc.description}</p>
                      <div className="tech-card-divider" />

                      <div className="tech-card-footer">
                        <span className="tech-card-updated">{doc.updated}</span>
                        <button 
                          type="button" 
                          className="tech-card-action"
                          onClick={() => {
                            setSelectedGuideModal(doc);
                            if (onSelectGuide) onSelectGuide(doc);
                          }}
                        >
                          <span>READ GUIDE</span>
                          <span className="action-arrow">&rarr;</span>
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            ) : null}

            {/* TAB 3: DOWNLOADS & COMPLIANCE SHEETS (Real Atlas Resources) */}
            {activeTab === 'downloads' ? (
              <div className="downloads-section-container">
                <div className="downloads-header-bar">
                  <div className="downloads-title-wrap">
                    <Download size={22} className="downloads-title-icon" strokeWidth={2.2} />
                    <h2 className="downloads-section-title">
                      Downloads &amp; Compliance Sheets <span className="downloads-title-count">({filteredDownloads.length})</span>
                    </h2>
                  </div>
                  <span className="downloads-showing-count data-tabular">
                    SHOWING {filteredDownloads.length} VERIFIED FILES
                  </span>
                </div>

                <div className="downloads-header-divider" />

                <div className="downloads-table-scroll">
                  <div className="downloads-table-card">
                    <div className="downloads-table-header" role="row">
                      <span className="table-header-col">DOCUMENT TITLE &amp; SPEC</span>
                      <span className="table-header-col">CLASSIFICATION / TYPE</span>
                      <span className="table-header-col">FORMAT / SIZE</span>
                      <span className="table-header-col">ISSUE DATE</span>
                      <span className="table-header-col header-col-action">ACTION</span>
                    </div>

                    <div className="downloads-table-body">
                      {filteredDownloads.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                          No documents or compliance sheets found matching &quot;{searchQuery}&quot;.
                        </div>
                      ) : (
                        filteredDownloads.map((item) => (
                          <div key={item._id || item.id} className="downloads-table-row" role="row">
                            <div className="doc-title-spec-col">
                              {item.fileType?.toLowerCase() === 'pdf' ? (
                                <div className="pdf-doc-badge" aria-label="PDF Document">
                                  <span className="pdf-doc-badge-text">PDF</span>
                                </div>
                              ) : (
                                <BadgeCheck size={22} className="cert-doc-icon" strokeWidth={2} />
                              )}
                              <div className="doc-text-wrap">
                                <h3 className="doc-title">{item.title}</h3>
                                <p className="doc-desc">{item.description || item.fileName || 'Technical Specification and Compliance Document'}</p>
                              </div>
                            </div>

                            <div className="doc-classification-col">
                              <span className="classification-pill">{item.resourceType || item.category || 'TDS / Spec Sheet'}</span>
                            </div>

                            <div className="doc-format-col">
                              <span className="downloads-cell-text data-tabular">{item.fileType?.toUpperCase() || 'PDF'} / {item.fileSize || '1.2 MB'}</span>
                            </div>

                            <div className="doc-date-col">
                              <span className="downloads-cell-text data-tabular">{item.issueDate || (item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '2024-10-15')}</span>
                            </div>

                            <div className="doc-action-col">
                              <button 
                                type="button" 
                                className="btn-table-download"
                                onClick={() => handleDownloadFile(item)}
                                title={`Download ${item.title}`}
                              >
                                <Download size={13} strokeWidth={2.5} />
                                <span>DOWNLOAD</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* TAB 4: ARTICLES */}
            {activeTab === 'articles' ? (
              <div className="articles-results-grid">
                {filteredArticles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <p>No engineering articles matching &quot;{searchQuery}&quot;.</p>
                  </div>
                ) : (
                  filteredArticles.map((article) => (
                    <article key={article.id} className="article-card">
                      <div className="article-meta-group">
                        <span className="article-badge data-tabular">{article.category}</span>
                        <span className="article-meta-dot">•</span>
                        <span className="article-meta-text data-tabular">{article.date}</span>
                        <span className="article-meta-dot">•</span>
                        <span className="article-meta-text data-tabular">{article.readTime}</span>
                      </div>

                      <h3 className="article-card-title headline-md">{article.title}</h3>
                      <p className="article-card-desc body-md">{article.description}</p>
                      <div className="article-card-divider" />

                      <div className="article-card-footer">
                        <span className="article-author data-tabular">{article.author}</span>
                        <button 
                          type="button" 
                          className="article-read-btn"
                          onClick={() => {
                            setSelectedGuideModal({
                              category: article.category,
                              docId: article.readTime,
                              title: article.title,
                              description: article.description,
                              updated: `${article.date} • ${article.author}`
                            });
                          }}
                        >
                          <span className="article-read-link-text">READ ARTICLE</span>
                          <span className="article-arrow">&rarr;</span>
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      {/* Guide Quick-View Modal */}
      {selectedGuideModal && (
        <div className="modal-backdrop" onClick={() => setSelectedGuideModal(null)}>
          <div className="guide-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="guide-modal-header">
              <div>
                <span className="tech-card-badge">{selectedGuideModal.category}</span>
                <span className="tech-card-doc-id data-tabular" style={{ marginLeft: '12px' }}>
                  {selectedGuideModal.docId}
                </span>
              </div>
              <button 
                type="button" 
                className="guide-modal-close"
                onClick={() => setSelectedGuideModal(null)}
                aria-label="Close document modal"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="headline-lg" style={{ color: 'var(--deep-navy)', margin: '1rem 0 0.75rem' }}>
              {selectedGuideModal.title}
            </h2>

            <p className="body-lg" style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {selectedGuideModal.description}
            </p>

            <div className="guide-modal-info-box">
              <p className="body-md" style={{ color: '#334155', margin: 0 }}>
                This official technical document provides verified engineering procedures, weld deposit chemistries, and compliance specifications under standard AWS and ASME parameters.
              </p>
            </div>

            <div className="guide-modal-footer">
              <span className="tech-card-updated">{selectedGuideModal.updated}</span>
              <button 
                type="button" 
                className="btn-search-catalog"
                style={{ height: '42px', padding: '0 1.25rem', fontSize: '13px' }}
                onClick={() => {
                  alert(`Downloading complete technical PDF for ${selectedGuideModal.docId}...`);
                  setSelectedGuideModal(null);
                }}
              >
                DOWNLOAD PDF GUIDE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification for Download feedback */}
      {downloadToast && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0f172a',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            zIndex: 99999,
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Download size={16} />
          <span>{downloadToast}</span>
        </div>
      )}
    </div>
  );
}
