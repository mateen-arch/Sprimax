import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Calendar,
  User,
  Clock,
  Share2,
  Printer,
  Wrench,
  FileText,
  Headphones,
  Check,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import { fetchBlogById } from './api/blogs.js';
import './BlogPreviewPage.css';

export default function BlogPreviewPage({
  blogId,
  onBackToEditor,
}) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Viewport mode: 'desktop' | 'tablet' | 'mobile'
  const [viewport, setViewport] = useState('desktop');

  useEffect(() => {
    if (!blogId) return;
    setLoading(true);
    fetchBlogById(blogId, true)
      .then((res) => {
        setBlog(res.blog);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load blog preview');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [blogId]);

  if (loading) {
    return (
      <div className="preview-loading-screen">
        <div className="preview-spinner" />
        <p>Generating technical preview...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="preview-error-screen">
        <AlertTriangle size={36} color="#FF0804" />
        <h3>Failed to generate preview</h3>
        <p>{error || 'Article not found'}</p>
        <button type="button" onClick={onBackToEditor} className="btn-preview-back">
          Back to Editor
        </button>
      </div>
    );
  }

  const publishedDateText =
    blog.formattedPublishedDate ||
    (blog.publishedAt
      ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }));

  return (
    <div className="blog-preview-container">
      {/* Top Banner Notice */}
      <header className="preview-top-toolbar">
        <div className="toolbar-left">
          <button type="button" onClick={onBackToEditor} className="btn-exit-preview">
            <ArrowLeft size={16} />
            <span>Back to Editor</span>
          </button>
          <div className="preview-mode-tag">
            <Eye size={14} />
            <span>Preview Mode (Draft & Server Simulation)</span>
          </div>
        </div>

        {/* Viewport Toggles (Desktop, Tablet, Mobile) */}
        <div className="toolbar-center">
          <div className="viewport-toggle-group">
            <button
              type="button"
              className={`btn-viewport ${viewport === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewport('desktop')}
              title="Desktop View (100%)"
            >
              <Monitor size={16} />
            </button>
            <button
              type="button"
              className={`btn-viewport ${viewport === 'tablet' ? 'active' : ''}`}
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
            >
              <Tablet size={16} />
            </button>
            <button
              type="button"
              className={`btn-viewport ${viewport === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewport('mobile')}
              title="Mobile View (375px)"
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <span className="slug-display">/blog/{blog.slug}</span>
        </div>
      </header>

      {/* Viewport Frame Wrapper */}
      <div className="preview-viewport-outer">
        <div className={`preview-viewport-frame frame-${viewport}`}>
          {/* DETAIL VIEW PREVIEW (Reuses exact layout and CSS of public detail page) */}
          <article className="public-detail-mirror">
            {/* Breadcrumb */}
            <nav className="preview-breadcrumb">
              <span>Home</span>
              <ChevronRight size={13} className="bc-chevron" />
              <span>Technical Data</span>
              <ChevronRight size={13} className="bc-chevron" />
              <span className="bc-current">{blog.title}</span>
            </nav>

            <div className="preview-detail-layout">
              {/* Main Article Content */}
              <div className="preview-detail-main">
                <header className="preview-article-header">
                  <h1 className="preview-article-title">{blog.title}</h1>
                  <div className="preview-article-meta-row">
                    <div className="meta-item">
                      <User size={15} />
                      <span>{blog.author?.name || 'Metallurgical R&D Division'}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={15} />
                      <span>{publishedDateText}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={15} />
                      <span>{blog.readTimeMinutes || 10} min read</span>
                    </div>
                  </div>
                </header>

                {/* Banner Figure */}
                <figure className="preview-article-figure">
                  <img
                    src={blog.bannerImageUrl || '/assets/blog-cnc-milling.jpg'}
                    alt={blog.bannerAlt || blog.title}
                    className="preview-figure-img"
                  />
                  {blog.bannerCaption && (
                    <figcaption className="preview-figure-caption">
                      {blog.bannerCaption}
                    </figcaption>
                  )}
                </figure>

                {/* Blocks Content Stream */}
                <div className="preview-blocks-stream">
                  {Array.isArray(blog.content) &&
                    blog.content.map((block, idx) => {
                      if (block.type === 'paragraph') {
                        return (
                          <p
                            key={block.id || idx}
                            className={`preview-body-paragraph ${block.isLead ? 'preview-lead-paragraph' : ''}`}
                          >
                            {block.content}
                          </p>
                        );
                      }

                      if (block.type === 'heading') {
                        if (block.level === 'h3' || block.level === 3) {
                          return (
                            <h3 key={block.id || idx} className="preview-h3">
                              {block.heading}
                            </h3>
                          );
                        }
                        return (
                          <h2 key={block.id || idx} className="preview-h2">
                            <span className="h2-accent-bar" />
                            <span>{block.heading}</span>
                          </h2>
                        );
                      }

                      if (block.type === 'image') {
                        return (
                          <figure key={block.id || idx} className={`preview-inline-figure width-${block.width || 'normal'}`}>
                            <img src={block.imageUrl} alt={block.alt || 'Visual'} />
                            {block.caption && (
                              <figcaption className="preview-figure-caption">
                                {block.caption}
                              </figcaption>
                            )}
                          </figure>
                        );
                      }

                      if (block.type === 'table') {
                        return (
                          <div key={block.id || idx} className="preview-table-container">
                            {block.caption && (
                              <h4 className="preview-table-caption">{block.caption}</h4>
                            )}
                            <div className="preview-table-scroll">
                              <table className="preview-spec-table">
                                {(block.headers || block.tableHeaders) && (
                                  <thead>
                                    <tr>
                                      {(block.headers || block.tableHeaders).map((h, hIdx) => (
                                        <th key={hIdx}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                )}
                                <tbody>
                                  {(block.rows || block.tableRows || []).map((row, rIdx) => (
                                    <tr key={rIdx}>
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx} className={cIdx === 0 ? 'cell-bold' : ''}>
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {(block.footnote || block.tableFootnote) && (
                              <p className="preview-table-footnote">{block.footnote || block.tableFootnote}</p>
                            )}
                          </div>
                        );
                      }

                      if (block.type === 'callout') {
                        return (
                          <aside key={block.id || idx} className="preview-callout-box">
                            <div className="callout-icon-col">
                              <Lightbulb size={20} color="#FF0804" />
                            </div>
                            <div className="callout-text-col">
                              <h4 className="callout-heading">{block.title || block.calloutTitle}</h4>
                              <p className="callout-body">{block.content || block.calloutBody}</p>
                            </div>
                          </aside>
                        );
                      }

                      if (block.type === 'featuredProduct') {
                        return (
                          <div key={block.id || idx} className="preview-featured-product-block">
                            <div className="product-block-card">
                              <div className="product-block-thumb-wrap">
                                <img
                                  src={block.image || '/cat-electrode.png'}
                                  alt={block.name}
                                  className="product-block-thumb"
                                />
                              </div>
                              <div className="product-block-content">
                                <span className="product-block-badge">FEATURED SPECIFICATION</span>
                                <h3 className="product-block-title">{block.name}</h3>
                                {block.sku && <span className="product-block-sku">SKU: {block.sku}</span>}
                                <p className="product-block-desc">{block.description}</p>
                                <span className="product-block-link">
                                  VIEW SPECIFICATIONS <ChevronRight size={14} />
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (block.type === 'list') {
                        return (
                          <div key={block.id || idx} className="preview-list-wrapper">
                            {block.listType === 'numbered' ? (
                              <ol className="preview-ol">
                                {(block.items || block.listItems || []).map((item, iIdx) => (
                                  <li key={iIdx}>{item}</li>
                                ))}
                              </ol>
                            ) : (
                              <ul className="preview-ul">
                                {(block.items || block.listItems || []).map((item, iIdx) => (
                                  <li key={iIdx}>{item}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      }

                      if (block.type === 'quote') {
                        return (
                          <blockquote key={block.id || idx} className="preview-blockquote">
                            <p className="quote-text">"{block.quote || block.quoteText}"</p>
                            {(block.attribution || block.quoteAuthor) && (
                              <cite className="quote-cite">— {block.attribution || block.quoteAuthor}</cite>
                            )}
                          </blockquote>
                        );
                      }

                      if (block.type === 'code') {
                        return (
                          <div key={block.id || idx} className="preview-code-block">
                            {(block.language || block.codeLanguage) && (
                              <div className="code-label">{block.language || block.codeLanguage}</div>
                            )}
                            <pre>
                              <code>{block.code || block.codeContent}</code>
                            </pre>
                          </div>
                        );
                      }

                      if (block.type === 'references') {
                        return (
                          <div key={block.id || idx} className="preview-references-block">
                            <h3 className="ref-heading">References & Applicable Standards</h3>
                            <ol className="ref-list">
                              {(block.references || block.referenceItems || []).map((refItem, rIdx) => (
                                <li key={rIdx}>{refItem}</li>
                              ))}
                            </ol>
                          </div>
                        );
                      }

                      if (block.type === 'featuredProduct') {
                        return (
                          <div key={block.id || idx} className="preview-content-featured-product">
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
                                <span className="content-fp-link">
                                  VIEW SPECIFICATIONS <ChevronRight size={14} />
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                </div>

                {/* Share & Print Action Bar */}
                <footer className="preview-action-footer">
                  <div className="share-protocol-label">SHARE PROTOCOL</div>
                  <div className="action-buttons-group">
                    <button type="button" className="btn-preview-action" title="Share">
                      <Share2 size={16} />
                    </button>
                    <button type="button" className="btn-preview-action" title="Print">
                      <Printer size={16} />
                    </button>
                  </div>
                </footer>
              </div>

              {/* Right Sidebar Widgets */}
              <aside className="preview-detail-sidebar">
                {/* Widget 1: Featured Product (only shown if user added this section from options in edit blog) */}
                {(() => {
                  const fp = blog.content?.find((b) => b.type === 'featuredProduct' && b.name) ||
                    (blog.featuredProduct?.productId && blog.featuredProduct?.name ? blog.featuredProduct : null);
                  if (!fp) return null;
                  return (
                    <div className="preview-sidebar-card">
                      <div className="card-top-icon-heading">
                        <Wrench size={18} color="#FF0804" />
                        <h3>Featured Product</h3>
                      </div>
                      <div className="sidebar-product-preview">
                        <img
                          src={fp.image || '/cat-electrode.png'}
                          alt={fp.name}
                          className="product-thumb"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/cat-electrode.png';
                          }}
                        />
                        <div className="product-info">
                          <h4>{fp.name}</h4>
                          {fp.description && <p>{fp.description}</p>}
                          <span className="link-view-specs">
                            VIEW SPECIFICATIONS <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Widget 2: Related Articles */}
                <div className="preview-sidebar-card">
                  <div className="card-top-icon-heading">
                    <FileText size={18} color="#FF0804" />
                    <h3>Related Articles</h3>
                  </div>
                  <div className="related-articles-list">
                    <div className="related-item">
                      <h4>Ultrasonic Phased Array Inspection Techniques for Heavy Flange Welds</h4>
                      <span className="related-meta">Quality Assurance • 2024.10.02</span>
                    </div>
                    <hr className="related-divider" />
                    <div className="related-item">
                      <h4>Mitigating Hydrogen-Induced Cracking in Subsea Steel Assemblies</h4>
                      <span className="related-meta">Welding Metallurgy • 2024.09.18</span>
                    </div>
                  </div>
                </div>

                {/* Widget 3: Require Technical Assistance? (Always present) */}
                <div className="preview-sidebar-card preview-dark-cta-card">
                  <div className="cta-head-icon">
                    <Headphones size={26} />
                  </div>
                  <h3>Require Technical Assistance?</h3>
                  <p>
                    Our metallurgical engineers are available for consultation on complex structural fabrication challenges.
                  </p>
                  <button type="button" className="btn-sidebar-cta">
                    SUBMIT TECHNICAL ENQUIRY
                  </button>
                </div>
              </aside>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
