import { useEffect, useState, useRef } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Bold,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Download,
  FileCheck2,
  FileText,
  Flame,
  FlaskConical,
  GripVertical,
  Image as ImageIcon,
  ImagePlus,
  Info,
  Italic,
  Layers,
  List,
  ListOrdered,
  Plus,
  RefreshCw,
  Search,
  Shapes,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  UploadCloud,
  Wrench,
  X,
  Zap,
  Loader2,
} from 'lucide-react';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';
import { updateProductApi, createProductApi, fetchProductById, fetchCategories, uploadImageApi } from './api/products.js';
import './EditProductPage.css';

// Element metadata mapping for clean human-readable element names
const ELEMENT_NAMES = {
  C: 'Carbon (C)',
  Mn: 'Manganese (Mn)',
  Si: 'Silicon (Si)',
  P: 'Phosphorus (P)',
  S: 'Sulfur (S)',
  Cr: 'Chromium (Cr)',
  Ni: 'Nickel (Ni)',
  Mo: 'Molybdenum (Mo)',
  Nb: 'Niobium (Nb)',
  Ti: 'Titanium (Ti)',
  Cu: 'Copper (Cu)',
  Al: 'Aluminum (Al)',
  Fe: 'Iron (Fe)',
  V: 'Vanadium (V)',
  W: 'Tungsten (W)',
};

const FEATURE_ICONS_LIST = [
  { id: 'Sparkles', label: 'Sparkles (Efficiency & Finish)', icon: Sparkles },
  { id: 'Zap', label: 'Lightning (Arc Stability & Electrical)', icon: Zap },
  { id: 'ShieldCheck', label: 'Shield (Toughness & Protection)', icon: ShieldCheck },
  { id: 'Flame', label: 'Flame (High Temperature Resistance)', icon: Flame },
  { id: 'Layers', label: 'Layers (Deposition & Multi-pass)', icon: Layers },
  { id: 'Award', label: 'Award (Certified Standards)', icon: Award },
  { id: 'Wrench', label: 'Wrench (Machinability & Handling)', icon: Wrench },
  { id: 'CheckCircle2', label: 'Check Circle (Standard Feature)', icon: CheckCircle2 },
];

const APPLICATION_INDUSTRIES = [
  'Heavy Engineering & Fabrication',
  'Shipbuilding & Marine Structures',
  'Oil & Gas / Offshore Platforms',
  'Pressure Vessels & Boilers',
  'Structural Steel & Construction',
  'Automotive & Heavy Vehicles',
  'Power Generation & Pipelines',
  'Mining & Earthmoving Equipment',
  'Aerospace & Defense',
  'General Industrial Maintenance',
];

const renderFeatureIconComponent = (iconName) => {
  switch (iconName) {
    case 'Zap':
      return <Zap className="feature-glyph-icon" aria-hidden="true" />;
    case 'ShieldCheck':
      return <ShieldCheck className="feature-glyph-icon" aria-hidden="true" />;
    case 'Flame':
      return <Flame className="feature-glyph-icon" aria-hidden="true" />;
    case 'Layers':
      return <Layers className="feature-glyph-icon" aria-hidden="true" />;
    case 'Award':
      return <Award className="feature-glyph-icon" aria-hidden="true" />;
    case 'Wrench':
      return <Wrench className="feature-glyph-icon" aria-hidden="true" />;
    case 'CheckCircle2':
      return <CheckCircle2 className="feature-glyph-icon" aria-hidden="true" />;
    case 'Sparkles':
      return <Sparkles className="feature-glyph-icon" aria-hidden="true" />;
    default:
      return null;
  }
};

const navSections = [
  { id: 'basic', label: '1. Basic Info', icon: Info },
  { id: 'classification', label: '2. Classification', icon: Shapes },
  { id: 'technical', label: '3. Technical Specs', icon: Cpu },
  { id: 'features', label: '4. Features & Apps', icon: Star },
  { id: 'chemical', label: '5. Chemical Comp.', icon: FlaskConical },
  { id: 'mechanical', label: '6. Mechanical Props.', icon: Wrench },
  { id: 'media', label: '7. Images & Media', icon: ImageIcon },
  { id: 'documents', label: '8. Documents', icon: FileText },
];

