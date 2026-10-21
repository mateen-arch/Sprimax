import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin.jsx';
import DashboardPage from './DashboardPage.jsx';
import CataloguePage from './CataloguePage.jsx';
import ProductDescriptionPage from './ProductDescriptionPage.jsx';
import EditProductPage from './EditProductPage.jsx';
import CategoriesPage from './CategoriesPage.jsx';
import SubcategoriesPage from './SubcategoriesPage.jsx';
import EnquiriesPage from './EnquiriesPage.jsx';
import EnquiryDetailsPage from './EnquiryDetailsPage.jsx';
import ContentManagementPage from './ContentManagementPage.jsx';
import DownloadsManagementPage from './DownloadsManagementPage.jsx';
import CertificationsManagementPage from './CertificationsManagementPage.jsx';
import IndustriesManagementPage from './IndustriesManagementPage.jsx';
import BannerManagementPage from './BannerManagementPage.jsx';
import GlobalSettingsPage from './GlobalSettingsPage.jsx';
import AdminProfilePage from './AdminProfilePage.jsx';
import AdminHelpPage from './AdminHelpPage.jsx';
import BlogManagementPage from './BlogManagementPage.jsx';
import BlogEditorPage from './BlogEditorPage.jsx';
import BlogPreviewPage from './BlogPreviewPage.jsx';
import CareersJobsPage from './CareersJobsPage.jsx';
import CareersJobEditorPage from './CareersJobEditorPage.jsx';
import CareersJobPreviewPage from './CareersJobPreviewPage.jsx';
import CareersApplicationsPage from './CareersApplicationsPage.jsx';
import CareersSettingsModal from './CareersSettingsModal.jsx';
import SolutionsManagementPage from './SolutionsManagementPage.jsx';
import SolutionEditorPage from './SolutionEditorPage.jsx';
import SolutionPreviewPage from './SolutionPreviewPage.jsx';
import AdminSidebar from './AdminSidebar.jsx';
import AdminTopbar from './AdminTopbar.jsx';

