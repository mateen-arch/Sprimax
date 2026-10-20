import React, { useState } from 'react';
import { Search, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar({
  onSendEnquiry,
  onSearchSubmit,
  searchQuery = '',
  onSearchChange,
  onSearchFocus,
  currentSection,
  setCurrentSection,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Products' },
    { id: 'about', label: 'About Us' },
    { id: 'company', label: 'Company' },
    { id: 'resources', label: 'Resources' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  const handleSearchInputFocus = () => {
    if (onSearchFocus) {
      onSearchFocus();
    }
  };

  const handleClearSearch = (e) => {
    e.stopPropagation();
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const handleNavClick = (id) => {
    if (setCurrentSection) {
      setCurrentSection(id);
    }
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="top-navbar">
      <div className="navbar-inner">
        {/* Company Logo */}
        <div className="navbar-brand" onClick={() => handleNavClick('home')}>
          <img 
            src="/logo.png" 
            alt="SPRIMAX Logo" 
            className="brand-logo-img"
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="navbar-links" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item-btn body-md ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span>{item.label}</span>
                {isActive && <span className="nav-active-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* Right Action Section: Search + Send Enquiry Button */}
        <div className="navbar-actions">
          {/* Search SKU or Class */}
          <form className="navbar-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search SKU or Class..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={handleSearchInputFocus}
              onClick={handleSearchInputFocus}
              className="navbar-search-input body-md"
              aria-label="Search SKU or Class"
            />
            {searchQuery && (
              <button
                type="button"
                className="navbar-search-clear-btn"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
            <button type="submit" className="navbar-search-btn" aria-label="Submit search">
              <Search size={16} strokeWidth={2} />
            </button>
          </form>

          {/* SEND ENQUIRY Button */}
          <button 
            type="button" 
            className="btn-send-enquiry"
            onClick={onSendEnquiry}
          >
            SEND ENQUIRY
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          <div className="mobile-search-row">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <input
                type="text"
                placeholder="Search SKU or Class..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={handleSearchInputFocus}
                onClick={handleSearchInputFocus}
                className="navbar-search-input body-md"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="navbar-search-clear-btn"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="navbar-search-btn">
                <Search size={16} />
              </button>
            </form>
          </div>

          <div className="mobile-links-list">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mobile-link-item body-md ${currentSection === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span>{item.label}</span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>

          <div className="mobile-cta-wrap">
            <button 
              type="button" 
              className="btn-send-enquiry btn-block"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onSendEnquiry) onSendEnquiry();
              }}
            >
              SEND ENQUIRY
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
