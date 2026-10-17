import { useState } from 'react';
import { ArrowRight, Bell, Menu, Search, Settings } from 'lucide-react';

export default function AdminTopbar({
  title = 'Catalogue',
  onOpenMobileSidebar,
  globalSearch = '',
  onGlobalSearchChange,
  onNavigate,
  onToast,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="admin-topbar">
      <button
        aria-label="Open navigation"
        className="mobile-menu-button"
        onClick={onOpenMobileSidebar}
        type="button"
      >
        <Menu aria-hidden="true" />
      </button>

      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-tools">
        <label className="dashboard-search">
          <Search aria-hidden="true" />
          <input
            aria-label="Search"
            onChange={(e) => onGlobalSearchChange?.(e.target.value)}
            placeholder="Search..."
            type="search"
            value={globalSearch}
          />
        </label>

        <div className="topbar-popover-anchor">
          <button
            aria-expanded={notificationsOpen}
            aria-label="Notifications"
            className="topbar-icon-button"
            onClick={() => {
              setNotificationsOpen((open) => !open);
            }}
            type="button"
          >
            <Bell aria-hidden="true" />
            <span className="notification-dot" />
          </button>
          {notificationsOpen && (
            <div className="topbar-popover">
              <strong>Notifications</strong>
              <p>You have 18 new enquiries to review.</p>
              <button
                onClick={() => {
                  setNotificationsOpen(false);
                  onNavigate?.('Enquiries');
                }}
                type="button"
                style={{ cursor: 'pointer' }}
              >
                Review enquiries <ArrowRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <button
          aria-label="Global Settings"
          className="topbar-icon-button"
          onClick={() => {
            setNotificationsOpen(false);
            onNavigate?.('Global Settings');
          }}
          type="button"
          title="Global Settings"
        >
          <Settings aria-hidden="true" />
        </button>

        <button
          aria-label="Admin profile"
          className="profile-avatar"
          onClick={() => onToast?.('Admin profile settings opened.')}
          type="button"
        >
          <img
            src="/avatar-admin.jpg"
            alt="Admin Avatar"
            className="profile-avatar-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="profile-avatar-fallback">AD</span>
        </button>
      </div>
    </header>
  );
}
