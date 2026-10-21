import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import './CookiePolicyPage.css';

export default function CookiePolicyPage({ onBack }) {
  const [activeSection, setActiveSection] = useState('01');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(`cookie-section-${id}`);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const documentContents = [
    { id: '01', title: '01. What Are Cookies?' },
    { id: '02', title: '02. Categories of Cookies' },
    { id: '03', title: '03. How We Use Cookies' },
    { id: '04', title: '04. Third-Party Analytics' },
    { id: '05', title: '05. Managing Your Preferences' },
    { id: '06', title: '06. Policy Revisions' },
    { id: '07', title: '07. Contact & Data Officer' },
  ];

  return (
    <div className="cookie-page-wrapper">
      {/* 1. Top Breadcrumb Bar */}
      <div className="cookie-top-bar">
        <div className="cookie-container">
          <div className="cookie-breadcrumbs">
            <button
              type="button"
              className="cookie-back-btn"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft size={14} strokeWidth={2.4} />
              <span>Back</span>
            </button>
            <span className="cookie-breadcrumb-sep">/</span>
            <span className="cookie-breadcrumb-title">Cookie Policy</span>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Content Layout */}
      <div className="cookie-container">
        <div className="cookie-content-grid">
          {/* Left Column: Document Contents (Sticky Navigation) */}
          <aside className="cookie-sidebar">
            <div className="cookie-sidebar-title">DOCUMENT CONTENTS</div>
            <nav className="cookie-nav" aria-label="Document Contents">
              {documentContents.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`cookie-nav-link ${activeSection === item.id ? 'active' : ''}`}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Column: Main Document Card */}
          <article className="cookie-document-card">
            {/* Header Title Block */}
            <header className="cookie-header-block">
              <h1 className="cookie-main-title">COOKIE POLICY</h1>
              <div className="cookie-meta-text">
                Document ID: CK-2024-SPX &nbsp;|&nbsp; Last Revised: October 2024
              </div>
              <div className="cookie-title-divider" />
            </header>

            {/* Section 01 */}
            <section id="cookie-section-01" className="cookie-section">
              <h2 className="cookie-section-heading">
                <span className="cookie-num">01.</span> What Are Cookies?
              </h2>
              <div className="cookie-section-divider" />
              <div className="cookie-section-body">
                <p>
                  Cookies are compact alphanumeric text files stored on your computer, tablet, or mobile device when you visit industrial portals operated by Sprimax Industrial Holdings (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). They enable our servers to recognize your browser, persist session states, and preserve customized technical preferences across our catalog.
                </p>
                <p>
                  Cookies do not compromise your device security or extract unauthorized personal data. Instead, they provide the essential architectural infrastructure necessary for high-volume B2B catalog browsing and specification downloads.
                </p>
              </div>
            </section>

            {/* Section 02 */}
            <section id="cookie-section-02" className="cookie-section">
              <h2 className="cookie-section-heading">
                <span className="cookie-num">02.</span> Categories of Cookies We Deploy
              </h2>
              <div className="cookie-section-divider" />
              <div className="cookie-section-body">
                <p>
                  We utilize distinct categories of cookies engineered for industrial web operations:
                </p>
                <div className="cookie-category-box">
                  <h3 className="cookie-box-title">Strictly Necessary Cookies</h3>
                  <p>
                    Essential for portal navigation, secure authentication, and access to protected engineering documentation (e.g., ISO certificates and batch test dossiers). These cookies cannot be disabled without compromising fundamental site operations.
                  </p>
                </div>
                <div className="cookie-category-box">
                  <h3 className="cookie-box-title">Performance &amp; Diagnostic Cookies</h3>
                  <p>
                    Collect aggregated, anonymized telemetry regarding page load times, bandwidth bottlenecks, and interactive tool utilization (such as welding wire deposition calculators).
                  </p>
                </div>
                <div className="cookie-category-box">
                  <h3 className="cookie-box-title">Functional &amp; Preference Cookies</h3>
                  <p>
                    Retain your regional preferences, preferred measurement units (Metric vs. Imperial), and distributor enquiry form drafts so you do not have to re-enter technical criteria.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 03 */}
            <section id="cookie-section-03" className="cookie-section">
              <h2 className="cookie-section-heading">
                <span className="cookie-num">03.</span> How We Use Cookies
              </h2>
              <div className="cookie-section-divider" />
              <div className="cookie-section-body">
                <p>
                  Our use of cookie technology is strictly confined to professional and industrial objectives:
                </p>
                <ul className="cookie-bullet-list">
                  <li><strong>Session Security:</strong> Verifying authenticated distributor and engineer profiles to prevent unauthorized access.</li>
                  <li><strong>Technical Optimization:</strong> Ensuring that high-resolution metallurgical schematics and PDF spec sheets load rapidly.</li>
                  <li><strong>Form Integrity:</strong> Protecting Request for Quotation (RFQ) and dealer application submissions from automated bot spam.</li>
                </ul>
              </div>
            </section>

            {/* Section 04 */}
            <section id="cookie-section-04" className="cookie-section">
              <h2 className="cookie-section-heading">
                <span className="cookie-num">04.</span> Third-Party Analytics &amp; Infrastructure
              </h2>
              <div className="cookie-section-divider" />
              <div className="cookie-section-body">
                <p>
                  In selective instances, we deploy trusted enterprise diagnostics partners to evaluate network reliability and global latency. These service providers process data under rigorous enterprise data protection contracts and are prohibited from utilizing information for independent behavioral advertising.
                </p>
              </div>
            </section>

            {/* Section 05 */}
            <section id="cookie-section-05" className="cookie-section">
              <h2 className="cookie-section-heading">
                <span className="cookie-num">05.</span> Managing &amp; Disabling Cookies
              </h2>
              <div className="cookie-section-divider" />
              <div className="cookie-section-body">
                <p>
                  You maintain comprehensive sovereignty over your cookie settings. You can modify your browser preferences to reject or delete cookies at any time:
                </p>
                <div className="cookie-mono-box">
                  <p>&bull; <strong>Google Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data</p>
                  <p>&bull; <strong>Mozilla Firefox:</strong> Options &gt; Privacy &amp; Security &gt; Enhanced Tracking Protection</p>
                  <p>&bull; <strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions</p>
                  <p>&bull; <strong>Apple Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</p>
                </div>
                <p>
                  <em>Note: Disabling strictly necessary cookies may restrict access to certain interactive catalog tools and technical download facilities.</em>
                </p>
              </div>
            </section>

            {/* Section 06 */}
            <section id="cookie-section-06" className="cookie-section">
              <h2 className="cookie-section-heading">
                <span className="cookie-num">06.</span> Policy Revisions
              </h2>
              <div className="cookie-section-divider" />
              <div className="cookie-section-body">
                <p>
                  We may periodically revise this Cookie Policy to reflect changes in regulatory standards or industrial platform features. Any modifications will be denoted by an updated &quot;Last Revised&quot; timestamp at the pinnacle of this document.
                </p>
              </div>
            </section>

            {/* Section 07 */}
            <section id="cookie-section-07" className="cookie-section">
              <h2 className="cookie-section-heading">
                <span className="cookie-num">07.</span> Contact Us &amp; Privacy Officer
              </h2>
              <div className="cookie-section-divider" />
              <div className="cookie-section-body">
                <div className="cookie-contact-card">
                  <p>For questions or requests concerning our technical cookie policies:</p>
                  <p><strong>Data Privacy Office:</strong> <strong>privacy@sprimaxindustrial.com</strong></p>
                  <p><strong>Technical Compliance:</strong> <strong>compliance@sprimaxindustrial.com</strong></p>
                  <p><strong>Headquarters Phone:</strong> <strong>+1 (555) 019-8273</strong></p>
                  <p><strong>Corporate Address:</strong> <strong>SPRIMAX INDUSTRIAL HQ, Data Governance Unit, 400 Heavy Industry Way, Sector 7, TX 78000</strong></p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