export default function AdminApp() {
  const [signedIn, setSignedIn] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [activeEnquiryType, setActiveEnquiryType] = useState('Product Enquiries');
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [selectedCareersJobId, setSelectedCareersJobId] = useState(null);
  const [selectedSolutionId, setSelectedSolutionId] = useState(null);
  const [careersSettingsOpen, setCareersSettingsOpen] = useState(false);
  const [careersAppJobFilter, setCareersAppJobFilter] = useState({ id: null, title: null });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Default to Dashboard or resolve from current URL pathname
  const [currentPage, setCurrentPage] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('profile')) return 'Admin Profile';
    if (path.includes('help')) return 'Help/Support';
    if (path.includes('blogs/new')) return 'AddBlog';
    if (path.includes('preview') && path.includes('blogs')) return 'PreviewBlog';
    if (path.includes('edit') && path.includes('blogs')) return 'EditBlog';
    if (path.includes('blogs')) return 'Blogs';
    if (path.includes('careers/jobs/new')) return 'AddCareersJob';
    if (path.includes('careers/jobs') && path.includes('preview')) return 'PreviewCareersJob';
    if (path.includes('careers/jobs') && path.includes('edit')) return 'EditCareersJob';
    if (path.includes('careers/jobs')) return 'CareersJobs';
    if (path.includes('careers/applications')) return 'CareersApplications';
    if (path.includes('industries/new') || path.includes('solutions/new')) return 'AddSolution';
    if ((path.includes('industries') || path.includes('solutions')) && path.includes('preview')) return 'PreviewSolution';
    if ((path.includes('industries') || path.includes('solutions')) && path.includes('edit')) return 'EditSolution';
    if (path.includes('industries')) return 'Industries Management';
    if (path.includes('solutions')) return 'Industries Management';
    return 'Dashboard';
  });

  // Synchronize browser URL bar dynamically
  useEffect(() => {
    let route = '/admin';
    if (currentPage === 'Admin Profile') route = '/admin/profile';
    else if (currentPage === 'Help/Support') route = '/admin/help';
    else if (currentPage === 'Catalogue') route = '/admin/catalogue';
    else if (currentPage === 'Dashboard') route = '/admin';
    else if (currentPage === 'Blogs') route = '/admin/blogs';
    else if (currentPage === 'AddBlog') route = '/admin/blogs/new';
    else if (currentPage === 'EditBlog' && selectedBlogId) route = `/admin/blogs/${selectedBlogId}/edit`;
    else if (currentPage === 'PreviewBlog' && selectedBlogId) route = `/admin/blogs/${selectedBlogId}/preview`;
    else if (currentPage === 'CareersJobs') route = '/admin/careers/jobs';
    else if (currentPage === 'AddCareersJob') route = '/admin/careers/jobs/new';
    else if (currentPage === 'EditCareersJob' && selectedCareersJobId) route = `/admin/careers/jobs/${selectedCareersJobId}/edit`;
    else if (currentPage === 'PreviewCareersJob' && selectedCareersJobId) route = `/admin/careers/jobs/${selectedCareersJobId}/preview`;
    else if (currentPage === 'CareersApplications') route = '/admin/careers/applications';
    else if (currentPage === 'Industries Management') route = '/admin/industries';
    else if (currentPage === 'AddSolution') route = '/admin/industries/new';
    else if (currentPage === 'EditSolution' && selectedSolutionId) route = `/admin/industries/${selectedSolutionId}/edit`;
    else if (currentPage === 'PreviewSolution' && selectedSolutionId) route = `/admin/industries/${selectedSolutionId}/preview`;
    
    if (window.location.pathname !== route) {
      window.history.pushState({ page: currentPage, blogId: selectedBlogId, jobId: selectedCareersJobId, solutionId: selectedSolutionId }, '', route);
    }
  }, [currentPage, selectedBlogId, selectedCareersJobId, selectedSolutionId]);

  if (!signedIn) {
    return (
      <AdminLogin
        onLogin={() => {
          setSignedIn(true);
          setCurrentPage('Dashboard');
        }}
      />
    );
  }

  if (currentPage === 'Dashboard') {
    return (
      <DashboardPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  const isEnquiriesPage = [
    'Enquiries',
    'Product Enquiries',
    'Dealer Enquiries',
    'Technical Support',
    'Project Requirements',
  ].includes(currentPage);

  if (isEnquiriesPage) {
    const currentType = currentPage === 'Enquiries' ? activeEnquiryType : currentPage;
    return (
      <EnquiriesPage
        activeType={currentType}
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => {
          if (
            ['Product Enquiries', 'Dealer Enquiries', 'Technical Support', 'Project Requirements'].includes(page)
          ) {
            setActiveEnquiryType(page);
          }
          setCurrentPage(page);
        }}
        onViewEnquiryDetails={(enq) => {
          setSelectedEnquiry(enq);
          setActiveEnquiryType(currentType);
          setCurrentPage('EnquiryDetails');
        }}
      />
    );
  }

  if (currentPage === 'EnquiryDetails') {
    return (
      <EnquiryDetailsPage
        enquiry={selectedEnquiry}
        activeType={activeEnquiryType}
        onBack={() => setCurrentPage(activeEnquiryType)}
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
        onViewProductSpecs={() => setCurrentPage('ProductDetails')}
      />
    );
  }

  if (currentPage === 'Categories') {
    return (
      <CategoriesPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Subcategories') {
    return (
      <SubcategoriesPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Content Management' || currentPage === 'Management') {
    return (
      <ContentManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Download Management' || currentPage === 'Downloads Management') {
    return (
      <DownloadsManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (
    currentPage === 'Certifications Management' ||
    currentPage === 'Certificates Management'
  ) {
    return (
      <CertificationsManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Industries Management') {
    return (
      <IndustriesManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
        onEditIndustrySolution={(id) => {
          setSelectedSolutionId(id);
          setCurrentPage(id ? 'EditSolution' : 'AddSolution');
        }}
        onPreviewIndustrySolution={(id) => {
          setSelectedSolutionId(id);
          setCurrentPage('PreviewSolution');
        }}
      />
    );
  }

  if (currentPage === 'Banner Management' || currentPage === 'Banners') {
    return (
      <BannerManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Global Settings' || currentPage === 'Settings') {
    return (
      <GlobalSettingsPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Admin Profile' || currentPage === 'Profile') {
    return (
      <AdminProfilePage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Help/Support' || currentPage === 'Help' || currentPage === 'Support') {
    return (
      <AdminHelpPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'ProductDetails') {
    return (
      <ProductDescriptionPage
        product={selectedProduct}
        onBack={() => setCurrentPage('Catalogue')}
        onEditProduct={(prod) => {
          if (prod) setSelectedProduct(prod);
          setCurrentPage('EditProduct');
        }}
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'EditProduct') {
    return (
      <EditProductPage
        product={selectedProduct}
        onBack={() => setCurrentPage('Catalogue')}
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
      />
    );
  }

  if (currentPage === 'Blogs') {
    return (
      <BlogManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
        onEditBlog={(id) => {
          setSelectedBlogId(id);
          setCurrentPage('EditBlog');
        }}
        onPreviewBlog={(id) => {
          setSelectedBlogId(id);
          setCurrentPage('PreviewBlog');
        }}
      />
    );
  }

  if (currentPage === 'AddBlog') {
    return (
      <div className="admin-shell">
        <AdminSidebar
          currentNav="Blogs"
          onLogout={() => setSignedIn(false)}
          onNavigate={(page) => setCurrentPage(page)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <div className="admin-main">
          <BlogEditorPage
            blogId={null}
            onBack={() => setCurrentPage('Blogs')}
            onNavigate={(page) => setCurrentPage(page)}
            onPreview={(id) => {
              setSelectedBlogId(id);
              setCurrentPage('PreviewBlog');
            }}
          />
        </div>
      </div>
    );
  }

  if (currentPage === 'EditBlog') {
    return (
      <div className="admin-shell">
        <AdminSidebar
          currentNav="Blogs"
          onLogout={() => setSignedIn(false)}
          onNavigate={(page) => setCurrentPage(page)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <div className="admin-main">
          <BlogEditorPage
            blogId={selectedBlogId}
            onBack={() => setCurrentPage('Blogs')}
            onNavigate={(page) => setCurrentPage(page)}
            onPreview={(id) => {
              setSelectedBlogId(id);
              setCurrentPage('PreviewBlog');
            }}
          />
        </div>
      </div>
    );
  }

  if (currentPage === 'PreviewBlog') {
    return (
      <BlogPreviewPage
        blogId={selectedBlogId}
        onBackToEditor={() => setCurrentPage(selectedBlogId ? 'EditBlog' : 'Blogs')}
      />
    );
  }

  /* ========================================================================
     SOLUTIONS MANAGEMENT MODULE
     ======================================================================== */

  if (currentPage === 'Solutions') {
    return (
      <IndustriesManagementPage
        onLogout={() => setSignedIn(false)}
        onNavigate={(page) => setCurrentPage(page)}
        onEditIndustrySolution={(id) => {
          setSelectedSolutionId(id);
          setCurrentPage(id ? 'EditSolution' : 'AddSolution');
        }}
        onPreviewIndustrySolution={(id) => {
          setSelectedSolutionId(id);
          setCurrentPage('PreviewSolution');
        }}
      />
    );
  }

  if (currentPage === 'AddSolution') {
    return (
      <div className="admin-shell">
        <AdminSidebar
          currentNav="Industries Management"
          onLogout={() => setSignedIn(false)}
          onNavigate={(page) => setCurrentPage(page)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <div className="admin-main">
          <SolutionEditorPage
            solutionId={null}
            onBack={() => setCurrentPage('Industries Management')}
            onNavigate={(page) => setCurrentPage(page)}
            onPreview={(id) => {
              setSelectedSolutionId(id);
              setCurrentPage('PreviewSolution');
            }}
          />
        </div>
      </div>
    );
  }

  if (currentPage === 'EditSolution') {
    return (
      <div className="admin-shell">
        <AdminSidebar
          currentNav="Industries Management"
          onLogout={() => setSignedIn(false)}
          onNavigate={(page) => setCurrentPage(page)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <div className="admin-main">
          <SolutionEditorPage
            solutionId={selectedSolutionId}
            onBack={() => setCurrentPage('Industries Management')}
            onNavigate={(page) => setCurrentPage(page)}
            onPreview={(id) => {
              setSelectedSolutionId(id);
              setCurrentPage('PreviewSolution');
            }}
          />
        </div>
      </div>
    );
  }

  if (currentPage === 'PreviewSolution') {
    return (
      <SolutionPreviewPage
        solutionId={selectedSolutionId}
        onBackToEditor={() => setCurrentPage(selectedSolutionId ? 'EditSolution' : 'Industries Management')}
      />
    );
  }

  /* ========================================================================
     CAREERS MANAGEMENT MODULE
     ======================================================================== */

  if (currentPage === 'CareersJobs') {
    return (
      <div className="admin-shell">
        <AdminSidebar
          currentNav="CareersJobs"
          onLogout={() => setSignedIn(false)}
          onNavigate={(page) => setCurrentPage(page)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <div className="admin-main">
          <AdminTopbar
            title="Careers Management"
            subtitle="Enterprise Engineering Requisitions & Openings"
            onLogout={() => setSignedIn(false)}
            onMenuClick={() => setMobileOpen(true)}
          />
          <div className="admin-content">
            <CareersJobsPage
              onNavigate={(page) => setCurrentPage(page)}
              onAddJob={() => {
                setSelectedCareersJobId(null);
                setCurrentPage('AddCareersJob');
              }}
              onEditJob={(id) => {
                setSelectedCareersJobId(id);
                setCurrentPage('EditCareersJob');
              }}
              onPreviewJob={(id) => {
                setSelectedCareersJobId(id);
                setCurrentPage('PreviewCareersJob');
              }}
              onOpenSettings={() => setCareersSettingsOpen(true)}
              onViewApplications={(jobId, jobTitle) => {
                setCareersAppJobFilter({ id: jobId, title: jobTitle });
                setCurrentPage('CareersApplications');
              }}
            />
          </div>
        </div>
        <CareersSettingsModal
          isOpen={careersSettingsOpen}
          onClose={() => setCareersSettingsOpen(false)}
        />
      </div>
    );
  }

  if (currentPage === 'AddCareersJob') {
    return (
      <div className="admin-shell">
        <AdminSidebar
          currentNav="CareersJobs"
          onLogout={() => setSignedIn(false)}
          onNavigate={(page) => setCurrentPage(page)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <div className="admin-main">
          <CareersJobEditorPage
            jobId={null}
            onBack={() => setCurrentPage('CareersJobs')}
            onNavigate={(page) => setCurrentPage(page)}
            onPreview={(id) => {
              setSelectedCareersJobId(id);
              setCurrentPage('PreviewCareersJob');
            }}
          />
        </div>
        <CareersSettingsModal
          isOpen={careersSettingsOpen}
          onClose={() => setCareersSettingsOpen(false)}
        />
      </div>
    );
  }

  if (currentPage === 'EditCareersJob') {
    return (
      <div className="admin-shell">
        <AdminSidebar
          currentNav="CareersJobs"
          onLogout={() => setSignedIn(false)}
          onNavigate={(page) => setCurrentPage(page)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <div className="admin-main">
          <CareersJobEditorPage
            jobId={selectedCareersJobId}
            onBack={() => setCurrentPage('CareersJobs')}
            onNavigate={(page) => setCurrentPage(page)}
            onPreview={(id) => {
              setSelectedCareersJobId(id);
              setCurrentPage('PreviewCareersJob');
            }}
          />
        </div>
        <CareersSettingsModal
          isOpen={careersSettingsOpen}
          onClose={() => setCareersSettingsOpen(false)}
        />
      </div>
    );
  }

  if (currentPage === 'PreviewCareersJob') {
    return (
      <CareersJobPreviewPage
        jobId={selectedCareersJobId}
        onBackToEditor={() => setCurrentPage(selectedCareersJobId ? 'EditCareersJob' : 'CareersJobs')}
      />
    );
  }

  if (currentPage === 'CareersApplications') {
    return (
      <div className="admin-shell">
        <AdminSidebar
          currentNav="CareersApplications"
          onLogout={() => setSignedIn(false)}
          onNavigate={(page) => setCurrentPage(page)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
        <div className="admin-main">
          <AdminTopbar
            title="Candidate Applications"
            subtitle="Technical Dockets & Candidate Evaluation Pipeline"
            onLogout={() => setSignedIn(false)}
            onMenuClick={() => setMobileOpen(true)}
          />
          <div className="admin-content">
            <CareersApplicationsPage
              initialJobId={careersAppJobFilter.id}
              initialJobTitle={careersAppJobFilter.title}
              onNavigate={(page) => setCurrentPage(page)}
              onOpenSettings={() => setCareersSettingsOpen(true)}
            />
          </div>
        </div>
        <CareersSettingsModal
          isOpen={careersSettingsOpen}
          onClose={() => setCareersSettingsOpen(false)}
        />
      </div>
    );
  }

  return (
    <CataloguePage
      onEditProduct={(prod) => {
        setSelectedProduct(prod);
        setCurrentPage('EditProduct');
      }}
      onLogout={() => setSignedIn(false)}
      onNavigate={(page) => setCurrentPage(page)}
      onViewProductDetails={(prod) => {
        setSelectedProduct(prod);
        setCurrentPage('ProductDetails');
      }}
    />
  );
}
