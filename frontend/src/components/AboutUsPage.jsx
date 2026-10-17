import React from 'react';
import aboutHeroBg from '../assets/about-hero-bg.jpg';
import aboutWeldedJoint from '../assets/about-welded-joint.png';
import iconMissionRobot from '../assets/icon-mission-robot.png';
import iconVisionGlobe from '../assets/icon-vision-globe.png';

export default function AboutUsPage() {
  return (
    <div className="about-page-wrapper">
      {/* 1. Hero Section (Simply just the user-provided image without any gradient or color overlays) */}
      <section className="about-hero-section">
        <img 
          src={aboutHeroBg} 
          alt="Heavy Industrial Automated Welding Facility" 
          className="about-hero-bg-img" 
        />

        <div className="about-hero-content-box">
          <h1 className="about-hero-title headline-lg">
            DECADES OF EXCELLENCE IN WELDING SOLUTIONS
          </h1>
          <p className="about-hero-subtitle body-md">
            Engineered precision for heavy industry. We forge the connections that build the modern world.
          </p>
        </div>
      </section>

      {/* 2. Forging the Future Since 1984 Section */}
      <section className="about-future-section">
        <div className="about-future-container">
          <div className="about-future-layout-grid">
            {/* Left Column: Story & History */}
            <div className="about-future-text-col">
              <div className="about-future-title-row">
                <span className="about-accent-bar" aria-hidden="true" />
                <h2 className="about-future-title headline-md">
                  Forging the Future Since 1984
                </h2>
              </div>

              <div className="about-future-body-text">
                <p className="about-future-p body-md">
                  WELD-TECH INDUSTRIAL has been at the forefront of metallurgical innovation for over four decades. We provide industrial-grade welding consumables and technical support to the most demanding sectors, including shipbuilding, aerospace, and heavy infrastructure.
                </p>
                <p className="about-future-p body-md">
                  Our commitment to rigorous quality control and structural integrity ensures that every product we manufacture meets strict ISO and CE certifications. We don&apos;t just supply materials; we engineer solutions that withstand extreme operational stress.
                </p>
              </div>
            </div>

            {/* Right Column: Architectural Corner Bracket Framed Photo */}
            <div className="about-future-img-col">
              <div className="about-blueprint-frame-wrap">
                {/* Architectural Corner Brackets */}
                <div className="about-bracket-tr" aria-hidden="true" />
                <div className="about-bracket-bl" aria-hidden="true" />

                <div className="about-photo-card">
                  <img 
                    src={aboutWeldedJoint} 
                    alt="Close up precision multi-pass welded steel joint" 
                    className="about-welded-photo" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Philosophy: Mission, Vision & Values Section */}
      <section className="about-philosophy-section">
        <div className="about-philosophy-container">
          {/* Section Header */}
          <div className="about-philosophy-header">
            <span className="about-philosophy-eyebrow data-tabular">CORE PHILOSOPHY</span>
            <h2 className="about-philosophy-title headline-md">
              Mission, Vision &amp; Values
            </h2>
          </div>

          {/* Unified 3-Column Structured Grid matching reference layout */}
          <div className="about-philosophy-grid">
            {/* Top Left: Our Mission (Column 1) */}
            <div className="about-card about-mission-card">
              <div className="about-icon-square dark-navy-icon-box">
                <img 
                  src={iconMissionRobot} 
                  alt="Robotic Arm Automation Icon" 
                  className="about-icon-img" 
                />
              </div>
              <h3 className="about-card-title headline-sm">Our Mission</h3>
              <p className="about-card-desc body-md">
                To engineer and deliver the most reliable, high-performance welding consumables that ensure the structural integrity of the world&apos;s critical infrastructure.
              </p>
            </div>

            {/* Top Right: Our Vision (Spans Columns 2 & 3) */}
            <div className="about-card about-vision-card">
              <div className="about-icon-square orange-icon-box">
                <img 
                  src={iconVisionGlobe} 
                  alt="Global Reach World Icon" 
                  className="about-icon-img" 
                />
              </div>
              <h3 className="about-card-title headline-sm">Our Vision</h3>
              <p className="about-card-desc body-md">
                To be the undisputed global authority in metallurgical joining technologies, setting the standard for technical rigor, innovation, and unwavering reliability in heavy industry applications across all continents.
              </p>
            </div>

            {/* Bottom Left: Uncompromising Quality (Column 1) */}
            <div className="about-card about-value-card">
              <div className="about-value-icon-box" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h4 className="about-value-title headline-xs">Uncompromising Quality</h4>
              <p className="about-value-desc body-sm">
                Strict adherence to international standards and rigorous batch testing.
              </p>
            </div>

            {/* Bottom Center: Technical Expertise (Column 2) */}
            <div className="about-card about-value-card">
              <div className="about-value-icon-box" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <circle cx="19" cy="8" r="1.5" />
                  <path d="M19 5.5v1" />
                  <path d="M19 9.5v1" />
                  <path d="M17 6.5l.8.5" />
                  <path d="M20.2 8.5l.8.5" />
                  <path d="M17 9.5l.8-.5" />
                  <path d="M20.2 7.5l.8-.5" />
                </svg>
              </div>
              <h4 className="about-value-title headline-xs">Technical Expertise</h4>
              <p className="about-value-desc body-sm">
                Deep metallurgical knowledge driving continuous product innovation.
              </p>
            </div>

            {/* Bottom Right: Reliable Partnership (Column 3) */}
            <div className="about-card about-value-card">
              <div className="about-value-icon-box" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.6-4.6a2 2 0 0 0 0-2.8l-3.2-3.2a2 2 0 0 0-2.8 0L9.4 12" />
                  <path d="m13 7.5 1.5 1.5" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h1.5" />
                  <path d="M14 4h2a2 2 0 0 1 2 2v2" />
                  <path d="m3 14 3-3a2 2 0 0 1 2.8 0l1.8 1.8" />
                </svg>
              </div>
              <h4 className="about-value-title headline-xs">Reliable Partnership</h4>
              <p className="about-value-desc body-sm">
                Dedicated support and consistent supply chains for our industrial distributors.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
