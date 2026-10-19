import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageSquare, ExternalLink, ChevronDown, Award, CheckCircle2, Clock } from 'lucide-react';
import { submitEnquiry } from '../api/enquiries.js';

export default function ContactPage({ onApplyDealership, onSubmitEnquiry }) {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    corporateEmail: '',
    phoneNumber: '',
    enquirySubject: 'Product Specifications / Data Sheets',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.companyName.trim() || !formData.corporateEmail.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in all required fields marked with *');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const res = await submitEnquiry({
        fullName: formData.fullName.trim(),
        contactName: formData.fullName.trim(),
        companyName: formData.companyName.trim(),
        corporateEmail: formData.corporateEmail.trim(),
        email: formData.corporateEmail.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        phone: formData.phoneNumber.trim(),
        enquirySubject: formData.enquirySubject,
        subject: formData.enquirySubject,
        message: formData.message.trim(),
        enquiryType: 'Technical Support',
      });

      const enqData = res.data || res;
      setSubmittedResult(enqData);
      if (onSubmitEnquiry) {
        onSubmitEnquiry(enqData);
      }
    } catch (err) {
      console.error('Failed to submit technical enquiry:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to submit technical enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-container">
        {/* Page Header */}
        <header className="contact-header">
          <h1 className="contact-title headline-lg">Technical Support &amp; Enquiries</h1>
          <p className="contact-subtitle body-md">
            Direct access to our engineering team, procurement specialists, and global distribution network.
          </p>
        </header>

        {/* 2-Column Main Layout */}
        <div className="contact-main-grid">
          {/* Left Column: HQ, Dealer Network, and Map */}
          <div className="contact-info-col">
            {/* Card 1: Global Headquarters */}
            <div className="contact-card contact-hq-card">
              <div className="contact-hq-top-accent" aria-hidden="true" />
              <h2 className="contact-card-title headline-sm">Global Headquarters</h2>

              <div className="contact-hq-list">
                {/* Headquarters Address */}
                <div className="contact-hq-item">
                  <div className="contact-hq-icon-box" aria-hidden="true">
                    <MapPin size={17} strokeWidth={2} />
                  </div>
                  <div className="contact-hq-text">
                    <span className="contact-hq-label data-tabular">HEADQUARTERS</span>
                    <p className="contact-hq-val">
                      5th Floor, 511 National Corporate Park,<br />
                      Geeta Nagar, Choubey Colony,<br />
                      Raipur, Chhattisgarh 492001, India
                    </p>
                  </div>
                </div>

                {/* Direct Contact Phone Lines */}
                <div className="contact-hq-item">
                  <div className="contact-hq-icon-box" aria-hidden="true">
                    <Phone size={17} strokeWidth={2} />
                  </div>
                  <div className="contact-hq-text">
                    <span className="contact-hq-label data-tabular">CONTACT NUMBERS</span>
                    <p className="contact-hq-val data-tabular font-bold">
                      <a href="tel:9039072804" style={{ color: 'inherit', textDecoration: 'none' }}>9039072804</a><br />
                      <a href="tel:9039072802" style={{ color: 'inherit', textDecoration: 'none' }}>9039072802</a>
                    </p>
                  </div>
                </div>

                {/* Official Email */}
                <div className="contact-hq-item">
                  <div className="contact-hq-icon-box" aria-hidden="true">
                    <Mail size={17} strokeWidth={2} />
                  </div>
                  <div className="contact-hq-text">
                    <span className="contact-hq-label data-tabular">OFFICIAL EMAIL</span>
                    <p className="contact-hq-val data-tabular font-mono">
                      <a href="mailto:sprimaxindia@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>sprimaxindia@gmail.com</a>
                    </p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="contact-hq-item">
                  <div className="contact-hq-icon-box" aria-hidden="true">
                    <Clock size={17} strokeWidth={2} />
                  </div>
                  <div className="contact-hq-text">
                    <span className="contact-hq-label data-tabular">WORKING HOURS</span>
                    <p className="contact-hq-val data-tabular">
                      Mon - Sat : 10:00 AM - 06:30 PM (IST)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Dealer Network */}
            <div className="contact-card contact-dealer-card">
              <div className="contact-dealer-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-handshake-icon">
                  <path d="M11 17l-1.5-1.5a3 3 0 0 1 0-4.24l2-2a3 3 0 0 1 4.24 0l1.5 1.5" />
                  <path d="M13 7l1.5 1.5a3 3 0 0 1 0 4.24l-2 2a3 3 0 0 1-4.24 0L7 13.24" />
                  <rect x="2" y="2" width="20" height="20" rx="3" strokeWidth="1.5" />
                </svg>
              </div>

              <h2 className="contact-dealer-title headline-sm">Dealer Network</h2>
              <p className="contact-dealer-desc body-sm">
                Interested in becoming a certified distributor of Sprimax consumables?
              </p>

              <button
                type="button"
                className="contact-apply-dealer-btn data-tabular"
                onClick={onApplyDealership}
              >
                APPLY FOR DEALERSHIP
              </button>
            </div>

            {/* Card 3: Interactive Blueprint / Map Card */}
            <div className="contact-card contact-map-card">
              <div className="contact-map-img-frame">
                <iframe
                  title="Sprimax India Headquarters Location"
                  src="https://maps.google.com/maps?q=National+Corporate+Park,+Choubey+Colony,+Raipur,+Chhattisgarh+492001&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="contact-map-iframe"
                  loading="lazy"
                  allowFullScreen
                />
                
                {/* Coordinates Tag Badge */}
                <div className="contact-map-coord-badge data-tabular">
                  <span>511 NATIONAL CORPORATE PARK // RAIPUR</span>
                </div>

                {/* Map Overlay Button */}
                <a
                  href="https://share.google/paKXw2Ii3fTXxrOos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-view-map-btn data-tabular"
                >
                  <span>VIEW ON GOOGLE MAPS</span>
                  <ExternalLink size={12} strokeWidth={2.4} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Submit an Enquiry Form */}
          <div className="contact-form-col">
            <div className="contact-card contact-form-card">
              <div className="contact-form-header">
                <h2 className="contact-form-title headline-sm">Submit an Enquiry</h2>
                <p className="contact-form-subtitle body-sm">
                  Please provide detailed specifications for accurate technical assessment.
                </p>
              </div>

              <div className="contact-form-divider" aria-hidden="true" />

              {submittedResult ? (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255, 8, 4, 0.1)', color: '#ff0804', marginBottom: '16px' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="headline-sm" style={{ fontSize: '20px', color: '#000417', marginBottom: '8px' }}>
                    Transmission Confirmed
                  </h3>
                  <p className="body-sm" style={{ color: '#555e68', maxWidth: '420px', margin: '0 auto 16px' }}>
                    Your technical inquiry has been routed to our metallurgical engineering department. A specialist will review your specifications.
                  </p>
                  <div style={{ background: '#f4f6f8', border: '1px solid #e2e8f0', padding: '12px 18px', display: 'inline-block', borderRadius: '4px', marginBottom: '24px' }}>
                    <span className="data-tabular" style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase', display: 'block' }}>REFERENCE CODE</span>
                    <span className="data-tabular font-bold" style={{ fontSize: '16px', color: '#000417' }}>
                      {submittedResult.referenceCode || submittedResult.refId || 'ENQ-TEC-CONFIRMED'}
                    </span>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="contact-submit-btn data-tabular"
                      style={{ margin: '0 auto' }}
                      onClick={() => {
                        setSubmittedResult(null);
                        setFormData({
                          fullName: '',
                          companyName: '',
                          corporateEmail: '',
                          phoneNumber: '',
                          enquirySubject: 'Product Specifications / Data Sheets',
                          message: ''
                        });
                      }}
                    >
                      SUBMIT ANOTHER INQUIRY
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-enquiry-form">
                  {errorMessage && (
                    <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px' }}>
                      {errorMessage}
                    </div>
                  )}
                  {/* Row 1: Full Name & Company Name */}
                  <div className="contact-form-row">
                    <div className="contact-input-group">
                      <label className="contact-label data-tabular">FULL NAME *</label>
                      <input
                        type="text"
                        name="fullName"
                        className="contact-input"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="contact-input-group">
                      <label className="contact-label data-tabular">COMPANY NAME *</label>
                      <input
                        type="text"
                        name="companyName"
                        className="contact-input"
                        placeholder="Heavy Industries Inc."
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Corporate Email & Phone Number */}
                  <div className="contact-form-row">
                    <div className="contact-input-group">
                      <label className="contact-label data-tabular">CORPORATE EMAIL *</label>
                      <input
                        type="email"
                        name="corporateEmail"
                        className="contact-input"
                        placeholder="john@company.com"
                        value={formData.corporateEmail}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="contact-input-group">
                      <label className="contact-label data-tabular">PHONE NUMBER</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        className="contact-input"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Row 3: Enquiry Subject */}
                  <div className="contact-input-group contact-full-width">
                    <label className="contact-label data-tabular">ENQUIRY SUBJECT *</label>
                    <div className="contact-select-wrap">
                      <select
                        name="enquirySubject"
                        className="contact-select"
                        value={formData.enquirySubject}
                        onChange={handleChange}
                      >
                        <option value="Product Specifications / Data Sheets">Product Specifications / Data Sheets</option>
                        <option value="Commercial Pricing & Quotation">Commercial Pricing &amp; Quotation</option>
                        <option value="Metallurgical Engineering Support">Metallurgical Engineering Support</option>
                        <option value="Custom Packaging & Delivery Logistics">Custom Packaging &amp; Delivery Logistics</option>
                      </select>
                      <ChevronDown size={16} className="contact-select-chevron" />
                    </div>
                  </div>

                  {/* Row 4: Message / Technical Requirements */}
                  <div className="contact-input-group contact-full-width">
                    <label className="contact-label data-tabular">MESSAGE / TECHNICAL REQUIREMENTS *</label>
                    <textarea
                      name="message"
                      rows="6"
                      className="contact-textarea"
                      placeholder="Detail your project requirements, material specifications, or technical questions here..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-form-divider" aria-hidden="true" />

                  {/* Submit Action */}
                  <div className="contact-form-actions">
                    <button type="submit" disabled={submitting} className="contact-submit-btn data-tabular">
                      {submitting ? 'TRANSMITTING...' : 'SUBMIT TRANSMISSION'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
