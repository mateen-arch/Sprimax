import React from 'react';
import { Briefcase, ArrowLeft, Send } from 'lucide-react';
import './ComingSoonPage.css';

export default function ComingSoonPage({ pageName = 'Page', onBack, onNavigateToContact }) {
  return (
    <div className="coming-soon-wrapper">
      <div className="coming-soon-container">
        {/* Navigation Breadcrumb */}
        {onBack && (
          <div className="coming-soon-top-bar">
            <button
              type="button"
              className="coming-soon-back-btn"
              onClick={onBack}
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </button>
          </div>
        )}

        <div className="coming-soon-card">
          <div className="coming-soon-badge">
            <span className="coming-soon-dot" />
            <span>SPRIMAX INDUSTRIAL • UNDER DEVELOPMENT</span>
          </div>

          <h1 className="coming-soon-title">
            {pageName} <span className="coming-soon-highlight">Coming Soon</span>
          </h1>

          <p className="coming-soon-description">
            We are engineering a comprehensive {pageName.toLowerCase()} experience featuring
            advanced technical insights, industrial career opportunities, and metallurgical
            advancements. Check back soon for updates.
          </p>

          <div className="coming-soon-actions">
            <button
              type="button"
              className="coming-soon-btn-primary"
              onClick={onNavigateToContact}
            >
              <Send size={15} />
              <span>GET IN TOUCH WITH OUR TEAM</span>
            </button>
            {onBack && (
              <button
                type="button"
                className="coming-soon-btn-secondary"
                onClick={onBack}
              >
                RETURN HOME
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
