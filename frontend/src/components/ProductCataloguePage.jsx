import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Check, ArrowLeft, ArrowRight, X, SlidersHorizontal } from 'lucide-react';
import noImagePlaceholder from '../assets/no-image-placeholder.png';
import weldionBanner from '../assets/weldion-product-banner.png';
import { getProducts, getCategories } from '../api/products.js';

export default function ProductCataloguePage({ 
  onBackToHome, 
  onSendEnquiry, 
  onViewProductDetails,
  initialFilters = null,
  selectedCategory = ''
}) {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAws, setSelectedAws] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const pageSize = 4;

  // Mobile drawer filter sidebar state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Accordion open/close states
  const [accordionsOpen, setAccordionsOpen] = useState({
    category: true,
    aws: true,
    material: true,
    industry: false,
  });

  const toggleAccordion = (key) => {
    setAccordionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Prevent background scrolling when mobile filter drawer is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  // Handle escape key and auto-close when resizing to desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileFilterOpen) {
        setIsMobileFilterOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 900 && isMobileFilterOpen) {
        setIsMobileFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileFilterOpen]);

  // Products and Categories list from database
  const [productsList, setProductsList] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync initial props (e.g. when navigating from Home Page Quick Discovery or Technical Product Lines)
  useEffect(() => {
    if (selectedCategory) {
      setSelectedCategories([selectedCategory]);
    } else {
      setSelectedCategories([]);
    }

    if (initialFilters) {
      if (initialFilters.productSku) {
        if (initialFilters.productSku.toUpperCase().startsWith('AWS') || initialFilters.productSku.toUpperCase().startsWith('SAW')) {
          setSelectedAws([initialFilters.productSku]);
        } else {
          setSearchFilter(initialFilters.productSku);
        }
      } else {
        setSelectedAws([]);
      }

      if (initialFilters.baseMaterial) {
        setSelectedMaterials([initialFilters.baseMaterial]);
      } else {
        setSelectedMaterials([]);
      }

      if (initialFilters.industry) {
        setSelectedIndustries([initialFilters.industry]);
      } else {
        setSelectedIndustries([]);
      }
    } else {
      setSelectedAws([]);
      setSelectedMaterials([]);
      setSelectedIndustries([]);
      if (!selectedCategory) {
        setSearchFilter('');
      }
    }
  }, [selectedCategory, initialFilters]);

  // Fetch all real-time products and categories from MongoDB
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      getProducts({ limit: 100 }),
      getCategories(),
    ])
      .then(([productsData, categoriesData]) => {
        if (!mounted) return;

        if (categoriesData?.categories) {
          setDbCategories(categoriesData.categories);
        }

        if (productsData?.products) {
          const mapped = productsData.products.map((p) => {
            // Extract real specifications stored in MongoDB
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

            // Image handling: use uploaded image or user's banner, otherwise fallback to "No image" placeholder
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
              category: p.category,
              categorySlug: p.categorySlug,
              subcategory: p.subcategory,
              baseMaterial: p.baseMaterial,
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
        setLoading(false);
      })
      .catch((err) => {
        console.warn('[Catalogue] Error loading products/categories:', err.message);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Compute available filter options dynamically from real database products
  const availableAwsList = useMemo(() => {
    const set = new Set();
    productsList.forEach((p) => {
      if (p.aws && p.aws !== 'AWS Certified') set.add(p.aws);
    });
    return Array.from(set).sort();
  }, [productsList]);

  const availableMaterialsList = useMemo(() => {
    const set = new Set();
    productsList.forEach((p) => {
      if (p.baseMaterial) set.add(p.baseMaterial);
    });
    return Array.from(set).sort();
  }, [productsList]);

  const availableIndustriesList = useMemo(() => {
    const set = new Set();
    productsList.forEach((p) => {
      if (Array.isArray(p.industries)) {
        p.industries.forEach((ind) => set.add(ind));
      }
    });
    return Array.from(set).sort();
  }, [productsList]);

  // Toggle handlers
  const handleCategoryToggle = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
    setCurrentPageNum(1);
  };

  const handleAwsToggle = (awsVal) => {
    setSelectedAws((prev) =>
      prev.includes(awsVal) ? prev.filter((a) => a !== awsVal) : [...prev, awsVal]
    );
    setCurrentPageNum(1);
  };

  const handleMaterialToggle = (matVal) => {
    setSelectedMaterials((prev) =>
      prev.includes(matVal) ? prev.filter((m) => m !== matVal) : [...prev, matVal]
    );
    setCurrentPageNum(1);
  };

  const handleIndustryToggle = (indVal) => {
    setSelectedIndustries((prev) =>
      prev.includes(indVal) ? prev.filter((i) => i !== indVal) : [...prev, indVal]
    );
    setCurrentPageNum(1);
  };

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedAws([]);
    setSelectedMaterials([]);
    setSelectedIndustries([]);
    setSearchFilter('');
    setCurrentPageNum(1);
  };

  // Live real-time filtered products
  const displayedProducts = useMemo(() => {
    return productsList.filter((product) => {
      // 1. Category Filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(product.category)) return false;
      }

      // 2. AWS Classification Filter
      if (selectedAws.length > 0) {
        if (!selectedAws.includes(product.aws) && !selectedAws.includes(product.rawProduct?.awsClass)) {
          return false;
        }
      }

      // 3. Base Material Filter
      if (selectedMaterials.length > 0) {
        if (!selectedMaterials.includes(product.baseMaterial)) return false;
      }

      // 4. Industry Filter
      if (selectedIndustries.length > 0) {
        const prodIndustries = product.industries || [];
        const hasMatch = selectedIndustries.some((ind) => prodIndustries.includes(ind));
        if (!hasMatch) return false;
      }

      // 5. Search Text Filter
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const titleMatch = product.title?.toLowerCase().includes(q);
        const skuMatch = product.sku?.toLowerCase().includes(q);
        const awsMatch = product.aws?.toLowerCase().includes(q);
        const descMatch = product.description?.toLowerCase().includes(q);
        const catMatch = product.category?.toLowerCase().includes(q);
        if (!titleMatch && !skuMatch && !awsMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [productsList, selectedCategories, selectedAws, selectedMaterials, selectedIndustries, searchFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(displayedProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPageNum - 1) * pageSize;
    return displayedProducts.slice(start, start + pageSize);
  }, [displayedProducts, currentPageNum]);

  // Compute active filter items to render in the Active Filters bar
  const activeFilterChips = useMemo(() => {
    const chips = [];

    selectedCategories.forEach((cat) => {
      chips.push({
        id: `cat-${cat}`,
        label: `Category: ${cat}`,
        onRemove: () => handleCategoryToggle(cat),
      });
    });

    selectedAws.forEach((aws) => {
      chips.push({
        id: `aws-${aws}`,
        label: `AWS: ${aws}`,
        onRemove: () => handleAwsToggle(aws),
      });
    });

    selectedMaterials.forEach((mat) => {
      chips.push({
        id: `mat-${mat}`,
        label: `Material: ${mat}`,
        onRemove: () => handleMaterialToggle(mat),
      });
    });

    selectedIndustries.forEach((ind) => {
      chips.push({
        id: `ind-${ind}`,
        label: `Industry: ${ind}`,
        onRemove: () => handleIndustryToggle(ind),
      });
    });

    if (searchFilter.trim()) {
      chips.push({
        id: 'search-chip',
        label: `Search: "${searchFilter}"`,
        onRemove: () => setSearchFilter(''),
      });
    }

    return chips;
  }, [selectedCategories, selectedAws, selectedMaterials, selectedIndustries, searchFilter]);

  const totalActiveFiltersCount = selectedCategories.length + selectedAws.length + selectedMaterials.length + selectedIndustries.length;

  return (
    <div className="catalogue-page-wrapper">
      <div className="catalogue-page-container">
        {/* Top Breadcrumb */}
        <div className="catalogue-breadcrumb-row">
          <span className="catalogue-breadcrumb-link" onClick={onBackToHome}>Home</span>
          <span className="catalogue-breadcrumb-separator">&rsaquo;</span>
          <span className="catalogue-breadcrumb-current">Product Catalogue</span>
        </div>

        {/* Title, Subtitle & SKU Search Header Bar */}
        <div className="catalogue-header-row">
          <div className="catalogue-title-col">
            <h1 className="catalogue-main-title headline-xl">Product Catalogue</h1>
            <p className="catalogue-subtitle body-md">
              High-performance welding consumables engineered for critical structural applications.
            </p>
          </div>

          <div className="catalogue-search-count-col">
            {/* Search by SKU or Spec input */}
            <div className="catalogue-search-box">
              <input 
                type="text" 
                placeholder="Search by SKU or Spec..." 
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                  setCurrentPageNum(1);
                }}
                className="catalogue-search-input data-tabular"
                aria-label="Search by SKU or Spec"
              />
              <Search size={15} className="catalogue-search-icon" />
            </div>

            {/* Mobile Controls Row: Filter Trigger Button + Products Found Count */}
            <div className="catalogue-mobile-controls-row">
              <button 
                type="button" 
                className="catalogue-mobile-filter-btn data-tabular"
                onClick={() => setIsMobileFilterOpen(true)}
                aria-label="Open filter sidebar"
              >
                <SlidersHorizontal size={15} />
                <span>Filters</span>
                {totalActiveFiltersCount > 0 && (
                  <span className="mobile-filter-badge">{totalActiveFiltersCount}</span>
                )}
              </button>

              {/* Found Counter: Real-time count of matching products */}
              <div className="catalogue-found-box">
                <span className="catalogue-found-number">{displayedProducts.length}</span>
                <span className="catalogue-found-label data-tabular">PRODUCTS FOUND</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thin Divider Line under header */}
        <div className="catalogue-header-divider" />

        {/* Active Filters Bar: Dynamically shows all active filters */}
        {activeFilterChips.length > 0 && (
          <div className="catalogue-active-filters-row">
            <span className="active-filters-label data-tabular">Active Filters:</span>
            
            {activeFilterChips.map((chip) => (
              <div key={chip.id} className="active-filter-pill data-tabular">
                <span>{chip.label}</span>
                <button 
                  type="button" 
                  className="filter-pill-remove" 
                  onClick={chip.onRemove}
                  aria-label={`Remove filter: ${chip.label}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            <button 
              type="button" 
              className="clear-all-filters-btn"
              onClick={handleClearAllFilters}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Mobile Filter Drawer Backdrop Overlay */}
        <div 
          className={`catalogue-sidebar-backdrop ${isMobileFilterOpen ? 'active' : ''}`}
          onClick={() => setIsMobileFilterOpen(false)}
          aria-hidden={!isMobileFilterOpen}
        />

        {/* Main Content Layout: Left Sidebar + Products Grid */}
        <div className="catalogue-content-layout">
          {/* Left Sidebar: Accordion Filter Panels (Off-canvas Drawer on mobile screens) */}
          <aside className={`catalogue-sidebar ${isMobileFilterOpen ? 'mobile-open' : ''}`} aria-label="Product Filters">
            {/* Mobile Drawer Header */}
            <div className="catalogue-sidebar-mobile-header">
              <div className="mobile-header-title-wrap">
                <SlidersHorizontal size={17} className="mobile-header-icon" />
                <span className="mobile-header-title data-tabular">FILTERS</span>
                {totalActiveFiltersCount > 0 && (
                  <span className="mobile-header-badge data-tabular">{totalActiveFiltersCount}</span>
                )}
              </div>
              <button 
                type="button" 
                className="mobile-sidebar-close-btn"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Accordion Area */}
            <div className="catalogue-sidebar-scroll-area">
              {/* Accordion 1: CATEGORY (Real categories from Database) */}
              <div className="filter-accordion-card">
                <button 
                  type="button" 
                  className="filter-accordion-header"
                  onClick={() => toggleAccordion('category')}
                  aria-expanded={accordionsOpen.category}
                >
                <span className="accordion-title data-tabular">CATEGORY</span>
                {accordionsOpen.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {accordionsOpen.category && (
                <div className="filter-accordion-body">
                  {dbCategories.length > 0 ? (
                    dbCategories.map((cat) => {
                      const isChecked = selectedCategories.includes(cat.name);
                      const matchingCount = productsList.filter((p) => p.category === cat.name).length;

                      return (
                        <label key={cat._id || cat.slug} className="filter-option-row">
                          <span 
                            className={`custom-checkbox ${isChecked ? 'checked' : ''}`}
                            onClick={() => handleCategoryToggle(cat.name)}
                          >
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </span>
                          <span className={`filter-option-text ${isChecked ? 'font-bold' : ''}`}>
                            {cat.name}
                          </span>
                          <span className="filter-option-count data-tabular">({matchingCount})</span>
                        </label>
                      );
                    })
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>Loading categories...</div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 2: AWS CLASSIFICATION (Real AWS classes from Database) */}
            <div className="filter-accordion-card">
              <button 
                type="button" 
                className="filter-accordion-header"
                onClick={() => toggleAccordion('aws')}
                aria-expanded={accordionsOpen.aws}
              >
                <span className="accordion-title data-tabular">AWS CLASSIFICATION</span>
                {accordionsOpen.aws ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {accordionsOpen.aws && (
                <div className="filter-accordion-body">
                  {availableAwsList.map((aws) => {
                    const isChecked = selectedAws.includes(aws);
                    const matchingCount = productsList.filter((p) => p.aws === aws || p.rawProduct?.awsClass === aws).length;

                    return (
                      <label key={aws} className="filter-option-row">
                        <span 
                          className={`custom-checkbox ${isChecked ? 'checked' : ''}`}
                          onClick={() => handleAwsToggle(aws)}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className={`filter-option-text ${isChecked ? 'font-bold' : ''}`}>
                          {aws.replace('AWS ', '')}
                        </span>
                        <span className="filter-option-count data-tabular">({matchingCount})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accordion 3: MATERIAL TYPE (Real Base Materials from Database) */}
            <div className="filter-accordion-card">
              <button 
                type="button" 
                className="filter-accordion-header"
                onClick={() => toggleAccordion('material')}
                aria-expanded={accordionsOpen.material}
              >
                <span className="accordion-title data-tabular">MATERIAL TYPE</span>
                {accordionsOpen.material ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {accordionsOpen.material && (
                <div className="filter-accordion-body">
                  {availableMaterialsList.map((mat) => {
                    const isChecked = selectedMaterials.includes(mat);
                    const matchingCount = productsList.filter((p) => p.baseMaterial === mat).length;

                    return (
                      <label key={mat} className="filter-option-row">
                        <span 
                          className={`custom-checkbox ${isChecked ? 'checked' : ''}`}
                          onClick={() => handleMaterialToggle(mat)}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className={`filter-option-text ${isChecked ? 'font-bold' : ''}`}>
                          {mat}
                        </span>
                        <span className="filter-option-count data-tabular">({matchingCount})</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accordion 4: INDUSTRY / APPLICATION (Real Industries from Database) */}
            {availableIndustriesList.length > 0 && (
              <div className="filter-accordion-card">
                <button 
                  type="button" 
                  className="filter-accordion-header"
                  onClick={() => toggleAccordion('industry')}
                  aria-expanded={accordionsOpen.industry}
                >
                  <span className="accordion-title data-tabular">APPLICATION & INDUSTRY</span>
                  {accordionsOpen.industry ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {accordionsOpen.industry && (
                  <div className="filter-accordion-body">
                    {availableIndustriesList.map((ind) => {
                      const isChecked = selectedIndustries.includes(ind);
                      const matchingCount = productsList.filter((p) => p.industries?.includes(ind)).length;

                      return (
                        <label key={ind} className="filter-option-row">
                          <span 
                            className={`custom-checkbox ${isChecked ? 'checked' : ''}`}
                            onClick={() => handleIndustryToggle(ind)}
                          >
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </span>
                          <span className={`filter-option-text ${isChecked ? 'font-bold' : ''}`}>
                            {ind}
                          </span>
                          <span className="filter-option-count data-tabular">({matchingCount})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Mobile Drawer Footer with Action Buttons */}
            <div className="catalogue-sidebar-mobile-footer">
              {totalActiveFiltersCount > 0 && (
                <button 
                  type="button" 
                  className="mobile-sidebar-clear-btn data-tabular"
                  onClick={handleClearAllFilters}
                >
                  Clear All
                </button>
              )}
              <button 
                type="button" 
                className="mobile-sidebar-apply-btn data-tabular"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Show {displayedProducts.length} Product{displayedProducts.length === 1 ? '' : 's'}
              </button>
            </div>
          </aside>

          {/* Right Area: Products Grid + Pagination */}
          <section className="catalogue-main-grid-wrap" aria-label="Product Catalogue Results">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                <p>Loading real-time products from database...</p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  No products found matching your current filter criteria.
                </p>
                <p style={{ fontSize: '14px', marginBottom: '1.25rem' }}>
                  Try removing some filters or clearing your search term.
                </p>
                <button 
                  type="button" 
                  className="btn-hero-primary" 
                  style={{ display: 'inline-flex', padding: '0.6rem 1.25rem', fontSize: '13px' }}
                  onClick={handleClearAllFilters}
                >
                  <span>CLEAR ALL FILTERS</span>
                </button>
              </div>
            ) : (
              <div className="catalogue-products-grid">
                {paginatedProducts.map((product) => (
                  <article key={product.id} className="catalogue-product-card">
                    {/* Product Image Area */}
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

                    {/* Card Content Area */}
                    <div className="catalogue-card-content">
                      {/* SKU & AWS Pill row */}
                      <div className="catalogue-meta-row">
                        <span className="catalogue-sku data-tabular">{product.sku}</span>
                        <span className="catalogue-aws-pill data-tabular">{product.aws}</span>
                      </div>

                      {/* Real Product Title from DB */}
                      <h2 className="catalogue-product-title headline-md">
                        {product.title}
                      </h2>

                      {/* Real Description from DB */}
                      <p className="catalogue-product-desc body-md">
                        {product.description}
                      </p>

                      <div className="catalogue-card-divider" />

                      {/* Real Technical Specs 2x2 Grid from DB */}
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

                      {/* Action Buttons: SEND ENQUIRY + VIEW DETAILS */}
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
            )}

            {/* Pagination Controls */}
            {displayedProducts.length > pageSize && (
              <div className="catalogue-pagination-bar" aria-label="Catalogue Pagination">
                <button 
                  type="button" 
                  className="pagination-nav-btn data-tabular"
                  disabled={currentPageNum === 1}
                  onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                >
                  <ArrowLeft size={14} />
                  <span>PREV</span>
                </button>

                <div className="pagination-numbers-row data-tabular">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <button 
                        key={page}
                        type="button" 
                        className={`page-num-btn ${currentPageNum === page ? 'active' : ''}`}
                        onClick={() => setCurrentPageNum(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button 
                  type="button" 
                  className="pagination-nav-btn data-tabular"
                  disabled={currentPageNum === totalPages}
                  onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
                >
                  <span>NEXT</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
