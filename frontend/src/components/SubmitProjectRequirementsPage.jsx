import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, FileCheck, Layers, Loader2 } from 'lucide-react';
import { submitProjectRequirements } from '../api/projectRequirements.js';

export default function SubmitProjectRequirementsPage({ industry, onBackToSolutions, onBackToCompany }) {
  const industryName = industry?.name || 'Industrial Sector';
  const industrySlug = industry?.slug || 'industrial-sector';

  const [form, setForm] = useState({
    projectName: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    location: '',
    baseMaterials: '',
    weldingProcess: 'Submerged Arc Welding (SAW)',
    standards: (industry?.complianceBadges || []).join(', ') || 'AWS D1.1, ASME Sec IX',
    estimatedVolume: '',
    targetDeliveryDate: '',
    projectScopeDetails: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.projectName.trim() || !form.companyName.trim() || !form.contactPerson.trim() || !form.email.trim()) {
      setErrorMsg('Please complete all required fields marked with *');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const payload = {
        ...form,
        industryName,
        industrySlug,
      };

      const res = await submitProjectRequirements(payload);
      setSubmittedData(res.requirement);
    } catch (err) {
      console.error('Error submitting requirements:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit requirements. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedData) {
    return (
      <div className="solutions-page-wrapper" style={{ minHeight: '80vh', padding: '4rem 1rem' }}>
        <div className="solutions-container" style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3.5rem 2.5rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,4,23,0.06)' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: '#dcfce7', borderRadius: '50%', color: '#16a34a', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={48} strokeWidth={2.2} />
            </div>

            <div className="solutions-industry-badge data-tabular" style={{ margin: '0 auto 1.25rem' }}>
              <span>PROJECT SPECIFICATION RECEIVED</span>
            </div>

            <h1 className="headline-lg" style={{ fontSize: '28px', color: '#000417', marginBottom: '0.75rem' }}>
              Project Requirements Logged
            </h1>

            <p className="body-md" style={{ color: '#475569', maxWidth: '560px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
              Your technical specification for <strong>{industryName}</strong> has been assigned to our metallurgical engineering &amp; procurement division.
            </p>

            {/* Reference Tracking Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '2px', padding: '1.5rem', marginBottom: '2.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <span className="data-tabular" style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>REFERENCE TRACKING NUMBER</span>
                <span className="data-tabular" style={{ fontSize: '16px', color: '#ff0804', fontWeight: 700 }}>{submittedData.referenceNumber}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '13px' }}>
                <div><span style={{ color: '#64748b' }}>Project:</span> <strong>{submittedData.projectName}</strong></div>
                <div><span style={{ color: '#64748b' }}>Company:</span> <strong>{submittedData.companyName}</strong></div>
                <div><span style={{ color: '#64748b' }}>Industry:</span> <strong>{submittedData.industryName}</strong></div>
                <div><span style={{ color: '#64748b' }}>Status:</span> <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '2px', fontWeight: 600, fontSize: '11px' }}>{submittedData.status}</span></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="solutions-btn-primary data-tabular"
                onClick={onBackToSolutions}
                style={{ padding: '0.85rem 1.75rem' }}
              >
                <span>RETURN TO {industryName.toUpperCase()} SOLUTIONS</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
              {onBackToCompany && (
                <button
                  type="button"
                  className="solutions-btn-secondary data-tabular"
                  onClick={onBackToCompany}
                  style={{ padding: '0.85rem 1.75rem' }}
                >
                  <span>ALL SECTORS</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="solutions-page-wrapper">
      {/* 1. Breadcrumbs Header Bar */}
      <section className="solutions-nav-bar">
        <div className="solutions-container">
          <div className="solutions-breadcrumbs">
            <button
              type="button"
              className="solutions-back-btn data-tabular"
              onClick={onBackToSolutions}
              aria-label="Back to Solutions"
            >
              <ArrowLeft size={15} strokeWidth={2.4} />
              <span>Back</span>
            </button>
            <span className="solutions-breadcrumb-sep">/</span>
            <button
              type="button"
              className="solutions-breadcrumb-link"
              onClick={onBackToCompany}
            >
              Company
            </button>
            <span className="solutions-breadcrumb-slash">/</span>
            <button
              type="button"
              className="solutions-breadcrumb-link"
              onClick={onBackToSolutions}
            >
              {industryName}
            </button>
            <span className="solutions-breadcrumb-slash">/</span>
            <span className="solutions-breadcrumb-active">Submit Requirements</span>
          </div>
        </div>
      </section>

      {/* 2. Hero Header */}
      <section style={{ background: '#000417', color: '#ffffff', padding: '3.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="solutions-container">
          <div style={{ maxWidth: '820px' }}>
            <div className="solutions-industry-badge data-tabular" style={{ marginBottom: '1rem' }}>
              <FileCheck size={14} style={{ color: '#ff0804' }} />
              <span>PROJECT REQUIREMENTS INTAKE // {industryName.toUpperCase()}</span>
            </div>
            <h1 className="headline-lg" style={{ color: '#ffffff', fontSize: '36px', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Submit Engineering &amp; Procurement Specifications
            </h1>
            <p className="body-md" style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.6' }}>
              Detail your operational parameters, steel thicknesses, joint designs, and compliance specifications. SPRIMAX metallurgical engineers evaluate your constraints to deliver a verified, batch-traceable consumable schedule.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Form Content Section */}
      <section style={{ padding: '3.5rem 0 5rem', background: '#f8fafc' }}>
        <div className="solutions-container" style={{ maxWidth: '960px' }}>
          {errorMsg && (
            <div style={{ background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b', padding: '1rem 1.25rem', borderRadius: '4px', marginBottom: '2rem', fontSize: '14px', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2.5rem', boxShadow: '0 2px 10px rgba(0,4,23,0.04)' }}>
            {/* Section 1: Organization & Contact */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #000417', paddingBottom: '0.6rem', marginBottom: '1.5rem' }}>
                <span className="data-tabular" style={{ fontSize: '12px', background: '#ff0804', color: '#fff', padding: '2px 8px', borderRadius: '2px', fontWeight: 700 }}>SEC 01</span>
                <h2 className="headline-sm" style={{ fontSize: '18px', color: '#000417', margin: 0 }}>Project &amp; Commercial Contacts</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Project Name / Code <span style={{ color: '#ff0804' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={form.projectName}
                    onChange={handleChange}
                    placeholder="e.g. Baltic Offshore Wind Jacket Phase III"
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Organization / Fabricator Name <span style={{ color: '#ff0804' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Apex Marine & Structural Steel Corp"
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Contact Person Name <span style={{ color: '#ff0804' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={form.contactPerson}
                    onChange={handleChange}
                    placeholder="e.g. Chief Welding Engineer David Vance"
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Corporate Email Address <span style={{ color: '#ff0804' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g. d.vance@apexmarine.com"
                    required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Phone / Direct Line
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1 (555) 349-8800"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Fabrication Facility / Delivery Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Houston Yard, Texas, USA"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Technical Metallurgical Parameters */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #000417', paddingBottom: '0.6rem', marginBottom: '1.5rem' }}>
                <span className="data-tabular" style={{ fontSize: '12px', background: '#ff0804', color: '#fff', padding: '2px 8px', borderRadius: '2px', fontWeight: 700 }}>SEC 02</span>
                <h2 className="headline-sm" style={{ fontSize: '18px', color: '#000417', margin: 0 }}>Metallurgical &amp; Welding Parameters</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Target Industrial Sector
                  </label>
                  <input
                    type="text"
                    value={industryName}
                    readOnly
                    disabled
                    style={{ width: '100%', padding: '0.75rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px', color: '#475569', fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Primary Welding Process
                  </label>
                  <select
                    name="weldingProcess"
                    value={form.weldingProcess}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px', background: '#fff' }}
                  >
                    <option value="Submerged Arc Welding (SAW)">Submerged Arc Welding (SAW)</option>
                    <option value="Flux-Cored Arc Welding (FCAW-G / FCAW-S)">Flux-Cored Arc Welding (FCAW-G / FCAW-S)</option>
                    <option value="Gas Metal Arc Welding (GMAW / MIG)">Gas Metal Arc Welding (GMAW / MIG)</option>
                    <option value="Shielded Metal Arc Welding (SMAW / Stick)">Shielded Metal Arc Welding (SMAW / Stick)</option>
                    <option value="Gas Tungsten Arc Welding (GTAW / TIG)">Gas Tungsten Arc Welding (GTAW / TIG)</option>
                    <option value="Multi-Process Automated Hybrid Cell">Multi-Process Automated Hybrid Cell</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Base Metal Grades &amp; Plate Thickness
                  </label>
                  <input
                    type="text"
                    name="baseMaterials"
                    value={form.baseMaterials}
                    onChange={handleChange}
                    placeholder="e.g. S355ML / EH36, 40mm - 80mm plate"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Target Codes &amp; Classifications
                  </label>
                  <input
                    type="text"
                    name="standards"
                    value={form.standards}
                    onChange={handleChange}
                    placeholder="e.g. AWS D1.1, ASME Sec IX, DNV-GL III YM"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Scope, Volume & Timeline */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '2px solid #000417', paddingBottom: '0.6rem', marginBottom: '1.5rem' }}>
                <span className="data-tabular" style={{ fontSize: '12px', background: '#ff0804', color: '#fff', padding: '2px 8px', borderRadius: '2px', fontWeight: 700 }}>SEC 03</span>
                <h2 className="headline-sm" style={{ fontSize: '18px', color: '#000417', margin: 0 }}>Volume, Scope &amp; Special Constraints</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Estimated Consumables Volume
                  </label>
                  <input
                    type="text"
                    name="estimatedVolume"
                    value={form.estimatedVolume}
                    onChange={handleChange}
                    placeholder="e.g. 25 Metric Tons Wire / 30 MT Flux"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                    Target Delivery / Commissioning Date
                  </label>
                  <input
                    type="text"
                    name="targetDeliveryDate"
                    value={form.targetDeliveryDate}
                    onChange={handleChange}
                    placeholder="e.g. Q1 2027 or Nov 15, 2026"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Detailed Joint Requirements &amp; Operating Environment
                </label>
                <textarea
                  name="projectScopeDetails"
                  value={form.projectScopeDetails}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Detail Charpy V-Notch impact temperatures (e.g. -40°C), H4R diffusible hydrogen requirements, post-weld heat treatment (PWHT) soak conditions, narrow-gap joint dimensions, NDT criteria, etc."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px', fontSize: '14px', lineHeight: '1.5' }}
                />
              </div>
            </div>

            {/* Submission Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
              <button
                type="button"
                className="solutions-btn-secondary data-tabular"
                onClick={onBackToSolutions}
                disabled={submitting}
              >
                <span>CANCEL</span>
              </button>

              <button
                type="submit"
                className="solutions-btn-primary data-tabular"
                disabled={submitting}
                style={{ padding: '0.9rem 2.25rem' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>LOGGING REQUIREMENTS...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT PROJECT REQUIREMENTS</span>
                    <ArrowRight size={15} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
