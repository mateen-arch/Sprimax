import { useState } from 'react';
import {
  CircleHelp,
  CircleUserRound,
  Grid2X2,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Package,
  PanelsTopLeft,
  ChevronDown,
  ChevronUp,
  Settings,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import './AdminSidebar.css';

const topNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Catalogue', icon: Package },
  { label: 'Blogs', icon: BookOpen },
];

export default function AdminSidebar({
  currentNav = 'Catalogue',
  onNavigate,
  onLogout,
  mobileOpen = false,
  setMobileOpen,
}) {
  const isEnquiriesActive = [
    'Enquiries',
    'Product Enquiries',
    'Dealer Enquiries',
    'Technical Support',
    'Project Requirements',
    'EnquiryDetails',
  ].includes(currentNav);

  const isManagementActive = [
    'Management',
    'Content Management',
    'Download Management',
    'Certifications Management',
    'Industries Management',
    'Banner Management',
  ].includes(currentNav);

  const isCareersActive = [
    'Careers',
    'CareersJobs',
    'AddCareersJob',
    'EditCareersJob',
    'PreviewCareersJob',
    'CareersApplications',
  ].includes(currentNav);

  const [enquiriesOpen, setEnquiriesOpen] = useState(isEnquiriesActive);
  const [managementOpen, setManagementOpen] = useState(isManagementActive);
  const [careersOpen, setCareersOpen] = useState(isCareersActive);

  const handleNavClick = (label) => {
    setMobileOpen?.(false);
    onNavigate?.(label);
  };

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="sidebar-scrim"
          onClick={() => setMobileOpen?.(false)}
          type="button"
        />
      )}

      <aside className={`admin-sidebar${mobileOpen ? ' admin-sidebar--open' : ''}`}>
        <a
          className="sidebar-brand"
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('Dashboard');
          }}
        >
          <img src="/logo-white.png" alt="Sprimax" />
        </a>

        <nav aria-label="Admin navigation" className="sidebar-navigation">
          {topNavItems.map(({ label, icon: Icon }) => {
            const isActive =
              currentNav === label ||
              (label === 'Blogs' && ['Blogs', 'AddBlog', 'EditBlog', 'PreviewBlog'].includes(currentNav));
            return (
              <button
                key={label}
                aria-current={isActive ? 'page' : undefined}
                className={`sidebar-link${isActive ? ' sidebar-link--active' : ''}`}
                onClick={() => handleNavClick(label)}
                type="button"
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}

          {/* Enquiries Collapsible Dropdown */}
          <button
            aria-expanded={enquiriesOpen}
            className={`sidebar-link sidebar-link--enquiries${isEnquiriesActive ? ' sidebar-link--active' : ''}`}
            onClick={() => {
              setEnquiriesOpen((open) => !open);
              if (!enquiriesOpen && !isEnquiriesActive) {
                handleNavClick('Product Enquiries');
              }
            }}
            type="button"
          >
            <MessagesSquare aria-hidden="true" />
            <span>Enquiries</span>
            {enquiriesOpen ? (
              <ChevronUp className="sidebar-chevron" aria-hidden="true" />
            ) : (
              <ChevronDown className="sidebar-chevron" aria-hidden="true" />
            )}
          </button>

          {enquiriesOpen && (
            <div className="sidebar-subnav">
              <button
                type="button"
                className={`sidebar-subnav-btn${currentNav === 'Product Enquiries' || currentNav === 'Enquiries' ? ' active' : ''}`}
                onClick={() => handleNavClick('Product Enquiries')}
              >
                Product Enquiries
              </button>
              <button
                type="button"
                className={`sidebar-subnav-btn${currentNav === 'Dealer Enquiries' ? ' active' : ''}`}
                onClick={() => handleNavClick('Dealer Enquiries')}
              >
                Dealer Enquiries
              </button>
              <button
                type="button"
                className={`sidebar-subnav-btn${currentNav === 'Technical Support' ? ' active' : ''}`}
                onClick={() => handleNavClick('Technical Support')}
              >
                Technical Support
              </button>
              <button
                type="button"
                className={`sidebar-subnav-btn${currentNav === 'Project Requirements' ? ' active' : ''}`}
                onClick={() => handleNavClick('Project Requirements')}
              >
                Project Requirements
              </button>
            </div>
          )}

          {/* Categories */}
          <button
            aria-current={currentNav === 'Categories' ? 'page' : undefined}
            className={`sidebar-link${currentNav === 'Categories' ? ' sidebar-link--active' : ''}`}
            onClick={() => handleNavClick('Categories')}
            type="button"
          >
            <Grid2X2 aria-hidden="true" />
            <span>Categories</span>
          </button>

          <button
            aria-expanded={managementOpen}
            className={`sidebar-link sidebar-link--management${isManagementActive ? ' sidebar-link--active' : ''}`}
            onClick={() => setManagementOpen((open) => !open)}
            type="button"
          >
            <PanelsTopLeft aria-hidden="true" />
            <span>Management</span>
            {managementOpen ? (
              <ChevronUp className="sidebar-chevron" aria-hidden="true" />
            ) : (
              <ChevronDown className="sidebar-chevron" aria-hidden="true" />
            )}
          </button>

          {managementOpen && (
            <div className="sidebar-subnav">
              <button
                type="button"
                className={`sidebar-subnav-btn${currentNav === 'Content Management' ? ' active' : ''}`}
                onClick={() => handleNavClick('Content Management')}
              >
                Content Management
              </button>
              <button
                type="button"
                className={`sidebar-subnav-btn${currentNav === 'Download Management' ? ' active' : ''}`}
                onClick={() => handleNavClick('Download Management')}
              >
                Download Management
              </button>
              <button
                type="button"
                className={`sidebar-subnav-btn${currentNav === 'Certifications Management' ? ' active' : ''}`}
                onClick={() => handleNavClick('Certifications Management')}
              >
                Certifications Management
              </button>
              <button
                type="button"
                className={`sidebar-subnav-btn${currentNav === 'Industries Management' ? ' active' : ''}`}
                onClick={() => handleNavClick('Industries Management')}
              >
                Industries Management
              </button>
              <button
                type="button"
                className={`sidebar-subnav-btn${currentNav === 'Banner Management' ? ' active' : ''}`}
                onClick={() => handleNavClick('Banner Management')}
              >
                Banner Management
              </button>
            </div>
          )}

          {/* Careers Collapsible Dropdown */}
          <button
            aria-expanded={careersOpen}
            className={`sidebar-link sidebar-link--careers${isCareersActive ? ' sidebar-link--active' : ''}`}
            onClick={() => {
              setCareersOpen((open) => !open);
              if (!careersOpen && !isCareersActive) {
                handleNavClick('CareersJobs');
              }
            }}
            type="button"
          >
            <Briefcase aria-hidden="true" />
            <span>Careers</span>
            {careersOpen ? (
              <ChevronUp className="sidebar-chevron" aria-hidden="true" />
            ) : (
              <ChevronDown className="sidebar-chevron" aria-hidden="true" />
            )}
          </button>

          {careersOpen && (
            <div className="sidebar-subnav">
              <button
                type="button"
                className={`sidebar-subnav-btn${['CareersJobs', 'AddCareersJob', 'EditCareersJob', 'PreviewCareersJob'].includes(currentNav) ? ' active' : ''}`}
                onClick={() => handleNavClick('CareersJobs')}
              >
                Job Postings
              </button>
              <button
                type="button"
                className={`sidebar-subnav-btn${currentNav === 'CareersApplications' ? ' active' : ''}`}
                onClick={() => handleNavClick('CareersApplications')}
              >
                Applications
              </button>
            </div>
          )}

          <button
            className={`sidebar-link${currentNav === 'Global Settings' ? ' sidebar-link--active' : ''}`}
            onClick={() => handleNavClick('Global Settings')}
            type="button"
          >
            <Settings aria-hidden="true" />
            <span>Global Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className={`sidebar-link sidebar-link--footer${currentNav === 'Admin Profile' ? ' sidebar-link--active' : ''}`}
            onClick={() => handleNavClick('Admin Profile')}
            type="button"
          >
            <CircleUserRound aria-hidden="true" />
            <span>Admin Profile</span>
          </button>
          <button
            className={`sidebar-link sidebar-link--footer${currentNav === 'Help/Support' ? ' sidebar-link--active' : ''}`}
            onClick={() => handleNavClick('Help/Support')}
            type="button"
          >
            <CircleHelp aria-hidden="true" />
            <span>Help/Support</span>
          </button>
          <button
            className="sidebar-link sidebar-link--footer sidebar-link--logout"
            onClick={onLogout}
            type="button"
          >
            <LogOut aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