export default function EditProductPage({
  product,
  onBack,
  onLogout,
  onNavigate,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [activeSection, setActiveSection] = useState('basic');
  const [toastMessage, setToastMessage] = useState('');
  const [lastSavedText, setLastSavedText] = useState('Last saved: 2 mins ago');

  // Rich text formatting state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Modals state
  const [addRowModalOpen, setAddRowModalOpen] = useState(false);
  const [addElementModalOpen, setAddElementModalOpen] = useState(false);
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [addFeatureModalOpen, setAddFeatureModalOpen] = useState(false);
  const [addApplicationModalOpen, setAddApplicationModalOpen] = useState(false);

  // New Feature & Application form states
  const [newFeatureData, setNewFeatureData] = useState({
    text: '',
    icon: 'Sparkles',
  });
  const [newApplicationData, setNewApplicationData] = useState({
    name: '',
    industry: 'Heavy Engineering & Fabrication',
    description: '',
  });

  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        if (data?.categories) {
          setAvailableCategories(data.categories);
        }
      })
      .catch((err) => console.warn('Failed to load categories in EditProductPage:', err));
  }, []);

  // 1. Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    brand: product?.brand || 'Forge-Craft Industrial',
    category: product?.category || 'Welding Electrodes',
    subcategory: product?.subcategory || '',
    description: product?.description || '',
  });

  // 2. Classification State
  const [classification, setClassification] = useState({
    awsClassification: product?.awsClassification || product?.awsClass || '',
    compatibility: product?.compatibility || {
      mildSteel: true,
      lowAlloySteel: true,
      stainlessSteel: false,
      castIron: false,
    },
    industryApplications: product?.industryApplications || '',
  });

  // 3. Technical Specs State (Rows)
  const [techSpecsRows, setTechSpecsRows] = useState(product?.techSpecsRows || []);
  const [newRowData, setNewRowData] = useState({
    diameter: '2.5',
    length: '350',
    amperage: '',
    polarity: 'DC+, AC',
  });

  // 4. Features & Apps State
  const [features, setFeatures] = useState(product?.features || []);
  const [applications, setApplications] = useState(product?.applications || []);

  // 5. Chemical Composition State
  const [chemicalElements, setChemicalElements] = useState([]);
  const [newElementData, setNewElementData] = useState({
    element: 'Carbon (C)',
    customElement: '',
    typical: '-',
    min: '0.00',
    max: '0.00',
  });

  // 6. Mechanical Properties State
  const [mechProperties, setMechProperties] = useState([]);
  const [newPropertyData, setNewPropertyData] = useState({
    property: 'Tensile Strength',
    customProperty: '',
    valRange: '500 - 600',
    unit: 'MPa',
    requirement: '≥ 490 MPa',
  });

  // 7. Images & Media State (Real array from MongoDB)
  const [primaryImage, setPrimaryImage] = useState(product?.image || '');
  const [mediaList, setMediaList] = useState(
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : []
  );
  const [addImageModalOpen, setAddImageModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaPreview, setNewMediaPreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const imageFileInputRef = useRef(null);
  const docFileInputRef = useRef(null);

  // 8. Documents State
  const [documents, setDocuments] = useState(product?.documents || []);
  const [selectedDocFile, setSelectedDocFile] = useState(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [newDocData, setNewDocData] = useState({
    docType: 'Technical Data Sheet (TDS)',
    title: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const [isSaving, setIsSaving] = useState(false);

  // Helper to parse chemicalComposition object or chemicalElements array from product
  const parseChemicalData = (prod) => {
    if (Array.isArray(prod?.chemicalElements) && prod.chemicalElements.length > 0) {
      return prod.chemicalElements;
    }
    if (prod?.chemicalComposition && typeof prod.chemicalComposition === 'object') {
      return Object.entries(prod.chemicalComposition).map(([symbol, val], idx) => {
        const valStr = String(val).trim();
        const fullName = ELEMENT_NAMES[symbol] || `${symbol} (${symbol})`;
        return {
          id: `elem-${symbol}-${idx}`,
          element: fullName,
          symbol,
          typical: valStr,
          min: valStr.startsWith('<') ? '0.00' : valStr.startsWith('>') ? valStr.replace('>', '').trim() : valStr,
          max: valStr.startsWith('<') ? valStr.replace('<', '').trim() : '-',
          unit: '%',
        };
      });
    }
    return [];
  };

  // Helper to parse specifications object or mechProperties array from product
  const parseMechanicalData = (prod) => {
    if (Array.isArray(prod?.mechProperties) && prod.mechProperties.length > 0) {
      return prod.mechProperties;
    }
    if (prod?.specifications) {
      const specs = prod.specifications;
      const entries = specs instanceof Map ? Array.from(specs.entries()) : Object.entries(specs);
      return entries.map(([prop, val], idx) => ({
        id: `mech-${idx}`,
        property: prop,
        typical: String(val),
        requirement: prop.toLowerCase().includes('yield')
          ? 'Structural load proof'
          : prop.toLowerCase().includes('tensile')
          ? 'Standard ASTM / AWS'
          : prop.toLowerCase().includes('elongation')
          ? 'A5 gauge standard'
          : prop.toLowerCase().includes('impact')
          ? 'Charpy V-Notch test'
          : 'Standard certified',
      }));
    }
    return [];
  };

  // Fetch full live specifications from MongoDB Atlas when product opens
  useEffect(() => {
    const identifier = product?.sku || product?._id || product?.id;
    if (!identifier) return;

    let mounted = true;
    fetchProductById(identifier)
      .then((data) => {
        if (!mounted || !data.product) return;
        const p = data.product;
        setBasicInfo({
          name: p.name || '',
          sku: p.sku || '',
          brand: p.brand || 'Forge-Craft Industrial',
          category: p.category || '',
          subcategory: p.subcategory || '',
          description: p.description || '',
        });
        setClassification({
          awsClassification: p.awsClassification || p.awsClass || '',
          compatibility: p.compatibility || {
            mildSteel: true,
            lowAlloySteel: true,
            stainlessSteel: false,
            castIron: false,
          },
          industryApplications: p.industryApplications || '',
        });
        setTechSpecsRows(p.techSpecsRows || []);
        setFeatures(p.features || []);
        setApplications(p.applications || []);
        setChemicalElements(parseChemicalData(p));
        setMechProperties(parseMechanicalData(p));
        setDocuments(p.documents || []);

        const imgs = Array.isArray(p.images) && p.images.length > 0
          ? p.images
          : p.image
          ? [p.image]
          : [];
        setMediaList(imgs);
        setPrimaryImage(p.image || imgs[0] || '');
      })
      .catch((err) => {
        console.warn('[EditProduct] Backend fetch warning:', err.message);
      });

    return () => {
      mounted = false;
    };
  }, [product]);

  const handleSaveProduct = async () => {
    setIsSaving(true);

    // Synchronize chemicalComposition object from chemicalElements
    const chemicalCompositionObj = {};
    chemicalElements.forEach((el) => {
      // Extract symbol inside parenthesis, e.g. "Carbon (C)" -> "C"
      const match = el.element.match(/\(([^)]+)\)/);
      const sym = match ? match[1] : el.element.trim();
      chemicalCompositionObj[sym] = el.typical && el.typical !== '-' ? el.typical : el.max !== '0.00' ? `< ${el.max}` : el.min;
    });

    // Synchronize specifications map/object from mechProperties
    const specificationsObj = {};
    mechProperties.forEach((mp) => {
      specificationsObj[mp.property] = mp.typical;
    });

    const payload = {
      name: basicInfo.name,
      sku: basicInfo.sku,
      brand: basicInfo.brand,
      category: basicInfo.category,
      subcategory: basicInfo.subcategory,
      description: basicInfo.description,
      awsClass: classification.awsClassification,
      awsClassification: classification.awsClassification,
      compatibility: classification.compatibility,
      industryApplications: classification.industryApplications,
      techSpecsRows,
      features,
      applications,
      chemicalElements,
      chemicalComposition: chemicalCompositionObj,
      mechProperties,
      specifications: specificationsObj,
      documents,
      image: primaryImage || mediaList[0] || null,
      images: mediaList,
    };

    try {
      const identifier = product?.sku || product?._id || basicInfo.sku;
      await updateProductApi(identifier, payload);
      setLastSavedText('Last saved: Just now (Atlas DB)');
      showToast('Product specifications updated successfully in MongoDB Atlas.');
    } catch (err) {
      setLastSavedText('Last saved: Local update');
      showToast(err.message || 'Saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    showToast('Changes discarded.');
  };

  // Add Technical Spec Row Submit
  const handleAddRowSubmit = (e) => {
    e.preventDefault();
    const row = {
      id: `r-${Date.now()}`,
      diameter: newRowData.diameter,
      length: newRowData.length,
      amperage: newRowData.amperage || '140 - 190',
      polarity: newRowData.polarity || 'DC+, AC',
    };
    setTechSpecsRows((prev) => [...prev, row]);
    setAddRowModalOpen(false);
    showToast('Technical specification row added.');
  };

  // Add Feature Modal Submit
  const handleAddFeatureSubmit = (e) => {
    e.preventDefault();
    if (!newFeatureData.text.trim()) {
      showToast('Feature text is required.');
      return;
    }
    const newFeat = {
      id: `f-${Date.now()}`,
      text: newFeatureData.text.trim(),
      icon: newFeatureData.icon || '',
    };
    setFeatures((prev) => [...prev, newFeat]);
    setNewFeatureData({ text: '', icon: 'Sparkles' });
    setAddFeatureModalOpen(false);
    showToast('New feature added successfully.');
  };

  const handleDeleteFeature = (idOrIdx) => {
    setFeatures((prev) =>
      prev.filter((item, idx) => (item.id ? item.id !== idOrIdx : idx !== idOrIdx))
    );
    showToast('Feature removed.');
  };

  // Add Application Modal Submit
  const handleAddApplicationSubmit = (e) => {
    e.preventDefault();
    if (!newApplicationData.name.trim()) {
      showToast('Application name is required.');
      return;
    }
    const newApp = {
      id: `a-${Date.now()}`,
      name: newApplicationData.name.trim(),
      industry: newApplicationData.industry || 'Heavy Engineering & Fabrication',
      description: newApplicationData.description.trim(),
    };
    setApplications((prev) => [...prev, newApp]);
    setNewApplicationData({
      name: '',
      industry: 'Heavy Engineering & Fabrication',
      description: '',
    });
    setAddApplicationModalOpen(false);
    showToast('New application added successfully.');
  };

  const handleDeleteApplication = (idOrIdx) => {
    setApplications((prev) =>
      prev.filter((item, idx) => (item.id ? item.id !== idOrIdx : idx !== idOrIdx))
    );
    showToast('Application removed.');
  };

  // Add Chemical Element Submit
  const handleAddElementSubmit = (e) => {
    e.preventDefault();
    const finalName = newElementData.element === 'Other'
      ? (newElementData.customElement.trim() || 'Custom Element')
      : newElementData.element;

    const elem = {
      id: `c-${Date.now()}`,
      element: finalName,
      typical: newElementData.typical !== '0.00' ? newElementData.typical : '-',
      min: newElementData.min,
      max: newElementData.max,
      unit: '%',
    };
    setChemicalElements((prev) => [...prev, elem]);
    setAddElementModalOpen(false);
    setNewElementData({
      element: 'Carbon (C)',
      customElement: '',
      typical: '-',
      min: '0.00',
      max: '0.00',
    });
    showToast(`Added ${elem.element} to chemical composition.`);
  };

  const handleDeleteElement = (id) => {
    setChemicalElements((prev) => prev.filter((item) => item.id !== id));
    showToast('Element removed.');
  };

  // Add Mechanical Property Submit
  const handleAddPropertySubmit = (e) => {
    e.preventDefault();
    const finalProp = newPropertyData.property === 'Other'
      ? (newPropertyData.customProperty.trim() || 'Custom Property')
      : newPropertyData.property;

    const prop = {
      id: `m-${Date.now()}`,
      property: finalProp,
      typical: `${newPropertyData.valRange} ${newPropertyData.unit}`.trim(),
      requirement: newPropertyData.requirement || '-',
    };
    setMechProperties((prev) => [...prev, prop]);
    setAddPropertyModalOpen(false);
    setNewPropertyData({
      property: 'Tensile Strength',
      customProperty: '',
      valRange: '500 - 600',
      unit: 'MPa',
      requirement: '≥ 490 MPa',
    });
    showToast(`Added ${prop.property} to mechanical properties.`);
  };

  const handleDeleteProperty = (id) => {
    setMechProperties((prev) => prev.filter((item) => item.id !== id));
    showToast('Property removed.');
  };

  // Set any media image as Primary
  const handleSetPrimaryImage = (imgUrl) => {
    setPrimaryImage(imgUrl);
    showToast('Selected image marked as Primary.');
  };

  // Delete image from mediaList
  const handleDeleteMediaImage = (imgUrl) => {
    const updated = mediaList.filter((x) => x !== imgUrl);
    setMediaList(updated);
    if (primaryImage === imgUrl) {
      setPrimaryImage(updated[0] || '');
    }
    showToast('Image removed from gallery.');
  };

  // Handle direct file selection for Add Image
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showToast('Image file size must be less than 25MB', 'error');
      return;
    }

    setSelectedImageFile(file);
    setNewMediaUrl('');
    setNewMediaPreview(URL.createObjectURL(file));
  };

  // Submit adding new image (file upload or URL)
  const handleAddImageSubmit = async (e) => {
    e.preventDefault();
    let finalUrl = '';

    try {
      setIsUploadingImage(true);

      if (selectedImageFile) {
        showToast('Uploading image to server...');
        const res = await uploadImageApi(selectedImageFile);
        finalUrl = res.url;
      } else if (newMediaUrl.trim()) {
        finalUrl = newMediaUrl.trim();
      }

      if (!finalUrl) {
        showToast('Please choose an image file or enter a valid URL', 'error');
        setIsUploadingImage(false);
        return;
      }

      setMediaList((prev) => [...prev, finalUrl]);
      if (!primaryImage) {
        setPrimaryImage(finalUrl);
      }

      setAddImageModalOpen(false);
      setSelectedImageFile(null);
      setNewMediaUrl('');
      setNewMediaPreview('');
      showToast('Image added to media gallery.');
    } catch (err) {
      console.error('Failed to upload image:', err);
      showToast('Failed to upload image: ' + err.message, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle file selection for Add Document
  const handleDocFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      showToast('Document file size must be under 50MB', 'error');
      return;
    }

    setSelectedDocFile(file);
    if (!newDocData.title) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setNewDocData((prev) => ({ ...prev, title: nameWithoutExt }));
    }
  };

  // Add Document Submit with real file upload
  const handleUploadDocSubmit = async (e) => {
    e.preventDefault();
    if (!newDocData.title.trim()) {
      showToast('Document title is required', 'error');
      return;
    }

    let fileUrl = '';
    let fileMeta = 'PDF • 1.5 MB';

    try {
      setIsUploadingDoc(true);

      if (selectedDocFile) {
        showToast('Uploading document to server...');
        const res = await uploadImageApi(selectedDocFile);
        fileUrl = res.url;
        const sizeMb = (selectedDocFile.size / (1024 * 1024)).toFixed(1);
        const ext = selectedDocFile.name.split('.').pop().toUpperCase();
        fileMeta = `${ext} • ${sizeMb} MB`;
      }

      const doc = {
        id: `d-${Date.now()}`,
        title: newDocData.title.trim(),
        meta: fileMeta,
        fileUrl: fileUrl,
        type: newDocData.docType.toLowerCase().includes('sds')
          ? 'sds'
          : newDocData.docType.toLowerCase().includes('iso')
          ? 'iso'
          : 'tds',
      };

      setDocuments((prev) => [...prev, doc]);
      setUploadDocModalOpen(false);
      setSelectedDocFile(null);
      setNewDocData({ docType: 'Technical Data Sheet (TDS)', title: '' });
      showToast(`Uploaded document "${doc.title}".`);
    } catch (err) {
      console.error('Document upload error:', err);
      showToast('Failed to upload document: ' + err.message, 'error');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    showToast('Document removed.');
  };

  return (
    <div className="admin-shell">
      {/* Sidebar with identical structure and Catalogue active */}
      <AdminSidebar
        currentNav="Catalogue"
        mobileOpen={mobileSidebarOpen}
        onLogout={onLogout}
        onNavigate={onNavigate}
        setMobileOpen={setMobileSidebarOpen}
      />

      <div className="admin-main">
        {/* Topbar with Back button and Edit Product title */}
        <header className="admin-topbar">
          <div className="topbar-left-cluster">
            <button
              aria-label="Back to Catalogue"
              className="topbar-back-button"
              onClick={onBack}
              title="Back"
              type="button"
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <h1 className="topbar-title">Edit Product</h1>
          </div>

          <div className="topbar-tools">
            <label className="dashboard-search">
              <input
                aria-label="Search"
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search..."
                type="search"
                value={globalSearch}
              />
            </label>

            <button aria-label="Notifications" className="topbar-icon-button" type="button">
              <span className="bell-icon-wrapper">
                <span className="notification-dot" />
              </span>
            </button>

            <button aria-label="Settings" className="topbar-icon-button" type="button" />

            <button aria-label="Admin profile" className="profile-avatar" type="button">
              <img
                alt="Admin"
                className="profile-avatar-img"
                src="/avatar-admin.jpg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="profile-avatar-fallback">AD</span>
            </button>
          </div>
        </header>

        {/* Edit Product Main Area */}
        <main className="edit-product-content">
          {/* Breadcrumbs Row */}
          <nav aria-label="Breadcrumb" className="edit-breadcrumbs">
            <button className="breadcrumb-link" onClick={onBack} type="button">
              Catalogue
            </button>
            <ChevronRight className="breadcrumb-separator" aria-hidden="true" />
            <button className="breadcrumb-link" onClick={onBack} type="button">
              Products
            </button>
            <ChevronRight className="breadcrumb-separator" aria-hidden="true" />
            <span className="breadcrumb-current">Edit Product: E7018-1</span>
          </nav>

          {/* Heading Row: Title, Subtitle, and Published Badge */}
          <div className="edit-heading-row">
            <div>
              <h1 className="edit-page-title">Edit Product</h1>
              <p className="edit-page-subtitle">
                Update specifications and details for SKU: {basicInfo.sku}
              </p>
            </div>

            <div className="published-badge-container">
              <span className="badge-published">
                <CheckCircle2 className="badge-check-icon" aria-hidden="true" />
                <span>Published</span>
              </span>
            </div>
          </div>

          {/* Main 2-Column Editing Layout */}
          <div className="edit-layout-grid">
            {/* Left Vertical Section Navigation (8 sections strictly without SEO) */}
            <aside aria-label="Product Sections" className="edit-sections-nav">
              <div className="sections-nav-list">
                {navSections.map(({ id, label, icon: Icon }) => {
                  const isActive = activeSection === id;
                  return (
                    <button
                      key={id}
                      aria-current={isActive ? 'true' : undefined}
                      className={`section-nav-item${isActive ? ' section-nav-item--active' : ''}`}
                      onClick={() => setActiveSection(id)}
                      type="button"
                    >
                      <span className="section-nav-label">{label}</span>
                      <Icon className="section-nav-icon" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Right Form Card Panel */}
            <section className="edit-form-panel">
              {/* 1. BASIC INFO */}
              {activeSection === 'basic' && (
                <div className="form-section-card">
                  <header className="form-card-header">
                    <span className="step-circle-badge">1</span>
                    <h2 className="form-card-title">Basic Information</h2>
                  </header>

                  <div className="form-card-body">
                    {/* Product Name */}
                    <div className="edit-field-group">
                      <label className="edit-field-label" htmlFor="field-product-name">
                        Product Name <span className="required-star">*</span>
                      </label>
                      <input
                        id="field-product-name"
                        className="edit-text-input"
                        onChange={(e) =>
                          setBasicInfo({ ...basicInfo, name: e.target.value })
                        }
                        type="text"
                        value={basicInfo.name}
                      />
                    </div>

                    {/* SKU & Brand */}
                    <div className="edit-form-row-2">
                      <div className="edit-field-group">
                        <label className="edit-field-label" htmlFor="field-sku">
                          SKU <span className="required-star">*</span>
                        </label>
                        <input
                          id="field-sku"
                          className="edit-text-input edit-text-input--tabular"
                          onChange={(e) =>
                            setBasicInfo({ ...basicInfo, sku: e.target.value })
                          }
                          type="text"
                          value={basicInfo.sku}
                        />
                      </div>

                      <div className="edit-field-group">
                        <label className="edit-field-label" htmlFor="field-brand">
                          Brand
                        </label>
                        <div className="select-shell">
                          <select
                            id="field-brand"
                            className="edit-select-input"
                            onChange={(e) =>
                              setBasicInfo({ ...basicInfo, brand: e.target.value })
                            }
                            value={basicInfo.brand}
                          >
                            <option value="Forge-Craft Industrial">Forge-Craft Industrial</option>
                            <option value="Sprimax Industrial">Sprimax Industrial</option>
                          </select>
                          <ChevronDown className="select-chevron" aria-hidden="true" />
                        </div>
                      </div>
                    </div>

                    {/* Category & Subcategory */}
                    <div className="edit-form-row-2">
                      <div className="edit-field-group">
                        <label className="edit-field-label" htmlFor="field-category">
                          Category
                        </label>
                        <div className="select-shell">
                          <select
                            id="field-category"
                            className="edit-select-input"
                            onChange={(e) =>
                              setBasicInfo({ ...basicInfo, category: e.target.value })
                            }
                            value={basicInfo.category}
                          >
                            {availableCategories.length === 0 ? (
                              <option value={basicInfo.category || ''}>{basicInfo.category || 'Select Category'}</option>
                            ) : (
                              availableCategories.map((c) => (
                                <option key={c._id || c.name} value={c.name}>
                                  {c.name}
                                </option>
                              ))
                            )}
                          </select>
                          <ChevronDown className="select-chevron" aria-hidden="true" />
                        </div>
                      </div>

                      <div className="edit-field-group">
                        <label className="edit-field-label" htmlFor="field-subcategory">
                          Subcategory
                        </label>
                        <div className="select-shell">
                          {(() => {
                            const curCat = availableCategories.find((c) => c.name === basicInfo.category);
                            const curSubcats = curCat?.subcategories || [];

                            return (
                              <select
                                id="field-subcategory"
                                className="edit-select-input"
                                onChange={(e) =>
                                  setBasicInfo({ ...basicInfo, subcategory: e.target.value })
                                }
                                value={basicInfo.subcategory}
                              >
                                <option value="">Select Subcategory</option>
                                {basicInfo.subcategory && !curSubcats.includes(basicInfo.subcategory) && (
                                  <option value={basicInfo.subcategory}>{basicInfo.subcategory}</option>
                                )}
                                {curSubcats.map((sub) => (
                                  <option key={sub} value={sub}>
                                    {sub}
                                  </option>
                                ))}
                              </select>
                            );
                          })()}
                          <ChevronDown className="select-chevron" aria-hidden="true" />
                        </div>
                      </div>
                    </div>

                    {/* Rich Description Box */}
                    <div className="edit-field-group">
                      <div className="rich-editor-shell">
                        <div className="rich-toolbar">
                          <button
                            aria-label="Bold"
                            className={`toolbar-btn${isBold ? ' toolbar-btn--active' : ''}`}
                            onClick={() => setIsBold((b) => !b)}
                            type="button"
                          >
                            <Bold aria-hidden="true" />
                          </button>
                          <button
                            aria-label="Italic"
                            className={`toolbar-btn${isItalic ? ' toolbar-btn--active' : ''}`}
                            onClick={() => setIsItalic((i) => !i)}
                            type="button"
                          >
                            <Italic aria-hidden="true" />
                          </button>
                          <span className="toolbar-divider" aria-hidden="true" />
                          <button
                            aria-label="Bullet list"
                            className="toolbar-btn"
                            onClick={() => showToast('Bullet list toggled')}
                            type="button"
                          >
                            <List aria-hidden="true" />
                          </button>
                          <button
                            aria-label="Numbered list"
                            className="toolbar-btn"
                            onClick={() => showToast('Numbered list toggled')}
                            type="button"
                          >
                            <ListOrdered aria-hidden="true" />
                          </button>
                        </div>
                        <textarea
                          id="field-description"
                          className={`rich-textarea${isBold ? ' font-bold' : ''}${isItalic ? ' font-italic' : ''}`}
                          onChange={(e) =>
                            setBasicInfo({ ...basicInfo, description: e.target.value })
                          }
                          rows={6}
                          value={basicInfo.description}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CLASSIFICATION */}
              {activeSection === 'classification' && (
                <div className="form-section-card">
                  <header className="form-card-header">
                    <span className="step-circle-badge">2</span>
                    <h2 className="form-card-title">Classification</h2>
                  </header>

                  <div className="form-card-body">
                    {/* AWS Classification */}
                    <div className="edit-field-group">
                      <label className="edit-field-label" htmlFor="field-aws-class-input">
                        AWS Classification
                      </label>
                      <input
                        id="field-aws-class-input"
                        className="edit-text-input edit-text-input--tabular"
                        onChange={(e) =>
                          setClassification({
                            ...classification,
                            awsClassification: e.target.value,
                          })
                        }
                        type="text"
                        value={classification.awsClassification}
                      />
                    </div>

                    {/* Material Compatibility Checkboxes */}
                    <div className="edit-field-group">
                      <span className="edit-field-label">Material Compatibility</span>
                      <div className="compatibility-checkbox-row">
                        <label className="custom-check-item">
                          <input
                            checked={classification.compatibility.mildSteel}
                            onChange={(e) =>
                              setClassification({
                                ...classification,
                                compatibility: {
                                  ...classification.compatibility,
                                  mildSteel: e.target.checked,
                                },
                              })
                            }
                            type="checkbox"
                          />
                          <span className="custom-checkbox-box">
                            <Check className="check-svg" aria-hidden="true" />
                          </span>
                          <span className="check-label-text">Mild Steel</span>
                        </label>

                        <label className="custom-check-item">
                          <input
                            checked={classification.compatibility.lowAlloySteel}
                            onChange={(e) =>
                              setClassification({
                                ...classification,
                                compatibility: {
                                  ...classification.compatibility,
                                  lowAlloySteel: e.target.checked,
                                },
                              })
                            }
                            type="checkbox"
                          />
                          <span className="custom-checkbox-box">
                            <Check className="check-svg" aria-hidden="true" />
                          </span>
                          <span className="check-label-text">Low Alloy Steel</span>
                        </label>

                        <label className="custom-check-item">
                          <input
                            checked={classification.compatibility.stainlessSteel}
                            onChange={(e) =>
                              setClassification({
                                ...classification,
                                compatibility: {
                                  ...classification.compatibility,
                                  stainlessSteel: e.target.checked,
                                },
                              })
                            }
                            type="checkbox"
                          />
                          <span className="custom-checkbox-box">
                            <Check className="check-svg" aria-hidden="true" />
                          </span>
                          <span className="check-label-text">Stainless Steel</span>
                        </label>

                        <label className="custom-check-item">
                          <input
                            checked={classification.compatibility.castIron}
                            onChange={(e) =>
                              setClassification({
                                ...classification,
                                compatibility: {
                                  ...classification.compatibility,
                                  castIron: e.target.checked,
                                },
                              })
                            }
                            type="checkbox"
                          />
                          <span className="custom-checkbox-box">
                            <Check className="check-svg" aria-hidden="true" />
                          </span>
                          <span className="check-label-text">Cast Iron</span>
                        </label>
                      </div>
                    </div>

                    {/* Industry Applications (Tags) */}
                    <div className="edit-field-group">
                      <label className="edit-field-label" htmlFor="field-industry-tags">
                        Industry Applications (Tags)
                      </label>
                      <input
                        id="field-industry-tags"
                        className="edit-text-input"
                        onChange={(e) =>
                          setClassification({
                            ...classification,
                            industryApplications: e.target.value,
                          })
                        }
                        type="text"
                        value={classification.industryApplications}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. TECHNICAL SPECS */}
              {activeSection === 'technical' && (
                <div className="form-section-card">
                  <header className="form-card-header form-card-header--action">
                    <div className="header-title-bundle">
                      <span className="step-circle-badge">3</span>
                      <h2 className="form-card-title">Technical Specs</h2>
                    </div>
                    <button
                      className="btn-header-action"
                      onClick={() => setAddRowModalOpen(true)}
                      type="button"
                    >
                      + Add Row
                    </button>
                  </header>

                  <div className="form-card-body table-card-body">
                    <div className="table-responsive">
                      <table className="form-embedded-table">
                        <thead>
                          <tr>
                            <th scope="col">Diameter (mm)</th>
                            <th scope="col">Length (mm)</th>
                            <th scope="col">Amperage Range (A)</th>
                            <th scope="col">Polarity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {techSpecsRows.length > 0 ? (
                            techSpecsRows.map((row) => (
                              <tr key={row.id}>
                                <td className="td-tabular">{row.diameter}</td>
                                <td className="td-tabular">{row.length}</td>
                                <td className="td-tabular">{row.amperage}</td>
                                <td>{row.polarity}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted, #94a3b8)' }}>
                                No technical specs added yet. Click "+ Add Row" above to add.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. FEATURES & APPS */}
              {activeSection === 'features' && (
                <div className="form-section-card">
                  <header className="form-card-header">
                    <span className="step-circle-badge">4</span>
                    <h2 className="form-card-title">Features & Apps</h2>
                  </header>

                  <div className="form-card-body">
                    {/* Key Features */}
                    <div className="edit-field-group">
                      <div className="group-label-row">
                        <span className="edit-field-label">Key Features</span>
                        <button
                          className="btn-add-inline"
                          onClick={() => setAddFeatureModalOpen(true)}
                          type="button"
                        >
                          + Add Feature
                        </button>
                      </div>

                      <div className="reorder-list">
                        {features.length > 0 ? (
                          features.map((feat, idx) => {
                            const featText = typeof feat === 'string' ? feat : feat.text;
                            const featIcon = typeof feat === 'object' ? feat.icon : null;
                            const featId = typeof feat === 'object' && feat.id ? feat.id : idx;

                            return (
                              <div key={featId} className="reorder-item-shell feature-reorder-shell">
                                <GripVertical className="grip-icon" aria-hidden="true" />
                                {featIcon && (
                                  <span className="feature-icon-pill" title={featIcon}>
                                    {renderFeatureIconComponent(featIcon)}
                                  </span>
                                )}
                                <input
                                  className="reorder-input"
                                  onChange={(e) => {
                                    const copy = [...features];
                                    if (typeof copy[idx] === 'object') {
                                      copy[idx] = { ...copy[idx], text: e.target.value };
                                    } else {
                                      copy[idx] = e.target.value;
                                    }
                                    setFeatures(copy);
                                  }}
                                  type="text"
                                  value={featText}
                                />
                                <button
                                  aria-label="Delete feature"
                                  className="item-delete-btn"
                                  onClick={() => handleDeleteFeature(featId)}
                                  type="button"
                                >
                                  <Trash2 aria-hidden="true" />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <p style={{ padding: '1rem', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
                            No features added yet. Click "+ Add Feature" to add.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Applications / Use Cases */}
                    <div className="edit-field-group" style={{ marginTop: '24px' }}>
                      <div className="group-label-row">
                        <span className="edit-field-label">Applications / Use Cases</span>
                        <button
                          className="btn-add-inline"
                          onClick={() => setAddApplicationModalOpen(true)}
                          type="button"
                        >
                          + Add Application
                        </button>
                      </div>

                      <div className="applications-card-grid">
                        {applications.length > 0 ? (
                          applications.map((app, idx) => {
                            const appName = typeof app === 'string' ? app : app.name;
                            const appIndustry = typeof app === 'object' ? app.industry : null;
                            const appDesc = typeof app === 'object' ? app.description : null;
                            const appId = typeof app === 'object' && app.id ? app.id : idx;

                            return (
                              <div key={appId} className="application-rich-card">
                                <div className="app-card-top">
                                  <div className="app-card-title-group">
                                    <strong className="app-card-name">{appName}</strong>
                                    {appIndustry && (
                                      <span className="app-card-industry-tag">
                                        {appIndustry}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    aria-label="Delete application"
                                    className="item-delete-btn"
                                    onClick={() => handleDeleteApplication(appId)}
                                    type="button"
                                  >
                                    <Trash2 aria-hidden="true" />
                                  </button>
                                </div>
                                {appDesc && (
                                  <p className="app-card-description">{appDesc}</p>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p style={{ padding: '1rem', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
                            No applications added yet. Click "+ Add Application" to add.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. CHEMICAL COMPOSITION */}
              {activeSection === 'chemical' && (
                <div className="form-section-card">
                  <header className="form-card-header form-card-header--action">
                    <div className="header-title-bundle">
                      <span className="step-circle-badge">5</span>
                      <h2 className="form-card-title">Chemical Composition</h2>
                    </div>
                    <button
                      className="btn-header-action"
                      onClick={() => setAddElementModalOpen(true)}
                      type="button"
                    >
                      + Add Element
                    </button>
                  </header>

                  <div className="form-card-body table-card-body">
                    <div className="table-responsive">
                      <table className="form-embedded-table">
                        <thead>
                          <tr>
                            <th scope="col">Element</th>
                            <th scope="col">Typical</th>
                            <th scope="col">Min</th>
                            <th scope="col">Max</th>
                            <th scope="col">Unit</th>
                            <th scope="col" style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chemicalElements.length > 0 ? (
                            chemicalElements.map((elem) => (
                              <tr key={elem.id}>
                                <td style={{ fontWeight: 600 }}>{elem.element}</td>
                                <td className="td-tabular">{elem.typical}</td>
                                <td className="td-tabular">{elem.min}</td>
                                <td className="td-tabular">{elem.max}</td>
                                <td className="td-tabular">{elem.unit}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    aria-label={`Delete ${elem.element}`}
                                    className="item-delete-btn"
                                    onClick={() => handleDeleteElement(elem.id)}
                                    type="button"
                                  >
                                    <Trash2 aria-hidden="true" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted, #94a3b8)' }}>
                                No chemical composition elements added yet. Click "+ Add Element" above.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. MECHANICAL PROPERTIES */}
              {activeSection === 'mechanical' && (
                <div className="form-section-card">
                  <header className="form-card-header form-card-header--action">
                    <div className="header-title-bundle">
                      <span className="step-circle-badge">6</span>
                      <h2 className="form-card-title">Mechanical Properties</h2>
                    </div>
                    <button
                      className="btn-header-action"
                      onClick={() => setAddPropertyModalOpen(true)}
                      type="button"
                    >
                      + Add Property
                    </button>
                  </header>

                  <div className="form-card-body table-card-body">
                    <div className="table-responsive">
                      <table className="form-embedded-table">
                        <thead>
                          <tr>
                            <th scope="col">Property</th>
                            <th scope="col">Typical Value</th>
                            <th scope="col">Requirement / Standard</th>
                            <th scope="col" style={{ textAlign: 'center' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mechProperties.length > 0 ? (
                            mechProperties.map((prop) => (
                              <tr key={prop.id || prop.property}>
                                <td style={{ fontWeight: 600 }}>{prop.property}</td>
                                <td className="td-tabular">{prop.typical}</td>
                                <td className="td-tabular">{prop.requirement}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    aria-label={`Delete ${prop.property}`}
                                    className="item-delete-btn"
                                    onClick={() => handleDeleteProperty(prop.id)}
                                    type="button"
                                  >
                                    <Trash2 aria-hidden="true" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted, #94a3b8)' }}>
                                No mechanical properties added yet. Click "+ Add Property" above.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. IMAGES & MEDIA */}
              {activeSection === 'media' && (
                <div className="form-section-card">
                  <header className="form-card-header form-card-header--action">
                    <div className="header-title-bundle">
                      <span className="step-circle-badge">7</span>
                      <h2 className="form-card-title">Images & Media ({mediaList.length})</h2>
                    </div>
                    <button
                      className="btn-header-action"
                      onClick={() => {
                        setSelectedImageFile(null);
                        setNewMediaUrl('');
                        setNewMediaPreview('');
                        setAddImageModalOpen(true);
                      }}
                      type="button"
                    >
                      <ImagePlus className="upload-btn-icon" aria-hidden="true" />
                      <span>Add Image</span>
                    </button>
                  </header>

                  <div className="form-card-body">
                    <p className="media-section-hint">
                      Click <strong>"Set Primary"</strong> on any image to mark it as the default product hero image displayed across catalogues and customer views.
                    </p>

                    <div className="media-gallery-row">
                      {mediaList.length > 0 ? (
                        mediaList.map((imgUrl, idx) => {
                          const isPrimary = primaryImage === imgUrl || (!primaryImage && idx === 0);
                          return (
                            <div
                              key={idx}
                              className={`media-card-item ${isPrimary ? 'media-card-item--primary' : ''}`}
                            >
                              <div className="media-card-preview">
                                <img
                                  alt={`Product visual ${idx + 1}`}
                                  className="media-card-image"
                                  src={imgUrl}
                                  onError={(e) => {
                                    e.currentTarget.src = '/cat-placeholder.png';
                                  }}
                                />
                                {isPrimary && (
                                  <span className="media-primary-badge">
                                    ★ PRIMARY
                                  </span>
                                )}
                              </div>

                              <div className="media-card-footer">
                                {isPrimary ? (
                                  <span className="primary-active-label">
                                    Main Image
                                  </span>
                                ) : (
                                  <button
                                    className="btn-card-make-primary"
                                    onClick={() => handleSetPrimaryImage(imgUrl)}
                                    title="Make this the main product image"
                                    type="button"
                                  >
                                    <Star className="btn-star-icon" aria-hidden="true" />
                                    <span>Set Primary</span>
                                  </button>
                                )}

                                <button
                                  aria-label="Delete image"
                                  className="btn-card-delete-icon"
                                  onClick={() => handleDeleteMediaImage(imgUrl)}
                                  title="Delete image"
                                  type="button"
                                >
                                  <Trash2 aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="no-media-box">
                          <p>No media images uploaded for this product yet.</p>
                        </div>
                      )}

                      {/* Add Image Card */}
                      <button
                        className="media-card-item media-card-item--add"
                        onClick={() => {
                          setSelectedImageFile(null);
                          setNewMediaUrl('');
                          setNewMediaPreview('');
                          setAddImageModalOpen(true);
                        }}
                        type="button"
                      >
                        <div className="add-image-icon-circle">
                          <ImagePlus aria-hidden="true" />
                        </div>
                        <span className="add-image-title">Add Image</span>
                        <span className="add-image-subtitle">Upload or link photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. DOCUMENTS */}
              {activeSection === 'documents' && (
                <div className="form-section-card">
                  <header className="form-card-header form-card-header--action">
                    <div className="header-title-bundle">
                      <span className="step-circle-badge">8</span>
                      <h2 className="form-card-title">Documents</h2>
                    </div>
                    <button
                      className="btn-header-action"
                      onClick={() => setUploadDocModalOpen(true)}
                      type="button"
                    >
                      <Upload className="upload-btn-icon" aria-hidden="true" />
                      <span>Upload Document</span>
                    </button>
                  </header>

                  <div className="form-card-body">
                    <div className="docs-rows-container">
                      {documents.length > 0 ? (
                        documents.map((doc) => (
                          <div key={doc.id} className="doc-row-card">
                            <div className={`doc-icon-badge doc-icon-badge--${doc.type}`}>
                              {doc.type === 'tds' && <FileText aria-hidden="true" />}
                              {doc.type === 'sds' && <AlertTriangle aria-hidden="true" />}
                              {doc.type === 'iso' && <FileCheck2 aria-hidden="true" />}
                            </div>

                            <div className="doc-row-meta">
                              <strong className="doc-row-title">{doc.title}</strong>
                              <span className="doc-row-specs">{doc.meta}</span>
                            </div>

                            <div className="doc-row-actions">
                              <button
                                aria-label={`Download ${doc.title}`}
                                className="doc-action-icon-btn"
                                onClick={() => {
                                  if (!doc.fileUrl) {
                                    showToast(`No file URL available for "${doc.title}".`, 'error');
                                    return;
                                  }
                                  let downloadHref = doc.fileUrl;
                                  if (downloadHref.startsWith('/')) {
                                    downloadHref = `http://localhost:5000${downloadHref}`;
                                  }
                                  let extension = '';
                                  const cleanUrl = doc.fileUrl.split('?')[0];
                                  const dotIndex = cleanUrl.lastIndexOf('.');
                                  if (dotIndex !== -1) {
                                    extension = cleanUrl.substring(dotIndex).toLowerCase();
                                  }
                                  if (!extension || extension.length > 6) {
                                    extension = `.${(doc.type || 'pdf').toLowerCase()}`;
                                  }
                                  const cleanTitle = (doc.title || 'document').replace(/[\\/:*?"<>|]/g, '_');
                                  const finalFilename = cleanTitle.toLowerCase().endsWith(extension) ? cleanTitle : `${cleanTitle}${extension}`;
                                  showToast(`Downloading "${doc.title}"...`);
                                  fetch(downloadHref)
                                    .then((res) => {
                                      if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                      return res.blob();
                                    })
                                    .then((blob) => {
                                      const blobUrl = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = blobUrl;
                                      link.download = finalFilename;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
                                    })
                                    .catch(() => {
                                      window.open(downloadHref, '_blank');
                                    });
                                }}
                                type="button"
                              >
                                <Download aria-hidden="true" />
                              </button>
                              <button
                                aria-label={`Replace ${doc.title}`}
                                className="doc-action-icon-btn"
                                onClick={() => setUploadDocModalOpen(true)}
                                type="button"
                              >
                                <RefreshCw aria-hidden="true" />
                              </button>
                              <button
                                aria-label={`Delete ${doc.title}`}
                                className="doc-action-icon-btn"
                                onClick={() => handleDeleteDocument(doc.id)}
                                type="button"
                              >
                                <Trash2 aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
                          No documents uploaded yet. Click "Upload Document" to attach TDS or SDS.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>

        {/* Sticky Bottom Footer Bar */}
        <footer className="edit-sticky-footer">
          <span className="save-timestamp-text">{lastSavedText}</span>

          <div className="footer-button-group">
            <button
              className="btn-discard"
              onClick={handleDiscardChanges}
              type="button"
            >
              Discard Changes
            </button>
            <button
              className="btn-save-product"
              onClick={handleSaveProduct}
              type="button"
            >
              Save Product
            </button>
          </div>
        </footer>
      </div>

      {/* ====================================================================
          MODAL 1: ADD ROW (Technical Specs)
         ==================================================================== */}
      {addRowModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card modal-sm">
            <header className="modal-header">
              <h2 className="modal-title">Add Row</h2>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => setAddRowModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleAddRowSubmit} className="modal-form">
              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="row-diameter">Diameter (mm)</label>
                  <div className="select-shell">
                    <select
                      id="row-diameter"
                      className="edit-select-input"
                      onChange={(e) =>
                        setNewRowData({ ...newRowData, diameter: e.target.value })
                      }
                      value={newRowData.diameter}
                    >
                      <option value="2.0">2.0 mm</option>
                      <option value="2.5">2.5 mm</option>
                      <option value="3.2">3.2 mm</option>
                      <option value="4.0">4.0 mm</option>
                      <option value="5.0">5.0 mm</option>
                    </select>
                    <ChevronDown className="select-chevron" aria-hidden="true" />
                  </div>
                </div>

                <div className="modal-field">
                  <label className="modal-label" htmlFor="row-length">Length (mm)</label>
                  <div className="select-shell">
                    <select
                      id="row-length"
                      className="edit-select-input"
                      onChange={(e) =>
                        setNewRowData({ ...newRowData, length: e.target.value })
                      }
                      value={newRowData.length}
                    >
                      <option value="300">300 mm</option>
                      <option value="350">350 mm</option>
                      <option value="400">400 mm</option>
                      <option value="450">450 mm</option>
                    </select>
                    <ChevronDown className="select-chevron" aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="row-amperage">Amperage Range (A)</label>
                  <input
                    id="row-amperage"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setNewRowData({ ...newRowData, amperage: e.target.value })
                    }
                    placeholder="e.g., 2.5"
                    type="text"
                    value={newRowData.amperage}
                  />
                </div>

                <div className="modal-field">
                  <label className="modal-label" htmlFor="row-polarity">Polarity</label>
                  <input
                    id="row-polarity"
                    className="modal-input"
                    onChange={(e) =>
                      setNewRowData({ ...newRowData, polarity: e.target.value })
                    }
                    placeholder="e.g., 2.5"
                    type="text"
                    value={newRowData.polarity}
                  />
                </div>
              </div>

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setAddRowModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-modal-submit-red" type="submit">
                  + Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: ADD ELEMENT (Chemical Composition)
         ==================================================================== */}
      {addElementModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card modal-md">
            <header className="modal-header">
              <h2 className="modal-title">Add Element</h2>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => setAddElementModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleAddElementSubmit} className="modal-form">
              <div className="modal-callout-info">
                <Info className="callout-icon" aria-hidden="true" />
                <p className="callout-text">
                  Specify the target compositional values for this element. Values are strictly
                  numerical and represent percentage by weight.
                </p>
              </div>

              <div className="modal-field">
                <label className="modal-label" htmlFor="elem-select">Element</label>
                <div className="select-shell">
                  <select
                    id="elem-select"
                    className="edit-select-input"
                    onChange={(e) =>
                      setNewElementData({ ...newElementData, element: e.target.value })
                    }
                    value={newElementData.element}
                  >
                    <option value="Carbon (C)">Carbon (C)</option>
                    <option value="Manganese (Mn)">Manganese (Mn)</option>
                    <option value="Silicon (Si)">Silicon (Si)</option>
                    <option value="Phosphorus (P)">Phosphorus (P)</option>
                    <option value="Sulfur (S)">Sulfur (S)</option>
                    <option value="Nickel (Ni)">Nickel (Ni)</option>
                    <option value="Chromium (Cr)">Chromium (Cr)</option>
                    <option value="Molybdenum (Mo)">Molybdenum (Mo)</option>
                    <option value="Vanadium (V)">Vanadium (V)</option>
                    <option value="Titanium (Ti)">Titanium (Ti)</option>
                    <option value="Copper (Cu)">Copper (Cu)</option>
                    <option value="Aluminum (Al)">Aluminum (Al)</option>
                    <option value="Tungsten (W)">Tungsten (W)</option>
                    <option value="Other">Other / Custom Element...</option>
                  </select>
                  <ChevronDown className="select-chevron" aria-hidden="true" />
                </div>
              </div>

              {newElementData.element === 'Other' && (
                <div className="modal-field">
                  <label className="modal-label" htmlFor="elem-custom">Custom Element Name / Symbol</label>
                  <input
                    id="elem-custom"
                    className="modal-input"
                    onChange={(e) =>
                      setNewElementData({ ...newElementData, customElement: e.target.value })
                    }
                    placeholder="e.g. Cobalt (Co) or Niobium (Nb)"
                    type="text"
                    value={newElementData.customElement}
                  />
                </div>
              )}

              <div className="modal-row-3">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="elem-typ">
                    Typical <span className="unit-label">%</span>
                  </label>
                  <input
                    id="elem-typ"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setNewElementData({ ...newElementData, typical: e.target.value })
                    }
                    type="text"
                    value={newElementData.typical}
                  />
                </div>

                <div className="modal-field">
                  <label className="modal-label" htmlFor="elem-min">
                    Minimum <span className="unit-label">%</span>
                  </label>
                  <input
                    id="elem-min"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setNewElementData({ ...newElementData, min: e.target.value })
                    }
                    type="text"
                    value={newElementData.min}
                  />
                </div>

                <div className="modal-field">
                  <label className="modal-label" htmlFor="elem-max">
                    Maximum <span className="unit-label">%</span>
                  </label>
                  <input
                    id="elem-max"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setNewElementData({ ...newElementData, max: e.target.value })
                    }
                    type="text"
                    value={newElementData.max}
                  />
                </div>
              </div>

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setAddElementModalOpen(false)}
                  type="button"
                >
                  Discard
                </button>
                <button className="btn-modal-submit-red" type="submit">
                  + Add Element
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: ADD PROPERTY (Mechanical Properties)
         ==================================================================== */}
      {addPropertyModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card modal-md">
            <header className="modal-header">
              <h2 className="modal-title">Add Property</h2>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => setAddPropertyModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleAddPropertySubmit} className="modal-form">
              <div className="modal-field">
                <label className="modal-label" htmlFor="prop-name-select">Property Name</label>
                <div className="select-shell">
                  <select
                    id="prop-name-select"
                    className="edit-select-input"
                    onChange={(e) =>
                      setNewPropertyData({ ...newPropertyData, property: e.target.value })
                    }
                    value={newPropertyData.property}
                  >
                    <option value="Tensile Strength">Tensile Strength</option>
                    <option value="Yield Strength">Yield Strength</option>
                    <option value="Elongation">Elongation</option>
                    <option value="Impact Value (-45°C)">Impact Value (-45°C)</option>
                    <option value="Impact Energy (-20°C)">Impact Energy (-20°C)</option>
                    <option value="Impact Energy (-196°C)">Impact Energy (-196°C)</option>
                    <option value="Hardness (HB)">Hardness (HB)</option>
                    <option value="Hardness (HRC)">Hardness (HRC)</option>
                    <option value="Reduction of Area">Reduction of Area</option>
                    <option value="Other">Other / Custom Property...</option>
                  </select>
                  <ChevronDown className="select-chevron" aria-hidden="true" />
                </div>
              </div>

              {newPropertyData.property === 'Other' && (
                <div className="modal-field">
                  <label className="modal-label" htmlFor="prop-custom">Custom Property Name</label>
                  <input
                    id="prop-custom"
                    className="modal-input"
                    onChange={(e) =>
                      setNewPropertyData({ ...newPropertyData, customProperty: e.target.value })
                    }
                    placeholder="e.g. Fatigue Strength or Charpy V-Notch"
                    type="text"
                    value={newPropertyData.customProperty}
                  />
                </div>
              )}

              <div className="modal-row-2">
                <div className="modal-field">
                  <label className="modal-label" htmlFor="prop-val">Value / Range</label>
                  <input
                    id="prop-val"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setNewPropertyData({ ...newPropertyData, valRange: e.target.value })
                    }
                    placeholder="e.g. 400 - 550"
                    type="text"
                    value={newPropertyData.valRange}
                  />
                </div>

                <div className="modal-field">
                  <label className="modal-label" htmlFor="prop-unit">Unit</label>
                  <input
                    id="prop-unit"
                    className="modal-input modal-input--tabular"
                    onChange={(e) =>
                      setNewPropertyData({ ...newPropertyData, unit: e.target.value })
                    }
                    placeholder="e.g. MPa, J, %, HRC"
                    type="text"
                    value={newPropertyData.unit}
                  />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label" htmlFor="prop-req">Requirement / Condition</label>
                <input
                  id="prop-req"
                  className="modal-input"
                  onChange={(e) =>
                    setNewPropertyData({ ...newPropertyData, requirement: e.target.value })
                  }
                  placeholder="e.g. >= 490 MPa or -45°C"
                  type="text"
                  value={newPropertyData.requirement}
                />
                <span className="field-hint-text">Specify any environmental or test conditions.</span>
              </div>

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setAddPropertyModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-modal-submit-red" type="submit">
                  Add Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: UPLOAD TECHNICAL DOCUMENT (Documents Section)
         ==================================================================== */}
      {uploadDocModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card modal-lg">
            <header className="modal-header">
              <div>
                <h2 className="modal-title">Upload Technical Document</h2>
                <p className="modal-subtitle">
                  Add new files to the Forge-Craft document repository.
                </p>
              </div>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => setUploadDocModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleUploadDocSubmit} className="modal-form">
              <div className="modal-field">
                <label className="modal-label" htmlFor="upload-doc-type">
                  Document Type <span className="required-star">*</span>
                </label>
                <div className="select-shell">
                  <select
                    id="upload-doc-type"
                    className="edit-select-input"
                    onChange={(e) =>
                      setNewDocData({ ...newDocData, docType: e.target.value })
                    }
                    value={newDocData.docType}
                  >
                    <option value="Technical Data Sheet (TDS)">Technical Data Sheet (TDS)</option>
                    <option value="Safety Data Sheet (SDS)">Safety Data Sheet (SDS)</option>
                    <option value="ISO Certifications">ISO Certifications</option>
                    <option value="Mill Test Report">Mill Test Report</option>
                  </select>
                  <ChevronDown className="select-chevron" aria-hidden="true" />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label" htmlFor="upload-doc-title">
                  Document Title <span className="required-star">*</span>
                </label>
                <input
                  id="upload-doc-title"
                  className="modal-input"
                  onChange={(e) =>
                    setNewDocData({ ...newDocData, title: e.target.value })
                  }
                  placeholder="Enter clear, descriptive title..."
                  required
                  type="text"
                  value={newDocData.title}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">
                  File Upload <span className="required-star">*</span>
                </label>
                <input
                  ref={docFileInputRef}
                  accept=".pdf,.doc,.docx,.zip,.step,.iges,.txt,application/pdf"
                  onChange={handleDocFileChange}
                  style={{ display: 'none' }}
                  type="file"
                />
                <button
                  className="upload-drag-dropzone"
                  onClick={() => docFileInputRef.current?.click()}
                  type="button"
                >
                  <div className="cloud-circle-icon">
                    <UploadCloud aria-hidden="true" />
                  </div>
                  <strong className="dropzone-main-text">
                    {selectedDocFile ? selectedDocFile.name : 'Drag and drop file here'}
                  </strong>
                  <span className="dropzone-sub-text">
                    {selectedDocFile
                      ? `${(selectedDocFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                      : 'or click to browse from your computer'}
                  </span>
                  <span className="dropzone-formats">PDF, DOCX, ZIP, STEP • Max 50MB</span>
                </button>
              </div>

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  disabled={isUploadingDoc}
                  onClick={() => {
                    setUploadDocModalOpen(false);
                    setSelectedDocFile(null);
                  }}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn-modal-submit-red"
                  disabled={isUploadingDoc || !newDocData.title.trim()}
                  type="submit"
                >
                  {isUploadingDoc ? (
                    <>
                      <Loader2 className="spinner-inline" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="upload-cta-icon" aria-hidden="true" />
                      <span>Start Upload</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 5: ADD FEATURE (Features & Apps Section)
          Text (required), optional icon
         ==================================================================== */}
      {addFeatureModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card modal-md">
            <header className="modal-header">
              <div>
                <h2 className="modal-title">Add Feature</h2>
                <p className="modal-subtitle">
                  Highlight key performance characteristics and advantages
                </p>
              </div>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => setAddFeatureModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleAddFeatureSubmit} className="modal-form">
              {/* Feature Text (Required) */}
              <div className="modal-field">
                <label className="modal-label" htmlFor="feature-text-input">
                  Feature Text <span className="required-star">*</span>
                </label>
                <input
                  id="feature-text-input"
                  className="modal-input"
                  onChange={(e) =>
                    setNewFeatureData({ ...newFeatureData, text: e.target.value })
                  }
                  placeholder="e.g. Excellent arc stability with low spatter"
                  required
                  type="text"
                  value={newFeatureData.text}
                />
                <span className="field-hint-text">
                  Provide a concise, impact-oriented highlight for the product catalogue.
                </span>
              </div>

              {/* Optional Icon Dropdown */}
              <div className="modal-field">
                <label className="modal-label" htmlFor="feature-icon-select">
                  Feature Icon (Optional)
                </label>
                <div className="select-shell">
                  <select
                    id="feature-icon-select"
                    className="edit-select-input"
                    onChange={(e) =>
                      setNewFeatureData({ ...newFeatureData, icon: e.target.value })
                    }
                    value={newFeatureData.icon}
                  >
                    <option value="">No Icon</option>
                    {FEATURE_ICONS_LIST.map((ic) => (
                      <option key={ic.id} value={ic.id}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="select-chevron" aria-hidden="true" />
                </div>
              </div>

              {/* Visual Icon Grid Selection */}
              <div className="modal-field">
                <span className="modal-label">Quick Select Icon Badge</span>
                <div className="icon-selector-grid">
                  {FEATURE_ICONS_LIST.map((ic) => {
                    const IconComp = ic.icon;
                    const isSelected = newFeatureData.icon === ic.id;
                    return (
                      <button
                        key={ic.id}
                        type="button"
                        className={`icon-selector-btn${isSelected ? ' icon-selector-btn--selected' : ''}`}
                        onClick={() => setNewFeatureData({ ...newFeatureData, icon: ic.id })}
                        title={ic.label}
                      >
                        <IconComp className="icon-grid-glyph" aria-hidden="true" />
                        <span className="icon-grid-name">{ic.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setAddFeatureModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-modal-submit-red" type="submit">
                  <Plus className="btn-icon-svg" aria-hidden="true" />
                  <span>Add Feature</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 6: ADD APPLICATION (Features & Apps Section)
          Name (required), Industry dropdown, optional short description
         ==================================================================== */}
      {addApplicationModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card modal-md">
            <header className="modal-header">
              <div>
                <h2 className="modal-title">Add Application</h2>
                <p className="modal-subtitle">
                  Define industrial use cases and target operational environments
                </p>
              </div>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => setAddApplicationModalOpen(false)}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleAddApplicationSubmit} className="modal-form">
              {/* Application Name (Required) */}
              <div className="modal-field">
                <label className="modal-label" htmlFor="app-name-input">
                  Application Name <span className="required-star">*</span>
                </label>
                <input
                  id="app-name-input"
                  className="modal-input"
                  onChange={(e) =>
                    setNewApplicationData({ ...newApplicationData, name: e.target.value })
                  }
                  placeholder="e.g. Heavy industrial pressure vessel fabrication"
                  required
                  type="text"
                  value={newApplicationData.name}
                />
              </div>

              {/* Industry Dropdown */}
              <div className="modal-field">
                <label className="modal-label" htmlFor="app-industry-select">
                  Industry <span className="required-star">*</span>
                </label>
                <div className="select-shell">
                  <select
                    id="app-industry-select"
                    className="edit-select-input"
                    onChange={(e) =>
                      setNewApplicationData({
                        ...newApplicationData,
                        industry: e.target.value,
                      })
                    }
                    value={newApplicationData.industry}
                  >
                    {APPLICATION_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="select-chevron" aria-hidden="true" />
                </div>
              </div>

              {/* Optional Short Description */}
              <div className="modal-field">
                <label className="modal-label" htmlFor="app-description-input">
                  Short Description (Optional)
                </label>
                <textarea
                  id="app-description-input"
                  className="modal-input modal-textarea"
                  onChange={(e) =>
                    setNewApplicationData({
                      ...newApplicationData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe joint configurations, materials, or compliance standards..."
                  rows={3}
                  value={newApplicationData.description}
                />
                <span className="field-hint-text">
                  Provide brief engineering context or operating conditions.
                </span>
              </div>

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setAddApplicationModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="btn-modal-submit-red" type="submit">
                  <Plus className="btn-icon-svg" aria-hidden="true" />
                  <span>Add Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 7: ADD IMAGE (Images & Media Section)
         ==================================================================== */}
      {addImageModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card modal-md">
            <header className="modal-header">
              <div>
                <h2 className="modal-title">Add Product Image</h2>
                <p className="modal-subtitle">
                  Upload an image from your device or select an existing photo.
                </p>
              </div>
              <button
                aria-label="Close modal"
                className="modal-close-btn"
                onClick={() => {
                  setAddImageModalOpen(false);
                  setSelectedImageFile(null);
                  setNewMediaUrl('');
                  setNewMediaPreview('');
                }}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleAddImageSubmit} className="modal-form">
              <div className="modal-field">
                <label className="modal-label">Choose Image File from Computer</label>
                <input
                  ref={imageFileInputRef}
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleImageFileChange}
                  style={{ display: 'none' }}
                  type="file"
                />
                <button
                  className="upload-dropzone-button"
                  onClick={() => imageFileInputRef.current?.click()}
                  type="button"
                >
                  <Upload className="dropzone-icon" aria-hidden="true" />
                  <span className="dropzone-text">
                    {selectedImageFile ? selectedImageFile.name : 'Click to select photo (PNG, JPG, WebP)'}
                  </span>
                  <span className="dropzone-sub">
                    {selectedImageFile
                      ? `${(selectedImageFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload`
                      : 'Max size 25MB'}
                  </span>
                </button>
              </div>

              {newMediaPreview && (
                <div className="add-media-preview-box">
                  <span className="preview-label">Image Preview:</span>
                  <div className="preview-img-frame">
                    <img
                      alt="Preview"
                      className="preview-img"
                      src={newMediaPreview}
                      onError={(e) => {
                        e.currentTarget.src = '/cat-placeholder.png';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="modal-actions-footer">
                <button
                  className="btn-modal-cancel"
                  disabled={isUploadingImage}
                  onClick={() => {
                    setAddImageModalOpen(false);
                    setSelectedImageFile(null);
                    setNewMediaUrl('');
                    setNewMediaPreview('');
                  }}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn-modal-submit-red"
                  disabled={isUploadingImage || (!selectedImageFile && !newMediaUrl.trim())}
                  type="submit"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="spinner-inline" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Add to Media</span>
                  )}
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
