import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductLinesSection from './components/ProductLinesSection';
import ProductCataloguePage from './components/ProductCataloguePage';
import ProductDetailsPage from './components/ProductDetailsPage';
import SendEnquiryPage from './components/SendEnquiryPage';
import AboutUsPage from './components/AboutUsPage';
import BecomeDealerPage from './components/BecomeDealerPage';
import CompanyPage from './components/CompanyPage';
import ContactPage from './components/ContactPage';
import SolutionsPage from './components/SolutionsPage';
import ResourcesPage from './components/ResourcesPage';
import SearchProductsPage from './components/SearchProductsPage';
import SubmitProjectRequirementsPage from './components/SubmitProjectRequirementsPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsAndConditionsPage from './components/TermsAndConditionsPage';
import FaqPage from './components/FaqPage';
import SitemapPage from './components/SitemapPage';
import IsoCertificationsPage from './components/IsoCertificationsPage';
import ComingSoonPage from './components/ComingSoonPage';
import FooterSection from './components/FooterSection';
import productLh7018 from './assets/product-lh7018.png';
import './App.css';

// Helper to resolve route page from pathname, search query, or hash
function getInitialPageFromUrl() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const pageParam = searchParams.get('page');
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();

  const candidate = pageParam || path || hash;

  if (candidate.startsWith('product') && candidate !== 'products') {
    return 'products';
  }
  if (['products', 'catalogue'].includes(candidate)) return 'products';
  if (['about', 'about-us'].includes(candidate)) return 'about';
  if (['company', 'solutions-overview'].includes(candidate)) return 'company';
  if (['solutions'].includes(candidate)) return 'solutions';
  if (['resources', 'downloads', 'manuals'].includes(candidate)) return 'resources';
  if (['contact', 'support'].includes(candidate)) return 'contact';
  if (['become-dealer', 'dealer', 'dealership'].includes(candidate)) return 'become-dealer';
  if (['submit-requirements', 'custom-requirements'].includes(candidate)) return 'submit-requirements';
  if (['privacy', 'privacy-policy'].includes(candidate)) return 'privacy';
  if (['terms', 'terms-of-service', 'terms-and-conditions', 'conditions'].includes(candidate)) return 'terms';
  if (['faq', 'faqs', 'help'].includes(candidate)) return 'faq';
  if (['sitemap'].includes(candidate)) return 'sitemap';
  if (['iso', 'iso-certifications', 'certifications', 'quality'].includes(candidate)) return 'iso';
  if (['careers', 'career', 'jobs'].includes(candidate)) return 'careers';
  if (['blog', 'news', 'insights'].includes(candidate)) return 'blog';
  if (['search'].includes(candidate)) return 'search';
  if (['send-enquiry', 'enquiry'].includes(candidate)) return 'send-enquiry';

  return 'home';
}

