import { useEffect, useState, useMemo, useRef } from 'react';
import {
  AlertTriangle,
  Ban,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  UploadCloud,
  X,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import { fetchCategories, uploadImageApi } from './api/products.js';
import './SubcategoriesPage.css';

export default function SubcategoriesPage({
  onNavigate,
  onLogout,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const subcatFileInputRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Derive subcategories live from MongoDB Atlas categories
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCategories()
      .then((data) => {
        if (mounted && data.categories) {
          const list = [];
          data.categories.forEach((cat, catIdx) => {
            (cat.subcategories || []).forEach((sub, subIdx) => {
              list.push({
                id: `sub-${catIdx}-${subIdx}`,
                name: sub,
                slug: sub.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                image: '',
                parentCategory: cat.name,
                isParentInactive: cat.status === 'Inactive',
                products: 0,
                order: subIdx + 1,
                status: 'Active',
                updated: 'Just now',
              });
            });
          });
          setSubcategories(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Subcategories API warning:', err.message);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [parentFilter, setParentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals & toast
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSubcat, setEditingSubcat] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Add form state
  const [newSubcatData, setNewSubcatData] = useState({
    name: '',
    slug: '',
    parentCategory: 'Welding Equipment',
    order: '3',
    status: 'Active',
    image: '',
    products: 0,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Filtered subcategories
  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((item) => {
      const term = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(term) ||
        item.slug.toLowerCase().includes(term) ||
        item.parentCategory.toLowerCase().includes(term);

      const matchesParent =
        parentFilter === 'All' ? true : item.parentCategory === parentFilter;

      const matchesStatus =
        statusFilter === 'All' ? true : item.status === statusFilter;

      return matchesSearch && matchesParent && matchesStatus;
    });
  }, [subcategories, searchQuery, parentFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSubcategories.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedSubcategories = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize;
    return filteredSubcategories.slice(startIndex, startIndex + pageSize);
  }, [filteredSubcategories, activePage, pageSize]);

  // Handle image upload from computer for subcategories
  const handleSubcatImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await uploadImageApi(file);
      if (res && res.url) {
        setNewSubcatData((prev) => ({ ...prev, image: res.url }));
        showToast('Image uploaded successfully.');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      showToast('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      if (subcatFileInputRef.current) {
        subcatFileInputRef.current.value = '';
      }
    }
  };

  // Bulk select handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredSubcategories.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Add Subcategory Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newSubcatData.name.trim()) {
      showToast('Subcategory name is required.');
      return;
    }

    const autoSlug =
      newSubcatData.slug.trim() ||
      newSubcatData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newEntry = {
      id: `sub-${Date.now()}`,
      name: newSubcatData.name.trim(),
      slug: autoSlug,
      image: newSubcatData.image,
      parentCategory: newSubcatData.parentCategory,
      isParentInactive: newSubcatData.parentCategory === 'Discontinued Equipment',
      products: Number(newSubcatData.products) || 0,
      order: Number(newSubcatData.order) || 1,
      status: newSubcatData.status,
      updated: 'Just now',
    };

    setSubcategories((prev) => [newEntry, ...prev]);
    setNewSubcatData({
      name: '',
      slug: '',
      parentCategory: 'Welding Equipment',
      order: '3',
      status: 'Active',
      image: '/subcat-tig-torch.png',
      products: 0,
    });
    setAddModalOpen(false);
    showToast(`Subcategory "${newEntry.name}" added successfully.`);
  };

  // Edit Subcategory Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingSubcat || !editingSubcat.name.trim()) return;

    setSubcategories((prev) =>
      prev.map((s) => (s.id === editingSubcat.id ? { ...editingSubcat } : s))
    );
    setEditModalOpen(false);
    showToast(`Subcategory "${editingSubcat.name}" updated.`);
  };

  return (
    <div className="subcategories-page-container">
      {/* Persistent Sidebar with 'Categories' highlighted */}
      <AdminSidebar
        currentNav="Categories"
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="subcategories-main-shell">
        {/* Topbar */}
        <AdminTopbar
          onLogout={onLogout}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSearchChange={setGlobalSearch}
          searchQuery={globalSearch}
          title="Categories"
        />

        <main className="subcategories-content">
          {/* Breadcrumb with category toggle */}
          <nav aria-label="Breadcrumb" className="subcat-breadcrumb">
            <button
              className="breadcrumb-crumb-btn"
              onClick={() => onNavigate?.('Dashboard')}
              type="button"
            >
              Dashboard
            </button>
            <span className="breadcrumb-crumb-sep" aria-hidden="true">&gt;</span>
            <button
              className="breadcrumb-crumb-btn"
              onClick={() => onNavigate?.('Categories')}
              type="button"
            >
              Categories
            </button>
            <span className="breadcrumb-crumb-sep" aria-hidden="true">&gt;</span>
            <span className="breadcrumb-crumb-current">Subcategories</span>
          </nav>

          {/* Page Header */}
          <header className="subcategories-header-row">
            <div>
              <h1 className="subcategories-title">Subcategories</h1>
              <p className="subcategories-subtitle">
                Manage product subcategories and their parent category relationships.
              </p>
            </div>
            <div className="header-actions-bundle">
              <button
                className="btn-toggle-main-cat"
                onClick={() => onNavigate?.('Categories')}
                type="button"
              >
                <span>View Top Categories</span>
              </button>
              <button
                className="btn-add-subcategory"
                onClick={() => setAddModalOpen(true)}
                type="button"
              >
                <Plus className="btn-icon" aria-hidden="true" />
                <span>Add Subcategory</span>
              </button>
            </div>
          </header>

          {/* Table Filter Card */}
          <section className="subcategories-card" aria-label="Subcategories table">
            <div className="subcat-filter-bar">
              {/* Search input */}
              <div className="subcat-search-box">
                <Search className="search-icon" aria-hidden="true" />
                <input
                  aria-label="Search subcategories"
                  className="search-input"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subcategories..."
                  type="text"
                  value={searchQuery}
                />
                {searchQuery && (
                  <button
                    aria-label="Clear search"
                    className="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    type="button"
                  >
                    <X aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Dropdown Filters */}
              <div className="subcat-filters-right">
                {/* Parent Category Filter */}
                <div className="filter-select-shell">
                  <select
                    aria-label="Filter by Parent Category"
                    className="filter-select"
                    onChange={(e) => setParentFilter(e.target.value)}
                    value={parentFilter}
                  >
                    <option value="All">Parent Category: All</option>
                    <option value="Welding Equipment">Parent Category: Welding Equipment</option>
                    <option value="Safety Gear">Parent Category: Safety Gear</option>
                    <option value="Consumables">Parent Category: Consumables</option>
                    <option value="Discontinued Equipment">Parent Category: Discontinued Equipment</option>
                  </select>
                  <ChevronDown className="filter-chevron" aria-hidden="true" />
                </div>

                {/* Status Filter */}
                <div className="filter-select-shell">
                  <select
                    aria-label="Filter by Status"
                    className="filter-select"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    value={statusFilter}
                  >
                    <option value="All">Status: All</option>
                    <option value="Active">Status: Active</option>
                    <option value="Inactive">Status: Inactive</option>
                  </select>
                  <ChevronDown className="filter-chevron" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Subcategories Table */}
            <div className="table-responsive">
              <table className="subcategories-table">
                <thead>
                  <tr>
                    <th scope="col" className="th-checkbox">
                      <label className="table-checkbox-label">
                        <input
                          checked={
                            filteredSubcategories.length > 0 &&
                            selectedIds.length === filteredSubcategories.length
                          }
                          onChange={handleSelectAll}
                          type="checkbox"
                        />
                        <span className="table-custom-checkbox" />
                      </label>
                    </th>
                    <th scope="col" className="th-image">IMAGE</th>
                    <th scope="col" className="th-subcat-name">SUBCATEGORY NAME</th>
                    <th scope="col" className="th-parent">PARENT CATEGORY</th>
                    <th scope="col" className="th-products">PRODUCTS</th>
                    <th scope="col" className="th-order">ORDER</th>
                    <th scope="col" className="th-status">STATUS</th>
                    <th scope="col" className="th-updated">UPDATED</th>
                    <th scope="col" className="th-actions">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="no-subcats-cell" style={{ textAlign: 'center' }}>
                        Loading subcategories...
                      </td>
                    </tr>
                  ) : subcategories.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="no-subcats-cell" style={{ textAlign: 'center' }}>
                        No subcategories registered yet.
                      </td>
                    </tr>
                  ) : filteredSubcategories.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="no-subcats-cell" style={{ textAlign: 'center' }}>
                        No subcategories found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedSubcategories.map((sub) => {
                      const isSelected = selectedIds.includes(sub.id);
                      const isWarningRow = sub.isParentInactive;

                      return (
                        <tr
                          key={sub.id}
                          className={`subcat-row${isWarningRow ? ' subcat-row--warning' : ''}${
                            isSelected ? ' subcat-row--selected' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="td-checkbox">
                            <label className="table-checkbox-label">
                              <input
                                checked={isSelected}
                                onChange={() => handleSelectOne(sub.id)}
                                type="checkbox"
                              />
                              <span className="table-custom-checkbox" />
                            </label>
                          </td>

                          {/* Image Thumbnail */}
                          <td className="td-image">
                            <div className="subcat-image-frame">
                              <img
                                alt={sub.name}
                                className="subcat-thumb-image"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/cat-placeholder.png';
                                }}
                                src={sub.image || '/cat-placeholder.png'}
                              />
                            </div>
                          </td>

                          {/* Subcategory Name & Slug */}
                          <td className="td-subcat-name">
                            <div className="subcat-name-group">
                              <div className="title-warning-row">
                                <strong className="subcat-name-title">{sub.name}</strong>
                                {sub.isParentInactive && (
                                  <AlertTriangle
                                    className="warning-triangle-icon"
                                    title="Parent category is inactive"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                              <span className="subcat-slug-text">
                                SLUG: {sub.slug}
                              </span>
                            </div>
                          </td>

                          {/* Parent Category Badge */}
                          <td className="td-parent">
                            {sub.isParentInactive ? (
                              <div className="parent-badge-warning-block">
                                <span className="parent-badge parent-badge--inactive">
                                  <Ban className="parent-badge-icon" aria-hidden="true" />
                                  <span>{sub.parentCategory}</span>
                                </span>
                                <span className="parent-warning-subtext">
                                  {sub.parentWarningText || 'Warning: Parent category is inactive'}
                                </span>
                              </div>
                            ) : (
                              <span className="parent-badge">
                                <Folder className="parent-badge-icon" aria-hidden="true" />
                                <span>{sub.parentCategory}</span>
                              </span>
                            )}
                          </td>

                          {/* Products Count */}
                          <td className="td-products td-tabular">
                            {sub.products}
                          </td>

                          {/* Sort Order */}
                          <td className="td-order td-tabular">
                            {sub.order}
                          </td>

                          {/* Status */}
                          <td className="td-status">
                            <span
                              className={`subcat-status-pill subcat-status-pill--${sub.status.toLowerCase()}`}
                            >
                              {sub.status}
                            </span>
                          </td>

                          {/* Updated Date */}
                          <td className="td-updated">
                            {sub.updated}
                          </td>

                          {/* Actions */}
                          <td className="td-actions">
                            <button
                              aria-label={`Edit ${sub.name}`}
                              className="btn-subcat-edit"
                              onClick={() => {
                                setEditingSubcat(sub);
                                setEditModalOpen(true);
                              }}
                              type="button"
                            >
                              <Pencil aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="subcat-card-footer">
              <span className="footer-entry-count">
                {filteredSubcategories.length === 0
                  ? 'Showing 0 entries'
                  : `Showing ${(activePage - 1) * pageSize + 1} to ${Math.min(
                      activePage * pageSize,
                      filteredSubcategories.length
                    )} of ${filteredSubcategories.length} entries`}
              </span>
              <div className="footer-pagination-bar">
                <button
                  className="btn-page-step"
                  disabled={activePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  type="button"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`btn-page-number${activePage === pageNum ? ' btn-page-number--active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                      type="button"
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  className="btn-page-step"
                  disabled={activePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ====================================================================
          MODAL: ADD SUBCATEGORY
         ==================================================================== */}
      {addModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card modal-md">
            <header className="modal-header">
              <div>
                <h2 className="modal-title">Add Subcategory</h2>
                <p className="modal-subtitle">
                  Configure subcategory attributes and attach it to a parent category.
                </p>
              </div>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => setAddModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="modal-field">
                <label className="modal-label" htmlFor="new-sub-name">
                  Subcategory Name <span className="required-star">*</span>
                </label>
                <input
                  id="new-sub-name"
                  className="modal-input"
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '');
                    setNewSubcatData({ ...newSubcatData, name, slug: autoSlug });
                  }}
                  placeholder="e.g. Plasma Torch Consumables"
                  required
                  type="text"
                  value={newSubcatData.name}
                />
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="new-sub-slug">
                    Slug <span className="required-star">*</span>
                  </label>
                  <input
                    id="new-sub-slug"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setNewSubcatData({ ...newSubcatData, slug: e.target.value })
                    }
                    placeholder="e.g. plasma-torch-consumables"
                    required
                    type="text"
                    value={newSubcatData.slug}
                  />
                </div>

                <div className="modal-field">
                  <label className="modal-label" htmlFor="new-sub-order">
                    Sort Order
                  </label>
                  <input
                    id="new-sub-order"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setNewSubcatData({ ...newSubcatData, order: e.target.value })
                    }
                    placeholder="1"
                    type="number"
                    value={newSubcatData.order}
                  />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label" htmlFor="new-sub-parent">
                  Parent Category <span className="required-star">*</span>
                </label>
                <div className="select-shell">
                  <select
                    id="new-sub-parent"
                    className="edit-select-input"
                    onChange={(e) =>
                      setNewSubcatData({ ...newSubcatData, parentCategory: e.target.value })
                    }
                    value={newSubcatData.parentCategory}
                  >
                    <option value="Welding Equipment">Welding Equipment</option>
                    <option value="Safety Gear">Safety Gear</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Discontinued Equipment">Discontinued Equipment</option>
                  </select>
                  <ChevronDown className="select-chevron" aria-hidden="true" />
                </div>
              </div>

              <div className="modal-field">
                <span className="modal-label">Status</span>
                <div className="subcat-status-radio-group">
                  <label className="radio-item">
                    <input
                      checked={newSubcatData.status === 'Active'}
                      name="newSubStatus"
                      onChange={() => setNewSubcatData({ ...newSubcatData, status: 'Active' })}
                      type="radio"
                    />
                    <span className="status-radio-pill status-radio-pill--active">Active</span>
                  </label>
                  <label className="radio-item">
                    <input
                      checked={newSubcatData.status === 'Inactive'}
                      name="newSubStatus"
                      onChange={() => setNewSubcatData({ ...newSubcatData, status: 'Inactive' })}
                      type="radio"
                    />
                    <span className="status-radio-pill status-radio-pill--inactive">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="modal-field">
                <span className="modal-label">Thumbnail Image</span>

                {/* Hidden native file input for uploading from computer */}
                <input
                  ref={subcatFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={handleSubcatImageFileChange}
                />

                <div className="subcat-thumb-selector">
                  {/* Upload Image button */}
                  <button
                    type="button"
                    className="thumb-btn thumb-btn--upload"
                    onClick={() => subcatFileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <UploadCloud className="btn-icon" aria-hidden="true" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  </button>

                  <button
                    className={`thumb-btn${newSubcatData.image === '/subcat-tig-torch.png' ? ' active' : ''}`}
                    onClick={() => setNewSubcatData({ ...newSubcatData, image: '/subcat-tig-torch.png' })}
                    type="button"
                  >
                    <img alt="TIG" className="choice-img" src="/subcat-tig-torch.png" />
                    <span>TIG Torch</span>
                  </button>

                  <button
                    className={`thumb-btn${newSubcatData.image === '/subcat-respirator.png' ? ' active' : ''}`}
                    onClick={() => setNewSubcatData({ ...newSubcatData, image: '/subcat-respirator.png' })}
                    type="button"
                  >
                    <img alt="Respirator" className="choice-img" src="/subcat-respirator.png" />
                    <span>Respirator</span>
                  </button>

                  {/* Custom uploaded preview if active */}
                  {newSubcatData.image &&
                    newSubcatData.image !== '/subcat-tig-torch.png' &&
                    newSubcatData.image !== '/subcat-respirator.png' && (
                      <button
                        type="button"
                        className="thumb-btn active"
                        onClick={() => {}}
                      >
                        <img alt="Uploaded" className="choice-img" src={newSubcatData.image} />
                        <span>Uploaded</span>
                      </button>
                    )}
                </div>
              </div>

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setAddModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-modal-submit-red" type="submit">
                  <Plus className="btn-icon-svg" aria-hidden="true" />
                  <span>Add Subcategory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EDIT SUBCATEGORY
         ==================================================================== */}
      {editModalOpen && editingSubcat && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card modal-md">
            <header className="modal-header">
              <div>
                <h2 className="modal-title">Edit Subcategory</h2>
                <p className="modal-subtitle">
                  Update subcategory parameters and order.
                </p>
              </div>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => setEditModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="modal-field">
                <label className="modal-label" htmlFor="edit-sub-name">
                  Subcategory Name <span className="required-star">*</span>
                </label>
                <input
                  id="edit-sub-name"
                  className="modal-input"
                  onChange={(e) =>
                    setEditingSubcat({ ...editingSubcat, name: e.target.value })
                  }
                  required
                  type="text"
                  value={editingSubcat.name}
                />
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="edit-sub-slug">
                    Slug <span className="required-star">*</span>
                  </label>
                  <input
                    id="edit-sub-slug"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setEditingSubcat({ ...editingSubcat, slug: e.target.value })
                    }
                    required
                    type="text"
                    value={editingSubcat.slug}
                  />
                </div>

                <div className="modal-field">
                  <label className="modal-label" htmlFor="edit-sub-order">
                    Sort Order
                  </label>
                  <input
                    id="edit-sub-order"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setEditingSubcat({ ...editingSubcat, order: e.target.value })
                    }
                    type="number"
                    value={editingSubcat.order}
                  />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label" htmlFor="edit-sub-parent">
                  Parent Category <span className="required-star">*</span>
                </label>
                <div className="select-shell">
                  <select
                    id="edit-sub-parent"
                    className="edit-select-input"
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingSubcat({
                        ...editingSubcat,
                        parentCategory: val,
                        isParentInactive: val === 'Discontinued Equipment',
                      });
                    }}
                    value={editingSubcat.parentCategory}
                  >
                    <option value="Welding Equipment">Welding Equipment</option>
                    <option value="Safety Gear">Safety Gear</option>
                    <option value="Consumables">Consumables</option>
                    <option value="Discontinued Equipment">Discontinued Equipment</option>
                  </select>
                  <ChevronDown className="select-chevron" aria-hidden="true" />
                </div>
              </div>

              <div className="modal-field">
                <span className="modal-label">Status</span>
                <div className="subcat-status-radio-group">
                  <label className="radio-item">
                    <input
                      checked={editingSubcat.status === 'Active'}
                      name="editSubStatus"
                      onChange={() => setEditingSubcat({ ...editingSubcat, status: 'Active' })}
                      type="radio"
                    />
                    <span className="status-radio-pill status-radio-pill--active">Active</span>
                  </label>
                  <label className="radio-item">
                    <input
                      checked={editingSubcat.status === 'Inactive'}
                      name="editSubStatus"
                      onChange={() => setEditingSubcat({ ...editingSubcat, status: 'Inactive' })}
                      type="radio"
                    />
                    <span className="status-radio-pill status-radio-pill--inactive">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setEditModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-modal-submit-red" type="submit">
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <aside aria-live="polite" className="catalogue-toast" role="status">
          <Check className="toast-icon" aria-hidden="true" />
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
