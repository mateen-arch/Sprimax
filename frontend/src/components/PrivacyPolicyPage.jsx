import React, { useState } from 'react';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import './PrivacyPolicyPage.css';

export default function PrivacyPolicyPage({ onBack }) {
  const [activeSection, setActiveSection] = useState('1');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const tableOfContents = [
    { id: '1', title: '1. Introduction' },
    { id: '2', title: '2. Data We Collect' },
    { id: '3', title: '3. How We Use Your Data' },
    { id: '4', title: '4. Information Sharing' },
    { id: '5', title: '5. Data Security' },
    { id: '6', title: '6. Your Rights' },
    { id: '7', title: '7. Contact Information' },
  ];

  return (
    <div className="privacy-page-wrapper">
      {/* 1. Header / Breadcrumb Bar */}
      <div className="privacy-top-bar">
        <div className="privacy-container">
          <div className="privacy-breadcrumbs">
            <button
              type="button"
              className="privacy-back-btn"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft size={14} strokeWidth={2.4} />
              <span>Back</span>
            </button>
            <span className="privacy-breadcrumb-title">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* 2. Main Container */}
      <div className="privacy-container privacy-main-layout">
        {/* Page Title & Meta Block */}
        <div className="privacy-header-block">
          <h1 className="privacy-main-title">Privacy Policy</h1>
          <div className="privacy-meta-badge">
            <div className="privacy-meta-item">
              <Calendar size={14} className="privacy-meta-icon" />
              <span>Last Updated: October 15, 2024</span>
            </div>
            <span className="privacy-meta-divider" aria-hidden="true">|</span>
            <div className="privacy-meta-item">
              <FileText size={14} className="privacy-meta-icon" />
              <span>Version: 2.1.0</span>
            </div>
          </div>
        </div>

        {/* 2-Column Content Grid: Left Table of Contents, Right Policy Document */}
        <div className="privacy-content-grid">
          {/* Left Sticky Sidebar: Table of Contents */}
          <aside className="privacy-toc-card">
            <h2 className="privacy-toc-title">TABLE OF CONTENTS</h2>
            <div className="privacy-toc-divider" />
            <nav className="privacy-toc-nav" aria-label="Table of contents">
              {tableOfContents.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`privacy-toc-link ${activeSection === item.id ? 'active' : ''}`}
                >
                  {item.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Main Content Card */}
          <article className="privacy-document-card">
            {/* Section 1 */}
            <section id="section-1" className="privacy-section">
              <h2 className="privacy-section-heading">1. Introduction</h2>
              <div className="privacy-section-divider" />
              <div className="privacy-section-body">
                <p>
                  At WELD-TECH INDUSTRIAL (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting the privacy and security of your personal data. This Privacy Policy outlines how we collect, use, process, and protect the information of our B2B clients, procurement officers, site engineers, and distributors when interacting with our digital platforms and industrial services.
                </p>
                <p>
                  By accessing our technical specifications portal, submitting enquiry forms, or utilizing our supply chain infrastructure, you agree to the practices described in this document. We adhere to rigorous data protection standards reflective of our commitment to industrial reliability.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section-2" className="privacy-section">
              <h2 className="privacy-section-heading">2. Data We Collect</h2>
              <div className="privacy-section-divider" />
              <div className="privacy-section-body">
                <p>
                  To facilitate efficient industrial supply and technical support, we collect the following categories of information:
                </p>
                <ul className="privacy-data-list">
                  <li>
                    <strong>Professional Contact Information:</strong> Names, corporate email addresses, business phone numbers, and job titles.
                  </li>
                  <li>
                    <strong>Company Data:</strong> Organization name, billing/shipping addresses, VAT numbers, and corporate structure details pertinent to procurement.
                  </li>
                  <li>
                    <strong>Technical Interaction Data:</strong> Logs of safety data sheets accessed, product specifications downloaded, and IP addresses for security auditing.
                  </li>
                  <li>
                    <strong>Transaction Records:</strong> History of enquiries, purchase orders, and warranty claims related to welding consumables and equipment.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section-3" className="privacy-section">
              <h2 className="privacy-section-heading">3. How We Use Your Data</h2>
              <div className="privacy-section-divider" />
              <div className="privacy-section-body">
                <p>
                  We process your data strictly for legitimate business purposes associated with industrial distribution and support:
                </p>
                <ul className="privacy-simple-list">
                  <li>To process and fulfill orders for welding supplies and heavy machinery.</li>
                  <li>To provide access to restricted technical documentation (e.g., ISO certifications, Material Safety Data Sheets).</li>
                  <li>To communicate critical product safety updates or recalls.</li>
                  <li>To optimize our digital supply chain interfaces and improve user experience on our procurement portal.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section-4" className="privacy-section">
              <h2 className="privacy-section-heading">4. Information Sharing</h2>
              <div className="privacy-section-divider" />
              <div className="privacy-section-body">
                <p>
                  WELD-TECH INDUSTRIAL does not sell your professional data. We only share information with trusted third parties under strict confidentiality agreements:
                </p>
                <ul className="privacy-data-list">
                  <li>
                    <strong>Logistics Partners:</strong> Necessary delivery information shared with freight forwarders to ensure timely arrival of heavy industrial goods.
                  </li>
                  <li>
                    <strong>Compliance Auditors:</strong> Minimal necessary data shared to verify adherence to ISO 9001 and other regulatory standards.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> Disclosures mandated by law enforcement or regulatory bodies regarding industrial safety standards.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section-5" className="privacy-section">
              <h2 className="privacy-section-heading">5. Data Security</h2>
              <div className="privacy-section-divider" />
              <div className="privacy-section-body">
                <p>
                  We implement structural security measures akin to our physical industrial standards:
                </p>
                <ul className="privacy-simple-list">
                  <li>Enterprise-grade encryption for all data in transit and at rest.</li>
                  <li>Strict role-based access control (RBAC) ensuring only authorized technical support or procurement staff access your profile.</li>
                  <li>Regular penetration testing of our B2B portals and enquiry systems.</li>
                </ul>
                <p style={{ marginTop: '1rem' }}>
                  While we strive for maximum security, no digital system is entirely impervious. We maintain rapid-response protocols for any potential data breach incidents.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="section-6" className="privacy-section">
              <h2 className="privacy-section-heading">6. Your Rights</h2>
              <div className="privacy-section-divider" />
              <div className="privacy-section-body">
                <p>
                  In accordance with applicable international data privacy regulations (including GDPR and CCPA where applicable), you possess the right to:
                </p>
                <ul className="privacy-simple-list">
                  <li>Request access to copies of your corporate personal data held on file.</li>
                  <li>Rectify inaccurate or outdated account and billing credentials.</li>
                  <li>Request restriction or deletion of data no longer required for mandatory compliance auditing.</li>
                  <li>Opt-out of non-essential promotional and technical newsletter mailings.</li>
                </ul>
              </div>
            </section>

            {/* Section 7 */}
            <section id="section-7" className="privacy-section">
              <h2 className="privacy-section-heading">7. Contact Information</h2>
              <div className="privacy-section-divider" />
              <div className="privacy-section-body">
                <p>
                  For inquiries regarding technical specifications of this privacy policy, or to exercise your data rights, please contact our Data Protection Officer:
                </p>
                <div className="privacy-contact-box">
                  <div className="privacy-contact-row">
                    <strong>Email:</strong> <span>compliance@weldtech-industrial.com</span>
                  </div>
                  <div className="privacy-contact-row">
                    <strong>Phone:</strong> <span>+1 (555) 019-8273</span>
                  </div>
                  <div className="privacy-contact-row">
                    <strong>Address:</strong> <span>WELD-TECH INDUSTRIAL HQ, 400 Heavy Industry Way, Sector 7, TX 78000</span>
                  </div>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
