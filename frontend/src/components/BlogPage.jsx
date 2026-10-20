import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Calendar,
  Clock,
  Share2,
  Printer,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Wrench,
  FileText,
  Headphones,
  Check,
  ChevronRight as BreadcrumbChevron,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/cloudinary.js';
import './BlogPage.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Robotic arm technical vector watermark matching design
function RoboticArmWatermark() {
  return (
    <svg
      className="blog-watermark-robot"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 90 H85 M30 90 L38 75 H62 L70 90" />
      <rect x="42" y="65" width="16" height="10" rx="2" />
      <line x1="50" y1="65" x2="68" y2="40" />
      <circle cx="68" cy="40" r="4" fill="currentColor" />
      <line x1="68" y1="40" x2="48" y2="25" />
      <circle cx="48" cy="25" r="3.5" fill="currentColor" />
      <line x1="48" y1="25" x2="38" y2="28" />
      <path d="M38 22 L28 25 M38 34 L28 31" />
      <circle cx="36" cy="28" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default function BlogPage({
  initialArticleSlug = null,
  onBackToHome,
  onSendEnquiry,
  onViewProductDetails,
  onNavigateContact,
}) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [gridArticles, setGridArticles] = useState([]);
  const [activeArticle, setActiveArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load Categories from Database
  useEffect(() => {
    fetch(`${API_BASE}/blogs/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Public Blogs in Real-time from Database
  const fetchPublicArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPageNum,
        limit: 9,
      });
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const res = await fetch(`${API_BASE}/blogs/public?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load published blogs');
      const data = await res.json();

      setFeaturedArticle(data.featuredBlog || null);
      setGridArticles(data.blogs || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Unable to connect to articles database');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, currentPageNum]);

  useEffect(() => {
    fetchPublicArticles();
  }, [fetchPublicArticles]);

  // Load Single Article if initialArticleSlug is provided
  useEffect(() => {
    if (initialArticleSlug) {
      fetch(`${API_BASE}/blogs/${encodeURIComponent(initialArticleSlug)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Article not found');
          return res.json();
        })
        .then((data) => {
          if (data.blog) {
            setActiveArticle(data.blog);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        })
        .catch(() => {});
    }
  }, [initialArticleSlug]);

  // Update SEO Document Meta when Active Article changes
  useEffect(() => {
    if (activeArticle) {
      const title = activeArticle.seo?.metaTitle || activeArticle.title || 'Technical Article | Sprimax';
      document.title = `${title} | Sprimax Engineering`;

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          activeArticle.seo?.metaDescription || activeArticle.summary || ''
        );
      }

      // JSON-LD structured data
      const jsonLdScript = document.getElementById('blog-article-jsonld') || document.createElement('script');
      jsonLdScript.id = 'blog-article-jsonld';
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: activeArticle.title,
        description: activeArticle.summary,
        image: activeArticle.bannerImageUrl,
        datePublished: activeArticle.publishedAt,
        dateModified: activeArticle.updatedAt,
        author: {
          '@type': 'Organization',
          name: activeArticle.author?.name || 'Sprimax Metallurgical Division',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Sprimax',
          logo: {
            '@type': 'ImageObject',
            url: window.location.origin + '/logo-white.png',
          },
        },
      });
      if (!document.getElementById('blog-article-jsonld')) {
        document.head.appendChild(jsonLdScript);
      }
    } else {
      document.title = 'Industrial Insights & Technical Knowledge | Sprimax';
    }

    return () => {
      const existingJsonLd = document.getElementById('blog-article-jsonld');
      if (existingJsonLd) existingJsonLd.remove();
    };
  }, [activeArticle]);

  // Select an Article to View
  const handleSelectArticle = (article) => {
    if (!article) return;
    // If full content is already loaded, set directly, otherwise fetch by slug/ID
    if (article.content && Array.isArray(article.content)) {
      setActiveArticle(article);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const identifier = article.slug || article._id;
      fetch(`${API_BASE}/blogs/${encodeURIComponent(identifier)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.blog) {
            setActiveArticle(data.blog);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        })
        .catch(() => {
          setActiveArticle(article);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
  };

  const handleBackToList = () => {
    setActiveArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async () => {
    const shareData = {
      title: activeArticle?.title || 'Sprimax Technical Article',
      text: activeArticle?.summary || '',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        // Fallback to copy link
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="blog-page-root">
      {/* =========================================================================
          VIEW 1: ARTICLE DETAIL VIEW
          ========================================================================= */}
      {activeArticle ? (
        <article className="blog-detail-container">
          {/* Breadcrumbs */}
          <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
            <button
              type="button"
              className="blog-breadcrumb-link"
              onClick={onBackToHome}
            >
              Home
            </button>
            <BreadcrumbChevron size={14} className="blog-breadcrumb-chevron" />
            <button
              type="button"
              className="blog-breadcrumb-link"
              onClick={handleBackToList}
            >
              Technical Data
            </button>
            <BreadcrumbChevron size={14} className="blog-breadcrumb-chevron" />
            <span className="blog-breadcrumb-current" aria-current="page">
              {activeArticle.title}
            </span>
          </nav>

          {/* Two Column Layout */}
          <div className="blog-detail-layout">
            {/* Left Main Article Column */}
            <div className="blog-detail-main">
              <header className="blog-article-header">
                <h1 className="blog-article-title">{activeArticle.title}</h1>

                <div className="blog-article-meta-row">
                  <div className="blog-meta-item">
                    <User size={16} className="blog-meta-icon" />
                    <span>{activeArticle.author?.name || activeArticle.author || 'Metallurgical R&D Division'}</span>
                  </div>
                  <div className="blog-meta-item">
                    <Calendar size={16} className="blog-meta-icon" />
                    <span>
                      {activeArticle.formattedPublishedDate ||
                        (activeArticle.publishedAt
                          ? new Date(activeArticle.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : activeArticle.date || 'October 15, 2024')}
                    </span>
                  </div>
                  <div className="blog-meta-item">
                    <Clock size={16} className="blog-meta-icon" />
                    <span>{activeArticle.readTimeMinutes ? `${activeArticle.readTimeMinutes} min read` : activeArticle.readTime || '10 min read'}</span>
                  </div>
                </div>
              </header>

              {/* Featured Figure / Hero Banner Image */}
              <figure className="blog-article-figure">
                <div className="blog-figure-img-wrap">
                  <img
                    src={getOptimizedImageUrl(activeArticle.bannerImageUrl || activeArticle.image || '/assets/blog-cnc-milling.jpg', 'banner')}
                    alt={activeArticle.bannerAlt || activeArticle.title}
                    className="blog-figure-img"
                  />
                </div>
                {(activeArticle.bannerCaption || activeArticle.figureCaption) && (
                  <figcaption className="blog-figure-caption">
                    {activeArticle.bannerCaption || activeArticle.figureCaption}
                  </figcaption>
                )}
              </figure>

              {/* Dynamic Content Stream (Blocks from MongoDB) */}
              {Array.isArray(activeArticle.content) && activeArticle.content.length > 0 ? (
                <div className="blog-blocks-stream">
                  {activeArticle.content.map((block, idx) => {
                    if (block.type === 'paragraph') {
                      return (
                        <p
                          key={block.id || idx}
                          className={block.isLead ? 'blog-lead-paragraph' : 'blog-body-text'}
                        >
                          {block.content}
                        </p>
                      );
                    }

                    if (block.type === 'heading') {
                      if (block.level === 'h3') {
                        return (
                          <h3 key={block.id || idx} className="blog-subheading-h3">
                            {block.heading}
                          </h3>
                        );
                      }
                      return (
                        <h2 key={block.id || idx} className="blog-section-heading">
                          <span className="blog-heading-accent" />
                          {block.heading}
                        </h2>
                      );
                    }

                    if (block.type === 'image') {
                      return (
                        <figure key={block.id || idx} className="blog-article-figure">
                          <div className="blog-figure-img-wrap">
                            <img
                              src={getOptimizedImageUrl(block.imageUrl, 'featured')}
                              alt={block.alt || 'Technical illustration'}
                              className="blog-figure-img"
                              loading="lazy"
                            />
                          </div>
                          {block.caption && (
                            <figcaption className="blog-figure-caption">
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>
                      );
                    }

                    if (block.type === 'callout') {
                      return (
                        <aside key={block.id || idx} className="blog-callout-box">
                          <div className="blog-callout-icon-col">
                            <Lightbulb size={20} className="blog-callout-bulb-icon" />
                          </div>
                          <div className="blog-callout-content">
                            <h4 className="blog-callout-title">{block.title}</h4>
                            <p className="blog-callout-text">{block.content}</p>
                          </div>
                        </aside>
                      );
                    }

                    if (block.type === 'table') {
                      return (
                        <div key={block.id || idx} className="blog-table-wrapper">
                          {block.caption && (
                            <h4 className="table-heading-caption">{block.caption}</h4>
                          )}
                          <table className="blog-spec-table">
                            {block.headers && (
                              <thead>
                                <tr>
                                  {block.headers.map((h, hIdx) => (
                                    <th key={hIdx}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                            )}
                            <tbody>
                              {(block.rows || []).map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className={cIdx === 0 ? 'cell-highlight' : ''}
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {block.footnote && (
                            <p className="table-footnote-source">{block.footnote}</p>
                          )}
                        </div>
                      );
                    }

                    if (block.type === 'quote') {
                      return (
                        <blockquote key={block.id || idx} className="blog-quote-box">
                          <p>"{block.quote}"</p>
                          {block.attribution && (
                            <cite className="blog-quote-cite">— {block.attribution}</cite>
                          )}
                        </blockquote>
                      );
                    }

                    if (block.type === 'code') {
                      return (
                        <div key={block.id || idx} className="blog-code-container">
                          {block.language && (
                            <div className="blog-code-badge">{block.language}</div>
                          )}
                          <pre className="blog-code-pre">
                            <code>{block.code}</code>
                          </pre>
                        </div>
                      );
                    }

                    if (block.type === 'list') {
                      return block.listType === 'numbered' ? (
                        <ol key={block.id || idx} className="blog-list-block">
                          {(block.items || []).map((item, iIdx) => (
                            <li key={iIdx}>{item}</li>
                          ))}
                        </ol>
                      ) : (
                        <ul key={block.id || idx} className="blog-list-block">
                          {(block.items || []).map((item, iIdx) => (
                            <li key={iIdx}>{item}</li>
                          ))}
                        </ul>
                      );
                    }

                    if (block.type === 'references') {
                      return (
                        <div key={block.id || idx} className="blog-references-container">
                          <h4 className="blog-references-title">References & Applicable Standards</h4>
                          <ol className="blog-references-list">
                            {(block.references || []).map((refItem, rIdx) => (
                              <li key={rIdx}>{refItem}</li>
                            ))}
                          </ol>
                        </div>
                      );
                    }

                    if (block.type === 'featuredProduct') {
                      return (
                        <div key={block.id || idx} className="blog-content-featured-product">
                          <div className="content-fp-badge">
                            <Wrench size={14} />
                            <span>Featured Product Highlight</span>
                          </div>
                          <div className="content-fp-body">
                            {block.image && (
                              <div className="content-fp-img-wrap">
                                <img
                                  src={block.image}
                                  alt={block.name || 'Featured product'}
                                  className="content-fp-img"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/assets/product-placeholder.png';
                                  }}
                                />
                              </div>
                            )}
                            <div className="content-fp-details">
                              {block.sku && <span className="content-fp-sku">SKU: {block.sku}</span>}
                              <h4 className="content-fp-name">{block.name}</h4>
                              {block.description && (
                                <p className="content-fp-desc">{block.description}</p>
                              )}
                              <button
                                type="button"
                                className="content-fp-link-btn"
                                onClick={() => {
                                  if (onViewProductDetails) {
                                    onViewProductDetails({
                                      sku: block.sku,
                                      title: block.name,
                                    });
                                  } else if (onSendEnquiry) {
                                    onSendEnquiry({
                                      sku: block.sku,
                                      title: block.name,
                                    });
                                  }
                                }}
                              >
                                VIEW SPECIFICATIONS <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              ) : (
                /* Fallback if summary only */
                <p className="blog-lead-paragraph">{activeArticle.summary}</p>
              )}

              {/* Share & Print Action Bar */}
              {activeArticle.displayOptions?.showShareButton !== false && (
                <footer className="blog-action-footer">
                  <div className="blog-share-label">SHARE PROTOCOL</div>
                  <div className="blog-action-buttons">
                    <button
                      type="button"
                      className="blog-action-btn"
                      onClick={handleShare}
                      title="Share link"
                      aria-label="Share article"
                    >
                      {copiedLink ? (
                        <Check size={18} className="text-success" />
                      ) : (
                        <Share2 size={18} />
                      )}
                      {copiedLink && (
                        <span className="blog-copied-tooltip">Copied!</span>
                      )}
                    </button>

                    {activeArticle.displayOptions?.showPrintButton !== false && (
                      <button
                        type="button"
                        className="blog-action-btn"
                        onClick={handlePrint}
                        title="Print protocol"
                        aria-label="Print article"
                      >
                        <Printer size={18} />
                      </button>
                    )}
                  </div>
                </footer>
              )}
            </div>

            {/* Right Sidebar */}
            {activeArticle.displayOptions?.showSidebar !== false && (
              <aside className="blog-detail-sidebar">
                {/* Card 1: Featured Product (only shown if user added this section from options in edit blog) */}
                {(() => {
                  const fp = activeArticle.content?.find((b) => b.type === 'featuredProduct' && b.name) ||
                    (activeArticle.featuredProduct?.productId && activeArticle.featuredProduct?.name ? activeArticle.featuredProduct : null);
                  if (!fp) return null;
                  return (
                    <div className="blog-sidebar-card blog-product-card">
                      <div className="blog-card-header">
                        <Wrench size={18} className="blog-header-icon-red" />
                        <h3 className="blog-sidebar-title">Featured Product</h3>
                      </div>

                      <div className="blog-product-preview">
                        <div className="blog-product-thumb-wrap">
                          <img
                            src={getOptimizedImageUrl(fp.image || '/assets/product-lh7018.png', 'thumbnail')}
                            alt={fp.name}
                            className="blog-product-thumb"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/assets/product-placeholder.png';
                            }}
                          />
                        </div>
                        <div className="blog-product-info">
                          <h4 className="blog-product-sku">
                            {fp.name}
                          </h4>
                          {fp.description && (
                            <p className="blog-product-desc">
                              {fp.description}
                            </p>
                          )}
                          <button
                            type="button"
                            className="blog-product-cta-link"
                            onClick={() => {
                              if (onViewProductDetails) {
                                onViewProductDetails({
                                  sku: fp.sku,
                                  title: fp.name,
                                });
                              } else if (onSendEnquiry) {
                                onSendEnquiry({
                                  sku: fp.sku,
                                  title: fp.name,
                                });
                              }
                            }}
                          >
                            VIEW SPECIFICATIONS <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Card 2: Related Articles */}
                <div className="blog-sidebar-card blog-related-card">
                  <div className="blog-card-header">
                    <FileText size={18} className="blog-header-icon-red" />
                    <h3 className="blog-sidebar-title">Related Articles</h3>
                  </div>

                  <div className="blog-related-list">
                    {(activeArticle.relatedArticles && activeArticle.relatedArticles.length > 0
                      ? activeArticle.relatedArticles
                      : gridArticles.slice(0, 3)
                    ).map((item, idx, arr) => (
                      <React.Fragment key={item._id || item.id}>
                        <div
                          className="blog-related-item"
                          onClick={() => handleSelectArticle(item)}
                          role="button"
                          tabIndex={0}
                        >
                          <h4 className="blog-related-item-title">
                            {item.title}
                          </h4>
                          <span className="blog-related-item-meta">
                            {item.category || item.author?.name || 'Technical'} •{' '}
                            {item.formattedPublishedDate ||
                              (item.publishedAt
                                ? new Date(item.publishedAt)
                                    .toISOString()
                                    .slice(0, 10)
                                    .replace(/-/g, '.')
                                : item.date || '2024.10.15')}
                          </span>
                        </div>
                        {idx < arr.length - 1 && (
                          <hr className="blog-related-divider" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Card 3: Require Technical Assistance? (Always present) */}
                <div className="blog-sidebar-card blog-cta-card">
                  <div className="blog-cta-icon-wrap">
                    <Headphones size={28} className="blog-cta-icon" />
                  </div>
                  <h3 className="blog-cta-title">
                    Require Technical Assistance?
                  </h3>
                  <p className="blog-cta-desc">
                    Our metallurgical engineers are available for consultation on complex structural fabrication challenges.
                  </p>
                  <button
                    type="button"
                    className="blog-cta-btn"
                    onClick={() => {
                      if (onNavigateContact) {
                        onNavigateContact();
                      }
                    }}
                  >
                    SUBMIT TECHNICAL ENQUIRY
                  </button>
                </div>
              </aside>
            )}
          </div>
        </article>
      ) : (
        /* =========================================================================
           VIEW 2: BLOG OVERVIEW / LISTING VIEW
           ========================================================================= */
        <div className="blog-listing-container">
          {/* Header */}
          <header className="blog-listing-header">
            <h1 className="blog-listing-main-heading">
              INDUSTRIAL INSIGHTS & TECHNICAL KNOWLEDGE
            </h1>
            <p className="blog-listing-subhead">
              Expert analysis, metallurgical breakthroughs, safety protocols,
              and technical deep-dives for engineering professionals.
            </p>
            <div className="blog-header-rule" />
          </header>

          {/* Filter Pills */}
          <div className="blog-filter-bar">
            <button
              type="button"
              className={`blog-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory('all');
                setCurrentPageNum(1);
              }}
            >
              All Topics
            </button>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat._id || cat.slug}
                  type="button"
                  className={`blog-filter-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setCurrentPageNum(1);
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Loading & Empty States */}
          {loading ? (
            <div className="blog-loading-skeleton-wrap" style={{ padding: '60px 0', textAlign: 'center' }}>
              <div className="editor-spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b', fontSize: '15px' }}>Loading industrial insights...</p>
            </div>
          ) : error ? (
            <div className="blog-error-banner" style={{ textAlign: 'center', padding: '40px 20px', color: '#dc2626' }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 10px' }} />
              <p>{error}</p>
              <button
                type="button"
                onClick={fetchPublicArticles}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: '#0F172A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Featured Article Card */}
              {featuredArticle && (
                <div
                  className="blog-featured-card"
                  onClick={() => handleSelectArticle(featuredArticle)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Featured: ${featuredArticle.title}`}
                >
                  {/* Technical Watermark Icon in background */}
                  <RoboticArmWatermark />

                  <div className="blog-featured-layout">
                    {/* Left Image */}
                    <div className="blog-featured-media">
                      <img
                        src={getOptimizedImageUrl(featuredArticle.bannerImageUrl || featuredArticle.image || '/assets/blog-cnc-milling.jpg', 'featured')}
                        alt={featuredArticle.bannerAlt || featuredArticle.title}
                        className="blog-featured-img"
                      />
                    </div>

                    {/* Right Content */}
                    <div className="blog-featured-content">
                      <div className="blog-featured-meta-row">
                        <span className="blog-badge-outline-red">
                          {featuredArticle.category?.toUpperCase() || 'METALLURGY'}
                        </span>
                        <span className="blog-date-tabular">
                          {featuredArticle.formattedPublishedDate ||
                            (featuredArticle.publishedAt
                              ? new Date(featuredArticle.publishedAt)
                                  .toISOString()
                                  .slice(0, 10)
                                  .replace(/-/g, '.')
                              : '2024.10.15')}
                        </span>
                      </div>

                      <h2 className="blog-featured-title">
                        {featuredArticle.title}
                      </h2>

                      <p className="blog-featured-excerpt">
                        {featuredArticle.summary || featuredArticle.excerpt}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 3-Column Grid of Articles */}
              <div className="blog-grid-section">
                <div className="blog-cards-grid">
                  {gridArticles.map((article) => {
                    const formattedDate =
                      article.formattedPublishedDate ||
                      (article.publishedAt
                        ? new Date(article.publishedAt)
                            .toISOString()
                            .slice(0, 10)
                            .replace(/-/g, '.')
                        : '2024.10.15');

                    return (
                      <article
                        key={article._id || article.id}
                        className="blog-grid-card"
                        onClick={() => handleSelectArticle(article)}
                        role="button"
                        tabIndex={0}
                      >
                        {/* Card Thumbnail with Red Category Tag */}
                        <div className="blog-card-media-wrap">
                          <img
                            src={getOptimizedImageUrl(article.bannerImageUrl || article.image || '/assets/blog-cnc-milling.jpg', 'card')}
                            alt={article.bannerAlt || article.title}
                            className="blog-card-img"
                            loading="lazy"
                          />
                          <div className="blog-card-badge-red">
                            {article.category?.toUpperCase() || 'METALLURGY'}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="blog-card-body">
                          <div className="blog-card-date data-tabular">
                            {formattedDate}
                          </div>
                          <h3 className="blog-card-title">{article.title}</h3>
                          <p className="blog-card-excerpt">
                            {article.summary || article.excerpt}
                          </p>

                          <div className="blog-card-footer">
                            <span className="blog-view-details-link">
                              VIEW DETAILS <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Pagination */}
              {totalPages > 1 && (
                <div className="blog-pagination-wrapper">
                  <hr className="blog-pagination-divider" />
                  <nav className="blog-pagination" aria-label="Pagination">
                    <button
                      type="button"
                      className="blog-page-btn blog-page-nav"
                      onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                      disabled={currentPageNum === 1}
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`blog-page-btn ${currentPageNum === num ? 'active' : ''}`}
                        onClick={() => setCurrentPageNum(num)}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="blog-page-btn blog-page-nav"
                      onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPageNum === totalPages}
                      aria-label="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
