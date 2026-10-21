import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import './TrademarksCopyrightPage.css';

export default function TrademarksCopyrightPage({ onBack }) {
  const [activeSection, setActiveSection] = useState('01');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(`tm-section-${id}`);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const documentContents = [
    { id: '01', title: '01. Trademark Ownership' },
    { id: '02', title: '02. Permitted & Fair Use' },
    { id: '03', title: '03. Prohibited Trademark Uses' },
    { id: '04', title: '04. Copyright & Documentation' },
    { id: '05', title: '05. Third-Party Trademarks' },
    { id: '06', title: '06. DMCA & Infringement Claims' },
    { id: '07', title: '07. Legal Contact & Enforcement' },
  ];

  return (
    <div className="tm-page-wrapper">
      {/* 1. Top Breadcrumb Bar */}
      <div className="tm-top-bar">
        <div className="tm-container">
          <div className="tm-breadcrumbs">
            <button
              type="button"
              className="tm-back-btn"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft size={14} strokeWidth={2.4} />
              <span>Back</span>
            </button>
            <span className="tm-breadcrumb-sep">/</span>
            <span className="tm-breadcrumb-title">Trademarks &amp; Copyright</span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Content Layout */}
      <div className="tm-container">
        <div className="tm-content-grid">
          {/* Left Column: Document Contents (Sticky Navigation) */}
          <aside className="tm-sidebar">
            <div className="tm-sidebar-title">DOCUMENT CONTENTS</div>
            <nav className="tm-nav" aria-label="Document Contents">
              {documentContents.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`tm-nav-link ${activeSection === item.id ? 'active' : ''}`}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Column: Main Terms Document */}
          <article className="tm-document-card">
            {/* Header Title Block */}
            <header className="tm-header-block">
              <h1 className="tm-main-title">TRADEMARKS &amp; COPYRIGHT POLICY</h1>
              <div className="tm-meta-text">
                Document ID: TM-CR-2024-SPX &nbsp;|&nbsp; Last Revised: October 2024
              </div>
              <div className="tm-title-divider" />
            </header>

            {/* Section 01 */}
            <section id="tm-section-01" className="tm-section">
              <h2 className="tm-section-heading">
                <span className="tm-num">01.</span> Trademark Ownership &amp; Brand Assets
              </h2>
              <div className="tm-section-divider" />
              <div className="tm-section-body">
                <p>
                  All trademarks, service marks, trade names, trade dress, product nomenclature, and logos displayed on this website or in related technical literature—including but not limited to <strong>SPRIMAX&reg;</strong>, <strong>WELD-TECH INDUSTRIAL&trade;</strong>, and proprietary product identifiers—are the registered and unregistered intellectual property of Sprimax Industrial Holdings and its affiliates.
                </p>
                <div className="tm-mono-box">
                  <p>&bull; SPRIMAX&reg; and associated industrial emblems are protected under international trademark treaties.</p>
                  <p>&bull; The distinctive trade dress, catalog schematics, and blue/orange visual branding are exclusive properties.</p>
                  <p>&bull; No grant of license or right to use any trademark is conveyed without express prior written consent.</p>
                </div>
              </div>
            </section>

            {/* Section 02 */}
            <section id="tm-section-02" className="tm-section">
              <h2 className="tm-section-heading">
                <span className="tm-num">02.</span> Permitted &amp; Authorized Use
              </h2>
              <div className="tm-section-divider" />
              <div className="tm-section-body">
                <p>
                  Authorized distributors, licensed fabrication contractors, and institutional procurement partners may reference our brand names under strictly defined parameters:
                </p>
                <ul className="tm-bullet-list">
                  <li>
                    <strong>Commercial Resale:</strong> Official distributors may utilize official product marks solely to identify authentic, unaltered Sprimax consumables and welding wires.
                  </li>
                  <li>
                    <strong>Engineering Specifications:</strong> Specifying engineers may reference AWS classifications and Sprimax trade names in project tenders and welding procedure specifications (WPS).
                  </li>
                  <li>
                    <strong>Editorial &amp; Academic:</strong> Accurate, non-misleading nominative reference in metallurgical research and technical publications.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 03 */}
            <section id="tm-section-03" className="tm-section">
              <h2 className="tm-section-heading">
                <span className="tm-num">03.</span> Prohibited Trademark Uses
              </h2>
              <div className="tm-section-divider" />
              <div className="tm-section-body">
                <div className="tm-danger-label">
                  ZERO TOLERANCE: COUNTERFEITING &amp; BRAND DILUTION
                </div>
                <p>
                  To protect public safety and structural engineering integrity, any unauthorized use that creates confusion in heavy industrial markets will be prosecuted to the fullest extent of the law:
                </p>
                <div className="tm-highlight-callout">
                  <h3 className="tm-callout-title">Explicitly Forbidden Practices</h3>
                  <p className="tm-callout-text">
                    1. Incorporating &quot;SPRIMAX&quot; or &quot;WELD-TECH&quot; into company names, domain names, social media handles, or counterfeit packaging.<br />
                    2. Altering, recoloring, distorting, or disassembling official vector emblems and compliance seals.<br />
                    3. Selling non-certified or third-party filler metals under Sprimax product codes.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 04 */}
            <section id="tm-section-04" className="tm-section">
              <h2 className="tm-section-heading">
                <span className="tm-num">04.</span> Copyright &amp; Proprietary Documentation
              </h2>
              <div className="tm-section-divider" />
              <div className="tm-section-body">
                <p>
                  All website architecture, textual descriptions, metallurgical whitepapers, Technical Data Sheets (TDS), Safety Data Sheets (SDS), interactive calculators, and original laboratory photography are protected by international copyright laws. &copy; {new Date().getFullYear()} Sprimax Industrial. All rights reserved.
                </p>
                <p>
                  Reproduction, modification, or automated scraping of our technical database without formal written authorization is strictly prohibited.
                </p>
              </div>
            </section>

            {/* Section 05 */}
            <section id="tm-section-05" className="tm-section">
              <h2 className="tm-section-heading">
                <span className="tm-num">05.</span> Third-Party Trademarks &amp; Standards
              </h2>
              <div className="tm-section-divider" />
              <div className="tm-section-body">
                <p>
                  Reference to international standards and classification bodies (including <strong>AWS</strong> &mdash; American Welding Society, <strong>ASME</strong> &mdash; American Society of Mechanical Engineers, <strong>ISO</strong> &mdash; International Organization for Standardization, and <strong>Lloyd&apos;s Register</strong>) is solely descriptive to certify product compliance. All respective copyrights and trademarks remain the property of their respective governing organizations.
                </p>
              </div>
            </section>

            {/* Section 06 */}
            <section id="tm-section-06" className="tm-section">
              <h2 className="tm-section-heading">
                <span className="tm-num">06.</span> DMCA &amp; Infringement Notification
              </h2>
              <div className="tm-section-divider" />
              <div className="tm-section-body">
                <p>
                  If you believe that any material on our technical portal infringes upon your copyright or intellectual property, please transmit a formal notification including proof of ownership, specific URL/document references, and contact coordinates to our designated legal division.
                </p>
              </div>
            </section>

            {/* Section 07 */}
            <section id="tm-section-07" className="tm-section">
              <h2 className="tm-section-heading">
                <span className="tm-num">07.</span> Legal Contact &amp; Brand Enforcement
              </h2>
              <div className="tm-section-divider" />
              <div className="tm-section-body">
                <div className="tm-contact-card">
                  <p>For brand asset usage permissions, distributor licensing, or reporting counterfeit consumables:</p>
                  <p><strong>Legal &amp; IP Division:</strong> <strong>compliance@sprimaxindustrial.com</strong></p>
                  <p><strong>Brand Licensing:</strong> <strong>legal@sprimaxindustrial.com</strong></p>
                  <p><strong>Direct Line:</strong> <strong>+1 (555) 019-8273</strong></p>
                  <p><strong>Headquarters:</strong> <strong>SPRIMAX INDUSTRIAL HQ, Legal Affairs, 400 Heavy Industry Way, Sector 7, TX 78000</strong></p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
