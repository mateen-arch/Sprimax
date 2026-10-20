import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit3,
  Eye,
  ExternalLink,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  Star,
  CheckSquare,
  Square,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import AdminTopbar from './AdminTopbar.jsx';
import AdminSidebar from './AdminSidebar.jsx';
import {
  fetchAdminBlogs,
  deleteBlogApi,
  duplicateBlogApi,
  updateBlogApi,
  bulkUpdateBlogsApi,
  fetchBlogCategoriesApi,
} from './api/blogs.js';
import './BlogManagementPage.css';

export default function BlogManagementPage({
  onNavigate,
  onLogout,
  onEditBlog,
  onPreviewBlog,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters & Search & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Multi-selection for bulk operations
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCategory, setBulkCategory] = useState('');

  // Modals & Action Menus
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteConfirmBlog, setDeleteConfirmBlog] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Categories
  useEffect(() => {
    fetchBlogCategoriesApi()
      .then((res) => {
        if (res.categories) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  // Fetch blogs list
  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminBlogs({
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
        featured: featuredFilter,
        sortBy,
        sortOrder,
        page,
        limit,
      });
      setBlogs(res.blogs || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus, featuredFilter, sortBy, sortOrder, page, limit]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // Close open action menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.blog-row-action-menu')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(blogs.map((b) => b._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Featured status
  const handleToggleFeatured = async (blog) => {
    try {
      const nextFeatured = !blog.featured;
      await updateBlogApi(blog._id, { featured: nextFeatured });
      showToast(
        nextFeatured
          ? `"${blog.title.slice(0, 30)}..." marked as featured post`
          : `Removed from featured`
      );
      loadBlogs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Duplicate Blog
  const handleDuplicate = async (blog) => {
    try {
      const res = await duplicateBlogApi(blog._id);
      showToast(`Duplicated as draft: "${res.blog.title}"`);
      loadBlogs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Archive / Unarchive
  const handleToggleArchive = async (blog) => {
    const nextStatus = blog.status === 'Archived' ? 'Draft' : 'Archived';
    try {
      await updateBlogApi(blog._id, { status: nextStatus });
      showToast(
        nextStatus === 'Archived'
          ? `Archived "${blog.title.slice(0, 30)}..."`
          : `Restored to Draft`
      );
      loadBlogs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Soft Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmBlog) return;
    const targetId = deleteConfirmBlog._id || deleteConfirmBlog.id || deleteConfirmBlog.slug;
    if (!targetId) {
      showToast('Blog ID not found', 'error');
      return;
    }
    setIsDeleting(true);
    try {
      await deleteBlogApi(targetId);
      showToast(`Post soft-deleted successfully`);
      setDeleteConfirmBlog(null);
      loadBlogs();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkUpdateBlogsApi(selectedIds, action, bulkCategory);
      showToast(`Bulk ${action} completed for ${selectedIds.length} posts`);
      setSelectedIds([]);
      loadBlogs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Status Badge Class
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Published':
        return <span className="blog-status-badge badge-published">Published</span>;
      case 'Draft':
        return <span className="blog-status-badge badge-draft">Draft</span>;
      case 'Scheduled':
        return <span className="blog-status-badge badge-scheduled">Scheduled</span>;
      case 'Archived':
        return <span className="blog-status-badge badge-archived">Archived</span>;
      default:
        return <span className="blog-status-badge">{status}</span>;
    }
  };

  return (
    <div className="admin-shell">
      <AdminSidebar
        currentNav="Blogs"
        onLogout={onLogout}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="admin-main">
        <AdminTopbar
          title="Blog Management"
          onOpenMobileSidebar={() => setMobileOpen(true)}
          globalSearch={searchQuery}
          onGlobalSearchChange={(val) => {
            setSearchQuery(val);
            setPage(1);
          }}
          onNavigate={onNavigate}
        />

        {/* Toast alert */}
        {toast && (
          <div className={`blog-mgmt-toast toast-${toast.type}`}>
            {toast.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="toast-close">
              <X size={14} />
            </button>
          </div>
        )}

        <main className="blog-mgmt-content">
          {/* Header Row */}
          <div className="blog-mgmt-header">
            <div>
              <h1 className="blog-mgmt-title">Technical Blogs & Articles</h1>
              <p className="blog-mgmt-subtitle">
                Publish industrial insights, metallurgical case studies, and engineering guides to the user-side portal.
              </p>
            </div>
            <div className="blog-header-actions">
              <button
                type="button"
                className="btn-refresh"
                onClick={loadBlogs}
                title="Refresh list"
              >
                <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                className="btn-primary-add"
                onClick={() => onNavigate?.('AddBlog')}
              >
                <Plus size={18} />
                <span>Add Blog</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="blog-mgmt-controls-bar">
            <div className="search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by title, slug, or author..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="blog-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="filters-group">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id || c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Archived">Archived</option>
              </select>

              {/* Featured Filter */}
              <select
                value={featuredFilter}
                onChange={(e) => {
                  setFeaturedFilter(e.target.value);
                  setPage(1);
                }}
                className="filter-select"
              >
                <option value="">All Posts</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured</option>
              </select>

              {/* Sort By */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [f, o] = e.target.value.split('-');
                  setSortBy(f);
                  setSortOrder(o);
                }}
                className="filter-select"
              >
                <option value="publishedAt-desc">Published: Newest First</option>
                <option value="publishedAt-asc">Published: Oldest First</option>
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="title-asc">Title: A-Z</option>
              </select>
            </div>
          </div>

          {/* Bulk Action Bar (when rows selected) */}
          {selectedIds.length > 0 && (
            <div className="bulk-actions-toolbar">
              <span className="bulk-selection-count">
                <strong>{selectedIds.length}</strong> items selected
              </span>
              <div className="bulk-buttons">
                <button
                  type="button"
                  className="btn-bulk btn-bulk-publish"
                  onClick={() => handleBulkAction('publish')}
                >
                  Publish
                </button>
                <button
                  type="button"
                  className="btn-bulk btn-bulk-draft"
                  onClick={() => handleBulkAction('unpublish')}
                >
                  Move to Draft
                </button>
                <button
                  type="button"
                  className="btn-bulk btn-bulk-archive"
                  onClick={() => handleBulkAction('archive')}
                >
                  Archive
                </button>
                <button
                  type="button"
                  className="btn-bulk btn-bulk-delete"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </button>

                {categories.length > 0 && (
                  <div className="bulk-category-wrap">
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="bulk-cat-select"
                    >
                      <option value="">Change Category...</option>
                      {categories.map((c) => (
                        <option key={c.slug} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!bulkCategory}
                      className="btn-bulk btn-bulk-apply"
                      onClick={() => handleBulkAction('changeCategory')}
                    >
                      Apply
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-bulk-clear"
                  onClick={() => setSelectedIds([])}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="blog-table-card">
            {loading ? (
              <div className="blog-table-skeleton">
                <div className="skeleton-row header-skel" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton-row" />
                ))}
              </div>
            ) : error ? (
              <div className="blog-table-error">
                <AlertTriangle size={36} />
                <p>{error}</p>
                <button type="button" onClick={loadBlogs} className="btn-retry">
                  Try Again
                </button>
              </div>
            ) : blogs.length === 0 ? (
              <div className="blog-empty-state">
                <BookOpen size={48} className="empty-icon" />
                <h3>No blog posts found</h3>
                <p>
                  {searchQuery || selectedCategory || selectedStatus
                    ? 'No articles match your active filter criteria.'
                    : 'Get started by creating your first technical blog article.'}
                </p>
                <button
                  type="button"
                  className="btn-primary-add"
                  onClick={() => onNavigate?.('AddBlog')}
                >
                  <Plus size={16} />
                  <span>Create New Blog</span>
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="blog-data-table">
                  <thead>
                    <tr>
                      <th className="th-select">
                        <input
                          type="checkbox"
                          checked={
                            blogs.length > 0 &&
                            selectedIds.length === blogs.length
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="th-thumb">Media</th>
                      <th className="th-title">Article Title & Slug</th>
                      <th className="th-category">Category</th>
                      <th className="th-author">Author</th>
                      <th className="th-status">Status</th>
                      <th className="th-date">Published</th>
                      <th className="th-featured">Featured</th>
                      <th className="th-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog) => {
                      const isSelected = selectedIds.includes(blog._id);
                      return (
                        <tr
                          key={blog._id}
                          className={isSelected ? 'row-selected' : ''}
                        >
                          {/* Checkbox */}
                          <td className="td-select">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(blog._id)}
                            />
                          </td>

                          {/* Thumbnail */}
                          <td className="td-thumb">
                            <div className="blog-thumb-wrap">
                              {blog.bannerImageUrl ? (
                                <img
                                  src={blog.bannerImageUrl}
                                  alt={blog.bannerAlt || blog.title}
                                  className="blog-table-thumb"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/cat-placeholder.png';
                                  }}
                                />
                              ) : (
                                <div className="blog-thumb-placeholder">
                                  <BookOpen size={16} />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Title & Slug */}
                          <td className="td-title">
                            <div className="title-cell-content">
                              <button
                                type="button"
                                className="blog-title-link"
                                onClick={() => onEditBlog?.(blog._id)}
                              >
                                {blog.title}
                              </button>
                              <span className="blog-slug-meta">
                                /{blog.slug}
                              </span>
                              {blog.readTimeMinutes && (
                                <span className="blog-read-time-pill">
                                  <Clock size={11} />
                                  {blog.readTimeMinutes} min read
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="td-category">
                            <span className="blog-category-badge">
                              {blog.category}
                            </span>
                          </td>

                          {/* Author */}
                          <td className="td-author">
                            <div className="author-meta-cell">
                              <span className="author-name">
                                {blog.author?.name || 'Sprimax Team'}
                              </span>
                              {blog.author?.role && (
                                <span className="author-role">
                                  {blog.author.role}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="td-status">
                            {getStatusBadge(blog.status)}
                          </td>

                          {/* Published Date */}
                          <td className="td-date">
                            <span className="date-tabular">
                              {blog.formattedPublishedDate ||
                                (blog.publishedAt
                                  ? new Date(blog.publishedAt)
                                      .toISOString()
                                      .slice(0, 10)
                                      .replace(/-/g, '.')
                                  : '—')}
                            </span>
                          </td>

                          {/* Featured Star Toggle */}
                          <td className="td-featured">
                            <button
                              type="button"
                              className={`btn-star-toggle ${blog.featured ? 'is-featured' : ''}`}
                              onClick={() => handleToggleFeatured(blog)}
                              title={
                                blog.featured
                                  ? 'Featured on home grid (Click to remove)'
                                  : 'Click to make main featured post'
                              }
                            >
                              <Star
                                size={18}
                                fill={blog.featured ? '#FF0804' : 'none'}
                                color={blog.featured ? '#FF0804' : '#A0AEC0'}
                              />
                            </button>
                          </td>

                          {/* Row Action Menu */}
                          <td className="td-actions">
                            <div className="blog-row-action-menu">
                              <button
                                type="button"
                                className="action-btn-primary"
                                onClick={() => onEditBlog?.(blog._id)}
                                title="Edit post"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                type="button"
                                className="action-btn-preview"
                                onClick={() => onPreviewBlog?.(blog._id)}
                                title="Preview post"
                              >
                                <Eye size={15} />
                              </button>

                              <div className="more-actions-wrap">
                                <button
                                  type="button"
                                  className="action-btn-more"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId(
                                      activeMenuId === blog._id
                                        ? null
                                        : blog._id
                                    );
                                  }}
                                >
                                  <MoreVertical size={16} />
                                </button>

                                {activeMenuId === blog._id && (
                                  <div className="dropdown-action-popover">
                                    {blog.status === 'Published' && (
                                      <a
                                        href={`/blog/${blog.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="dropdown-item"
                                      >
                                        <ExternalLink size={14} />
                                        <span>View Live Post</span>
                                      </a>
                                    )}

                                    <button
                                      type="button"
                                      className="dropdown-item"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        handleDuplicate(blog);
                                      }}
                                    >
                                      <Copy size={14} />
                                      <span>Duplicate</span>
                                    </button>

                                    <button
                                      type="button"
                                      className="dropdown-item"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        handleToggleArchive(blog);
                                      }}
                                    >
                                      {blog.status === 'Archived' ? (
                                        <>
                                          <ArchiveRestore size={14} />
                                          <span>Unarchive to Draft</span>
                                        </>
                                      ) : (
                                        <>
                                          <Archive size={14} />
                                          <span>Archive Post</span>
                                        </>
                                      )}
                                    </button>

                                    <hr className="dropdown-divider" />

                                    <button
                                      type="button"
                                      className="dropdown-item item-delete"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setDeleteConfirmBlog(blog);
                                      }}
                                    >
                                      <Trash2 size={14} />
                                      <span>Delete (Soft)</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination footer */}
            {!loading && blogs.length > 0 && (
              <div className="blog-pagination-bar">
                <span className="pagination-info">
                  Showing <strong>{(page - 1) * limit + 1}</strong> to{' '}
                  <strong>{Math.min(page * limit, totalCount)}</strong> of{' '}
                  <strong>{totalCount}</strong> articles
                </span>

                <div className="pagination-controls">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="btn-page-nav"
                  >
                    <ChevronLeft size={16} />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(0, 5)
                    .map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`btn-page-number ${page === num ? 'is-active' : ''}`}
                        onClick={() => setPage(num)}
                      >
                        {num}
                      </button>
                    ))}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="btn-page-nav"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Modal for Delete */}
      {deleteConfirmBlog && (
        <div className="modal-backdrop-blur">
          <div className="delete-modal-dialog">
            <div className="delete-modal-icon">
              <Trash2 size={24} color="#FF0804" />
            </div>
            <h3>Soft Delete Blog Post</h3>
            <p>
              Are you sure you want to delete{' '}
              <strong>"{deleteConfirmBlog.title}"</strong>?
            </p>
            <p className="delete-modal-note">
              This post will be marked as deleted and immediately hidden from both the public portal and active lists.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDeleteConfirmBlog(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-confirm-delete"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
