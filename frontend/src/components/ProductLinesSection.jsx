import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import iconGears from '../assets/icon-gears.png';
import iconLayers from '../assets/icon-layers.png';
import iconShield from '../assets/icon-shield.png';
import { getFeaturedProductLines, getPrimaryCatalog } from '../api/home.js';

const defaultProductLines = [
  {
    _id: 'default-1',
    name: 'Mild Steel Electrodes',
    slug: 'mild-steel-electrodes',
    description: 'General purpose and high-deposition rutile/cellulosic rods.',
    cardTheme: 'white',
    watermarkType: 'gears',
    isWideCard: false,
    sortOrder: 1,
  },
  {
    _id: 'default-2',
    name: 'Stainless Steel',
    slug: 'stainless-steel',
    description: 'Corrosion-resistant alloys for demanding chemical & food grade applications.',
    cardTheme: 'navy',
    watermarkType: 'layers',
    isWideCard: false,
    sortOrder: 2,
  },
  {
    _id: 'default-3',
    name: 'Hardfacing Alloys',
    slug: 'hardfacing-alloys',
    description: 'Wear-resistant solutions for mining, agriculture, and earthmoving.',
    cardTheme: 'white',
    watermarkType: 'shield',
    isWideCard: false,
    sortOrder: 3,
  },
  {
    _id: 'default-4',
    name: 'Submerged Arc Welding (SAW) Fluxes & Wires',
    slug: 'submerged-arc-welding',
    description: 'High-productivity solutions for heavy fabrication and pressure vessels.',
    cardTheme: 'white',
    watermarkType: 'saw',
    isWideCard: true,
    sortOrder: 4,
  },
];

export default function ProductLinesSection({ onViewSpecs, onDownloadCatalog }) {
  const [categories, setCategories] = useState(defaultProductLines);
  const [catalog, setCatalog] = useState({
    title: 'Complete Catalog',
    description: 'Download the full 2024 Product Guide (PDF)',
    fileUrl: '/downloads/sprimax-complete-catalog-2024.pdf',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live featured product line categories from database
    getFeaturedProductLines().then((data) => {
      if (isMounted) {
        if (data?.categories && data.categories.length > 0) {
          // Strictly keep only the 4 core product line categories on homepage
          const featured = data.categories.filter((c) => 
            c.isFeaturedOnHome === true && 
            c.name !== 'Low Alloy High Tensile' && 
            c.name !== 'Nickel & Special Alloys'
          );
          setCategories(featured.length > 0 ? featured : defaultProductLines);
        } else {
          setCategories(defaultProductLines);
        }
      }
    });

    // 2. Fetch live catalog resource details from database
    getPrimaryCatalog().then((data) => {
      if (isMounted && data?.catalog) {
        setCatalog(data.catalog);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardClick = (category) => {
    if (onViewSpecs) {
      onViewSpecs(category.name, category.slug);
    } else {
      console.log('View specifications for:', category.name);
    }
  };

  const handleDownloadClick = () => {
    if (onDownloadCatalog) {
      onDownloadCatalog(catalog);
    } else {
      console.log('Downloading catalog:', catalog.title);
    }
  };

  // Helper to pick appropriate watermark asset based on database field
  const getWatermarkIcon = (type) => {
    switch (type) {
      case 'layers':
        return iconLayers;
      case 'shield':
        return iconShield;
      case 'gears':
      default:
        return iconGears;
    }
  };

  // Split categories: top row (non-wide) and bottom row wide category
  const topCategories = categories.filter((c) => !c.isWideCard);
  const wideCategories = categories.filter((c) => c.isWideCard);

  return (
    <section id="products" className="product-lines-section">
      <div className="product-lines-container">
        {/* Section Header */}
        <div className="product-lines-header">
          <h2 className="headline-lg product-lines-title">
            Technical Product Lines
          </h2>
          <p className="body-md product-lines-subtitle">
            Browse by consumable classification
          </p>
          <div className="product-lines-divider"></div>
        </div>

        {/* Top Row: Cards fetched from Database */}
        <div className="product-cards-grid-top">
          {topCategories.map((cat, index) => {
            const isNavy = cat.cardTheme === 'navy';
            const watermarkImg = getWatermarkIcon(cat.watermarkType);
            const isLast = index === topCategories.length - 1;
            const remainder = topCategories.length % 3;
            const spanClass = isLast && remainder === 2 
              ? 'card-span-2' 
              : (isLast && remainder === 1 && topCategories.length > 1 ? 'card-span-3' : '');

            return (
              <div
                key={cat._id || cat.slug}
                className={`product-card ${isNavy ? 'card-navy' : 'card-white'} ${spanClass}`}
                onClick={() => handleCardClick(cat)}
              >
                <div className="product-card-watermark">
                  <img
                    src={watermarkImg}
                    alt=""
                    className={`watermark-img watermark-${cat.watermarkType || 'gears'}`}
                  />
                </div>
                <div className="product-card-content">
                  <h3 className={`headline-md card-title ${isNavy ? 'text-white' : ''}`}>
                    {cat.name}
                  </h3>
                  <p className={`body-md card-description ${isNavy ? 'text-white-muted' : ''}`}>
                    {cat.description}
                  </p>
                  <div className={`card-link-action ${isNavy ? 'text-white' : ''}`}>
                    <span>VIEW SPECIFICATIONS &rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Row: Wide Category & Primary Catalog Download */}
        <div className="product-cards-grid-bottom">
          {/* Wide Category (e.g. Submerged Arc Welding) from Database */}
          {wideCategories.map((wideCat) => (
            <div
              key={wideCat._id || wideCat.slug}
              className="product-card card-white card-saw-wide"
              onClick={() => handleCardClick(wideCat)}
            >
              <div className="card-centered-content">
                <h3 className="headline-md card-title">
                  {wideCat.name}
                </h3>
                <p className="body-md card-description">
                  {wideCat.description}
                </p>
              </div>
            </div>
          ))}

          {/* Primary Catalog Download Card from Database */}
          <div
            className="product-card card-white card-catalog-download"
            onClick={handleDownloadClick}
          >
            <div className="card-centered-content">
              <div className="download-icon-wrap">
                <Download size={26} strokeWidth={2.2} className="catalog-download-icon" />
              </div>
              <h3 className="headline-md card-title">{catalog.title || 'Complete Catalog'}</h3>
              <p className="body-md card-description text-dim">
                {catalog.description || 'Download the full 2024 Product Guide (PDF)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
