import React, { useState, useEffect } from 'react';
import { ArrowLeft, Info, Snowflake } from 'lucide-react';
import noImagePlaceholder from '../assets/no-image-placeholder.png';
import weldionBanner from '../assets/weldion-product-banner.png';
import { getRelatedProducts, getProducts } from '../api/products.js';
import { generateTdsPdf } from '../utils/generateTdsPdf.js';

export default function ProductDetailsPage({ 
  selectedProduct,
  onBackToCatalogue, 
  onBackToHome,
  onSendEnquiry, 
  onViewProductDetails 
}) {
  const [product, setProduct] = useState(selectedProduct || null);
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeDetailTab, setActiveDetailTab] = useState('mech');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(!selectedProduct);

  // Sync or fetch product data
  useEffect(() => {
    let isMounted = true;
    setActiveThumb(0);

    if (selectedProduct) {
      setProduct(selectedProduct);
      setLoading(false);
      loadRelated(selectedProduct);
    } else {
      setLoading(true);
      // Fetch default first product if visited directly
      getProducts({ limit: 1 })
        .then((data) => {
          if (isMounted && data.products?.length > 0) {
            setProduct(data.products[0]);
            loadRelated(data.products[0]);
          }
          if (isMounted) setLoading(false);
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });
    }

    function loadRelated(prod) {
      const prodId = prod._id || prod.id || prod.sku;
      getRelatedProducts(prodId)
        .then((data) => {
          if (isMounted && data.products?.length > 0) {
            const mappedRelated = data.products.map(formatProduct);
            setRelatedProducts(mappedRelated);
          } else {
            // Fallback to fetch by category
            getProducts({ category: prod.category, limit: 4 })
              .then((res) => {
                if (isMounted && res.products) {
                  const filtered = res.products
                    .filter((p) => p.sku !== prod.sku && (p._id || p.id) !== prodId)
                    .slice(0, 3)
                    .map(formatProduct);
                  setRelatedProducts(filtered);
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          // Fallback to general products
          getProducts({ limit: 4 })
            .then((res) => {
              if (isMounted && res.products) {
                const filtered = res.products
                  .filter((p) => p.sku !== prod.sku)
                  .slice(0, 3)
                  .map(formatProduct);
                setRelatedProducts(filtered);
              }
            })
            .catch(() => {});
        });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedProduct]);

  // Helper to normalize specifications
  const getSpecsMap = (item) => {
    if (!item) return {};
    const specs = item.specifications;
    if (!specs) return {};
    if (specs instanceof Map) return Object.fromEntries(specs);
    if (typeof specs === 'object') return specs;
    return {};
  };

  // Helper to format related products
  const formatProduct = (p) => {
    const specsMap = getSpecsMap(p);
    const tensile = specsMap['Tensile Strength'] 
      || specsMap['Tensile'] 
      || specsMap['Hardness (As Welded)'] 
      || specsMap['Hardness'] 
      || '—';

    const yieldVal = specsMap['Yield Strength'] 
      || specsMap['Yield'] 
      || specsMap['Carbide Fraction'] 
      || '—';

    const elongation = specsMap['Elongation (A5)'] 
      || specsMap['Elongation'] 
      || specsMap['Impact Energy (-45°C)'] 
      || specsMap['Impact Energy (-29°C)'] 
      || '—';

    const current = specsMap['Welding Current'] 
      || specsMap['Shielding Gas'] 
      || specsMap['Current'] 
      || '—';

    let img = noImagePlaceholder;
    let isPlaceholder = true;
    if (p.image && !p.image.includes('cat-placeholder') && !p.image.includes('no-image-placeholder')) {
      if (p.image === '/product-lh7018.png') {
        img = weldionBanner;
        isPlaceholder = false;
      } else if (p.image.startsWith('http') || p.image.startsWith('/') || p.image.startsWith('data:')) {
        img = p.image;
        isPlaceholder = false;
      }
    } else if (Array.isArray(p.images) && p.images.length > 0) {
      const firstValid = p.images.find(
        (im) => im && !im.includes('cat-placeholder') && !im.includes('no-image-placeholder')
      );
      if (firstValid) {
        img = firstValid === '/product-lh7018.png' ? weldionBanner : firstValid;
        isPlaceholder = false;
      }
    }

    return {
      id: p._id || p.id,
      sku: p.sku ? (p.sku.startsWith('SKU:') ? p.sku : `SKU: ${p.sku}`) : 'SKU: N/A',
      aws: p.awsClass || p.awsClassification || 'AWS Certified',
      title: p.name || p.title,
      category: p.category,
      description: p.description || 'Precision-engineered industrial welding consumable.',
      tensile,
      yield: yieldVal,
      elongation,
      current,
      image: img,
      isPlaceholder,
      rawProduct: p,
    };
  };

  if (loading || !product) {
    return (
      <div className="product-details-page-wrapper" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '16px' }}>Loading real-time product details from database...</p>
      </div>
    );
  }

  // Resolve current product specifications
  const specs = getSpecsMap(product);
  const title = product.name || product.title || 'INDUSTRIAL WELDING CONSUMABLE';
  const sku = product.sku ? (product.sku.startsWith('SKU:') ? product.sku : `SKU: ${product.sku}`) : 'SKU: WTE-7018-1-50KG';
  const aws = product.awsClass || product.awsClassification || product.aws || 'AWS Certified';
  const category = product.category || product.subcategory || 'Welding Consumables';
  const description = product.description || 'Engineered for critical structural and industrial applications.';

  const yieldStrength = specs['Yield Strength'] || specs['Yield'] || '> 400 MPa';
  const tensileStrength = specs['Tensile Strength'] || specs['Tensile'] || '490 - 660 MPa';
  const impact = specs['Impact Energy (-45°C)'] 
    || specs['Impact Energy (-29°C)'] 
    || specs['Impact Energy (-20°C)'] 
    || specs['Impact Energy (-196°C)'] 
    || specs['Impact Energy (0°C)'] 
    || specs['Impact (CVN)'] 
    || specs['Impact'] 
    || '27J min @ -45°C';
  const positions = specs['Positions'] || specs['Position'] || 'All except V-down';

  // Determine images uploaded by admin
  const uploadedImages = [];

  if (product.image && !product.image.includes('cat-placeholder') && !product.image.includes('no-image-placeholder')) {
    const bannerImg = product.image === '/product-lh7018.png' ? weldionBanner : product.image;
    uploadedImages.push(bannerImg);
  }

  if (Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img && typeof img === 'string' && !img.includes('cat-placeholder') && !img.includes('no-image-placeholder')) {
        const resolved = img === '/product-lh7018.png' ? weldionBanner : img;
        if (!uploadedImages.includes(resolved)) {
          uploadedImages.push(resolved);
        }
      }
    });
  }

  const hasUploadedImages = uploadedImages.length > 0;
  // If no image is uploaded, display exactly one image holding noImagePlaceholder
  const currentHeroImage = hasUploadedImages 
    ? (uploadedImages[activeThumb] || uploadedImages[0])
    : noImagePlaceholder;
  const isPlaceholder = !hasUploadedImages;

  // Resolve chemical composition from DB
  const chemMap = product.chemicalComposition && typeof product.chemicalComposition === 'object'
    ? (product.chemicalComposition instanceof Map ? Object.fromEntries(product.chemicalComposition) : product.chemicalComposition)
    : { C: '0.06', Mn: '1.10', Si: '0.50', P: '< 0.020', S: '< 0.015' };

  // Resolve technical specifications rows from DB
  const techSpecs = Array.isArray(product.techSpecsRows) && product.techSpecsRows.length > 0
    ? product.techSpecsRows
    : [
        { diameter: '2.5', length: '350', currentFlat: '70 - 100', currentVertical: '65 - 90' },
        { diameter: '3.2', length: '400', currentFlat: '100 - 140', currentVertical: '90 - 130' },
        { diameter: '4.0', length: '400', currentFlat: '140 - 190', currentVertical: '120 - 160' },
        { diameter: '5.0', length: '450', currentFlat: '190 - 250', currentVertical: '—' },
      ];

  // Resolve features list from DB
  const featuresList = Array.isArray(product.features) && product.features.length > 0
    ? product.features
    : [
        'Exceptional radiographic quality welds guaranteed.',
        'Smooth, stable arc with low spatter and easy slag release.',
        'High deposition efficiency with uniform bead geometry.',
        'Engineered for critical seismic structural steel and pressure equipment.',
      ];

  const approvalsList = Array.isArray(product.approvals) ? product.approvals : [];

  const handleWhatsAppClick = () => {
    const text = `Hello Sprimax, I am interested in ${title} (${sku})`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadTds = () => {
    try {
      generateTdsPdf({
        ...product,
        name: title,
        sku,
        awsClass: aws,
        description,
        features: featuresList,
        approvals: approvalsList,
        specifications: specs,
        chemicalComposition: chemMap,
        techSpecsRows: techSpecs,
      });
    } catch (err) {
      console.error('Error generating Technical Data Sheet (TDS):', err);
    }
  };

  return (
    <div className="product-details-page-wrapper">
      <div className="product-details-container">
        {/* Breadcrumbs Row */}
        <div className="details-breadcrumb-row">
          <button 
            type="button" 
            onClick={onBackToCatalogue}
            className="details-back-btn"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>
          <div className="details-breadcrumb-trail">
            <span className="details-breadcrumb-link" onClick={onBackToHome}>Home</span>
            <span className="details-breadcrumb-sep">/</span>
            <span className="details-breadcrumb-link" onClick={onBackToCatalogue}>Products</span>
            <span className="details-breadcrumb-sep">/</span>
            <span className="details-breadcrumb-current">{category}</span>
          </div>
        </div>

        {/* Main Product Hero Image */}
        <div className={`details-main-img-box ${isPlaceholder ? 'details-main-img-placeholder' : ''} ${uploadedImages.length <= 1 ? 'details-main-img-no-thumbs' : ''}`}>
          <img 
            src={currentHeroImage} 
            alt={title} 
            className="details-hero-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = noImagePlaceholder;
            }} 
          />
        </div>

        {/* Thumbnail Gallery Row - ONLY displayed if admin uploaded multiple images (> 1) */}
        {uploadedImages.length > 1 && (
          <div className="details-thumbnail-row">
            {uploadedImages.map((thumb, index) => (
              <button
                key={index}
                type="button"
                className={`details-thumb-btn ${activeThumb === index ? 'active' : ''}`}
                onClick={() => setActiveThumb(index)}
                aria-label={`Select product image view ${index + 1}`}
              >
                <img 
                  src={thumb} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="details-thumb-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = noImagePlaceholder;
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Title, SKU & AWS Badge Row */}
        <div className="details-title-row">
          <div className="details-title-col">
            <h1 className="details-product-title headline-lg">
              {title}
            </h1>
            <span className="details-sku-tag data-tabular">
              {sku}
            </span>
          </div>

          <div className="details-badge-col">
            <span className="details-aws-badge-pill data-tabular">
              {aws}
            </span>
          </div>
        </div>

        {/* Real Product Description */}
        <p className="details-long-desc body-md">
          {description}
        </p>

        {/* Key Mechanical Parameters (4 Column Matrix) */}
        <div className="details-parameters-matrix-card">
          <div className="param-matrix-col">
            <span className="param-matrix-label">Yield Strength</span>
            <span className="param-matrix-value data-tabular">{yieldStrength}</span>
          </div>

          <div className="param-matrix-col">
            <span className="param-matrix-label">Tensile Strength</span>
            <span className="param-matrix-value data-tabular">{tensileStrength}</span>
          </div>

          <div className="param-matrix-col">
            <span className="param-matrix-label">Impact (CVN)</span>
            <span className="param-matrix-value data-tabular">{impact}</span>
          </div>

          <div className="param-matrix-col">
            <span className="param-matrix-label">Positions</span>
            <span className="param-matrix-value data-tabular">{positions}</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="details-actions-row">
          <button 
            type="button" 
            className="btn-details-enquiry"
            onClick={() => {
              if (onSendEnquiry) {
                onSendEnquiry({
                  title,
                  sku,
                  code: sku ? sku.replace('SKU: ', '') : '',
                  image: currentHeroImage,
                  category,
                  rawProduct: product,
                });
              }
            }}
          >
            SEND ENQUIRY
          </button>

          <button 
            type="button" 
            className="btn-details-whatsapp"
            onClick={handleWhatsAppClick}
          >
            WHATSAPP US
          </button>

          <button 
            type="button" 
            className="btn-details-download-tds"
            onClick={handleDownloadTds}
          >
            DOWNLOAD TDS
          </button>
        </div>

        {/* Technical Specification Tabs */}
        <div className="details-tabs-nav" role="tablist">
          <button 
            type="button"
            className={`details-tab-btn ${activeDetailTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('overview')}
            role="tab"
          >
            OVERVIEW
            {activeDetailTab === 'overview' && <span className="details-tab-active-bar" />}
          </button>

          <button 
            type="button"
            className={`details-tab-btn ${activeDetailTab === 'chem' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('chem')}
            role="tab"
          >
            CHEM COMPOSITION
            {activeDetailTab === 'chem' && <span className="details-tab-active-bar" />}
          </button>

          <button 
            type="button"
            className={`details-tab-btn ${activeDetailTab === 'mech' ? 'active' : ''}`}
            onClick={() => setActiveDetailTab('mech')}
            role="tab"
          >
            MECH PROPERTIES
            {activeDetailTab === 'mech' && <span className="details-tab-active-bar" />}
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="details-tab-content-card">
          {activeDetailTab === 'chem' ? (
            <div className="chem-composition-panel">
              <h3 className="details-panel-title headline-md">
                Typical Chemical Composition (%)
              </h3>
              <div className="details-panel-divider" />

              {/* Real Chemical Elements Table from DB */}
              <div className="details-table-wrap">
                <table className="details-unified-table chem-composition-table data-tabular">
                  <thead>
                    <tr>
                      {Object.keys(chemMap).map((elem) => (
                        <th key={elem}>{elem.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {Object.values(chemMap).map((val, idx) => (
                        <td key={idx}>{val}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Notice / Disclaimer Box */}
              <div className="chem-disclaimer-box">
                <Info size={16} className="chem-info-icon" />
                <p className="chem-disclaimer-text">
                  Values presented are typical production chemistry for {title} and comply with applicable AWS &amp; ASME manufacturing specifications. For lot-specific chemistry, refer to your certified Mill Test Report (MTR).
                </p>
              </div>
            </div>
          ) : activeDetailTab === 'overview' ? (
            <div className="overview-panel">
              <h3 className="details-panel-title headline-md">
                Product Overview &amp; Features
              </h3>
              <div className="details-panel-divider" />

              <div className="overview-features-grid">
                <div className="overview-features-col">
                  {featuresList.slice(0, Math.ceil(featuresList.length / 2)).map((feature, i) => (
                    <p key={i} className="overview-feature-item">{feature}</p>
                  ))}
                </div>
                <div className="overview-features-col">
                  {featuresList.slice(Math.ceil(featuresList.length / 2)).map((feature, i) => (
                    <p key={i} className="overview-feature-item">{feature}</p>
                  ))}
                  {approvalsList.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#212e68', textTransform: 'uppercase' }}>
                        Industry Approvals:
                      </span>
                      <p className="overview-feature-item" style={{ marginTop: '0.25rem' }}>
                        {approvalsList.join(' • ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <h4 className="details-panel-subtitle headline-md" style={{ marginTop: '2rem' }}>
                Technical Operating Parameters
              </h4>

              {/* Real Technical Operating Parameters Table from DB */}
              <div className="details-table-wrap">
                <table className="details-unified-table overview-specs-table data-tabular">
                  <thead>
                    <tr>
                      <th className="text-left">DIAMETER / SIZE</th>
                      <th className="text-left">LENGTH / PACK</th>
                      <th className="text-right">CURRENT (A) FLAT</th>
                      <th className="text-right">CURRENT (A) V.UP/OH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {techSpecs.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'row-zebra' : ''}>
                        <td className="text-left">{row.diameter ? (row.diameter.includes('mm') ? row.diameter : `${row.diameter} mm`) : '—'}</td>
                        <td className="text-left">{row.length ? (row.length.includes('mm') || row.length.includes('kg') ? row.length : `${row.length} mm`) : '—'}</td>
                        <td className="text-right">{row.currentFlat || '—'}</td>
                        <td className="text-right">{row.currentVertical || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mech-panel">
              <div className="mech-panel-header">
                <h3 className="details-panel-title headline-md">
                  Typical Mechanical Properties of All Weld Metal
                </h3>
                <div className="details-panel-divider" />
              </div>

              {/* 4 Real Metric Cards Grid from DB */}
              <div className="mech-metrics-grid">
                {/* Card 1: Yield Strength */}
                <div className="mech-metric-card">
                  <div className="mech-card-icon-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <line x1="6" y1="6" x2="6" y2="10" />
                      <line x1="10" y1="6" x2="10" y2="10" />
                      <line x1="14" y1="6" x2="14" y2="10" />
                      <line x1="18" y1="6" x2="18" y2="10" />
                    </svg>
                  </div>
                  <span className="mech-metric-label data-tabular">YIELD STRENGTH</span>
                  <span className="mech-metric-value data-tabular">{yieldStrength}</span>
                  <div className="mech-progress-bar-track">
                    <div className="mech-progress-bar-fill" style={{ width: '70%' }} />
                  </div>
                </div>

                {/* Card 2: Tensile Strength */}
                <div className="mech-metric-card">
                  <div className="mech-card-icon-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="7" x2="20" y2="7" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="4" y1="17" x2="20" y2="17" />
                    </svg>
                  </div>
                  <span className="mech-metric-label data-tabular">TENSILE STRENGTH</span>
                  <span className="mech-metric-value data-tabular">{tensileStrength}</span>
                  <div className="mech-progress-bar-track">
                    <div className="mech-progress-bar-fill" style={{ width: '85%' }} />
                  </div>
                </div>

                {/* Card 3: Impact (CVN) */}
                <div className="mech-metric-card">
                  <div className="mech-card-icon-wrap">
                    <Snowflake size={18} color="#64748b" strokeWidth={2} />
                  </div>
                  <span className="mech-metric-label data-tabular">IMPACT ENERGY (CVN)</span>
                  <span className="mech-metric-value data-tabular">{impact}</span>
                  <span className="mech-metric-subtext data-tabular">Charpy V-Notch</span>
                </div>

                {/* Card 4: Positions */}
                <div className="mech-metric-card">
                  <div className="mech-card-icon-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6" />
                      <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  </div>
                  <span className="mech-metric-label data-tabular">WELDING POSITIONS</span>
                  <span className="mech-metric-value mech-val-sm data-tabular">{positions}</span>
                  <div className="mech-positions-glyphs">
                    <span className="pos-glyph" title="Flat (1G)">&mdash;</span>
                    <span className="pos-glyph" title="Horizontal (2G)">&rarr;</span>
                    <span className="pos-glyph" title="Vertical-Up (3G)">&uarr;</span>
                    <span className="pos-glyph pos-box" title="Overhead (4G)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#212e68" strokeWidth="1.8">
                        <rect x="2" y="2" width="12" height="12" rx="1.5" />
                        <path d="M5 2v12M11 2v12M2 5h12M2 11h12" strokeDasharray="1.5 1.5" strokeWidth="1" stroke="#94a3b8" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Note Box */}
              <div className="mech-note-box">
                <p className="mech-note-text">
                  * Note: As-welded mechanical properties tested in accordance with AWS {aws.replace('AWS ', '')} classification standards.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Real RELATED PRODUCTS Section */}
        {relatedProducts.length > 0 && (
          <section className="details-related-section" aria-label="Related Products">
            <h2 className="related-section-title headline-lg">
              RELATED PRODUCTS IN {category.toUpperCase()}
            </h2>

            <div className="related-products-grid">
              {relatedProducts.map((relProd) => (
                <article key={relProd.id} className="catalogue-product-card">
                  {/* Product Image Area */}
                  <div className={`catalogue-img-box ${relProd.isPlaceholder ? 'catalogue-img-box-placeholder' : ''}`}>
                    <img 
                      src={relProd.image} 
                      alt={relProd.title} 
                      className={`catalogue-card-img ${relProd.isPlaceholder ? 'img-placeholder' : ''}`}
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
                      <span className="catalogue-sku data-tabular">{relProd.sku}</span>
                      <span className="catalogue-aws-pill data-tabular">{relProd.aws}</span>
                    </div>

                    {/* Product Title */}
                    <h3 className="catalogue-product-title headline-md">
                      {relProd.title}
                    </h3>

                    {/* Short Description */}
                    <p className="catalogue-product-desc body-md">
                      {relProd.description}
                    </p>

                    <div className="catalogue-card-divider" />

                    {/* Technical Specs 2x2 Grid */}
                    <div className="catalogue-specs-matrix data-tabular">
                      <div className="spec-item">
                        <span className="spec-label">Tensile</span>
                        <span className="spec-val">{relProd.tensile}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Yield</span>
                        <span className="spec-val">{relProd.yield}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Elongation</span>
                        <span className="spec-val">{relProd.elongation}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">Current</span>
                        <span className="spec-val">{relProd.current}</span>
                      </div>
                    </div>

                    {/* Action Buttons: SEND ENQUIRY + VIEW DETAILS */}
                    <div className="catalogue-btn-row">
                      <button 
                        type="button" 
                        className="btn-catalogue-enquiry"
                        onClick={() => onSendEnquiry ? onSendEnquiry(relProd) : alert(`Enquiry for ${relProd.title}`)}
                      >
                        SEND ENQUIRY
                      </button>

                      <button 
                        type="button" 
                        className="btn-catalogue-details"
                        onClick={() => {
                          if (onViewProductDetails) {
                            onViewProductDetails(relProd.rawProduct || relProd);
                          } else {
                            setProduct(relProd.rawProduct || relProd);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                      >
                        VIEW DETAILS
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
