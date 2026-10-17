import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import './TermsAndConditionsPage.css';

export default function TermsAndConditionsPage({ onBack }) {
  const [activeSection, setActiveSection] = useState('01');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(`terms-section-${id}`);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const documentContents = [
    { id: '01', title: '01. Introduction' },
    { id: '02', title: '02. Intellectual Property' },
    { id: '03', title: '03. Conditions of Sale' },
    { id: '04', title: '04. User Obligations' },
    { id: '05', title: '05. Limitation of Liability' },
    { id: '06', title: '06. Indemnification' },
    { id: '07', title: '07. Governing Law' },
    { id: '08', title: '08. Contact Information' },
  ];

  return (
    <div className="terms-page-wrapper">
      {/* 1. Top Breadcrumb Bar */}
      <div className="terms-top-bar">
        <div className="terms-container">
          <div className="terms-breadcrumbs">
            <button
              type="button"
              className="terms-back-btn"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft size={14} strokeWidth={2.4} />
              <span>Back</span>
            </button>
            <span className="terms-breadcrumb-title">Terms and Conditions</span>
          </div>
        </div>
      </div>

      {/* 2. Main Content Layout */}
      <div className="terms-container">
        <div className="terms-content-grid">
          {/* Left Column: Document Contents (Sticky) */}
          <aside className="terms-toc-card">
            <h2 className="terms-toc-title">Document Contents</h2>
            <div className="terms-toc-divider" />
            <nav className="terms-toc-nav" aria-label="Document Contents">
              {documentContents.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`terms-toc-link ${activeSection === item.id ? 'active' : ''}`}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Column: Main Terms Document */}
          <article className="terms-document-card">
            {/* Header Title Block */}
            <header className="terms-header-block">
              <h1 className="terms-main-title">TERMS AND CONDITIONS</h1>
              <div className="terms-meta-text">
                Document ID: TC-2024-SPX &nbsp;|&nbsp; Last Revised: October 24, 2023
              </div>
              <div className="terms-title-divider" />
            </header>

            {/* Section 01 */}
            <section id="terms-section-01" className="terms-section">
              <h2 className="terms-section-heading">
                <span className="terms-num">01.</span> Introduction &amp; Acceptance of Terms
              </h2>
              <div className="terms-section-divider" />
              <div className="terms-section-body">
                <p>
                  Welcome to Sprimax Industrial. These Terms and Conditions govern your access to and use of our industrial products, technical specifications, and procurement platforms. By accessing our resources, you agree to be bound by these terms, establishing a binding B2B agreement.
                </p>
                <p>
                  If you are accessing these resources on behalf of an engineering firm, procurement entity, or other legal organization, you represent and warrant that you possess the authority to bind said entity to these industrial standards.
                </p>
              </div>
            </section>

            {/* Section 02 */}
            <section id="terms-section-02" className="terms-section">
              <h2 className="terms-section-heading">
                <span className="terms-num">02.</span> Intellectual Property Rights
              </h2>
              <div className="terms-section-divider" />
              <div className="terms-section-body">
                <p>
                  All technical drawings, material specifications, CAD models, proprietary schematics, and trademarks provided by Sprimax Industrial remain the exclusive property of Sprimax Industrial. They are protected under international copyright and industrial design laws.
                </p>
                <div className="terms-mono-box">
                  <p>Reproduction of technical data without written authorization is strictly prohibited.</p>
                  <p>Reverse-engineering of provided schematics violates these terms.</p>
                  <p>&quot;Sprimax Industrial&quot; and associated logos are registered trademarks.</p>
                </div>
              </div>
            </section>

            {/* Section 03 */}
            <section id="terms-section-03" className="terms-section">
              <h2 className="terms-section-heading">
                <span className="terms-num">03.</span> Conditions of Sale
              </h2>
              <div className="terms-section-divider" />
              <div className="terms-section-body">
                <p>
                  All transactions conducted through Sprimax Industrial are exclusively Business-to-Business (B2B). Quotes provided via our platform are valid for 30 days unless otherwise specified due to raw material volatility.
                </p>
                <div className="terms-highlight-callout">
                  <h3 className="terms-callout-title">Pricing &amp; Availability</h3>
                  <p className="terms-callout-text">
                    Due to the nature of industrial supply chains, Sprimax Industrial reserves the right to adjust pricing to reflect material costs prior to final order confirmation. Lead times are estimates and subject to manufacturing tolerances.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 04 */}
            <section id="terms-section-04" className="terms-section">
              <h2 className="terms-section-heading">
                <span className="terms-num">04.</span> User Obligations
              </h2>
              <div className="terms-section-divider" />
              <div className="terms-section-body">
                <p>
                  Users of the Sprimax Industrial platform and technical resources must adhere to strict professional conduct. Unauthorized distribution of proprietary load charts, material safety data sheets (MSDS), or engineering calculations is explicitly prohibited.
                </p>
              </div>
            </section>

            {/* Section 05 */}
            <section id="terms-section-05" className="terms-section">
              <h2 className="terms-section-heading">
                <span className="terms-num">05.</span> Limitation of Liability
              </h2>
              <div className="terms-section-divider" />
              <div className="terms-section-body">
                <div className="terms-danger-label">
                  PROFESSIONAL USE ONLY - STRUCTURAL INTEGRITY DISCLAIMER
                </div>
                <p>
                  Our products are intended for integration by certified engineers and licensed contractors. Sprimax Industrial shall not be held liable for any structural failures, operational downtime, or secondary damages resulting from improper installation, misuse, or deviation from our published technical specifications.
                </p>
                <p>
                  In no event shall our aggregate liability exceed the total amount paid by the procuring entity for the specific components in question.
                </p>
              </div>
            </section>

            {/* Section 06 */}
            <section id="terms-section-06" className="terms-section">
              <h2 className="terms-section-heading">
                <span className="terms-num">06.</span> Indemnification
              </h2>
              <div className="terms-section-divider" />
              <div className="terms-section-body">
                <p>
                  You agree to indemnify, defend, and hold harmless Sprimax Industrial, its officers, engineers, and manufacturing partners from any claims, liabilities, damages, and expenses arising from your improper integration of our products or violation of these industrial standards.
                </p>
              </div>
            </section>

            {/* Section 07 */}
            <section id="terms-section-07" className="terms-section">
              <h2 className="terms-section-heading">
                <span className="terms-num">07.</span> Governing Law
              </h2>
              <div className="terms-section-divider" />
              <div className="terms-section-body">
                <p>
                  These terms shall be governed by and construed in accordance with standard commercial law governing industrial manufacturing, without regard to conflict of law principles. Any legal proceedings shall be exclusively venued in the designated industrial jurisdiction.
                </p>
              </div>
            </section>

            {/* Section 08 */}
            <section id="terms-section-08" className="terms-section">
              <h2 className="terms-section-heading">
                <span className="terms-num">08.</span> Contact Information
              </h2>
              <div className="terms-section-divider" />
              <div className="terms-section-body">
                <div className="terms-contact-card">
                  <p>For legal inquiries regarding procurement contracts or intellectual property:</p>
                  <p><strong>Legal Department:</strong> legal@sprimaxindustrial.com</p>
                  <p><strong>Procurement Support:</strong> procurement@sprimaxindustrial.com</p>
                  <p><strong>HQ Phone:</strong> +1 (555) 019-8472</p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
