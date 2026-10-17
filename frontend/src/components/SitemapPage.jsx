import React from 'react';
import {
  Package,
  Layers,
  FileText,
  Building2,
  PhoneCall,
  Shield,
  ChevronRight,
} from 'lucide-react';
import './SitemapPage.css';

export default function SitemapPage({ onNavigate }) {
  // Only real, existing pages and sectors present in Sprimax website
  const sitemapSections = [
    {
      id: 'products',
      title: 'Products',
      icon: <Package size={18} className="sitemap-card-icon" />,
      links: [
        { label: 'Stick Electrodes (SMAW)', page: 'products', category: 'Stick Electrodes (SMAW)' },
        { label: 'MIG/MAG Wires (GMAW)', page: 'products', category: 'Solid Wires (GMAW)' },
        { label: 'TIG Rods (GTAW)', page: 'products', category: 'TIG Rods (GTAW)' },
        { label: 'Flux Cored Wires (FCAW)', page: 'products', category: 'Flux Cored Wires (FCAW)' },
        { label: 'Submerged Arc (SAW)', page: 'products', category: 'Submerged Arc Wires & Flux' },
        { label: 'Welding Accessories', page: 'products', category: 'Welding Accessories & PPE' },
      ],
    },
    {
      id: 'industries',
      title: 'Industries',
      icon: <Layers size={18} className="sitemap-card-icon" />,
      links: [
        { label: 'Oil & Gas Pipeline', page: 'solutions', industry: 'oil-gas' },
        { label: 'Shipbuilding & Offshore', page: 'solutions', industry: 'shipbuilding' },
        { label: 'Heavy Structural', page: 'solutions', industry: 'heavy-engineering' },
        { label: 'Automotive Manufacturing', page: 'solutions', industry: 'automotive' },
        { label: 'Power Generation', page: 'solutions', industry: 'power-plants' },
      ],
    },
    {
      id: 'resources',
      title: 'Resources',
      icon: <FileText size={18} className="sitemap-card-icon" />,
      links: [
        { label: 'Safety Data Sheets (SDS)', page: 'resources', type: 'sds' },
        { label: 'Technical Data Sheets', page: 'resources', type: 'tds' },
        { label: 'Product Catalogs (PDF)', page: 'resources', type: 'catalog' },
        { label: 'ISO Certifications', page: 'resources', type: 'cert' },
        { label: 'FAQ', page: 'faq' },
      ],
    },
    {
      id: 'company',
      title: 'Company',
      icon: <Building2 size={18} className="sitemap-card-icon" />,
      links: [
        { label: 'About Sprimax', page: 'about' },
        { label: 'Company Overview & Sectors', page: 'company' },
        { label: 'Custom Project Requirements', page: 'submit-requirements' },
      ],
    },
    {
      id: 'contact',
      title: 'Contact & Support',
      icon: <PhoneCall size={18} className="sitemap-card-icon" />,
      links: [
        { label: 'Contact Us & Head Office', page: 'contact' },
        { label: 'Technical Support Team', page: 'contact' },
        { label: 'Become a Dealer / Partner', page: 'become-dealer' },
        { label: 'Send an Enquiry / RFQ', page: 'send-enquiry' },
      ],
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: <Shield size={18} className="sitemap-card-icon" />,
      links: [
        { label: 'Privacy Policy', page: 'privacy' },
        { label: 'Terms of Service', page: 'terms' },
      ],
    },
  ];

  const handleLinkClick = (e, item) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(item.page, item);
    }
  };

  return (
    <div className="sitemap-page-wrapper">
      <div className="sitemap-container">
        {/* Header */}
        <header className="sitemap-header-block">
          <h1 className="sitemap-main-title">Sitemap</h1>
          <p className="sitemap-subtitle">
            Navigate through our comprehensive catalog of products, technical resources, and corporate information.
          </p>
          <div className="sitemap-header-divider" />
        </header>

        {/* 6-Card Grid */}
        <div className="sitemap-grid">
          {sitemapSections.map((section) => (
            <div key={section.id} className="sitemap-card">
              <div className="sitemap-card-header">
                {section.icon}
                <h2 className="sitemap-card-title">{section.title}</h2>
              </div>
              <div className="sitemap-card-divider" />
              <ul className="sitemap-links-list">
                {section.links.map((link, idx) => (
                  <li key={idx} className="sitemap-link-item">
                    <a
                      href={`#${link.page}`}
                      onClick={(e) => handleLinkClick(e, link)}
                      className="sitemap-anchor-link"
                    >
                      <span className="sitemap-chevron">&#8250;</span>
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
