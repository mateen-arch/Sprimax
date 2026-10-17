import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Download,
  FileText,
  BookOpen,
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getDownloads, trackDownload } from '../api/resources.js';

function getBadgeClass(doc) {
  const cat = (doc.type || doc.category || 'TDS').toLowerCase();
  if (cat.includes('catalog')) return 'badge-catalog';
  if (cat.includes('sds')) return 'badge-sds';
  if (cat.includes('profile') || cat.includes('cert')) return 'badge-profile';
  return 'badge-tds';
}

function getBadgeText(doc) {
  const cat = (doc.type || doc.category || 'TDS').toLowerCase();
  if (cat.includes('catalog')) return 'CATALOG';
  if (cat.includes('sds')) return 'SDS';
  if (cat.includes('profile') || cat.includes('cert')) return 'PROFILE';
  return 'TDS';
}

function getDocIcon(doc) {
  const cat = (doc.type || doc.category || 'TDS').toLowerCase();
  if (cat.includes('catalog') || cat.includes('guide')) {
    return <BookOpen size={18} className="res-card-icon" />;
  }
  if (cat.includes('sds')) {
    return <AlertTriangle size={18} className="res-card-icon" />;
  }
  if (cat.includes('profile') || cat.includes('cert')) {
    return <Building2 size={18} className="res-card-icon" />;
  }
  return <FileText size={18} className="res-card-icon" />;
}

