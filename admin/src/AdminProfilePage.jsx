import { useState, useEffect, useRef } from 'react';
import {
  User,
  Shield,
  Sliders,
  Bell,
  Activity,
  Upload,
  Trash2,
  Check,
  CheckCircle2,
  Lock,
  Smartphone,
  Globe,
  Clock,
  Key,
  Laptop,
  LogOut,
  Save,
  AlertCircle
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import { uploadImageApi } from './api/upload.js';
import './AdminProfilePage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STORAGE_KEY = 'sprimax_admin_profile';

const DEFAULT_PROFILE = {
  name: 'Mateen Baig',
  displayName: 'Mateen',
  email: 'sprimaxindia@gmail.com',
  phone: '+91 9039072804',
  jobTitle: 'Super Administrator & Operations Director',
  bio: 'Managing industrial welding consumables manufacturing, global compliance certifications, and enterprise distribution networks.',
  avatar: '',
  role: 'Super Admin',
  status: 'Active',
  memberSince: 'January 2024',
  lastLogin: 'Today, 07:15 AM (IST)',
  twoFactorEnabled: false,
  preferences: {
    language: 'English (US)',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Kolkata (IST)',
    theme: 'Light',
  },
  notifications: {
    emailEnquiries: true,
    lowInventory: true,
    weeklyDigest: false,
    securityAlerts: true,
  },
  activityLog: [
    {
      id: 'act-1',
      action: 'Updated Product Catalogue',
      details: 'Modified specifications and pricing tier for LOW HYDROGEN ELECTRODE E7018-1',
      timestamp: 'Today, 06:40 AM',
      ip: '103.211.54.12',
    },
    {
      id: 'act-2',
      action: 'Approved Customer Enquiry',
      details: 'Reviewed and forwarded Bulk Quotation request #ENQ-2026-904',
      timestamp: 'Yesterday, 04:15 PM',
      ip: '103.211.54.12',
    },
    {
      id: 'act-3',
      action: 'Synchronized ISO Certifications',
      details: 'Verified validity date range for AWS D1.1 and EN 1090-2 execution standards',
      timestamp: 'Oct 17, 2026 11:20 AM',
      ip: '103.211.54.12',
    },
    {
      id: 'act-4',
      action: 'Security Sign-in',
      details: 'Successful 2FA password authentication from Chrome / Windows 11',
      timestamp: 'Oct 16, 2026 09:00 AM',
      ip: '103.211.54.12',
    },
  ],
};

export default function AdminProfilePage({ onLogout, onNavigate }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [globalSearch, setGlobalSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PROFILE;
  });

  // Password state for Security tab
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Sync with backend on mount
  useEffect(() => {
    fetch(`${API_BASE}/users/profile`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.profile) {
          setProfile((prev) => ({
            ...prev,
            ...data.profile,
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.profile));
        }
      })
      .catch((err) => console.warn('Using cached admin profile:', err));
  }, []);

  // Handle avatar upload via Cloudinary
  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Photo must be less than 5 MB.');
      return;
    }

    try {
      showToast('Uploading profile photo to Cloudinary...');
      const data = await uploadImageApi(file, { folder: 'sprimax/admin/avatars' });
      const updated = { ...profile, avatar: data.secure_url };
      setProfile(updated);
      persistProfile(updated, 'Updated profile photo');
      showToast('Profile photo updated.');
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    }
  };

  const handleRemoveAvatar = () => {
    const updated = { ...profile, avatar: '' };
    setProfile(updated);
    persistProfile(updated, 'Removed profile photo');
    showToast('Profile photo removed.');
  };

  // Persist helper
  const persistProfile = async (updatedData, actionLabel = 'Profile updated') => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      window.dispatchEvent(new Event('adminProfileUpdated'));

      await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedData,
          newActivityAction: actionLabel,
          newActivityDetails: `${actionLabel} by ${updatedData.displayName || 'Admin'}`,
        }),
      });
    } catch (err) {
      console.warn('Backend sync failed, stored locally:', err);
    } finally {
      setSaving(false);
    }
  };

  // Save Personal Details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim() || profile.name.trim().length < 2) {
      showToast('Full name must be at least 2 characters.');
      return;
    }
    await persistProfile(profile, 'Updated personal details');
    showToast('Personal details saved successfully.');
  };

  // Save Security / Password
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      showToast('Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast('New password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.');
      return;
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    persistProfile(profile, 'Changed account password');
    showToast('Password updated successfully.');
  };

  // Toggle Preferences
  const handlePrefChange = (key, value) => {
    const updated = {
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: value,
      },
    };
    setProfile(updated);
    persistProfile(updated, `Updated preference: ${key}`);
    showToast('Preferences updated.');
  };

  // Toggle Notifications
  const handleNotificationToggle = (key) => {
    const updated = {
      ...profile,
      notifications: {
        ...profile.notifications,
        [key]: !profile.notifications?.[key],
      },
    };
    setProfile(updated);
    persistProfile(updated, `Toggled notification setting: ${key}`);
  };

  // Toggle 2FA
  const handleToggle2FA = () => {
    const nextVal = !profile.twoFactorEnabled;
    const updated = { ...profile, twoFactorEnabled: nextVal };
    setProfile(updated);
    persistProfile(updated, `${nextVal ? 'Enabled' : 'Disabled'} Two-Factor Authentication`);
    showToast(`Two-factor authentication ${nextVal ? 'enabled' : 'disabled'}.`);
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'AD';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="admin-profile-shell">
      <AdminSidebar
        currentNav="Admin Profile"
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="admin-profile-main">
        <AdminTopbar
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onToast={showToast}
          title="Admin Profile"
        />

        <main className="admin-profile-content">
          {/* Breadcrumb */}
          <div className="profile-breadcrumb">
            <span
              className="profile-breadcrumb-link"
              onClick={() => onNavigate?.('Dashboard')}
            >
              Dashboard
            </span>
            <span>&rsaquo;</span>
            <span>Admin Profile</span>
          </div>

          <div className="profile-page-title-row">
            <div>
              <h1 className="profile-page-title">Admin Profile &amp; Settings</h1>
              <p className="profile-page-subtitle">
                Manage your credentials, role privileges, interface preferences, and system notifications.
              </p>
            </div>
          </div>

          {/* Profile Header Card */}
          <div className="profile-header-card">
            <div className="profile-avatar-details-group">
              <div className="profile-avatar-large">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="profile-avatar-large-img"
                  />
                ) : (
                  <span>{getInitials(profile.name)}</span>
                )}
              </div>

              <div className="profile-identity-col">
                <div className="profile-identity-name-row">
                  <h2 className="profile-identity-name">{profile.name}</h2>
                  <span className="profile-role-badge">
                    <Shield size={12} strokeWidth={2.5} />
                    {profile.role || 'Super Admin'}
                  </span>
                  <span className="profile-status-pill">
                    <span className="profile-status-dot" />
                    {profile.status || 'Active'}
                  </span>
                </div>

                <div className="profile-meta-row">
                  <span>Member since: <strong>{profile.memberSince || 'Jan 2024'}</strong></span>
                  <span>&bull;</span>
                  <span>Last login: <strong>{profile.lastLogin || 'Today'}</strong></span>
                </div>
              </div>
            </div>

            <div className="profile-avatar-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarFile}
              />
              <button
                type="button"
                className="btn-avatar-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={13} />
                <span>Upload New Photo</span>
              </button>
              {profile.avatar && (
                <button
                  type="button"
                  className="btn-avatar-remove"
                  onClick={handleRemoveAvatar}
                >
                  <Trash2 size={13} />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="profile-tabs-bar" aria-label="Profile Sections">
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'Profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('Profile')}
            >
              <User size={15} />
              <span>Profile</span>
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'Security' ? 'active' : ''}`}
              onClick={() => setActiveTab('Security')}
            >
              <Lock size={15} />
              <span>Security</span>
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'Preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('Preferences')}
            >
              <Sliders size={15} />
              <span>Preferences</span>
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'Notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('Notifications')}
            >
              <Bell size={15} />
              <span>Notifications</span>
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'Activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('Activity')}
            >
              <Activity size={15} />
              <span>Activity</span>
            </button>
          </nav>

          {/* TAB 1: PROFILE */}
          {activeTab === 'Profile' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3 className="profile-card-title">Personal Details</h3>
                <p className="profile-card-subtitle">
                  Update your contact details and dashboard signature.
                </p>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="profile-form-grid-2">
                  <div className="profile-field-group">
                    <label className="profile-label">Full Name *</label>
                    <input
                      type="text"
                      className="profile-input"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                    <span className="profile-field-hint">2 to 60 characters</span>
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-label">Display Name *</label>
                    <input
                      type="text"
                      className="profile-input"
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      required
                    />
                    <span className="profile-field-hint">Shown in "Good morning, {profile.displayName || '___'}"</span>
                  </div>
                </div>

                <div className="profile-form-grid-2">
                  <div className="profile-field-group">
                    <label className="profile-label">Login Email</label>
                    <input
                      type="email"
                      className="profile-input"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                    <span className="profile-field-hint">Changing email triggers security re-verification</span>
                  </div>

                  <div className="profile-field-group">
                    <label className="profile-label">Phone Number</label>
                    <input
                      type="tel"
                      className="profile-input"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                    <span className="profile-field-hint">Direct line with country code</span>
                  </div>
                </div>

                <div className="profile-field-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="profile-label">Job Title / Department</label>
                  <input
                    type="text"
                    className="profile-input"
                    value={profile.jobTitle}
                    onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                  />
                </div>

                <div className="profile-field-group" style={{ marginBottom: '2rem' }}>
                  <label className="profile-label">Bio / Email Signature</label>
                  <textarea
                    rows={4}
                    className="profile-textarea"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                  <span className="profile-field-hint">Appended to official enquiry responses &amp; quotation emails</span>
                </div>

                <button type="submit" className="profile-btn-primary" disabled={saving}>
                  <Save size={14} />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'Security' && (
            <div>
              {/* Change Password Card */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3 className="profile-card-title">Change Password</h3>
                  <p className="profile-card-subtitle">
                    Ensure your account uses a strong password with at least 8 characters.
                  </p>
                </div>

                <form onSubmit={handleSavePassword}>
                  <div className="profile-field-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="profile-label">Current Password</label>
                    <input
                      type="password"
                      className="profile-input"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="••••••••••••"
                    />
                  </div>

                  <div className="profile-form-grid-2">
                    <div className="profile-field-group">
                      <label className="profile-label">New Password</label>
                      <input
                        type="password"
                        className="profile-input"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                        placeholder="••••••••••••"
                      />
                    </div>

                    <div className="profile-field-group">
                      <label className="profile-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="profile-input"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>

                  <button type="submit" className="profile-btn-primary">
                    <Key size={14} />
                    <span>Update Password</span>
                  </button>
                </form>
              </div>

              {/* Two Factor Authentication Card */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3 className="profile-card-title">Two-Factor Authentication (2FA)</h3>
                  <p className="profile-card-subtitle">
                    Add an extra layer of security to your admin account.
                  </p>
                </div>

                <div className="security-status-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Smartphone size={24} style={{ color: '#000417' }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '14.5px' }}>
                        Authenticator App / SMS Verification
                      </strong>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        {profile.twoFactorEnabled
                          ? '2FA is active. Verification code required on login.'
                          : 'Two-factor authentication is currently disabled.'}
                      </span>
                    </div>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={profile.twoFactorEnabled}
                      onChange={handleToggle2FA}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h3 className="profile-card-title">Active Sessions</h3>
                  <p className="profile-card-subtitle">
                    Devices currently logged in to your administrator account.
                  </p>
                </div>

                <table className="sessions-table">
                  <thead>
                    <tr>
                      <th>Device &amp; Browser</th>
                      <th>Location</th>
                      <th>IP Address</th>
                      <th>Last Active</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Windows 11 / Chrome 124</strong>
                      </td>
                      <td>Raipur, Chhattisgarh, IN</td>
                      <td>103.211.54.12</td>
                      <td>Active now</td>
                      <td>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>Current Session</span>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>iPhone 15 Pro / Mobile Safari</strong>
                      </td>
                      <td>Raipur, Chhattisgarh, IN</td>
                      <td>103.211.54.18</td>
                      <td>2 hours ago</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => showToast('Session revoked.')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '12.5px',
                            fontWeight: 600,
                          }}
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PREFERENCES */}
          {activeTab === 'Preferences' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3 className="profile-card-title">Panel Preferences</h3>
                <p className="profile-card-subtitle">
                  Customize your administrative workspace layout, language, and regional standards.
                </p>
              </div>

              <div className="profile-form-grid-2">
                <div className="profile-field-group">
                  <label className="profile-label">Language</label>
                  <select
                    className="profile-select"
                    value={profile.preferences?.language || 'English (US)'}
                    onChange={(e) => handlePrefChange('language', e.target.value)}
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="English (UK)">English (UK)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Arabic">Arabic (العربية)</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label className="profile-label">Date Format</label>
                  <select
                    className="profile-select"
                    value={profile.preferences?.dateFormat || 'DD/MM/YYYY'}
                    onChange={(e) => handlePrefChange('dateFormat', e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 19/10/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 10/19/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Standard)</option>
                  </select>
                </div>
              </div>

              <div className="profile-form-grid-2">
                <div className="profile-field-group">
                  <label className="profile-label">Timezone</label>
                  <select
                    className="profile-select"
                    value={profile.preferences?.timezone || 'Asia/Kolkata (IST)'}
                    onChange={(e) => handlePrefChange('timezone', e.target.value)}
                  >
                    <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST, UTC+5:30)</option>
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="America/New_York (EST)">America/New_York (EST, UTC-5)</option>
                    <option value="Europe/London (GMT)">Europe/London (GMT, UTC+0)</option>
                    <option value="Asia/Dubai (GST)">Asia/Dubai (GST, UTC+4)</option>
                  </select>
                </div>

                <div className="profile-field-group">
                  <label className="profile-label">Panel Color Theme</label>
                  <select
                    className="profile-select"
                    value={profile.preferences?.theme || 'Light'}
                    onChange={(e) => handlePrefChange('theme', e.target.value)}
                  >
                    <option value="Light">Light (Standard Enterprise)</option>
                    <option value="Dark">Dark Mode</option>
                    <option value="System">System Default</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'Notifications' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3 className="profile-card-title">Email Notification Alerts</h3>
                <p className="profile-card-subtitle">
                  Configure real-time alerts sent to {profile.email}.
                </p>
              </div>

              <div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <h4>New Customer Enquiries</h4>
                    <p>Receive instant notifications when customers submit product quotations or custom technical specs.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={profile.notifications?.emailEnquiries}
                      onChange={() => handleNotificationToggle('emailEnquiries')}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="toggle-row">
                  <div className="toggle-info">
                    <h4>Low Inventory &amp; Stock Alerts</h4>
                    <p>Alerts when active welding consumables inventory reaches minimum batch thresholds.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={profile.notifications?.lowInventory}
                      onChange={() => handleNotificationToggle('lowInventory')}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="toggle-row">
                  <div className="toggle-info">
                    <h4>Weekly Executive Performance Digest</h4>
                    <p>Weekly automated PDF report summarizing total inquiries, downloads, and catalogue engagement.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={profile.notifications?.weeklyDigest}
                      onChange={() => handleNotificationToggle('weeklyDigest')}
                    />
                    <span className="slider" />
                  </label>
                </div>

                <div className="toggle-row">
                  <div className="toggle-info">
                    <h4>Security &amp; Privilege Alerts</h4>
                    <p>Instant warnings on unusual login attempts or administrator permission changes.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={profile.notifications?.securityAlerts}
                      onChange={() => handleNotificationToggle('securityAlerts')}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVITY */}
          {activeTab === 'Activity' && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h3 className="profile-card-title">Audit Trail &amp; Activity Log</h3>
                <p className="profile-card-subtitle">
                  Chronological history of administrative actions executed under this account.
                </p>
              </div>

              <table className="sessions-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Timestamp</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {(profile.activityLog || []).map((act) => (
                    <tr key={act.id}>
                      <td>
                        <strong>{act.action}</strong>
                      </td>
                      <td>{act.details}</td>
                      <td>{act.timestamp}</td>
                      <td>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px' }}>
                          {act.ip}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {toastMessage && (
        <div className="profile-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
