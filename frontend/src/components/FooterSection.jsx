import React from 'react';
import logoWhite from '../assets/logo-white.png';

export default function FooterSection({ onNavigate }) {
  const technicalResources = [
    { label: 'Careers', href: '#careers', page: 'careers' },
    { label: 'Sitemap', href: '#sitemap', page: 'sitemap' },
    { label: 'ISO Certifications', href: '#iso', page: 'iso' },
    { label: 'Blog', href: '#blog', page: 'blog' },
  ];

  const corporateLinks = [
    { label: 'Contact Technical Support', href: '#support', page: 'contact' },
    { label: 'Privacy Policy', href: '#privacy', page: 'privacy' },
    { label: 'Terms of Service', href: '#terms', page: 'terms' },
    { label: 'FAQ', href: '#faq', page: 'faq' },
  ];

  const handleLinkClick = (e, item) => {
    if (item.page) {
      e.preventDefault();
      if (onNavigate) {
        onNavigate(item.page);
      } else {
        window.location.hash = `#${item.page}`;
      }
    }
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-container">
        {/* Left Column: Brand, Description, Copyright */}
        <div className="footer-brand-col">
          <div className="footer-logo-wrap">
            <img 
              src={logoWhite} 
              alt="SPRIMAX Logo" 
              className="footer-logo-img" 
            />
          </div>

          <p className="footer-tagline body-md">
            Engineered precision for heavy industrial applications. Partnering with global manufacturing leaders.
          </p>

          <div className="footer-copyright data-tabular">
            &copy; 2026 SPRIMAX. ALL RIGHTS RESERVED.
          </div>
        </div>

        {/* Middle Column: Technical Resources */}
        <div className="footer-nav-col">
          <div className="footer-col-header">
            <span className="footer-col-title">TECHNICAL RESOURCES</span>
            <div className="footer-col-divider" />
          </div>

          <ul className="footer-links-list">
            {technicalResources.map((item) => (
              <li key={item.label} className="footer-link-item">
                <a
                  href={item.href}
                  className="footer-nav-link body-md"
                  onClick={(e) => handleLinkClick(e, item)}
                >
                  <span className="footer-link-chevron">&#8250;</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Corporate */}
        <div className="footer-nav-col">
          <div className="footer-col-header">
            <span className="footer-col-title">CORPORATE</span>
            <div className="footer-col-divider" />
          </div>

          <ul className="footer-links-list">
            {corporateLinks.map((item) => (
              <li key={item.label} className="footer-link-item">
                <a
                  href={item.href}
                  className="footer-nav-link body-md"
                  onClick={(e) => handleLinkClick(e, item)}
                >
                  <span className="footer-link-chevron">&#8250;</span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
