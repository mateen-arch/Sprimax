import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Building,
  MapPin,
  Award,
  Users,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { fetchAdminCareersSettings, updateAdminCareersSettingsApi } from './api/careers.js';
import './CareersSettingsModal.css';

export default function CareersSettingsModal({ isOpen, onClose, onSaved }) {
  const [activeTab, setActiveTab] = useState('taxonomies'); // 'taxonomies' | 'contacts' | 'disclaimers'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Form State
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState('');

  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');

  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState('');

  const [talentContacts, setTalentContacts] = useState([]);
  const [globalIntegrityGuarantee, setGlobalIntegrityGuarantee] = useState('');
  const [globalEqualOpportunityText, setGlobalEqualOpportunityText] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminCareersSettings();
      const s = res.settings || {};
      setDepartments(s.departments || []);
      setLocations(s.locations || []);
      setCertifications(s.certifications || []);
      setTalentContacts(s.talentContacts || []);
      setGlobalIntegrityGuarantee(s.globalIntegrityGuarantee || '');
      setGlobalEqualOpportunityText(s.globalEqualOpportunityText || '');
    } catch (err) {
      setError(err.message || 'Failed to load careers settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!newDepartment.trim()) return;
    if (departments.includes(newDepartment.trim())) {
      showToast('Department already exists', 'error');
      return;
    }
    setDepartments([...departments, newDepartment.trim()]);
    setNewDepartment('');
  };

  const handleRemoveDepartment = (idx) => {
    setDepartments(departments.filter((_, i) => i !== idx));
  };

  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    if (locations.includes(newLocation.trim())) {
      showToast('Location already exists', 'error');
      return;
    }
    setLocations([...locations, newLocation.trim()]);
    setNewLocation('');
  };

  const handleRemoveLocation = (idx) => {
    setLocations(locations.filter((_, i) => i !== idx));
  };

  const handleAddCert = (e) => {
    e.preventDefault();
    if (!newCert.trim()) return;
    if (certifications.includes(newCert.trim())) {
      showToast('Certification already exists', 'error');
      return;
    }
    setCertifications([...certifications, newCert.trim()]);
    setNewCert('');
  };

  const handleRemoveCert = (idx) => {
    setCertifications(certifications.filter((_, i) => i !== idx));
  };

  // Contacts Handlers
  const handleAddContact = () => {
    setTalentContacts([
      ...talentContacts,
      {
        name: 'Talent Lead',
        title: 'Senior Technical Recruiter',
        email: 'careers@sprimax.com',
        phone: '+971 4 880 0000',
      },
    ]);
  };

  const handleUpdateContact = (index, field, value) => {
    const updated = [...talentContacts];
    updated[index] = { ...updated[index], [field]: value };
    setTalentContacts(updated);
  };

  const handleRemoveContact = (index) => {
    setTalentContacts(talentContacts.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateAdminCareersSettingsApi({
        departments,
        locations,
        certifications,
        talentContacts,
        globalIntegrityGuarantee,
        globalEqualOpportunityText,
      });
      showToast('Settings saved successfully');
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="careers-settings-backdrop" onClick={onClose}>
      <div className="careers-settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="careers-settings-header">
          <div className="header-left">
            <div className="settings-icon-badge">
              <Sliders size={20} color="#ff0804" />
            </div>
            <div>
              <h2 className="settings-title">Careers & Talent Pipeline Settings</h2>
              <p className="settings-subtitle">
                Configure global departments, plant facilities, talent contacts, and recruitment compliance texts.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`settings-inline-toast toast-${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="careers-settings-tabs">
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'taxonomies' ? 'active' : ''}`}
            onClick={() => setActiveTab('taxonomies')}
          >
            <Building size={15} />
            <span>Departments, Locations & Certs</span>
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Users size={15} />
            <span>Talent Acquisition Team ({talentContacts.length})</span>
          </button>
          <button
            type="button"
            className={`settings-tab-btn ${activeTab === 'disclaimers' ? 'active' : ''}`}
            onClick={() => setActiveTab('disclaimers')}
          >
            <ShieldCheck size={15} />
            <span>Compliance & Legal Text</span>
          </button>
        </div>

        {/* Body */}
        <div className="careers-settings-body">
          {loading ? (
            <div className="settings-loading-state">
              <div className="settings-spinner" />
              <p>Loading configuration settings...</p>
            </div>
          ) : (
            <>
              {error && <div className="settings-error-alert">{error}</div>}

              {/* TAB 1: TAXONOMIES */}
              {activeTab === 'taxonomies' && (
                <div className="settings-tab-content">
                  {/* Departments */}
                  <div className="settings-group">
                    <label className="settings-group-label">
                      <Building size={16} color="#212e68" />
                      <span>Organizational Departments</span>
                    </label>
                    <p className="settings-group-desc">
                      Departments available for job assignment and public filter pills.
                    </p>
                    <div className="tags-container">
                      {departments.map((dept, i) => (
                        <span key={i} className="taxonomy-tag">
                          {dept}
                          <button
                            type="button"
                            className="btn-remove-tag"
                            onClick={() => handleRemoveDepartment(i)}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <form onSubmit={handleAddDepartment} className="add-tag-inline-form">
                      <input
                        type="text"
                        className="tag-input"
                        placeholder="Add new department (e.g. Subsea Robotics & Automation)..."
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                      />
                      <button type="submit" className="btn-add-tag">
                        <Plus size={14} /> Add
                      </button>
                    </form>
                  </div>

                  {/* Locations */}
                  <div className="settings-group">
                    <label className="settings-group-label">
                      <MapPin size={16} color="#ff0804" />
                      <span>Plant Facilities & Technical Hubs</span>
                    </label>
                    <p className="settings-group-desc">
                      Operating hubs displayed in job postings and regional vacancy filters.
                    </p>
                    <div className="tags-container">
                      {locations.map((loc, i) => (
                        <span key={i} className="taxonomy-tag">
                          {loc}
                          <button
                            type="button"
                            className="btn-remove-tag"
                            onClick={() => handleRemoveLocation(i)}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <form onSubmit={handleAddLocation} className="add-tag-inline-form">
                      <input
                        type="text"
                        className="tag-input"
                        placeholder="Add facility (e.g. JAFZA Materials Lab, Dubai, UAE)..."
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                      />
                      <button type="submit" className="btn-add-tag">
                        <Plus size={14} /> Add
                      </button>
                    </form>
                  </div>

                  {/* Certifications */}
                  <div className="settings-group">
                    <label className="settings-group-label">
                      <Award size={16} color="#10b981" />
                      <span>Approved Certification Standard Library</span>
                    </label>
                    <p className="settings-group-desc">
                      Standardized metallurgy and NDT credentials that applicants can check off in the docket.
                    </p>
                    <div className="tags-container">
                      {certifications.map((cert, i) => (
                        <span key={i} className="taxonomy-tag cert-tag">
                          {cert}
                          <button
                            type="button"
                            className="btn-remove-tag"
                            onClick={() => handleRemoveCert(i)}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                    <form onSubmit={handleAddCert} className="add-tag-inline-form">
                      <input
                        type="text"
                        className="tag-input"
                        placeholder="Add certification (e.g. CSWIP 3.1 Senior Welding Inspector)..."
                        value={newCert}
                        onChange={(e) => setNewCert(e.target.value)}
                      />
                      <button type="submit" className="btn-add-tag">
                        <Plus size={14} /> Add
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: TALENT CONTACTS */}
              {activeTab === 'contacts' && (
                <div className="settings-tab-content">
                  <div className="tab-header-row">
                    <div>
                      <h4 className="tab-sec-title">Talent Acquisition Focal Points</h4>
                      <p className="settings-group-desc">
                        These contacts appear in the job detail sidebar for candidate enquiries.
                      </p>
                    </div>
                    <button type="button" className="btn-add-contact" onClick={handleAddContact}>
                      <Plus size={14} />
                      <span>Add Talent Contact</span>
                    </button>
                  </div>

                  <div className="contacts-grid">
                    {talentContacts.map((contact, idx) => (
                      <div key={idx} className="contact-card-edit">
                        <div className="contact-card-header">
                          <span className="contact-card-num">Contact #{idx + 1}</span>
                          <button
                            type="button"
                            className="btn-remove-contact"
                            onClick={() => handleRemoveContact(idx)}
                            title="Remove Contact"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="contact-field-grid">
                          <div className="form-field-sm">
                            <label>Full Name</label>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => handleUpdateContact(idx, 'name', e.target.value)}
                            />
                          </div>

                          <div className="form-field-sm">
                            <label>Title / Role</label>
                            <input
                              type="text"
                              value={contact.title}
                              onChange={(e) => handleUpdateContact(idx, 'title', e.target.value)}
                            />
                          </div>

                          <div className="form-field-sm">
                            <label>Direct Email</label>
                            <input
                              type="email"
                              value={contact.email}
                              onChange={(e) => handleUpdateContact(idx, 'email', e.target.value)}
                            />
                          </div>

                          <div className="form-field-sm">
                            <label>Direct Phone</label>
                            <input
                              type="text"
                              value={contact.phone}
                              onChange={(e) => handleUpdateContact(idx, 'phone', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {talentContacts.length === 0 && (
                      <div className="empty-contacts-placeholder">
                        <Users size={28} color="#94a3b8" />
                        <p>No dedicated contacts defined yet. Click "Add Talent Contact" above.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: DISCLAIMERS & COMPLIANCE */}
              {activeTab === 'disclaimers' && (
                <div className="settings-tab-content">
                  <div className="settings-group">
                    <label className="settings-group-label">
                      <ShieldCheck size={16} color="#212e68" />
                      <span>Global Recruitment Integrity Guarantee</span>
                    </label>
                    <p className="settings-group-desc">
                      Displayed on all application modals and public job postings to protect against third-party recruitment fraud.
                    </p>
                    <textarea
                      className="settings-textarea"
                      rows={4}
                      value={globalIntegrityGuarantee}
                      onChange={(e) => setGlobalIntegrityGuarantee(e.target.value)}
                    />
                  </div>

                  <div className="settings-group">
                    <label className="settings-group-label">
                      <Award size={16} color="#ff0804" />
                      <span>Equal Opportunity & Industrial Diversity Statement</span>
                    </label>
                    <p className="settings-group-desc">
                      Official statement regarding non-discrimination, merit-based selection, and equal workplace opportunities.
                    </p>
                    <textarea
                      className="settings-textarea"
                      rows={4}
                      value={globalEqualOpportunityText}
                      onChange={(e) => setGlobalEqualOpportunityText(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="careers-settings-footer">
          <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn-save-settings" onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <RefreshCw size={15} className="spinning" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Careers Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
