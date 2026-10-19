import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';
import { getHeroBanner, getDiscoveryFilters } from '../api/home.js';

export default function HeroSection({ onExploreProducts, onSendEnquiry, onSearchCatalog }) {
  const [productSku, setProductSku] = useState('');
  const [baseMaterial, setBaseMaterial] = useState('');
  const [industry, setIndustry] = useState('');

  // Live database data state
  const [banner, setBanner] = useState({
    title: 'INDUSTRIAL GRADE CONSUMABLES',
    heading: 'Precision Welding Consumables for Industrial Excellence',
    supportingText:
      'Engineered for maximum structural integrity. Supply chain solutions for fabrication, oil & gas, and heavy infrastructure projects worldwide.',
    ctaLabel: 'EXPLORE PRODUCTS',
    desktopImage: null,
    desktopAlt: 'Industrial Welding Automation',
  });

  const [filterOptions, setFilterOptions] = useState({
    classifications: [],
    baseMaterials: [],
    industries: [],
  });

  const [loadingFilters, setLoadingFilters] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch real-time banner from database
    getHeroBanner().then((data) => {
      if (isMounted && data?.banner) {
        setBanner((prev) => ({
          ...prev,
          ...data.banner,
        }));
      }
    });

    // 2. Fetch real-time discovery filters from database
    getDiscoveryFilters().then((data) => {
      if (isMounted && data) {
        setFilterOptions({
          classifications: data.classifications || [],
          baseMaterials: data.baseMaterials || [],
          industries: data.industries || [],
        });
        setLoadingFilters(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCatalogSearch = (e) => {
    e.preventDefault();
    if (onSearchCatalog) {
      onSearchCatalog({ productSku, baseMaterial, industry });
    } else {
      console.log('Searching catalog for:', { productSku, baseMaterial, industry });
    }
  };

  return (
    <section className="hero-section-wrapper">
      {/* Background Banner */}
      <div className="hero-banner">
        <div className="hero-bg-layer" aria-hidden="true">
          <img 
            src={banner.desktopImage || heroBg} 
            alt={banner.desktopAlt || "Industrial Welding Automation"} 
            className="hero-bg-img" 
          />
        </div>

        {/* Content Container (z-index above background) */}
        <div className="hero-banner-content">
          {/* Eyebrow Tag */}
          <div className="hero-eyebrow">
            <span className="eyebrow-line"></span>
            <span className="eyebrow-text">{banner.title || 'INDUSTRIAL GRADE CONSUMABLES'}</span>
          </div>

          {/* Headline XL */}
          <h1 className="hero-headline headline-xl">
            {banner.heading}
          </h1>

          {/* Body LG Description */}
          <p className="hero-description body-lg">
            {banner.supportingText}
          </p>

          {/* Action Buttons */}
          <div className="hero-btn-row">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={onExploreProducts}
            >
              <span>{banner.ctaLabel || 'EXPLORE PRODUCTS'}</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              className="btn-hero-secondary"
              onClick={onSendEnquiry}
            >
              <span>SEND ENQUIRY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Technical Discovery Floating Card */}
      <div className="discovery-card-container">
        <div className="discovery-card">
          <div className="discovery-label">
            QUICK TECHNICAL DISCOVERY
          </div>

          <form onSubmit={handleCatalogSearch} className="discovery-form">
            {/* Field 1: Real-time Product name, SKU or AWS classification */}
            <div className="discovery-field-group">
              <select
                className="discovery-select body-md"
                value={productSku}
                onChange={(e) => setProductSku(e.target.value)}
                aria-label="Product name, SKU or AWS classification"
              >
                <option value="">
                  {loadingFilters ? 'Loading classifications...' : 'Product name, SKU or AWS ..'}
                </option>
                {filterOptions.classifications.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-chevron" />
            </div>

            {/* Field 2: Real-time Base material */}
            <div className="discovery-field-group">
              <select
                className="discovery-select body-md"
                value={baseMaterial}
                onChange={(e) => setBaseMaterial(e.target.value)}
                aria-label="Base material"
              >
                <option value="">
                  {loadingFilters ? 'Loading materials...' : 'Base material'}
                </option>
                {filterOptions.baseMaterials.map((material) => (
                  <option key={material} value={material}>
                    {material}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-chevron" />
            </div>

            {/* Field 3: Real-time Application or industry */}
            <div className="discovery-field-group">
              <select
                className="discovery-select body-md"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                aria-label="Application or industry"
              >
                <option value="">
                  {loadingFilters ? 'Loading industries...' : 'Application or industry'}
                </option>
                {filterOptions.industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-chevron" />
            </div>

            {/* Field 4: Search Button */}
            <button type="submit" className="btn-search-catalog">
              SEARCH CATALOG
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
