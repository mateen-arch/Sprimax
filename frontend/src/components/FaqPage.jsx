import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import './FaqPage.css';

export default function FaqPage({ onNavigateToContact }) {
  const [activeCategory, setActiveCategory] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({
    'flux-core-storage': true, // Open by default matching reference image
  });

  const categories = [
    { id: 'products', label: 'Products' },
    { id: 'technical', label: 'Technical Support' },
    { id: 'ordering', label: 'Ordering Process' },
    { id: 'certifications', label: 'Certifications' },
  ];

  const faqData = {
    products: [
      {
        id: 'flux-core-storage',
        question: 'What is the optimal storage temperature for flux-cored wires?',
        answer:
          'Flux-cored wires should be stored in their original, unopened packaging in a dry environment. The optimal storage conditions are a temperature between 15°C and 25°C (59°F and 77°F) with a relative humidity not exceeding 50%.',
        spec: {
          title: 'TECHNICAL SPEC: STORAGE',
          rows: [
            { label: 'Temp Range', value: '15°C - 25°C' },
            { label: 'Max Humidity', value: '50% RH' },
          ],
        },
      },
      {
        id: 'robotic-welding',
        question: 'Are Sprimax solid wires suitable for robotic welding applications?',
        answer:
          'Yes, Sprimax precision-wound solid MIG/MAG wires are engineered specifically for high-speed automated and robotic welding setups, featuring uniform cast and helix to ensure zero bird-nesting and smooth wire feedability.',
      },
      {
        id: 'lot-numbers',
        question: 'How do I interpret the lot numbers on product packaging?',
        answer:
          'Our lot numbering system encapsulates the manufacturing melt heat number, production facility code, and spooling batch timestamp. This full trace allows complete 3.1 chemical and mechanical inspection certificate verification.',
      },
    ],
    technical: [
      {
        id: 'shielding-gas',
        question: 'What shielding gas blend is recommended for 71T-1 flux-cored wires?',
        answer:
          'For all-position structural applications, 100% CO2 or an 75/25 Argon/CO2 blend produces superior arc stability, reduced spatter levels, and optimal slag peeling properties according to AWS A5.20 specifications.',
      },
      {
        id: 'preheat-temperatures',
        question: 'How do I determine the necessary preheat and interpass temperatures?',
        answer:
          'Preheat temperatures depend on carbon equivalent (CE), material thickness, and joint restraint. Refer to our Technical Data Sheets (TDS) or consult AWS D1.1 Table 3.2 for minimum preheat requirements.',
      },
    ],
    ordering: [
      {
        id: 'minimum-order',
        question: 'What is the minimum order quantity (MOQ) for industrial shipments?',
        answer:
          'Standard pallet shipments start at 500 kg for spool packaging or 1,000 kg for drum packs. Bulk container deliveries can be customized per project procurement schedules.',
      },
      {
        id: 'lead-times',
        question: 'What are standard fulfillment lead times for consumable pallets?',
        answer:
          'In-stock standard grades (E7018, ER70S-6, E71T-1) dispatch within 48 to 72 business hours. Customized alloying or high-tonnage mill runs average 2 to 3 weeks.',
      },
    ],
    certifications: [
      {
        id: 'mill-test-reports',
        question: 'Where can I download Mill Test Certificates (MTRs) and EN 10204 3.1 certs?',
        answer:
          'Certified MTRs can be downloaded instantly from our Technical Resources download hub using your pallet barcode, invoice ID, or heat number.',
      },
      {
        id: 'third-party-approvals',
        question: 'Which international classification societies approve Sprimax consumables?',
        answer:
          'Sprimax welding electrodes and wires carry certified credentials from ABS, DNV-GL, Lloyd’s Register, TÜV Rheinland, ASME Boiler & Pressure Vessel Code (Sec IX), and AWS D1.1.',
      },
    ],
  };

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter FAQs based on search and active category
  const filteredFaqs = (faqData[activeCategory] || []).filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
  });

  const activeCategoryObj = categories.find((c) => c.id === activeCategory);

  return (
    <div className="faq-page-wrapper">
      <div className="faq-container">
        {/* Page Title & Subtitle */}
        <div className="faq-hero-block">
          <h1 className="faq-main-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">
            Find answers to technical specifications, ordering processes, and product support for Sprimax Industrial solutions.
          </p>

          {/* Search Box */}
          <div className="faq-search-box">
            <Search size={16} className="faq-search-icon" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technical documentation or FAQs..."
              className="faq-search-input"
            />
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="faq-main-layout">
          {/* Left Category Tabs */}
          <aside className="faq-sidebar">
            <nav className="faq-nav-list" aria-label="FAQ Categories">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`faq-nav-btn ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Accordion Panel */}
          <main className="faq-content-area">
            <h2 className="faq-category-title">{activeCategoryObj?.label || 'Products'}</h2>

            <div className="faq-accordion-list">
              {filteredFaqs.length === 0 ? (
                <div className="faq-empty-state">
                  No questions found matching your search. Please try another query or contact our engineering team.
                </div>
              ) : (
                filteredFaqs.map((item) => {
                  const isOpen = !!openItems[item.id];
                  return (
                    <div key={item.id} className="faq-card">
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="faq-question-btn"
                        aria-expanded={isOpen}
                      >
                        <span className="faq-question-text">{item.question}</span>
                        {isOpen ? (
                          <ChevronUp size={18} className="faq-chevron-icon" />
                        ) : (
                          <ChevronDown size={18} className="faq-chevron-icon" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="faq-answer-panel">
                          <p className="faq-answer-text">{item.answer}</p>

                          {item.spec && (
                            <div className="faq-spec-box">
                              <div className="faq-spec-header">{item.spec.title}</div>
                              <div className="faq-spec-content">
                                {item.spec.rows.map((row, idx) => (
                                  <div key={idx} className="faq-spec-row">
                                    <span className="faq-spec-label">{row.label}</span>
                                    <span className="faq-spec-val">{row.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>

        {/* Bottom Banner: Still need technical assistance? */}
        <section className="faq-bottom-banner">
          <div className="faq-banner-text">
            <h3 className="faq-banner-heading">Still need technical assistance?</h3>
            <p className="faq-banner-sub">
              Our engineering team is available for project-specific consultations.
            </p>
          </div>
          <button
            type="button"
            className="faq-banner-btn"
            onClick={onNavigateToContact}
          >
            CONTACT TECHNICAL SUPPORT
          </button>
        </section>
      </div>
    </div>
  );
}
