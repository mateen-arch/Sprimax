import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Gauge, ChevronDown, CheckCircle2 } from 'lucide-react';
import { submitEnquiry } from '../api/enquiries.js';

export default function BecomeDealerPage({ onBackToContact, onSubmitDealerEnquiry }) {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    businessType: '',
    primaryLocation: '',
    currentProductRange: '',
    yearsInBusiness: '6-10',
    additionalMessage: ''
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
    if (!formData.fullName.trim() || !formData.companyName.trim() || !formData.businessType) {
      setErrorMessage('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const res = await submitEnquiry({
        fullName: formData.fullName.trim(),
        contactName: formData.fullName.trim(),
        companyName: formData.companyName.trim(),
        email: formData.email.trim() || `${formData.fullName.toLowerCase().replace(/\s+/g, '')}@${formData.companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: formData.phone.trim(),
        businessType: formData.businessType,
        primaryLocation: formData.primaryLocation,
        currentProductRange: formData.currentProductRange,
        yearsInBusiness: formData.yearsInBusiness,
        message: formData.additionalMessage || `Dealer application from ${formData.companyName} (${formData.businessType})`,
        additionalMessage: formData.additionalMessage,
        enquiryType: 'Dealer Enquiry',
      });

      const data = res.data || res;
      setSubmittedResult(data);
      if (onSubmitDealerEnquiry) {
        onSubmitDealerEnquiry(data);
      }
    } catch (err) {
      console.error('Failed to submit dealer enquiry:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to submit dealer application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dealer-page-wrapper">
      <div className="dealer-container">
        {/* Top Breadcrumb Nav */}
        <div className="dealer-nav-bar">
          <button 
            type="button" 
            className="dealer-back-btn data-tabular" 
            onClick={onBackToContact}
            aria-label="Back to Contact"
          >
            <ArrowLeft size={15} strokeWidth={2.4} />
            <span>Back to Contact</span>
          </button>
        </div>

        {/* 2-Column Main Layout */}
        <div className="dealer-main-grid">
          {/* Left Column: Title, Subtitle, and Feature Cards */}
          <div className="dealer-info-col">
            <h1 className="dealer-title headline-lg">Become a Distributor</h1>
            <p className="dealer-subtitle body-md">
              Join the WELD-TECH global network. We are seeking experienced industrial distributors to partner with us in delivering high-performance welding consumables to the heavy industry sector.
            </p>

            <div className="dealer-features-list">
              {/* Feature 1: Premium Product Access */}
              <div className="dealer-feature-card">
                <div className="dealer-feature-icon-box" aria-hidden="true">
                  <ShieldCheck size={20} strokeWidth={2.2} />
                </div>
                <div className="dealer-feature-body">
                  <h3 className="dealer-feature-title headline-sm">Premium Product Access</h3>
                  <p className="dealer-feature-desc body-sm">
                    Exclusive access to our full catalog of certified structural welding materials.
                  </p>
                </div>
              </div>

              {/* Feature 2: Technical Support */}
              <div className="dealer-feature-card">
                <div className="dealer-feature-icon-box" aria-hidden="true">
                  <Gauge size={20} strokeWidth={2.2} />
                </div>
                <div className="dealer-feature-body">
                  <h3 className="dealer-feature-title headline-sm">Technical Support</h3>
                  <p className="dealer-feature-desc body-sm">
                    Direct line to our engineering team for complex application queries.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Bracket Framed Dealer Enquiry Form */}
          <div className="dealer-form-col">
            <div className="dealer-form-frame-wrap">
              {/* Architectural Corner Brackets (Top-Right & Bottom-Left) */}
              <div className="dealer-bracket-tr" aria-hidden="true" />
              <div className="dealer-bracket-bl" aria-hidden="true" />

              <div className="dealer-form-card">
                <h2 className="dealer-form-title headline-sm">Dealer Enquiry Form</h2>
                <div className="dealer-form-divider" aria-hidden="true" />

              {submittedResult ? (
                <div style={{ padding: '36px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255, 8, 4, 0.1)', color: '#ff0804', marginBottom: '16px' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="headline-sm" style={{ fontSize: '20px', color: '#000417', marginBottom: '8px' }}>
                    Distributor Application Received
                  </h3>
                  <p className="body-sm" style={{ color: '#555e68', maxWidth: '420px', margin: '0 auto 16px' }}>
                    Thank you for applying to join the SPRIMAX / WELD-TECH global distributor network. Our commercial partnerships team will review your profile.
                  </p>
                  <div style={{ background: '#f4f6f8', border: '1px solid #e2e8f0', padding: '12px 18px', display: 'inline-block', borderRadius: '4px', marginBottom: '24px' }}>
                    <span className="data-tabular" style={{ fontSize: '11px', color: '#718096', textTransform: 'uppercase', display: 'block' }}>APPLICATION REFERENCE</span>
                    <span className="data-tabular font-bold" style={{ fontSize: '16px', color: '#000417' }}>
                      {submittedResult.referenceCode || submittedResult.refId || 'ENQ-DLR-CONFIRMED'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="dealer-submit-btn data-tabular"
                      onClick={() => {
                        setSubmittedResult(null);
                        setFormData({
                          fullName: '',
                          companyName: '',
                          email: '',
                          phone: '',
                          businessType: '',
                          primaryLocation: '',
                          currentProductRange: '',
                          yearsInBusiness: '6-10',
                          additionalMessage: ''
                        });
                      }}
                    >
                      <span>SUBMIT ANOTHER APPLICATION</span>
                    </button>
                    {onBackToContact && (
                      <button
                        type="button"
                        className="dealer-back-btn data-tabular"
                        style={{ border: '1px solid #e2e8f0', background: '#fff' }}
                        onClick={onBackToContact}
                      >
                        <ArrowLeft size={15} />
                        <span>RETURN TO CONTACT</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="dealer-form">
                  {errorMessage && (
                    <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#c62828', padding: '10px 14px', borderRadius: '4px', fontSize: '13px', marginBottom: '16px' }}>
                      {errorMessage}
                    </div>
                  )}

                  {/* Row 1: Full Name & Company Name */}
                  <div className="dealer-form-row">
                    <div className="dealer-input-group">
                      <label className="dealer-label data-tabular">FULL NAME *</label>
                      <input
                        type="text"
                        name="fullName"
                        className="dealer-input"
                        placeholder="Jane Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="dealer-input-group">
                      <label className="dealer-label data-tabular">COMPANY NAME *</label>
                      <input
                        type="text"
                        name="companyName"
                        className="dealer-input"
                        placeholder="Acme Industrial Supply"
                        value={formData.companyName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Email & Phone Number */}
                  <div className="dealer-form-row">
                    <div className="dealer-input-group">
                      <label className="dealer-label data-tabular">EMAIL ADDRESS *</label>
                      <input
                        type="email"
                        name="email"
                        className="dealer-input"
                        placeholder="jane.doe@acmesupply.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="dealer-input-group">
                      <label className="dealer-label data-tabular">PHONE NUMBER</label>
                      <input
                        type="tel"
                        name="phone"
                        className="dealer-input"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Row 3: Business Type & Primary Location */}
                  <div className="dealer-form-row">
                    <div className="dealer-input-group">
                      <label className="dealer-label data-tabular">BUSINESS TYPE *</label>
                      <div className="dealer-select-wrap">
                        <select
                          name="businessType"
                          className="dealer-select"
                          value={formData.businessType}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select type...</option>
                          <option value="Independent Distributor">Independent Distributor</option>
                          <option value="Industrial Supply Chain">Industrial Supply Chain</option>
                          <option value="Regional Wholesaler">Regional Wholesaler</option>
                          <option value="Welding Equipment Specialist">Welding Equipment Specialist</option>
                        </select>
                        <ChevronDown size={16} className="dealer-select-chevron" />
                      </div>
                    </div>

                    <div className="dealer-input-group">
                      <label className="dealer-label data-tabular">PRIMARY LOCATION (CITY/COUNTRY)</label>
                      <input
                        type="text"
                        name="primaryLocation"
                        className="dealer-input"
                        placeholder="e.g. Houston, USA"
                        value={formData.primaryLocation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Row 4: Current Primary Product Range */}
                  <div className="dealer-input-group dealer-full-width">
                    <label className="dealer-label data-tabular">CURRENT PRIMARY PRODUCT RANGE</label>
                    <input
                      type="text"
                      name="currentProductRange"
                      className="dealer-input"
                      placeholder="e.g. Fasteners, Safety Gear, Welding Equipment"
                      value={formData.currentProductRange}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Row 5: Years in Business (Radio buttons) */}
                  <div className="dealer-input-group dealer-full-width">
                    <label className="dealer-label data-tabular">YEARS IN BUSINESS</label>
                    <div className="dealer-radio-group">
                      {['0-5', '6-10', '10+'].map((yr) => (
                        <label key={yr} className="dealer-radio-label">
                          <input
                            type="radio"
                            name="yearsInBusiness"
                            value={yr}
                            checked={formData.yearsInBusiness === yr}
                            onChange={handleChange}
                            className="dealer-radio-input"
                          />
                          <span className="dealer-radio-custom" />
                          <span className="dealer-radio-text data-tabular">{yr}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Row 6: Additional Message / Capabilities */}
                  <div className="dealer-input-group dealer-full-width">
                    <label className="dealer-label data-tabular">ADDITIONAL MESSAGE / CAPABILITIES</label>
                    <textarea
                      name="additionalMessage"
                      rows="4"
                      className="dealer-textarea"
                      placeholder="Briefly describe your distribution network and technical capabilities..."
                      value={formData.additionalMessage}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Submit Action */}
                  <div className="dealer-form-actions">
                    <button type="submit" disabled={submitting} className="dealer-submit-btn data-tabular">
                      <span>{submitting ? 'TRANSMITTING...' : 'SUBMIT DEALER ENQUIRY'}</span>
                      <ArrowRight size={15} strokeWidth={2.4} />
                    </button>
                  </div>
                </form>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