export default function ResourcesPage({ initialSearch = '', onClearInitialSearch }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [activeSearch, setActiveSearch] = useState(initialSearch ? initialSearch.trim().toLowerCase() : '');
  const [selectedTypes, setSelectedTypes] = useState(['all']);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadToast, setDownloadToast] = useState(null);

  // Load real resources from MongoDB Atlas
  const loadResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDownloads();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load resources from database:', err);
      setError('Unable to connect to resource repository. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
      setActiveSearch(initialSearch.trim().toLowerCase());
      setCurrentPage(1);
    }
  }, [initialSearch]);

  // Resource types matching reference sidebar
  const resourceTypes = [
    { id: 'all', label: 'All Resources' },
    { id: 'catalog', label: 'Product Catalog' },
    { id: 'tds', label: 'Technical Data Sheets (TDS)' },
    { id: 'sds', label: 'Safety Data Sheets (SDS)' },
    { id: 'profile', label: 'Company Profile' },
  ];

  // Handle Checkbox Selection
  const handleTypeToggle = (typeId) => {
    if (typeId === 'all') {
      setSelectedTypes(['all']);
      setCurrentPage(1);
      return;
    }

    let updated = selectedTypes.filter((t) => t !== 'all');
    if (updated.includes(typeId)) {
      updated = updated.filter((t) => t !== typeId);
      if (updated.length === 0) {
        updated = ['all'];
      }
    } else {
      updated.push(typeId);
    }

    setSelectedTypes(updated);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim().toLowerCase());
    setCurrentPage(1);
  };

  const clearFilter = () => {
    setSearchQuery('');
    setActiveSearch('');
    if (onClearInitialSearch) onClearInitialSearch();
    setCurrentPage(1);
  };

  // Exact file download handler matching uploaded admin asset
  const handleDownload = (doc) => {
    const filename =
      doc.fileName ||
      `${(doc.title || 'document').toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${(doc.fileType || 'pdf').toLowerCase()}`;

    setDownloadToast(`Downloading ${filename} (${doc.fileSize || 'PDF'})...`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 3500);

    // Track download in database
    if (doc._id || doc.id) {
      trackDownload(doc._id || doc.id);
    }

    const fileUrl = doc.fileUrl;

    if (fileUrl && fileUrl.startsWith('data:')) {
      try {
        const parts = fileUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const binary = atob(parts[1]);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      } catch (err) {
        console.error('Data URL download error:', err);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://') || fileUrl.startsWith('/'))) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback text blob with official metadata
      const blob = new Blob(
        [
          `SPRIMAX Official Technical Resource\n\nTitle: ${doc.title}\nRef: ${doc.code || '--'}\nCategory: ${doc.category || doc.type}\nFile Name: ${filename}\nFile Size: ${doc.fileSize || 'N/A'}\nRelated Product: ${doc.relatedProduct || '--'}\n\nDownloaded from SPRIMAX Resource Center.`,
        ],
        { type: 'application/pdf' }
      );
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    }
  };

  // Filter logic (Type filter + Real-Time Search)
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      // 1. Strict Type Filter
      let matchesType = false;
      if (selectedTypes.includes('all')) {
        matchesType = true;
      } else {
        const itemType = (item.type || '').toLowerCase();
        const itemCat = (item.category || '').toLowerCase();

        matchesType = selectedTypes.some((selectedId) => {
          if (selectedId === 'tds') {
            return itemType === 'tds' || itemCat.includes('tds') || itemCat.includes('technical') || itemCat.includes('manual');
          }
          if (selectedId === 'catalog') {
            return itemType === 'catalog' || itemCat.includes('catalog') || itemCat.includes('guide');
          }
          if (selectedId === 'sds') {
            return itemType === 'sds' || itemCat.includes('sds') || itemCat.includes('safety');
          }
          if (selectedId === 'profile') {
            return (
              itemType === 'profile' ||
              itemCat.includes('profile') ||
              itemCat.includes('corporate') ||
              itemCat.includes('cert')
            );
          }
          return itemType === selectedId;
        });
      }

      if (!matchesType) return false;

      // 2. Keyword Search
      const query = (activeSearch || '').toLowerCase().trim();
      if (!query) return true;

      const searchableString = [
        item.title,
        item.code,
        item.category,
        item.type,
        item.description,
        item.relatedProduct,
        item.fileName,
        item.fileType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const words = query.split(/\s+/).filter((w) => w.length > 1);
      return searchableString.includes(query) || (words.length > 0 && words.some((w) => searchableString.includes(w)));
    });
  }, [resources, selectedTypes, activeSearch]);

  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredResources.length / itemsPerPage));
  const currentItems = filteredResources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="resources-page-wrapper">
      <div className="resources-container">
        {/* Header Section */}
        <header className="resources-header">
          <div
            className="data-tabular"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              backgroundColor: '#e2e8f0',
              borderRadius: '2px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#000417',
              marginBottom: '1rem',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ff0804' }} />
            <span>TECHNICAL REPOSITORY</span>
          </div>
          <h1 className="resources-title">Resource Center &amp; Downloads</h1>
          <p className="resources-subtitle">
            Access official technical data sheets, safety documentation, product catalogs, and corporate compliance materials directly from our metallurgical engineering laboratory.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="resources-search-form">
            <div className="resources-search-input-wrap">
              <Search size={18} className="resources-search-icon" />
              <input
                type="text"
                placeholder="Search by product name, AWS specification, or filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="resources-search-input"
              />
            </div>
            <button type="submit" className="resources-search-btn">
              SEARCH
            </button>
          </form>
        </header>

        {/* Main 2-Column Layout */}
        <div className="resources-main-layout">
          {/* Left Sidebar Filter */}
          <aside className="resources-sidebar">
            <div className="resources-filter-box">
              <h2 className="resources-filter-title">RESOURCE TYPE</h2>
              <div className="resources-filter-divider" />
              <div className="resources-checkbox-list">
                {resourceTypes.map((type) => {
                  const isChecked = selectedTypes.includes(type.id);
                  return (
                    <label key={type.id} className="resources-checkbox-label">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTypeToggle(type.id)}
                        style={{ display: 'none' }}
                      />
                      <span className={`resources-custom-checkbox ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <Check size={11} strokeWidth={3} className="resources-check-icon" />}
                      </span>
                      <span className="resources-checkbox-text">{type.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Column: Cards Grid */}
          <main className="resources-cards-col">
            {/* Active search filter notice if any */}
            {activeSearch && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderLeft: '4px solid #ff0804',
                  padding: '0.75rem 1.15rem',
                  borderRadius: '2px',
                  marginBottom: '1.5rem',
                  fontSize: '13px',
                }}
              >
                <span>
                  Filtering technical documents for: <strong>"{activeSearch}"</strong> ({filteredResources.length} results)
                </span>
                <button
                  type="button"
                  onClick={clearFilter}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff0804',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                  }}
                >
                  <X size={14} /> Clear Filter
                </button>
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem', color: '#64748b' }}>
                <Loader2 size={36} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '14px', fontWeight: 600 }}>Loading official resources from database...</p>
              </div>
            ) : error ? (
              <div className="resources-empty-state">
                <AlertCircle size={40} color="#dc2626" className="resources-empty-icon" />
                <h3>Unable to Load Resources</h3>
                <p>{error}</p>
                <button type="button" className="resources-reset-btn" onClick={loadResources}>
                  Retry Loading
                </button>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="resources-empty-state">
                <FileText size={40} className="resources-empty-icon" />
                <h3>No Resources Found</h3>
                <p>No documents found matching your filter. Try adjusting your search query or selecting a different resource type.</p>
                <button
                  type="button"
                  className="resources-reset-btn"
                  onClick={() => {
                    setSelectedTypes(['all']);
                    clearFilter();
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="resources-grid">
                  {currentItems.map((doc) => {
                    const badgeClass = getBadgeClass(doc);
                    const badgeText = getBadgeText(doc);
                    const icon = getDocIcon(doc);

                    return (
                      <article key={doc._id || doc.id || doc.code} className="resources-card">
                        <div className="res-card-top-row">
                          <div className="res-icon-box">{icon}</div>
                          <span className={`res-type-badge ${badgeClass}`}>{badgeText}</span>
                        </div>

                        <div className="res-card-middle">
                          <h3 className="res-card-title">{doc.title}</h3>
                          <div className="res-card-related">
                            {doc.relatedProduct ? `Related: ${doc.relatedProduct}` : doc.category || '--'}
                            {doc.code ? ` // ${doc.code}` : ''}
                          </div>
                          <div className="res-card-divider" />
                          <div className="res-card-footer">
                            <span className="res-card-meta">
                              {doc.fileName || `${doc.fileType || 'PDF'} // ${doc.fileSize || '2.4 MB'}`}
                            </span>
                            <button
                              type="button"
                              className="res-card-download-btn"
                              onClick={() => handleDownload(doc)}
                              aria-label={`Download ${doc.fileName || doc.title}`}
                            >
                              <Download size={14} strokeWidth={2.4} className="res-download-icon" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="resources-pagination">
                    <button
                      type="button"
                      className="resources-page-arrow"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div style={{ display: 'flex', gap: '0.45rem' }}>
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
                        <button
                          key={num}
                          type="button"
                          className={`resources-page-num ${currentPage === num ? 'active' : ''}`}
                          onClick={() => setCurrentPage(num)}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="resources-page-arrow"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      aria-label="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Floating Download Toast */}
      {downloadToast && (
        <div className="resources-download-toast">
          <Download size={18} className="toast-icon" />
          <span>{downloadToast}</span>
        </div>
      )}
    </div>
  );
}
