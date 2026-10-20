import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Image as ImageIcon,
  MoreVertical,
  Plus,
  Power,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import {
  fetchCategories,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  uploadImageApi,
} from './api/products.js';
import './CategoriesPage.css';

export default function CategoriesPage({
  onNavigate,
  onLogout,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const loadCategories = () => {
    setLoading(true);
    fetchCategories()
      .then((data) => {
        if (data.categories) {
          const mapped = data.categories.map((c, idx) => ({
            id: c._id || `cat-${idx}`,
            name: c.name,
            slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
            products: c.productCount || 0,
            subcategories: (c.subcategories || []).length,
            sortOrder: String(c.sortOrder || c.displayOrder || idx + 1).padStart(2, '0'),
            status: c.status || 'Active',
            updatedDate: c.updatedAt
              ? new Date(c.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recently',
            image: c.image || '',
          }));
          setCategories(mapped);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Categories API warning:', err.message);
        setLoading(false);
      });
  };

  // Fetch live categories from MongoDB Atlas
  useEffect(() => {
    loadCategories();
  }, []);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Inactive'

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Add category form state
  const [newCatData, setNewCatData] = useState({
    name: '',
    slug: '',
    sortOrder: '04',
    status: 'Active',
    subcategories: 0,
    products: 0,
    image: '',
    description: '',
  });

  // Edit category form state
  const [editCatData, setEditCatData] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = await uploadImageApi(file, 'sprimax/categories');
      const url = data.secure_url || data.url;
      setNewCatData((prev) => ({ ...prev, image: url }));
      if (editCatData) {
        setEditCatData((prev) => ({ ...prev, image: url }));
      }
      showToast('Category image uploaded to Cloudinary.');
    } catch (err) {
      showToast(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ? true : cat.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  // Reset to page 1 if filter results change and currentPage is out of bounds
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);

  const paginatedCategories = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize;
    return filteredCategories.slice(startIndex, startIndex + pageSize);
  }, [filteredCategories, activePage, pageSize]);


  // Handle Add Category submit
  const handleAddCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCatData.name.trim()) {
      showToast('Category name is required.');
      return;
    }

    const slug =
      newCatData.slug.trim() ||
      newCatData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const categoryPayload = {
      name: newCatData.name.trim(),
      slug: slug,
      sortOrder: Number(newCatData.sortOrder) || 1,
      displayOrder: Number(newCatData.sortOrder) || 1,
      status: newCatData.status || 'Active',
      image: newCatData.image || '',
      description: newCatData.description || '',
      isFeaturedOnHome: false,
    };

    try {
      await createCategoryApi(categoryPayload);
      showToast(`Category "${categoryPayload.name}" created successfully.`);
      loadCategories();
      setNewCatData({
        name: '',
        slug: '',
        sortOrder: '04',
        status: 'Active',
        subcategories: 0,
        products: 0,
        image: '',
        description: '',
      });
      setAddModalOpen(false);
    } catch (err) {
      console.error('Error creating category:', err);
      showToast(err.message || 'Failed to create category.');
    }
  };

  // Handle Edit Category submit
  const handleEditCategorySubmit = async (e) => {
    e.preventDefault();
    if (!editCatData || !editCatData.name.trim()) return;

    try {
      await updateCategoryApi(editCatData.id, {
        name: editCatData.name.trim(),
        slug: editCatData.slug,
        sortOrder: Number(editCatData.sortOrder) || 1,
        status: editCatData.status,
        image: editCatData.image || '',
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === editCatData.id ? { ...editCatData } : c))
      );
      setEditModalOpen(false);
      showToast(`Category "${editCatData.name}" updated successfully.`);
    } catch (err) {
      console.error('Error updating category:', err);
      showToast(err.message || 'Failed to update category.');
    }
  };

  // Toggle status
  const handleToggleStatus = async (id) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';

    // Optimistically update UI
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    setActiveMenuId(null);

    try {
      await updateCategoryApi(id, { status: newStatus });
      showToast(`Category marked as ${newStatus}.`);
    } catch (err) {
      console.error('Error updating status:', err);
      // Revert optimistic update
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: target.status } : c))
      );
      showToast('Failed to update category status.');
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    const prevList = [...categories];
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setActiveMenuId(null);

    try {
      await deleteCategoryApi(id);
      showToast('Category deleted.');
    } catch (err) {
      console.error('Error deleting category:', err);
      setCategories(prevList);
      showToast('Failed to delete category.');
    }
  };

  return (
    <div className="categories-page-container">
      {/* Sidebar with 'Categories' highlighted */}
      <AdminSidebar
        currentNav="Categories"
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="categories-main-shell">
        {/* Topbar */}
        <AdminTopbar
          onLogout={onLogout}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSearchChange={setGlobalSearch}
          searchQuery={globalSearch}
          title="Categories"
        />

        <main className="categories-content">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="cat-breadcrumb">
            <button
              className="cat-breadcrumb-item cat-breadcrumb-link"
              onClick={() => onNavigate?.('Dashboard')}
              type="button"
            >
              DASHBOARD
            </button>
            <span className="cat-breadcrumb-separator" aria-hidden="true">&gt;</span>
            <span className="cat-breadcrumb-item cat-breadcrumb-current">CATEGORIES</span>
          </nav>

          {/* Page Header */}
          <header className="categories-header-row">
            <div className="categories-header-text">
              <h1 className="categories-page-title">Categories</h1>
              <p className="categories-page-subtitle">
                Manage top-level product categories used to organize the welding product catalogue.
              </p>
            </div>
            <div className="categories-header-actions-group">
              <button
                className="btn-toggle-subcat"
                onClick={() => onNavigate?.('Subcategories')}
                type="button"
              >
                <span>View Subcategories</span>
              </button>
              <button
                className="btn-add-category"
                onClick={() => setAddModalOpen(true)}
                type="button"
              >
                <Plus className="btn-add-plus-icon" aria-hidden="true" />
                <span>Add Category</span>
              </button>
            </div>
          </header>

          {/* Table Card */}
          <section className="categories-card" aria-label="Categories management table">
            {/* Filter Bar */}
            <div className="categories-filter-bar">
              {/* Search categories */}
              <div className="categories-search-box">
                <Search className="cat-search-icon" aria-hidden="true" />
                <input
                  aria-label="Search categories"
                  className="cat-search-input"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  type="text"
                  value={searchQuery}
                />
                {searchQuery && (
                  <button
                    aria-label="Clear search"
                    className="cat-search-clear-btn"
                    onClick={() => setSearchQuery('')}
                    type="button"
                  >
                    <X aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Status Segmented Control */}
              <div className="categories-status-filter-group">
                <span className="status-filter-label">STATUS:</span>
                <div className="segmented-control" role="radiogroup" aria-label="Filter by status">
                  {['All', 'Active', 'Inactive'].map((status) => {
                    const isSelected = statusFilter === status;
                    return (
                      <button
                        key={status}
                        aria-checked={isSelected}
                        className={`segmented-pill${isSelected ? ' segmented-pill--active' : ''}`}
                        onClick={() => setStatusFilter(status)}
                        role="radio"
                        type="button"
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="table-responsive">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th scope="col" className="th-image">Image</th>
                    <th scope="col" className="th-name">Category Name</th>
                    <th scope="col" className="th-slug">Slug</th>
                    <th scope="col" className="th-products">Products</th>
                    <th scope="col" className="th-subcategories">Subcategories</th>
                    <th scope="col" className="th-sort">Sort Order</th>
                    <th scope="col" className="th-status">Status</th>
                    <th scope="col" className="th-date">Updated Date</th>
                    <th scope="col" className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="no-categories-cell">
                        No categories found matching your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedCategories.map((cat) => (
                      <tr key={cat.id} className="category-row">
                        {/* Image */}
                        <td className="td-image">
                          <div className="cat-image-thumb-box">
                            <img
                              alt={cat.name}
                              className="cat-thumb-img"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/cat-placeholder.png';
                              }}
                              src={cat.image || '/cat-placeholder.png'}
                            />
                          </div>
                        </td>

                        {/* Category Name */}
                        <td className="td-name">
                          <strong className="cat-name-text">{cat.name}</strong>
                        </td>

                        {/* Slug */}
                        <td className="td-slug">
                          <span className="cat-slug-code">{cat.slug}</span>
                        </td>

                        {/* Products */}
                        <td className="td-products td-tabular">
                          {cat.products.toLocaleString()}
                        </td>

                        {/* Subcategories */}
                        <td className="td-subcategories td-tabular">
                          {cat.subcategories}
                        </td>

                        {/* Sort Order */}
                        <td className="td-sort td-tabular">
                          {cat.sortOrder}
                        </td>

                        {/* Status */}
                        <td className="td-status">
                          <span
                            className={`cat-status-badge${
                              cat.status === 'Active'
                                ? ' cat-status-badge--active'
                                : ' cat-status-badge--inactive'
                            }`}
                          >
                            {cat.status}
                          </span>
                        </td>

                        {/* Updated Date */}
                        <td className="td-date">
                          {cat.updatedDate}
                        </td>

                        {/* Actions */}
                        <td className="td-actions">
                          <div className="actions-menu-shell">
                            <button
                              aria-label={`Actions for ${cat.name}`}
                              className="btn-more-dots"
                              onClick={() =>
                                setActiveMenuId(activeMenuId === cat.id ? null : cat.id)
                              }
                              type="button"
                            >
                              <MoreVertical aria-hidden="true" />
                            </button>

                            {activeMenuId === cat.id && (
                              <div className="cat-actions-dropdown" role="menu">
                                <button
                                  className="dropdown-menu-item"
                                  onClick={() => {
                                    setEditCatData(cat);
                                    setEditModalOpen(true);
                                    setActiveMenuId(null);
                                  }}
                                  role="menuitem"
                                  type="button"
                                >
                                  <Edit className="dropdown-icon" aria-hidden="true" />
                                  <span>Edit Category</span>
                                </button>

                                <button
                                  className="dropdown-menu-item"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onNavigate?.('Subcategories');
                                  }}
                                  role="menuitem"
                                  type="button"
                                >
                                  <Eye className="dropdown-icon" aria-hidden="true" />
                                  <span>View Subcategories</span>
                                </button>

                                <button
                                  className="dropdown-menu-item"
                                  onClick={() => handleToggleStatus(cat.id)}
                                  role="menuitem"
                                  type="button"
                                >
                                  <Power className="dropdown-icon" aria-hidden="true" />
                                  <span>
                                    Set as {cat.status === 'Active' ? 'Inactive' : 'Active'}
                                  </span>
                                </button>

                                <div className="dropdown-divider" />

                                <button
                                  className="dropdown-menu-item dropdown-menu-item--danger"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  role="menuitem"
                                  type="button"
                                >
                                  <Trash2 className="dropdown-icon" aria-hidden="true" />
                                  <span>Delete Category</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Card Footer / Pagination */}
            <div className="categories-card-footer">
              <span className="showing-records-text">
                {filteredCategories.length === 0
                  ? 'Showing 0 categories'
                  : `Showing ${(activePage - 1) * pageSize + 1} to ${Math.min(
                      activePage * pageSize,
                      filteredCategories.length
                    )} of ${filteredCategories.length} categories`}
              </span>
              <div className="pagination-arrows-group">
                <button
                  aria-label="Previous page"
                  className="btn-arrow-page"
                  disabled={activePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  type="button"
                >
                  <ChevronLeft className="arrow-icon" aria-hidden="true" />
                </button>
                <button
                  aria-label="Next page"
                  className="btn-arrow-page"
                  disabled={activePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  type="button"
                >
                  <ChevronRight className="arrow-icon" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ====================================================================
          MODAL: ADD CATEGORY
         ==================================================================== */}
      {addModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card modal-md">
            <header className="modal-header">
              <div>
                <h2 className="modal-title">Add Category</h2>
                <p className="modal-subtitle">
                  Create a top-level product category to organize welding machines, consumables, and gear.
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

            <form onSubmit={handleAddCategorySubmit} className="modal-form">
              {/* Category Name */}
              <div className="modal-field">
                <label className="modal-label" htmlFor="new-cat-name">
                  Category Name <span className="required-star">*</span>
                </label>
                <input
                  id="new-cat-name"
                  className="modal-input"
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    const autoSlug = nameVal
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)+/g, '');
                    setNewCatData({
                      ...newCatData,
                      name: nameVal,
                      slug: autoSlug,
                    });
                  }}
                  placeholder="e.g. Welding Automation"
                  required
                  type="text"
                  value={newCatData.name}
                />
              </div>

              {/* Slug & Sort Order Row */}
              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="new-cat-slug">
                    Slug <span className="required-star">*</span>
                  </label>
                  <input
                    id="new-cat-slug"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setNewCatData({ ...newCatData, slug: e.target.value })
                    }
                    placeholder="e.g. welding-automation"
                    required
                    type="text"
                    value={newCatData.slug}
                  />
                </div>

                <div className="modal-field">
                  <label className="modal-label" htmlFor="new-cat-sort">
                    Sort Order
                  </label>
                  <input
                    id="new-cat-sort"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setNewCatData({ ...newCatData, sortOrder: e.target.value })
                    }
                    placeholder="04"
                    type="text"
                    value={newCatData.sortOrder}
                  />
                </div>
              </div>

              {/* Status Radio / Selector */}
              <div className="modal-field">
                <span className="modal-label">Status</span>
                <div className="modal-status-toggle-row">
                  <label className="modal-radio-item">
                    <input
                      checked={newCatData.status === 'Active'}
                      name="newCatStatus"
                      onChange={() => setNewCatData({ ...newCatData, status: 'Active' })}
                      type="radio"
                    />
                    <span className="radio-label-badge radio-label-badge--active">Active</span>
                  </label>
                  <label className="modal-radio-item">
                    <input
                      checked={newCatData.status === 'Inactive'}
                      name="newCatStatus"
                      onChange={() => setNewCatData({ ...newCatData, status: 'Inactive' })}
                      type="radio"
                    />
                    <span className="radio-label-badge radio-label-badge--inactive">Inactive</span>
                  </label>
                </div>
              </div>

              {/* Image Preview / Selector */}
              <div className="modal-field">
                <span className="modal-label">Category Thumbnail</span>

                {/* Hidden native file input for uploading from computer */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={handleImageFileChange}
                />

                <div className="cat-image-select-row">
                  {/* Upload Image button */}
                  <button
                    type="button"
                    className="thumb-choice-btn thumb-choice-btn--upload"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <UploadCloud className="thumb-choice-icon" aria-hidden="true" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  </button>

                  {/* Preset torch */}
                  <button
                    type="button"
                    className={`thumb-choice-btn${newCatData.image === '/cat-welding-torch.png' ? ' thumb-choice-btn--active' : ''}`}
                    onClick={() => setNewCatData({ ...newCatData, image: '/cat-welding-torch.png' })}
                  >
                    <img src="/cat-welding-torch.png" alt="Torch" className="thumb-choice-img" />
                    <span>Welding Torch</span>
                  </button>

                  {/* Preset spool */}
                  <button
                    type="button"
                    className={`thumb-choice-btn${newCatData.image === '/cat-consumables-spool.png' ? ' thumb-choice-btn--active' : ''}`}
                    onClick={() => setNewCatData({ ...newCatData, image: '/cat-consumables-spool.png' })}
                  >
                    <img src="/cat-consumables-spool.png" alt="Spool" className="thumb-choice-img" />
                    <span>Wire Spool</span>
                  </button>

                  {/* Custom uploaded preview if active */}
                  {newCatData.image &&
                    newCatData.image !== '/cat-welding-torch.png' &&
                    newCatData.image !== '/cat-consumables-spool.png' && (
                      <button
                        type="button"
                        className="thumb-choice-btn thumb-choice-btn--active"
                        onClick={() => {}}
                      >
                        <img src={newCatData.image} alt="Uploaded" className="thumb-choice-img" />
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
                  <span>Add Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EDIT CATEGORY
         ==================================================================== */}
      {editModalOpen && editCatData && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card modal-md">
            <header className="modal-header">
              <div>
                <h2 className="modal-title">Edit Category</h2>
                <p className="modal-subtitle">
                  Update category details, slug, and status.
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

            <form onSubmit={handleEditCategorySubmit} className="modal-form">
              <div className="modal-field">
                <label className="modal-label" htmlFor="edit-cat-name">
                  Category Name <span className="required-star">*</span>
                </label>
                <input
                  id="edit-cat-name"
                  className="modal-input"
                  onChange={(e) =>
                    setEditCatData({ ...editCatData, name: e.target.value })
                  }
                  required
                  type="text"
                  value={editCatData.name}
                />
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="edit-cat-slug">
                    Slug <span className="required-star">*</span>
                  </label>
                  <input
                    id="edit-cat-slug"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setEditCatData({ ...editCatData, slug: e.target.value })
                    }
                    required
                    type="text"
                    value={editCatData.slug}
                  />
                </div>

                <div className="modal-field">
                  <label className="modal-label" htmlFor="edit-cat-sort">
                    Sort Order
                  </label>
                  <input
                    id="edit-cat-sort"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setEditCatData({ ...editCatData, sortOrder: e.target.value })
                    }
                    type="text"
                    value={editCatData.sortOrder}
                  />
                </div>
              </div>

              <div className="modal-field">
                <span className="modal-label">Status</span>
                <div className="modal-status-toggle-row">
                  <label className="modal-radio-item">
                    <input
                      checked={editCatData.status === 'Active'}
                      name="editCatStatus"
                      onChange={() => setEditCatData({ ...editCatData, status: 'Active' })}
                      type="radio"
                    />
                    <span className="radio-label-badge radio-label-badge--active">Active</span>
                  </label>
                  <label className="modal-radio-item">
                    <input
                      checked={editCatData.status === 'Inactive'}
                      name="editCatStatus"
                      onChange={() => setEditCatData({ ...editCatData, status: 'Inactive' })}
                      type="radio"
                    />
                    <span className="radio-label-badge radio-label-badge--inactive">Inactive</span>
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
