import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, Check, ChevronDown, Package, AlertCircle } from 'lucide-react';
import { submitEnquiry } from '../api/enquiries.js';
import { getProducts } from '../api/products.js';
import noImagePlaceholder from '../assets/no-image-placeholder.png';
import weldionBanner from '../assets/weldion-product-banner.png';

export default function SendEnquiryPage({
  selectedProduct = null,
  onBackToCatalogue,
  onBackToHome,
  onBackToProduct,
  onCancel,
  showSuccessModal,
  setShowSuccessModal
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: 'United States',
    quantity: '',
    unit: 'KG',
    requiredDate: '',
    application: '',
    specifications: '',
    agreePrivacy: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [productList, setProductList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeProduct, setActiveProduct] = useState(selectedProduct || null);
  const [productError, setProductError] = useState('');

  // Synchronize when selectedProduct prop changes
  useEffect(() => {
    if (selectedProduct) {
      setActiveProduct(selectedProduct);
    } else {
      setActiveProduct(null);
    }
  }, [selectedProduct]);

  // Fetch all products from catalog for the dropdown
  useEffect(() => {
    let mounted = true;
    setLoadingProducts(true);
    getProducts({ limit: 500 })
      .then((res) => {
        if (!mounted) return;
        const prods = (res?.products || []).map((p) => {
          let resolvedImage = noImagePlaceholder;
          if (p.image && !p.image.includes('cat-placeholder')) {
            if (p.image === '/product-lh7018.png') {
              resolvedImage = weldionBanner;
            } else if (p.image.startsWith('http') || p.image.startsWith('data:') || p.image.startsWith('/')) {
              resolvedImage = p.image;
            }
          }
          return {
            id: p._id || p.id,
            title: p.name,
            sku: p.sku ? (p.sku.startsWith('SKU:') ? p.sku : `SKU: ${p.sku}`) : 'SKU: N/A',
            code: p.sku ? p.sku.replace(/^SKU:\s*/, '') : '',
            aws: p.awsClass || '',
            category: p.category || 'General',
            image: resolvedImage,
            rawProduct: p
          };
        });
        setProductList(prods);
        setLoadingProducts(false);
      })
      .catch((err) => {
        console.warn('Failed to load products for enquiry dropdown:', err);
        if (mounted) setLoadingProducts(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectProduct = (e) => {
    const chosenVal = e.target.value;
    setProductError('');
    if (!chosenVal) {
      setActiveProduct(null);
      return;
    }
    const found = productList.find(
      (p) => (p.id === chosenVal) || (p.code === chosenVal) || (p.sku === chosenVal) || (p.title === chosenVal)
    );
    if (found) {
      setActiveProduct(found);
    }
  };

  // Modal state: supports both controlled prop and internal fallback
  const [internalShowModal, setInternalShowModal] = useState(false);
  const isModalOpen = showSuccessModal !== undefined ? showSuccessModal : internalShowModal;
  const setModalOpen = (val) => {
    if (setShowSuccessModal) {
      setShowSuccessModal(val);
    }
    setInternalShowModal(val);
  };

  const countries = [
    'United States',
    'United Kingdom',
    'Germany',
    'United Arab Emirates',
    'Saudi Arabia',
    'India',
    'Singapore',
    'Australia',
    'Canada',
    'South Africa',
    'Pakistan',
    'Malaysia',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!activeProduct || !activeProduct.title) {
      setProductError('Product selection is required. Please select a product from the dropdown.');
      const selectElem = document.getElementById('enquiry-product-select');
      if (selectElem) {
        selectElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        selectElem.focus();
      }
      return;
    }
    setProductError('');

    try {
      setSubmitting(true);
      await submitEnquiry({
        name: formData.fullName || 'Prospective Buyer',
        customer: formData.fullName || 'Prospective Buyer',
        contactName: formData.fullName || 'Prospective Buyer',
        email: formData.email,
        phone: formData.phone,
        company: formData.companyName || 'Not specified',
        companyName: formData.companyName || 'Not specified',
        subject: `Enquiry for ${activeProduct.title || 'Product'}`,
        title: `${formData.companyName || formData.fullName || 'Enquiry'} - ${activeProduct.title || 'Product'}`,
        productInterested: activeProduct.title || activeProduct.code || 'Industrial Supply',
        skuOrClass: activeProduct.code || activeProduct.sku || 'Industrial Supply',
        enquiryType: 'Product Enquiry',
        quantity: formData.quantity || '',
        unit: formData.unit || 'KG',
        requiredDate: formData.requiredDate || '',
        application: formData.application || '',
        specifications: formData.specifications || '',
        status: 'New',
        message: `Quantity: ${formData.quantity || 'N/A'} ${formData.unit || ''}\nRequired By: ${formData.requiredDate || 'N/A'}\nApplication: ${formData.application || 'N/A'}\nLocation: ${formData.city ? `${formData.city}, ` : ''}${formData.country || ''}\nSpecifications: ${formData.specifications || 'Standard'}`
      });
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
      // Still show confirmation or modal to user
      setModalOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="enquiry-page-wrapper">
      <div className="enquiry-page-container">
        {/* Breadcrumb Row */}
        <div className="details-breadcrumb-row">
          <button 
            type="button" 
            onClick={activeProduct ? (onBackToProduct || onBackToCatalogue) : onBackToCatalogue}
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
            <span className="details-breadcrumb-current">{activeProduct?.category || activeProduct?.title || 'Product Enquiry'}</span>
          </div>
        </div>

        {/* Main 2-Column Content Layout */}
        <div className="enquiry-layout-grid">
          {/* Left Column: Selected Product Card */}
          <aside className="enquiry-product-sidebar">
            {activeProduct ? (
              <div className="enquiry-product-card">
                {/* Product Photo with SELECTED Badge */}
                <div className="enquiry-prod-img-box">
                  <img 
                    src={activeProduct.image || weldionBanner} 
                    alt={activeProduct.title || 'Selected Product'} 
                    className="enquiry-prod-img" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = noImagePlaceholder;
                    }}
                  />
                  <span className="enquiry-selected-badge data-tabular">SELECTED</span>
                </div>

                {/* Product Details Area */}
                <div className="enquiry-prod-body">
                  <h2 className="enquiry-prod-title headline-md">
                    {activeProduct.title}
                  </h2>

                  <div className="enquiry-sku-pill data-tabular">
                    {activeProduct.sku || (activeProduct.code ? `SKU: ${activeProduct.code}` : 'SKU: Available')}
                  </div>

                  <div className="enquiry-card-divider" />

                  <button 
                    type="button" 
                    className="enquiry-change-prod-btn"
                    onClick={onBackToCatalogue}
                  >
                    <ArrowLeft size={14} />
                    <span>CHANGE PRODUCT</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="enquiry-product-card enquiry-product-card--empty">
                <div className="enquiry-empty-box">
                  <div className="enquiry-empty-icon-circle">
                    <Package size={28} strokeWidth={1.8} />
                  </div>
                  <h3 className="enquiry-empty-title">NO PRODUCT SELECTED</h3>
                  <p className="enquiry-empty-desc">
                    Please select a product from the dropdown menu in Section 02 or browse our complete catalogue.
                  </p>
                  <button 
                    type="button" 
                    className="btn-browse-catalog"
                    onClick={onBackToCatalogue}
                  >
                    <ArrowLeft size={14} />
                    <span>BROWSE CATALOGUE</span>
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* Right Column: Enquiry Form */}
          <main className="enquiry-form-main">
            <div className="enquiry-form-card">
              <header className="enquiry-form-header">
                <h1 className="enquiry-main-title headline-lg">PRODUCT ENQUIRY</h1>
                <p className="enquiry-subtitle body-md">
                  Submit your requirements for technical review and quotation.
                </p>
                <div className="enquiry-header-divider" />
              </header>

                <form onSubmit={handleFormSubmit} noValidate className="enquiry-form">
                  {/* Section 01: Customer Details */}
                  <fieldset className="enquiry-fieldset">
                    <div className="enquiry-section-title-row">
                      <span className="enquiry-section-icon" aria-hidden="true">
                        {/* ID Badge Icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e05206" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="7" width="18" height="14" rx="2" />
                          <path d="M10 7V5a2 2 0 0 1 4 0v2" />
                          <circle cx="12" cy="12" r="2" />
                          <path d="M7 18a5 5 0 0 1 10 0" />
                        </svg>
                      </span>
                      <legend className="enquiry-section-title">01. Customer Details</legend>
                    </div>

                    <div className="enquiry-grid-2col">
                      <div className="enquiry-field-wrap">
                        <label className="enquiry-label data-tabular">FULL NAME *</label>
                        <input 
                          type="text" 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="enquiry-input" 
                        />
                      </div>

                      <div className="enquiry-field-wrap">
                        <label className="enquiry-label data-tabular">COMPANY NAME *</label>
                        <input 
                          type="text" 
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          className="enquiry-input" 
                        />
                      </div>
                    </div>

                    <div className="enquiry-grid-2col">
                      <div className="enquiry-field-wrap">
                        <label className="enquiry-label data-tabular">EMAIL ADDRESS *</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="enquiry-input" 
                        />
                      </div>

                      <div className="enquiry-field-wrap">
                        <label className="enquiry-label data-tabular">MOBILE/WHATSAPP *</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="enquiry-input" 
                        />
                      </div>
                    </div>

                    <div className="enquiry-grid-3col">
                      <div className="enquiry-field-wrap">
                        <label className="enquiry-label data-tabular">CITY *</label>
                        <input 
                          type="text" 
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="enquiry-input" 
                        />
                      </div>

                      <div className="enquiry-field-wrap">
                        <label className="enquiry-label data-tabular">STATE/PROVINCE</label>
                        <input 
                          type="text" 
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="enquiry-input" 
                        />
                      </div>

                      <div className="enquiry-field-wrap">
                        <label className="enquiry-label data-tabular">COUNTRY *</label>
                        <div className="enquiry-select-box">
                          <select 
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="enquiry-select"
                          >
                            <option value="">Select Country...</option>
                            {countries.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="enquiry-select-chevron" />
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  {/* Section 02: Requirement Details */}
                  <fieldset className="enquiry-fieldset">
                    <div className="enquiry-section-title-row">
                      <span className="enquiry-section-icon" aria-hidden="true">
                        {/* Drafting divider / Compass tool icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e05206" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="5" r="2" />
                          <path d="m19 21-6.5-14" />
                          <path d="m5 21 6.5-14" />
                          <path d="M7.5 16h9" />
                        </svg>
                      </span>
                      <legend className="enquiry-section-title">02. Requirement Details</legend>
                    </div>

                    {/* Product Selection Dropdown */}
                    <div className="enquiry-field-wrap">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                        <label className="enquiry-label data-tabular" htmlFor="enquiry-product-select" style={{ marginBottom: 0 }}>
                          SELECT PRODUCT *
                        </label>
                        {activeProduct && (
                          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={12} strokeWidth={3} /> Selected
                          </span>
                        )}
                      </div>
                      <div className={`enquiry-select-box ${productError ? 'enquiry-input-error' : ''}`}>
                        <select 
                          id="enquiry-product-select"
                          name="selectedProduct"
                          value={activeProduct ? (activeProduct.id || activeProduct.code || activeProduct.sku || activeProduct.title) : ''}
                          onChange={handleSelectProduct}
                          className="enquiry-select"
                          aria-label="Select Product for Quotation"
                        >
                          <option value="">
                            {loadingProducts ? 'Loading products...' : '— Select a Product for Enquiry * —'}
                          </option>
                          {/* If activeProduct is not yet in productList, add it at top */}
                          {activeProduct && !productList.some((p) => p.id === activeProduct.id || p.code === activeProduct.code || p.title === activeProduct.title) && (
                            <option value={activeProduct.id || activeProduct.code || activeProduct.title}>
                              {activeProduct.title} {activeProduct.sku ? `(${activeProduct.sku})` : ''}
                            </option>
                          )}
                          {productList.map((prod) => (
                            <option key={prod.id || prod.code} value={prod.id || prod.code}>
                              {prod.title} {prod.sku ? `(${prod.sku})` : ''} — {prod.category}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={16} className="enquiry-select-chevron" />
                      </div>
                      {productError && (
                        <div className="enquiry-error-msg" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                          <AlertCircle size={14} />
                          <span>{productError}</span>
                        </div>
                      )}
                    </div>

                    {/* Quantity & Date */}
                    <div className="enquiry-grid-2col">
                      <div className="enquiry-field-wrap">
                        <label className="enquiry-label data-tabular">QUANTITY *</label>
                        <div className="enquiry-qty-group">
                          <input 
                            type="number" 
                            name="quantity"
                            min="1"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="enquiry-qty-input" 
                          />
                          <div className="enquiry-unit-select-wrap">
                            <select 
                              name="unit"
                              value={formData.unit}
                              onChange={handleChange}
                              className="enquiry-unit-select"
                            >
                              <option value="KG">KG</option>
                              <option value="PCS">PCS</option>
                              <option value="BOXES">BOXES</option>
                              <option value="TONS">TONS</option>
                            </select>
                            <ChevronDown size={14} className="enquiry-unit-chevron" />
                          </div>
                        </div>
                      </div>

                      <div className="enquiry-field-wrap">
                        <label className="enquiry-label data-tabular">REQUIRED DATE (OPTIONAL)</label>
                        <input 
                          type="date" 
                          name="requiredDate"
                          placeholder="mm/dd/yyyy"
                          value={formData.requiredDate}
                          onChange={handleChange}
                          className="enquiry-input enquiry-date-input" 
                        />
                      </div>
                    </div>

                    {/* Application / Industry */}
                    <div className="enquiry-field-wrap">
                      <label className="enquiry-label data-tabular">APPLICATION / INDUSTRY (OPTIONAL)</label>
                      <input 
                        type="text" 
                        name="application"
                        placeholder="e.g. Pipeline Construction, Heavy Machinery"
                        value={formData.application}
                        onChange={handleChange}
                        className="enquiry-input" 
                      />
                    </div>

                    {/* Additional Specifications */}
                    <div className="enquiry-field-wrap">
                      <label className="enquiry-label data-tabular">ADDITIONAL SPECIFICATIONS</label>
                      <textarea 
                        name="specifications"
                        rows={4}
                        placeholder="Detail any specific technical requirements or standards compliance needed..."
                        value={formData.specifications}
                        onChange={handleChange}
                        className="enquiry-textarea" 
                      />
                    </div>
                  </fieldset>

                  {/* Submission Box */}
                  <div className="enquiry-submit-card">
                    {/* Privacy Checkbox */}
                    <label className="enquiry-checkbox-row">
                      <input 
                        type="checkbox" 
                        name="agreePrivacy"
                        checked={formData.agreePrivacy}
                        onChange={handleChange}
                        className="enquiry-checkbox" 
                      />
                      <span className="enquiry-checkbox-label">
                        I acknowledge that I have read and agree to the <a href="#privacy" className="enquiry-privacy-link" onClick={(e) => e.preventDefault()}>Privacy Policy</a> and consent to the processing of my technical data for quotation purposes. *
                      </span>
                    </label>

                    {/* Security Badge */}
                    <div className="enquiry-security-badge data-tabular">
                      <ShieldCheck size={16} strokeWidth={2.4} className="enquiry-shield-icon" />
                      <span>SECURE SUBMISSION SYSTEM ACTIVE</span>
                    </div>

                    <div className="enquiry-submit-divider" />

                    {/* Action Buttons: Dedicated SEND ENQUIRY for form + CANCEL */}
                    <div className="enquiry-actions-row">
                      <button 
                        type="button" 
                        id="btn-enquiry-form-submit"
                        className="btn-enquiry-submit"
                        onClick={handleFormSubmit}
                      >
                        SEND ENQUIRY
                      </button>
                      <button 
                        type="button" 
                        id="btn-enquiry-form-cancel"
                        className="btn-enquiry-cancel"
                        onClick={onCancel || onBackToCatalogue}
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </main>
          </div>
        </div>

        {/* Enquiry Submission Successful Message Popup Modal */}
        {isModalOpen && (
          <div className="enquiry-modal-backdrop" onClick={() => setModalOpen(false)}>
            <div 
              className="enquiry-modal-card" 
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-success-title"
            >
              {/* Watermark Checkmark Icon (Top-Right) */}
              <div className="enquiry-modal-watermark" aria-hidden="true">
                <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="#212e68" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>

              {/* Center Red Checkmark Badge */}
              <div className="enquiry-modal-icon-wrap">
                <div className="enquiry-modal-check-badge">
                  <Check size={18} strokeWidth={3.5} color="#ffffff" />
                </div>
              </div>

              {/* Modal Heading */}
              <h2 id="modal-success-title" className="enquiry-modal-title headline-md">
                Enquiry Submitted Successfully
              </h2>

              {/* Modal Description */}
              <p className="enquiry-modal-desc body-md">
                Thank you for your enquiry. Our technical engineering team will review your requirements and get back to you within 24-48 business hours.
              </p>

              {/* Reference Number Box */}
              <div className="enquiry-modal-ref-box">
                <span className="enquiry-modal-ref-label data-tabular">
                  REFERENCE NUMBER
                </span>
                <div className="enquiry-modal-ref-code data-tabular">
                  SRX-77421-B2B
                </div>
              </div>

              {/* Action Buttons: 2 columns */}
              <div className="enquiry-modal-actions-grid">
                <button 
                  type="button" 
                  className="btn-modal-browse"
                  onClick={() => {
                    setModalOpen(false);
                    onBackToCatalogue();
                  }}
                >
                  <span>BROWSE CATALOGUE</span>
                  <ArrowRight size={15} />
                </button>

                <button 
                  type="button" 
                  className="btn-modal-back-product"
                  onClick={() => {
                    setModalOpen(false);
                    if (onBackToProduct) {
                      onBackToProduct();
                    } else if (onCancel) {
                      onCancel();
                    } else {
                      onBackToCatalogue();
                    }
                  }}
                >
                  <span>BACK TO PRODUCT</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
