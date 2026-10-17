import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
  Copy,
  ChevronDown,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import {
  fetchProducts,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  fetchCategories,
} from './api/products.js';
import './CataloguePage.css';

export default function CataloguePage({ onLogout, onNavigate, onViewProductDetails, onEditProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [filterAwsClass, setFilterAwsClass] = useState('All');
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false);

  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form state for adding/editing product
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Welding Electrodes',
    subcategory: 'Low Hydrogen',
    awsClass: 'E7018-1',
    status: 'Active',
    featured: false,
    image: '/cat-electrode.png',
  });

  const [dbCategories, setDbCategories] = useState([]);

  // Fetch live products & categories from MongoDB Atlas
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProducts({ limit: 200 })
      .then((data) => {
        if (mounted) {
          const rawProds = data.products || [];
          const normalized = rawProds.map((p, idx) => ({
            ...p,
            id: p.id || p._id || `prod-${idx}`,
            status: p.status || 'Active',
            featured: Boolean(p.featured),
            updated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (p.updated || 'Recent'),
            category: p.category || 'General',
            subcategory: p.subcategory || 'General',
            awsClass: p.awsClass || 'N/A',
            image: p.image || '/cat-placeholder.png',
          }));
          setProducts(normalized);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('[Catalogue] Backend not reachable:', err.message);
        if (mounted) setLoading(false);
      });

    fetchCategories()
      .then((data) => {
        if (mounted && data.categories) {
          setDbCategories(data.categories.map((c) => c.name));
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Filter logic
  const filteredProducts = useMemo(() => {
    const q = (tableSearch || globalSearch).trim().toLowerCase();
    return products.filter((p) => {
      // Search match
      if (q) {
        const matchesName = (p.name || '').toLowerCase().includes(q);
        const matchesSku = (p.sku || '').toLowerCase().includes(q);
        const matchesAws = (p.awsClass || '').toLowerCase().includes(q);
        const matchesCategory = (p.category || '').toLowerCase().includes(q);
        const matchesSubcategory = (p.subcategory || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesAws && !matchesCategory && !matchesSubcategory) {
          return false;
        }
      }

      // Category match
      if (selectedCategory !== 'All' && (p.category || '') !== selectedCategory) {
        return false;
      }

      // Subcategory match
      if (selectedSubcategory !== 'All' && (p.subcategory || '') !== selectedSubcategory) {
        return false;
      }

      // Status match
      if (selectedStatus !== 'All' && (p.status || '') !== selectedStatus) {
        return false;
      }

      // AWS Class filter (from more filters)
      if (filterAwsClass !== 'All' && (p.awsClass || '') !== filterAwsClass) {
        return false;
      }

      // Featured filter
      if (filterFeaturedOnly && !p.featured) {
        return false;
      }

      return true;
    });
  }, [
    products,
    tableSearch,
    globalSearch,
    selectedCategory,
    selectedSubcategory,
    selectedStatus,
    filterAwsClass,
    filterFeaturedOnly,
  ]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, validCurrentPage, itemsPerPage]);

  // Featured toggle
  const toggleFeatured = async (id) => {
    const target = products.find((item) => item.id === id || item._id === id || item.sku === id);
    if (!target) return;

    const nextVal = !target.featured;
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id || item._id === id || item.sku === id
          ? { ...item, featured: nextVal }
          : item
      )
    );
    showToast(nextVal ? `Marked "${target.name}" as Featured.` : `Removed "${target.name}" from Featured.`);

    try {
      const identifier = target._id || target.id || target.sku;
      await updateProductApi(identifier, { featured: nextVal });
    } catch (err) {
      console.error('Failed to update featured status in DB:', err);
      showToast('Error saving featured status: ' + err.message);
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((item) =>
          item.id === id || item._id === id || item.sku === id
            ? { ...item, featured: target.featured }
            : item
        )
      );
    }
  };

  // Status toggle
  const toggleStatus = async (id) => {
    const target = products.find((item) => item.id === id || item._id === id || item.sku === id);
    if (!target) return;

    const nextVal = (target.status || 'Active').toLowerCase() === 'active' ? 'Inactive' : 'Active';
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id || item._id === id || item.sku === id
          ? { ...item, status: nextVal }
          : item
      )
    );
    showToast(`Status changed to ${nextVal} for "${target.name}".`);

    try {
      const identifier = target._id || target.id || target.sku;
      await updateProductApi(identifier, { status: nextVal });
    } catch (err) {
      console.error('Failed to update status in DB:', err);
      showToast('Error saving status: ' + err.message);
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((item) =>
          item.id === id || item._id === id || item.sku === id
            ? { ...item, status: target.status }
            : item
        )
      );
    }
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      sku: `WE-${Math.floor(1000 + Math.random() * 9000)}-LH`,
      category: 'Welding Electrodes',
      subcategory: 'Low Hydrogen',
      awsClass: 'E7018-1',
      status: 'Active',
      featured: false,
      image: '/cat-electrode.png',
    });
    setAddModalOpen(true);
  };

  // Submit Add
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newProd = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category,
      subcategory: formData.subcategory,
      awsClass: formData.awsClass.trim(),
      featured: formData.featured,
      status: formData.status,
      image: formData.image || '/cat-placeholder.png',
    };

    try {
      const res = await createProductApi(newProd);
      const savedProd = res.product || { ...newProd, id: `prod-${Date.now()}`, updated: 'Just now' };
      setProducts((prev) => [savedProd, ...prev]);
      setAddModalOpen(false);
      showToast(`Added product "${savedProd.name}" to MongoDB Atlas.`);
    } catch (err) {
      // Local fallback
      const fallbackProd = { ...newProd, id: `prod-${Date.now()}`, updated: 'Just now' };
      setProducts((prev) => [fallbackProd, ...prev]);
      setAddModalOpen(false);
      showToast(err.message || 'Added product.');
    }
  };

  // Open edit modal
  const handleOpenEditModal = (prod) => {
    setEditProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      subcategory: prod.subcategory,
      awsClass: prod.awsClass,
      status: prod.status,
      featured: prod.featured,
      image: prod.image,
    });
    setMenuOpenId(null);
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editProduct) return;

    const updatedData = {
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category,
      subcategory: formData.subcategory,
      awsClass: formData.awsClass.trim(),
      status: formData.status,
      featured: formData.featured,
      image: formData.image,
    };

    setProducts((prev) =>
      prev.map((item) =>
        item.id === editProduct.id || item._id === editProduct._id
          ? {
              ...item,
              ...updatedData,
              updated: 'Just now',
            }
          : item
      )
    );
    setEditProduct(null);
    showToast(`Updated product "${formData.name}".`);

    try {
      await updateProductApi(editProduct.sku || editProduct._id || editProduct.id, updatedData);
    } catch (err) {
      console.warn('Backend update error:', err.message);
    }
  };

  // Duplicate product
  const handleDuplicate = async (prod) => {
    const duplicated = {
      ...prod,
      name: `${prod.name} (Copy)`,
      sku: `${prod.sku}-CP`,
      status: 'Draft',
    };
    delete duplicated._id;
    delete duplicated.id;

    try {
      const res = await createProductApi(duplicated);
      const saved = res.product || { ...duplicated, id: `prod-${Date.now()}`, updated: 'Just now' };
      setProducts((prev) => [saved, ...prev]);
      showToast(`Duplicated "${prod.name}" in MongoDB Atlas.`);
    } catch (err) {
      const fallback = { ...duplicated, id: `prod-${Date.now()}`, updated: 'Just now' };
      setProducts((prev) => [fallback, ...prev]);
      showToast(`Duplicated "${prod.name}".`);
    }
    setMenuOpenId(null);
  };

  // Delete product
  const handleDelete = async (id, name) => {
    setProducts((prev) => prev.filter((item) => item.id !== id && item._id !== id));
    setMenuOpenId(null);
    showToast(`Deleted "${name}".`);

    try {
      await deleteProductApi(id);
    } catch (err) {
      console.warn('Backend delete error:', err.message);
    }
  };

  // Unique categories & subcategories for dropdowns
  const categoriesList = ['All', ...Array.from(new Set([...(dbCategories.length ? dbCategories : [])]))];
  const subcategoriesList = ['All', ...Array.from(new Set(products.map((p) => p.subcategory).filter(Boolean)))];
  const awsClassList = ['All', ...Array.from(new Set(products.map((p) => p.awsClass).filter(Boolean)))];

  return (
    <div className="admin-shell">
      {/* Sidebar with identical structure and active Catalogue tab */}
      <AdminSidebar
        currentNav="Catalogue"
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="admin-main">
        {/* Topbar with Title Catalogue, Search, Alerts, Settings, Profile Avatar */}
        <AdminTopbar
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onToast={showToast}
          title="Catalogue"
        />

        {/* Main Catalogue View */}
        <main className="catalogue-content">
          {/* Header Row: Title & Add Product Button */}
          <div className="catalogue-heading-row">
            <div>
              <h1 className="catalogue-title">Product Catalogue</h1>
              <p className="catalogue-subtitle">
                Showing {totalItems} {totalItems === 1 ? 'Product' : 'Products'}
              </p>
            </div>
            <button
              className="btn-add-product"
              onClick={handleOpenAddModal}
              type="button"
            >
              <Plus aria-hidden="true" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Filter Bar (Search by name/code, Categories, Subcategories, Status, More Filters) */}
          <section aria-label="Product filters" className="catalogue-filter-bar">
            {/* Search Input */}
            <div className="filter-search-box">
              <Search className="filter-search-icon" aria-hidden="true" />
              <input
                aria-label="Search by name or code"
                className="filter-search-input"
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name/code..."
                type="text"
                value={tableSearch}
              />
              {tableSearch && (
                <button
                  aria-label="Clear search"
                  className="filter-clear-btn"
                  onClick={() => setTableSearch('')}
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="filter-dropdown-wrapper">
              <select
                aria-label="Filter by Category"
                className="filter-select"
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                value={selectedCategory}
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="filter-dropdown-chevron" aria-hidden="true" />
            </div>

            {/* Subcategory Dropdown */}
            <div className="filter-dropdown-wrapper">
              <select
                aria-label="Filter by Subcategory"
                className="filter-select"
                onChange={(e) => {
                  setSelectedSubcategory(e.target.value);
                  setCurrentPage(1);
                }}
                value={selectedSubcategory}
              >
                {subcategoriesList.map((subcat) => (
                  <option key={subcat} value={subcat}>
                    {subcat === 'All' ? 'All Subcategories' : subcat}
                  </option>
                ))}
              </select>
              <ChevronDown className="filter-dropdown-chevron" aria-hidden="true" />
            </div>

            {/* Status Dropdown */}
            <div className="filter-dropdown-wrapper">
              <select
                aria-label="Filter by Status"
                className="filter-select"
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                value={selectedStatus}
              >
                <option value="All">Status: All</option>
                <option value="Active">Status: Active</option>
                <option value="Inactive">Status: Inactive</option>
              </select>
              <ChevronDown className="filter-dropdown-chevron" aria-hidden="true" />
            </div>

            {/* More Filters Button */}
            <button
              className={`btn-more-filters${moreFiltersOpen || filterAwsClass !== 'All' || filterFeaturedOnly ? ' btn-more-filters--active' : ''}`}
              onClick={() => setMoreFiltersOpen((o) => !o)}
              type="button"
            >
              <SlidersHorizontal aria-hidden="true" />
              <span>More Filters</span>
              {(filterAwsClass !== 'All' || filterFeaturedOnly) && <span className="active-filter-dot" />}
            </button>
          </section>

          {/* More Filters Drawer/Panel */}
          {moreFiltersOpen && (
            <div className="more-filters-panel">
              <div className="more-filters-inner">
                <div className="more-filter-group">
                  <label className="more-filter-label" htmlFor="aws-filter">
                    AWS Classification
                  </label>
                  <select
                    className="filter-select"
                    id="aws-filter"
                    onChange={(e) => {
                      setFilterAwsClass(e.target.value);
                      setCurrentPage(1);
                    }}
                    value={filterAwsClass}
                  >
                    {awsClassList.map((item) => (
                      <option key={item} value={item}>
                        {item === 'All' ? 'All AWS Classes' : item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="more-filter-group more-filter-group--checkbox">
                  <label className="checkbox-container">
                    <input
                      checked={filterFeaturedOnly}
                      onChange={(e) => {
                        setFilterFeaturedOnly(e.target.checked);
                        setCurrentPage(1);
                      }}
                      type="checkbox"
                    />
                    <span>Show Featured Products Only</span>
                  </label>
                </div>

                <div className="more-filters-actions">
                  <button
                    className="btn-reset-filters"
                    onClick={() => {
                      setFilterAwsClass('All');
                      setFilterFeaturedOnly(false);
                      setSelectedCategory('All');
                      setSelectedSubcategory('All');
                      setSelectedStatus('All');
                      setTableSearch('');
                      setCurrentPage(1);
                    }}
                    type="button"
                  >
                    Reset All Filters
                  </button>
                  <button
                    className="btn-apply-filters"
                    onClick={() => setMoreFiltersOpen(false)}
                    type="button"
                  >
                    Apply & Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Catalogue Table Card */}
          <section aria-label="Products Table" className="catalogue-table-card">
            <div className="table-responsive">
              <table className="catalogue-table">
                <thead>
                  <tr>
                    <th scope="col" className="th-product">Product & SKU</th>
                    <th scope="col" className="th-category">Category</th>
                    <th scope="col" className="th-aws">AWS Class</th>
                    <th scope="col" className="th-featured">Featured</th>
                    <th scope="col" className="th-status">Status</th>
                    <th scope="col" className="th-updated">Updated</th>
                    <th scope="col" className="th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="table-empty-cell" style={{ textAlign: 'center', padding: '3rem' }}>
                        <span style={{ color: 'var(--text-muted, #94a3b8)' }}>
                          Loading live products from MongoDB Atlas...
                        </span>
                      </td>
                    </tr>
                  ) : paginatedProducts.length > 0 ? (
                    paginatedProducts.map((prod, idx) => (
                      <tr key={prod.id || prod._id || `p-${idx}`} className="table-row">
                        {/* Product & SKU */}
                        <td className="td-product">
                          <div className="product-identity-cell">
                            <div className="product-thumb-shell">
                              <img
                                alt={prod.name}
                                className="product-thumb-img"
                                src={prod.image}
                                onError={(e) => {
                                  e.currentTarget.src = '/cat-placeholder.png';
                                }}
                              />
                            </div>
                            <div className="product-text-details">
                              <h2
                                className="product-item-name product-item-name--link"
                                onClick={() => onViewProductDetails?.(prod)}
                                style={{ cursor: 'pointer' }}
                              >
                                {prod.name}
                              </h2>
                              <span className="product-item-sku">SKU: {prod.sku}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="td-category">
                          <span className="category-text">
                            {prod.category} &gt; {prod.subcategory}
                          </span>
                        </td>

                        {/* AWS Class */}
                        <td className="td-aws">
                          <span className="aws-class-code">{prod.awsClass}</span>
                        </td>

                        {/* Featured */}
                        <td className="td-featured">
                          <button
                            aria-label={prod.featured ? 'Remove from featured' : 'Mark as featured'}
                            className={`star-toggle-button${prod.featured ? ' star-toggle-button--featured' : ''}`}
                            onClick={() => toggleFeatured(prod.id || prod._id)}
                            type="button"
                          >
                            <Star aria-hidden="true" />
                          </button>
                        </td>

                        {/* Status */}
                        <td className="td-status">
                          <button
                            aria-label={`Toggle status from ${prod.status || 'Active'}`}
                            className={`status-pill status-pill--${(prod.status || 'Active').toLowerCase()}`}
                            onClick={() => toggleStatus(prod.id || prod._id)}
                            type="button"
                          >
                            {prod.status || 'Active'}
                          </button>
                        </td>

                        {/* Updated */}
                        <td className="td-updated">
                          <span className="updated-date-text">{prod.updated}</span>
                        </td>

                        {/* Actions */}
                        <td className="td-actions">
                          <div className="actions-cluster">
                            <button
                              aria-label={`View details of ${prod.name}`}
                              className="action-icon-btn"
                              onClick={() => {
                                if (onViewProductDetails) {
                                  onViewProductDetails(prod);
                                } else {
                                  setViewProduct(prod);
                                }
                              }}
                              title="View Product"
                              type="button"
                            >
                              <Eye aria-hidden="true" />
                            </button>
                            <button
                              aria-label={`Edit ${prod.name}`}
                              className="action-icon-btn"
                              onClick={() => {
                                if (onEditProduct) {
                                  onEditProduct(prod);
                                } else {
                                  handleOpenEditModal(prod);
                                }
                              }}
                              title="Edit Product"
                              type="button"
                            >
                              <Pencil aria-hidden="true" />
                            </button>

                            <div className="actions-menu-container">
                              <button
                                aria-expanded={menuOpenId === prod.id}
                                aria-label="More actions"
                                className="action-icon-btn"
                                onClick={() =>
                                  setMenuOpenId((cur) => (cur === prod.id ? null : prod.id))
                                }
                                title="More options"
                                type="button"
                              >
                                <MoreVertical aria-hidden="true" />
                              </button>

                              {menuOpenId === prod.id && (
                                <div className="actions-dropdown-menu">
                                  <button
                                    onClick={() => handleDuplicate(prod)}
                                    type="button"
                                  >
                                    <Copy aria-hidden="true" />
                                    <span>Duplicate</span>
                                  </button>
                                  <button
                                    onClick={() => toggleStatus(prod.id)}
                                    type="button"
                                  >
                                    <Check aria-hidden="true" />
                                    <span>Toggle {prod.status === 'Active' ? 'Inactive' : 'Active'}</span>
                                  </button>
                                  <button
                                    className="dropdown-delete-item"
                                    onClick={() => handleDelete(prod.id, prod.name)}
                                    type="button"
                                  >
                                    <Trash2 aria-hidden="true" />
                                    <span>Delete Product</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="table-empty-cell">
                        <div className="table-empty-state">
                          <p>No products found matching the criteria.</p>
                          <button
                            className="btn-reset-filters"
                            onClick={() => {
                              setTableSearch('');
                              setSelectedCategory('All');
                              setSelectedSubcategory('All');
                              setSelectedStatus('All');
                              setFilterAwsClass('All');
                              setFilterFeaturedOnly(false);
                            }}
                            type="button"
                          >
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer (Items per page, Page 1 of 13, Previous, Next) */}
            <footer className="catalogue-pagination-footer">
              <div className="pagination-per-page">
                <label htmlFor="items-per-page-select" className="per-page-label">
                  Items per page:
                </label>
                <div className="per-page-select-shell">
                  <select
                    id="items-per-page-select"
                    className="per-page-select"
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    value={itemsPerPage}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="per-page-chevron" aria-hidden="true" />
                </div>
              </div>

              <div className="pagination-controls">
                <span className="pagination-status-text">
                  Page {validCurrentPage} of {totalPages}
                </span>
                <div className="pagination-arrows">
                  <button
                    aria-label="Previous Page"
                    className="page-nav-button"
                    disabled={validCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    type="button"
                  >
                    <ChevronLeft aria-hidden="true" />
                  </button>
                  <button
                    aria-label="Next Page"
                    className="page-nav-button"
                    disabled={validCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    type="button"
                  >
                    <ChevronRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </footer>
          </section>
        </main>
      </div>

      {/* Add Product Modal */}
      {addModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <header className="modal-header">
              <h2 className="modal-title">Add New Product</h2>
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
                <label className="modal-label" htmlFor="new-product-name">Product Name *</label>
                <input
                  id="new-product-name"
                  className="modal-input"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Premium Low Hydrogen Electrode"
                  required
                  type="text"
                  value={formData.name}
                />
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="new-product-sku">SKU Code *</label>
                  <input
                    id="new-product-sku"
                    className="modal-input modal-input--tabular"
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. WE-7018-LH-01"
                    required
                    type="text"
                    value={formData.sku}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label" htmlFor="new-product-aws">AWS Classification *</label>
                  <input
                    id="new-product-aws"
                    className="modal-input modal-input--tabular"
                    onChange={(e) => setFormData({ ...formData, awsClass: e.target.value })}
                    placeholder="e.g. E7018-1"
                    required
                    type="text"
                    value={formData.awsClass}
                  />
                </div>
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="new-product-category">Category</label>
                  <select
                    id="new-product-category"
                    className="modal-input"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    value={formData.category}
                  >
                    <option value="Welding Electrodes">Welding Electrodes</option>
                    <option value="Consumables">Consumables</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label" htmlFor="new-product-subcategory">Subcategory</label>
                  <input
                    id="new-product-subcategory"
                    className="modal-input"
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="e.g. Low Hydrogen"
                    type="text"
                    value={formData.subcategory}
                  />
                </div>
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="new-product-status">Status</label>
                  <select
                    id="new-product-status"
                    className="modal-input"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    value={formData.status}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label" htmlFor="new-product-image">Thumbnail Image</label>
                  <select
                    id="new-product-image"
                    className="modal-input"
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    value={formData.image}
                  >
                    <option value="/cat-electrode.png">Welding Electrode (/cat-electrode.png)</option>
                    <option value="/cat-placeholder.png">Standard Rutile Placeholder (/cat-placeholder.png)</option>
                    <option value="/cat-mig-spool.png">Legacy MIG Wire Spool (/cat-mig-spool.png)</option>
                  </select>
                </div>
              </div>

              <div className="modal-checkbox-row">
                <label className="checkbox-container">
                  <input
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    type="checkbox"
                  />
                  <span>Feature this product in main spotlight</span>
                </label>
              </div>

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setAddModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-modal-submit" type="submit">
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <header className="modal-header">
              <h2 className="modal-title">Edit Product</h2>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => setEditProduct(null)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="modal-field">
                <label className="modal-label" htmlFor="edit-product-name">Product Name *</label>
                <input
                  id="edit-product-name"
                  className="modal-input"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  type="text"
                  value={formData.name}
                />
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="edit-product-sku">SKU Code *</label>
                  <input
                    id="edit-product-sku"
                    className="modal-input modal-input--tabular"
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    type="text"
                    value={formData.sku}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label" htmlFor="edit-product-aws">AWS Classification *</label>
                  <input
                    id="edit-product-aws"
                    className="modal-input modal-input--tabular"
                    onChange={(e) => setFormData({ ...formData, awsClass: e.target.value })}
                    required
                    type="text"
                    value={formData.awsClass}
                  />
                </div>
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="edit-product-category">Category</label>
                  <select
                    id="edit-product-category"
                    className="modal-input"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    value={formData.category}
                  >
                    <option value="Welding Electrodes">Welding Electrodes</option>
                    <option value="Consumables">Consumables</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label" htmlFor="edit-product-subcategory">Subcategory</label>
                  <input
                    id="edit-product-subcategory"
                    className="modal-input"
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    type="text"
                    value={formData.subcategory}
                  />
                </div>
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="edit-product-status">Status</label>
                  <select
                    id="edit-product-status"
                    className="modal-input"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    value={formData.status}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label className="modal-label" htmlFor="edit-product-image">Thumbnail Image</label>
                  <select
                    id="edit-product-image"
                    className="modal-input"
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    value={formData.image}
                  >
                    <option value="/cat-electrode.png">Welding Electrode (/cat-electrode.png)</option>
                    <option value="/cat-placeholder.png">Standard Rutile Placeholder (/cat-placeholder.png)</option>
                    <option value="/cat-mig-spool.png">Legacy MIG Wire Spool (/cat-mig-spool.png)</option>
                  </select>
                </div>
              </div>

              <div className="modal-checkbox-row">
                <label className="checkbox-container">
                  <input
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    type="checkbox"
                  />
                  <span>Feature this product in spotlight</span>
                </label>
              </div>

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setEditProduct(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-modal-submit" type="submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Details Modal */}
      {viewProduct && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card view-modal-card">
            <header className="modal-header">
              <h2 className="modal-title">Product Details</h2>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => setViewProduct(null)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>
            <div className="view-modal-body">
              <div className="view-modal-visual">
                <img
                  alt={viewProduct.name}
                  className="view-modal-img"
                  src={viewProduct.image}
                  onError={(e) => {
                    e.currentTarget.src = '/cat-placeholder.png';
                  }}
                />
              </div>
              <div className="view-modal-specs">
                <div className="view-spec-item">
                  <span className="view-spec-label">Product Name</span>
                  <strong className="view-spec-value view-spec-title">{viewProduct.name}</strong>
                </div>
                <div className="view-spec-item">
                  <span className="view-spec-label">SKU Number</span>
                  <span className="view-spec-value view-spec-tabular">{viewProduct.sku}</span>
                </div>
                <div className="view-spec-item">
                  <span className="view-spec-label">Classification</span>
                  <span className="view-spec-value view-spec-tabular">{viewProduct.awsClass}</span>
                </div>
                <div className="view-spec-item">
                  <span className="view-spec-label">Category Path</span>
                  <span className="view-spec-value">{viewProduct.category} &gt; {viewProduct.subcategory}</span>
                </div>
                <div className="view-spec-item">
                  <span className="view-spec-label">Current Status</span>
                  <span className={`status-pill status-pill--${viewProduct.status.toLowerCase()}`}>
                    {viewProduct.status}
                  </span>
                </div>
                <div className="view-spec-item">
                  <span className="view-spec-label">Featured Spotlight</span>
                  <span className="view-spec-value">
                    {viewProduct.featured ? '★ Yes (Featured)' : 'No'}
                  </span>
                </div>
                <div className="view-spec-item">
                  <span className="view-spec-label">Last Updated</span>
                  <span className="view-spec-value">{viewProduct.updated}</span>
                </div>
              </div>
            </div>
            <div className="modal-actions-footer">
              <button
                className="btn-modal-cancel"
                onClick={() => setViewProduct(null)}
                type="button"
              >
                Close
              </button>
              <button
                className="btn-modal-submit"
                onClick={() => {
                  const p = viewProduct;
                  setViewProduct(null);
                  handleOpenEditModal(p);
                }}
                type="button"
              >
                Edit Product
              </button>
            </div>
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