export default function App() {
  // Initialize page directly from current URL pathname / search / hash
  const [currentPage, setCurrentPage] = useState(getInitialPageFromUrl);
  const [activeCatalogFilters, setActiveCatalogFilters] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [detailProduct, setDetailProduct] = useState(null);
  const [selectedIndustrySlug, setSelectedIndustrySlug] = useState('heavy-engineering');
  const [selectedIndustryForRequirements, setSelectedIndustryForRequirements] = useState(null);
  const [technicalDocsQuery, setTechnicalDocsQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('Electrodes');
  const [searchTab, setSearchTab] = useState('products');
  const [enquiryKey, setEnquiryKey] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Listen to popstate / hashchange so back/forward and hash navigation work seamlessly
  useEffect(() => {
    const handleUrlChange = () => {
      const resolved = getInitialPageFromUrl();
      setCurrentPage(resolved);
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const [enquiryProduct, setEnquiryProduct] = useState({
    title: 'LOW HYDROGEN ELECTRODE',
    sku: 'SKU: WTE-7018-1-50KG',
    code: 'WTE-7018-1-50KG',
    image: productLh7018
  });

  const handleSendEnquiry = (product) => {
    // Always dismiss any previous success modal so the user sees the enquiry form page
    setShowSuccessModal(false);

    if (product && !product.nativeEvent && !product._reactName) {
      setEnquiryProduct({
        title: product.title || product.name || 'LOW HYDROGEN ELECTRODE',
        sku: product.sku || 'SKU: WTE-7018-1-50KG',
        code: product.code || (product.sku ? product.sku.replace('SKU: ', '') : 'WTE-7018-1-50KG'),
        category: product.category || 'Product Enquiry',
        image: product.image || productLh7018,
        rawProduct: product.rawProduct || product,
      });
    }

    setEnquiryKey((k) => k + 1);
    setCurrentPage('send-enquiry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewProductDetails = (product) => {
    console.log('View product details:', product);
    setShowSuccessModal(false);
    setDetailProduct(product);
    setCurrentPage('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (query) => {
    setShowSuccessModal(false);
    setSearchQuery(query || 'Electrodes');
    setCurrentPage('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreProducts = () => {
    setShowSuccessModal(false);
    setActiveCatalogFilters(null);
    setActiveCategory('');
    setCurrentPage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchCatalog = (filters) => {
    console.log('Catalog discovery filters:', filters);
    setShowSuccessModal(false);
    setActiveCatalogFilters(filters);
    setActiveCategory('');
    setCurrentPage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewSpecs = (lineName, categorySlug) => {
    console.log('Viewing specs for:', lineName, categorySlug);
    setShowSuccessModal(false);
    setActiveCatalogFilters(null);
    setActiveCategory(lineName);
    setCurrentPage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadCatalog = (catalog) => {
    setShowSuccessModal(false);
    if (catalog?.fileUrl) {
      alert(`Initiating download for: ${catalog.title || 'Technical Product Catalog'}\nFormat: ${catalog.fileType || 'PDF'} (${catalog.fileSize || '4.8 MB'})`);
    } else {
      setCurrentPage('search');
      setSearchTab('downloads');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavClick = (sectionId) => {
    setShowSuccessModal(false);
    if (sectionId === 'home') {
      setCurrentPage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'products') {
      setActiveCatalogFilters(null);
      setActiveCategory('');
      setCurrentPage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'about') {
      setCurrentPage('about');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'company') {
      setCurrentPage('company');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'resources') {
      setCurrentPage('resources');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'contact') {
      setCurrentPage('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar: identical across entire website */}
      <Navbar
        currentSection={
          currentPage === 'home'
            ? 'home'
            : currentPage === 'about'
              ? 'about'
              : (currentPage === 'company' || currentPage === 'solutions' || currentPage === 'submit-requirements')
                ? 'company'
                : currentPage === 'resources'
                  ? 'resources'
                  : (currentPage === 'contact' || currentPage === 'become-dealer')
                    ? 'contact'
                    : (currentPage === 'products' || currentPage === 'product-details' || currentPage === 'send-enquiry' || currentPage === 'search')
                      ? 'products'
                      : ''
        }
        setCurrentSection={handleNavClick}
        onSendEnquiry={handleSendEnquiry}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main Page Content */}
      <main className="content-container">
        {currentPage === 'home' ? (
          <>
            <HeroSection
              onExploreProducts={handleExploreProducts}
              onSendEnquiry={handleSendEnquiry}
              onSearchCatalog={handleSearchCatalog}
            />
            <ProductLinesSection
              onViewSpecs={handleViewSpecs}
              onDownloadCatalog={handleDownloadCatalog}
            />
          </>
        ) : currentPage === 'products' ? (
          <ProductCataloguePage
            initialFilters={activeCatalogFilters}
            selectedCategory={activeCategory}
            onBackToHome={() => {
              setActiveCatalogFilters(null);
              setActiveCategory('');
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSendEnquiry={handleSendEnquiry}
            onViewProductDetails={handleViewProductDetails}
          />
        ) : currentPage === 'product-details' ? (
          <ProductDetailsPage
            selectedProduct={detailProduct}
            onBackToCatalogue={() => {
              setCurrentPage('products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSendEnquiry={handleSendEnquiry}
            onViewProductDetails={handleViewProductDetails}
          />
        ) : currentPage === 'send-enquiry' ? (
          <SendEnquiryPage
            key={enquiryKey}
            selectedProduct={enquiryProduct}
            showSuccessModal={showSuccessModal}
            setShowSuccessModal={setShowSuccessModal}
            onBackToCatalogue={() => {
              setShowSuccessModal(false);
              setCurrentPage('products');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToHome={() => {
              setShowSuccessModal(false);
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToProduct={() => {
              setShowSuccessModal(false);
              setCurrentPage('product-details');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCancel={() => {
              setShowSuccessModal(false);
              setCurrentPage('product-details');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'about' ? (
          <AboutUsPage />
        ) : currentPage === 'company' ? (
          <CompanyPage
            onViewSolutions={(sectorId) => {
              setSelectedIndustrySlug(sectorId);
              setCurrentPage('solutions');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'solutions' ? (
          <SolutionsPage
            industrySlug={selectedIndustrySlug}
            onBackToCompany={() => {
              setCurrentPage('company');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSubmitRequirements={(industry) => {
              setSelectedIndustryForRequirements(industry);
              setCurrentPage('submit-requirements');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewTechnicalDocs={(query) => {
              setTechnicalDocsQuery(query);
              setCurrentPage('resources');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onViewProductDetails={(productSkuOrId) => {
              setDetailProduct(productSkuOrId);
              setCurrentPage('product-details');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'submit-requirements' ? (
          <SubmitProjectRequirementsPage
            industry={selectedIndustryForRequirements}
            onBackToSolutions={() => {
              setCurrentPage('solutions');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToCompany={() => {
              setCurrentPage('company');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'resources' ? (
          <ResourcesPage
            initialSearch={technicalDocsQuery}
            onClearInitialSearch={() => setTechnicalDocsQuery('')}
          />
        ) : currentPage === 'contact' ? (
          <ContactPage 
            onApplyDealership={() => {
              setCurrentPage('become-dealer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSubmitEnquiry={(data) => {
              setShowSuccessModal(true);
            }}
          />
        ) : currentPage === 'become-dealer' ? (
          <BecomeDealerPage 
            onBackToContact={() => {
              setCurrentPage('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSubmitDealerEnquiry={(data) => {
              setShowSuccessModal(true);
            }}
          />
        ) : currentPage === 'privacy' ? (
          <PrivacyPolicyPage
            onBack={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'terms' ? (
          <TermsAndConditionsPage
            onBack={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'faq' ? (
          <FaqPage
            onNavigateToContact={() => {
              setCurrentPage('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'sitemap' ? (
          <SitemapPage
            onNavigate={(page, linkData) => {
              if (linkData?.category) {
                setActiveCategory(linkData.category);
              }
              if (linkData?.industry) {
                setSelectedIndustrySlug(linkData.industry);
              }
              if (linkData?.type) {
                setTechnicalDocsQuery(linkData.type);
              }
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'iso' ? (
          <IsoCertificationsPage
            onNavigateToContact={() => {
              setCurrentPage('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'careers' ? (
          <ComingSoonPage
            pageName="Careers"
            onBack={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToContact={() => {
              setCurrentPage('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentPage === 'blog' ? (
          <ComingSoonPage
            pageName="Blog"
            onBack={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToContact={() => {
              setCurrentPage('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <SearchProductsPage 
            initialQuery={searchQuery}
            initialTab={searchTab}
            onTabChange={(tab) => setSearchTab(tab)}
            onBackToHome={() => {
              setCurrentPage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSendEnquiry={handleSendEnquiry}
            onViewProductDetails={handleViewProductDetails}
          />
        )}
      </main>

      {/* Footer: identical across entire website */}
      <FooterSection
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
